import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminSpeakers } from './speakers';
import { AdminThemes } from './themes-editor';
import { AdminSeatingCharts } from './seating-charts';
import { AdminVideoSubmissions } from './video-submissions';
import { PageTitleEditor } from './page-title-editor';

type Subpage = 'speakers' | 'themes' | 'seating-chart' | 'video-submissions' | 'secret-page';

const SUBPAGES: { id: Subpage; label: string }[] = [
  { id: 'speakers',          label: 'Session Speakers' },
  { id: 'themes',            label: 'Themes' },
  { id: 'seating-chart',     label: 'Seating Chart' },
  { id: 'video-submissions', label: 'Video Submissions' },
  { id: 'secret-page',       label: 'Secret Page' },
];

export function AdminSessions() {
  const [subpage, setSubpage] = useState<Subpage>('speakers');

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sessions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage session-related content</p>
      </div>

      <PageTitleEditor pageKey="sessions" defaults={{ title: 'Session Information', subtitle: 'Details about camp sessions' }} />

      {/* Subpage selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SUBPAGES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSubpage(id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              subpage === id
                ? 'bg-[var(--primary)] text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {subpage === 'speakers'          && <AdminSpeakers />}
      {subpage === 'themes'            && <AdminThemes />}
      {subpage === 'seating-chart'     && <AdminSeatingCharts />}
      {subpage === 'video-submissions' && <AdminVideoSubmissions />}
      {subpage === 'secret-page'       && <SecretPageInfo />}
    </div>
  );
}


const SECRET_PW_KEY = 'secret_page_password';

function SecretPageInfo() {
  const [password, setPassword] = useState('');
  const [reveal, setReveal]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    supabase.from('camp_info').select('value').eq('key', SECRET_PW_KEY).maybeSingle()
      .then(({ data }) => {
        if (data?.value) setPassword(data.value);
        setLoading(false);
      });
  }, []);

  async function save() {
    const trimmed = password.trim();
    if (!trimmed) { setError('Code cannot be empty.'); return; }
    setError('');
    setSaving(true);
    const { error } = await supabase.from('camp_info').upsert(
      { key: SECRET_PW_KEY, value: trimmed, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
    setSaving(false);
    if (error) { setError(error.message); return; }
    setPassword(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">Secret Page Code</h2>
        {saved && <span className="text-xs text-green-600 dark:text-green-400 font-medium">Saved!</span>}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Set the code visitors must enter to unlock the secret page. Changes take effect
        immediately on the live site — no redeploy needed. Students who already unlocked
        the page stay unlocked.
      </p>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Unlock code</label>
          <div className="flex gap-2">
            <input
              type={reveal ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter unlock code"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <button
              type="button"
              onClick={() => setReveal(r => !r)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)] transition"
            >
              {reveal ? 'Hide' : 'Show'}
            </button>
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>}

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Code'}
            </button>
            <a
              href="/secret-page"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline"
            >
              View Secret Page →
            </a>
          </div>
        </>
      )}
    </div>
  );
}
