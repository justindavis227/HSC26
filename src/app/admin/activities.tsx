import { useEffect, useState } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Tournament, Elective } from '../../lib/supabase';
import { PageTitleEditor } from './page-title-editor';

// ─── Tournaments ─────────────────────────────────────────────────────────────

const T_DAYS = ['Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const T_DAY_ORDER: Record<string, number> = { Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4 };

type TForm = { activity: string };
const emptyT: TForm = { activity: '' };

async function persistTournamentOrder(ordered: Tournament[]) {
  await Promise.all(ordered.map((item, idx) =>
    supabase.from('tournaments').update({ sort_order: idx + 1 }).eq('id', item.id)
  ));
}

function SortableTournament({ item, isEditing, deleting, onEdit, onDelete }: {
  item: Tournament; isEditing: boolean; deleting: boolean;
  onEdit: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 10 : undefined }}
      className={`bg-white dark:bg-gray-900 rounded-lg border px-3 py-3 flex items-center gap-3 ${isEditing ? 'border-[var(--primary)]' : 'border-gray-200 dark:border-gray-800'}`}
    >
      <button
        {...attributes} {...listeners}
        className="p-0.5 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="flex-1 text-sm text-gray-900 dark:text-white">{item.activity}</span>
      <button onClick={onEdit} className="text-xs text-gray-400 hover:text-[var(--primary)] transition p-1">Edit</button>
      <button onClick={onDelete} disabled={deleting} className="text-xs text-gray-400 hover:text-red-600 transition p-1 disabled:opacity-40">
        {deleting ? '…' : 'Del'}
      </button>
    </div>
  );
}

