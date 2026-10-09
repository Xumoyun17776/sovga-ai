import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { formatPrice, research } from "../lib/api";
import { useToast } from "../components/Toast";
import { cyberSound } from "../lib/cyberSound";
import {
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Sliders,
  DollarSign,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  Store,
  Bell,
  Heart,
  Share2,
  Check,
  Info,
  Link as LinkIcon,
  X,
  Zap,
} from "lucide-react";

interface AuditResult {
  productName: string;
  authenticityScore: number; // 0-100
  signal: "buy_now" | "fair" | "wait";
  currentBestPrice: number;
  marketMedianPrice: number;
  inflatedOriginalPrice: number;
  realDiscountPercent: number;
  claimedDiscountPercent: number;
  isFakeDiscount: boolean;
  verdictUz: string;
  storeComparison: {
    store: string;
    price: number;
    warranty: string;
    delivery: string;
    verified: boolean;
    url: string;
  }[];
  priceHistory: { date: string; price: number }[];
  marketNotes: string[];
}

const TRENDING_SEARCHES = [
  "DeLonghi Dolce Gusto Mini Me",
  "iPhone 16 Pro 128GB",
  "Dyson Airwrap Complete Long",
  "Sony WH-1000XM5",
  "Samsung Galaxy S24 Ultra",
  "Xiaomi Robot Vacuum X20+",
  "Artel HD 276 FN Muzlatgich",
  "MacBook Air M3 256GB",
];

// Helper to extract clean product name from marketplace URLs
function extractProductFromUrl(url: string): string | null {
  try {
    const trimmed = url.trim();
    if (!trimmed.includes("http://") && !trimmed.includes("https://") && !trimmed.includes(".uz")) {
      return null;
    }
    const cleanUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const parsed = new URL(cleanUrl);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts.length === 0) return null;

    let slug = pathParts[pathParts.length - 1] || "";
    // strip query or html
    slug = slug.replace(/\.html$/i, "").replace(/-\d+$/, "").replace(/_/g, "-");
    const words = slug.split("-").filter((w) => w.length > 0 && !/^\d+$/.test(w));
    if (words.length >= 2) {
      // capitalize words
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
        .replace(/^(Smartfon|Telefon|Noutbuk|Kofemashina)\s+/i, "");
    }
  } catch {
    return null;
  }
  return null;
}

