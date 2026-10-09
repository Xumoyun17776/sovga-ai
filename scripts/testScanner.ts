import { searchLiveMarketplaces } from "../server/services/liveStoreScanner.js";

async function test(q: string) {
  const start = Date.now();
  const items = await searchLiveMarketplaces(q);
  console.log(`[${Date.now() - start}ms] Query "${q}": found ${items.length} items`);
  items.forEach((it, idx) => {
    console.log(`  ${idx+1}. [${it.store}] ${it.title} -> ${it.price?.toLocaleString()} UZS | URL: ${it.url}`);
  });
}

async function run() {
  await test("iPhone 16");
}

run();
