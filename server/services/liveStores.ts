/**
 * Live product search straight from Uzbek online stores' public search APIs.
 * Every item returned here is a real listing with a real price and a direct product URL.
 *
 * Working sources (checked Oct 2026):
 *  - Olcha:     https://mobile.olcha.uz/api/v2/products?q=…
 *  - Texnomart: https://gw.texnomart.uz/api/common/v1/search/filters?q=…
 * Uzum, Asaxiy and MediaPark block or retired their public search endpoints;
 * they are covered by the AI web search (see aiWebSearch.ts) when an API key is configured.
 */

export interface StoreItem {
  title: string;
  store: string;
  url: string;
  price: number;
  oldPrice?: number | null;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  inStock?: boolean | null;
  discount?: string | null;
  installment?: string | null;
  /** Monthly installment amount in UZS, when the store offers one */
  monthlyPayment?: number | null;
  warrantyMonths?: number | null;
  /** Store's own category name, useful for relevance (e.g. "Ayollar uchun parfyumeriya"). */
  category?: string | null;
  source: "store-api" | "ai-web" | "web-index";
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function getJson(url: string, timeoutMs = 5000, headers: Record<string, string> = {}): Promise<any | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json", ...headers },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const num = (v: any): number | null => {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
};

export async function searchOlcha(query: string): Promise<StoreItem[]> {
  const data = await getJson(`https://mobile.olcha.uz/api/v2/products?q=${encodeURIComponent(query)}&per_page=24`);
  const products: any[] = data?.data?.products || [];
  const out: StoreItem[] = [];
  for (const p of products) {
    const title = (p.name_oz || p.name_uz || p.name_ru || p.name || "").trim();
    const alias = p.alias || p.slug;
    const price = num(p.total_price) ?? num(p.discount_price) ?? num(p.price);
    if (!title || !alias || !price) continue;
    const old = num(p.price);
    const rating = num(p.comments_rating);
    out.push({
      title,
      store: "Olcha",
      url: `https://olcha.uz/oz/product/view/${alias}`,
      price,
      oldPrice: old && old > price ? old : null,
      imageUrl: p.main_image || null,
      rating: rating,
      reviewCount: num(p.comments_count),
      inStock: p.out_of_stock === true ? false : true,
      discount: p.discount && Number(p.discount_value) > 0 ? `${Math.round(Number(p.discount_value))}% chegirma` : null,
      installment: p.has_installment && p.monthly_repayment ? `Muddatli to'lov: oyiga ${Number(p.monthly_repayment).toLocaleString("en-US")} so'mdan` : null,
      monthlyPayment: p.has_installment ? num(p.monthly_repayment) : null,
      warrantyMonths: num(p.warranty_month),
      category: p.category?.name_oz || p.category?.name_uz || null,
      source: "store-api",
    });
  }
  return out;
}

/** Texnomart sends e.g. "45 867 so'mdan / 24 oy" — keep only the amount before "so'm". */
function monthlyOf(v: any): number | null {
  if (typeof v === "number") return v > 0 ? v : null;
  if (typeof v !== "string") return null;
  const m = v.split(/so/i)[0].replace(/[^0-9]/g, "");
  const n = m ? parseInt(m, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function searchTexnomart(query: string): Promise<StoreItem[]> {
  const data = await getJson(
    `https://gw.texnomart.uz/api/common/v1/search/filters?q=${encodeURIComponent(query)}&page=1`,
    5000,
    { "Accept-Language": "uz" }
  );
  const products: any[] = data?.data?.products || [];
  const out: StoreItem[] = [];
  for (const p of products) {
    const title = (p.name || "").trim();
    const price = num(p.sale_price);
    if (!title || !p.id || !price) continue;
    const old = num(p.old_price);
    out.push({
      title,
      store: "Texnomart",
      url: `https://texnomart.uz/product/detail/${p.id}/`,
      price,
      oldPrice: old && old > price ? old : null,
      imageUrl: p.image || null,
      rating: num(p.reviews_average),
      reviewCount: num(p.reviews_count),
      inStock: p.availability ? !/not|yo'q|нет/i.test(String(p.availability)) : null,
      discount: old && old > price ? `${Math.round((1 - price / old) * 100)}% chegirma` : null,
      installment: p.is_can_loan_order && monthlyOf(p.axiom_monthly_price) ? `Muddatli to'lov: oyiga ${monthlyOf(p.axiom_monthly_price)!.toLocaleString("en-US")} so'mdan` : null,
      monthlyPayment: p.is_can_loan_order ? monthlyOf(p.axiom_monthly_price) : null,
      category: null,
      source: "store-api",
    });
  }
  return out;
}

/** Search every live store for each query, in parallel, and de-duplicate by URL. */
export async function searchStores(queries: string[]): Promise<StoreItem[]> {
  const qs = [...new Set(queries.map((q) => q.trim()).filter(Boolean))].slice(0, 3);
  const jobs: Promise<StoreItem[]>[] = [];
  for (const q of qs) {
    jobs.push(searchOlcha(q));
    jobs.push(searchTexnomart(q));
  }
  const results = await Promise.all(jobs.map((j) => j.catch(() => [] as StoreItem[])));
  const seen = new Set<string>();
  const out: StoreItem[] = [];
  for (const list of results) {
    for (const it of list) {
      if (seen.has(it.url)) continue;
      seen.add(it.url);
      out.push(it);
    }
  }
  return out;
}
