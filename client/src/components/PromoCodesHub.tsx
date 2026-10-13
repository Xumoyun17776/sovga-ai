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
} from "../lib/icons";
import { useTranslation } from "../lib/i18n";
import { cyberSound } from "../lib/cyberSound";
import { promocodesApi, auth } from "../lib/api";
import { useToast } from "./Toast";
import { copyText } from "../lib/clipboard";

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
  return "bg-amber-100 text-amber-900 border-[var(--line)] dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800";
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

  // Admin test bypass (only for owner baxorasaidova@gmail.com)
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
    copyText(code);
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
        colors: ["#818cf8", "#d9431f", "#10b981", "#d9431f"],
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
    <div className="section-band py-14 sm:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="eyebrow mb-3">{language === "uz" ? "Chegirmalar" : language === "ru" ? "Скидки" : "Savings"}</span>
            <h2 className="font-display font-semibold text-[1.75rem] leading-tight sm:text-4xl tracking-[-0.035em] text-slate-900 dark:text-white">
              {language === "uz" ? <>Promokodlar va <span className="text-gold-gradient">haftalik baraban</span></> : language === "ru" ? <>Промокоды и <span className="text-gold-gradient">колесо недели</span></> : <>Promo codes <span className="text-gold-gradient">and weekly spin</span></>}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 max-w-xl">
              {language === "uz" ? "Do'konlar promokodlarini bir joyda toping va haftada bir marta barabanni aylantirib qo'shimcha chegirma yuting." : language === "ru" ? "Промокоды магазинов в одном месте, а раз в неделю можно крутить колесо и выиграть дополнительную скидку." : "Store promo codes in one place, plus a free spin once a week for an extra discount."}
            </p>
          </div>

          {/* Navigation Mode Tabs */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => {
                cyberSound.playClick();
                setActiveTab("wheel");
              }}
              className={`h-9 px-3.5 rounded-full text-sm font-medium transition flex items-center gap-1.5 cursor-pointer border ${
                activeTab === "wheel"
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                  : "bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-[var(--line)] hover:border-[var(--line-strong)]"
              }`}
            >
              <span>{language === "uz" ? "Baraban" : language === "ru" ? "Колесо" : "Weekly spin"}</span>
            </button>

            <button
              onClick={() => {
                cyberSound.playClick();
                setActiveTab("catalog");
              }}
              className={`h-9 px-3.5 rounded-full text-sm font-medium transition flex items-center gap-1.5 cursor-pointer border ${
                activeTab === "catalog"
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                  : "bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-[var(--line)] hover:border-[var(--line-strong)]"
              }`}
            >
              <span>{language === "uz" ? "Promokodlar" : language === "ru" ? "Промокоды" : "Promo codes"}</span>
            </button>

            {myPrizes.length > 0 && (
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setActiveTab("my_prizes");
                }}
                className={`h-9 px-3.5 rounded-full text-sm font-medium transition flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === "my_prizes"
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                    : "bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-[var(--line)] hover:border-[var(--line-strong)]"
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
          <div className="bg-white dark:bg-[#0b1224] card-luxury rounded-2xl p-6 sm:p-10 border border-[var(--line)] dark:border-slate-800 shadow-sm space-y-8 animate-fade-in text-center relative overflow-hidden">
            {/* Background Ambience */}

            <div className="max-w-md mx-auto space-y-1">
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {language === "uz" ? "Haftada bir marta" : language === "ru" ? "Раз в неделю" : "Once a week"}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {language === "uz" ? "Barabanni aylantiring" : language === "ru" ? "Крутите колесо" : "Spin the wheel"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === "uz" ? "Har kim haftada bir marta bepul aylantira oladi. O'rtadagi tugmani bosing." : language === "ru" ? "Каждый может крутить бесплатно раз в неделю. Нажмите кнопку в центре." : "Everyone gets one free spin a week. Press the button in the middle."}
              </p>
            </div>

            {/* Live Weekly Cooldown Chronometer or Ready Status */}
            {remainingMs > 0 ? (
              <div className="bg-white dark:bg-[#0b1224] border border-[var(--line)] dark:border-[#d9431f]/35 rounded-2xl p-5 max-w-lg mx-auto shadow-sm dark:shadow-2xl backdrop-blur-md relative overflow-hidden">
                {/* Subtle radial metallic warm highlight */}
                
                <div className="flex items-center justify-between text-xs mb-3 relative z-10">
                  <span className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold uppercase tracking-wider">
                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>
                      {language === "uz" ? "Bu hafta aylantirdingiz" : language === "ru" ? "На этой неделе вы уже крутили" : "You've already spun this week"}
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
                  <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-1.5 sm:p-2.5 border border-[var(--line)] dark:border-[#d9431f]/25 shadow-xs dark:shadow-inner">
                    <span className="block font-mono text-xl sm:text-3xl font-bold text-amber-700 dark:text-amber-400">
                      {remainingDays}
                    </span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wide text-amber-900/80 dark:text-amber-200/75 font-bold">
                      {language === "uz" ? "Kun" : language === "ru" ? "Дней" : "Days"}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-1.5 sm:p-2.5 border border-[var(--line)] dark:border-[#d9431f]/25 shadow-xs dark:shadow-inner">
                    <span className="block font-mono text-xl sm:text-3xl font-bold text-amber-700 dark:text-amber-400">
                      {String(remainingHours).padStart(2, "0")}
                    </span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wide text-amber-900/80 dark:text-amber-200/75 font-bold">
                      {language === "uz" ? "Soat" : language === "ru" ? "Часов" : "Hours"}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-1.5 sm:p-2.5 border border-[var(--line)] dark:border-[#d9431f]/25 shadow-xs dark:shadow-inner">
                    <span className="block font-mono text-xl sm:text-3xl font-bold text-amber-700 dark:text-amber-400">
                      {String(remainingMinutes).padStart(2, "0")}
                    </span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wide text-amber-900/80 dark:text-amber-200/75 font-bold">
                      {language === "uz" ? "Daqiqa" : language === "ru" ? "Мин" : "Mins"}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-1.5 sm:p-2.5 border border-[var(--line)] dark:border-[#d9431f]/25 shadow-xs dark:shadow-inner">
                    <span className="block font-mono text-xl sm:text-3xl font-bold text-amber-700 dark:text-amber-400">
                      {String(remainingSeconds).padStart(2, "0")}
                    </span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wide text-amber-900/80 dark:text-amber-200/75 font-bold">
                      {language === "uz" ? "Soniya" : language === "ru" ? "Сек" : "Secs"}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-3 text-center relative z-10 font-medium">
                  {language === "uz" ? "Baraban har 7 kunda ochiladi. Yutgan kodlaringiz «Yutuqlarim» bo'limida saqlanadi." : language === "ru" ? "Колесо доступно раз в 7 дней. Выигранные коды хранятся в разделе «Мои призы»." : "The wheel opens every 7 days. Codes you've won are kept under 'My prizes'."}
                </p>

                {user?.email === "baxorasaidova@gmail.com" && (
                  <div className="mt-3 pt-2.5 border-t border-[var(--line)] dark:border-slate-800/80 text-center relative z-10">
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
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-emerald-500/35 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider animate-pulse shadow-sm bg-emerald-500/15">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>
                  {language === "uz" ? "Bepul aylantirish mavjud — o'rtadagi tugmani bosing." : language === "ru" ? "Бесплатная попытка доступна — нажмите кнопку в центре." : "Your free spin is ready — press the button in the middle."}
                </span>
              </div>
            )}

            {/* The Precision Horology Astrolabe Wheel Canvas Wrapper */}
            <div className="relative w-[min(300px,calc(100vw-3.5rem))] h-[min(300px,calc(100vw-3.5rem))] sm:w-[380px] sm:h-[380px] aspect-square mx-auto flex items-center justify-center py-4 select-none shrink-0">
              {/* Outer Fluted Gold Coin-Edge Ring */}
              <div className="absolute inset-0 rounded-full horology-outer-brass p-[5px] sm:p-[7px] shadow-[0_25px_70px_-10px_rgba(0,0,0,0.85)]">
                {/* Secondary Beveled Dark Steel Casing */}
                <div className="w-full h-full rounded-full bg-[#0a0c14] p-[3px] border border-[#d9431f]/40 shadow-inner relative overflow-hidden">
                  
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
                          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#d9431f" floodOpacity="0.5" />
                        </filter>
                        <filter id="textEmboss" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.9" />
                        </filter>

                        {/* Sector Radial Gradients */}
                        <radialGradient id="grad-lapis-1" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#262a3a" />
                          <stop offset="65%" stopColor="#181a24" />
                          <stop offset="100%" stopColor="#0f1118" />
                        </radialGradient>
                        <radialGradient id="grad-bronze-1" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#1c1f2b" />
                          <stop offset="65%" stopColor="#13151d" />
                          <stop offset="100%" stopColor="#0b0c12" />
                        </radialGradient>
                        <radialGradient id="grad-jade-1" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#262a3a" />
                          <stop offset="65%" stopColor="#181a24" />
                          <stop offset="100%" stopColor="#0f1118" />
                        </radialGradient>
                        <radialGradient id="grad-garnet-1" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#1c1f2b" />
                          <stop offset="65%" stopColor="#13151d" />
                          <stop offset="100%" stopColor="#0b0c12" />
                        </radialGradient>
                        <radialGradient id="grad-lapis-2" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#262a3a" />
                          <stop offset="65%" stopColor="#181a24" />
                          <stop offset="100%" stopColor="#0f1118" />
                        </radialGradient>
                        <radialGradient id="grad-bronze-2" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#1c1f2b" />
                          <stop offset="65%" stopColor="#13151d" />
                          <stop offset="100%" stopColor="#0b0c12" />
                        </radialGradient>
                        <radialGradient id="grad-jade-2" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#262a3a" />
                          <stop offset="65%" stopColor="#181a24" />
                          <stop offset="100%" stopColor="#0f1118" />
                        </radialGradient>
                        <radialGradient id="grad-garnet-2" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#1c1f2b" />
                          <stop offset="65%" stopColor="#13151d" />
                          <stop offset="100%" stopColor="#0b0c12" />
                        </radialGradient>

                        {/* Gold Inlay Spoke Gradient */}
                        <linearGradient id="goldRib" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#e0e3ff" />
                          <stop offset="50%" stopColor="#8388f8" />
                          <stop offset="100%" stopColor="#3730a3" />
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
                      <circle cx="200" cy="200" r="184" fill="none" stroke="#d9431f" strokeWidth="1" strokeOpacity="0.5" />
                      <circle cx="200" cy="200" r="148" fill="none" stroke="#d9431f" strokeWidth="0.75" strokeDasharray="3 3" strokeOpacity="0.4" />
                      <circle cx="200" cy="200" r="82" fill="none" stroke="#d9431f" strokeWidth="1" strokeOpacity="0.5" />

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
                            stroke={isMajor ? "#a5aafc" : "#4338ca"}
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
                            <circle cx={rx} cy={ry} r="3.5" fill="#1e1b4b" />
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
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <svg width="32" height="48" viewBox="0 0 32 48" fill="none">
                  {/* Left Facet (Direct Light Reflection) */}
                  <polygon points="16,46 16,6 4,20 10,32" fill="#a5aafc" />
                  {/* Right Facet (Deep Chased Shadow) */}
                  <polygon points="16,46 16,6 28,20 22,32" fill="#4338ca" />
                  {/* Razor Spine Ridge */}
                  <line x1="16" y1="6" x2="16" y2="46" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.8" />
                  {/* Ruby Cabochon Pivot Mount */}
                  <circle cx="16" cy="14" r="5.5" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" />
                  <circle cx="16" cy="14" r="3" fill="#d9431f" />
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
                    ? "text-white scale-95 opacity-90 cursor-wait border-4 border-[var(--line)] bg-amber-500"
                    : canSpin
                    ? "from-[#a5aafc] via-[#d9431f] to-[#785315] text-slate-950 cursor-pointer border-4 border-[#e0e3ff] bg-[#a5aafc]"
                    : "from-[#1e2333] to-[#0e111a] text-amber-200/60 border-4 border-[#333b52] opacity-90 cursor-not-allowed hover:border-[var(--line-strong)] bg-[#1e2333]"
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
                    <span className="leading-tight mt-1 font-bold text-[10px] sm:text-xs tracking-wider">
                      ...
                    </span>
                  </>
                ) : canSpin ? (
                  <>
                    <Award className="w-5 h-5 text-slate-950 drop-shadow-xs" />
                    <span className="leading-tight mt-0.5 font-bold text-[11px] sm:text-xs uppercase tracking-wider text-slate-950 drop-shadow-xs">
                      {language === "uz" ? "AYLANTIR" : language === "ru" ? "КРУТИТЬ" : "SPIN"}
                    </span>
                    <span className="text-[8px] font-bold text-slate-900/80 uppercase tracking-wide -mt-0.5">
                      1x BEPUL
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400 mb-0.5" />
                    <span className="leading-tight text-[10px] font-bold uppercase text-amber-300 tracking-wider">
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
              <div className="bg-white dark:bg-[#0b1224] max-w-md mx-auto text-slate-900 dark:text-white rounded-2xl p-6 border border-[var(--line)] dark:border-[#d9431f]/60 shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-left animate-slide-up space-y-4 relative overflow-hidden">
                {/* Gold Foil Corner Accents */}
                
                

                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-bold border border-[var(--line)] flex items-center gap-1.5 bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
                    <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>
                      {language === "uz" ? "Yutuq" : language === "ru" ? "Ваш приз" : "You won"}
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
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-bold tracking-wider uppercase">{wheelWinner.brand}</span>
                  <h4 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white mt-0.5">
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
                  <div className="flex-1 bg-amber-100/70 dark:bg-[#06070a] p-3 rounded-2xl border border-[var(--line)] dark:border-[#d9431f]/40 font-mono font-bold text-base text-amber-950 dark:text-amber-300 tracking-wider text-center shadow-inner">
                    {wheelWinner.code}
                  </div>
                  <button
                    onClick={() => copyCode(wheelWinner.id, wheelWinner.code)}
                    className="px-4 py-3 dark:from-[#a5aafc] dark:via-[#d9431f] dark:to-[#4338ca] hover:brightness-105 text-white dark:text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md bg-amber-500 dark:bg-amber-500"
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
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-100/80 dark:bg-amber-500/10 border border-[var(--line)] dark:border-amber-500/25 text-[11px] text-amber-950 dark:text-amber-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 stroke-[2.2]" />
                  <span>
                    {language === "uz" ? "Keyingi aylantirish 7 kundan keyin. Kod «Yutuqlarim»da saqlandi." : language === "ru" ? "Следующая попытка через 7 дней. Код сохранён в «Моих призах»." : "Next spin in 7 days. Your code is saved under 'My prizes'."}
                  </span>
                </div>

                {/* Telegram Share */}
                <div className="pt-2 flex items-center justify-between border-t border-[var(--line)] dark:border-slate-800 text-xs">
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
                    className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-bold flex items-center gap-1.5 transition cursor-pointer"
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
                className="bg-white dark:bg-[#0b1224] voucher-ticket-edge rounded-2xl p-5 border border-[var(--line)] dark:border-slate-800/80 shadow-md hover:shadow-md hover:border-gold-500/60 transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3.5">
                    <div className={`px-3 py-1 rounded-xl text-xs font-bold tracking-wide uppercase border shadow-2xs ${getBrandBadgeStyle(promo.brand)}`}>
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

                  <h3 className="text-2xl font-bold mb-1.5 text-amber-700 dark:text-amber-400">
                    {promo.discount}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-4 min-h-[34px]">
                    {promo.description}
                  </p>
                </div>

                {/* Perforated dashed divider */}
                <div className="border-t border-dashed border-[var(--line)] dark:border-slate-800 my-2" />

                <div className="mt-auto pt-1">
                  {promo.type === "online" ? (
                    <button
                      onClick={() => copyCode(promo.id, promo.code)}
                      className="w-full relative flex items-center justify-between border border-dashed border-amber-400/80 hover:border-amber-600 bg-amber-100/60 hover:bg-amber-100 dark:bg-amber-950/20 p-2.5 rounded-2xl cursor-pointer transition group/btn shadow-2xs"
                    >
                      <span className="font-mono font-bold text-xs sm:text-sm text-amber-950 dark:text-amber-300 tracking-wider">
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
                    <button className="w-full hover:brightness-105 text-white font-bold text-xs py-2.5 rounded-2xl shadow-sm transition cursor-pointer flex justify-center items-center gap-1.5 bg-amber-500">
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
            <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 sm:p-8 border border-[var(--line)] dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2.5">
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
                    className="bg-white dark:bg-[#0b1224] voucher-ticket-edge p-5 rounded-2xl border border-[var(--line)] dark:border-slate-800/90 shadow-sm space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-2xs ${getBrandBadgeStyle(p.brand)}`}>{p.brand}</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">
                        {language === "uz" ? "Faol" : language === "ru" ? "Активен" : "Active"}
                      </span>
                    </div>
                    <span className="font-bold text-lg block tracking-tight text-amber-700 dark:text-amber-400">
                      {language === "uz" ? (p.discountUz || p.discount) : language === "ru" ? (p.discountRu || p.discount) : (p.discountEn || p.discount)}
                    </span>
                    <button
                      onClick={() => copyCode(p.code, p.code)}
                      className="w-full py-2.5 hover:brightness-105 text-white dark:text-slate-100 border border-amber-400/50 dark:border-slate-700/60 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm bg-amber-500 dark:bg-slate-800"
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
