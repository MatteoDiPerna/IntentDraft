#!/usr/bin/env python3
"""Build transparent logo + favicon from logo-source.png."""

from __future__ import annotations

import struct
from collections import deque
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "src" / "assets" / "brand"
PUBLIC = ROOT / "public"


def _border_background_rgb(rgb: np.ndarray) -> np.ndarray:
    h, w = rgb.shape[:2]
    edge = np.concatenate(
        [rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]],
        axis=0,
    )
    return np.median(edge, axis=0)


def _color_distance(rgb: np.ndarray, bg: np.ndarray) -> np.ndarray:
    diff = rgb - bg.reshape(1, 1, 3)
    return np.sqrt((diff * diff).sum(axis=2))


def _saturation(rgb: np.ndarray) -> np.ndarray:
    return rgb.max(axis=2) - rgb.min(axis=2)


def _flood_background_mask(
    dist: np.ndarray,
    sat: np.ndarray,
    *,
    flood_tol: float,
    sat_bg_max: float,
) -> np.ndarray:
    """Mark pixels connected to image border through background-like colors."""
    h, w = dist.shape
    candidate = (dist < flood_tol) | ((dist < flood_tol + 22) & (sat < sat_bg_max))
    bg = np.zeros((h, w), dtype=bool)
    seen = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        for y in (0, h - 1):
            if candidate[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if candidate[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))

    while q:
        y, x = q.popleft()
        bg[y, x] = True
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx] and candidate[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))

    return bg


def _peel_background_rim(
    bg_mask: np.ndarray,
    dist: np.ndarray,
    sat: np.ndarray,
    *,
    max_iter: int = 16,
    dist_max: float = 68,
    sat_max: float = 40,
) -> np.ndarray:
    """Grow background into blue compression halos touching transparent areas."""
    peelable = (dist < dist_max) & (sat < sat_max)
    out = bg_mask.copy()
    for _ in range(max_iter):
        padded = np.pad(out, 1, mode="constant", constant_values=False)
        touches_bg = (
            padded[:-2, 1:-1]
            | padded[2:, 1:-1]
            | padded[1:-1, :-2]
            | padded[1:-1, 2:]
        )
        add = touches_bg & peelable & ~out
        if not np.any(add):
            break
        out |= add
    return out


def remove_background(src: Path, dest: Path) -> None:
    img = Image.open(src).convert("RGBA")
    arr = np.array(img)
    rgb = arr[:, :, :3].astype(np.float32)

    bg = _border_background_rgb(rgb)
    dist = _color_distance(rgb, bg)
    sat = _saturation(rgb)

    bg_mask = _flood_background_mask(dist, sat, flood_tol=32, sat_bg_max=28)

    # Stray background islands / blue halos (not reached by flood but still bg-colored)
    halo = (~bg_mask) & (dist < 62) & (sat < 44)
    bg_mask |= halo

    bg_mask = _peel_background_rim(bg_mask, dist, sat)

    # Hard matte: icon strokes stay saturated; halos are removed (no semi-transparent blue)
    alpha = np.where(bg_mask, 0, 255).astype(np.uint8)

    out = arr.copy()
    out[:, :, 3] = alpha
    Image.fromarray(out, mode="RGBA").save(dest, optimize=True)
    print(f"Wrote {dest} (bg ref RGB {bg.astype(int).tolist()})")


def write_ico(png_path: Path, ico_path: Path, sizes: tuple[int, ...] = (16, 32, 48)) -> None:
    """Minimal multi-size ICO from PNG (PNG-in-ICO for simplicity)."""
    images: list[bytes] = []
    for size in sizes:
        im = Image.open(png_path).convert("RGBA")
        im = im.resize((size, size), Image.Resampling.LANCZOS)
        buf = BytesIO()
        im.save(buf, format="PNG")
        images.append(buf.getvalue())

    count = len(images)
    header = struct.pack("<HHH", 0, 1, count)
    offset = 6 + 16 * count
    entries = b""
    data = b""
    for i, size in enumerate(sizes):
        png = images[i]
        entries += struct.pack(
            "<BBBBHHII",
            size if size < 256 else 0,
            size if size < 256 else 0,
            0,
            0,
            1,
            32,
            len(png),
            offset,
        )
        offset += len(png)
        data += png
    ico_path.write_bytes(header + entries + data)
    print(f"Wrote {ico_path}")


def main() -> None:
    src = BRAND / "logo-source.png"
    if not src.is_file():
        raise SystemExit(f"Missing {src}")

    transparent = BRAND / "logo.png"
    remove_background(src, transparent)

    PUBLIC.mkdir(parents=True, exist_ok=True)
    favicon_png = PUBLIC / "favicon.png"
    im = Image.open(transparent).convert("RGBA")
    im.resize((32, 32), Image.Resampling.LANCZOS).save(favicon_png, optimize=True)
    write_ico(transparent, PUBLIC / "favicon.ico")
    print("Done.")


if __name__ == "__main__":
    main()
