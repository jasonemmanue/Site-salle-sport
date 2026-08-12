'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import StatCard from '@/components/StatCard';
import { BarChart, LineChart } from '@/components/Chart';
import type { DashboardStats } from '@/lib/types';

interface TrendData {
  enrollments_by_day: { label: string; value: number }[];
  revenue_by_month: { label: string; value: number }[];
  top_activities: { label: string; value: number }[];
  fill_rate_by_day: { label: string; value: number }[];
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<DashboardStats>('/api/v1/stats/', { token }).then(setStats).catch(() => {});
    // Pas de repli sur des valeurs factices : si l'appel echoue, les graphiques
    // ne s'affichent pas plutot que de montrer des chiffres inventes.
    apiFetch<TrendData>('/api/v1/stats/trends', { token })
      .then(setTrends)
      .catch(() => setTrends(null));
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Tableau de bord</h1>

      {!stats ? (
        <div className="text-dark-muted">Chargement des statistiques...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon="👥" label="Membres total" value={stats.total_members} />
            <StatCard icon="📋" label="Abonnements actifs" value={stats.active_subscriptions} />
            <StatCard icon="📅" label="Inscriptions aujourd'hui" value={stats.today_enrollments} />
            <StatCard icon="🏋️" label="Activites" value={stats.total_activities} />
            <StatCard icon="👨‍🏫" label="Coachs" value={stats.total_coaches} />
            <StatCard icon="📩" label="Messages non lus" value={stats.unread_contacts} color="text-yellow-400" />
            <StatCard icon="⭐" label="Avis en attente" value={stats.pending_reviews} color="text-orange-400" />
            <StatCard icon="📈" label="Taux remplissage" value={`${stats.fill_rate}%`} color="text-green-400" />
          </div>

          {trends && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChart data={trends.enrollments_by_day} title="Inscriptions par jour" color="#0F1724" />
              {/* L'API renvoie des FCFA bruts ; le graphique les affiche en milliers. */}
              <LineChart
                data={trends.revenue_by_month.map((p) => ({ ...p, value: Math.round(p.value / 1000) }))}
                title="Revenus mensuels (x1000 FCFA)"
                color="#16A34A"
                suffix="k"
              />
              <BarChart data={trends.top_activities} title="Activites les plus populaires" color="#64748B" />
              <BarChart data={trends.fill_rate_by_day} title="Taux de remplissage par jour (%)" color="#B8960A" suffix="%" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
