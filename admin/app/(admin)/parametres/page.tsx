'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import { ErrorSummary, FieldError, Requis } from '@/components/FormErrors';
import { aDesErreurs, estEmail, estUrl, estVide, type Erreurs } from '@/lib/validation';

interface Setting {
  id: string;
  key: string;
  value: string;
}

// `requis` : les cinq premieres cles alimentent le pied de page et la page
// Contact du site public. Vides, elles y laissent un trou visible.
// Les trois reseaux sociaux sont facultatifs, mais verifies s'ils sont remplis :
// une adresse mal formee produit un lien mort dans le pied de page.
const defaultKeys = [
  { key: 'gym_name', label: 'Nom de la salle', requis: true },
  { key: 'phone', label: 'Telephone', requis: true },
  { key: 'email', label: 'Email', requis: true },
  { key: 'address', label: 'Adresse', requis: true },
  { key: 'opening_hours', label: 'Horaires d\'ouverture', requis: true },
  { key: 'facebook_url', label: 'Facebook URL', requis: false },
  { key: 'instagram_url', label: 'Instagram URL', requis: false },
  { key: 'youtube_url', label: 'YouTube URL', requis: false },
];

const valider = (valeurs: Record<string, string>): Erreurs => {
  const erreurs: Erreurs = {};
  for (const { key, label, requis } of defaultKeys) {
    const valeur = valeurs[key] || '';
    if (requis && estVide(valeur)) {
      erreurs[key] = `${label} est obligatoire.`;
      continue;
    }
    if (key === 'email' && !estVide(valeur) && !estEmail(valeur)) {
      erreurs[key] = "L'adresse e-mail est mal formee.";
    }
    if (key.endsWith('_url') && !estVide(valeur) && !estUrl(valeur)) {
      erreurs[key] = `${label} doit commencer par http:// ou https://.`;
    }
  }
  return erreurs;
};

export default function ParametresPage() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [erreurApi, setErreurApi] = useState('');
  const [soumis, setSoumis] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<Setting[]>('/api/v1/settings/', { token })
      .then((data) => {
        const map: Record<string, string> = {};
        data.forEach((s) => { map[s.key] = s.value; });
        setSettings(map);
      })
      .catch(() => {});
  }, [token]);

  // Rien ne s'affiche avant la premiere tentative d'enregistrement ; ensuite la
  // liste se vide au fur et a mesure de la saisie.
  useEffect(() => {
    if (soumis) setErreurs(valider(settings));
  }, [settings, soumis]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSoumis(true);
    setErreurApi('');
    const manques = valider(settings);
    setErreurs(manques);
    if (aDesErreurs(manques)) return;

    setSaving(true);
    setSaved(false);
    try {
      // PUT /settings/ met a jour UNE cle par appel : envoyer le tableau complet
      // renvoyait un 422 et aucun parametre n'etait enregistre.
      for (const [key, value] of Object.entries(settings)) {
        await apiFetch('/api/v1/settings/', {
          method: 'PUT',
          token: token!,
          body: JSON.stringify({ key, value }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setErreurApi(err instanceof Error ? err.message : "Erreur inconnue a l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Parametres</h1>
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <ErrorSummary erreurs={erreurs} erreurApi={erreurApi} />
          {defaultKeys.map(({ key, label, requis }) => (
            <div key={key}>
              <label className="block text-sm text-secondary mb-1">
                {label}
                {requis && <Requis />}
              </label>
              <input
                className={`input-field ${erreurs[key] ? 'input-error' : ''}`}
                value={settings[key] || ''}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              />
              <FieldError message={erreurs[key]} />
            </div>
          ))}
          <div className="flex items-center gap-4 pt-4">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
            {saved && <span className="text-green-400 text-sm">Parametres sauvegardes</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
