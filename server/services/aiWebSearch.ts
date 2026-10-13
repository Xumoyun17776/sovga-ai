/**
 * Uses the configured AI key to search the live web for what the shopper typed,
 * restricted to Uzbek online stores. Supports:
 *  - Google Gemini with Google Search grounding  (GEMINI_API_KEY)
 *  - OpenAI Responses API with the web search tool (OPENAI_API_KEY)
 *
 * Each provider is health-tracked: an invalid key is switched off (and reported in /api/health)
 * instead of silently failing on every search; quota errors pause the provider for 15 minutes.
 * Product links returned by the AI are checked by opening the page before they are shown.
 */
import { searchOlcha, searchTexnomart, type StoreItem } from "./liveStores.js";
import { rankByRelevance, matchesAllWords } from "./searchRelevance.js";

type ProviderName = "gemini" | "openai";

interface ProviderState {
  disabledUntil: number;
  lastError: string | null;
  lastOk: number | null;
}

const state: Record<ProviderName, ProviderState> = {
  gemini: { disabledUntil: 0, lastError: null, lastOk: null },
  openai: { disabledUntil: 0, lastError: null, lastOk: null },
};

const STORE_DOMAINS: Record<string, string> = {
  "uzum.uz": "Uzum Market",
  "olcha.uz": "Olcha",
  "texnomart.uz": "Texnomart",
  "asaxiy.uz": "Asaxiy",
  "mediapark.uz": "MediaPark",
  "idea.uz": "Idea",
  "alifshop.uz": "Alif Shop",
  "elmakon.uz": "Elmakon",
  "goodzone.uz": "Goodzone",
  "artelshop.uz": "Artel",
  "zoodmall.uz": "ZoodMall",
  "market.yandex.uz": "Yandex Market",
};

function keyOf(name: ProviderName): string {
  const raw = (name === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY) || "";
  return raw.trim();
}

function configured(name: ProviderName): boolean {
  const k = keyOf(name);
  return name === "openai" ? k.startsWith("sk-") : k.length > 20;
}

function available(name: ProviderName): boolean {
  return configured(name) && Date.now() >= state[name].disabledUntil;
}

function markError(name: ProviderName, status: number, message: string) {
  const s = state[name];
  // Keep a short, safe description (provider messages can echo part of the key)
  s.lastError =
    status === 401 || status === 403 ? `API key rejected (${status}) — replace it in .env`
    : status === 429 ? "Quota or rate limit reached (429) — check billing/limits for this key"
    : status === 404 ? "Model not available (404)"
    : status ? `Error ${status}`
    : `Network error: ${message.replace(/sk-[\w*-]+|AIza[\w-]+|key=[^&\s]+/g, "[hidden]").slice(0, 120)}`;
  if (status === 401 || status === 403 || /api key|incorrect|invalid|permission/i.test(message)) {
    s.disabledUntil = Date.now() + 6 * 60 * 60 * 1000; // bad key: stop trying for 6 hours
    console.warn(`[AI web search] ${name} key rejected (${status}). Switched off for 6h. Update ${name === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY"} in .env.`);
  } else if (status === 429 || /quota|rate/i.test(message)) {
    s.disabledUntil = Date.now() + 15 * 60 * 1000;
    console.warn(`[AI web search] ${name} quota/rate limit reached. Paused for 15 minutes.`);
  } else if (status === 404 && /model/i.test(message)) {
    // a model name was retired; next call tries the next model
  } else {
    s.disabledUntil = Date.now() + 60 * 1000;
  }
}

/** Status for /api/health and the admin page (no secrets). */
export function aiSearchStatus() {
  const view = (n: ProviderName) => ({
    configured: configured(n),
    active: available(n),
    pausedForSeconds: Math.max(0, Math.round((state[n].disabledUntil - Date.now()) / 1000)),
    lastError: state[n].lastError,
    lastSuccessAt: state[n].lastOk ? new Date(state[n].lastOk).toISOString() : null,
  });
  return {
    gemini: view("gemini"),
    openai: view("openai"),
    googleSearchGrounding: {
      available: configured("gemini") && Date.now() >= groundingPausedUntil,
      pausedForSeconds: Math.max(0, Math.round((groundingPausedUntil - Date.now()) / 1000)),
      note: groundingNote,
    },
  };
}

