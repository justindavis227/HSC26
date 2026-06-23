// Shared logic for the Pre Show video submission window + master override.
// Settings are stored in camp_info (key/value) so staff can edit them from the
// admin panel with no code change. Window timing is pinned to Eastern Time
// (Bloomington, IN observes Eastern), so it does not depend on the device clock.

import { supabase } from '../../lib/supabase';

export type SubmissionMode = 'scheduled' | 'open' | 'closed';

export interface SubmissionSettings {
  openTime: string; // "HH:MM" 24h
  closeTime: string; // "HH:MM" 24h
  mode: SubmissionMode;
}

// Defaults match the original hardcoded behavior (11:00–15:00, scheduled),
// so the public page behaves identically until/unless staff change the settings.
export const DEFAULT_SUBMISSION_SETTINGS: SubmissionSettings = {
  openTime: '11:00',
  closeTime: '15:00',
  mode: 'scheduled',
};

export const SUBMISSION_SETTING_KEYS = {
  openTime: 'video_open_time',
  closeTime: 'video_close_time',
  mode: 'video_submissions_mode',
} as const;

// Bloomington, IN is in the Eastern time zone (DST-aware → EDT in summer).
const CAMP_TIMEZONE = 'America/Indiana/Indianapolis';

interface CampInfoRow {
  key: string;
  value: string;
}

export async function loadSubmissionSettings(): Promise<SubmissionSettings> {
  const { data } = await supabase
    .from('camp_info')
    .select('key,value')
    .in('key', [
      SUBMISSION_SETTING_KEYS.openTime,
      SUBMISSION_SETTING_KEYS.closeTime,
      SUBMISSION_SETTING_KEYS.mode,
    ]);

  const map: Record<string, string> = {};
  (data ?? []).forEach((row: CampInfoRow) => {
    map[row.key] = row.value;
  });

  const rawMode = map[SUBMISSION_SETTING_KEYS.mode];
  const mode: SubmissionMode =
    rawMode === 'open' || rawMode === 'closed' || rawMode === 'scheduled'
      ? rawMode
      : DEFAULT_SUBMISSION_SETTINGS.mode;

  return {
    openTime: map[SUBMISSION_SETTING_KEYS.openTime] || DEFAULT_SUBMISSION_SETTINGS.openTime,
    closeTime: map[SUBMISSION_SETTING_KEYS.closeTime] || DEFAULT_SUBMISSION_SETTINGS.closeTime,
    mode,
  };
}

export async function saveSubmissionSettings(s: SubmissionSettings): Promise<{ error: string | null }> {
  const now = new Date().toISOString();
  const { error } = await supabase.from('camp_info').upsert(
    [
      { key: SUBMISSION_SETTING_KEYS.openTime, value: s.openTime, updated_at: now },
      { key: SUBMISSION_SETTING_KEYS.closeTime, value: s.closeTime, updated_at: now },
      { key: SUBMISSION_SETTING_KEYS.mode, value: s.mode, updated_at: now },
    ],
    { onConflict: 'key' }
  );
  return { error: error ? error.message : null };
}

function parseHHMM(value: string): number {
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

/** Current wall-clock minutes-since-midnight in camp (Eastern) time. */
export function nowMinutesEastern(d: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CAMP_TIMEZONE,
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return h * 60 + m;
}

/** Today's calendar date in camp (Eastern) time. */
export function todayEastern(d: Date = new Date()): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CAMP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  return {
    year: Number(parts.find((p) => p.type === 'year')?.value ?? '0'),
    month: Number(parts.find((p) => p.type === 'month')?.value ?? '0'),
    day: Number(parts.find((p) => p.type === 'day')?.value ?? '0'),
  };
}

export type WindowStatus =
  | 'open' // accepting submissions
  | 'before-window' // scheduled, during camp, but outside today's daily window
  | 'mode-closed' // forced closed
  | 'before-camp' // scheduled, but camp hasn't started yet
  | 'after-camp'; // scheduled, but camp has ended

export interface WindowState {
  isOpen: boolean;
  minsUntilOpen: number; // meaningful only in scheduled mode while closed
  status: WindowStatus;
}

export interface CampDates {
  startDate?: string | null; // "YYYY-MM-DD"
  endDate?: string | null; // "YYYY-MM-DD"
}

/** "YYYY-MM-DD" -> comparable integer (e.g. 20260629), or null if unset/invalid. */
function ymdToNum(value?: string | null): number | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return y * 10000 + m * 100 + d;
}

/** Today's date in camp (Eastern) time as a comparable integer. */
function easternYmdNum(d: Date): number {
  const t = todayEastern(d);
  return t.year * 10000 + t.month * 100 + t.day;
}

// Force Open and Force Closed are master overrides — they ignore both the daily
// window and the camp dates. Scheduled follows the daily window AND only runs on
// camp days (camp_start_date..camp_end_date, inclusive) when those are provided.
export function evaluateWindow(
  s: SubmissionSettings,
  camp: CampDates = {},
  d: Date = new Date()
): WindowState {
  if (s.mode === 'open') return { isOpen: true, minsUntilOpen: 0, status: 'open' };
  if (s.mode === 'closed') return { isOpen: false, minsUntilOpen: 0, status: 'mode-closed' };

  // Scheduled: gate by camp dates first.
  const today = easternYmdNum(d);
  const start = ymdToNum(camp.startDate);
  const end = ymdToNum(camp.endDate);
  if (start !== null && today < start) return { isOpen: false, minsUntilOpen: 0, status: 'before-camp' };
  if (end !== null && today > end) return { isOpen: false, minsUntilOpen: 0, status: 'after-camp' };

  // Within camp (or no camp dates set): apply the daily window.
  const now = nowMinutesEastern(d);
  const open = parseHHMM(s.openTime);
  const close = parseHHMM(s.closeTime);
  const isOpen = now >= open && now < close;
  let minsUntilOpen = 0;
  if (!isOpen) minsUntilOpen = now < open ? open - now : 1440 - now + open;
  return { isOpen, minsUntilOpen, status: isOpen ? 'open' : 'before-window' };
}

/** "11:00" -> "11:00 AM", "16:30" -> "4:30 PM" */
export function formatHHMMLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}:00 ${period}` : `${h12}:${String(m).padStart(2, '0')} ${period}`;
}
