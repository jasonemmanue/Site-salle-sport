'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import Modal from '@/components/Modal';
import type { ScheduleSlot, Activity, Coach } from '@/lib/types';

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const emptyForm = {
  activity_id: '', coach_id: '', day_of_week: 0, start_time: '08:00', end_time: '09:00',
  is_recurring: true, specific_date: '', max_capacity_override: '', is_active: true,
};

export default function PlanningPage() {
  const { token } = useAuth();
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!token) return;
    apiFetch<ScheduleSlot[]>('/api/v1/schedule/', { token }).then(setSlots).catch(() => {});
    apiFetch<{ items: Activity[] }>('/api/v1/activities/?limit=100', { token }).then((r) => setActivities(r.items)).catch(() => {});
    apiFetch<Coach[]>('/api/v1/coaches/', { token }).then(setCoaches).catch(() => {});
  };

  useEffect(load, [token]);

  const openNew = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (slot: ScheduleSlot) => {
    setForm({
      activity_id: slot.activity_id, coach_id: slot.coach_id, day_of_week: slot.day_of_week,
      start_time: slot.start_time, end_time: slot.end_time, is_recurring: slot.is_recurring,
      specific_date: slot.specific_date || '', max_capacity_override: slot.max_capacity_override?.toString() || '',
      is_active: slot.is_active,
    });
    setEditId(slot.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        specific_date: form.specific_date || null,
        max_capacity_override: form.max_capacity_override ? +form.max_capacity_override : null,
      };
      if (editId) {
        await apiFetch(`/api/v1/schedule/${editId}`, { method: 'PUT', token: token!, body: JSON.stringify(body) });
      } else {
        await apiFetch('/api/v1/schedule/', { method: 'POST', token: token!, body: JSON.stringify(body) });
      }
      setModalOpen(false);
      load();
    } catch (err) { alert(err instanceof Error ? err.message : 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (slot: ScheduleSlot) => {
    if (!confirm('Supprimer ce creneau ?')) return;
    await apiFetch(`/api/v1/schedule/${slot.id}`, { method: 'DELETE', token: token! });
    load();
  };

  const getActivityName = (id: string) => activities.find((a) => a.id === id)?.name || id;
  const getCoachName = (id: string) => coaches.find((c) => c.id === id)?.name || id;

  const slotsByDay = days.map((_, i) => slots.filter((s) => s.day_of_week === i));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Planning</h1>
        <button onClick={openNew} className="btn-primary">+ Ajouter creneau</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
        {days.map((day, i) => (
          <div key={day} className="card p-3">
            <h3 className="text-sm font-bold text-primary mb-3 text-center">{day}</h3>
            <div className="space-y-2">
              {slotsByDay[i].length === 0 ? (
                <p className="text-xs text-dark-muted text-center">-</p>
              ) : (
                slotsByDay[i]
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map((slot) => (
                    <div key={slot.id} className={`p-2 rounded-lg text-xs border cursor-pointer transition-colors hover:border-primary/40 ${slot.is_active ? 'border-dark-border bg-dark-lighter' : 'border-red-500/30 bg-red-500/5'}`}>
                      <div className="font-semibold text-white truncate">{getActivityName(slot.activity_id)}</div>
                      <div className="text-dark-muted">{slot.start_time} - {slot.end_time}</div>
                      <div className="text-secondary truncate">{getCoachName(slot.coach_id)}</div>
                      <div className="flex gap-1 mt-1">
                        <button onClick={() => openEdit(slot)} className="text-primary hover:underline">Mod.</button>
                        <button onClick={() => handleDelete(slot)} className="text-red-400 hover:underline">Sup.</button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modifier creneau' : 'Nouveau creneau'} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-secondary mb-1">Activite</label>
              <select className="input-field" value={form.activity_id} onChange={(e) => setForm({ ...form, activity_id: e.target.value })} required>
                <option value="">Choisir...</option>
                {activities.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Coach</label>
              <select className="input-field" value={form.coach_id} onChange={(e) => setForm({ ...form, coach_id: e.target.value })} required>
                <option value="">Choisir...</option>
                {coaches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Jour</label>
              <select className="input-field" value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: +e.target.value })}>
                {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Capacite (override)</label>
              <input type="number" className="input-field" value={form.max_capacity_override} onChange={(e) => setForm({ ...form, max_capacity_override: e.target.value })} placeholder="Defaut activite" />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Debut</label>
              <input type="time" className="input-field" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Fin</label>
              <input type="time" className="input-field" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input type="checkbox" checked={form.is_recurring} onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })} className="accent-primary" /> Recurrent
            </label>
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-primary" /> Actif
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
