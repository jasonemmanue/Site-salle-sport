'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import FileUpload from '@/components/FileUpload';
import { ErrorSummary, FieldError, Requis } from '@/components/FormErrors';
import { aDesErreurs, verifierRequis, type Erreurs } from '@/lib/validation';
import type { Coach } from '@/lib/types';

const emptyForm = { name: '', photo_url: '', certifications: '', specialties: '', bio: '', is_active: true, order: 0 };

type Form = typeof emptyForm;

// Seul `name` est NOT NULL cote base ; le reste de la fiche est facultatif.
const valider = (form: Form): Erreurs =>
  verifierRequis(form, [['name', 'Le nom du coach']]);

export default function CoachsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Coach[]>([]);
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
    apiFetch<Coach[]>('/api/v1/coaches/', { token }).then(setItems).catch(() => {});
  };

  useEffect(load, [token]);

  const reinitialiser = () => { setErreurs({}); setErreurApi(''); setSoumis(false); };

  const openNew = () => { setForm(emptyForm); setEditId(null); reinitialiser(); setModalOpen(true); };
  const openEdit = (item: Coach) => {
    setForm({ name: item.name, photo_url: item.photo_url || '', certifications: item.certifications.join('\n'), specialties: item.specialties.join('\n'), bio: item.bio || '', is_active: item.is_active, order: item.order });
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
      const body = { ...form, certifications: form.certifications.split('\n').filter(Boolean), specialties: form.specialties.split('\n').filter(Boolean) };
      if (editId) {
        await apiFetch(`/api/v1/coaches/${editId}`, { method: 'PUT', token: token!, body: JSON.stringify(body) });
      } else {
        await apiFetch('/api/v1/coaches/', { method: 'POST', token: token!, body: JSON.stringify(body) });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setErreurApi(err instanceof Error ? err.message : "Erreur inconnue a l'enregistrement.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: Coach) => {
    if (!confirm(`Supprimer "${item.name}" ?`)) return;
    await apiFetch(`/api/v1/coaches/${item.id}`, { method: 'DELETE', token: token! });
    load();
  };

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'specialties', label: 'Specialites', render: (item: Coach) => <span>{item.specialties.join(', ')}</span> },
    { key: 'is_active', label: 'Actif', render: (item: Coach) => <span className={item.is_active ? 'text-green-400' : 'text-red-400'}>{item.is_active ? 'Oui' : 'Non'}</span> },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Coachs</h1>
        <button onClick={openNew} className="btn-primary">+ Ajouter</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modifier coach' : 'Nouveau coach'} wide>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <ErrorSummary erreurs={erreurs} erreurApi={erreurApi} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-secondary mb-1">Nom<Requis /></label>
              <input className={`input-field ${erreurs.name ? 'input-error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <FieldError message={erreurs.name} />
            </div>
            <FileUpload value={form.photo_url} onChange={(url) => setForm({ ...form, photo_url: url })} label="Photo" />
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Bio</label>
            <textarea className="input-field h-20" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-secondary mb-1">Certifications (une par ligne)</label>
              <textarea className="input-field h-20" value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Specialites (une par ligne)</label>
              <textarea className="input-field h-20" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
            </div>
          </div>
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
