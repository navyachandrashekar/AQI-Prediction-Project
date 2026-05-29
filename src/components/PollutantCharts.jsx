import { motion } from 'framer-motion';
import { BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line, Area, AreaChart,
} from 'recharts';
import { POLLUTANT_META, generate24hTrend } from '../utils/aqiUtils';

const NEON_COLORS = ['#00d4ff', '#7c3aed', '#22c55e', '#f97316', '#ef4444', '#a3e635', '#06b6d4', '#facc15', '#ec4899', '#14b8a6', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#00d4ff' }} className="font-mono font-semibold">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function PollutantCharts({ form, result }) {
  if (!result) return null;

  // Bar chart data
  const barData = Object.entries(form)
    .filter(([, v]) => v != null && v !== '')
    .map(([key, value]) => ({
      name: POLLUTANT_META[key]?.name || key,
      value: Number(value),
      safe: POLLUTANT_META[key]?.safe || 0,
    }));

  // Pie chart data
  const total = barData.reduce((s, d) => s + d.value, 0) || 1;
  const pieData = barData.map(d => ({ name: d.name, value: Math.round((d.value / total) * 100) }));

  // Line chart data (simulated 24h)
  const trendData = generate24hTrend(result.aqi);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart */}
        <div className="glass-card lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Pollutant Levels</h3>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={18}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={NEON_COLORS[i % NEON_COLORS.length]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart — 24h Trend */}
        <div className="glass-card lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">24h AQI Trend</h3>
            <span className="ml-auto text-[0.65rem] font-mono text-slate-600">SIMULATED</span>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <defs>
                <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="aqi" stroke="#00d4ff" strokeWidth={2} fill="url(#aqiGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="glass-card lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon size={20} className="text-purple-400" />
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Contribution %</h3>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={NEON_COLORS[i % NEON_COLORS.length]} fillOpacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: NEON_COLORS[i % NEON_COLORS.length] }} />
                <span className="text-xs text-slate-500">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
