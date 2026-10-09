import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Link } from "wouter";
import {
  Clock,
  Lock,
  Unlock,
  KeyRound,
  Sparkles,
  Fingerprint,
  Share2,
  Copy,
  Calendar,
  Gift,
  Heart,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Flame,
  Award,
  Crown,
  Eye,
  Check,
  Send,
  Zap,
  Trash2,
} from "lucide-react";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation } from "../lib/i18n";
import { useToast } from "../components/Toast";

interface MilestonePreset {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  date: string;
  icon: any;
  hintUz: string;
  hintRu: string;
  hintEn: string;
  color: string;
}

const PRESETS: MilestonePreset[] = [
  {
    id: "anniversary_1",
    titleUz: "Nikoh To'yimizning 1 Yilligi",
    titleRu: "1-я Годовщина Свадьбы",
    titleEn: "1st Wedding Anniversary",
    date: "2027-04-20",
    icon: Heart,
    hintUz: "Oilaviy qasamyod va birinchi yillik sovg'asi",
    hintRu: "Семейные воспоминания и подарок на ситцевую свадьбу",
    hintEn: "Family vows and milestone anniversary surprise",
    color: "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400",
  },
  {
    id: "child_18",
    titleUz: "Farzandimizning 18 Yilligi",
    titleRu: "18-летие Ребенка (Совершеннолетие)",
    titleEn: "Child's 18th Birthday Milestone",
    date: "2034-09-01",
    icon: Crown,
    hintUz: "Ota-onaning bolalikdan yozgan samimiy xati",
    hintRu: "Письмо в будущее от родителей и стартовый капитал",
    hintEn: "Heartfelt letter from parents sealed for adulthood",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
  },
  {
    id: "career_goal",
    titleUz: "Katta Karyera & Yangi Uy Orzusi",
    titleRu: "Карьера и Мечта о Новом Доме",
    titleEn: "Big Career & Dream Home Milestone",
    date: "2028-12-31",
    icon: Award,
    hintUz: "O'ziga berilgan va'da va shaxsiy mukofot",
    hintRu: "Личное обещание себе и долгожданная цель",
    hintEn: "Personal pledge to self and future reward",
    color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
  },
  {
    id: "newyear_2027",
    titleUz: "2027-yil Yangi Yil Mo'jizasi",
    titleRu: "Новогоднее Волшебство 2027",
    titleEn: "New Year 2027 Miracle",
    date: "2027-01-01",
    icon: Sparkles,
    hintUz: "Kelajakdagi o'zimiz va oilamizga kutilmagan syurpriz",
    hintRu: "Сюрприз себе и близким в новогоднюю ночь",
    hintEn: "Surprise reveal for future family New Year",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
  },
];

interface CapsuleRecord {
  id: string;
  title: string;
  recipient: string;
  targetDate: string;
  message: string;
  giftItem: string;
  sealedAt: string;
  isUnlocked: boolean;
}

