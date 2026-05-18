import { useState } from "react";

const API = "http://127.0.0.1:8000";

const CITIES = [
  "Ahmedabad","Aizawl","Amaravati","Amritsar","Bengaluru","Bhopal",
  "Brajrajnagar","Chandigarh","Chennai","Coimbatore","Delhi","Ernakulam",
  "Gurugram","Guwahati","Hyderabad","Jaipur","Jorapokhar","Kochi",
  "Kolkata","Lucknow","Mumbai","Patna","Shillong","Talcher",
  "Thiruvananthapuram","Visakhapatnam"
];

const FIELDS = [
  { key: "pm25",    label: "PM2.5",   unit: "µg/m³", placeholder: "e.g. 60" },
  { key: "pm10",    label: "PM10",    unit: "µg/m³", placeholder: "e.g. 100" },
  { key: "no",      label: "NO",      unit: "µg/m³", placeholder: "e.g. 5" },
  { key: "no2",     label: "NO₂",     unit: "µg/m³", placeholder: "e.g. 25" },
  { key: "nox",     label: "NOx",     unit: "µg/m³", placeholder: "e.g. 30" },
  { key: "nh3",     label: "NH₃",     unit: "µg/m³", placeholder: "e.g. 10" },
  { key: "co",      label: "CO",      unit: "mg/m³", placeholder: "e.g. 1.2" },
  { key: "so2",     label: "SO₂",     unit: "µg/m³", placeholder: "e.g. 15" },
  { key: "o3",      label: "O₃",      unit: "µg/m³", placeholder: "e.g. 40" },
  { key: "benzene", label: "Benzene", unit: "µg/m³", placeholder: "e.g. 3" },
  { key: "toluene", label: "Toluene", unit: "µg/m³", placeholder: "e.g. 8" },
];

const RISK_COLORS = {
  Good:         "#22c55e",
  Satisfactory: "#a3e635",
  Moderate:     "#facc15",
  Poor:         "#f97316",
  "Very Poor":  "#ef4444",
  Severe:       "#7c3aed",
};

// City-specific typical values for quick fill
const CITY_DEFAULTS = {
  Delhi:     { pm25: 120, pm10: 220, no: 18, no2: 50, nox: 68, nh3: 22, co: 2.1, so2: 18, o3: 35, benzene: 5.2, toluene: 12 },
  Mumbai:    { pm25: 55,  pm10: 95,  no: 8,  no2: 30, nox: 38, nh3: 10, co: 1.1, so2: 10, o3: 45, benzene: 2.5, toluene: 6 },
  Bengaluru: { pm25: 45,  pm10: 75,  no: 5,  no2: 22, nox: 27, nh3: 7,  co: 0.9, so2: 8,  o3: 40, benzene: 1.8, toluene: 5 },
  Chennai:   { pm25: 50,  pm10: 80,  no: 7,  no2: 25, nox: 32, nh3: 9,  co: 1.0, so2: 9,  o3: 42, benzene: 2.1, toluene: 5.5 },
  Kolkata:   { pm25: 90,  pm10: 160, no: 14, no2: 42, nox: 56, nh3: 18, co: 1.8, so2: 15, o3: 30, benzene: 4.0, toluene: 10 },
};

