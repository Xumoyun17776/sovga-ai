/**
 * Live catalog: real listings pulled from the stores' public search APIs
 * (Olcha, Texnomart), grouped into gift-friendly categories.
 *
 * Every item has the store's own photo, current price, old price (only when the
 * store itself shows one), link to the product page and the time it was checked.
 * Refreshed every 45 minutes; the last good copy is kept on disk so a restart
 * doesn't leave the catalog empty.
 */
import fs from "fs";
import path from "path";
import { searchOlcha, searchTexnomart, type StoreItem } from "./liveStores.js";

interface CategoryDef {
  key: string;
  icon: string;
  uz: string;
  ru: string;
  en: string;
  queries: string[];
  /** Listing must match (title or store category). */
  must?: RegExp;
}

const CATEGORIES: CategoryDef[] = [
  { key: "Smartphones", icon: "📱", uz: "Smartfonlar", ru: "Смартфоны", en: "Smartphones", queries: ["smartfon", "iphone", "samsung galaxy"], must: /smartfon|iphone|galaxy|redmi|xiaomi|honor|tecno|infinix|poco|realme|vivo|oppo|pixel|смартфон/i },
  { key: "Laptops", icon: "💻", uz: "Noutbuklar", ru: "Ноутбуки", en: "Laptops", queries: ["noutbuk", "macbook"], must: /noutbuk|macbook|laptop|ноутбук|ideapad|vivobook|zenbook|thinkpad|pavilion|aspire|ultrabook/i },
  { key: "Tablets", icon: "📲", uz: "Planshetlar", ru: "Планшеты", en: "Tablets", queries: ["planshet", "ipad"], must: /planshet|ipad|tab\b|pad\b|планшет|matepad/i },
  { key: "Audio", icon: "🎧", uz: "Quloqchin va kolonkalar", ru: "Наушники и колонки", en: "Headphones & speakers", queries: ["simsiz quloqchin", "portativ kolonka", "airpods"], must: /quloqchin|kolonka|airpods|buds|headphone|наушник|колонк|jbl|marshall|minigarnitura|dinamik|speaker/i },
  { key: "Wearables", icon: "⌚", uz: "Aqlli soatlar", ru: "Умные часы", en: "Smartwatches", queries: ["smart soat", "apple watch", "fitnes bilaguzuk"], must: /soat|watch|band|bilaguzuk|часы|браслет/i },
  { key: "TV", icon: "📺", uz: "Televizorlar", ru: "Телевизоры", en: "TVs", queries: ["televizor"], must: /televizor|телевизор|\btv\b|qled|oled/i },
  { key: "Beauty", icon: "💇", uz: "Go'zallik va parvarish", ru: "Красота и уход", en: "Beauty & care", queries: ["soch feni", "stayler", "elektr ustara", "epilyator"], must: /fen|stayler|styler|ustara|soqol|epilyator|trimmer|ployka|airwrap|soch|фен|бритв|эпилятор|триммер/i },
  { key: "Kitchen", icon: "☕", uz: "Oshxona texnikasi", ru: "Техника для кухни", en: "Kitchen appliances", queries: ["kofe mashinasi", "blender", "aerogril", "elektr choynak"], must: /kofe|qahva|blender|aerogril|air ?fryer|choynak|multivarka|mikser|кофе|блендер|чайник|мультиварк|аэрогрил|fritur/i },
  { key: "Home", icon: "🏠", uz: "Uy uchun", ru: "Для дома", en: "Home", queries: ["robot changyutgich", "changyutgich", "havo tozalagich"], must: /changyutgich|tozalagich|пылесос|очистител|vacuum/i },
  { key: "Gaming", icon: "🎮", uz: "O'yinlar", ru: "Игры", en: "Gaming", queries: ["playstation", "geympad", "nintendo"], must: /playstation|ps5|geympad|gamepad|dualsense|joystick|joystisk|nintendo|xbox|konsol/i },
];

