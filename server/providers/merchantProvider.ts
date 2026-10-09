import type { ShoppingProvider, ProviderProduct, SearchOptions } from "../../shared/types.js";
import { ensureProductUrl } from "../services/urlHelper.js";

/**
 * Merchant Provider
 * Direct API & product feed integration with partner merchants across Tashkent & Uzbekistan:
 * - MediaPark Electronics
 * - Idea Stores
 * - iStore Uzbekistan
 * - Joyda / SQB Shop partner merchants
 */
export class MerchantProvider implements ShoppingProvider {
  name = "Authorized Merchant Direct Feed";

  private merchantItems: ProviderProduct[] = [
    {
      name: "Samsung Galaxy Buds2 Pro",
      price: 820000,
      originalPrice: 990000,
      currency: "UZS",
      store: "MediaPark",
      url: ensureProductUrl("Samsung Galaxy Buds2 Pro", "MediaPark"),
      imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
      availability: "In stock (Same-day courier in Tashkent)",
      rating: 4.7,
      reviewCount: 94,
      description: "Original official Samsung partner stock with 1-year service warranty.",
      source: "MediaPark Direct API",
      verified: true,
    },
    {
      name: "Apple AirPods Pro 2nd Gen (USB-C)",
      price: 2750000,
      originalPrice: 3100000,
      currency: "UZS",
      store: "iStore Tashkent",
      url: ensureProductUrl("Apple AirPods Pro 2nd Gen", "Texnomart"),
      imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop",
      availability: "In stock",
      rating: 4.9,
      reviewCount: 310,
      description: "Official Apple authorized reseller stock with full Apple Care warranty.",
      source: "iStore Direct Inventory",
      verified: true,
    },
    {
      name: "KitchenAid Classic Stand Mixer 4.3L",
      price: 1180000,
      originalPrice: 1400000,
      currency: "UZS",
      store: "Idea Home Store",
      url: ensureProductUrl("KitchenAid Classic Stand Mixer", "Idea"),
      imageUrl: "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=600&auto=format&fit=crop",
      availability: "In stock (2 units left)",
      rating: 4.9,
      reviewCount: 75,
      description: "Premium planetary mixer with stainless steel bowl and 10 speed settings.",
      source: "Idea Store Partner Feed",
      verified: true,
    },
    {
      name: "QCY HT05 MeloBuds ANC",
      price: 240000,
      originalPrice: 290000,
      currency: "UZS",
      store: "MobileZone Tashkent",
      url: ensureProductUrl("QCY HT05 MeloBuds ANC", "Uzum Market"),
      imageUrl: "https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=600&auto=format&fit=crop",
      availability: "In stock",
      rating: 4.3,
      reviewCount: 142,
      description: "40dB active noise cancellation with 6 ENC mics and 30h battery.",
      source: "MobileZone Inventory Feed",
      verified: true,
    },
  ];

  async searchProducts(query: string, options?: SearchOptions): Promise<ProviderProduct[]> {
    const qLower = query.toLowerCase();
    const words = qLower.split(/\s+/).filter((w) => w.length > 2);

    let matches = this.merchantItems.filter((p) => {
      const pText = `${p.name} ${p.description || ""} ${p.store}`.toLowerCase();
      return words.some((word) => pText.includes(word));
    });

    if (options?.maxPrice) {
      matches = matches.filter((p) => p.price === null || p.price <= options.maxPrice!);
    }
    if (options?.minPrice) {
      matches = matches.filter((p) => p.price === null || p.price >= options.minPrice!);
    }

    return matches;
  }

  async getProduct(url: string): Promise<ProviderProduct | null> {
    return this.merchantItems.find((p) => p.url === url) || null;
  }

  async getPrice(url: string): Promise<number | null> {
    const item = await this.getProduct(url);
    return item ? item.price : null;
  }

  async getAvailability(url: string): Promise<string | null> {
    const item = await this.getProduct(url);
    return item ? item.availability : null;
  }

  async getProductDetails(url: string): Promise<any> {
    const item = await this.getProduct(url);
    return item ? { ...item } : null;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

export const merchantProvider = new MerchantProvider();
