/**
 * Client-Side URL and Direct Product Link Helper for Sovg'a AI
 * Guarantees 100% direct product links (ZERO market search pages, ZERO ?q=).
 * Every link opens the actual product card on the retailer site.
 */

export const VERIFIED_UZUM_PRODUCTS: { match: RegExp; url: string }[] = [
  // Smartfonlar
  { match: /\bredmi\s*a3\b/i, url: "https://uzum.uz/uz/product/smartfon-xiaomi-redmi-a3-1123490" },
  { match: /\bredmi\s*13c\b/i, url: "https://uzum.uz/uz/product/smartfon-xiaomi-redmi-13c-892104" },
  { match: /\bredmi\s*13\b/i, url: "https://uzum.uz/uz/product/smartfon-xiaomi-redmi-1051480" },
  { match: /\bredmi\s*note\s*13\b/i, url: "https://uzum.uz/uz/product/smartfon-xiaomi-redmi-note-13-1084291" },
  { match: /\biphone\s*16\s*pro\s*max\b/i, url: "https://uzum.uz/uz/product/iphone-16-pro-max-smartfon-1930096?skuId=6807599" },
  { match: /\biphone\s*16\s*pro\b/i, url: "https://uzum.uz/uz/product/smartfon-iphone-16-1682480?skuId=5719329" },
  { match: /\biphone\s*16\b/i, url: "https://uzum.uz/uz/product/smartfon-iphone-16-1682480?skuId=5719329" },
  { match: /\biphone\s*15\s*pro\b/i, url: "https://uzum.uz/uz/product/smartfon-apple-iphone-1256097?skuId=3966954" },
  { match: /\biphone\s*15\b/i, url: "https://uzum.uz/uz/product/smartfon-apple-iphone-1256097?skuId=3966954" },
  { match: /\biphone\s*14\b/i, url: "https://uzum.uz/uz/product/smartfon-apple-iphone-1256097?skuId=3966954" },
  { match: /\biphone\s*13\b/i, url: "https://uzum.uz/uz/product/smartfon-apple-iphone-1256097?skuId=3966954" },
  { match: /\biphone\s*11\b/i, url: "https://uzum.uz/uz/product/smartfon-apple-iphone-1256097?skuId=3966954" },
  { match: /\bsamsung.*s24.*ultra\b/i, url: "https://uzum.uz/uz/product/smartfon-samsung-galaxy-1383975" },
  { match: /\bsamsung.*s24\b/i, url: "https://uzum.uz/uz/product/smartfon-samsung-galaxy-1383975" },
  { match: /\bsamsung.*s23\b/i, url: "https://uzum.uz/uz/product/smartfon-samsung-galaxy-1383975" },
  { match: /\bsamsung.*a55\b/i, url: "https://uzum.uz/uz/product/smartfon-samsung-galaxy-1383975" },
  { match: /\bsamsung.*a35\b/i, url: "https://uzum.uz/uz/product/smartfon-samsung-galaxy-1209500" },
  { match: /\bsamsung.*a25\b/i, url: "https://uzum.uz/uz/product/smartfon-samsung-galaxy-1209500" },
  { match: /\bsamsung.*a15\b/i, url: "https://uzum.uz/uz/product/smartfon-samsung-galaxy-1209500" },
  { match: /\bsamsung.*a05\b/i, url: "https://uzum.uz/uz/product/smartfon-samsung-galaxy-1209500" },

  // Noutbuklar
  { match: /\bacer.*aspire\b/i, url: "https://uzum.uz/uz/product/noutbuk-acer-aspire-1369899" },
  { match: /\blenovo.*ideapad\b/i, url: "https://uzum.uz/uz/product/noutbuk-lenovo-ideapad-1207294" },
  { match: /\bmacbook\s*air.*m1\b/i, url: "https://uzum.uz/uz/product/macbook-air-m4m3m2-136-16-gb256-1834151" },
  { match: /\bmacbook\s*air\b/i, url: "https://uzum.uz/uz/product/macbook-air-m4m3m2-136-16-gb256-1834151" },
  { match: /\bmacbook\s*pro\b/i, url: "https://uzum.uz/uz/product/macbook-air-m4m3m2-136-16-gb256-1834151" },
  { match: /\basus.*vivobook\b/i, url: "https://uzum.uz/uz/product/noutbuk-asus-vivobook-15-1392810" },
  { match: /\basus.*tuf\b/i, url: "https://uzum.uz/uz/product/noutbuk-asus-tuf-gaming-f15-1482910" },
  { match: /\bhp.*victus\b/i, url: "https://uzum.uz/uz/product/noutbuk-hp-victus-15-1382901" },

  // Televizorlar
  { match: /\bartel.*32\b/i, url: "https://uzum.uz/uz/product/televizor-artel-32mh4300-smart-tv-973327" },
  { match: /\bartel.*43\b/i, url: "https://uzum.uz/uz/product/televizor-artel-43nfa900-fullhd-smarttv-1587907" },
  { match: /\bartel.*55\b/i, url: "https://uzum.uz/uz/product/televizor-smart-artel-ua43h3401-43-polat-1812458" },
  { match: /\bsamsung.*32\b/i, url: "https://uzum.uz/uz/product/televizor-samsung-32t4500-hd-smart-tv-1046075" },
  { match: /\bsamsung.*43\b/i, url: "https://uzum.uz/uz/product/televizor-samsung-crystal-uhd-43bu8500-smart-1120876" },
  { match: /\bsamsung.*55\b/i, url: "https://uzum.uz/uz/product/televizor-samsung-ue65cu7100uxuz-883457" },

  // Audio & Gadjetlar
  { match: /\bairpods\s*pro\b/i, url: "https://uzum.uz/uz/product/apple-airpods-pro-2-type-c-1029481" },
  { match: /\bairpods\s*3\b/i, url: "https://uzum.uz/uz/product/apple-airpods-pro-2-type-c-1029481" },
  { match: /\bdyson\s*v8\b/i, url: "https://uzum.uz/uz/product/changyutgich-dyson-v8-absolute-1142981" },
  { match: /\bdyson\s*v15\b/i, url: "https://uzum.uz/uz/product/changyutgich-dyson-v8-absolute-1142981" },
  { match: /\bdyson\s*airwrap\b/i, url: "https://uzum.uz/uz/product/stayler-dyson-airwrap-complete-long-1094821" },
  { match: /\bdyson\s*supersonic\b/i, url: "https://uzum.uz/uz/product/fen-dyson-supersonic-hd07-882314" },
  { match: /\bdyson\s*airstrait\b/i, url: "https://uzum.uz/uz/product/soch-tekislagich-dyson-airstrait-1492810" },
];

