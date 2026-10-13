import { Link } from "wouter";
import { ArrowRight, ArrowUpRight } from "../lib/icons";
import { useTranslation } from "../lib/i18n";
import SectionHeader, { sectionActionCls } from "./SectionHeader";
import { TOOL_GROUPS, pick } from "../lib/tools";

interface Props {
  onOpenAllServices: () => void;
  onOpenGiftDetective?: () => void;
}

/** Homepage overview of every section: a featured "gift detective" card, then one card per tool group. */
export default function HeroFeatureLaunchpad({ onOpenAllServices, onOpenGiftDetective }: Props) {
  const { language } = useTranslation();
  const L = (uz: string, ru: string, en: string) => (language === "ru" ? ru : language === "en" ? en : uz);

  return (
    <div id="features-hub-section" className="scroll-mt-24">
      <SectionHeader
        kicker={L("Imkoniyatlar", "Возможности", "Features")}
        title={L("Sovg'a uchun kerak bo'lgan hamma narsa", "Всё, что нужно для подарка", "Everything you need for a gift")}
        subtitle={L(
          "Tanlash, narxni tekshirish va bayramga tayyorlanish — bir joyda.",
          "Выбрать, проверить цену и подготовиться к празднику — в одном месте.",
          "Choose, check the price and get ready for the day — in one place."
        )}
        action={
          <button onClick={onOpenAllServices} className={sectionActionCls}>
            {L("Barcha bo'limlar", "Все разделы", "All sections")} <ArrowRight className="w-4 h-4" />
          </button>
        }
      />

      {onOpenGiftDetective && (
        <button
          onClick={onOpenGiftDetective}
          className="group relative w-full overflow-hidden text-left mb-5 rounded-3xl bg-[var(--navy)] text-white dark:ring-1 dark:ring-[var(--rule-soft)] grid grid-cols-1 md:grid-cols-12 items-stretch cursor-pointer"
        >
          <span className="relative md:col-span-7 p-7 sm:p-10 flex flex-col justify-center">
            <span className="inline-flex w-fit items-center h-7 px-3 rounded-full bg-white/10 text-[13px] font-semibold text-white/90">
              {L("Sovg'a detektivi", "Детектив подарков", "Gift detective")}
            </span>
            <span className="mt-4 font-lux text-[1.75rem] sm:text-[2.25rem] leading-[1.1]">
              {L("Nima sovg'a qilishni bilmayapsizmi? Odamni ta'riflang.", "Не знаете, что подарить? Опишите человека.", "Not sure what to give? Describe the person.")}
            </span>
            <span className="mt-3 text-[16px] text-white/70 max-w-md">
              {L("Qiziqishlari, yoshi, byudjet — biz aniq g'oyalar va narxlarni topamiz.", "Увлечения, возраст, бюджет — подберём идеи с ценами.", "Interests, age, budget — we find concrete ideas with prices.")}
            </span>
            <span className="mt-7 inline-flex w-fit items-center gap-2 h-11 px-5 rounded-xl bg-[#fff] text-[#0E1A36] text-[15px] font-semibold group-hover:bg-[#EAF0FB] transition">
              {L("G'oyalar olish", "Получить идеи", "Get ideas")} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </span>
          <span className="relative md:col-span-5 min-h-[200px] md:min-h-0">
            <img
              src="https://images.unsplash.com/photo-1512909006721-3d6018887383?w=900&q=70&auto=format&fit=crop"
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <span aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,var(--navy)_0%,transparent_45%)] hidden md:block" />
          </span>
        </button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TOOL_GROUPS.map((g) => {
          const Icon = g.items[0]?.icon;
          return (
            <section key={g.id} className="card p-5 sm:p-6 flex flex-col">
              <span className="tile">{Icon && <Icon />}</span>
              <h3 className="mt-4 font-lux text-[1.25rem] text-[var(--ink)]">{pick(g.title, language)}</h3>
              <ul className="mt-3 -mx-2 flex-1">
                {g.items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} className="group flex items-start justify-between gap-3 rounded-xl px-2 py-2.5 hover:bg-[var(--paper-2)] transition-colors">
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold text-[var(--ink)] group-hover:text-[var(--anor)] transition-colors">{pick(it.title, language)}</span>
                        <span className="block text-[13px] text-[var(--ink-2)] mt-0.5 leading-snug">{pick(it.desc, language)}</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 mt-1 text-[var(--line-strong)] group-hover:text-[var(--anor)] transition-colors flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
