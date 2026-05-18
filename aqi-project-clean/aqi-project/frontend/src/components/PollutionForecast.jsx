import { motion } from 'framer-motion';
import { CloudRain } from 'lucide-react';
import { generateForecast } from '../utils/aqiUtils';

export default function PollutionForecast({ result }) {
  if (!result) return null;
  const forecast = generateForecast(result.aqi);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card"
    >
      <div className="flex items-center gap-2 mb-6">
        <CloudRain size={20} className="text-sky-400" />
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">7-Day AQI Forecast</h3>
        <span className="ml-auto text-[0.65rem] font-mono text-slate-600">PROJECTED</span>
      </div>
      <div className="grid grid-cols-7 gap-3">
        {forecast.map((day, i) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.07 }}
            className="flex flex-col items-center py-4 px-2 rounded-xl border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.02]"
          >
            <span className="text-xs text-slate-500 font-medium mb-3">{day.day}</span>
            <span className="text-xl sm:text-2xl font-mono font-bold" style={{ color: day.level.color }}>{day.aqi}</span>
            <span className="text-sm mt-1.5" style={{ color: day.level.color }}>{day.level.emoji}</span>
            <span className="text-[0.65rem] text-slate-600 mt-1">{day.level.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
