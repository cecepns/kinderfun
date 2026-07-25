import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import toast from 'react-hot-toast';
import { 
  Award, 
  Search, 
  UserPlus, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  MinusCircle, 
  Sparkles,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';

export const CustomerPointsPage = () => {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Form State
  const [form, setForm] = useState({
    parent_name: '',
    child_name: '',
    phone: '',
    email: '',
    is_member: false
  });

  const [pointDelta, setPointDelta] = useState(10);
  const [pointAction, setPointAction] = useState('add');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [page, limit, debouncedSearch]);

  const fetchCustomers = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.CUSTOMERS.LIST, {
        page,
        limit,
        search: debouncedSearch
      });
      if (res.success) {
        setCustomers(res.data);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat data pelanggan');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.parent_name || !form.child_name || !form.phone) {
      toast.error('Nama orang tua, nama anak, dan telepon wajib diisi');
      return;
    }

    try {
      if (editingCustomer) {
        const res = await request.put(API_ENDPOINTS.CUSTOMERS.UPDATE(editingCustomer.id), form);
        if (res.success) {
          toast.success('Data pelanggan berhasil diperbarui');
          setIsModalOpen(false);
          fetchCustomers();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.CUSTOMERS.CREATE, form);
        if (res.success) {
          toast.success('Pelanggan baru berhasil ditambahkan');
          setIsModalOpen(false);
          fetchCustomers();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data');
    }
  };

  const handleDelete = (cust) => {
    toast((t) => (
      <div className="space-y-3">
        <p className="font-bold text-slate-800 text-sm">
          Apakah Anda yakin ingin menghapus data pelanggan <strong>{cust.parent_name}</strong>?
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
                const res = await request.delete(API_ENDPOINTS.CUSTOMERS.DELETE(cust.id));
                if (res.success) {
                  toast.success('Pelanggan berhasil dihapus');
                  fetchCustomers();
                }
              } catch (err) {
                toast.error(err.message || 'Gagal menghapus pelanggan');
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

  const handleAdjustPoints = async () => {
    if (!editingCustomer) return;
    const currentPoints = editingCustomer.points_balance || 0;
    const delta = parseInt(pointDelta) || 0;
    const newPoints = pointAction === 'add' ? currentPoints + delta : Math.max(0, currentPoints - delta);

    try {
      const res = await request.put(API_ENDPOINTS.CUSTOMERS.UPDATE(editingCustomer.id), {
        ...editingCustomer,
        points_balance: newPoints
      });
      if (res.success) {
        toast.success(`Poin berhasil ${pointAction === 'add' ? 'ditambahkan' : 'dikurangi'}`);
        setIsPointModalOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mengubah poin');
    }
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setForm({ parent_name: '', child_name: '', phone: '', email: '', is_member: false });
    setIsModalOpen(true);
  };

  const openEditModal = (cust) => {
    setEditingCustomer(cust);
    setForm({
      parent_name: cust.parent_name,
      child_name: cust.child_name,
      phone: cust.phone,
      email: cust.email || '',
      is_member: cust.is_member === 1
    });
    setIsModalOpen(true);
  };

  const openPointModal = (cust) => {
    setEditingCustomer(cust);
    setPointDelta(10);
    setPointAction('add');
    setIsPointModalOpen(true);
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header Banner - Clean White */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white text-slate-900 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200">
            <Award className="w-4 h-4 text-amber-600" /> Modul Loyalitas Kinderfun
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-slate-900">
            Pencatatan Poin Pelanggan
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Kelola saldo poin, keanggotaan member, dan data orang tua & anak.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Tambah Pelanggan
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        {/* Search & Info Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama ortu, anak, atau telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            * Setiap 1 kunjungan otomatis mendapatkan <strong className="text-amber-600">10 Poin</strong>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs text-slate-700 min-w-[650px]">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Orang Tua</th>
                <th className="p-3">Nama Anak</th>
                <th className="p-3">No. HP / Telepon</th>
                <th className="p-3">Member</th>
                <th className="p-3">Saldo Poin</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-slate-400 font-medium">
                    Tidak ada data pelanggan.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50 transition-all">
                    <td className="p-3 font-bold text-slate-900">{cust.parent_name}</td>
                    <td className="p-3 font-semibold text-slate-700">{cust.child_name}</td>
                    <td className="p-3 text-slate-600 font-medium whitespace-nowrap">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {cust.phone}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {cust.is_member === 1 ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                          ★ Member
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-medium">
                          Non-Member
                        </span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {cust.points_balance || 0} Poin
                      </div>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openPointModal(cust)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all text-xs font-semibold flex items-center gap-1"
                          title="Tambah/Kurang Poin"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Adjust Poin
                        </button>
                        <button
                          onClick={() => openEditModal(cust)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                          title="Edit Customer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cust)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all"
                          title="Hapus Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

      {/* Create / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Data Pelanggan' : 'Daftar Pelanggan Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Nama Orang Tua *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Bunda Ani"
              value={form.parent_name}
              onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Nama Anak *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Rizky"
              value={form.child_name}
              onChange={(e) => setForm({ ...form, child_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">No. WhatsApp / Telepon *</label>
            <input
              type="tel"
              required
              placeholder="Contoh: 081311112222"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Email (Opsional)</label>
            <input
              type="email"
              placeholder="ani@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_member_check"
              checked={form.is_member}
              onChange={(e) => setForm({ ...form, is_member: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
            />
            <label htmlFor="is_member_check" className="text-xs font-bold text-slate-700 cursor-pointer">
              Tandai sebagai Paket Member Kinderfun
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-2xs"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Points Modal */}
      <Modal
        isOpen={isPointModalOpen}
        onClose={() => setIsPointModalOpen(false)}
        title="Penyesuaian Poin Manual"
      >
        {editingCustomer && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Pelanggan:</p>
              <p className="text-base font-bold text-slate-900">{editingCustomer.parent_name} ({editingCustomer.child_name})</p>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Saldo Poin Saat Ini: <strong>{editingCustomer.points_balance || 0} Poin</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPointAction('add')}
                className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 ${
                  pointAction === 'add' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <PlusCircle className="w-4 h-4" /> Tambah Poin
              </button>
              <button
                type="button"
                onClick={() => setPointAction('subtract')}
                className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 ${
                  pointAction === 'subtract' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <MinusCircle className="w-4 h-4" /> Kurangi Poin
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Jumlah Poin *</label>
              <input
                type="number"
                min={1}
                value={pointDelta}
                onChange={(e) => setPointDelta(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPointModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAdjustPoints}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-2xs"
              >
                Konfirmasi Penyesuaian
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
