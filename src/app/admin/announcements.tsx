import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExt from '@tiptap/extension-underline';
import LinkExt from '@tiptap/extension-link';
import {
  Bold, Italic, Underline, List, ListOrdered, Link2, Heading2, Heading3,
  Upload, X, FileText, Eye, EyeOff, Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Announcement, AnnouncementAttachment } from '../../lib/supabase';
import { localDateString } from '../utils/date';
import { PageTitleEditor } from './page-title-editor';
import { ConfirmDialog } from '../components/ui/confirm-dialog';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isEmptyHtml(html: string): boolean {
  return html.replace(/<[^>]+>/g, '').trim().length === 0;
}

function htmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

type FormState = {
  date: string;
  title: string;
  content: string;
  content_html: string;
  priority: 'high' | 'normal';
  scheduled_at: string;
};

type Pending = { url: string; name: string; fileType: 'image' | 'pdf' };

const emptyForm = (): FormState => ({
  date: localDateString(),
  title: '',
  content: '',
  content_html: '',
  priority: 'normal',
  scheduled_at: '',
});

const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  function addLink() {
    const url = window.prompt('Enter URL');
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  }

  const btn = (active: boolean) =>
    `p-1.5 rounded text-xs transition ${active ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title="Bold"><Bold className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title="Italic"><Italic className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive('underline'))} title="Underline"><Underline className="w-3.5 h-3.5" /></button>
      <div className="w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))} title="Heading 2"><Heading2 className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))} title="Heading 3"><Heading3 className="w-3.5 h-3.5" /></button>
      <div className="w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title="Bullet list"><List className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></button>
      <div className="w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />
      <button type="button" onClick={addLink} className={btn(editor.isActive('link'))} title="Add link"><Link2 className="w-3.5 h-3.5" /></button>
      {editor.isActive('link') && (
        <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} className={btn(false)} title="Remove link"><X className="w-3.5 h-3.5" /></button>
      )}
    </div>
  );
}

// ─── Preview card ─────────────────────────────────────────────────────────────

function PreviewCard({ form, attachments }: { form: FormState; attachments: Pending[] }) {
  const isHigh = form.priority === 'high';
  return (
    <div className={`rounded-xl border-l-4 p-4 bg-white dark:bg-gray-900 shadow-sm ${isHigh ? 'border-red-500' : 'border-[var(--primary)]'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-bold text-gray-400">{form.date || 'Today'}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isHigh ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {isHigh ? 'URGENT' : 'INFO'}
        </span>
      </div>
      <p className="font-bold text-sm text-gray-900 dark:text-white mb-2">{form.title || 'Announcement title'}</p>
      {form.content_html && !isEmptyHtml(form.content_html) ? (
        <div className="rich-text text-sm text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: form.content_html }} />
      ) : (
        <p className="text-sm text-gray-400 italic">No content yet…</p>
      )}
      {attachments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {attachments.map((a, i) => (
            a.fileType === 'image'
              ? <img key={i} src={a.url} alt={a.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
              : <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400"><FileText className="w-3 h-3" />{a.name}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminAnnouncements() {
  const [items, setItems]           = useState<Announcement[]>([]);
  const [loading, setLoading]       = useState(true);
  const [editing, setEditing]       = useState<Announcement | null>(null);
  const [form, setForm]             = useState<FormState>(emptyForm());
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [error, setError]           = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Pending[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<AnnouncementAttachment[]>([]);
  const [uploading, setUploading]   = useState(false);
  const fileInputRef                = useRef<HTMLInputElement>(null);
  const [confirmState, setConfirmState] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      LinkExt.configure({ openOnClick: false }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setForm(f => ({ ...f, content_html: html }));
    },
  });

  // Sync editor content when editing item changes
  useEffect(() => {
    if (!editor) return;
    if (editing) {
      editor.commands.setContent(editing.content_html || `<p>${editing.content}</p>`);
    } else {
      editor.commands.setContent('');
    }
  }, [editing, editor]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('announcements').select('*').order('date', { ascending: false }).order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function loadAttachments(announcementId: string) {
    const { data } = await supabase.from('announcement_attachments').select('*').eq('announcement_id', announcementId).order('created_at');
    setExistingAttachments(data ?? []);
  }

  function startNew() {
    setEditing(null);
    setForm(emptyForm());
    setPendingAttachments([]);
    setExistingAttachments([]);
    setError('');
    setShowPreview(false);
    editor?.commands.setContent('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startEdit(item: Announcement) {
    setEditing(item);
    setForm({
      date: item.date,
      title: item.title,
      content: item.content,
      content_html: item.content_html ?? '',
      priority: item.priority,
      scheduled_at: item.scheduled_at ? item.scheduled_at.slice(0, 16) : '',
    });
    setPendingAttachments([]);
    setError('');
    setShowPreview(false);
    loadAttachments(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isPdf = ext === 'pdf';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${Date.now()}_${safeName}`;
    const { error: uploadErr } = await supabase.storage
      .from('announcement-attachments')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadErr) { setError(uploadErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from('announcement-attachments').getPublicUrl(path);
    setPendingAttachments(prev => [...prev, { url: data.publicUrl, name: file.name, fileType: isPdf ? 'pdf' : 'image' }]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeExistingAttachment(att: AnnouncementAttachment) {
    setConfirmState({
      title: 'Remove Attachment',
      message: `Remove "${att.file_name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmState(null);
        await supabase.from('announcement_attachments').delete().eq('id', att.id);
        setExistingAttachments(prev => prev.filter(a => a.id !== att.id));
      },
    });
  }

  async function save() {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (isEmptyHtml(form.content_html)) { setError('Content is required.'); return; }
    setSaving(true); setError('');

    const payload = {
      date: form.date,
      title: form.title.trim(),
      content: htmlToText(form.content_html),
      content_html: form.content_html,
      priority: form.priority,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
    };

    let announcementId: string | null = editing?.id ?? null;

    if (editing) {
      const { error } = await supabase.from('announcements').update(payload).eq('id', editing.id);
      if (error) { setSaving(false); setError(error.message); return; }
    } else {
      const { data, error } = await supabase.from('announcements').insert(payload).select().single();
      if (error) { setSaving(false); setError(error.message); return; }
      announcementId = data.id;
    }

    if (announcementId && pendingAttachments.length > 0) {
      await Promise.all(pendingAttachments.map(a =>
        supabase.from('announcement_attachments').insert({
          announcement_id: announcementId,
          file_url: a.url,
          file_name: a.name,
          file_type: a.fileType,
        })
      ));
    }

    setSaving(false);
    startNew();
    load();
  }

  function remove(id: string) {
    setConfirmState({
      title: 'Delete Announcement',
      message: 'Are you sure you want to delete this announcement? This cannot be undone.',
      onConfirm: async () => {
        setConfirmState(null);
        setDeleting(id);
        await supabase.from('announcements').delete().eq('id', id);
        setDeleting(null);
        if (editing?.id === id) startNew();
        load();
      },
    });
  }

  const priorityColor = form.priority === 'high'
    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400';

  const allPreviewing = [...existingAttachments.map(a => ({ url: a.file_url, name: a.file_name, fileType: a.file_type as 'image' | 'pdf' })), ...pendingAttachments];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
        <button onClick={startNew} className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition">+ New</button>
      </div>

      <PageTitleEditor pageKey="announcements" defaults={{ title: 'Daily Announcements', subtitle: 'Stay updated with the latest camp news and important information' }} />

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {editing ? `Editing: ${editing.title}` : 'New Announcement'}
          </h2>
        </div>

        <div className="p-4 space-y-4">
          {error && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</div>}

          {/* Row 1: title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Announcement title" className={inputClass} />
          </div>

          {/* Row 2: date + priority + scheduled_at */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Priority</label>
              <div className="flex items-center gap-2">
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as 'high' | 'normal' }))}
                  className={inputClass}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
                <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${priorityColor}`}>
                  {form.priority === 'high' ? 'URGENT' : 'INFO'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Send at <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input type="datetime-local" value={form.scheduled_at}
                onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} className={inputClass} />
            </div>
          </div>

          {/* Rich text editor */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Content *</label>
            <div className="tiptap-editor rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
              <Toolbar editor={editor} />
              <EditorContent
                editor={editor}
                className="px-3 py-2 text-sm text-gray-900 dark:text-white min-h-[120px]"
              />
            </div>
          </div>

          {/* File attachments */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Attachments</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {existingAttachments.map(a => (
                <div key={a.id} className="relative group">
                  {a.file_type === 'image'
                    ? <img src={a.file_url} alt={a.file_name} className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                    : <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400"><FileText className="w-3 h-3" />{a.file_name}</div>
                  }
                  <button onClick={() => removeExistingAttachment(a)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              {pendingAttachments.map((a, i) => (
                <div key={i} className="relative group">
                  {a.fileType === 'image'
                    ? <img src={a.url} alt={a.name} className="w-16 h-16 object-cover rounded-lg border border-[var(--primary)] border-dashed" />
                    : <div className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 dark:bg-blue-950 border border-[var(--primary)] border-dashed rounded-lg text-xs text-[var(--primary)]"><FileText className="w-3 h-3" />{a.name}</div>
                  }
                  <button onClick={() => setPendingAttachments(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)] transition disabled:opacity-50">
              {uploading ? <>Uploading…</> : <><Upload className="w-3.5 h-3.5" />Add Image or PDF</>}
            </button>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, or PDF</p>
          </div>

          {/* Preview toggle */}
          {showPreview && (
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Preview</p>
              <PreviewCard form={form} attachments={allPreviewing} />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={save} disabled={saving}
              className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Announcement'}
            </button>
            <button type="button" onClick={() => setShowPreview(p => !p)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)] transition">
              {showPreview ? <><EyeOff className="w-4 h-4" />Hide Preview</> : <><Eye className="w-4 h-4" />Preview</>}
            </button>
            {editing && (
              <button onClick={startNew}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title ?? ''}
        message={confirmState?.message ?? ''}
        onConfirm={() => confirmState?.onConfirm()}
        onCancel={() => setConfirmState(null)}
      />

      {loading ? (
        <div className="text-sm text-gray-400 text-center py-8">Loading…</div>
      ) : (() => {
        const nowIso = new Date().toISOString();
        const scheduledItems = items.filter(i => i.scheduled_at && i.scheduled_at > nowIso);
        const publishedItems = items.filter(i => !i.scheduled_at || i.scheduled_at <= nowIso);

        const ItemRow = ({ item }: { item: Announcement }) => (
          <div
            className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-l-4 p-4 flex gap-3 items-start ${editing?.id === item.id ? 'ring-2 ring-[var(--primary)]' : ''} ${item.priority === 'high' ? 'border-l-red-500' : 'border-l-[var(--primary)]'}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.priority === 'high' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'}`}>
                  {item.priority === 'high' ? 'URGENT' : 'INFO'}
                </span>
                <span className="text-xs text-gray-400">{item.date}</span>
                {item.scheduled_at && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    Sends {new Date(item.scheduled_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <div className="font-semibold text-sm text-gray-900 dark:text-white">{item.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{item.content}</div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--primary)] hover:bg-blue-50 dark:hover:bg-blue-950 transition text-xs">Edit</button>
              <button onClick={() => remove(item.id)} disabled={deleting === item.id}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition text-xs disabled:opacity-40">
                {deleting === item.id ? '…' : 'Del'}
              </button>
            </div>
          </div>
        );

        return (
          <div className="space-y-6">
            {scheduledItems.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                  <span>⏰</span> Scheduled ({scheduledItems.length})
                </h2>
                <div className="space-y-3">
                  {scheduledItems.map(item => <ItemRow key={item.id} item={item} />)}
                </div>
              </div>
            )}

            <div>
              {scheduledItems.length > 0 && (
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Published</h2>
              )}
              <div className="space-y-3">
                {publishedItems.map(item => <ItemRow key={item.id} item={item} />)}
                {publishedItems.length === 0 && (
                  <div className="text-sm text-gray-400 text-center py-8">No published announcements yet.</div>
                )}
              </div>
            </div>

            {items.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-8">No announcements yet.</div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
