import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Ticket, 
  Award, 
  Gift, 
  UserCheck, 
  FileText, 
  TrendingUp, 
  Users,
  Tag,
  X, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, user, onLogout }) => {
  const navItems = [
    { label: 'Tiket & POS', path: '/', icon: Ticket, roles: ['admin', 'staff'] },
    { label: 'Poin Pelanggan', path: '/customers', icon: Award, roles: ['admin', 'staff'] },
    { label: 'Tukar Souvenir', path: '/rewards', icon: Gift, roles: ['admin', 'staff'] },
    { label: 'Absensi Staf', path: '/attendance', icon: UserCheck, roles: ['admin', 'staff'] },
    { label: 'Manajemen Pegawai', path: '/admin/staff', icon: Users, roles: ['admin'] },
    { label: 'Manajemen Paket Tiket', path: '/admin/packages', icon: Tag, roles: ['admin'] },
    { label: 'Laporan Presensi & Pengunjung', path: '/admin/reports', icon: FileText, roles: ['admin'] },
    { label: 'Laporan Keuangan', path: '/admin/finance', icon: TrendingUp, roles: ['admin'] },
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(user?.role || 'staff'));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-800">
      {/* Header Branding (Fixed Header in Sidebar) */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-center w-full h-12 overflow-hidden">
          <img src="/kinderfun.jpg" alt="Kinderfun Logo" className="h-full max-w-full object-contain" />
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium transition-all text-xs ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Points Info Card */}
      <div className="p-3 m-3 bg-purple-50 rounded-xl border border-purple-100 text-center shrink-0">
        <p className="text-[11px] font-medium text-slate-500">Info Poin Pelanggan</p>
        <p className="text-xs font-bold text-purple-700 mt-0.5">1 Kunjungan = 10 Poin</p>
      </div>

      {/* Logout Button */}
      <div className="p-3 border-t border-slate-200 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-semibold text-xs transition-all border border-slate-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Fixed Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 h-screen sticky top-0 border-r border-slate-200 bg-white z-20 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
          />
          <aside className="relative w-64 max-w-xs h-full bg-white z-50 shadow-xl border-r border-slate-200 overflow-hidden">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};
