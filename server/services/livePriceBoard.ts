/**
 * Live price board for the homepage.
 *
 * Checks a short watch-list of popular products directly against the stores' public
 * search APIs (see liveStores.ts), keeps only listings that are clearly the same model,
 * and reports the cheapest in-stock offer per store plus the time of the check.
 * Nothing here is made up: if the stores can't be reached the board says so
 * (live: false) and the client shows an explicitly labelled example instead.
 */
import { searchOlcha, searchTexnomart, type StoreItem } from "./liveStores.js";

interface WatchItem {
  id: string;
  name: string;
  short: string;
  query: string;
  /** Every pattern must match the listing title. */
  must: RegExp[];
  /** Listing is rejected if this matches. */
  not?: RegExp;
}

const WATCHLIST: WatchItem[] = [
  { id: "galaxy-a55", name: "Samsung Galaxy A55 8/128GB", short: "Galaxy A55", query: "Galaxy A55", must: [/galaxy\s*a55\b/i, /\b8\s*\/\s*128/i] },
  { id: "airpods-4", name: "Apple AirPods 4", short: "AirPods 4", query: "AirPods 4", must: [/airpods\s*4\b/i], not: /noise|\banc\b|shovqin|pro\b/i },
  { id: "jbl-flip-6", name: "JBL Flip 6", short: "JBL Flip 6", query: "JBL Flip 6", must: [/jbl\s*flip\s*6\b/i] },
  { id: "galaxy-a26", name: "Samsung Galaxy A26 6/128GB", short: "Galaxy A26", query: "Galaxy A26", must: [/galaxy\s*a26\b/i, /\b6\s*\/\s*128/i] },
  { id: "iphone-17-pro", name: "Apple iPhone 17 Pro 256GB", short: "iPhone 17 Pro", query: "iPhone 17 Pro", must: [/iphone\s*17\s*pro\b/i, /\b256\s*gb?\b|\/\s*256/i], not: /max/i },
  { id: "jbl-go-4", name: "JBL Go 4", short: "JBL Go 4", query: "JBL Go 4", must: [/jbl\s*go\s*4\b/i] },
  { id: "band-9", name: "Xiaomi Smart Band 9", short: "Smart Band 9", query: "Smart Band 9", must: [/(smart|mi)\s*band\s*9\b/i], not: /\bpro\b|active|tasma|strap|ремешок/i },
];

/** Extra gift-friendly searches used only to find real store discounts for the "price drops" strip. */
const DEAL_QUERIES = ["simsiz quloqchin", "smart soat", "portativ kolonka", "soch feni", "kofe mashinasi"];

