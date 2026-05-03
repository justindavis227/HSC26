import { useEffect, useState } from 'react';
import { PageTitleEditor } from './page-title-editor';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ScheduleItem } from '../../lib/supabase';
import { campData } from '../data/camp-data';
import { campusSchedules } from '../data/campus-schedules';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_ORDER: Record<string, number> = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5 };
const ALL_CAMPUSES = campusSchedules.map((c) => c.name);

type ItemForm = { time: string; activity: string; location: string; maps_url: string };
const emptyForm: ItemForm = { time: '', activity: '', location: '', maps_url: '' };

function parseTimeToMinutes(time: string): number {
  if (!time.trim()) return 9999;
  const m = time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!m) return 9999;
  let hours = parseInt(m[1]);
  const minutes = parseInt(m[2]);
  const period = (m[3] ?? '').toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

async function persistSortOrders(ordered: ScheduleItem[]) {
  await Promise.all(
    ordered.map((item, idx) =>
      supabase.from('schedule_items').update({ sort_order: idx + 1 }).eq('id', item.id)
    )
  );
}

interface SortableItemProps {
  item: ScheduleItem;
  index: number;
  isEditing: boolean;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableItem({ item, index, isEditing, deleting, onEdit, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      className={`bg-white dark:bg-gray-900 rounded-lg border px-4 py-3 flex gap-3 items-center ${
        isEditing ? 'border-[var(--primary)]' : 'border-gray-200 dark:border-gray-800'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-0.5 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <span className="text-xs text-gray-400 w-4 text-right shrink-0">{index + 1}</span>
      <span className="text-xs text-gray-500 w-24 shrink-0 font-mono">{item.time || '—'}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.activity}</div>
        {item.location && (
          <div className="text-xs text-gray-400 truncate">
            {item.location}
            {item.maps_url && (
              <a
                href={item.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-[var(--primary)] hover:underline"
              >
                ↗
              </a>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="p-1 rounded text-gray-400 hover:text-[var(--primary)] transition text-xs"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="p-1 rounded text-gray-400 hover:text-red-600 transition text-xs disabled:opacity-40"
        >
          {deleting ? '…' : 'Del'}
        </button>
      </div>
    </div>
  );
}

export function AdminSchedule() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [campus, setCampus] = useState('Indiana');
  const [day, setDay] = useState('Monday');
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('schedule_items')
      .select('*')
      .eq('campus', campus)
      .eq('day', day)
      .order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [campus, day]);

  function startNew() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
  }

  function startEdit(item: ScheduleItem) {
    setEditing(item);
    setForm({
      time: item.time,
      activity: item.activity,
      location: item.location,
      maps_url: item.maps_url ?? '',
    });
    setError('');
  }

  async function save() {
    if (!form.activity.trim()) { setError('Activity is required.'); return; }
    setSaving(true);
    setError('');

    if (editing) {
      const { error: err } = await supabase
        .from('schedule_items')
        .update({ ...form, campus, day, day_order: DAY_ORDER[day] ?? 0 })
        .eq('id', editing.id);
      setSaving(false);
      if (err) { setError(err.message); return; }
    } else {
      // Insert with a provisional sort_order, then re-sort all by time
      const { error: err } = await supabase
        .from('schedule_items')
        .insert({ ...form, campus, day, day_order: DAY_ORDER[day] ?? 0, sort_order: 9999 });
      setSaving(false);
      if (err) { setError(err.message); return; }

      // Reload, re-sort by time, persist sort_order values
      const { data } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('campus', campus)
        .eq('day', day)
        .order('sort_order');
      const all = data ?? [];
      const sorted = [...all].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
      await persistSortOrders(sorted);
      setItems(sorted);
      setEditing(null);
      setForm(emptyForm);
      return;
    }

    setEditing(null);
    setForm(emptyForm);
    load();
  }

  async function remove(id: number) {
    setDeleting(id);
    await supabase.from('schedule_items').delete().eq('id', id);
    setDeleting(null);
    load();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);
    setItems(reordered);
    await persistSortOrders(reordered);
  }

  async function seedCampus() {
    const campusSchedule = campData.schedules[campus];
    if (!campusSchedule) return;
    setSeeding(true);
    await supabase.from('schedule_items').delete().eq('campus', campus);
    const rows: Omit<ScheduleItem, 'id' | 'created_at'>[] = [];
    campusSchedule.forEach(daySchedule => {
      daySchedule.activities.forEach((act, idx) => {
        rows.push({
          campus,
          day: daySchedule.day,
          day_order: DAY_ORDER[daySchedule.day] ?? 0,
          time: act.time,
          activity: act.activity,
          location: act.location,
          maps_url: '',
          sort_order: idx + 1,
        });
      });
    });
    for (let i = 0; i < rows.length; i += 100) {
      await supabase.from('schedule_items').insert(rows.slice(i, i + 100));
    }
    setSeeding(false);
    load();
  }

  async function seedAllCampuses() {
    if (!confirm('This will replace ALL schedule data in the database with the original data from camp-data.ts. Continue?')) return;
    setSeeding(true);
    await supabase.from('schedule_items').delete().neq('id', 0);
    const rows: Omit<ScheduleItem, 'id' | 'created_at'>[] = [];
    for (const [campusName, days] of Object.entries(campData.schedules)) {
      days.forEach(daySchedule => {
        daySchedule.activities.forEach((act, idx) => {
          rows.push({
            campus: campusName,
            day: daySchedule.day,
            day_order: DAY_ORDER[daySchedule.day] ?? 0,
            time: act.time,
            activity: act.activity,
            location: act.location,
            maps_url: '',
            sort_order: idx + 1,
          });
        });
      });
    }
    for (let i = 0; i < rows.length; i += 100) {
      await supabase.from('schedule_items').insert(rows.slice(i, i + 100));
    }
    setSeeding(false);
    load();
  }

  return (
    <div className="max-w-4xl">
      <PageTitleEditor pageKey="schedule" />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule</h1>
        <div className="flex gap-2">
          <button
            onClick={seedCampus}
            disabled={seeding}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-40"
          >
            {seeding ? 'Importing…' : `Import ${campus} Schedule`}
          </button>
          <button
            onClick={seedAllCampuses}
            disabled={seeding}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 transition disabled:opacity-40"
          >
            Import All Campuses
          </button>
        </div>
      </div>

      {/* Campus + Day Picker */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Campus</label>
          <select
            value={campus}
            onChange={e => { setCampus(e.target.value); setEditing(null); setForm(emptyForm); }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            {ALL_CAMPUSES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Day</label>
          <div className="flex gap-1">
            {DAYS.map(d => (
              <button
                key={d}
                onClick={() => { setDay(d); setEditing(null); setForm(emptyForm); }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  day === d
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)]'
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {editing ? 'Editing activity' : `New activity — ${campus} / ${day}`}
        </h2>
        {error && (
          <div className="mb-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time</label>
            <input
              type="text"
              value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              placeholder="e.g. 7:15 PM"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Activity *</label>
            <input
              type="text"
              value={form.activity}
              onChange={e => setForm(f => ({ ...f, activity: e.target.value }))}
              placeholder="Activity name"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Location name"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Maps URL <span className="text-gray-400 font-normal">(optional — makes the location name a tappable link)</span>
          </label>
          <input
            type="url"
            value={form.maps_url}
            onChange={e => setForm(f => ({ ...f, maps_url: e.target.value }))}
            placeholder="https://maps.google.com/…"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Activity'}
          </button>
          {editing && (
            <button
              onClick={() => { setEditing(null); setForm(emptyForm); }}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
          )}
          <button
            onClick={startNew}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition ml-auto"
          >
            + New Activity
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-sm text-gray-400 text-center py-8">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-8">
          No activities for {campus} / {day}. Use "Import {campus} Schedule" to load the original data.
        </div>
      ) : (
        <div>
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <GripVertical className="w-3.5 h-3.5" />
            Drag rows to reorder · new items auto-sort by time
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {items.map((item, i) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    index={i}
                    isEditing={editing?.id === item.id}
                    deleting={deleting === item.id}
                    onEdit={() => startEdit(item)}
                    onDelete={() => remove(item.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
