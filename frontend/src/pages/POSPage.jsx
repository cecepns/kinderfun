import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import toast from 'react-hot-toast';
import { printThermalReceipt } from '../utils/printHelper';
import { 
  Ticket, 
  Sparkles, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Printer, 
  Search, 
  UserPlus, 
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';

export const POSPage = () => {
  const [packages, setPackages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isWeekend, setIsWeekend] = useState(() => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  });
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [pointsToEarn, setPointsToEarn] = useState(10);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Recent transactions list state
  const [transactions, setTransactions] = useState([]);
  const [trxPage, setTrxPage] = useState(1);
  const [trxLimit, setTrxLimit] = useState(10);
  const [trxTotal, setTrxTotal] = useState(0);
  const [trxTotalPages, setTrxTotalPages] = useState(1);
  const [searchTrx, setSearchTrx] = useState('');

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);

  // New Customer Form State
  const [newCustForm, setNewCustForm] = useState({ parent_name: '', child_name: '', phone: '', email: '' });

  useEffect(() => {
    fetchSettings();
    fetchPackages();
    fetchTransactions();
    fetchCustomers();
  }, [trxPage, trxLimit, searchTrx]);

  const fetchSettings = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.SETTINGS.GET);
      if (res.success && res.data && res.data.default_visit_points) {
        setPointsToEarn(parseInt(res.data.default_visit_points) || 10);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPackages = async () => {

    try {
      const res = await request.get(API_ENDPOINTS.PACKAGES.LIST);
      if (res.success) setPackages(res.data);
    } catch (err) {
      toast.error(err.message || 'Gagal memuat paket bermain');
    }
  };

  const fetchCustomers = async (search = '') => {
    try {
      const res = await request.get(API_ENDPOINTS.CUSTOMERS.LIST, { limit: 50, search });
      if (res.success) setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.TRANSACTIONS.LIST, {
        page: trxPage,
        limit: trxLimit,
        search: searchTrx
      });
      if (res.success) {
        setTransactions(res.data);
        setTrxTotal(res.pagination.total);
        setTrxTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustForm.parent_name || !newCustForm.child_name || !newCustForm.phone) {
      toast.error('Semua kolom bertanda * wajib diisi');
      return;
    }
    try {
      const res = await request.post(API_ENDPOINTS.CUSTOMERS.CREATE, newCustForm);
      if (res.success) {
        toast.success('Pelanggan baru berhasil didaftarkan!');
        setSelectedCustomer(res.data);
        setNewCustForm({ parent_name: '', child_name: '', phone: '', email: '' });
        setIsNewCustModalOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal merilis pelanggan baru');
    }
  };

  const handleProcessCheckout = async () => {
    if (!selectedPackage) {
      toast.error('Silakan pilih Paket Bermain terlebih dahulu');
      return;
    }
    if (!selectedCustomer) {
      toast.error('Silakan pilih Pelanggan terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer_id: selectedCustomer.id,
        package_id: selectedPackage.id,
        is_weekend: isWeekend,
        payment_method: paymentMethod,
        points_earned: pointsToEarn,
        notes
      };

      const res = await request.post(API_ENDPOINTS.TRANSACTIONS.CREATE, payload);
      if (res.success) {
        toast.success(res.message || 'Transaksi Berhasil!');
        setCurrentReceipt({
          trx_code: res.data.trx_code,
          customer_name: `${selectedCustomer.parent_name} (${selectedCustomer.child_name})`,
          package_name: selectedPackage.name,
          amount: res.data.amount,
          is_weekend: isWeekend,
          points_earned: pointsToEarn,
          payment_method: paymentMethod,
          date: new Date().toLocaleString('id-ID')
        });
        setIsReceiptModalOpen(true);
        setSelectedPackage(null);
        setSelectedCustomer(null);
        setNotes('');
        fetchTransactions();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memproses transaksi');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (pkg) => {
    if (!pkg) return 0;
    return isWeekend ? Number(pkg.weekend_price) : Number(pkg.weekday_price);
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white text-slate-900 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <Ticket className="w-4 h-4 text-emerald-600" /> Kasir Tiket POS
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-slate-900">
            Pencetakan Tiket & Paket Play
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Pilih paket bermain untuk anak, kumpulkan <strong className="text-amber-600">10 Poin</strong> setiap kunjungan.
          </p>
        </div>

        {/* Day toggle button */}
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1 w-full md:w-auto">
          <button
            onClick={() => setIsWeekend(false)}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
              !isWeekend ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hari Kerja (Weekday)
          </button>
          <button
            onClick={() => setIsWeekend(true)}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
              isWeekend ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekend / Libur
          </button>
        </div>
      </div>

      {/* POS Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Play Packages Selection (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> Pilih Paket Bermain
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {packages.map((pkg, idx) => {
              const price = calculatePrice(pkg);
              const isSelected = selectedPackage?.id === pkg.id;

              // Vibrant palette variations for cards
              const cardThemes = [
                { bg: 'bg-gradient-to-br from-orange-50 to-amber-50', border: 'border-orange-200', activeBorder: 'border-orange-500 ring-4 ring-orange-100', iconBg: 'bg-gradient-to-r from-orange-500 to-amber-500', badgeBg: 'bg-orange-500' },
                { bg: 'bg-gradient-to-br from-rose-50 to-orange-50', border: 'border-rose-200', activeBorder: 'border-rose-500 ring-4 ring-rose-100', iconBg: 'bg-gradient-to-r from-rose-500 to-orange-500', badgeBg: 'bg-rose-500' },
                { bg: 'bg-gradient-to-br from-amber-50 to-yellow-50', border: 'border-amber-200', activeBorder: 'border-amber-500 ring-4 ring-amber-100', iconBg: 'bg-gradient-to-r from-amber-500 to-yellow-500', badgeBg: 'bg-amber-500' },
                { bg: 'bg-gradient-to-br from-red-50 to-orange-50', border: 'border-red-200', activeBorder: 'border-red-500 ring-4 ring-red-100', iconBg: 'bg-gradient-to-r from-red-500 to-orange-500', badgeBg: 'bg-red-500' },
              ];

              const theme = cardThemes[idx % cardThemes.length];

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`cursor-pointer rounded-2xl p-5 transition-all border-2 relative overflow-hidden flex flex-col justify-between ${
                    theme.bg
                  } ${
                    isSelected
                      ? `${theme.activeBorder} shadow-md scale-[1.02]`
                      : `${theme.border} hover:border-orange-300 hover:shadow-md hover:scale-[1.01]`
                  }`}
                >
                  {pkg.best_value === 1 && (
                    <span className="absolute top-3.5 right-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      ★ Best Value
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-3.5 mb-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-white shadow-md flex-shrink-0 ${
                        pkg.is_member_package ? 'bg-gradient-to-r from-amber-500 to-orange-500' : theme.iconBg
                      }`}>
                        {pkg.is_member_package ? <Sparkles className="w-6 h-6 text-white animate-pulse" /> : `${pkg.duration_hours}h`}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{pkg.name}</h3>
                        <p className="text-xs text-slate-600 font-bold mt-0.5">
                          {pkg.is_member_package ? `${pkg.visits_count}x Kunjungan` : `Durasi ${pkg.duration_hours} Jam`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Tarif {isWeekend ? 'Weekend' : 'Weekday'}</span>
                      <p className="text-xl font-black text-slate-900">
                        Rp {price.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm' : 'bg-white text-slate-300 border border-slate-200'
                    }`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Customer & Checkout Summary */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Ringkasan Order</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                {isWeekend ? 'Weekend' : 'Weekday'}
              </span>
            </h2>

            {/* Customer Picker */}
            <div className="space-y-2 mb-5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Pelanggan (Orang Tua & Anak) *
              </label>

              {selectedCustomer ? (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{selectedCustomer.parent_name}</p>
                    <p className="text-xs text-slate-600">Anak: {selectedCustomer.child_name} | {selectedCustomer.phone}</p>
                    <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                      Saldo: {selectedCustomer.points_balance || 0} Poin
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-xs font-bold text-amber-700 hover:underline"
                  >
                    Ubah
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      fetchCustomers();
                      setIsCustomerModalOpen(true);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-all"
                  >
                    <Search className="w-4 h-4" /> Cari Pelanggan
                  </button>
                  <button
                    onClick={() => setIsNewCustModalOpen(true)}
                    className="py-2.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-2xs transition-all"
                  >
                    <UserPlus className="w-4 h-4" /> Baru
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 mb-5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'qris', label: 'QRIS', icon: QrCode },
                  { id: 'cash', label: 'Tunai', icon: Banknote },
                  { id: 'transfer', label: 'Transfer', icon: CreditCard }
                ].map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`py-2 px-2.5 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === pm.id
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {pm.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Points Info */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between mb-5">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Perolehan Poin Kunjungan:
              </span>
              <span className="text-xs font-bold text-amber-800 bg-white px-2.5 py-0.5 rounded-md border border-amber-200">
                +10 Poin
              </span>
            </div>

            {/* Total Price */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-900 space-y-1">
              <span className="text-xs font-medium text-slate-500">Total Biaya Tiket:</span>
              <p className="text-2xl font-bold text-emerald-700">
                Rp {selectedPackage ? calculatePrice(selectedPackage).toLocaleString('id-ID') : '0'}
              </p>
            </div>
          </div>

          <button
            onClick={handleProcessCheckout}
            disabled={loading || !selectedPackage || !selectedCustomer}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Memproses...' : <><Printer className="w-4 h-4" /> Cetak Tiket & Bayar</>}
          </button>
        </div>
      </div>

      {/* Recent Transactions List Section */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-emerald-600" /> Riwayat Transaksi Tiket Terbaru
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode / nama..."
              value={searchTrx}
              onChange={(e) => setSearchTrx(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs text-slate-700 min-w-[600px]">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Kode Trx</th>
                <th className="p-3">Pelanggan</th>
                <th className="p-3">Paket</th>
                <th className="p-3">Total Biaya</th>
                <th className="p-3">Metode</th>
                <th className="p-3">Poin</th>
                <th className="p-3">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-6 text-slate-400 font-medium">
                    Belum ada transaksi tiket.
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50 transition-all">
                    <td className="p-3 font-bold text-emerald-700 whitespace-nowrap">{trx.trx_code}</td>
                    <td className="p-3 font-semibold text-slate-900">{trx.customer_name || 'Pelanggan'}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                        {trx.package_name}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                      Rp {Number(trx.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 uppercase font-bold text-slate-500 whitespace-nowrap">{trx.payment_method}</td>
                    <td className="p-3 font-bold text-amber-600 whitespace-nowrap">+{trx.points_earned} Poin</td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {new Date(trx.created_at).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={trxPage}
          totalPages={trxTotalPages}
          limit={trxLimit}
          total={trxTotal}
          onPageChange={setTrxPage}
          onLimitChange={setTrxLimit}
        />

      </div>

      {/* Select Customer Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Pilih Pelanggan"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Cari nama orang tua/anak/HP..."
            onChange={(e) => fetchCustomers(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="max-h-64 overflow-y-auto space-y-2">
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCustomer(c);
                  setIsCustomerModalOpen(false);
                }}
                className="p-3 rounded-xl border border-slate-200 hover:bg-emerald-50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-900 text-sm">{c.parent_name}</p>
                  <p className="text-xs text-slate-500 font-medium">Anak: {c.child_name} | {c.phone}</p>
                </div>
                <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md border border-amber-200">
                  {c.points_balance || 0} Poin
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Register New Customer Modal */}
      <Modal
        isOpen={isNewCustModalOpen}
        onClose={() => setIsNewCustModalOpen(false)}
        title="Pendaftaran Pelanggan Baru"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Nama Orang Tua *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Bunda Ani"
              value={newCustForm.parent_name}
              onChange={(e) => setNewCustForm({ ...newCustForm, parent_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Nama Anak *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Rizky"
              value={newCustForm.child_name}
              onChange={(e) => setNewCustForm({ ...newCustForm, child_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">No WhatsApp / Telepon *</label>
            <input
              type="tel"
              required
              placeholder="Contoh: 081234567890"
              value={newCustForm.phone}
              onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewCustModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-2xs"
            >
              Simpan & Pilih
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Struk Tiket Kinderfun"
      >
        {currentReceipt && (
          <div className="space-y-6 text-center">
            <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-4">
              <div>
                <h4 className="text-lg font-bold font-sans text-slate-900">KINDERFUN PLAYGROUND</h4>
                <p className="text-xs text-slate-500 font-semibold text-amber-600">Fun for kids, peace of mind for parents</p>
              </div>

              <div className="border-t border-b border-slate-200 py-3 text-xs text-left space-y-1 text-slate-700">
                <p><strong>No Tiket:</strong> {currentReceipt.trx_code}</p>
                <p><strong>Pelanggan:</strong> {currentReceipt.customer_name}</p>
                <p><strong>Paket:</strong> {currentReceipt.package_name}</p>
                <p><strong>Biaya:</strong> Rp {Number(currentReceipt.amount).toLocaleString('id-ID')}</p>
                <p><strong>Poin Kunjungan:</strong> +10 Poin</p>
                <p><strong>Waktu:</strong> {currentReceipt.date}</p>
              </div>

              <p className="text-xs font-semibold text-slate-600">
                Selamat bermain! Harap selalu mengawasi si kecil.
              </p>
            </div>

            <button
              onClick={() => {
                printThermalReceipt(currentReceipt);
                setIsReceiptModalOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-2xs"
            >
              <Printer className="w-4 h-4" /> Cetak Struk
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
