import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  serial,
  varchar,
  real,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Users ───────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password"), // null for OAuth users
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  googleId: varchar("google_id", { length: 255 }).unique(),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("uz"),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Products ────────────────────────────────────────────────────────────
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  imageUrl: text("image_url"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Offers (price from a specific store) ────────────────────────────────
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  store: varchar("store", { length: 255 }).notNull(),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  currency: varchar("currency", { length: 10 }).default("UZS").notNull(),
  url: text("url").notNull(),
  availability: varchar("availability", { length: 50 }),
  discount: varchar("discount", { length: 50 }),
  rating: real("rating"),
  reviewCount: integer("review_count"),
  verified: boolean("verified").default(false),
  lastChecked: timestamp("last_checked").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Price History ───────────────────────────────────────────────────────
export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  store: varchar("store", { length: 255 }).notNull(),
  price: real("price").notNull(),
  currency: varchar("currency", { length: 10 }).default("UZS").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// ─── Wedding Registries ─────────────────────────────────────────────────
export const weddingRegistries = pgTable("wedding_registries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  partnerName1: varchar("partner_name_1", { length: 255 }).notNull(),
  partnerName2: varchar("partner_name_2", { length: 255 }).notNull(),
  weddingDate: timestamp("wedding_date"),
  coverImageUrl: text("cover_image_url"),
  message: text("message"),
  isPublic: boolean("is_public").default(true),
  revealPurchasers: boolean("reveal_purchasers").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Registry Items ─────────────────────────────────────────────────────
export const registryItems = pgTable("registry_items", {
  id: serial("id").primaryKey(),
  registryId: integer("registry_id").references(() => weddingRegistries.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  price: real("price"),
  currency: varchar("currency", { length: 10 }).default("UZS"),
  url: text("url"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  quantity: integer("quantity").default(1),
  quantityFulfilled: integer("quantity_fulfilled").default(0),
  category: varchar("category", { length: 100 }),
  isCashGoal: boolean("is_cash_goal").default(false),
  cashGoalAmount: real("cash_goal_amount"),
  cashCollected: real("cash_collected").default(0),
  status: varchar("status", { length: 20 }).default("available"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Registry Reservations ──────────────────────────────────────────────
export const registryReservations = pgTable("registry_reservations", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => registryItems.id).notNull(),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  guestEmail: varchar("guest_email", { length: 255 }),
  guestPhone: varchar("guest_phone", { length: 50 }),
  quantity: integer("quantity").default(1),
  cashAmount: real("cash_amount"),
  message: text("message"),
  purchased: boolean("purchased").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Wishlists ──────────────────────────────────────────────────────────
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).default("general"),
  isPublic: boolean("is_public").default(false),
  slug: varchar("slug", { length: 100 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Wishlist Items ─────────────────────────────────────────────────────
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  wishlistId: integer("wishlist_id").references(() => wishlists.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  price: real("price"),
  currency: varchar("currency", { length: 10 }).default("UZS"),
  url: text("url"),
  store: varchar("store", { length: 255 }),
  priority: varchar("priority", { length: 20 }).default("medium"),
  notes: text("notes"),
  purchased: boolean("purchased").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Event Reminders ────────────────────────────────────────────────────
export const eventReminders = pgTable("event_reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  personName: varchar("person_name", { length: 255 }).notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  eventDate: timestamp("event_date").notNull(),
  recurring: boolean("recurring").default(true),
  budget: real("budget"),
  currency: varchar("currency", { length: 10 }).default("UZS"),
  notes: text("notes"),
  lastNotified: timestamp("last_notified"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Search History ─────────────────────────────────────────────────────
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  query: text("query").notNull(),
  occasion: varchar("occasion", { length: 50 }),
  budget: real("budget"),
  currency: varchar("currency", { length: 10 }).default("UZS"),
  resultsCount: integer("results_count"),
  researchSources: integer("research_sources"),
  aiModel: varchar("ai_model", { length: 50 }),
  responseTimeMs: integer("response_time_ms"),
  cached: boolean("cached").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Saved Products ─────────────────────────────────────────────────────
export const savedProducts = pgTable("saved_products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productData: jsonb("product_data").notNull(),
  searchQuery: text("search_query"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Merchant Products ───────────────────────────────────────────────────
export const merchantProducts = pgTable("merchant_products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  stock: integer("stock").notNull(),
  views: integer("views").default(0),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Promocodes ─────────────────────────────────────────────────────────
export const promocodes = pgTable("promocodes", {
  id: serial("id").primaryKey(),
  brand: varchar("brand", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  discount: varchar("discount", { length: 50 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 20 }).default("online"),
  expiresIn: varchar("expires_in", { length: 50 }),
  color: varchar("color", { length: 20 }),
});

// ─── Relations ──────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  wishlists: many(wishlists),
  weddingRegistries: many(weddingRegistries),
  eventReminders: many(eventReminders),
  savedProducts: many(savedProducts),
  merchantProducts: many(merchantProducts),
}));

export const productsRelations = relations(products, ({ many }) => ({
  offers: many(offers),
  priceHistory: many(priceHistory),
}));

export const offersRelations = relations(offers, ({ one }) => ({
  product: one(products, { fields: [offers.productId], references: [products.id] }),
}));

export const weddingRegistriesRelations = relations(weddingRegistries, ({ one, many }) => ({
  user: one(users, { fields: [weddingRegistries.userId], references: [users.id] }),
  items: many(registryItems),
}));

export const registryItemsRelations = relations(registryItems, ({ one, many }) => ({
  registry: one(weddingRegistries, { fields: [registryItems.registryId], references: [weddingRegistries.id] }),
  reservations: many(registryReservations),
}));

export const registryReservationsRelations = relations(registryReservations, ({ one }) => ({
  item: one(registryItems, { fields: [registryReservations.itemId], references: [registryItems.id] }),
}));

export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  user: one(users, { fields: [wishlists.userId], references: [users.id] }),
  items: many(wishlistItems),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, { fields: [wishlistItems.wishlistId], references: [wishlists.id] }),
}));

export const merchantProductsRelations = relations(merchantProducts, ({ one }) => ({
  user: one(users, { fields: [merchantProducts.userId], references: [users.id] }),
}));
