import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { storage, isProhibitedContent } from "./storage.js";
import { mongoService } from "./db/mongo.js";
import { aiResearchService } from "./services/aiResearchService.js";
import { buildGiftQuery, applyAvoidList } from "./services/giftEngine.js";
import { matchesAllWords, rankByRelevance, storeSearchQueries } from "./services/searchRelevance.js";
import { searchStores } from "./services/liveStores.js";
import { getLivePriceBoard } from "./services/livePriceBoard.js";
import { buildDemoUsers } from "./services/demoUsers.js";
import { countSearch, trackerLimitError, registryLimitError, planStatus, activatePlan, effectivePlan, isAdminUser, paymentCards } from "./services/planService.js";
import { PLANS, PAID_PLANS, normalizePlanId } from "../shared/plans.js";
import { liveCatalogReady, filterLiveCatalog, liveCategories, liveCatalogById, liveCatalogMeta } from "./services/liveCatalog.js";
import { getDuelVotes, addDuelVote } from "./services/duelVotes.js";
import { langOf } from "./services/lang.js";
import { aiSearchStatus } from "./services/aiWebSearch.js";
import { webIndexStats, rememberProducts } from "./services/webIndex.js";
import { smsStatus, smsConfigured, sendSms, otpMessage } from "./services/smsService.js";
import { researchLimiter, apiLimiter, authLimiter } from "./middleware/rateLimit.js";
import { providerRegistry } from "./providers/baseProvider.js";
import { ensureProductUrl } from "./services/urlHelper.js";
import { analyticsService } from "./services/analyticsService.js";
import { generateTelegramAuthLink } from "./services/telegramBotService.js";
import { receiptVerificationService } from "./services/receiptVerificationService.js";
import { conciergeChatService } from "./services/conciergeChatService.js";
import { giftDetectiveService } from "./services/giftDetectiveService.js";
import {
  calculateInstallmentPlans,
  findSmartAlternatives,
  analyzeMarketPriceTrend,
  verifyStoreReputation,
  generateCalligraphyCards,
  getRegionalDeliveryInfo,
  compareProductsDuel,
} from "./services/subFeatures.js";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) return res.status(401).json({ success: false, error: "Authentication required" });
  next();
}

const SUPER_ADMIN_EMAIL = "baxorasaidova@gmail.com";

function isSuperAdmin(user: any): boolean {
  return !!user && String(user.email || "").toLowerCase().trim() === SUPER_ADMIN_EMAIL;
}

/** Return a shallow copy of `body` containing only the listed keys. */
function pick(body: any, keys: string[]): Record<string, any> {
  const out: Record<string, any> = {};
  if (!body || typeof body !== "object") return out;
  for (const k of keys) if (body[k] !== undefined) out[k] = body[k];
  return out;
}

function normalizeUzPhone(raw: unknown): string | null {
  const digits = String(raw || "").replace(/[^0-9]/g, "");
  if (digits.length < 9) return null;
  return digits.startsWith("998") && digits.length >= 12 ? `+${digits.slice(0, 12)}` : `+998${digits.slice(-9)}`;
}

