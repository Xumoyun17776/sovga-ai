import type { ShoppingProvider, ProviderProduct, SearchOptions } from "../../shared/types.js";
import { googleSearchProvider } from "./googleSearchProvider.js";
import { marketplaceProvider } from "./marketplaceProvider.js";
import { merchantProvider } from "./merchantProvider.js";

export class ProviderRegistry {
  private providers: ShoppingProvider[] = [];

  constructor() {
    this.register(marketplaceProvider);
    this.register(merchantProvider);
    this.register(googleSearchProvider);
  }

  register(provider: ShoppingProvider) {
    this.providers.push(provider);
  }

  async searchAll(query: string, options?: SearchOptions): Promise<ProviderProduct[]> {
    const results: ProviderProduct[] = [];
    const promises = this.providers.map(async (p) => {
      try {
        if (await p.isAvailable()) {
          const products = await p.searchProducts(query, options);
          results.push(...products);
        }
      } catch (e) {
        console.warn(`Provider ${p.name} failed:`, e);
      }
    });
    await Promise.allSettled(promises);
    return results;
  }

  getProviders() {
    return this.providers;
  }

  async getHealthStatus() {
    const statuses = await Promise.all(
      this.providers.map(async (p) => {
        const start = Date.now();
        let available = false;
        try {
          available = await p.isAvailable();
        } catch {
          available = false;
        }
        return {
          name: p.name,
          status: available ? ("online" as const) : ("degraded" as const),
          latencyMs: Date.now() - start,
          type: p.name.includes("Marketplace")
            ? "Marketplace Adapter"
            : p.name.includes("Merchant")
            ? "Direct Merchant Feed"
            : "Grounding Provider",
        };
      })
    );
    return statuses;
  }
}

export const providerRegistry = new ProviderRegistry();
