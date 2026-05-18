"""
AQI Prediction API — FastAPI Backend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import numpy as np
import joblib
import json
import os

BASE = os.path.dirname(__file__)

# ── Load artifacts ────────────────────────────────────────────────────────────
imputer    = joblib.load(f"{BASE}/imputer.pkl")
scaler     = joblib.load(f"{BASE}/scaler.pkl")
regressor  = joblib.load(f"{BASE}/best_regressor.pkl")
classifier = joblib.load(f"{BASE}/best_classifier.pkl")
le_city    = joblib.load(f"{BASE}/le_city.pkl")
le_bucket  = joblib.load(f"{BASE}/le_bucket.pkl")

with open(f"{BASE}/model_meta.json") as f:
    META = json.load(f)


FEATURE_COLS = META["feature_cols"]

# AQI color bands
def aqi_color(aqi: float) -> str:
    if aqi <= 50:   return "#00e400"
    if aqi <= 100:  return "#ffff00"
    if aqi <= 200:  return "#ff7e00"
    if aqi <= 300:  return "#ff0000"
    if aqi <= 400:  return "#8f3f97"
    return "#7e0023"

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="AQI Prediction API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ───────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    city: str
    pm25:    Optional[float] = None
    pm10:    Optional[float] = None
    no:      Optional[float] = None
    no2:     Optional[float] = None
    nox:     Optional[float] = None
    nh3:     Optional[float] = None
    co:      Optional[float] = None
    so2:     Optional[float] = None
    o3:      Optional[float] = None
    benzene: Optional[float] = None
    toluene: Optional[float] = None

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "AQI Prediction API is running 🌿"}

@app.get("/cities")
def cities():
    return {"cities": META["cities"]}

@app.get("/model-info")
def model_info():
    return META

@app.post("/predict")
def predict(req: PredictRequest):
    if req.city not in le_city.classes_:
        raise HTTPException(status_code=400, detail=f"Unknown city: {req.city}")

    city_enc = int(le_city.transform([req.city])[0])

    row = [
        req.pm25, req.pm10, req.no, req.no2, req.nox,
        req.nh3, req.co, req.so2, req.o3, req.benzene,
        req.toluene, city_enc
    ]

    X = np.array([row], dtype=float)
    X_imp = imputer.transform(X)
    X_sc  = scaler.transform(X_imp)

    aqi        = float(regressor.predict(X_sc)[0])
    risk_enc   = int(classifier.predict(X_sc)[0])
    risk_label = le_bucket.inverse_transform([risk_enc])[0]

    return {
        "city":       req.city,
        "aqi":        round(aqi, 1),
        "risk_level": risk_label,
        "color":      aqi_color(aqi),
        "health_advice": health_advice(risk_label),
    }

def health_advice(risk: str) -> str:
    advice = {
        "Good":         "Air quality is satisfactory. Enjoy outdoor activities!",
        "Satisfactory": "Air quality is acceptable. Unusually sensitive people should reduce prolonged outdoor exertion.",
        "Moderate":     "Members of sensitive groups may experience health effects. General public less likely to be affected.",
        "Poor":         "Everyone may begin to experience health effects. Sensitive groups should avoid outdoor exertion.",
        "Very Poor":    "Health warnings. Everyone should avoid prolonged outdoor exertion.",
        "Severe":       "Health alert! Everyone should avoid all outdoor activities. Wear N95 mask if going out.",
    }
    return advice.get(risk, "No advice available.")
