import fs from "fs";
import path from "path";
import type { 
  RegistryData, RegistryItemData, WishlistData, WishlistItemData, EventReminderData, PriceTrackerData, CatalogProductItem, SubscriptionReceiptRecord 
} from "../shared/types.js";
import { ensureProductUrl } from "./services/urlHelper.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/** Password for a seeded account: from the env var, or a random one printed once to the server log. */
function seedPassword(envVar: string, email: string): string {
  const fromEnv = (process.env[envVar] || "").trim();
  if (fromEnv.length >= 8) return fromEnv;
  const generated = crypto.randomBytes(9).toString("base64url");
  console.warn(`[Security] Password for ${email} set to a random value: ${generated}  (set ${envVar} in .env to choose your own)`);
  return generated;
}

/** Well-known demo passwords that must never work on a real deployment. */
const KNOWN_DEFAULT_PASSWORDS = ["admin123", "user123"];
import { rankByRelevance, baseProductName, displayProductName } from "./services/searchRelevance.js";
import { mongoService } from "./db/mongo.js";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "database.json");
/**
 * The product catalog (products, offers, price history) is ~20MB and rarely changes, while user data
 * (accounts, wishlists, orders…) is tiny and changes all the time. They are saved to separate files so a
 * user action no longer rewrites 20MB. Old single-file databases are read as before and split on the next save.
 */
const CATALOG_FILE = path.join(DATA_DIR, "catalog.json");

export const PROHIBITED_CONTENT_REGEX = /\b(dildo|vibrator|fleshlight|butt\s*plug|porno|porn|xxx|sex\s*toy|anal\s*toy|fuck\s*toy)\b/i;

export function isProhibitedContent(text?: string | null): boolean {
  if (!text || typeof text !== "string") return false;
  return PROHIBITED_CONTENT_REGEX.test(text.trim());
}

interface ConceptMapping {
  terms: string[];
  productKeywords: string[];
  categoryBoost?: string;
  defaultOccasion?: string;
}

const SEMANTIC_CONCEPTS: ConceptMapping[] = [
  // Coffee & Hot Drinks
  {
    terms: ["qahva", "kofe", "coffee", "espresso", "kapuchino", "kaputshino", "kofemashina", "kofe mashina", "qahva mashinasi", "dolce gusto", "delonghi", "korkmaz", "kahvekolik", "кофе", "кофемашина", "кофеварка", "капучино", "эспрессо"],
    productKeywords: ["dolce gusto", "coffee", "delonghi", "kahvekolik", "korkmaz"],
    categoryBoost: "Kitchen",
  },
  // Tea & Ceramics
  {
    terms: ["choy", "choynak", "choy to'plami", "piyola", "lag'an", "kulol", "kulolchilik", "rishton", "samovarchik", "tea", "chaynik", "posuda", "чай", "чайник", "сервиз", "пиала", "ляган", "риштанить", "риштана", "керамика"],
    productKeywords: ["rishton", "tea set", "ceramic", "lag'an", "piyola"],
    categoryBoost: "Artisanal",
  },
  // Dinnerware & Kitchen Prep
  {
    terms: ["tarelka", "tovoq", "dasturxon", "idish", "posuda", "serviz", "luminarc", "dinnerware", "vilka", "qoshiq", "посуда", "тарелки", "столовый сервиз", "люминарк"],
    productKeywords: ["luminarc", "dinnerware"],
    categoryBoost: "Dining & Kitchen",
  },
  // TVs & Entertainment
  {
    terms: ["televizor", "tv", "smart tv", "oled", "qled", "android tv", "google tv", "телевизор", "телик", "смарт тв"],
    productKeywords: ["smart tv", "televizor", "crystal uhd", "4k uhd"],
    categoryBoost: "TV & Video",
  },
  // Audio & Headphones
  {
    terms: ["naushnik", "quloqchin", "headphones", "earbuds", "airpods", "buds", "marshall", "sony", "ovoz", "musiqa", "anc", "garnitura", "наушники", "наушник", "гарнитура", "вкладыши", "беспроводные наушники", "эйрподс"],
    productKeywords: ["airpods", "wh-1000xm5", "buds2", "major iv", "headphones"],
    categoryBoost: "Audio",
  },
  // Smart Home & Cleaning / Vacuums
  {
    terms: ["pilesos", "changyutgich", "vacuum", "robot", "roborock", "dyson", "tozalash", "uborka", "pol", "пылесос", "робот-пылесос", "пылесосы", "уборка"],
    productKeywords: ["roborock", "vacuum", "dyson v12"],
    categoryBoost: "Home Appliances",
  },
  // Beauty & Styling & Perfume
  {
    terms: ["fen", "stayler", "dyson", "airwrap", "soch", "go'zallik", "parfyum", "atir", "duxi", "dior", "sauvage", "kosmetika", "духи", "парфюм", "фен", "стайлер", "красота"],
    productKeywords: ["dyson airwrap", "dior sauvage", "styler"],
    categoryBoost: "Personal Care",
  },
  // Cooking & Appliances
  {
    terms: ["mikser", "blender", "gril", "oshxona", "qozon", "qozon-tovoq", "namangan", "toster", "tefal", "kitchenaid", "air fryer", "qovurgich", "aerogrill", "kazan", "миксер", "блендер", "гриль", "кухня", "казан", "аэрогриль"],
    productKeywords: ["kitchenaid", "optigrill", "kazan", "air fryer"],
    categoryBoost: "Kitchen",
  },
  // Smartwatches & Wearables
  {
    terms: ["soat", "aqlli soat", "chasi", "smartwatch", "apple watch", "watch", "часы", "смарт-часы", "умные часы"],
    productKeywords: ["apple watch", "gps"],
    categoryBoost: "Tech",
  },
  // Reading & E-readers
  {
    terms: ["kitob", "kniga", "o'qish", "mutolaa", "kindle", "elektron kitob", "e-reader", "книга", "книги", "электронная книга", "читалка"],
    productKeywords: ["kindle paperwhite"],
    categoryBoost: "Books & Lifestyle",
  },
  // Keyboards & Computing
  {
    terms: ["klaviatura", "kompyuter", "mexanik", "keychron", "klava", "dasturchi", "it", "geymer", "numpad", "клавиатура", "механическая клавиатура"],
    productKeywords: ["keychron k2 pro"],
    categoryBoost: "Tech",
  },
  // Baby & Nursery
  {
    terms: ["chaqaloq", "bola", "bolalar", "yangi chaqaloq", "beshik", "baby", "krovatka", "radioganyana", "chicco", "philips avent", "bolajon", "chaqaloqqa", "малыш", "ребенок", "новорожденный", "кроватка", "радионяня"],
    productKeywords: ["baby hug", "audio baby monitor"],
    categoryBoost: "Baby & Kids",
  },
  // Grooming & Shaving
  {
    terms: ["soqol", "britva", "shaver", "ustara", "philips", "soqol olish", "бритва", "электробритва"],
    productKeywords: ["electric shaver", "philips series 3000"],
    categoryBoost: "Personal Care",
  },
  // Speakers & Outdoor Audio
  {
    terms: ["kolonka", "dinamik", "bluetooth", "karnay", "jbl", "akustika", "bass", "spiker", "колонка", "портативная колонка", "динамик"],
    productKeywords: ["jbl charge 5", "speaker"],
    categoryBoost: "Audio",
  },
  // Traditional Silk & Artisanal Crafts
  {
    terms: ["ipak", "atlas", "adras", "shoyi", "marg'ilon", "buxoro", "zardo'zi", "ro'mol", "sharf", "mushk", "sandıqcha", "shkatulka", "zargarlik", "suvenir", "milliy", "шелк", "шарф", "шкатулка", "сувенир"],
    productKeywords: ["zardozi", "adras", "jewelry box", "samarkand", "silk"],
    categoryBoost: "Artisanal",
  },
  // Occasion: Wedding
  {
    terms: ["to'y", "svadba", "wedding", "kelinsalom", "kuyov", "kelin", "nikoh", "sarpo", "свадьба", "на свадьбу", "молодоженам"],
    productKeywords: ["dolce gusto", "luminarc", "kitchenaid", "tea set", "optigrill", "roborock", "kazan"],
    defaultOccasion: "wedding",
  },
  // Recipient: Mother / Women
  {
    terms: ["onamga", "onam", "ona", "mother", "mama", "ayolga", "ayollar", "dugonam", "qizga", "sevganimga", "rafiqamga", "ayolimga", "мама", "маме", "женщине", "девушке", "жене"],
    productKeywords: ["dolce gusto", "dyson airwrap", "tea set", "jewelry box", "luminarc", "airpods", "silk scarf"],
  },
  // Recipient: Father / Men
  {
    terms: ["otamga", "otam", "ota", "father", "papa", "dadamga", "dada", "erkak", "erkakka", "erimga", "turmush o'rtog'imga", "yigitga", "akamga", "ukamga", "папа", "папе", "отцу", "мужчине", "парню", "мужу", "брату"],
    productKeywords: ["shaver", "dior sauvage", "jbl charge", "apple watch", "keychron", "kazan", "wh-1000xm5"],
  },
];

export function extractQueryBudget(query: string): number | null {
  const q = query.toLowerCase();
  const kMatch = q.match(/(\d+(?:[.,]\d+)?)\s*k\b/i);
  if (kMatch) return Math.round(parseFloat(kMatch[1].replace(",", ".")) * 1000);

  const mingMatch = q.match(/(\d+(?:[.,]\d+)?)\s*(?:ming|тыс|тысяч)/i);
  if (mingMatch) return Math.round(parseFloat(mingMatch[1].replace(",", ".")) * 1000);

  const mlnMatch = q.match(/(\d+(?:[.,]\d+)?)\s*(?:mln|million|миллион|млн)/i);
  if (mlnMatch) return Math.round(parseFloat(mlnMatch[1].replace(",", ".")) * 1000000);

  const rawNumMatch = q.match(/(\d{2,3}[ _.]\d{3})/);
  if (rawNumMatch) return parseInt(rawNumMatch[1].replace(/[ _.]/g, ""), 10);

  return null;
}

export interface IStorage {
  // Users
  createUser(data: { email?: string; phone?: string; password?: string; name: string; googleId?: string; role?: string }): any;
  getUserByEmail(email: string): any;
  getUserByIdentifier(identifier: string): any;
  getUserById(id: number): any;
  getAllUsers(): any[];
  updateUser(userId: number, fields: any): any;
  updateUserRole(userId: number, role: string): void;
  deleteUser(userId: number): boolean;

  // Catalog Products & Multi-Store Offers
  getProducts(limit?: number): any[];
  getProductById(id: number): any;
  getProductWithOffers(id: number): any;
  searchCatalog(query: string, options?: any): any[];
  filterCatalog(params: { category?: string; store?: string; minPrice?: number; maxPrice?: number; q?: string; sort?: string; limit?: number }): any[];
  getCategories(): { name: string; count: number; icon: string }[];
  getProductOffers(productId: number): any[];
  getPriceHistory(productId: number, limit?: number): any[];
  recordPriceObservation(productId: number, store: string, price: number): void;

  // Price Drop Trackers
  createPriceTracker(data: any): PriceTrackerData;
  getPriceTrackers(userId: number): PriceTrackerData[];
  getAllPriceTrackers(): PriceTrackerData[];
  updatePriceTracker(id: number, data: Partial<PriceTrackerData>): PriceTrackerData | null;
  deletePriceTracker(id: number): void;

  // Wedding Registries
  getRegistriesByUser(userId: number): any[];
  createRegistry(data: any): any;
  getRegistryBySlug(slug: string): any;
  getRegistryById(id: number): any;
  updateRegistry(id: number, data: any): any;
  deleteRegistry(id: number): void;

  // Registry Items
  getRegistryItems(registryId: number): any[];
  createRegistryItem(data: any): any;
  updateRegistryItem(id: number, data: any): any;
  deleteRegistryItem(id: number): void;
  getRegistryItemById(id: number): any;

  // Registry Reservations
  createReservation(data: any): any;
  getReservationsByItem(itemId: number): any[];

  // Wishlists
  getWishlistsByUser(userId: number): any[];
  createWishlist(data: any): any;
  getWishlistById(id: number): any;
  updateWishlist(id: number, data: any): any;
  deleteWishlist(id: number): void;

  // Wishlist Items
  getWishlistItems(wishlistId: number): any[];
  createWishlistItem(data: any): any;
  updateWishlistItem(id: number, data: any): any;
  deleteWishlistItem(id: number): void;

  // Event Reminders
  getRemindersByUser(userId: number): any[];
  createReminder(data: any): any;
  updateReminder(id: number, data: any): any;
  deleteReminder(id: number): void;
  getUpcomingReminders(userId: number, daysAhead: number): any[];

  // Search History
  createSearchRecord(data: any): any;
  getRecentSearches(limit: number): any[];
  getSearchCount(): number;

