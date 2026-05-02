import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { CampInfo } from '../../lib/supabase';

const DEFAULT_KEYS = [
  { key: 'camp_name', label: 'Camp Name', placeholder: 'e.g. High School Camp 2026' },
  { key: 'camp_location', label: 'Camp Location', placeholder: 'e.g. Indiana University, Bloomington IN' },
  { key: 'theme', label: 'Camp Theme', placeholder: 'e.g. All In' },
  { key: 'verse', label: 'Theme Verse', placeholder: 'e.g. Romans 12:1' },
  { key: 'emergency_contact', label: 'Emergency Contact', placeholder: 'Name & phone number' },
  { key: 'wifi_name', label: 'WiFi Network', placeholder: 'e.g. IU Secure' },
  { key: 'wifi_password', label: 'WiFi Password', placeholder: '' },
  { key: 'check_in_info', label: 'Check-In Info', placeholder: 'Check-in instructions…' },
  { key: 'packing_list', label: 'Packing List', placeholder: 'Items to bring…' },
];

export function AdminCampInfo() {
  const [items, setItems] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [customKey, setCustomKey] = useState('');
  const [customVal, setCustomVal] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);
  const [allKeys, setAllKeys] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('camp_info').select('*');
    const map: Record<string, string> = {};
    (data ?? []).forEach((row: CampInfo) => { map[row.key] = row.value; });
    setItems(map);
    // Collect any custom keys not in DEFAULT_KEYS
    const defaultKeySet = new Set(DEFAULT_KEYS.map(d => d.key));
    const extras = (data ?? []).filter((r: CampInfo) => !defaultKeySet.has(r.key)).map((r: CampInfo) => r.key);
    setAllKeys(extras);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function saveKey(key: string, value: string) {
    setSaving(key);
    await supabase.from('camp_info').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  }

  async function addCustom() {
    if (!customKey.trim()) return;
    setAddingCustom(true);
    await supabase.from('camp_info').upsert({ key: customKey.trim(), value: customVal, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setItems(prev => ({ ...prev, [customKey.trim()]: customVal }));
    setAllKeys(prev => prev.includes(customKey.trim()) ? prev : [...prev, customKey.trim()]);
    setCustomKey('');
    setCustomVal('');
    setAddingCustom(false);
  }

  async function deleteKey(key: string) {
    if (!confirm(`Delete "${key}"?`)) return;
    await supabase.from('camp_info').delete().eq('key', key);
    setAllKeys(prev => prev.filter(k => k !== key));
    setItems(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  if (loading) return <div className="text-sm text-gray-400 text-center py-8">Loading…</div>;

  const renderField = (key: string, label: string, placeholder: string, deletable = false) => {
    const val = items[key] ?? '';
    const isMultiline = val.length > 80 || placeholder.endsWith('…');
    return (
      <div key={key} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
          <div className="flex items-center gap-2">
            {saved === key && <span className="text-xs text-green-600 dark:text-green-400 font-medium">Saved!</span>}
            {deletable && (
              <button onClick={() => deleteKey(key)} className="text-xs text-red-400 hover:text-red-600 transition">Delete</button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isMultiline ? (
            <textarea
              rows={3}
              value={val}
              onChange={e => setItems(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
            />
          ) : (
            <input
              type="text"
              value={val}
              onChange={e => setItems(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          )}
          <button
            onClick={() => saveKey(key, items[key] ?? '')}
            disabled={saving === key}
            className="px-3 py-2 bg-[var(--primary)] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 shrink-0"
          >
            {saving === key ? '…' : 'Save'}
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-1 font-mono">key: {key}</div>
      </div>
    );
  };

  const startDate = items['camp_start_date'] ?? '';
  const endDate = items['camp_end_date'] ?? '';

  async function saveDates() {
    setSaving('camp_dates_block');
    await Promise.all([
      supabase.from('camp_info').upsert({ key: 'camp_start_date', value: startDate, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
      supabase.from('camp_info').upsert({ key: 'camp_end_date', value: endDate, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
    ]);
    setSaving(null);
    setSaved('camp_dates_block');
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Camp Info</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Key/value fields surfaced throughout the app. Save each field individually.</p>
      </div>

      {/* Camp Dates — date pickers */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Camp Dates</div>
            <div className="text-xs text-gray-400 mt-0.5">Used to display "Monday Jun 29" labels on the schedule page.</div>
          </div>
          {saved === 'camp_dates_block' && <span className="text-xs text-green-600 dark:text-green-400 font-medium">Saved!</span>}
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date (Monday)</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setItems(prev => ({ ...prev, camp_start_date: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <div className="text-xs text-gray-400 mt-1 font-mono">key: camp_start_date</div>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">End Date (Friday)</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setItems(prev => ({ ...prev, camp_end_date: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <div className="text-xs text-gray-400 mt-1 font-mono">key: camp_end_date</div>
          </div>
          <button
            onClick={saveDates}
            disabled={saving === 'camp_dates_block'}
            className="px-4 py-2 bg-[var(--primary)] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 shrink-0 self-start mt-5"
          >
            {saving === 'camp_dates_block' ? '…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {DEFAULT_KEYS.map(({ key, label, placeholder }) => renderField(key, label, placeholder))}

        {allKeys.map(key => renderField(key, key, '', true))}
      </div>

      {/* Add custom key */}
      <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Add Custom Field</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={customKey}
            onChange={e => setCustomKey(e.target.value.replace(/\s/g, '_').toLowerCase())}
            placeholder="field_key"
            className="w-40 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono"
          />
          <input
            type="text"
            value={customVal}
            onChange={e => setCustomVal(e.target.value)}
            placeholder="Value…"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <button onClick={addCustom} disabled={addingCustom || !customKey.trim()}
            className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 shrink-0">
            {addingCustom ? '…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
