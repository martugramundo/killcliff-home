#!/usr/bin/env python3
"""Extract an evenly-spaced, alpha-preserving frame sequence from a turntable
video (ProRes 4444 / any RGBA-capable source) for the hero can spin.

Pipeline: ffmpeg dumps every Nth frame as RGBA PNG → compute one UNION alpha
bbox across all frames (so the can rotates in place, no jitter) → crop all to
it, pad slightly, resize to target height → save as WebP (alpha, small).

Usage: frames-from-video.py VIDEO OUTDIR [--count 31] [--height 760] [--pad 0.04]
"""
import sys, os, subprocess, tempfile, glob
import numpy as np
from PIL import Image

def run(video, outdir, count=31, height=760, pad=0.04):
    os.makedirs(outdir, exist_ok=True)
    # clear old frames
    for old in glob.glob(os.path.join(outdir, "*.webp")) + glob.glob(os.path.join(outdir, "*.png")):
        os.remove(old)

    with tempfile.TemporaryDirectory() as tmp:
        # total frames
        n = int(subprocess.check_output([
            "ffprobe", "-v", "error", "-select_streams", "v:0",
            "-count_frames", "-show_entries", "stream=nb_read_frames",
            "-of", "default=nokey=1:noprint_wrappers=1", video]).strip())
        step = max(1, round(n / count))
        # dump selected frames as rgba png
        subprocess.check_call([
            "ffmpeg", "-y", "-i", video,
            "-vf", f"select='not(mod(n\\,{step}))',format=rgba",
            "-vsync", "0", os.path.join(tmp, "f%03d.png"),
            "-loglevel", "error"])
        files = sorted(glob.glob(os.path.join(tmp, "f*.png")))

        # union alpha bbox
        x0 = y0 = 10**9; x1 = y1 = -1
        for f in files:
            al = np.asarray(Image.open(f))[:, :, 3]
            ys, xs = np.where(al > 16)
            if len(xs) == 0:
                continue
            x0 = min(x0, xs.min()); x1 = max(x1, xs.max())
            y0 = min(y0, ys.min()); y1 = max(y1, ys.max())
        bw, bh = x1 - x0, y1 - y0
        # symmetric horizontal pad so center of rotation stays centered
        px = int(bw * pad); py = int(bh * pad)
        box = (max(0, x0 - px), max(0, y0 - py), x1 + px, y1 + py)
        cw, ch = box[2] - box[0], box[3] - box[1]
        scale = height / ch
        tw = max(1, round(cw * scale))

        for i, f in enumerate(files, 1):
            im = Image.open(f).convert("RGBA").crop(box).resize((tw, height), Image.LANCZOS)
            im.save(os.path.join(outdir, f"{i:02d}.webp"), "WEBP", quality=88, method=6)
        print(f"{os.path.basename(outdir)}: {len(files)} frames, crop {cw}x{ch} -> {tw}x{height}")

if __name__ == "__main__":
    a = sys.argv[1:]
    video, outdir = a[0], a[1]
    count = int(a[a.index("--count")+1]) if "--count" in a else 31
    height = int(a[a.index("--height")+1]) if "--height" in a else 760
    pad = float(a[a.index("--pad")+1]) if "--pad" in a else 0.04
    run(video, outdir, count, height, pad)
