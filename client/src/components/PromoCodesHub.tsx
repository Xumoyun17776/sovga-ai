import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import {
  Ticket,
  Scissors,
  Check,
  MapPin,
  ExternalLink,
  Timer,
  Star,
  Sparkles,
  Gift,
  Share2,
  Copy,
  RotateCcw,
  Zap,
  Award,
  Flame,
  CheckCircle2,
  Lock,
  Clock,
} from "lucide-react";
import { useTranslation } from "../lib/i18n";
import { cyberSound } from "../lib/cyberSound";
import { promocodesApi, auth } from "../lib/api";
import { useToast } from "./Toast";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (1 spin per week)
const WHEEL_LAST_SPIN_KEY = "sovga_wheel_last_spin";

interface WheelPromoPrize {
  id: string;
  labelUz: string;
  labelRu: string;
  labelEn: string;
  code: string;
  discountUz: string;
  discountRu: string;
  discountEn: string;
  discount?: string;
  brand: string;
  descriptionUz: string;
  descriptionRu: string;
  descriptionEn: string;
  color: string;
  gradientId: string;
  accentColor: string;
  tagColor: string;
  expiresInUz: string;
  expiresInRu: string;
  expiresInEn: string;
}

const PROMO_WHEEL_SECTORS: WheelPromoPrize[] = [
  {
    id: "pw-1",
    labelUz: "-50,000 UZS",
    labelRu: "-50 000 UZS",
    labelEn: "-50,000 UZS",
    code: "SOVGA50K",
    discountUz: "50,000 UZS Chegirma",
    discountRu: "Скидка 50 000 UZS",
    discountEn: "50,000 UZS Voucher",
    brand: "Uzum Market",
    descriptionUz: "250,000 UZS dan yuqori barcha xaridlar uchun qo'shimcha vaucher.",
    descriptionRu: "Дополнительный ваучер на любые покупки от 250 000 UZS.",
    descriptionEn: "Extra shopping voucher on all orders above 250,000 UZS.",
    color: "#0d1b36", // Samarkand Royal Lapis
    gradientId: "grad-lapis-1",
    accentColor: "#fde68a",
    tagColor: "bg-blue-950/90 text-amber-300 border-amber-500/40",
    expiresInUz: "Bugun 23:59 gacha",
    expiresInRu: "Сегодня до 23:59",
    expiresInEn: "Expires 23:59 today",
  },
  {
    id: "pw-2",
    labelUz: "-15% Chegirma",
    labelRu: "-15% Скидка",
    labelEn: "-15% Off",
    code: "SUPER15",
    discountUz: "15% Chegirma",
    discountRu: "Скидка 15%",
    discountEn: "15% Discount",
    brand: "Texnomart",
    descriptionUz: "Kichik maishiy texnika va go'zallik gadjetlari uchun maxsus promo-kod.",
    descriptionRu: "Специальный промокод на малую бытовую технику и бьюти-гаджеты.",
    descriptionEn: "Special promo code for home appliances and personal care gadgets.",
    color: "#281c0e", // Antique Damascene Bronze
    gradientId: "grad-bronze-1",
    accentColor: "#fef08a",
    tagColor: "bg-amber-950/90 text-amber-300 border-amber-500/40",
    expiresInUz: "48 soat ichida faol",
    expiresInRu: "Действует 48 часов",
    expiresInEn: "Active for 48 hours",
  },
  {
    id: "pw-3",
    labelUz: "Bepul Yetkazish",
    labelRu: "Беспл. Доставка",
    labelEn: "Free Delivery",
    code: "BEPULPOST",
    discountUz: "100% Bepul Kuryer",
    discountRu: "100% Бесплатный курьер",
    discountEn: "100% Free Courier",
    brand: "MediaPark",
    descriptionUz: "Toshkent shahri va viloyatlar bo'ylab kuryerlik xizmati mutlaqo bepul.",
    descriptionRu: "Курьерская доставка по Ташкенту и регионам абсолютно бесплатно.",
    descriptionEn: "Complimentary doorstep courier delivery across Uzbekistan.",
    color: "#082720", // Imperial Jadeite Emerald
    gradientId: "grad-jade-1",
    accentColor: "#a7f3d0",
    tagColor: "bg-emerald-950/90 text-emerald-300 border-emerald-500/40",
    expiresInUz: "3 kun ichida faol",
    expiresInRu: "Действует 3 дня",
    expiresInEn: "Active for 3 days",
  },
  {
    id: "pw-4",
    labelUz: "-70,000 UZS",
    labelRu: "-70 000 UZS",
    labelEn: "-70,000 UZS",
    code: "VIPSOVGA70",
    discountUz: "70,000 UZS VIP Vaucher",
    discountRu: "VIP Ваучер 70 000 UZS",
    discountEn: "70,000 UZS VIP Voucher",
    brand: "Asaxiy",
    descriptionUz: "Kitoblar, texnika va aksessuarlar uchun bir martalik super vaucher.",
    descriptionRu: "Суперваучер на книги, электронику и аксессуары.",
    descriptionEn: "High-value super voucher for books, electronics and accessories.",
    color: "#2c0e1b", // Velvet Garnet / Royal Wine
    gradientId: "grad-garnet-1",
    accentColor: "#fbcfe8",
    tagColor: "bg-rose-950/90 text-rose-300 border-rose-500/40",
    expiresInUz: "24 soat ichida faol",
    expiresInRu: "Действует 24 часа",
    expiresInEn: "Active for 24 hours",
  },
  {
    id: "pw-5",
    labelUz: "+20% Keshbek",
    labelRu: "+20% Кэшбэк",
    labelEn: "+20% Cashback",
    code: "CASHBACK20",
    discountUz: "20% Keshbek",
    discountRu: "Кэшбэк 20%",
    discountEn: "20% Cashback",
    brand: "Payme / Click",
    descriptionUz: "Hamkor do'konlarda to'lov qilganda kartangizga qaytuvchi real keshbek.",
    descriptionRu: "Реальный кэшбэк на карту при оплате в магазинах-партнерах.",
    descriptionEn: "Instant cashback returning to your card at verified merchant partners.",
    color: "#102347", // Royal Ultramarine
    gradientId: "grad-lapis-2",
    accentColor: "#bae6fd",
    tagColor: "bg-sky-950/90 text-sky-300 border-sky-500/40",
    expiresInUz: "Bugun faol",
    expiresInRu: "Действует сегодня",
    expiresInEn: "Active today",
  },
  {
    id: "pw-6",
    labelUz: "-10% Gadjetlar",
    labelRu: "-10% Гаджеты",
    labelEn: "-10% Gadgets",
    code: "GADGET10",
    discountUz: "10% Chegirma",
    discountRu: "Скидка 10%",
    discountEn: "10% Discount",
    brand: "Idea Store",
    descriptionUz: "Barcha quloqchinlar va aqlli soatlar uchun chegirma kodi.",
    descriptionRu: "Промокод на все наушники и смарт-часы.",
    descriptionEn: "Direct discount promo code on headphones and smart wearables.",
    color: "#302210", // Florentine Gold
    gradientId: "grad-bronze-2",
    accentColor: "#fef08a",
    tagColor: "bg-amber-950/90 text-amber-300 border-amber-500/40",
    expiresInUz: "7 kun ichida faol",
    expiresInRu: "Действует 7 дней",
    expiresInEn: "Active for 7 days",
  },
  {
    id: "pw-7",
    labelUz: "Qahva Vaucheri",
    labelRu: "Кофе Ваучер",
    labelEn: "Coffee Voucher",
    code: "COFFEEVIP",
    discountUz: "Bepul Qahva / Desert",
    discountRu: "Бесплатный кофе / десерт",
    discountEn: "Free Coffee / Dessert",
    brand: "B&B Coffee House",
    descriptionUz: "Hamkor qahvaxonada 1 finjon bepul mualliflik qahvasi.",
    descriptionRu: "1 чашка авторского кофе бесплатно в сети кофеен-партнеров.",
    descriptionEn: "Complimentary signature coffee or pastry at partner coffee shops.",
    color: "#0a2d24", // Persian Malachite
    gradientId: "grad-jade-2",
    accentColor: "#6ee7b7",
    tagColor: "bg-emerald-950/90 text-emerald-300 border-emerald-500/40",
    expiresInUz: "Bugun 23:59 gacha",
    expiresInRu: "Сегодня до 23:59",
    expiresInEn: "Expires 23:59 today",
  },
  {
    id: "pw-8",
    labelUz: "Sirli Sovg'a",
    labelRu: "Таинств. Подарок",
    labelEn: "Mystery Gift",
    code: "MYSTERYACC",
    discountUz: "Sovg'a Qutisi Aksessuari",
    discountRu: "Аксессуар в подарок",
    discountEn: "Gift Box Accessory",
    brand: "Sovg'a AI",
    descriptionUz: "Har qanday buyurtmaga bepul xattotlik tabriknomasi va atlas lenta.",
    descriptionRu: "Бесплатная каллиграфическая открытка и атласная лента к заказу.",
    descriptionEn: "Complimentary handcrafted calligraphy dedication card & satin ribbon.",
    color: "#251127", // Imperial Sovereign Violet
    gradientId: "grad-garnet-2",
    accentColor: "#e9d5ff",
    tagColor: "bg-purple-950/90 text-purple-300 border-purple-500/40",
    expiresInUz: "Cheksiz",
    expiresInRu: "Бессрочно",
    expiresInEn: "Unlimited",
  },
];

