'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import type { Transformation } from '@/lib/types';

const emptyForm = { member_name: '', before_image_url: '', after_image_url: '', testimonial: '', duration_text: '', is_featured: false, is_published: true };

export default function TransformationsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Transformation[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!token) return;
    apiFetch<Transformation[]>('/api/v1/transformations/', { token }).then(setItems).catch(() => {});
  };

  useEffect(load, [token]);

  const openNew = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (item: Transformation) => {
    setForm({ member_name: item.member_name, before_image_url: item.before_image_url, after_image_url: item.after_image_url, testimonial: item.testimonial, duration_text: item.duration_text, is_featured: item.is_featured, is_published: item.is_published });
    setEditId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await apiFetch(`/api/v1/transformations/${editId}`, { method: 'PUT', token: token!, body: JSON.stringify(form) });
      } else {
        await apiFetch('/api/v1/transformations/', { method: 'POST', token: token!, body: JSON.stringify(form) });
      }
      setModalOpen(false);
      load();
    } catch (err) { alert(err instanceof Error ? err.message : 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item: Transformation) => {
    if (!confirm(`Supprimer la transformation de "${item.member_name}" ?`)) return;
    await apiFetch(`/api/v1/transformations/${item.id}`, { method: 'DELETE', token: token! });
    load();
  };

  const columns = [
    { key: 'member_name', label: 'Membre' },
    { key: 'duration_text', label: 'Duree' },
    { key: 'is_featured', label: 'Mis en avant', render: (item: Transformation) => <span className={item.is_featured ? 'text-primary' : 'text-dark-muted'}>{item.is_featured ? 'Oui' : 'Non'}</span> },
    { key: 'is_published', label: 'Publie', render: (item: Transformation) => <span className={item.is_published ? 'text-green-400' : 'text-red-400'}>{item.is_published ? 'Oui' : 'Non'}</span> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Transformations</h1>
        <button onClick={openNew} className="btn-primary">+ Ajouter</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modifier' : 'Nouvelle transformation'} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-secondary mb-1">Nom du membre</label>
              <input className="input-field" value={form.member_name} onChange={(e) => setForm({ ...form, member_name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Duree</label>
              <input className="input-field" value={form.duration_text} onChange={(e) => setForm({ ...form, duration_text: e.target.value })} placeholder="ex: 3 mois" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-secondary mb-1">Image avant (URL)</label>
              <input className="input-field" value={form.before_image_url} onChange={(e) => setForm({ ...form, before_image_url: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Image apres (URL)</label>
              <input className="input-field" value={form.after_image_url} onChange={(e) => setForm({ ...form, after_image_url: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Temoignage</label>
            <textarea className="input-field h-20" value={form.testimonial} onChange={(e) => setForm({ ...form, testimonial: e.target.value })} />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-primary" /> Mis en avant
            </label>
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="accent-primary" /> Publie
            </label>
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
