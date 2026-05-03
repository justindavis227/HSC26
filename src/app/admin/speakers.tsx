import { useEffect, useRef, useState } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Upload, X, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Speaker } from '../../lib/supabase';

type SpeakerForm = Omit<Speaker, 'id' | 'created_at' | 'sort_order'>;

const empty: SpeakerForm = { name: '', role: '', organization: '', bio: '', image: '', instagram: '' };

async function persistOrder(ordered: Speaker[]) {
  await Promise.all(ordered.map((item, idx) =>
    supabase.from('speakers').update({ sort_order: idx + 1 }).eq('id', item.id)
  ));
}

function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleFile(file: File) {
    setUploadError(''); setUploading(true);
    const ext = file.name.split('.').pop();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${Date.now()}_${safeName}`;
    const { error } = await supabase.storage.from('speaker-images').upload(path, file, { upsert: true, contentType: file.type });
    if (error) { setUploadError(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from('speaker-images').getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Photo</label>
      <div className="flex items-start gap-3">
        <div className="w-20 h-20 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
          {value ? (
            <img src={value} alt="Speaker" className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <User className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[var(--primary)] hover:text-[var(--primary)] transition disabled:opacity-50">
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Uploading…' : value ? 'Replace Photo' : 'Upload Photo'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950 transition">
              <X className="w-3.5 h-3.5" />Remove Photo
            </button>
          )}
          {uploadError && <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p>}
          <p className="text-xs text-gray-400">JPG, PNG, WebP or GIF · max 5 MB</p>
        </div>
      </div>
    </div>
  );
}

function SortableSpeaker({ item, isEditing, deleting, onEdit, onDelete }: {
  item: Speaker; isEditing: boolean; deleting: boolean;
  onEdit: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 10 : undefined }}
      className={`bg-white dark:bg-gray-900 rounded-xl border p-4 flex gap-3 items-start ${isEditing ? 'border-[var(--primary)]' : 'border-gray-200 dark:border-gray-800'}`}
    >
      <button
        {...attributes} {...listeners}
        className="p-0.5 mt-0.5 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <User className="w-5 h-5 text-gray-300 dark:text-gray-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-900 dark:text-white">{item.name}</div>
        <div className="text-xs text-[var(--primary)]">{item.role}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{item.organization}</div>
        {item.bio && <div className="text-xs text-gray-400 mt-1 line-clamp-2">{item.bio}</div>}
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--primary)] hover:bg-blue-50 dark:hover:bg-blue-950 transition text-xs">Edit</button>
        <button onClick={onDelete} disabled={deleting}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition text-xs disabled:opacity-40">
          {deleting ? '…' : 'Del'}
        </button>
      </div>
    </div>
  );
}

export function AdminSpeakers() {
  const [items, setItems]     = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Speaker | null>(null);
  const [form, setForm]       = useState<SpeakerForm>(empty);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError]     = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor,  { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,    { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('speakers').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() { setEditing(null); setForm(empty); setError(''); }

  function startEdit(item: Speaker) {
    setEditing(item);
    setForm({ name: item.name, role: item.role, organization: item.organization, bio: item.bio ?? '', image: item.image ?? '', instagram: item.instagram ?? '' });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save() {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    if (editing) {
      const { error } = await supabase.from('speakers').update(form).eq('id', editing.id);
      if (error) { setSaving(false); setError(error.message); return; }
    } else {
      const { error } = await supabase.from('speakers').insert({ ...form, sort_order: items.length + 1 });
      if (error) { setSaving(false); setError(error.message); return; }
    }
    setSaving(false); setEditing(null); setForm(empty); load();
  }

  async function remove(id: number) {
    if (!confirm('Delete this speaker?')) return;
    setDeleting(id);
    await supabase.from('speakers').delete().eq('id', id);
    setDeleting(null); load();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex(i => i.id === active.id);
    const newIdx = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);
    setItems(reordered);
    await persistOrder(reordered);
  }

  const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';
  const field = (label: string, key: keyof SpeakerForm, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea rows={4} value={String(form[key] ?? '')}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder} className={`${inputClass} resize-none`} />
      ) : (
        <input type={type} value={String(form[key] ?? '')}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder} className={inputClass} />
      )}
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Speakers</h1>
        <button onClick={startNew} className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition">
          + New
        </button>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {editing ? `Editing: ${editing.name}` : 'New Speaker'}
        </h2>
        {error && <div className="mb-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</div>}
        <div className="space-y-3">
          {field('Name *', 'name', 'text', 'Full name')}
          {field('Role / Title', 'role', 'text', 'e.g. Lead Pastor')}
          {field('Organization', 'organization', 'text', 'e.g. Southeast Christian Church')}
          {field('Bio', 'bio', 'textarea', 'Speaker biography…')}
          <ImageUploader value={form.image ?? ''} onChange={url => setForm(f => ({ ...f, image: url }))} />
          {field('Instagram URL', 'instagram', 'url', 'https://instagram.com/…')}
          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving}
              className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Speaker'}
            </button>
            {editing && (
              <button onClick={startNew}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sortable list */}
      {loading ? (
        <div className="text-sm text-gray-400 text-center py-8">Loading…</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map(item => (
                <SortableSpeaker
                  key={item.id}
                  item={item}
                  isEditing={editing?.id === item.id}
                  deleting={deleting === item.id}
                  onEdit={() => startEdit(item)}
                  onDelete={() => remove(item.id)}
                />
              ))}
              {items.length === 0 && <div className="text-sm text-gray-400 text-center py-8">No speakers yet.</div>}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
