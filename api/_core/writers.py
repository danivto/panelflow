"""Output writers: CBZ, PDF, fixed-layout EPUB, numbered-images ZIP and the
PanelFlow container (.pfc). All writers build the file fully in memory."""

from __future__ import annotations

import io
import json
import zipfile
from dataclasses import dataclass

from .errors import ConversionError


@dataclass
class OutPage:
    filename: str  # e.g. "0001.jpg"
    data: bytes
    width: int
    height: int
    media_type: str  # "image/jpeg" | "image/png" | "image/webp"


EXT_TO_MIME = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
}


@dataclass
class OutputFile:
    filename: str
    data: bytes
    media_type: str


def _zip_bytes(entries: list[tuple[str, bytes]], compress: bool = False) -> bytes:
    buf = io.BytesIO()
    method = zipfile.ZIP_DEFLATED if compress else zipfile.ZIP_STORED
    with zipfile.ZipFile(buf, "w", method) as zf:
        for name, data in entries:
            zf.writestr(name, data)
    return buf.getvalue()


# ----------------------------------------------------------------------- cbz


def write_cbz(pages: list[OutPage], title: str) -> OutputFile:
    entries = [(p.filename, p.data) for p in pages]
    return OutputFile(f"{title}.cbz", _zip_bytes(entries), "application/vnd.comicbook+zip")


# --------------------------------------------------------------- images zip


def write_images_zip(pages: list[OutPage], title: str) -> OutputFile:
    entries = [(f"{title}/{p.filename}", p.data) for p in pages]
    return OutputFile(f"{title}-images.zip", _zip_bytes(entries), "application/zip")


# ----------------------------------------------------------------------- pdf


def write_pdf(pages: list[OutPage], title: str) -> OutputFile:
    try:
        import fitz
    except ImportError:
        raise ConversionError("PDF output is not available on this server.")
    doc = fitz.open()
    for p in pages:
        page = doc.new_page(width=p.width, height=p.height)
        page.insert_image(page.rect, stream=p.data)
    data = doc.tobytes(deflate=True, garbage=3)
    doc.close()
    return OutputFile(f"{title}.pdf", data, "application/pdf")


# ---------------------------------------------------------------------- epub


def _xml_escape(s: str) -> str:
    return (
        s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
    )


def write_epub(pages: list[OutPage], title: str, rtl: bool = False) -> OutputFile:
    """Fixed-layout (pre-paginated) EPUB 3 with one image per page. This is the
    layout Kindle/Kobo/Boox readers expect for comics."""
    esc_title = _xml_escape(title)
    entries: list[tuple[str, bytes]] = []

    manifest_items: list[str] = []
    spine_items: list[str] = []

    for i, p in enumerate(pages, start=1):
        img_name = f"images/{p.filename}"
        page_id = f"pg{i:04d}"
        xhtml_name = f"text/{page_id}.xhtml"
        entries.append((f"OEBPS/{img_name}", p.data))
        xhtml = f"""<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
<title>{i}</title>
<meta name="viewport" content="width={p.width}, height={p.height}"/>
<style>html,body{{margin:0;padding:0}}img{{width:100%;height:100%;object-fit:contain}}</style>
</head>
<body><img src="../{img_name}" alt="Page {i}"/></body>
</html>"""
        entries.append((f"OEBPS/{xhtml_name}", xhtml.encode("utf-8")))
        cover_prop = ' properties="cover-image"' if i == 1 else ""
        manifest_items.append(
            f'<item id="img{i:04d}" href="{img_name}" media-type="{p.media_type}"{cover_prop}/>'
        )
        manifest_items.append(
            f'<item id="{page_id}" href="{xhtml_name}" media-type="application/xhtml+xml"/>'
        )
        spine_items.append(f'<itemref idref="{page_id}"/>')

    nav = f"""<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Contents</title></head>
<body><nav epub:type="toc"><ol><li><a href="text/pg0001.xhtml">{esc_title}</a></li></ol></nav></body>
</html>"""

    direction = ' page-progression-direction="rtl"' if rtl else ""
    opf = f"""<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" prefix="rendition: http://www.idpf.org/vocab/rendition/#">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="uid">urn:panelflow:{esc_title}</dc:identifier>
<dc:title>{esc_title}</dc:title>
<dc:language>en</dc:language>
<meta property="dcterms:modified">2026-01-01T00:00:00Z</meta>
<meta property="rendition:layout">pre-paginated</meta>
<meta property="rendition:orientation">portrait</meta>
<meta property="rendition:spread">none</meta>
</metadata>
<manifest>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
{chr(10).join(manifest_items)}
</manifest>
<spine{direction}>
{chr(10).join(spine_items)}
</spine>
</package>"""

    container = """<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>"""

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        # mimetype must be the first entry and stored uncompressed
        zf.writestr(
            zipfile.ZipInfo("mimetype"), b"application/epub+zip", zipfile.ZIP_STORED
        )
        zf.writestr("META-INF/container.xml", container)
        zf.writestr("OEBPS/content.opf", opf)
        zf.writestr("OEBPS/nav.xhtml", nav)
        for name, data in entries:
            zf.writestr(name, data, zipfile.ZIP_STORED)
    return OutputFile(f"{title}.epub", buf.getvalue(), "application/epub+zip")


# ----------------------------------------------------------------------- pfc


def write_pfc(
    pages: list[OutPage], title: str, rtl: bool, profile_id: str, mode: str
) -> OutputFile:
    """PanelFlow container: a ZIP with a manifest, designed so future versions
    of PanelFlow (reader apps, re-conversion) can consume it directly."""
    manifest = {
        "format": "panelflow-comic",
        "version": 1,
        "title": title,
        "generator": "panelflow-web",
        "mode": mode,
        "profile": profile_id,
        "readingDirection": "rtl" if rtl else "ltr",
        "pageCount": len(pages),
        "pages": [
            {"file": f"pages/{p.filename}", "width": p.width, "height": p.height}
            for p in pages
        ],
    }
    entries = [("manifest.json", json.dumps(manifest, indent=2).encode("utf-8"))]
    entries += [(f"pages/{p.filename}", p.data) for p in pages]
    return OutputFile(f"{title}.pfc", _zip_bytes(entries), "application/zip")


# ------------------------------------------------------------- single image


def write_image_output(pages: list[OutPage], title: str, ext: str) -> OutputFile:
    """jpg/png/webp output: single page -> the image itself; multiple pages ->
    ZIP of numbered images."""
    if len(pages) == 1:
        p = pages[0]
        return OutputFile(f"{title}{ext}", p.data, p.media_type)
    return write_images_zip(pages, title)
