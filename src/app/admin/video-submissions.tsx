import { useState, useEffect, useMemo } from 'react';
import {
  Download, Trash2, Search, Film, RefreshCw, Play, Settings as SettingsIcon,
  CheckSquare, Square, Archive, Save, AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { VideoSubmission } from '../../lib/supabase';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import {
  DEFAULT_SUBMISSION_SETTINGS,
  loadSubmissionSettings,
  saveSubmissionSettings,
  evaluateWindow,
  formatHHMMLabel,
  type SubmissionSettings,
  type SubmissionMode,
} from '../utils/submission-settings';

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return '–';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

const DAYS = [1, 2, 3, 4, 5];

// Soft caps for the curated zip export (warn, don't block).
const EXPORT_WARN_FILES = 80;
const EXPORT_WARN_BYTES = 1.5 * 1024 * 1024 * 1024; // ~1.5 GB

export function AdminVideoSubmissions() {
  const [submissions, setSubmissions] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  // Preview
  const [previewing, setPreviewing] = useState<VideoSubmission | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Selection + export
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SubmissionSettings | null>(null);
  const [draft, setDraft] = useState<SubmissionSettings>(DEFAULT_SUBMISSION_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [campStartDate, setCampStartDate] = useState<string | null>(null);
  const [campEndDate, setCampEndDate] = useState<string | null>(null);

  useEffect(() => { load(); loadSettings(); loadCampDates(); }, []);

  async function loadCampDates() {
    const { data } = await supabase.from('camp_info').select('key,value').in('key', ['camp_start_date', 'camp_end_date']);
    (data ?? []).forEach((r: { key: string; value: string }) => {
      if (r.key === 'camp_start_date') setCampStartDate(r.value ?? null);
      if (r.key === 'camp_end_date') setCampEndDate(r.value ?? null);
    });
  }

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('video_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    setSubmissions(data ?? []);
    setLoading(false);
  }

  async function loadSettings() {
    const s = await loadSubmissionSettings();
    setSettings(s);
    setDraft(s);
  }

  // Submission order within each day (ascending), used for export numbering.
  const dayOrder = useMemo(() => {
    const map: Record<string, number> = {};
    const byDay: Record<number, VideoSubmission[]> = {};
    submissions.forEach((s) => { (byDay[s.day_number] ??= []).push(s); });
    Object.values(byDay).forEach((list) => {
      list.sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());
      list.forEach((s, i) => { map[s.id] = i + 1; });
    });
    return map;
  }, [submissions]);

  function handleDelete(s: VideoSubmission) {
    setConfirmState({
      title: 'Delete Video',
      message: `Delete "${s.video_title}" by ${s.name}? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmState(null);
        setDeleting(s.id);
        await supabase.storage.from('video-submissions').remove([s.file_url]);
        await supabase.from('video_submissions').delete().eq('id', s.id);
        setSubmissions((prev) => prev.filter((x) => x.id !== s.id));
        setSelected((prev) => { const n = new Set(prev); n.delete(s.id); return n; });
        setDeleting(null);
      },
    });
  }

  async function handleDownload(s: VideoSubmission) {
    setDownloading(s.id);
    const { data } = await supabase.storage
      .from('video-submissions')
      .createSignedUrl(s.file_url, 3600);
    if (data?.signedUrl) {
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = s.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    setDownloading(null);
  }

  // ---- Preview ----
  async function openPreview(s: VideoSubmission) {
    setPreviewing(s);
    setPreviewUrl(null);
    setPreviewError(false);
    setPreviewLoading(true);
    const { data } = await supabase.storage
      .from('video-submissions')
      .createSignedUrl(s.file_url, 3600);
    setPreviewUrl(data?.signedUrl ?? null);
    if (!data?.signedUrl) setPreviewError(true);
    setPreviewLoading(false);
  }

  function closePreview() {
    setPreviewing(null);
    setPreviewUrl(null);
    setPreviewError(false);
  }

  // ---- Selection ----
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  function selectAllVisible(ids: string[]) {
    setSelected((prev) => {
      const n = new Set(prev);
      const allSelected = ids.every((id) => n.has(id));
      if (allSelected) ids.forEach((id) => n.delete(id));
      else ids.forEach((id) => n.add(id));
      return n;
    });
  }

  function clearSelection() { setSelected(new Set()); }

  // Build the export filename: existing convention + _### submission-order suffix.
  function exportFileName(s: VideoSubmission): string {
    const seq = String(dayOrder[s.id] ?? 0).padStart(3, '0');
    const dot = s.file_name.lastIndexOf('.');
    const stem = dot >= 0 ? s.file_name.slice(0, dot) : s.file_name;
    const ext = dot >= 0 ? s.file_name.slice(dot + 1) : 'mp4';
    return `${stem}_${seq}.${ext}`;
  }

  async function runExport(items: VideoSubmission[]) {
    setExporting(true);
    setExportMsg('Preparing…');
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      let done = 0;
      for (const s of items) {
        setExportMsg(`Fetching ${done + 1} of ${items.length}…`);
        const { data } = await supabase.storage
          .from('video-submissions')
          .createSignedUrl(s.file_url, 3600);
        if (!data?.signedUrl) { done++; continue; }
        const resp = await fetch(data.signedUrl);
        const blob = await resp.blob();
        zip.file(exportFileName(s), blob);
        done++;
      }
      setExportMsg('Zipping…');
      const out = await zip.generateAsync({ type: 'blob' }, (meta) => {
        setExportMsg(`Zipping… ${Math.round(meta.percent)}%`);
      });
      const days = Array.from(new Set(items.map((i) => i.day_number)));
      const zipName = days.length === 1 ? `HSC26_Day${days[0]}_selected.zip` : 'HSC26_selected.zip';
      const url = URL.createObjectURL(out);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportMsg(null);
    } catch (err) {
      console.error(err);
      setExportMsg('Export failed — try a smaller batch or check your connection.');
      setTimeout(() => setExportMsg(null), 5000);
    } finally {
      setExporting(false);
    }
  }

  function handleExportSelected() {
    const items = submissions.filter((s) => selected.has(s.id));
    if (items.length === 0) return;
    const totalBytes = items.reduce((sum, s) => sum + (s.file_size ?? 0), 0);
    if (items.length > EXPORT_WARN_FILES || totalBytes > EXPORT_WARN_BYTES) {
      setConfirmState({
        title: 'Large download',
        message: `You're about to zip ${items.length} videos (${formatSize(totalBytes)}). Big batches can be slow or strain memory in the browser. For a full-day or whole-week pull, the offline archival script is more reliable. Continue anyway?`,
        onConfirm: () => { setConfirmState(null); runExport(items); },
      });
      return;
    }
    runExport(items);
  }

  // ---- Settings ----
  async function handleSaveSettings() {
    setSavingSettings(true);
    const { error } = await saveSubmissionSettings(draft);
    setSavingSettings(false);
    if (!error) {
      setSettings(draft);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    }
  }

  const settingsDirty = settings
    ? settings.openTime !== draft.openTime || settings.closeTime !== draft.closeTime || settings.mode !== draft.mode
    : false;

  const liveState = settings ? evaluateWindow(settings, { startDate: campStartDate, endDate: campEndDate }) : null;

  const countByDay = DAYS.reduce((acc, d) => {
    acc[d] = submissions.filter((s) => s.day_number === d).length;
    return acc;
  }, {} as Record<number, number>);

  const filtered = submissions.filter((s) => {
    if (s.day_number !== activeDay) return false;
    if (search === '') return true;
    const q = search.toLowerCase().trim();
    const qNum = q.replace(/^#/, ''); // allow "#002" or "002"
    const seqPadded = String(dayOrder[s.id] ?? 0).padStart(3, '0');
    return (
      s.name.toLowerCase().includes(q) ||
      s.video_title.toLowerCase().includes(q) ||
      (qNum !== '' && seqPadded.includes(qNum))
    );
  });

  const visibleIds = filtered.map((s) => s.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const selectedItems = submissions.filter((s) => selected.has(s.id));
  const selectedBytes = selectedItems.reduce((sum, s) => sum + (s.file_size ?? 0), 0);

  const modeButtons: { value: SubmissionMode; label: string }[] = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'open', label: 'Force Open' },
    { value: 'closed', label: 'Force Closed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Video Submissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {submissions.length} total submission{submissions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showSettings
                ? 'text-[var(--primary)] border-[var(--primary)] bg-[var(--primary)]/5'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Submission Window</h2>
            {liveState && settings && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                liveState.isOpen
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                Currently {liveState.isOpen ? 'OPEN' : 'CLOSED'}
                {settings.mode !== 'scheduled' ? ` · ${settings.mode === 'open' ? 'forced open' : 'forced closed'}` : ''}
              </span>
            )}
          </div>

          {/* Mode */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg w-fit">
            {modeButtons.map((m) => (
              <button
                key={m.value}
                onClick={() => setDraft((d) => ({ ...d, mode: m.value }))}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  draft.mode === m.value
                    ? 'bg-white dark:bg-gray-700 text-[var(--primary)] shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Times (only relevant in scheduled mode) */}
          <div className={`flex flex-wrap items-end gap-4 ${draft.mode !== 'scheduled' ? 'opacity-50' : ''}`}>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Opens (ET)</label>
              <input
                type="time"
                value={draft.openTime}
                disabled={draft.mode !== 'scheduled'}
                onChange={(e) => setDraft((d) => ({ ...d, openTime: e.target.value }))}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Closes (ET)</label>
              <input
                type="time"
                value={draft.closeTime}
                disabled={draft.mode !== 'scheduled'}
                onChange={(e) => setDraft((d) => ({ ...d, closeTime: e.target.value }))}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
              />
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={!settingsDirty || savingSettings}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] rounded-lg transition-opacity disabled:opacity-40 hover:opacity-90"
            >
              <Save className="w-4 h-4" />
              {savingSettings ? 'Saving…' : settingsSaved ? 'Saved ✓' : 'Save'}
            </button>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            {draft.mode === 'scheduled'
              ? `Students can submit daily between ${formatHHMMLabel(draft.openTime)} and ${formatHHMMLabel(draft.closeTime)} Eastern, only on camp days (camp start–end). Closed before and after camp.`
              : draft.mode === 'open'
                ? 'Submissions are forced OPEN — students can submit any time, ignoring the schedule and camp dates.'
                : 'Submissions are forced CLOSED — students cannot submit, ignoring the schedule and camp dates.'}
            {' '}Times are Eastern (camp time).
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or video title…"
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
        />
      </div>

      {/* Day tabs */}
      <div className="flex gap-0.5 border-b border-gray-200 dark:border-gray-800">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeDay === day
                ? 'text-[var(--primary)] border-[var(--primary)]'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Day {day}
            {countByDay[day] > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded-full font-semibold ${
                activeDay === day
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {countByDay[day]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Selection / export bar */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => selectAllVisible(visibleIds)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {allVisibleSelected ? <CheckSquare className="w-4 h-4 text-[var(--primary)]" /> : <Square className="w-4 h-4" />}
            {allVisibleSelected ? 'Deselect all' : `Select all (Day ${activeDay})`}
          </button>

          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {selected.size} selected · {formatSize(selectedBytes)}
                </span>
                <button
                  onClick={clearSelection}
                  className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Clear
                </button>
                <button
                  onClick={handleExportSelected}
                  disabled={exporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Archive className="w-3.5 h-3.5" />
                  {exporting ? (exportMsg ?? 'Working…') : `Download selected (${selected.size})`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {exportMsg && exporting && (
        <div className="text-xs text-gray-500 dark:text-gray-400">{exportMsg}</div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <Film className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {search ? 'No results match your search' : `No submissions for Day ${activeDay}`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const isSelected = selected.has(s.id);
            return (
              <div
                key={s.id}
                className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border transition-colors ${
                  isSelected ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]/30' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <button onClick={() => toggleSelect(s.id)} className="shrink-0" aria-label="Select submission">
                  {isSelected
                    ? <CheckSquare className="w-5 h-5 text-[var(--primary)]" />
                    : <Square className="w-5 h-5 text-gray-300 dark:text-gray-600 hover:text-gray-400" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                      #{String(dayOrder[s.id] ?? 0).padStart(3, '0')}
                    </span>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{s.name}</p>
                    <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{s.video_title}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
                    <span>{s.phone_number}</span>
                    <span>·</span>
                    <span>{formatSize(s.file_size)}</span>
                    <span>·</span>
                    <span>{formatTime(s.submitted_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openPreview(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/20 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleDownload(s)}
                    disabled={downloading === s.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {downloading === s.id ? '…' : 'Download'}
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    disabled={deleting === s.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deleting === s.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview modal */}
      <Dialog open={!!previewing} onOpenChange={(o) => { if (!o) closePreview(); }}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="text-base">
            {previewing ? `${previewing.name} — ${previewing.video_title}` : 'Preview'}
          </DialogTitle>
          <div className="mt-2">
            {previewLoading ? (
              <div className="aspect-video flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg">
                <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : previewError || !previewUrl ? (
              <div className="aspect-video flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg text-center px-4">
                <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Couldn't play this video inline (some iPhone .mov files won't preview in this browser).
                </p>
                {previewing && (
                  <button
                    onClick={() => handleDownload(previewing)}
                    className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
                  >
                    <Download className="w-3.5 h-3.5" /> Download instead
                  </button>
                )}
              </div>
            ) : (
              <video
                key={previewUrl}
                src={previewUrl}
                controls
                autoPlay
                onError={() => setPreviewError(true)}
                className="w-full rounded-lg bg-black max-h-[70vh]"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title ?? ''}
        message={confirmState?.message ?? ''}
        onConfirm={() => confirmState?.onConfirm()}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