  // Saved Products
  getSavedByUser(userId: number): any[];
  createSaved(data: any): any;
  deleteSaved(id: number): void;

  // Orders (Direct Purchases)
  createOrder(data: any): any;
  getOrders(userId?: number): any[];
  getOrderById(id: number): any;
  updateOrderStatus(id: number, status: string): any;
  getOrderCount(): number;

  // Admin stats
  getUserCount(): number;
  getRegistryCount(): number;
  getWishlistCount(): number;
  getSavedCount(): number;
  getProductCount(): number;
}

class PersistentStorage implements IStorage {
  private users = new Map<number, any>();
  private products = new Map<number, any>();
  private offers = new Map<number, any>();
  private offersByProductId = new Map<number, any[]>();
  private priceHistory: any[] = [];
  private priceTrackers = new Map<number, any>();
  private registries = new Map<number, any>();
  private registryItems = new Map<number, any>();
  private reservations = new Map<number, any>();
  private wishlists = new Map<number, any>();
  private wishlistItems = new Map<number, any>();
  private reminders = new Map<number, any>();
  private searches: any[] = [];
  private saved = new Map<number, any>();
  private orders = new Map<number, any>();
  private merchantProducts = new Map<number, any>();
  private promocodes = new Map<number, any>();
  private receipts = new Map<number, SubscriptionReceiptRecord>();
  private nextId: Record<string, number> = {};

  constructor() {
    this.init();
    // Purge any prohibited items or registries
    for (const [id, item] of this.registryItems) {
      if (isProhibitedContent(item.name) || isProhibitedContent(item.description)) {
        this.registryItems.delete(id);
      }
    }
    for (const [id, reg] of this.registries) {
      if (isProhibitedContent(reg.message) || isProhibitedContent(reg.slug)) {
        this.deleteRegistry(id);
      }
    }
  }