const ACCESSORY = /himoya|oynasi|chexol|g[‘'`ʻ]?ilof|plyonka|plenka|qopqoq|cover|kabel|adapter|zaryadlovchi|ремешок|tasma|strap/i;

const TTL_MS = 20 * 60 * 1000;

export interface BoardOffer {
  store: string;
  title: string;
  price: number;
  oldPrice: number | null;
  url: string;
}

export interface BoardProduct {
  id: string;
  name: string;
  short: string;
  image: string | null;
  offers: BoardOffer[]; // sorted cheapest first
  lowest: number;
  highest: number;
  savings: number;
  savingsPct: number;
}

export interface BoardDrop {
  store: string;
  title: string;
  price: number;
  oldPrice: number;
  pct: number;
  url: string;
  image: string | null;
  category: string | null;
}

export interface LivePriceBoard {
  live: boolean;
  checkedAt: string | null;
  storesChecked: string[];
  listingsScanned: number;
  products: BoardProduct[];
  drops: BoardDrop[];
}

let cache: { at: number; board: LivePriceBoard } | null = null;
let inflight: Promise<LivePriceBoard> | null = null;

function cheapestPerStore(items: StoreItem[], w: WatchItem): BoardOffer[] {
  const best = new Map<string, StoreItem>();
  for (const it of items) {
    if (it.inStock === false) continue;
    if (!w.must.every((re) => re.test(it.title))) continue;
    if (w.not && w.not.test(it.title)) continue;
    if (ACCESSORY.test(it.title)) continue;
    const cur = best.get(it.store);
    if (!cur || it.price < cur.price) best.set(it.store, it);
  }
  return [...best.values()]
    .map((it) => ({ store: it.store, title: it.title, price: it.price, oldPrice: it.oldPrice ?? null, url: it.url }))
    .sort((a, b) => a.price - b.price);
}

async function build(): Promise<LivePriceBoard> {
  const searchBoth = async (q: string) => {
    const [o, t] = await Promise.all([searchOlcha(q).catch(() => []), searchTexnomart(q).catch(() => [])]);
    return { o, t };
  };

  const watchResults = await Promise.all(WATCHLIST.map((w) => searchBoth(w.query)));
  const dealResults = await Promise.all(DEAL_QUERIES.map((q) => searchBoth(q)));

  const storesResponded = new Set<string>();
  let listingsScanned = 0;
  for (const r of [...watchResults, ...dealResults]) {
    if (r.o.length) storesResponded.add("Olcha");
    if (r.t.length) storesResponded.add("Texnomart");
    listingsScanned += r.o.length + r.t.length;
  }

  const products: BoardProduct[] = [];
  const dropCandidates: StoreItem[] = [];
  WATCHLIST.forEach((w, i) => {
    const all = [...watchResults[i].o, ...watchResults[i].t];
    const offers = cheapestPerStore(all, w);
    for (const it of all) {
      if (w.must.every((re) => re.test(it.title)) && !(w.not && w.not.test(it.title))) dropCandidates.push(it);
    }
    if (offers.length < 2) return;
    const lowest = offers[0].price;
    const highest = offers[offers.length - 1].price;
    if (highest <= lowest) return;
    // A gap this large on "the same model" usually means a bundle or a different variant slipped through.
    if ((highest - lowest) / highest > 0.4) return;
    const img = all.find((it) => it.url === offers[0].url)?.imageUrl || all.find((it) => it.imageUrl && offers.some((o) => o.url === it.url))?.imageUrl || null;
    products.push({
      id: w.id,
      name: w.name,
      short: w.short,
      image: img,
      offers,
      lowest,
      highest,
      savings: highest - lowest,
      savingsPct: Math.round(((highest - lowest) / highest) * 100),
    });
  });

  for (const r of dealResults) dropCandidates.push(...r.o, ...r.t);

  const seen = new Set<string>();
  const drops: BoardDrop[] = dropCandidates
    .filter((it) => it.oldPrice && it.oldPrice > it.price && it.price >= 150_000 && it.inStock !== false && !ACCESSORY.test(it.title) && it.imageUrl)
    .map((it) => ({
      store: it.store,
      title: it.title,
      price: it.price,
      oldPrice: it.oldPrice as number,
      pct: Math.round((1 - it.price / (it.oldPrice as number)) * 100),
      url: it.url,
      image: it.imageUrl || null,
      category: it.category || null,
    }))
    .filter((d) => d.pct >= 5 && d.pct <= 70)
    .sort((a, b) => b.pct - a.pct)
    .filter((d) => (seen.has(d.url) ? false : (seen.add(d.url), true)))
    .slice(0, 12);

  return {
    live: products.length > 0 || drops.length > 0,
    checkedAt: new Date().toISOString(),
    storesChecked: [...storesResponded].sort(),
    listingsScanned,
    products: products.sort((a, b) => b.savingsPct - a.savingsPct),
    drops,
  };
}

const EMPTY: LivePriceBoard = { live: false, checkedAt: null, storesChecked: [], listingsScanned: 0, products: [], drops: [] };

/** Returns the latest successful board (refreshing it when older than 20 minutes). */
export async function getLivePriceBoard(): Promise<LivePriceBoard> {
  const fresh = cache && Date.now() - cache.at < TTL_MS;
  if (fresh) return cache!.board;

  if (!inflight) {
    inflight = build()
      .then((board) => {
        if (board.live) cache = { at: Date.now(), board };
        return board.live ? board : cache?.board ?? EMPTY;
      })
      .catch(() => cache?.board ?? EMPTY)
      .finally(() => {
        inflight = null;
      });
  }
  // A stale board (with its honest, older checkedAt) is better than making the visitor wait.
  if (cache) return cache.board;
  return inflight;
}

/** Warm the cache shortly after boot so the first visitor doesn't wait. */
export function warmLivePriceBoard() {
  setTimeout(() => {
    getLivePriceBoard().catch(() => {});
  }, 3000);
}
