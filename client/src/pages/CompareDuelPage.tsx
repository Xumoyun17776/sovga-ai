import React, { useState, useEffect } from "react";
import { useTranslation, tr } from "../lib/i18n";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { research } from "../lib/api";
import { useCurrency } from "../lib/currency";
import { useToast } from "../components/Toast";
import { cyberSound } from "../lib/cyberSound";
import confetti from "canvas-confetti";
import {
  Swords,
  Sparkles,
  Trophy,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingDown,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Zap,
  Flame,
  Award,
  Users,
  Share2,
  Heart,
  Copy,
} from "../lib/icons";

interface DuelPreset {
  title: string;
  category: string;
  prodA: string;
  prodB: string;
}

const get_PRESETS = (): DuelPreset[] => [
  {
    title: "AirPods Pro 2 vs Sony XM5",
    category: tr("Audio & Quloqchinlar", "Аудио и наушники", "Audio & headphones"),
    prodA: "Apple AirPods Pro 2 USB-C",
    prodB: "Sony WH-1000XM5",
  },
  {
    title: "iPhone 16 Pro Max vs Galaxy S24 Ultra",
    category: tr("Flagman Smartfonlar", "Флагманские смартфоны", "Flagship phones"),
    prodA: "Apple iPhone 16 Pro Max 256GB",
    prodB: "Samsung Galaxy S24 Ultra 256GB",
  },
  {
    title: "Dyson Airwrap vs Supersonic",
    category: tr("Go'zallik & Parvarish", "Красота и уход", "Beauty & care"),
    prodA: "Dyson Airwrap Multi-styler",
    prodB: "Dyson Supersonic",
  },
  {
    title: "Galaxy A55 vs Redmi Note 13",
    category: tr("Ommabop Smartfonlar", "Популярные смартфоны", "Popular phones"),
    prodA: "Samsung Galaxy A55 5G",
    prodB: "Xiaomi Redmi Note 13 Pro",
  },
  {
    title: "Dolce Gusto vs De'Longhi Dedica",
    category: tr("Oshxona Texnikasi", "Кухонная техника", "Kitchen appliances"),
    prodA: "De'Longhi Dolce Gusto Mini Me",
    prodB: "De'Longhi Dedica EC 685",
  },
  {
    title: "Xiaomi Robot E10 vs Dyson V8",
    category: tr("Aqlli Xonadon", "Умный дом", "Smart home"),
    prodA: "Xiaomi Robot Vacuum E10",
    prodB: "Dyson V8 Absolute",
  },
];

