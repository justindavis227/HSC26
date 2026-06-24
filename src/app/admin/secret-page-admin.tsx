import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ConfirmDialog } from '../components/ui/confirm-dialog';

const inputClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';

interface SecretSubmission {
  id: string;
  first_name: string;
  last_name: string;
  campus: string;
  code_attempt: string;
  is_correct: boolean;
  is_winner: boolean;
  ticket_number: number | null;
  tier: string | null;
  submitted_at: string;
}

const TIER_LABEL: Record<string, string> = {
  gold: '🥇 Gold', silver: '🥈 Silver', bronze: '🥉 Bronze', blue: 'Camp Blue', sold_out: 'Sold out',
};

function pad4(n: number | null): string {
  return n == null ? '—' : String(n).padStart(4, '0');
}

/** Reusable editor for a single camp_info code key (entry code, challenge code). */
function CodeEditor({ settingKey, title, help }: { settingKey: string; title: string; help: string }) {
  const [value, setValue] = useState('');
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('camp_info').select('value').eq('key', settingKey).maybeSingle()
      .then(({ data }) => { if (data?.value) setValue(data.value); setLoading(false); });
  }, [settingKey]);

  async function save() {
    const trimmed = value.trim();
    if (!trimmed) { setError('Code cannot be empty.'); return; }
    setError('');
    setSaving(true);
    const { error } = await supabase.from('camp_info').upsert(
      { key: settingKey, value: trimmed, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
    setSaving(false);
    if (error) { setError(error.message); return; }
    setValue(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h3>
        {saved && <span className="text-xs text-green-600 dark:text-green-400 font-medium">Saved!</span>}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{help}</p>
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type={reveal ? 'text' : 'password'}
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              placeholder="Enter code"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)] transition shrink-0"
            >
              {reveal ? 'Hide' : 'Show'}
            </button>
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>}
          <button
            onClick={save}
            disabled={saving}
            className="mt-3 px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Code'}
          </button>
        </>
      )}
    </div>
  );
}

/** Editor for the Gold-ticket GroupMe "Claim your spot" link. */
function JoinUrlEditor() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('camp_info').select('value').eq('key', 'secret_winner_join_url').maybeSingle()
      .then(({ data }) => { if (data?.value) setUrl(data.value); setLoading(false); });
  }, []);

  async function save() {
    setSaving(true);
    await supabase.from('camp_info').upsert(
      { key: 'secret_winner_join_url', value: url.trim(), updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Gold Ticket GroupMe Link</h3>
        {saved && <span className="text-xs text-green-600 dark:text-green-400 font-medium">Saved!</span>}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        The "Claim your spot" link on the Gold (winner) ticket only. Paste your GroupMe invite URL. Leave blank to hide the button.
      </p>
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://groupme.com/join_group/..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <button
            onClick={save}
            disabled={saving}
            className="mt-3 px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Link'}
          </button>
        </>
      )}
    </div>
  );
}

function SecretResponses() {
  const [rows, setRows] = useState<SecretSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('secret_submissions').select('*').order('submitted_at', { ascending: false });
    setRows((data as SecretSubmission[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function clearAll() {
    setConfirmClear(false);
    await supabase.from('secret_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    load();
  }

  const correctCount = rows.filter((r) => r.is_correct).length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Responses</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {rows.length} total · {correctCount} correct
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:text-gray-900 dark:hover:text-white transition disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={() => setConfirmClear(true)}
            disabled={rows.length === 0}
            className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition disabled:opacity-40"
          >
            Clear All
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-400">No responses yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Campus</th>
                <th className="py-2 pr-3 font-medium">Code Entered</th>
                <th className="py-2 pr-3 font-medium">Result</th>
                <th className="py-2 pr-3 font-medium">Ticket</th>
                <th className="py-2 pr-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={`border-b border-gray-100 dark:border-gray-800/60 ${r.is_winner ? 'bg-amber-50 dark:bg-amber-950/20' : ''}`}
                >
                  <td className="py-2 pr-3 text-gray-900 dark:text-white whitespace-nowrap">
                    {r.first_name} {r.last_name}
                  </td>
                  <td className="py-2 pr-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{r.campus}</td>
                  <td className="py-2 pr-3 font-mono text-gray-700 dark:text-gray-300">{r.code_attempt}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {r.is_winner ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                        🏆 Winner
                      </span>
                    ) : r.is_correct ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        Denied
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {r.ticket_number != null ? (
                      <span className="font-mono">No. {pad4(r.ticket_number)}{r.tier ? ` · ${TIER_LABEL[r.tier] ?? r.tier}` : ''}</span>
                    ) : r.tier === 'sold_out' ? (
                      <span className="text-gray-400">Sold out</span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(r.submitted_at).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Clear all responses?"
        message="This permanently deletes every secret-page response, including the winner record. Use this to reset before camp. This cannot be undone."
        confirmLabel="Clear All"
        onConfirm={clearAll}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}

export function SecretPageAdmin() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">Secret Page</h2>
        <a
          href="/secret-page"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--primary)] hover:underline"
        >
          View Secret Page →
        </a>
      </div>

      <CodeEditor
        settingKey="secret_page_password"
        title="Entry Code"
        help="The first code visitors enter to unlock the secret page. Changes take effect immediately; students who already unlocked stay unlocked."
      />

      <CodeEditor
        settingKey="secret_page_password_2"
        title="Challenge Code (2nd)"
        help="The code students discover at camp and enter on the form inside the secret page. The first correct entry wins. Until this is set, all entries are denied. Matching ignores capitalization, but spaces matter."
      />

      <JoinUrlEditor />

      <SecretResponses />
    </div>
  );
}
