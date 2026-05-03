import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabase';

const KEYS = [
  'dashboard_title',
  'dashboard_subtitle',
  'guideline_1',
  'guideline_2',
  'guideline_3',
  'guideline_4',
  'update_keyword',
  'update_number',
];

const DEFAULTS: Record<string, string> = {
  dashboard_title:    'High School Camp 2026',
  dashboard_subtitle: "Your central hub for all things camp. You'll want to save this page!",
  guideline_1: "BE|where you're supposed to be",
  guideline_2: 'RESPECT|the people',
  guideline_3: 'RESPECT|the place',
  guideline_4: 'WEAR|your wristband',
  update_keyword: 'HSC26',
  update_number:  '733-733',
};

const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';

function parseGuideline(raw: string) {
  const idx = raw.indexOf('|');
  return idx === -1 ? { label: raw, text: '' } : { label: raw.slice(0, idx), text: raw.slice(idx + 1) };
}

export function AdminDashboard() {
  const [values, setValues] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    supabase.from('camp_info').select('key,value').in('key', KEYS).then(({ data }) => {
      const merged = { ...DEFAULTS };
      (data ?? []).forEach(r => { if (r.value) merged[r.key] = r.value; });
      setValues(merged);
      setLoading(false);
    });
  }, []);

  function set(key: string, val: string) {
    setValues(prev => ({ ...prev, [key]: val }));
  }

  function setGuidelineLabel(n: number, label: string) {
    const key = `guideline_${n}`;
    const { text } = parseGuideline(values[key] ?? '');
    set(key, `${label}|${text}`);
  }

  function setGuidelineText(n: number, text: string) {
    const key = `guideline_${n}`;
    const { label } = parseGuideline(values[key] ?? '');
    set(key, `${label}|${text}`);
  }

  async function save() {
    setSaving(true);
    await Promise.all(
      KEYS.map(key =>
        supabase.from('camp_info').upsert(
          { key, value: values[key] ?? '', updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
      )
    );
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Edit the live Dashboard page content.</p>
        </div>
        {saved && <span className="text-sm text-green-600 dark:text-green-400 font-medium">Saved!</span>}
      </div>

      {/* Title & Subtitle */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Page Header</h2>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label>
          <input type="text" value={values.dashboard_title} onChange={e => set('dashboard_title', e.target.value)}
            placeholder="High School Camp 2026" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subtitle</label>
          <input type="text" value={values.dashboard_subtitle} onChange={e => set('dashboard_subtitle', e.target.value)}
            placeholder="Your central hub for all things camp." className={inputClass} />
        </div>
      </div>

      {/* Camp Guidelines */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Camp Guidelines</h2>
        <p className="text-xs text-gray-400">Each guideline has a bold label (e.g. "BE") and a description.</p>
        {[1, 2, 3, 4].map(n => {
          const { label, text } = parseGuideline(values[`guideline_${n}`] ?? '');
          return (
            <div key={n} className="flex gap-2 items-start">
              <div className="shrink-0 w-6 h-8 flex items-center justify-center text-xs text-gray-400">{n}.</div>
              <input
                type="text"
                value={label}
                onChange={e => setGuidelineLabel(n, e.target.value)}
                placeholder="BOLD"
                className="w-28 px-3 py-2 text-sm font-bold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              <input
                type="text"
                value={text}
                onChange={e => setGuidelineText(n, e.target.value)}
                placeholder="description text"
                className={`flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]`}
              />
            </div>
          );
        })}
      </div>

      {/* Update Text */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Text Updates</h2>
        <p className="text-xs text-gray-400">
          Renders as: <span className="font-mono">Text [keyword] to [number] for updates</span>
        </p>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Keyword</label>
            <input type="text" value={values.update_keyword} onChange={e => set('update_keyword', e.target.value)}
              placeholder="HSC26" className={inputClass} />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Number</label>
            <input type="text" value={values.update_number} onChange={e => set('update_number', e.target.value)}
              placeholder="733-733" className={inputClass} />
          </div>
        </div>
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
          Preview: Text <strong className="text-[var(--primary)]">{values.update_keyword}</strong> to{' '}
          <strong className="text-[var(--primary)]">{values.update_number}</strong> for updates
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="px-6 py-2.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
        {saving ? 'Saving…' : 'Save Changes'}
      </button>

      {/* Camp Info quick link */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
        <p className="text-xs text-gray-400 mb-3">Other settings</p>
        <Link
          to="/admin/camp-info"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
        >
          ⚙️ Camp Info (key/value store)
        </Link>
      </div>
    </div>
  );
}