export default function CompareDuelPage() {
  const { language } = useTranslation();
  const toast = useToast();
  const { formatPrice } = useCurrency();

  const [productA, setProductA] = useState("Apple AirPods Pro 2 USB-C");
  const [productB, setProductB] = useState("Sony WH-1000XM5");

  const [userVote, setUserVote] = useState<"A" | "B" | null>(null);
  // Real stored votes for the pair being compared (start at zero, no made-up numbers)
  const [votesA, setVotesA] = useState(0);
  const [votesB, setVotesB] = useState(0);
  const [duelPair, setDuelPair] = useState<{ a: string; b: string } | null>(null);
  const totalVotes = votesA + votesB;
  const pctA = totalVotes > 0 ? Math.round((votesA / totalVotes) * 100) : 50;
  const pctB = totalVotes > 0 ? 100 - pctA : 50;
  const [savedWishlist, setSavedWishlist] = useState<Record<string, boolean>>({});

  const duelMutation = useMutation({
    mutationFn: (data: { productA: string; productB: string }) => research.compareDuel(data),
    onMutate: (data) => {
      setDuelPair({ a: data.productA, b: data.productB });
      setVotesA(0);
      setVotesB(0);
      research
        .duelVotes(data.productA, data.productB)
        .then((v) => {
          setVotesA(v.a);
          setVotesB(v.b);
          setUserVote(v.voted);
        })
        .catch(() => {});
    },
    onError: () => {
      toast.error(tr("Taqqoslashda xatolik yuz berdi", "Не удалось сравнить", "Couldn't compare"), tr("Qaytadan urinib ko'ring", "Попробуйте ещё раз", "Please try again"));
    },
    onSuccess: () => {
      cyberSound.playConfirm();
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#d9431f", "#d9431f", "#10B981"],
        });
      } catch {}
    },
  });

  // Auto-run initial duel on mount so page is vibrant immediately
  useEffect(() => {
    duelMutation.mutate({ productA, productB });
  }, []);

  const handleStartDuel = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productA.trim() || !productB.trim()) {
      toast.error(tr("Ikkala mahsulot nomini ham kiriting!", "Введите названия обоих товаров", "Enter both product names"), "Xatolik");
      return;
    }
    cyberSound.playRadarBlip();
    setUserVote(null);
    duelMutation.mutate({ productA, productB });
  };

  const handleSelectPreset = (p: DuelPreset) => {
    cyberSound.playClick();
    setProductA(p.prodA);
    setProductB(p.prodB);
    setUserVote(null);
    duelMutation.mutate({ productA: p.prodA, productB: p.prodB });
  };

  const handleVote = (option: "A" | "B") => {
    if (userVote || !duelPair) return;
    cyberSound.playConfirm();
    setUserVote(option);
    if (option === "A") setVotesA((v) => v + 1);
    else setVotesB((v) => v + 1);
    research
      .voteDuel({ productA: duelPair.a, productB: duelPair.b, option })
      .then((v) => {
        setVotesA(v.a);
        setVotesB(v.b);
      })
      .catch(() => {});

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}
    toast.success(tr("Ovozingiz muvaffaqiyatli qabul qilindi!", "Ваш голос учтён", "Your vote is counted"), tr("Rahmat!", "Спасибо!", "Thank you!"));
  };

  const handleToggleWishlist = (name: string) => {
    cyberSound.playConfirm();
    const next = !savedWishlist[name];
    setSavedWishlist((prev) => ({ ...prev, [name]: next }));
    if (next) toast.success(tr(`"${name}" istaklar ro'yxatiga qo'shildi`, `«${name}» добавлен в избранное`, `"${name}" added to your wishlist`), tr("Saqlandi", "Сохранено", "Saved"));
    else toast.info(tr(`"${name}" ro'yxatdan olib tashlandi`, `«${name}» удалён из избранного`, `"${name}" removed from your wishlist`));
  };

  const handleShareDuel = () => {
    cyberSound.playClick();
    const shareText = tr(`"${productA}" yoki "${productB}"? Sovg'a'da narx va baholarni solishtiring va ovoz bering:`, `«${productA}» или «${productB}»? Сравните цены и оценки на Sovg'a и проголосуйте:`, `"${productA}" or "${productB}"? Compare prices and ratings on Sovg'a and vote:`);
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const duelResult = duelMutation.data?.data || duelMutation.data;

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-white py-10 px-4 sm:px-6 lg:px-8">
      {/* Ambient background vignette glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      </div>

      <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
        {/* Aerospace Duel Header */}
        <div className="text-center space-y-3.5">
          <h1 className="lux-title text-[2.4rem] sm:text-[3.2rem] text-slate-900 dark:text-white leading-[1.05]">
            {language === "uz" ? "Ikki mahsulotni solishtirish" : language === "ru" ? "Сравнение двух товаров" : "Compare two products"}
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            {language === "uz" ? "Ikki variant orasida ikkilanayapsizmi? Narxi, kafolati va asosiy xususiyatlarini yonma-yon ko'ring." : language === "ru" ? "Не можете выбрать из двух? Сравните цену, гарантию и главные характеристики." : "Can't decide between two options? See the price, warranty and key specs side by side."}
          </p>
        </div>

        {/* Input Interactive Arena Card */}
        <div className="bg-white dark:bg-[#0b1224] rounded-2xl border border-[var(--line)] dark:border-amber-500/25 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleStartDuel} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
              {/* Product A Field */}
              <div className="md:col-span-5 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block">
                  {tr("1-Mahsulot (Moviy Burchak)", "Товар 1", "Product 1")}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Apple AirPods Pro 2..."
                  value={productA}
                  onChange={(e) => setProductA(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-sm font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 transition shadow-2xs"
                />
              </div>

              {/* VS Crest */}
              <div className="md:col-span-1 flex justify-center py-2 md:py-0">
                <div className="w-12 h-12 rounded-2xl icon-medallion icon-box-gold text-slate-950 font-mono font-bold text-sm shadow-md">
                  VS
                </div>
              </div>

              {/* Product B Field */}
              <div className="md:col-span-5 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  {tr("2-Mahsulot (Yashil Burchak)", "Товар 2", "Product 2")}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sony WH-1000XM5..."
                  value={productB}
                  onChange={(e) => setProductB(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-sm font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 transition shadow-2xs"
                />
              </div>
            </div>

            {/* Presets and Launch Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 shrink-0">{tr("Ommabop duetlar:", "Популярные сравнения:", "Popular comparisons:")}</span>
                {get_PRESETS().map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-amber-200/90 hover:text-amber-900 dark:hover:text-amber-300 text-xs font-bold whitespace-nowrap transition border border-[var(--line)] dark:border-slate-800 shadow-2xs cursor-pointer"
                  >
                    {p.title}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={duelMutation.isPending}
                className="w-full sm:w-auto px-8 py-3.5 btn-luxury-gold text-slate-950 font-bold rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {duelMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950 stroke-[2.2]" />
                    <span>{tr("AI Taqqoslamoqda...", "Сравниваем...", "Comparing...")}</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                    <span>{tr("Duelni Boshlash", "Сравнить", "Compare")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Duel Result View */}
        {duelResult ? (
          <div className="space-y-8 animate-fade-in">
            {/* Top Verdict Banner */}
            <div className="p-6 sm:p-8 rounded-2xl from-[#0d1530] via-[#0c0e18] to-[#07090f] text-white shadow-sm border border-amber-500/30 space-y-4 relative overflow-hidden bg-[#0d1530]">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 icon-medallion icon-box-gold text-slate-950 flex items-center justify-center shadow-sm font-bold">
                    <Trophy className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                      {tr("AI YAKUNIY G'OLIBI", "ПОБЕДИТЕЛЬ", "WINNER")}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {duelResult.winner === "A" ? duelResult.productA.name : duelResult.productB.name}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">{tr("Eng tejamkor tanlov:", "Самый выгодный выбор:", "Best value:")}</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {duelResult.bestValueChoice}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal relative z-10">
                {duelResult.verdictUzbek}
              </p>
            </div>

            {/* Community Pulse & Live Poll Card */}
            <div className="bg-white dark:bg-[#0b1224] rounded-2xl border border-[var(--line)] dark:border-amber-500/20 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {tr("Xaridorlar ovozi", "Голоса покупателей", "Shopper votes")}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold">
                  {totalVotes > 0 ? tr(`Jami ${totalVotes} ovoz`, `Всего голосов: ${totalVotes}`, `${totalVotes} votes`) : tr("Hali ovoz yo'q — birinchi bo'ling", "Голосов пока нет — будьте первым", "No votes yet — be the first")}
                </span>
              </div>

              <div className="space-y-2">
                <div className="h-3.5 w-full bg-amber-100/60 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-[var(--line)]">
                  <div
                    className="h-full transition-all duration-200 rounded-l-full bg-blue-600"
                    style={{ width: `${pctA}%` }}
                  />
                  <div
                    className="h-full transition-all duration-200 rounded-r-full bg-emerald-500"
                    style={{ width: `${pctB}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-blue-700 dark:text-blue-400 truncate max-w-[45%]">
                    {duelResult.productA.name}: {totalVotes > 0 ? `${pctA}% (${votesA})` : "0"}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 truncate max-w-[45%] text-right">
                    {duelResult.productB.name}: {totalVotes > 0 ? `${pctB}% (${votesB})` : "0"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleVote("A")}
                  disabled={userVote !== null}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border ${
                    userVote === "A"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 disabled:opacity-50"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>{userVote === "A" ? tr("Siz A ga ovoz berdingiz", "Вы проголосовали за 1", "You voted for 1") : tr("1-Variantga ovoz berish", "Голосовать за 1", "Vote for 1")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVote("B")}
                  disabled={userVote !== null}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border ${
                    userVote === "B"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 disabled:opacity-50"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>{userVote === "B" ? tr("Siz B ga ovoz berdingiz", "Вы проголосовали за 2", "You voted for 2") : tr("2-Variantga ovoz berish", "Голосовать за 2", "Vote for 2")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareDuel}
                  className="py-2.5 px-4 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  title="Telegramda ulashish"
                >
                  <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span className="hidden sm:inline">{tr("Ulashish", "Поделиться", "Share")}</span>
                </button>
              </div>
            </div>

            {/* Side-by-Side Comparison Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product A Card */}
              <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 sm:p-8 border border-[var(--line)] dark:border-amber-500/20 shadow-sm flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold border bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
                        {tr("1-Variant (Moviy)", "Вариант 1", "Option 1")}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                        {duelResult.productA.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {tr("Tavsiya etilgan do'kon:", "Где дешевле:", "Cheapest at:")} <strong className="text-slate-800 dark:text-slate-200">{duelResult.productA.store}</strong>
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">{tr("Obro' Balli", "Оценка", "Score")}</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                        {duelResult.productA.score}
                        <span className="text-xs font-normal text-slate-400">/10</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-[var(--line)] dark:border-slate-800 shadow-xs">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase block">{tr("Bozor Narxi:", "Цена:", "Price:")}</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white block mt-0.5 font-mono">
                      {formatPrice(duelResult.productA.estimatedPrice)}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 block mt-1">
                      {duelResult.productA.suitability}
                    </span>
                  </div>

                  {/* Pros & Cons */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block">{tr("Afzalliklari:", "Плюсы:", "Pros:")}</span>
                    {duelResult.productA.pros.map((pro: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.2]" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[var(--line)] dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block">{tr("Nozik Jihatlari:", "Минусы:", "Cons:")}</span>
                    {duelResult.productA.cons.map((con: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5 stroke-[2.2]" />
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--line)] dark:border-slate-800 mt-6 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(duelResult.productA.name)}
                    className={`w-11 h-11 rounded-2xl border transition flex items-center justify-center cursor-pointer ${
                      savedWishlist[duelResult.productA.name]
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 shadow-xs"
                        : "bg-white/90 dark:bg-slate-900/80 border-[var(--line)] dark:border-slate-800 text-slate-400 hover:text-rose-500"
                    }`}
                    title={tr("Wishlistga qo'shish", "В избранное", "Add to wishlist")}
                  >
                    <Heart className={`w-4 h-4 stroke-[2.2] ${savedWishlist[duelResult.productA.name] ? "fill-rose-500" : ""}`} />
                  </button>
                  <a
                    href={duelResult.productA.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 btn-luxury-gold text-slate-950 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md group cursor-pointer"
                  >
                    <span>{tr(`${duelResult.productA.store}da xarid qilish`, `Купить в ${duelResult.productA.store}`, `Buy at ${duelResult.productA.store}`)}</span>
                    <ExternalLink className="w-4 h-4 stroke-[2.2] transition-transform" />
                  </a>
                </div>
              </div>

              {/* Product B Card */}
              <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 sm:p-8 border border-[var(--line)] dark:border-amber-500/20 shadow-sm flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                        {tr("2-Variant (Yashil)", "Вариант 2", "Option 2")}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                        {duelResult.productB.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {tr("Tavsiya etilgan do'kon:", "Где дешевле:", "Cheapest at:")} <strong className="text-slate-800 dark:text-slate-200">{duelResult.productB.store}</strong>
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">{tr("Obro' Balli", "Оценка", "Score")}</span>
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {duelResult.productB.score}
                        <span className="text-xs font-normal text-slate-400">/10</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-[var(--line)] dark:border-slate-800 shadow-xs">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase block">{tr("Bozor Narxi:", "Цена:", "Price:")}</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white block mt-0.5 font-mono">
                      {formatPrice(duelResult.productB.estimatedPrice)}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 block mt-1">
                      {duelResult.productB.suitability}
                    </span>
                  </div>

                  {/* Pros & Cons */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block">{tr("Afzalliklari:", "Плюсы:", "Pros:")}</span>
                    {duelResult.productB.pros.map((pro: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.2]" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[var(--line)] dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block">{tr("Nozik Jihatlari:", "Минусы:", "Cons:")}</span>
                    {duelResult.productB.cons.map((con: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5 stroke-[2.2]" />
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--line)] dark:border-slate-800 mt-6 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(duelResult.productB.name)}
                    className={`w-11 h-11 rounded-2xl border transition flex items-center justify-center cursor-pointer ${
                      savedWishlist[duelResult.productB.name]
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 shadow-xs"
                        : "bg-white/90 dark:bg-slate-900/80 border-[var(--line)] dark:border-slate-800 text-slate-400 hover:text-rose-500"
                    }`}
                    title={tr("Wishlistga qo'shish", "В избранное", "Add to wishlist")}
                  >
                    <Heart className={`w-4 h-4 stroke-[2.2] ${savedWishlist[duelResult.productB.name] ? "fill-rose-500" : ""}`} />
                  </button>
                  <a
                    href={duelResult.productB.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 btn-luxury-gold text-slate-950 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md group cursor-pointer"
                  >
                    <span>{tr(`${duelResult.productB.store}da xarid qilish`, `Купить в ${duelResult.productB.store}`, `Buy at ${duelResult.productB.store}`)}</span>
                    <ExternalLink className="w-4 h-4 stroke-[2.2] transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