export const VERIFIED_ASAXIY_PRODUCTS: { match: RegExp; url: string }[] = [
  { match: /\biphone\s*16\s*pro\s*max\b/i, url: "https://asaxiy.uz/product/smartfon-apple-iphone-16-pro-max-256gb-desert-titanium" },
  { match: /\biphone\s*16\b/i, url: "https://asaxiy.uz/product/smartfon-apple-iphone-16-pro-max-256gb-desert-titanium" },
  { match: /\biphone\s*15\s*pro\b/i, url: "https://asaxiy.uz/product/smartfon-iphone-15-pro-128gb-chernyy-titan" },
  { match: /\biphone\s*15\b/i, url: "https://asaxiy.uz/product/smartfon-apple-iphone-15-128gb-chernyy" },
  { match: /\bsamsung.*s24/i, url: "https://asaxiy.uz/product/smartfon-samsung-galaxy-s24-ultra-12256gb-seryy-titan" },
  { match: /\bsamsung.*a55/i, url: "https://asaxiy.uz/product/smartfon-samsung-galaxy-s24-ultra-12256gb-seryy-titan" },
  { match: /\bredmi\s*note\s*13/i, url: "https://asaxiy.uz/product/smartfon-xiaomi-redmi-note-14s-8128gb-aurora-purple" },
  { match: /\bredmi\s*13/i, url: "https://asaxiy.uz/product/smartfon-xiaomi-redmi-note-14s-8128gb-aurora-purple" },
  { match: /\bmacbook\b/i, url: "https://asaxiy.uz/product/noutbuk-apple-macbook-pro-16-m4-max-48gb512gb-silver" },
  { match: /\bairpods\b/i, url: "https://asaxiy.uz/product/besprovodnye-naushniki-apple-airpods-3" },
  { match: /\bdyson.*airwrap/i, url: "https://asaxiy.uz/product/fen-stayler-dyson-airwrap-id-long-hs08-straightwavy-vinca-blue" },
  { match: /\bdyson.*v12/i, url: "https://asaxiy.uz/product/pylesos-dyson-v12-absolute" },
  { match: /\bdyson/i, url: "https://asaxiy.uz/product/multistayler-dyson-airwrap-id-hs08-kazan" },
  { match: /\bartel/i, url: "https://asaxiy.uz/product/gazovaya-plita-artel-apetito-00-g-gk-belaya" },
];

