/* ── AQI Level Definitions ─────────────────────────────────────────────── */
export const AQI_LEVELS = [
  { max: 50,  label: 'Good',         color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  emoji: '😊', hue: 142 },
  { max: 100, label: 'Satisfactory', color: '#a3e635', bg: 'rgba(163,230,53,0.12)', emoji: '🙂', hue: 82  },
  { max: 200, label: 'Moderate',     color: '#facc15', bg: 'rgba(250,204,21,0.12)', emoji: '😐', hue: 48  },
  { max: 300, label: 'Poor',         color: '#f97316', bg: 'rgba(249,115,22,0.12)', emoji: '😷', hue: 25  },
  { max: 400, label: 'Very Poor',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  emoji: '🤢', hue: 0   },
  { max: 999, label: 'Severe',       color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', emoji: '☠️', hue: 263 },
];

export function getAqiLevel(aqi) {
  return AQI_LEVELS.find(l => aqi <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
}

export function getAqiColor(aqi) {
  return getAqiLevel(aqi).color;
}

/* ── Pollutant Thresholds (NAAQS India) ───────────────────────────────── */
const POLLUTANT_META = {
  pm25:    { name: 'PM2.5',   unit: 'µg/m³', safe: 40,  source: 'Vehicle exhaust, construction dust, biomass burning' },
  pm10:    { name: 'PM10',    unit: 'µg/m³', safe: 60,  source: 'Road dust, industrial emissions, pollen' },
  no:      { name: 'NO',      unit: 'µg/m³', safe: 30,  source: 'Vehicle engines, thermal power plants' },
  no2:     { name: 'NO₂',     unit: 'µg/m³', safe: 40,  source: 'Traffic emissions, industrial processes' },
  nox:     { name: 'NOx',     unit: 'µg/m³', safe: 50,  source: 'Fossil fuel combustion' },
  nh3:     { name: 'NH₃',     unit: 'µg/m³', safe: 20,  source: 'Agricultural fertilizers, livestock' },
  co:      { name: 'CO',      unit: 'mg/m³', safe: 2,   source: 'Incomplete combustion, vehicle exhaust' },
  so2:     { name: 'SO₂',     unit: 'µg/m³', safe: 20,  source: 'Coal burning, industrial refineries' },
  o3:      { name: 'O₃',      unit: 'µg/m³', safe: 50,  source: 'Photochemical reactions, sunlight + NOx' },
  benzene: { name: 'Benzene', unit: 'µg/m³', safe: 5,   source: 'Petrol pumps, industrial solvents' },
  toluene: { name: 'Toluene', unit: 'µg/m³', safe: 10,  source: 'Paint, adhesives, petrochemical industry' },
};

export { POLLUTANT_META };

/* ── Insight Generator ────────────────────────────────────────────────── */
export function generateInsights(result, formData) {
  const level = getAqiLevel(result.aqi);
  const entries = Object.entries(formData).filter(([, v]) => v != null && v !== '');
  const insights = [];

  // 1 — Dominant pollutant
  let dominant = null;
  let worstRatio = 0;
  entries.forEach(([key, val]) => {
    const meta = POLLUTANT_META[key];
    if (!meta) return;
    const ratio = val / meta.safe;
    if (ratio > worstRatio) { worstRatio = ratio; dominant = { key, val, meta, ratio }; }
  });

  if (dominant) {
    const pct = Math.round((dominant.ratio - 1) * 100);
    insights.push({
      icon: 'AlertTriangle',
      title: 'Dominant Pollutant',
      text: pct > 0
        ? `${dominant.meta.name} is the primary concern at ${dominant.val} ${dominant.meta.unit}, exceeding safe limits by ${pct}%.`
        : `${dominant.meta.name} is the highest contributor at ${dominant.val} ${dominant.meta.unit}, but within safe limits.`,
      type: pct > 50 ? 'danger' : pct > 0 ? 'warning' : 'safe',
    });
  }

  // 2 — Health recommendation
  const healthMap = {
    Good:         'Air quality is excellent. All outdoor activities are safe for everyone.',
    Satisfactory: 'Air quality is acceptable. Sensitive individuals should take minor precautions.',
    Moderate:     'Sensitive groups may experience mild discomfort. Consider limiting prolonged outdoor exertion.',
    Poor:         'Everyone may experience health effects. Avoid prolonged outdoor activities and use air purifiers indoors.',
    'Very Poor':  'Serious health risk for all. Stay indoors, use N95 masks if going out, and run air purifiers.',
    Severe:       'EMERGENCY: Avoid all outdoor exposure. Seal windows, use air purifiers, and seek medical attention if symptomatic.',
  };
  insights.push({
    icon: 'Heart',
    title: 'Health Recommendation',
    text: healthMap[level.label] || 'Monitor air quality closely.',
    type: level.max <= 100 ? 'safe' : level.max <= 200 ? 'warning' : 'danger',
  });

  // 3 — Pollution source
  if (dominant) {
    insights.push({
      icon: 'Factory',
      title: 'Pollution Source Analysis',
      text: `Primary sources of ${dominant.meta.name}: ${dominant.meta.source}. Consider avoiding areas near these emission sources.`,
      type: 'info',
    });
  }

  // 4 — Outdoor activity
  const activityMap = {
    Good:         'Perfect for jogging, cycling, and all outdoor sports. Enjoy the fresh air! 🏃‍♂️',
    Satisfactory: 'Light outdoor activities are fine. Sensitive individuals should monitor for symptoms.',
    Moderate:     'Short outdoor walks are okay. Avoid strenuous exercise. Consider indoor alternatives.',
    Poor:         'Limit outdoor time to 30 minutes max. Use masks for commuting. Exercise indoors only.',
    'Very Poor':  'No outdoor exercise. Minimize all outdoor exposure. Work from home if possible.',
    Severe:       'Complete outdoor activity shutdown recommended. Schools should suspend outdoor events.',
  };
  insights.push({
    icon: 'TreePine',
    title: 'Outdoor Activity Advisory',
    text: activityMap[level.label] || 'Use caution outdoors.',
    type: level.max <= 100 ? 'safe' : level.max <= 200 ? 'warning' : 'danger',
  });

  // 5 — Risk alert
  if (result.aqi > 200) {
    insights.push({
      icon: 'ShieldAlert',
      title: 'Risk Alert',
      text: `AQI of ${result.aqi} puts this in the "${level.label}" category. Vulnerable populations (children, elderly, asthma patients) are at highest risk.`,
      type: 'danger',
    });
  } else {
    insights.push({
      icon: 'ShieldCheck',
      title: 'Risk Assessment',
      text: `AQI of ${result.aqi} is within the "${level.label}" range. General population faces low immediate health risk.`,
      type: 'safe',
    });
  }

  return insights;
}

/* ── Health risk details ──────────────────────────────────────────────── */
export function getHealthDetails(riskLevel) {
  const details = {
    Good:         { impact: 'No health impact',                    mask: 'Not required',         outdoor: 'All activities safe',          safety: 'Enjoy outdoor activities freely' },
    Satisfactory: { impact: 'Minor irritation for sensitive groups', mask: 'Optional for sensitive', outdoor: 'Mostly safe',                safety: 'Sensitive groups should stay aware' },
    Moderate:     { impact: 'Breathing discomfort for some',       mask: 'Recommended for sensitive', outdoor: 'Limit prolonged exposure',  safety: 'Carry a mask as precaution' },
    Poor:         { impact: 'Respiratory issues likely',           mask: 'N95 recommended',      outdoor: 'Avoid extended outdoor time',   safety: 'Use air purifiers indoors' },
    'Very Poor':  { impact: 'Serious respiratory distress',        mask: 'N95 mandatory outdoors', outdoor: 'Avoid outdoor activities',    safety: 'Seal windows, run purifiers' },
    Severe:       { impact: 'Health emergency for everyone',       mask: 'N95/N99 mandatory',    outdoor: 'Stay indoors at all times',    safety: 'Seek medical help if symptomatic' },
  };
  return details[riskLevel] || details['Moderate'];
}

/* ── Simulated forecast ───────────────────────────────────────────────── */
export function generateForecast(currentAqi) {
  const days = ['Today', 'Tomorrow'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  for (let i = 2; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    days.push(dayNames[d.getDay()]);
  }
  return days.map((day, i) => {
    const variation = (Math.sin(i * 1.2) * 0.25 + (Math.random() - 0.5) * 0.15);
    const aqi = Math.max(10, Math.round(currentAqi * (1 + variation)));
    return { day, aqi, level: getAqiLevel(aqi) };
  });
}

/* ── Simulated 24h trend ──────────────────────────────────────────────── */
export function generate24hTrend(currentAqi) {
  const data = [];
  for (let h = 0; h < 24; h++) {
    const label = `${h.toString().padStart(2, '0')}:00`;
    const variation = Math.sin((h - 6) * Math.PI / 12) * 0.3 + (Math.random() - 0.5) * 0.1;
    const aqi = Math.max(5, Math.round(currentAqi * (1 + variation)));
    data.push({ time: label, aqi });
  }
  return data;
}

/* ── Cities list ──────────────────────────────────────────────────────── */
export const CITIES = [
  'Ahmedabad','Aizawl','Amaravati','Amritsar','Bengaluru','Bhopal',
  'Brajrajnagar','Chandigarh','Chennai','Coimbatore','Delhi','Ernakulam',
  'Gurugram','Guwahati','Hyderabad','Jaipur','Jorapokhar','Kochi',
  'Kolkata','Lucknow','Mumbai','Patna','Shillong','Talcher',
  'Thiruvananthapuram','Visakhapatnam',
];

export const CITY_DEFAULTS = {
  Delhi:     { pm25: 120, pm10: 220, no: 18, no2: 50, nox: 68, nh3: 22, co: 2.1, so2: 18, o3: 35, benzene: 5.2, toluene: 12 },
  Mumbai:    { pm25: 55,  pm10: 95,  no: 8,  no2: 30, nox: 38, nh3: 10, co: 1.1, so2: 10, o3: 45, benzene: 2.5, toluene: 6 },
  Bengaluru: { pm25: 45,  pm10: 75,  no: 5,  no2: 22, nox: 27, nh3: 7,  co: 0.9, so2: 8,  o3: 40, benzene: 1.8, toluene: 5 },
  Chennai:   { pm25: 50,  pm10: 80,  no: 7,  no2: 25, nox: 32, nh3: 9,  co: 1.0, so2: 9,  o3: 42, benzene: 2.1, toluene: 5.5 },
  Kolkata:   { pm25: 90,  pm10: 160, no: 14, no2: 42, nox: 56, nh3: 18, co: 1.8, so2: 15, o3: 30, benzene: 4.0, toluene: 10 },
  Lucknow:   { pm25: 110, pm10: 190, no: 16, no2: 48, nox: 64, nh3: 20, co: 1.9, so2: 16, o3: 32, benzene: 4.8, toluene: 11 },
  Patna:     { pm25: 100, pm10: 180, no: 15, no2: 45, nox: 60, nh3: 19, co: 1.7, so2: 14, o3: 28, benzene: 4.5, toluene: 9 },
};

export const POLLUTANT_FIELDS = [
  { key: 'pm25',    label: 'PM2.5',   unit: 'µg/m³', placeholder: '60' },
  { key: 'pm10',    label: 'PM10',    unit: 'µg/m³', placeholder: '100' },
  { key: 'no',      label: 'NO',      unit: 'µg/m³', placeholder: '5' },
  { key: 'no2',     label: 'NO₂',     unit: 'µg/m³', placeholder: '25' },
  { key: 'nox',     label: 'NOx',     unit: 'µg/m³', placeholder: '30' },
  { key: 'nh3',     label: 'NH₃',     unit: 'µg/m³', placeholder: '10' },
  { key: 'co',      label: 'CO',      unit: 'mg/m³', placeholder: '1.2' },
  { key: 'so2',     label: 'SO₂',     unit: 'µg/m³', placeholder: '15' },
  { key: 'o3',      label: 'O₃',      unit: 'µg/m³', placeholder: '40' },
  { key: 'benzene', label: 'Benzene', unit: 'µg/m³', placeholder: '3' },
  { key: 'toluene', label: 'Toluene', unit: 'µg/m³', placeholder: '8' },
];
