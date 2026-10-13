import { ShieldCheck, Truck, CreditCard, Award, ArrowUpRight, ShoppingBag, Store, BookOpen, Cpu, Smartphone, Tag, Sparkles, Scale, CheckCircle2 } from "../lib/icons";
import { useCurrency } from "../lib/currency";
import { useTranslation } from "../lib/i18n";
import { cyberSound } from "../lib/cyberSound";

const partnerStores = [
  { name: "Uzum Market", tagEn: "1-day delivery", tagRu: "Доставка за 1 день", tagUz: "1 kunda yetkazish", icon: ShoppingBag, dot: "bg-purple-500", color: "bg-purple-50/70 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/60 text-purple-950 dark:text-purple-300 hover:bg-purple-100/70 dark:hover:bg-purple-900/50", url: "https://uzum.uz" },
  { name: "Yandex Market", tagEn: "Fast delivery", tagRu: "Экспресс-доставка", tagUz: "Tezkor yetkazuv", icon: Store, dot: "bg-rose-500", color: "bg-rose-50/70 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800/60 text-rose-950 dark:text-rose-300 hover:bg-rose-100/70 dark:hover:bg-rose-900/50", url: "https://market.yandex.uz" },
  { name: "Asaxiy.uz", tagEn: "Books & electronics", tagRu: "Книги и техника", tagUz: "Kitob va texnika", icon: BookOpen, dot: "bg-sky-500", color: "bg-sky-50/70 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-800/60 text-sky-950 dark:text-sky-300 hover:bg-sky-100/70 dark:hover:bg-sky-900/50", url: "https://asaxiy.uz" },
  { name: "Texnomart", tagEn: "Installments & warranty", tagRu: "Рассрочка и гарантия", tagUz: "Nasiya va kafolat", icon: Cpu, dot: "bg-red-500", color: "bg-red-50/70 dark:bg-red-950/40 border-red-200/80 dark:border-red-800/60 text-red-950 dark:text-red-300 hover:bg-red-100/70 dark:hover:bg-red-900/50", url: "https://texnomart.uz" },
  { name: "Olcha.uz", tagEn: "Phones & gadgets", tagRu: "Смартфоны и гаджеты", tagUz: "Smartfon va gadjetlar", icon: Smartphone, dot: "bg-rose-500", color: "bg-rose-50/70 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800/60 text-rose-950 dark:text-rose-300 hover:bg-rose-100/70 dark:hover:bg-rose-900/50", url: "https://olcha.uz" },
];

export default function TrustBar() {
  const { language } = useTranslation();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-xl bg-white dark:bg-[#0b1224] border border-[var(--line)] p-5 sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="max-w-2xl">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {language === "uz" ? "Qaysi do'konlarni solishtiramiz" : language === "ru" ? "Какие магазины мы сравниваем" : "Stores we compare"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {language === "uz"
                ? "Biz hech qaysi do'konga tegishli emasmiz, shuning uchun eng arzon variantni xolis ko'rsatamiz. Ko'pchiligida muddatli to'lov ham bor."
                : language === "ru"
                ? "Мы не принадлежим ни одному магазину, поэтому честно показываем самый выгодный вариант. У большинства есть рассрочка."
                : "We're not owned by any store, so we show the best deal without bias. Most of them also offer installment plans."}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {partnerStores.map((store, idx) => {
              const tag = language === "uz" ? store.tagUz : language === "ru" ? store.tagRu : store.tagEn;
              return (
                <a
                  key={idx}
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => cyberSound.playClick()}
                  className="px-3 py-2.5 rounded-lg border border-[var(--line)] hover:border-[var(--line-strong)] transition-colors group flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-medium text-sm text-slate-900 dark:text-white">
                      <span className={`w-1.5 h-1.5 rounded-full ${store.dot}`}></span>
                      <span className="truncate">{store.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{tag}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors flex-shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