/** Whether a provider's key is configured and not switched off after errors (used by other AI features too). */
export function providerUsable(name: ProviderName): boolean {
  return available(name);
}

/** Let other AI features report a rejected key / quota so the whole app stops using it. */
export function reportProviderError(name: ProviderName, status: number, message: string) {
  markError(name, status, message);
}

export function aiSearchAvailable(): boolean {
  return available("gemini") || available("openai");
}

function buildPrompt(query: string, opts: { budgetMax?: number; language?: string }): string {
  const budget = opts.budgetMax ? ` The budget is up to ${Math.round(opts.budgetMax).toLocaleString("en-US")} UZS.` : "";
  return `A shopper in Uzbekistan searched for: "${query}".${budget}
Search the web and find products that match this search and are currently sold in Uzbek online stores
(uzum.uz, olcha.uz, texnomart.uz, asaxiy.uz, mediapark.uz, idea.uz, alifshop.uz, elmakon.uz, goodzone.uz).
Rules:
- Only include products you actually found on those sites, each with its direct product page URL (not a search page).
- The product must be what the shopper asked for (same type; if the search says who it is for, e.g. women/ayollar/onam or men/erkaklar/otam or kids/bolalar, only products for that person).
- Prices in UZS as numbers, as shown on the page.
- Up to 12 products, cheapest first.
Reply with ONLY this JSON, no other text:
{"products":[{"name":"...","price_uzs":123000,"store":"...","url":"https://..."}],"summary":"one or two sentences in Uzbek about what you found"}`;
}

function extractJson(text: string): any | null {
  if (!text) return null;
  const cleaned = text.replace(/```json|```/g, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** Google Search grounding has its own quota (often 0 on free keys). Pausing it doesn't switch Gemini off. */
let groundingPausedUntil = 0;
let groundingNote: string | null = null;

async function callGemini(prompt: string, grounded = true, modelList?: string): Promise<string | null> {
  if (grounded && Date.now() < groundingPausedUntil) return null;
  const models = (modelList || process.env.GEMINI_MODEL || "gemini-3.8-flash,gemini-flash-latest,gemini-3.5-flash-lite")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  let quotaHits = 0;
  for (const model of models) {
    if (!available("gemini")) return null;
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(keyOf("gemini"))}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            ...(grounded ? { tools: [{ google_search: {} }] } : {}),
            generationConfig: { temperature: 0.2 },
          }),
          signal: AbortSignal.timeout(grounded ? 20000 : 15000),
        }
      );
      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429 && grounded) {
          // Quota for Google Search grounding; plain Gemini may still work
          quotaHits++;
          continue;
        }
        markError("gemini", res.status, data?.error?.message || res.statusText);
        if (res.status === 404 || res.status === 400 || res.status === 429) continue;
        return null;
      }
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const text = parts.map((p: any) => p.text || "").join("");
      state.gemini.lastOk = Date.now();
      state.gemini.lastError = null;
      if (grounded) groundingNote = null;
      return text;
    } catch (e: any) {
      markError("gemini", 0, e?.message || "network error");
    }
  }
  if (grounded && quotaHits > 0) {
    groundingPausedUntil = Date.now() + 30 * 60 * 1000;
    groundingNote = "Google Search grounding quota is 0 or used up for this key (429). Enable billing in Google AI Studio to use it. Using AI-guided store search meanwhile.";
    console.warn("[AI web search] Gemini Google Search grounding unavailable (429) — using AI-guided store search for 30 min.");
  }
  return null;
}

async function callOpenAI(prompt: string): Promise<string | null> {
  if (!available("openai")) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${keyOf("openai")}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        tools: [{ type: "web_search_preview", user_location: { type: "approximate", country: "UZ", city: "Tashkent" } }],
        input: prompt,
      }),
      signal: AbortSignal.timeout(25000),
    });
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      markError("openai", res.status, data?.error?.message || res.statusText);
      return null;
    }
    const text = (data.output || [])
      .filter((o: any) => o.type === "message")
      .flatMap((o: any) => o.content || [])
      .map((c: any) => c.text || "")
      .join("");
    state.openai.lastOk = Date.now();
    state.openai.lastError = null;
    state.openai.disabledUntil = 0;
    return text;
  } catch (e: any) {
    markError("openai", 0, e?.message || "network error");
    return null;
  }
}

function storeForUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    for (const [domain, name] of Object.entries(STORE_DOMAINS)) {
      if (host === domain || host.endsWith(`.${domain}`)) return name;
    }
  } catch {}
  return null;
}

function looksLikeProductPage(url: string): boolean {
  return !/[?&](q|query|search|key|text)=|\/search\b|\/katalog\/?\?/i.test(url);
}

/** Pull a price from the page's structured data (JSON-LD / meta tags), if it has one. */
function priceFromHtml(html: string): number | null {
  const ld = html.match(/"price"\s*:\s*"?(\d[\d\s.,]{2,})"?/i);
  const meta =
    html.match(/property=["']product:price:amount["'][^>]*content=["']([\d\s.,]+)["']/i) ||
    html.match(/itemprop=["']price["'][^>]*content=["']([\d\s.,]+)["']/i);
  const raw = (meta && meta[1]) || (ld && ld[1]) || null;
  if (!raw) return null;
  const n = parseFloat(raw.replace(/\s/g, "").replace(/,(?=\d{3}\b)/g, "").replace(/,/g, "."));
  return Number.isFinite(n) && n >= 1000 && n <= 500_000_000 ? Math.round(n) : null;
}

/**
 * Open each AI-suggested link. Dead links (404/410) are dropped; when the page shows a price we use it.
 * Pages that block automated requests are kept but stay "price not verified".
 */
async function verifyLinks(items: StoreItem[]): Promise<Array<StoreItem & { verified: boolean }>> {
  const checks = items.map(async (it) => {
    // Olcha / Texnomart: confirm through the store's own search API (exact link → real price)
    if (it.store === "Olcha" || it.store === "Texnomart") {
      const live = await (it.store === "Olcha" ? searchOlcha(it.title) : searchTexnomart(it.title)).catch(() => []);
      const same = live.find((x) => x.url.replace(/\/$/, "") === it.url.replace(/\/$/, "").replace("/uz/product/", "/product/"));
      if (same) return { ...it, title: same.title, price: same.price, imageUrl: same.imageUrl, verified: true };
    }
    try {
      const res = await fetch(it.url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36" },
        redirect: "follow",
        signal: AbortSignal.timeout(6000),
      });
      if (res.status === 404 || res.status === 410) return null;
      if (!res.ok) return { ...it, verified: false };
      const html = (await res.text()).slice(0, 600_000);
      const pagePrice = priceFromHtml(html);
      if (pagePrice) return { ...it, price: pagePrice, verified: true };
      return { ...it, verified: false };
    } catch {
      return { ...it, verified: false };
    }
  });
  const done = await Promise.all(checks);
  return done.filter((x): x is StoreItem & { verified: boolean } => x !== null);
}

export interface AiWebResult {
  items: Array<StoreItem & { verified: boolean; guided?: boolean }>;
  summary: string | null;
  provider: ProviderName | "gemini-guided" | null;
}

/**
 * When the key can't search the web itself, use it to decide WHAT to search for,
 * then run those searches in the stores (Olcha, Texnomart). Every result is a real listing.
 * "onam uchun sovg'a" → ["ipak ro'mol", "ayollar atiri", "choy to'plami"] → real products.
 */
async function aiGuidedStoreSearch(query: string, opts: { budgetMax?: number; language?: string }): Promise<AiWebResult> {
  const budget = opts.budgetMax ? ` Budget up to ${Math.round(opts.budgetMax).toLocaleString("en-US")} UZS.` : "";
  const prompt = `A shopper in Uzbekistan searched a gift/price-comparison site for: "${query}".${budget}
Suggest 3 to 5 short product searches to type into Uzbek online stores (olcha.uz, texnomart.uz) that best match what they want.
Write each as the store would list it, in Uzbek Latin or as the brand/model name (e.g. "ayollar atiri", "ipak ro'mol", "kofe mashinasi", "Lattafa Yara", "Redmi Note 13").
If the search names who the gift is for, pick products suitable for that person. Keep each search 1-4 words.
Reply with ONLY JSON: {"searches":["..."],"summary":"one short sentence in ${opts.language === "ru" ? "Russian" : opts.language === "en" ? "English" : "Uzbek"} explaining the ideas"}`;
  const text = await callGemini(prompt, false, process.env.GEMINI_GUIDE_MODEL || "gemini-3.5-flash-lite,gemini-3.8-flash,gemini-flash-latest");
  const parsed = extractJson(text || "");
  const searches: string[] = Array.isArray(parsed?.searches)
    ? parsed.searches.filter((x: any) => typeof x === "string" && x.trim().length > 1).map((x: string) => x.trim().slice(0, 60)).slice(0, 5)
    : [];
  if (!searches.length) return { items: [], summary: null, provider: null };

  const perSearch = await Promise.all(
    searches.map(async (phrase) => {
      const [olcha, texno] = await Promise.all([searchOlcha(phrase).catch(() => []), searchTexnomart(phrase).catch(() => [])]);
      const found = [...olcha, ...texno];
      // keep the few that really match the suggested search (drops accessories and noise)
      // must actually be that thing ("bolalar droni" must contain "dron", not just "bolalar")
      return rankByRelevance(phrase, found, (x) => ({ name: x.title, description: x.category || null }), { maxRelated: 0 })
        .map((r) => r.item)
        .filter((x) => matchesAllWords(phrase, x.title, 0.5))
        .slice(0, 4);
    })
  );
  const seen = new Set<string>();
  const items: Array<StoreItem & { verified: boolean; guided: boolean }> = [];
  for (const list of perSearch) {
    for (const it of list) {
      if (seen.has(it.url)) continue;
      seen.add(it.url);
      items.push({ ...it, verified: true, guided: true });
    }
  }
  return {
    items,
    summary: typeof parsed?.summary === "string" ? parsed.summary.slice(0, 300) : null,
    provider: "gemini-guided",
  };
}

/** Search the web with whichever AI key works. Returns no items (never throws) when none is available. */
export async function aiWebSearch(query: string, opts: { budgetMax?: number; language?: string } = {}): Promise<AiWebResult> {
  if (!aiSearchAvailable()) return { items: [], summary: null, provider: null };
  const prompt = buildPrompt(query, opts);

  let text: string | null = null;
  let provider: ProviderName | null = null;
  // 1. OpenAI web search, 2. Gemini with Google Search
  if (available("openai")) {
    text = await callOpenAI(prompt);
    if (text) provider = "openai";
  }
  if (!text && available("gemini")) {
    text = await callGemini(prompt, true);
    if (text) provider = "gemini";
  }
  // 3. No web search on this key: let the AI pick what to search, then search the stores
  if (!text) {
    if (available("gemini")) return aiGuidedStoreSearch(query, opts);
    return { items: [], summary: null, provider: null };
  }

  const parsed = extractJson(text || "");
  const raw: any[] = Array.isArray(parsed?.products) ? parsed.products : [];

  const items: StoreItem[] = [];
  const seen = new Set<string>();
  for (const p of raw.slice(0, 16)) {
    const url = typeof p?.url === "string" ? p.url.trim() : "";
    const name = typeof p?.name === "string" ? p.name.trim() : "";
    const price = typeof p?.price_uzs === "number" ? p.price_uzs : parseFloat(String(p?.price_uzs || "").replace(/[^\d.]/g, ""));
    const store = storeForUrl(url);
    if (!url || !name || !store || !looksLikeProductPage(url) || seen.has(url)) continue;
    if (!Number.isFinite(price) || price < 1000) continue;
    seen.add(url);
    items.push({ title: name, store, url, price: Math.round(price), source: "ai-web" });
  }

  const verified = items.length ? await verifyLinks(items) : [];
  return {
    items: verified,
    summary: typeof parsed?.summary === "string" ? parsed.summary.slice(0, 500) : null,
    provider,
  };
}
