import { aiResearchService } from "../server/services/aiResearchService.js";

async function testQuery(query: string) {
  console.log(`\n======================================================`);
  console.log(`TESTING: "${query}"`);
  console.log(`======================================================`);
  const start = Date.now();
  try {
    const res = await aiResearchService.executeQualityResearch(query);
    console.log(`[${Date.now() - start}ms] Success! Products count: ${res.products?.length}`);
    console.log(`Summary: ${res.researchSummary}`);
    console.log(`Price savings: ${res.priceSavings}`);

    console.log("\nTOP 6 PRODUCTS:");
    (res.products || []).slice(0, 6).forEach((p, idx) => {
      console.log(`${idx + 1}. [${p.store}] "${p.name}"`);
      console.log(`   Narx: ${p.price?.toLocaleString()} ${p.currency} | Chegirma: ${p.discount || 'yoʻq'}`);
      console.log(`   URL: ${p.url}`);
      console.log(`   Rasm: ${p.imageUrl ? p.imageUrl.slice(0, 75) + '...' : 'yoʻq'}`);
      console.log(`   Kafolat: ${p.warranty} | Yetkazish: ${p.deliveryEstimate}`);
      console.log(`   Badge: ${p.category}`);
    });

    const invalidUrls = (res.products || []).filter((p) =>
      !p.url ||
      p.url === "https://uzum.uz" ||
      p.url === "https://uzum.uz/" ||
      p.url === "https://asaxiy.uz" ||
      p.url === "https://olcha.uz" ||
      p.url.includes("?q=") ||
      p.url.includes("/search")
    );
    if (invalidUrls.length === 0) {
      console.log(`\n✅ ALL ${res.products.length} PRODUCTS HAVE 100% DIRECT PRODUCT PAGE URLS!`);
    } else {
      console.log(`\n⚠️ Found ${invalidUrls.length} invalid URLs!`);
    }
  } catch (err: any) {
    console.error("Query test error:", err);
  }
}

async function run() {
  await testQuery("iPhone 16 Pro Max");
  await testQuery("Samsung S24 Ultra");
  await testQuery("Dyson Airwrap");
  await testQuery("Konditsioner");
}

run();
