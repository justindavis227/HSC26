import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Theme } from '../../lib/supabase';
import { useCampDates } from '../hooks/use-camp-dates';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function AdminThemes() {
  const [themes, setThemes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const { dayLabel } = useCampDates();

  useEffect(() => {
    supabase
      .from('themes')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data ?? []).forEach((row: Theme) => { map[row.day] = row.theme_name; });
        setThemes(map);
        setLoading(false);
      });
  }, []);

  async function save(day: string) {
    setSaving(day);
    await supabase.from('themes').upsert(
      {
        day,
        theme_name: themes[day] ?? '',
        sort_order: DAYS.indexOf(day) + 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'day' }
    );
    setSaving(null);
    setSaved(day);
    setTimeout(() => setSaved(null), 2000);
  }

  if (loading) return <div className="text-sm text-gray-400 text-center py-8">Loading…</div>;

  return (
    <div className="max-w-2xl space-y-3">
      {DAYS.map((day) => (
        <div key={day} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{dayLabel(day)}</label>
            {saved === day && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Saved!</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={themes[day] ?? ''}
              onChange={(e) => setThemes((prev) => ({ ...prev, [day]: e.target.value }))}
              placeholder="Theme name…"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <button
              onClick={() => save(day)}
              disabled={saving === day}
              className="px-3 py-2 bg-[var(--primary)] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 shrink-0"
            >
              {saving === day ? '…' : 'Save'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
