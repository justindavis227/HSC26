import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Announcement } from '../../lib/supabase';
import { localDateString } from '../utils/date';

const empty: Omit<Announcement, 'id' | 'created_at'> = {
  date: localDateString(),
  title: '',
  content: '',
  priority: 'normal',
};

export function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('announcements').select('*').order('date', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing(null);
    setForm(empty);
    setError('');
  }

  function startEdit(item: Announcement) {
    setEditing(item);
    setForm({ date: item.date, title: item.title, content: item.content, priority: item.priority });
    setError('');
  }

  async function save() {
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required.'); return; }
    setSaving(true);
    setError('');

    let saveError: string | null = null;
    if (editing) {
      const { error } = await supabase.from('announcements').update(form).eq('id', editing.id);
      if (error) saveError = error.message;
    } else {
      const { error } = await supabase.from('announcements').insert(form);
      if (error) saveError = error.message;
    }

    setSaving(false);
    if (saveError) {
      setError(saveError);
    } else {
      setEditing(null);
      setForm(empty);
      load();
    }
  }

  async function remove(id: string) {
    setDeleting(id);
    await supabase.from('announcements').delete().eq('id', id);
    setDeleting(null);
    load();
  }

  const isFormVisible = editing !== null || form.title !== '' || form.content !== '';

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
        <button onClick={startNew} className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition">
          + New
        </button>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {editing ? `Editing: ${editing.title}` : 'New Announcement'}
        </h2>
        {error && <div className="mb-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</div>}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as 'high' | 'normal' }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Announcement title"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Content</label>
            <textarea rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Announcement content…"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Announcement'}
            </button>
            {editing && (
              <button onClick={startNew} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-sm text-gray-400 text-center py-8">Loading…</div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className={`bg-white dark:bg-gray-900 rounded-xl border p-4 flex gap-4 items-start ${editing?.id === item.id ? 'border-[var(--primary)]' : 'border-gray-200 dark:border-gray-800'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.priority === 'high' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    {item.priority}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-600">{item.date}</span>
                </div>
                <div className="font-semibold text-sm text-gray-900 dark:text-white">{item.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 whitespace-pre-line">{item.content}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--primary)] hover:bg-blue-50 dark:hover:bg-blue-950 transition text-xs">Edit</button>
                <button onClick={() => remove(item.id)} disabled={deleting === item.id}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition text-xs disabled:opacity-40">
                  {deleting === item.id ? '…' : 'Del'}
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-gray-400 text-center py-8">No announcements yet.</div>}
        </div>
      )}
    </div>
  );
}
