import { Link } from "wouter";
import { TOOL_GROUPS, pick } from "../lib/tools";
import BrandMark from "./BrandMark";
import { useTranslation } from "../lib/i18n";
import { useCurrency } from "../lib/currency";

/** Ink footer: wordmark and contact on the left, the four section groups as columns, settings in the base line. */
export default function Footer() {
  const { language, setLanguage } = useTranslation();
  const { currency, setCurrency, exchangeRate } = useCurrency();
  const L = (uz: string, ru: string, en: string) => (language === "ru" ? ru : language === "en" ? en : uz);

  const toggle = (active: boolean) =>
    `h-8 px-3 rounded-lg text-[13px] font-semibold uppercase transition cursor-pointer ${active ? "bg-white/15 text-white" : "text-white/55 hover:text-white"}`;

  return (
    <footer className="band-ink">
      <div className="wrap pt-16 lg:pt-24 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-x-8 gap-y-12">
          <div className="col-span-2 md:col-span-4 lg:col-span-4">
            <Link href="/" aria-label="Sovg'a">
              <BrandMark size="lg" tone="paper" />
            </Link>
            <p className="mt-6 text-[15px] leading-relaxed text-white/70 max-w-sm">
              {L(
                "Sovg'a tanlashga va Uzum, Olcha, Texnomart, MediaPark, Asaxiy narxlarini solishtirishga yordam beramiz. Toshkentda qilingan.",
                "Помогаем выбрать подарок и сравнить цены Uzum, Olcha, Texnomart, MediaPark и Asaxiy. Сделано в Ташкенте.",
                "We help you choose a gift and compare prices across Uzum, Olcha, Texnomart, MediaPark and Asaxiy. Made in Tashkent."
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 text-[15px]">
              <a href="https://t.me/sovga_ai_bot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white w-fit transition">
                Telegram — @sovga_ai_bot
              </a>
              <Link href="/subscription" className="text-white/80 hover:text-white w-fit">
                {L("Tariflar", "Тарифы", "Plans")}
              </Link>
            </div>
          </div>

          {TOOL_GROUPS.map((g) => (
            <div key={g.id} className="lg:col-span-2">
              <h4 className="text-[14px] font-semibold text-white">
                {pick(g.title, language)}
              </h4>
              <ul className="mt-5 space-y-3 text-[15px]">
                {g.items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} className="text-white/80 hover:text-white transition-colors">
                      {pick(it.title, language)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-6 border-t border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[13px] text-white/55">
          <p>© 2026 Sovg'a · {L("MB kursi", "Курс ЦБ", "CBU rate")} $1 = {exchangeRate.toLocaleString("ru-RU")} {L("so'm", "сум", "UZS")}</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1">
              {(["uz", "ru", "en"] as const).map((lng) => (
                <button key={lng} onClick={() => setLanguage(lng)} className={toggle(language === lng)}>
                  {lng}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1">
              {(["UZS", "USD"] as const).map((c) => (
                <button key={c} onClick={() => setCurrency(c)} className={toggle(currency === c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
