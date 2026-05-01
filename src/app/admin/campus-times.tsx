import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { CampusTime } from '../../lib/supabase';
import { campData } from '../data/camp-data';

const CAMPUSES = campData.campuses.map((c) => c.name);

type CampusForm = {
  neighborhood: string;
  dining: string;
  location: string;
  male_dorms: string;
  female_dorms: string;
  male_sg_zones: string;
  female_sg_zones: string;
};

const emptyForm: CampusForm = {
  neighborhood: '',
  dining: '',
  location: '',
  male_dorms: '',
  female_dorms: '',
  male_sg_zones: '',
  female_sg_zones: '',
};

function fromRow(row: CampusTime): CampusForm {
  return {
    neighborhood: row.neighborhood ?? '',
    dining: row.dining ?? '',
    location: row.location ?? '',
    male_dorms: row.male_dorms ?? '',
    female_dorms: row.female_dorms ?? '',
    male_sg_zones: row.male_sg_zones ?? '',
    female_sg_zones: row.female_sg_zones ?? '',
  };
}

export function AdminCampusTimes() {
  const [selectedCampus, setSelectedCampus] = useState(CAMPUSES[0]);
  const [form, setForm] = useState<CampusForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load(campusName: string) {
    setLoading(true);
    const { data } = await supabase
      .from('campus_times')
      .select('*')
      .eq('campus_name', campusName)
      .single();
    setForm(data ? fromRow(data) : emptyForm);
    setLoading(false);
  }

  useEffect(() => { load(selectedCampus); }, [selectedCampus]);

  async function save() {
    setSaving(true);
    await supabase.from('campus_times').upsert(
      { campus_name: selectedCampus, ...form, updated_at: new Date().toISOString() },
      { onConflict: 'campus_name' }
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';
  const textareaClass = inputClass + ' resize-y font-mono';
  const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Info</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Edit campus details. Changes are live in the app immediately after saving.
        </p>
      </div>

      {/* Campus selector */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Campus</label>
        <select
          value={selectedCampus}
          onChange={(e) => setSelectedCampus(e.target.value)}
          className="w-full max-w-xs px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          {CAMPUSES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 text-center py-8">Loading…</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{selectedCampus}</h2>

          {/* Row 1: Location + Dining */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Location (Neighborhood)</label>
              <input
                type="text"
                value={form.neighborhood}
                onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))}
                placeholder="e.g. North Neighborhood"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Dining Hall</label>
              <input
                type="text"
                value={form.dining}
                onChange={(e) => setForm((f) => ({ ...f, dining: e.target.value }))}
                placeholder="e.g. McNutt Dining Hall"
                className={inputClass}
              />
            </div>
          </div>

          {/* Campus Time */}
          <div>
            <label className={labelClass}>Campus Time Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Wilkinson Hall"
              className={inputClass}
            />
          </div>

          {/* Dorm Assignments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Male Dorms</label>
              <input
                type="text"
                value={form.male_dorms}
                onChange={(e) => setForm((f) => ({ ...f, male_dorms: e.target.value }))}
                placeholder="e.g. McNutt South"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Female Dorms</label>
              <input
                type="text"
                value={form.female_dorms}
                onChange={(e) => setForm((f) => ({ ...f, female_dorms: e.target.value }))}
                placeholder="e.g. McNutt North"
                className={inputClass}
              />
            </div>
          </div>

          {/* Small Group Zones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Male Small Group Zones</label>
              <textarea
                rows={4}
                value={form.male_sg_zones}
                onChange={(e) => setForm((f) => ({ ...f, male_sg_zones: e.target.value }))}
                placeholder={'• Zone 1\n• Zone 2'}
                className={textareaClass}
              />
            </div>
            <div>
              <label className={labelClass}>Female Small Group Zones</label>
              <textarea
                rows={4}
                value={form.female_sg_zones}
                onChange={(e) => setForm((f) => ({ ...f, female_sg_zones: e.target.value }))}
                placeholder={'• Zone 1\n• Zone 2'}
                className={textareaClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={save}
              disabled={saving}
              className="px-5 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            {saved && <span className="text-sm text-green-600 dark:text-green-400 font-medium">Saved!</span>}
          </div>
        </div>
      )}
    </div>
  );
}