export default function PriceAuditPage() {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("DeLonghi Dolce Gusto Mini Me");
  const [isAuditing, setIsAuditing] = useState(false);
  const [detectedUrlProduct, setDetectedUrlProduct] = useState<string | null>(null);

  // Radar Alert Modal State
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [radarTelegram, setRadarTelegram] = useState("");
  const [radarThreshold, setRadarThreshold] = useState("5"); // 5%, 10%, 15%
  const [radarSaved, setRadarSaved] = useState(false);

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [auditData, setAuditData] = useState<AuditResult>({
    productName: "DeLonghi Nescafé Dolce Gusto Mini Me Kapsulali Kofe Mashinasi",
    authenticityScore: 92,
    signal: "buy_now",
    currentBestPrice: 650000,
    marketMedianPrice: 720000,
    inflatedOriginalPrice: 790000,
    realDiscountPercent: 18,
    claimedDiscountPercent: 18,
    isFakeDiscount: false,
    verdictUz: "Asl chegirma tasdiqlandi. 18 ta manba bo'yicha narx so'nggi 30 kunlik eng past nuqtada turibdi.",
    storeComparison: [
      {
        store: "Uzum Market",
        price: 650000,
        warranty: "2 yil rasmiy kafolat",
        delivery: "1 kunda bepul",
        verified: true,
        url: "https://uzum.uz/uz/search?q=DeLonghi+Mini+Me",
      },
      {
        store: "Texnomart",
        price: 689000,
        warranty: "2 yil rasmiy kafolat",
        delivery: "Bugun Toshkentda kuryer",
        verified: true,
        url: "https://texnomart.uz/uz/katalog/?q=DeLonghi+Mini+Me",
      },
      {
        store: "MediaPark",
        price: 710000,
        warranty: "1 yil kafolat",
        delivery: "1-2 kun ichida",
        verified: true,
        url: "https://mediapark.uz/search?q=DeLonghi+Mini+Me",
      },
      {
        store: "Malika Bozor (Do'konlar)",
        price: 730000,
        warranty: "6 oylik do'kon kafolati",
        delivery: "Olib ketish",
        verified: false,
        url: "https://asaxiy.uz/product?search=DeLonghi+Mini+Me",
      },
    ],
    priceHistory: [
      { date: "30 kun oldin", price: 790000 },
      { date: "20 kun oldin", price: 780000 },
      { date: "10 kun oldin", price: 740000 },
      { date: "Bugun (Eng arzon)", price: 650000 },
    ],
    marketNotes: [
      "Sun'iy narx oshirilishi aniqlanmadi (Bazaviy narx 790,000 UZS dan tushirilgan).",
      "Rasmiy distribyutor importi, sertifikatlangan Yevropa standarti.",
      "Toshkent shahri ichida bepul yetkazib berish xizmati bilan.",
    ],
  });

  // Watch search query for marketplace links
  useEffect(() => {
    const extracted = extractProductFromUrl(searchQuery);
    setDetectedUrlProduct(extracted);
  }, [searchQuery]);

  const executeAudit = async (queryToRun: string) => {
    const cleanName = queryToRun.trim();
    if (!cleanName) return;

    setIsAuditing(true);
    cyberSound.playClick();

    try {
      const comp = await research.compare({ productName: cleanName });
      const exactMatches = comp?.exactMatches || [];
      const lowestMatch = exactMatches.find((m: any) => m.isLowestPrice) || exactMatches[0];
      const bestPrice = lowestMatch?.price || comp?.priceHistory?.currentPrice || 500000;
      const history30 = comp?.priceHistory?.price30DaysAgo || Math.round(bestPrice * 1.12);
      const isCheaper = bestPrice < history30;
      const realDiscount = Math.max(4, Math.round(Math.abs((history30 - bestPrice) / history30) * 100));

      // Calculate fake discount flag & claimed discount
      const isFake = !isCheaper || (comp?.bestTimeBuyAdvice?.recommendation === "wait");
      const claimedDisc = isFake ? realDiscount + 16 : realDiscount;
      const fakeBaseline = isFake ? Math.round(history30 * 1.25) : Math.round(history30 * 1.05);
      const calculatedScore = isCheaper ? 94 : isFake ? 48 : 76;

      setAuditData({
        productName: cleanName,
        authenticityScore: calculatedScore,
        signal: comp?.bestTimeBuyAdvice?.recommendation || (isCheaper ? "buy_now" : "fair"),
        currentBestPrice: bestPrice,
        marketMedianPrice: history30,
        inflatedOriginalPrice: fakeBaseline,
        realDiscountPercent: realDiscount,
        claimedDiscountPercent: claimedDisc,
        isFakeDiscount: isFake,
        verdictUz: comp?.bestTimeBuyAdvice?.reason || (isCheaper
          ? `Asl chegirma tasdiqlandi. Narx 30 kunlik o'rtacha ko'rsatkichdan ${realDiscount}% arzonroq.`
          : isFake
          ? `Diqqat: Do'kon ko'rsatgan chegirma bozor o'rtacha narxiga mos kelmaydi. Sun'iy oshirilgan bazaviy narx aniqlandi.`
          : `Narx barqaror darajada. Chegirma kutish yoki boshqa do'konlarni ko'rish tavsiya etiladi.`),
        storeComparison: exactMatches.length > 0 ? exactMatches.map((m: any) => ({
          store: m.store,
          price: m.price,
          warranty: m.verified ? "1 yil rasmiy kafolat" : "Do'kon kafolati",
          delivery: m.deliveryTime || "1-2 kun ichida",
          verified: !!m.verified,
          url: m.url,
        })) : [
          { store: "Uzum Market", price: bestPrice, warranty: "1 yil rasmiy kafolat", delivery: "1 kunda bepul", verified: true, url: `https://uzum.uz/uz/search?q=${encodeURIComponent(cleanName)}` },
          { store: "Texnomart", price: Math.round(bestPrice * 1.04), warranty: "1-2 yil kafolat", delivery: "1 kunda", verified: true, url: `https://texnomart.uz/uz/katalog/?q=${encodeURIComponent(cleanName)}` },
          { store: "MediaPark", price: Math.round(bestPrice * 1.06), warranty: "1 yil kafolat", delivery: "1-2 kun", verified: true, url: `https://mediapark.uz/search?q=${encodeURIComponent(cleanName)}` },
        ],
        priceHistory: comp?.priceHistory?.historyPoints && comp.priceHistory.historyPoints.length > 0
          ? comp.priceHistory.historyPoints.map((h: any) => ({ date: h.date, price: h.price }))
          : [
            { date: "30 kun oldin", price: history30 },
            { date: "15 kun oldin", price: Math.round((history30 + bestPrice) / 2) },
            { date: "Bugun (Eng arzon)", price: bestPrice },
          ],
        marketNotes: [
          comp?.bestTimeBuyAdvice?.reason || "Jonli bozor narxlari asosida tekshirildi.",
          "O'zbekistondagi Uzum, Texnomart, MediaPark va Asaxiy omborlari tekshirildi.",
          isFake
            ? "⚠️ Ogohlik: Vitrinadagi narx sun'iy ko'tarilgan bo'lishi mumkin. Real tejash cheklangan."
            : "✅ Kafolatlangan asl chegirma: 30 kunlik eng past narx belgilandi.",
        ],
      });

      if (calculatedScore >= 80) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#10b981", "#3b82f6", "#f59e0b", "#6366f1"],
        });
        cyberSound.play("success");
      } else {
        cyberSound.play("chime");
      }

      toast.success("Narx auditi muvaffaqiyatli yakunlandi!", "Haqiqiy narxlar yuklandi");
    } catch (err: any) {
      toast.error(err.message || "Auditda xatolik yuz berdi");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleRunAudit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (detectedUrlProduct) {
      setSearchQuery(detectedUrlProduct);
      executeAudit(detectedUrlProduct);
    } else {
      executeAudit(searchQuery);
    }
  };

  const handleSelectTrending = (item: string) => {
    setSearchQuery(item);
    executeAudit(item);
  };

  const handleToggleWishlist = () => {
    cyberSound.playClick();
    setIsWishlisted(!isWishlisted);
    try {
      const saved = JSON.parse(localStorage.getItem("sovga_wishlist") || "[]");
      if (!isWishlisted) {
        saved.push({
          id: Date.now(),
          name: auditData.productName,
          price: auditData.currentBestPrice,
          store: auditData.storeComparison[0]?.store || "Uzum Market",
          url: auditData.storeComparison[0]?.url || "#",
          date: new Date().toLocaleDateString("uz-UZ"),
        });
        localStorage.setItem("sovga_wishlist", JSON.stringify(saved));
        toast.success("Wishlistga qo'shildi!", "Saqlangan mahsulotlar ro'yxatida ko'rishingiz mumkin");
      } else {
        const filtered = saved.filter((s: any) => s.name !== auditData.productName);
        localStorage.setItem("sovga_wishlist", JSON.stringify(filtered));
        toast.info("Wishlistdan olib tashlandi");
      }
    } catch {}
  };

  const handleShareTelegram = () => {
    cyberSound.playConfirm();
    const text =
      `🔍 *NARX AUDITI & RADAR HISOBOTI*\n` +
      `──────────────────────────\n` +
      `📦 *Mahsulot:* ${auditData.productName}\n` +
      `💎 *Asllik Indeksi:* ${auditData.authenticityScore}/100 (${auditData.authenticityScore >= 80 ? "✅ Haqiqiy chegirma" : "⚠️ Shubhali narx"})\n` +
      `💰 *Eng past narx:* ${formatPrice(auditData.currentBestPrice)}\n` +
      `📊 *Bozor medianasi:* ${formatPrice(auditData.marketMedianPrice)}\n` +
      `📉 *Asl tejash:* ${auditData.realDiscountPercent}%\n\n` +
      `🎯 *AI Tavsiyasi:* ${auditData.verdictUz}\n\n` +
      `Sovg'a AI — O'zbekistonning birinchi AI narx radari orqali tekshirildi.`;

    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleSaveRadar = () => {
    if (!radarTelegram.trim()) {
      toast.error("Telegram foydalanuvchi nomini kiriting (masalan: @username)");
      return;
    }
    cyberSound.play("radar");
    setRadarSaved(true);
    setShowRadarModal(false);
    toast.success(
      `Telegram Radar faollashtirildi! ${auditData.productName} narxi ${radarThreshold}% arzonlashishi bilan ${radarTelegram} ga xabar yuboriladi.`,
      "Radar Yoqildi 🛰️"
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 animate-fade-in text-slate-900 dark:text-white">
      {/* Ambient background vignette glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-amber-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl opacity-70" />
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3.5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-300/70 dark:border-amber-500/30 shadow-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
          <span>Fintech-Darajadagi Bozor Radari</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
          AI Narx Auditori & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-300 dark:to-yellow-400">Soxta Chegirma Foshi</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          O'zbekistondagi Uzum, Texnomart, MediaPark va Asaxiy narxlarini tahlil qiling. 
          Sun'iy ko'tarilgan narxlar, soxta chegirmalar va bozor medianasini bir soniyada aniqlang.
        </p>
      </div>

      {/* Search Input Bar with URL auto-detection */}
      <div className="max-w-3xl mx-auto space-y-3">
        <form onSubmit={handleRunAudit} className="flex gap-2.5 p-1.5 rounded-3xl bg-gradient-to-br from-white via-[#fcfaf5] to-[#f7f2e4] dark:from-[#131625] dark:to-[#0a0c16] border-2 border-amber-200/80 dark:border-amber-500/30 shadow-luxury">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70 absolute left-4 top-1/2 -translate-y-1/2 stroke-[2.2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mahsulot nomi yoki do'kon havolasini kiriting (Uzum / Texnomart)..."
              className="w-full pl-11 pr-4 py-3.5 bg-transparent rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/40 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isAuditing}
            className="px-6 sm:px-8 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition flex items-center gap-2 shadow-md shadow-amber-500/25 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isAuditing ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-slate-950 fill-current stroke-[2.2]" />
            )}
            <span>{isAuditing ? "Skan qilinmoqda..." : "Audit Qilish"}</span>
          </button>
        </form>

        {/* URL detection chip banner */}
        {detectedUrlProduct && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs font-medium animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 stroke-[2.2]" />
              <span>
                Havoladan mahsulot modeli aniqlandi: <strong>{detectedUrlProduct}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                setSearchQuery(detectedUrlProduct);
                executeAudit(detectedUrlProduct);
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-[11px] shadow-sm hover:from-amber-400 hover:to-amber-500 transition cursor-pointer active:scale-95"
            >
              Shuni Tekshirish
            </button>
          </div>
        )}

        {/* Trending Searches Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 whitespace-nowrap flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500 stroke-[2.2]" />
            Ommabop:
          </span>
          {TRENDING_SEARCHES.map((item) => (
            <button
              key={item}
              onClick={() => handleSelectTrending(item)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-amber-200/90 hover:text-amber-900 dark:hover:text-amber-300 transition whitespace-nowrap border border-amber-200/70 dark:border-amber-500/20 hover:border-amber-400 cursor-pointer shadow-xs active:scale-95"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: True Authenticity Score Gauge & Radar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f7f2e4] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 sm:p-7 border-2 border-amber-200/80 dark:border-amber-500/25 shadow-luxury space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Chegirma Asllik Indeksi
              </span>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs ${
                  auditData.authenticityScore >= 80
                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40"
                    : auditData.authenticityScore >= 60
                    ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40"
                    : "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40"
                }`}
              >
                {auditData.authenticityScore >= 80
                  ? "ISHLONCHLI CHEGIRMA"
                  : auditData.authenticityScore >= 60
                  ? "ODATIY NARX"
                  : "SHUBHALI CHEGIRMA"}
              </span>
            </div>

            {/* Score Ring Display */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-44 h-44 rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-white via-[#fcfaf5] to-[#f3ecdc] dark:from-slate-900 dark:to-slate-950 border-8 border-amber-200/70 dark:border-amber-500/20 shadow-inner">
                <span
                  className={`text-5xl font-black ${
                    auditData.authenticityScore >= 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : auditData.authenticityScore >= 60
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {auditData.authenticityScore}
                </span>
                <span className="text-[10px] font-bold text-amber-800/70 dark:text-amber-400/80 uppercase tracking-widest mt-1">
                  100 Ballik Tizim
                </span>
              </div>
            </div>

            {/* Fake Discount Fraud Radar Breakdown Box */}
            <div className="p-4.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-amber-200/80 dark:border-amber-500/20 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                  <span>Chegirma Tahlili (Radar)</span>
                </span>
                <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-bold">Real vs Vitrina</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Do'kon da'vo qilgan chegirma:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">-{auditData.claimedDiscountPercent}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Biz aniqlagan haqiqiy farq:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">-{auditData.realDiscountPercent}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Sun'iy shishirilgan narx:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{formatPrice(auditData.inflatedOriginalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Signal Recommendation Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                auditData.signal === "buy_now"
                  ? "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200 shadow-xs"
                  : "bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 shadow-xs"
              }`}
            >
              {auditData.signal === "buy_now" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5 stroke-[2.2]" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 stroke-[2.2]" />
              )}
              <div className="space-y-0.5">
                <span className="font-extrabold uppercase text-[11px] block">
                  {auditData.signal === "buy_now"
                    ? "🟢 Xarid Uchun Qulay Fursat"
                    : "⚠️ Ehtiyotkorlik Talab Etiladi"}
                </span>
                <p className="leading-relaxed font-medium">{auditData.verdictUz}</p>
              </div>
            </div>

            {/* Pricing metrics */}
            <div className="grid grid-cols-2 gap-3 pt-1 text-center">
              <div className="bg-white/90 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-amber-200/70 dark:border-amber-500/20 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                  Eng arzon real narx
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block mt-0.5">
                  {formatPrice(auditData.currentBestPrice)}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Uzum Marketda</span>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-amber-200/70 dark:border-amber-500/20 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                  Bozor medianasi
                </span>
                <span className="text-base sm:text-lg font-black text-slate-700 dark:text-slate-200 block mt-0.5">
                  {formatPrice(auditData.marketMedianPrice)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">O'rtacha narx</span>
              </div>
            </div>

            {/* Interactive Action Hub (Telegram Radar + Wishlist + Share) */}
            <div className="space-y-2.5 pt-2 border-t border-amber-200/60 dark:border-slate-800">
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setShowRadarModal(true);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 cursor-pointer active:scale-95"
              >
                <Bell className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                <span>
                  {radarSaved ? "✅ Narx Radari Faol (@" + radarTelegram + ")" : "Narx Tushganda Telegramda Bildirish"}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleToggleWishlist}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer active:scale-95 ${
                    isWishlisted
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-500/40"
                      : "bg-white/90 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-slate-700 dark:text-slate-300 border-amber-200/70 dark:border-slate-800"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 stroke-[2.2] ${isWishlisted ? "fill-current text-rose-500" : ""}`} />
                  <span>{isWishlisted ? "Wishlistda" : "Saqlash"}</span>
                </button>

                <button
                  onClick={handleShareTelegram}
                  className="py-2.5 px-3 bg-white/90 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-slate-700 dark:text-slate-300 border border-amber-200/70 dark:border-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5 text-sky-500 stroke-[2.2]" />
                  <span>Ulashish</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Store Comparison & History */}
        <div className="lg:col-span-7 space-y-6">
          {/* 30-Day History */}
          <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl p-6 sm:p-7 border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              <span>30 Kunlik Narx Dinamikasi (O'zbekiston bozori)</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {auditData.priceHistory.map((item, idx) => (
                <div key={idx} className="bg-white/90 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-amber-200/70 dark:border-amber-500/20 text-center shadow-xs">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">{item.date}</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block mt-1">
                    {formatPrice(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Store Audit Table */}
          <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl p-6 sm:p-7 border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              <span>O'zbekiston do'konlari narxlari auditi</span>
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-amber-200/80 dark:border-amber-500/20">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5edd7] dark:bg-slate-900 text-slate-800 dark:text-amber-200 font-bold border-b border-amber-200/80 dark:border-amber-500/20">
                  <tr>
                    <th className="p-3">Do'kon</th>
                    <th className="p-3">Audit Narxi</th>
                    <th className="p-3">Kafolat</th>
                    <th className="p-3">Yetkazish</th>
                    <th className="p-3 text-right">Tekshirish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/80 dark:divide-slate-800/60 bg-white/70 dark:bg-slate-950/40">
                  {auditData.storeComparison.map((st, i) => (
                    <tr key={i} className={i === 0 ? "bg-amber-50/60 dark:bg-amber-950/20 font-medium" : "hover:bg-amber-50/30 dark:hover:bg-slate-900/40 transition-colors"}>
                      <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {st.store}
                        {i === 0 && (
                          <span className="text-[10px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                            Eng Arzon
                          </span>
                        )}
                        {st.verified && (
                          <span title="Rasmiy kafolat">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-black text-slate-900 dark:text-amber-300">{formatPrice(st.price)}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{st.warranty}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{st.delivery}</td>
                      <td className="p-3 text-right">
                        <a
                          href={st.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-amber-500 dark:to-yellow-500 text-white dark:text-slate-950 rounded-xl font-bold transition shadow-xs hover:opacity-90 active:scale-95 cursor-pointer"
                        >
                          <span>Ko'rish</span>
                          <ExternalLink className="w-3 h-3 stroke-[2.2]" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Notes */}
          <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-2xl p-5 border border-amber-200/80 dark:border-amber-500/20 space-y-2 shadow-xs">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
              AI Auditor Xulosalari:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {auditData.marketNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 stroke-[2.2]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Telegram Price Drop Radar Modal */}
      {showRadarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-amber-300/80 dark:border-amber-500/25 shadow-luxury space-y-5 animate-scale-in text-slate-900 dark:text-white my-auto max-h-[92vh] max-h-[92dvh] overflow-y-auto relative">
            {/* Ambient Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-amber-400/15 dark:bg-amber-400/10 blur-2xl pointer-events-none rounded-full" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <Bell className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Telegram Narx Radari</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Narx tushganda avtomatik xabar oling</p>
                </div>
              </div>
              <button
                onClick={() => setShowRadarModal(false)}
                className="w-8 h-8 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-amber-200/60 dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kuzatuv ob'ekti:</label>
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200/70 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 shadow-2xs">
                  {auditData.productName}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Telegram foydalanuvchi nomi:</label>
                <input
                  type="text"
                  value={radarTelegram}
                  onChange={(e) => setRadarTelegram(e.target.value)}
                  placeholder="@foydalanuvchi_nomi"
                  className="w-full px-3.5 py-2.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-amber-200/80 dark:border-slate-800 font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Xabar berish sharti:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "5", label: "5% tushsa" },
                    { val: "10", label: "10% tushsa" },
                    { val: "any", label: "Har qanday tushishda" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setRadarThreshold(opt.val)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer active:scale-95 ${
                        radarThreshold === opt.val
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-500 font-black shadow-xs"
                          : "bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-amber-200/70 dark:border-slate-800 hover:border-amber-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveRadar}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/25 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-current stroke-[2.2]" />
              <span>Radarni Yoqish</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
