import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Heart, Factory, TreePine, ShieldAlert, ShieldCheck, Brain } from 'lucide-react';
import { generateInsights } from '../utils/aqiUtils';

const ICON_MAP = { AlertTriangle, Heart, Factory, TreePine, ShieldAlert, ShieldCheck };

function useTypewriter(text, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!text) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { setDone(true); clearInterval(interval); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return { displayed, done };
}

function InsightCard({ insight, index }) {
  const Icon = ICON_MAP[insight.icon] || AlertTriangle;
  const { displayed, done } = useTypewriter(insight.text, 12);
  const typeClass = `insight-${insight.type}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4 }}
      className={`${typeClass} pl-5 py-4 pr-5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon size={18} className="text-cyan-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-slate-300 uppercase tracking-wide">{insight.title}</span>
      </div>
      <p className="text-base text-slate-400 leading-relaxed">
        {displayed}
        {!done && <span className="typewriter-cursor" />}
      </p>
    </motion.div>
  );
}

export default function AiInsightsPanel({ result, form }) {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    if (result && form) {
      setInsights(generateInsights(result, form));
    }
  }, [result, form]);

  if (!insights.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card"
    >
      <div className="flex items-center gap-3 mb-6">
        <Brain size={24} className="text-purple-400" />
        <h3 className="text-base font-bold text-slate-200 tracking-wide">AI Insights</h3>
        <span className="ml-auto text-xs font-mono text-cyan-400/60 px-3 py-1 rounded-full border border-cyan-400/20 bg-cyan-400/5">
          LIVE ANALYSIS
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {insights.map((insight, i) => (
          <InsightCard key={insight.title} insight={insight} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
