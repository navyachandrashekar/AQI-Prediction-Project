import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Trophy, TrendingUp, Target } from 'lucide-react';

const REG_RESULTS = {
  'Linear Regression':  { MAE: 31.16, RMSE: 59.44, R2: 0.8071 },
  'Ridge Regression':   { MAE: 31.16, RMSE: 59.44, R2: 0.8071 },
  'Decision Tree':      { MAE: 25.12, RMSE: 50.95, R2: 0.8582 },
  'Random Forest':      { MAE: 20.74, RMSE: 40.81, R2: 0.9091 },
  'Gradient Boosting':  { MAE: 23.52, RMSE: 43.38, R2: 0.8972 },
  'XGBoost':            { MAE: 21.45, RMSE: 42.67, R2: 0.9006 },
  'LightGBM':           { MAE: 21.17, RMSE: 40.96, R2: 0.9084 },
};

const CLF_RESULTS = {
  'Logistic Regression': { Accuracy: 74.67, F1_Score: 0.7397 },
  'Decision Tree':       { Accuracy: 77.20, F1_Score: 0.7707 },
  'Random Forest':       { Accuracy: 80.93, F1_Score: 0.8076 },
  'Gradient Boosting':   { Accuracy: 80.00, F1_Score: 0.7984 },
  'XGBoost':             { Accuracy: 81.01, F1_Score: 0.8090 },
  'LightGBM':            { Accuracy: 81.59, F1_Score: 0.8151 },
  'SVM':                 { Accuracy: 77.55, F1_Score: 0.7678 },
};

const regColors = ['#64748b','#64748b','#60a5fa','#00d4ff','#7c3aed','#a78bfa','#34d399'];
const clfColors = ['#64748b','#60a5fa','#00d4ff','#7c3aed','#f59e0b','#34d399','#60a5fa'];

function BarRow({ label, value, max, color, suffix = '', isBest }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-4 group">
      <div className="text-sm text-slate-400 w-[180px] flex-shrink-0 text-right truncate">
        {label}
        {isBest && <span className="badge-best ml-2">BEST</span>}
      </div>
      <div className="bar-track flex-1">
        <motion.div
          className="bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: color }}
        />
      </div>
      <div className="text-sm font-mono text-slate-300 w-[65px]">{value}{suffix}</div>
    </div>
  );
}

export default function ComparisonPage() {
  const [tab, setTab] = useState('regression');

  return (
    <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h2 className="text-3xl font-black text-white tracking-tight">Model Comparison</h2>
        <p className="text-slate-400 text-base mt-2">Comparative analysis of 7 ML models on CPCB dataset (24,850 records)</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8"
      >
        {[
          { val: '24,850', label: 'Records', icon: BarChart3 },
          { val: '26', label: 'Cities', icon: Target },
          { val: '12', label: 'Features', icon: TrendingUp },
          { val: '90.9%', label: 'Best R²', icon: Trophy, color: '#34d399' },
          { val: '81.6%', label: 'Best Acc', icon: Trophy, color: '#34d399' },
        ].map(({ val, label, icon: Icon, color }) => (
          <div key={label} className="glass-card !p-5 text-center">
            <Icon size={20} className="mx-auto mb-2 text-slate-500" />
            <div className="text-2xl font-mono font-bold" style={{ color: color || '#00d4ff' }}>{val}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8">
        {['regression', 'classification'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 rounded-xl text-base font-medium transition-all border ${
              tab === t
                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                : 'text-slate-400 border-white/5 hover:border-white/10 hover:bg-white/5'
            }`}
          >
            {t === 'regression' ? '📈 Regression' : '🏷️ Classification'}
          </button>
        ))}
      </div>

      {tab === 'regression' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Table */}
          <div className="glass-card overflow-x-auto">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-6">📋 Regression Metrics</h3>
            <table className="comparison-table">
              <thead>
                <tr><th>Model</th><th>MAE ↓</th><th>RMSE ↓</th><th>R² ↑</th></tr>
              </thead>
              <tbody>
                {Object.entries(REG_RESULTS).map(([name, m]) => (
                  <tr key={name} className={name === 'Random Forest' ? 'best-row' : ''}>
                    <td>
                      {name}
                      {name === 'Random Forest' && <span className="badge-best">BEST</span>}
                    </td>
                    <td className="font-mono">{m.MAE}</td>
                    <td className="font-mono">{m.RMSE}</td>
                    <td className="font-mono" style={{ color: m.R2 > 0.9 ? '#34d399' : 'inherit' }}>{m.R2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bar Charts */}
          <div className="flex flex-col gap-6">
            <div className="glass-card">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">R² Score</h3>
              <div className="flex flex-col gap-3">
                {Object.entries(REG_RESULTS).map(([name, m], i) => (
                  <BarRow key={name} label={name} value={m.R2} max={1} color={regColors[i]} isBest={name === 'Random Forest'} />
                ))}
              </div>
            </div>
            <div className="glass-card">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">RMSE (lower = better)</h3>
              <div className="flex flex-col gap-3">
                {Object.entries(REG_RESULTS).map(([name, m], i) => (
                  <BarRow key={name} label={name} value={m.RMSE} max={70} color={regColors[i]} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'classification' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card overflow-x-auto">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-6">📋 Classification Metrics</h3>
            <table className="comparison-table">
              <thead>
                <tr><th>Model</th><th>Accuracy ↑</th><th>F1 Score ↑</th></tr>
              </thead>
              <tbody>
                {Object.entries(CLF_RESULTS).map(([name, m]) => (
                  <tr key={name} className={name === 'LightGBM' ? 'best-row' : ''}>
                    <td>
                      {name}
                      {name === 'LightGBM' && <span className="badge-best">BEST</span>}
                    </td>
                    <td className="font-mono" style={{ color: m.Accuracy > 80 ? '#34d399' : 'inherit' }}>{m.Accuracy}%</td>
                    <td className="font-mono">{m.F1_Score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-6">
            <div className="glass-card">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">Accuracy %</h3>
              <div className="flex flex-col gap-3">
                {Object.entries(CLF_RESULTS).map(([name, m], i) => (
                  <BarRow key={name} label={name} value={m.Accuracy} max={100} color={clfColors[i]} suffix="%" isBest={name === 'LightGBM'} />
                ))}
              </div>
            </div>
            <div className="glass-card">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">F1 Score</h3>
              <div className="flex flex-col gap-3">
                {Object.entries(CLF_RESULTS).map(([name, m], i) => (
                  <BarRow key={name} label={name} value={m.F1_Score} max={1} color={clfColors[i]} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Winner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card border-cyan-500/20 !border"
          style={{ boxShadow: '0 0 40px rgba(0,212,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={24} className="text-cyan-400" />
            <span className="text-sm font-bold text-slate-400 uppercase">Best Regressor</span>
          </div>
          <div className="text-2xl font-black text-cyan-400">Random Forest</div>
          <div className="text-sm text-slate-500 mt-2 font-mono">RMSE: 40.81 · MAE: 20.74 · R²: 0.9091</div>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
            Ensemble of 100 decision trees. Handles missing values and captures non-linear pollutant interactions.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card border-emerald-500/20 !border"
          style={{ boxShadow: '0 0 40px rgba(52,211,153,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={24} className="text-emerald-400" />
            <span className="text-sm font-bold text-slate-400 uppercase">Best Classifier</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">LightGBM</div>
          <div className="text-sm text-slate-500 mt-2 font-mono">Accuracy: 81.59% · F1: 0.8151</div>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
            Gradient boosted trees optimized for speed. Leaf-wise growth outperforms level-wise on this dataset.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
