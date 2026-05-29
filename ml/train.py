"""
AQI ML Training Script
Trains regression + classification models and saves results
"""
import pandas as pd
import numpy as np
import joblib, json, os, warnings
warnings.filterwarnings("ignore")

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (mean_absolute_error, mean_squared_error, r2_score,
                             accuracy_score, f1_score, classification_report)

from sklearn.linear_model import LinearRegression, LogisticRegression, Ridge
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.ensemble import (RandomForestRegressor, RandomForestClassifier,
                               GradientBoostingRegressor, GradientBoostingClassifier)
from sklearn.svm import SVR, SVC
from xgboost import XGBRegressor, XGBClassifier
from lightgbm import LGBMRegressor, LGBMClassifier

OUT = os.path.join(os.path.dirname(__file__), "..", "backend")
os.makedirs(OUT, exist_ok=True)

# ── 1. Load & Clean ─────────────────────────────────────────────────────────
print("Loading data...")
df = pd.read_csv(os.path.join(os.path.dirname(__file__), "..", "data", "city_day.csv"))

# Drop rows without target
df = df.dropna(subset=["AQI", "AQI_Bucket"])

# Drop Xylene (61% missing) and Date
df = df.drop(columns=["Xylene", "Date"])

# Encode City
le_city = LabelEncoder()
df["City_enc"] = le_city.fit_transform(df["City"])

FEATURE_COLS = ["PM2.5", "PM10", "NO", "NO2", "NOx", "NH3",
                "CO", "SO2", "O3", "Benzene", "Toluene", "City_enc"]

# Encode classification label
le_bucket = LabelEncoder()
df["Risk_enc"] = le_bucket.fit_transform(df["AQI_Bucket"])

print(f"Dataset shape after cleaning: {df.shape}")
print(f"Cities: {le_city.classes_.tolist()}")
print(f"Risk levels: {le_bucket.classes_.tolist()}")

X = df[FEATURE_COLS]
y_reg = df["AQI"]
y_clf = df["Risk_enc"]

X_train, X_test, yr_train, yr_test, yc_train, yc_test = train_test_split(
    X, y_reg, y_clf, test_size=0.2, random_state=42)

# Imputer + Scaler (saved for inference)
imputer = SimpleImputer(strategy="median")
scaler  = StandardScaler()

X_train_imp = imputer.fit_transform(X_train)
X_test_imp  = imputer.transform(X_test)
X_train_sc  = scaler.fit_transform(X_train_imp)
X_test_sc   = scaler.transform(X_test_imp)

# ── 2. Regression Models ─────────────────────────────────────────────────────
print("\n--- Training Regression Models ---")
reg_models = {
    "Linear Regression":        LinearRegression(),
    "Ridge Regression":         Ridge(alpha=1.0),
    "Decision Tree":            DecisionTreeRegressor(max_depth=10, random_state=42),
    "Random Forest":            RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1),
    "Gradient Boosting":        GradientBoostingRegressor(n_estimators=100, random_state=42),
    "XGBoost":                  XGBRegressor(n_estimators=100, random_state=42, verbosity=0),
    "LightGBM":                 LGBMRegressor(n_estimators=100, random_state=42, verbose=-1),
}

reg_results = {}
best_reg_score = float("inf")
best_reg_model = None
best_reg_name  = ""

for name, model in reg_models.items():
    print(f"  Training {name}...")
    model.fit(X_train_sc, yr_train)
    preds = model.predict(X_test_sc)
    mae  = mean_absolute_error(yr_test, preds)
    rmse = np.sqrt(mean_squared_error(yr_test, preds))
    r2   = r2_score(yr_test, preds)
    reg_results[name] = {"MAE": round(mae,2), "RMSE": round(rmse,2), "R2": round(r2,4)}
    print(f"    MAE={mae:.2f}  RMSE={rmse:.2f}  R²={r2:.4f}")
    if rmse < best_reg_score:
        best_reg_score = rmse
        best_reg_model = model
        best_reg_name  = name

print(f"\n✅ Best Regressor: {best_reg_name} (RMSE={best_reg_score:.2f})")

# ── 3. Classification Models ──────────────────────────────────────────────────
print("\n--- Training Classification Models ---")
clf_models = {
    "Logistic Regression":      LogisticRegression(max_iter=500, random_state=42),
    "Decision Tree":            DecisionTreeClassifier(max_depth=10, random_state=42),
    "Random Forest":            RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
    "Gradient Boosting":        GradientBoostingClassifier(n_estimators=100, random_state=42),
    "XGBoost":                  XGBClassifier(n_estimators=100, random_state=42, verbosity=0, use_label_encoder=False, eval_metric="mlogloss"),
    "LightGBM":                 LGBMClassifier(n_estimators=100, random_state=42, verbose=-1),
    "SVM":                      SVC(kernel="rbf", random_state=42, probability=True),
}

clf_results = {}
best_clf_score = 0
best_clf_model = None
best_clf_name  = ""

for name, model in clf_models.items():
    print(f"  Training {name}...")
    model.fit(X_train_sc, yc_train)
    preds = model.predict(X_test_sc)
    acc = accuracy_score(yc_test, preds)
    f1  = f1_score(yc_test, preds, average="weighted")
    clf_results[name] = {"Accuracy": round(acc*100,2), "F1_Score": round(f1,4)}
    print(f"    Accuracy={acc*100:.2f}%  F1={f1:.4f}")
    if acc > best_clf_score:
        best_clf_score = acc
        best_clf_model = model
        best_clf_name  = name

print(f"\n✅ Best Classifier: {best_clf_name} (Accuracy={best_clf_score*100:.2f}%)")

# ── 4. Save Models & Artifacts ───────────────────────────────────────────────
print("\nSaving models & artifacts...")
joblib.dump(best_reg_model, f"{OUT}/best_regressor.pkl")
joblib.dump(best_clf_model, f"{OUT}/best_classifier.pkl")
joblib.dump(imputer,        f"{OUT}/imputer.pkl")
joblib.dump(scaler,         f"{OUT}/scaler.pkl")
joblib.dump(le_city,        f"{OUT}/le_city.pkl")
joblib.dump(le_bucket,      f"{OUT}/le_bucket.pkl")

meta = {
    "feature_cols":     FEATURE_COLS,
    "cities":           le_city.classes_.tolist(),
    "risk_levels":      le_bucket.classes_.tolist(),
    "best_regressor":   best_reg_name,
    "best_classifier":  best_clf_name,
    "reg_results":      reg_results,
    "clf_results":      clf_results,
}
with open(f"{OUT}/model_meta.json", "w") as f:
    json.dump(meta, f, indent=2)

print("\n🎉 Training complete! All files saved to backend/")
print(json.dumps({"reg_results": reg_results, "clf_results": clf_results}, indent=2))
