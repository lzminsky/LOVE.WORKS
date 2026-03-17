import { useState, useEffect } from "react";

let cached: { count: number; fetchedAt: number } | null = null;
const STALE_MS = 60_000; // 1 minute

export function useCounter() {
  const [count, setCount] = useState<number>(cached?.count ?? 0);
  const [isLoaded, setIsLoaded] = useState(!!cached);

  useEffect(() => {
    // If cache is fresh, skip fetch entirely
    if (cached && Date.now() - cached.fetchedAt < STALE_MS) {
      setCount(cached.count);
      setIsLoaded(true);
      return;
    }

    async function fetchCount() {
      try {
        const res = await fetch("/api/counter");
        if (res.ok) {
          const data = await res.json();
          cached = { count: data.count, fetchedAt: Date.now() };
          setCount(data.count);
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoaded(true);
      }
    }
    fetchCount();
  }, []);

  return { count, isLoaded };
}
