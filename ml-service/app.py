"""BaitBreak scam-detection prediction service (FastAPI).

Run:   uvicorn app:app --host 0.0.0.0 --port 8000
Docs:  http://localhost:8000/docs
"""
import os
from contextlib import asynccontextmanager
from pathlib import Path

import joblib
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from preprocess import clean_text

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = Path(os.getenv("MODEL_PATH", BASE_DIR / "model.pkl"))
VECTORIZER_PATH = Path(os.getenv("VECTORIZER_PATH", BASE_DIR / "vectorizer.pkl"))
SCAM_THRESHOLD = float(os.getenv("SCAM_THRESHOLD", "0.5"))   # P(scam) >= threshold -> "scam"
MAX_CHARS = 5000

state = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    state["model"] = joblib.load(MODEL_PATH)
    state["vectorizer"] = joblib.load(VECTORIZER_PATH)
    yield
    state.clear()


app = FastAPI(title="BaitBreak Scam Detector", version="1.0.0", lifespan=lifespan)


class PredictRequest(BaseModel):
    message: str


class PredictResponse(BaseModel):
    success: bool
    prediction: str      # "scam" | "legitimate"
    confidence: float    # probability of the predicted class, 0-1


def _error(status: int, text: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"success": False, "error": text})


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return _error(422, 'Invalid request body. Expected JSON: {"message": "<text>"}')


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": "model" in state}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    text = req.message.strip()
    if not text:
        return _error(400, "message must be a non-empty string")
    if len(text) > MAX_CHARS:
        return _error(400, f"message too long (max {MAX_CHARS} characters)")
    cleaned = clean_text(text)
    if not cleaned:
        return _error(400, "message contains no readable text")
    proba = state["model"].predict_proba(state["vectorizer"].transform([cleaned]))[0]
    p_scam = float(proba[1])
    is_scam = p_scam >= SCAM_THRESHOLD
    confidence = p_scam if is_scam else 1.0 - p_scam
    return {"success": True, "prediction": "scam" if is_scam else "legitimate",
            "confidence": round(confidence, 4)}
