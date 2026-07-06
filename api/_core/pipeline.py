"""Conversion pipeline: read -> (normal | smart) -> encode -> package.

Normal mode preserves the source pages untouched; when input and output both
carry encoded images (e.g. CBZ -> CBZ, CBR -> CBZ, images -> CBZ) the original
bytes are repacked without re-encoding, so there is zero quality loss.

Smart mode runs every page through the computer-vision engine in smart.py.
Pages are processed one at a time to keep peak memory low.
"""

from __future__ import annotations

import io
import re
from dataclasses import dataclass, field

from PIL import Image

from .errors import ConversionError
from .profiles import DeviceProfile, resolve_profile
from .readers import read_input
from .smart import SmartOptions, process_page
from .writers import (
    EXT_TO_MIME,
    OutPage,
    OutputFile,
    write_cbz,
    write_epub,
    write_image_output,
    write_images_zip,
    write_pdf,
    write_pfc,
)

OUTPUT_FORMATS = {"pdf", "cbz", "epub", "images", "pfc", "jpg", "png", "webp"}

# raw formats each container can embed without re-encoding
_CONTAINER_ACCEPTS = {
    "cbz": {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"},
    "images": {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"},
    "pfc": {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"},
    "pdf": {".jpg", ".jpeg", ".png"},
    "epub": {".jpg", ".jpeg", ".png", ".gif"},
}

_MAX_OUTPUT_PAGES = 4000


@dataclass
class ConvertParams:
    mode: str = "normal"  # "normal" | "smart"
    output: str = "cbz"
    profile_id: str = "kindle"
    custom_width: int | None = None
    custom_height: int | None = None
    custom_grayscale: bool = False
    custom_quality: int | None = None
    rtl: bool = False
    split_double: bool = True
    trim: bool = True
    panels: bool = True
    smart: SmartOptions = field(init=False)
    profile: DeviceProfile = field(init=False)

    def __post_init__(self):
        if self.mode not in ("normal", "smart"):
            raise ConversionError(f"Unknown mode '{self.mode}'.")
        if self.output not in OUTPUT_FORMATS:
            raise ConversionError(f"Unknown output format '{self.output}'.")
        self.profile = resolve_profile(
            self.profile_id,
            self.custom_width,
            self.custom_height,
            self.custom_grayscale,
            self.custom_quality,
        )
        self.smart = SmartOptions(
            rtl=self.rtl,
            split_double=self.split_double,
            trim=self.trim,
            panels=self.panels,
        )


def _safe_title(title: str) -> str:
    title = re.sub(r"[^\w\s\-\.\(\)\[\]]", "", title).strip()
    title = re.sub(r"\s+", " ", title)
    return (title or "panelflow")[:120]


def encode_image(img: Image.Image, ext: str, quality: int) -> bytes:
    buf = io.BytesIO()
    if ext in (".jpg", ".jpeg"):
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        img.save(buf, "JPEG", quality=quality, optimize=True)
    elif ext == ".png":
        if img.mode not in ("RGB", "L", "P", "RGBA"):
            img = img.convert("RGB")
        img.save(buf, "PNG", optimize=True)
    elif ext == ".webp":
        if img.mode not in ("RGB", "L", "RGBA"):
            img = img.convert("RGB")
        img.save(buf, "WEBP", quality=quality, method=4)
    else:
        raise ConversionError(f"Unsupported encode format '{ext}'.")
    return buf.getvalue()


def _raw_size(data: bytes) -> tuple[int, int]:
    with Image.open(io.BytesIO(data)) as im:
        return im.width, im.height


def _page_ext_for_output(output: str) -> str:
    return {"jpg": ".jpg", "png": ".png", "webp": ".webp"}.get(output, ".jpg")


def convert(files: list[tuple[str, bytes]], params: ConvertParams) -> tuple[OutputFile, dict]:
    render_width = (
        params.profile.width * 2 if params.mode == "smart" else 1600
    )
    source = read_input(files, render_width=render_width)
    title = _safe_title(source.title)

    page_ext = _page_ext_for_output(params.output)
    accepts_raw = _CONTAINER_ACCEPTS.get(params.output, set())
    out_pages: list[OutPage] = []
    counter = 0

    def add(img_or_raw, raw_ext: str | None = None):
        nonlocal counter
        counter += 1
        if counter > _MAX_OUTPUT_PAGES:
            raise ConversionError("Output would exceed the page limit (4000).")
        if isinstance(img_or_raw, bytes):
            w, h = _raw_size(img_or_raw)
            ext = ".jpg" if raw_ext in (".jpeg", ".jpg") else (raw_ext or ".jpg")
            out_pages.append(
                OutPage(
                    filename=f"{counter:04d}{ext}",
                    data=img_or_raw,
                    width=w,
                    height=h,
                    media_type=EXT_TO_MIME.get(ext, "image/jpeg"),
                )
            )
        else:
            img: Image.Image = img_or_raw
            quality = (
                params.profile.quality if params.mode == "smart" else 90
            )
            data = encode_image(img, page_ext, quality)
            out_pages.append(
                OutPage(
                    filename=f"{counter:04d}{page_ext}",
                    data=data,
                    width=img.width,
                    height=img.height,
                    media_type=EXT_TO_MIME.get(page_ext, "image/jpeg"),
                )
            )

    for page in source.pages:
        if params.mode == "normal":
            raw = page.raw() if page.ext else None
            if (
                raw is not None
                and page.ext in accepts_raw
                and params.output not in ("jpg", "png", "webp")
            ):
                add(raw, page.ext)  # lossless repack
            elif (
                raw is not None
                and params.output in ("jpg", "png", "webp")
                and page.ext == page_ext
            ):
                add(raw, page.ext)  # already the requested image format
            else:
                add(page.load())
        else:
            img = page.load()
            for rendered in process_page(img, params.profile, params.smart):
                add(rendered)
            img.close()

    if not out_pages:
        raise ConversionError("The source produced no pages.")

    if params.output == "cbz":
        out = write_cbz(out_pages, title)
    elif params.output == "pdf":
        out = write_pdf(out_pages, title)
    elif params.output == "epub":
        out = write_epub(out_pages, title, rtl=params.rtl)
    elif params.output == "images":
        out = write_images_zip(out_pages, title)
    elif params.output == "pfc":
        out = write_pfc(out_pages, title, params.rtl, params.profile.id, params.mode)
    else:  # jpg / png / webp
        out = write_image_output(out_pages, title, page_ext)

    meta = {
        "title": title,
        "pagesIn": len(source.pages),
        "pagesOut": len(out_pages),
        "mode": params.mode,
        "output": params.output,
        "profile": params.profile.id if params.mode == "smart" else None,
        "bytes": len(out.data),
    }
    return out, meta