function getWheelSlicePath(index: number, total: number, radius = 195, cx = 200, cy = 200) {
  const step = 360 / total;
  const a1 = (index * step - 90) * (Math.PI / 180);
  const a2 = ((index + 1) * step - 90) * (Math.PI / 180);
  const x1 = cx + radius * Math.cos(a1);
  const y1 = cy + radius * Math.sin(a1);
  const x2 = cx + radius * Math.cos(a2);
  const y2 = cy + radius * Math.sin(a2);
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

function getWheelLabelPos(index: number, total: number, radius = 135, cx = 200, cy = 200) {
  const step = 360 / total;
  const midDeg = (index + 0.5) * step;
  const midRad = (midDeg - 90) * (Math.PI / 180);
  const x = cx + radius * Math.cos(midRad);
  const y = cy + radius * Math.sin(midRad);
  return { x, y, rotation: midDeg };
}

function getBrandBadgeStyle(brand: string): string {
  const b = (brand || "").toLowerCase();
  if (b.includes("uzum")) {
    return "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800";
  }
  if (b.includes("texnomart")) {
    return "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800";
  }
  if (b.includes("mediapark")) {
    return "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800";
  }
  if (b.includes("asaxiy")) {
    return "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800";
  }
  if (b.includes("payme") || b.includes("click")) {
    return "bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800";
  }
  return "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800";
}

export default function PromoCodesHub() {
  const { language } = useTranslation();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"wheel" | "catalog" | "my_prizes">("wheel");
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: auth.me,
  });

  // Wheel state
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wheelWinner, setWheelWinner] = useState<WheelPromoPrize | null>(null);
  const [myPrizes, setMyPrizes] = useState<WheelPromoPrize[]>(() => {
    try {
      const saved = localStorage.getItem("sovga_won_promos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Helper to read last spin timestamp (user-scoped or global)
  const getLastSpinTimestamp = (): number => {
    try {
      const userKey = user?.id ? `${WHEEL_LAST_SPIN_KEY}_${user.id}` : null;
      const userVal = userKey ? localStorage.getItem(userKey) : null;
      const globalVal = localStorage.getItem(WHEEL_LAST_SPIN_KEY);
      const val = userVal || globalVal;
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  };

  // Remaining time in milliseconds until next spin (strictly 7 days / 1 per week)
  const [remainingMs, setRemainingMs] = useState<number>(() => {
    try {
      const globalVal = localStorage.getItem(WHEEL_LAST_SPIN_KEY);
      const last = globalVal ? parseInt(globalVal, 10) : 0;
      if (!last) return 0;
      const diff = ONE_WEEK_MS - (Date.now() - last);
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  });

  // Live countdown chronometer ticker
  useEffect(() => {
    const updateCooldown = () => {
      const last = getLastSpinTimestamp();
      if (!last) {
        setRemainingMs(0);
        return;
      }
      const diff = ONE_WEEK_MS - (Date.now() - last);
      setRemainingMs(diff > 0 ? diff : 0);
    };
    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const canSpin = remainingMs <= 0;
  const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  // Admin test bypass (only for owner oriftilavkulov@gmail.com)
  const handleAdminResetSpin = () => {
    try {
      localStorage.removeItem(WHEEL_LAST_SPIN_KEY);
      if (user?.id) {
        localStorage.removeItem(`${WHEEL_LAST_SPIN_KEY}_${user.id}`);
      }
      setRemainingMs(0);
      cyberSound.playConfirm();
      toast.success(
        language === "uz" ? "Admin: Baraban haftalik taymeri nollashtirildi!" : "Admin: Weekly spin timer reset!"
      );
    } catch {}
  };

  const { data: promoCodes = [] } = useQuery({
    queryKey: ["promocodes"],
    queryFn: () => promocodesApi.getCodes(),
  });

  const copyCode = (id: string | number, code: string) => {
    cyberSound.playClick();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Promokod nusxalandi!", code);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSpinWheel = () => {
    if (spinning) return;

    if (!canSpin) {
      cyberSound.playError();
      toast.error(
        language === "uz"
          ? `Haftalik limit: Siz bu hafta barabanni aylantirgansiz. Keyingi imkoniyat: ${remainingDays} kun ${remainingHours} soatdan so'ng.`
          : language === "ru"
          ? `Еженедельный лимит: Вы уже крутили колесо. Следующая попытка через ${remainingDays} дн. ${remainingHours} ч.`
          : `Weekly limit: You've already used your spin. Next spin in ${remainingDays}d ${remainingHours}h.`
      );
      return;
    }

    setSpinning(true);
    setWheelWinner(null);
    cyberSound.playConfirm();

    // Pick random winning index
    const sectorCount = PROMO_WHEEL_SECTORS.length;
    const winningIdx = Math.floor(Math.random() * sectorCount);
    const sectorAngle = 360 / sectorCount;

    // Needle pointer is at 12 o'clock (0 degrees / top center)
    // Sector center is at (winningIdx + 0.5) * sectorAngle
    // To align sector center under needle (0 deg), rotation angle modulo 360 must be (360 - sectorCenter)
    const targetSectorCenter = (winningIdx + 0.5) * sectorAngle;
    const targetNormalized = (360 - (targetSectorCenter % 360)) % 360;

    // Spin forward 5 full revolutions (1800 deg) plus exact target alignment
    const currentRevolutions = Math.floor(rotation / 360);
    const newTargetRotation = (currentRevolutions + 5) * 360 + targetNormalized;

    setRotation(newTargetRotation);

    // Audio click ticks while spinning
    const interval = setInterval(() => {
      cyberSound.playClick();
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setSpinning(false);
      const prize = PROMO_WHEEL_SECTORS[winningIdx];
      setWheelWinner(prize);

      // Save to won prizes
      const updatedPrizes = [prize, ...myPrizes.filter((p) => p.code !== prize.code)];
      setMyPrizes(updatedPrizes);
      try {
        localStorage.setItem("sovga_won_promos", JSON.stringify(updatedPrizes));
      } catch {}

      // Save weekly spin timestamp (7-day cooldown lock)
      const now = Date.now();
      try {
        localStorage.setItem(WHEEL_LAST_SPIN_KEY, String(now));
        if (user?.id) {
          localStorage.setItem(`${WHEEL_LAST_SPIN_KEY}_${user.id}`, String(now));
        }
      } catch {}
      setRemainingMs(ONE_WEEK_MS);

      // Fire confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#fbbf24", "#f59e0b", "#10b981", "#6366f1"],
      });

      cyberSound.play("success");
      const prizeDiscount = language === "uz" ? prize.discountUz : language === "ru" ? prize.discountRu : prize.discountEn;
      toast.success(
        language === "uz"
          ? `Tabriklaymiz! Siz "${prizeDiscount}" yutib oldingiz!`
          : language === "ru"
          ? `Поздравляем! Вы выиграли "${prizeDiscount}"!`
          : `Congratulations! You won "${prizeDiscount}"!`,
        prize.code
      );
    }, 4200);
  };

  return (
    <div className="bg-gradient-to-b from-[#faf9f5] via-[#f7f3ea] to-[#faf8f4] dark:from-[#10121d] dark:to-[#0b0c10] py-16 border-y border-amber-200/50 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full luxury-gold-chip text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {language === "uz"
                  ? "Eksklyuziv Aksiyalar & Omad Barabani"
                  : language === "ru"
                  ? "Колесо Удачи и Промокоды"
                  : "Lucky Promo Wheel & Deals"}
              </span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
              {language === "uz"
                ? "Aksiyalar & Omad Barabani"
                : language === "ru"
                ? "Колесо Фортуны и Промокоды"
                : "Promotions & Fortune Wheel"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl font-medium">
              {language === "uz"
                ? "Barabanni har hafta 1 marta bepul aylantirib, Uzum, Texnomart va MediaPark uchun 70,000 UZS gacha promokodlar va keshbeklarni yutib oling."
                : language === "ru"
                ? "Крутите барабан удачи бесплатно 1 раз в неделю и выигрывайте промокоды до 70 000 сум и кэшбэк."
                : "Spin the fortune wheel once a week to claim instant vouchers, cashback codes, and free delivery."}
            </p>
          </div>

          {/* Navigation Mode Tabs */}
          <div className="flex items-center gap-1.5 bg-amber-100/70 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-amber-300/60 dark:border-slate-800 shadow-inner self-start md:self-auto backdrop-blur-xs">
            <button
              onClick={() => {
                cyberSound.playClick();
                setActiveTab("wheel");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === "wheel"
                  ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md shadow-amber-500/25"
                  : "text-amber-950/80 dark:text-slate-400 hover:text-amber-950 dark:hover:text-white hover:bg-amber-200/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span>{language === "uz" ? "🎡 Omad Barabani" : language === "ru" ? "🎡 Колесо Удачи" : "🎡 Fortune Wheel"}</span>
            </button>

            <button
              onClick={() => {
                cyberSound.playClick();
                setActiveTab("catalog");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === "catalog"
                  ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md shadow-amber-500/25"
                  : "text-amber-950/80 dark:text-slate-400 hover:text-amber-950 dark:hover:text-white hover:bg-amber-200/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span>{language === "uz" ? "🎟️ Barcha Kodlar" : language === "ru" ? "🎟️ Все Промокоды" : "🎟️ All Promo Codes"}</span>
            </button>

            {myPrizes.length > 0 && (
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setActiveTab("my_prizes");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  activeTab === "my_prizes"
                    ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md shadow-amber-500/25"
                    : "text-amber-950/80 dark:text-slate-400 hover:text-amber-950 dark:hover:text-white hover:bg-amber-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 stroke-[2.2]" />
                <span>
                  {language === "uz"
                    ? `Yutuqlarim (${myPrizes.length})`
                    : language === "ru"
                    ? `Мои Призы (${myPrizes.length})`
                    : `My Prizes (${myPrizes.length})`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ─── TAB 1: THE LUCKY PROMO WHEEL (BARABAN) ─────────────────── */}
        {activeTab === "wheel" && (
          <div className="card-luxury bg-gradient-to-b from-white via-[#fcfaf4] to-[#f7f2e4] dark:from-[#12141e] dark:to-[#0a0c14] rounded-3xl p-6 sm:p-10 border-2 border-amber-300/60 dark:border-slate-800 shadow-xl space-y-8 animate-fade-in text-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/20 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-400/15 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-md mx-auto space-y-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-500 dark:text-amber-400">
                {language === "uz"
                  ? "★ HAFTALIK OMAD BARABANI (HAFTADA 1 MARTA) ★"
                  : language === "ru"
                  ? "★ ЕЖЕНЕДЕЛЬНОЕ КОЛЕСО УДАЧИ (1 РАЗ В НЕДЕЛЮ) ★"
                  : "★ WEEKLY FORTUNE WHEEL (1 SPIN PER WEEK) ★"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {language === "uz"
                  ? "Aksiyalar Omad Barabani"
                  : language === "ru"
                  ? "Колесо Удачи и Промокодов"
                  : "Promotions & Fortune Wheel"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === "uz"
                  ? "Har bir foydalanuvchiga haftada 1 marta bepul imkoniyat beriladi. Markaziy tugmani bosing va barabanni aylantiring!"
                  : language === "ru"
                  ? "Каждому пользователю дается 1 бесплатная попытка в неделю. Нажмите центральную кнопку и испытайте удачу!"
                  : "1 complimentary spin per week for every shopper. Tap the center button to win genuine discount vouchers!"}
              </p>
            </div>

            {/* Live Weekly Cooldown Chronometer or Ready Status */}
            {remainingMs > 0 ? (
              <div className="bg-gradient-to-br from-[#ffffff] via-[#fbf7ed] to-[#f4eedb] dark:from-[#0b0e17]/95 dark:to-[#070910]/95 border-2 border-amber-300/70 dark:border-[#d4af37]/35 rounded-3xl p-5 max-w-lg mx-auto shadow-xl dark:shadow-2xl backdrop-blur-md relative overflow-hidden">
                {/* Subtle radial metallic warm highlight */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between text-xs mb-3 relative z-10">
                  <span className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-black uppercase tracking-wider">
                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>
                      {language === "uz"
                        ? "Haftalik limit faol (1 marta/hafta)"
                        : language === "ru"
                        ? "Еженедельный лимит (1 раз/нед.)"
                        : "Weekly limit active (1 spin/week)"}
                    </span>
                  </span>
                  <span className="text-[11px] text-amber-800/80 dark:text-amber-200/70 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>
                      {language === "uz" ? "Keyingi imkoniyat:" : language === "ru" ? "Следующий спин:" : "Next spin in:"}
                    </span>
                  </span>
                </div>

                {/* 4 Horological Precision Tumbler Digit Blocks */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 text-center relative z-10">
                  <div className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f6eedd] dark:from-[#181d2c] dark:to-[#0a0d16] rounded-2xl p-1.5 sm:p-2.5 border border-amber-300/80 dark:border-[#d4af37]/25 shadow-xs dark:shadow-inner">
                    <span className="block font-mono text-xl sm:text-3xl font-black bg-gradient-to-b from-amber-950 via-amber-800 to-amber-700 dark:from-[#fff3b8] dark:to-[#c59a3f] bg-clip-text text-transparent">
                      {remainingDays}
                    </span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-amber-900/80 dark:text-amber-200/75 font-black">
                      {language === "uz" ? "Kun" : language === "ru" ? "Дней" : "Days"}
                    </span>
                  </div>
                  <div className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f6eedd] dark:from-[#181d2c] dark:to-[#0a0d16] rounded-2xl p-1.5 sm:p-2.5 border border-amber-300/80 dark:border-[#d4af37]/25 shadow-xs dark:shadow-inner">
                    <span className="block font-mono text-xl sm:text-3xl font-black bg-gradient-to-b from-amber-950 via-amber-800 to-amber-700 dark:from-[#fff3b8] dark:to-[#c59a3f] bg-clip-text text-transparent">
                      {String(remainingHours).padStart(2, "0")}
                    </span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-amber-900/80 dark:text-amber-200/75 font-black">
                      {language === "uz" ? "Soat" : language === "ru" ? "Часов" : "Hours"}
                    </span>
                  </div>
                  <div className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f6eedd] dark:from-[#181d2c] dark:to-[#0a0d16] rounded-2xl p-1.5 sm:p-2.5 border border-amber-300/80 dark:border-[#d4af37]/25 shadow-xs dark:shadow-inner">
                    <span className="block font-mono text-xl sm:text-3xl font-black bg-gradient-to-b from-amber-950 via-amber-800 to-amber-700 dark:from-[#fff3b8] dark:to-[#c59a3f] bg-clip-text text-transparent">
                      {String(remainingMinutes).padStart(2, "0")}
                    </span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-amber-900/80 dark:text-amber-200/75 font-black">
                      {language === "uz" ? "Daqiqa" : language === "ru" ? "Мин" : "Mins"}
                    </span>
                  </div>
                  <div className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f6eedd] dark:from-[#181d2c] dark:to-[#0a0d16] rounded-2xl p-1.5 sm:p-2.5 border border-amber-300/80 dark:border-[#d4af37]/25 shadow-xs dark:shadow-inner">
                    <span className="block font-mono text-xl sm:text-3xl font-black bg-gradient-to-b from-amber-950 via-amber-800 to-amber-700 dark:from-[#fff3b8] dark:to-[#c59a3f] bg-clip-text text-transparent">
                      {String(remainingSeconds).padStart(2, "0")}
                    </span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-amber-900/80 dark:text-amber-200/75 font-black">
                      {language === "uz" ? "Soniya" : language === "ru" ? "Сек" : "Secs"}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-3 text-center relative z-10 font-medium">
                  {language === "uz"
                    ? "Baraban har 7 kunda 1 marta bepul aylantirishga ochiladi. Yutuqlaringiz 'Yutuqlarim' bo'limida saqlanadi."
                    : language === "ru"
                    ? "Барабан доступен бесплатно 1 раз в 7 дней. Ваши выигранные призы сохранены во вкладке 'Мои Призы'."
                    : "The wheel unlocks once every 7 days. Your won vouchers remain safely in 'My Prizes'."}
                </p>

                {user?.email === "oriftilavkulov@gmail.com" && (
                  <div className="mt-3 pt-2.5 border-t border-amber-200 dark:border-slate-800/80 text-center relative z-10">
                    <button
                      onClick={handleAdminResetSpin}
                      className="text-[10px] text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 underline font-mono cursor-pointer font-bold"
                    >
                      [Admin Test: 7 kunlik taymerni nollashtirish (Reset Spin)]
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/15 via-gold-500/20 to-emerald-500/15 border border-emerald-500/35 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider animate-pulse shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>
                  {language === "uz"
                    ? "✨ Haftalik bepul imkoniyatingiz mavjud! Markaziy toj tugmasini bosing."
                    : language === "ru"
                    ? "✨ Ваша еженедельная бесплатная попытка доступна! Жмите кнопку."
                    : "✨ Your weekly free spin is available! Tap the center crown."}
                </span>
              </div>
            )}

            {/* The Precision Horology Astrolabe Wheel Canvas Wrapper */}
            <div className="relative w-[min(300px,calc(100vw-3.5rem))] h-[min(300px,calc(100vw-3.5rem))] sm:w-[380px] sm:h-[380px] aspect-square mx-auto flex items-center justify-center py-4 select-none shrink-0">
              {/* Outer Fluted Gold Coin-Edge Ring */}
              <div className="absolute inset-0 rounded-full horology-outer-brass p-[5px] sm:p-[7px] shadow-[0_25px_70px_-10px_rgba(0,0,0,0.85)]">
                {/* Secondary Beveled Dark Steel Casing */}
                <div className="w-full h-full rounded-full bg-[#0a0c14] p-[3px] border border-[#d4af37]/40 shadow-inner relative overflow-hidden">
                  
                  {/* Rotating Wheel Disc */}
                  <div
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: spinning
                        ? "transform 4.2s cubic-bezier(0.12, 0.8, 0.2, 1)"
                        : "none",
                    }}
                    className="w-full h-full rounded-full relative"
                  >
                    <svg viewBox="0 0 400 400" className="w-full h-full">
                      <defs>
                        {/* Drop shadow filters */}
                        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.5" />
                        </filter>
                        <filter id="textEmboss" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.9" />
                        </filter>

                        {/* Sector Radial Gradients */}
                        <radialGradient id="grad-lapis-1" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#1e345e" />
                          <stop offset="65%" stopColor="#0e1a38" />
                          <stop offset="100%" stopColor="#070e1f" />
                        </radialGradient>
                        <radialGradient id="grad-bronze-1" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#3d2c17" />
                          <stop offset="65%" stopColor="#281c0e" />
                          <stop offset="100%" stopColor="#140d06" />
                        </radialGradient>
                        <radialGradient id="grad-jade-1" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#124036" />
                          <stop offset="65%" stopColor="#082720" />
                          <stop offset="100%" stopColor="#031410" />
                        </radialGradient>
                        <radialGradient id="grad-garnet-1" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#441628" />
                          <stop offset="65%" stopColor="#2c0e1b" />
                          <stop offset="100%" stopColor="#14050b" />
                        </radialGradient>
                        <radialGradient id="grad-lapis-2" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#243d6b" />
                          <stop offset="65%" stopColor="#102347" />
                          <stop offset="100%" stopColor="#08142b" />
                        </radialGradient>
                        <radialGradient id="grad-bronze-2" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#48341b" />
                          <stop offset="65%" stopColor="#302210" />
                          <stop offset="100%" stopColor="#181107" />
                        </radialGradient>
                        <radialGradient id="grad-jade-2" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#15493e" />
                          <stop offset="65%" stopColor="#0a2d24" />
                          <stop offset="100%" stopColor="#041712" />
                        </radialGradient>
                        <radialGradient id="grad-garnet-2" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#3d183f" />
                          <stop offset="65%" stopColor="#251127" />
                          <stop offset="100%" stopColor="#130714" />
                        </radialGradient>

                        {/* Gold Inlay Spoke Gradient */}
                        <linearGradient id="goldRib" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="50%" stopColor="#c59a3f" />
                          <stop offset="100%" stopColor="#785315" />
                        </linearGradient>
                      </defs>

                      {/* 8 Luxurious Horology Slices */}
                      {PROMO_WHEEL_SECTORS.map((sector, idx) => {
                        const path = getWheelSlicePath(idx, PROMO_WHEEL_SECTORS.length);
                        const { x, y, rotation: textRot } = getWheelLabelPos(idx, PROMO_WHEEL_SECTORS.length, 126);
                        const { x: subX, y: subY } = getWheelLabelPos(idx, PROMO_WHEEL_SECTORS.length, 164);
                        const sectorLabel = language === "uz" ? sector.labelUz : language === "ru" ? sector.labelRu : sector.labelEn;
                        return (
                          <g key={sector.id}>
                            {/* Gradient Slice with subtle gold inlay seam */}
                            <path
                              d={path}
                              fill={`url(#${sector.gradientId})`}
                              stroke="url(#goldRib)"
                              strokeWidth="1.8"
                            />

                            {/* Outer Brand Micro Stamp */}
                            <text
                              x={subX}
                              y={subY}
                              fill="#94a3b8"
                              fontSize="8"
                              fontWeight="700"
                              textAnchor="middle"
                              dominantBaseline="central"
                              transform={`rotate(${textRot}, ${subX}, ${subY})`}
                              style={{ letterSpacing: "0.08em" }}
                              opacity="0.9"
                            >
                              {sector.brand.toUpperCase()}
                            </text>

                            {/* Main Value Inscription with Gold Emboss */}
                            <text
                              x={x}
                              y={y}
                              fill={sector.accentColor}
                              fontSize="12.5"
                              fontWeight="900"
                              textAnchor="middle"
                              dominantBaseline="central"
                              transform={`rotate(${textRot}, ${x}, ${y})`}
                              filter="url(#textEmboss)"
                              style={{ letterSpacing: "-0.01em" }}
                            >
                              {sectorLabel}
                            </text>
                          </g>
                        );
                      })}

                      {/* Etched Horological Concentric Rings */}
                      <circle cx="200" cy="200" r="184" fill="none" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.5" />
                      <circle cx="200" cy="200" r="148" fill="none" stroke="#d4af37" strokeWidth="0.75" strokeDasharray="3 3" strokeOpacity="0.4" />
                      <circle cx="200" cy="200" r="82" fill="none" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.5" />

                      {/* 48 Horological Minute / Calibration Bezel Ticks */}
                      {Array.from({ length: 48 }).map((_, tIdx) => {
                        const isMajor = tIdx % 6 === 0;
                        const tAngle = (tIdx * (360 / 48) - 90) * (Math.PI / 180);
                        const rIn = isMajor ? 186 : 190;
                        const rOut = 194;
                        const x1 = 200 + rIn * Math.cos(tAngle);
                        const y1 = 200 + rIn * Math.sin(tAngle);
                        const x2 = 200 + rOut * Math.cos(tAngle);
                        const y2 = 200 + rOut * Math.sin(tAngle);
                        return (
                          <line
                            key={`tick-${tIdx}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={isMajor ? "#ffd983" : "#8f6d19"}
                            strokeWidth={isMajor ? "1.8" : "1"}
                            strokeOpacity={isMajor ? "0.9" : "0.55"}
                          />
                        );
                      })}

                      {/* 16 Faceted Gem-Set Studs / Watch Screws with Specular Glints */}
                      {Array.from({ length: 16 }).map((_, rIdx) => {
                        const rAngle = (rIdx * (360 / 16) - 90) * (Math.PI / 180);
                        const rx = 200 + 194 * Math.cos(rAngle);
                        const ry = 200 + 194 * Math.sin(rAngle);
                        return (
                          <g key={`rivet-${rIdx}`}>
                            <circle cx={rx} cy={ry} r="3.5" fill="#5c4415" />
                            <circle cx={rx} cy={ry} r="2.8" fill="url(#goldRib)" />
                            <circle cx={rx - 0.7} cy={ry - 0.7} r="1" fill="#ffffff" fillOpacity="0.9" />
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Curved Sapphire Glass Dome Optical Reflection */}
                  <div className="horology-glass-dome" />
                </div>
              </div>

              {/* Handcrafted 3D Guilloché Spearhead Watch Hand Needle */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-[0_8px_14px_rgba(0,0,0,0.8)]">
                <svg width="32" height="48" viewBox="0 0 32 48" fill="none">
                  {/* Left Facet (Direct Light Reflection) */}
                  <polygon points="16,46 16,6 4,20 10,32" fill="#ffd983" />
                  {/* Right Facet (Deep Chased Shadow) */}
                  <polygon points="16,46 16,6 28,20 22,32" fill="#997321" />
                  {/* Razor Spine Ridge */}
                  <line x1="16" y1="6" x2="16" y2="46" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.8" />
                  {/* Ruby Cabochon Pivot Mount */}
                  <circle cx="16" cy="14" r="5.5" fill="#881337" stroke="#fbbf24" strokeWidth="1.5" />
                  <circle cx="16" cy="14" r="3" fill="#be123c" />
                  <circle cx="14.5" cy="12.5" r="1.2" fill="#ffffff" fillOpacity="0.85" />
                </svg>
              </div>

              {/* Center Hub: Machined Swiss Chronometer Crown & Spin Trigger */}
              <button
                onClick={() => {
                  if (!canSpin) {
                    cyberSound.playError();
                    toast.error(
                      language === "uz"
                        ? `Haftalik limit: Keyingi bepul aylantirishga ${remainingDays} kun ${remainingHours} soat qoldi.`
                        : language === "ru"
                        ? `Еженедельный лимит: Следующий спин через ${remainingDays} дн. ${remainingHours} ч.`
                        : `Weekly limit: Next spin in ${remainingDays}d ${remainingHours}h.`
                    );
                    return;
                  }
                  handleSpinWheel();
                }}
                disabled={spinning}
                className={`absolute z-30 w-22 h-22 sm:w-26 sm:h-26 rounded-full flex flex-col items-center justify-center shadow-2xl transition transform ${
                  spinning
                    ? "bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 scale-95 opacity-90 cursor-wait border-4 border-amber-300"
                    : canSpin
                    ? "bg-gradient-to-br from-[#ffd983] via-[#c59a3f] to-[#785315] text-slate-950 hover:scale-105 active:scale-95 cursor-pointer border-4 border-[#fff2b2] shadow-[0_0_30px_rgba(212,175,55,0.45)]"
                    : "bg-gradient-to-br from-[#1e2333] to-[#0e111a] text-amber-200/60 border-4 border-[#333b52] opacity-90 cursor-not-allowed hover:border-amber-500/40"
                }`}
                title={
                  !canSpin
                    ? language === "uz"
                      ? `Haftalik limit: ${remainingDays} kun ${remainingHours} soat qoldi`
                      : language === "ru"
                      ? `Лимит 1 раз в неделю: осталось ${remainingDays} дн.`
                      : `Weekly limit: ${remainingDays}d left`
                    : undefined
                }
              >
                {/* Lathe-turned concentric ring texture inside button */}
                <div className="absolute inset-1 rounded-full border border-black/20 pointer-events-none" />
                <div className="absolute inset-2.5 rounded-full border border-white/25 pointer-events-none" />

                {spinning ? (
                  <>
                    <Sparkles className="w-5 h-5 text-slate-950 animate-spin" />
                    <span className="leading-tight mt-1 font-black text-[10px] sm:text-xs tracking-wider">
                      ...
                    </span>
                  </>
                ) : canSpin ? (
                  <>
                    <Award className="w-5 h-5 text-slate-950 drop-shadow-xs" />
                    <span className="leading-tight mt-0.5 font-black text-[11px] sm:text-xs uppercase tracking-wider text-slate-950 drop-shadow-xs">
                      {language === "uz" ? "AYLANTIR" : language === "ru" ? "КРУТИТЬ" : "SPIN"}
                    </span>
                    <span className="text-[8px] font-bold text-slate-900/80 uppercase tracking-widest -mt-0.5">
                      1x BEPUL
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400 mb-0.5" />
                    <span className="leading-tight text-[10px] font-black uppercase text-amber-300 tracking-wider">
                      {language === "uz" ? "KUTING" : language === "ru" ? "ЖДИТЕ" : "WAIT"}
                    </span>
                    <span className="text-[9px] text-amber-400/90 font-mono font-bold">
                      {remainingDays > 0 ? `${remainingDays}d` : `${remainingHours}h`}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Winner Showcase Card — Imperial Embossed Certificate Look */}
            {wheelWinner && (
              <div className="max-w-md mx-auto bg-gradient-to-b from-white via-[#fcfaf5] to-[#f4eedb] dark:from-[#131622] dark:to-[#0c0d16] text-slate-900 dark:text-white rounded-3xl p-6 border-2 border-amber-300 dark:border-[#d4af37]/60 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-left animate-slide-up space-y-4 relative overflow-hidden">
                {/* Gold Foil Corner Accents */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-400/25 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-amber-400/25 to-transparent pointer-events-none" />

                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/15 to-gold-500/25 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-gold-500/40 flex items-center gap-1.5 shadow-xs">
                    <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>
                      {language === "uz"
                        ? "Yutuq Natijasi"
                        : language === "ru"
                        ? "Результат Розыгрыша"
                        : "Prize Won"}
                    </span>
                  </span>
                  <span className="text-[11px] text-amber-800/80 dark:text-amber-200/70 font-mono font-bold">
                    {language === "uz"
                      ? wheelWinner.expiresInUz
                      : language === "ru"
                      ? wheelWinner.expiresInRu
                      : wheelWinner.expiresInEn}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-black tracking-wider uppercase">{wheelWinner.brand}</span>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-0.5">
                    {language === "uz"
                      ? wheelWinner.discountUz
                      : language === "ru"
                      ? wheelWinner.discountRu
                      : wheelWinner.discountEn}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                    {language === "uz"
                      ? wheelWinner.descriptionUz
                      : language === "ru"
                      ? wheelWinner.descriptionRu
                      : wheelWinner.descriptionEn}
                  </p>
                </div>

                {/* Copiable Code Box */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-amber-100/70 dark:bg-[#06070a] p-3 rounded-2xl border-2 border-amber-300 dark:border-[#d4af37]/40 font-mono font-black text-base text-amber-950 dark:text-amber-300 tracking-wider text-center shadow-inner">
                    {wheelWinner.code}
                  </div>
                  <button
                    onClick={() => copyCode(wheelWinner.id, wheelWinner.code)}
                    className="px-4 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 dark:from-[#ffd983] dark:via-[#c59a3f] dark:to-[#b38328] hover:brightness-105 text-white dark:text-slate-950 font-black rounded-2xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md active:scale-95"
                  >
                    {copiedId === wheelWinner.id ? <Check className="w-4 h-4 stroke-[2.2]" /> : <Copy className="w-4 h-4 stroke-[2.2]" />}
                    <span>
                      {copiedId === wheelWinner.id
                        ? language === "uz"
                          ? "Nusxalandi!"
                          : language === "ru"
                          ? "Скопировано!"
                          : "Copied!"
                        : language === "uz"
                        ? "Nusxalash"
                        : language === "ru"
                        ? "Копировать"
                        : "Copy"}
                    </span>
                  </button>
                </div>

                {/* 7-day cooldown confirmation note */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-100/80 dark:bg-amber-500/10 border border-amber-300/80 dark:border-amber-500/25 text-[11px] text-amber-950 dark:text-amber-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 stroke-[2.2]" />
                  <span>
                    {language === "uz"
                      ? "Keyingi bepul aylantirish: 7 kundan keyin ochiladi. Yutuq promokodingiz saqlandi!"
                      : language === "ru"
                      ? "Следующая попытка откроется через 7 дней. Ваш выигрыш сохранен!"
                      : "Next free spin unlocks in 7 days. Your voucher is saved in 'My Prizes'!"}
                  </span>
                </div>

                {/* Telegram Share */}
                <div className="pt-2 flex items-center justify-between border-t border-amber-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {language === "uz"
                      ? "Yutuqni do'stlarga yuborish:"
                      : language === "ru"
                      ? "Поделиться выигрышем:"
                      : "Share prize with friends:"}
                  </span>
                  <button
                    onClick={() => {
                      const winnerDiscount =
                        language === "uz"
                          ? wheelWinner.discountUz
                          : language === "ru"
                          ? wheelWinner.discountRu
                          : wheelWinner.discountEn;
                      const text =
                        language === "uz"
                          ? `🎁 Men Sovg'a AI Barabanini aylantirib, ${wheelWinner.brand} uchun "${winnerDiscount}" (${wheelWinner.code}) yutib oldim! Siz ham omadingizni sinab ko'ring:`
                          : language === "ru"
                          ? `🎁 Я прокрутил Колесо Фортуны Sovg'a AI и выиграл "${winnerDiscount}" для ${wheelWinner.brand} (${wheelWinner.code})! Испытайте свою удачу:`
                          : `🎁 I spun the Sovg'a AI Fortune Wheel and won "${winnerDiscount}" for ${wheelWinner.brand} (${wheelWinner.code})! Try your luck now:`;
                      const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
                      window.open(url, "_blank");
                    }}
                    className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>
                      {language === "uz"
                        ? "Telegramda ulashish"
                        : language === "ru"
                        ? "Поделиться в Telegram"
                        : "Share via Telegram"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: PROMOCODES DIRECT CATALOG ───────────────────────── */}
        {activeTab === "catalog" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">
            {promoCodes.map((promo: any) => (
              <div
                key={promo.id}
                className="voucher-ticket-edge bg-gradient-to-b from-white via-[#faf8f4] to-[#f5eee0] dark:from-[#131622] dark:via-[#10131d] dark:to-[#0a0c13] rounded-3xl p-5 border border-amber-200/90 dark:border-slate-800/80 shadow-md hover:shadow-xl hover:border-gold-500/60 transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3.5">
                    <div className={`px-3 py-1 rounded-xl text-xs font-black tracking-wide uppercase border shadow-2xs ${getBrandBadgeStyle(promo.brand)}`}>
                      {promo.brand}
                    </div>
                    {promo.type === "offline" ? (
                      <span className="w-8 h-8 rounded-xl icon-medallion icon-box-gold flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 stroke-[2.2]" />
                      </span>
                    ) : (
                      <span className="w-8 h-8 rounded-xl icon-medallion icon-box-indigo flex items-center justify-center shrink-0">
                        <ExternalLink className="w-4 h-4 stroke-[2.2]" />
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black bg-gradient-to-r from-amber-700 via-orange-600 to-rose-600 dark:from-white dark:via-amber-200 dark:to-amber-400 bg-clip-text text-transparent mb-1.5">
                    {promo.discount}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-4 min-h-[34px]">
                    {promo.description}
                  </p>
                </div>

                {/* Perforated dashed divider */}
                <div className="border-t border-dashed border-amber-200/80 dark:border-slate-800 my-2" />

                <div className="mt-auto pt-1">
                  {promo.type === "online" ? (
                    <button
                      onClick={() => copyCode(promo.id, promo.code)}
                      className="w-full relative flex items-center justify-between border border-dashed border-amber-400/80 hover:border-amber-600 bg-amber-100/60 hover:bg-amber-100 dark:bg-amber-950/20 p-2.5 rounded-2xl cursor-pointer transition group/btn shadow-2xs active:scale-95"
                    >
                      <span className="font-mono font-black text-xs sm:text-sm text-amber-950 dark:text-amber-300 tracking-wider">
                        {copiedId === promo.id
                          ? language === "uz"
                            ? "NUSXALANDI!"
                            : language === "ru"
                            ? "СКОПИРОВАНО!"
                            : "COPIED!"
                          : promo.code}
                      </span>
                      {copiedId === promo.id ? (
                        <Check className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
                      ) : (
                        <Scissors className="w-4 h-4 text-amber-700 dark:text-amber-400 group-hover/btn:rotate-12 transition transform stroke-[2.2]" />
                      )}
                    </button>
                  ) : (
                    <button className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-gold-600 hover:brightness-105 text-white font-black text-xs py-2.5 rounded-2xl shadow-sm transition cursor-pointer flex justify-center items-center gap-1.5 active:scale-95">
                      {language === "uz"
                        ? "QR Kodni Ko'rsatish"
                        : language === "ru"
                        ? "Показать QR-код"
                        : "Show QR Code"}
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-amber-800/80 dark:text-slate-400 justify-center">
                    <Timer className="w-3 h-3 text-amber-600 dark:text-amber-500 stroke-[2.2]" />
                    <span>{promo.expiresIn}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── TAB 3: MY WON PRIZES ────────────────────────────────────── */}
        {activeTab === "my_prizes" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-gradient-to-b from-white via-[#faf8f4] to-[#f4eedb] dark:from-[#0e111a] dark:to-[#090b12] rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 dark:border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl icon-medallion icon-box-gold flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span>
                    {language === "uz"
                      ? `Barabanda Yutib Olingan Kodlaringiz (${myPrizes.length})`
                      : language === "ru"
                      ? `Выигранные Промокоды (${myPrizes.length})`
                      : `Your Won Promo Vouchers (${myPrizes.length})`}
                  </span>
                </h3>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                  {language === "uz" ? "Doimiy saqlanadi" : language === "ru" ? "Сохранено навсегда" : "Saved permanently"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {myPrizes.map((p) => (
                  <div
                    key={p.code}
                    className="voucher-ticket-edge p-5 rounded-2xl bg-gradient-to-b from-white to-[#faf7f0] dark:from-[#131622] dark:to-[#0d0f17] border border-amber-300/70 dark:border-slate-800/90 shadow-sm space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider border shadow-2xs ${getBrandBadgeStyle(p.brand)}`}>{p.brand}</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">
                        {language === "uz" ? "Faol" : language === "ru" ? "Активен" : "Active"}
                      </span>
                    </div>
                    <span className="font-black text-lg bg-gradient-to-r from-amber-700 via-orange-600 to-rose-600 dark:from-amber-400 dark:to-gold-300 bg-clip-text text-transparent block tracking-tight">
                      {language === "uz" ? (p.discountUz || p.discount) : language === "ru" ? (p.discountRu || p.discount) : (p.discountEn || p.discount)}
                    </span>
                    <button
                      onClick={() => copyCode(p.code, p.code)}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:brightness-105 text-white dark:from-slate-800 dark:to-slate-900 dark:text-slate-100 border border-amber-400/50 dark:border-slate-700/60 rounded-xl text-xs font-mono font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      {copiedId === p.code ? <Check className="w-3.5 h-3.5 text-white stroke-[2.2]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.2]" />}
                      <span>
                        {copiedId === p.code
                          ? language === "uz"
                            ? "Nusxalandi!"
                            : language === "ru"
                            ? "Скопировано!"
                            : "Copied!"
                          : p.code}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
