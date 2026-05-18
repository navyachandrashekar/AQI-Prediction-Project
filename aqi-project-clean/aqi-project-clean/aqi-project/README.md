# 🌿 AQI Predictor — Indian Cities
**Comparative ML Analysis for Air Quality Index Prediction**

A full-stack web application that compares 7+ ML models to predict AQI and classify health risk levels across 26 Indian cities.

---

## 📁 Project Structure

```
aqi-project/
├── data/
│   └── city_day.csv          ← Dataset (CPCB India)
├── ml/
│   └── train.py              ← Train all models
├── backend/
│   ├── main.py               ← FastAPI server
│   ├── requirements.txt      ← Python dependencies
│   └── *.pkl / model_meta.json  ← Generated after training
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── index.css
    │   ├── components/
    │   └── pages/
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Setup & Run

### Step 1 — Install Python dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2 — Train the models
```bash
cd ..
python ml/train.py
```
This saves `best_regressor.pkl`, `best_classifier.pkl`, `imputer.pkl`, `scaler.pkl`, `le_city.pkl`, `le_bucket.pkl`, and `model_meta.json` inside `backend/`.

### Step 3 — Start the backend API
```bash
cd backend
uvicorn main:app --reload --port 8000
```
API docs available at: http://localhost:8000/docs

### Step 4 — Start the frontend
```bash
cd frontend
npm install
npm run dev
```
Open: http://localhost:3000

---

## 🤖 Models Trained

### Regression (AQI Value Prediction)
| Model | MAE | RMSE | R² |
|---|---|---|---|
| Linear Regression | 31.16 | 59.44 | 0.807 |
| Ridge Regression | 31.16 | 59.44 | 0.807 |
| Decision Tree | 25.12 | 50.95 | 0.858 |
| **Random Forest** ⭐ | **20.74** | **40.81** | **0.909** |
| Gradient Boosting | 23.52 | 43.38 | 0.897 |
| XGBoost | 21.45 | 42.67 | 0.901 |
| LightGBM | 21.17 | 40.96 | 0.908 |

### Classification (Health Risk Level)
| Model | Accuracy | F1 Score |
|---|---|---|
| Logistic Regression | 74.67% | 0.7397 |
| Decision Tree | 77.20% | 0.7707 |
| Random Forest | 80.93% | 0.8076 |
| Gradient Boosting | 80.00% | 0.7984 |
| XGBoost | 81.01% | 0.8090 |
| **LightGBM** ⭐ | **81.59%** | **0.8151** |
| SVM | 77.55% | 0.7678 |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/cities` | List of 26 cities |
| GET | `/model-info` | Training results & metadata |
| POST | `/predict` | Predict AQI + health risk |

### Example POST /predict
```json
{
  "city": "Delhi",
  "pm25": 120,
  "pm10": 200,
  "no2": 45,
  "co": 2.1,
  "so2": 18,
  "o3": 35
}
```

### Response
```json
{
  "city": "Delhi",
  "aqi": 285.4,
  "risk_level": "Poor",
  "color": "#ff0000",
  "health_advice": "Everyone may begin to experience health effects..."
}
```

---

## 📊 Dataset

- **Source**: CPCB (Central Pollution Control Board), India
- **Records**: 29,531 total → 24,850 after cleaning
- **Cities**: 26 Indian cities
- **Period**: January 2015 – July 2020
- **Features**: PM2.5, PM10, NO, NO2, NOx, NH3, CO, SO2, O3, Benzene, Toluene, City

---

## 🚀 Deployment

### Backend (Render.com)
1. Push code to GitHub
2. Create new Web Service on Render
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment: Python 3.11

### Frontend (Vercel)
1. Push frontend folder to GitHub
2. Import project on Vercel
3. Set root directory to `frontend/`
4. Update API URL in `PredictPage.jsx` to your Render URL

---

## 👥 Tech Stack

- **ML**: Python, Scikit-learn, XGBoost, LightGBM
- **Backend**: FastAPI, Uvicorn, Joblib
- **Frontend**: React 18, Vite, Custom CSS
- **Data**: Pandas, NumPy, Scikit-learn preprocessing
