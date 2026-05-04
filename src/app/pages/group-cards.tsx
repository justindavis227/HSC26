import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { GroupCardContent } from '../../lib/supabase';
import { getCached, cachedFetch, TTL } from '../../lib/query-cache';
import { usePageTitle } from '../hooks/use-page-title';

export function GroupCardsPage() {
  const [cards, setCards] = useState<GroupCardContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [cardIndex, setCardIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const { title, subtitle } = usePageTitle('groups', {
    title: 'Group Cards',
    subtitle: 'Daily small group activity cards',
  });

  useEffect(() => {
    const cached = getCached<GroupCardContent[]>('group_cards_content');
    if (cached) { setCards(cached); setLoading(false); }

    cachedFetch(
      'group_cards_content',
      async () => {
        const { data } = await supabase
          .from('group_cards_content')
          .select('id, day_number, card_number, label, content, content_color, label_color, bg_color, sort_order')
          .order('day_number')
          .order('sort_order');
        return data;
      },
      TTL.GROUP_CARDS,
    ).then(data => {
      if (data) setCards(data);
      setLoading(false);
    });
  }, []);

  const days = [...new Set(cards.map(c => c.day_number))].sort((a, b) => a - b);
  const dayCards = cards.filter(c => c.day_number === activeDay).sort((a, b) => a.sort_order - b.sort_order);
  const current = dayCards[cardIndex];

  function selectDay(day: number) {
    setActiveDay(day);
    setCardIndex(0);
  }

  function goTo(idx: number) {
    if (idx === cardIndex || idx < 0 || idx >= dayCards.length) return;
    setFading(true);
    setTimeout(() => { setCardIndex(idx); setFading(false); }, 150);
  }

  function navigate(dir: 'prev' | 'next') {
    goTo(dir === 'next' ? cardIndex + 1 : cardIndex - 1);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) navigate(delta > 0 ? 'next' : 'prev');
    touchStartX.current = null;
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1>{title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
      </div>

      {loading && (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading…</div>
      )}

      {!loading && days.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          Group cards will appear here once added by the admin.
        </div>
      )}

      {!loading && days.length > 0 && (
        <>
          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map(day => (
              <button
                key={day}
                onClick={() => selectDay(day)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                  activeDay === day
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-foreground hover:border-primary'
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>

          {/* Card */}
          {current && (
            <div
              className={`rounded-2xl overflow-hidden flex flex-col transition-opacity duration-150 ${fading ? 'opacity-0' : 'opacity-100'}`}
              style={{ backgroundColor: current.bg_color, height: '340px' }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {/* Label bar */}
              <div className="px-5 py-3 shrink-0" style={{ backgroundColor: current.label_color }}>
                <p className="font-bold text-base leading-snug text-white">{current.label}</p>
              </div>
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-5">
                <div
                  className="rich-text text-sm leading-relaxed"
                  style={{ color: current.content_color }}
                  dangerouslySetInnerHTML={{ __html: current.content }}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          {dayCards.length > 0 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('prev')}
                disabled={cardIndex === 0}
                className="p-2 rounded-lg border border-border disabled:opacity-30 hover:border-primary transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5">
                {dayCards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`rounded-full transition-all duration-150 ${
                      i === cardIndex
                        ? 'w-4 h-2 bg-primary'
                        : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => navigate('next')}
                disabled={cardIndex === dayCards.length - 1}
                className="p-2 rounded-lg border border-border disabled:opacity-30 hover:border-primary transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
