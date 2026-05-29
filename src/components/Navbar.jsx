import { Wind, BarChart3, Info } from 'lucide-react';

export default function Navbar({ page, setPage }) {
  const links = [
    { id: 'dashboard',  label: 'Dashboard',        icon: Wind },
    { id: 'comparison', label: 'Model Comparison',  icon: BarChart3 },
    { id: 'about',      label: 'About',             icon: Info },
  ];
  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between h-24">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-cyan-500/20">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold text-cyan-400 tracking-tight leading-tight">AQI Intelligence</h1>
            <span className="text-xs text-slate-500 font-mono tracking-wide">AI-POWERED · INDIA</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-1.5">
          {links.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-medium transition-all duration-200
                ${page === id
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/10 hover:bg-white/5'}
              `}
            >
              <Icon size={20} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
