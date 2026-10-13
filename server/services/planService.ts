/**
 * Plans & usage: works out a visitor's current plan and enforces the daily
 * AI-search allowance and other plan limits. Usage is kept per Tashkent day,
 * per account (or per IP for guests), and saved to disk so a restart doesn't reset it.
 */
import fs from "fs";
import path from "path";
import type { Request, Response, NextFunction } from "express";
import { PLANS, PLAN_DAYS, type PlanId, type PlanDef } from "../../shared/plans.js";
import { storage } from "../storage.js";

const SUPER_ADMIN_EMAIL = "baxorasaidova@gmail.com";
const USAGE_FILE = path.resolve(process.cwd(), "data", "plan-usage.json");

type Usage = { day: string; searches: number };
let usage: Record<string, Usage> = {};
let dirty = false;

try {
  usage = JSON.parse(fs.readFileSync(USAGE_FILE, "utf8")) || {};
} catch {
  usage = {};
}
setInterval(() => {
  if (!dirty) return;
  dirty = false;
  try {
    const today = tashkentDay();
    for (const k of Object.keys(usage)) if (usage[k].day !== today) delete usage[k];
    fs.mkdirSync(path.dirname(USAGE_FILE), { recursive: true });
    fs.writeFileSync(USAGE_FILE, JSON.stringify(usage));
  } catch {
    /* best effort */
  }
}, 30_000).unref?.();

