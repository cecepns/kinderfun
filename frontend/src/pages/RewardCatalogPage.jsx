import React, { useState, useEffect, useRef } from 'react';
import AsyncSelect from 'react-select/async';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import toast from 'react-hot-toast';
import { 
  Gift, 
  Sparkles, 
  Search, 
  ShoppingBag, 
  Plus,
  Edit3,
  Trash2,
  UserCheck,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const RewardCatalogPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'claims'
  const [souvenirs, setSouvenirs] = useState([]);
  const [selectedSouvenir, setSelectedSouvenir] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Claims States
  const [claims, setClaims] = useState([]);
  const [claimsPage, setClaimsPage] = useState(1);
  const [claimsLimit, setClaimsLimit] = useState(10);
  const [claimsTotal, setClaimsTotal] = useState(0);
  const [claimsTotalPages, setClaimsTotalPages] = useState(1);
  const [claimsSearch, setClaimsSearch] = useState('');
  const [claimsDebouncedSearch, setClaimsDebouncedSearch] = useState('');

  // Broken image tracker
  const [failedImages, setFailedImages] = useState({});

  // Modals
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isSouvenirModalOpen, setIsSouvenirModalOpen] = useState(false);
  const [editingSouvenir, setEditingSouvenir] = useState(null);

  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  // Souvenir Form
  const [souvenirForm, setSouvenirForm] = useState({
    name: '',
    point_cost: 10,
    stock: 20,
    description: '',
    image_url: ''
  });

  useEffect(() => {
    fetchSouvenirs();
  }, [page, limit, search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setClaimsDebouncedSearch(claimsSearch);
      setClaimsPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [claimsSearch]);

  useEffect(() => {
    if (activeTab === 'claims' || claims.length > 0) {
      fetchClaims();
    }
  }, [claimsPage, claimsLimit, claimsDebouncedSearch, activeTab]);

  const fetchSouvenirs = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.SOUVENIRS.LIST, { page, limit, search });
      if (res.success) {
        setSouvenirs(res.data);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat souvenir');
    }
  };

  const fetchClaims = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.SOUVENIRS.REDEMPTIONS_LIST, {
        page: claimsPage,
        limit: claimsLimit,
        search: claimsDebouncedSearch
      });
      if (res.success) {
        setClaims(res.data);
        setClaimsTotal(res.pagination.total);
        setClaimsTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat daftar pesanan');
    }
  };

  const handleMarkAsPickedUp = async (claimId) => {
    try {
      const res = await request.put(API_ENDPOINTS.SOUVENIRS.UPDATE_REDEMPTION_STATUS(claimId), {
        status: 'picked_up'
      });
      if (res.success) {
        toast.success('Hadiah telah berhasil diserahkan ke pelanggan!');
        fetchClaims();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui status');
    }
  };

  // Debounced API customer search loader for react-select AsyncSelect
  const loadCustomerOptions = (inputValue, callback) => {
    if (inputValue.length < 1) {
      request.get(API_ENDPOINTS.CUSTOMERS.LIST, { limit: 20, search: '' }).then((res) => {
        if (res.success) {
          const options = res.data.map((c) => ({
            value: c.id,
            label: `${c.parent_name} (${c.child_name}) - HP: ${c.phone} [Poin: ${c.points_balance || 0}]`,
            customer: c
          }));
          callback(options);
        } else {
          callback([]);
        }
      });
      return;
    }

    // Debounce timer
    const timer = setTimeout(async () => {
      try {
        const res = await request.get(API_ENDPOINTS.CUSTOMERS.LIST, { limit: 30, search: inputValue });
        if (res.success) {
          const options = res.data.map((c) => ({
            value: c.id,
            label: `${c.parent_name} (${c.child_name}) - HP: ${c.phone} [Poin: ${c.points_balance || 0}]`,
            customer: c
          }));
          callback(options);
        } else {
          callback([]);
        }
      } catch (err) {
        callback([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  };

  const handleImageError = (id) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const openRedeemModal = (souvenir) => {
    setSelectedSouvenir(souvenir);
    setSelectedCustomer(null);
    setQty(1);
    setIsRedeemModalOpen(true);
  };

  const handleRedeem = async () => {
    if (!selectedCustomer) {
      toast.error('Pilih pelanggan yang akan menukarkan poin');
      return;
    }

    const totalCost = selectedSouvenir.point_cost * qty;
    if ((selectedCustomer.points_balance || 0) < totalCost) {
      toast.error(`Poin ${selectedCustomer.parent_name} tidak mencukupi (${selectedCustomer.points_balance || 0} / ${totalCost} Poin)`);
      return;
    }

    setLoading(true);
    try {
      const res = await request.post(API_ENDPOINTS.SOUVENIRS.REDEEM, {
        customer_id: selectedCustomer.id,
        souvenir_id: selectedSouvenir.id,
        qty: parseInt(qty)
      });

      if (res.success) {
        toast.success(res.message || 'Penukaran Poin Berhasil!');
        setIsRedeemModalOpen(false);
        fetchSouvenirs();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal melakukan penukaran poin');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSouvenir(null);
    setSouvenirForm({ name: '', point_cost: 10, stock: 20, description: '', image_url: '' });
    setIsSouvenirModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingSouvenir(item);
    setSouvenirForm({
      name: item.name,
      point_cost: item.point_cost,
      stock: item.stock,
      description: item.description || '',
      image_url: item.image_url || ''
    });
    setIsSouvenirModalOpen(true);
  };

  const handleSaveSouvenir = async (e) => {
    e.preventDefault();
    if (!souvenirForm.name || !souvenirForm.point_cost) {
      toast.error('Nama souvenir dan jumlah poin wajib diisi');
      return;
    }

    try {
      if (editingSouvenir) {
        const res = await request.put(API_ENDPOINTS.SOUVENIRS.UPDATE(editingSouvenir.id), souvenirForm);
        if (res.success) {
          toast.success('Souvenir berhasil diperbarui!');
          setIsSouvenirModalOpen(false);
          fetchSouvenirs();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.SOUVENIRS.CREATE, souvenirForm);
        if (res.success) {
          toast.success('Souvenir baru berhasil ditambahkan!');
          setIsSouvenirModalOpen(false);
          fetchSouvenirs();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan souvenir');
    }
  };

  const handleDeleteSouvenir = (item) => {
    toast((t) => (
      <div className="space-y-3">
        <p className="font-bold text-slate-800 text-sm">
          Apakah Anda yakin ingin menghapus souvenir <strong>{item.name}</strong>?
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
                const res = await request.delete(API_ENDPOINTS.SOUVENIRS.DELETE(item.id));
                if (res.success) {
                  toast.success('Souvenir berhasil dihapus');
                  fetchSouvenirs();
                }
              } catch (err) {
                toast.error(err.message || 'Gagal menghapus souvenir');
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

  // React Select Custom Styling
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? '#9333ea' : '#cbd5e1',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(147, 51, 234, 0.2)' : 'none',
      '&:hover': { borderColor: '#9333ea' },
      padding: '2px',
      fontSize: '0.875rem'
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      zIndex: 999
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#9333ea' : state.isFocused ? '#f3e8ff' : 'white',
      color: state.isSelected ? 'white' : '#1e293b',
      fontSize: '0.875rem',
      cursor: 'pointer'
    })
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white text-slate-900 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Gift className="w-4 h-4 text-orange-500" /> Katalog Merchandise & Souvenir
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-slate-900">
            Penukaran Reward Poin
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Tukarkan poin pelanggan dengan merchandise menarik dari Kinderfun Playground!
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Tambah Souvenir
        </button>
      </div>

      {/* Main Grid Container */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-5">
        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 -mx-4 sm:-mx-5 px-4 sm:px-5 pb-1">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 -mb-[6px] ${
              activeTab === 'catalog'
                ? 'border-orange-500 text-orange-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Katalog Item ({souvenirs.length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 -mb-[6px] ${
              activeTab === 'claims'
                ? 'border-orange-500 text-orange-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Daftar Pesanan & Klaim
            {claims.some(c => c.status === 'pending') && (
              <span className="absolute top-0 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {activeTab === 'catalog' ? (
          <>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari souvenir..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {souvenirs.map((item) => {
                const isBroken = failedImages[item.id] || !item.image_url;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col justify-between hover:shadow-xs transition-all hover:border-purple-200 group"
                  >
                    <div>
                      {/* Image with Broken Image Fallback */}
                      <div className="w-full h-40 rounded-xl overflow-hidden mb-3 bg-purple-50 border border-purple-100 relative flex items-center justify-center">
                        {isBroken ? (
                          <div className="flex flex-col items-center justify-center text-purple-400 p-4 text-center">
                            <Gift className="w-10 h-10 mb-1 stroke-1" />
                            <span className="text-[10px] font-semibold text-purple-500">Kinderfun Gift</span>
                          </div>
                        ) : (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            onError={() => handleImageError(item.id)}
                            className="w-full h-full object-cover"
                          />
                        )}

                        <span className="absolute top-2.5 right-2.5 bg-purple-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-300" /> {item.point_cost} Poin
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{item.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description || 'Hadiah souvenir menarik untuk anak.'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                          Stok: <strong className="text-slate-900">{item.stock} pcs</strong>
                        </span>

                        {/* Admin Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                            title="Edit Souvenir"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSouvenir(item)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all"
                            title="Hapus Souvenir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => openRedeemModal(item)}
                        disabled={item.stock <= 0}
                        className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Tukar Poin
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              limit={limit}
              total={total}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </>
        ) : (
          <>
            {/* Claims list */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode booking, nama ortu, souvenir..."
                  value={claimsSearch}
                  onChange={(e) => setClaimsSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
                <thead className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Kode Booking</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Souvenir</th>
                    <th className="p-3">Poin / Qty</th>
                    <th className="p-3">Catatan</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-6 text-slate-400 font-medium">
                        Tidak ada daftar pesanan penukaran.
                      </td>
                    </tr>
                  ) : (
                    claims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-slate-50 transition-all">
                        <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{claim.redemption_code}</td>
                        <td className="p-3 text-slate-500 whitespace-nowrap">{claim.created_at?.split('T')[0] || claim.created_at}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{claim.customer_name}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{claim.phone || 'HP Kasir/Langsung'}</div>
                        </td>
                        <td className="p-3 font-semibold text-slate-900">{claim.souvenir_name}</td>
                        <td className="p-3">
                          <div className="font-bold text-purple-700">{claim.points_spent} Pts</div>
                          <div className="text-[10px] text-slate-500">Qty: {claim.qty}</div>
                        </td>
                        <td className="p-3 max-w-[150px] truncate font-medium text-slate-600" title={claim.notes}>
                          {claim.notes || '-'}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {claim.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Siap Diambil
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Sudah Diambil
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          {claim.status === 'pending' && (
                            <button
                              onClick={() => handleMarkAsPickedUp(claim.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-2xs transition-all flex items-center gap-1 mx-auto"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Serahkan Hadiah
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={claimsPage}
              totalPages={claimsTotalPages}
              limit={claimsLimit}
              total={claimsTotal}
              onPageChange={setClaimsPage}
              onLimitChange={setClaimsLimit}
            />
          </>
        )}
      </div>

      {/* Redeem Modal with React-Select Async API Search */}
      <Modal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        title="Form Penukaran Poin"
      >
        {selectedSouvenir && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-purple-50 flex-shrink-0 flex items-center justify-center">
                {failedImages[selectedSouvenir.id] || !selectedSouvenir.image_url ? (
                  <Gift className="w-7 h-7 text-purple-400" />
                ) : (
                  <img src={selectedSouvenir.image_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedSouvenir.name}</h4>
                <p className="text-xs text-purple-700 font-bold">{selectedSouvenir.point_cost} Poin / unit</p>
                <p className="text-xs text-slate-500">Stok tersedia: {selectedSouvenir.stock} pcs</p>
              </div>
            </div>

            {/* React-Select Async Search */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Cari & Pilih Pelanggan (Debounce API Search) *</label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadCustomerOptions}
                onChange={(option) => setSelectedCustomer(option ? option.customer : null)}
                placeholder="Ketik nama ortu, anak, atau No. HP..."
                noOptionsMessage={({ inputValue }) => !inputValue ? "Ketik untuk mencari pelanggan..." : "Pelanggan tidak ditemukan"}
                loadingMessage={() => "Mencari dari server..."}
                styles={customSelectStyles}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Jumlah Unit Souvenir</label>
              <input
                type="number"
                min={1}
                max={selectedSouvenir.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {selectedCustomer && (
              <div className={`p-3 rounded-xl border text-xs font-bold ${
                (selectedCustomer.points_balance || 0) >= selectedSouvenir.point_cost * qty
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                Poin Diperlukan: {selectedSouvenir.point_cost * qty} Poin | Saldo Poin {selectedCustomer.parent_name}: {selectedCustomer.points_balance || 0} Poin
              </div>
            )}

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRedeemModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRedeem}
                disabled={loading || !selectedCustomer}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-2xs disabled:opacity-40"
              >
                {loading ? 'Memproses...' : 'Konfirmasi Tukar'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Souvenir Modal */}
      <Modal
        isOpen={isSouvenirModalOpen}
        onClose={() => setIsSouvenirModalOpen(false)}
        title={editingSouvenir ? 'Edit Data Souvenir' : 'Tambah Souvenir Baru'}
      >
        <form onSubmit={handleSaveSouvenir} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Nama Souvenir *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Gantungan Kunci Kinderfun"
              value={souvenirForm.name}
              onChange={(e) => setSouvenirForm({ ...souvenirForm, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Harga Poin *</label>
              <input
                type="number"
                required
                min={1}
                value={souvenirForm.point_cost}
                onChange={(e) => setSouvenirForm({ ...souvenirForm, point_cost: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Stok Souvenir</label>
              <input
                type="number"
                min={0}
                value={souvenirForm.stock}
                onChange={(e) => setSouvenirForm({ ...souvenirForm, stock: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">URL Gambar (Opsional)</label>
            <input
              type="text"
              placeholder="https://..."
              value={souvenirForm.image_url}
              onChange={(e) => setSouvenirForm({ ...souvenirForm, image_url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Deskripsi</label>
            <textarea
              rows={3}
              placeholder="Keterangan singkat souvenir..."
              value={souvenirForm.description}
              onChange={(e) => setSouvenirForm({ ...souvenirForm, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSouvenirModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-2xs"
            >
              Simpan Souvenir
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
