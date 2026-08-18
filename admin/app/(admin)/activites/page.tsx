'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import FileUpload from '@/components/FileUpload';
import { ErrorSummary, FieldError, Requis } from '@/components/FormErrors';
import { aDesErreurs, verifierNombre, verifierRequis, type Erreurs } from '@/lib/validation';
import type { Activity, PaginatedResponse } from '@/lib/types';

const categories = ['force', 'cardio', 'flexibility', 'martial_arts', 'dance'];
const levels = ['beginner', 'intermediate', 'advanced', 'all'];

const emptyForm = {
  name: '', slug: '', description: '', category: 'force', level: 'all',
  duration_minutes: 60, max_capacity: 20, image_url: '', is_active: true, order: 0,
};

type Form = typeof emptyForm;

// `name`, `description`, `category`, `level`, `duration_minutes` et
// `max_capacity` sont NOT NULL cote base. Le slug, lui, est toujours derive du
// nom par l'API : le laisser vide est normal.
const valider = (form: Form): Erreurs => {
  const erreurs = verifierRequis(form, [
    ['name', 'Le nom'],
    ['description', 'La description'],
    ['category', 'La categorie'],
    ['level', 'Le niveau'],
  ]);
  const duree = verifierNombre(form.duration_minutes, 'La duree');
  if (duree) erreurs.duration_minutes = duree;
  const capacite = verifierNombre(form.max_capacity, 'La capacite maximale');
  if (capacite) erreurs.max_capacity = capacite;
  return erreurs;
};

export default function ActivitesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Activity[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [erreurApi, setErreurApi] = useState('');
  const [soumis, setSoumis] = useState(false);

  // Tant que l'administrateur n'a pas tente d'enregistrer, aucun message ne
  // s'affiche. Apres, ils se mettent a jour a chaque frappe : la liste se vide
  // au fur et a mesure qu'il complete.
  useEffect(() => {
    if (soumis) setErreurs(valider(form));
  }, [form, soumis]);

  const load = () => {
    if (!token) return;
    apiFetch<PaginatedResponse<Activity>>('/api/v1/activities/?limit=100', { token })
      .then((r) => setItems(r.items))
      .catch(() => {});
  };

  useEffect(load, [token]);

  const reinitialiser = () => { setErreurs({}); setErreurApi(''); setSoumis(false); };

  const openNew = () => { setForm(emptyForm); setEditId(null); reinitialiser(); setModalOpen(true); };
  const openEdit = (item: Activity) => {
    setForm({ ...item, image_url: item.image_url || '' });
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
      const body = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') };
      if (editId) {
        await apiFetch(`/api/v1/activities/${editId}`, { method: 'PUT', token: token!, body: JSON.stringify(body) });
      } else {
        await apiFetch('/api/v1/activities/', { method: 'POST', token: token!, body: JSON.stringify(body) });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setErreurApi(err instanceof Error ? err.message : "Erreur inconnue a l'enregistrement.");
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Activites</h1>
        <button onClick={openNew} className="btn-primary">+ Ajouter</button>
      </div>

      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modifier activite' : 'Nouvelle activite'} wide>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <ErrorSummary erreurs={erreurs} erreurApi={erreurApi} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-secondary mb-1">Nom<Requis /></label>
              <input className={`input-field ${erreurs.name ? 'input-error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <FieldError message={erreurs.name} />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Slug</label>
              <input className="input-field" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-genere" />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Categorie<Requis /></label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Niveau<Requis /></label>
              <select className="input-field" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Duree (min)<Requis /></label>
              <input type="number" min={1} className={`input-field ${erreurs.duration_minutes ? 'input-error' : ''}`} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: +e.target.value })} />
              <FieldError message={erreurs.duration_minutes} />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Capacite max<Requis /></label>
              <input type="number" min={1} className={`input-field ${erreurs.max_capacity ? 'input-error' : ''}`} value={form.max_capacity} onChange={(e) => setForm({ ...form, max_capacity: +e.target.value })} />
              <FieldError message={erreurs.max_capacity} />
            </div>
            <FileUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} label="Image" />
            <div>
              <label className="block text-sm text-secondary mb-1">Ordre</label>
              <input type="number" className="input-field" value={form.order} onChange={(e) => setForm({ ...form, order: +e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Description<Requis /></label>
            <textarea className={`input-field h-24 ${erreurs.description ? 'input-error' : ''}`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <FieldError message={erreurs.description} />
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
