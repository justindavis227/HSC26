import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { CampusTime } from '../../lib/supabase';

const CAMPUSES = [
  'Blankenbaker',
  'Bullitt County',
  'Crestwood',
  'Elizabethtown',
  'Franklin',
  'Indiana',
  'La Grange',
  'Nelson County',
  'Prospect',
  'Shelby County',
  'South Lou / Beechmont',
  'Southwest',
];

export function AdminCampusTimes() {
  const [locations, setLocations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('campus_times').select('*');
      const map: Record<string, string> = {};
      (data ?? []).forEach((row: CampusTime) => { map[row.campus_name] = row.location; });
      setLocations(map);
      setLoading(false);
    }
    load();
  }, []);

  async function save(campusName: string) {
    setSaving(campusName);
    await supabase.from('campus_times').upsert(
      { campus_name: campusName, location: locations[campusName] ?? '', updated_at: new Date().toISOString() },
      { onConflict: 'campus_name' }
    );
    setSaving(null);
    setSaved(campusName);
    setTimeout(() => setSaved(null), 2000);
  }

  if (loading) return <div className="text-sm text-gray-400 text-center py-8">Loading…</div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Info</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Edit the Campus Time location for each campus. Save each row individually.
        </p>
      </div>

      <div className="space-y-3">
        {CAMPUSES.map((name) => (
          <div key={name} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</label>
              {saved === name && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Saved!</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={locations[name] ?? ''}
                onChange={e => setLocations(prev => ({ ...prev, [name]: e.target.value }))}
                placeholder="Campus Time location…"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              <button
                onClick={() => save(name)}
                disabled={saving === name}
                className="px-3 py-2 bg-[var(--primary)] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 shrink-0"
              >
                {saving === name ? '…' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
