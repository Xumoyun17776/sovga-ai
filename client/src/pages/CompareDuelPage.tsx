import React, { useState, useEffect } from "react";
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
} from "lucide-react";

interface DuelPreset {
  title: string;
  category: string;
  prodA: string;
  prodB: string;
}

const PRESETS: DuelPreset[] = [
  {
    title: "AirPods Pro 2 vs Sony XM5",
    category: "Audio & Quloqchinlar",
    prodA: "Apple AirPods Pro 2 USB-C",
    prodB: "Sony WH-1000XM5 ANC Flagman",
  },
  {
    title: "iPhone 16 Pro Max vs Galaxy S24 Ultra",
    category: "Flagman Smartfonlar",
    prodA: "Apple iPhone 16 Pro Max 256GB",
    prodB: "Samsung Galaxy S24 Ultra 256GB",
  },
  {
    title: "Dyson Airwrap vs Philips",
    category: "Go'zallik & Parvarish",
    prodA: "Dyson Airwrap Multi-styler",
    prodB: "Philips MoistureProtect BHD350",
  },
  {
    title: "Galaxy A55 vs Redmi Note 13",
    category: "Ommabop Smartfonlar",
    prodA: "Samsung Galaxy A55 5G",
    prodB: "Xiaomi Redmi Note 13 Pro",
  },
  {
    title: "De'Longhi vs Philips Kofe",
    category: "Oshxona Texnikasi",
    prodA: "De'Longhi Dolce Gusto Mini Me",
    prodB: "Philips Series 2200 Espresso",
  },
  {
    title: "Xiaomi Robot S10 vs Dreame D9",
    category: "Aqlli Xonadon",
    prodA: "Xiaomi Robot Vacuum S10",
    prodB: "Dreame D9 Max Gen 2",
  },
];

