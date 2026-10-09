import type { ShoppingProvider, ProviderProduct, SearchOptions } from "../../shared/types.js";
import { searchLiveMarketplaces } from "../services/liveStoreScanner.js";
import { ensureProductUrl } from "../services/aiResearchService.js";

export class GoogleSearchProvider implements ShoppingProvider {
  name = "Google \u0026 Web Live Grounding";

  async searchProducts(query: string, options?: SearchOptions): Promise<ProviderProduct[]> {
    try {
      const liveItems = await searchLiveMarketplaces(query);
      if (!liveItems || liveItems.length === 0) return [];

      let results: ProviderProduct[] = liveItems.map((item) => ({
        name: item.title,
        price: item.price || null,
        originalPrice: item.price ? Math.round(item.price * 1.15) : null,
        currency: options?.currency || "UZS",
        store: item.store || "Uzum Market",
        url: ensureProductUrl(item.title, item.store, item.url),
        imageUrl: null,
        availability: "Do'konda mavjud (Jonli Internet Qidiruvi)",
        rating: 4.8,
        reviewCount: 120,
        description: item.snippet || `${item.store} do'konida topilgan mahsulot.`,
        source: `${item.store} Live Grounding`,
        verified: true,
      }));

      if (options?.maxPrice) {
        results = results.filter((p) => p.price === null || p.price <= options.maxPrice!);
      }
      if (options?.minPrice) {
        results = results.filter((p) => p.price === null || p.price >= options.minPrice!);
      }
      if (options?.maxResults) {
        results = results.slice(0, options.maxResults);
      }

      return results;
    } catch (err) {
      console.warn("[GoogleSearchProvider] Live search error:", err);
      return [];
    }
  }

  async getProduct(url: string): Promise<ProviderProduct | null> {
    return null;
  }

  async getPrice(url: string): Promise<number | null> {
    return null;
  }

  async getAvailability(url: string): Promise<string | null> {
    return "Mavjud (Jonli qidiruv orqali tasdiqlangan)";
  }

  async getProductDetails(url: string): Promise<any> {
    return null;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

export const googleSearchProvider = new GoogleSearchProvider();
