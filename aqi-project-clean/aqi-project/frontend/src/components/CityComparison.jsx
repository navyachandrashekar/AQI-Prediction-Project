import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitCompareArrows, Brain, CheckCircle2, AlertTriangle, HeartPulse, Trophy } from 'lucide-react';
import AqiGauge from './AqiGauge';
import { CITIES, CITY_DEFAULTS, getAqiLevel, getHealthDetails } from '../utils/aqiUtils';

const API = 'http://127.0.0.1:8000';

export default function CityComparison() {
  const [cityA, setCityA] = useState('');
  const [cityB, setCityB] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const predict = async (city) => {
    const defaults = CITY_DEFAULTS[city] || CITY_DEFAULTS[CITIES[0]];
    const body = { city, ...defaults };
    const res = await fetch(`${API}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('API error');
    return res.json();
  };

  useEffect(() => {
    let mounted = true;
    const fetchComparison = async () => {
      if (!cityA || !cityB) {
        if (mounted) setResults(null);
        return;
      }
      setLoading(true);
      try {
        const [a, b] = await Promise.all([predict(cityA), predict(cityB)]);
        if (mounted) setResults({ a, b });
      } catch {
        if (mounted) setResults(null);
      }
      if (mounted) setLoading(false);
    };

    fetchComparison();

    return () => {
      mounted = false;
    };
  }, [cityA, cityB]);

  const renderSummary = () => {
    if (!results || !results.a || !results.b) return null;

    const rA = results.a;
    const rB = results.b;
    const levelA = getAqiLevel(rA.aqi);
    const levelB = getAqiLevel(rB.aqi);

    // If same city selected
    if (rA.city === rB.city) {
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-5 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-center text-slate-300 font-medium">Please select two different cities to view the comparison analysis.</div>
        </motion.div>
      );
    }

    // If perfectly tied
    if (rA.aqi === rB.aqi) {
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-5 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-center text-slate-300 font-medium">Both cities currently have identical AQI levels ({rA.aqi}).</div>
        </motion.div>
      );
    }

    const better = rA.aqi < rB.aqi ? { ...rA, level: levelA } : { ...rB, level: levelB };
    const worse  = rA.aqi < rB.aqi ? { ...rB, level: levelB } : { ...rA, level: levelA };

    const betterHealth = getHealthDetails(better.risk_level);
    const worseHealth = getHealthDetails(worse.risk_level);

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-rose-500" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Brain size={24} className="text-purple-400" />
          <h4 className="text-base font-bold text-slate-200">AI Comparison Analysis</h4>
        </div>

        {/* Verdict Title */}
        <div className="flex items-center gap-2 mb-5">
          <CheckCircle2 size={20} className="text-emerald-400" />
          <p className="text-lg text-slate-200">
            <span className="font-bold text-emerald-400">{better.city}</span> has better air quality than <span className="font-bold text-rose-400">{worse.city}</span>.
          </p>
        </div>

        {/* Value Comparison */}
        <div className="grid grid-cols-2 gap-4 mb-6 bg-black/20 rounded-xl p-4 border border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">{better.city} AQI:</span>
            <span className="text-sm font-mono font-bold" style={{ color: better.level.color }}>
              {better.aqi} ({better.risk_level})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">{worse.city} AQI:</span>
            <span className="text-sm font-mono font-bold" style={{ color: worse.level.color }}>
              {worse.aqi} ({worse.risk_level})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Analysis */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-400 uppercase tracking-wide">
              <AlertTriangle size={16} /> Analysis
            </div>
            <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5 marker:text-slate-600">
              <li><strong className="text-slate-300">{worse.city}</strong> currently has significantly higher pollution levels.</li>
              <li>Increased particulate matter and traffic emissions are likely contributing factors in {worse.city}.</li>
              <li><strong className="text-slate-300">{better.city}</strong> offers comparatively healthier outdoor conditions.</li>
            </ul>
          </div>

          {/* Health Recommendation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-rose-400 uppercase tracking-wide">
              <HeartPulse size={16} /> Health Recommendation
            </div>
            <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5 marker:text-slate-600">
              <li>In <strong className="text-slate-300">{better.city}</strong>: {betterHealth.outdoor}.</li>
              <li>In <strong className="text-slate-300">{worse.city}</strong>: {worseHealth.outdoor}.</li>
              {worse.aqi > 100 && <li>Sensitive individuals in {worse.city} should use masks outdoors.</li>}
            </ul>
          </div>
        </div>

        {/* Final Verdict Badge */}
        <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-3">
          <Trophy size={20} className="text-amber-400" />
          <span className="text-sm text-slate-300">
            <strong className="text-emerald-400">{better.city}</strong> is currently the cleaner and healthier city between the two.
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card mt-8"
    >
      <div className="flex items-center gap-2 mb-6">
        <GitCompareArrows size={20} className="text-orange-400" />
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">City Comparison</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 relative">
        <select className="form-select-dark flex-1" value={cityA} onChange={e => setCityA(e.target.value)}>
          <option value="" disabled>Select first city</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-slate-600 font-bold text-sm mx-2">VS</span>
        <select className="form-select-dark flex-1" value={cityB} onChange={e => setCityB(e.target.value)}>
          <option value="" disabled>Select second city</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {loading && (
          <div className="absolute -top-6 right-0 text-xs font-bold text-cyan-400 animate-pulse tracking-wide uppercase">
            Updating Analysis...
          </div>
        )}
      </div>

      {!results && !loading && (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-white/5 bg-white/[0.02]">
          <GitCompareArrows size={32} className="text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium">Select two cities above to view the AI comparison.</p>
        </div>
      )}

      {results && (
        <div className="grid grid-cols-2 gap-8">
          {[results.a, results.b].map((r, idx) => {
            const level = getAqiLevel(r.aqi);
            return (
              <motion.div
                key={`${r.city}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6 rounded-xl border border-white/5 bg-white/[0.02]"
              >
                <span className="text-sm text-slate-400 mb-4 font-medium">📍 {r.city}</span>
                <AqiGauge aqi={r.aqi} size={200} />
                <div
                  className="mt-5 px-4 py-1.5 rounded-full text-sm font-bold border"
                  style={{ color: level.color, borderColor: `${level.color}40`, background: level.bg }}
                >
                  {r.risk_level}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {renderSummary()}
    </motion.div>
  );
}