export default function CompareDuelPage() {
  const toast = useToast();
  const { formatPrice } = useCurrency();

  const [productA, setProductA] = useState("Apple AirPods Pro 2 USB-C");
  const [productB, setProductB] = useState("Sony WH-1000XM5 ANC Flagman");

  const [userVote, setUserVote] = useState<"A" | "B" | null>(null);
  const [votesA, setVotesA] = useState(1420);
  const [votesB, setVotesB] = useState(890);
  const [savedWishlist, setSavedWishlist] = useState<Record<string, boolean>>({});

  const duelMutation = useMutation({
    mutationFn: (data: { productA: string; productB: string }) => research.compareDuel(data),
    onError: () => {
      toast.error("Taqqoslashda xatolik yuz berdi", "Qaytadan urinib ko'ring");
    },
    onSuccess: () => {
      cyberSound.playConfirm();
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#F59E0B", "#6366F1", "#10B981"],
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
      toast.error("Ikkala mahsulot nomini ham kiriting!", "Xatolik");
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
    if (userVote) return;
    cyberSound.playConfirm();
    setUserVote(option);
    if (option === "A") setVotesA((v) => v + 1);
    else setVotesB((v) => v + 1);

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}
    toast.success("Ovozingiz muvaffaqiyatli qabul qilindi!", "Rahmat!");
  };

  const handleToggleWishlist = (name: string) => {
    cyberSound.playConfirm();
    setSavedWishlist((prev) => {
      const next = !prev[name];
      if (next) toast.success(`"${name}" istaklar ro'yxatiga qo'shildi!`, "Saqlandi");
      else toast.info(`"${name}" ro'yxatdan olib tashlandi.`);
      return { ...prev, [name]: next };
    });
  };

  const handleShareDuel = () => {
    cyberSound.playClick();
    const shareText = `Sovg'a AI da qizg'in duel: "${productA}" vs "${productB}"!\n\nAI tahlili va xolis g'olibni ko'ring yoki ovoz bering:`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const duelResult = duelMutation.data?.data || duelMutation.data;

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-white py-10 px-4 sm:px-6 lg:px-8">
      {/* Ambient background vignette glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-amber-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl opacity-70" />
      </div>

      <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
        {/* Aerospace Duel Header */}
        <div className="text-center space-y-3.5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 text-amber-900 dark:text-amber-300 text-xs font-mono font-bold tracking-wider border border-amber-300/70 dark:border-amber-500/30 shadow-xs">
            <Swords className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
            <span>AI NEURAL DUEL ARENA v3.8</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
            Ikki Flagman Mahsulot <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-300 dark:to-yellow-400">To'qnashuvi</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto font-normal">
            Ikkita mashhur sovg'a o'rtasida ikkilanayapsizmi? Sun'iy intellekt ularning O'zbekistondagi
            real narxlari, rasmiy kafolati va maqsadli qulayligini yuzma-yuz solishtirib xolis hukm beradi.
          </p>
        </div>

        {/* Input Interactive Arena Card */}
        <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/25 shadow-luxury p-6 sm:p-8">
          <form onSubmit={handleStartDuel} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
              {/* Product A Field */}
              <div className="md:col-span-5 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block">
                  1-Mahsulot (Moviy Burchak)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Apple AirPods Pro 2..."
                  value={productA}
                  onChange={(e) => setProductA(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-sm font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 transition shadow-2xs"
                />
              </div>

              {/* VS Crest */}
              <div className="md:col-span-1 flex justify-center py-2 md:py-0">
                <div className="w-12 h-12 rounded-2xl icon-medallion icon-box-gold text-slate-950 font-mono font-black text-sm shadow-md">
                  VS
                </div>
              </div>

              {/* Product B Field */}
              <div className="md:col-span-5 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  2-Mahsulot (Yashil Burchak)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sony WH-1000XM5..."
                  value={productB}
                  onChange={(e) => setProductB(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-sm font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 transition shadow-2xs"
                />
              </div>
            </div>

            {/* Presets and Launch Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 shrink-0">Ommabop duetlar:</span>
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-amber-200/90 hover:text-amber-900 dark:hover:text-amber-300 text-xs font-bold whitespace-nowrap transition border border-amber-200/60 dark:border-slate-800 shadow-2xs cursor-pointer active:scale-95"
                  >
                    {p.title}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={duelMutation.isPending}
                className="w-full sm:w-auto px-8 py-3.5 btn-luxury-gold text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {duelMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950 stroke-[2.2]" />
                    <span>AI Taqqoslamoqda...</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                    <span>Duelni Boshlash</span>
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
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121422] via-[#0c0e18] to-[#07090f] text-white shadow-2xl border-2 border-amber-500/30 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 icon-medallion icon-box-gold text-slate-950 flex items-center justify-center shadow-lg font-black">
                    <Trophy className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                      AI YAKUNIY G'OLIBI
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {duelResult.winner === "A" ? duelResult.productA.name : duelResult.productB.name}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">Eng tejamkor tanlov:</span>
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
            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/20 p-5 sm:p-6 shadow-luxury space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    O'zbekistonlik Xaridorlar Tanlovi (Jonli Ovoz Berish)
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold">
                  Jami {votesA + votesB} ovoz
                </span>
              </div>

              <div className="space-y-2">
                <div className="h-3.5 w-full bg-amber-100/60 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-amber-200/40">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-500 rounded-l-full"
                    style={{ width: `${Math.round((votesA / (votesA + votesB)) * 100)}%` }}
                  />
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500 rounded-r-full"
                    style={{ width: `${Math.round((votesB / (votesA + votesB)) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-blue-700 dark:text-blue-400 truncate max-w-[45%]">
                    {duelResult.productA.name}: {Math.round((votesA / (votesA + votesB)) * 100)}% ({votesA})
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 truncate max-w-[45%] text-right">
                    {duelResult.productB.name}: {Math.round((votesB / (votesA + votesB)) * 100)}% ({votesB})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleVote("A")}
                  disabled={userVote !== null}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border active:scale-95 ${
                    userVote === "A"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 disabled:opacity-50"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>{userVote === "A" ? "Siz A ga ovoz berdingiz ✓" : "1-Variantga ovoz berish"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVote("B")}
                  disabled={userVote !== null}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border active:scale-95 ${
                    userVote === "B"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 disabled:opacity-50"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>{userVote === "B" ? "Siz B ga ovoz berdingiz ✓" : "2-Variantga ovoz berish"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareDuel}
                  className="py-2.5 px-4 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 active:scale-95"
                  title="Telegramda ulashish"
                >
                  <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span className="hidden sm:inline">Ulashish</span>
                </button>
              </div>
            </div>

            {/* Side-by-Side Comparison Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product A Card */}
              <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                        1-Variant (Moviy)
                      </span>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                        {duelResult.productA.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Tavsiya etilgan do'kon: <strong className="text-slate-800 dark:text-slate-200">{duelResult.productA.store}</strong>
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">Obro' Balli</span>
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                        {duelResult.productA.score}
                        <span className="text-xs font-normal text-slate-400">/10</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-amber-200/70 dark:border-slate-800 shadow-xs">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase block">Bozor Narxi:</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white block mt-0.5 font-mono">
                      {formatPrice(duelResult.productA.estimatedPrice)}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 block mt-1">
                      {duelResult.productA.suitability}
                    </span>
                  </div>

                  {/* Pros & Cons */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block">Afzalliklari:</span>
                    {duelResult.productA.pros.map((pro: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.2]" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-amber-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block">Nozik Jihatlari:</span>
                    {duelResult.productA.cons.map((con: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5 stroke-[2.2]" />
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-amber-100 dark:border-slate-800 mt-6 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(duelResult.productA.name)}
                    className={`w-11 h-11 rounded-2xl border transition flex items-center justify-center cursor-pointer active:scale-95 ${
                      savedWishlist[duelResult.productA.name]
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 shadow-xs"
                        : "bg-white/90 dark:bg-slate-900/80 border-amber-200/70 dark:border-slate-800 text-slate-400 hover:text-rose-500"
                    }`}
                    title="Wishlistga qo'shish"
                  >
                    <Heart className={`w-4 h-4 stroke-[2.2] ${savedWishlist[duelResult.productA.name] ? "fill-rose-500" : ""}`} />
                  </button>
                  <a
                    href={duelResult.productA.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 btn-luxury-gold text-slate-950 rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-md group cursor-pointer active:scale-95"
                  >
                    <span>{duelResult.productA.store}da Xarid Qilish</span>
                    <ExternalLink className="w-4 h-4 stroke-[2.2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Product B Card */}
              <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                        2-Variant (Yashil)
                      </span>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                        {duelResult.productB.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Tavsiya etilgan do'kon: <strong className="text-slate-800 dark:text-slate-200">{duelResult.productB.store}</strong>
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">Obro' Balli</span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {duelResult.productB.score}
                        <span className="text-xs font-normal text-slate-400">/10</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-amber-200/70 dark:border-slate-800 shadow-xs">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase block">Bozor Narxi:</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white block mt-0.5 font-mono">
                      {formatPrice(duelResult.productB.estimatedPrice)}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 block mt-1">
                      {duelResult.productB.suitability}
                    </span>
                  </div>

                  {/* Pros & Cons */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block">Afzalliklari:</span>
                    {duelResult.productB.pros.map((pro: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.2]" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-amber-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block">Nozik Jihatlari:</span>
                    {duelResult.productB.cons.map((con: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5 stroke-[2.2]" />
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-amber-100 dark:border-slate-800 mt-6 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(duelResult.productB.name)}
                    className={`w-11 h-11 rounded-2xl border transition flex items-center justify-center cursor-pointer active:scale-95 ${
                      savedWishlist[duelResult.productB.name]
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 shadow-xs"
                        : "bg-white/90 dark:bg-slate-900/80 border-amber-200/70 dark:border-slate-800 text-slate-400 hover:text-rose-500"
                    }`}
                    title="Wishlistga qo'shish"
                  >
                    <Heart className={`w-4 h-4 stroke-[2.2] ${savedWishlist[duelResult.productB.name] ? "fill-rose-500" : ""}`} />
                  </button>
                  <a
                    href={duelResult.productB.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 btn-luxury-gold text-slate-950 rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-md group cursor-pointer active:scale-95"
                  >
                    <span>{duelResult.productB.store}da Xarid Qilish</span>
                    <ExternalLink className="w-4 h-4 stroke-[2.2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
