import React, { useState } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { Lock, Mail, LogIn, Sparkles } from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan Password wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const res = await request.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      if (res.success) {
        toast.success(`Selamat datang, ${res.data.user.name}!`);
        localStorage.setItem('kinderfun_token', res.data.token);
        localStorage.setItem('kinderfun_user', JSON.stringify(res.data.user));
        onLoginSuccess(res.data.user);
      }
    } catch (err) {
      toast.error(err.message || 'Login gagal. Periksa email & password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 30%, #fed7aa 60%, #fecaca 100%)' }}
    >
      {/* Decorative background circles */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #f97316, transparent)' }} />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />
      <div className="absolute top-1/2 left-8 w-20 h-20 rounded-full opacity-10" style={{ background: '#f59e0b' }} />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-orange-100 relative z-10">

        {/* Header strip */}
        <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #f97316, #ef4444, #f59e0b)' }} />

        {/* Header */}
        <div className="p-8 text-center space-y-4">
          {/* Logo */}
          <div className="w-full h-11 mx-auto flex items-center justify-center overflow-hidden">
            <img src="/kinderfun.jpg" alt="Kinderfun Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-wide">
              Kinderfun <span className="text-orange-500">Playground</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">Sistem Informasi Kasir & Manajemen Playground</p>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 pb-8 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Email Pengguna *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-orange-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@kinderfun.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-semibold focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Kata Sandi / Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-orange-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-semibold focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-black text-sm shadow-lg disabled:opacity-40 transition-all flex items-center justify-center gap-2 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: loading ? '#fdba74' : 'linear-gradient(135deg, #f97316, #ef4444)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Memproses Login...</span>
              ) : (
                <><LogIn className="w-4 h-4" /> Masuk ke Dashboard</>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-orange-100 text-center">
            <a
              href="/customer-portal"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-all hover:gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Masuk ke Portal Cek & Tukar Poin Pelanggan →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
