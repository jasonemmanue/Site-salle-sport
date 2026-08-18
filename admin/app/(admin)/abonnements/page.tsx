'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { ErrorSummary, FieldError, Requis } from '@/components/FormErrors';
import { aDesErreurs, verifierNombre, verifierRequis, type Erreurs } from '@/lib/validation';
import type { Subscription } from '@/lib/types';

const emptyForm = { name: '', price: 25000, duration_months: 1, features: '', is_active: true, order: 0 };

type Form = typeof emptyForm;

// `name`, `price` et `duration_months` sont NOT NULL. Les champs numeriques
// retombent a 0 quand on les vide : sans minimum, une formule a 0 FCFA partirait
// en base sans que personne ne s'en apercoive.
const valider = (form: Form): Erreurs => {
  const erreurs = verifierRequis(form, [['name', 'Le nom de la formule']]);
  const prix = verifierNombre(form.price, 'Le prix');
  if (prix) erreurs.price = prix;
  const duree = verifierNombre(form.duration_months, 'La duree en mois');
  if (duree) erreurs.duration_months = duree;
  return erreurs;
};

export default function AbonnementsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Subscription[]>([]);
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
    apiFetch<Subscription[]>('/api/v1/subscriptions/', { token }).then(setItems).catch(() => {});
  };

  useEffect(load, [token]);

  const reinitialiser = () => { setErreurs({}); setErreurApi(''); setSoumis(false); };

  const openNew = () => { setForm(emptyForm); setEditId(null); reinitialiser(); setModalOpen(true); };
  const openEdit = (item: Subscription) => {
    setForm({ name: item.name, price: item.price, duration_months: item.duration_months, features: item.features.join('\n'), is_active: item.is_active, order: item.order });
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
      const body = { ...form, features: form.features.split('\n').filter(Boolean) };
      if (editId) {
        await apiFetch(`/api/v1/subscriptions/${editId}`, { method: 'PUT', token: token!, body: JSON.stringify(body) });
      } else {
        await apiFetch('/api/v1/subscriptions/', { method: 'POST', token: token!, body: JSON.stringify(body) });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setErreurApi(err instanceof Error ? err.message : "Erreur inconnue a l'enregistrement.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: Subscription) => {
    if (!confirm(`Supprimer "${item.name}" ?`)) return;
    await apiFetch(`/api/v1/subscriptions/${item.id}`, { method: 'DELETE', token: token! });
    load();
  };

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'price', label: 'Prix (FCFA)', render: (item: Subscription) => <span>{item.price.toLocaleString('fr-FR')} FCFA</span> },
    { key: 'duration_months', label: 'Duree (mois)' },
    { key: 'is_active', label: 'Actif', render: (item: Subscription) => <span className={item.is_active ? 'text-green-400' : 'text-red-400'}>{item.is_active ? 'Oui' : 'Non'}</span> },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Abonnements</h1>
        <button onClick={openNew} className="btn-primary">+ Ajouter</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modifier abonnement' : 'Nouvel abonnement'}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <ErrorSummary erreurs={erreurs} erreurApi={erreurApi} />
          <div>
            <label className="block text-sm text-secondary mb-1">Nom<Requis /></label>
            <input className={`input-field ${erreurs.name ? 'input-error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FieldError message={erreurs.name} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-secondary mb-1">Prix (FCFA)<Requis /></label>
              <input type="number" min={1} className={`input-field ${erreurs.price ? 'input-error' : ''}`} value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
              <FieldError message={erreurs.price} />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Duree (mois)<Requis /></label>
              <input type="number" min={1} className={`input-field ${erreurs.duration_months ? 'input-error' : ''}`} value={form.duration_months} onChange={(e) => setForm({ ...form, duration_months: +e.target.value })} />
              <FieldError message={erreurs.duration_months} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Avantages (un par ligne)</label>
            <textarea className="input-field h-24" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
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
