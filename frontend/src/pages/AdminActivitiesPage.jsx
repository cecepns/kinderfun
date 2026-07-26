import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import toast from 'react-hot-toast';
import {
  FileText,
  Plus,
  Search,
  Edit3,
  Trash2,
  Calendar,
  User,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Tag
} from 'lucide-react';

export const AdminActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'Kegiatan',
    cover_image: '',
    description: '',
    author: 'Admin Kinderfun',
    event_date: new Date().toISOString().split('T')[0]
  });

  const quillRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchActivities();
  }, [page, limit, debouncedSearch]);

  const fetchActivities = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.ACTIVITIES.LIST, {
        page,
        limit,
        search: debouncedSearch
      });
      if (res.success) {
        setActivities(res.data);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat artikel & kegiatan');
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadLoading(true);
    try {
      const res = await request.postForm(API_ENDPOINTS.UPLOAD, formData);
      if (res.success) {
        setForm(prev => ({ ...prev, cover_image: res.url }));
        toast.success('Cover image berhasil diunggah!');
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mengunggah gambar cover');
    } finally {
      setUploadLoading(false);
    }
  };

  // Custom Quill Image Upload Handler
  const handleQuillImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await request.postForm(API_ENDPOINTS.UPLOAD, formData);
        if (res.success && quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, 'image', res.url);
          editor.setSelection(range.index + 1);
          toast.success('Gambar disisipkan ke editor!');
        }
      } catch (err) {
        toast.error('Gagal mengunggah gambar ke editor');
      }
    };
  };


  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: handleQuillImageUpload
      }
    }
  };

  const openCreateModal = () => {
    setEditingActivity(null);
    setForm({
      title: '',
      category: 'Kegiatan',
      cover_image: '',
      description: '',
      author: 'Admin Kinderfun',
      event_date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingActivity(item);
    setForm({
      title: item.title,
      category: item.category || 'Kegiatan',
      cover_image: item.cover_image || '',
      description: item.description || '',
      author: item.author || 'Admin Kinderfun',
      event_date: item.event_date ? item.event_date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) {
      toast.error('Judul artikel / kegiatan wajib diisi');
      return;
    }

    try {
      if (editingActivity) {
        const res = await request.put(API_ENDPOINTS.ACTIVITIES.UPDATE(editingActivity.id), form);
        if (res.success) {
          toast.success('Artikel / kegiatan berhasil diperbarui');
          setIsModalOpen(false);
          fetchActivities();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.ACTIVITIES.CREATE, form);
        if (res.success) {
          toast.success('Artikel / kegiatan baru berhasil ditambahkan');
          setIsModalOpen(false);
          fetchActivities();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan artikel / kegiatan');
    }
  };

  const handleDelete = (item) => {
    toast((t) => (
      <div className="space-y-3">
        <p className="font-bold text-slate-800 text-sm">
          Hapus kegiatan <strong>{item.title}</strong>?
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
                const res = await request.delete(API_ENDPOINTS.ACTIVITIES.DELETE(item.id));
                if (res.success) {
                  toast.success('Kegiatan berhasil dihapus');
                  fetchActivities();
                }
              } catch (err) {
                toast.error(err.message || 'Gagal menghapus kegiatan');
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
          >
            Hapus
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white text-slate-900 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> Konten & Informasi Playground
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-slate-900">
            Manajemen Artikel & Kegiatan
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Kelola pengumuman event, artikel edukasi, dan dokumentasi kegiatan Kinderfun.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full md:w-auto py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Kegiatan / Artikel
        </button>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-2xs">
        {/* Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul, kategori, deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Cover</th>
                <th className="p-3">Judul Kegiatan / Artikel</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Tanggal Event</th>
                <th className="p-3">Penulis</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-slate-400 font-medium">
                    Belum ada artikel atau kegiatan yang ditambahkan.
                  </td>
                </tr>
              ) : (
                activities.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-all">
                    <td className="p-3">
                      <div className="w-14 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                        {item.cover_image ? (
                          <img src={item.cover_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs" dangerouslySetInnerHTML={{ __html: item.description?.replace(/<[^>]+>/g, '').slice(0, 70) + '...' }} />
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold inline-flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {item.category || 'Kegiatan'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-600 whitespace-nowrap">
                      {item.event_date ? item.event_date.split('T')[0] : '-'}
                    </td>
                    <td className="p-3 font-medium text-slate-600 whitespace-nowrap">
                      {item.author || 'Admin Kinderfun'}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingActivity ? 'Edit Artikel / Kegiatan' : 'Tambah Artikel / Kegiatan'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Judul Artikel / Kegiatan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Lomba Mewarnai Bersama Maskot Kinderfun"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Kegiatan">Kegiatan</option>
                <option value="Event">Event / Lomba</option>
                <option value="Edukasi">Edukasi Anak</option>
                <option value="Pengumuman">Pengumuman</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Event / Pelaksanaan</label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Foto Cover Utama</label>
            <div className="flex items-center gap-3">
              <div className="w-20 h-14 rounded-xl border border-slate-200 bg-purple-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {form.cover_image ? (
                  <img src={form.cover_image} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-purple-400" />
                )}
              </div>
              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-all">
                  <Upload className="w-4 h-4" />
                  <span>{uploadLoading ? 'Mengunggah...' : 'Upload Cover Direct'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={uploadLoading}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-400 mt-1">Format: JPG, PNG, WEBP (Maks 10MB)</p>
              </div>
            </div>
          </div>

          {/* React Quill Description Editor */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Deskripsi & Isi Konten (React Quill Editor)</label>
            <div className="rounded-xl border border-slate-300 overflow-hidden">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={form.description}
                onChange={(content) => setForm(prev => ({ ...prev, description: content }))}
                modules={modules}
                placeholder="Tulis deskripsi detail kegiatan di sini... Anda juga bisa upload gambar di toolbar editor!"
                className="bg-white text-slate-900 font-normal"
                style={{ height: '220px', marginBottom: '45px' }}
              />
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
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-2xs"
            >
              Simpan Kegiatan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
