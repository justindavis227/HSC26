import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, X, FileText, Image } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/confirm-dialog';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_ORDER: Record<string, number> = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5 };

interface SeatingChart {
  day: string;
  day_order: number;
  file_url: string;
  file_name: string;
  file_path: string;
  updated_at: string;
}

function isPdf(fileName: string) {
  return fileName.toLowerCase().endsWith('.pdf');
}

function DayCard({
  day,
  label,
  chart,
  onUploaded,
  onRemoved,
}: {
  day: string;
  label: string;
  chart: SeatingChart | undefined;
  onUploaded: (chart: SeatingChart) => void;
  onRemoved: (day: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleFile(file: File) {
    setError('');
    setUploading(true);

    const ext = file.name.split('.').pop() ?? '';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${day.toLowerCase()}/${Date.now()}_${safeName}`;

    const { error: uploadErr } = await supabase.storage
      .from('seating-charts')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadErr) {
      setError(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('seating-charts').getPublicUrl(path);

    const row = {
      day,
      day_order: DAY_ORDER[day],
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_path: path,
      updated_at: new Date().toISOString(),
    };

    const { error: dbErr } = await supabase
      .from('seating_charts')
      .upsert(row, { onConflict: 'day' });

    if (dbErr) {
      setError(dbErr.message);
      setUploading(false);
      return;
    }

    onUploaded(row as SeatingChart);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleRemove() {
    if (!chart) return;
    setConfirmOpen(true);
  }

  async function doRemove() {
    setConfirmOpen(false);
    setRemoving(true);
    if (chart?.file_path) {
      await supabase.storage.from('seating-charts').remove([chart.file_path]);
    }
    await supabase.from('seating_charts').delete().eq('day', day);
    onRemoved(day);
    setRemoving(false);
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
        {chart && (
          <button
            onClick={handleRemove}
            disabled={removing}
            className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition disabled:opacity-40"
          >
            <X className="w-3.5 h-3.5" />
            {removing ? 'Removing…' : 'Remove'}
          </button>
        )}
      </div>

      {/* Preview */}
      {chart && (
        <div className="mb-3">
          {isPdf(chart.file_name) ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <FileText className="w-8 h-8 text-red-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{chart.file_name}</p>
                <a
                  href={chart.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  View PDF ↗
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-h-48">
              <img
                src={chart.file_url}
                alt={`Seating chart for ${day}`}
                className="w-full h-full object-contain bg-gray-50 dark:bg-gray-800"
              />
            </div>
          )}
        </div>
      )}

      {/* Upload button */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[var(--primary)] hover:text-[var(--primary)] transition disabled:opacity-50"
        >
          {isPdf(chart?.file_name ?? '') ? (
            <FileText className="w-3.5 h-3.5" />
          ) : (
            <Image className="w-3.5 h-3.5" />
          )}
          {uploading ? 'Uploading…' : chart ? 'Replace File' : 'Upload File'}
        </button>
        {!chart && (
          <span className="text-xs text-gray-400">JPG, PNG, WebP or PDF · max 20 MB</span>
        )}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Remove Seating Chart"
        message={`Remove the seating chart for ${day}? This cannot be undone.`}
        onConfirm={doRemove}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export function AdminSeatingCharts() {
  const [charts, setCharts] = useState<Record<string, SeatingChart>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('seating_charts')
      .select('*')
      .order('day_order')
      .then(({ data }) => {
        const map: Record<string, SeatingChart> = {};
        (data ?? []).forEach((row: SeatingChart) => { map[row.day] = row; });
        setCharts(map);
        setLoading(false);
      });
  }, []);

  function handleUploaded(chart: SeatingChart) {
    setCharts(prev => ({ ...prev, [chart.day]: chart }));
  }

  function handleRemoved(day: string) {
    setCharts(prev => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
  }

  if (loading) return <div className="text-sm text-gray-400 text-center py-8">Loading…</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seating Charts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Upload one seating chart per day. Images display inline; PDFs show a view link.
        </p>
      </div>

      <div className="space-y-3">
        {DAYS.map((day) => (
          <DayCard
            key={day}
            day={day}
            label={day}
            chart={charts[day]}
            onUploaded={handleUploaded}
            onRemoved={handleRemoved}
          />
        ))}
      </div>
    </div>
  );
}