function TournamentsEditor() {
  const [day, setDay]         = useState('Tuesday');
  const [items, setItems]     = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [form, setForm]       = useState<TForm>(emptyT);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError]     = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor,  { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,    { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function load(d: string) {
    setLoading(true);
    const { data } = await supabase.from('tournaments').select('*').eq('day', d).order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(day); }, [day]);

  function startNew() { setEditing(null); setForm(emptyT); setError(''); }
  function startEdit(item: Tournament) { setEditing(item); setForm({ activity: item.activity }); setError(''); }

  async function save() {
    if (!form.activity.trim()) { setError('Activity name is required.'); return; }
    setSaving(true); setError('');
    const payload = { activity: form.activity, day, day_order: T_DAY_ORDER[day] ?? 0 };
    if (editing) {
      await supabase.from('tournaments').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('tournaments').insert({ ...payload, sort_order: items.length + 1 });
    }
    setSaving(false); setEditing(null); setForm(emptyT); load(day);
  }

  async function remove(id: number) {
    if (!confirm('Delete this activity?')) return;
    setDeleting(id);
    await supabase.from('tournaments').delete().eq('id', id);
    setDeleting(null); load(day);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex(i => i.id === active.id);
    const newIdx = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);
    setItems(reordered);
    await persistTournamentOrder(reordered);
  }

  const inputClass = 'flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Day</label>
        <div className="flex gap-2 flex-wrap">
          {T_DAYS.map(d => (
            <button key={d} onClick={() => { setDay(d); setEditing(null); setForm(emptyT); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${d === day ? 'bg-[var(--primary)] text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)]'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {editing ? `Editing: ${editing.activity}` : `New activity — ${day}`}
        </h2>
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</div>}
        <div className="flex gap-2">
          <input type="text" value={form.activity} onChange={e => setForm(f => ({ ...f, activity: e.target.value }))}
            placeholder="Activity name" className={inputClass} />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Activity'}
          </button>
          {editing && (
            <button onClick={startNew} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
          )}
          <button onClick={startNew} className="ml-auto px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            + New
          </button>
        </div>
      </div>

      {loading ? <div className="text-sm text-gray-400 text-center py-6">Loading…</div> : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map(item => (
                <SortableTournament
                  key={item.id}
                  item={item}
                  isEditing={editing?.id === item.id}
                  deleting={deleting === item.id}
                  onEdit={() => startEdit(item)}
                  onDelete={() => remove(item.id)}
                />
              ))}
              {items.length === 0 && <div className="text-sm text-gray-400 text-center py-6">No activities for {day}.</div>}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// ─── Electives ───────────────────────────────────────────────────────────────

const E_DAYS = ['Tuesday June 30th', 'Wednesday July 1st', 'Thursday July 2nd', 'Friday July 3rd'];
const E_DAY_ORDER: Record<string, number> = { 'Tuesday June 30th': 1, 'Wednesday July 1st': 2, 'Thursday July 2nd': 3, 'Friday July 3rd': 4 };
const TIME_SLOTS = ['1:30-2:30', '3:00-4:00'];
const THEMES = ['Jesus', 'Prayer', 'Bible', 'Serving', 'Evangelism', 'Miscellaneous'];
const THEME_ORDER: Record<string, number> = { Jesus: 1, Prayer: 2, Bible: 3, Serving: 4, Evangelism: 5, Miscellaneous: 6 };

type EForm = Omit<Elective, 'id' | 'updated_at' | 'day_order' | 'slot_order' | 'theme_order'>;
const emptyE: EForm = { day: E_DAYS[0], time_slot: '1:30-2:30', theme: 'Jesus', title: '', speaker: '', location: '', maps_url: '' };

function SortableElective({ item, isEditing, deleting, onEdit, onDelete }: {
  item: Elective; isEditing: boolean; deleting: boolean;
  onEdit: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 10 : undefined }}
      className={`bg-white dark:bg-gray-900 rounded-lg border px-3 py-3 flex gap-3 items-start ${isEditing ? 'border-[var(--primary)]' : 'border-gray-200 dark:border-gray-800'}`}
    >
      <button
        {...attributes} {...listeners}
        className="p-0.5 mt-0.5 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{item.theme}</span>
        </div>
        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</div>
        {item.speaker && <div className="text-xs text-gray-500 truncate">{item.speaker}</div>}
        {item.location && (
          <div className="text-xs text-gray-400 truncate">
            {item.location}
            {item.maps_url && <span className="ml-1 text-[var(--primary)]">↗</span>}
          </div>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={onEdit} className="text-xs text-gray-400 hover:text-[var(--primary)] transition p-1">Edit</button>
        <button onClick={onDelete} disabled={deleting} className="text-xs text-gray-400 hover:text-red-600 transition p-1 disabled:opacity-40">
          {deleting ? '…' : 'Del'}
        </button>
      </div>
    </div>
  );
}

function SlotDndList({ slot, items, editingId, deleting, onReorder, onEdit, onDelete }: {
  slot: string;
  items: Elective[];
  editingId: number | null | undefined;
  deleting: number | null;
  onReorder: (slot: string, reordered: Elective[]) => void;
  onEdit: (item: Elective) => void;
  onDelete: (id: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor,  { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,    { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex(i => i.id === active.id);
    const newIdx = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);
    onReorder(slot, reordered);
    await Promise.all(reordered.map((item, idx) =>
      supabase.from('electives').update({ theme_order: idx + 1 }).eq('id', item.id)
    ));
  }

  if (items.length === 0) {
    return <div className="text-xs text-gray-400 text-center py-3">No electives for this slot.</div>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map(item => (
            <SortableElective
              key={item.id}
              item={item}
              isEditing={editingId === item.id}
              deleting={deleting === item.id}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function ElectivesEditor() {
  const [filterDay, setFilterDay] = useState(E_DAYS[0]);
  const [items, setItems]         = useState<Elective[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState<Elective | null>(null);
  const [form, setForm]           = useState<EForm>(emptyE);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<number | null>(null);
  const [error, setError]         = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('electives').select('*').order('day_order').order('slot_order').order('theme_order');
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() { setEditing(null); setForm({ ...emptyE, day: filterDay }); setError(''); }
  function startEdit(item: Elective) {
    setEditing(item);
    setForm({ day: item.day, time_slot: item.time_slot, theme: item.theme, title: item.title, speaker: item.speaker, location: item.location, maps_url: item.maps_url ?? '' });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save() {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSaving(true); setError('');
    const payload = {
      ...form,
      day_order: E_DAY_ORDER[form.day] ?? 0,
      slot_order: TIME_SLOTS.indexOf(form.time_slot) + 1,
      theme_order: THEME_ORDER[form.theme] ?? 99,
      updated_at: new Date().toISOString(),
    };
    if (editing) {
      await supabase.from('electives').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('electives').insert(payload);
    }
    setSaving(false); setEditing(null); setForm({ ...emptyE, day: filterDay }); load();
  }

  async function remove(id: number) {
    if (!confirm('Delete this elective?')) return;
    setDeleting(id);
    await supabase.from('electives').delete().eq('id', id);
    setDeleting(null); load();
  }

  function handleSlotReorder(slot: string, reordered: Elective[]) {
    setItems(prev => {
      const others = prev.filter(e => !(e.day === filterDay && e.time_slot === slot));
      return [...others, ...reordered].sort((a, b) => {
        if (a.day_order !== b.day_order) return a.day_order - b.day_order;
        if (a.slot_order !== b.slot_order) return a.slot_order - b.slot_order;
        return a.theme_order - b.theme_order;
      });
    });
  }

  const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';
  const sel = (label: string, key: keyof EForm, options: string[]) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <select value={String(form[key])} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className={inputClass}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
  const inp = (label: string, key: keyof EForm, placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <input type="text" value={String(form[key])} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className={inputClass} />
    </div>
  );

  const displayed = items.filter(e => e.day === filterDay);
  const bySlot: Record<string, Elective[]> = {};
  for (const slot of TIME_SLOTS) {
    bySlot[slot] = displayed.filter(e => e.time_slot === slot);
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {editing ? `Editing: ${editing.title}` : 'New Elective'}
          </h2>
          <button onClick={startNew} className="px-3 py-1.5 bg-[var(--primary)] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition">+ New</button>
        </div>
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          {sel('Day', 'day', E_DAYS)}
          {sel('Time Slot', 'time_slot', TIME_SLOTS)}
          {sel('Theme', 'theme', THEMES)}
        </div>
        <div className="space-y-3 mb-4">
          {inp('Title *', 'title', 'Session title')}
          {inp('Speaker', 'speaker', 'Speaker name(s)')}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {inp('Location', 'location', 'e.g. IMU: Alumni Hall')}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Maps URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input type="url" value={form.maps_url} onChange={e => setForm(f => ({ ...f, maps_url: e.target.value }))}
                placeholder="https://maps.google.com/…" className={inputClass} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Elective'}
          </button>
          {editing && (
            <button onClick={startNew} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {E_DAYS.map(d => (
          <button key={d} onClick={() => setFilterDay(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${d === filterDay ? 'bg-[var(--primary)] text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)]'}`}>
            {d.split(' ').slice(0, 2).join(' ')}
          </button>
        ))}
      </div>

      {loading ? <div className="text-sm text-gray-400 text-center py-6">Loading…</div> : (
        <div className="space-y-6">
          {TIME_SLOTS.map(slot => (
            <div key={slot}>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{slot}</h3>
              <SlotDndList
                slot={slot}
                items={bySlot[slot] ?? []}
                editingId={editing?.id}
                deleting={deleting}
                onReorder={handleSlotReorder}
                onEdit={startEdit}
                onDelete={remove}
              />
            </div>
          ))}
          {displayed.length === 0 && <div className="text-sm text-gray-400 text-center py-6">No electives for this day.</div>}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'tournaments' | 'electives';
const TABS: { id: Tab; label: string }[] = [
  { id: 'tournaments', label: 'Tournaments' },
  { id: 'electives',   label: 'Electives'   },
];

export function AdminActivities() {
  const [tab, setTab] = useState<Tab>('tournaments');

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activities</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage tournaments and electives</p>
      </div>

      <PageTitleEditor pageKey="activities" />

      <div className="flex gap-2 mb-6">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === id ? 'bg-[var(--primary)] text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)]'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'tournaments' && <TournamentsEditor />}
      {tab === 'electives'   && <ElectivesEditor />}
    </div>
  );
}
