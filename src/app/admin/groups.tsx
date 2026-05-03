import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, X, FileText, Image, Plus, GripVertical } from 'lucide-react';
import { PageTitleEditor } from './page-title-editor';

// ── shared helpers ────────────────────────────────────────────────────────────

function isPdf(name: string) { return (name ?? '').toLowerCase().endsWith('.pdf'); }

const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';

// ── Links subsection ──────────────────────────────────────────────────────────

function LinksEditor() {
  const [rosterUrl, setRosterUrl] = useState('');
  const [trackerUrl, setTrackerUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('camp_info').select('key,value').in('key', ['student_roster_url', 'group_tracker_url'])
      .then(({ data }) => {
        (data ?? []).forEach((row) => {
          if (row.key === 'student_roster_url') setRosterUrl(row.value);
          if (row.key === 'group_tracker_url')  setTrackerUrl(row.value);
        });
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    await Promise.all([
      supabase.from('camp_info').upsert({ key: 'student_roster_url', value: rosterUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
      supabase.from('camp_info').upsert({ key: 'group_tracker_url',  value: trackerUrl,  updated_at: new Date().toISOString() }, { onConflict: 'key' }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div className="text-sm text-gray-400 text-center py-8">Loading…</div>;

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        These URLs appear as tappable cards on the live Groups page.
      </p>
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Student Roster URL</label>
        <input type="url" value={rosterUrl} onChange={e => setRosterUrl(e.target.value)}
          placeholder="https://my.southeastchristian.org/page/1367" className={inputClass} />
        <p className="text-xs text-gray-400 mt-1 font-mono">key: student_roster_url</p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Group Tracker URL</label>
        <input type="url" value={trackerUrl} onChange={e => setTrackerUrl(e.target.value)}
          placeholder="https://my.southeastchristian.org/groupapp" className={inputClass} />
        <p className="text-xs text-gray-400 mt-1 font-mono">key: group_tracker_url</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
          className="px-5 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && <span className="text-sm text-green-600 dark:text-green-400 font-medium">Saved!</span>}
      </div>
    </div>
  );
}

// ── Group Cards subsection ────────────────────────────────────────────────────

const DAY_SLOTS = [
  { label: 'Day 1', sort: 1 },
  { label: 'Day 2', sort: 2 },
  { label: 'Day 3', sort: 3 },
  { label: 'Day 4', sort: 4 },
  { label: 'Day 5', sort: 5 },
  { label: 'Bonus', sort: 6 },
];

interface GroupCard { day_label: string; sort_order: number; file_url: string; file_name: string; file_path: string; }

function GroupCardSlot({ slot, card, onUploaded, onRemoved }: {
  slot: { label: string; sort: number };
  card?: GroupCard;
  onUploaded: (c: GroupCard) => void;
  onRemoved: (label: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  async function handleFile(file: File) {
    setErr(''); setUploading(true);
    if (card?.file_path) await supabase.storage.from('group-cards').remove([card.file_path]);
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${slot.label.toLowerCase().replace(/\s/g, '-')}/${Date.now()}_${safe}`;
    const { error: upErr } = await supabase.storage.from('group-cards').upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setErr(upErr.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('group-cards').getPublicUrl(path);
    const row: GroupCard = { day_label: slot.label, sort_order: slot.sort, file_url: urlData.publicUrl, file_name: file.name, file_path: path };
    await supabase.from('group_cards').upsert(row, { onConflict: 'day_label' });
    onUploaded(row);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleRemove() {
    if (card?.file_path) await supabase.storage.from('group-cards').remove([card.file_path]);
    await supabase.from('group_cards').delete().eq('day_label', slot.label);
    onRemoved(slot.label);
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{slot.label}</span>
        {card && (
          <button onClick={handleRemove} className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition">
            <X className="w-3.5 h-3.5" />Remove
          </button>
        )}
      </div>
      {card && (
        <div className="mb-3">
          {isPdf(card.file_name) ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <FileText className="w-6 h-6 text-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{card.file_name}</p>
                <a href={card.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline">View PDF ↗</a>
              </div>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-h-40">
              <img src={card.file_url} alt={slot.label} className="w-full h-full object-contain bg-gray-50 dark:bg-gray-800" />
            </div>
          )}
        </div>
      )}
      <div className="flex items-center gap-3">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[var(--primary)] hover:text-[var(--primary)] transition disabled:opacity-50">
          {isPdf(card?.file_name ?? '') ? <FileText className="w-3.5 h-3.5" /> : <Image className="w-3.5 h-3.5" />}
          {uploading ? 'Uploading…' : card ? 'Replace' : 'Upload File'}
        </button>
        {!card && <span className="text-xs text-gray-400">JPG, PNG, WebP or PDF · max 20 MB</span>}
        {err && <span className="text-xs text-red-500">{err}</span>}
      </div>
    </div>
  );
}

function GroupCardsEditor() {
  const [cards, setCards] = useState<Record<string, GroupCard>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('group_cards').select('*').order('sort_order').then(({ data }) => {
      const map: Record<string, GroupCard> = {};
      (data ?? []).forEach((r: GroupCard) => { map[r.day_label] = r; });
      setCards(map);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-sm text-gray-400 text-center py-8">Loading…</div>;

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Upload one file per day slot. Appears on the live Group Cards page organized by day.
      </p>
      <div className="space-y-3">
        {DAY_SLOTS.map(slot => (
          <GroupCardSlot key={slot.label} slot={slot} card={cards[slot.label]}
            onUploaded={c => setCards(prev => ({ ...prev, [c.day_label]: c }))}
            onRemoved={label => setCards(prev => { const n = { ...prev }; delete n[label]; return n; })} />
        ))}
      </div>
    </div>
  );
}

// ── Decision Guide subsection ─────────────────────────────────────────────────

interface DGItem { id: number; sort_order: number; title: string; file_url: string; file_name: string; file_path: string; }

function DecisionGuideEditor() {
  const [items, setItems] = useState<DGItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  async function load() {
    const { data } = await supabase.from('decision_guide').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleFile(file: File) {
    if (!newTitle.trim()) { setUploadErr('Enter a title first.'); return; }
    setUploadErr(''); setUploading(true);
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${Date.now()}_${safe}`;
    const { error: upErr } = await supabase.storage.from('decision-guide-files').upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setUploadErr(upErr.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('decision-guide-files').getPublicUrl(path);
    const nextOrder = (items[items.length - 1]?.sort_order ?? 0) + 1;
    await supabase.from('decision_guide').insert({ sort_order: nextOrder, title: newTitle.trim(), file_url: urlData.publicUrl, file_name: file.name, file_path: path });
    setNewTitle('');
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
    load();
  }

  async function remove(item: DGItem) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    setDeleting(item.id);
    if (item.file_path) await supabase.storage.from('decision-guide-files').remove([item.file_path]);
    await supabase.from('decision_guide').delete().eq('id', item.id);
    setDeleting(null);
    load();
  }

  if (loading) return <div className="text-sm text-gray-400 text-center py-8">Loading…</div>;

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Upload files (PDFs or images) that appear in the Resources section at the bottom of the live Decision Guide page.
      </p>

      {/* Upload form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
          <Plus className="w-4 h-4" />Add Resource
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title *</label>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Baptism Guide" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">File *</label>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[var(--primary)] hover:text-[var(--primary)] transition disabled:opacity-50">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading…' : 'Choose File & Upload'}
            </button>
            <span className="ml-2 text-xs text-gray-400">JPG, PNG, WebP or PDF · max 20 MB</span>
          </div>
          {uploadErr && <p className="text-xs text-red-500">{uploadErr}</p>}
        </div>
      </div>

      {/* Existing items */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
              {isPdf(item.file_name)
                ? <FileText className="w-5 h-5 text-red-500 shrink-0" />
                : <Image className="w-5 h-5 text-blue-500 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline truncate block">{item.file_name}</a>
              </div>
              <button onClick={() => remove(item)} disabled={deleting === item.id}
                className="text-xs text-gray-400 hover:text-red-600 transition disabled:opacity-40 shrink-0">
                {deleting === item.id ? '…' : 'Del'}
              </button>
            </div>
          ))}
        </div>
      )}
      {items.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No resources uploaded yet.</p>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Subpage = 'links' | 'group-cards' | 'decision-guide';
const SUBPAGES: { id: Subpage; label: string }[] = [
  { id: 'links',          label: 'Links'          },
  { id: 'group-cards',    label: 'Group Cards'    },
  { id: 'decision-guide', label: 'Decision Guide' },
];

export function AdminGroups() {
  const [subpage, setSubpage] = useState<Subpage>('links');

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Groups</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage group materials, links, and resources</p>
      </div>

      <PageTitleEditor pageKey="groups" />
      <div className="flex flex-wrap gap-2 mb-6">
        {SUBPAGES.map(({ id, label }) => (
          <button key={id} onClick={() => setSubpage(id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${subpage === id ? 'bg-[var(--primary)] text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)]'}`}>
            {label}
          </button>
        ))}
      </div>
      {subpage === 'links'          && <LinksEditor />}
      {subpage === 'group-cards'    && <GroupCardsEditor />}
      {subpage === 'decision-guide' && <DecisionGuideEditor />}
    </div>
  );
}
