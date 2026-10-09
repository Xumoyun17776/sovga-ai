import mongoose from "mongoose";
import {
  UserModel,
  ProductModel,
  OfferModel,
  PriceHistoryModel,
  PriceTrackerModel,
  RegistryModel,
  RegistryItemModel,
  ReservationModel,
  WishlistModel,
  WishlistItemModel,
  EventReminderModel,
  SearchRecordModel,
  SavedProductModel,
  OrderModel,
} from "./models.js";

export interface MongoStatusInfo {
  isConnected: boolean;
  status: "connected" | "connecting" | "disconnected" | "error";
  uri: string;
  dbName: string;
  error?: string;
  collections?: Record<string, number>;
  lastChecked: string;
}

class MongoService {
  private isConnected = false;
  private status: "connected" | "connecting" | "disconnected" | "error" = "disconnected";
  private lastError: string | null = null;
  private activeUri: string = "";
  private dbName: string = "sovga_ai";

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    mongoose.connection.on("connected", () => {
      this.isConnected = true;
      this.status = "connected";
      this.lastError = null;
      console.log(`🍃 [MongoDB] Ulanish muvaffaqiyatli o'rnatildi: ${this.getMaskedUri()}`);
    });

    mongoose.connection.on("error", (err: any) => {
      this.isConnected = false;
      this.status = "error";
      this.lastError = err?.message || "Noma'lum xatolik";
      console.warn(`⚠️ [MongoDB] Xatolik yuz berdi: ${this.lastError}`);
    });

