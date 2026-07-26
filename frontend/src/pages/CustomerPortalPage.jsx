import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from '../components/Modal';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Phone,
  LogOut,
  History,
  Gift,
  Baby,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Newspaper,
  Calendar,
  Search,
  ChevronRight
} from 'lucide-react';

export const CustomerPortalPage = () => {
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem('kinderfun_customer');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [souvenirs, setSouvenirs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('gifts'); // 'gifts', 'history', 'activities'
  const [activitySearch, setActivitySearch] = useState('');
  const [debouncedActivitySearch, setDebouncedActivitySearch] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Modals
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [selectedSouvenir, setSelectedSouvenir] = useState(null);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);

  // Failed images tracker
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedActivitySearch(activitySearch);
    }, 350);
    return () => clearTimeout(handler);
  }, [activitySearch]);

  useEffect(() => {
    fetchActivities();
  }, [debouncedActivitySearch]);

  const fetchActivities = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.ACTIVITIES.LIST, {
        limit: 20,
        search: debouncedActivitySearch
      });
      if (res.success) {
        setActivities(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    if (customer) {
      fetchProfile();
      fetchHistory();
      fetchSouvenirs();
    }
  }, [customer?.id]);

  const fetchProfile = async () => {
    try {
      const res = await request.get(`${API_ENDPOINTS.CUSTOMER.PROFILE}?id=${customer.id}`);
      if (res.success) {
        setCustomer(res.data);
        localStorage.setItem('kinderfun_customer', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await request.get(`${API_ENDPOINTS.CUSTOMER.HISTORY}?id=${customer.id}`);
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      toast.error('Gagal mengambil riwayat poin');
    }
  };

  const fetchSouvenirs = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.SOUVENIRS.LIST, { limit: 100 });
      if (res.success) {
        setSouvenirs(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat katalog souvenir');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast.error('Nomor WhatsApp wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const res = await request.post(API_ENDPOINTS.CUSTOMER.LOGIN, { phone });
      if (res.success) {
        toast.success(`Selamat datang, ${res.data.customer.parent_name}!`);
        setCustomer(res.data.customer);
        localStorage.setItem('kinderfun_customer', JSON.stringify(res.data.customer));
      }
    } catch (err) {
      toast.error(err.message || 'Nomor WhatsApp belum terdaftar. Silakan hubungi kasir playground.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kinderfun_customer');
    setCustomer(null);
    toast.success('Keluar dari portal berhasil');
  };

  const handleOpenRedeem = (item) => {
    setSelectedSouvenir(item);
    setQty(1);
    setNotes('');
    setIsRedeemModalOpen(true);
  };

  const handleRedeem = async () => {
    if (!selectedSouvenir) return;
    const totalCost = selectedSouvenir.point_cost * qty;
    if (customer.points_balance < totalCost) {
      toast.error(`Poin Anda tidak mencukupi (${customer.points_balance} / ${totalCost} Poin)`);
      return;
    }

    setRedeemLoading(true);
    try {
      const res = await request.post(API_ENDPOINTS.CUSTOMER.REDEEM, {
        customer_id: customer.id,
        souvenir_id: selectedSouvenir.id,
        qty: parseInt(qty),
        notes
      });

      if (res.success) {
        toast.success(res.message || 'Klaim hadiah diajukan!');
        setIsRedeemModalOpen(false);
        fetchProfile();
        fetchHistory();
        fetchSouvenirs();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mengajukan klaim hadiah');
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleImageError = (id) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  // Render Customer Login Page
  if (!customer) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 bg-orange-400 blur-2xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-20 bg-red-500 blur-2xl" />

        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-orange-100 relative z-10">
          {/* Header */}
          <div className="bg-gradient-to-br from-orange-500 via-red-500 to-rose-500 p-8 text-center text-white space-y-3 relative overflow-hidden">
            <div className="w-24 h-24 mx-auto rounded-full bg-white/20 p-2 shadow-lg backdrop-blur-sm border-2 border-white/40 flex items-center justify-center relative">
              <img src="/maskot.png" alt="Kinderfun Mascot" className="w-full h-full object-contain mascot-float drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wide">Portal Pelanggan</h1>
              <p className="text-xs text-orange-100 font-bold mt-0.5">Cek Saldo Poin & Penukaran Hadiah Kinderfun</p>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nomor WhatsApp Pelanggan *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-orange-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081311112222"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-orange-100 text-sm font-bold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Masukkan nomor WhatsApp yang Anda daftarkan di kasir playground.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-extrabold text-sm shadow-md disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Memproses...' : <><Sparkles className="w-4 h-4 text-amber-300" /> Cek Saldo Poin Saya</>}
              </button>
            </form>

            <div className="pt-4 border-t border-orange-100 text-center">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-800 transition-all"
              >
                ← Kembali ke Portal Kasir / Staf
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/50 pb-12 font-sans">
      {/* Top Floating App Bar */}
      <div className="bg-white border-b-2 border-orange-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-full h-8">
              <img src="/kinderfun.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container constrained to Mobile width for premium app experience */}
      <div className="max-w-md mx-auto px-4 mt-4 space-y-4">

        {/* HERO CARD - Featuring Kinderfun Mascot */}
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col items-start">
          {/* Background decorative circles */}
          <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-white/10" />

          {/* KINDERFUN MASCOT IMAGE */}
          <div className="absolute right-2 bottom-1 w-28 h-36 pointer-events-none drop-shadow-xl z-0">
            <img src="/maskot.png" alt="Kinderfun Mascot" className="w-full h-full object-contain mascot-float" />
          </div>

          <div className="relative z-10 w-2/3">
            <h2 className="text-sm font-extrabold tracking-wide text-orange-100 uppercase">Poin Pelanggan</h2>
            <p className="text-lg font-black truncate text-white leading-tight">{customer.parent_name}</p>

            <div className="my-3">
              <span className="text-5xl font-black text-amber-300 tracking-tight drop-shadow-sm select-none">
                {customer.points_balance || 0}
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-white ml-2 bg-black/20 px-2 py-0.5 rounded-full">Poin</span>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-bold bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-lg inline-flex items-center gap-1 border border-white/30">
                <Baby className="w-3.5 h-3.5 text-yellow-300" /> Anak: {customer.child_name}
              </p>
              {customer.is_member === 1 && (
                <div>
                  <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                    ★ Member Active
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('gifts')}
            className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 ${activeTab === 'gifts'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-500 text-white font-extrabold shadow-md'
              : 'bg-white border-orange-100 text-slate-700 hover:bg-orange-50'
              }`}
          >
            <Gift className={`w-4 h-4 ${activeTab === 'gifts' ? 'text-amber-300' : 'text-orange-500'}`} />
            <span className="text-[11px] font-bold">Tukar Hadiah</span>
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 ${activeTab === 'activities'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-500 text-white font-extrabold shadow-md'
              : 'bg-white border-orange-100 text-slate-700 hover:bg-orange-50'
              }`}
          >
            <Newspaper className={`w-4 h-4 ${activeTab === 'activities' ? 'text-amber-300' : 'text-orange-500'}`} />
            <span className="text-[11px] font-bold">Kegiatan</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 ${activeTab === 'history'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-500 text-white font-extrabold shadow-md'
              : 'bg-white border-orange-100 text-slate-700 hover:bg-orange-50'
              }`}
          >
            <History className={`w-4 h-4 ${activeTab === 'history' ? 'text-amber-300' : 'text-orange-500'}`} />
            <span className="text-[11px] font-bold">Riwayat Poin</span>
          </button>
        </div>


        {/* DYNAMIC CONTENTS */}
        <div className="space-y-3">
          {activeTab === 'gifts' ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-orange-500" /> Katalog Hadiah Souvenir
                </h3>
                <span className="text-xs text-slate-500 font-bold bg-orange-100 px-2 py-0.5 rounded-full">{souvenirs.length} item</span>
              </div>

              {/* Gift Grid */}
              <div className="grid grid-cols-2 gap-3">
                {souvenirs.map((item) => {
                  const isBroken = failedImages[item.id] || !item.image_url;
                  const canRedeem = customer.points_balance >= item.point_cost && item.stock > 0;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-3 border-2 border-orange-100 flex flex-col justify-between hover:border-orange-300 transition-all shadow-sm"
                    >
                      <div>
                        {/* Image */}
                        <div className="w-full h-28 rounded-xl overflow-hidden bg-orange-50 border border-orange-200 relative flex items-center justify-center mb-2">
                          {isBroken ? (
                            <Gift className="w-8 h-8 text-orange-300 stroke-1" />
                          ) : (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              onError={() => handleImageError(item.id)}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <span className="absolute bottom-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-sm">
                            {item.point_cost} Pts
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{item.description || 'Hadiah menarik untuk Anda.'}</p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-orange-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-extrabold text-slate-500">Stok: {item.stock}</span>
                        </div>

                        <button
                          onClick={() => handleOpenRedeem(item)}
                          disabled={!canRedeem}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${canRedeem
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                          {item.stock <= 0 ? 'Stok Habis' : 'Tukar Poin'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : activeTab === 'activities' ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <Newspaper className="w-4 h-4 text-orange-500" /> Agenda & Kegiatan Kinderfun
                </h3>
                <span className="text-xs text-slate-500 font-bold bg-orange-100 px-2 py-0.5 rounded-full">{activities.length} info</span>
              </div>

              {/* Search Bar for Activities */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kegiatan atau event..."
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border-2 border-orange-100 text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Activities List */}
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 text-center border-2 border-orange-100 text-slate-400 text-xs font-semibold">
                    Belum ada informasi kegiatan.
                  </div>
                ) : (
                  activities.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => {
                        setSelectedActivity(act);
                        setIsActivityModalOpen(true);
                      }}
                      className="bg-white rounded-2xl overflow-hidden border-2 border-orange-100 hover:border-orange-300 transition-all shadow-xs cursor-pointer group"
                    >
                      {act.cover_image && (
                        <div className="w-full h-36 overflow-hidden bg-slate-100 relative">
                          <img src={act.cover_image} alt={act.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-orange-500/90 backdrop-blur-xs text-white text-[10px] font-extrabold">
                            {act.category || 'Kegiatan'}
                          </span>
                        </div>
                      )}
                      <div className="p-3.5 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600">
                          <Calendar className="w-3 h-3" />
                          <span>{act.event_date ? act.event_date.split('T')[0] : 'Setiap Hari'}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-xs line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {act.title}
                        </h4>
                        <div
                          className="text-[11px] text-slate-500 line-clamp-2 font-medium"
                          dangerouslySetInnerHTML={{ __html: act.description?.replace(/<[^>]+>/g, '').slice(0, 100) + '...' }}
                        />
                        <div className="pt-2 flex items-center justify-between text-[10px] font-bold text-orange-600">
                          <span>Lihat Detail Kegiatan</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <History className="w-4 h-4 text-orange-500" /> Riwayat Aktivitas Poin
              </h3>


              {/* History List */}
              <div className="space-y-2">
                {history.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 text-center border-2 border-orange-100 text-slate-400 text-xs font-semibold">
                    Belum ada riwayat transaksi poin.
                  </div>
                ) : (
                  history.map((h, index) => {
                    const isEarn = h.type === 'earn';

                    return (
                      <div key={index} className="bg-white rounded-xl p-3 border-2 border-orange-100 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEarn ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                            }`}>
                            {isEarn ? <Sparkles className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-slate-900">{h.description}</p>
                            <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                              <span>{h.date.split('T')[0] || h.date}</span>
                              <span className="text-slate-300">•</span>
                              <span className="font-extrabold uppercase text-[9px]">{h.ref_code}</span>
                            </p>
                            {!isEarn && (
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[9px] font-extrabold mt-1 ${h.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                {h.status === 'pending' ? (
                                  <><Clock className="w-2.5 h-2.5" /> Siap Diambil</>
                                ) : (
                                  <><CheckCircle2 className="w-2.5 h-2.5" /> Sudah Diambil</>
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={`text-xs font-black ${isEarn ? 'text-emerald-600' : 'text-orange-600'}`}>
                          {isEarn ? '+' : '-'}{h.points} Poin
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* INFO RULES TUKAR HADIAH */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-extrabold text-orange-900 flex items-center gap-1">
            <ShieldAlert className="w-4 h-4 text-orange-600" /> Informasi Penukaran Hadiah
          </h4>
          <ul className="text-[10px] text-orange-900 list-disc list-inside space-y-1 font-bold leading-relaxed">
            <li>Klaim online bersifat "Pesanan/Booking".</li>
            <li>Hadiah wajib diambil langsung ke arena Playground Kinderfun.</li>
            <li>Tunjukkan kode penukaran (e.g. RDM-ONLINE-xxx) kepada staf kasir di lokasi untuk penyerahan hadiah.</li>
          </ul>
        </div>

      </div>

      {/* CONFIRM REDEEM MODAL */}
      <Modal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        title="Konfirmasi Penukaran Poin"
      >
        {selectedSouvenir && (
          <div className="space-y-4">
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-orange-200 flex-shrink-0 flex items-center justify-center">
                {failedImages[selectedSouvenir.id] || !selectedSouvenir.image_url ? (
                  <Gift className="w-6 h-6 text-orange-400" />
                ) : (
                  <img src={selectedSouvenir.image_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs">{selectedSouvenir.name}</h4>
                <p className="text-[11px] text-orange-600 font-extrabold">{selectedSouvenir.point_cost} Poin / pcs</p>
                <p className="text-[10px] text-slate-500 font-bold">Stok tersedia: {selectedSouvenir.stock} pcs</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Jumlah Tukar</label>
                <input
                  type="number"
                  min={1}
                  max={selectedSouvenir.stock}
                  value={qty}
                  onChange={(e) => setQty(Math.min(selectedSouvenir.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-orange-100 text-xs font-extrabold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Total Poin Dibutuhkan</label>
                <div className="px-3 py-2 bg-orange-100 rounded-lg text-xs font-black text-orange-900">
                  {selectedSouvenir.point_cost * qty} Poin
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Tambahan (Opsional)</label>
              <textarea
                placeholder="Misal: Hadiah akan diambil besok sore"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border-2 border-orange-100 text-xs font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="p-3 rounded-lg bg-amber-100 text-[10px] text-amber-900 font-extrabold border border-amber-300">
              * Saldo Poin Anda: {customer.points_balance} Poin. Sisa Poin setelah klaim: {customer.points_balance - (selectedSouvenir.point_cost * qty)} Poin.
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRedeemModalOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRedeem}
                disabled={redeemLoading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-extrabold text-xs shadow-md"
              >
                {redeemLoading ? 'Memproses...' : 'Tukar Poin'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Activity Detail Modal */}
      <Modal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        title="Detail Kegiatan Kinderfun"
      >
        {selectedActivity && (
          <div className="space-y-4">
            {selectedActivity.cover_image && (
              <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={selectedActivity.cover_image} alt={selectedActivity.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-1">
              <span className="px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 text-[10px] font-extrabold uppercase">
                {selectedActivity.category || 'Kegiatan'}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">{selectedActivity.title}</h3>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 pt-1">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-orange-500" /> {selectedActivity.event_date ? selectedActivity.event_date.split('T')[0] : 'Setiap Hari'}</span>
                <span>•</span>
                <span>Oleh {selectedActivity.author || 'Admin Kinderfun'}</span>
              </div>
            </div>

            <div
              className="prose prose-sm max-w-none text-slate-700 text-xs font-medium border-t border-slate-100 pt-3 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: selectedActivity.description }}
            />

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsActivityModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

