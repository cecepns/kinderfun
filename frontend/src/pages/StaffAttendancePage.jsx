import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import toast from 'react-hot-toast';
import { 
  UserCheck, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  LogIn, 
  LogOut,
  Plus,
  Edit3,
  Trash2,
  Search
} from 'lucide-react';

export const StaffAttendancePage = ({ user }) => {
  const [attendance, setAttendance] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('id-ID'));

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState({
    staff_name: '',
    attendance_date: new Date().toISOString().split('T')[0],
    check_in_time: '08:30:00',
    check_out_time: '17:00:00',
    status: 'present',
    notes: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAttendance();
    if (user?.role === 'admin') {
      fetchStaffList();
    }
  }, [page, limit, search]);

  const fetchAttendance = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.ATTENDANCE.LIST, { page, limit, search });
      if (res.success) {
        setAttendance(res.data);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);

        const today = new Date().toISOString().split('T')[0];
        const rec = res.data.find(a => a.user_id === (user?.id || 2) && a.attendance_date === today);
        setTodayRecord(rec || null);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat data presensi');
    }
  };

  const fetchStaffList = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.USERS.LIST, { limit: 100 });
      if (res.success) setStaffList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await request.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN, {
        user_id: user?.id || 2,
        staff_name: user?.name || 'Staff Playground',
        notes
      });
      if (res.success) {
        toast.success(res.message || 'Check-In Berhasil!');
        setNotes('');
        fetchAttendance();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal Check-In');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const res = await request.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT, {
        user_id: user?.id || 2
      });
      if (res.success) {
        toast.success(res.message || 'Check-Out Berhasil!');
        fetchAttendance();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal Check-Out');
    } finally {
      setLoading(false);
    }
  };

  // Admin Manual Save (Create / Edit)
  const handleAdminSave = async (e) => {
    e.preventDefault();
    if (!form.staff_name || !form.attendance_date) {
      toast.error('Nama staf dan tanggal presensi wajib diisi');
      return;
    }

    try {
      if (editingRecord) {
        const res = await request.put(API_ENDPOINTS.ATTENDANCE.UPDATE(editingRecord.id), form);
        if (res.success) {
          toast.success('Data presensi berhasil diperbarui!');
          setIsModalOpen(false);
          fetchAttendance();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.ATTENDANCE.CREATE, form);
        if (res.success) {
          toast.success('Data presensi berhasil ditambahkan!');
          setIsModalOpen(false);
          fetchAttendance();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data presensi');
    }
  };

  // Admin Delete Record
  const handleAdminDelete = (rec) => {
    toast((t) => (
      <div className="space-y-3">
        <p className="font-bold text-slate-800 text-sm">
          Apakah Anda yakin ingin menghapus data presensi <strong>{rec.staff_name}</strong> tanggal {rec.attendance_date}?
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
                const res = await request.delete(API_ENDPOINTS.ATTENDANCE.DELETE(rec.id));
                if (res.success) {
                  toast.success('Data presensi berhasil dihapus');
                  fetchAttendance();
                }
              } catch (err) {
                toast.error(err.message || 'Gagal menghapus presensi');
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
    setEditingRecord(null);
    setForm({
      staff_name: staffList[0]?.name || 'Staff Kasir 1',
      attendance_date: new Date().toISOString().split('T')[0],
      check_in_time: '08:30:00',
      check_out_time: '17:00:00',
      status: 'present',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (rec) => {
    setEditingRecord(rec);
    setForm({
      staff_name: rec.staff_name,
      attendance_date: rec.attendance_date ? rec.attendance_date.split('T')[0] : new Date().toISOString().split('T')[0],
      check_in_time: rec.check_in_time || '08:30:00',
      check_out_time: rec.check_out_time || '',
      status: rec.status || 'present',
      notes: rec.notes || ''
    });
    setIsModalOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-white text-slate-900 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
            <UserCheck className="w-4 h-4 text-purple-600" /> Presensi Staf Kinderfun
          </div>
          <h1 className="text-xl font-bold tracking-wide text-slate-900">
            Absensi Harian Staf
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Lakukan Check-In saat kedatangan dan Check-Out sebelum pulang.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin Add Manual Attendance */}
          {user?.role === 'admin' && (
            <button
              onClick={openCreateModal}
              className="py-2.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tambah Presensi Staf
            </button>
          )}

          {/* Live Clock Card */}
          <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-100 text-center">
            <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium justify-center">
              <Calendar className="w-3.5 h-3.5 text-purple-600" /> {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="text-2xl font-bold font-mono text-purple-700 mt-0.5">
              {currentTime}
            </div>
          </div>
        </div>
      </div>

      {/* Check In / Out Widget */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" /> Presensi Anda Hari Ini ({user?.name || 'Kasir Staf'})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Status Hari Ini</span>
              {todayRecord ? (
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${
                  todayRecord.status === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {todayRecord.status === 'present' ? 'Tepat Waktu' : 'Terlambat'}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-600 text-xs font-semibold">
                  Belum Check-In
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Jam Masuk</span>
                <span className="text-base font-bold text-emerald-600">
                  {todayRecord?.check_in_time || '--:--'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Jam Pulang</span>
                <span className="text-base font-bold text-rose-600">
                  {todayRecord?.check_out_time || '--:--'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Catatan Presensi (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Shift Pagi / Izin singkat"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!!todayRecord}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheckIn}
                disabled={loading || !!todayRecord}
                className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Check-In Masuk
              </button>

              <button
                onClick={handleCheckOut}
                disabled={loading || !todayRecord || !!todayRecord?.check_out_time}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Check-Out Pulang
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-600" /> Riwayat Presensi Seluruh Staf
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama staf..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Staf</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Check-In</th>
                <th className="p-3">Check-Out</th>
                <th className="p-3">Status</th>
                <th className="p-3">Catatan</th>
                {user?.role === 'admin' && <th className="p-3 text-center">Aksi Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 7 : 6} className="text-center p-6 text-slate-400 font-medium">
                    Belum ada data presensi.
                  </td>
                </tr>
              ) : (
                attendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-all">
                    <td className="p-3 font-bold text-slate-900">{rec.staff_name}</td>
                    <td className="p-3 text-slate-600 font-semibold">{formatDate(rec.attendance_date)}</td>
                    <td className="p-3 font-bold text-emerald-600">{rec.check_in_time || '-'}</td>
                    <td className="p-3 font-bold text-rose-600">{rec.check_out_time || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        rec.status === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {rec.status === 'present' ? 'Tepat Waktu' : 'Terlambat'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{rec.notes || '-'}</td>
                    {user?.role === 'admin' && (
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(rec)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                            title="Edit Presensi"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAdminDelete(rec)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all"
                            title="Hapus Presensi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
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

      {/* Admin Create / Edit Modal */}
      {user?.role === 'admin' && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRecord ? 'Edit Presensi Staf' : 'Tambah Presensi Staf Manual'}
        >
          <form onSubmit={handleAdminSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Nama Staf *</label>
              <input
                type="text"
                required
                placeholder="Nama staf..."
                value={form.staff_name}
                onChange={(e) => setForm({ ...form, staff_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Presensi *</label>
              <input
                type="date"
                required
                value={form.attendance_date}
                onChange={(e) => setForm({ ...form, attendance_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Jam Masuk (HH:MM:SS)</label>
                <input
                  type="text"
                  placeholder="08:30:00"
                  value={form.check_in_time}
                  onChange={(e) => setForm({ ...form, check_in_time: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Jam Pulang (HH:MM:SS)</label>
                <input
                  type="text"
                  placeholder="17:00:00"
                  value={form.check_out_time}
                  onChange={(e) => setForm({ ...form, check_out_time: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Status Kehadiran *</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="present">Tepat Waktu</option>
                <option value="late">Terlambat</option>
                <option value="absent">Absen / Tidak Hadir</option>
                <option value="on_leave">Izin / Cuti</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Catatan (Opsional)</label>
              <textarea
                rows={2}
                placeholder="Catatan tambahan..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
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
      )}
    </div>
  );
};
