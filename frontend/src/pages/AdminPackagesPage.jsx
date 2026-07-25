import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from '../components/Modal';
import toast from 'react-hot-toast';
import { 
  Ticket, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  Sparkles,
  DollarSign,
  Tag
} from 'lucide-react';

export const AdminPackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    duration_hours: 1,
    weekday_price: '',
    weekend_price: '',
    best_value: false,
    is_member_package: false
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.PACKAGES.LIST);
      if (res.success) {
        setPackages(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat paket bermain');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || form.weekday_price === '' || form.weekend_price === '') {
      toast.error('Nama paket, tarif weekday, dan tarif weekend wajib diisi');
      return;
    }

    try {
      if (editingPackage) {
        const res = await request.put(API_ENDPOINTS.PACKAGES.UPDATE(editingPackage.id), form);
        if (res.success) {
          toast.success('Paket bermain & harga berhasil diperbarui!');
          setIsModalOpen(false);
          fetchPackages();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.PACKAGES.CREATE, form);
        if (res.success) {
          toast.success('Paket bermain baru berhasil ditambahkan!');
          setIsModalOpen(false);
          fetchPackages();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan paket');
    }
  };

  const handleDelete = (pkg) => {
    toast((t) => (
      <div className="space-y-3">
        <p className="font-bold text-slate-800 text-sm">
          Apakah Anda yakin ingin menghapus paket <strong>{pkg.name}</strong>?
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
                const res = await request.delete(API_ENDPOINTS.PACKAGES.DELETE(pkg.id));
                if (res.success) {
                  toast.success('Paket bermain berhasil dihapus');
                  fetchPackages();
                }
              } catch (err) {
                toast.error(err.message || 'Gagal menghapus paket');
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
    setEditingPackage(null);
    setForm({
      name: '',
      duration_hours: 1,
      weekday_price: '',
      weekend_price: '',
      best_value: false,
      is_member_package: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setEditingPackage(pkg);
    setForm({
      name: pkg.name,
      duration_hours: pkg.duration_hours,
      weekday_price: pkg.weekday_price,
      weekend_price: pkg.weekend_price,
      best_value: pkg.best_value === 1,
      is_member_package: pkg.is_member_package === 1
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Banner Header */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white text-slate-900 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
            <Ticket className="w-4 h-4 text-emerald-600" /> Akses Khusus Admin
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-slate-900">
            Manajemen Tarif & Paket Bermain
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Kelola daftar paket bermain, tarif Weekday/Weekend, dan penawaran spesial.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Paket Baru
        </button>
      </div>

      {/* Grid of Packages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> {pkg.duration_hours} Jam
                </span>

                {pkg.best_value === 1 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shadow-2xs">
                    ★ Best Value
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{pkg.name}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {pkg.is_member_package === 1 ? 'Paket Keanggotaan Member' : 'Paket Tiket Regular'}
              </p>

              {/* Price Details */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Weekday:</span>
                  <span className="font-bold text-slate-900">
                    Rp {Number(pkg.weekday_price).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Weekend / Libur:</span>
                  <span className="font-bold text-rose-600">
                    Rp {Number(pkg.weekend_price).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(pkg)}
                className="py-1.5 px-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center gap-1 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDelete(pkg)}
                className="py-1.5 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Create / Edit Package */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPackage ? 'Edit Paket & Harga' : 'Tambah Paket Bermain Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Nama Paket *</label>
            <input
              type="text"
              required
              placeholder="Contoh: 1 Jam / Paket Hemat 2 Jam"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Durasi Bermain (Jam) *</label>
            <input
              type="number"
              min={1}
              required
              value={form.duration_hours}
              onChange={(e) => setForm({ ...form, duration_hours: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Tarif Weekday (Rp) *</label>
              <input
                type="number"
                required
                min={0}
                placeholder="30000"
                value={form.weekday_price}
                onChange={(e) => setForm({ ...form, weekday_price: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Tarif Weekend / Libur (Rp) *</label>
              <input
                type="number"
                required
                min={0}
                placeholder="40000"
                value={form.weekend_price}
                onChange={(e) => setForm({ ...form, weekend_price: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="best_value_check"
                checked={form.best_value}
                onChange={(e) => setForm({ ...form, best_value: e.target.checked })}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
              />
              <label htmlFor="best_value_check" className="text-xs font-bold text-slate-700 cursor-pointer">
                Tandai sebagai Paket "Best Value" (Disarankan)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="member_pkg_check"
                checked={form.is_member_package}
                onChange={(e) => setForm({ ...form, is_member_package: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <label htmlFor="member_pkg_check" className="text-xs font-bold text-slate-700 cursor-pointer">
                Tandai sebagai Paket Keanggotaan Member
              </label>
            </div>
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-2xs"
            >
              Simpan Paket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
