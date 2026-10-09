process.loadEnvFile(".env");
import { aiResearchService } from "./server/services/aiResearchService.js";

try {
  console.log("Calling research for 'iPhone 15'...");
  const res = await aiResearchService.research("iPhone 15");
  console.log("Success! Products count:", res.products?.length);
  console.log("Model used:", res.modelUsed);
  console.log("Products:", res.products.slice(0, 3).map(p => ({
    name: p.name,
    store: p.store,
    price: p.price,
    url: p.url,
  })));
} catch (e) {
  console.error("Research error:", e);
}
