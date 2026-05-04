import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExt from '@tiptap/extension-underline';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Upload, X, FileText, Image, Plus, GripVertical,
  Bold, Italic, Underline, List, ListOrdered,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { GroupCardContent } from '../../lib/supabase';
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

type CardForm = {
  label: string;
  content: string;
  content_color: string;
  label_color: string;
  bg_color: string;
};

const emptyCardForm = (): CardForm => ({
  label: '',
  content: '',
  content_color: '#C83030',
  label_color: '#5a2020',
  bg_color: '#1a0808',
});

function TiptapToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const btn = (active: boolean) =>
    `p-1.5 rounded text-xs transition ${active ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`;
  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))}><Bold className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))}><Italic className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive('underline'))}><Underline className="w-3.5 h-3.5" /></button>
      <div className="w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))}><List className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))}><ListOrdered className="w-3.5 h-3.5" /></button>
    </div>
  );
}

function SortableCardRow({ card, isEditing, onEdit, onDelete }: {
  card: GroupCardContent;
  isEditing: boolean;
  onEdit: (card: GroupCardContent) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3">
      <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 touch-none">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="w-4 h-4 rounded-full shrink-0 border border-gray-300 dark:border-gray-600" style={{ backgroundColor: card.bg_color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{card.label}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onEdit(card)}
          className={`text-xs px-3 py-1 rounded-lg font-semibold transition ${
            isEditing
              ? 'bg-[var(--primary)] text-white'
              : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)]'
          }`}
        >
          {isEditing ? 'Editing' : 'Edit'}
        </button>
        <button onClick={() => onDelete(card.id)} className="text-xs text-red-400 hover:text-red-600 transition">
          Del
        </button>
      </div>
    </div>
  );
}

function GroupCardsEditor() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [cards, setCards] = useState<GroupCardContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CardForm>(emptyCardForm());
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, UnderlineExt],
    content: '',
    onUpdate: ({ editor }) => setForm(f => ({ ...f, content: editor.getHTML() })),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    setLoading(true);
    setEditingId(null);
    supabase.from('group_cards_content').select('*').eq('day_number', selectedDay).order('sort_order')
      .then(({ data }) => {
        setCards(prev => [...prev.filter(c => c.day_number !== selectedDay), ...(data ?? [])]);
        setLoading(false);
      });
  }, [selectedDay]);

  const dayCards = cards
    .filter(c => c.day_number === selectedDay)
    .sort((a, b) => a.sort_order - b.sort_order);

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const oldIdx = dayCards.findIndex(c => c.id === active.id);
    const newIdx = dayCards.findIndex(c => c.id === over.id);
    const reordered = arrayMove(dayCards, oldIdx, newIdx).map((c, i) => ({ ...c, sort_order: i + 1 }));
    setCards(prev => [...prev.filter(c => c.day_number !== selectedDay), ...reordered]);
    Promise.all(reordered.map(c =>
      supabase.from('group_cards_content').update({ sort_order: c.sort_order }).eq('id', c.id)
    ));
  }

  function startEdit(card: GroupCardContent) {
    setEditingId(card.id);
    setForm({ label: card.label, content: card.content, content_color: card.content_color, label_color: card.label_color, bg_color: card.bg_color });
    editor?.commands.setContent(card.content);
  }

  function startNew() {
    setEditingId('new');
    setForm(emptyCardForm());
    editor?.commands.setContent('');
  }

  function cancelEdit() {
    setEditingId(null);
    editor?.commands.setContent('');
  }

  async function save() {
    if (!form.label.trim()) return;
    setSaving(true);
    if (editingId === 'new') {
      const nextOrder = (dayCards[dayCards.length - 1]?.sort_order ?? 0) + 1;
      const { data } = await supabase.from('group_cards_content').insert({
        day_number: selectedDay,
        card_number: nextOrder,
        label: form.label,
        content: form.content,
        content_color: form.content_color,
        label_color: form.label_color,
        bg_color: form.bg_color,
        sort_order: nextOrder,
      }).select().single();
      if (data) setCards(prev => [...prev, data as GroupCardContent]);
    } else if (editingId) {
      await supabase.from('group_cards_content').update({
        label: form.label,
        content: form.content,
        content_color: form.content_color,
        label_color: form.label_color,
        bg_color: form.bg_color,
      }).eq('id', editingId);
      setCards(prev => prev.map(c => c.id === editingId ? { ...c, ...form } : c));
    }
    setSaving(false);
    cancelEdit();
  }

  async function deleteCard(id: string) {
    if (!confirm('Delete this card?')) return;
    await supabase.from('group_cards_content').delete().eq('id', id);
    setCards(prev => prev.filter(c => c.id !== id));
    if (editingId === id) cancelEdit();
  }

  function ColorField({ label, field }: { label: string; field: keyof CardForm }) {
    const val = form[field] as string;
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={val.startsWith('#') ? val : '#888888'}
            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700 p-0.5 bg-white dark:bg-gray-800"
          />
          <input
            type="text"
            value={val}
            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Day selector */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[1, 2, 3, 4, 5].map(day => (
          <button key={day} onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
              selectedDay === day
                ? 'bg-[var(--primary)] text-white'
                : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)]'
            }`}>
            Day {day}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 text-center py-8">Loading…</div>
      ) : (
        <div className="space-y-4">
          {/* Sortable card list */}
          {dayCards.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={dayCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {dayCards.map(card => (
                    <SortableCardRow
                      key={card.id}
                      card={card}
                      isEditing={editingId === card.id}
                      onEdit={startEdit}
                      onDelete={deleteCard}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {dayCards.length === 0 && editingId !== 'new' && (
            <p className="text-sm text-gray-400 text-center py-4">No cards for Day {selectedDay} yet.</p>
          )}

          {/* Edit / Add form */}
          {editingId !== null && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {editingId === 'new' ? `Add Card — Day ${selectedDay}` : 'Edit Card'}
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Label *</label>
                <input type="text" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Card title / activity name" className={inputClass} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Content *</label>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden tiptap-editor">
                  <TiptapToolbar editor={editor} />
                  <div className="px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[100px]">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ColorField label="Content Color" field="content_color" />
                <ColorField label="Label BG Color" field="label_color" />
                <ColorField label="Card BG Color" field="bg_color" />
              </div>

              {/* Preview */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Preview</label>
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: form.bg_color, maxHeight: '200px', display: 'flex', flexDirection: 'column' }}>
                  <div className="px-4 py-2 shrink-0" style={{ backgroundColor: form.label_color }}>
                    <p className="text-white font-bold text-sm">{form.label || 'Card Label'}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 rich-text text-sm" style={{ color: form.content_color }}
                    dangerouslySetInnerHTML={{ __html: form.content || '<p>Card content…</p>' }} />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button onClick={save} disabled={saving || !form.label.trim()}
                  className="px-5 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
                  {saving ? 'Saving…' : editingId === 'new' ? 'Add Card' : 'Save Changes'}
                </button>
                <button onClick={cancelEdit}
                  className="px-5 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)] transition">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add button */}
          {editingId === null && (
            <button onClick={startNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)] transition">
              <Plus className="w-4 h-4" />Add Card
            </button>
          )}
        </div>
      )}
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
