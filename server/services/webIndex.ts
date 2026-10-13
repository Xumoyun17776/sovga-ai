/**
 * Every real product found in a live store search is remembered here (data/liveProducts.json):
 * name, store, direct link, latest price and a short price history.
 * The catalog of real products grows with each search, and searches still return
 * recently-checked real products when a store's API is slow or down.
 */
import fs from "fs";
import path from "path";
import type { StoreItem } from "./liveStores.js";
import { rankByRelevance } from "./searchRelevance.js";

export interface IndexedProduct {
  title: string;
  store: string;
  url: string;
  price: number;
  oldPrice?: number | null;
  imageUrl?: string | null;
  category?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  firstSeen: number;
  lastSeen: number;
  /** [timestamp, price] pairs, newest last, at most 30 */
  history: Array<[number, number]>;
}

const FILE = path.resolve(process.cwd(), "data", "liveProducts.json");
const MAX_ITEMS = 20000;
let items = new Map<string, IndexedProduct>();
let saveTimer: NodeJS.Timeout | null = null;

try {
  if (fs.existsSync(FILE)) {
    const arr: IndexedProduct[] = JSON.parse(fs.readFileSync(FILE, "utf8"));
    if (Array.isArray(arr)) items = new Map(arr.map((p) => [p.url, p]));
  }
} catch (e: any) {
  console.warn("[WebIndex] could not read liveProducts.json:", e?.message);
}

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      if (items.size > MAX_ITEMS) {
        const sorted = [...items.values()].sort((a, b) => b.lastSeen - a.lastSeen).slice(0, MAX_ITEMS);
        items = new Map(sorted.map((p) => [p.url, p]));
      }
      fs.mkdirSync(path.dirname(FILE), { recursive: true });
      const tmp = `${FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify([...items.values()]));
      fs.renameSync(tmp, FILE);
    } catch (e: any) {
      console.warn("[WebIndex] save failed:", e?.message);
    }
  }, 5000);
}

/** Remember real, priced listings (store API results and AI results whose page price was confirmed). */
export function rememberProducts(found: Array<StoreItem & { verified?: boolean }>) {
  const now = Date.now();
  let changed = false;
  for (const it of found) {
    const trusted = it.source === "store-api" || it.verified === true;
    if (!trusted || !it.url || !it.price) continue;
    const prev = items.get(it.url);
    if (prev) {
      if (prev.price !== it.price) prev.history = [...prev.history, [now, it.price] as [number, number]].slice(-30);
      Object.assign(prev, {
        title: it.title,
        price: it.price,
        oldPrice: it.oldPrice ?? prev.oldPrice ?? null,
        imageUrl: it.imageUrl || prev.imageUrl || null,
        category: it.category || prev.category || null,
        rating: it.rating ?? prev.rating ?? null,
        reviewCount: it.reviewCount ?? prev.reviewCount ?? null,
        lastSeen: now,
      });
    } else {
      items.set(it.url, {
        title: it.title,
        store: it.store,
        url: it.url,
        price: it.price,
        oldPrice: it.oldPrice ?? null,
        imageUrl: it.imageUrl || null,
        category: it.category || null,
        rating: it.rating ?? null,
        reviewCount: it.reviewCount ?? null,
        firstSeen: now,
        lastSeen: now,
        history: [[now, it.price]],
      });
    }
    changed = true;
  }
  if (changed) scheduleSave();
}

/** Recently seen real products that match a query (newer than maxAgeDays). */
export function searchIndex(query: string, maxAgeDays = 14, limit = 20): Array<StoreItem & { lastSeen: number }> {
  const cutoff = Date.now() - maxAgeDays * 86400000;
  const fresh = [...items.values()].filter((p) => p.lastSeen >= cutoff);
  if (!fresh.length) return [];
  const ranked = rankByRelevance(query, fresh, (p) => ({ name: p.title, description: p.category || null }), { maxRelated: 0 });
  return ranked.slice(0, limit).map(({ item: p }) => ({
    title: p.title,
    store: p.store,
    url: p.url,
    price: p.price,
    oldPrice: p.oldPrice ?? null,
    imageUrl: p.imageUrl ?? null,
    rating: p.rating ?? null,
    reviewCount: p.reviewCount ?? null,
    category: p.category ?? null,
    source: "web-index" as const,
    lastSeen: p.lastSeen,
  }));
}

export function priceHistoryFor(url: string): Array<[number, number]> {
  return items.get(url)?.history || [];
}

export function webIndexStats() {
  const stores: Record<string, number> = {};
  let newest = 0;
  for (const p of items.values()) {
    stores[p.store] = (stores[p.store] || 0) + 1;
    if (p.lastSeen > newest) newest = p.lastSeen;
  }
  return { products: items.size, stores, lastUpdated: newest ? new Date(newest).toISOString() : null };
}
