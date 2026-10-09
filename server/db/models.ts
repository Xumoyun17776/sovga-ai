import mongoose, { Schema } from "mongoose";

// ─── 1. User Model ───────────────────────────────────────────────────────────
const UserSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "user", enum: ["user", "admin"] },
    preferredLanguage: { type: String, default: "uz" },
    googleId: { type: String, sparse: true, index: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

// ─── 2. Product Model ────────────────────────────────────────────────────────
const ProductSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    brand: { type: String, required: true, index: true },
    imageUrl: { type: String, default: null },
    description: { type: String, default: null },
    specs: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.models.Product || mongoose.model("Product", ProductSchema);

// ─── 3. Offer Model (Multi-Store Price Offers) ──────────────────────────────
const OfferSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    productId: { type: Number, required: true, index: true },
    store: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: null },
    currency: { type: String, default: "UZS" },
    url: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    deliveryDays: { type: Number, default: 1 },
    verified: { type: Boolean, default: false },
    lastChecked: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const OfferModel = mongoose.models.Offer || mongoose.model("Offer", OfferSchema);

// ─── 4. Price History Model ─────────────────────────────────────────────────
const PriceHistorySchema = new Schema(
  {
    productId: { type: Number, required: true, index: true },
    store: { type: String, required: true },
    price: { type: Number, required: true },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const PriceHistoryModel =
  mongoose.models.PriceHistory || mongoose.model("PriceHistory", PriceHistorySchema);

// ─── 5. Price Tracker Model ─────────────────────────────────────────────────
const PriceTrackerSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    productId: { type: Number, default: null },
    productName: { type: String, required: true },
    targetPrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    currency: { type: String, default: "UZS" },
    store: { type: String, default: null },
    url: { type: String, default: null },
    userEmail: { type: String, default: null },
    active: { type: Boolean, default: true },
    notified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const PriceTrackerModel =
  mongoose.models.PriceTracker || mongoose.model("PriceTracker", PriceTrackerSchema);

// ─── 6. Registry Model (Wedding / Gift Registry) ─────────────────────────────
const RegistrySchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    partnerName1: { type: String, required: true },
    partnerName2: { type: String, required: true },
    weddingDate: { type: Date, default: null },
    message: { type: String, default: "" },
    isPublic: { type: Boolean, default: true },
    revealPurchasers: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const RegistryModel =
  mongoose.models.Registry || mongoose.model("Registry", RegistrySchema);

// ─── 7. Registry Item Model ──────────────────────────────────────────────────
const RegistryItemSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    registryId: { type: Number, required: true, index: true },
    productId: { type: Number, default: null },
    desiredQuantity: { type: Number, default: 1 },
    purchasedQuantity: { type: Number, default: 0 },
    priority: { type: String, default: "medium" },
    note: { type: String, default: "" },
    customTitle: { type: String, default: null },
    customPrice: { type: Number, default: null },
    customUrl: { type: String, default: null },
    customImage: { type: String, default: null },
    currency: { type: String, default: "UZS" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const RegistryItemModel =
  mongoose.models.RegistryItem || mongoose.model("RegistryItem", RegistryItemSchema);

// ─── 8. Registry Reservation Model ──────────────────────────────────────────
const ReservationSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    itemId: { type: Number, required: true, index: true },
    guestName: { type: String, required: true },
    guestEmail: { type: String, default: "" },
    guestPhone: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    cashAmount: { type: Number, default: null },
    message: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ReservationModel =
  mongoose.models.Reservation || mongoose.model("Reservation", ReservationSchema);

// ─── 9. Wishlist Model ───────────────────────────────────────────────────────
const WishlistSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, default: "general" },
    isPublic: { type: Boolean, default: false },
    slug: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const WishlistModel =
  mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);

// ─── 10. Wishlist Item Model ────────────────────────────────────────────────
const WishlistItemSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    wishlistId: { type: Number, required: true, index: true },
    productId: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const WishlistItemModel =
  mongoose.models.WishlistItem || mongoose.model("WishlistItem", WishlistItemSchema);

// ─── 11. Event Reminder Model ───────────────────────────────────────────────
const EventReminderSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    title: { type: String, required: true },
    eventDate: { type: Date, required: true },
    recipientName: { type: String, required: true },
    relationship: { type: String, default: "friend" },
    budgetLimit: { type: Number, default: 0 },
    reminderDaysBefore: { type: Number, default: 7 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const EventReminderModel =
  mongoose.models.EventReminder || mongoose.model("EventReminder", EventReminderSchema);

// ─── 12. Search Record Model ────────────────────────────────────────────────
const SearchRecordSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, default: null, index: true },
    query: { type: String, required: true },
    occasion: { type: String, default: null },
    budget: { type: Number, default: null },
    currency: { type: String, default: "UZS" },
    resultsCount: { type: Number, default: 0 },
    researchSources: { type: Number, default: 0 },
    aiModel: { type: String, default: null },
    responseTimeMs: { type: Number, default: null },
    cached: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SearchRecordModel =
  mongoose.models.SearchRecord || mongoose.model("SearchRecord", SearchRecordSchema);

// ─── 13. Saved Product Model ────────────────────────────────────────────────
const SavedProductSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    productId: { type: Number, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SavedProductModel =
  mongoose.models.SavedProduct || mongoose.model("SavedProduct", SavedProductSchema);

// ─── 14. Order Model (Direct Purchases & Checkout) ──────────────────────────
const OrderSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Number, default: null, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    region: { type: String, default: "Toshkent shahri" },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productStore: { type: String, default: "Sovg'a AI" },
    productUrl: { type: String, default: null },
    productImage: { type: String, default: null },
    quantity: { type: Number, default: 1 },
    giftPackaging: { type: Boolean, default: false },
    giftMessage: { type: String, default: null },
    paymentMethod: { type: String, default: "cash_on_delivery" },
    status: { type: String, default: "new", enum: ["new", "processing", "shipped", "delivered", "cancelled"] },
    totalAmount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const OrderModel =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

