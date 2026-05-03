import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PageTitleEditor } from './page-title-editor';

interface Contact {
  id: number;
  sort_order: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  available: string;
}

type Form = Omit<Contact, 'id'>;
const emptyForm: Form = { sort_order: 0, name: '', role: '', email: '', phone: '', available: '' };

const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';

function Field({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className={inputClass} />
    </div>
  );
}

export function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<Contact | null>(null);
  const [form, setForm]         = useState<Form>(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError]       = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('contacts').select('*').order('sort_order');
    setContacts(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing(null);
    setForm({ ...emptyForm, sort_order: contacts.length + 1 });
    setError('');
  }

  function startEdit(c: Contact) {
    setEditing(c);
    setForm({ sort_order: c.sort_order, name: c.name, role: c.role, email: c.email, phone: c.phone, available: c.available });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save() {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    if (editing) {
      await supabase.from('contacts').update(form).eq('id', editing.id);
    } else {
      await supabase.from('contacts').insert(form);
    }
    setSaving(false); setEditing(null); setForm(emptyForm); load();
  }

  async function remove(id: number) {
    if (!confirm('Delete this contact?')) return;
    setDeleting(id);
    await supabase.from('contacts').delete().eq('id', id);
    setDeleting(null); load();
  }

  const f = (key: keyof Form) => (v: string) => setForm(prev => ({ ...prev, [key]: key === 'sort_order' ? Number(v) : v }));

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Info</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage camp staff contacts shown on the live Contact Info page.</p>
      </div>

      <PageTitleEditor pageKey="contacts" />

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {editing ? `Editing: ${editing.name}` : 'New Contact'}
          </h2>
          <button onClick={startNew}
            className="px-3 py-1.5 bg-[var(--primary)] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition">
            + New
          </button>
        </div>
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <Field label="Name *"       value={form.name}      onChange={f('name')}      placeholder="Full name" />
          <Field label="Role"         value={form.role}      onChange={f('role')}      placeholder="e.g. Camp Director" />
          <Field label="Email"        value={form.email}     onChange={f('email')}     type="email" placeholder="name@example.org" />
          <Field label="Phone"        value={form.phone}     onChange={f('phone')}     placeholder="(555) 123-4567" />
          <Field label="Availability" value={form.available} onChange={f('available')} placeholder="e.g. Mon-Fri, 8 AM – 5 PM" />
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sort Order</label>
            <input type="number" value={form.sort_order}
              onChange={e => setForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
              className={inputClass} />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Contact'}
          </button>
          {editing && (
            <button onClick={startNew}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-sm text-gray-400 text-center py-8">Loading…</div>
      ) : (
        <div className="space-y-2">
          {contacts.map(c => (
            <div key={c.id}
              className={`bg-white dark:bg-gray-900 rounded-lg border px-4 py-3 flex items-start gap-3 ${editing?.id === c.id ? 'border-[var(--primary)]' : 'border-gray-200 dark:border-gray-800'}`}>
              <span className="text-xs text-gray-400 w-5 text-right mt-0.5">{c.sort_order}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{c.name}</div>
                <div className="text-xs text-gray-500">{c.role}</div>
                {c.email && <div className="text-xs text-gray-400 truncate">{c.email}</div>}
                {c.phone && <div className="text-xs text-gray-400">{c.phone}</div>}
                {c.available && <div className="text-xs text-gray-400 italic">{c.available}</div>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(c)}
                  className="text-xs text-gray-400 hover:text-[var(--primary)] transition p-1">Edit</button>
                <button onClick={() => remove(c.id)} disabled={deleting === c.id}
                  className="text-xs text-gray-400 hover:text-red-600 transition p-1 disabled:opacity-40">
                  {deleting === c.id ? '…' : 'Del'}
                </button>
              </div>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-8">No contacts yet. Add one above.</div>
          )}
        </div>
      )}
    </div>
  );
}
