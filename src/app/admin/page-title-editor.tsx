import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';

export function PageTitleEditor({ pageKey, defaults }: {
  pageKey: string;
  defaults?: { title?: string; subtitle?: string };
}) {
  const [title, setTitle]       = useState(defaults?.title ?? '');
  const [subtitle, setSubtitle] = useState(defaults?.subtitle ?? '');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    supabase.from('camp_info').select('key,value')
      .in('key', [`page_title_${pageKey}`, `page_subtitle_${pageKey}`])
      .then(({ data }) => {
        (data ?? []).forEach(r => {
          if (r.key === `page_title_${pageKey}`    && r.value) setTitle(r.value);
          if (r.key === `page_subtitle_${pageKey}` && r.value) setSubtitle(r.value);
        });
        setLoading(false);
      });
  }, [pageKey]);

  async function save() {
    setSaving(true);
    await Promise.all([
      supabase.from('camp_info').upsert(
        { key: `page_title_${pageKey}`,    value: title,    updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      ),
      supabase.from('camp_info').upsert(
        { key: `page_subtitle_${pageKey}`, value: subtitle, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      ),
    ]);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Page Title &amp; Subtitle</h2>
        {saved && <span className="text-xs text-green-600 dark:text-green-400 font-medium">Saved!</span>}
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Page Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Contact Information" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subtitle</label>
          <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)}
            placeholder="Subheading shown below the page title" className={inputClass} />
        </div>
      </div>
      <button onClick={save} disabled={saving}
        className="mt-3 px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}
