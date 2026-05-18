import { motion } from 'framer-motion';
import { HeartPulse, Shield, Shirt, CloudSun } from 'lucide-react';
import { getHealthDetails, getAqiLevel } from '../utils/aqiUtils';

const CARDS = [
  { key: 'impact',  icon: HeartPulse, label: 'Health Impact',       field: 'impact',  gradient: 'from-rose-500/20 to-transparent' },
  { key: 'safety',  icon: Shield,     label: 'Safety Advice',       field: 'safety',  gradient: 'from-cyan-500/20 to-transparent' },
  { key: 'mask',    icon: Shirt,      label: 'Mask Recommendation', field: 'mask',    gradient: 'from-amber-500/20 to-transparent' },
  { key: 'outdoor', icon: CloudSun,   label: 'Outdoor Warning',     field: 'outdoor', gradient: 'from-emerald-500/20 to-transparent' },
];

export default function HealthRiskCard({ result }) {
  if (!result) return null;
  const details = getHealthDetails(result.risk_level);
  const level = getAqiLevel(result.aqi);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card"
    >
      <div className="flex items-center gap-3 mb-6">
        <HeartPulse size={24} className="text-rose-400" />
        <h3 className="text-base font-bold text-slate-200 tracking-wide">Health Risk Assessment</h3>
        <span
          className="ml-auto text-xs font-bold px-3 py-1 rounded-full border"
          style={{ color: level.color, borderColor: `${level.color}40`, background: level.bg }}
        >
          {result.risk_level}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {CARDS.map(({ key, icon: Icon, label, field, gradient }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.35 }}
            className={`relative rounded-xl p-5 bg-gradient-to-br ${gradient} border border-white/5 hover:border-white/10 transition-all group`}
          >
            <Icon size={24} className="text-slate-400 group-hover:text-slate-300 transition-colors mb-3" />
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1.5">{label}</div>
            <div className="text-sm text-slate-300 leading-snug">{details[field]}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
