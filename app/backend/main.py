import io
import os

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

MODEL_PATH = os.environ.get("MODEL_PATH", "weights/best.pt")
CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", "0.25"))

app = FastAPI(title="UK Road Sign Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model: YOLO | None = None


@app.on_event("startup")
def load_model() -> None:
    global model
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            f"Model weights not found at '{MODEL_PATH}'. Train a model with the "
            "notebook in training/ and place best.pt there, or set MODEL_PATH."
        )
    model = YOLO(MODEL_PATH)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> dict:
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image file")

    results = model.predict(image, conf=CONFIDENCE_THRESHOLD, verbose=False)
    result = results[0]

    detections = []
    for box in result.boxes:
        x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]
        detections.append(
            {
                "class_name": model.names[int(box.cls)],
                "confidence": round(float(box.conf), 4),
                "box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
            }
        )

    return {
        "filename": file.filename,
        "image_width": image.width,
        "image_height": image.height,
        "detections": detections,
    }
