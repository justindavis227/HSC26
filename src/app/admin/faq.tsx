import { useEffect, useState } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { FAQ } from '../../lib/supabase';
import { PageTitleEditor } from './page-title-editor';

type FAQForm = { question: string; answer: string };
const empty: FAQForm = { question: '', answer: '' };

async function persistOrder(ordered: FAQ[]) {
  await Promise.all(ordered.map((item, idx) =>
    supabase.from('faqs').update({ sort_order: idx + 1 }).eq('id', item.id)
  ));
}

function SortableFAQ({ item, isEditing, deleting, onEdit, onDelete }: {
  item: FAQ; isEditing: boolean; deleting: boolean;
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
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-900 dark:text-white">{item.question}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-3 whitespace-pre-line">{item.answer}</div>
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

export function AdminFAQ() {
  const [items, setItems]     = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm]       = useState<FAQForm>(empty);
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
    const { data } = await supabase.from('faqs').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() { setEditing(null); setForm(empty); setError(''); }

  function startEdit(item: FAQ) {
    setEditing(item);
    setForm({ question: item.question, answer: item.answer });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save() {
    if (!form.question.trim() || !form.answer.trim()) { setError('Question and answer are required.'); return; }
    setSaving(true); setError('');
    if (editing) {
      const { error } = await supabase.from('faqs').update(form).eq('id', editing.id);
      if (error) { setSaving(false); setError(error.message); return; }
    } else {
      const { error } = await supabase.from('faqs').insert({ ...form, sort_order: items.length + 1 });
      if (error) { setSaving(false); setError(error.message); return; }
    }
    setSaving(false); setEditing(null); setForm(empty); load();
  }

  async function remove(id: number) {
    if (!confirm('Delete this FAQ?')) return;
    setDeleting(id);
    await supabase.from('faqs').delete().eq('id', id);
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

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FAQ</h1>
        <button onClick={startNew} className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition">
          + New
        </button>
      </div>

      <PageTitleEditor pageKey="faq" />

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {editing ? 'Editing FAQ' : 'New FAQ Entry'}
        </h2>
        {error && <div className="mb-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</div>}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Question *</label>
            <input type="text" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              placeholder="e.g. LOST & FOUND"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Answer *</label>
            <textarea rows={5} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
              placeholder="Answer text… (supports line breaks)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add FAQ'}
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
                <SortableFAQ
                  key={item.id}
                  item={item}
                  isEditing={editing?.id === item.id}
                  deleting={deleting === item.id}
                  onEdit={() => startEdit(item)}
                  onDelete={() => remove(item.id)}
                />
              ))}
              {items.length === 0 && <div className="text-sm text-gray-400 text-center py-8">No FAQs yet.</div>}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
