import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { exportToExcel } from '../utils/excelExport';
import { directPrint } from '../utils/printHelper';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import toast from 'react-hot-toast';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  PlusCircle, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Wallet,
  Download,
  Search,
  Printer
} from 'lucide-react';


export const AdminFinancePage = () => {
  const [period, setPeriod] = useState('monthly');
  const [financeSummary, setFinanceSummary] = useState({
    total_revenue: 0,
    total_expenses: 0,
    net_profit: 0,
    transaction_count: 0,
    expense_count: 0
  });

  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'Operasional',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    fetchFinanceSummary();
    fetchExpenses();
  }, [period, page, limit, search]);

  const fetchFinanceSummary = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.REPORTS.FINANCE, { period });
      if (res.success) {
        setFinanceSummary(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat ringkasan keuangan');
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.EXPENSES.LIST, { page, limit, search });
      if (res.success) {
        setExpenses(res.data);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) {
      toast.error('Judul pengeluaran dan jumlah nominal wajib diisi');
      return;
    }

    try {
      const res = await request.post(API_ENDPOINTS.EXPENSES.CREATE, expenseForm);
      if (res.success) {
        toast.success('Pengeluaran berhasil dicatat!');
        setIsExpenseModalOpen(false);
        setExpenseForm({
          title: '',
          category: 'Operasional',
          amount: '',
          expense_date: new Date().toISOString().split('T')[0],
          description: ''
        });
        fetchFinanceSummary();
        fetchExpenses();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mencatat pengeluaran');
    }
  };

  const handleDeleteExpense = (exp) => {
    toast((t) => (
      <div className="space-y-3">
        <p className="font-bold text-slate-800 text-sm">
          Hapus pengeluaran <strong>{exp.title}</strong> (Rp {Number(exp.amount).toLocaleString('id-ID')})?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
          >
            Batal
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await request.delete(API_ENDPOINTS.EXPENSES.DELETE(exp.id));
                if (res.success) {
                  toast.success('Pengeluaran berhasil dihapus');
                  fetchFinanceSummary();
                  fetchExpenses();
                }
              } catch (err) {
                toast.error(err.message || 'Gagal menghapus pengeluaran');
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
          >
            Hapus
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleExportExpenses = () => {
    if (!expenses.length) {
      toast.error('Tidak ada data pengeluaran untuk diexport');
      return;
    }
    const headers = [
      { label: 'Judul Pengeluaran', key: 'title' },
      { label: 'Kategori', key: 'category' },
      { label: 'Nominal', key: 'amount' },
      { label: 'Tanggal', key: 'expense_date' },
      { label: 'Deskripsi', key: 'description' }
    ];
    exportToExcel(expenses, headers, 'Laporan_Pengeluaran_Keuangan');
    toast.success('Laporan Pengeluaran berhasil diexport ke Excel!');
  };

  const handlePrintFinance = () => {
    const periodLabel = period === 'daily' ? 'Harian' : period === 'weekly' ? 'Mingguan' : 'Bulanan';
    const contentHtml = `
      <div class="summary-cards">
        <div class="card">
          <div class="card-label">Total Pemasukan (Tiket)</div>
          <div class="card-value" style="color: #16a34a;">Rp ${Number(financeSummary.total_revenue).toLocaleString('id-ID')}</div>
        </div>
        <div class="card">
          <div class="card-label">Total Pengeluaran</div>
          <div class="card-value" style="color: #dc2626;">Rp ${Number(financeSummary.total_expenses).toLocaleString('id-ID')}</div>
        </div>
        <div class="card">
          <div class="card-label">Laba Bersih</div>
          <div class="card-value" style="color: #2563eb;">Rp ${Number(financeSummary.net_profit).toLocaleString('id-ID')}</div>
        </div>
      </div>

      <h3 style="margin-top:20px; font-size:14px; font-weight:700; color:#0f172a;">Rincian Pengeluaran Operasional (${periodLabel})</h3>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Judul Pengeluaran</th>
            <th>Kategori</th>
            <th>Tanggal</th>
            <th>Deskripsi</th>
            <th style="text-align:right;">Nominal (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${expenses.length === 0 ? `<tr><td colspan="6" style="text-align:center;">Tidak ada catatan pengeluaran.</td></tr>` : 
            expenses.map((e, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${e.title}</strong></td>
                <td>${e.category || '-'}</td>
                <td>${e.expense_date || '-'}</td>
                <td>${e.description || '-'}</td>
                <td style="text-align:right; font-weight:700;">Rp ${Number(e.amount).toLocaleString('id-ID')}</td>
              </tr>
            `).join('')
          }
        </tbody>
      </table>
    `;

    directPrint({
      title: `Laporan Keuangan & Pengeluaran (${periodLabel})`,
      contentHtml
    });
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Banner Header - Fully Responsive */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white text-slate-900 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-purple-600" /> Laporan Keuangan Playground
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-slate-900">
            Arus Kas & Pengeluaran
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Pantau arus kas pemasukan tiket, pengeluaran operasional, & laba bersih.
          </p>
        </div>

        {/* Action Controls */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Period selector */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center justify-center gap-1">
            {[
              { id: 'daily', label: 'Harian' },
              { id: 'weekly', label: 'Mingguan' },
              { id: 'monthly', label: 'Bulanan' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                  period === p.id ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrintFinance}
              className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Cetak Langsung
            </button>
            <button
              onClick={handleExportExpenses}
              className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Export Excel
            </button>

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-white" /> Pengeluaran
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards - Responsive 1 -> 2 -> 3 Cols */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pemasukan Tiket</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600">
            Rp {Number(financeSummary.total_revenue).toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Total dari {financeSummary.transaction_count} transaksi tiket
          </p>
        </div>

        {/* Total Expenses */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pengeluaran Operasional</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-rose-600">
            Rp {Number(financeSummary.total_expenses).toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Total dari {financeSummary.expense_count} pos pengeluaran
          </p>
        </div>

        {/* Net Profit */}
        <div className="p-4 sm:p-5 rounded-2xl bg-purple-50 text-slate-900 shadow-2xs space-y-2 border border-purple-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Laba Bersih Estimasi</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-purple-800">
            Rp {Number(financeSummary.net_profit).toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            (Pemasukan Tiket - Pengeluaran Operasional)
          </p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-600" /> Daftar Rincian Pengeluaran
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengeluaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs text-slate-700 min-w-[600px]">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Judul Pengeluaran</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Nominal</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Keterangan</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-slate-400 font-medium">
                    Belum ada pengeluaran yang dicatat.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-all">
                    <td className="p-3 font-bold text-slate-900">{exp.title}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200 whitespace-nowrap">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-rose-600 whitespace-nowrap">
                      Rp {Number(exp.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-slate-600 font-medium whitespace-nowrap">{exp.expense_date}</td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{exp.description || '-'}</td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteExpense(exp)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>

      {/* Modal Add Expense */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Catat Pengeluaran Operasional"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Judul / Keperluan Pengeluaran *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Pembelian Sabun Cuci Mainan"
              value={expenseForm.title}
              onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Kategori</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Operasional">Operasional</option>
                <option value="Kebersihan">Kebersihan</option>
                <option value="Utilitas">Utilitas (Listrik/Air/WiFi)</option>
                <option value="Gaji">Gaji Staf</option>
                <option value="Perbaikan">Perbaikan & Maintenance</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Nominal (Rp) *</label>
              <input
                type="number"
                required
                min={1}
                placeholder="150000"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Pengeluaran *</label>
            <input
              type="date"
              required
              value={expenseForm.expense_date}
              onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Deskripsi Tambahan</label>
            <textarea
              rows={3}
              placeholder="Catatan detail pengeluaran..."
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-2xs"
            >
              Simpan Pengeluaran
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
