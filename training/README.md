# Training

Notebook: [`01_train_road_sign_yolo.ipynb`](./01_train_road_sign_yolo.ipynb) — run it in [Google Colab](https://colab.research.google.com/) with a GPU runtime.

## 1. Get a dataset

The notebook expects a UK road sign dataset in YOLO format, pulled from [Roboflow Universe](https://universe.roboflow.com/). Search for something like:

- "UK road signs"
- "UK traffic signs"
- "GTSRB" (German dataset, sign shapes/categories are close but not UK-specific — fine for a first pass, swap later)

Pick a dataset, open its page, go to the **Download** tab, choose export format **YOLOv8**, and note down the `workspace`, `project`, and `version` shown in the generated code snippet — the notebook uses those three values directly.

If nothing suitable exists yet, you can label your own images in [Roboflow](https://roboflow.com) (free tier) and export the same way.

## 2. Get a Roboflow API key

Roboflow account → Settings → API Keys. In Colab, store it as a secret named `ROBOFLOW_API_KEY` (key icon in the left sidebar) rather than pasting it into the notebook.

## 3. Run the notebook top to bottom

Installs dependencies → downloads the dataset → trains a YOLO11 model → validates it → runs test inference with confidence scores → downloads `best.pt`.

Defaults: `yolo11n.pt` base checkpoint, 100 epochs, 640px images, batch size 16. Adjust in the training cell — bump to `yolo11s.pt`/`yolo11m.pt` and more epochs once the pipeline works end to end, if you need higher accuracy and have the GPU budget.

## 4. Use the trained weights

Copy the downloaded `best.pt` into `app/backend/weights/best.pt` — the backend loads it from there by default (see `app/backend/README.md`).
