interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export const TTL = {
  SCHEDULE:     5 * 60 * 1000,
  SPEAKERS:    10 * 60 * 1000,
  FAQS:        10 * 60 * 1000,
  CAMPUS_TIMES: 10 * 60 * 1000,
  ELECTIVES:   10 * 60 * 1000,
  TOURNAMENTS: 10 * 60 * 1000,
  THEMES:      10 * 60 * 1000,
};

/** Returns any cached value for key regardless of freshness (for SWR immediate display). */
export function getCached<T>(key: string): T | null {
  return (store.get(key) as CacheEntry<T> | undefined)?.data ?? null;
}

/**
 * Fetches data with TTL caching.
 * - Fresh cache: returns immediately, no network request.
 * - Stale or empty cache: fetches fresh data and updates the store.
 * - On fetch error: returns stale data if available, otherwise null.
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T | null>,
  ttlMs: number,
): Promise<T | null> {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (entry && now - entry.fetchedAt < ttlMs) {
    return entry.data;
  }

  try {
    const result = await fetcher();
    if (result !== null) {
      store.set(key, { data: result, fetchedAt: now });
      return result;
    }
    return entry ? entry.data : null;
  } catch {
    return entry ? entry.data : null;
  }
}
