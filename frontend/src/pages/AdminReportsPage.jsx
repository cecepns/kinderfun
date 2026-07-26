import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { exportToExcel } from '../utils/excelExport';
import { directPrint } from '../utils/printHelper';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Users, 
  UserCheck, 
  Calendar, 
  Filter, 
  Award, 
  Sparkles,
  Download,
  Printer
} from 'lucide-react';


export const AdminReportsPage = () => {
  const [activeTab, setActiveTab] = useState('visitors');
  const [period, setPeriod] = useState('daily');

  const [visitorStats, setVisitorStats] = useState({
    total_visitors: 0,
    total_points_awarded: 0,
    recent_visitors: []
  });

  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'visitors') {
      fetchVisitorReports();
    } else {
      fetchAttendanceReports();
    }
  }, [activeTab, period]);

  const fetchVisitorReports = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.REPORTS.VISITORS, { period });
      if (res.success) {
        setVisitorStats(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat laporan pengunjung');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceReports = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.ATTENDANCE.LIST, { limit: 100 });
      if (res.success) {
        setAttendanceLogs(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat laporan presensi');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handleExportVisitors = () => {
    if (!visitorStats.recent_visitors.length) {
      toast.error('Tidak ada data untuk diexport');
      return;
    }
    const headers = [
      { label: 'Kode Transaksi', key: 'trx_code' },
      { label: 'Nama Pelanggan', key: 'customer_name' },
      { label: 'Paket Bermain', key: 'package_name' },
      { label: 'Biaya Tiket', key: 'amount' },
      { label: 'Poin Kunjungan', key: 'points_earned' },
      { label: 'Waktu Transaksi', key: 'created_at' }
    ];
    exportToExcel(visitorStats.recent_visitors, headers, `Laporan_Pengunjung_${period}`);
    toast.success('Laporan Pengunjung berhasil diexport ke Excel!');
  };

  const handleExportAttendance = () => {
    if (!attendanceLogs.length) {
      toast.error('Tidak ada data presensi untuk diexport');
      return;
    }
    const exportData = attendanceLogs.map(log => ({
      Nama_Staf: log.staff_name,
      Tanggal: formatDate(log.attendance_date),
      Jam_Masuk: log.check_in_time || '-',
      Jam_Keluar: log.check_out_time || '-',
      Status: log.status === 'present' ? 'Hadir' : log.status === 'late' ? 'Terlambat' : log.status === 'on_leave' ? 'Izin/Cuti' : 'Alpha',
      Catatan: log.notes || '-'
    }));
    exportToExcel(exportData, [
      { label: 'Nama Staf', key: 'Nama_Staf' },
      { label: 'Tanggal', key: 'Tanggal' },
      { label: 'Jam Masuk', key: 'Jam_Masuk' },
      { label: 'Jam Keluar', key: 'Jam_Keluar' },
      { label: 'Status', key: 'Status' },
      { label: 'Catatan', key: 'Catatan' }
    ], 'Laporan_Presensi_Staf');
    toast.success('Laporan Presensi Staf berhasil diexport ke Excel!');
  };

  const handlePrintReports = () => {
    const periodLabel = period === 'daily' ? 'Harian' : period === 'weekly' ? 'Mingguan' : 'Bulanan';

    if (activeTab === 'visitors') {
      const contentHtml = `
        <div class="summary-cards">
          <div class="card">
            <div class="card-label">Total Pengunjung / Transaksi</div>
            <div class="card-value">${visitorStats.total_visitors} Anak</div>
          </div>
          <div class="card">
            <div class="card-label">Total Poin Diberikan</div>
            <div class="card-value" style="color:#8b5cf6;">${visitorStats.total_points_awarded} Pts</div>
          </div>
        </div>

        <h3 style="margin-top:20px; font-size:14px; font-weight:700; color:#0f172a;">Daftar Transaksi Tiket Pengunjung (${periodLabel})</h3>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Kode TRX</th>
              <th>Nama Pelanggan</th>
              <th>Paket Bermain</th>
              <th>Poin</th>
              <th style="text-align:right;">Total Biaya (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${visitorStats.recent_visitors.length === 0 ? `<tr><td colspan="6" style="text-align:center;">Tidak ada data transaksi.</td></tr>` :
              visitorStats.recent_visitors.map((v, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${v.trx_code}</strong></td>
                  <td>${v.customer_name || '-'}</td>
                  <td>${v.package_name || '-'}</td>
                  <td>${v.points_earned || 0} Pts</td>
                  <td style="text-align:right; font-weight:700;">Rp ${Number(v.amount).toLocaleString('id-ID')}</td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      `;

      directPrint({
        title: `Laporan Pengunjung Playground (${periodLabel})`,
        contentHtml
      });
    } else {
      const contentHtml = `
        <h3 style="margin-top:10px; font-size:14px; font-weight:700; color:#0f172a;">Laporan Kehadiran & Presensi Staf</h3>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Staf</th>
              <th>Tanggal</th>
              <th>Jam Masuk</th>
              <th>Jam Keluar</th>
              <th>Status</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            ${attendanceLogs.length === 0 ? `<tr><td colspan="7" style="text-align:center;">Tidak ada log presensi.</td></tr>` :
              attendanceLogs.map((log, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${log.staff_name}</strong></td>
                  <td>${formatDate(log.attendance_date)}</td>
                  <td>${log.check_in_time || '-'}</td>
                  <td>${log.check_out_time || '-'}</td>
                  <td>${log.status === 'present' ? 'Hadir' : log.status === 'late' ? 'Terlambat' : 'Izin'}</td>
                  <td>${log.notes || '-'}</td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      `;

      directPrint({
        title: `Laporan Presensi Staf Kinderfun`,
        contentHtml
      });
    }
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Banner Header - Fully Responsive */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white text-slate-900 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4 text-purple-600" /> Laporan Khusus Admin
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-slate-900">
            Presensi & Pengunjung
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Pantau statistik kedatangan anak & kinerja kehadiran staf secara realtime.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Period Filter Selector */}
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
              onClick={handlePrintReports}
              className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-white" /> Cetak Langsung
            </button>
            <button
              onClick={activeTab === 'visitors' ? handleExportVisitors : handleExportAttendance}
              className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4 text-white" /> Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('visitors')}
          className={`pb-3 font-bold text-xs flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'visitors'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Laporan Pengunjung
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 font-bold text-xs flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Laporan Presensi Staf
        </button>
      </div>

      {/* Tab 1: Visitors Report */}
      {activeTab === 'visitors' && (
        <div className="space-y-5 md:space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-lg border border-purple-100 flex-shrink-0">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Kunjungan</span>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {visitorStats.total_visitors} <span className="text-xs font-normal text-slate-500">Anak</span>
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-100 flex-shrink-0">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Poin Diberikan</span>
                <p className="text-2xl font-bold text-emerald-600 mt-0.5">
                  +{visitorStats.total_points_awarded} <span className="text-xs font-normal text-slate-500">Poin</span>
                </p>
              </div>
            </div>
          </div>

          {/* Visitors Log Table */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Rincian Kunjungan Pelanggan ({period === 'daily' ? 'Hari Ini' : period === 'weekly' ? '7 Hari Terakhir' : '30 Hari Terakhir'})
            </h3>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-xs text-slate-700 min-w-[650px]">
                <thead className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">No Tiket</th>
                    <th className="p-3">Pelanggan (Ortu & Anak)</th>
                    <th className="p-3">Paket Bermain</th>
                    <th className="p-3">Nominal Tiket</th>
                    <th className="p-3">Perolehan Poin</th>
                    <th className="p-3">Waktu Transaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visitorStats.recent_visitors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-6 text-slate-400 font-medium">
                        Tidak ada data kunjungan pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    visitorStats.recent_visitors.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50 transition-all">
                        <td className="p-3 font-bold text-purple-700 whitespace-nowrap">{v.trx_code}</td>
                        <td className="p-3 font-semibold text-slate-900">{v.customer_name || 'Pelanggan'}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 font-semibold border border-purple-200">
                            {v.package_name}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                          Rp {Number(v.amount).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 font-bold text-emerald-600 whitespace-nowrap">+{v.points_earned} Poin</td>
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          {new Date(v.created_at).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Report */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Rekapitulasi Presensi & Kehadiran Staf
          </h3>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs text-slate-700 min-w-[600px]">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Staf</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Jam Masuk</th>
                  <th className="p-3">Jam Pulang</th>
                  <th className="p-3">Status Kehadiran</th>
                  <th className="p-3">Catatan Staf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-slate-400 font-medium">
                      Belum ada log presensi staf.
                    </td>
                  </tr>
                ) : (
                  attendanceLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-all">
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{log.staff_name}</td>
                      <td className="p-3 text-slate-600 font-semibold whitespace-nowrap">{formatDate(log.attendance_date)}</td>
                      <td className="p-3 font-bold text-emerald-600 whitespace-nowrap">{log.check_in_time || '-'}</td>
                      <td className="p-3 font-bold text-rose-600 whitespace-nowrap">{log.check_out_time || '-'}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          log.status === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {log.status === 'present' ? 'Tepat Waktu' : 'Terlambat'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">{log.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