const ACCESSORY = /himoya|oynasi|chexol|g[‘'`ʻ]?ilof|plyonka|plenka|qopqoq|kabel|adapter|zaryadlovchi|ремешок|tasma|strap|чехол|стекло|кабель|filtr\b|фильтр|qism|запчаст|держатель|ushlagich|stilus|сумка|sumka|подставка|ohak|descal|tozalash vosita|vositasi|pristavka|tv stick|kartrij|картридж|средство|meshok|мешок|nasadka|насадк|zapas|qopcha/i;

const TTL_MS = 45 * 60 * 1000;
const CACHE_FILE = path.resolve(process.cwd(), "data", "live-catalog.json");

export interface LiveCatalogItem {
  id: number;
  name: string;
  category: string;
  brand: string | null;
  imageUrl: string | null;
  description: null;
  specs: Record<string, string>;
  url: string;
  price: number;
  originalPrice: number | null;
  currency: "UZS";
  store: string;
  discount: string | null;
  discountPct: number;
  availability: string | null;
  rating: number | null;
  reviewCount: number | null;
  verified: boolean;
  installment: string | null;
  live: true;
  checkedAt: string;
  offers: any[];
}

interface Snapshot {
  checkedAt: string;
  items: LiveCatalogItem[];
}

let snap: Snapshot | null = null;
let refreshing: Promise<void> | null = null;

const BRANDS = ["Apple", "Samsung", "Xiaomi", "Redmi", "Poco", "Honor", "Huawei", "Tecno", "Infinix", "Realme", "Vivo", "Oppo", "Google", "Lenovo", "Asus", "Acer", "HP", "Dell", "MSI", "JBL", "Marshall", "Sony", "Philips", "Braun", "Dyson", "Tefal", "Bosch", "Artel", "LG", "TCL", "Hisense", "Haier", "Polaris", "Redmond", "De'Longhi", "DeLonghi", "Rowenta", "Remington", "Panasonic", "Nintendo", "Microsoft", "Logitech", "Amazfit", "Huawei", "Garmin", "Anker", "Baseus", "Hoco", "Ninja", "Kitfort", "Scarlett", "Vitek", "Roborock", "Dreame", "Tineco"];

function brandOf(title: string): string | null {
  const t = title.toLowerCase();
  for (const b of BRANDS) {
    const re = new RegExp(`(^|[^a-z])${b.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i");
    if (re.test(t)) return b === "DeLonghi" ? "De'Longhi" : b;
  }
  return null;
}

/** Stable positive id from the product URL (kept far away from the database ids). */
function idOf(url: string): number {
  let h = 2166136261;
  for (let i = 0; i < url.length; i++) {
    h ^= url.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 100_000_000 + (Math.abs(h) % 800_000_000);
}

function toItem(it: StoreItem, cat: CategoryDef, checkedAt: string): LiveCatalogItem {
  const pct = it.oldPrice && it.oldPrice > it.price ? Math.round((1 - it.price / it.oldPrice) * 100) : 0;
  const specs: Record<string, string> = {};
  if (it.warrantyMonths) specs["Kafolat"] = `${it.warrantyMonths} oy`;
  if (it.category) specs["Do'kon toifasi"] = it.category;
  const offer = {
    id: idOf(it.url),
    productId: idOf(it.url),
    store: it.store,
    price: it.price,
    originalPrice: pct > 0 ? (it.oldPrice ?? null) : null,
    discount: pct > 0 ? `${pct}% off` : null,
    url: it.url,
    availability: it.inStock === false ? "Mavjud emas" : "Do'konda mavjud",
    rating: it.rating ?? null,
    reviewCount: it.reviewCount ?? null,
    verified: true,
    isLowestPrice: true,
    deliveryTime: null,
    installment: it.installment ?? null,
    currency: "UZS",
    lastChecked: checkedAt,
  };
  return {
    id: idOf(it.url),
    name: it.title,
    category: cat.key,
    brand: brandOf(it.title),
    imageUrl: it.imageUrl || null,
    description: null,
    specs,
    url: it.url,
    price: it.price,
    originalPrice: offer.originalPrice,
    currency: "UZS",
    store: it.store,
    discount: offer.discount,
    discountPct: pct,
    availability: offer.availability,
    rating: it.rating ?? null,
    reviewCount: it.reviewCount ?? null,
    verified: true,
    installment: it.installment ?? null,
    live: true,
    checkedAt,
    offers: [offer],
  };
}

async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const k = i++;
        out[k] = await fn(items[k]);
      }
    })
  );
  return out;
}

async function build(): Promise<Snapshot | null> {
  const checkedAt = new Date().toISOString();
  const jobs: { cat: CategoryDef; q: string; store: "o" | "t" }[] = [];
  for (const cat of CATEGORIES) for (const q of cat.queries) jobs.push({ cat, q, store: "o" }, { cat, q, store: "t" });

  const results = await pool(jobs, 6, async (j) => {
    const list = await (j.store === "o" ? searchOlcha(j.q) : searchTexnomart(j.q)).catch(() => [] as StoreItem[]);
    return { cat: j.cat, list };
  });

  const seen = new Set<string>();
  const items: LiveCatalogItem[] = [];
  for (const { cat, list } of results) {
    for (const it of list) {
      if (seen.has(it.url)) continue;
      if (!it.imageUrl || it.price < 50_000 || it.inStock === false) continue;
      if (ACCESSORY.test(it.title)) continue;
      if (cat.must && !cat.must.test(`${it.title} ${it.category || ""}`)) continue;
      seen.add(it.url);
      items.push(toItem(it, cat, checkedAt));
    }
  }
  if (items.length < 40) return null; // stores unreachable or blocked — keep the previous copy
  return { checkedAt, items };
}

function loadDisk() {
  try {
    const raw = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    if (raw?.items?.length) snap = raw;
  } catch {
    /* no cache yet */
  }
}

function saveDisk(s: Snapshot) {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(s));
  } catch {
    /* read-only disk is fine */
  }
}

function refresh(): Promise<void> {
  if (!refreshing) {
    refreshing = build()
      .then((s) => {
        if (s) {
          snap = s;
          saveDisk(s);
          console.log(`[LiveCatalog] ${s.items.length} live listings`);
        }
      })
      .catch(() => {})
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

function ensureFresh() {
  const age = snap ? Date.now() - new Date(snap.checkedAt).getTime() : Infinity;
  if (age > TTL_MS) refresh();
}

export function startLiveCatalog() {
  loadDisk();
  setTimeout(() => refresh(), 5000);
  setInterval(() => refresh(), TTL_MS).unref?.();
}

/** Waits briefly for the first build so a cold start still returns live items. */
export async function liveCatalogReady(maxWaitMs = 8000): Promise<boolean> {
  if (snap) {
    ensureFresh();
    return true;
  }
  const p = refresh();
  await Promise.race([p, new Promise((r) => setTimeout(r, maxWaitMs))]);
  return !!snap;
}

export function liveCatalogMeta() {
  if (!snap) return { live: false, checkedAt: null, stores: [], total: 0 };
  return {
    live: true,
    checkedAt: snap.checkedAt,
    stores: [...new Set(snap.items.map((i) => i.store))].sort(),
    total: snap.items.length,
  };
}

export function liveCategories() {
  if (!snap) return [];
  const counts = new Map<string, number>();
  for (const i of snap.items) counts.set(i.category, (counts.get(i.category) || 0) + 1);
  return CATEGORIES.filter((c) => counts.get(c.key)).map((c) => ({
    name: c.key,
    count: counts.get(c.key)!,
    icon: c.icon,
    labelUz: c.uz,
    labelRu: c.ru,
    labelEn: c.en,
  }));
}

export function liveCatalogById(id: number) {
  return snap?.items.find((i) => i.id === id) || null;
}

export function filterLiveCatalog(params: { category?: string; store?: string; minPrice?: number; maxPrice?: number; q?: string; sort?: string; limit?: number }) {
  if (!snap) return [];
  let list = snap.items;
  if (params.category && params.category !== "All") list = list.filter((i) => i.category === params.category);
  if (params.store && params.store !== "All") list = list.filter((i) => i.store.toLowerCase().includes(params.store!.toLowerCase()));
  if (params.minPrice) list = list.filter((i) => i.price >= params.minPrice!);
  if (params.maxPrice) list = list.filter((i) => i.price <= params.maxPrice!);
  if (params.q) {
    const words = params.q.toLowerCase().split(/\s+/).filter(Boolean);
    list = list.filter((i) => {
      const hay = `${i.name} ${i.brand || ""} ${i.category}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }
  list = [...list];
  if (params.sort === "price_asc") list.sort((a, b) => a.price - b.price);
  else if (params.sort === "price_desc") list.sort((a, b) => b.price - a.price);
  else if (params.sort === "popular") list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0) || (b.rating || 0) - (a.rating || 0));
  else if (params.sort === "rating") list.sort((a, b) => (b.rating || 0) * 1000 + (b.reviewCount || 0) - ((a.rating || 0) * 1000 + (a.reviewCount || 0)));
  else if (params.sort === "discount") list.sort((a, b) => b.discountPct - a.discountPct || (b.reviewCount || 0) - (a.reviewCount || 0));
  else if (!params.category || params.category === "All") {
    // interleave categories so the first screen isn't all phones
    const byCat = new Map<string, LiveCatalogItem[]>();
    for (const i of list) {
      if (!byCat.has(i.category)) byCat.set(i.category, []);
      byCat.get(i.category)!.push(i);
    }
    const qs = [...byCat.values()];
    const mixed: LiveCatalogItem[] = [];
    for (let k = 0; mixed.length < list.length; k++) {
      let added = false;
      for (const q of qs) if (k < q.length) { mixed.push(q[k]); added = true; }
      if (!added) break;
    }
    list = mixed;
  }
  return list.slice(0, params.limit || 50);
}
