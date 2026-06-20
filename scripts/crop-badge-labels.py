"""
Crop teks label di bawah badge (gold text), pertahankan teks/angka di dalam ikon.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

IMPORTS = Path(__file__).resolve().parents[1] / "src" / "imports"


def find_crop_height(arr: np.ndarray) -> int:
    h, w = arr.shape[:2]
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    bw = int(w * 0.8)
    gold = (r.astype(np.int32) + g.astype(np.int32) > 280) & (b < 170) & (a > 70)
    row_gold = np.sum(gold[:, int(w * 0.1): int(w * 0.9)], axis=1)
    thresh = max(15, bw * 0.035)

    in_text = False
    text_top = h
    for y in range(h - 1, int(h * 0.52) - 1, -1):
        if row_gold[y] > thresh * 1.5:
            in_text = True
            text_top = y
        elif in_text and row_gold[y] < thresh * 0.5:
            break

    return max(int(h * 0.48), text_top - 10)


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
    return arr[r0:r1 + 1, c0:c1 + 1, :]


def process(path: Path) -> tuple[int, int, int, int]:
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    old_h, old_w = arr.shape[:2]
    crop_h = find_crop_height(arr)
    cropped = trim_transparent(arr[:crop_h, :, :])
    out = Image.fromarray(cropped, "RGBA")
    out.save(path, format="PNG")
    return old_w, old_h, cropped.shape[1], cropped.shape[0]


def main() -> None:
    files = sorted(IMPORTS.glob("[0-9][0-9]-*.png"))
    print(f"Memproses {len(files)} badge di {IMPORTS}\n")
    for path in files:
        ow, oh, nw, nh = process(path)
        print(f"  {path.name:32} {ow}x{oh} -> {nw}x{nh}")


if __name__ == "__main__":
    main()