    mongoose.connection.on("disconnected", () => {
      this.isConnected = false;
      this.status = "disconnected";
      console.log("🔌 [MongoDB] Ulanish uzildi");
    });
  }

  public getMaskedUri(rawUri?: string): string {
    try { if (process.loadEnvFile) process.loadEnvFile(); } catch {}
    const uri = rawUri || this.activeUri || process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sovga_ai";
    return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:******@");
  }

  public async connect(overrideUri?: string): Promise<boolean> {
    try { if (process.loadEnvFile) process.loadEnvFile(); } catch {}
    const targetUri =
      overrideUri ||
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/sovga_ai";

    this.activeUri = targetUri;
    this.status = "connecting";

    try {
      if (mongoose.connection.readyState === 1) {
        this.isConnected = true;
        this.status = "connected";
        return true;
      }

      await mongoose.connect(targetUri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 5000,
      });

      this.isConnected = true;
      this.status = "connected";
      this.dbName = mongoose.connection.db?.databaseName || "sovga_ai";
      this.lastError = null;
      return true;
    } catch (err: any) {
      this.isConnected = false;
      this.status = "error";
      this.lastError = err?.message || "MongoDB ga ulanib bo'lmadi";
      console.warn(`ℹ️ [MongoDB] Ulanish kutilyapti (${this.getMaskedUri()}): ${this.lastError}`);
      return false;
    }
  }

  public getStatus(): MongoStatusInfo {
    return {
      isConnected: this.isConnected,
      status: this.status,
      uri: this.getMaskedUri(),
      dbName: this.dbName,
      error: this.lastError || undefined,
      lastChecked: new Date().toISOString(),
    };
  }

  public async getCollectionCounts(): Promise<Record<string, number>> {
    if (!this.isConnected) return {};
    try {
      const [
        users,
        products,
        offers,
        registries,
        registryItems,
        reservations,
        wishlists,
        wishlistItems,
        reminders,
        priceTrackers,
        searches,
        saved,
        orders,
      ] = await Promise.all([
        UserModel.countDocuments(),
        ProductModel.countDocuments(),
        OfferModel.countDocuments(),
        RegistryModel.countDocuments(),
        RegistryItemModel.countDocuments(),
        ReservationModel.countDocuments(),
        WishlistModel.countDocuments(),
        WishlistItemModel.countDocuments(),
        EventReminderModel.countDocuments(),
        PriceTrackerModel.countDocuments(),
        SearchRecordModel.countDocuments(),
        SavedProductModel.countDocuments(),
        OrderModel.countDocuments(),
      ]);

      return {
        users,
        products,
        offers,
        registries,
        registryItems,
        reservations,
        wishlists,
        wishlistItems,
        reminders,
        priceTrackers,
        searches,
        saved,
        orders,
      };
    } catch {
      return {};
    }
  }

  /**
   * MongoDB ga bazani to'liq import qilish va sinxronlashtirish
   */
  public async syncInitialData(data: {
    users?: any[];
    products?: any[];
    offers?: any[];
    registries?: any[];
    registryItems?: any[];
    reservations?: any[];
    wishlists?: any[];
    wishlistItems?: any[];
    reminders?: any[];
    priceTrackers?: any[];
    searches?: any[];
    saved?: any[];
  }) {
    if (!this.isConnected) return;

    try {
      // 1. Users
      if (data.users && data.users.length > 0) {
        for (const u of data.users) {
          await UserModel.updateOne({ id: u.id }, { $set: u }, { upsert: true });
        }
      }

      // 2. Products (Chunked bulkWrite to avoid socket exhaustion and timeouts)
      if (data.products && data.products.length > 0) {
        const productCount = await ProductModel.countDocuments();
        if (productCount < data.products.length) {
          const ops = data.products.map((p) => ({
            updateOne: {
              filter: { id: p.id },
              update: { $set: p },
              upsert: true,
            },
          }));
          for (let i = 0; i < ops.length; i += 300) {
            await ProductModel.bulkWrite(ops.slice(i, i + 300), { ordered: false });
          }
        }
      }

      // 3. Offers (Chunked bulkWrite)
      if (data.offers && data.offers.length > 0) {
        const offerCount = await OfferModel.countDocuments();
        if (offerCount < data.offers.length) {
          const ops = data.offers.map((o) => ({
            updateOne: {
              filter: { id: o.id },
              update: { $set: o },
              upsert: true,
            },
          }));
          for (let i = 0; i < ops.length; i += 300) {
            await OfferModel.bulkWrite(ops.slice(i, i + 300), { ordered: false });
          }
        }
      }

      // 4. Registries
      if (data.registries && data.registries.length > 0) {
        for (const r of data.registries) {
          await RegistryModel.updateOne({ id: r.id }, { $set: r }, { upsert: true });
        }
      }

      // 5. Wishlists
      if (data.wishlists && data.wishlists.length > 0) {
        for (const w of data.wishlists) {
          await WishlistModel.updateOne({ id: w.id }, { $set: w }, { upsert: true });
        }
      }

      console.log("🚀 [MongoDB] Barcha kolleksiyalar muvaffaqiyatli sinxronlashtirildi!");
    } catch (err: any) {
      console.warn("⚠️ [MongoDB] Boshlang'ich ma'lumotlarni sinxronlashda xatolik:", err?.message);
    }
  }

  /**
   * MongoDB dan mavjud ma'lumotlarni o'qib olish (Hydration)
   */
  public async fetchAllData(): Promise<{
    users: any[];
    registries: any[];
    registryItems: any[];
    wishlists: any[];
    wishlistItems: any[];
    reminders: any[];
    priceTrackers: any[];
    saved: any[];
    orders: any[];
  } | null> {
    if (!this.isConnected) return null;
    try {
      const [
        users,
        registries,
        registryItems,
        wishlists,
        wishlistItems,
        reminders,
        priceTrackers,
        saved,
        orders,
      ] = await Promise.all([
        UserModel.find().lean(),
        RegistryModel.find().lean(),
        RegistryItemModel.find().lean(),
        WishlistModel.find().lean(),
        WishlistItemModel.find().lean(),
        EventReminderModel.find().lean(),
        PriceTrackerModel.find().lean(),
        SavedProductModel.find().lean(),
        OrderModel.find().lean(),
      ]);

      return {
        users,
        registries,
        registryItems,
        wishlists,
        wishlistItems,
        reminders,
        priceTrackers,
        saved,
        orders,
      };
    } catch (err: any) {
      console.warn("⚠️ [MongoDB] fetchAllData error:", err?.message);
      return null;
    }
  }

  /**
   * Foydalanuvchini MongoDB ga saqlash yoki yangilash
   */
  public async saveUser(user: any) {
    if (!this.isConnected) return;
    try {
      await UserModel.updateOne({ id: user.id }, { $set: user }, { upsert: true });
    } catch (e: any) {
      console.warn("[MongoDB] saveUser error:", e?.message);
    }
  }

  public async deleteUser(id: number) {
    if (!this.isConnected) return;
    try {
      await UserModel.deleteOne({ id });
    } catch (e: any) {
      console.warn("[MongoDB] deleteUser error:", e?.message);
    }
  }

  /**
   * Mahsulotni MongoDB ga saqlash
   */
  public async saveProduct(product: any) {
    if (!this.isConnected) return;
    try {
      await ProductModel.updateOne({ id: product.id }, { $set: product }, { upsert: true });
    } catch (e: any) {
      console.warn("[MongoDB] saveProduct error:", e?.message);
    }
  }

  /**
   * Qidiruv yozuvini MongoDB ga qo'shish
   */
  public async saveSearchRecord(record: any) {
    if (!this.isConnected) return;
    try {
      await SearchRecordModel.updateOne({ id: record.id }, { $set: record }, { upsert: true });
    } catch (e: any) {
      console.warn("[MongoDB] saveSearchRecord error:", e?.message);
    }
  }

  /**
   * Istaklar ro'yxatini (Wishlist) saqlash
   */
  public async saveWishlist(wishlist: any) {
    if (!this.isConnected) return;
    try {
      await WishlistModel.updateOne({ id: wishlist.id }, { $set: wishlist }, { upsert: true });
    } catch (e: any) {
      console.warn("[MongoDB] saveWishlist error:", e?.message);
    }
  }

  public async deleteWishlist(id: number) {
    if (!this.isConnected) return;
    try {
      await WishlistModel.deleteOne({ id });
      await WishlistItemModel.deleteMany({ wishlistId: id });
    } catch (e: any) {
      console.warn("[MongoDB] deleteWishlist error:", e?.message);
    }
  }

  /**
   * To'y reestrini (Registry) saqlash
   */
  public async saveRegistry(registry: any) {
    if (!this.isConnected) return;
    try {
      await RegistryModel.updateOne({ id: registry.id }, { $set: registry }, { upsert: true });
    } catch (e: any) {
      console.warn("[MongoDB] saveRegistry error:", e?.message);
    }
  }

  public async deleteRegistry(id: number) {
    if (!this.isConnected) return;
    try {
      await RegistryModel.deleteOne({ id });
      await RegistryItemModel.deleteMany({ registryId: id });
    } catch (e: any) {
      console.warn("[MongoDB] deleteRegistry error:", e?.message);
    }
  }

  /**
   * Narx kuzatuvchisini saqlash
   */
  public async savePriceTracker(tracker: any) {
    if (!this.isConnected) return;
    try {
      await PriceTrackerModel.updateOne({ id: tracker.id }, { $set: tracker }, { upsert: true });
    } catch (e: any) {
      console.warn("[MongoDB] savePriceTracker error:", e?.message);
    }
  }

  public async deletePriceTracker(id: number) {
    if (!this.isConnected) return;
    try {
      await PriceTrackerModel.deleteOne({ id });
    } catch (e: any) {
      console.warn("[MongoDB] deletePriceTracker error:", e?.message);
    }
  }

  /**
   * Buyurtmani MongoDB ga saqlash
   */
  public async saveOrder(order: any) {
    if (!this.isConnected) return;
    try {
      await OrderModel.updateOne({ id: order.id }, { $set: order }, { upsert: true });
    } catch (e: any) {
      console.warn("[MongoDB] saveOrder error:", e?.message);
    }
  }

  public async getOrders(limit = 100): Promise<any[]> {
    if (!this.isConnected) return [];
    try {
      return await OrderModel.find().sort({ createdAt: -1 }).limit(limit).lean();
    } catch (e: any) {
      console.warn("[MongoDB] getOrders error:", e?.message);
      return [];
    }
  }
}

export const mongoService = new MongoService();
export default mongoService;
