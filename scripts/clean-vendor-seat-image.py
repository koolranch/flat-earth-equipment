#!/usr/bin/env python3
"""Remove semi-transparent vendor portal watermarks from seat product photos.

Usage:
  python3 scripts/clean-vendor-seat-image.py <input.jpg> <output.jpg>

Requires: opencv-python-headless, numpy
"""

from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np


def remove_watermark(img: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    product = gray < 245

    k = 25
    local_min = cv2.erode(gray, cv2.getStructuringElement(cv2.MORPH_RECT, (k, k))).astype(
        np.float32
    )
    local_med = cv2.medianBlur(gray, k).astype(np.float32)

    work = img.astype(np.float32)
    for c in range(3):
        ch = work[:, :, c]
        lift = ch - local_min
        active = product & (local_med < 185) & (lift > 1.5)
        strength = np.zeros_like(ch)
        strength[active] = np.clip((lift[active] - 1.5) / 12.0, 0.35, 0.98)
        ch[active] = ch[active] - (ch[active] - local_min[active]) * strength[active]
        work[:, :, c] = ch

    result = np.clip(work, 0, 255).astype(np.uint8)

    g = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)
    tophat = cv2.morphologyEx(
        g, cv2.MORPH_TOPHAT, cv2.getStructuringElement(cv2.MORPH_RECT, (13, 13))
    )
    mask = np.zeros_like(g)
    mask[(tophat > 6) & product & (g < 210)] = 255
    mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (4, 4)), 1)
    result = cv2.inpaint(result, mask, 7, cv2.INPAINT_NS)

    g2 = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)
    result[g2 > 252] = (255, 255, 255)

    smooth = cv2.bilateralFilter(result, 7, 50, 50)
    lift = g2.astype(np.float32) - cv2.medianBlur(g2, 21).astype(np.float32)
    detail_mask = product & (lift < 8)
    blend = result.astype(np.float32)
    blend[detail_mask] = result[detail_mask] * 0.55 + smooth[detail_mask] * 0.45
    polished = np.clip(blend, 0, 255).astype(np.uint8)
    polished[g2 > 252] = (255, 255, 255)
    return polished


def main() -> None:
    if len(sys.argv) != 3:
        print('Usage: python3 scripts/clean-vendor-seat-image.py <input> <output>')
        sys.exit(1)

    src = Path(sys.argv[1])
    out = Path(sys.argv[2])
    img = cv2.imread(str(src))
    if img is None:
        raise SystemExit(f'Could not read image: {src}')

    cleaned = remove_watermark(img)
    out.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out), cleaned, [int(cv2.IMWRITE_JPEG_QUALITY), 94])
    print(f'Wrote {out}')


if __name__ == '__main__':
    main()
