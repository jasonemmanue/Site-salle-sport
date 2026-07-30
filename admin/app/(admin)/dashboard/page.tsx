'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import StatCard from '@/components/StatCard';
import type { DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<DashboardStats>('/api/v1/stats/', { token }).then(setStats).catch(() => {});
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Tableau de bord</h1>

      {!stats ? (
        <div className="text-dark-muted">Chargement des statistiques...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon="👥" label="Membres total" value={stats.total_members} />
          <StatCard icon="📋" label="Abonnements actifs" value={stats.active_subscriptions} />
          <StatCard icon="📅" label="Inscriptions aujourd'hui" value={stats.today_enrollments} />
          <StatCard icon="🏋️" label="Activites" value={stats.total_activities} />
          <StatCard icon="👨‍🏫" label="Coachs" value={stats.total_coaches} />
          <StatCard icon="📩" label="Messages non lus" value={stats.unread_contacts} color="text-yellow-400" />
          <StatCard icon="⭐" label="Avis en attente" value={stats.pending_reviews} color="text-orange-400" />
          <StatCard icon="📈" label="Taux remplissage" value={`${stats.fill_rate}%`} color="text-green-400" />
        </div>
      )}
    </div>
  );
}
