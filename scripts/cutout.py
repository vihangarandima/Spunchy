"""Product cut-outs with rembg (BiRefNet-general).

Reads .cache/images/plan.json and, for every entry with cutout=true, removes the
background from .cache/images/graded/<id>.png into .cache/images/cut/<id>.png.

BiRefNet predicts at 1024 px whatever the input size, so the mask is predicted once,
upscaled with Lanczos and its soft edge tightened with a levels curve. This is much
faster than rembg's alpha matting on 3000 px images and keeps buttercream edges soft.
"""
import json
import os
import sys

# The BiRefNet weights are the onnx-community export placed in ~/.u2net by hand
# (GitHub release downloads are blocked here), so rembg's md5 check must be skipped.
os.environ.setdefault("MODEL_CHECKSUM_DISABLED", "1")

import numpy as np  # noqa: E402
from PIL import Image  # noqa: E402
from rembg import new_session  # noqa: E402

CACHE = ".cache/images"
LO, HI = 0.15, 0.85  # mask values below LO become fully clear, above HI fully solid


def main() -> None:
    plan = json.load(open(f"{CACHE}/plan.json"))
    os.makedirs(f"{CACHE}/cut", exist_ok=True)
    only = set(sys.argv[1:])
    session = new_session("birefnet-general")
    for item in plan:
        if not item["cutout"] or (only and item["id"] not in only):
            continue
        img = Image.open(f"{CACHE}/graded/{item['id']}.png").convert("RGB")
        small = img.copy()
        small.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        mask = session.predict(small)[0].resize(img.size, Image.Resampling.LANCZOS)
        a = np.asarray(mask, dtype=np.float32) / 255
        a = np.clip((a - LO) / (HI - LO), 0, 1)
        out = img.convert("RGBA")
        out.putalpha(Image.fromarray((a * 255 + 0.5).astype(np.uint8)))
        out.save(f"{CACHE}/cut/{item['id']}.png")
        print(f"cut {item['id']} {img.size[0]}x{img.size[1]}", flush=True)


if __name__ == "__main__":
    main()
