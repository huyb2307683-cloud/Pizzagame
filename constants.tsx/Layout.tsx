
import React from 'react';
import { UserStats } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  stats: UserStats;
  onReset: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, stats, onReset }) => {
  const progress = (stats.xp % 200) / 200 * 100;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0f172a]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 glass z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
            🧠
          </div>
          <h1 className="text-xl font-bold gradient-text">MindQuest AI</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Cấp độ {stats.level}</span>
            <div className="w-32 h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <div className="flex items-center gap-1">
              <span className="text-amber-400">🔥</span>
              <span className="font-bold">{stats.streak}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-indigo-400">✨</span>
              <span className="font-bold">{stats.xp} XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;
