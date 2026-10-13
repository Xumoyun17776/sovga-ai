/**
 * Subscription plans (monthly). Shared by the server (limits) and the client (pricing page).
 * A limit of -1 means unlimited.
 */
export type PlanId = "free" | "start" | "plus" | "premium";

export interface PlanDef {
  id: PlanId;
  price: number; // UZS per month
  searchesPerDay: number; // AI searches / gift research / comparisons / photo search / gift detective
  trackers: number; // active price alerts
  registry: boolean; // can create wedding registries
  prioritySupport: boolean;
  name: { uz: string; ru: string; en: string };
  tagline: { uz: string; ru: string; en: string };
}

export const PLAN_DAYS = 30;

export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    id: "free",
    price: 0,
    searchesPerDay: 5,
    trackers: 2,
    registry: false,
    prioritySupport: false,
    name: { uz: "Bepul", ru: "Бесплатный", en: "Free" },
    tagline: { uz: "Sinab ko'rish uchun", ru: "Чтобы попробовать", en: "To try it out" },
  },
  start: {
    id: "start",
    price: 14_999,
    searchesPerDay: 30,
    trackers: 10,
    registry: false,
    prioritySupport: false,
    name: { uz: "Start", ru: "Старт", en: "Start" },
    tagline: { uz: "Vaqti-vaqti bilan sovg'a izlaydiganlar uchun", ru: "Для тех, кто иногда ищет подарки", en: "For the occasional gift hunt" },
  },
  plus: {
    id: "plus",
    price: 49_000,
    searchesPerDay: 100,
    trackers: 50,
    registry: true,
    prioritySupport: false,
    name: { uz: "Plus", ru: "Плюс", en: "Plus" },
    tagline: { uz: "To'y va bayramlarni rejalashtirish uchun", ru: "Для свадеб и праздников", en: "For weddings and big occasions" },
  },
  premium: {
    id: "premium",
    price: 99_000,
    searchesPerDay: -1,
    trackers: -1,
    registry: true,
    prioritySupport: true,
    name: { uz: "Premium", ru: "Премиум", en: "Premium" },
    tagline: { uz: "Cheklovsiz — hamma narsa ochiq", ru: "Без ограничений — всё открыто", en: "No limits — everything unlocked" },
  },
};

export const PAID_PLANS: PlanId[] = ["start", "plus", "premium"];

export function isPlanId(v: any): v is PlanId {
  return v === "free" || v === "start" || v === "plus" || v === "premium";
}

/** Older receipts/plans used "pro_monthly"/"pro_annual" (49,000 UZS) — they map to Plus. */
export function normalizePlanId(v: any): PlanId | null {
  if (isPlanId(v)) return v;
  if (v === "pro_monthly" || v === "pro_annual" || v === "pro") return "plus";
  return null;
}