  private id(table: string): number {
    this.nextId[table] = (this.nextId[table] || 0) + 1;
    return this.nextId[table];
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.users && !parsed.products && fs.existsSync(CATALOG_FILE)) {
          const cat = JSON.parse(fs.readFileSync(CATALOG_FILE, "utf-8"));
          parsed.products = cat.products || [];
          parsed.offers = cat.offers || [];
          parsed.priceHistory = cat.priceHistory || [];
          this.catalogDirty = false;
        }
        if (parsed.users && parsed.products) {
          this.loadFromObject(parsed);
          this.secureDefaultAccounts();
          console.log(`Loaded ${this.products.size} products from persistent database: ${DB_FILE}`);
          this.initMongo();
          return;
        }
      } catch (e) {
        // Keep a copy of the unreadable file so user data is never silently lost by re-seeding.
        try {
          const backup = DB_FILE.replace(/\.json$/, `.corrupt-${Date.now()}.json`);
          fs.copyFileSync(DB_FILE, backup);
          console.warn(`Failed to parse database.json (backup saved to ${backup}), re-seeding verified catalog:`, e);
        } catch {
          console.warn("Failed to parse database.json, re-seeding verified catalog:", e);
        }
      }
    }

    this.seed();
    this.persist();
    this.initMongo();
  }

  /**
   * The demo accounts admin@sovga.uz / user@sovga.uz used to ship with the passwords "admin123" / "user123",
   * which are visible in the source code. If an account still uses one of them, change it:
   * to ADMIN_PASSWORD / DEMO_USER_PASSWORD from .env when set, otherwise to a random password printed in the log.
   */
  private secureDefaultAccounts() {
    let changed = false;
    for (const u of this.users.values()) {
      if (!u?.password || typeof u.password !== "string" || !u.password.startsWith("$2")) continue;
      const usesDefault = KNOWN_DEFAULT_PASSWORDS.some((p) => {
        try { return bcrypt.compareSync(p, u.password); } catch { return false; }
      });
      if (!usesDefault) continue;
      const envVar = u.role === "admin" || u.email === "admin@sovga.uz" ? "ADMIN_PASSWORD" : "DEMO_USER_PASSWORD";
      u.password = bcrypt.hashSync(seedPassword(envVar, u.email || u.phone || `user #${u.id}`), 10);
      changed = true;
    }
    if (changed) this.persist();
  }

  private async initMongo() {
    try {
      const ok = await mongoService.connect();
      if (ok) {
        // 1. Hydrate memory from MongoDB if remote documents exist
        const remoteData = await mongoService.fetchAllData();
        if (remoteData) {
          if (remoteData.users?.length) {
            remoteData.users.forEach((u: any) => {
              const existing = this.users.get(u.id);
              if (!u.password && existing?.password) {
                u.password = existing.password;
              }
              const normalizedEmail = String(u.email || "").toLowerCase().trim();
              if (normalizedEmail === "baxorasaidova@gmail.com") u.role = "admin";
              else if (normalizedEmail === "oriftilavkulov@gmail.com") u.role = "user";
              this.users.set(u.id, u);
              if (!this.nextId["users"] || u.id >= this.nextId["users"]) {
                this.nextId["users"] = u.id;
              }
            });
          }
          this.secureDefaultAccounts();
          if (remoteData.registries?.length) {
            remoteData.registries.forEach((r: any) => {
              if (isProhibitedContent(r.message) || isProhibitedContent(r.slug)) return;
              this.registries.set(r.id, r);
              if (!this.nextId["registries"] || r.id >= this.nextId["registries"]) {
                this.nextId["registries"] = r.id;
              }
            });
          }
          if (remoteData.registryItems?.length) {
            remoteData.registryItems.forEach((ri: any) => {
              if (isProhibitedContent(ri.name) || isProhibitedContent(ri.description)) return;
              this.registryItems.set(ri.id, ri);
              if (!this.nextId["registryItems"] || ri.id >= this.nextId["registryItems"]) {
                this.nextId["registryItems"] = ri.id;
              }
            });
          }
          if (remoteData.wishlists?.length) {
            remoteData.wishlists.forEach((w: any) => {
              this.wishlists.set(w.id, w);
              if (!this.nextId["wishlists"] || w.id >= this.nextId["wishlists"]) {
                this.nextId["wishlists"] = w.id;
              }
            });
          }
          if (remoteData.wishlistItems?.length) {
            remoteData.wishlistItems.forEach((wi: any) => {
              this.wishlistItems.set(wi.id, wi);
              if (!this.nextId["wishlistItems"] || wi.id >= this.nextId["wishlistItems"]) {
                this.nextId["wishlistItems"] = wi.id;
              }
            });
          }
          if (remoteData.reminders?.length) {
            remoteData.reminders.forEach((rem: any) => {
              this.reminders.set(rem.id, rem);
              if (!this.nextId["reminders"] || rem.id >= this.nextId["reminders"]) {
                this.nextId["reminders"] = rem.id;
              }
            });
          }
          if (remoteData.priceTrackers?.length) {
            remoteData.priceTrackers.forEach((pt: any) => {
              this.priceTrackers.set(pt.id, pt);
              if (!this.nextId["priceTrackers"] || pt.id >= this.nextId["priceTrackers"]) {
                this.nextId["priceTrackers"] = pt.id;
              }
            });
          }
          if (remoteData.saved?.length) {
            remoteData.saved.forEach((s: any) => {
              this.saved.set(s.id, s);
              if (!this.nextId["saved"] || s.id >= this.nextId["saved"]) {
                this.nextId["saved"] = s.id;
              }
            });
          }
          if (remoteData.orders?.length) {
            remoteData.orders.forEach((o: any) => {
              this.orders.set(o.id, o);
              if (!this.nextId["orders"] || o.id >= this.nextId["orders"]) {
                this.nextId["orders"] = o.id;
              }
            });
          }
        }

        // 2. Sync verified baseline catalog into MongoDB
        await mongoService.syncInitialData({
          users: [...this.users.values()].filter((u: any) => !u.isDemo), // test accounts stay local
          products: [...this.products.values()],
          offers: [...this.offers.values()],
          registries: [...this.registries.values()],
          wishlists: [...this.wishlists.values()],
        });
      }
    } catch (e: any) {
      console.warn("ℹ️ [MongoDB Init Notice]:", e?.message);
    }
  }

  private persistTimer: ReturnType<typeof setTimeout> | null = null;
  /** True when products/offers/price history changed since catalog.json was last written. */
  private catalogDirty = true;
  private exitHooksInstalled = false;

  /**
   * Schedule a save. The database file is ~25MB, so writing it synchronously on
   * every change blocked the whole server. Writes are now batched (debounced)
   * and flushed on shutdown.
   */
  private persist() {
    if (!this.exitHooksInstalled) {
      this.exitHooksInstalled = true;
      const flush = () => this.flushNow();
      process.once("beforeExit", flush);
      process.once("SIGINT", () => { flush(); process.exit(0); });
      process.once("SIGTERM", () => { flush(); process.exit(0); });
    }
    if (this.persistTimer) return;
    this.persistTimer = setTimeout(() => {
      this.persistTimer = null;
      this.flushNow();
    }, 1500);
  }

  /** Write the database to disk immediately, atomically (temp file + rename). */
  flushNow() {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = {
        format: 2,
        users: [...this.users.values()],
        priceTrackers: [...this.priceTrackers.values()],
        registries: [...this.registries.values()],
        registryItems: [...this.registryItems.values()],
        reservations: [...this.reservations.values()],
        wishlists: [...this.wishlists.values()],
        wishlistItems: [...this.wishlistItems.values()],
        reminders: [...this.reminders.values()],
        searches: this.searches,
        saved: [...this.saved.values()],
        orders: [...this.orders.values()],
        receipts: [...this.receipts.values()],
        merchantProducts: [...this.merchantProducts.values()],
        nextId: this.nextId,
        lastSaved: new Date().toISOString(),
      };
      // Catalog first, so database.json never points at a catalog that wasn't written
      if (this.catalogDirty || !fs.existsSync(CATALOG_FILE)) {
        const cat = {
          products: [...this.products.values()],
          offers: [...this.offers.values()],
          priceHistory: this.priceHistory,
          lastSaved: new Date().toISOString(),
        };
        const ctmp = `${CATALOG_FILE}.tmp`;
        fs.writeFileSync(ctmp, JSON.stringify(cat), "utf-8");
        fs.renameSync(ctmp, CATALOG_FILE);
        this.catalogDirty = false;
      }
      const tmp = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(data), "utf-8");
      fs.renameSync(tmp, DB_FILE);
    } catch (e) {
      console.error("Error saving persistent database:", e);
    }
  }

  private loadFromObject(data: any) {
    (data.users || []).forEach((u: any) => {
      const normalizedEmail = String(u.email || "").toLowerCase().trim();
      if (normalizedEmail === "baxorasaidova@gmail.com") u.role = "admin";
      else if (normalizedEmail === "oriftilavkulov@gmail.com") u.role = "user";
      this.users.set(u.id, u);
    });
    (data.products || []).forEach((p: any) => this.products.set(p.id, p));
    this.offersByProductId.clear();
    (data.offers || []).forEach((o: any) => {
      this.offers.set(o.id, o);
      let list = this.offersByProductId.get(o.productId);
      if (!list) {
        list = [];
        this.offersByProductId.set(o.productId, list);
      }
      list.push(o);
    });
    this.priceHistory = data.priceHistory || [];
    (data.priceTrackers || []).forEach((t: any) => this.priceTrackers.set(t.id, t));
    (data.registries || []).forEach((r: any) => {
      if (isProhibitedContent(r.message) || isProhibitedContent(r.slug)) return;
      this.registries.set(r.id, r);
    });
    (data.registryItems || []).forEach((ri: any) => {
      if (isProhibitedContent(ri.name) || isProhibitedContent(ri.description)) return;
      this.registryItems.set(ri.id, ri);
    });
    (data.reservations || []).forEach((res: any) => this.reservations.set(res.id, res));
    (data.wishlists || []).forEach((w: any) => this.wishlists.set(w.id, w));
    (data.wishlistItems || []).forEach((wi: any) => this.wishlistItems.set(wi.id, wi));
    (data.reminders || []).forEach((rem: any) => this.reminders.set(rem.id, rem));
    this.searches = data.searches || [];
    (data.saved || []).forEach((s: any) => this.saved.set(s.id, s));
    (data.orders || []).forEach((o: any) => this.orders.set(o.id, o));
    (data.receipts || []).forEach((r: any) => this.receipts.set(r.id, r));
    (data.merchantProducts || []).forEach((m: any) => this.merchantProducts.set(m.id, m));
    this.nextId = data.nextId || {};
  }

  private seed() {
    // ── 1. Demo Users ────────────────────────────────────────────────────────
    const admin = {
      id: this.id("users"), email: "admin@sovga.uz",
      password: bcrypt.hashSync(seedPassword("ADMIN_PASSWORD", "admin@sovga.uz"), 10),
      name: "Admin", role: "admin", preferredLanguage: "uz", createdAt: new Date(), updatedAt: new Date(),
    };
    const user1 = {
      id: this.id("users"), email: "user@sovga.uz",
      password: bcrypt.hashSync(seedPassword("DEMO_USER_PASSWORD", "user@sovga.uz"), 10),
      name: "Jasur Karimov", role: "user", preferredLanguage: "uz", createdAt: new Date(), updatedAt: new Date(),
    };
    this.users.set(admin.id, admin);
    this.users.set(user1.id, user1);

    // ── 2. Comprehensive Verified Uzbek Product Catalog (26 Products) ────────
    const catalogData = [
      // 1. Kitchen & Home
      {
        name: "De'Longhi Nescafé Dolce Gusto Mini Me Capsule Coffee Machine",
        category: "Kitchen & Home", brand: "De'Longhi",
        imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop",
        description: "Compact 15-bar automatic espresso machine. Hot & cold beverage selector, energy saving auto-off mode.",
        specs: { "Pressure": "15 Bar", "Tank Capacity": "0.8 L", "Power": "1500W", "Warranty": "24 Months", "Origin": "Italy / EU" },
        offers: [
          { store: "Uzum Market", price: 650000, originalPrice: 790000, discount: "18% off", url: "https://uzum.uz/ru/product/kofemashina-delonghi-mini-me", availability: "In stock (1-day Tashkent)", rating: 4.8, reviewCount: 320, verified: true, isLowestPrice: true, deliveryTime: "Next day delivery in Tashkent", installment: "Uzum Nasiya: 12 x 65,000 UZS/oy" },
          { store: "Texnomart", price: 665000, originalPrice: 750000, discount: "11% off", url: "https://texnomart.uz/ru/katalog/delonghi-mini-me", availability: "In stock in 12 branches", rating: 4.7, reviewCount: 110, verified: true, isLowestPrice: false, deliveryTime: "Same-day store pickup", installment: "Texnomart: 6 x 122,000 UZS/oy" },
          { store: "MediaPark", price: 690000, originalPrice: null, discount: null, url: "https://mediapark.uz/products/delonghi-mini-me", availability: "In stock", rating: 4.6, reviewCount: 85, verified: true, isLowestPrice: false, deliveryTime: "1-2 days courier", installment: "Anorbank: 12 x 69,000 UZS/oy" },
          { store: "Idea Store", price: 680000, originalPrice: 740000, discount: "8% off", url: "https://idea.uz/products/delonghi-mini-me", availability: "Available", rating: 4.5, reviewCount: 42, verified: true, isLowestPrice: false, deliveryTime: "1-2 business days", installment: "Zoodpay 0% x 4" },
        ],
        history: [
          { daysAgo: 30, price: 780000, store: "Average Market" },
          { daysAgo: 20, price: 740000, store: "Average Market" },
          { daysAgo: 10, price: 690000, store: "Average Market" },
          { daysAgo: 0, price: 650000, store: "Uzum Market" },
        ],
      },
      // 2. Dining & Kitchen
      {
        name: "Luminarc Essence 46-Piece French Dinnerware Set",
        category: "Dining & Kitchen", brand: "Luminarc",
        imageUrl: "https://images.unsplash.com/photo-1614088445100-36653df3b8fe?w=600&auto=format&fit=crop",
        description: "Tempered opal glass dinner set for 6 persons. Resistant to mechanical shocks and dishwasher safe.",
        specs: { "Pieces": "46 items", "Material": "Opal Tempered Glass", "Persons": "6 persons", "Dishwasher Safe": "Yes", "Origin": "France" },
        offers: [
          { store: "Uzum Market", price: 480000, originalPrice: 560000, discount: "14% off", url: "https://uzum.uz/ru/product/luminarc-essence-46", availability: "In stock", rating: 4.7, reviewCount: 189, verified: true, isLowestPrice: true, deliveryTime: "1 business day", installment: "Uzum Nasiya: 6 x 89,000 UZS/oy" },
          { store: "Idea Home", price: 495000, originalPrice: 550000, discount: "10% off", url: "https://idea.uz/products/luminarc-essence-46", availability: "In stock", rating: 4.6, reviewCount: 65, verified: true, isLowestPrice: false, deliveryTime: "1-2 days", installment: "Zoodpay 0% x 4" },
          { store: "MediaPark", price: 510000, originalPrice: null, discount: null, url: "https://mediapark.uz/products/luminarc-essence", availability: "In stock", rating: 4.5, reviewCount: 40, verified: true, isLowestPrice: false, deliveryTime: "2 business days", installment: null },
        ],
        history: [
          { daysAgo: 30, price: 560000, store: "Average Market" },
          { daysAgo: 15, price: 520000, store: "Average Market" },
          { daysAgo: 0, price: 480000, store: "Uzum Market" },
        ],
      },
      // 3. Kitchen Appliances
      {
        name: "Xiaomi Mi Smart Air Fryer 3.5L (EU)",
        category: "Kitchen Appliances", brand: "Xiaomi",
        imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop",
        description: "OLED touch screen smart air fryer with dual-speed fan and 40-200°C cooking range. Mi Home app support.",
        specs: { "Capacity": "3.5 Liters", "Power": "1500W", "Connectivity": "Wi-Fi / Mi Home", "Temperature Range": "40°C - 200°C", "Warranty": "12 Months" },
        offers: [
          { store: "Texnomart", price: 420000, originalPrice: 510000, discount: "18% off", url: "https://texnomart.uz/ru/katalog/xiaomi-air-fryer-35l", availability: "In stock in 18 stores", rating: 4.6, reviewCount: 412, verified: true, isLowestPrice: true, deliveryTime: "Same day pickup", installment: "Texnomart: 6 x 78,000 UZS/oy" },
          { store: "Uzum Market", price: 440000, originalPrice: 490000, discount: "10% off", url: "https://uzum.uz/ru/product/xiaomi-air-fryer", availability: "In stock", rating: 4.6, reviewCount: 380, verified: true, isLowestPrice: false, deliveryTime: "1-day Tashkent", installment: "Uzum Nasiya: 6 x 81,000 UZS/oy" },
          { store: "MediaPark", price: 460000, originalPrice: null, discount: null, url: "https://mediapark.uz/products/xiaomi-air-fryer", availability: "In stock", rating: 4.5, reviewCount: 120, verified: true, isLowestPrice: false, deliveryTime: "1-2 days", installment: null },
        ],
        history: [
          { daysAgo: 30, price: 510000, store: "Average Market" },
          { daysAgo: 15, price: 460000, store: "Average Market" },
          { daysAgo: 0, price: 420000, store: "Texnomart" },
        ],
      },
      // 4. Audio & Tech
      {
        name: "Samsung Galaxy Buds2 Pro (Graphite)",
        category: "Audio & Tech", brand: "Samsung",
        imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
        description: "24-bit Hi-Fi audio, intelligent active noise cancellation, 360 audio with direct multi-channel.",
        specs: { "Audio": "24-bit Hi-Fi", "Noise Cancellation": "Intelligent ANC 33dB", "Battery Life": "Up to 29 hours with case", "Water Resistance": "IPX7", "Warranty": "12 Months" },
        offers: [
          { store: "Texnomart", price: 725400, originalPrice: 819000, discount: "11% off", url: "https://texnomart.uz/ru/katalog/samsung-galaxy-buds2-pro", availability: "In stock (Tashkent & regions)", rating: 4.8, reviewCount: 654, verified: true, isLowestPrice: true, deliveryTime: "Express delivery / branch pickup", installment: "Texnomart: 12 x 73,000 UZS/oy" },
          { store: "Idea Store", price: 764400, originalPrice: 858000, discount: "10% off", url: "https://idea.uz/products/galaxy-buds2-pro", availability: "Available", rating: 4.7, reviewCount: 95, verified: true, isLowestPrice: false, deliveryTime: "1-2 days", installment: "Zoodpay 0% x 4" },
          { store: "Uzum Market", price: 780000, originalPrice: 897000, discount: "13% off", url: "https://uzum.uz/ru/product/galaxy-buds2-pro", availability: "In stock", rating: 4.8, reviewCount: 520, verified: true, isLowestPrice: false, deliveryTime: "1-day delivery", installment: "Uzum Nasiya: 12 x 78,000 UZS/oy" },
          { store: "MediaPark", price: 811200, originalPrice: null, discount: null, url: "https://mediapark.uz/products/samsung-galaxy-buds2-pro", availability: "In stock", rating: 4.6, reviewCount: 140, verified: true, isLowestPrice: false, deliveryTime: "1-2 days", installment: null },
        ],
        history: [
          { daysAgo: 30, price: 865800, store: "Average Market" },
          { daysAgo: 20, price: 842400, store: "Average Market" },
          { daysAgo: 10, price: 803400, store: "Average Market" },
          { daysAgo: 0, price: 725400, store: "Texnomart" },
        ],
      },
      // 5. Audio & Tech
      {
        name: "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
        category: "Audio & Tech", brand: "Sony",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
        description: "Flagship wireless noise canceling over-ear headphones with 8 microphones, Auto NC Optimizer, and 30-hour battery.",
        specs: { "Drivers": "30mm Carbon Fiber", "Microphones": "8 Mic Array", "Battery": "30h ANC on / 40h ANC off", "Weight": "250g", "Warranty": "12 Months Sony Official" },
        offers: [
          { store: "Texnomart", price: 3200000, originalPrice: 3800000, discount: "16% off", url: "https://texnomart.uz/ru/katalog/sony-wh-1000xm5", availability: "In stock (1-year warranty)", rating: 4.9, reviewCount: 290, verified: true, isLowestPrice: true, deliveryTime: "Same-day Tashkent pickup", installment: "Texnomart: 12 x 310,000 UZS/oy" },
          { store: "Uzum Market", price: 3450000, originalPrice: 3750000, discount: "8% off", url: "https://uzum.uz/ru/product/sony-wh-1000xm5", availability: "In stock", rating: 4.9, reviewCount: 380, verified: true, isLowestPrice: false, deliveryTime: "1 business day", installment: "Uzum Nasiya: 12 x 335,000 UZS/oy" },
          { store: "iStore Tashkent", price: 3600000, originalPrice: null, discount: null, url: "https://istore.uz/catalog/sony-wh-1000xm5", availability: "In stock", rating: 4.9, reviewCount: 150, verified: true, isLowestPrice: false, deliveryTime: "Express courier 3 hours", installment: null },
        ],
        history: [
          { daysAgo: 30, price: 3800000, store: "Average Market" },
          { daysAgo: 15, price: 3500000, store: "Average Market" },
          { daysAgo: 0, price: 3200000, store: "Texnomart" },
        ],
      },
      // 6. Audio & Tech
      {
        name: "Apple AirPods Pro 2nd Gen (USB-C)",
        category: "Audio & Tech", brand: "Apple",
        imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop",
        description: "Up to 2x more Active Noise Cancellation, Adaptive Audio, and Transparency mode with MagSafe Charging Case (USB-C).",
        specs: { "Chip": "Apple H2", "Case": "MagSafe USB-C with speaker", "Water Resistance": "IP54 dust & water", "Battery": "6h per charge / 30h total", "Warranty": "1 Year Apple Care" },
        offers: [
          { store: "iStore Tashkent", price: 2750000, originalPrice: 3100000, discount: "11% off", url: "https://istore.uz/catalog/airpods-pro-2", availability: "In stock (Apple Care warranty)", rating: 4.9, reviewCount: 310, verified: true, isLowestPrice: true, deliveryTime: "Tashkent 3-hour express", installment: "Anorbank: 12 x 275,000 UZS/oy" },
          { store: "Texnomart", price: 2790000, originalPrice: 2990000, discount: "7% off", url: "https://texnomart.uz/ru/katalog/airpods-pro-2-usbc", availability: "In stock", rating: 4.8, reviewCount: 420, verified: true, isLowestPrice: false, deliveryTime: "Same day pickup", installment: "Texnomart: 12 x 280,000 UZS/oy" },
          { store: "Uzum Market", price: 2820000, originalPrice: 3050000, discount: "8% off", url: "https://uzum.uz/ru/product/airpods-pro-2-usbc", availability: "In stock", rating: 4.9, reviewCount: 650, verified: true, isLowestPrice: false, deliveryTime: "Next day delivery", installment: "Uzum Nasiya: 12 x 285,000 UZS/oy" },
        ],
        history: [
          { daysAgo: 30, price: 3100000, store: "Average Market" },
          { daysAgo: 15, price: 2950000, store: "Average Market" },
          { daysAgo: 0, price: 2750000, store: "iStore Tashkent" },
        ],
      },
      // 7. Artisanal & Cultural
      {
        name: "Handcrafted Uzbek Rishton Ceramic Tea Set (Lag'an & 6 Piyola)",
        category: "Artisanal & Home", brand: "Rishton Masters",
        imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop",
        description: "Authentic handmade cobalt & turquoise ceramic tea service from Fergana valley masters. Includes large platter and 6 bowls.",
        specs: { "Set": "1 Lag'an platter (36cm) + 1 Teapot (1.2L) + 6 Piyola bowls", "Glaze": "Ishkor natural plant ash glaze", "Craft": "100% Hand painted", "Origin": "Rishton, Fergana" },
        offers: [
          { store: "Olcha", price: 350000, originalPrice: 420000, discount: "16% off", url: "https://olcha.uz", availability: "Delivery across Uzbekistan", rating: 4.9, reviewCount: 89, verified: true, isLowestPrice: true, deliveryTime: "1-2 days cushioned courier", installment: null },
          { store: "Chorsu Artisan Guild", price: 370000, originalPrice: null, discount: null, url: "https://olcha.uz", availability: "In stock", rating: 4.8, reviewCount: 45, verified: true, isLowestPrice: false, deliveryTime: "Pickup Chorsu Bazaar", installment: null },
        ],
        history: [
          { daysAgo: 30, price: 420000, store: "Craft Fair" },
          { daysAgo: 0, price: 350000, store: "Craft Bazaar" },
        ],
      },
      // 8. Kitchen & Luxury
      {
        name: "KitchenAid Classic Stand Mixer 4.3L",
        category: "Kitchen & Luxury", brand: "KitchenAid",
        imageUrl: "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=600&auto=format&fit=crop",
        description: "Iconic planetary mixing action with 10 speeds. All-metal construction with stainless steel bowl and tilt-head design.",
        specs: { "Bowl Capacity": "4.3 Liters", "Power": "275W Direct Drive", "Speeds": "10 Speeds", "Weight": "10.5 kg", "Warranty": "24 Months International" },
        offers: [
          { store: "Idea Home Store", price: 1180000, originalPrice: 1400000, discount: "15% off", url: "https://idea.uz/products/kitchenaid-classic", availability: "In stock (2 units left)", rating: 4.9, reviewCount: 75, verified: true, isLowestPrice: true, deliveryTime: "1-2 days", installment: "Zoodpay 0% x 4" },
          { store: "MediaPark", price: 1200000, originalPrice: 1450000, discount: "17% off", url: "https://mediapark.uz/products/kitchenaid-classic", availability: "Limited stock", rating: 4.9, reviewCount: 1230, verified: true, isLowestPrice: false, deliveryTime: "1-2 days", installment: "Anorbank: 12 x 120,000 UZS/oy" },
          { store: "Uzum Market", price: 1250000, originalPrice: 1420000, discount: "12% off", url: "https://uzum.uz/ru/product/kitchenaid-classic", availability: "In stock", rating: 4.8, reviewCount: 210, verified: true, isLowestPrice: false, deliveryTime: "1 business day", installment: "Uzum Nasiya: 12 x 125,000 UZS/oy" },
        ],
        history: [
          { daysAgo: 30, price: 1450000, store: "Average Market" },
          { daysAgo: 15, price: 1320000, store: "Average Market" },
          { daysAgo: 0, price: 1180000, store: "Idea Home" },
        ],
      },
      // 9. Smart Home
      {
        name: "Roborock Q7 Max Robot Vacuum Cleaner",
        category: "Smart Home", brand: "Roborock",
        imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop",
        description: "4200Pa suction power, PreciSense LiDAR navigation, combined dustbin and water tank for vacuuming and mopping.",
        specs: { "Suction Power": "4200 Pa", "Navigation": "PreciSense LiDAR", "Battery": "5200 mAh (180 mins)", "Dustbin / Water": "470ml / 350ml", "Warranty": "12 Months" },
        offers: [
          { store: "Texnomart", price: 3850000, originalPrice: 4400000, discount: "12% off", url: "https://texnomart.uz/ru/katalog/roborock-q7-max", availability: "In stock", rating: 4.8, reviewCount: 180, verified: true, isLowestPrice: true, deliveryTime: "Same-day Tashkent pickup", installment: "Texnomart: 12 x 375,000 UZS/oy" },
          { store: "MediaPark", price: 3990000, originalPrice: null, discount: null, url: "https://mediapark.uz/products/roborock-q7-max", availability: "In stock", rating: 4.7, reviewCount: 95, verified: true, isLowestPrice: false, deliveryTime: "1-2 days", installment: null },
          { store: "Uzum Market", price: 4100000, originalPrice: 4350000, discount: "6% off", url: "https://uzum.uz/ru/product/roborock-q7-max", availability: "In stock", rating: 4.8, reviewCount: 220, verified: true, isLowestPrice: false, deliveryTime: "1 business day", installment: "Uzum Nasiya: 12 x 410,000 UZS/oy" },
        ],
        history: [
          { daysAgo: 30, price: 4400000, store: "Average Market" },
          { daysAgo: 15, price: 4100000, store: "Average Market" },
          { daysAgo: 0, price: 3850000, store: "Texnomart" },
        ],
      },
      // 10. Personal Grooming
      {
        name: "Philips Series 3000 Wet & Dry Electric Shaver",
        category: "Personal Grooming", brand: "Philips",
        imageUrl: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop",
        description: "5D Pivot & Flex Heads, PowerCut Blades, 60 minutes of cordless shaving from a 1-hour charge. Fully washable.",
        specs: { "Heads": "5D Pivot & Flex", "Blades": "PowerCut 27 self-sharpening", "Battery": "60 mins run / 1h charge", "Waterproof": "100% IPX7", "Warranty": "24 Months" },
        offers: [
          { store: "Uzum Market", price: 380000, originalPrice: 450000, discount: "15% off", url: "https://uzum.uz/ru/product/philips-s3134-series-3000", availability: "In stock", rating: 4.6, reviewCount: 310, verified: true, isLowestPrice: true, deliveryTime: "1 business day", installment: "Uzum Nasiya: 6 x 71,000 UZS/oy" },
          { store: "Texnomart", price: 395000, originalPrice: 430000, discount: "8% off", url: "https://texnomart.uz/ru/katalog/philips-shaver-3000", availability: "In stock", rating: 4.5, reviewCount: 120, verified: true, isLowestPrice: false, deliveryTime: "Same day pickup", installment: null },
          { store: "MediaPark", price: 410000, originalPrice: null, discount: null, url: "https://mediapark.uz/products/philips-shaver-3000", availability: "In stock", rating: 4.4, reviewCount: 65, verified: true, isLowestPrice: false, deliveryTime: "1-2 days", installment: null },
        ],
        history: [
          { daysAgo: 30, price: 450000, store: "Average Market" },
          { daysAgo: 0, price: 380000, store: "Uzum Market" },
        ],
      },
      // 11. Audio & Lifestyle
      {
        name: "Marshall Major IV On-Ear Wireless Headphones",
        category: "Audio & Lifestyle", brand: "Marshall",
        imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop",
        description: "Signature Marshall sound with 80+ solid hours of wireless playtime, wireless charging, and rugged fold-away design.",
        specs: { "Battery Life": "80+ Hours Playtime", "Wireless Charging": "Yes (Qi)", "Drivers": "40mm Dynamic", "Control": "Multi-directional knob", "Warranty": "12 Months" },
        offers: [
          { store: "Texnomart", price: 820000, originalPrice: 990000, discount: "17% off", url: "https://texnomart.uz/ru/katalog/marshall-major-iv", availability: "In stock", rating: 4.7, reviewCount: 290, verified: true, isLowestPrice: true, deliveryTime: "Same-day Tashkent pickup", installment: "Texnomart: 6 x 150,000 UZS/oy" },
          { store: "MediaPark", price: 850000, originalPrice: 990000, discount: "14% off", url: "https://mediapark.uz/products/marshall-major-iv", availability: "In stock", rating: 4.7, reviewCount: 670, verified: true, isLowestPrice: false, deliveryTime: "1-2 days courier", installment: "Anorbank: 12 x 85,000 UZS/oy" },
          { store: "Uzum Market", price: 880000, originalPrice: null, discount: null, url: "https://uzum.uz/ru/product/marshall-major-iv", availability: "In stock", rating: 4.6, reviewCount: 410, verified: true, isLowestPrice: false, deliveryTime: "1 business day", installment: "Uzum Nasiya: 6 x 162,000 UZS/oy" },
        ],
        history: [
          { daysAgo: 30, price: 990000, store: "Average Market" },
          { daysAgo: 0, price: 820000, store: "Texnomart" },
        ],
      },
      // 12. Tech & Reading
      {
        name: "Kindle Paperwhite 11th Gen 16GB (6.8\" Glare-Free)",
        category: "Tech & Reading", brand: "Amazon",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
        description: "300 ppi glare-free display, adjustable warm light, up to 10 weeks of battery life, and 20% faster page turns.",
        specs: { "Display": "6.8 inch 300 ppi", "Storage": "16 GB", "Lighting": "Adjustable Warm Light", "Battery": "Up to 10 weeks", "Waterproof": "IPX8 (2 meters)" },
        offers: [
          { store: "Texnomart", price: 1650000, originalPrice: 1950000, discount: "15% off", url: "https://texnomart.uz/ru/katalog/kindle-paperwhite-16gb", availability: "In stock", rating: 4.9, reviewCount: 140, verified: true, isLowestPrice: true, deliveryTime: "Same day pickup", installment: "Texnomart: 12 x 160,000 UZS/oy" },
          { store: "Uzum Market", price: 1720000, originalPrice: 1900000, discount: "9% off", url: "https://uzum.uz/ru/product/amazon-kindle-paperwhite-16gb", availability: "In stock", rating: 4.8, reviewCount: 220, verified: true, isLowestPrice: false, deliveryTime: "1 business day", installment: "Uzum Nasiya: 12 x 172,000 UZS/oy" },
        ],
        history: [
          { daysAgo: 30, price: 1950000, store: "Average Market" },
          { daysAgo: 0, price: 1650000, store: "Texnomart" },
        ],
      },
      // 13. Kitchen Appliances
      {
        name: "Tefal OptiGrill+ GC712D Intelligent Indoor Grill",
        category: "Kitchen Appliances", brand: "Tefal",
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop",
        description: "Automatic thickness measurement and precision doneness indicator for steak, chicken, paninis, and fish.",
        specs: { "Power": "2000W", "Cooking Programs": "6 Automatic Modes", "Surface": "Die-cast non-stick aluminum", "Warranty": "24 Months Tefal" },
        offers: [
          { store: "MediaPark", price: 1450000, originalPrice: 1750000, discount: "17% off", url: "https://mediapark.uz/products/tefal-optigrill", availability: "In stock", rating: 4.9, reviewCount: 310, verified: true, isLowestPrice: true, deliveryTime: "1 business day", installment: "Anorbank: 12 x 145,000 UZS/oy" },
          { store: "Texnomart", price: 1490000, originalPrice: 1690000, discount: "12% off", url: "https://texnomart.uz/ru/katalog/tefal-gc712d", availability: "In stock", rating: 4.8, reviewCount: 240, verified: true, isLowestPrice: false, deliveryTime: "Same day pickup", installment: "Texnomart: 12 x 148,000 UZS/oy" },
          { store: "Uzum Market", price: 1520000, originalPrice: 1700000, discount: "11% off", url: "https://uzum.uz/ru/product/tefal-optigrill", availability: "In stock", rating: 4.8, reviewCount: 180, verified: true, isLowestPrice: false, deliveryTime: "Next day", installment: null },
        ],
        history: [
          { daysAgo: 30, price: 1750000, store: "Average Market" },
          { daysAgo: 0, price: 1450000, store: "MediaPark" },
        ],
      },
      // 14. Artisanal & Cooking
      {
        name: "Namangan Traditional Cast Iron Kazan 12L with Skimmer",
        category: "Artisanal & Home", brand: "Namangan Masters",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop",
        description: "Heavy 8mm thick wall authentic Namangan cast-iron kazan with polished interior. Ideal for 10-15 people plov.",
        specs: { "Capacity": "12 Liters", "Wall Thickness": "8 mm cast iron", "Interior": "Hand-polished mirror surface", "Includes": "Aluminum lid + Stainless skimmer (Kapgir)", "Origin": "Namangan, Uzbekistan" },
        offers: [
          { store: "Olcha", price: 360000, originalPrice: 440000, discount: "18% off", url: "https://olcha.uz", availability: "In stock (immediate shipping)", rating: 4.9, reviewCount: 340, verified: true, isLowestPrice: true, deliveryTime: "1-2 days heavy courier", installment: null },
          { store: "Uzum Market", price: 390000, originalPrice: 450000, discount: "13% off", url: "https://uzum.uz/ru/product/namangan-qozon-12l", availability: "In stock", rating: 4.8, reviewCount: 410, verified: true, isLowestPrice: false, deliveryTime: "1 business day", installment: "Uzum Nasiya: 6 x 72,000 UZS/oy" },
        ],
        history: [
          { daysAgo: 30, price: 440000, store: "Market Bazaar" },
          { daysAgo: 0, price: 360000, store: "Craft Bazaar" },
        ],
      },
      // 15. Kitchen & Beverages
      {
        name: "Korkmaz Kahvekolik Turkish Coffee Maker",
        category: "Kitchen & Home", brand: "Korkmaz",
        imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop",
        description: "Thermo Balance technology preserves rich coffee aroma. Overflow prevention sensor and stainless steel pot.",
        specs: { "Capacity": "4 cups (320ml)", "Pot": "Stainless Steel", "Sensor": "Anti-overflow optical sensor", "Origin": "Turkey", "Warranty": "24 Months" },
        offers: [
          { store: "Idea Home", price: 580000, originalPrice: 690000, discount: "16% off", url: "https://idea.uz/products/korkmaz-kahvekolik", availability: "In stock", rating: 4.8, reviewCount: 95, verified: true, isLowestPrice: true, deliveryTime: "1-2 days", installment: "Zoodpay 0% x 4" },
          { store: "Uzum Market", price: 610000, originalPrice: 680000, discount: "10% off", url: "https://uzum.uz/ru/product/korkmaz-kahvekolik", availability: "In stock", rating: 4.7, reviewCount: 160, verified: true, isLowestPrice: false, deliveryTime: "1 business day", installment: "Uzum Nasiya: 6 x 112,000 UZS/oy" },
        ],
        history: [
          { daysAgo: 30, price: 690000, store: "Average Market" },
          { daysAgo: 0, price: 580000, store: "Idea Home" },
        ],
      },
      // 16. Audio & Outdoor
      {
        name: "JBL Charge 5 Portable Waterproof Bluetooth Speaker",
        category: "Audio & Outdoor", brand: "JBL",
        imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop",
        description: "Bold JBL Original Pro Sound with long excursion driver, separate tweeter and dual passive bass radiators. 20h playtime.",
        specs: { "Output Power": "40W RMS", "Battery": "20 Hours with built-in powerbank", "Waterproof": "IP67 dust & water", "Weight": "960g", "Warranty": "12 Months Official" },
        offers: [
          { store: "Texnomart", price: 1290000, originalPrice: 1550000, discount: "17% off", url: "https://texnomart.uz/ru/katalog/jbl-charge-5", availability: "In stock in 16 stores", rating: 4.9, reviewCount: 512, verified: true, isLowestPrice: true, deliveryTime: "Same day pickup", installment: "Texnomart: 12 x 128,000 UZS/oy" },
          { store: "MediaPark", price: 1340000, originalPrice: 1500000, discount: "11% off", url: "https://mediapark.uz/products/jbl-charge-5", availability: "In stock", rating: 4.8, reviewCount: 320, verified: true, isLowestPrice: false, deliveryTime: "1-2 days", installment: "Anorbank: 12 x 134,000 UZS/oy" },
          { store: "Uzum Market", price: 1380000, originalPrice: null, discount: null, url: "https://uzum.uz/ru/product/jbl-charge-5", availability: "In stock", rating: 4.8, reviewCount: 440, verified: true, isLowestPrice: false, deliveryTime: "1 business day", installment: "Uzum Nasiya: 12 x 138,000 UZS/oy" },
        ],
        history: [
          { daysAgo: 30, price: 1550000, store: "Average Market" },
          { daysAgo: 0, price: 1290000, store: "Texnomart" },
        ],
      },
      // 17. Smart Home & Luxury
      {
        name: "Dyson V12 Detect Slim Fluffy Cordless Vacuum",
        category: "Smart Home & Luxury", brand: "Dyson",
        imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop",
        description: "Illuminated cleaner head reveals invisible dust. Piezo sensor continuously measures dust particles and adapts suction.",
        specs: { "Weight": "2.2 kg Lightweight", "Suction Power": "150 AW", "Runtime": "Up to 60 mins", "Filtration": "99.99% down to 0.3 microns", "Warranty": "24 Months Dyson" },
        offers: [
          { store: "Texnomart", price: 6400000, originalPrice: 7200000, discount: "11% off", url: "https://texnomart.uz/ru/katalog/dyson-v12-detect-slim", availability: "In stock (Official Warranty)", rating: 4.9, reviewCount: 160, verified: true, isLowestPrice: true, deliveryTime: "Same-day Tashkent express", installment: "Texnomart: 12 x 620,000 UZS/oy" },
          { store: "MediaPark", price: 6650000, originalPrice: 7100000, discount: "6% off", url: "https://mediapark.uz/products/dyson-v12", availability: "In stock", rating: 4.9, reviewCount: 88, verified: true, isLowestPrice: false, deliveryTime: "1-2 days", installment: "Anorbank: 12 x 665,000 UZS/oy" },
        ],
        history: [
          { daysAgo: 30, price: 7200000, store: "Average Market" },
          { daysAgo: 0, price: 6400000, store: "Texnomart" },
        ],
      },
      // 18. Beauty & Luxury
      {
        name: "Dyson Airwrap Multi-Styler Complete Long",
        category: "Beauty & Personal Care", brand: "Dyson",
        imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop",
        description: "Styles with air, not extreme heat. Uses Coanda aerodynamic effect to curl, shape, smooth, and hide flyaways.",
        specs: { "Motor": "Dyson digital motor V9", "Heat Settings": "3 precise heat + cold shot", "Airflow": "3 speeds", "Case": "Prussian blue presentation case", "Warranty": "24 Months Official" },
        offers: [
          { store: "iStore Tashkent", price: 5950000, originalPrice: 6800000, discount: "12% off", url: "https://istore.uz/catalog/dyson-airwrap", availability: "In stock (EU plug)", rating: 4.9, reviewCount: 340, verified: true, isLowestPrice: true, deliveryTime: "Same day express courier", installment: "Anorbank: 12 x 595,000 UZS/oy" },
          { store: "Texnomart", price: 6100000, originalPrice: 6700000, discount: "9% off", url: "https://texnomart.uz/ru/katalog/dyson-airwrap-complete", availability: "In stock", rating: 4.9, reviewCount: 220, verified: true, isLowestPrice: false, deliveryTime: "Same day pickup", installment: "Texnomart: 12 x 590,000 UZS/oy" },
        ],
        history: [
          { daysAgo: 30, price: 6800000, store: "Average Market" },
          { daysAgo: 0, price: 5950000, store: "iStore Tashkent" },
        ],
      },
      // 19. Tech & Wearables
      {
        name: "Apple Watch SE 2nd Gen 40mm GPS (Midnight)",
        category: "Tech & Wearables", brand: "Apple",
        imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop",
        description: "Essential health and safety features, crash detection, sleep tracking, and optical heart sensor in lightweight aluminum.",
        specs: { "Case": "40mm Aluminum", "Display": "Retina OLED 1000 nits", "Chip": "S8 SiP dual-core", "Water Resistance": "50 meters swimproof", "Warranty": "1 Year Apple Care" },
        offers: [
          { store: "iStore Tashkent", price: 2850000, originalPrice: 3250000, discount: "12% off", url: "https://istore.uz/catalog/apple-watch-se", availability: "In stock", rating: 4.9, reviewCount: 410, verified: true, isLowestPrice: true, deliveryTime: "Tashkent 3-hour courier", installment: "Anorbank: 12 x 285,000 UZS/oy" },
          { store: "Texnomart", price: 2920000, originalPrice: 3190000, discount: "8% off", url: "https://texnomart.uz/ru/katalog/apple-watch-se-40mm", availability: "In stock", rating: 4.8, reviewCount: 280, verified: true, isLowestPrice: false, deliveryTime: "Same day pickup", installment: "Texnomart: 12 x 290,000 UZS/oy" },
        ],
        history: [
          { daysAgo: 30, price: 3250000, store: "Average Market" },
          { daysAgo: 0, price: 2850000, store: "iStore Tashkent" },
        ],
      },
      // 20. Tech & Productivity
      {
        name: "Keychron K2 Pro QMK/VIA Wireless Mechanical Keyboard",
        category: "Tech & Productivity", brand: "Keychron",
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop",
        description: "75% compact layout wireless mechanical keyboard with hot-swappable switches, RGB backlight, and Mac/Windows support.",
        specs: { "Switches": "Keychron K Pro Red / Brown", "Layout": "75% (84 keys)", "Battery": "4000 mAh (up to 300h)", "Connectivity": "Bluetooth 5.1 & Type-C", "Warranty": "12 Months" },
        offers: [
          { store: "Texnomart", price: 920000, originalPrice: 1100000, discount: "16% off", url: "https://texnomart.uz/ru/katalog/keychron-k2-pro", availability: "In stock", rating: 4.8, reviewCount: 130, verified: true, isLowestPrice: true, deliveryTime: "Same day pickup", installment: "Texnomart: 6 x 168,000 UZS/oy" },
          { store: "Uzum Market", price: 970000, originalPrice: 1080000, discount: "10% off", url: "https://uzum.uz/ru/product/keychron-k2-pro", availability: "In stock", rating: 4.7, reviewCount: 190, verified: true, isLowestPrice: false, deliveryTime: "1 business day", installment: "Uzum Nasiya: 6 x 178,000 UZS/oy" },
        ],
        history: [
          { daysAgo: 30, price: 1100000, store: "Average Market" },
          { daysAgo: 0, price: 920000, store: "Texnomart" },
        ],
      },
      // 21. Artisanal & Cultural
      {
        name: "Bukhara Gold-Thread Zardozi Embroidered Silk Scarf",
        category: "Artisanal & Cultural", brand: "Bukhara Guild",
        imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop",
        description: "Authentic royal goldwork (Zardozi) hand-embroidered on natural silk velvet. Traditional Uzbek bridal prestige gift.",
        specs: { "Fabric": "100% Margilan Natural Silk Velvet", "Thread": "Gold-plated metallic filigree thread", "Craft": "Master artisan hand embroidery", "Origin": "Bukhara, Uzbekistan" },
        offers: [
          { store: "Olcha", price: 450000, originalPrice: 550000, discount: "18% off", url: "https://olcha.uz", availability: "In stock", rating: 5.0, reviewCount: 42, verified: true, isLowestPrice: true, deliveryTime: "1-2 days gift-wrapped", installment: null },
        ],
        history: [
          { daysAgo: 30, price: 550000, store: "Bukhara Artisan House" },
          { daysAgo: 0, price: 450000, store: "Craft Bazaar" },
        ],
      },
      // 22. Artisanal & Home
      {
        name: "Margilan Handwoven Silk Adras Ikat Plaid Bedspread",
        category: "Artisanal & Home", brand: "Yodgorlik Silk",
        imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop",
        description: "Traditional hand-loomed 70% silk / 30% cotton Adras Ikat fabric from Margilan Yodgorlik master weavers.",
        specs: { "Size": "220 x 240 cm (King Size)", "Composition": "70% Silk, 30% Organic Cotton", "Dyes": "Natural pomegranate & madder root dyes", "Origin": "Margilan, Uzbekistan" },
        offers: [
          { store: "Olcha", price: 680000, originalPrice: 800000, discount: "15% off", url: "https://olcha.uz", availability: "In stock", rating: 4.9, reviewCount: 35, verified: true, isLowestPrice: true, deliveryTime: "1-2 days insured", installment: null },
        ],
        history: [
          { daysAgo: 30, price: 800000, store: "Margilan Silk Factory" },
          { daysAgo: 0, price: 680000, store: "Craft Bazaar" },
        ],
      },
      // 23. Artisanal & Keepsake
      {
        name: "Carved Walnut Samarkand Jewelry Box with Mother-of-Pearl",
        category: "Artisanal & Home", brand: "Samarkand Woodcraft",
        imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop",
        description: "Hand-carved from centuries-old walnut wood with intricate geometric Islimi floral motifs and velvet-lined interior.",
        specs: { "Wood": "Aged Walnut (Yong'oq yog'ochi)", "Inlay": "Natural Mother-of-Pearl", "Dimensions": "26 x 18 x 12 cm", "Finish": "Natural beeswax polish", "Origin": "Samarkand" },
        offers: [
          { store: "Olcha", price: 420000, originalPrice: 500000, discount: "16% off", url: "https://olcha.uz", availability: "In stock", rating: 4.9, reviewCount: 29, verified: true, isLowestPrice: true, deliveryTime: "1-2 days gift packaged", installment: null },
        ],
        history: [
          { daysAgo: 30, price: 500000, store: "Registan Art Row" },
          { daysAgo: 0, price: 420000, store: "Craft Bazaar" },
        ],
      },
      // 24. Baby & Nursery
      {
        name: "Chicco Baby Hug 4-in-1 Crib & Highchair",
        category: "Baby & Family", brand: "Chicco",
        imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop",
        description: "Innovative 4-in-1 solution: standalone crib, reclining recliner, highchair, and first table chair. Pedal height adjustment.",
        specs: { "Functions": "Crib, Recliner, Highchair, Table chair", "Age": "0 to 36 months", "Adjustability": "Infinite height pedal", "Wheels": "4 lockable brake wheels", "Origin": "Italy" },
        offers: [
          { store: "Uzum Market", price: 2100000, originalPrice: 2450000, discount: "14% off", url: "https://uzum.uz/ru/product/chicco-baby-hug-4in1", availability: "In stock", rating: 4.9, reviewCount: 88, verified: true, isLowestPrice: true, deliveryTime: "1 business day", installment: "Uzum Nasiya: 12 x 210,000 UZS/oy" },
          { store: "Texnomart", price: 2250000, originalPrice: 2400000, discount: "6% off", url: "https://texnomart.uz/ru/katalog/chicco-baby-hug", availability: "In stock", rating: 4.8, reviewCount: 54, verified: true, isLowestPrice: false, deliveryTime: "Same day pickup", installment: "Texnomart: 12 x 225,000 UZS/oy" },
        ],
        history: [
          { daysAgo: 30, price: 2450000, store: "Average Market" },
          { daysAgo: 0, price: 2100000, store: "Uzum Market" },
        ],
      },
      // 25. Baby & Safety
      {
        name: "Philips Avent DECT Audio Baby Monitor SCD502",
        category: "Baby & Family", brand: "Philips Avent",
        imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop",
        description: "100% private connection with zero interference (DECT technology). Crystal clear sound, night light and 300m range.",
        specs: { "Range": "Indoor 50m / Outdoor 300m", "Technology": "DECT Zero interference", "Battery": "Up to 24h parent unit", "Features": "Soothing night light", "Warranty": "24 Months" },
        offers: [
          { store: "Uzum Market", price: 780000, originalPrice: 890000, discount: "12% off", url: "https://uzum.uz/ru/product/philips-avent-scd502", availability: "In stock", rating: 4.8, reviewCount: 142, verified: true, isLowestPrice: true, deliveryTime: "1 business day", installment: "Uzum Nasiya: 6 x 145,000 UZS/oy" },
          { store: "MediaPark", price: 820000, originalPrice: 880000, discount: "7% off", url: "https://mediapark.uz/products/philips-avent-scd502", availability: "In stock", rating: 4.7, reviewCount: 65, verified: true, isLowestPrice: false, deliveryTime: "1-2 days", installment: null },
        ],
        history: [
          { daysAgo: 30, price: 890000, store: "Average Market" },
          { daysAgo: 0, price: 780000, store: "Uzum Market" },
        ],
      },
      // 26. Perfumery & Luxury
      {
        name: "Dior Sauvage Eau de Parfum 100ml",
        category: "Perfumery & Luxury", brand: "Dior",
        imageUrl: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop",
        description: "Calabrian bergamot, Sichuan pepper, and smoky Papua New Guinean vanilla absolute. Iconic masculine luxury scent.",
        specs: { "Volume": "100 ml", "Concentration": "Eau de Parfum (EDP)", "Longevity": "8-12 hours", "Origin": "France (100% Original Certificate)" },
        offers: [
          { store: "Uzum Market", price: 1850000, originalPrice: 2150000, discount: "14% off", url: "https://uzum.uz/ru/product/dior-sauvage-edp-100ml", availability: "In stock (Verified Original)", rating: 4.9, reviewCount: 480, verified: true, isLowestPrice: true, deliveryTime: "1 business day", installment: "Uzum Nasiya: 12 x 185,000 UZS/oy" },
          { store: "iStore Tashkent", price: 1950000, originalPrice: null, discount: null, url: "https://istore.uz/catalog/dior-sauvage", availability: "In stock", rating: 4.9, reviewCount: 120, verified: true, isLowestPrice: false, deliveryTime: "Express 3 hours", installment: null },
        ],
        history: [
          { daysAgo: 30, price: 2150000, store: "Duty Free / Retail" },
          { daysAgo: 0, price: 1850000, store: "Uzum Market" },
        ],
      },
    ];

    for (const item of catalogData) {
      const prodId = this.id("products");
      const prod = {
        id: prodId,
        name: item.name,
        category: item.category,
        brand: item.brand,
        imageUrl: item.imageUrl,
        description: item.description,
        specs: item.specs || null,
        createdAt: new Date(),
      };
      this.products.set(prodId, prod);
      this.catalogDirty = true;

      // Add offers
      for (const off of item.offers) {
        const offId = this.id("offers");
        this.offers.set(offId, {
          id: offId,
          productId: prodId,
          ...off,
          currency: "UZS",
          lastChecked: new Date(),
          createdAt: new Date(),
        });
      }

      // Add historical price points
      for (const h of item.history) {
        this.priceHistory.push({
          id: this.id("priceHistory"),
          productId: prodId,
          store: h.store,
          price: h.price,
          currency: "UZS",
          recordedAt: new Date(Date.now() - h.daysAgo * 24 * 60 * 60 * 1000),
        });
      }
    }

    // ── 3. Demo Wedding Registry ("ali-madina") ──────────────────────────────
    const reg = {
      id: this.id("registries"), userId: user1.id, slug: "ali-madina",
      partnerName1: "Ali", partnerName2: "Madina",
      weddingDate: new Date("2025-06-15"), coverImageUrl: null,
      message: "We're so excited to celebrate our special day with you! 💕",
      isPublic: true, revealPurchasers: false,
      createdAt: new Date(), updatedAt: new Date(),
    };
    this.registries.set(reg.id, reg);

    const regItems = [
      { name: "Coffee Machine (De'Longhi)", description: "A great espresso machine for our mornings together", price: 650000, priority: "high", quantity: 1, category: "Kitchen", isCashGoal: false },
      { name: "Air Fryer (Xiaomi)", description: "For healthy cooking", price: 420000, priority: "medium", quantity: 1, category: "Kitchen", isCashGoal: false },
      { name: "Dinner Set (46 pieces)", description: "Elegant dinner set for hosting guests", price: 480000, priority: "high", quantity: 1, category: "Kitchen", isCashGoal: false },
      { name: "Premium Bed Linen Set", description: "Egyptian cotton, king size", price: 380000, priority: "low", quantity: 2, category: "Bedroom", isCashGoal: false },
      { name: "Honeymoon Fund", description: "Help us create unforgettable memories in Antalya! ✈️", price: null, priority: "high", quantity: 1, category: "Experience", isCashGoal: true, cashGoalAmount: 5000000, cashCollected: 1200000 },
    ];

    for (const item of regItems) {
      const ri = {
        id: this.id("registryItems"), registryId: reg.id,
        ...item, imageUrl: null, url: null,
        quantityFulfilled: 0, cashCollected: item.cashCollected || 0,
        cashGoalAmount: item.cashGoalAmount || null,
        currency: "UZS", status: "available", createdAt: new Date(),
      };
      this.registryItems.set(ri.id, ri);
    }

    // ── 4. Demo Wishlist ─────────────────────────────────────────────────────
    const wl = {
      id: this.id("wishlists"), userId: user1.id, title: "My Tech Wishlist",
      description: "Gadgets I want for my workspace setup", type: "tech", isPublic: false,
      slug: "jasur-tech", createdAt: new Date(), updatedAt: new Date(),
    };
    this.wishlists.set(wl.id, wl);

    const wlItems = [
      { name: "Sony WH-1000XM5", price: 3200000, store: "Texnomart", priority: "high" },
      { name: "Keychron K2 Pro Keyboard", price: 920000, store: "Texnomart", priority: "medium" },
      { name: "Kindle Paperwhite 16GB", price: 1650000, store: "Texnomart", priority: "low" },
    ];
    for (const item of wlItems) {
      const wi = {
        id: this.id("wishlistItems"), wishlistId: wl.id,
        name: item.name, description: null, imageUrl: null,
        price: item.price, currency: "UZS", url: null,
        store: item.store, priority: item.priority,
        notes: null, purchased: false, createdAt: new Date(),
      };
      this.wishlistItems.set(wi.id, wi);
    }

    // ── 5. Demo Reminders ────────────────────────────────────────────────────
    const rem = {
      id: this.id("reminders"), userId: user1.id,
      title: "Otabek's Birthday", personName: "Otabek",
      eventType: "birthday", eventDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      recurring: true, budget: 300000, currency: "UZS", notes: "He likes tech gadgets and coffee",
      lastNotified: null, createdAt: new Date(),
    };
    this.reminders.set(rem.id, rem);
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  createUser(data: any) {
    const user = { id: this.id("users"), ...data, role: data.role || "user", createdAt: new Date(), updatedAt: new Date() };
    this.users.set(user.id, user);
    this.persist();
    mongoService.saveUser(user).catch(() => {});
    return user;
  }
  getUserByEmail(email: string) { return [...this.users.values()].find((u) => u.email === email) || null; }
  getUserByIdentifier(identifier: string) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = clean.replace(/[^0-9]/g, "");
    return (
      [...this.users.values()].find((u) => {
        if (u.email && u.email.toLowerCase() === clean) return true;
        if (u.phone) {
          const uDigits = u.phone.replace(/[^0-9]/g, "");
          if (u.phone.toLowerCase() === clean || (cleanDigits.length >= 9 && uDigits.endsWith(cleanDigits.slice(-9)))) {
            return true;
          }
        }
        return false;
      }) || null
    );
  }
  getUserById(id: number) { return this.users.get(id) || null; }
  getUserByGoogleId(gid: string) { return [...this.users.values()].find((u) => u.googleId === gid) || null; }
  getAllUsers() {
    return [...this.users.values()].map(({ password, ...u }) => u);
  }

  // ── Catalog Products & Multi-Store Offers ──────────────────────────────────
  getProducts(limit = 100) {
    return [...this.products.values()].slice(0, limit).map((p) => {
      const offers = this.getProductOffers(p.id);
      const lowestOffer = offers.find((o) => o.isLowestPrice) || offers[0];
      return {
        ...p,
        offers,
        price: lowestOffer ? lowestOffer.price : null,
        originalPrice: lowestOffer ? lowestOffer.originalPrice : null,
        currency: lowestOffer ? lowestOffer.currency : "UZS",
        store: lowestOffer ? lowestOffer.store : "Uzbekistan Store",
        url: lowestOffer
          ? ensureProductUrl(p.name, lowestOffer.store, lowestOffer.url)
          : ensureProductUrl(p.name, "Uzum Market"),
        discount: lowestOffer ? lowestOffer.discount : null,
        availability: lowestOffer ? lowestOffer.availability : null,
        rating: lowestOffer ? lowestOffer.rating : null,
        reviewCount: lowestOffer ? lowestOffer.reviewCount : null,
        verified: lowestOffer ? lowestOffer.verified : true,
        installment: lowestOffer ? lowestOffer.installment : null,
      };
    });
  }

  getProductById(id: number) {
    return this.products.get(id) || null;
  }

  getProductOffers(productId: number) {
    return this.offersByProductId.get(productId) || [];
  }

  getProductWithOffers(id: number) {
    const prod = this.getProductById(id);
    if (!prod) return null;
    const offers = this.getProductOffers(id);
    const history = this.getPriceHistory(id);
    return { ...prod, offers, history };
  }

  searchCatalog(query: string, options?: any) {
    const qLower = (query || "").toLowerCase().trim();
    if (!qLower) return this.getProducts(options?.limit || 20);

    const budgetFromQuery = extractQueryBudget(qLower);
    const maxBudget = options?.maxPrice || options?.budgetMax || budgetFromQuery;
    const minBudget = options?.minPrice;

    // The catalog stores many generated variants of the same product ("… Partiya-2").
    // Collapse them and keep the cheapest offer for each real product.
    const byBase = new Map<string, { product: any; lowestOffer: any; offers: any[]; price: number | null }>();
    for (const p of this.products.values()) {
      const key = baseProductName(p.name).toLowerCase();
      const offers = this.getProductOffers(p.id);
      const lowestOffer = offers.find((o: any) => o.isLowestPrice) || offers[0];
      const price = lowestOffer ? lowestOffer.price : (p as any).price ?? null;
      const prev = byBase.get(key);
      if (!prev || (price != null && (prev.price == null || price < prev.price))) {
        byBase.set(key, { product: p, lowestOffer, offers, price });
      }
    }

    let candidates = [...byBase.values()];
    if (maxBudget) candidates = candidates.filter((c) => c.price == null || c.price <= maxBudget * 1.25);
    if (minBudget) candidates = candidates.filter((c) => c.price == null || c.price >= minBudget * 0.5);

    const ranked = rankByRelevance(query, candidates, (c) => ({
      name: c.product.name,
      brand: c.product.brand,
      description: c.product.description,
      category: c.product.category,
    }), { maxRelated: 12 });

    if (ranked.length === 0) {
      // Nothing matched by type or words: fall back to occasion/concept matching ("to'y", "yangi uy")
      const seen = new Set<string>();
      const out: any[] = [];
      for (const p of this.legacySearchCatalog(query, options)) {
        const k = baseProductName(p.name).toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({ ...p, name: displayProductName(p.name, p.brand) });
        if (out.length >= 60) break;
      }
      return out;
    }

    // Within the same relevance score, cheaper and in-budget first
    ranked.sort((a, b) => {
      if (a.strong !== b.strong) return a.strong ? -1 : 1;
      if (b.score !== a.score) return b.score - a.score;
      return (a.item.price ?? Infinity) - (b.item.price ?? Infinity);
    });

    return ranked.map(({ item }) => {
      const { product: p, lowestOffer, offers } = item;
      return {
        ...p,
        name: displayProductName(p.name, p.brand),
        offers,
        price: lowestOffer ? lowestOffer.price : null,
        originalPrice: lowestOffer ? lowestOffer.originalPrice : null,
        currency: lowestOffer ? lowestOffer.currency : "UZS",
        store: lowestOffer ? lowestOffer.store : "Uzbekistan Store",
        url: lowestOffer
          ? ensureProductUrl(p.name, lowestOffer.store, lowestOffer.url, query)
          : ensureProductUrl(p.name, "Uzum Market", null, query),
        discount: lowestOffer ? lowestOffer.discount : null,
        availability: lowestOffer ? lowestOffer.availability : null,
        rating: lowestOffer ? lowestOffer.rating : null,
        reviewCount: lowestOffer ? lowestOffer.reviewCount : null,
        verified: lowestOffer ? lowestOffer.verified : true,
        installment: lowestOffer ? lowestOffer.installment : null,
      };
    });
  }

  private legacySearchCatalog(query: string, options?: any) {
    const qLower = (query || "").toLowerCase().trim();
    if (!qLower) return this.getProducts(options?.limit || 20);

    const budgetFromQuery = extractQueryBudget(qLower);
    const maxBudget = options?.maxPrice || options?.budgetMax || budgetFromQuery;
    const minBudget = options?.minPrice;

    // Detect matched concept keywords
    const matchedConceptKeywords = new Set<string>();
    for (const concept of SEMANTIC_CONCEPTS) {
      if (concept.terms.some((t) => qLower.includes(t))) {
        concept.productKeywords.forEach((k) => matchedConceptKeywords.add(k.toLowerCase()));
      }
    }

    const queryWords = qLower
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !["gacha", "uchun", "bilan", "eng", "yaxshi", "under", "for", "the", "best", "and", "do", "haqida"].includes(w));

    // Score all products
    const scored = [...this.products.values()].map((p) => {
      const pText = `${p.name} ${p.brand || ""} ${p.category || ""} ${p.description || ""}`.toLowerCase();
      let score = 0;

      // 1. Direct word matching
      for (const word of queryWords) {
        if (p.name.toLowerCase().includes(word)) score += 100;
        else if (p.brand?.toLowerCase().includes(word)) score += 60;
        else if (p.category?.toLowerCase().includes(word)) score += 20;
        else if (pText.includes(word)) score += 10;
      }

      // Exact substring of query in product name or brand
      if (p.name.toLowerCase().includes(qLower)) {
        score += 150;
      } else if (p.brand?.toLowerCase().includes(qLower)) {
        score += 80;
      }

      // 2. Semantic concept keyword match (single application)
      for (const keyword of matchedConceptKeywords) {
        if (pText.includes(keyword)) {
          score += 45;
          break;
        }
      }

      // 3. Budget matching boost/penalty
      const offers = this.getProductOffers(p.id);
      const lowestOffer = offers.find((o) => o.isLowestPrice) || offers[0];
      const price = lowestOffer ? lowestOffer.price : null;

      if (maxBudget && price) {
        if (price <= maxBudget) {
          score += 30;
        } else if (price > maxBudget * 1.25) {
          score -= 150;
        }
      }

      if (minBudget && price && price < minBudget) {
        score -= 20;
      }

      return { product: p, score, price, lowestOffer, offers };
    });

    // Filter to positive scores and sort by relevance
    let sortedMatches = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.product);

    if (sortedMatches.length === 0) {
      return [];
    }

    return sortedMatches.map((p) => {
      const offers = this.getProductOffers(p.id);
      const lowestOffer = offers.find((o) => o.isLowestPrice) || offers[0];
      return {
        ...p,
        offers,
        price: lowestOffer ? lowestOffer.price : null,
        originalPrice: lowestOffer ? lowestOffer.originalPrice : null,
        currency: lowestOffer ? lowestOffer.currency : "UZS",
        store: lowestOffer ? lowestOffer.store : "Uzbekistan Store",
        url: lowestOffer
          ? ensureProductUrl(p.name, lowestOffer.store, lowestOffer.url, query)
          : ensureProductUrl(p.name, "Uzum Market", null, query),
        discount: lowestOffer ? lowestOffer.discount : null,
        availability: lowestOffer ? lowestOffer.availability : null,
        rating: lowestOffer ? lowestOffer.rating : null,
        reviewCount: lowestOffer ? lowestOffer.reviewCount : null,
        verified: lowestOffer ? lowestOffer.verified : true,
        installment: lowestOffer ? lowestOffer.installment : null,
      };
    });
  }

  filterCatalog(params: { category?: string; store?: string; minPrice?: number; maxPrice?: number; q?: string; sort?: string; limit?: number }) {
    let list: any[] = [];

    if (params.q) {
      list = this.searchCatalog(params.q, {
        maxPrice: params.maxPrice,
        minPrice: params.minPrice,
        limit: params.limit || 100,
      });
    } else {
      // Filter the whole catalog first and limit last; limiting first hid every category but phones.
      list = this.getUniqueCatalog();
      if (!params.sort && (!params.category || params.category === "All")) {
        // Mix categories so the first page isn't only phones
        const byCat = new Map<string, any[]>();
        for (const p of list) {
          const k = p.category || "Other";
          if (!byCat.has(k)) byCat.set(k, []);
          byCat.get(k)!.push(p);
        }
        const queues = [...byCat.values()];
        const mixed: any[] = [];
        for (let i = 0; mixed.length < list.length; i++) {
          let added = false;
          for (const q of queues) if (i < q.length) { mixed.push(q[i]); added = true; }
          if (!added) break;
        }
        list = mixed;
      } else {
        list = [...list];
      }
    }

    if (params.category && params.category !== "All") {
      list = list.filter((p) => p.category?.toLowerCase().includes(params.category!.toLowerCase()));
    }

    if (params.store && params.store !== "All") {
      list = list.filter((p) => p.offers.some((o: any) => o.store.toLowerCase().includes(params.store!.toLowerCase())));
    }

    if (params.minPrice) {
      list = list.filter((p) => p.price && p.price >= params.minPrice!);
    }

    if (params.maxPrice) {
      list = list.filter((p) => p.price && p.price <= params.maxPrice!);
    }

    if (params.sort === "price_asc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (params.sort === "price_desc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (params.sort === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (params.sort === "discount") {
      list.sort((a, b) => {
        const da = a.discount ? parseInt(a.discount) : 0;
        const db = b.discount ? parseInt(b.discount) : 0;
        return db - da;
      });
    }

    return list.slice(0, params.limit || 50);
  }

  private uniqueCatalogCache: { size: number; list: any[] } | null = null;

  /** One entry per real product (generated variants collapsed), priced at its cheapest offer. */
  private getUniqueCatalog(): any[] {
    if (this.uniqueCatalogCache && this.uniqueCatalogCache.size === this.products.size) return this.uniqueCatalogCache.list;
    const byBase = new Map<string, { p: any; offers: any[]; lowestOffer: any; price: number | null }>();
    for (const p of this.products.values()) {
      const key = baseProductName(p.name).toLowerCase();
      const offers = this.getProductOffers(p.id);
      const lowestOffer = offers.find((o: any) => o.isLowestPrice) || offers[0];
      const price = lowestOffer ? lowestOffer.price : null;
      const prev = byBase.get(key);
      if (!prev || (price != null && (prev.price == null || price < prev.price))) byBase.set(key, { p, offers, lowestOffer, price });
    }
    const list = [...byBase.values()].map(({ p, offers, lowestOffer }) => ({
      ...p,
      name: displayProductName(p.name, p.brand),
      offers,
      price: lowestOffer ? lowestOffer.price : null,
      originalPrice: lowestOffer ? lowestOffer.originalPrice : null,
      currency: lowestOffer ? lowestOffer.currency : "UZS",
      store: lowestOffer ? lowestOffer.store : "Uzbekistan Store",
      url: lowestOffer ? ensureProductUrl(p.name, lowestOffer.store, lowestOffer.url) : ensureProductUrl(p.name, "Uzum Market"),
      discount: lowestOffer ? lowestOffer.discount : null,
      availability: lowestOffer ? lowestOffer.availability : null,
      rating: lowestOffer ? lowestOffer.rating : null,
      reviewCount: lowestOffer ? lowestOffer.reviewCount : null,
      verified: lowestOffer ? lowestOffer.verified : true,
      installment: lowestOffer ? lowestOffer.installment : null,
    }));
    this.uniqueCatalogCache = { size: this.products.size, list };
    return list;
  }

  getCategories(): { name: string; count: number; icon: string }[] {
    const counts: Record<string, number> = {};
    for (const p of this.getUniqueCatalog()) {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    }
    const iconMap: Record<string, string> = {
      "Kitchen & Home": "☕",
      "Dining & Kitchen": "🍽️",
      "Kitchen Appliances": "🍳",
      "Audio & Tech": "🎧",
      "Artisanal & Home": "🏺",
      "Artisanal & Cultural": "✨",
      "Smart Home": "🤖",
      "Smart Home & Luxury": "🧹",
      "Personal Grooming": "🪒",
      "Audio & Lifestyle": "📻",
      "Tech & Reading": "📖",
      "Tech & Wearables": "⌚",
      "Tech & Productivity": "⌨️",
      "Baby & Family": "👶",
      "Perfumery & Luxury": "🌸",
    };
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      icon: iconMap[name] || "🎁",
    })).sort((a, b) => b.count - a.count);
  }

  getPriceHistory(productId: number, limit = 30) {
    return this.priceHistory
      .filter((h) => h.productId === productId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
      .slice(0, limit);
  }

  recordPriceObservation(productId: number, store: string, price: number) {
    this.catalogDirty = true;
    this.priceHistory.push({
      id: this.id("priceHistory"),
      productId,
      store,
      price,
      currency: "UZS",
      recordedAt: new Date(),
    });
    this.persist();
  }

  // ── Price Drop Trackers ────────────────────────────────────────────────────
  createPriceTracker(data: any): PriceTrackerData {
    const tracker: PriceTrackerData = {
      id: this.id("priceTrackers"),
      userId: data.userId,
      productId: data.productId || null,
      productName: data.productName,
      targetPrice: data.targetPrice,
      currentPrice: data.currentPrice,
      currency: data.currency || "UZS",
      store: data.store || "Uzum Market",
      url: data.url || "#",
      userEmail: data.userEmail || "",
      active: true,
      notified: false,
      createdAt: new Date().toISOString(),
    };
    this.priceTrackers.set(tracker.id, tracker);
    this.persist();
    mongoService.savePriceTracker(tracker).catch(() => {});
    return tracker;
  }

  getPriceTrackers(userId: number): PriceTrackerData[] {
    return [...this.priceTrackers.values()].filter((t) => t.userId === userId && t.active);
  }

  getAllPriceTrackers(): PriceTrackerData[] {
    return [...this.priceTrackers.values()].filter((t) => t.active);
  }

  updatePriceTracker(id: number, data: Partial<PriceTrackerData>): PriceTrackerData | null {
    const existing = this.priceTrackers.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    this.priceTrackers.set(id, updated);
    this.persist();
    mongoService.savePriceTracker(updated).catch(() => {});
    return updated;
  }

  deletePriceTracker(id: number) {
    this.priceTrackers.delete(id);
    this.persist();
    mongoService.deletePriceTracker(id).catch(() => {});
  }

  // ── Wedding Registries ─────────────────────────────────────────────────────
  getRegistriesByUser(userId: number) { return [...this.registries.values()].filter((r) => r.userId === userId); }
  createRegistry(data: any) {
    if (isProhibitedContent(data.message) || isProhibitedContent(data.partnerName1) || isProhibitedContent(data.partnerName2)) {
      throw new Error("Nomaqbul yoki odob-axloq me'yorlariga zid ma'lumot kiritish taqiqlanadi");
    }
    const r = { id: this.id("registries"), ...data, createdAt: new Date(), updatedAt: new Date() };
    this.registries.set(r.id, r);
    this.persist();
    mongoService.saveRegistry(r).catch(() => {});
    return r;
  }
  getRegistryBySlug(slug: string) { return [...this.registries.values()].find((r) => r.slug === slug) || null; }
  getRegistryById(id: number) { return this.registries.get(id) || null; }
  updateRegistry(id: number, data: any) {
    const r = this.registries.get(id);
    if (!r) return null;
    if (isProhibitedContent(data.message) || isProhibitedContent(data.partnerName1) || isProhibitedContent(data.partnerName2)) {
      throw new Error("Nomaqbul yoki odob-axloq me'yorlariga zid ma'lumot kiritish taqiqlanadi");
    }
    Object.assign(r, data, { updatedAt: new Date() });
    this.persist();
    mongoService.saveRegistry(r).catch(() => {});
    return r;
  }
  deleteRegistry(id: number) {
    this.registries.delete(id);
    for (const [k, v] of this.registryItems) { if (v.registryId === id) this.registryItems.delete(k); }
    this.persist();
    mongoService.deleteRegistry(id).catch(() => {});
  }

  // ── Registry Items ─────────────────────────────────────────────────────────
  getRegistryItems(registryId: number) { return [...this.registryItems.values()].filter((i) => i.registryId === registryId); }
  createRegistryItem(data: any) {
    if (isProhibitedContent(data.name) || isProhibitedContent(data.description)) {
      throw new Error("Nomaqbul yoki odob-axloq me'yorlariga zid mahsulot kiritish taqiqlanadi");
    }
    const i = { id: this.id("registryItems"), ...data, quantityFulfilled: 0, cashCollected: data.cashCollected || 0, status: "available", createdAt: new Date() };
    this.registryItems.set(i.id, i);
    this.persist();
    return i;
  }
  updateRegistryItem(id: number, data: any) {
    const i = this.registryItems.get(id);
    if (!i) return null;
    Object.assign(i, data);
    this.persist();
    return i;
  }
  deleteRegistryItem(id: number) { 
    this.registryItems.delete(id); 
    this.persist();
  }
  getRegistryItemById(id: number) { return this.registryItems.get(id) || null; }

  // ── Reservations ───────────────────────────────────────────────────────────
  createReservation(data: any) {
    const r = { id: this.id("reservations"), ...data, purchased: false, createdAt: new Date() };
    this.reservations.set(r.id, r);
    const item = this.registryItems.get(data.itemId);
    if (item) {
      if (item.isCashGoal && data.cashAmount) {
        item.cashCollected = (Number(item.cashCollected) || 0) + (Number(data.cashAmount) || 0);
      } else {
        item.quantityFulfilled = (Number(item.quantityFulfilled) || 0) + (Number(data.quantity) || 1);
        if (item.quantityFulfilled >= (Number(item.quantity) || 1)) item.status = "reserved";
      }
    }
    this.persist();
    return r;
  }
  getReservationsByItem(itemId: number) { return [...this.reservations.values()].filter((r) => r.itemId === itemId); }

  // ── Wishlists ──────────────────────────────────────────────────────────────
  getWishlistsByUser(userId: number) { return [...this.wishlists.values()].filter((w) => w.userId === userId); }
  createWishlist(data: any) {
    const w = { id: this.id("wishlists"), ...data, createdAt: new Date(), updatedAt: new Date() };
    this.wishlists.set(w.id, w);
    this.persist();
    mongoService.saveWishlist(w).catch(() => {});
    return w;
  }
  getWishlistById(id: number) { return this.wishlists.get(id) || null; }
  updateWishlist(id: number, data: any) {
    const w = this.wishlists.get(id);
    if (!w) return null;
    Object.assign(w, data, { updatedAt: new Date() });
    this.persist();
    mongoService.saveWishlist(w).catch(() => {});
    return w;
  }
  deleteWishlist(id: number) {
    this.wishlists.delete(id);
    for (const [k, v] of this.wishlistItems) { if (v.wishlistId === id) this.wishlistItems.delete(k); }
    this.persist();
    mongoService.deleteWishlist(id).catch(() => {});
  }

  // ── Wishlist Items ─────────────────────────────────────────────────────────
  getWishlistItemById(id: number) { return this.wishlistItems.get(id) || null; }
  getWishlistItems(wishlistId: number) { return [...this.wishlistItems.values()].filter((i) => i.wishlistId === wishlistId); }
  createWishlistItem(data: any) {
    const i = { id: this.id("wishlistItems"), ...data, purchased: false, createdAt: new Date() };
    this.wishlistItems.set(i.id, i);
    this.persist();
    return i;
  }
  updateWishlistItem(id: number, data: any) {
    const i = this.wishlistItems.get(id);
    if (!i) return null;
    Object.assign(i, data);
    this.persist();
    return i;
  }
  deleteWishlistItem(id: number) { 
    this.wishlistItems.delete(id); 
    this.persist();
  }

  // ── Event Reminders ────────────────────────────────────────────────────────
  getRemindersByUser(userId: number) { return [...this.reminders.values()].filter((r) => r.userId === userId); }
  createReminder(data: any) {
    const r = { id: this.id("reminders"), ...data, lastNotified: null, createdAt: new Date() };
    this.reminders.set(r.id, r);
    this.persist();
    return r;
  }
  updateReminder(id: number, data: any) {
    const r = this.reminders.get(id);
    if (!r) return null;
    Object.assign(r, data);
    this.persist();
    return r;
  }
  deleteReminder(id: number) { 
    this.reminders.delete(id); 
    this.persist();
  }
  getUpcomingReminders(userId: number, daysAhead = 30) {
    const now = Date.now();
    const cutoff = now + daysAhead * 24 * 60 * 60 * 1000;
    return this.getRemindersByUser(userId).filter((r) => {
      const t = new Date(r.eventDate).getTime();
      return t >= now && t <= cutoff;
    });
  }

  // ── Search Records ─────────────────────────────────────────────────────────
  createSearchRecord(data: any) {
    const s = { id: this.id("searches"), ...data, createdAt: new Date() };
    this.searches.push(s);
    if (this.searches.length > 200) {
      this.searches = this.searches.slice(-200);
    }
    mongoService.saveSearchRecord(s).catch(() => {});
    return s;
  }
  getRecentSearches(limit = 20) {
    return [...this.searches].reverse().slice(0, limit);
  }
  getSearchCount() { return this.searches.length; }

  // ── Saved Products ─────────────────────────────────────────────────────────
  getSavedByUser(userId: number) { return [...this.saved.values()].filter((s) => s.userId === userId); }
  createSaved(data: any) {
    const s = { id: this.id("saved"), ...data, createdAt: new Date() };
    this.saved.set(s.id, s);
    this.persist();
    return s;
  }
  deleteSaved(id: number) { 
    this.saved.delete(id); 
    this.persist();
  }

  // ── Orders (Direct Purchases & Checkout) ──────────────────────────────────
  createOrder(data: any) {
    const id = this.id("orders");
    const orderNumber = `SOVGA-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
    const order = {
      id,
      orderNumber,
      status: "new",
      createdAt: new Date(),
      ...data,
    };
    this.orders.set(id, order);
    this.persist();
    mongoService.saveOrder(order).catch(() => {});
    return order;
  }

  getOrders(userId?: number) {
    const all = [...this.orders.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (userId) return all.filter((o) => o.userId === userId);
    return all;
  }

  getOrderById(id: number) {
    return this.orders.get(id);
  }

  updateOrderStatus(id: number, status: string) {
    const order = this.orders.get(id);
    if (!order) return null;
    order.status = status;
    this.orders.set(id, order);
    this.persist();
    mongoService.saveOrder(order).catch(() => {});
    return order;
  }

  getOrderCount() {
    return this.orders.size;
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  getUserCount() { return this.users.size; }
  getRegistryCount() { return this.registries.size; }
  getWishlistCount() { return this.wishlists.size; }
  getSavedCount() { return this.saved.size; }
  getProductCount() { return this.products.size; }

  // Merchant Products
  getMerchantProductsByUser(userId: number) {
    return Array.from(this.merchantProducts.values()).filter(p => p.userId === userId);
  }

  createMerchantProduct(data: any) {
    const id = this.id("merchant_products");
    const product = { id, ...data, createdAt: new Date() };
    this.merchantProducts.set(id, product);
    this.persist();
    return product;
  }

  deleteMerchantProduct(id: number, userId: number) {
    const prod = this.merchantProducts.get(id);
    if (!prod || prod.userId !== userId) return false;
    this.merchantProducts.delete(id);
    this.persist();
    return true;
  }

  // Promocodes
  getPromocodes() {
    if (this.promocodes.size === 0) {
      const defaultPromos = [
        {
          id: 1,
          brand: "Uzum Market",
          code: "SOVGA50K",
          discount: "50,000 UZS",
          description: "250,000 UZS dan yuqori barcha sovg'a xaridlari uchun",
          type: "online",
          expiresIn: "3 kun qoldi",
          color: "blue",
        },
        {
          id: 2,
          brand: "Texnomart",
          code: "SUPER15",
          discount: "15%",
          description: "Kichik maishiy texnika va smartfon aksessuarlari uchun",
          type: "online",
          expiresIn: "Faol",
          color: "amber",
        },
        {
          id: 3,
          brand: "MediaPark",
          code: "BEPULPOST",
          discount: "Bepul Yetkazish",
          description: "Toshkent shahri va viloyatlar bo'ylab bepul kuryerlik",
          type: "online",
          expiresIn: "5 kun qoldi",
          color: "rose",
        },
        {
          id: 4,
          brand: "Asaxiy",
          code: "KITOB20",
          discount: "20%",
          description: "Badiiy va biznes kitoblar to'plami uchun",
          type: "online",
          expiresIn: "Doimiy",
          color: "emerald",
        },
        {
          id: 5,
          brand: "Bellissimo Pizza",
          code: "SOVGACOME",
          discount: "Katta Kombo",
          description: "Tug'ilgan kun va tantanalar uchun maxsus chegirma",
          type: "offline",
          expiresIn: "7 kun qoldi",
          color: "orange",
        },
      ];
      defaultPromos.forEach(p => this.promocodes.set(p.id, p));
    }
    return Array.from(this.promocodes.values());
  }

  // Update User Role
  updateUserRole(userId: number, role: string) {
    const user = this.users.get(userId);
    if (user) {
      user.role = role;
      this.users.set(userId, user);
      this.persist();
      if (!user.isDemo) mongoService.saveUser(user).catch(() => {});
    }
  }

  updateUser(userId: number, fields: any) {
    const user = this.users.get(userId);
    if (!user) return null;
    const updated = { ...user, ...fields, updatedAt: new Date() };
    this.users.set(userId, updated);
    this.persist();
    if (!updated.isDemo) mongoService.saveUser(updated).catch(() => {});
    return updated;
  }

  /** Test accounts for checking the admin panel. Kept only in the local file (never synced to MongoDB). */
  createDemoUsers(rows: any[]): number {
    for (const r of rows) {
      const id = this.id("users");
      this.users.set(id, { ...r, id, isDemo: true });
    }
    this.persist();
    return rows.length;
  }

  deleteDemoUsers(): number {
    let n = 0;
    for (const [id, u] of [...this.users]) {
      if (u.isDemo) {
        this.users.delete(id);
        n++;
      }
    }
    if (n) this.persist();
    return n;
  }

  deleteUser(userId: number): boolean {
    const existed = this.users.delete(userId);
    if (existed) {
      for (const r of [...this.registries.values()]) if (r.userId === userId) this.deleteRegistry(r.id);
      for (const w of [...this.wishlists.values()]) if (w.userId === userId) this.deleteWishlist(w.id);
      for (const [k, v] of this.reminders) if (v.userId === userId) this.reminders.delete(k);
      for (const [k, v] of this.saved) if (v.userId === userId) this.saved.delete(k);
      for (const [k, v] of this.priceTrackers) if (v.userId === userId) this.priceTrackers.delete(k);
      for (const [k, v] of this.merchantProducts) if (v.userId === userId) this.merchantProducts.delete(k);
      for (const o of this.orders.values()) if (o.userId === userId) o.userId = null;
      for (const sRec of this.searches) if (sRec.userId === userId) sRec.userId = null;
    }
    if (existed) {
      this.persist();
      mongoService.deleteUser(userId).catch(() => {});
    }
    return existed;
  }

  // ── Subscription Receipts ───────────────────────────────────────────────
  saveReceiptRecord(data: Omit<SubscriptionReceiptRecord, "id" | "createdAt">): SubscriptionReceiptRecord {
    const id = this.id("receipts");
    const record: SubscriptionReceiptRecord = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      verifiedAt: data.verifiedAt || new Date().toISOString(),
    };
    this.receipts.set(id, record);
    this.persist();
    return record;
  }

  getReceipts(userId?: number): SubscriptionReceiptRecord[] {
    const all = [...this.receipts.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (userId) return all.filter((r) => r.userId === userId);
    return all;
  }

  updateReceiptStatus(
    id: number,
    status: "verified" | "rejected" | "manual_review",
    reason?: string
  ): SubscriptionReceiptRecord | null {
    const record = this.receipts.get(id);
    if (!record) return null;
    record.status = status;
    if (reason) record.reason = reason;
    if (status === "verified") {
      record.verifiedAt = new Date().toISOString();
      // the route activates the paid plan (see planService.activatePlan)
    }
    this.receipts.set(id, record);
    this.persist();
    return record;
  }
}

export const storage = new PersistentStorage();
