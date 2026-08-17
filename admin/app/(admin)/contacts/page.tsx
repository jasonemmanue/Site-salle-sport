'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import type { Contact } from '@/lib/types';

export default function ContactsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Contact[]>([]);

  const load = () => {
    if (!token) return;
    apiFetch<Contact[]>('/api/v1/contact/', { token }).then(setItems).catch(() => {});
  };

  useEffect(load, [token]);

  const markRead = async (id: string) => {
    await apiFetch(`/api/v1/contact/${id}/read`, { method: 'PUT', token: token! });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Messages de contact</h1>

      {items.length === 0 ? (
        <div className="card text-center py-12 text-dark-muted">Aucun message</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className={`card ${!item.is_read ? 'border-primary/30' : ''}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-bold text-white">{item.name}</span>
                    {!item.is_read && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-dark-muted text-xs mb-2">{item.email} | {item.phone}</p>
                  <p className="text-primary text-sm font-medium mb-1">{item.subject}</p>
                  <p className="text-secondary text-sm">{item.message}</p>
                  <p className="text-dark-muted text-xs mt-2">{new Date(item.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                {!item.is_read && (
                  <button onClick={() => markRead(item.id)} className="btn-secondary text-sm px-3 py-1.5 shrink-0">Marquer lu</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
