import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export function usePageTitle(pageKey: string, defaults: { title: string; subtitle?: string }) {
  const [title, setTitle]       = useState(defaults.title);
  const [subtitle, setSubtitle] = useState(defaults.subtitle ?? '');

  useEffect(() => {
    supabase
      .from('camp_info')
      .select('key,value')
      .in('key', [`page_title_${pageKey}`, `page_subtitle_${pageKey}`])
      .then(({ data }) => {
        (data ?? []).forEach(r => {
          if (r.key === `page_title_${pageKey}`    && r.value) setTitle(r.value);
          if (r.key === `page_subtitle_${pageKey}` && r.value) setSubtitle(r.value);
        });
      });
  }, [pageKey]);

  return { title, subtitle };
}
