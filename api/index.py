"""TomoRead API - a single stateless FastAPI app deployed as a Vercel Python
serverless function.

Privacy by architecture: uploads are read into memory, converted, streamed
back, and garbage-collected when the request ends. No database, no disk
persistence, no logging of file contents.
"""

from __future__ import annotations

import json
import os
import sys
import traceback
import urllib.parse

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

# Import the engine both locally (repo root on sys.path -> `api._core`) and on
# Vercel, where the function may be bundled with `api/` itself as the root.
try:
    from api._core.errors import ConversionError
    from api._core.pipeline import ConvertParams, convert
    from api._core.profiles import PROFILES
except ModuleNotFoundError:  # pragma: no cover - Vercel bundle layout
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _core.errors import ConversionError  # type: ignore
    from _core.pipeline import ConvertParams, convert  # type: ignore
    from _core.profiles import PROFILES  # type: ignore

MAX_UPLOAD_BYTES = 300 * 1024 * 1024  # hard safety cap

# Large uploads transit through Vercel Blob (browser -> blob -> here); the
# blob is deleted the moment its bytes are in memory, before converting.
_BLOB_HOST_SUFFIX = ".blob.vercel-storage.com"


def _fetch_blob(url: str) -> bytes:
    import urllib.request

    parsed = urllib.parse.urlparse(url)
    if (
        parsed.scheme != "https"
        or not parsed.hostname
        or not parsed.hostname.endswith(_BLOB_HOST_SUFFIX)
    ):
        raise ConversionError("Invalid upload reference.")
    try:
        with urllib.request.urlopen(url, timeout=120) as r:
            data = r.read(MAX_UPLOAD_BYTES + 1)
    except ConversionError:
        raise
    except Exception:
        raise ConversionError("Could not read the uploaded file. Please retry.")
    return data


def _delete_blobs(urls: list[str]) -> None:
    """Best-effort immediate deletion; the store never keeps user files."""
    import urllib.request

    token = os.environ.get("BLOB_READ_WRITE_TOKEN")
    if not token or not urls:
        return
    try:
        req = urllib.request.Request(
            "https://blob.vercel-storage.com/delete",
            data=json.dumps({"urls": urls}).encode("utf-8"),
            headers={
                "authorization": f"Bearer {token}",
                "content-type": "application/json",
                "x-api-version": "7",
            },
            method="POST",
        )
        urllib.request.urlopen(req, timeout=30).read()
    except Exception:
        pass  # deletion is retried by nothing; blob URLs are unguessable

app = FastAPI(title="TomoRead API", docs_url=None, redoc_url=None)

# The API is public and stateless (no cookies, no credentials), so open CORS
# is safe. In development the browser talks to uvicorn directly (the Next dev
# proxy cannot forward large upload bodies); in production everything is
# same-origin behind Vercel.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-TomoRead-Meta"],
)


@app.get("/api/py/health")
def health():
    return {"ok": True, "service": "tomoread"}


@app.get("/api/py/profiles")
def profiles():
    return {
        "profiles": [
            {
                "id": p.id,
                "name": p.name,
                "width": p.width,
                "height": p.height,
                "grayscale": p.grayscale,
            }
            for p in PROFILES.values()
        ]
    }


def _bool(v: str | bool | None, default: bool = False) -> bool:
    if isinstance(v, bool):
        return v
    if v is None:
        return default
    return v.strip().lower() in ("1", "true", "yes", "on")


@app.post("/api/py/convert")
async def convert_endpoint(
    files: list[UploadFile] | None = File(None),
    blob_files: str | None = Form(None),
    mode: str = Form("normal"),
    output: str = Form("cbz"),
    profile: str = Form("kindle"),
    rtl: str = Form("false"),
    split_double: str = Form("true"),
    trim: str = Form("true"),
    panels: str = Form("true"),
    custom_width: int | None = Form(None),
    custom_height: int | None = Form(None),
    custom_grayscale: str = Form("false"),
    custom_quality: int | None = Form(None),
):
    try:
        payload: list[tuple[str, bytes]] = []
        total = 0
        if blob_files:
            try:
                refs = json.loads(blob_files)
                assert isinstance(refs, list) and refs
            except Exception:
                raise ConversionError("Malformed upload reference.")
            all_urls = [str(ref.get("url", "")) for ref in refs[:200]]
            try:
                for ref in refs[:200]:
                    data = _fetch_blob(str(ref.get("url", "")))
                    total += len(data)
                    if total > MAX_UPLOAD_BYTES:
                        raise ConversionError(
                            "Upload too large (limit 300 MB). Try splitting the file.",
                            status=413,
                        )
                    payload.append((str(ref.get("name", "file")), data))
            finally:
                # bytes are in memory (or the request failed): the transit
                # blobs are removed before conversion even starts
                _delete_blobs(all_urls)
        else:
            for f in files or []:
                data = await f.read()
                total += len(data)
                if total > MAX_UPLOAD_BYTES:
                    raise ConversionError(
                        "Upload too large (limit 300 MB). Try splitting the file.",
                        status=413,
                    )
                payload.append((f.filename or "file", data))

        params = ConvertParams(
            mode=mode,
            output=output,
            profile_id=profile,
            rtl=_bool(rtl),
            split_double=_bool(split_double, True),
            trim=_bool(trim, True),
            panels=_bool(panels, True),
            custom_width=custom_width,
            custom_height=custom_height,
            custom_grayscale=_bool(custom_grayscale),
            custom_quality=custom_quality,
        )
        result, meta = convert(payload, params)
    except ConversionError as e:
        return JSONResponse({"error": e.message}, status_code=e.status)
    except Exception:
        # log the traceback (never file contents) so failures are diagnosable
        traceback.print_exc()
        return JSONResponse(
            {"error": "Conversion failed unexpectedly. Please try another file."},
            status_code=500,
        )

    ascii_name = result.filename.encode("ascii", "replace").decode("ascii")
    quoted = urllib.parse.quote(result.filename)
    return Response(
        content=result.data,
        media_type=result.media_type,
        headers={
            "Content-Disposition": (
                f'attachment; filename="{ascii_name}"; filename*=UTF-8\'\'{quoted}'
            ),
            "X-TomoRead-Meta": json.dumps(meta),
            "Cache-Control": "no-store",
        },
    )
