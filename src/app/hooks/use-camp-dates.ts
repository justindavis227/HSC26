import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function useCampDates() {
  const [startDate, setStartDate] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('camp_info')
      .select('value')
      .eq('key', 'camp_start_date')
      .maybeSingle()
      .then(({ data }) => setStartDate(data?.value ?? null));
  }, []);

  function getDate(day: string): Date | null {
    if (!startDate) return null;
    const idx = WEEK_DAYS.indexOf(day);
    if (idx === -1) return null;
    const [y, m, d] = startDate.split('-').map(Number);
    return new Date(y, m - 1, d + idx);
  }

  // "Monday Jun 29"
  function dayLabel(day: string): string {
    const date = getDate(day);
    if (!date) return day;
    return `${day} ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  // "Mon Jun 29"
  function shortDayLabel(day: string): string {
    const date = getDate(day);
    if (!date) return day.slice(0, 3);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  return { startDate, dayLabel, shortDayLabel };
}
