import { motion } from 'framer-motion';
import { Ruler } from 'lucide-react';
import { AQI_LEVELS } from '../utils/aqiUtils';

export default function AqiScaleRef({ currentAqi }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.55 }}
      className="glass-card"
    >
      <div className="flex items-center gap-2 mb-6">
        <Ruler size={20} className="text-amber-400" />
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">AQI Scale Reference</h3>
      </div>

      <div className="space-y-3">
        {AQI_LEVELS.map((level) => {
          const isActive = currentAqi != null && currentAqi <= level.max &&
            (AQI_LEVELS.indexOf(level) === 0 || currentAqi > AQI_LEVELS[AQI_LEVELS.indexOf(level) - 1].max);
          const range = AQI_LEVELS.indexOf(level) === 0
            ? `0–${level.max}`
            : `${AQI_LEVELS[AQI_LEVELS.indexOf(level) - 1].max + 1}–${level.max === 999 ? '500+' : level.max}`;

          return (
            <div
              key={level.label}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-white/[0.06] border border-white/10' : 'hover:bg-white/[0.02]'}`}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 transition-transform"
                style={{
                  background: level.color,
                  boxShadow: isActive ? `0 0 10px ${level.color}60` : 'none',
                  transform: isActive ? 'scale(1.3)' : 'scale(1)',
                }}
              />
              <span className="text-sm font-semibold text-slate-300 flex-1">{level.label}</span>
              <span className="text-xs font-mono text-slate-500">{range}</span>
              {isActive && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: level.color, background: level.bg }}>
                  CURRENT
                </span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
