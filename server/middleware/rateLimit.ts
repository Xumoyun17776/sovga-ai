import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import { langOf, t3 } from "../services/lang.js";

/** Rate-limit reply in the visitor's language. */
const reply = (uz: string, ru: string, en: string) => (req: Request, res: Response) => {
  const lang = langOf(req);
  res.status(429).json({ success: false, error: t3(lang, uz, ru, en) });
};

const getClientIp = (req: Request): string => {
  const cfIp = req.headers["cf-connecting-ip"];
  if (typeof cfIp === "string" && cfIp) return cfIp;
  const xForwarded = req.headers["x-forwarded-for"];
  if (typeof xForwarded === "string" && xForwarded) return xForwarded.split(",")[0].trim();
  return req.ip || "127.0.0.1";
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  keyGenerator: getClientIp,
  validate: { trustProxy: false },
  handler: reply(
    "Juda ko'p so'rovlar yuborildi. Birozdan so'ng qayta urinib ko'ring.",
    "Слишком много запросов. Попробуйте чуть позже.",
    "Too many requests. Please try again in a little while."
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

export const researchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  keyGenerator: getClientIp,
  validate: { trustProxy: false },
  handler: reply(
    "Qidiruvlar chegarasiga yetildi. 1-2 daqiqadan keyin qayta urinib ko'ring.",
    "Достигнут лимит поисков. Попробуйте через 1–2 минуты.",
    "Search limit reached. Please try again in a minute or two."
  ),
  // Cheap read-only lookups (trending deals, delivery info, store reputation) shouldn't use up the search budget.
  skip: (req) => req.method === "GET",
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyGenerator: getClientIp,
  validate: { trustProxy: false },
  handler: reply(
    "Juda ko'p kirish urinishlari. 15 daqiqadan so'ng qayta urinib ko'ring.",
    "Слишком много попыток входа. Попробуйте через 15 минут.",
    "Too many sign-in attempts. Please try again in 15 minutes."
  ),
  standardHeaders: true,
  legacyHeaders: false,
});
