const STORAGE_KEY = 'camp-read-announcements';

export function getReadAnnouncements(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function markAllAnnouncementsAsRead(announcementIds: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(announcementIds));
}

export function getUnreadCount(allAnnouncements: Array<{ id: string }>): number {
  const read = getReadAnnouncements();
  return allAnnouncements.filter((a) => !read.includes(a.id)).length;
}
