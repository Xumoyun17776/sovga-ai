import { useRef } from "react";
import { ShieldCheck, Sparkles, Crown, Zap, Gift, Check, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation } from "../lib/i18n";

export default function HolographicPrivilegeCard() {
  const { language } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
    }
    cyberSound.playHoloChime();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = rectRef.current || cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rX = ((y - centerY) / centerY) * -9;
    const rY = ((x - centerX) / centerX) * 9;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rX.toFixed(2)}deg) rotateY(${rY.toFixed(2)}deg) scale3d(1.02, 1.02, 1)`;
      }
    });
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
  };

  return (
    <section id="vip-card-section" className="relative overflow-hidden">
      <div className="card-luxury-elevated p-8 sm:p-12 bg-gradient-to-br from-white via-[#fcfaf5] to-[#f6f0e2] dark:from-slate-950 dark:via-[#0a0e1a] dark:to-slate-900 border-2 border-amber-300/80 dark:border-amber-500/30 text-slate-900 dark:text-white rounded-3xl shadow-luxury relative">
        {/* Ambient background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.2),transparent)] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 dark:bg-white/10 border border-amber-300/80 dark:border-white/15 text-amber-900 dark:text-amber-300 text-xs font-mono font-bold tracking-wider backdrop-blur-md shadow-xs">
              <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>SOVG'A BLACK CARD · PRIVILEGE CONCIERGE</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight leading-tight">
              {language === "uz"
                ? "Shaxsiy AI Xarid Boshqaruv Kartasi"
                : language === "ru"
                ? "Персональная AI Карта Управления Покупками"
                : "Personal AI Luxury Concierge Card"}
            </h2>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-normal leading-relaxed max-w-xl">
              {language === "uz"
                ? "Oddiy xaridorlardan ustun bo'ling. Sovg'a AI algoritmlari O'zbekistondagi 6 ta yirik retail omborini siz uchun 24/7 rejimida skanerlab, narx tushgan soniyada xabar beradi."
                : language === "ru"
                ? "Будьте впереди обычных покупателей. Алгоритмы Sovg'a AI сканируют 6 крупнейших складов Узбекистана 24/7 и уведомляют в секунду падения цены."
                : "Experience elite shopping telemetry. Sovg'a AI algorithms continuously monitor 6 premier retail warehouses across Uzbekistan 24/7, notifying you the millisecond genuine discounts drop."}
            </p>

            {/* Privilege Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-medium">
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-amber-200/80 dark:border-white/10 shadow-xs text-slate-800 dark:text-slate-200">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {language === "uz" ? "0% Soxta chegirma kafolati" : language === "ru" ? "Гарантия 0% поддельных скидок" : "0% Fake Discount Guarantee"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-amber-200/80 dark:border-white/10 shadow-xs text-slate-800 dark:text-slate-200">
                <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>
                  {language === "uz" ? "6 ta do'kon bo'yicha eng past narx radari" : language === "ru" ? "Радар минимальной цены по 6 магазинам" : "Real-time Lowest Price Radar (6 Retailers)"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-amber-200/80 dark:border-white/10 shadow-xs text-slate-800 dark:text-slate-200">
                <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  {language === "uz" ? "Halol Nasiya & Foizsiz muddatli to'lov" : language === "ru" ? "Халяльная рассрочка без переплат" : "0% Certified Installment Plans"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-amber-200/80 dark:border-white/10 shadow-xs text-slate-800 dark:text-slate-200">
                <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>
                  {language === "uz" ? "To'y va marosimlar individual rejasi" : language === "ru" ? "Индивидуальный свадебный план" : "Dedicated Wedding & Event Concierge"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Link
                href="/gift-finder"
                className="btn-luxury-gold px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-950 dark:text-amber-300 stroke-[2.2]" />
                <span>
                  {language === "uz" ? "AI Konsyerjni Ishga Tushirish" : language === "ru" ? "Запустить AI Консьержа" : "Launch AI Concierge"}
                </span>
                <ArrowRight className="w-4 h-4 ml-1 stroke-[2.2]" />
              </Link>
              <Link
                href="/wedding"
                className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-amber-100/80 hover:bg-amber-200/80 dark:bg-white/10 dark:hover:bg-white/15 border border-amber-300/80 dark:border-white/20 text-amber-950 dark:text-white transition flex items-center gap-2 backdrop-blur-md shadow-xs active:scale-95 cursor-pointer"
              >
                <span>
                  {language === "uz" ? "To'y Reyestrini Boshlash" : language === "ru" ? "Создать реестр подарков" : "Create Wedding Registry"}
                </span>
              </Link>
            </div>
          </div>

          {/* Right 3D Interactive Holographic Card (RAF GPU Accelerated) */}
          <div className="lg:col-span-5 flex justify-center perspective-1000">
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
                transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                willChange: "transform",
              }}
              className="w-full max-w-sm aspect-[1.586] min-h-[200px] flex flex-col justify-between rounded-3xl p-5 sm:p-7 relative overflow-hidden bg-gradient-to-tr from-[#020617] via-[#0f172a] to-[#1e1b4b] border border-amber-500/40 shadow-2xl cursor-pointer select-none group"
            >
              {/* Holographic prismatic sheen */}
              <div className="absolute inset-0 hologram-sheen opacity-40 group-hover:opacity-75 transition-opacity pointer-events-none" />

              {/* Brushed titanium micro-lines */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.2),transparent_70%)] pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/50 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <span className="font-display font-black tracking-wider text-sm text-white">
                    SOVG'A<span className="text-amber-400">.AI</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase px-2 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/20">
                  TITANIUM VIP
                </span>
              </div>

              {/* Holographic Chip Visual */}
              <div className="relative z-10 mt-6 flex items-center justify-between">
                <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-500 border border-amber-200 shadow-sm flex items-center justify-center relative overflow-hidden">
                  <div className="w-full h-px bg-amber-900/30 absolute top-2.5" />
                  <div className="w-full h-px bg-amber-900/30 absolute bottom-2.5" />
                  <div className="h-full w-px bg-amber-900/30 absolute left-3.5" />
                  <div className="h-full w-px bg-amber-900/30 absolute right-3.5" />
                </div>
                <span className="font-mono text-xs tracking-widest text-slate-400">
                  •• 8842
                </span>
              </div>

              {/* Card Bottom: Holder Name & Status */}
              <div className="relative z-10 mt-auto pt-4 flex items-end justify-between">
                <div>
                  <p className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Cardholder</p>
                  <p className="font-mono text-xs font-bold tracking-wider text-slate-100 uppercase">
                    SOVEREIGN CLIENT
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase font-mono tracking-widest text-amber-400">STATUS</p>
                  <p className="font-mono text-xs font-bold text-emerald-400">ACTIVE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
