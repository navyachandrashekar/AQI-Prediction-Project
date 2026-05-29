import { motion } from 'framer-motion';
import { Target, Database, Cpu, FlaskConical, MapPin, Layers } from 'lucide-react';

const FEATURES = [
  ['PM2.5', 'Fine particulate matter'],  ['PM10',  'Coarse particulate matter'],
  ['NO',    'Nitric oxide'],             ['NO₂',   'Nitrogen dioxide'],
  ['NOx',   'Nitrogen oxides'],          ['NH₃',   'Ammonia'],
  ['CO',    'Carbon monoxide'],          ['SO₂',   'Sulphur dioxide'],
  ['O₃',    'Ozone'],                    ['Benzene','Volatile organic compound'],
  ['Toluene','Volatile organic compound'],['City',  'Label encoded'],
];

const CITIES_LIST = [
  'Ahmedabad','Aizawl','Amaravati','Amritsar','Bengaluru','Bhopal',
  'Brajrajnagar','Chandigarh','Chennai','Coimbatore','Delhi','Ernakulam',
  'Gurugram','Guwahati','Hyderabad','Jaipur','Jorapokhar','Kochi',
  'Kolkata','Lucknow','Mumbai','Patna','Shillong','Talcher',
  'Thiruvananthapuram','Visakhapatnam',
];

const fade = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.5 } });

export default function AboutPage() {
  return (
    <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
      <motion.div {...fade()} className="mb-10">
        <h2 className="text-3xl font-black text-white tracking-tight">About This Project</h2>
        <p className="text-slate-400 text-base mt-2">Comparative ML analysis for AQI prediction across Indian cities</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <motion.div {...fade(0.1)} className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <Target size={20} className="text-cyan-400" />
              <h3 className="text-base font-bold text-cyan-400 uppercase tracking-wide">Objective</h3>
            </div>
            <p className="text-base text-slate-400 leading-relaxed">
              To comparatively analyze multiple machine learning models for predicting
              the Air Quality Index (AQI) and classifying health risk levels across
              26 major Indian cities using pollutant and environmental data.
            </p>
          </motion.div>

          <motion.div {...fade(0.2)} className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <Database size={20} className="text-purple-400" />
              <h3 className="text-base font-bold text-purple-400 uppercase tracking-wide">Dataset</h3>
            </div>
            <p className="text-base text-slate-400 leading-relaxed">
              Source: Central Pollution Control Board (CPCB), India — via Kaggle.
              Covers daily AQI readings from January 2015 to July 2020 across 26 Indian cities,
              with 24,850 clean records after preprocessing.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[{ v: '29,531', l: 'Raw Records' }, { v: '24,850', l: 'After Cleaning' }, { v: '2015–2020', l: 'Time Period' }].map(s => (
                <div key={s.l} className="text-center py-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="text-lg font-mono font-bold text-cyan-400">{s.v}</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fade(0.3)} className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <FlaskConical size={20} className="text-amber-400" />
              <h3 className="text-base font-bold text-amber-400 uppercase tracking-wide">Features Used</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map(([feat, desc]) => (
                <div key={feat} className="rounded-lg bg-white/[0.03] border border-white/5 px-4 py-3">
                  <div className="text-sm font-mono font-semibold text-cyan-400">{feat}</div>
                  <div className="text-xs text-slate-500 mt-1">{desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <motion.div {...fade(0.15)} className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <Cpu size={20} className="text-emerald-400" />
              <h3 className="text-base font-bold text-emerald-400 uppercase tracking-wide">Tech Stack</h3>
            </div>
            <div className="space-y-4">
              {[
                { t: 'ML', d: 'Scikit-learn, XGBoost, LightGBM — 7 regression + 7 classification models' },
                { t: 'Backend', d: 'FastAPI (Python) — REST API serving model predictions' },
                { t: 'Frontend', d: 'React 18, Vite, Tailwind CSS, Framer Motion, Recharts' },
                { t: 'Preprocessing', d: 'Median imputation, Standard scaling, Label encoding' },
                { t: 'Evaluation', d: 'MAE, RMSE, R² (regression) · Accuracy, F1 (classification)' },
              ].map(({ t, d }) => (
                <div key={t} className="flex gap-3 items-start">
                  <span className="text-cyan-400 flex-shrink-0 text-sm mt-0.5">→</span>
                  <div>
                    <span className="text-sm font-semibold text-slate-300">{t}: </span>
                    <span className="text-sm text-slate-500">{d}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fade(0.25)} className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <Layers size={20} className="text-rose-400" />
              <h3 className="text-base font-bold text-rose-400 uppercase tracking-wide">Performance Summary</h3>
            </div>
            <div className="space-y-3">
              {[
                { model: 'Random Forest (Reg.)', metric: 'R² = 0.909', color: '#00d4ff' },
                { model: 'LightGBM (Clf.)',      metric: 'Acc = 81.6%', color: '#34d399' },
                { model: 'XGBoost (Reg.)',        metric: 'R² = 0.901', color: '#a78bfa' },
                { model: 'XGBoost (Clf.)',        metric: 'Acc = 81.0%', color: '#f59e0b' },
              ].map(({ model, metric, color }) => (
                <div key={model} className="flex justify-between items-center rounded-lg bg-white/[0.03] border border-white/5 px-4 py-3">
                  <span className="text-sm text-slate-300">{model}</span>
                  <span className="text-sm font-mono font-semibold" style={{ color }}>{metric}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fade(0.35)} className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <MapPin size={20} className="text-sky-400" />
              <h3 className="text-base font-bold text-sky-400 uppercase tracking-wide">Cities Covered (26)</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {CITIES_LIST.map(c => (
                <span key={c} className="text-xs text-slate-500 bg-white/[0.03] border border-white/5 rounded-md px-3 py-1.5">
                  {c}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
