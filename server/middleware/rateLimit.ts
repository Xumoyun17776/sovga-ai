import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, error: "Juda ko'p so'rovlar yuborildi, iltimos birozdan so'ng qayta urinib ko'ring." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const researchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: "AI tadqiqot so'rovlari chegarasiga yetildi. Iltimos 1-2 daqiqa kutib qayta urinib ko'ring." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: "Xavfsizlik tizimi: Juda ko'p login urinishlari qilindi. Iltimos, 15 daqiqadan so'ng qayta urinib ko'ring." },
  standardHeaders: true,
  legacyHeaders: false,
});
