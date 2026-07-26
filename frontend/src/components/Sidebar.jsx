import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
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
  ShieldCheck,
  Sparkles,
  Newspaper
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, user, onLogout }) => {
  const [defaultPoints, setDefaultPoints] = useState(10);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.SETTINGS.GET);
      if (res.success && res.data && res.data.default_visit_points) {
        setDefaultPoints(parseInt(res.data.default_visit_points) || 10);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [


    { label: 'Tiket & POS', path: '/', icon: Ticket, roles: ['admin', 'staff'] },
    { label: 'Poin Pelanggan', path: '/customers', icon: Award, roles: ['admin', 'staff'] },
    { label: 'Tukar Souvenir', path: '/rewards', icon: Gift, roles: ['admin', 'staff'] },
    { label: 'Absensi Staf', path: '/attendance', icon: UserCheck, roles: ['admin', 'staff'] },
    { label: 'Artikel & Kegiatan', path: '/admin/activities', icon: Newspaper, roles: ['admin'] },
    { label: 'Manajemen Pegawai', path: '/admin/staff', icon: Users, roles: ['admin'] },
    { label: 'Manajemen Paket Tiket', path: '/admin/packages', icon: Tag, roles: ['admin'] },
    { label: 'Laporan Presensi & Pengunjung', path: '/admin/reports', icon: FileText, roles: ['admin'] },
    { label: 'Laporan Keuangan', path: '/admin/finance', icon: TrendingUp, roles: ['admin'] },
  ];


  const allowedItems = navItems.filter(item => item.roles.includes(user?.role || 'staff'));

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-white" style={{ background: 'linear-gradient(160deg, #ea580c 0%, #ef4444 60%, #dc2626 100%)' }}>
      {/* Header Branding */}
      <div className="flex items-center justify-between p-4 shrink-0 sticky top-0 z-10" style={{ background: 'rgba(0,0,0,0.12)' }}>
        <div className="flex items-center gap-3 w-full">
          <div className="w-auto h-11 flex-shrink-0 flex items-center justify-center">
            <img src="/kinderfun.jpg" alt="Kinderfun Logo" className="h-full max-w-full object-contain rounded-lg" />
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all text-xs ${isActive
                  ? 'bg-white text-orange-600 shadow-md font-black'
                  : 'text-white/85 hover:bg-white/15 hover:text-white'
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
      <div className="p-3 m-3 bg-white/15 rounded-xl border border-white/20 text-center shrink-0 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <Sparkles className="w-3 h-3 text-yellow-300" />
          <p className="text-[10px] font-bold text-orange-100">Info Poin Pelanggan</p>
        </div>
        <p className="text-xs font-black text-yellow-300">1 Kunjungan = {defaultPoints} Poin</p>
      </div>


      {/* Logout Button */}
      <div className="p-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20"
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
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 h-screen sticky top-0 z-20 overflow-hidden shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          />
          <aside className="relative w-64 max-w-xs h-full z-50 shadow-2xl overflow-hidden">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};
