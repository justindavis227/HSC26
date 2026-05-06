import { useState, useEffect } from 'react';
import { Download, Trash2, Search, Film, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { VideoSubmission } from '../../lib/supabase';

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return '–';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

const DAYS = [1, 2, 3, 4, 5];

export function AdminVideoSubmissions() {
  const [submissions, setSubmissions] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('video_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    setSubmissions(data ?? []);
    setLoading(false);
  }

  async function handleDelete(s: VideoSubmission) {
    if (!confirm(`Delete "${s.video_title}" by ${s.name}? This cannot be undone.`)) return;
    setDeleting(s.id);
    await supabase.storage.from('video-submissions').remove([s.file_url]);
    await supabase.from('video_submissions').delete().eq('id', s.id);
    setSubmissions(prev => prev.filter(x => x.id !== s.id));
    setDeleting(null);
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

  const countByDay = DAYS.reduce((acc, d) => {
    acc[d] = submissions.filter(s => s.day_number === d).length;
    return acc;
  }, {} as Record<number, number>);

  const filtered = submissions.filter(s =>
    s.day_number === activeDay &&
    (search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.video_title.toLowerCase().includes(search.toLowerCase()))
  );

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
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or video title…"
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
        />
      </div>

      {/* Day tabs */}
      <div className="flex gap-0.5 border-b border-gray-200 dark:border-gray-800">
        {DAYS.map(day => (
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
          {filtered.map(s => (
            <div
              key={s.id}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
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
          ))}
        </div>
      )}
    </div>
  );
}
