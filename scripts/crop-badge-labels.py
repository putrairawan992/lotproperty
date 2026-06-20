"""
Crop teks label di bawah badge + bersihkan halo glossy/putih.
Pertahankan angka di dalam plaque badge.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

IMPORTS = Path(__file__).resolve().parents[1] / "src" / "imports"


def trim_transparent(arr: np.ndarray, pad: int = 4) -> np.ndarray:
    alpha = arr[:, :, 3]
    rows = np.any(alpha > 20, axis=1)
    cols = np.any(alpha > 20, axis=0)
    if not rows.any() or not cols.any():
        return arr
    r0, r1 = np.where(rows)[0][[0, -1]]
    c0, c1 = np.where(cols)[0][[0, -1]]
    r0 = max(0, r0 - pad)
    c0 = max(0, c0 - pad)
    r1 = min(arr.shape[0] - 1, r1 + pad)
    c1 = min(arr.shape[1] - 1, c1 + pad)
    return arr[r0 : r1 + 1, c0 : c1 + 1, :]


def find_crop_height(arr: np.ndarray) -> int:
    h, w = arr.shape[:2]
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    x0, x1 = int(w * 0.08), int(w * 0.92)
    bw = x1 - x0

    gold = (r.astype(np.int32) + g.astype(np.int32) > 280) & (b < 170) & (a > 70)
    yellow = (r > 200) & (g > 170) & (b < 140) & (a > 80)
    label = gold | yellow
    row_label = np.sum(label[:, x0:x1], axis=1)
    thresh = max(18, int(bw * 0.032))

    # Blok teks label emas di bagian bawah
    text_top = h
    in_text = False
    for y in range(h - 1, int(h * 0.5) - 1, -1):
        if row_label[y] > thresh * 1.2:
            in_text = True
            text_top = y
        elif in_text and row_label[y] < thresh * 0.35:
            break

    # Halo glossy: pixel terang semi-transparan / abu di bawah badge
    cx = w // 2
    glow_start = h
    for y in range(int(h * 0.62), h):
        center = arr[y, cx]
        cr, cg, cb, ca = int(center[0]), int(center[1]), int(center[2]), int(center[3])
        lum = cr + cg + cb
        is_gold_glow = cr > 180 and cg > 140 and cb < 160 and ca > 180
        is_gray_glow = lum > 240 and lum < 520 and ca > 180 and abs(cr - cg) < 40
        if is_gold_glow or is_gray_glow:
            glow_start = min(glow_start, y)

    crop = min(text_top, glow_start) - 10
    return max(int(h * 0.48), crop)


def clean_fringe(arr: np.ndarray) -> np.ndarray:
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    h = arr.shape[0]
    mx = np.maximum(np.maximum(r, g), b).astype(np.int32)
    mn = np.minimum(np.minimum(r, g), b).astype(np.int32)
    sat = mx - mn
    lum = (r.astype(np.int32) + g.astype(np.int32) + b.astype(np.int32)) // 3

    tail = int(h * 0.82)
    fringe = (sat < 45) & (lum > 55) & (lum < 160) & (a > 8) & (a < 245)
    fringe[:tail, :] = False
    arr = arr.copy()
    arr[fringe, 3] = 0

    # Sisa teks emas tipis di baris paling bawah
    gold = (r.astype(np.int32) + g.astype(np.int32) > 300) & (b < 150) & (a > 40)
    for y in range(h - 1, max(h - 30, 0), -1):
        row_gold = gold[y]
        if row_gold.sum() > 8:
            arr[y, row_gold, 3] = 0

    return arr


def process(path: Path) -> tuple[int, int, int, int]:
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    old_h, old_w = arr.shape[:2]
    crop_h = find_crop_height(arr)
    cropped = arr[:crop_h, :, :].copy()
    cropped = clean_fringe(cropped)
    cropped = trim_transparent(cropped)
    out = Image.fromarray(cropped, "RGBA")
    out.save(path, format="PNG")
    return old_w, old_h, cropped.shape[1], cropped.shape[0]


def main() -> None:
    import sys

    names = sys.argv[1:] if len(sys.argv) > 1 else None
    if names:
        files = [IMPORTS / n for n in names]
    else:
        files = sorted(IMPORTS.glob("[0-9][0-9]-*.png"))

    print(f"Memproses {len(files)} badge\n")
    for path in files:
        if not path.exists():
            print(f"  SKIP {path.name} (tidak ada)")
            continue
        ow, oh, nw, nh = process(path)
        print(f"  {path.name:32} {ow}x{oh} -> {nw}x{nh}")


if __name__ == "__main__":
    main()