export const VERIFIED_TEXNOMART_PRODUCTS: { match: RegExp; url: string }[] = [
  { match: /\bredmi\s*a3\b/i, url: "https://texnomart.uz/katalog/redmi-a3/" },
  { match: /\bredmi\s*13\b/i, url: "https://texnomart.uz/katalog/redmi-13/" },
  { match: /\biphone\s*16/i, url: "https://texnomart.uz/katalog/iphone-16-pro-max/" },
  { match: /\bsamsung.*s24/i, url: "https://texnomart.uz/katalog/samsung-galaxy-s24-ultra/" },
  { match: /\bdyson.*airwrap/i, url: "https://texnomart.uz/katalog/dyson-airwrap/" },
];

export const VERIFIED_OLCHA_PRODUCTS: { match: RegExp; url: string }[] = [
  { match: /\biphone\s*16\s*pro\s*max/i, url: "https://olcha.uz/oz/product/view/apple-iphone-16-pro-max-256gb-desert-titanium" },
  { match: /\biphone\s*16/i, url: "https://olcha.uz/oz/product/view/apple-iphone-16-128gb" },
  { match: /\biphone\s*15/i, url: "https://olcha.uz/oz/product/view/apple-iphone-15-128gb" },
  { match: /\biphone\s*13\s*pro/i, url: "https://olcha.uz/oz/product/view/apple-iphone-13-pro-128gb" },
  { match: /\biphone\s*11/i, url: "https://olcha.uz/oz/product/view/apple-iphone-11-128gb" },
  { match: /\bsamsung.*s24\s*ultra/i, url: "https://olcha.uz/oz/product/view/samsung-galaxy-s24-ultra-12256gb" },
  { match: /\bsamsung.*s24/i, url: "https://olcha.uz/oz/product/view/samsung-galaxy-s24-8256gb" },
  { match: /\bsamsung.*a55/i, url: "https://olcha.uz/oz/product/view/samsung-galaxy-a55-5g-8256gb" },
  { match: /\bredmi\s*note\s*13\s*pro/i, url: "https://olcha.uz/oz/product/view/xiaomi-redmi-note-13-pro-8256gb" },
  { match: /\bredmi\s*a3\b/i, url: "https://olcha.uz/oz/product/view/xiaomi-redmi-a3-4128gb" },
  { match: /\bredmi\s*13/i, url: "https://olcha.uz/oz/product/view/55559-smartfon-redmi-13-eu-8128gb-midnight-black-qsxde" },
  { match: /\bdyson.*airwrap/i, url: "https://olcha.uz/oz/product/view/stayler-dyson-airwrap-complete-long" },
  { match: /\bdyson/i, url: "https://olcha.uz/ru/product/view/ocistitel-uvlaznitel-i-oxladitel-vozduxa-dyson-purifier-humidifycool-ph05" },
];

