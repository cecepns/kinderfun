import React from 'react';
import { Menu, Flame } from 'lucide-react';

export const Navbar = ({ onToggleSidebar, user }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-orange-100 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-white lg:hidden transition-all shadow-sm"
          style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base hidden md:block font-black text-slate-900">
            Kinderfun <span className="text-orange-500">Playground</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold hidden sm:block">Tempat Aman Buat Anak, Waktu Tenang Buat Anda.</p>
        </div>
      </div>

      {/* User Badge Info */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-orange-100" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)' }}>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold text-slate-700">{user?.name || 'Kasir Staf'}</span>
        <span className="text-[10px] font-black px-2 py-0.5 rounded-md text-white uppercase" style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
          {user?.role || 'staff'}
        </span>
      </div>
    </header>
  );
};
