const STORAGE_KEY = "lovebomb:catalog";
const MAX_ENTRIES = 50;

export interface CatalogEntry {
  id: string;
  name: string;
  confidence: number;
  timestamp: number;
}

export function getCatalog(): CatalogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToCatalog(entry: Omit<CatalogEntry, "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const catalog = getCatalog();

    // Deduplicate by name (case-insensitive)
    const filtered = catalog.filter(
      (e) => e.name.toLowerCase() !== entry.name.toLowerCase()
    );

    // Add new entry at the front
    const updated = [
      { ...entry, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_ENTRIES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function clearCatalog(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}
