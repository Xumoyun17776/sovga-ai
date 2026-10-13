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
} from "../lib/icons";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation, tr } from "../lib/i18n";
import { useToast } from "../components/Toast";
import { copyText } from "../lib/clipboard";

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
    color: "border-rose-500/30 text-rose-400 bg-rose-500/20",
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
    color: "border-amber-500/30 text-amber-400 bg-amber-500/20",
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
    color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/20",
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
    color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/20",
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
        language === "uz" ? "Vaqt Kapsulasi Muhrlandi!" : language === "ru" ? "Капсула времени запечатана!" : "Time Capsule Sealed!",
        language === "uz" ? "Belgilangan sanada ochiladi" : language === "ru" ? "Откроется в выбранный день" : "It will open on the date you chose"
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
    copyText(url);
    setCopiedLink(true);
    cyberSound.playConfirm();
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success(
      language === "uz" ? "Kapsula havolasi nusxalandi!" : language === "ru" ? "Ссылка на капсулу скопирована!" : "Capsule link copied!",
      language === "uz" ? "Telegram orqali jo'nating" : language === "ru" ? "Отправьте через Telegram" : "Send it via Telegram"
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
    const text = `${tr("Vaqt kapsulasi", "Капсула времени", "Time capsule")}: ${cap.title}\n${tr("Kimga", "Кому", "To")}: ${cap.recipient}\n${tr("Ochilish sanasi", "Дата открытия", "Opens on")}: ${cap.targetDate}\n\n${window.location.origin}/time-capsule?capsule=${cap.id}`;
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
    toast.info(language === "uz" ? "Kapsula o'chirildi" : language === "ru" ? "Капсула удалена" : "Capsule deleted");
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors relative overflow-hidden">
      {/* Ambient luxury glow */}

      <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="lux-title text-[2.4rem] sm:text-[3.2rem] text-slate-900 dark:text-white leading-[1.05]">
            {language === "uz" ? "Vaqt kapsulasi" : language === "ru" ? "Капсула времени" : "Time capsule"}
          </h1>

          <p className="text-base text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            {language === "uz" ? "Xat yoki sovg'ani tanlangan sanada ochiladigan qilib saqlab qo'ying — masalan, to'y yilligi yoki farzandingizning 18 yoshiga." : language === "ru" ? "Сохраните письмо или подарок, который откроется в выбранный день — например, на годовщину свадьбы или 18-летие ребёнка." : "Save a letter or gift that opens on a date you choose, like a wedding anniversary or a child's 18th birthday."}
          </p>
        </div>

        {/* ─── LIVE CHRONOMETER COUNTDOWN DISPLAY ─── */}
        <div className="bg-white dark:bg-[#0b1224] p-4 sm:p-8 rounded-2xl border border-[var(--line)] dark:border-amber-500/30 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b-2 border-[var(--line)] dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-[var(--line)] dark:border-amber-700 flex items-center justify-center shadow-xs">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {language === "uz" ? "Ochilish Vaqti Xronometri" : language === "ru" ? "Хронометр Распечатывания" : "Unlock Countdown"}
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-400 font-mono font-bold">
                  {targetDate} (00:00:00 UZT)
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-[var(--line)] dark:border-amber-700">
              {language === "uz" ? "STATUS: QULFLANGAN" : language === "ru" ? "СТАТУС: ЗАПЕЧАТАНО" : "STATUS: LOCKED"}
            </span>
          </div>

          {/* Holographic 3D Vault Pod Core */}
          <div className="relative w-40 h-40 sm:w-52 sm:h-52 aspect-square mx-auto flex items-center justify-center my-4">
            {/* Outer rotating concentric ring */}
            <div className="absolute inset-0 rounded-full border border-dashed border-amber-400/40 animate-spin [animation-duration:22s]" />
            {/* Inner counter-rotating ring */}
            <div className="absolute inset-3 rounded-full border border-amber-500/50 border-t-transparent border-b-transparent animate-spin [animation-duration:12s] [animation-direction:reverse]" />
            {/* Core vault pod */}
            <div className="bg-white dark:bg-[#0b1224] absolute inset-7 rounded-full border border-[var(--line)] dark:border-amber-500/40 flex flex-col items-center justify-center shadow-sm">
              {isScanning ? (
                <Fingerprint className="w-10 h-10 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              ) : isTestUnlocked ? (
                <Unlock className="w-10 h-10 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
              ) : (
                <Lock className="w-10 h-10 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              )}
              <span className="text-[9px] font-mono font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide mt-1">
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
                className="p-1.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-[var(--line)] dark:border-slate-800 shadow-2xs flex flex-col items-center justify-center min-w-0"
              >
                <span className="text-lg sm:text-4xl md:text-5xl font-mono font-bold text-amber-900 dark:text-amber-300 tracking-tight truncate w-full">
                  {String(unit.val).padStart(2, "0")}
                </span>
                <span className="text-[9px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 sm:mt-1 truncate w-full">
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 stroke-[2.2]" />
                <span>{language === "uz" ? "Mashhur Hayotiy Marosimlar:" : language === "ru" ? "Популярные События:" : "Popular Life Milestones:"}</span>
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
                      className={`bg-white dark:bg-[#0b1224] w-full p-4 rounded-2xl border text-left transition flex items-start gap-3 group cursor-pointer shadow-2xs ${
                        targetDate === p.date
                          ? "border-amber-500 ring-2 ring-amber-400/40 shadow-md"
                          : "border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl text-amber-700 dark:text-amber-400 border border-[var(--line)] dark:border-amber-600/50 flex items-center justify-center flex-shrink-0 transition-transform shadow-xs bg-amber-100 dark:bg-amber-950/80">
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
            <div className="bg-white dark:bg-[#0b1224] lg:col-span-7 p-6 sm:p-8 rounded-2xl border border-[var(--line)] dark:border-amber-500/25 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b-2 border-[var(--line)] dark:border-slate-800 pb-3">
                <KeyRound className="w-4 h-4 text-amber-500 stroke-[2.2]" />
                <span>{language === "uz" ? "Vaqt Kapsulasi Parametrlari" : language === "ru" ? "Настройки Капсулы" : "Time Capsule Settings"}</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {language === "uz" ? "Kapsula Nomi & Sababi" : language === "ru" ? "Название Капсулы" : "Capsule Name & Reason"}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[var(--line)] dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      {language === "uz" ? "Sovg'a Oluvchi (Inson)" : language === "ru" ? "Получатель" : "Recipient"}
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[var(--line)] dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      {language === "uz" ? "Ochilish Sanasi" : language === "ru" ? "Дата Открытия" : "Unlock Date"}
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[var(--line)] dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {language === "uz" ? "Biriktirilgan Sovg'a yoki Sertifikat" : language === "ru" ? "Прикрепленный Подарок" : "Attached Gift or Certificate"}
                  </label>
                  <input
                    type="text"
                    value={giftItem}
                    onChange={(e) => setGiftItem(e.target.value)}
                    placeholder="Masalan: Dyson Airwrap, Sayohat vaucheri..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[var(--line)] dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {language === "uz" ? "Kelajakka Maktub & Va'da" : language === "ru" ? "Письмо в Будущее" : "Letter & Promise to the Future"}
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-[var(--line)] dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                {/* Biometric Scan Trigger Button */}
                <button
                  onClick={handleSealCapsule}
                  disabled={isScanning}
                  className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50 bg-amber-500 hover:bg-amber-400"
                >
                  <Fingerprint className={`w-5 h-5 stroke-[2.2] ${isScanning ? "animate-spin" : "animate-pulse"}`} />
                  <span>
                    {isScanning
                      ? language === "uz" ? "Muhrlanmoqda..." : language === "ru" ? "Запечатываем..." : "Sealing…"
                      : language === "uz" ? "Kapsulani muhrlash" : language === "ru" ? "Запечатать капсулу" : "Seal the capsule"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active Sealed Capsule Success View */
          <div className="bg-white dark:bg-[#0b1224] p-8 sm:p-12 rounded-2xl border border-[var(--line)] dark:border-amber-500/30 shadow-sm space-y-8 animate-fade-in text-center relative overflow-hidden">
            <div className="w-20 h-20 rounded-2xl text-amber-700 dark:text-amber-400 border border-[var(--line)] dark:border-amber-600 flex items-center justify-center mx-auto shadow-sm bg-amber-100 dark:bg-amber-950">
              <ShieldCheck className="w-10 h-10 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide block">
                {activeCapsule.id} · PROTOCOL ENCRYPTED
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white font-display">
                {activeCapsule.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {language === "uz" ? "Kimga atalgan:" : language === "ru" ? "Для кого:" : "For:"} <span className="text-slate-900 dark:text-white font-bold">{activeCapsule.recipient}</span> ·{" "}
                {language === "uz" ? "Ochilish muddati:" : language === "ru" ? "Дата открытия:" : "Opens on:"} <span className="text-amber-700 dark:text-amber-300 font-mono font-bold">{activeCapsule.targetDate}</span>
              </p>
            </div>

            {/* Locked Content Card */}
            <div className="max-w-xl mx-auto p-6 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-[var(--line)] dark:border-slate-800 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[var(--line)] dark:border-slate-800 pb-3 text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">{language === "uz" ? "Biriktirilgan sovg'a:" : language === "ru" ? "Подарок:" : "Attached gift:"}</span>
                <span className="font-bold text-amber-800 dark:text-amber-300">{activeCapsule.giftItem}</span>
              </div>

              {!isTestUnlocked ? (
                <div className="py-6 text-center space-y-2">
                  <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400 stroke-[2.2] mx-auto" />
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {language === "uz" ? "Xat va sovg'a ochilish sanasigacha yashirin turadi." : language === "ru" ? "Письмо и подарок скрыты до даты открытия." : "The letter and gift stay hidden until the opening date."}
                  </p>
                  <button
                    onClick={handleTestUnlock}
                    disabled={isScanning}
                    className="mt-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-slate-800 hover:bg-amber-200 text-xs font-bold text-amber-900 dark:text-amber-300 border border-[var(--line)] dark:border-slate-700 transition cursor-pointer"
                  >
                    {isScanning ? tr("Skanerlanmoqda...", "Проверяем...", "Checking...") : language === "uz" ? "Test Qulfni Tekshirish" : language === "ru" ? "Тестовое Открытие" : "Test Unlock"}
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 text-xs text-left leading-relaxed animate-fade-in space-y-2">
                  <span className="font-bold block text-emerald-700 dark:text-emerald-400">
                    ✦ {language === "uz" ? "Kapsula Maktubi:" : language === "ru" ? "Письмо из капсулы:" : "Capsule Letter:"}
                  </span>
                  <p className="whitespace-pre-line italic font-serif">"{activeCapsule.message}"</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={handleCopyShareLink}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer bg-amber-500 hover:bg-amber-400"
              >
                {copiedLink ? <Check className="w-4 h-4 stroke-[2.2]" /> : <Copy className="w-4 h-4 stroke-[2.2]" />}
                <span>{copiedLink ? (language === "uz" ? "Nusxalandi!" : language === "ru" ? "Скопировано!" : "Copied!") : (language === "uz" ? "Kapsula Havolasini Olish" : language === "ru" ? "Копировать Ссылку" : "Get Capsule Link")}</span>
              </button>

              <button
                onClick={handleShareTelegram}
                className="px-5 py-2.5 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.2]" />
                <span>{language === "uz" ? "Telegramda Ulashish" : language === "ru" ? "Отправить в Telegram" : "Share on Telegram"}</span>
              </button>

              <button
                onClick={() => {
                  setActiveCapsule(null);
                  setIsTestUnlocked(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
              >
                {language === "uz" ? "Yangi Kapsula Yaratish" : language === "ru" ? "Создать еще капсулу" : "Create New Capsule"}
              </button>
            </div>
          </div>
        )}

        {/* ─── TIME VAULT ARCHIVE: SAVED CAPSULES LIST ─── */}
        {savedCapsules.length > 0 && (
          <div className="space-y-4 pt-6 border-t-2 border-[var(--line)] dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500 stroke-[2.2]" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {language === "uz"
                    ? "Mening Muhrlangan Kapsulalarim (Vaqt Ombori)"
                    : language === "ru"
                    ? "Мои Запечатанные Капсулы Времени"
                    : "My Sealed Time Capsules Vault"}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-[var(--line)] dark:border-amber-700">
                {savedCapsules.length} {language === "uz" ? "ta kapsula" : language === "ru" ? "капсул" : "capsules"}
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
                    className={`bg-white dark:bg-[#0b1224] p-4.5 rounded-2xl border transition-all duration-300 text-left flex flex-col justify-between cursor-pointer group relative overflow-hidden shadow-2xs ${
                      isSelected
                        ? "border-amber-500 ring-2 ring-amber-400/40 shadow-sm"
                        : "border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 border border-[var(--line)] text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 transition-transform">
                        <Lock className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-md dark:bg-slate-800 border border-[var(--line)] dark:border-slate-700 font-bold bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
                          {cap.id}
                        </span>
                        <button
                          onClick={(e) => handleDeleteCapsule(cap.id, e)}
                          title={tr("O'chirish", "Удалить", "Delete")}
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-red-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition cursor-pointer shadow-2xs"
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
                        {language === "uz" ? "Kimga:" : language === "ru" ? "Кому:" : "To:"} <span className="text-slate-900 dark:text-slate-200 font-semibold">{cap.recipient}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--line)] dark:border-slate-800 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 stroke-[2.2]" />
                        <span>{cap.targetDate}</span>
                      </span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold transition-transform flex items-center gap-0.5">
                        <span>{language === "uz" ? "Ko'rish" : language === "ru" ? "Открыть" : "View"}</span>
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
