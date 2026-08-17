'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import type { Review } from '@/lib/types';

export default function AvisPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Review[]>([]);

  const load = () => {
    if (!token) return;
    apiFetch<Review[]>('/api/v1/reviews/all', { token }).then(setItems).catch(() => {});
  };

  useEffect(load, [token]);

  const approve = async (id: string) => {
    await apiFetch(`/api/v1/reviews/${id}/approve`, { method: 'PUT', token: token! });
    load();
  };

  const remove = async (item: Review) => {
    if (!confirm(`Supprimer l'avis de "${item.author_name}" ?`)) return;
    await apiFetch(`/api/v1/reviews/${item.id}`, { method: 'DELETE', token: token! });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Moderation des avis</h1>

      {items.length === 0 ? (
        <div className="card text-center py-12 text-dark-muted">Aucun avis</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-bold text-white">{item.author_name}</span>
                  <span className="text-primary">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {item.is_approved ? 'Approuve' : 'En attente'}
                  </span>
                </div>
                <p className="text-secondary text-sm">{item.comment}</p>
                <p className="text-dark-muted text-xs mt-2">{new Date(item.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {!item.is_approved && (
                  <button onClick={() => approve(item.id)} className="btn-primary text-sm px-3 py-1.5">Approuver</button>
                )}
                <button onClick={() => remove(item)} className="btn-danger text-sm px-3 py-1.5">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
