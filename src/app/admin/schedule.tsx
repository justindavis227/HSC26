import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ScheduleItem } from '../../lib/supabase';
import { campData } from '../data/camp-data';
import { campusSchedules } from '../data/campus-schedules';

const DAYS = ['Sun Jun 29', 'Mon Jun 30', 'Tue Jul 1', 'Wed Jul 2', 'Thu Jul 3'];
const DAY_ORDER: Record<string, number> = { 'Sun Jun 29': 1, 'Mon Jun 30': 2, 'Tue Jul 1': 3, 'Wed Jul 2': 4, 'Thu Jul 3': 5 };
const ALL_CAMPUSES = campusSchedules.map((c) => c.name);

type ItemForm = { time: string; activity: string; location: string; sort_order: number };
const emptyForm: ItemForm = { time: '', activity: '', location: '', sort_order: 0 };

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

  const campuses = ALL_CAMPUSES;

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('schedule_items').select('*').eq('campus', campus).eq('day', day).order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [campus, day]);

  function startNew() {
    setEditing(null);
    setForm({ ...emptyForm, sort_order: items.length + 1 });
    setError('');
  }

  function startEdit(item: ScheduleItem) {
    setEditing(item);
    setForm({ time: item.time, activity: item.activity, location: item.location, sort_order: item.sort_order });
    setError('');
  }

  async function save() {
    if (!form.activity.trim()) { setError('Activity is required.'); return; }
    setSaving(true);
    setError('');
    const payload = { ...form, campus, day, day_order: DAY_ORDER[day] ?? 0 };
    let err = null;
    if (editing) {
      const { error } = await supabase.from('schedule_items').update(payload).eq('id', editing.id);
      err = error;
    } else {
      const { error } = await supabase.from('schedule_items').insert(payload);
      err = error;
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
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

  async function seedCampus() {
    const campusSchedule = campData.schedules[campus];
    if (!campusSchedule) return;
    setSeeding(true);

    // Delete existing for this campus
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
          sort_order: idx + 1,
        });
      });
    });

    // Insert in batches
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule</h1>
        <div className="flex gap-2">
          <button onClick={seedCampus} disabled={seeding} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-40">
            {seeding ? 'Importing…' : `Import ${campus} Schedule`}
          </button>
          <button onClick={seedAllCampuses} disabled={seeding} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 transition disabled:opacity-40">
            Import All Campuses
          </button>
        </div>
      </div>

      {/* Campus + Day Picker */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Campus</label>
          <select value={campus} onChange={e => { setCampus(e.target.value); setEditing(null); setForm(emptyForm); }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
            {campuses.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Day</label>
          <div className="flex gap-1">
            {DAYS.map(d => (
              <button key={d} onClick={() => { setDay(d); setEditing(null); setForm(emptyForm); }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${day === d ? 'bg-[var(--primary)] text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)]'}`}>
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
        {error && <div className="mb-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time</label>
            <input type="text" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              placeholder="e.g. 7:15 PM"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Activity *</label>
            <input type="text" value={form.activity} onChange={e => setForm(f => ({ ...f, activity: e.target.value }))}
              placeholder="Activity name"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Location</label>
            <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Location"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Activity'}
          </button>
          {editing && (
            <button onClick={() => { setEditing(null); setForm(emptyForm); }}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
          )}
          <button onClick={startNew} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition ml-auto">
            + New Activity
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-sm text-gray-400 text-center py-8">Loading…</div>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={item.id} className={`bg-white dark:bg-gray-900 rounded-lg border px-4 py-3 flex gap-3 items-center ${editing?.id === item.id ? 'border-[var(--primary)]' : 'border-gray-200 dark:border-gray-800'}`}>
              <span className="text-xs text-gray-400 w-4 text-right shrink-0">{i + 1}</span>
              <span className="text-xs text-gray-500 w-24 shrink-0 font-mono">{item.time || '—'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.activity}</div>
                {item.location && <div className="text-xs text-gray-400 truncate">{item.location}</div>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(item)} className="p-1 rounded text-gray-400 hover:text-[var(--primary)] transition text-xs">Edit</button>
                <button onClick={() => remove(item.id)} disabled={deleting === item.id}
                  className="p-1 rounded text-gray-400 hover:text-red-600 transition text-xs disabled:opacity-40">
                  {deleting === item.id ? '…' : 'Del'}
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-8">
              No activities for {campus} / {day}. Use "Import {campus} Schedule" to load the original data.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
