import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { GroupCardDeck, GroupCardItem } from '../../lib/supabase';
import { getCached, cachedFetch, TTL } from '../../lib/query-cache';

export function GroupCardsPage() {
  const [decks, setDecks] = useState<GroupCardDeck[]>([]);
  const [allItems, setAllItems] = useState<GroupCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  // viewer state
  const [viewerDeck, setViewerDeck] = useState<GroupCardDeck | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [fading, setFading] = useState(false);

  const touchRef = useRef({ startX: 0, didSwipe: false });

  useEffect(() => {
    let cancelled = false;
    const cachedDecks = getCached<GroupCardDeck[]>('group_card_decks');
    const cachedItems = getCached<GroupCardItem[]>('group_card_items_all');
    if (cachedDecks) setDecks(cachedDecks);
    if (cachedItems) setAllItems(cachedItems);
    if (cachedDecks && cachedItems) setLoading(false);

    Promise.all([
      cachedFetch('group_card_decks', async () => {
        const { data } = await supabase
          .from('group_card_decks')
          .select('id, title, session_label, day_number, session_type, sort_order, bar_color')
          .order('sort_order');
        return data;
      }, TTL.GROUP_CARDS),
      cachedFetch('group_card_items_all', async () => {
        const { data } = await supabase
          .from('group_card_items')
          .select('id, deck_id, title, subtitle, content, bg_color, sort_order')
          .order('sort_order');
        return data;
      }, TTL.GROUP_CARDS),
    ]).then(([decksData, itemsData]) => {
      if (cancelled) return;
      if (decksData) setDecks(decksData);
      if (itemsData) setAllItems(itemsData);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  // card counts per deck for thumbnails
  const itemCounts: Record<string, number> = {};
  allItems.forEach(item => {
    itemCounts[item.deck_id] = (itemCounts[item.deck_id] ?? 0) + 1;
  });

  const viewerItems = viewerDeck
    ? allItems.filter(i => i.deck_id === viewerDeck.id).sort((a, b) => a.sort_order - b.sort_order)
    : [];
  const currentItem = viewerItems[cardIndex];
  const isLast = cardIndex === viewerItems.length - 1;

  function openDeck(deck: GroupCardDeck) {
    setViewerDeck(deck);
    setCardIndex(0);
    setIsFlipped(false);
    setFading(false);
  }

  function closeDeck() {
    setViewerDeck(null);
    setIsFlipped(false);
  }

  function navigate(dir: 'prev' | 'next') {
    const newIdx = dir === 'next' ? cardIndex + 1 : cardIndex - 1;
    if (newIdx < 0 || newIdx >= viewerItems.length) return;
    setFading(true);
    setIsFlipped(false);
    setTimeout(() => { setCardIndex(newIdx); setFading(false); }, 200);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchRef.current = { startX: e.touches[0].clientX, didSwipe: false };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = touchRef.current.startX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) {
      touchRef.current.didSwipe = true;
      navigate(dx > 0 ? 'next' : 'prev');
    }
  }

  function handleCardClick() {
    if (!touchRef.current.didSwipe) setIsFlipped(f => !f);
    touchRef.current.didSwipe = false;
  }

  function deckDisplayTitle(title: string) {
    return title.replace(/^Day\s+\d+\s*[–—-]\s*/i, '');
  }

  const DAY_LABELS: Record<number, string> = {
    0: 'Pre-Camp',
    1: 'Day 1',
    2: 'Day 2',
    3: 'Day 3',
    4: 'Day 4',
    5: 'Day 5',
  };

  const deckGroups: Record<number, GroupCardDeck[]> = {};
  decks.forEach(deck => {
    if (!deckGroups[deck.day_number]) deckGroups[deck.day_number] = [];
    deckGroups[deck.day_number].push(deck);
  });
  const sortedDays = Object.keys(deckGroups).map(Number).sort((a, b) => a - b);

  return (
    <>
      <div className="p-4 space-y-4">
        <div>
          <h1>Group Cards</h1>
          <p className="text-muted-foreground mt-1 text-sm">Tap a deck to open</p>
        </div>

        {loading && <div className="text-center py-12 text-sm text-muted-foreground">Loading…</div>}

        {!loading && (
          <div className="space-y-5">
            {sortedDays.map(day => (
              <div key={day}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground shrink-0">
                    {DAY_LABELS[day] ?? `Day ${day}`}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {deckGroups[day].map(deck => (
                    <button
                      key={deck.id}
                      onClick={() => openDeck(deck)}
                      className="text-left rounded-2xl overflow-hidden transition-all active:scale-95 hover:brightness-110"
                      style={{
                        background: `linear-gradient(135deg, ${deck.bar_color}28 0%, ${deck.bar_color}10 100%), #1a1a2e`,
                        border: `1.5px solid ${deck.bar_color}40`,
                      }}
                    >
                      <div className="p-4">
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                          {deck.session_label}
                        </p>
                        <p style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.3 }}>
                          {deckDisplayTitle(deck.title)}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.7rem', marginTop: '0.6rem', fontWeight: 500 }}>
                          {itemCounts[deck.id] != null ? `${itemCounts[deck.id]} cards` : '…'}
                        </p>
                      </div>
                      <div className="h-1" style={{ backgroundColor: deck.bar_color }} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Full-screen card viewer ── */}
      {viewerDeck && currentItem && (
        <div
          className="fixed inset-0 z-[999] flex flex-col bg-black"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header */}
          <div className="px-4 pt-10 pb-2 shrink-0">
            <button
              onClick={closeDeck}
              className="flex items-center gap-1 text-white/50 hover:text-white/80 transition text-xs font-medium mb-2"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Group Cards
            </button>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-white font-semibold text-sm truncate">{viewerDeck.title}</p>
                <p className="text-white/40 text-xs truncate">{viewerDeck.session_label}</p>
              </div>
              <button
                onClick={closeDeck}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Flip card */}
          <div className="flex-1 flex items-center justify-center px-4 pb-2 min-h-0">
            <div
              className="w-full max-w-sm cursor-pointer select-none"
              style={{ perspective: '1200px', height: 'min(530px, 72vh)' }}
              onClick={handleCardClick}
            >
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
                transition: fading ? 'opacity 0.2s' : 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                opacity: fading ? 0 : 1,
              }}>

                {/* FRONT */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  borderRadius: '1.5rem',
                  backgroundColor: currentItem.bg_color,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  textAlign: 'center',
                  gap: '0.5rem',
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Card {cardIndex + 1} of {viewerItems.length}
                  </span>
                  <h2 style={{ color: 'white', fontSize: '2.25rem', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.025em', marginTop: '0.5rem' }}>
                    {currentItem.title}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', fontWeight: 500, marginTop: '0.25rem' }}>
                    {currentItem.subtitle}
                  </p>
                  <div style={{
                    marginTop: '1.75rem',
                    padding: '0.5rem 1.5rem',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    Tap to reveal
                  </div>
                </div>

                {/* BACK */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  borderRadius: '1.5rem',
                  backgroundColor: currentItem.bg_color,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                }}>
                  <div style={{ marginBottom: '0.875rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      {currentItem.subtitle}
                    </p>
                    <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                      {currentItem.title}
                    </h3>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                    <div
                      className="card-content"
                      style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.875rem', lineHeight: 1.65 }}
                      dangerouslySetInnerHTML={{ __html: currentItem.content }}
                    />
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '0.875rem', flexShrink: 0 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.35rem 1rem',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '9999px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}>
                      Tap to flip
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Navigation row */}
          <div className="flex items-center justify-between px-4 pb-10 pt-2 shrink-0">
            <button
              onClick={() => navigate('prev')}
              disabled={cardIndex === 0}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold disabled:opacity-20 hover:bg-white/20 active:scale-95 transition"
            >
              <ChevronLeft className="w-4 h-4" />Back
            </button>

            <div className="flex items-center gap-1.5">
              {viewerItems.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: i === cardIndex ? 20 : 6,
                    height: 6,
                    backgroundColor: i === cardIndex ? 'white' : 'rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => isLast ? closeDeck() : navigate('next')}
              className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition ${
                isLast ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isLast ? 'Done' : <>Next<ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
