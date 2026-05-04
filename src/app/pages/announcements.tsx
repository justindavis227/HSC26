import { supabase } from '../../lib/supabase';
import type { AnnouncementWithAttachments } from '../../lib/supabase';
import { Card } from '../components/ui/card';
import { Bell, ChevronDown, ChevronUp, FileText, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getReadAnnouncements, markAllAnnouncementsAsRead } from '../utils/announcement-tracker';
import { localDateString } from '../utils/date';
import { usePageTitle } from '../hooks/use-page-title';

export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementWithAttachments[]>([]);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const { title, subtitle } = usePageTitle('announcements', {
    title: 'Daily Announcements',
    subtitle: 'Stay updated with the latest camp news and important information',
  });

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('announcements')
        .select('*, announcement_attachments(*)')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        setFetchError(error.message);
        setLoading(false);
        return;
      }

      const now = new Date();
      const items = ((data ?? []) as AnnouncementWithAttachments[]).filter(
        (a) => !a.scheduled_at || new Date(a.scheduled_at) <= now
      );

      // Capture which IDs are unread before marking them read
      const alreadyRead = new Set(getReadAnnouncements());
      const newUnread = new Set(items.filter((a) => !alreadyRead.has(a.id)).map((a) => a.id));
      setUnreadIds(newUnread);

      setAnnouncements(items);
      setLoading(false);

      markAllAnnouncementsAsRead(items.map((a) => a.id));
      window.dispatchEvent(new Event('storage'));
    }
    load();
  }, []);

  const today = localDateString();
  const todayItems = announcements.filter((a) => a.date === today);
  const previousItems = announcements.filter((a) => a.date !== today);

  const groupedByDate = previousItems.reduce(
    (acc, a) => {
      if (!acc[a.date]) acc[a.date] = [];
      acc[a.date].push(a);
      return acc;
    },
    {} as Record<string, AnnouncementWithAttachments[]>
  );

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  };

  const formatDate = (dateString: string) =>
    new Date(dateString + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

  const AnnouncementCard = ({
    announcement,
    isUnread,
  }: {
    announcement: AnnouncementWithAttachments;
    isUnread: boolean;
  }) => {
    const isHigh = announcement.priority === 'high';
    const attachments = announcement.announcement_attachments ?? [];
    const images = attachments.filter((a) => a.file_type === 'image');
    const pdfs = attachments.filter((a) => a.file_type === 'pdf');
    const bodyHtml = announcement.content_html || announcement.content;

    return (
      <div
        className={`relative rounded-lg border bg-card overflow-hidden border-l-4 ${
          isHigh ? 'border-l-red-500' : 'border-l-blue-400'
        }`}
      >
        {/* Unread dot */}
        {isUnread && (
          <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-primary" />
        )}

        <div className="p-4">
          {/* Priority badge */}
          {isHigh && (
            <div className="flex items-center gap-1 mb-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">
                Urgent
              </span>
            </div>
          )}

          <h3 className="font-semibold text-base leading-snug pr-5">{announcement.title}</h3>

          <div
            className="rich-text text-sm text-muted-foreground mt-1"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          {/* Image attachments */}
          {images.length > 0 && (
            <div className={`mt-3 grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {images.map((img) => (
                <a key={img.id} href={img.file_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={img.file_url}
                    alt={img.file_name}
                    className="w-full rounded-md object-cover max-h-48"
                  />
                </a>
              ))}
            </div>
          )}

          {/* PDF attachments */}
          {pdfs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {pdfs.map((pdf) => (
                <a
                  key={pdf.id}
                  href={pdf.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-sm font-medium hover:bg-accent transition-colors"
                >
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  {pdf.file_name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (fetchError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 text-sm">
          <strong>Could not load announcements:</strong> {fetchError}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>

      {/* Today's announcements */}
      {todayItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold">Today</h2>
          </div>
          {todayItems.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} isUnread={unreadIds.has(a.id)} />
          ))}
        </div>
      )}

      {/* Previous announcements, grouped by date */}
      {Object.keys(groupedByDate).length > 0 && (
        <div className="space-y-3">
          {todayItems.length > 0 && (
            <h2 className="text-base font-semibold text-muted-foreground">Previous</h2>
          )}
          {Object.entries(groupedByDate).map(([date, items]) => {
            const isExpanded = expandedDates.has(date);
            const dateUnread = items.some((a) => unreadIds.has(a.id));
            return (
              <div key={date} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleDate(date)}
                  className="w-full px-4 py-3 bg-card hover:bg-accent transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{formatDate(date)}</span>
                    {dateUnread && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {items.length} {items.length === 1 ? 'announcement' : 'announcements'}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {isExpanded && (
                  <div className="p-3 space-y-3 bg-accent/20">
                    {items.map((a) => (
                      <AnnouncementCard key={a.id} announcement={a} isUnread={unreadIds.has(a.id)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {announcements.length === 0 && (
        <Card className="p-10 text-center">
          <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-40" />
          <p className="font-medium">No announcements yet</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon for camp updates.</p>
        </Card>
      )}
    </div>
  );
}
