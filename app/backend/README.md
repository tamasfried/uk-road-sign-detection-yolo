# Backend

FastAPI service that loads a trained YOLO model and exposes a `/predict` endpoint for image detection.

## Setup

```bash
cd app/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

Copy your trained weights (from `training/`) to `weights/best.pt`, or point `MODEL_PATH` at wherever they live.

## Run

```bash
uvicorn main:app --reload --port 8000
```

## Endpoints

- `GET /health` — `{"status": "ok", "model_loaded": true}`
- `POST /predict` — multipart form upload, field name `file`, image content type. Returns:

```json
{
  "filename": "sign.jpg",
  "image_width": 1280,
  "image_height": 720,
  "detections": [
    {
      "class_name": "give_way",
      "confidence": 0.93,
      "box": { "x1": 120.5, "y1": 80.2, "x2": 340.1, "y2": 300.7 }
    }
  ]
}
```

`box` coordinates are pixel values in the original image, `[x1, y1]` top-left and `[x2, y2]` bottom-right.

Env vars:

- `MODEL_PATH` (default `weights/best.pt`)
- `CONFIDENCE_THRESHOLD` (default `0.25`)

## Docker

```bash
docker build -t road-sign-backend .
docker run -p 8000:8000 road-sign-backend
```

## Video (later)

Video support can be added by looping this same model over decoded frames (e.g. with OpenCV) and either streaming per-frame detections back or returning an annotated video file — no architecture change needed, just a new endpoint that iterates frames through `model.predict`.
