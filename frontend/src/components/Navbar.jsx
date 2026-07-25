import React from 'react';
import { Menu } from 'lucide-react';

export const Navbar = ({ onToggleSidebar, user }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 lg:hidden transition-all"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Kinderfun Playground
          </h2>
          <p className="text-xs text-slate-500 font-medium hidden sm:block">Tempat Aman Buat Anak, Waktu Tenang Buat Anda.</p>
        </div>
      </div>

      {/* User Badge Info */}
      <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold text-slate-700">{user?.name || 'Kasir Staf'}</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 uppercase">
          {user?.role || 'staff'}
        </span>
      </div>
    </header>
  );
};
