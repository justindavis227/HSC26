import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, X, FileText, Image } from 'lucide-react';
import { PageTitleEditor } from './page-title-editor';

type MapMode = 'embed' | 'file';

const KEYS = ['camp_map_mode', 'camp_map_embed_url', 'camp_map_file_url', 'camp_map_file_name'] as const;
const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';

function isPdf(name: string) { return (name ?? '').toLowerCase().endsWith('.pdf'); }

export function AdminCampMap() {
  const [mode, setMode]         = useState<MapMode>('embed');
  const [embedUrl, setEmbedUrl] = useState('');
  const [fileUrl, setFileUrl]   = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('camp_info').select('key,value').in('key', [...KEYS]).then(({ data }) => {
      const map: Record<string, string> = {};
      (data ?? []).forEach(r => { map[r.key] = r.value; });
      if (map.camp_map_mode === 'file' || map.camp_map_mode === 'embed') setMode(map.camp_map_mode);
      setEmbedUrl(map.camp_map_embed_url ?? '');
      setFileUrl(map.camp_map_file_url ?? '');
      setFileName(map.camp_map_file_name ?? '');
      setLoading(false);
    });
  }, []);

  async function saveEmbed() {
    setSaving(true);
    await Promise.all([
      supabase.from('camp_info').upsert({ key: 'camp_map_mode', value: 'embed', updated_at: new Date().toISOString() }, { onConflict: 'key' }),
      supabase.from('camp_info').upsert({ key: 'camp_map_embed_url', value: embedUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
    ]);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadErr('');
    const ext = file.name.split('.').pop();
    const path = `map-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('camp-map').upload(path, file, { upsert: true });
    if (error) { setUploadErr(error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('camp-map').getPublicUrl(path);
    await Promise.all([
      supabase.from('camp_info').upsert({ key: 'camp_map_mode', value: 'file', updated_at: new Date().toISOString() }, { onConflict: 'key' }),
      supabase.from('camp_info').upsert({ key: 'camp_map_file_url', value: publicUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
      supabase.from('camp_info').upsert({ key: 'camp_map_file_name', value: file.name, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
    ]);
    setFileUrl(publicUrl); setFileName(file.name); setMode('file');
    setUploading(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function removeFile() {
    if (!confirm('Remove the uploaded map file?')) return;
    await Promise.all([
      supabase.from('camp_info').upsert({ key: 'camp_map_file_url',  value: '', updated_at: new Date().toISOString() }, { onConflict: 'key' }),
      supabase.from('camp_info').upsert({ key: 'camp_map_file_name', value: '', updated_at: new Date().toISOString() }, { onConflict: 'key' }),
      supabase.from('camp_info').upsert({ key: 'camp_map_mode', value: 'embed', updated_at: new Date().toISOString() }, { onConflict: 'key' }),
    ]);
    setFileUrl(''); setFileName(''); setMode('embed');
  }

  async function switchMode(m: MapMode) {
    setMode(m);
    await supabase.from('camp_info').upsert({ key: 'camp_map_mode', value: m, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  }

  if (loading) return <div className="text-sm text-gray-400 text-center py-8">Loading…</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Camp Map</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose how the map appears on the live Camp Map page.</p>
      </div>

      <PageTitleEditor pageKey="camp_map" defaults={{ title: 'Campus Map', subtitle: 'Interactive map of IU Bloomington campus' }} />

      {/* Mode toggle */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-4">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Display Mode</div>
        <div className="flex gap-3">
          {(['embed', 'file'] as MapMode[]).map(m => (
            <label key={m} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="map_mode" value={m} checked={mode === m}
                onChange={() => switchMode(m)}
                className="accent-[var(--primary)]" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {m === 'embed' ? 'Embedded Map URL' : 'Upload Map File'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Embed URL section */}
      {mode === 'embed' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Embedded Map URL</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Paste the URL of an interactive map (e.g. a Concept3D or Google Maps embed URL). Leave blank to use the default IU map.
          </p>
          <input
            type="url"
            value={embedUrl}
            onChange={e => setEmbedUrl(e.target.value)}
            placeholder="https://map.concept3d.com/?id=951#!…"
            className={inputClass}
          />
          <div className="flex items-center gap-3">
            <button onClick={saveEmbed} disabled={saving}
              className="px-5 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
              {saving ? 'Saving…' : 'Save URL'}
            </button>
            {saved && <span className="text-sm text-green-600 dark:text-green-400 font-medium">Saved!</span>}
          </div>
        </div>
      )}

      {/* File upload section */}
      {mode === 'file' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Upload Map File</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Upload a PDF or image (JPG, PNG). Images are shown inline; PDFs get a download/view button.
          </p>

          {/* Current file */}
          {fileUrl && fileName && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white dark:bg-gray-700 shrink-0">
                {isPdf(fileName)
                  ? <FileText className="w-5 h-5 text-red-500" />
                  : <Image className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileName}</p>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[var(--primary)] hover:underline">View current file ↗</a>
              </div>
              <button onClick={removeFile} className="p-1 text-gray-400 hover:text-red-500 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {uploadErr && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{uploadErr}</div>}

          <div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleUpload}
              className="hidden" id="map-file-input" />
            <label htmlFor="map-file-input"
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition ${uploading ? 'opacity-50 cursor-not-allowed' : 'bg-[var(--primary)] text-white hover:opacity-90'}`}>
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading…' : fileUrl ? 'Replace File' : 'Upload File'}
            </label>
            {saved && !uploading && <span className="ml-3 text-sm text-green-600 dark:text-green-400 font-medium">Saved!</span>}
          </div>
        </div>
      )}
    </div>
  );
}
