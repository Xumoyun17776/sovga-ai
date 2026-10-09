import { searchLiveMarketplaces } from "../server/services/liveStoreScanner.js";
import { synthesizeProductsForQuery } from "../server/services/productCatalogSynthesizer.js";
import { storage } from "../server/storage.js";

async function bench() {
  const q = "Samsung S24 Ultra";
  console.log("Starting benchmark for:", q);

  let t0 = Date.now();
  const live = await searchLiveMarketplaces(q);
  console.log(`[${Date.now() - t0}ms] searchLiveMarketplaces: found ${live.length}`);

  t0 = Date.now();
  const synth = synthesizeProductsForQuery(q, {}, live);
  console.log(`[${Date.now() - t0}ms] synthesizeProductsForQuery: found ${synth.products.length}`);

  t0 = Date.now();
  const cat = storage.searchCatalog(q, {});
  console.log(`[${Date.now() - t0}ms] storage.searchCatalog: found ${cat.length}`);
}

bench();