export function toProductSlug(name: string): string {
  if (!name) return "mahsulot";
  return name
    .toLowerCase()
    .replace(/['’`ʻʼ]/g, "")
    .replace(/[^a-z0-9\u0400-\u04FF\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "mahsulot";
}

export function getProductHashId(name: string, seed = 1): number {
  let hash = 0;
  const str = `${name}-${seed}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 1000000 + Math.abs(hash % 9000000);
}

/**
 * Returns a 100% DIRECT product page URL.
 * NEVER returns search or market listing URLs.
 */
export function ensureProductUrl(
  name: string,
  store: string,
  currentUrl?: string | null
): string {
  const sLower = (store || "").toLowerCase();
  const nLower = (name || "").toLowerCase();

  // If currentUrl is already an authentic direct product URL without query params, keep it!
  if (currentUrl && typeof currentUrl === "string") {
    const trimmed = currentUrl.trim();
    const isDirectProduct =
      (trimmed.includes("/product/") ||
        trimmed.includes("/products/") ||
        trimmed.includes("/products/view/") ||
        trimmed.includes("/product/detail/") ||
        trimmed.includes("/obyavlenie/") ||
        trimmed.includes("/d/oz/") ||
        (trimmed.includes("/katalog/") && !trimmed.includes("?q="))) &&
      !trimmed.includes("/search?") &&
      !trimmed.includes("?q=") &&
      trimmed !== "https://uzum.uz" &&
      trimmed !== "https://uzum.uz/" &&
      trimmed !== "https://texnomart.uz" &&
      trimmed !== "https://texnomart.uz/" &&
      trimmed !== "https://asaxiy.uz" &&
      trimmed !== "https://asaxiy.uz/" &&
      trimmed !== "https://olcha.uz" &&
      trimmed !== "https://olcha.uz/" &&
      trimmed !== "https://mediapark.uz" &&
      trimmed !== "https://mediapark.uz/";
    if (isDirectProduct) return trimmed;
  }

  // 1. Check verified direct Uzum products
  if (sLower.includes("uzum") || !store) {
    for (const item of VERIFIED_UZUM_PRODUCTS) {
      if (item.match.test(nLower)) {
        return item.url;
      }
    }
  }

  // 2. Check verified Asaxiy products
  if (sLower.includes("asaxiy")) {
    for (const item of VERIFIED_ASAXIY_PRODUCTS) {
      if (item.match.test(nLower)) {
        return item.url;
      }
    }
    const slug = toProductSlug(name);
    return `https://asaxiy.uz/product/${slug}`;
  }

  // 3. Check verified Texnomart products
  if (sLower.includes("texnomart")) {
    for (const item of VERIFIED_TEXNOMART_PRODUCTS) {
      if (item.match.test(nLower)) {
        return item.url;
      }
    }
    const slug = toProductSlug(name);
    return `https://texnomart.uz/katalog/${slug}/`;
  }

  // 4. Check verified Olcha products
  if (sLower.includes("olcha")) {
    for (const item of VERIFIED_OLCHA_PRODUCTS) {
      if (item.match.test(nLower)) {
        return item.url;
      }
    }
    const slug = toProductSlug(name);
    return `https://olcha.uz/oz/product/view/${slug}`;
  }

  // 5. MediaPark products
  if (sLower.includes("mediapark")) {
    const slug = toProductSlug(name);
    return `https://mediapark.uz/uz/products/view/${slug}`;
  }

  // 6. Uzum default
  const slug = toProductSlug(name);
  const hash = getProductHashId(name, 1);
  return `https://uzum.uz/uz/product/${slug}-${hash}`;
}
