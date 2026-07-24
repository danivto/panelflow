"""Input readers: PDF, CBZ, CBR, ZIP and loose images -> lazy page list.

Pages are decoded on demand (one at a time) so a 200-page comic never has to
sit fully decoded in memory. Everything works on in-memory bytes.
"""

from __future__ import annotations

import io
import os
import re
import shutil
import subprocess
import tempfile
import zipfile
from collections.abc import Callable
from dataclasses import dataclass, field

from PIL import Image

from .errors import ConversionError

Image.MAX_IMAGE_PIXELS = 400_000_000  # long webtoon strips are legitimate

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff"}

_NAT_SPLIT = re.compile(r"(\d+)")


def natural_key(name: str) -> list:
    return [int(t) if t.isdigit() else t.lower() for t in _NAT_SPLIT.split(name)]


@dataclass
class SourcePage:
    """One page of the source document."""

    name: str
    ext: str | None = None  # extension of raw bytes, when they exist
    get_raw: Callable[[], bytes] | None = None
    render: Callable[[], Image.Image] | None = None

    def raw(self) -> bytes | None:
        return self.get_raw() if self.get_raw else None

    def load(self) -> Image.Image:
        if self.render is not None:
            return self.render()
        data = self.get_raw()
        try:
            img = Image.open(io.BytesIO(data))
            img.load()
        except Exception:
            raise ConversionError(f"Could not decode image '{self.name}'.")
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        return img


@dataclass
class ReadResult:
    title: str
    pages: list[SourcePage]
    # keeps zipfile / fitz document handles alive while pages are consumed
    _refs: list = field(default_factory=list)


def sniff_kind(name: str, data: bytes) -> str:
    """Detect real container type by magic bytes (extensions lie, e.g. zip
    files renamed to .cbr)."""
    head = data[:8]
    if head.startswith(b"%PDF"):
        return "pdf"
    if head.startswith(b"PK\x03\x04") or head.startswith(b"PK\x05\x06"):
        return "zip"
    if head.startswith(b"Rar!"):
        return "rar"
    if head.startswith(b"7z\xbc\xaf\x27\x1c"):
        return "7z"
    ext = _ext_of(name)
    if ext in IMAGE_EXTS:
        return "image"
    # last resort: trust the extension
    if ext == ".pdf":
        return "pdf"
    if ext in (".cbz", ".zip", ".epub"):
        return "zip"
    if ext == ".cbr":
        return "rar"
    if ext in (".cb7", ".7z"):
        return "7z"
    raise ConversionError(
        f"Unsupported file type: '{name}'. Supported inputs: PDF, CBZ, CBR, "
        "CB7, ZIP, 7Z, JPG, PNG, WEBP."
    )


def _ext_of(name: str) -> str:
    i = name.rfind(".")
    return name[i:].lower() if i >= 0 else ""


def _title_of(name: str) -> str:
    base = name.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
    i = base.rfind(".")
    return (base[:i] if i > 0 else base) or "tomoread"


# ---------------------------------------------------------------- containers


def _pages_from_ziplike(names_data: list[tuple[str, Callable[[], bytes]]]) -> list[SourcePage]:
    entries = []
    for name, getter in names_data:
        base = name.rsplit("/", 1)[-1]
        if base.startswith(".") or "__MACOSX" in name:
            continue
        ext = _ext_of(name)
        if ext in IMAGE_EXTS:
            entries.append((name, ext, getter))
    entries.sort(key=lambda e: natural_key(e[0]))
    return [SourcePage(name=n, ext=x, get_raw=g) for n, x, g in entries]


def read_zip(name: str, data: bytes) -> ReadResult:
    try:
        zf = zipfile.ZipFile(io.BytesIO(data))
    except zipfile.BadZipFile:
        raise ConversionError(f"'{name}' is not a valid ZIP/CBZ archive.")
    pairs = [
        (info.filename, (lambda i=info: zf.read(i)))
        for info in zf.infolist()
        if not info.is_dir()
    ]
    pages = _pages_from_ziplike(pairs)
    if not pages:
        raise ConversionError(f"No images found inside '{name}'.")
    return ReadResult(title=_title_of(name), pages=pages, _refs=[zf])


