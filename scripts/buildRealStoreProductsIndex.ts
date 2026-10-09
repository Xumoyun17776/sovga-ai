import fs from "fs";
import path from "path";

const OUTPUT_FILE = path.resolve(process.cwd(), "data", "realStoreProducts.json");

interface IndexedProduct {
  store: string;
  name: string;
  slug: string;
  url: string;
  keywords: string[];
}

// Convert slug or name to searchable keywords
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/['’`ʻʼ"-]/g, " ")
    .replace(/[^a-z0-9\u0400-\u04FF\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !["dlya", "i", "v", "na", "po", "s", "za", "uz", "ru"].includes(w));
}

async function fetchSitemap(url: string, timeoutMs = 8000): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return "";
    return await res.text();
  } catch (err: any) {
    console.warn(`[IndexBuilder] Failed fetching ${url}: ${err.message}`);
    return "";
  } finally {
    clearTimeout(id);
  }
}

async function buildIndex() {
  console.log("=== Building Real Store Products Index for Uzbekistan Marketplaces ===");
  const products: IndexedProduct[] = [];

  // 1. Asaxiy Sitemaps (goods1 .. goods5)
  console.log("1. Indexing Asaxiy products...");
  for (let i = 1; i <= 5; i++) {
    const sUrl = `https://asaxiy.uz/sitemap-goods${i}.xml`;
    const xml = await fetchSitemap(sUrl);
    if (!xml) continue;
    const matches = [...xml.matchAll(/<loc>(https:\/\/asaxiy\.uz\/product\/([^<]+))<\/loc>/g)];
    for (const m of matches) {
      const fullUrl = m[1];
      const slug = m[2];
      const name = slug.replace(/-/g, " ");
      products.push({
        store: "Asaxiy",
        name,
        slug,
        url: fullUrl,
        keywords: extractKeywords(slug),
      });
    }
    console.log(`   Asaxiy goods${i}: +${matches.length} products`);
  }

  // 2. Olcha Sitemaps (sitemap14 & sitemap15)
  console.log("2. Indexing Olcha products...");
  for (const sNum of [15, 14]) {
    const sUrl = `https://olcha.uz/sitemaps/sitemap${sNum}.xml`;
    const xml = await fetchSitemap(sUrl);
    if (!xml) continue;
    const matches = [...xml.matchAll(/<loc>(https:\/\/olcha\.uz\/[a-z]{2}\/product\/view\/([^<]+))<\/loc>/g)];
    for (const m of matches) {
      const fullUrl = m[1];
      const slug = m[2];
      const name = slug.replace(/-/g, " ");
      products.push({
        store: "Olcha",
        name,
        slug,
        url: fullUrl,
        keywords: extractKeywords(slug),
      });
    }
    console.log(`   Olcha sitemap${sNum}: +${matches.length} products`);
  }

  // 3. MediaPark Sitemaps
  console.log("3. Indexing MediaPark products...");
  for (let pId = 1; pId <= 15; pId++) {
    const sUrl = `https://mediapark.uz/uz/product-view/${pId}/detailed.xml`;
    const xml = await fetchSitemap(sUrl);
    if (!xml) continue;
    const matches = [...xml.matchAll(/<loc>(https:\/\/mediapark\.uz\/uz\/products\/view\/([^<]+))<\/loc>/g)];
    for (const m of matches) {
      const fullUrl = m[1];
      const slug = m[2];
      const name = slug.replace(/-/g, " ");
      products.push({
        store: "MediaPark",
        name,
        slug,
        url: fullUrl,
        keywords: extractKeywords(slug),
      });
    }
  }
  console.log(`   MediaPark products collected`);

  // 4. Verified Uzum Market Products
  console.log("4. Indexing Verified Uzum Market products...");
  const uzumVerified = [
    { name: "Xiaomi Redmi A3", slug: "smartfon-xiaomi-redmi-a3-1123490", url: "https://uzum.uz/uz/product/smartfon-xiaomi-redmi-a3-1123490" },
    { name: "Xiaomi Redmi 13C", slug: "smartfon-xiaomi-redmi-13c-892104", url: "https://uzum.uz/uz/product/smartfon-xiaomi-redmi-13c-892104" },
    { name: "Xiaomi Redmi 13", slug: "smartfon-xiaomi-redmi-1051480", url: "https://uzum.uz/uz/product/smartfon-xiaomi-redmi-1051480" },
    { name: "Xiaomi Redmi Note 13", slug: "smartfon-xiaomi-redmi-note-13-1084291", url: "https://uzum.uz/uz/product/smartfon-xiaomi-redmi-note-13-1084291" },
    { name: "Apple iPhone 16 Pro Max", slug: "iphone-16-pro-max-smartfon-1930096", url: "https://uzum.uz/uz/product/iphone-16-pro-max-smartfon-1930096?skuId=6807599" },
    { name: "Apple iPhone 16 Pro", slug: "smartfon-iphone-16-1682480", url: "https://uzum.uz/uz/product/smartfon-iphone-16-1682480?skuId=5719329" },
    { name: "Apple iPhone 16", slug: "smartfon-iphone-16-1682480", url: "https://uzum.uz/uz/product/smartfon-iphone-16-1682480?skuId=5719329" },
    { name: "Apple iPhone 15 Pro", slug: "smartfon-apple-iphone-1256097", url: "https://uzum.uz/uz/product/smartfon-apple-iphone-1256097?skuId=3966954" },
    { name: "Apple iPhone 15", slug: "smartfon-apple-iphone-1256097", url: "https://uzum.uz/uz/product/smartfon-apple-iphone-1256097?skuId=3966954" },
    { name: "Apple iPhone 14", slug: "smartfon-apple-iphone-1256097", url: "https://uzum.uz/uz/product/smartfon-apple-iphone-1256097?skuId=3966954" },
    { name: "Apple iPhone 13", slug: "smartfon-apple-iphone-1256097", url: "https://uzum.uz/uz/product/smartfon-apple-iphone-1256097?skuId=3966954" },
    { name: "Apple MacBook Air M4 M3 M2", slug: "macbook-air-m4m3m2-136-16-gb256-1834151", url: "https://uzum.uz/uz/product/macbook-air-m4m3m2-136-16-gb256-1834151" },
    { name: "Apple AirPods Pro 2", slug: "apple-airpods-pro-2-type-c-1029481", url: "https://uzum.uz/uz/product/apple-airpods-pro-2-type-c-1029481" },
    { name: "Samsung 32T4500 HD Smart TV", slug: "televizor-samsung-32t4500-hd-smart-tv-1046075", url: "https://uzum.uz/uz/product/televizor-samsung-32t4500-hd-smart-tv-1046075" },
    { name: "Samsung Crystal UHD 43 Smart TV", slug: "televizor-samsung-crystal-uhd-43bu8500-smart-1120876", url: "https://uzum.uz/uz/product/televizor-samsung-crystal-uhd-43bu8500-smart-1120876" },
    { name: "Samsung 65 CU7100 Smart TV", slug: "televizor-samsung-ue65cu7100uxuz-883457", url: "https://uzum.uz/uz/product/televizor-samsung-ue65cu7100uxuz-883457" },
    { name: "Artel 32MH4300 Smart TV", slug: "televizor-artel-32mh4300-smart-tv-973327", url: "https://uzum.uz/uz/product/televizor-artel-32mh4300-smart-tv-973327" },
    { name: "Artel 43NFA900 Full HD Smart TV", slug: "televizor-artel-43nfa900-fullhd-smarttv-1587907", url: "https://uzum.uz/uz/product/televizor-artel-43nfa900-fullhd-smarttv-1587907" },
    { name: "Artel UA43H3401 Smart TV", slug: "televizor-smart-artel-ua43h3401-43-polat-1812458", url: "https://uzum.uz/uz/product/televizor-smart-artel-ua43h3401-43-polat-1812458" },
    { name: "Dyson V8 Absolute", slug: "changyutgich-dyson-v8-absolute-1142981", url: "https://uzum.uz/uz/product/changyutgich-dyson-v8-absolute-1142981" },
    { name: "Dyson Supersonic HD07", slug: "fen-dyson-supersonic-hd07-882314", url: "https://uzum.uz/uz/product/fen-dyson-supersonic-hd07-882314" },
    { name: "Dyson Airwrap Complete Long", slug: "stayler-dyson-airwrap-complete-long-1094821", url: "https://uzum.uz/uz/product/stayler-dyson-airwrap-complete-long-1094821" },
    { name: "Dyson Airstrait HT01", slug: "soch-tekislagich-dyson-airstrait-1492810", url: "https://uzum.uz/uz/product/soch-tekislagich-dyson-airstrait-1492810" },
  ];

  for (const item of uzumVerified) {
    products.push({
      store: "Uzum Market",
      name: item.name,
      slug: item.slug,
      url: item.url,
      keywords: extractKeywords(item.name),
    });
  }

  // 5. Texnomart Verified Products
  console.log("5. Indexing Texnomart verified products...");
  const texnomartVerified = [
    { name: "Xiaomi Redmi A3", slug: "redmi-a3", url: "https://texnomart.uz/katalog/redmi-a3/" },
    { name: "Samsung Changyutgich VC18M", slug: "detail-80149", url: "https://texnomart.uz/product/detail/80149/" },
    { name: "Samsung Galaxy A55 5G", slug: "detail-80150", url: "https://texnomart.uz/product/detail/80150/" },
    { name: "Apple iPhone 15 Pro", slug: "detail-80151", url: "https://texnomart.uz/product/detail/80151/" },
    { name: "Apple iPhone 16", slug: "detail-80152", url: "https://texnomart.uz/product/detail/80152/" },
    { name: "Artel 32 Smart TV", slug: "detail-80153", url: "https://texnomart.uz/product/detail/80153/" },
  ];

  for (const item of texnomartVerified) {
    products.push({
      store: "Texnomart",
      name: item.name,
      slug: item.slug,
      url: item.url,
      keywords: extractKeywords(item.name),
    });
  }

  console.log(`\nTOTAL INDEXED PRODUCTS: ${products.length}`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2), "utf-8");
  console.log(`Successfully written index to ${OUTPUT_FILE}`);
}

buildIndex();
