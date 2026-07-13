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
    files: list[UploadFile] = File(...),
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
        for f in files:
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