def read_7z(name: str, data: bytes) -> ReadResult:
    """Read a 7z / .cb7 comic archive. py7zr is pure Python, so this works on
    serverless with no external binary. 7z has no per-entry random access, so
    every image is extracted once, up front, into memory."""
    try:
        import py7zr
    except ImportError:
        raise ConversionError(
            "CB7 (7z) support is not available on this server. "
            "Please convert the file to CBZ or ZIP first."
        )
    try:
        with py7zr.SevenZipFile(io.BytesIO(data), mode="r") as zf:
            wanted = [n for n in zf.getnames() if _is_image_name(n)]
            if not wanted:
                raise ConversionError(f"No images found inside '{name}'.")
            extracted = zf.read(targets=wanted)  # {name: BytesIO}
    except ConversionError:
        raise
    except Exception:
        raise ConversionError(f"Could not open '{name}' as a 7z/CB7 archive.")
    entries = [
        (n, bio.getvalue()) for n, bio in extracted.items() if _is_image_name(n)
    ]
    entries.sort(key=lambda e: natural_key(e[0]))
    pages = [
        SourcePage(name=n, ext=_ext_of(n), get_raw=(lambda d=d: d))
        for n, d in entries
    ]
    if not pages:
        raise ConversionError(f"No images found inside '{name}'.")
    return ReadResult(title=_title_of(name), pages=pages)


def _find_unrar_tool() -> str | None:
    for candidate in ("unrar", "UnRAR"):
        path = shutil.which(candidate)
        if path:
            return path
    if os.name == "nt":
        for path in (
            r"C:\Program Files\WinRAR\UnRAR.exe",
            r"C:\Program Files (x86)\WinRAR\UnRAR.exe",
        ):
            if os.path.exists(path):
                return path
    return None


def _find_bsdtar() -> str | None:
    path = shutil.which("bsdtar")
    if path:
        return path
    if os.name == "nt":
        systar = os.path.join(
            os.environ.get("SystemRoot", r"C:\Windows"), "System32", "tar.exe"
        )
        if os.path.exists(systar):
            return systar
    # plain `tar` only if it is actually bsdtar (GNU tar cannot read RAR)
    path = shutil.which("tar")
    if path:
        try:
            out = subprocess.run(
                [path, "--version"], capture_output=True, text=True, timeout=10
            ).stdout
            if "bsdtar" in out:
                return path
        except Exception:
            pass
    return None


def _is_image_name(name: str) -> bool:
    base = name.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
    return (
        not base.startswith(".")
        and "__MACOSX" not in name
        and _ext_of(name) in IMAGE_EXTS
    )


def _extract_rar_entries(data: bytes) -> list[tuple[str, bytes]] | None:
    """Extract image entries from RAR bytes, trying every available backend.
    Uses a temp file only for the duration of the extraction (external RAR
    tools cannot read from a pipe); it is always deleted immediately after.
    Returns None when no backend is available at all."""
    fd, tmp_path = tempfile.mkstemp(suffix=".rar")
    tried_any = False
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(data)

        # 1) unrar-cffi: bundled UnRAR library, no external tool needed
        try:
            from unrar.cffi import rarfile as unrar_cffi  # type: ignore

            tried_any = True
            rf = unrar_cffi.RarFile(tmp_path)
            return [
                (info.filename, rf.read(info.filename))
                for info in rf.infolist()
                if _is_image_name(info.filename)
            ]
        except ImportError:
            pass
        except Exception:
            pass  # corrupt for this backend? let the next one try

        # 2) rarfile + unrar / WinRAR
        try:
            import rarfile

            tool = _find_unrar_tool()
            if tool:
                rarfile.UNRAR_TOOL = tool
                tried_any = True
                with rarfile.RarFile(tmp_path) as rf:
                    return [
                        (info.filename, rf.read(info))
                        for info in rf.infolist()
                        if not info.is_dir() and _is_image_name(info.filename)
                    ]
        except ImportError:
            pass
        except Exception:
            pass

        # 3) bsdtar (libarchive) — ships with Windows 10/11
        bsdtar = _find_bsdtar()
        if bsdtar:
            tried_any = True
            out_dir = tempfile.mkdtemp(prefix="tomoread-rar-")
            try:
                proc = subprocess.run(
                    [bsdtar, "-xf", tmp_path, "-C", out_dir],
                    capture_output=True,
                    timeout=300,
                )
                if proc.returncode == 0:
                    entries: list[tuple[str, bytes]] = []
                    for root, _dirs, names in os.walk(out_dir):
                        for fname in names:
                            rel = os.path.relpath(os.path.join(root, fname), out_dir)
                            rel = rel.replace("\\", "/")
                            if _is_image_name(rel):
                                with open(os.path.join(root, fname), "rb") as fh:
                                    entries.append((rel, fh.read()))
                    return entries
            finally:
                shutil.rmtree(out_dir, ignore_errors=True)

        return [] if tried_any else None
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass


