import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import toast from 'react-hot-toast';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail,
  Lock
} from 'lucide-react';

export const AdminStaffPage = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    phone: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [page, limit, search]);

  const fetchUsers = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.USERS.LIST, { page, limit, search });
      if (res.success) {
        setUsers(res.data);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat data pegawai');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Nama dan email wajib diisi');
      return;
    }
    if (!editingUser && !form.password) {
      toast.error('Password wajib diisi untuk pegawai baru');
      return;
    }

    try {
      if (editingUser) {
        const res = await request.put(API_ENDPOINTS.USERS.UPDATE(editingUser.id), form);
        if (res.success) {
          toast.success('Data pegawai berhasil diperbarui');
          setIsModalOpen(false);
          fetchUsers();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.USERS.CREATE, form);
        if (res.success) {
          toast.success('Pegawai baru berhasil ditambahkan');
          setIsModalOpen(false);
          fetchUsers();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data pegawai');
    }
  };

  const handleDelete = (userItem) => {
    toast((t) => (
      <div className="space-y-3">
        <p className="font-bold text-slate-800 text-sm">
          Apakah Anda yakin ingin menghapus data pegawai <strong>{userItem.name}</strong> ({userItem.email})?
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
                const res = await request.delete(API_ENDPOINTS.USERS.DELETE(userItem.id));
                if (res.success) {
                  toast.success('Pegawai berhasil dihapus');
                  fetchUsers();
                }
              } catch (err) {
                toast.error(err.message || 'Gagal menghapus pegawai');
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

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'staff', phone: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (userItem) => {
    setEditingUser(userItem);
    setForm({
      name: userItem.name,
      email: userItem.email,
      password: '',
      role: userItem.role || 'staff',
      phone: userItem.phone || ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Clean White */}
      <div className="p-6 rounded-2xl bg-white text-slate-900 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-purple-600" /> Akses Khusus Admin
          </div>
          <h1 className="text-xl font-bold tracking-wide text-slate-900">
            Manajemen Pegawai & Staf
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Tambah, perbarui, dan atur hak akses akun staf kasir & admin.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Tambah Pegawai Baru
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau email pegawai..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Pegawai</th>
                <th className="p-3">Email</th>
                <th className="p-3">No Telepon</th>
                <th className="p-3">Role Akses</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-slate-400 font-medium">
                    Tidak ada data pegawai.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-all">
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-600 font-medium">{u.email}</td>
                    <td className="p-3 text-slate-600 font-medium">{u.phone || '-'}</td>
                    <td className="p-3">
                      {u.role === 'admin' ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-purple-600" /> Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold inline-flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" /> Staf / Kasir
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                          title="Edit Pegawai"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all"
                          title="Hapus Pegawai"
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

      {/* Modal Create / Edit Pegawai */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Nama Lengkap *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Email *</label>
            <input
              type="email"
              required
              placeholder="budi@kinderfun.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              {editingUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password *'}
            </label>
            <input
              type="password"
              required={!editingUser}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">No. WhatsApp / Telepon</label>
            <input
              type="tel"
              placeholder="081234567890"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Role Akses *</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="staff">Staf / Kasir</option>
              <option value="admin">Admin</option>
            </select>
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
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-2xs"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
