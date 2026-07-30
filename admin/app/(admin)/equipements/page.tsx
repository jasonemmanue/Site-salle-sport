'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import FileUpload from '@/components/FileUpload';
import type { Equipment } from '@/lib/types';

const zones = ['musculation', 'cardio', 'stretching', 'functional', 'locker'];
const emptyForm = { name: '', description: '', zone: 'musculation', image_url: '', quantity: 1, is_active: true };

export default function EquipementsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Equipment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!token) return;
    apiFetch<Equipment[]>('/api/v1/equipment/', { token }).then(setItems).catch(() => {});
  };

  useEffect(load, [token]);

  const openNew = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (item: Equipment) => {
    setForm({ name: item.name, description: item.description, zone: item.zone, image_url: item.image_url || '', quantity: item.quantity, is_active: item.is_active });
    setEditId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await apiFetch(`/api/v1/equipment/${editId}`, { method: 'PUT', token: token!, body: JSON.stringify(form) });
      } else {
        await apiFetch('/api/v1/equipment/', { method: 'POST', token: token!, body: JSON.stringify(form) });
      }
      setModalOpen(false);
      load();
    } catch (err) { alert(err instanceof Error ? err.message : 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item: Equipment) => {
    if (!confirm(`Supprimer "${item.name}" ?`)) return;
    await apiFetch(`/api/v1/equipment/${item.id}`, { method: 'DELETE', token: token! });
    load();
  };

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'zone', label: 'Zone' },
    { key: 'quantity', label: 'Quantite' },
    { key: 'is_active', label: 'Actif', render: (item: Equipment) => <span className={item.is_active ? 'text-green-400' : 'text-red-400'}>{item.is_active ? 'Oui' : 'Non'}</span> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Equipements</h1>
        <button onClick={openNew} className="btn-primary">+ Ajouter</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modifier equipement' : 'Nouvel equipement'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-secondary mb-1">Nom</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-secondary mb-1">Zone</label>
              <select className="input-field" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}>
                {zones.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Quantite</label>
              <input type="number" className="input-field" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Description</label>
            <textarea className="input-field h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <FileUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} label="Image" />
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-primary" /> Actif
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
