# Image pipeline

`npm run images` turns the untouched originals in `assets/raw/` into web-ready files in
`src/assets/images/`. Each step can be rerun on its own; intermediates live in
`.cache/images/` (git-ignored).

| Step | Tool | Output |
|---|---|---|
| `node scripts/images.mjs crop` | sharp | `crop/<id>.png`: EXIF rotation, crop, paint-outs, `plan.json` |
| `python scripts/upscale.py [ids]` | Real-ESRGAN x2plus / x4plus (ONNX, CPU) | `up/<id>.png` (skips files already done) |
| `node scripts/images.mjs grade` | sharp | `graded/<id>.png`: the shared colour grade |
| `python scripts/cutout.py [ids]` | rembg + BiRefNet-general | `cut/<id>.png`: transparent product cut-outs |
| `node scripts/images.mjs export` | sharp | AVIF + WebP at 640 / 1280 / 1920 / 2560, `manifest.json` with sizes and a 24 px blurred placeholder |
| `node scripts/images.mjs sheet` | — | `docs/contact-sheet/index.html` (before/after review page) |

What gets processed, and how, is listed in `scripts/images.config.mjs`.

## Colour grade

The goal is "one shoot under the same warm cabinet light":

1. **White balance from a white patch.** Near-neutral highlights (icing, cream, cabinet
   white) are pulled 60% of the way toward a warm white (r:g:b = 1.03 : 1 : 0.93). Grey-world
   balancing was tried first and rejected because it turned the fruit tart's cream blue.
2. **Exposure** moves halfway toward a shared mid-tone, clamped to 0.85–1.25 so dark scenes stay moody.
3. **Contrast** gets a gentle S curve (×1.10 for photos), saturation +8%, and light sharpening.

Spunchy's own printed posters (`grade: 'artwork'`) only get the tone step, never white balance,
because their colours are designed.

## Models (not committed; in `.tools/models` and `~/.u2net`)

GitHub release downloads time out (504) from this machine, so both models come from Hugging Face:

- `real_esrgan_x4.onnx` / `real_esrgan_x2.onnx` from
  [SceneWorks/real-esrgan-onnx](https://huggingface.co/SceneWorks/real-esrgan-onnx)
  (ONNX exports of xinntao's RealESRGAN_x4plus / x2plus)
- `~/.u2net/BiRefNet-general-epoch_244.onnx` is the
  [onnx-community/BiRefNet-ONNX](https://huggingface.co/onnx-community/BiRefNet-ONNX) `onnx/model.onnx`,
  renamed to the file name rembg expects. `cutout.py` sets `MODEL_CHECKSUM_DISABLED=1` because the
  hash differs from rembg's own copy.

Python dependencies: `rembg` (brings `onnxruntime`, `numpy`, `Pillow`).

## Rules

- Originals in `assets/raw/` are never modified.
- No people, faces or number plates: crops avoid customers, the rider and the street.
- Price cards are cropped out of product photos, so a photo never contradicts a live price.
- Nothing is generated or invented. Upscaling sharpens real detail, and paint-outs only remove
  poster lettering using the poster's own black.
