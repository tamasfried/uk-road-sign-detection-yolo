# UK Road Sign Detection (YOLO)

Upload a photo and detect UK road signs with per-detection confidence scores, powered by a YOLO model trained on a UK road sign dataset. Video support is planned as a follow-up (run the same model frame-by-frame).

## How it fits together

```
training/     Colab notebook: Roboflow dataset -> train/validate a YOLO model -> best.pt
app/backend/  FastAPI service that loads best.pt and exposes POST /predict
app/frontend/ Static HTML/JS page: upload an image, draw boxes + labels from the API response
```

1. **Train** — run `training/01_train_road_sign_yolo.ipynb` in Colab against a Roboflow UK road sign dataset. Produces `best.pt`.
2. **Serve** — drop `best.pt` into `app/backend/weights/`, run the FastAPI app. `POST /predict` takes an image and returns detected sign classes, confidence scores, and bounding boxes as JSON.
3. **Use** — open `app/frontend/index.html`, upload a photo, click Detect. It calls the backend and draws the boxes/labels on a canvas over the image.

See `training/README.md` and `app/backend/README.md` for details on each part.

## Quickstart (once you have `best.pt`)

```bash
# backend
cd app/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp /path/to/best.pt weights/best.pt
uvicorn main:app --reload --port 8000

# frontend (separate terminal)
cd app/frontend
python -m http.server 5500
# open http://localhost:5500, API URL field already defaults to http://localhost:8000
```

## Deployment

- **Hugging Face Spaces** — easiest option. Use the Docker Space type with `app/backend/Dockerfile`, upload `best.pt` to the Space (or pull it from the HF Hub at startup), and host the frontend as a static Space or serve it from the same FastAPI app with `StaticFiles`.
- **Fly.io / Render / a small VPS** — build and run `app/backend/Dockerfile` directly; serve `app/frontend/` as static files from the same host or any static host (GitHub Pages, Netlify), pointing its API URL field at the backend's public URL.

## Roadmap

- [x] Training notebook (Roboflow + Ultralytics YOLO)
- [x] FastAPI backend with `/predict`
- [x] Frontend image upload + box overlay
- [ ] Video support (loop the model over decoded frames)
- [ ] Deploy and link a live demo here
