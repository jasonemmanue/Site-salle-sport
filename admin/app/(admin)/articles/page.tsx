'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import RichEditor from '@/components/RichEditor';
import FileUpload from '@/components/FileUpload';
import type { Article, PaginatedResponse } from '@/lib/types';

const emptyForm = { title: '', slug: '', excerpt: '', content: '', cover_image_url: '', status: 'draft' };

export default function ArticlesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Article[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!token) return;
    apiFetch<PaginatedResponse<Article>>('/api/v1/articles/?limit=100', { token }).then((r) => setItems(r.items)).catch(() => {});
  };

  useEffect(load, [token]);

  const openNew = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (item: Article) => {
    setForm({ title: item.title, slug: item.slug, excerpt: item.excerpt, content: item.content, cover_image_url: item.cover_image_url || '', status: item.status });
    setEditId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-') };
      if (editId) {
        await apiFetch(`/api/v1/articles/${editId}`, { method: 'PUT', token: token!, body: JSON.stringify(body) });
      } else {
        await apiFetch('/api/v1/articles/', { method: 'POST', token: token!, body: JSON.stringify(body) });
      }
      setModalOpen(false);
      load();
    } catch (err) { alert(err instanceof Error ? err.message : 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item: Article) => {
    if (!confirm(`Supprimer "${item.title}" ?`)) return;
    await apiFetch(`/api/v1/articles/${item.id}`, { method: 'DELETE', token: token! });
    load();
  };

  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'status', label: 'Statut', render: (item: Article) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
        {item.status === 'published' ? 'Publie' : 'Brouillon'}
      </span>
    )},
    { key: 'created_at', label: 'Date', render: (item: Article) => <span>{new Date(item.created_at).toLocaleDateString('fr-FR')}</span> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Articles</h1>
        <button onClick={openNew} className="btn-primary">+ Ajouter</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modifier article' : 'Nouvel article'} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-secondary mb-1">Titre</label>
              <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Slug</label>
              <input className="input-field" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-genere" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Extrait</label>
            <textarea className="input-field h-16" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Contenu</label>
            <RichEditor value={form.content} onChange={(val) => setForm({ ...form, content: val })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FileUpload value={form.cover_image_url} onChange={(url) => setForm({ ...form, cover_image_url: url })} label="Image de couverture" />
            <div>
              <label className="block text-sm text-secondary mb-1">Statut</label>
              <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Brouillon</option>
                <option value="published">Publie</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
