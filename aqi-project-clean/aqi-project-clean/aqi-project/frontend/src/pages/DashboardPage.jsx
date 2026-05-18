import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, MapPin, FlaskConical } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import AqiResultPanel from '../components/AqiResultPanel';
import AiInsightsPanel from '../components/AiInsightsPanel';
import HealthRiskCard from '../components/HealthRiskCard';
import PollutantCharts from '../components/PollutantCharts';
import PollutionForecast from '../components/PollutionForecast';
import AqiScaleRef from '../components/AqiScaleRef';
import CityComparison from '../components/CityComparison';
import { CITIES, CITY_DEFAULTS, POLLUTANT_FIELDS, getAqiLevel } from '../utils/aqiUtils';

const API = 'http://127.0.0.1:8000';

export default function DashboardPage() {
  const [city, setCity] = useState('Delhi');
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key, val) =>
    setForm(f => ({ ...f, [key]: val === '' ? '' : parseFloat(val) }));

  const quickFill = () => setForm(CITY_DEFAULTS[city] || CITY_DEFAULTS['Delhi']);

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const body = { city };
      POLLUTANT_FIELDS.forEach(({ key }) => {
        if (form[key] !== '' && form[key] !== undefined) body[key] = form[key];
      });
      const res = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'API error');
      setResult(await res.json());
    } catch (e) {
      setError(e.message || 'Could not connect to backend.');
    }
    setLoading(false);
  };

  const level = result ? getAqiLevel(result.aqi) : null;

  return (
    <div className="relative min-h-screen">
      {/* Dynamic background glow */}
      {result && (
        <div
          className="aqi-bg-glow"
          style={{
            background: `radial-gradient(ellipse 800px 600px at 50% 20%, ${level.color}06, transparent 70%)`,
          }}
        />
      )}

      {/* Hero */}
      <HeroSection />

      {/* Main Dashboard Content */}
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 pb-20 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ── Left Column: Input Panel ──────────────────────────── */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card neon-glow"
            >
              {/* City Selector */}
              <div className="flex items-center gap-2 mb-5">
                <MapPin size={20} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Select City</h3>
              </div>
              <select
                className="form-select-dark mb-4"
                value={city}
                onChange={e => setCity(e.target.value)}
              >
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <button
                onClick={quickFill}
                className="w-full text-sm text-cyan-400 border border-cyan-400/20 rounded-lg py-2.5 px-3 hover:bg-cyan-400/5 transition-all font-medium mb-6"
              >
                <Zap size={14} className="inline mr-2" />
                Auto-fill typical values for {city}
              </button>

              {/* Pollutant Inputs */}
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical size={18} className="text-purple-400" />
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Pollutants</h3>
                <span className="text-xs text-slate-600 ml-auto">blank = auto-impute</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {POLLUTANT_FIELDS.map(({ key, label, unit, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1 block">
                      {label} <span className="text-slate-600">{unit}</span>
                    </label>
                    <input
                      type="number"
                      className="form-input-dark"
                      placeholder={placeholder}
                      value={form[key] ?? ''}
                      onChange={e => handleChange(key, e.target.value)}
                      step="any"
                      min="0"
                    />
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="mt-6">
                <button className="btn-neon" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles size={20} />
                      Analyze AQI & Health Risk
                    </span>
                  )}
                </button>
              </div>
              {error && <p className="text-rose-400 text-sm mt-3 text-center">{error}</p>}
            </motion.div>
          </div>

          {/* ── Right Column: Results ─────────────────────────────── */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {result ? (
                <AqiResultPanel key="result" result={result} />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card flex flex-col items-center justify-center min-h-[440px] text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center mb-6 animate-pulse">
                    <Sparkles size={40} className="text-cyan-400/40" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-400 mb-2">Ready for Analysis</h3>
                  <p className="text-sm text-slate-600 max-w-[280px]">
                    Fill in pollutant values and click Analyze, or use Auto-fill for typical city readings.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Full-width sections (shown after prediction) ────────── */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Insights + Health */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
                <AiInsightsPanel result={result} form={form} />
                <HealthRiskCard result={result} />
              </div>

              {/* Charts */}
              <div className="mt-12">
                <PollutantCharts form={form} result={result} />
              </div>

              {/* Forecast + Scale */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
                <PollutionForecast result={result} />
                <AqiScaleRef currentAqi={result.aqi} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* City Comparison (Always visible) */}
        <div className="mt-16">
          <CityComparison />
        </div>
      </div>
    </div>
  );
}
