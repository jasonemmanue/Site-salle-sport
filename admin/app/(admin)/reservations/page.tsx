'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch, telechargerFichier } from '@/lib/api';
import DataTable from '@/components/DataTable';
import type { Activity, EnrollmentDetail } from '@/lib/types';

/**
 * Registre des reservations.
 *
 * Une reservation prise sur le site arrive ici, avec ce que le registre de la
 * salle notait a la main : formule de paiement, montant encaisse, remarque.
 * Le bouton d'export produit un classeur Excel de ce que l'ecran affiche,
 * filtres compris.
 */

const FORMULES = [
  'Abonnée mensuel',
  'Séance',
  'Abonnement de karaté',
  'Abonnement de box',
];
const TYPES_DE_SEANCE = ['Individuel', 'Collectif'];
const STATUTS = [
  { valeur: 'enrolled', libelle: 'Inscrit' },
  { valeur: 'waitlisted', libelle: "Liste d'attente" },
  { valeur: 'cancelled', libelle: 'Annule' },
];

const nombreFr = new Intl.NumberFormat('fr-FR');

const FILTRES_VIDES = {
  depuis: '',
  jusqu_a: '',
  statut: '',
  payment_type: '',
  session_type: '',
  activity_id: '',
};

export default function ReservationsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<EnrollmentDetail[]>([]);
  const [activites, setActivites] = useState<Activity[]>([]);
  const [filtres, setFiltres] = useState(FILTRES_VIDES);
  const [telechargement, setTelechargement] = useState(false);
  const [erreur, setErreur] = useState('');

  // Les memes filtres alimentent la liste et l'export : le fichier telecharge
  // contient exactement ce que l'ecran montre, jamais autre chose.
  const requete = useMemo(() => {
    const params = new URLSearchParams();
    for (const [cle, valeur] of Object.entries(filtres)) {
      if (valeur) params.set(cle, valeur);
    }
    const chaine = params.toString();
    return chaine ? `?${chaine}` : '';
  }, [filtres]);

  const load = useCallback(() => {
    if (!token) return;
    apiFetch<EnrollmentDetail[]>(`/api/v1/enrollments/${requete}`, { token })
      .then(setItems)
      .catch(() => {});
  }, [token, requete]);

  useEffect(load, [load]);

  useEffect(() => {
    if (!token) return;
    apiFetch<{ items: Activity[] }>('/api/v1/activities/?limit=100', { token })
      .then((r) => setActivites(r.items))
      .catch(() => {});
  }, [token]);

  const exporter = async () => {
    if (!token) return;
    setTelechargement(true);
    setErreur('');
    try {
      await telechargerFichier(`/api/v1/enrollments/export.xlsx${requete}`, token);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Le telechargement a echoue.');
    } finally {
      setTelechargement(false);
    }
  };

  const rejouer = async (item: EnrollmentDetail) => {
    if (!token) return;
    setErreur('');
    try {
      await apiFetch(`/api/v1/enrollments/${item.id}/resend`, { method: 'POST', token });
      load();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'La recopie a de nouveau echoue.');
    }
  };

  const annuler = async (item: EnrollmentDetail) => {
    if (!confirm(`Annuler la reservation de "${item.user_name}" ?`)) return;
    await apiFetch(`/api/v1/enrollments/${item.id}`, { method: 'DELETE', token: token! });
    load();
  };

  const encaisse = items
    .filter((item) => item.status !== 'cancelled')
    .reduce((somme, item) => somme + (item.amount_paid || 0), 0);
  const nonRecopiees = items.filter((item) => !item.forwarded_to_google).length;

  const columns = [
    {
      key: 'specific_date',
      label: 'Seance',
      render: (item: EnrollmentDetail) => (
        <div>
          <p className="font-medium">
            {new Date(`${item.specific_date}T00:00:00`).toLocaleDateString('fr-FR')}
          </p>
          {item.slot && (
            <p className="text-xs text-dark-muted">
              {item.slot.start_time} - {item.slot.end_time}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'activite',
      label: 'Activite',
      render: (item: EnrollmentDetail) => item.slot?.activity?.name || '—',
    },
    {
      key: 'user_name',
      label: 'Membre',
      render: (item: EnrollmentDetail) => (
        <div>
          <p className="font-medium">{item.user_name}</p>
          <p className="text-xs text-dark-muted">{item.user_email}</p>
          <p className="text-xs text-dark-muted">{item.user_phone}</p>
        </div>
      ),
    },
    {
      key: 'payment_type',
      label: 'Paiement',
      render: (item: EnrollmentDetail) => (
        <div>
          <p>{item.payment_type || <span className="text-dark-muted">Non renseigne</span>}</p>
          {item.amount_paid ? (
            <p className="text-xs text-dark-muted">{nombreFr.format(item.amount_paid)} FCFA</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (item: EnrollmentDetail) => {
        const couleurs: Record<string, string> = {
          enrolled: 'bg-green-500/20 text-green-700',
          waitlisted: 'bg-orange-500/20 text-orange-700',
          cancelled: 'bg-red-500/20 text-red-700',
        };
        const libelle = STATUTS.find((s) => s.valeur === item.status)?.libelle || item.status;
        return (
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${couleurs[item.status] || ''}`}>
            {libelle}
          </span>
        );
      },
    },
    {
      key: 'forwarded_to_google',
      label: 'Registre Google',
      render: (item: EnrollmentDetail) =>
        item.forwarded_to_google ? (
          <span className="text-green-700">Recopie</span>
        ) : (
          <button
            type="button"
            onClick={() => rejouer(item)}
            title={item.google_error || 'Recopie non effectuee'}
            className="text-orange-700 underline hover:no-underline"
          >
            Rejouer
          </button>
        ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reservations</h1>
          <p className="mt-1 text-sm text-dark-muted">
            Toutes les places prises sur le site, annulations comprises. Le fichier
            Excel reprend exactement la liste affichee, filtres compris.
          </p>
        </div>
        <button
          onClick={exporter}
          disabled={telechargement}
          className="btn-primary shrink-0 disabled:opacity-50"
        >
          {telechargement ? 'Preparation...' : 'Telecharger en Excel'}
        </button>
      </div>

      {erreur && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {erreur}
        </div>
      )}

      <div className="card mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div>
            <label className="block text-sm text-secondary mb-1">Du</label>
            <input
              type="date"
              className="input-field"
              value={filtres.depuis}
              onChange={(e) => setFiltres({ ...filtres, depuis: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Au</label>
            <input
              type="date"
              className="input-field"
              value={filtres.jusqu_a}
              onChange={(e) => setFiltres({ ...filtres, jusqu_a: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Statut</label>
            <select
              className="input-field"
              value={filtres.statut}
              onChange={(e) => setFiltres({ ...filtres, statut: e.target.value })}
            >
              <option value="">Tous</option>
              {STATUTS.map((s) => (
                <option key={s.valeur} value={s.valeur}>{s.libelle}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Formule</label>
            <select
              className="input-field"
              value={filtres.payment_type}
              onChange={(e) => setFiltres({ ...filtres, payment_type: e.target.value })}
            >
              <option value="">Toutes</option>
              {FORMULES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Type de seance</label>
            <select
              className="input-field"
              value={filtres.session_type}
              onChange={(e) => setFiltres({ ...filtres, session_type: e.target.value })}
            >
              <option value="">Tous</option>
              {TYPES_DE_SEANCE.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Activite</label>
            <select
              className="input-field"
              value={filtres.activity_id}
              onChange={(e) => setFiltres({ ...filtres, activity_id: e.target.value })}
            >
              <option value="">Toutes</option>
              {activites.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFiltres(FILTRES_VIDES)}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Reinitialiser les filtres
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span className="text-secondary">
          <strong className="text-white">{items.length}</strong> reservation
          {items.length > 1 ? 's' : ''}
        </span>
        <span className="text-secondary">
          Encaisse : <strong className="text-white">{nombreFr.format(encaisse)} FCFA</strong>
        </span>
        {nonRecopiees > 0 && (
          <span className="text-orange-700">
            {nonRecopiees} non recopiee{nonRecopiees > 1 ? 's' : ''} dans le registre Google
          </span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        onDelete={annuler}
        emptyMessage="Aucune reservation pour ces criteres"
      />
    </div>
  );
}
