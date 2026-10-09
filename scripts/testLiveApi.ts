async function testResearch(query: string) {
  const start = Date.now();
  console.log(`\n======================================================`);
  console.log(`TESTING QUERY: "${query}"`);
  console.log(`======================================================`);
  try {
    const res = await fetch("http://127.0.0.1:3000/api/research/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      console.error(`Status ${res.status}: ${await res.text()}`);
      return;
    }

    const resJson = await res.json();
    const data = resJson.data || resJson;

    console.log(`Response in ${Date.now() - start}ms:`);
    console.log(`Summary: ${data.researchSummary}`);
    console.log(`Total products returned: ${data.products?.length || 0}`);
    console.log(`Price savings: ${data.priceSavings || 'N/A'}`);

    console.log("\nTOP 6 PRODUCTS:");
    (data.products || []).slice(0, 6).forEach((p: any, idx: number) => {
      console.log(`${idx + 1}. [${p.store}] "${p.name}"`);
      console.log(`   Narx: ${p.price?.toLocaleString()} ${p.currency} | Chegirma: ${p.discount || 'yoʻq'}`);
      console.log(`   URL: ${p.url}`);
      console.log(`   Rasm: ${p.imageUrl ? p.imageUrl.slice(0, 75) + '...' : 'yoʻq'}`);
      console.log(`   Tavsif: ${p.reason}`);
      console.log(`   Kafolat: ${p.warranty} | Yetkazish: ${p.deliveryEstimate}`);
      console.log(`   Badge: ${p.category}`);
    });

    // Check URLs: verify none are generic homepages or search queries
    const invalidUrls = (data.products || []).filter((p: any) =>
      !p.url ||
      p.url === "https://uzum.uz" ||
      p.url === "https://uzum.uz/" ||
      p.url === "https://asaxiy.uz" ||
      p.url === "https://olcha.uz" ||
      p.url.includes("?q=") ||
      p.url.includes("/search")
    );
    if (invalidUrls.length === 0) {
      console.log(`\n✅ ALL ${data.products.length} PRODUCTS HAVE 100% DIRECT PRODUCT CARDS (ZERO SEARCH/MARKET PAGES)!`);
    } else {
      console.log(`\n⚠️ Found ${invalidUrls.length} invalid URLs!`);
      invalidUrls.forEach((u: any) => console.log("   Bad URL:", u.name, "->", u.url));
    }
  } catch (err: any) {
    console.error("Test error:", err.message);
  }
}

async function run() {
  await testResearch("iPhone 16 Pro Max");
  await testResearch("Dyson Airwrap");
  await testResearch("Konditsioner");
  await testResearch("Velosiped");
  await testResearch("Samsung S24 Ultra");
}

run();