export function tashkentDay(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function isAdminUser(user: any): boolean {
  return !!user && (user.role === "admin" || user.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL);
}

/** The plan a user is on right now (expired paid plans fall back to Free). */
export function effectivePlan(user: any): { plan: PlanDef; expiresAt: string | null } {
  if (!user) return { plan: PLANS.free, expiresAt: null };
  if (isAdminUser(user)) return { plan: PLANS.premium, expiresAt: null };
  const exp = user.planExpiresAt ? new Date(user.planExpiresAt).getTime() : 0;
  if (user.plan && PLANS[user.plan as PlanId] && exp > Date.now()) {
    return { plan: PLANS[user.plan as PlanId], expiresAt: user.planExpiresAt };
  }
  // Accounts upgraded before plans existed ("pro" role, no expiry) keep Plus.
  if (user.role === "pro" && !user.plan) return { plan: PLANS.plus, expiresAt: null };
  return { plan: PLANS.free, expiresAt: null };
}

/**
 * Starts or extends a paid plan (default 30 days). Picking the plan the user already has adds the days on top of
 * the time left; a different plan (or `fromNow`) starts counting today. Every change is kept in `planHistory`.
 */
export function activatePlan(
  userId: number,
  planId: PlanId,
  days = PLAN_DAYS,
  opts: { fromNow?: boolean; source?: "admin" | "receipt" | "system"; note?: string } = {}
) {
  const user = storage.getUserById(userId);
  if (!user) return null;
  const history = Array.isArray(user.planHistory) ? user.planHistory.slice(-49) : [];
  const at = new Date().toISOString();
  if (planId === "free") {
    history.push({ plan: "free", days: 0, at, source: opts.source || "system", note: opts.note || "" });
    return storage.updateUser(userId, { plan: "free", planExpiresAt: null, planHistory: history, role: user.role === "pro" ? "user" : user.role });
  }
  const now = Date.now();
  const current = !opts.fromNow && user.plan === planId && user.planExpiresAt ? new Date(user.planExpiresAt).getTime() : 0;
  const base = Math.max(now, current);
  const expiresAt = new Date(base + days * 86_400_000).toISOString();
  history.push({ plan: planId, days, at, expiresAt, source: opts.source || "system", note: opts.note || "" });
  return storage.updateUser(userId, {
    plan: planId,
    planExpiresAt: expiresAt,
    planHistory: history,
    // keep the legacy flag so older screens still show the member badge
    role: user.role === "admin" ? "admin" : "pro",
  });
}

function clientIp(req: Request): string {
  const cf = req.headers["cf-connecting-ip"];
  if (typeof cf === "string" && cf) return cf;
  // Behind the Cloudflare tunnel Cloudflare sets CF-Connecting-IP itself. X-Forwarded-For is not trusted:
  // a visitor can put anything in it and get a fresh free-search allowance every request.
  return req.socket?.remoteAddress || req.ip || "unknown";
}

function usageKey(req: Request): string {
  return req.session?.userId ? `u:${req.session.userId}` : `ip:${clientIp(req)}`;
}

function currentUser(req: Request) {
  return req.session?.userId ? storage.getUserById(req.session.userId) : null;
}

export function searchesUsedToday(req: Request): number {
  const u = usage[usageKey(req)];
  return u && u.day === tashkentDay() ? u.searches : 0;
}

function msg(lang: string, uz: string, ru: string, en: string) {
  return lang === "ru" ? ru : lang === "en" ? en : uz;
}

function langOfReq(req: Request): string {
  const h = String(req.headers["x-lang"] || "").toLowerCase();
  return h === "ru" || h === "en" ? h : "uz";
}

/** Express middleware: counts one AI search, or answers 429 with an upgrade hint when the day's allowance is used up. */
export function countSearch(req: Request, res: Response, next: NextFunction) {
  const user = currentUser(req);
  const { plan } = effectivePlan(user);
  const limit = plan.searchesPerDay;
  const key = usageKey(req);
  const today = tashkentDay();
  const u = usage[key] && usage[key].day === today ? usage[key] : { day: today, searches: 0 };
  if (limit !== -1 && u.searches >= limit) {
    const lang = langOfReq(req);
    return res.status(429).json({
      success: false,
      code: "PLAN_LIMIT",
      error: user
        ? msg(
            lang,
            `Bugungi ${limit} ta AI qidiruv limiti tugadi (${plan.name.uz} tarifi). Ko'proq qidirish uchun tarifni oshiring yoki ertaga qayta urinib ko'ring.`,
            `Дневной лимит ${limit} AI-поисков исчерпан (тариф «${plan.name.ru}»). Повысьте тариф или попробуйте завтра.`,
            `You've used today's ${limit} AI searches on the ${plan.name.en} plan. Upgrade for more, or try again tomorrow.`
          )
        : msg(
            lang,
            `Bugungi ${limit} ta bepul qidiruv tugadi. Hisobga kiring va tarif tanlang — 14 999 so'mdan.`,
            `Бесплатные ${limit} поисков на сегодня закончились. Войдите и выберите тариф — от 14 999 сум.`,
            `You've used today's ${limit} free searches. Sign in and pick a plan — from 14,999 UZS.`
          ),
      data: { kind: "search", plan: plan.id, limit, used: u.searches, signedIn: !!user },
    });
  }
  u.searches += 1;
  usage[key] = u;
  dirty = true;
  next();
}

/** Returns an error response body when the user can't add another price alert, otherwise null. */
export function trackerLimitError(req: Request, currentCount: number) {
  const { plan } = effectivePlan(currentUser(req));
  if (plan.trackers === -1 || currentCount < plan.trackers) return null;
  const lang = langOfReq(req);
  return {
    success: false,
    code: "PLAN_LIMIT",
    error: msg(
      lang,
      `${plan.name.uz} tarifida ${plan.trackers} ta narx kuzatuvi mumkin. Ko'proq kuzatish uchun tarifni oshiring.`,
      `На тарифе «${plan.name.ru}» можно отслеживать ${plan.trackers} товаров. Повысьте тариф, чтобы добавить ещё.`,
      `The ${plan.name.en} plan allows ${plan.trackers} price alerts. Upgrade to add more.`
    ),
    data: { kind: "trackers", plan: plan.id, limit: plan.trackers, used: currentCount, signedIn: true },
  };
}

export function registryLimitError(req: Request) {
  const { plan } = effectivePlan(currentUser(req));
  if (plan.registry) return null;
  const lang = langOfReq(req);
  return {
    success: false,
    code: "PLAN_LIMIT",
    error: msg(
      lang,
      "To'y ro'yxatini yaratish Plus va Premium tariflarida mavjud.",
      "Свадебный список доступен на тарифах «Плюс» и «Премиум».",
      "Wedding registries are part of the Plus and Premium plans."
    ),
    data: { kind: "registry", plan: plan.id, limit: 0, used: 0, signedIn: true },
  };
}

/**
 * Cards customers pay into, read from .env:
 *   PAYMENT_CARD_VISA, PAYMENT_CARD_UZCARD, PAYMENT_CARD_HUMO, PAYMENT_CARD_MASTERCARD,
 *   or a single PAYMENT_CARD (its network is worked out from the first digits).
 */
export function paymentCards(): { type: string; number: string }[] {
  const clean = (v?: string) => (v || "").replace(/[^0-9]/g, "");
  const detect = (n: string) =>
    n.startsWith("9860") ? "Humo" : n.startsWith("8600") || n.startsWith("5614") ? "Uzcard" : n.startsWith("4") ? "Visa" : n.startsWith("5") || n.startsWith("2") ? "Mastercard" : "Karta";
  const list = [
    { type: "Visa", number: clean(process.env.PAYMENT_CARD_VISA) },
    { type: "Uzcard", number: clean(process.env.PAYMENT_CARD_UZCARD) },
    { type: "Humo", number: clean(process.env.PAYMENT_CARD_HUMO) },
    { type: "Mastercard", number: clean(process.env.PAYMENT_CARD_MASTERCARD) },
  ];
  const generic = clean(process.env.PAYMENT_CARD);
  if (generic) list.unshift({ type: detect(generic), number: generic });
  const seen = new Set<string>();
  return list.filter((c) => c.number.length === 16 && !seen.has(c.number) && seen.add(c.number));
}

/** What the pricing page / account menu shows. */
export function planStatus(req: Request) {
  const user = currentUser(req);
  const { plan, expiresAt } = effectivePlan(user);
  const trackersUsed = user ? storage.getPriceTrackers(user.id).length : 0;
  return {
    signedIn: !!user,
    plan: plan.id,
    expiresAt,
    searchesToday: searchesUsedToday(req),
    searchLimit: plan.searchesPerDay,
    trackers: trackersUsed,
    trackerLimit: plan.trackers,
    registry: plan.registry,
  };
}
