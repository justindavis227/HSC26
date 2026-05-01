import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { FAQ } from '../../lib/supabase';

type FAQForm = Omit<FAQ, 'id' | 'created_at'>;

const empty: FAQForm = { question: '', answer: '', sort_order: 0 };

export function AdminFAQ() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState<FAQForm>(empty);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('faqs').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing(null);
    setForm({ question: '', answer: '', sort_order: items.length + 1 });
    setError('');
  }

  function startEdit(item: FAQ) {
    setEditing(item);
    setForm({ question: item.question, answer: item.answer, sort_order: item.sort_order });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save() {
    if (!form.question.trim() || !form.answer.trim()) { setError('Question and answer are required.'); return; }
    setSaving(true);
    setError('');
    let err = null;
    if (editing) {
      const { error } = await supabase.from('faqs').update(form).eq('id', editing.id);
      err = error;
    } else {
      const { error } = await supabase.from('faqs').insert(form);
      err = error;
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    setEditing(null);
    setForm(empty);
    load();
  }

  async function remove(id: number) {
    if (!confirm('Delete this FAQ?')) return;
    setDeleting(id);
    await supabase.from('faqs').delete().eq('id', id);
    setDeleting(null);
    load();
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FAQ</h1>
        <button onClick={startNew} className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition">
          + New
        </button>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {editing ? `Editing FAQ` : 'New FAQ Entry'}
        </h2>
        {error && <div className="mb-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</div>}
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Question *</label>
              <input type="text" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                placeholder="e.g. LOST & FOUND"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Answer *</label>
            <textarea rows={5} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
              placeholder="Answer text… (supports line breaks)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add FAQ'}
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
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 mt-0.5">
                {item.sort_order}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 dark:text-white">{item.question}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-3 whitespace-pre-line">{item.answer}</div>
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
          {items.length === 0 && <div className="text-sm text-gray-400 text-center py-8">No FAQs yet.</div>}
        </div>
      )}
    </div>
  );
}
