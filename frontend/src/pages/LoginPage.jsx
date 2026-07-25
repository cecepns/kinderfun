import React, { useState } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { Lock, Mail, ShieldCheck, LogIn, Sparkles } from 'lucide-react';

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

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-white p-8 text-center border-b border-slate-100 space-y-3">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-purple-50 p-2 shadow-2xs flex items-center justify-center border border-purple-100 overflow-hidden">
            <img src="/kinderfun.jpg" alt="Kinderfun Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-wide">Kinderfun Playground</h1>
            <p className="text-xs text-slate-500 font-medium">Sistem Informasi Kasir & Manajemen Playground</p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Email Pengguna *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@kinderfun.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Kata Sandi / Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Memproses Login...' : <><LogIn className="w-4 h-4" /> Masuk ke Dashboard</>}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <a
              href="/customer-portal"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 font-bold" /> Masuk ke Portal Cek & Tukar Poin Pelanggan →
            </a>
          </div>

          {/* Quick Demo Credentials */}
          {/* <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase text-center">Akun Demo Masuk Cepat:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@kinderfun.com', 'admin123')}
                className="py-2 px-3 rounded-xl bg-purple-50/60 hover:bg-purple-100 hover:text-purple-800 text-slate-700 font-semibold text-xs transition-all border border-purple-100 text-left flex flex-col"
              >
                <span className="font-bold flex items-center gap-1 text-purple-700"><ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Admin</span>
                <span className="text-[10px] text-slate-500">admin@kinderfun.com</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('kasir1@kinderfun.com', 'staff123')}
                className="py-2 px-3 rounded-xl bg-purple-50/60 hover:bg-purple-100 hover:text-purple-800 text-slate-700 font-semibold text-xs transition-all border border-purple-100 text-left flex flex-col"
              >
                <span className="font-bold flex items-center gap-1 text-purple-700"><Sparkles className="w-3.5 h-3.5 text-purple-600" /> Staf / Kasir</span>
                <span className="text-[10px] text-slate-500">kasir1@kinderfun.com</span>
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};
