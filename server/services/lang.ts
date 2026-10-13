import type { Request } from "express";

export type Lang = "uz" | "ru" | "en";

/** Language the visitor uses: body.language, then the X-Lang header sent by the site, then Uzbek. */
export function langOf(req: Request, bodyLang?: unknown): Lang {
  const v = String(bodyLang || req.headers["x-lang"] || "").toLowerCase();
  return v === "ru" || v === "en" ? v : "uz";
}

/** Pick the text for a language. */
export function t3(lang: string | undefined, uz: string, ru: string, en: string): string {
  return lang === "ru" ? ru : lang === "en" ? en : uz;
}
