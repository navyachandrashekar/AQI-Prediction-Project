import { motion } from 'framer-motion';
import { Activity, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="hero-bg relative py-20 pb-12">
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: i % 3 === 0 ? '#00d4ff' : i % 3 === 1 ? '#7c3aed' : '#ff6b2b',
              animationDuration: `${8 + Math.random() * 12}s`,
              animationDelay: `${Math.random() * 8}s`,
              bottom: `-${Math.random() * 20}px`,
            }}
          />
        ))}
      </div>

      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Activity className="text-cyan-400" size={24} />
            <span className="text-sm font-mono text-cyan-400/70 tracking-widest uppercase">Real-time Analysis</span>
            <Sparkles className="text-purple-400" size={20} />
          </div>
          <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black text-white leading-tight tracking-tight">
            AI-Powered Air Quality
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Intelligence System
            </span>
          </h1>
          <p className="mt-10 text-slate-400 text-xl sm:text-2xl max-w-4xl mx-auto leading-relaxed">
            Advanced ML models analyzing pollution patterns across 26 Indian cities.
            Predict AQI, assess health risks, and get AI-powered environmental insights.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
