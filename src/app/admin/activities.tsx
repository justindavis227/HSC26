import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Tournament, Elective } from '../../lib/supabase';

// ─── Tournaments ────────────────────────────────────────────────────────────

const T_DAYS = ['Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const T_DAY_ORDER: Record<string, number> = { Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4 };

type TForm = { activity: string; sort_order: number };
const emptyT: TForm = { activity: '', sort_order: 0 };

function TournamentsEditor() {
  const [day, setDay] = useState('Tuesday');
  const [items, setItems] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [form, setForm] = useState<TForm>(emptyT);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function load(d: string) {
    setLoading(true);
    const { data } = await supabase.from('tournaments').select('*').eq('day', d).order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(day); }, [day]);

  function startNew() { setEditing(null); setForm({ activity: '', sort_order: items.length + 1 }); setError(''); }
  function startEdit(item: Tournament) { setEditing(item); setForm({ activity: item.activity, sort_order: item.sort_order }); setError(''); }

  async function save() {
    if (!form.activity.trim()) { setError('Activity name is required.'); return; }
    setSaving(true); setError('');
    const payload = { ...form, day, day_order: T_DAY_ORDER[day] ?? 0 };
    if (editing) {
      await supabase.from('tournaments').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('tournaments').insert(payload);
    }
    setSaving(false); setEditing(null); setForm(emptyT); load(day);
  }

  async function remove(id: number) {
    if (!confirm('Delete this activity?')) return;
    setDeleting(id);
    await supabase.from('tournaments').delete().eq('id', id);
    setDeleting(null); load(day);
  }

  const inputClass = 'flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';

  return (
    <div className="max-w-2xl space-y-4">
      {/* Day selector */}
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

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {editing ? `Editing: ${editing.activity}` : `New activity — ${day}`}
        </h2>
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</div>}
        <div className="flex gap-2">
          <input type="text" value={form.activity} onChange={e => setForm(f => ({ ...f, activity: e.target.value }))}
            placeholder="Activity name" className={inputClass} />
          <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
            placeholder="Order" className="w-20 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
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

      {/* List */}
      {loading ? <div className="text-sm text-gray-400 text-center py-6">Loading…</div> : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={item.id} className={`bg-white dark:bg-gray-900 rounded-lg border px-4 py-3 flex items-center gap-3 ${editing?.id === item.id ? 'border-[var(--primary)]' : 'border-gray-200 dark:border-gray-800'}`}>
              <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
              <span className="flex-1 text-sm text-gray-900 dark:text-white">{item.activity}</span>
              <button onClick={() => startEdit(item)} className="text-xs text-gray-400 hover:text-[var(--primary)] transition">Edit</button>
              <button onClick={() => remove(item.id)} disabled={deleting === item.id} className="text-xs text-gray-400 hover:text-red-600 transition disabled:opacity-40">
                {deleting === item.id ? '…' : 'Del'}
              </button>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-gray-400 text-center py-6">No activities for {day}.</div>}
        </div>
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
const emptyE: EForm = { day: E_DAYS[0], time_slot: '1:30-2:30', theme: 'Jesus', title: '', speaker: '', location: '' };

function ElectivesEditor() {
  const [filterDay, setFilterDay] = useState(E_DAYS[0]);
  const [items, setItems] = useState<Elective[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Elective | null>(null);
  const [form, setForm] = useState<EForm>(emptyE);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');

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
    setForm({ day: item.day, time_slot: item.time_slot, theme: item.theme, title: item.title, speaker: item.speaker, location: item.location });
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

  return (
    <div className="max-w-3xl space-y-4">
      {/* Form */}
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
          {inp('Location', 'location', 'e.g. Alumni Hall')}
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

      {/* Day filter */}
      <div className="flex gap-2 flex-wrap">
        {E_DAYS.map(d => (
          <button key={d} onClick={() => setFilterDay(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${d === filterDay ? 'bg-[var(--primary)] text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)]'}`}>
            {d.split(' ').slice(0, 2).join(' ')}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? <div className="text-sm text-gray-400 text-center py-6">Loading…</div> : (
        <div className="space-y-2">
          {displayed.map(item => (
            <div key={item.id} className={`bg-white dark:bg-gray-900 rounded-lg border px-4 py-3 flex gap-3 items-start ${editing?.id === item.id ? 'border-[var(--primary)]' : 'border-gray-200 dark:border-gray-800'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-gray-400">{item.time_slot}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{item.theme}</span>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</div>
                {item.speaker && <div className="text-xs text-gray-500 truncate">{item.speaker}</div>}
                {item.location && <div className="text-xs text-gray-400 truncate">{item.location}</div>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(item)} className="text-xs text-gray-400 hover:text-[var(--primary)] transition p-1">Edit</button>
                <button onClick={() => remove(item.id)} disabled={deleting === item.id} className="text-xs text-gray-400 hover:text-red-600 transition p-1 disabled:opacity-40">
                  {deleting === item.id ? '…' : 'Del'}
                </button>
              </div>
            </div>
          ))}
          {displayed.length === 0 && <div className="text-sm text-gray-400 text-center py-6">No electives for this day.</div>}
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

type Tab = 'tournaments' | 'electives';
const TABS: { id: Tab; label: string }[] = [
  { id: 'tournaments', label: 'Tournaments' },
  { id: 'electives',   label: 'Electives'   },
];

export function AdminActivities() {
  const [tab, setTab] = useState<Tab>('tournaments');

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activities</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage tournaments and electives</p>
      </div>

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