export default function TimeCapsulePage() {
  const { language } = useTranslation();
  const toast = useToast();

  const [title, setTitle] = useState("Nikoh To'yimizning 1 Yilligi");
  const [recipient, setRecipient] = useState("Aziz Umr Yo'ldoshim");
  const [targetDate, setTargetDate] = useState("2027-04-20");
  const [message, setMessage] = useState(
    "Biz birga bosib o'tgan birinchi yilimiz esdaligi. Ushbu sovg'a va xat faqat belgilangan sanada ochilishi shart!"
  );
  const [giftItem, setGiftItem] = useState("Dyson Airwrap & Oltin Zanjir");
  const [isScanning, setIsScanning] = useState(false);
  const [activeCapsule, setActiveCapsule] = useState<CapsuleRecord | null>(null);
  const [isTestUnlocked, setIsTestUnlocked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedCapsules, setSavedCapsules] = useState<CapsuleRecord[]>(() => {
    try {
      const data = localStorage.getItem("sovga_time_capsules");
      if (data) return JSON.parse(data);
    } catch {}
    return [
      {
        id: "CAPSULE-892410",
        title: "Nikohimizning 1 Yillik Yubileyi",
        recipient: "Aziz Umr Yo'ldoshim",
        targetDate: "2027-04-20",
        message: "Biz birga boshlagan muqaddas oilaviy yo'limizning birinchi yillik xotirasi. Birinchi kundan boshlab sevgi va sadoqatimiz bardavom bo'lsin!",
        giftItem: "Dyson Airwrap & Zargarlik To'plami",
        sealedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        isUnlocked: false,
      },
    ];
  });

  // Time remaining calculation
  const [timeRemaining, setTimeRemaining] = useState({
    years: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      const years = Math.floor(totalDays / 365);
      const days = totalDays % 365;

      setTimeRemaining({ years, days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const handleApplyPreset = (p: MilestonePreset) => {
    cyberSound.playClick();
    setTitle(language === "uz" ? p.titleUz : language === "ru" ? p.titleRu : p.titleEn);
    setTargetDate(p.date);
  };

  const handleSealCapsule = () => {
    setIsScanning(true);
    cyberSound.playScan();

    setTimeout(() => {
      setIsScanning(false);
      cyberSound.playSuccess();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      const newCapsule: CapsuleRecord = {
        id: "CAPSULE-" + Math.floor(100000 + Math.random() * 900000),
        title,
        recipient,
        targetDate,
        message,
        giftItem,
        sealedAt: new Date().toISOString(),
        isUnlocked: false,
      };

      setActiveCapsule(newCapsule);
      setSavedCapsules((prev) => {
        const next = [newCapsule, ...prev.filter((c) => c.id !== newCapsule.id)];
        try {
          localStorage.setItem("sovga_time_capsules", JSON.stringify(next));
        } catch {}
        return next;
      });

      toast.success(
        language === "uz" ? "Vaqt Kapsulasi Muhrlandi!" : "Капсула времени запечатана!",
        language === "uz" ? "Biometrik qulf faollashtirildi" : "Биометрический замок активирован"
      );
    }, 1800);
  };

  const handleTestUnlock = () => {
    cyberSound.playScan();
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsTestUnlocked(true);
      cyberSound.playVictoryFanfare();
      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 },
        });
      } catch {}
    }, 1400);
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/time-capsule?capsule=${activeCapsule?.id || "demo"}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    cyberSound.playConfirm();
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success(
      language === "uz" ? "Kapsula havolasi nusxalandi!" : "Ссылка на капсулу скопирована!",
      language === "uz" ? "Telegram orqali jo'nating" : "Отправьте через Telegram"
    );
  };

  const handleShareTelegram = () => {
    cyberSound.playConfirm();
    const cap = activeCapsule || {
      id: "CAPSULE-DEMO",
      recipient,
      title,
      targetDate,
    };
    const text = `🔐 *SOVG'A AI VAQT KAPSULASI #${cap.id}*\n\nKimga: *${cap.recipient}*\nSabab: *${cap.title}*\nOchilish sanasi: *${cap.targetDate}*\n\nUshbu kapsula biometrik qulf bilan muhrlangan va faqat belgilangan sanada ochiladi!\n\n🔗 Kapsulani kuzatish:\n${window.location.origin}/time-capsule?capsule=${cap.id}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleDeleteCapsule = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    cyberSound.playClick();
    setSavedCapsules((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem("sovga_time_capsules", JSON.stringify(next));
      } catch {}
      return next;
    });
    if (activeCapsule?.id === id) {
      setActiveCapsule(null);
    }
    toast.info(language === "uz" ? "Kapsula o'chirildi" : "Капсула удалена");
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors bg-[#fcfbf9] dark:bg-[#07080c] relative overflow-hidden">
      {/* Ambient luxury glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-400/25 to-amber-500/15 border-2 border-amber-300/80 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-widest shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2] animate-spin [animation-duration:8s]" />
            <span>
              {language === "uz"
                ? "NEVRAL VAQT PROTOKOLI 2026-2035"
                : language === "ru"
                ? "НЕЙРО-ПРОТОКОЛ ВРЕМЕНИ 2026-2035"
                : "NEURAL TIME CAPSULE PROTOCOL"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-slate-900 dark:text-white">
            {language === "uz" ? (
              <>
                Kelajakka Sovg'a &{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500">
                  Vaqt Kapsulasi
                </span>
              </>
            ) : language === "ru" ? (
              <>
                Подарок в Будущее &{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500">
                  Капсула Времени
                </span>
              </>
            ) : (
              <>
                Milestone Vault &{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500">
                  Neural Time Capsule
                </span>
              </>
            )}
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            {language === "uz"
              ? "Bugun tanlangan maxsus sovg'a, qimmatli xat yoki va'dani yillar o'tib belgilangan sanada ochiladigan qilib kriptografik biometrik qulf bilan muhrlang."
              : language === "ru"
              ? "Запечатайте подарок, видео-обещание или теплое письмо в будущее с гарантией открытия только в назначенный день."
              : "Lock away future surprises, vows, and milestone gifts with cryptographic biometric seals that unlock strictly on the chosen date."}
          </p>
        </div>

        {/* ─── LIVE CHRONOMETER COUNTDOWN DISPLAY ─── */}
        <div className="p-4 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] border-2 border-amber-300/80 dark:border-amber-500/30 shadow-luxury relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b-2 border-amber-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center shadow-xs">
                <Lock className="w-5 h-5 stroke-[2.2] animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {language === "uz" ? "Ochilish Vaqti Xronometri" : "Хронометр Распечатывания"}
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-400 font-mono font-bold">
                  {targetDate} (00:00:00 UZT)
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-black px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-2 border-amber-300 dark:border-amber-700">
              {language === "uz" ? "STATUS: QULFLANGAN" : "СТАТУС: ЗАПЕЧАТАНО"}
            </span>
          </div>

          {/* Holographic 3D Vault Pod Core */}
          <div className="relative w-40 h-40 sm:w-52 sm:h-52 aspect-square mx-auto flex items-center justify-center my-4">
            {/* Outer rotating concentric ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/40 animate-spin [animation-duration:22s] shadow-[0_0_30px_rgba(245,158,11,0.15)]" />
            {/* Inner counter-rotating ring */}
            <div className="absolute inset-3 rounded-full border border-amber-500/50 border-t-transparent border-b-transparent animate-spin [animation-duration:12s] [animation-direction:reverse]" />
            {/* Core vault pod */}
            <div className="absolute inset-7 rounded-full bg-gradient-to-tr from-amber-50 via-white to-amber-100 dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] border-2 border-amber-300/80 dark:border-amber-500/40 flex flex-col items-center justify-center shadow-luxury">
              {isScanning ? (
                <Fingerprint className="w-10 h-10 text-amber-600 dark:text-amber-400 stroke-[2.2] animate-pulse drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
              ) : isTestUnlocked ? (
                <Unlock className="w-10 h-10 text-emerald-600 dark:text-emerald-400 stroke-[2.2] animate-bounce drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
              ) : (
                <Lock className="w-10 h-10 text-amber-600 dark:text-amber-400 stroke-[2.2] drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
              )}
              <span className="text-[9px] font-mono font-black text-amber-900 dark:text-amber-300 uppercase tracking-widest mt-1">
                {isScanning ? "SCANNING..." : isTestUnlocked ? "UNLOCKED" : "SEALED"}
              </span>
            </div>
          </div>

          {/* Time digits grid */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-4 text-center">
            {[
              { val: timeRemaining.years, labelUz: "Yil", labelRu: "Лет", labelEn: "Yrs" },
              { val: timeRemaining.days, labelUz: "Kun", labelRu: "Дней", labelEn: "Days" },
              { val: timeRemaining.hours, labelUz: "Soat", labelRu: "Часов", labelEn: "Hrs" },
              { val: timeRemaining.minutes, labelUz: "Daqiqa", labelRu: "Мин", labelEn: "Mins" },
              { val: timeRemaining.seconds, labelUz: "Soniya", labelRu: "Сек", labelEn: "Secs" },
            ].map((unit, idx) => (
              <div
                key={idx}
                className="p-1.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-slate-900/80 border-2 border-amber-200/80 dark:border-slate-800 shadow-2xs flex flex-col items-center justify-center min-w-0"
              >
                <span className="text-lg sm:text-4xl md:text-5xl font-mono font-black text-amber-900 dark:text-amber-300 tracking-tight truncate w-full">
                  {String(unit.val).padStart(2, "0")}
                </span>
                <span className="text-[9px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 sm:mt-1 truncate w-full">
                  {language === "uz" ? unit.labelUz : language === "ru" ? unit.labelRu : unit.labelEn}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CREATOR INTERFACE OR ACTIVE CAPSULE ─── */}
        {!activeCapsule ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Presets Column (4 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 stroke-[2.2]" />
                <span>{language === "uz" ? "Mashhur Hayotiy Marosimlar:" : "Популярные События:"}</span>
              </h3>

              <div className="space-y-3">
                {PRESETS.map((p) => {
                  const Icon = p.icon;
                  const title = language === "uz" ? p.titleUz : language === "ru" ? p.titleRu : p.titleEn;
                  const hint = language === "uz" ? p.hintUz : language === "ru" ? p.hintRu : p.hintEn;

                  return (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition flex items-start gap-3 group cursor-pointer bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] shadow-2xs active:scale-95 ${
                        targetDate === p.date
                          ? "border-amber-500 ring-2 ring-amber-400/40 shadow-md"
                          : "border-amber-200/70 dark:border-slate-800 hover:border-amber-400"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200/70 dark:from-amber-950/80 dark:to-amber-900/50 text-amber-700 dark:text-amber-400 border border-amber-300/80 dark:border-amber-600/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                          {title}
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">{hint}</p>
                        <span className="text-[10px] font-mono text-amber-800 dark:text-amber-400 font-bold mt-1 block">
                          📅 {p.date}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Configuration Form (7 cols) */}
            <div className="lg:col-span-7 bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] p-6 sm:p-8 rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/25 shadow-luxury space-y-5">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b-2 border-amber-100 dark:border-slate-800 pb-3">
                <KeyRound className="w-4 h-4 text-amber-500 stroke-[2.2]" />
                <span>{language === "uz" ? "Vaqt Kapsulasi Parametrlari" : "Настройки Капсулы"}</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {language === "uz" ? "Kapsula Nomi & Sababi" : "Название Капсулы"}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      {language === "uz" ? "Sovg'a Oluvchi (Inson)" : "Получатель"}
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      {language === "uz" ? "Ochilish Sanasi" : "Дата Открытия"}
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {language === "uz" ? "Biriktirilgan Sovg'a yoki Sertifikat" : "Прикрепленный Подарок"}
                  </label>
                  <input
                    type="text"
                    value={giftItem}
                    onChange={(e) => setGiftItem(e.target.value)}
                    placeholder="Masalan: Dyson Airwrap, Sayohat vaucheri..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {language === "uz" ? "Kelajakka Maktub & Va'da" : "Письмо в Будущее"}
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                {/* Biometric Scan Trigger Button */}
                <button
                  onClick={handleSealCapsule}
                  disabled={isScanning}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
                >
                  <Fingerprint className={`w-5 h-5 stroke-[2.2] ${isScanning ? "animate-spin" : "animate-pulse"}`} />
                  <span>
                    {isScanning
                      ? language === "uz"
                        ? "Biometrik muhr o'rnatilmoqda..."
                        : "Установка биометрической печати..."
                      : language === "uz"
                      ? "Biometrik Qulf Bilan Muhrlash"
                      : "Запечатать Биометрическим Замком"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active Sealed Capsule Success View */
          <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] border-2 border-amber-300/80 dark:border-amber-500/30 shadow-luxury space-y-8 animate-fade-in text-center relative overflow-hidden">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-950 dark:to-amber-900 text-amber-700 dark:text-amber-400 border-2 border-amber-300 dark:border-amber-600 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
              <ShieldCheck className="w-10 h-10 stroke-[2.2] animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest block">
                {activeCapsule.id} · PROTOCOL ENCRYPTED
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
                {activeCapsule.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {language === "uz" ? "Kimga atalgan:" : "Для кого:"} <span className="text-slate-900 dark:text-white font-bold">{activeCapsule.recipient}</span> ·{" "}
                {language === "uz" ? "Ochilish muddati:" : "Дата открытия:"} <span className="text-amber-700 dark:text-amber-300 font-mono font-bold">{activeCapsule.targetDate}</span>
              </p>
            </div>

            {/* Locked Content Card */}
            <div className="max-w-xl mx-auto p-6 rounded-2xl bg-white/90 dark:bg-slate-900/80 border-2 border-amber-200/80 dark:border-slate-800 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-amber-100 dark:border-slate-800 pb-3 text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">{language === "uz" ? "Biriktirilgan sovg'a:" : "Подарок:"}</span>
                <span className="font-black text-amber-800 dark:text-amber-300">{activeCapsule.giftItem}</span>
              </div>

              {!isTestUnlocked ? (
                <div className="py-6 text-center space-y-2">
                  <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400 stroke-[2.2] mx-auto" />
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {language === "uz"
                      ? "Xat va sovg'a kontenti 256-bit biometrik qulf bilan yashirilgan."
                      : "Контент зашифрован 256-битным биометрическим ключом."}
                  </p>
                  <button
                    onClick={handleTestUnlock}
                    disabled={isScanning}
                    className="mt-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-slate-800 hover:bg-amber-200 text-xs font-bold text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-slate-700 transition cursor-pointer active:scale-95"
                  >
                    {isScanning ? "Skanerlanmoqda..." : language === "uz" ? "🔓 Test Qulfni Tekshirish" : "🔓 Тестовое Открытие"}
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 text-xs text-left leading-relaxed animate-fade-in space-y-2">
                  <span className="font-bold block text-emerald-700 dark:text-emerald-400">
                    ✦ {language === "uz" ? "Kapsula Maktubi:" : "Письмо из капсулы:"}
                  </span>
                  <p className="whitespace-pre-line italic font-serif">"{activeCapsule.message}"</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={handleCopyShareLink}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md transition cursor-pointer active:scale-95"
              >
                {copiedLink ? <Check className="w-4 h-4 stroke-[2.2]" /> : <Copy className="w-4 h-4 stroke-[2.2]" />}
                <span>{copiedLink ? (language === "uz" ? "Nusxalandi!" : "Скопировано!") : (language === "uz" ? "Kapsula Havolasini Olish" : "Копировать Ссылку")}</span>
              </button>

              <button
                onClick={handleShareTelegram}
                className="px-5 py-2.5 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] text-white font-black text-xs flex items-center gap-2 shadow-md transition cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4 stroke-[2.2]" />
                <span>{language === "uz" ? "Telegramda Ulashish" : "Отправить в Telegram"}</span>
              </button>

              <button
                onClick={() => {
                  setActiveCapsule(null);
                  setIsTestUnlocked(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer active:scale-95"
              >
                {language === "uz" ? "Yangi Kapsula Yaratish" : "Создать еще капсулу"}
              </button>
            </div>
          </div>
        )}

        {/* ─── TIME VAULT ARCHIVE: SAVED CAPSULES LIST ─── */}
        {savedCapsules.length > 0 && (
          <div className="space-y-4 pt-6 border-t-2 border-amber-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500 stroke-[2.2]" />
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {language === "uz"
                    ? "Mening Muhrlangan Kapsulalarim (Vaqt Ombori)"
                    : language === "ru"
                    ? "Мои Запечатанные Капсулы Времени"
                    : "My Sealed Time Capsules Vault"}
                </h3>
              </div>
              <span className="text-xs font-mono font-black px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                {savedCapsules.length} {language === "uz" ? "ta kapsula" : "капсул"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedCapsules.map((cap) => {
                const isSelected = activeCapsule?.id === cap.id;
                return (
                  <div
                    key={cap.id}
                    onClick={() => {
                      cyberSound.playClick();
                      setActiveCapsule(cap);
                      setIsTestUnlocked(false);
                      setTargetDate(cap.targetDate);
                      setTitle(cap.title);
                      setRecipient(cap.recipient);
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                    className={`p-4.5 rounded-2xl border-2 transition-all duration-300 text-left flex flex-col justify-between cursor-pointer group relative overflow-hidden bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] shadow-2xs active:scale-95 ${
                      isSelected
                        ? "border-amber-500 ring-2 ring-amber-400/40 shadow-xl"
                        : "border-amber-200/70 dark:border-slate-800 hover:border-amber-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 border border-amber-300 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Lock className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-md bg-amber-100/70 dark:bg-slate-800 border border-amber-300/80 dark:border-slate-700 font-bold">
                          {cap.id}
                        </span>
                        <button
                          onClick={(e) => handleDeleteCapsule(cap.id, e)}
                          title="O'chirish"
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-red-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 mb-3">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors line-clamp-1">
                        {cap.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                        {language === "uz" ? "Kimga:" : "Кому:"} <span className="text-slate-900 dark:text-slate-200 font-semibold">{cap.recipient}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-amber-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 stroke-[2.2]" />
                        <span>{cap.targetDate}</span>
                      </span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        <span>{language === "uz" ? "Ko'rish" : "Открыть"}</span>
                        <ArrowRight className="w-3 h-3 stroke-[2.2]" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
