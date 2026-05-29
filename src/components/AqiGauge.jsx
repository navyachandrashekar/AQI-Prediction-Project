import { useEffect, useState } from 'react';
import { getAqiLevel } from '../utils/aqiUtils';

const RADIUS = 85;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC_DEGREES = 270;
const ARC_LENGTH = (ARC_DEGREES / 360) * CIRCUMFERENCE;

function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target && target !== 0) return;
    let raf;
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

export default function AqiGauge({ aqi = 0, size = 220 }) {
  const level = getAqiLevel(aqi);
  const displayVal = useCountUp(aqi);
  const ratio = Math.min(aqi / 500, 1);
  const offset = ARC_LENGTH * (1 - ratio);
  const viewBox = (RADIUS + STROKE) * 2;

  // Generate tick marks
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const angle = 135 + (ARC_DEGREES / 10) * i;
    const rad = (angle * Math.PI) / 180;
    const cx = RADIUS + STROKE;
    const cy = RADIUS + STROKE;
    const inner = RADIUS - 6;
    const outer = RADIUS + 2;
    ticks.push(
      <line
        key={i}
        x1={cx + inner * Math.cos(rad)}
        y1={cy + inner * Math.sin(rad)}
        x2={cx + outer * Math.cos(rad)}
        y2={cy + outer * Math.sin(rad)}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={i % 5 === 0 ? 2 : 1}
      />
    );
  }

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      {/* Glow behind gauge */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-1000"
        style={{ background: level.color }}
      />

      <svg width={size} height={size} viewBox={`0 0 ${viewBox} ${viewBox}`} className="relative z-10">
        {/* Background arc */}
        <circle
          className="gauge-bg"
          cx={RADIUS + STROKE}
          cy={RADIUS + STROKE}
          r={RADIUS}
          strokeWidth={STROKE}
          strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
          transform={`rotate(135 ${RADIUS + STROKE} ${RADIUS + STROKE})`}
        />
        {/* Filled arc */}
        <circle
          className="gauge-fill"
          cx={RADIUS + STROKE}
          cy={RADIUS + STROKE}
          r={RADIUS}
          strokeWidth={STROKE}
          stroke={level.color}
          strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
          strokeDashoffset={offset}
          transform={`rotate(135 ${RADIUS + STROKE} ${RADIUS + STROKE})`}
        />
        {/* Tick marks */}
        <g className="gauge-ticks">{ticks}</g>
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span
          className="font-mono font-black leading-none transition-colors duration-500"
          style={{ fontSize: size * 0.22, color: level.color }}
        >
          {displayVal}
        </span>
        <span className="text-[0.65rem] text-slate-500 uppercase tracking-widest mt-1 font-medium">AQI</span>
      </div>
    </div>
  );
}