export default function PredictPage() {
  const [city, setCity]     = useState("Delhi");
  const [form, setForm]     = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleChange = (key, val) =>
    setForm(f => ({ ...f, [key]: val === "" ? "" : parseFloat(val) }));

  const quickFill = () => {
    const defaults = CITY_DEFAULTS[city] || CITY_DEFAULTS["Delhi"];
    setForm(defaults);
  };

  const handleSubmit = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const body = { city };
      FIELDS.forEach(({ key }) => { if (form[key] !== "" && form[key] !== undefined) body[key] = form[key]; });
      const res  = await fetch(`${API}/predict`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "API error");
      setResult(await res.json());
    } catch (e) {
      setError(e.message || "Could not connect to backend. Make sure it's running on port 8000.");
    }
    setLoading(false);
  };

  const riskColor = result ? (RISK_COLORS[result.risk_level] || "#888") : "#00d4ff";

  return (
    <div>
      <div className="page-header">
        <h2>AQI Prediction</h2>
        <p>Enter pollutant levels for any Indian city to predict AQI and health risk category</p>
      </div>

      <div className="grid-2" style={{ gap: "1.5rem" }}>
        {/* Input Panel */}
        <div>
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div className="card-title">🏙️ Select City</div>
            <div className="form-group">
              <select className="form-select" value={city} onChange={e => setCity(e.target.value)}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button
              onClick={quickFill}
              style={{
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--accent)", borderRadius: "8px", padding: "0.5rem 1rem",
                cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit",
              }}
            >
              ⚡ Auto-fill typical values for {city}
            </button>
          </div>

          <div className="card">
            <div className="card-title">🧪 Pollutant Levels <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 400 }}>(leave blank to auto-impute)</span></div>
            <div className="grid-2" style={{ gap: "0.75rem" }}>
              {FIELDS.map(({ key, label, unit, placeholder }) => (
                <div className="form-group" key={key} style={{ marginBottom: 0 }}>
                  <label className="form-label">{label} <span style={{ color: "var(--muted)", fontSize: "0.7rem" }}>{unit}</span></label>
                  <input
                    type="number" className="form-input"
                    placeholder={placeholder}
                    value={form[key] ?? ""}
                    onChange={e => handleChange(key, e.target.value)}
                    step="any" min="0"
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1.25rem" }}>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "⏳ Predicting..." : "🔮 Predict AQI & Health Risk"}
              </button>
            </div>
            {error && <div className="error-msg">⚠️ {error}</div>}
          </div>
        </div>

        {/* Result Panel */}
        <div>
          {result ? (
            <div>
              <div
                className="result-panel"
                style={{ borderColor: riskColor, background: `${riskColor}12`, marginBottom: "1.25rem" }}
              >
                <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                  📍 {result.city}
                </div>
                <div className="aqi-number" style={{ color: riskColor }}>{result.aqi}</div>
                <div className="aqi-label">Air Quality Index</div>
                <div className="risk-badge" style={{ color: riskColor, border: `1px solid ${riskColor}` }}>
                  {result.risk_level}
                </div>
                <div className="health-advice">{result.health_advice}</div>
              </div>

              <div className="card">
                <div className="card-title">🌈 AQI Scale Reference</div>
                <div className="aqi-scale">
                  {[
                    { label: "Good", color: "#22c55e", range: "0–50" },
                    { label: "Satisf.", color: "#a3e635", range: "51–100" },
                    { label: "Moderate", color: "#facc15", range: "101–200" },
                    { label: "Poor", color: "#f97316", range: "201–300" },
                    { label: "V.Poor", color: "#ef4444", range: "301–400" },
                    { label: "Severe", color: "#7c3aed", range: "400+" },
                  ].map(seg => (
                    <div
                      key={seg.label}
                      className="scale-seg"
                      style={{
                        background: seg.color + "30",
                        color: seg.color,
                        border: result.risk_level === seg.label || result.risk_level === "Very Poor" && seg.label === "V.Poor"
                          ? `2px solid ${seg.color}` : "none",
                      }}
                    >
                      <div>{seg.label}</div>
                      <div style={{ fontSize: "0.62rem", opacity: 0.7 }}>{seg.range}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ marginTop: "1.25rem" }}>
                <div className="card-title">📋 Input Summary</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                  {FIELDS.map(({ key, label }) => (
                    form[key] !== undefined && form[key] !== "" ? (
                      <div key={key} style={{ background: "var(--surface)", borderRadius: "8px", padding: "0.5rem 0.75rem" }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{label}</div>
                        <div style={{ fontSize: "0.95rem", fontFamily: "JetBrains Mono", color: "var(--accent)" }}>{form[key]}</div>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem", minHeight: "300px" }}>
              <div style={{ fontSize: "3rem" }}>🌿</div>
              <div style={{ color: "var(--muted)", textAlign: "center" }}>
                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Ready to predict</div>
                <div style={{ fontSize: "0.85rem" }}>Fill in pollutant values and click Predict<br/>or use Auto-fill for typical city values</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
