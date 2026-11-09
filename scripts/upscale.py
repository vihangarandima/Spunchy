"""Real-ESRGAN upscaling (x2plus / x4plus, ONNX on CPU), tiled to keep memory flat.

Reads .cache/images/plan.json (written by `node scripts/images.mjs crop`) and upscales
every crop with up > 1 into .cache/images/up/<id>.png. Skips files already done.
Models: .tools/models/real_esrgan_x{2,4}.onnx (see docs/image-pipeline.md).
"""
import json
import os
import sys

import numpy as np
import onnxruntime as ort
from PIL import Image

CACHE = ".cache/images"
MODELS = ".tools/models"
TILE = 256
PAD = 16  # overlap on each side, discarded after inference to hide tile seams


def upscale(img: np.ndarray, sess: ort.InferenceSession, scale: int) -> np.ndarray:
    h, w, _ = img.shape
    out = np.zeros((h * scale, w * scale, 3), dtype=np.float32)
    for y in range(0, h, TILE):
        for x in range(0, w, TILE):
            y0, x0 = max(y - PAD, 0), max(x - PAD, 0)
            y1, x1 = min(y + TILE + PAD, h), min(x + TILE + PAD, w)
            tile = img[y0:y1, x0:x1]
            # x2plus works on pixel-unshuffled input, so tile sides must be even.
            th, tw = tile.shape[:2]
            ph, pw = th % 2, tw % 2
            if ph or pw:
                tile = np.pad(tile, ((0, ph), (0, pw), (0, 0)), mode="reflect")
            inp = tile.transpose(2, 0, 1)[None].astype(np.float32)
            res = sess.run(None, {"input": inp})[0][0].transpose(1, 2, 0)
            res = res[: th * scale, : tw * scale]
            # Keep only the tile's own area, without the overlap.
            iy, ix = (y - y0) * scale, (x - x0) * scale
            hh = (min(y + TILE, h) - y) * scale
            ww = (min(x + TILE, w) - x) * scale
            out[y * scale : y * scale + hh, x * scale : x * scale + ww] = res[iy : iy + hh, ix : ix + ww]
    return np.clip(out, 0, 1)


def main() -> None:
    plan = json.load(open(f"{CACHE}/plan.json"))
    os.makedirs(f"{CACHE}/up", exist_ok=True)
    opts = ort.SessionOptions()
    opts.intra_op_num_threads = os.cpu_count() or 4
    sessions = {}
    only = set(sys.argv[1:])
    for item in plan:
        scale = item["up"]
        dst = f"{CACHE}/up/{item['id']}.png"
        if scale <= 1 or os.path.exists(dst) or (only and item["id"] not in only):
            continue
        if scale not in sessions:
            sessions[scale] = ort.InferenceSession(f"{MODELS}/real_esrgan_x{scale}.onnx", opts)
        img = np.asarray(Image.open(f"{CACHE}/crop/{item['id']}.png").convert("RGB"), dtype=np.float32) / 255
        res = upscale(img, sessions[scale], scale)
        Image.fromarray((res * 255 + 0.5).astype(np.uint8)).save(dst)
        print(f"up x{scale} {item['id']} {img.shape[1]}x{img.shape[0]} -> {res.shape[1]}x{res.shape[0]}", flush=True)


if __name__ == "__main__":
    main()
