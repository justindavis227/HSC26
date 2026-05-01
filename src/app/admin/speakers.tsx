import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Speaker } from '../../lib/supabase';

type SpeakerForm = Omit<Speaker, 'id' | 'created_at'>;

const empty: SpeakerForm = {
  name: '',
  role: '',
  organization: '',
  bio: '',
  image: '',
  instagram: '',
  sort_order: 0,
};

export function AdminSpeakers() {
  const [items, setItems] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Speaker | null>(null);
  const [form, setForm] = useState<SpeakerForm>(empty);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('speakers').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing(null);
    setForm({ ...empty, sort_order: items.length + 1 });
    setError('');
  }

  function startEdit(item: Speaker) {
    setEditing(item);
    setForm({ name: item.name, role: item.role, organization: item.organization, bio: item.bio ?? '', image: item.image ?? '', instagram: item.instagram ?? '', sort_order: item.sort_order });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save() {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    let err = null;
    if (editing) {
      const { error } = await supabase.from('speakers').update(form).eq('id', editing.id);
      err = error;
    } else {
      const { error } = await supabase.from('speakers').insert(form);
      err = error;
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    setEditing(null);
    setForm(empty);
    load();
  }

  async function remove(id: number) {
    if (!confirm('Delete this speaker?')) return;
    setDeleting(id);
    await supabase.from('speakers').delete().eq('id', id);
    setDeleting(null);
    load();
  }

  const field = (label: string, key: keyof SpeakerForm, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea rows={4} value={String(form[key] ?? '')} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none" />
      ) : (
        <input type={type} value={String(form[key] ?? '')} onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
      )}
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Speakers</h1>
        <button onClick={startNew} className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition">
          + New
        </button>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {editing ? `Editing: ${editing.name}` : 'New Speaker'}
        </h2>
        {error && <div className="mb-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</div>}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {field('Name *', 'name', 'text', 'Full name')}
            {field('Order', 'sort_order', 'number')}
          </div>
          {field('Role / Title', 'role', 'text', 'e.g. Lead Pastor')}
          {field('Organization', 'organization', 'text', 'e.g. Southeast Christian Church')}
          {field('Bio', 'bio', 'textarea', 'Speaker biography…')}
          {field('Image URL', 'image', 'url', 'https://…')}
          {field('Instagram URL', 'instagram', 'url', 'https://instagram.com/…')}

          {form.image && (
            <div className="flex items-center gap-3">
              <img src={form.image} alt="preview" className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="text-xs text-gray-400">Image preview</span>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Speaker'}
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
              {item.image && (
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 dark:text-white">{item.name}</div>
                <div className="text-xs text-[var(--primary)]">{item.role}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.organization}</div>
                {item.bio && <div className="text-xs text-gray-400 mt-1 line-clamp-2">{item.bio}</div>}
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
          {items.length === 0 && <div className="text-sm text-gray-400 text-center py-8">No speakers yet.</div>}
        </div>
      )}
    </div>
  );
}