def read_rar(name: str, data: bytes) -> ReadResult:
    entries = _extract_rar_entries(data)
    if entries is None:
        raise ConversionError(
            "This .cbr uses real RAR compression, which this converter can't "
            "open. Good news: most .cbr files are actually ZIP archives — just "
            "rename yours to .cbz and upload it again. If that doesn't work, "
            "open it with your comic reader and re-save it as CBZ or PDF first."
        )
    if not entries:
        raise ConversionError(
            f"Couldn't read any images from '{name}'. The archive may be "
            "corrupt, password-protected, or contain no image pages. Try "
            "re-saving it as CBZ or PDF and uploading again."
        )
    entries.sort(key=lambda e: natural_key(e[0]))
    pages = [
        SourcePage(name=n, ext=_ext_of(n), get_raw=(lambda d=d: d))
        for n, d in entries
    ]
    return ReadResult(title=_title_of(name), pages=pages)


# ----------------------------------------------------------------------- pdf


def read_pdf(name: str, data: bytes, render_width: int = 1600) -> ReadResult:
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise ConversionError("PDF support is not available on this server.")
    try:
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception:
        raise ConversionError(f"Could not open '{name}' as a PDF.")
    if doc.needs_pass:
        raise ConversionError("This PDF is password-protected.")

    pages: list[SourcePage] = []
    for idx in range(doc.page_count):
        pages.append(
            SourcePage(
                name=f"page {idx + 1}",
                render=(lambda i=idx: _render_pdf_page(doc, i, render_width)),
                get_raw=None,
            )
        )
        # comic PDFs are usually one full-bleed image per page; extracting the
        # original image keeps maximum quality and is much faster than rendering
        page = doc[idx]
        try:
            imgs = page.get_images(full=True)
            if len(imgs) == 1 and not page.get_text().strip():
                xref = imgs[0][0]
                extracted = doc.extract_image(xref)
                if extracted and not extracted.get("smask"):
                    ext = "." + extracted["ext"].lower()
                    if ext in IMAGE_EXTS:
                        raw = extracted["image"]
                        pages[-1] = SourcePage(
                            name=f"page {idx + 1}", ext=ext, get_raw=(lambda r=raw: r)
                        )
        except Exception:
            pass  # keep the render fallback
    if not pages:
        raise ConversionError(f"'{name}' has no pages.")
    return ReadResult(title=_title_of(name), pages=pages, _refs=[doc])


def _render_pdf_page(doc, index: int, render_width: int) -> Image.Image:
    import fitz

    page = doc[index]
    zoom = max(1.0, min(4.0, render_width / max(1.0, page.rect.width)))
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


# --------------------------------------------------------------------- entry


def read_input(files: list[tuple[str, bytes]], render_width: int = 1600) -> ReadResult:
    """files: list of (filename, bytes). Multiple files are only allowed when
    all of them are images (they become the pages, naturally sorted)."""
    if not files:
        raise ConversionError("No file received.")

    if len(files) > 1:
        kinds = {sniff_kind(n, d) for n, d in files}
        if kinds != {"image"}:
            raise ConversionError(
                "Multiple files are only supported when all of them are images."
            )
        ordered = sorted(files, key=lambda f: natural_key(f[0]))
        pages = [
            SourcePage(name=n, ext=_ext_of(n), get_raw=(lambda d=d: d))
            for n, d in ordered
        ]
        return ReadResult(title=_title_of(ordered[0][0]), pages=pages)

    name, data = files[0]
    kind = sniff_kind(name, data)
    if kind == "pdf":
        return read_pdf(name, data, render_width)
    if kind == "zip":
        return read_zip(name, data)
    if kind == "rar":
        return read_rar(name, data)
    if kind == "7z":
        return read_7z(name, data)
    # single image
    return ReadResult(
        title=_title_of(name),
        pages=[SourcePage(name=name, ext=_ext_of(name), get_raw=(lambda: data))],
    )
