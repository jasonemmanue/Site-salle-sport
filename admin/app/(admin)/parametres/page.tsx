'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';

interface Setting {
  id: string;
  key: string;
  value: string;
}

const defaultKeys = [
  { key: 'gym_name', label: 'Nom de la salle' },
  { key: 'phone', label: 'Telephone' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Adresse' },
  { key: 'opening_hours', label: 'Horaires d\'ouverture' },
  { key: 'facebook_url', label: 'Facebook URL' },
  { key: 'instagram_url', label: 'Instagram URL' },
  { key: 'youtube_url', label: 'YouTube URL' },
];

export default function ParametresPage() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await apiFetch('/api/v1/settings/', {
        method: 'PUT',
        token: token!,
        body: JSON.stringify(Object.entries(settings).map(([key, value]) => ({ key, value }))),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Parametres</h1>
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {defaultKeys.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm text-secondary mb-1">{label}</label>
              <input
                className="input-field"
                value={settings[key] || ''}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              />
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
