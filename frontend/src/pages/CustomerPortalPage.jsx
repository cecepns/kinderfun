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
  MapPin, 
  User, 
  Baby, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ShieldAlert
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
  const [activeTab, setActiveTab] = useState('gifts'); // 'gifts' or 'history'
  
  // Modals
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [selectedSouvenir, setSelectedSouvenir] = useState(null);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);

  // Failed images tracker
  const [failedImages, setFailedImages] = useState({});

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-b from-purple-50 to-white p-8 text-center border-b border-slate-100 space-y-3">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white p-2 shadow-2xs flex items-center justify-center border border-purple-100 overflow-hidden">
              <img src="/kinderfun.jpg" alt="Kinderfun Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-wide">Portal Pelanggan</h1>
              <p className="text-xs text-slate-500 font-medium">Cek Saldo Poin & Penukaran Hadiah Kinderfun</p>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nomor WhatsApp Pelanggan *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081311112222"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Masukkan nomor WhatsApp yang Anda daftarkan di kasir playground.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Memproses...' : <><Sparkles className="w-4 h-4 text-amber-300" /> Cek Saldo Poin Saya</>}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all"
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
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Top Floating App Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-purple-100 p-0.5">
              <img src="/kinderfun.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-sm text-slate-900">Kinderfun Poin</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container constrained to Mobile width for premium app experience */}
      <div className="max-w-md mx-auto px-4 mt-4 space-y-4">
        
        {/* HERO CARD - Matches custom design image */}
        <div className="bg-sky-500 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col items-center text-center">
          {/* Background circles */}
          <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-sky-400/30" />
          <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-sky-400/20" />

          {/* Maskot / Image placeholder style illustration */}
          <div className="absolute right-4 bottom-4 w-16 h-20 opacity-95">
            <svg viewBox="0 0 100 120" className="w-full h-full text-white" fill="currentColor">
              <circle cx="50" cy="40" r="20" fill="#ffffff" />
              <circle cx="45" cy="35" r="2" fill="#333" />
              <circle cx="55" cy="35" r="2" fill="#333" />
              <path d="M47,46 Q50,50 53,46" stroke="#333" strokeWidth="2" fill="none" />
              <rect x="35" y="60" width="30" height="40" rx="15" fill="#ffffff" />
              <circle cx="35" cy="85" r="8" fill="#ffffff" />
              <circle cx="65" cy="85" r="8" fill="#ffffff" />
            </svg>
          </div>

          <h2 className="text-base font-bold tracking-wide opacity-90 drop-shadow-xs">Total Poin {customer.parent_name}</h2>
          
          <div className="my-4 flex flex-col items-center">
            <span className="text-6xl font-black text-yellow-300 tracking-tight drop-shadow-sm select-none">
              {customer.points_balance || 0}
            </span>
            <span className="text-sm font-extrabold uppercase tracking-widest text-white mt-1">Poin</span>
          </div>

          <div className="space-y-1 z-10">
            <p className="text-xs font-bold bg-sky-600/30 px-3 py-1 rounded-full inline-flex items-center gap-1">
              <Baby className="w-3.5 h-3.5" /> Anak: {customer.child_name}
            </p>
            {customer.is_member === 1 && (
              <div>
                <span className="text-[10px] bg-yellow-300 text-sky-950 font-bold px-2 py-0.5 rounded-md uppercase">
                  ★ Member Active
                </span>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveTab('history')}
            className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-amber-400 border-amber-400 text-slate-900 font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <History className="w-6 h-6 text-slate-800" />
            <span className="text-xs font-bold">Riwayat Poin</span>
          </button>

          <button
            onClick={() => setActiveTab('gifts')}
            className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
              activeTab === 'gifts'
                ? 'bg-amber-400 border-amber-400 text-slate-900 font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Gift className="w-6 h-6 text-slate-800" />
            <span className="text-xs font-bold">Tukar Hadiah</span>
          </button>
        </div>

        {/* DYNAMIC CONTENTS */}
        <div className="space-y-3">
          {activeTab === 'gifts' ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-purple-600" /> Pilih Hadiah
                </h3>
                <span className="text-xs text-slate-500 font-semibold">{souvenirs.length} item tersedia</span>
              </div>

              {/* Gift Grid */}
              <div className="grid grid-cols-2 gap-3">
                {souvenirs.map((item) => {
                  const isBroken = failedImages[item.id] || !item.image_url;
                  const canRedeem = customer.points_balance >= item.point_cost && item.stock > 0;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col justify-between hover:border-purple-300 transition-all shadow-2xs"
                    >
                      <div>
                        {/* Image */}
                        <div className="w-full h-28 rounded-xl overflow-hidden bg-purple-50 border border-purple-100 relative flex items-center justify-center mb-2">
                          {isBroken ? (
                            <Gift className="w-8 h-8 text-purple-300 stroke-1" />
                          ) : (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              onError={() => handleImageError(item.id)}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <span className="absolute bottom-2 left-2 bg-purple-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-0.5">
                            {item.point_cost} Pts
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{item.description || 'Hadiah menarik untuk Anda.'}</p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-semibold text-slate-500">Stok: {item.stock}</span>
                        </div>

                        <button
                          onClick={() => handleOpenRedeem(item)}
                          disabled={!canRedeem}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            canRedeem
                              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {item.stock <= 0 ? 'Stok Habis' : 'Tukar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-600" /> Riwayat Aktivitas Poin
              </h3>

              {/* History List */}
              <div className="space-y-2">
                {history.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-slate-400 text-xs">
                    Belum ada riwayat transaksi poin.
                  </div>
                ) : (
                  history.map((h, index) => {
                    const isEarn = h.type === 'earn';

                    return (
                      <div key={index} className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isEarn ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                          }`}>
                            {isEarn ? <Sparkles className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{h.description}</p>
                            <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                              <span>{h.date.split('T')[0] || h.date}</span>
                              <span className="text-slate-300">•</span>
                              <span className="font-bold uppercase text-[9px]">{h.ref_code}</span>
                            </p>
                            {!isEarn && (
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[9px] font-bold mt-1 ${
                                h.status === 'pending' 
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

                        <div className={`text-xs font-black ${isEarn ? 'text-emerald-600' : 'text-purple-600'}`}>
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
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1">
            <ShieldAlert className="w-4 h-4 text-purple-700" /> Informasi Penukaran Hadiah
          </h4>
          <ul className="text-[10px] text-purple-800 list-disc list-inside space-y-1 font-semibold leading-relaxed">
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
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center">
                {failedImages[selectedSouvenir.id] || !selectedSouvenir.image_url ? (
                  <Gift className="w-6 h-6 text-purple-400" />
                ) : (
                  <img src={selectedSouvenir.image_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">{selectedSouvenir.name}</h4>
                <p className="text-[11px] text-purple-700 font-bold">{selectedSouvenir.point_cost} Poin / pcs</p>
                <p className="text-[10px] text-slate-500">Stok tersedia: {selectedSouvenir.stock} pcs</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Jumlah Tukar</label>
                <input
                  type="number"
                  min={1}
                  max={selectedSouvenir.stock}
                  value={qty}
                  onChange={(e) => setQty(Math.min(selectedSouvenir.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Total Poin Dibutuhkan</label>
                <div className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-extrabold text-slate-800">
                  {selectedSouvenir.point_cost * qty} Poin
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Catatan Tambahan (Opsional)</label>
              <textarea
                placeholder="Misal: Hadiah akan diambil besok sore"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="p-3 rounded-lg bg-yellow-50 text-[10px] text-yellow-800 font-bold border border-yellow-200">
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
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs"
              >
                {redeemLoading ? 'Memproses...' : 'Tukar Poin'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
