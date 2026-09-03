#!/usr/bin/env python3
"""Process Hachi mascot: clean transparency, static PNG, running sprite sheet."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SOURCE = Path(
    "/Users/daniel/Library/Application Support/Open Design/namespaces/release-stable/data/projects/"
    "172f282c-aedb-4df7-90c2-9418f981915e/hachi-mascot-transparent.png"
)

PADDING_RATIO = 0.1
NUM_FRAMES = 6
LEG_SPLIT_Y = 610

# Per-frame vertical offsets for leg bands (cute trot). Body above LEG_SPLIT_Y stays fixed.
FRAME_BAND_OFFSETS = [
    {"fl": 0, "fr": 0, "bl": 0, "br": 0},
    {"fl": -9, "fr": 4, "bl": 4, "br": -9},
    {"fl": -13, "fr": 6, "bl": 6, "br": -13},
    {"fl": 4, "fr": -9, "bl": -9, "br": 4},
    {"fl": 6, "fr": -13, "bl": -13, "br": 6},
    {"fl": 0, "fr": 0, "bl": 0, "br": 0},
]

LEG_RECTS = {
    "fl": (310, LEG_SPLIT_Y, 384, 738),
    "fr": (380, LEG_SPLIT_Y, 454, 738),
    "bl": (470, LEG_SPLIT_Y, 544, 738),
    "br": (540, LEG_SPLIT_Y, 630, 738),
}


def load_source() -> Image.Image:
    return Image.open(SOURCE).convert("RGBA")


def clean_alpha(arr: np.ndarray) -> np.ndarray:
    out = arr.astype(np.float32).copy()
    rgb = out[:, :, :3]
    alpha = out[:, :, 3].copy()

    bg = (rgb[:, :, 0] < 18) & (rgb[:, :, 1] < 18) & (rgb[:, :, 2] < 18)
    alpha[bg] = 0

    h, w = alpha.shape
    transparent = alpha == 0
    edge = np.zeros_like(alpha, dtype=bool)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dx == 0 and dy == 0:
                continue
            shifted = np.zeros_like(alpha, dtype=bool)
            y0, y1 = max(0, dy), h + min(0, dy)
            x0, x1 = max(0, dx), w + min(0, dx)
            sy0, sy1 = max(0, -dy), h - max(0, dy)
            sx0, sx1 = max(0, -dx), w - max(0, dx)
            shifted[sy0:sy1, sx0:sx1] = transparent[y0:y1, x0:x1]
            edge |= (alpha > 0) & shifted

    light = (rgb[:, :, 0] > 230) & (rgb[:, :, 1] > 230) & (rgb[:, :, 2] > 220)
    alpha[edge & light] = np.minimum(alpha[edge & light], 40)

    mask = edge & (alpha > 0)
    a = alpha[mask][:, None] / 255.0
    rgb_edge = rgb[mask] / np.maximum(a, 1e-3)
    sat = rgb_edge.max(axis=1) - rgb_edge.min(axis=1)
    rgb_edge[sat < 40] *= 0.7
    rgb[mask] = np.clip(rgb_edge, 0, 255)

    out[:, :, :3] = np.clip(rgb, 0, 255)
    out[:, :, 3] = np.clip(alpha, 0, 255)
    return out.astype(np.uint8)


def content_bbox(alpha: np.ndarray, pad: int) -> tuple[int, int, int, int]:
    ys, xs = np.where(alpha > 8)
    x1, x2 = int(xs.min()), int(xs.max())
    y1, y2 = int(ys.min()), int(ys.max())
    h, w = alpha.shape
    return (
        max(0, x1 - pad),
        max(0, y1 - pad),
        min(w - 1, x2 + pad),
        min(h - 1, y2 + pad),
    )


def crop_with_padding(img: Image.Image) -> tuple[Image.Image, tuple[int, int, int, int]]:
    arr = np.array(img)
    alpha = arr[:, :, 3]
    h, w = alpha.shape
    pad = int(max(h, w) * PADDING_RATIO)
    box = content_bbox(alpha, pad)
    return img.crop(box), box


def shift_rects(rects: dict[str, tuple[int, int, int, int]], ox: int, oy: int) -> dict[str, tuple[int, int, int, int]]:
    shifted = {}
    for k, (x1, y1, x2, y2) in rects.items():
        shifted[k] = (x1 - ox, y1 - oy, x2 - ox, y2 - oy)
    return shifted


def fill_leg_gaps(out: np.ndarray, x1: int, y1: int, x2: int, y2: int) -> None:
    for y in range(y1, y2):
        for x in range(x1, x2):
            if out[y, x, 3] > 20:
                continue
            for oy in range(1, 36):
                sy = y - oy
                if sy < 0:
                    break
                if out[sy, x, 3] > 180:
                    out[y, x] = out[sy, x]
                    out[y, x, 3] = min(int(out[sy, x, 3]), 210)
                    break


def build_frame(base: Image.Image, offsets: dict[str, int]) -> Image.Image:
    arr = np.array(base)
    out = arr.copy()

    for name, (x1, y1, x2, y2) in LEG_RECTS.items():
        dy = offsets[name]
        if dy == 0:
            continue

        patch = arr[y1:y2, x1:x2]
        leg_mask = patch[:, :, 3] > 10
        out[y1:y2, x1:x2][leg_mask] = (0, 0, 0, 0)

        ph = patch.shape[0]
        for row in range(ph):
            src_row = row - dy
            if 0 <= src_row < ph:
                src = patch[src_row]
                mask = src[:, 3] > 10
                out[y1 + row, x1:x2][mask] = src[mask]

        fill_leg_gaps(out, x1, y1, x2, y2)

    return Image.fromarray(out)


def quantize_png(img: Image.Image) -> Image.Image:
    alpha = img.split()[3]
    rgb = img.convert("RGB").quantize(colors=192, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return out


def save_png(img: Image.Image, path: Path) -> None:
    quantize_png(img).save(path, format="PNG", optimize=True, compress_level=9)


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)

    cleaned = Image.fromarray(clean_alpha(np.array(load_source())))
    cropped, crop_box = crop_with_padding(cleaned)
    cx1, cy1, _, _ = crop_box
    fw, fh = cropped.size

    global LEG_RECTS
    original_rects = LEG_RECTS
    LEG_RECTS = shift_rects(original_rects, cx1, cy1)

    static_path = ASSETS / "hachi-mascot.png"
    transparent_path = ASSETS / "hachi-mascot-transparent.png"
    save_png(cropped, static_path)
    save_png(cropped, transparent_path)

    frames = [build_frame(cropped, FRAME_BAND_OFFSETS[i]) for i in range(NUM_FRAMES)]
    LEG_RECTS = original_rects

    sheet = Image.new("RGBA", (fw * NUM_FRAMES, fh), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        sheet.paste(frame, (i * fw, 0))

    sheet_path = ASSETS / "hachi-mascot-run.png"
    save_png(sheet, sheet_path)

    meta = {
        "static": {"file": "hachi-mascot.png", "width": fw, "height": fh},
        "transparent": {"file": "hachi-mascot-transparent.png", "width": fw, "height": fh},
        "spriteSheet": {
            "file": "hachi-mascot-run.png",
            "frameWidth": fw,
            "frameHeight": fh,
            "frameCount": NUM_FRAMES,
            "fps": 10,
        },
    }
    (ASSETS / "hachi-mascot.meta.json").write_text(
        json.dumps(meta, indent=2) + "\n", encoding="utf-8"
    )

    import os

    print(f"Static: {static_path} ({fw}x{fh}, {os.path.getsize(static_path)//1024}KB)")
    print(f"Sprite: {sheet_path} ({fw * NUM_FRAMES}x{fh}, {os.path.getsize(sheet_path)//1024}KB)")


if __name__ == "__main__":
    main()
