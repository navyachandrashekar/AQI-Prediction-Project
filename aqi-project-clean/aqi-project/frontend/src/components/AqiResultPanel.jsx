import { motion } from 'framer-motion';
import AqiGauge from './AqiGauge';
import { getAqiLevel, AQI_LEVELS } from '../utils/aqiUtils';

export default function AqiResultPanel({ result }) {
  if (!result) return null;
  const level = getAqiLevel(result.aqi);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-card glow-dynamic relative overflow-hidden"
      style={{ boxShadow: `0 0 30px ${level.color}20, 0 0 80px ${level.color}08` }}
    >
      {/* Subtle gradient bg */}
      <div
        className="absolute inset-0 rounded-2xl opacity-[0.04] transition-all duration-1000"
        style={{ background: `radial-gradient(circle at 50% 30%, ${level.color}, transparent 70%)` }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* City label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono text-slate-500 tracking-wide">📍 {result.city}</span>
        </div>

        {/* Gauge */}
        <AqiGauge aqi={result.aqi} size={280} />

        {/* Category badge */}
        <div
          className="mt-6 px-6 py-2 rounded-full text-base font-bold tracking-wide border transition-all duration-500"
          style={{
            color: level.color,
            borderColor: `${level.color}40`,
            background: level.bg,
          }}
        >
          {level.emoji} {result.risk_level}
        </div>

        {/* Health advice */}
        <p className="mt-4 text-sm text-slate-400 text-center leading-relaxed max-w-[320px]">
          {result.health_advice}
        </p>

        {/* Mini scale */}
        <div className="mt-8 w-full flex rounded-xl overflow-hidden">
          {AQI_LEVELS.map((seg) => (
            <div
              key={seg.label}
              className="flex-1 py-2 text-center transition-all duration-300"
              style={{
                background: result.risk_level === seg.label ? `${seg.color}30` : `${seg.color}10`,
                borderBottom: result.risk_level === seg.label ? `3px solid ${seg.color}` : '3px solid transparent',
              }}
            >
              <div className="text-[0.65rem] font-bold uppercase" style={{ color: seg.color }}>{seg.label.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
