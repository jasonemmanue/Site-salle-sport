'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import FileUpload from '@/components/FileUpload';
import { ErrorSummary, FieldError, Requis } from '@/components/FormErrors';
import { aDesErreurs, verifierNombre, verifierRequis, type Erreurs } from '@/lib/validation';
import type { Equipment } from '@/lib/types';

const zones = ['musculation', 'cardio', 'stretching', 'functional', 'locker'];
const emptyForm = { name: '', description: '', zone: 'musculation', image_url: '', quantity: 1, is_active: true };

type Form = typeof emptyForm;

// `name`, `zone` et `quantity` sont NOT NULL.
const valider = (form: Form): Erreurs => {
  const erreurs = verifierRequis(form, [
    ['name', "Le nom de l'equipement"],
    ['zone', 'La zone'],
  ]);
  const quantite = verifierNombre(form.quantity, 'La quantite');
  if (quantite) erreurs.quantity = quantite;
  return erreurs;
};

export default function EquipementsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Equipment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [erreurApi, setErreurApi] = useState('');
  const [soumis, setSoumis] = useState(false);

  // Rien ne s'affiche avant la premiere tentative d'enregistrement ;
  // ensuite la liste se vide au fur et a mesure de la saisie.
  useEffect(() => {
    if (soumis) setErreurs(valider(form));
  }, [form, soumis]);

  const load = () => {
    if (!token) return;
    apiFetch<Equipment[]>('/api/v1/equipment/', { token }).then(setItems).catch(() => {});
  };

  useEffect(load, [token]);

  const reinitialiser = () => { setErreurs({}); setErreurApi(''); setSoumis(false); };

  const openNew = () => { setForm(emptyForm); setEditId(null); reinitialiser(); setModalOpen(true); };
  const openEdit = (item: Equipment) => {
    setForm({ name: item.name, description: item.description || '', zone: item.zone, image_url: item.image_url || '', quantity: item.quantity, is_active: item.is_active });
    setEditId(item.id);
    reinitialiser();
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSoumis(true);
    setErreurApi('');
    const manques = valider(form);
    setErreurs(manques);
    if (aDesErreurs(manques)) return;

    setSaving(true);
    try {
      if (editId) {
        await apiFetch(`/api/v1/equipment/${editId}`, { method: 'PUT', token: token!, body: JSON.stringify(form) });
      } else {
        await apiFetch('/api/v1/equipment/', { method: 'POST', token: token!, body: JSON.stringify(form) });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setErreurApi(err instanceof Error ? err.message : "Erreur inconnue a l'enregistrement.");
    } finally { setSaving(false); }
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Equipements</h1>
        <button onClick={openNew} className="btn-primary">+ Ajouter</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modifier equipement' : 'Nouvel equipement'}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <ErrorSummary erreurs={erreurs} erreurApi={erreurApi} />
          <div>
            <label className="block text-sm text-secondary mb-1">Nom<Requis /></label>
            <input className={`input-field ${erreurs.name ? 'input-error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FieldError message={erreurs.name} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-secondary mb-1">Zone<Requis /></label>
              <select className="input-field" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}>
                {zones.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Quantite<Requis /></label>
              <input type="number" min={1} className={`input-field ${erreurs.quantity ? 'input-error' : ''}`} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} />
              <FieldError message={erreurs.quantity} />
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
