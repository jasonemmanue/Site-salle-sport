'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import type { Activity, PaginatedResponse } from '@/lib/types';

const categories = ['force', 'cardio', 'flexibility', 'martial_arts', 'dance'];
const levels = ['beginner', 'intermediate', 'advanced', 'all'];

const emptyForm = {
  name: '', slug: '', description: '', category: 'force', level: 'all',
  duration_minutes: 60, max_capacity: 20, image_url: '', is_active: true, order: 0,
};

export default function ActivitesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Activity[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!token) return;
    apiFetch<PaginatedResponse<Activity>>('/api/v1/activities/?limit=100', { token })
      .then((r) => setItems(r.items))
      .catch(() => {});
  };

  useEffect(load, [token]);

  const openNew = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (item: Activity) => {
    setForm({ ...item, image_url: item.image_url || '' });
    setEditId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') };
      if (editId) {
        await apiFetch(`/api/v1/activities/${editId}`, { method: 'PUT', token: token!, body: JSON.stringify(body) });
      } else {
        await apiFetch('/api/v1/activities/', { method: 'POST', token: token!, body: JSON.stringify(body) });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: Activity) => {
    if (!confirm(`Supprimer "${item.name}" ?`)) return;
    await apiFetch(`/api/v1/activities/${item.id}`, { method: 'DELETE', token: token! });
    load();
  };

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'category', label: 'Categorie' },
    { key: 'level', label: 'Niveau' },
    { key: 'duration_minutes', label: 'Duree (min)' },
    { key: 'max_capacity', label: 'Capacite' },
    { key: 'is_active', label: 'Actif', render: (item: Activity) => (
      <span className={item.is_active ? 'text-green-400' : 'text-red-400'}>{item.is_active ? 'Oui' : 'Non'}</span>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Activites</h1>
        <button onClick={openNew} className="btn-primary">+ Ajouter</button>
      </div>

      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modifier activite' : 'Nouvelle activite'} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-secondary mb-1">Nom</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Slug</label>
              <input className="input-field" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-genere" />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Categorie</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Niveau</label>
              <select className="input-field" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Duree (min)</label>
              <input type="number" className="input-field" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: +e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Capacite max</label>
              <input type="number" className="input-field" value={form.max_capacity} onChange={(e) => setForm({ ...form, max_capacity: +e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">URL image</label>
              <input className="input-field" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Ordre</label>
              <input type="number" className="input-field" value={form.order} onChange={(e) => setForm({ ...form, order: +e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Description</label>
            <textarea className="input-field h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-primary" />
            Actif
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
