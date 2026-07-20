"""Smart conversion engine.

Classical computer vision, tuned for comics:

- margin trimming against the detected background color
- double-page detection + split at the central gutter
- recursive gutter slicing for panel detection (a cut only happens through a
  strip of pure background, so speech balloons, characters and panels that
  overlap a gutter are never cut - scenes that share ink stay together)
- webtoon/manhwa mode: very tall strips are re-paginated at empty gaps
- reading order preserved (LTR comics, RTL manga)

If a page doesn't segment confidently, it falls back to the full trimmed page:
never break the narrative to force a split.
"""

from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageOps

from .profiles import DeviceProfile


@dataclass
class SmartOptions:
    rtl: bool = False  # manga reading direction
    split_double: bool = True
    trim: bool = True
    panels: bool = True  # False -> only trim/split/resize, no panel slicing
    max_panels_per_page: int = 16


# ------------------------------------------------------------------ analysis


def _gray(img: Image.Image) -> np.ndarray:
    if img.mode == "L":
        return np.asarray(img)
    return cv2.cvtColor(np.asarray(img.convert("RGB")), cv2.COLOR_RGB2GRAY)


def _background_value(gray: np.ndarray) -> int:
    h, w = gray.shape
    bh, bw = max(2, h // 50), max(2, w // 50)
    border = np.concatenate(
        [
            gray[:bh].ravel(),
            gray[-bh:].ravel(),
            gray[:, :bw].ravel(),
            gray[:, -bw:].ravel(),
        ]
    )
    return int(np.median(border))


def _content_mask(gray: np.ndarray, bg: int) -> np.ndarray:
    """Binary mask (0/1) of pixels that differ from the page background."""
    diff = cv2.absdiff(gray, np.full_like(gray, bg))
    mask = (diff > 26).astype(np.uint8)
    # kill isolated specks (dust, paper grain) without eroding real content
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    return mask


def _content_bbox(mask: np.ndarray) -> tuple[int, int, int, int] | None:
    h, w = mask.shape
    rows = np.where(mask.sum(axis=1) > max(2, w * 0.004))[0]
    cols = np.where(mask.sum(axis=0) > max(2, h * 0.004))[0]
    if len(rows) == 0 or len(cols) == 0:
        return None
    return int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1


def trim_margins(
    img: Image.Image, pad: int = 6, bg: int | None = None
) -> Image.Image:
    """bg: page background gray value. Pass the value measured on the ORIGINAL
    page borders — after a crop the borders touch artwork and re-estimating
    there would mistake mid-tones for background."""
    gray = _gray(img)
    if bg is None:
        bg = _background_value(gray)
    bbox = _content_bbox(_content_mask(gray, bg))
    if bbox is None:
        return img
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(img.width, x1 + pad)
    y1 = min(img.height, y1 + pad)
    if (x1 - x0) < img.width * 0.2 or (y1 - y0) < img.height * 0.2:
        return img  # suspicious trim, keep original
    return img.crop((x0, y0, x1, y1))


# -------------------------------------------------------------- double pages


def split_double_page(
    img: Image.Image, rtl: bool, bg: int | None = None
) -> list[Image.Image]:
    """If the image looks like a two-page spread with an empty central gutter,
    split it. Spreads whose center has ink (a scene across both pages) are
    kept whole on purpose."""
    if img.width <= img.height * 1.25:
        return [img]
    gray = _gray(img)
    if bg is None:
        bg = _background_value(gray)
    mask = _content_mask(gray, bg)
    h, w = mask.shape
    band0, band1 = int(w * 0.38), int(w * 0.62)
    col_density = mask[:, band0:band1].sum(axis=0)
    cut_rel = int(np.argmin(col_density))
    if col_density[cut_rel] > h * 0.005:
        return [img]  # artwork crosses the center: keep the spread together
    cut = band0 + cut_rel
    left = img.crop((0, 0, cut, img.height))
    right = img.crop((cut, 0, img.width, img.height))
    return [right, left] if rtl else [left, right]


# ------------------------------------------------------------ panel slicing


def _gutter_runs(density: np.ndarray, eps: float, min_gap: int) -> list[tuple[int, int]]:
    """Runs of consecutive near-empty lines, excluding the borders."""
    empty = density <= eps
    runs: list[tuple[int, int]] = []
    start = None
    for i, e in enumerate(empty):
        if e and start is None:
            start = i
        elif not e and start is not None:
            runs.append((start, i))
            start = None
    if start is not None:
        runs.append((start, len(empty)))
    n = len(empty)
    return [
        (a, b)
        for a, b in runs
        if (b - a) >= min_gap and a > 0 and b < n  # internal gutters only
    ]


def _cut_positions(
    mask: np.ndarray, box: tuple[int, int, int, int], axis: int
) -> list[int]:
    """Find cut positions along `axis` inside `box`. A cut is only made through
    a *gutter*: a band with almost no content (ink/art) across the whole span
    of the region. Balloons and interior whitespace never span the full region
    (art or a neighbouring panel sits beside them at the same line), so they
    are not mistaken for gutters. A border margin is excluded so a drawn panel
    frame at the region edge doesn't disqualify an otherwise-clean band. Works
    for any page background (the content mask already handles white or black).
    axis=1 finds horizontal gutters (returns y offsets); axis=0, vertical."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    mw = max(3, int(w * 0.05))
    mh = max(3, int(h * 0.05))
    if axis == 1:
        region = mask[y0:y1, x0 + mw : x1 - mw]
        frac = region.mean(axis=1)
        length = h
    else:
        region = mask[y0 + mh : y1 - mh, x0:x1]
        frac = region.mean(axis=0)
        length = w
    if region.size == 0:
        return []

    # low-content band: a true gutter is nearly empty across the span. Some
    # tolerance (3%) absorbs screentone speckle and antialiasing in scanned
    # manga; the border-margin exclusion above already removes drawn frame
    # lines, and the empty-child guard in the caller rejects the remaining
    # false positives (whitespace bands inside a panel).
    gutter = frac <= 0.03
    runs: list[tuple[int, int]] = []
    start = None
    for i, g in enumerate(gutter):
        if g and start is None:
            start = i
        elif not g and start is not None:
            runs.append((start, i))
            start = None
    if start is not None:
        runs.append((start, len(gutter)))

    min_gap = max(10, int(length * 0.012))
    min_side = max(40, int(length * 0.08))
    cuts: list[int] = []
    prev = 0
    for a, b in runs:
        if (b - a) < min_gap or a == 0 or b == length:
            continue  # too thin, or a border margin rather than a gutter
        mid = (a + b) // 2
        if mid - prev >= min_side and (length - mid) >= min_side:
            cuts.append(mid)
            prev = mid
    return cuts


def _slice_region(
    mask: np.ndarray,
    box: tuple[int, int, int, int],
    depth: int,
    out: list[tuple[int, int, int, int]],
    rtl: bool,
) -> None:
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0

    if depth < 5 and w > 80 and h > 80:
        # Cut along the axis that matches the region's shape first: wide
        # regions (spreads, panel rows) split by columns before rows so the
        # left page/panel is fully read before the right one; otherwise rows
        # of panels come first, as in a normal page.
        axis_order = (0, 1) if w > h * 1.15 else (1, 0)
        for axis in axis_order:
            cuts = _cut_positions(mask, box, axis)
            if cuts:
                length = h if axis == 1 else w
                edges = [0] + cuts + [length]
                children = []
                for i in range(len(edges) - 1):
                    a, b = edges[i], edges[i + 1]
                    child = (
                        (x0, y0 + a, x1, y0 + b) if axis == 1 else (x0 + a, y0, x0 + b, y1)
                    )
                    children.append(child)
                # Reject the split if any child is nearly empty: that "gutter"
                # was whitespace *inside* a panel (an empty sky, a gap above a
                # caption), not a real gap *between* panels. Keeping the panel
                # whole is always safe; slicing off its empty half is not.
                if any(
                    mask[cy0:cy1, cx0:cx1].mean() < 0.02
                    for cx0, cy0, cx1, cy1 in children
                ):
                    continue
                if axis == 0 and rtl:
                    children.reverse()  # manga: right column first
                for child in children:
                    _slice_region(mask, child, depth + 1, out, rtl)
                return
    out.append(box)


def detect_panels(
    img: Image.Image, opts: SmartOptions, bg: int | None = None
) -> list[tuple[int, int, int, int]]:
    """Panel bounding boxes in reading order, or a single full-page box when
    segmentation is not confident.

    Deliberately conservative: it only separates panels across clean, full-span
    gutters and, if the result looks unreliable (a single piece, too many
    pieces, or only slivers survive), it returns the whole page. A page that is
    merely resized to the device is always readable; a page sliced through a
    face or a speech balloon is not. This matters most for manga, whose
    borderless panels and floating balloons defeat naive splitting."""
    gray = _gray(img)
    if bg is None:
        bg = _background_value(gray)
    mask = _content_mask(gray, bg)
    h, w = mask.shape
    full = (0, 0, w, h)

    boxes: list[tuple[int, int, int, int]] = []
    _slice_region(mask, full, 0, boxes, opts.rtl)

    if len(boxes) <= 1 or len(boxes) > opts.max_panels_per_page:
        return [full]

    # tighten each panel to its own content and drop slivers (stray balloons
    # or text fragments that slipped through as their own "panel")
    tight: list[tuple[int, int, int, int]] = []
    for x0, y0, x1, y1 in boxes:
        bbox = _content_bbox(mask[y0:y1, x0:x1])
        if bbox is None:
            continue
        bx0, by0, bx1, by1 = bbox
        area = (bx1 - bx0) * (by1 - by0)
        if area < w * h * 0.03:
            continue
        pad = 8
        tight.append(
            (
                max(0, x0 + bx0 - pad),
                max(0, y0 + by0 - pad),
                min(w, x0 + bx1 + pad),
                min(h, y0 + by1 + pad),
            )
        )
    # If dropping slivers collapsed the segmentation, the page wasn't a clean
    # grid — keep it whole rather than emit one arbitrary fragment.
    if len(tight) <= 1:
        return [full]
    return tight


# -------------------------------------------------------------- webtoon mode


def is_webtoon_strip(img: Image.Image) -> bool:
    return img.height > img.width * 2.5


def repaginate_strip(
    img: Image.Image, profile: DeviceProfile, bg: int | None = None
) -> list[Image.Image]:
    """Cut a vertical webtoon strip at empty gaps and pack the segments into
    screen-sized pages without ever cutting through artwork or balloons."""
    gray = _gray(img)
    if bg is None:
        bg = _background_value(gray)
    mask = _content_mask(gray, bg)
    h, w = mask.shape
    row_density = mask.sum(axis=1)
    eps = w * 0.003

    # candidate cut points = centers of empty gaps
    runs = _gutter_runs(row_density, eps, min_gap=max(8, int(w * 0.02)))
    cut_points = [0] + [(a + b) // 2 for a, b in runs] + [h]
    segments = [
        (cut_points[i], cut_points[i + 1])
        for i in range(len(cut_points) - 1)
        if cut_points[i + 1] - cut_points[i] > 4
    ]

    target = int(w * (profile.height / profile.width))
    pages: list[Image.Image] = []
    cur_start: int | None = None
    cur_end = 0
    for a, b in segments:
        if cur_start is None:
            cur_start, cur_end = a, b
            continue
        if (b - cur_start) <= target * 1.15:
            cur_end = b
        else:
            pages.append(img.crop((0, cur_start, w, cur_end)))
            cur_start, cur_end = a, b
    if cur_start is not None:
        pages.append(img.crop((0, cur_start, w, cur_end)))
    return pages if pages else [img]


# ----------------------------------------------------------------- rendering


def render_for_profile(img: Image.Image, profile: DeviceProfile) -> Image.Image:
    scale = min(profile.width / img.width, profile.height / img.height)
    scale = min(scale, profile.max_upscale)
    if abs(scale - 1.0) > 0.01:
        # floor, and clamp to the profile, so rounding can never push a page a
        # pixel or two past the device's real screen size
        new_w = min(profile.width, max(1, int(img.width * scale)))
        new_h = min(profile.height, max(1, int(img.height * scale)))
        img = img.resize((new_w, new_h), Image.LANCZOS)
    if profile.grayscale:
        img = img.convert("L")
        img = ImageOps.autocontrast(img, cutoff=1)
        if profile.sharpen:
            img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=50, threshold=2))
    return img


# --------------------------------------------------------------- page driver


def process_page(
    img: Image.Image, profile: DeviceProfile, opts: SmartOptions
) -> list[Image.Image]:
    """One source page in, one or more device-ready pages out."""
    # Measure the page background exactly once, on the original borders.
    # Every later stage (trim, split, slice) reuses this value: after a crop
    # the borders touch artwork, and re-measuring there would mistake art
    # tones for background (black-background digital comics broke this).
    bg = _background_value(_gray(img))

    if opts.trim:
        img = trim_margins(img, bg=bg)

    if is_webtoon_strip(img):
        chunks = repaginate_strip(img, profile, bg=bg)
        return [
            render_for_profile(trim_margins(c, bg=bg), profile) for c in chunks
        ]

    halves = split_double_page(img, opts.rtl, bg=bg) if opts.split_double else [img]

    out: list[Image.Image] = []
    for half in halves:
        half = trim_margins(half, bg=bg) if opts.trim and len(halves) > 1 else half
        if not opts.panels:
            out.append(render_for_profile(half, profile))
            continue
        for box in detect_panels(half, opts, bg=bg):
            panel = half.crop(box)
            out.append(render_for_profile(panel, profile))
    return out
