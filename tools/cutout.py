#!/usr/bin/env python3
"""Remove the studio background from a can mockup via border flood-fill
(preserves matching tones INSIDE the can by connectivity), trim to the can,
and pad to a consistent canvas. Auto-detects whether the backdrop is dark or
light by sampling the corners. Output: transparent PNG.

Usage: cutout.py IN.png OUT.png [--tol 40] [--pad 0.04]
"""
import sys, collections
import numpy as np
from PIL import Image

def cutout(inp, outp, tol=40, pad=0.04, canvas=(600, 1000)):
    im = Image.open(inp).convert("RGBA")
    a = np.asarray(im).astype(np.int16)
    h, w = a.shape[:2]
    rgb = a[:, :, :3]
    bright = rgb.max(2)

    # sample corners to decide backdrop polarity (dark vs light)
    corners = [rgb[0,0], rgb[0,-1], rgb[-1,0], rgb[-1,-1]]
    dark_bg = np.mean([c.max() for c in corners]) < 128

    if dark_bg:
        bgmask = bright < tol                      # near-black backdrop
    else:
        bgmask = np.all(rgb > (255 - tol), axis=2)  # near-white backdrop

    # flood fill from the border through connected backdrop pixels
    visited = np.zeros((h, w), bool)
    dq = collections.deque()
    for x in range(w):
        for y in (0, h - 1):
            if bgmask[y, x] and not visited[y, x]:
                visited[y, x] = True; dq.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if bgmask[y, x] and not visited[y, x]:
                visited[y, x] = True; dq.append((y, x))
    while dq:
        y, x = dq.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = y+dy, x+dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and bgmask[ny, nx]:
                visited[ny, nx] = True; dq.append((ny, nx))

    alpha = np.where(visited, 0, 255).astype(np.uint8)

    # soften the 1px edge to avoid white fringe on dark bg
    out = np.dstack([a[:, :, :3].astype(np.uint8), alpha])
    img = Image.fromarray(out, "RGBA")

    # trim to opaque bbox
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    # pad onto a fixed canvas, centered, preserving scale to fit
    cw, ch = canvas
    iw, ih = img.size
    scale = min(cw * (1 - pad) / iw, ch * (1 - pad) / ih)
    nw, nh = max(1, int(iw * scale)), max(1, int(ih * scale))
    img = img.resize((nw, nh), Image.LANCZOS)
    bg = Image.new("RGBA", canvas, (0, 0, 0, 0))
    bg.paste(img, ((cw - nw) // 2, (ch - nh) // 2), img)
    bg.save(outp)
    print("wrote", outp, bg.size, "from", (w, h))

if __name__ == "__main__":
    args = sys.argv[1:]
    inp, outp = args[0], args[1]
    tol = int(args[args.index("--tol")+1]) if "--tol" in args else 32
    pad = float(args[args.index("--pad")+1]) if "--pad" in args else 0.06
    cutout(inp, outp, tol, pad)
