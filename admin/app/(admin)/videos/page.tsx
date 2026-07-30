'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import FileUpload from '@/components/FileUpload';
import type { Video } from '@/lib/types';

const emptyForm = { title: '', description: '', video_url: '', thumbnail_url: '', category: 'entrainement', is_published: true, order: 0 };

export default function VideosPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Video[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!token) return;
    apiFetch<Video[]>('/api/v1/videos/', { token }).then(setItems).catch(() => {});
  };

  useEffect(load, [token]);

  const openNew = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (item: Video) => {
    setForm({ title: item.title, description: item.description, video_url: item.video_url, thumbnail_url: item.thumbnail_url || '', category: item.category, is_published: item.is_published, order: item.order });
    setEditId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await apiFetch(`/api/v1/videos/${editId}`, { method: 'PUT', token: token!, body: JSON.stringify(form) });
      } else {
        await apiFetch('/api/v1/videos/', { method: 'POST', token: token!, body: JSON.stringify(form) });
      }
      setModalOpen(false);
      load();
    } catch (err) { alert(err instanceof Error ? err.message : 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item: Video) => {
    if (!confirm(`Supprimer "${item.title}" ?`)) return;
    await apiFetch(`/api/v1/videos/${item.id}`, { method: 'DELETE', token: token! });
    load();
  };

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'category', label: 'Categorie' },
    { key: 'is_published', label: 'Publie', render: (item: Video) => <span className={item.is_published ? 'text-green-400' : 'text-red-400'}>{item.is_published ? 'Oui' : 'Non'}</span> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Videos</h1>
        <button onClick={openNew} className="btn-primary">+ Ajouter</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modifier video' : 'Nouvelle video'} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-secondary mb-1">Titre</label>
              <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Categorie</label>
              <input className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Description</label>
            <textarea className="input-field h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-secondary mb-1">URL video</label>
              <input className="input-field" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} required />
            </div>
            <FileUpload value={form.thumbnail_url} onChange={(url) => setForm({ ...form, thumbnail_url: url })} label="Miniature" />
          </div>
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="accent-primary" /> Publie
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
