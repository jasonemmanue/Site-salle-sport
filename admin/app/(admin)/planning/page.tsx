'use client';

import { useEffect, useState, FormEvent, useRef, DragEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import Modal from '@/components/Modal';
import type { ScheduleSlot, Activity, Coach } from '@/lib/types';

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const hours = Array.from({ length: 15 }, (_, i) => i + 6);

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
  const [dragSlotId, setDragSlotId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // La grille 7 jours x 15 heures reclame ~900px, et le glisser-deposer HTML5
  // ne repond pas au tactile. Sous `lg`, la vue liste devient donc le defaut —
  // elle expose les memes actions Modifier / Supprimer. La grille reste
  // accessible d'un clic, avec defilement horizontal.
  useEffect(() => {
    if (window.matchMedia('(max-width: 1023px)').matches) setViewMode('list');
  }, []);

  const load = () => {
    if (!token) return;
    apiFetch<ScheduleSlot[]>('/api/v1/schedule/', { token }).then(setSlots).catch(() => {});
    apiFetch<{ items: Activity[] }>('/api/v1/activities/?limit=100', { token }).then((r) => setActivities(r.items)).catch(() => {});
    apiFetch<Coach[]>('/api/v1/coaches/', { token }).then(setCoaches).catch(() => {});
  };

  useEffect(load, [token]);

  const openNew = (day?: number, hour?: number) => {
    setForm({
      ...emptyForm,
      day_of_week: day ?? 0,
      start_time: hour !== undefined ? `${String(hour).padStart(2, '0')}:00` : '08:00',
      end_time: hour !== undefined ? `${String(hour + 1).padStart(2, '0')}:00` : '09:00',
    });
    setEditId(null);
    setModalOpen(true);
  };
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

  const handleDragStart = (e: DragEvent, slotId: string) => {
    setDragSlotId(slotId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e: DragEvent, dayOfWeek: number, hour: number) => {
    e.preventDefault();
    if (!dragSlotId || !token) return;
    const slot = slots.find((s) => s.id === dragSlotId);
    if (!slot) return;
    const duration = getHourDiff(slot.start_time, slot.end_time);
    const newStart = `${String(hour).padStart(2, '0')}:00`;
    const newEnd = `${String(hour + duration).padStart(2, '0')}:00`;
    try {
      await apiFetch(`/api/v1/schedule/${dragSlotId}`, {
        method: 'PUT', token,
        body: JSON.stringify({
          activity_id: slot.activity_id, coach_id: slot.coach_id,
          day_of_week: dayOfWeek, start_time: newStart, end_time: newEnd,
          is_recurring: slot.is_recurring, specific_date: slot.specific_date,
          max_capacity_override: slot.max_capacity_override, is_active: slot.is_active,
        }),
      });
      load();
    } catch (err) { alert(err instanceof Error ? err.message : 'Erreur'); }
    setDragSlotId(null);
  };

  const getHourDiff = (start: string, end: string) => {
    const [sh] = start.split(':').map(Number);
    const [eh] = end.split(':').map(Number);
    return Math.max(eh - sh, 1);
  };

  const getActivityName = (id: string) => activities.find((a) => a.id === id)?.name || '...';
  const getCoachName = (id: string) => coaches.find((c) => c.id === id)?.name || '...';
  const getActivityColor = (id: string) => {
    const cat = activities.find((a) => a.id === id)?.category;
    // Teintes sombres : ces couleurs servent de bordure sur les cartes du
    // contenu admin, qui est en thème clair (cf. .admin-content).
    const colors: Record<string, string> = { force: '#0F1724', cardio: '#B8960A', flexibility: '#64748B', martial_arts: '#334155', dance: '#94A3B8' };
    return colors[cat || ''] || '#0F1724';
  };

  const getSlotAt = (day: number, hour: number) =>
    slots.filter((s) => s.day_of_week === day && parseInt(s.start_time) <= hour && parseInt(s.end_time) > hour);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Planning</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-dark-border overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 text-sm ${viewMode === 'grid' ? 'bg-white text-black' : 'text-secondary hover:text-white'}`}>Grille</button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-sm ${viewMode === 'list' ? 'bg-white text-black' : 'text-secondary hover:text-white'}`}>Liste</button>
          </div>
          <button onClick={() => openNew()} className="btn-primary">+ Ajouter creneau</button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-8 gap-0 border border-dark-border rounded-xl overflow-hidden">
              <div className="bg-dark-lighter p-2 border-b border-r border-dark-border" />
              {days.map((day) => (
                <div key={day} className="bg-dark-lighter p-2 text-center text-sm font-bold text-primary border-b border-r border-dark-border last:border-r-0">{day}</div>
              ))}
              {hours.map((hour) => (
                <div key={hour} className="contents">
                  <div className="bg-dark-lighter p-2 text-xs text-dark-muted text-right border-b border-r border-dark-border">{String(hour).padStart(2, '0')}:00</div>
                  {days.map((_, dayIdx) => {
                    const cellSlots = getSlotAt(dayIdx, hour);
                    const isFirstHour = cellSlots.length > 0 && cellSlots.some((s) => parseInt(s.start_time) === hour);
                    return (
                      <div
                        key={dayIdx}
                        className="border-b border-r border-dark-border last:border-r-0 min-h-[48px] p-0.5 hover:bg-dark-lighter/50 transition-colors cursor-pointer"
                        onDoubleClick={() => openNew(dayIdx, hour)}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                        onDrop={(e) => handleDrop(e, dayIdx, hour)}
                      >
                        {isFirstHour && cellSlots.filter((s) => parseInt(s.start_time) === hour).map((slot) => (
                          <div
                            key={slot.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, slot.id)}
                            onClick={() => openEdit(slot)}
                            className={`rounded p-1.5 text-[10px] leading-tight cursor-grab active:cursor-grabbing border transition-all hover:scale-[1.02] ${slot.is_active ? 'border-dark-border' : 'border-red-500/30 opacity-60'}`}
                            style={{ backgroundColor: `${getActivityColor(slot.activity_id)}15`, borderLeftWidth: 3, borderLeftColor: getActivityColor(slot.activity_id) }}
                          >
                            <div className="font-bold text-white truncate">{getActivityName(slot.activity_id)}</div>
                            <div className="text-dark-muted">{slot.start_time}-{slot.end_time}</div>
                            <div className="text-secondary truncate">{getCoachName(slot.coach_id)}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <p className="text-dark-muted text-xs mt-3">
            Double-cliquer sur une case pour ajouter, glisser-deposer pour deplacer.
            Sur ecran tactile, passer par la vue Liste.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
          {days.map((day, i) => {
            const daySlots = slots.filter((s) => s.day_of_week === i).sort((a, b) => a.start_time.localeCompare(b.start_time));
            return (
              <div key={day} className="card p-3">
                <h3 className="text-sm font-bold text-primary mb-3 text-center">{day}</h3>
                <div className="space-y-2">
                  {daySlots.length === 0 ? (
                    <p className="text-xs text-dark-muted text-center">-</p>
                  ) : daySlots.map((slot) => (
                    <div key={slot.id} className={`p-2 rounded-lg text-xs border cursor-pointer transition-colors hover:border-primary/40 ${slot.is_active ? 'border-dark-border bg-dark-lighter' : 'border-red-500/30 bg-red-500/5'}`}>
                      <div className="font-semibold text-white truncate">{getActivityName(slot.activity_id)}</div>
                      <div className="text-dark-muted">{slot.start_time} - {slot.end_time}</div>
                      <div className="text-secondary truncate">{getCoachName(slot.coach_id)}</div>
                      <div className="flex gap-1 mt-1">
                        <button onClick={() => openEdit(slot)} className="text-primary hover:underline">Mod.</button>
                        <button onClick={() => handleDelete(slot)} className="text-red-400 hover:underline">Sup.</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modifier creneau' : 'Nouveau creneau'} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          {!form.is_recurring && (
            <div>
              <label className="block text-sm text-secondary mb-1">Date specifique</label>
              <input type="date" className="input-field" value={form.specific_date} onChange={(e) => setForm({ ...form, specific_date: e.target.value })} />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
            {editId && <button type="button" onClick={() => { const s = slots.find((s) => s.id === editId); if (s) handleDelete(s); setModalOpen(false); }} className="btn-danger">Supprimer</button>}
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
