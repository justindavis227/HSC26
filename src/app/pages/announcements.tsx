import { supabase } from '../../lib/supabase';
import type { Announcement } from '../../lib/supabase';
import { Card } from '../components/ui/card';
import { Bell, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { markAllAnnouncementsAsRead } from '../utils/announcement-tracker';
import { localDateString } from '../utils/date';

export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('date', { ascending: false });
      if (error) {
        setFetchError(error.message);
        setLoading(false);
        return;
      }
      const items = data ?? [];
      setAnnouncements(items);
      setLoading(false);
      const ids = items.map((a) => a.id);
      markAllAnnouncementsAsRead(ids);
      window.dispatchEvent(new Event('storage'));
    }
    load();
  }, []);

  const today = localDateString();
  const todayAnnouncements = announcements.filter((a) => a.date === today);
  const previousAnnouncements = announcements.filter((a) => a.date !== today);

  const groupedByDate = previousAnnouncements.reduce(
    (acc, a) => {
      if (!acc[a.date]) acc[a.date] = [];
      acc[a.date].push(a);
      return acc;
    },
    {} as Record<string, Announcement[]>
  );

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  const AnnouncementCard = ({ announcement }: { announcement: Announcement }) => (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            announcement.priority === 'high'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          {announcement.priority === 'high' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1">
          <h3>{announcement.title}</h3>
          <p className="text-muted-foreground mt-2 whitespace-pre-line">{announcement.content}</p>
          {announcement.priority === 'high' && (
            <span className="inline-block mt-3 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              High Priority
            </span>
          )}
        </div>
      </div>
    </Card>
  );

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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Daily Announcements</h1>
        <p className="text-muted-foreground mt-1">
          Stay updated with the latest camp news and important information
        </p>
      </div>

      {todayAnnouncements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Today</h2>
          {todayAnnouncements.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      )}

      {Object.keys(groupedByDate).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Previous Announcements</h2>
          {Object.entries(groupedByDate).map(([date, items]) => {
            const isExpanded = expandedDates.has(date);
            return (
              <div key={date} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleDate(date)}
                  className="w-full px-6 py-4 bg-card hover:bg-accent transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatDate(date)}</span>
                    <span className="text-sm text-muted-foreground">
                      {items.length} {items.length === 1 ? 'announcement' : 'announcements'}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {isExpanded && (
                  <div className="p-4 space-y-4 bg-accent/30">
                    {items.map((a) => (
                      <AnnouncementCard key={a.id} announcement={a} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {todayAnnouncements.length === 0 && Object.keys(groupedByDate).length === 0 && (
        <Card className="p-8 text-center">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No announcements yet</p>
        </Card>
      )}
    </div>
  );
}