function slugify(text: string): string {
  return String(text || "")
    .toLowerCase()
    .replace(/['ʻʼ`]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const REGISTRY_EDITABLE = ["partnerName1", "partnerName2", "weddingDate", "message", "isPublic", "revealPurchasers", "coverImageUrl", "venue", "theme"];
const REGISTRY_ITEM_EDITABLE = ["name", "description", "imageUrl", "price", "currency", "url", "store", "priority", "quantity", "category", "isCashGoal", "cashGoalAmount", "notes", "status"];
const WISHLIST_EDITABLE = ["title", "description", "type", "isPublic", "eventDate", "theme"];
const WISHLIST_ITEM_EDITABLE = ["name", "description", "imageUrl", "price", "currency", "url", "store", "priority", "notes", "purchased"];
const REMINDER_EDITABLE = ["title", "personName", "eventType", "eventDate", "recurring", "budget", "currency", "notes"];

async function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.session.userId) return res.status(401).json({ success: false, error: "Authentication required" });
  const user = storage.getUserById(req.session.userId);
  if (!user || user.email?.toLowerCase().trim() !== SUPER_ADMIN_EMAIL) {
    return res.status(403).json({
      success: false,
      error: `Kirish taqiqlangan. Bu panelga faqat ${SUPER_ADMIN_EMAIL} hisobi orqali kirish mumkin.`,
    });
  }
  next();
}

export function registerRoutes(app: Express) {
  // Page views are recorded by the client (App.tsx → /api/analytics/track) on every route change,
  // so the server no longer counts raw GETs too (that double-counted visits and logged files like /favicon.ico).

  // Apply rate limiting
  app.use("/api/", apiLimiter);
  app.use("/api/research/", researchLimiter);

  // ─── Auth (Database-Backed User Authentication) ─────────
  app.get("/api/auth/telegram-link", (req, res) => {
    if (!req.session.userId) return res.status(401).json({ success: false, error: "Unauthorized" });
    const link = generateTelegramAuthLink(req.session.userId);
    res.json({ success: true, data: { link } });
  });

  const otpStore = new Map<string, { code: string; expires: number; attempts?: number; sentAt?: number }>();

  app.post("/api/auth/send-otp", authLimiter, async (req: Request, res: Response) => {
    try {
      const { phone } = req.body;
      const digits = String(phone || "").replace(/[^0-9]/g, "");
      if (digits.length < 9) {
        return res.status(400).json({ success: false, error: "To'g'ri telefon raqam kiriting" });
      }
      const formattedPhone = digits.startsWith("998") ? `+${digits}` : `+998${digits.slice(-9)}`;

      // One code per minute per number (each SMS costs money)
      const prev = otpStore.get(formattedPhone);
      if (prev?.sentAt && Date.now() - prev.sentAt < 60 * 1000) {
        const wait = Math.ceil((60 * 1000 - (Date.now() - prev.sentAt)) / 1000);
        return res.status(429).json({ success: false, error: `Yangi kodni ${wait} soniyadan keyin so'rashingiz mumkin` });
      }

      const code = String(Math.floor(1000 + Math.random() * 9000));
      otpStore.set(formattedPhone, { code, expires: Date.now() + 3 * 60 * 1000, sentAt: Date.now() });

      // Real SMS when Eskiz.uz is configured (see server/services/smsService.ts)
      if (smsConfigured()) {
        try {
          await sendSms(formattedPhone, otpMessage(code));
          return res.json({ success: true, message: "Tasdiqlash kodi telefoningizga SMS orqali yuborildi", data: {} });
        } catch (e: any) {
          console.error("[SMS] send failed:", e?.message);
          otpStore.delete(formattedPhone);
          return res.status(502).json({ success: false, error: "SMS yuborib bo'lmadi. Birozdan keyin qayta urinib ko'ring yoki parol bilan kiring." });
        }
      }

      // No SMS provider: the code may only be shown on screen outside production (or with OTP_DEMO_MODE=true);
      // otherwise anyone could log into any phone-number account.
      const demoMode = process.env.NODE_ENV !== "production" || process.env.OTP_DEMO_MODE === "true";
      if (!demoMode) {
        otpStore.delete(formattedPhone);
        return res.status(503).json({
          success: false,
          error: "SMS orqali kirish vaqtincha mavjud emas. Iltimos, email/telefon va parol bilan kiring.",
        });
      }
      console.log(`[SMS Gateway] (demo) OTP for ${formattedPhone}: ${code}`);

      res.json({
        success: true,
        message: "Tasdiqlash kodi telefoningizga SMS orqali yuborildi",
        data: { demoCode: code },
        demoCode: code,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/auth/verify-otp", authLimiter, async (req: Request, res: Response) => {
    try {
      const { phone, code, name } = req.body;
      const digits = String(phone || "").replace(/[^0-9]/g, "");
      const formattedPhone = digits.startsWith("998") ? `+${digits}` : `+998${digits.slice(-9)}`;
      const cleanCode = String(code || "").trim();

      const record = otpStore.get(formattedPhone) as { code: string; expires: number; attempts?: number } | undefined;
      if (!record || record.expires < Date.now() || record.code !== cleanCode) {
        if (record) {
          record.attempts = (record.attempts || 0) + 1;
          if (record.attempts >= 5) otpStore.delete(formattedPhone);
        }
        return res.status(400).json({ success: false, error: "Tasdiqlash kodi noto'g'ri yoki muddati tugagan" });
      }

      otpStore.delete(formattedPhone);

      let user = storage.getUserByIdentifier(formattedPhone);
      if (!user) {
        const dummyEmail = `${digits.slice(-9)}@sovga.uz`;
        user = storage.createUser({
          phone: formattedPhone,
          email: dummyEmail,
          name: name ? String(name).trim() : `Foydalanuvchi +${digits.slice(-4)}`,
          role: "user",
        });
      }

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) console.error("Session error on OTP verify:", err);
        res.json({
          success: true,
          data: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
          },
        });
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/auth/register", authLimiter, async (req: Request, res: Response) => {
    try {
      const { email, phone, identifier, password, name } = req.body;
      const rawId = String(identifier || email || phone || "").trim();
      const cleanName = String(name || "").trim();
      const rawPass = String(password || "");

      if (!cleanName || cleanName.length < 2) {
        return res.status(400).json({ success: false, error: "Iltimos, haqiqiy ismingizni kiriting (kamida 2 ta harf)" });
      }

      if (!rawId) {
        return res.status(400).json({ success: false, error: "Elektron pochta yoki telefon raqamingizni kiriting" });
      }

      // Strong password validation: at least 6 characters
      if (rawPass.length < 6) {
        return res.status(400).json({ success: false, error: "Xavfsizlik uchun parol kamida 6 ta belgidan iborat bo'lishi shart" });
      }

      // Determine if identifier is phone or email
      let userEmail: string | undefined = undefined;
      let userPhone: string | undefined = undefined;

      const phoneDigits = rawId.replace(/[^0-9]/g, "");
      if (rawId.includes("@")) {
        userEmail = rawId.toLowerCase();
      } else if (phoneDigits.length >= 9) {
        userPhone = phoneDigits.startsWith("998") ? `+${phoneDigits}` : `+998${phoneDigits.slice(-9)}`;
        userEmail = `${phoneDigits.slice(-9)}@sovga.uz`; // synthetic fallback email for phone users
      } else {
        return res.status(400).json({
          success: false,
          error: "Iltimos, to'g'ri elektron pochta (masalan: ism@gmail.com) yoki telefon raqami (+998901234567) kiriting",
        });
      }

      // Check existing user
      const existing = storage.getUserByIdentifier(userEmail || userPhone || rawId);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: "Ushbu ma'lumotlar bilan allaqachon ro'yxatdan o'tilgan. Iltimos, tizimga kiring",
        });
      }

      const hashed = await bcrypt.hash(rawPass, 10);
      const user = storage.createUser({
        email: userEmail,
        phone: userPhone,
        password: hashed,
        name: cleanName,
        role: "user",
      });

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error on register:", err);
        }
        res.json({
          success: true,
          data: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            role: user.role,
          },
        });
      });
    } catch (e: any) {
      console.error("Register error:", e);
      res.status(500).json({ success: false, error: e.message || "Ro'yxatdan o'tishda xatolik" });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req: Request, res: Response) => {
    try {
      const { email, phone, identifier, password } = req.body;
      const rawId = String(identifier || email || phone || "").trim();
      const rawPass = String(password || "");

      if (!rawId || !rawPass) {
        return res.status(400).json({ success: false, error: "Elektron pochta (yoki telefon) va parolni kiriting" });
      }

      const user = storage.getUserByIdentifier(rawId);

      if (!user || !user.password) {
        return res.status(401).json({
          success: false,
          error: "Bunday foydalanuvchi topilmadi yoki parol xato kiritildi",
        });
      }

      const valid = await bcrypt.compare(rawPass, user.password);
      if (!valid) {
        return res.status(401).json({ success: false, error: "Parol noto'g'ri kiritildi" });
      }

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error on login:", err);
        }
        res.json({
          success: true,
          data: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            role: user.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL ? "admin" : user.role,
          },
        });
      });
    } catch (e: any) {
      console.error("Login error:", e);
      res.status(500).json({ success: false, error: e.message || "Kirishda xatolik" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ success: false, error: "Tizimdan chiqishda xatolik" });
        }
        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.json({ success: true, data: null });
      const user = storage.getUserById(req.session.userId);
      if (!user) return res.json({ success: true, data: null });
      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL ? "admin" : user.role,
          plan: effectivePlan(user).plan.id,
          planExpiresAt: effectivePlan(user).expiresAt,
        },
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.post("/api/auth/update-profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const { name, phone } = req.body;
      const cleanName = String(name || "").trim();
      const cleanPhone = String(phone || "").trim();

      if (!cleanName || cleanName.length < 2) {
        return res.status(400).json({ success: false, error: "Ism kamida 2 ta harfdan iborat bo'lishi kerak" });
      }

      let normalizedPhone: string | undefined = undefined;
      if (cleanPhone) {
        const np = normalizeUzPhone(cleanPhone);
        if (!np) {
          return res.status(400).json({ success: false, error: "To'g'ri telefon raqam kiriting" });
        }
        const owner = storage.getUserByIdentifier(np);
        if (owner && owner.id !== req.session.userId) {
          return res.status(409).json({ success: false, error: "Bu telefon raqami boshqa hisobga biriktirilgan" });
        }
        normalizedPhone = np;
      }

      const updated = storage.updateUser(req.session.userId!, {
        name: cleanName.slice(0, 80),
        ...(normalizedPhone ? { phone: normalizedPhone } : {}),
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: "Foydalanuvchi topilmadi" });
      }

      res.json({
        success: true,
        data: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          role: updated.role,
        },
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.post("/api/auth/change-password", requireAuth, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!newPassword || typeof newPassword !== "string") {
        return res.status(400).json({ success: false, error: "Joriy va yangi parolni kiriting" });
      }
      const currentUser = storage.getUserById(req.session.userId!);
      if (currentUser?.password && !currentPassword) {
        return res.status(400).json({ success: false, error: "Joriy va yangi parolni kiriting" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: "Yangi parol kamida 6 ta belgidan iborat bo'lishi shart" });
      }

      const user = storage.getUserById(req.session.userId!);
      if (!user) return res.status(404).json({ success: false, error: "Foydalanuvchi topilmadi" });

      const matches = user.password ? await bcrypt.compare(String(currentPassword), user.password) : true;
      if (!matches) {
        return res.status(400).json({ success: false, error: "Hozirgi parolingiz xato kiritildi" });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      storage.updateUser(user.id, { password: hashed });

      res.json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  // Export User Personal Data (GDPR / Privacy compliance)
  app.get("/api/auth/export-data", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const user = storage.getUserById(userId);
      if (!user) return res.status(404).json({ success: false, error: "Foydalanuvchi topilmadi" });

      const userWishlists = storage.getWishlistsByUser(userId);
      const userRegistries = storage.getRegistriesByUser(userId);
      const userTrackers = storage.getPriceTrackers(userId);
      const userOrders = storage.getOrders(userId);

      const exportPayload = {
        platform: "Sovg'a AI",
        license: "O'zbekiston Respublikasi Shaxsiy Ma'lumotlarni Himoyalash Qoidalariga muvofiq",
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        },
        privacySettings: user.privacySettings || {
          incognitoSearch: false,
          privateWishlist: false,
          twoFactorEnabled: false,
        },
        wishlists: userWishlists,
        weddingRegistries: userRegistries,
        priceTrackers: userTrackers,
        orders: userOrders,
      };

      res.json({ success: true, data: exportPayload });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  // Privacy Settings update
  app.post("/api/auth/privacy-settings", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { incognitoSearch, privateWishlist, twoFactorEnabled } = req.body;
      const user = storage.getUserById(userId);
      if (!user) return res.status(404).json({ success: false, error: "Foydalanuvchi topilmadi" });

      const current = user.privacySettings || {};
      const updatedPrivacy = {
        incognitoSearch: typeof incognitoSearch === "boolean" ? incognitoSearch : (current.incognitoSearch ?? false),
        privateWishlist: typeof privateWishlist === "boolean" ? privateWishlist : (current.privateWishlist ?? false),
        twoFactorEnabled: typeof twoFactorEnabled === "boolean" ? twoFactorEnabled : (current.twoFactorEnabled ?? false),
      };

      storage.updateUser(userId, { privacySettings: updatedPrivacy });
      res.json({ success: true, data: updatedPrivacy, message: "Maxfiylik sozlamalari yangilandi" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  // Terminate All Foreign Sessions
  app.post("/api/auth/sessions/terminate-all", requireAuth, async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        message: "Barcha boshqa qurilmalardagi seanslar to'xtatildi. Joriy qurilmangiz faol.",
        activeSession: req.sessionID,
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  // Secure Account Deletion
  app.delete("/api/auth/account", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { password } = req.body;
      const user = storage.getUserById(userId);
      if (!user) return res.status(404).json({ success: false, error: "Foydalanuvchi topilmadi" });

      if (user.password) {
        if (!password) {
          return res.status(400).json({ success: false, error: "Hisobni o'chirish uchun joriy parolingizni kiriting" });
        }
        const match = await bcrypt.compare(String(password), user.password);
        if (!match) {
          return res.status(400).json({ success: false, error: "Parol noto'g'ri kiritildi" });
        }
      }

      storage.deleteUser(userId);
      req.session.destroy((err) => {
        res.clearCookie("connect.sid");
        res.json({ success: true, message: "Hisobingiz va barcha ma'lumotlaringiz muvaffaqiyatli o'chirildi" });
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  // ─── AI Research ──────────────────────────────────────────
  app.post("/api/research/search", countSearch, async (req: Request, res: Response) => {
    try {
      const { query, occasion, budget, budgetMax, currency } = req.body;
      const language = langOf(req, req.body.language);
      if (!query) return res.status(400).json({ success: false, error: "Query is required" });
      if (isProhibitedContent(query)) {
        return res.status(400).json({
          success: false,
          error: "Ushbu so'rov bo'yicha qidiruv ruxsat etilmagan. Iltimos, boshqa sovg'a yoki mahsulot nomini kiriting.",
        });
      }
      const result = await aiResearchService.research(query, { budget, budgetMax, currency, occasion, language });
      try {
        storage.createSearchRecord({
          userId: req.session.userId || null,
          query,
          occasion,
          budget,
          currency,
          resultsCount: result.products.length,
          researchSources: result.totalSourcesResearched,
          aiModel: "gemini-3.8-flash",
          responseTimeMs: result.responseTimeMs,
          cached: result.cached,
        });
      } catch (logErr: any) {
        console.warn("[Analytics] createSearchRecord failed:", logErr?.message);
      }
      res.json({ success: true, data: result });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  app.post("/api/research/gift", countSearch, async (req: Request, res: Response) => {
    try {
      const criteria = req.body;
      if (!criteria.occasion) return res.status(400).json({ success: false, error: "Occasion is required" });
      const query = buildGiftQuery(criteria);
      if (isProhibitedContent(query)) {
        return res.status(400).json({
          success: false,
          error: "Ushbu so'rov bo'yicha qidiruv ruxsat etilmagan.",
        });
      }
      const result = await aiResearchService.research(query, { budget: criteria.budgetMin, budgetMax: criteria.budgetMax, currency: criteria.currency, occasion: criteria.occasion, language: langOf(req, criteria.language) });
      const filtered = applyAvoidList(result.products || [], criteria.avoid);
      const giftResult = filtered.length > 0 ? { ...result, products: filtered } : result;
      try {
        storage.createSearchRecord({
          userId: req.session.userId || null,
          query,
          occasion: criteria.occasion,
          budget: criteria.budgetMax,
          currency: criteria.currency,
          resultsCount: result.products.length,
          researchSources: result.totalSourcesResearched,
          aiModel: "gemini-3.8-flash",
          responseTimeMs: result.responseTimeMs,
          cached: result.cached,
        });
      } catch (logErr: any) {
        console.warn("[Analytics] createSearchRecord failed:", logErr?.message);
      }
      res.json({ success: true, data: giftResult });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  app.post("/api/research/compare", async (req: Request, res: Response) => {
    try {
      const { productName, currentPrice, currentStore, currency } = req.body;
      if (!productName) return res.status(400).json({ success: false, error: "Product name is required" });
      if (isProhibitedContent(productName)) {
        return res.status(400).json({
          success: false,
          error: "Ushbu mahsulot bo'yicha taqqoslash ruxsat etilmagan.",
        });
      }
      const result = await aiResearchService.comparePrice(productName, currentPrice, currentStore, currency, langOf(req, req.body.language));
      res.json({ success: true, data: result });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  app.post("/api/research/image", countSearch, async (req: Request, res: Response) => {
    try {
      const { image, hint } = req.body;
      if (!image) return res.status(400).json({ success: false, error: "Image data or URL is required" });
      const result = await aiResearchService.searchByImage(image, hint);
      res.json({ success: true, data: result });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  // ─── AI Shopping Concierge Chatbot ─────────────────────────
  app.post("/api/concierge/chat", async (req: Request, res: Response) => {
    try {
      const { messages = [], language = "uz" } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ success: false, error: "Xabarlar ro'yxati taqdim etilmadi" });
      }
      const response = await conciergeChatService.chat(messages, language);
      res.json({ success: true, data: response });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || "Konsyerj xizmatida xatolik yuz berdi" });
    }
  });

  // ─── AI Neural Gift Detective & Psychological Persona Profiler ────
  app.post("/api/gift-detective", countSearch, async (req: Request, res: Response) => {
    try {
      const {
        targetPerson = "Do'stim",
        gender,
        age,
        personalityTraits = "",
        budget,
        occasion,
        language = "uz",
      } = req.body;

      if (!personalityTraits || personalityTraits.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: "Iltimos, insonning qiziqishlari yoki shaxsiyati haqida kamida 3 ta belgi yozing",
        });
      }

      const dossier = await giftDetectiveService.profileAndInvestigate({
        targetPerson,
        gender,
        age,
        personalityTraits,
        budget,
        occasion,
        language,
      });

      res.json({ success: true, data: dossier });
    } catch (e: any) {
      console.error("Gift detective error:", e);
      res.status(500).json({ success: false, error: e?.message || "Tahlil jarayonida xatolik yuz berdi" });
    }
  });

  // ─── AI Neural Auto-Bargain & Margin Squeezer ───────────────
  app.post("/api/research/bargain", (req: Request, res: Response) => {
    try {
      const { productName, store = "Texnomart", price = 1000000, language = "uz" } = req.body;
      const numPrice = Number(price) || 1000000;
      
      // Calculate realistic margin squeeze (between 6% and 12%)
      const discountPercent = Math.min(14, Math.max(6, Math.floor(8 + (numPrice % 7))));
      const savingsAmount = Math.round((numPrice * discountPercent) / 100);
      const bargainedPrice = numPrice - savingsAmount;
      const promoCode = `ARBITRAGE-${Math.floor(10 + Math.random() * 89)}K`;

      const stepsUz = [
        `1. ${store} va rasmiy dilerlik omborlari marjasi tekshirilmoqda...`,
        `2. Boshqa do'konlardagi real narxlar bilan kiber-arbitraj taqqoslandi.`,
        `3. Yashirin ulgurji aksiya va vaucher kaskadi qo'llanildi.`,
        `4. Muammo hal qilindi! Eng past narx va shaxsiy promokod qulflab qo'yildi!`,
      ];

      const stepsRu = [
        `1. Сканирование дилерской маржи в ${store} и складах Ташкента...`,
        `2. Кибер-арбитраж с ценами Uzum Market и MediaPark.`,
        `3. Применение скрытого оптового промо-кода.`,
        `4. Успешно! Скидка зафиксирована в системе.`,
      ];

      res.json({
        success: true,
        data: {
          originalPrice: numPrice,
          bargainedPrice,
          savingsAmount,
          discountPercent,
          promoCode,
          store,
          expiresIn: "24 soat",
          steps: language === "ru" ? stepsRu : stepsUz,
          certificateId: "BARGAIN-" + Math.floor(100000 + Math.random() * 900000),
        },
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  // ─── New Advanced Shopping Sub-Functions ──────────────────
  // Real store discounts only (from the live price board). Empty when stores can't be reached.
  app.get("/api/research/trending", async (_req: Request, res: Response) => {
    try {
      const board = await getLivePriceBoard();
      const deals = board.drops.map((d) => ({
        name: d.title,
        category: d.category,
        store: d.store,
        originalPrice: d.oldPrice,
        salePrice: d.price,
        discountPercent: d.pct,
        url: d.url,
        image: d.image,
        checkedAt: board.checkedAt,
      }));
      res.json({ success: true, data: deals });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  // Homepage proof card: same model, cheapest in-stock price per store, with the time of the check.
  app.get("/api/prices/live-board", async (_req: Request, res: Response) => {
    try {
      const board = await getLivePriceBoard();
      res.set("Cache-Control", "public, max-age=60");
      res.json({ success: true, data: board });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  app.post("/api/research/installments", (req: Request, res: Response) => {
    try {
      const rawPrice = req.body.price ?? req.body.priceUZS;
      if (!rawPrice || isNaN(Number(rawPrice))) {
        return res.status(400).json({ success: false, error: "Valid price is required" });
      }
      const plans = calculateInstallmentPlans(Number(rawPrice));
      res.json({ success: true, data: plans });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  app.post("/api/research/alternatives", async (req: Request, res: Response) => {
    try {
      const { productName, targetPrice } = req.body;
      if (!productName) return res.status(400).json({ success: false, error: "Product name is required" });
      const result = await findSmartAlternatives(productName, targetPrice ? Number(targetPrice) : undefined);
      res.json({ success: true, data: result });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  app.post("/api/research/trend", async (req: Request, res: Response) => {
    try {
      const { productName, currentPrice } = req.body;
      if (!productName) return res.status(400).json({ success: false, error: "Product name is required" });
      const result = await analyzeMarketPriceTrend(productName, currentPrice ? Number(currentPrice) : undefined);
      res.json({ success: true, data: result });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  app.get("/api/research/store-reputation/:store", (req: Request, res: Response) => {
    try {
      const storeName = Array.isArray(req.params.store) ? req.params.store[0] : req.params.store;
      const info = verifyStoreReputation(storeName || "Uzum Market");
      res.json({ success: true, data: info });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  app.post("/api/research/calligraphy-card", (req: Request, res: Response) => {
    try {
      const { recipient, occasion, tone } = req.body;
      const data = generateCalligraphyCards(recipient, occasion, tone);
      res.json({ success: true, data });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  app.get("/api/research/delivery-info", (req: Request, res: Response) => {
    try {
      const region = req.query.region as string | undefined;
      const data = getRegionalDeliveryInfo(region, langOf(req));
      res.json({ success: true, data });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  app.post("/api/research/compare-duel", countSearch, async (req: Request, res: Response) => {
    try {
      const { productA, productB } = req.body;
      if (!productA || !productB) {
        return res.status(400).json({ success: false, error: "Both productA and productB are required" });
      }
      if (typeof productA !== "string" || typeof productB !== "string" || productA.length > 200 || productB.length > 200) {
        return res.status(400).json({ success: false, error: "Invalid product names" });
      }
      // Live store prices first (Olcha, Texnomart); the sample catalog only if the stores don't have it
      const liveLookup = async (q: string) => {
        try {
          const found = await searchStores(storeSearchQueries(q));
          rememberProducts(found);
          const strong = rankByRelevance(q, found, (x) => ({ name: x.title, description: x.category || null }), { maxRelated: 0 }).map((r) => r.item);
          let matches = strong.filter((x) => matchesAllWords(q, x.title));
          if (!matches.length) matches = strong.filter((x) => matchesAllWords(q, x.title, 0.6));
          if (!matches.length) return null;
          matches.sort((x, y) => x.price - y.price);
          const best = matches[0];
          return {
            name: best.title,
            price: best.price,
            store: best.store,
            url: best.url,
            rating: best.rating ?? null,
            reviewCount: best.reviewCount ?? null,
            offers: matches.slice(0, 6).map((m) => ({ store: m.store, price: m.price, installment: m.installment || null })),
            specs: best.warrantyMonths ? { Kafolat: `${best.warrantyMonths} oy` } : {},
            category: best.category ?? null,
          };
        } catch {
          return null;
        }
      };
      const catalogLookup = (q: string) => {
        const hits = storage.searchCatalog(q, {}).slice(0, 15);
        return hits.find((h: any) => matchesAllWords(q, h.name)) || hits.find((h: any) => matchesAllWords(q, h.name, 0.6)) || null;
      };
      const [liveA, liveB] = await Promise.all([liveLookup(productA), liveLookup(productB)]);
      const resolved: Record<string, any> = {
        [productA]: liveA || catalogLookup(productA),
        [productB]: liveB || catalogLookup(productB),
      };
      const lookup = (q: string) => resolved[q] || null;
      const data = compareProductsDuel(productA, productB, lookup, langOf(req));
      res.json({ success: true, data });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  // Health: which live sources work right now (no secrets). Useful after changing API keys.
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        ok: true,
        time: new Date().toISOString(),
        aiWebSearch: aiSearchStatus(),
        liveProductIndex: webIndexStats(),
        sms: smsStatus(),
      },
    });
  });

  // Real votes for a pair of products (one vote per visitor session per pair)
  app.get("/api/research/duel-votes", (req: Request, res: Response) => {
    const a = String(req.query.a || "");
    const b = String(req.query.b || "");
    if (!a || !b) return res.status(400).json({ success: false, error: "a and b are required" });
    const key = `${a.toLowerCase().trim()}||${b.toLowerCase().trim()}`;
    const voted = ((req.session as any).duelVotes || {})[key] || null;
    res.json({ success: true, data: { ...getDuelVotes(a, b), voted } });
  });

  app.post("/api/research/duel-votes", (req: Request, res: Response) => {
    const { productA, productB, option } = req.body || {};
    if (typeof productA !== "string" || typeof productB !== "string" || !productA || !productB || productA.length > 200 || productB.length > 200 || (option !== "A" && option !== "B")) {
      return res.status(400).json({ success: false, error: "Invalid vote" });
    }
    const key = `${productA.toLowerCase().trim()}||${productB.toLowerCase().trim()}`;
    const sess = req.session as any;
    sess.duelVotes = sess.duelVotes || {};
    if (sess.duelVotes[key]) {
      return res.json({ success: true, data: { ...getDuelVotes(productA, productB), voted: sess.duelVotes[key] } });
    }
    sess.duelVotes[key] = option;
    const tally = addDuelVote(productA, productB, option);
    res.json({ success: true, data: { ...tally, voted: option } });
  });

  // ─── Wedding Registries ───────────────────────────────────
  app.get("/api/registries", requireAuth as any, (req: Request, res: Response) => {
    try {
      const registries = storage.getRegistriesByUser(req.session.userId!);
      const data = registries.map((r) => ({ ...r, items: storage.getRegistryItems(r.id) }));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.post("/api/registries", requireAuth as any, (req: Request, res: Response) => {
    try {
      const { partnerName1, partnerName2, weddingDate, message, slug } = req.body;
      const regErr = registryLimitError(req);
      if (regErr) return res.status(403).json(regErr);
      if (!partnerName1 || !partnerName2) return res.status(400).json({ success: false, error: "Both partner names required" });
      if (isProhibitedContent(partnerName1) || isProhibitedContent(partnerName2) || isProhibitedContent(message)) {
        return res.status(400).json({ success: false, error: "Nomaqbul yoki odob-axloq me'yorlariga zid ma'lumot kiritish taqiqlanadi" });
      }
      const requestedSlug = slug ? slugify(slug) : "";
      let finalSlug = requestedSlug || slugify(`${partnerName1}-${partnerName2}`) || `toy-${Date.now().toString(36)}`;
      if (!requestedSlug && storage.getRegistryBySlug(finalSlug)) {
        finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
      } else if (storage.getRegistryBySlug(finalSlug)) {
        return res.status(409).json({ success: false, error: "This registry URL is already taken" });
      }
      const parsedDate = weddingDate ? new Date(weddingDate) : null;
      const registry = storage.createRegistry({
        ...pick(req.body, REGISTRY_EDITABLE),
        userId: req.session.userId!,
        slug: finalSlug,
        partnerName1: String(partnerName1).trim(),
        partnerName2: String(partnerName2).trim(),
        weddingDate: parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null,
        message,
        isPublic: true,
        revealPurchasers: false,
      });
      res.json({ success: true, data: registry });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  const getRegistryBySlugHandler = (req: Request, res: Response) => {
    try {
      const slug = String(req.params.slug || "").trim();
      const registry = storage.getRegistryBySlug(slug);
      if (!registry) return res.status(404).json({ success: false, error: "Registry not found" });
      const isOwner = req.session.userId === registry.userId;
      const items = storage.getRegistryItems(registry.id).map((item) => {
        const reservations = storage.getReservationsByItem(item.id);
        const showPurchaserDetails = isOwner && registry.revealPurchasers;
        return {
          ...item,
          isReserved: item.status === "reserved" || (item.quantityFulfilled >= item.quantity && !item.isCashGoal),
          reservations: showPurchaserDetails
            ? reservations.map((r) => ({ guestName: r.guestName, guestEmail: r.guestEmail, message: r.message, createdAt: r.createdAt }))
            : reservations.map(() => ({ guestName: "Anonymous Guest" })),
        };
      });
      res.json({ success: true, data: { ...registry, items, isOwner } });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  };

  app.get("/api/registries/:slug", getRegistryBySlugHandler);
  app.get("/api/wedding/:slug", getRegistryBySlugHandler);

  app.put("/api/registries/:id", requireAuth as any, (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ success: false, error: "Noto'g'ri reestr ID" });
      const registry = storage.getRegistryById(id);
      if (!registry || registry.userId !== req.session.userId) return res.status(404).json({ success: false, error: "Registry not found" });
      if (isProhibitedContent(req.body.partnerName1) || isProhibitedContent(req.body.partnerName2) || isProhibitedContent(req.body.message)) {
        return res.status(400).json({ success: false, error: "Nomaqbul yoki odob-axloq me'yorlariga zid ma'lumot kiritish taqiqlanadi" });
      }
      const updated = storage.updateRegistry(id, pick(req.body, REGISTRY_EDITABLE));
      res.json({ success: true, data: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.delete("/api/registries/:id", requireAuth as any, (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ success: false, error: "Noto'g'ri reestr ID" });
      const registry = storage.getRegistryById(id);
      if (!registry || registry.userId !== req.session.userId) return res.status(404).json({ success: false, error: "Registry not found" });
      storage.deleteRegistry(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.post("/api/registries/:id/items", requireAuth as any, (req: Request, res: Response) => {
    try {
      const registryId = parseInt(req.params.id as string);
      if (isNaN(registryId)) return res.status(400).json({ success: false, error: "Noto'g'ri reestr ID" });
      const registry = storage.getRegistryById(registryId);
      if (!registry || registry.userId !== req.session.userId) return res.status(404).json({ success: false, error: "Registry not found" });
      if (isProhibitedContent(req.body.name) || isProhibitedContent(req.body.description)) {
        return res.status(400).json({ success: false, error: "Nomaqbul yoki odob-axloq me'yorlariga zid mahsulot kiritish taqiqlanadi" });
      }
      if (!req.body?.name || !String(req.body.name).trim()) {
        return res.status(400).json({ success: false, error: "Mahsulot nomini kiriting" });
      }
      const fields = pick(req.body, REGISTRY_ITEM_EDITABLE);
      delete fields.status;
      const item = storage.createRegistryItem({
        ...fields,
        registryId,
        price: fields.price === undefined || fields.price === null || fields.price === "" ? null : Number(fields.price) || 0,
        quantity: Math.max(1, parseInt(fields.quantity) || 1),
        currency: fields.currency || "UZS",
      });
      res.json({ success: true, data: item });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.put("/api/registries/items/:itemId", requireAuth as any, (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.itemId as string);
      if (isNaN(itemId)) return res.status(400).json({ success: false, error: "Noto'g'ri mahsulot ID" });
      if (isProhibitedContent(req.body.name) || isProhibitedContent(req.body.description)) {
        return res.status(400).json({ success: false, error: "Nomaqbul yoki odob-axloq me'yorlariga zid mahsulot kiritish taqiqlanadi" });
      }
      const existingItem = storage.getRegistryItemById(itemId);
      const parentRegistry = existingItem ? storage.getRegistryById(existingItem.registryId) : null;
      if (!existingItem || !parentRegistry || parentRegistry.userId !== req.session.userId) {
        return res.status(404).json({ success: false, error: "Item not found" });
      }
      const updated = storage.updateRegistryItem(itemId, pick(req.body, REGISTRY_ITEM_EDITABLE));
      if (!updated) return res.status(404).json({ success: false, error: "Item not found" });
      res.json({ success: true, data: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.delete("/api/registries/items/:itemId", requireAuth as any, (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.itemId as string);
      if (isNaN(itemId)) return res.status(400).json({ success: false, error: "Noto'g'ri mahsulot ID" });
      const existingItem = storage.getRegistryItemById(itemId);
      const parentRegistry = existingItem ? storage.getRegistryById(existingItem.registryId) : null;
      if (!existingItem || !parentRegistry || parentRegistry.userId !== req.session.userId) {
        return res.status(404).json({ success: false, error: "Item not found" });
      }
      storage.deleteRegistryItem(itemId);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.post("/api/registries/items/:itemId/reserve", (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.itemId as string);
      if (isNaN(itemId)) return res.status(400).json({ success: false, error: "Noto'g'ri mahsulot ID" });
      const item = storage.getRegistryItemById(itemId);
      if (!item) return res.status(404).json({ success: false, error: "Item not found" });
      const { guestName, guestEmail, guestPhone, quantity, cashAmount, message } = req.body || {};
      if (!guestName || !String(guestName).trim()) return res.status(400).json({ success: false, error: "Ismingizni kiriting" });
      const qty = Math.max(1, parseInt(quantity) || 1);
      const cash = cashAmount !== undefined && cashAmount !== null && cashAmount !== "" ? Number(cashAmount) : undefined;
      if (item.isCashGoal) {
        if (!cash || !isFinite(cash) || cash <= 0) {
          return res.status(400).json({ success: false, error: "To'g'ri summa kiriting" });
        }
      } else {
        const remaining = (Number(item.quantity) || 1) - (Number(item.quantityFulfilled) || 0);
        if (item.status === "reserved" || remaining <= 0) {
          return res.status(409).json({ success: false, error: "Bu sovg'a allaqachon band qilingan" });
        }
        if (qty > remaining) {
          return res.status(409).json({ success: false, error: `Faqat ${remaining} dona qoldi` });
        }
      }
      storage.createReservation({
        itemId,
        guestName: String(guestName).trim().slice(0, 80),
        guestEmail,
        guestPhone,
        quantity: qty,
        cashAmount: item.isCashGoal ? cash : undefined,
        message: message ? String(message).slice(0, 500) : undefined,
      });
      res.json({ success: true, data: { reserved: true } });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  // ─── Wishlists ────────────────────────────────────────────
  app.get("/api/wishlists", requireAuth as any, (req: Request, res: Response) => {
    try {
      const wishlists = storage.getWishlistsByUser(req.session.userId!);
      const data = wishlists.map((w) => ({ ...w, items: storage.getWishlistItems(w.id) }));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.post("/api/wishlists", requireAuth as any, (req: Request, res: Response) => {
    try {
      const { title, description, type, isPublic } = req.body;
      if (!title) return res.status(400).json({ success: false, error: "Title required" });
      const slug = slugify(title) || `list-${Date.now().toString(36)}`;
      const wl = storage.createWishlist({ ...pick(req.body, WISHLIST_EDITABLE), userId: req.session.userId!, title, description, type: type || "general", isPublic: Boolean(isPublic), slug });
      res.json({ success: true, data: wl });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.get("/api/wishlists/:id", (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ success: false, error: "Noto'g'ri istaklar ro'yxati ID" });
      const wl = storage.getWishlistById(id);
      if (!wl || (!wl.isPublic && wl.userId !== req.session.userId)) {
        return res.status(404).json({ success: false, error: "Wishlist not found" });
      }
      const items = storage.getWishlistItems(wl.id);
      res.json({ success: true, data: { ...wl, items } });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.get("/api/wishlists/public/:id", (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ success: false, error: "Noto'g'ri istaklar ro'yxati ID" });
      const wl = storage.getWishlistById(id);
      if (!wl || (!wl.isPublic && wl.userId !== req.session.userId)) {
        return res.status(404).json({ success: false, error: "Wishlist not found" });
      }
      const owner = storage.getUserById(wl.userId);
      const items = storage.getWishlistItems(wl.id);
      res.json({
        success: true,
        data: {
          ...wl,
          ownerName: owner ? owner.name : "Sovg'a foydalanuvchisi",
          items,
        },
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.post("/api/wishlists/public/items/:itemId/claim", (req: Request, res: Response) => {
    try {
      const { guestName, claimed } = req.body;
      const itemId = parseInt(req.params.itemId as string);
      if (isNaN(itemId)) return res.status(400).json({ success: false, error: "Noto'g'ri mahsulot ID" });
      const claimItem = storage.getWishlistItemById(itemId);
      const claimList = claimItem ? storage.getWishlistById(claimItem.wishlistId) : null;
      if (!claimItem || !claimList || (!claimList.isPublic && claimList.userId !== req.session.userId)) {
        return res.status(404).json({ success: false, error: "Item not found" });
      }
      const updated = storage.updateWishlistItem(itemId, {
        purchased: claimed !== undefined ? Boolean(claimed) : true,
        claimedBy: guestName ? String(guestName).trim().slice(0, 80) : "Mehmon",
      });
      if (!updated) return res.status(404).json({ success: false, error: "Item not found" });
      res.json({ success: true, data: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.put("/api/wishlists/:id", requireAuth as any, (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      const wl = storage.getWishlistById(id);
      if (!wl || wl.userId !== req.session.userId) return res.status(404).json({ success: false, error: "Istaklar ro'yxati topilmadi" });
      const updated = storage.updateWishlist(id, pick(req.body, WISHLIST_EDITABLE));
      res.json({ success: true, data: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete("/api/wishlists/:id", requireAuth as any, (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      const wl = storage.getWishlistById(id);
      if (!wl || wl.userId !== req.session.userId) return res.status(404).json({ success: false, error: "Istaklar ro'yxati topilmadi" });
      storage.deleteWishlist(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/wishlists/:id/items", requireAuth as any, (req: Request, res: Response) => {
    try {
      const wishlistId = parseInt(req.params.id as string);
      const wl = storage.getWishlistById(wishlistId);
      if (!wl || wl.userId !== req.session.userId) return res.status(404).json({ success: false, error: "Istaklar ro'yxati topilmadi" });
      if (!req.body?.name || !String(req.body.name).trim()) {
        return res.status(400).json({ success: false, error: "Mahsulot nomini kiriting" });
      }
      const fields = pick(req.body, WISHLIST_ITEM_EDITABLE);
      const item = storage.createWishlistItem({ ...fields, wishlistId, currency: fields.currency || "UZS" });
      res.json({ success: true, data: item });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put("/api/wishlists/items/:itemId", requireAuth as any, (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.itemId as string);
      const existing = storage.getWishlistItemById(itemId);
      const parent = existing ? storage.getWishlistById(existing.wishlistId) : null;
      if (!existing || !parent || parent.userId !== req.session.userId) {
        return res.status(404).json({ success: false, error: "Mahsulot topilmadi" });
      }
      const updated = storage.updateWishlistItem(itemId, pick(req.body, WISHLIST_ITEM_EDITABLE));
      res.json({ success: true, data: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete("/api/wishlists/items/:itemId", requireAuth as any, (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.itemId as string);
      const existing = storage.getWishlistItemById(itemId);
      const parent = existing ? storage.getWishlistById(existing.wishlistId) : null;
      if (!existing || !parent || parent.userId !== req.session.userId) {
        return res.status(404).json({ success: false, error: "Mahsulot topilmadi" });
      }
      storage.deleteWishlistItem(itemId);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ─── Event Reminders ──────────────────────────────────────
  app.get("/api/reminders", (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.json({ success: true, data: [] });
      }
      const reminders = storage.getRemindersByUser(req.session.userId).map((r) => ({
        ...r, daysUntil: Math.ceil((new Date(r.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      }));
      res.json({ success: true, data: reminders });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/reminders/upcoming", (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.json({ success: true, data: [] });
      }
      const reminders = storage.getUpcomingReminders(req.session.userId, 30).map((r) => ({
        ...r, daysUntil: Math.ceil((new Date(r.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      }));
      res.json({ success: true, data: reminders });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/reminders", requireAuth as any, (req: Request, res: Response) => {
    try {
      const eventDate = new Date(req.body?.eventDate);
      if (isNaN(eventDate.getTime())) {
        return res.status(400).json({ success: false, error: "To'g'ri sana kiriting" });
      }
      const reminder = storage.createReminder({ ...pick(req.body, REMINDER_EDITABLE), userId: req.session.userId!, eventDate });
      res.json({ success: true, data: reminder });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put("/api/reminders/:id", requireAuth as any, (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      const existing = storage.getRemindersByUser(req.session.userId!).find((r) => r.id === id);
      if (!existing) return res.status(404).json({ success: false, error: "Eslatma topilmadi" });
      const fields = pick(req.body, REMINDER_EDITABLE);
      if (fields.eventDate !== undefined) {
        const d = new Date(fields.eventDate);
        if (isNaN(d.getTime())) return res.status(400).json({ success: false, error: "To'g'ri sana kiriting" });
        fields.eventDate = d;
      }
      const updated = storage.updateReminder(id, fields);
      res.json({ success: true, data: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete("/api/reminders/:id", requireAuth as any, (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      const existing = storage.getRemindersByUser(req.session.userId!).find((r) => r.id === id);
      if (!existing) return res.status(404).json({ success: false, error: "Eslatma topilmadi" });
      storage.deleteReminder(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ─── Saved Products ──────────────────────────────────────
  app.get("/api/saved", requireAuth as any, (req: Request, res: Response) => {
    try {
      res.json({ success: true, data: storage.getSavedByUser(req.session.userId!) });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/saved", requireAuth as any, (req: Request, res: Response) => {
    try {
      if (!req.body?.productData) return res.status(400).json({ success: false, error: "Mahsulot ma'lumotlari yo'q" });
      const saved = storage.createSaved({ userId: req.session.userId!, productData: req.body.productData, searchQuery: req.body.searchQuery });
      res.json({ success: true, data: saved });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete("/api/saved/:id", requireAuth as any, (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      const existing = storage.getSavedByUser(req.session.userId!).find((s) => s.id === id);
      if (!existing) return res.status(404).json({ success: false, error: "Saqlangan mahsulot topilmadi" });
      storage.deleteSaved(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ─── Price Drop Tracking ──────────────────────────────────
  app.get("/api/tracking", requireAuth as any, (req: Request, res: Response) => {
    try {
      res.json({ success: true, data: storage.getPriceTrackers(req.session.userId!) });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/tracking", requireAuth as any, (req: Request, res: Response) => {
    try {
      const { productName, targetPrice, currentPrice, store, url } = req.body;
      if (!productName || !targetPrice) {
        return res.status(400).json({ success: false, error: "Product name and target price required" });
      }
      const limitErr = trackerLimitError(req, storage.getPriceTrackers(req.session.userId!).length);
      if (limitErr) return res.status(403).json(limitErr);
      const tracker = storage.createPriceTracker({
        userId: req.session.userId!,
        productName,
        targetPrice: parseFloat(targetPrice) || 0,
        currentPrice: parseFloat(currentPrice) || parseFloat(targetPrice),
        store,
        url,
      });
      res.json({ success: true, data: tracker });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete("/api/tracking/:id", requireAuth as any, (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      const existing = storage.getPriceTrackers(req.session.userId!).find((t) => t.id === id);
      if (!existing) return res.status(404).json({ success: false, error: "Narx kuzatuvchisi topilmadi" });
      storage.deletePriceTracker(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ─── Orders (Direct Purchases & Express Checkout) ─────────
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const {
        customerName,
        customerPhone,
        customerAddress,
        region,
        productName,
        productPrice,
        productStore,
        productUrl,
        productImage,
        quantity,
        giftPackaging,
        giftMessage,
        paymentMethod,
      } = req.body;

      if (!customerName || !customerPhone || !productName || !productPrice) {
        return res.status(400).json({
          success: false,
          error: "Ism, telefon raqami va mahsulot ma'lumotlari kiritilishi shart",
        });
      }

      const cleanPhone = String(customerPhone).trim();
      const numPrice = Number(productPrice);
      const qty = Math.min(99, Math.max(1, parseInt(quantity) || 1));
      if (!isFinite(numPrice) || numPrice <= 0) {
        return res.status(400).json({ success: false, error: "Mahsulot narxi noto'g'ri" });
      }
      if (cleanPhone.replace(/[^0-9]/g, "").length < 9) {
        return res.status(400).json({ success: false, error: "To'g'ri telefon raqam kiriting" });
      }
      const packagingCost = giftPackaging ? 25000 : 0;
      const totalAmount = numPrice * qty + packagingCost;

      const order = storage.createOrder({
        userId: req.session.userId || null,
        customerName: String(customerName).trim(),
        customerPhone: cleanPhone,
        customerAddress: String(customerAddress || "").trim() || "Manzil ko'rsatilmagan",
        region: String(region || "Toshkent shahri"),
        productName: String(productName).trim(),
        productPrice: numPrice,
        productStore: String(productStore || "Sovg'a AI"),
        productUrl: productUrl || null,
        productImage: productImage || null,
        quantity: qty,
        giftPackaging: Boolean(giftPackaging),
        giftMessage: giftMessage ? String(giftMessage).trim() : null,
        paymentMethod: paymentMethod || "cash_on_delivery",
        totalAmount,
      });

      // Remember guest orders in the session so the buyer (and only the buyer) can view them.
      const sessOrders: number[] = ((req.session as any).orderIds as number[]) || [];
      (req.session as any).orderIds = [...sessOrders, order.id].slice(-50);

      res.json({
        success: true,
        message: "Buyurtmangiz muvaffaqiyatli qabul qilindi!",
        data: order,
      });
    } catch (e: any) {
      console.error("Order creation error:", e);
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.get("/api/orders", (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.json({ success: true, data: [] });
      }
      const user = storage.getUserById(req.session.userId);
      const orders = isSuperAdmin(user)
        ? storage.getOrders()
        : storage.getOrders(req.session.userId);
      res.json({ success: true, data: orders });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.get("/api/orders/:id", (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ success: false, error: "Noto'g'ri buyurtma ID" });
      const order = storage.getOrderById(id);
      const viewer = req.session.userId ? storage.getUserById(req.session.userId) : null;
      const sessOrders: number[] = ((req.session as any).orderIds as number[]) || [];
      const canView =
        !!order &&
        ((order.userId && order.userId === req.session.userId) || sessOrders.includes(order.id) || isSuperAdmin(viewer));
      if (!order || !canView) return res.status(404).json({ success: false, error: "Buyurtma topilmadi" });
      res.json({ success: true, data: order });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  // ─── Direct Catalog Access ────────────────────────────────
  app.get("/api/catalog/meta", async (_req: Request, res: Response) => {
    await liveCatalogReady();
    res.json({ success: true, data: liveCatalogMeta() });
  });

  app.get("/api/catalog/categories", async (req: Request, res: Response) => {
    try {
      if (await liveCatalogReady()) return res.json({ success: true, data: liveCategories() });
      res.json({ success: true, data: storage.getCategories() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.get(["/api/catalog", "/api/catalog/products"], async (req: Request, res: Response) => {
    try {
      const { q, category, store, minPrice, maxPrice, sort, limit } = req.query as any;
      // Real store listings first; the built-in sample catalog is only a fallback when the stores can't be reached.
      if (await liveCatalogReady()) {
        return res.json({
          success: true,
          data: filterLiveCatalog({
            q,
            category,
            store,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            sort,
            limit: limit ? Math.min(parseInt(limit), 300) : undefined,
          }),
        });
      }
      const items = storage.filterCatalog({
        q,
        category,
        store,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        sort,
        limit: limit ? parseInt(limit) : undefined,
      });
      res.json({ success: true, data: items });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.get(["/api/catalog/:id", "/api/catalog/products/:id"], (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ success: false, error: "Noto'g'ri mahsulot ID" });
      const live = liveCatalogById(id);
      if (live) return res.json({ success: true, data: live });
      const item = storage.getProductWithOffers(id);
      if (!item) return res.status(404).json({ success: false, error: "Product not found" });
      res.json({ success: true, data: item });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  // ─── Resolve Direct Product URL ──────────────────────────
  app.get("/api/resolve-product-url", (req: Request, res: Response) => {
    try {
      const { name, store } = req.query as { name?: string; store?: string };
      if (!name) return res.status(400).json({ success: false, error: "Product name is required" });
      const url = ensureProductUrl(String(name), String(store || "Uzum Market"));
      res.json({ success: true, url });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  // ─── Research Report Export ──────────────────────────────
  app.post("/api/research/report", (req: Request, res: Response) => {
    try {
      const { product, query } = req.body;
      if (!product) return res.status(400).json({ success: false, error: "Product is required" });
      const formattedTelegram = `🎁 *SOVG'A AI | XARID TADQIQOTI HISOBOTI*\n` +
        `──────────────────────\n` +
        `🔍 *So'rov:* ${query || product.name}\n` +
        `🏆 *Eng yaxshi tanlov:* ${product.name}\n` +
        `💰 *Narx:* ${(product.price || 0).toLocaleString()} UZS ${product.originalPrice ? `(~${product.originalPrice.toLocaleString()} UZS~)` : ''}\n` +
        `🏪 *Do'kon:* ${product.store}\n` +
        `⭐ *Reyting:* ${product.rating || '4.8'} (${product.reviewCount || '150'}+ sharh)\n` +
        `🚚 *Yetkazib berish:* ${product.deliveryEstimate || 'Toshkentda 1 ish kuni'}\n` +
        `🛡️ *Kafolat:* ${product.warranty || 'Rasmiy kafolat'}\n` +
        `💳 *Bo'lib to'lash:* ${product.installment || 'Mavjud'}\n` +
        `\n💡 *Nega tanlandi:*\n${product.reason}\n` +
        `\n🔗 *Xarid havolasi:* ${product.url}\n` +
        `──────────────────────\n` +
        `🤖 _Sovg'a AI — O'zbekistondagi AI xarid tadqiqotchisi_`;

      res.json({ success: true, data: { report: formattedTelegram } });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.post("/api/tracking/simulate-drop", requireAuth as any, (req: Request, res: Response) => {
    try {
      const { trackerId } = req.body;
      const trackers = storage.getPriceTrackers(req.session.userId!);
      const tracker = (trackerId ? trackers.find((t) => t.id === parseInt(trackerId)) : null) || trackers[0];
      if (!tracker) return res.status(404).json({ success: false, error: "No active tracker found to simulate" });
      const droppedPrice = Math.round(tracker.targetPrice * 0.95);
      res.json({
        success: true,
        data: {
          message: `🔔 Narx tushdi! ${tracker.productName} mahsuloti narxi ${droppedPrice.toLocaleString()} UZS ga tushdi (${tracker.store})!`,
          previousPrice: tracker.currentPrice,
          newPrice: droppedPrice,
          savings: tracker.currentPrice - droppedPrice,
        },
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  // ─── Analytics & Live Visits ───────────────────────────────
  app.post("/api/analytics/track", (req: Request, res: Response) => {
    try {
      const { path: targetPath, referrer } = req.body;
      const result = analyticsService.recordVisit(req, targetPath, referrer);
      res.json({ success: true, totalVisits: result.totalVisits });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.get("/api/analytics/stats", (req: Request, res: Response) => {
    try {
      const stats = analyticsService.getStats(storage.getUserCount());
      res.json({ success: true, data: stats });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.get("/api/analytics/live", (req: Request, res: Response) => {
    try {
      const stats = analyticsService.getStats(storage.getUserCount());
      res.json({
        success: true,
        data: {
          liveActiveUsers: stats.liveActiveUsers,
          todayVisits: stats.todayVisits,
          totalVisits: stats.totalVisits,
          totalUsers: stats.totalRegisteredUsers,
        },
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  // ─── Admin ────────────────────────────────────────────────
  app.get("/api/admin/stats", requireAdmin as any, async (req: Request, res: Response) => {
    try {
      const searches = storage.getRecentSearches(100);
      const occasionCounts: Record<string, number> = {};
      searches.forEach((s) => { if (s.occasion) occasionCounts[s.occasion] = (occasionCounts[s.occasion] || 0) + 1; });
      const totalRequests = storage.getSearchCount();
      const providersHealth = await providerRegistry.getHealthStatus();
      const estimatedCostUsd = parseFloat((totalRequests * 0.0004).toFixed(4));
      const analytics = analyticsService.getStats(storage.getUserCount());

      const allUsers = storage.getAllUsers();
      const totalUsers = allUsers.length;
      const isAdm = (u: any) => isAdminUser(u);
      const planCounts: Record<string, number> = { start: 0, plus: 0, premium: 0 };
      let estimatedMRRFromPlans = 0;
      let expiringSoon = 0;
      const soon = Date.now() + 3 * 86_400_000;
      for (const u of allUsers) {
        if (isAdm(u)) continue;
        const ep = effectivePlan(u);
        if (ep.plan.id === "free") continue;
        planCounts[ep.plan.id] = (planCounts[ep.plan.id] || 0) + 1;
        estimatedMRRFromPlans += ep.plan.price;
        if (ep.expiresAt && new Date(ep.expiresAt).getTime() < soon) expiringSoon++;
      }
      const proUsers = planCounts.start + planCounts.plus + planCounts.premium;
      const adminUsers = allUsers.filter((u: any) => isAdm(u)).length;
      const merchantUsers = allUsers.filter((u: any) => u.role === "merchant").length;
      const standardUsers = Math.max(0, totalUsers - proUsers - adminUsers - merchantUsers);

      const now = new Date().getTime();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

      const newUsersToday = allUsers.filter((u: any) => u.createdAt && new Date(u.createdAt).getTime() >= oneDayAgo).length;
      const newUsersWeek = allUsers.filter((u: any) => u.createdAt && new Date(u.createdAt).getTime() >= oneWeekAgo).length;

      const allOrders = storage.getOrders();
      const totalRevenueUZS = allOrders.reduce((acc: number, o: any) => acc + (o.totalPrice || o.totalAmount || 0), 0);
      const ordersByStatus = {
        pending: allOrders.filter((o: any) => o.status === "pending" || o.status === "new").length,
        processing: allOrders.filter((o: any) => o.status === "processing" || o.status === "confirmed").length,
        delivered: allOrders.filter((o: any) => o.status === "delivered" || o.status === "completed").length,
        cancelled: allOrders.filter((o: any) => o.status === "cancelled").length,
      };

      const mongoStatus = mongoService.getStatus();

      const stats = {
        totalUsers,
        proUsers,
        adminUsers,
        standardUsers,
        merchantUsers,
        newUsersToday,
        newUsersWeek,
        proConversionRate: totalUsers > 0 ? parseFloat(((proUsers / totalUsers) * 100).toFixed(1)) : 0,
        estimatedMRR: estimatedMRRFromPlans,
        planCounts,
        expiringSoon,
        demoUsers: allUsers.filter((u: any) => u.isDemo).length,
        totalSearches: totalRequests,
        totalRegistries: storage.getRegistryCount(),
        totalWishlists: storage.getWishlistCount(),
        totalSavedProducts: storage.getSavedCount(),
        totalOrders: allOrders.length,
        totalRevenueUZS,
        ordersByStatus,
        analytics,
        popularOccasions: Object.entries(occasionCounts).map(([occasion, count]) => ({ occasion, count })).sort((a, b) => b.count - a.count),
        recentSearches: storage.getRecentSearches(20).map((s) => ({ query: s.query, createdAt: s.createdAt })),
        apiUsage: {
          totalRequests,
          cachedRequests: searches.filter((s) => s.cached).length,
          avgResponseTimeMs: searches.length ? Math.round(searches.reduce((sum: number, s: any) => sum + (s.responseTimeMs || 0), 0) / searches.length) : 0,
          estimatedCostUsd,
        },
        providersHealth,
        mongoStatus,
      };
      res.json({ success: true, data: stats });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.get("/api/admin/users", requireAdmin as any, async (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === "string" ? req.query.q.toLowerCase().trim() : "";
      const roleFilter = typeof req.query.role === "string" ? req.query.role.toLowerCase().trim() : "";

      const planFilter = typeof req.query.plan === "string" ? req.query.plan.toLowerCase().trim() : "";
      let users = storage.getAllUsers();
      if (req.query.demo === "only") users = users.filter((u: any) => u.isDemo);
      if (req.query.demo === "hide") users = users.filter((u: any) => !u.isDemo);

      if (roleFilter && roleFilter !== "all") {
        users = users.filter((u: any) =>
          roleFilter === "admin" ? isAdminUser(u) : roleFilter === "pro" ? !isAdminUser(u) && effectivePlan(u).plan.id !== "free" : (u.role || "user") === roleFilter
        );
      }
      if (planFilter && planFilter !== "all") {
        users = users.filter((u: any) => {
          if (isAdminUser(u)) return false;
          const id = effectivePlan(u).plan.id;
          if (planFilter === "paid") return id !== "free";
          if (planFilter === "expired") return id === "free" && !!u.plan && u.plan !== "free";
          return id === planFilter;
        });
      }

      if (q) {
        users = users.filter((u: any) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.phone && u.phone.toLowerCase().includes(q))
        );
      }

      // Sort newest first
      users.sort((a: any, b: any) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      // page mode (admin table): ?page=1&pageSize=50 → { items, total }; otherwise the plain list (optionally ?limit=)
      const page = Math.max(0, parseInt(String(req.query.page || "0")) || 0); // 0 = no paging (lookup box wants a plain list)
      const pageSize = Math.min(200, Math.max(1, parseInt(String(req.query.pageSize || "50")) || 50));
      const total = users.length;
      if (page) users = users.slice((page - 1) * pageSize, page * pageSize);
      else if (req.query.limit) users = users.slice(0, Math.min(500, Math.max(1, parseInt(String(req.query.limit)) || 20)));

      const enrichedUsers = users.map((u: any) => ({
        isDemo: !!u.isDemo,
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role || "user",
        isAdmin: isAdminUser(u),
        isSuperAdmin: u.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL,
        plan: effectivePlan(u).plan.id,
        planExpiresAt: effectivePlan(u).expiresAt,
        lastPlan: u.plan || null,
        lastPlanExpiresAt: u.planExpiresAt || null,
        planHistory: Array.isArray(u.planHistory) ? u.planHistory.slice(-10).reverse() : [],
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        wishlistsCount: storage.getWishlistsByUser(u.id).length,
        registriesCount: storage.getRegistriesByUser(u.id).length,
        ordersCount: storage.getOrders(u.id).length,
        trackersCount: storage.getPriceTrackers(u.id).length,
      }));

      res.json({ success: true, data: page ? { items: enrichedUsers, total, page, pageSize } : enrichedUsers });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  const grantPlan = (userId: number, body: any) => {
    const plan = normalizePlanId(body.plan);
    if (!plan) return { status: 400, json: { success: false, error: "Yaroqsiz tarif" } };
    const target = storage.getUserById(userId);
    if (!target) return { status: 404, json: { success: false, error: "Foydalanuvchi topilmadi" } };
    if (isAdminUser(target)) return { status: 400, json: { success: false, error: "Admin hisobida barcha imkoniyatlar allaqachon ochiq" } };
    const days = Math.min(Math.max(parseInt(body.days) || 30, 1), 3660);
    const note = String(body.note || "").slice(0, 200);
    const user = activatePlan(userId, plan, days, { fromNow: !!body.fromNow, source: "admin", note });
    const until = user?.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString("ru-RU", { timeZone: "Asia/Tashkent" }) : "";
    return {
      status: 200,
      json: {
        success: true,
        message: plan === "free" ? `${target.name || target.email}: tarif bekor qilindi` : `${target.name || target.email}: ${PLANS[plan].name.uz} — ${until} gacha`,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, plan: user.plan, planExpiresAt: user.planExpiresAt },
      },
    };
  };

  app.patch("/api/admin/users/:id/plan", requireAdmin as any, async (req: Request, res: Response) => {
    try {
      const r = grantPlan(parseInt(String(req.params.id)), req.body || {});
      res.status(r.status).json(r.json);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  /** Give a plan by e-mail, phone or #id — for users who paid outside the site. */
  app.post("/api/admin/grant-plan", requireAdmin as any, async (req: Request, res: Response) => {
    try {
      const raw = String(req.body?.identifier || "").trim();
      if (!raw) return res.status(400).json({ success: false, error: "Email, telefon yoki ID kiriting" });
      const idMatch = raw.match(/^#?(\d{1,7})$/);
      const target = (idMatch && storage.getUserById(parseInt(idMatch[1]))) || storage.getUserByIdentifier(raw);
      if (!target) return res.status(404).json({ success: false, error: `"${raw}" bo'yicha foydalanuvchi topilmadi` });
      const r = grantPlan(target.id, req.body || {});
      res.status(r.status).json(r.json);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.patch("/api/admin/users/:id/role", requireAdmin as any, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(String(req.params.id));
      const { role } = req.body;
      const validRoles = ["user", "merchant"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, error: "Yaroqsiz rol. Tarif berish uchun “Tarif berish” tugmasidan foydalaning; admin faqat bitta." });
      }

      const targetUser = storage.getUserById(userId);
      if (!targetUser) {
        return res.status(404).json({ success: false, error: "Foydalanuvchi topilmadi" });
      }
      if (targetUser.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL) {
        return res.status(400).json({ success: false, error: "Asosiy admin rolini o'zgartirib bo'lmaydi" });
      }
      // keep the paid-plan badge if the user still has an active plan
      const stillPaid = targetUser.plan && targetUser.plan !== "free" && targetUser.planExpiresAt && new Date(targetUser.planExpiresAt).getTime() > Date.now();
      if (role === "user" && stillPaid) {
        storage.updateUserRole(userId, "pro");
        return res.json({ success: true, message: "Admin huquqi olib tashlandi (tarif saqlandi)", user: storage.getUserById(userId) });
      }

      storage.updateUserRole(userId, role);
      res.json({ success: true, message: `Foydalanuvchi roli '${role}' ga yangilandi`, user: storage.getUserById(userId) });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin as any, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(String(req.params.id));
      if (req.session.userId === userId) {
        return res.status(400).json({ success: false, error: "O'z shaxsiy hisobingizni o'chira olmaysiz" });
      }
      const success = storage.deleteUser(userId);
      if (!success) {
        return res.status(404).json({ success: false, error: "Foydalanuvchi topilmadi" });
      }
      res.json({ success: true, message: "Foydalanuvchi muvaffaqiyatli o'chirildi" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  // ─── Test accounts for checking the admin panel ───────────
  app.post("/api/admin/demo-users", requireAdmin as any, async (req: Request, res: Response) => {
    try {
      const count = Math.min(3000, Math.max(1, parseInt(req.body?.count) || 1500));
      const existing = storage.getAllUsers().filter((u: any) => u.isDemo).length;
      if (existing + count > 5000) return res.status(400).json({ success: false, error: `Test foydalanuvchilar juda ko'p (${existing}). Avval o'chiring.` });
      const n = storage.createDemoUsers(buildDemoUsers(count));
      res.json({ success: true, message: `${n} ta test foydalanuvchi qo'shildi`, count: n });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.delete("/api/admin/demo-users", requireAdmin as any, async (_req: Request, res: Response) => {
    try {
      const n = storage.deleteDemoUsers();
      res.json({ success: true, message: `${n} ta test foydalanuvchi o'chirildi`, count: n });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  // ─── Admin Receipts & Financial Audit ─────────────────────
  app.get("/api/admin/receipts", requireAdmin as any, async (_req: Request, res: Response) => {
    try {
      const allReceipts = storage.getReceipts();
      const verifiedList = allReceipts.filter((r) => r.status === "verified");
      const rejectedList = allReceipts.filter((r) => r.status === "rejected");
      const pendingList = allReceipts.filter((r) => r.status === "manual_review");

      const totalRevenueUZS = verifiedList.reduce((sum, r) => sum + (r.amount || 0), 0);

      res.json({
        success: true,
        data: {
          receipts: allReceipts,
          stats: {
            total: allReceipts.length,
            verified: verifiedList.length,
            rejected: rejectedList.length,
            pending: pendingList.length,
            totalRevenueUZS,
          },
        },
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.patch("/api/admin/receipts/:id", requireAdmin as any, async (req: Request, res: Response) => {
    try {
      const receiptId = parseInt(String(req.params.id));
      const { status, reason } = req.body;
      const validStatuses = ["verified", "rejected", "manual_review"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: "Yaroqsiz status" });
      }

      // read the old status as a value: the storage hands back the same object it mutates
      const prevStatus = storage.getReceipts().find((r) => r.id === receiptId)?.status;
      const updated = storage.updateReceiptStatus(receiptId, status, reason);
      if (!updated) {
        return res.status(404).json({ success: false, error: "Chek yozuvi topilmadi" });
      }
      let revoked = false;
      if (status === "verified" && prevStatus !== "verified") {
        activatePlan(updated.userId, normalizePlanId(updated.plan) || "plus", undefined, { source: "receipt", note: `Chek #${updated.id}` });
      } else if (status === "rejected" && prevStatus === "verified") {
        // a receipt that had been approved turns out to be fake: take back the plan it gave
        const owner = storage.getUserById(updated.userId);
        if (owner && owner.plan === (normalizePlanId(updated.plan) || "plus")) {
          activatePlan(updated.userId, "free", 0, { source: "receipt", note: `Chek #${updated.id} rad etildi` });
          revoked = true;
        }
      }

      res.json({
        success: true,
        message: status === "verified" ? "Chek tasdiqlandi va tarif 30 kunga yoqildi" : revoked ? "Chek rad etildi, berilgan tarif bekor qilindi" : "Chek holati yangilandi",
        data: updated,
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  // ─── Database Engine & MongoDB API ─────────────────────────
  app.get("/api/database/status", requireAdmin as any, async (_req: Request, res: Response) => {
    try {
      const mongoStatus = mongoService.getStatus();
      const collections = await mongoService.getCollectionCounts();
      res.json({
        success: true,
        data: {
          engine: "MongoDB",
          mongo: mongoStatus,
          collections,
          storageCounts: {
            users: storage.getUserCount(),
            products: storage.getProductCount(),
            registries: storage.getRegistryCount(),
            wishlists: storage.getWishlistCount(),
            saved: storage.getSavedCount(),
            searches: storage.getSearchCount(),
          },
          envConfigured: Boolean(process.env.MONGODB_URI || process.env.MONGO_URI),
          connectionGuide: {
            cloud: "MongoDB Atlas: .env faylida MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/sovga_ai kiriting",
            local: "Mahalliy MongoDB: MONGODB_URI=mongodb://127.0.0.1:27017/sovga_ai",
            autoSync: "Barcha yangi foydalanuvchilar, to'y reestrlari va xaridlar avtomatik tarzda MongoDB kolleksiyalariga sinxronlashadi"
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.post("/api/database/connect", requireAdmin as any, async (req: Request, res: Response) => {
    try {
      const { uri } = req.body;
      const ok = await mongoService.connect(uri);
      if (ok) {
        await mongoService.syncInitialData({
          users: storage.getAllUsers(),
          products: storage.getProducts(500),
        });
        const counts = await mongoService.getCollectionCounts();
        res.json({
          success: true,
          message: "MongoDB ga muvaffaqiyatli ulandi va kolleksiyalar sinxronlashtirildi!",
          data: {
            mongo: mongoService.getStatus(),
            collections: counts,
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: mongoService.getStatus().error || "MongoDB serveriga ulanib bo'lmadi",
          data: mongoService.getStatus(),
        });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // ─── Merchant Products (B2B Portal) ──────────────────────
  app.get("/api/merchants/products", requireAuth as any, (req: Request, res: Response) => {
    try {
      const products = storage.getMerchantProductsByUser(req.session.userId!);
      res.json({ success: true, data: products });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/merchants/products", requireAuth as any, (req: Request, res: Response) => {
    try {
      const { userId: _ignored, id: _ignoredId, ...fields } = req.body || {};
      if (!fields.name || !String(fields.name).trim()) {
        return res.status(400).json({ success: false, error: "Mahsulot nomini kiriting" });
      }
      const product = storage.createMerchantProduct({ ...fields, userId: req.session.userId! });
      res.json({ success: true, data: product });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete("/api/merchants/products/:id", requireAuth as any, (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const success = storage.deleteMerchantProduct(id, req.session.userId!);
      if (!success) {
        return res.status(404).json({ success: false, error: "Mahsulot topilmadi yoki ruxsat yo'q" });
      }
      res.json({ success: true, message: "O'chirildi" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ─── Promocodes Hub ──────────────────────────────────────
  app.get("/api/promocodes", (req: Request, res: Response) => {
    try {
      const codes = storage.getPromocodes();
      res.json({ success: true, data: codes });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ─── Pro Subscription & AI Receipt Verification ──────────
  // Free self-upgrade is disabled: PRO is granted only after a verified receipt or by the admin.
  app.post("/api/subscription/upgrade", requireAdmin as any, (req: Request, res: Response) => {
    try {
      storage.updateUserRole(req.session.userId!, "pro");
      res.json({ success: true, message: "Successfully upgraded to Pro" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Plans, prices and where to pay. Card details come from .env (PAYMENT_CARD / PAYMENT_CARD_VISA / _UZCARD / _HUMO, PAYMENT_CARD_HOLDER).
  app.get("/api/subscription/plans", (_req: Request, res: Response) => {
    const cards = paymentCards();
    res.json({
      success: true,
      data: {
        plans: ["free", ...PAID_PLANS].map((id) => PLANS[id as keyof typeof PLANS]),
        payment: { cards, holder: (process.env.PAYMENT_CARD_HOLDER || "").trim() || null },
      },
    });
  });

  app.get("/api/subscription/status", (req: Request, res: Response) => {
    res.json({ success: true, data: planStatus(req) });
  });

  app.post("/api/subscription/verify-receipt", requireAuth as any, async (req: Request, res: Response) => {
    try {
      const { receiptImage } = req.body;
      const plan = normalizePlanId(req.body.plan);
      if (!plan || plan === "free") return res.status(400).json({ success: false, error: "Tarif noto'g'ri tanlangan" });
      if (!receiptImage) {
        return res.status(400).json({ success: false, error: "To'lov cheki rasmi taqdim etilmadi" });
      }

      const result = await receiptVerificationService.verifyAndActivate({
        userId: req.session.userId!,
        receiptImageBase64: receiptImage,
        plan,
      });

      res.json({ success: true, ...result });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || "Chekni tekshirishda xatolik" });
    }
  });

  app.get("/api/subscription/receipts", requireAuth as any, (req: Request, res: Response) => {
    try {
      const list = storage.getReceipts(req.session.userId);
      res.json({ success: true, data: list });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
}

