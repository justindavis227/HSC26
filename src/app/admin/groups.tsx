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
  Bold, Italic, Underline, List, ListOrdered, ChevronDown, ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { GroupCardDeck, GroupCardItem } from '../../lib/supabase';
import { invalidateCache } from '../../lib/query-cache';
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
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div className="text-sm text-gray-400 text-center py-8">Loading…</div>;

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">These URLs appear as tappable cards on the live Groups page.</p>
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

type DeckForm = { title: string; session_label: string; day_number: number; session_type: string; bar_color: string };
type CardForm = { title: string; subtitle: string; content: string; bg_color: string };

const emptyDeckForm = (): DeckForm => ({ title: '', session_label: '', day_number: 1, session_type: 'morning', bar_color: '#38B6FF' });
const emptyCardForm = (): CardForm => ({ title: '', subtitle: '', content: '', bg_color: '#1a0808' });

function RichToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const btn = (on: boolean) =>
    `p-1.5 rounded text-xs transition ${on ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`;
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

function SortableCardRow({ item, isEditing, onEdit, onDelete }: {
  item: GroupCardItem;
  isEditing: boolean;
  onEdit: (item: GroupCardItem) => void;
  onDelete: (item: GroupCardItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3">
      <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 touch-none shrink-0">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="w-3.5 h-3.5 rounded-full shrink-0 border border-gray-300 dark:border-gray-600" style={{ backgroundColor: item.bg_color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
        <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={() => onEdit(item)}
          className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${isEditing ? 'bg-[var(--primary)] text-white' : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}>
          {isEditing ? 'Editing' : 'Edit'}
        </button>
        <button onClick={() => onDelete(item)} className="text-xs text-red-400 hover:text-red-600 transition px-1">Del</button>
      </div>
    </div>
  );
}

function GroupCardsEditor() {
  const [decks, setDecks] = useState<GroupCardDeck[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [items, setItems] = useState<GroupCardItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [deckForm, setDeckForm] = useState<DeckForm>(emptyDeckForm());
  const [savingDeck, setSavingDeck] = useState(false);

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState<CardForm>(emptyCardForm());
  const [savingCard, setSavingCard] = useState(false);

  const cardEditor = useEditor({
    extensions: [StarterKit, UnderlineExt],
    content: '',
    onUpdate: ({ editor }) => setCardForm(f => ({ ...f, content: editor.getHTML() })),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Load decks on mount
  useEffect(() => {
    supabase.from('group_card_decks').select('*').order('sort_order')
      .then(({ data }) => { setDecks(data ?? []); setLoadingDecks(false); });
  }, []);

  // Load items when deck selected
  async function toggleDeck(deckId: string) {
    if (selectedDeckId === deckId) {
      setSelectedDeckId(null); setItems([]); setEditingCardId(null); return;
    }
    setSelectedDeckId(deckId); setEditingCardId(null); setLoadingItems(true);
    const { data } = await supabase.from('group_card_items').select('*').eq('deck_id', deckId).order('sort_order');
    setItems(data ?? []); setLoadingItems(false);
  }

  // ── Deck CRUD ──────────────────────────────────────────────────────────────

  function startAddDeck() {
    setEditingDeckId('new'); setDeckForm(emptyDeckForm());
  }

  function startEditDeck(deck: GroupCardDeck) {
    setEditingDeckId(deck.id);
    setDeckForm({ title: deck.title, session_label: deck.session_label, day_number: deck.day_number, session_type: deck.session_type, bar_color: deck.bar_color });
  }

  function cancelDeckEdit() { setEditingDeckId(null); }

  async function saveDeck() {
    if (!deckForm.title.trim()) return;
    setSavingDeck(true);
    if (editingDeckId === 'new') {
      const nextOrder = (decks[decks.length - 1]?.sort_order ?? 0) + 1;
      const { data } = await supabase.from('group_card_decks').insert({ ...deckForm, sort_order: nextOrder }).select().single();
      if (data) setDecks(prev => [...prev, data as GroupCardDeck]);
    } else if (editingDeckId) {
      await supabase.from('group_card_decks').update({ ...deckForm }).eq('id', editingDeckId);
      setDecks(prev => prev.map(d => d.id === editingDeckId ? { ...d, ...deckForm } : d));
    }
    invalidateCache('group_card_decks');
    setSavingDeck(false); setEditingDeckId(null);
  }

  async function deleteDeck(deck: GroupCardDeck) {
    if (!confirm(`Delete "${deck.title}" and all its cards?`)) return;
    await supabase.from('group_card_decks').delete().eq('id', deck.id);
    setDecks(prev => prev.filter(d => d.id !== deck.id));
    if (selectedDeckId === deck.id) { setSelectedDeckId(null); setItems([]); }
    invalidateCache('group_card_decks'); invalidateCache('group_card_items_all');
  }

  // ── Card CRUD ──────────────────────────────────────────────────────────────

  function startAddCard() {
    setEditingCardId('new'); setCardForm(emptyCardForm());
    cardEditor?.commands.setContent('');
  }

  function startEditCard(item: GroupCardItem) {
    setEditingCardId(item.id);
    setCardForm({ title: item.title, subtitle: item.subtitle, content: item.content, bg_color: item.bg_color });
    cardEditor?.commands.setContent(item.content);
  }

  function cancelCardEdit() { setEditingCardId(null); cardEditor?.commands.setContent(''); }

  async function saveCard() {
    if (!selectedDeckId || !cardForm.title.trim()) return;
    setSavingCard(true);
    if (editingCardId === 'new') {
      const nextOrder = (items[items.length - 1]?.sort_order ?? 0) + 1;
      const { data } = await supabase.from('group_card_items')
        .insert({ deck_id: selectedDeckId, ...cardForm, sort_order: nextOrder })
        .select().single();
      if (data) setItems(prev => [...prev, data as GroupCardItem]);
    } else if (editingCardId) {
      await supabase.from('group_card_items').update({ ...cardForm }).eq('id', editingCardId);
      setItems(prev => prev.map(i => i.id === editingCardId ? { ...i, ...cardForm } : i));
    }
    invalidateCache('group_card_items_all');
    setSavingCard(false); cancelCardEdit();
  }

  async function deleteCard(item: GroupCardItem) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await supabase.from('group_card_items').delete().eq('id', item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
    if (editingCardId === item.id) cancelCardEdit();
    invalidateCache('group_card_items_all');
  }

  function handleCardDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex(i => i.id === active.id);
    const newIdx = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx).map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setItems(reordered);
    Promise.all(reordered.map(item =>
      supabase.from('group_card_items').update({ sort_order: item.sort_order }).eq('id', item.id)
    ));
    invalidateCache('group_card_items_all');
  }

  // ── Shared color input ─────────────────────────────────────────────────────

  function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <input type="color" value={value.startsWith('#') ? value : '#888888'} onChange={e => onChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700 p-0.5 bg-white dark:bg-gray-800" />
          <input type="text" value={value} onChange={e => onChange(e.target.value)}
            className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
        </div>
      </div>
    );
  }

  const selectedDeck = decks.find(d => d.id === selectedDeckId);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loadingDecks) return <div className="text-sm text-gray-400 text-center py-8">Loading…</div>;

  return (
    <div className="max-w-2xl space-y-3">

      {/* Deck list */}
      {decks.map(deck => (
        <div key={deck.id} className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Deck row */}
          <div className="bg-white dark:bg-gray-900 flex items-center gap-3 px-4 py-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: deck.bar_color }} />
            <button onClick={() => toggleDeck(deck.id)} className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{deck.title}</p>
              <p className="text-xs text-gray-400 truncate">{deck.session_label}</p>
            </button>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => { startEditDeck(deck); setEditingDeckId(deck.id); }}
                className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)] transition font-semibold">
                Edit
              </button>
              <button onClick={() => deleteDeck(deck)} className="text-xs text-red-400 hover:text-red-600 transition px-1">Del</button>
              <button onClick={() => toggleDeck(deck.id)} className="text-gray-400 hover:text-gray-600 transition p-1">
                {selectedDeckId === deck.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Deck edit form */}
          {editingDeckId === deck.id && (
            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title *</label>
                  <input type="text" value={deckForm.title} onChange={e => setDeckForm(f => ({ ...f, title: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Session Label</label>
                  <input type="text" value={deckForm.session_label} onChange={e => setDeckForm(f => ({ ...f, session_label: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Day Number</label>
                  <select value={deckForm.day_number} onChange={e => setDeckForm(f => ({ ...f, day_number: Number(e.target.value) }))} className={inputClass}>
                    <option value={0}>Pre-Camp (0)</option>
                    {[1,2,3,4,5].map(d => <option key={d} value={d}>Day {d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Session Type</label>
                  <select value={deckForm.session_type} onChange={e => setDeckForm(f => ({ ...f, session_type: e.target.value }))} className={inputClass}>
                    <option value="precamp">Pre-Camp</option>
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                    <option value="busride">Bus Ride</option>
                  </select>
                </div>
              </div>
              <ColorInput label="Bar Color" value={deckForm.bar_color} onChange={v => setDeckForm(f => ({ ...f, bar_color: v }))} />
              <div className="flex items-center gap-3 pt-1">
                <button onClick={saveDeck} disabled={savingDeck || !deckForm.title.trim()}
                  className="px-4 py-1.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition">
                  {savingDeck ? 'Saving…' : 'Save Deck'}
                </button>
                <button onClick={cancelDeckEdit} className="px-4 py-1.5 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)] transition">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Card list (expanded) */}
          {selectedDeckId === deck.id && (
            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-3 space-y-3">
              {loadingItems && <p className="text-xs text-gray-400 text-center py-4">Loading cards…</p>}

              {!loadingItems && (
                <>
                  {items.length > 0 && (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCardDragEnd}>
                      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {items.map(item => (
                            <SortableCardRow key={item.id} item={item} isEditing={editingCardId === item.id}
                              onEdit={startEditCard} onDelete={deleteCard} />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}

                  {items.length === 0 && editingCardId !== 'new' && (
                    <p className="text-xs text-gray-400 text-center py-3">No cards yet.</p>
                  )}

                  {/* Card edit / add form */}
                  {editingCardId !== null && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {editingCardId === 'new' ? 'Add Card' : 'Edit Card'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title *</label>
                          <input type="text" value={cardForm.title} onChange={e => setCardForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. SHARE IT" className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subtitle</label>
                          <input type="text" value={cardForm.subtitle} onChange={e => setCardForm(f => ({ ...f, subtitle: e.target.value }))}
                            placeholder="e.g. Discussion" className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Content</label>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden tiptap-editor">
                          <RichToolbar editor={cardEditor} />
                          <div className="px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[80px]">
                            <EditorContent editor={cardEditor} />
                          </div>
                        </div>
                      </div>
                      <ColorInput label="Background Color" value={cardForm.bg_color} onChange={v => setCardForm(f => ({ ...f, bg_color: v }))} />
                      {/* Mini preview */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Preview</label>
                        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ backgroundColor: cardForm.bg_color, maxHeight: '160px', display: 'flex', flexDirection: 'column' }}>
                          <div className="px-4 py-2 shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                            <p className="text-white font-black text-lg leading-tight">{cardForm.title || 'TITLE'}</p>
                            <p className="text-white/50 text-xs">{cardForm.subtitle || 'Subtitle'}</p>
                          </div>
                          <div className="flex-1 overflow-y-auto p-3 rich-text text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}
                            dangerouslySetInnerHTML={{ __html: cardForm.content || '<p>Card content…</p>' }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={saveCard} disabled={savingCard || !cardForm.title.trim()}
                          className="px-4 py-1.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition">
                          {savingCard ? 'Saving…' : editingCardId === 'new' ? 'Add Card' : 'Save Changes'}
                        </button>
                        <button onClick={cancelCardEdit}
                          className="px-4 py-1.5 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)] transition">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {editingCardId === null && (
                    <button onClick={startAddCard}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)] transition">
                      <Plus className="w-3.5 h-3.5" />Add Card
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add deck form */}
      {editingDeckId === 'new' && (
        <div className="rounded-xl border border-[var(--primary)] bg-white dark:bg-gray-900 p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Deck</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title *</label>
              <input type="text" value={deckForm.title} onChange={e => setDeckForm(f => ({ ...f, title: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Session Label</label>
              <input type="text" value={deckForm.session_label} onChange={e => setDeckForm(f => ({ ...f, session_label: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Day</label>
              <select value={deckForm.day_number} onChange={e => setDeckForm(f => ({ ...f, day_number: Number(e.target.value) }))} className={inputClass}>
                <option value={0}>Pre-Camp (0)</option>
                {[1,2,3,4,5].map(d => <option key={d} value={d}>Day {d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Session Type</label>
              <select value={deckForm.session_type} onChange={e => setDeckForm(f => ({ ...f, session_type: e.target.value }))} className={inputClass}>
                <option value="precamp">Pre-Camp</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="busride">Bus Ride</option>
              </select>
            </div>
          </div>
          <ColorInput label="Bar Color" value={deckForm.bar_color} onChange={v => setDeckForm(f => ({ ...f, bar_color: v }))} />
          <div className="flex items-center gap-3 pt-1">
            <button onClick={saveDeck} disabled={savingDeck || !deckForm.title.trim()}
              className="px-4 py-1.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition">
              {savingDeck ? 'Saving…' : 'Create Deck'}
            </button>
            <button onClick={cancelDeckEdit} className="px-4 py-1.5 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)] transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {editingDeckId !== 'new' && (
        <button onClick={startAddDeck}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)] transition">
          <Plus className="w-4 h-4" />Add Deck
        </button>
      )}

      {/* suppress unused-var warning */}
      {selectedDeck && null}
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
    setItems(data ?? []); setLoading(false);
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
    setNewTitle(''); setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
    load();
  }

  async function remove(item: DGItem) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    setDeleting(item.id);
    if (item.file_path) await supabase.storage.from('decision-guide-files').remove([item.file_path]);
    await supabase.from('decision_guide').delete().eq('id', item.id);
    setDeleting(null); load();
  }

  if (loading) return <div className="text-sm text-gray-400 text-center py-8">Loading…</div>;

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Upload files (PDFs or images) that appear in the Resources section at the bottom of the live Decision Guide page.
      </p>
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
      {items.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No resources uploaded yet.</p>}
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
