import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { research } from "../lib/api";
import { useToast } from "../components/Toast";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation } from "../lib/i18n";
import {
  Sparkles,
  PenTool,
  Copy,
  Share2,
  Printer,
  Heart,
  Crown,
  CheckCircle2,
  ChevronRight,
  Gift,
  PackageCheck,
  RefreshCw,
  Award,
  Stamp,
  Volume2,
  VolumeX,
  Play,
  Square,
  Music,
} from "lucide-react";
import { ambientMusic, AmbientTrack } from "../lib/ambientMusic";

type ThemeId = "royal_zardozi" | "feruza_arabesque" | "adras_silk" | "swiss_platinum";
type FontStyle = "nastaliq" | "serif" | "cursive" | "modern";
type OccasionKey = "birthday" | "wedding" | "parents" | "eid" | "navruz" | "beshik" | "kelin" | "newyear";

interface ThemeConfig {
  id: ThemeId;
  name: string;
  badge: string;
  bgClass: string;
  cardBg: string;
  textColor: string;
  accentColor: string;
  borderClass: string;
  goldAccent: string;
}

const THEMES: Record<ThemeId, ThemeConfig> = {
  royal_zardozi: {
    id: "royal_zardozi",
    name: "Buxoro Zardo'zi & Qora Kadife",
    badge: "Qirollik Oltini",
    bgClass: "bg-slate-950",
    cardBg: "bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 text-amber-100",
    textColor: "text-amber-100",
    accentColor: "text-amber-400",
    borderClass: "border-amber-500/40 shadow-2xl shadow-amber-950/40 ring-1 ring-amber-400/20",
    goldAccent: "from-amber-300 via-yellow-200 to-amber-500",
  },
  feruza_arabesque: {
    id: "feruza_arabesque",
    name: "Samarqand Feruzasi & Naqsh",
    badge: "Sharqona Naqsh",
    bgClass: "bg-cyan-950",
    cardBg: "bg-gradient-to-br from-teal-950 via-slate-900 to-cyan-950 text-cyan-100",
    textColor: "text-cyan-100",
    accentColor: "text-cyan-300",
    borderClass: "border-cyan-400/30 shadow-2xl shadow-cyan-950/40 ring-1 ring-cyan-300/20",
    goldAccent: "from-cyan-200 via-teal-100 to-amber-300",
  },
  adras_silk: {
    id: "adras_silk",
    name: "Marg'ilon Adras Ipag'i",
    badge: "Ipak Nafisligi",
    bgClass: "bg-rose-950",
    cardBg: "bg-gradient-to-br from-stone-900 via-rose-950/60 to-purple-950/50 text-rose-100",
    textColor: "text-rose-100",
    accentColor: "text-rose-300",
    borderClass: "border-rose-400/30 shadow-2xl shadow-rose-950/40 ring-1 ring-rose-300/20",
    goldAccent: "from-rose-200 via-amber-200 to-rose-400",
  },
  swiss_platinum: {
    id: "swiss_platinum",
    name: "Shveysariya Mat Platinasi",
    badge: "Minimalist Elegans",
    bgClass: "bg-slate-900",
    cardBg: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100",
    textColor: "text-slate-100",
    accentColor: "text-indigo-300",
    borderClass: "border-slate-600 shadow-2xl shadow-slate-950/50 ring-1 ring-slate-500/20",
    goldAccent: "from-slate-200 via-indigo-200 to-slate-400",
  },
};

const OCCASIONS: { key: OccasionKey; label: string }[] = [
  { key: "birthday", label: "🎂 Tavallud kuni" },
  { key: "wedding", label: "💍 Nikoh to'yi" },
  { key: "parents", label: "👑 Ota-ona ehtiromi" },
  { key: "eid", label: "🌙 Hayit ayyomi" },
  { key: "navruz", label: "🌱 Navro'zi Olam" },
  { key: "beshik", label: "👶 Beshik to'yi" },
  { key: "kelin", label: "👰 Kelin salom" },
  { key: "newyear", label: "✨ Yangi yil" },
];

const PRESET_SEALS = [
  "Chin Yurakdan",
  "Baxt Qasri",
  "Cheksiz Ehtirom",
  "Hayit Muborak",
  "Muborak Bod",
  "Jannat Duosi",
  "Mitti Farishta",
  "Ibo & Vafo",
];

export default function CalligraphyCardPage() {
  const toast = useToast();
  const { language } = useTranslation();

  const [recipient, setRecipient] = useState("Aziz Onajonim");
  const [occasion, setOccasion] = useState<OccasionKey>("birthday");
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("royal_zardozi");
  const [selectedFont, setSelectedFont] = useState<FontStyle>("nastaliq");
  const [customVerse, setCustomVerse] = useState("");
  const [customBlessing, setCustomBlessing] = useState("");
  const [sealText, setSealText] = useState("Chin Yurakdan");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<AmbientTrack>("ney");

  // Voice playback & Ambient Music recitation handler
  const handleToggleVoicePlayback = () => {
    if (isPlayingAudio) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      ambientMusic.stop();
      setIsPlayingAudio(false);
      cyberSound.playClick();
      return;
    }

    if (!("speechSynthesis" in window)) {
      toast.error(
        language === "uz" ? "Brauzer ovozli o'qishni qo'llab-quvvatlamaydi" : "Speech synthesis not supported in this browser"
      );
      return;
    }

    window.speechSynthesis.cancel();

    // Start atmospheric ambient music track
    if (selectedMusic !== "none") {
      ambientMusic.play(selectedMusic);
    }

    const textToSpeak = `${recipient ? recipient + "ga bag'ishlov. " : ""}${customVerse}. ${customBlessing || ""}`;
    const cleanText = textToSpeak.replace(/[*_#`~✦]/g, "").trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.88; // Poetic deliberate cadence
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const targetLangPrefix = language === "ru" ? "ru" : language === "en" ? "en" : "uz";
    const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetLangPrefix));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      cyberSound.playConfirm();
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      ambientMusic.stop();
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      ambientMusic.stop();
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      ambientMusic.stop();
    };
  }, []);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["calligraphy-cards", recipient, occasion],
    queryFn: () => research.calligraphyCard({ recipient, occasion }),
    staleTime: 60000,
  });

  const cards = data?.cards || data?.data?.cards || [];
  const currentTheme = THEMES[selectedTheme];

  useEffect(() => {
    if (cards.length > 0) {
      setCustomVerse(cards[0].verse);
      setCustomBlessing(cards[0].blessing);
      setSealText(cards[0].sealText);
      if (cards[0].recommendedTheme && THEMES[cards[0].recommendedTheme as ThemeId]) {
        setSelectedTheme(cards[0].recommendedTheme as ThemeId);
      }
    }
  }, [cards]);

  const handleSelectCardTemplate = (card: any) => {
    cyberSound.playClick();
    setCustomVerse(card.verse);
    setCustomBlessing(card.blessing);
    setSealText(card.sealText);
    if (card.recommendedTheme && THEMES[card.recommendedTheme as ThemeId]) {
      setSelectedTheme(card.recommendedTheme as ThemeId);
    }
    toast.success(
      language === "uz" ? "Tilak tanlandi!" : language === "ru" ? "Пожелание выбрано!" : "Verse selected!",
      language === "uz" ? "Xattotlik matni yangilandi" : language === "ru" ? "Текст открытки обновлен" : "Card message updated"
    );
  };

  const handleCopyText = () => {
    cyberSound.playConfirm();
    const fullText = `TABRIKNOMA\n\nKimga: ${recipient}\n\n${customVerse}\n\nDuomiz: ${customBlessing}\n\nMuhr: [${sealText}]\n— Sovg'a AI Kalligrafik Studiyasi orqali yozildi`;
    navigator.clipboard.writeText(fullText);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
      colors: ["#f59e0b", "#d97706", "#b45309"],
    });
    toast.success(
      language === "uz" ? "Tabriknoma matni nusxalandi!" : language === "ru" ? "Текст скопирован в буфер!" : "Greeting card copied!",
      language === "uz" ? "Xotiraga saqlandi" : language === "ru" ? "Сохранено в буфер обмена" : "Saved to clipboard"
    );
  };

  const handleShareTelegram = () => {
    cyberSound.playConfirm();
    const fullText = `*TABRIKNOMA*\n\nKimga: *${recipient}*\n\n_${customVerse}_\n\n*Ezgu tilak:* ${customBlessing}\n\nMuhr: *${sealText}*\n\n— Sovg'a AI Kalligrafik Studiyasi`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(fullText)}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    cyberSound.playHoloChime();
    window.print();
  };

  const fontClasses: Record<FontStyle, string> = {
    nastaliq: "font-serif italic tracking-wide",
    serif: "font-serif tracking-normal",
    cursive: "font-sans italic",
    modern: "font-sans tracking-tight font-medium",
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors bg-[#fcfbf9] dark:bg-[#07080c] relative overflow-hidden animate-fade-in">
      {/* Ambient luxury glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3.5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-300/70 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
            <span>
              {language === "uz"
                ? "Kalligrafik Tabriknoma & Duolar Studiyasi"
                : language === "ru"
                ? "Каллиграфические Открытки & Пожелания"
                : "Calligraphy Card & Blessings Atelier"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
            {language === "uz" ? (
              <>
                Nafis Xattotlik & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-300 dark:to-yellow-400">Chin Yurakdan Tilaklar</span>
              </>
            ) : language === "ru" ? (
              <>
                Изящная Каллиграфия & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-300 dark:to-yellow-400">Искренние Пожелания</span>
              </>
            ) : (
              <>
                Exquisite Calligraphy & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-300 dark:to-yellow-400">Bespoke Greetings</span>
              </>
            )}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto font-normal">
            {language === "uz"
              ? "Sovg'angizga qo'shib beriladigan eng qimmatli narsa — bu mehr bilan bitilgan samimiy tilakdir. Xattotlik qoidalariga mos, milliy naqshlar bilan bezatilgan shaxsiy tabriknomani loyihalang."
              : language === "ru"
              ? "Самое ценное дополнение к подарку — искреннее теплое пожелание. Создайте открытку с аутентичными орнаментами и каллиграфией."
              : "The most cherished accompaniment to any gift is a heartfelt message. Design a personalized greeting card enriched with traditional Uzbek ornamentation."}
          </p>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Controls & Presets (5 cols) */}
          <div className="lg:col-span-5 space-y-6 bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-slate-900/90 dark:to-slate-950/90 p-6 sm:p-7 rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury text-slate-900 dark:text-white">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PenTool className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              <span>
                {language === "uz" ? "Tabriknoma Sozlamalari" : language === "ru" ? "Настройки Открытки" : "Card Customization"}
              </span>
            </h2>

            {/* Recipient Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === "uz" ? "Sovg'a Oluvchining Ismi yoki Maqomi" : language === "ru" ? "Имя или статус получателя" : "Recipient Name or Title"}
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={
                  language === "uz"
                    ? "Masalan: Aziz Onajonim, Jasur & Madina, Dilorom opa"
                    : language === "ru"
                    ? "Например: Дорогая Мама, Джасур и Мадина"
                    : "E.g. Dearest Mother, Jasur & Madina, Beloved Family"
                }
                className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-950 border border-amber-200/80 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition shadow-2xs"
              />
            </div>

            {/* Occasion Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === "uz" ? "Qutlov Munosabati" : language === "ru" ? "Повод для поздравления" : "Celebration Occasion"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {OCCASIONS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      cyberSound.playClick();
                      setOccasion(item.key);
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-semibold transition border text-center cursor-pointer active:scale-95 ${
                      occasion === item.key
                        ? "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 border-amber-500 font-black shadow-md shadow-amber-500/20"
                        : "bg-white/90 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-amber-200/70 dark:border-slate-800 hover:border-amber-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === "uz" ? "Kartochka Fon va Uslubi" : language === "ru" ? "Фон и стиль открытки" : "Card Theme & Background"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(THEMES).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      cyberSound.playClick();
                      setSelectedTheme(t.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between h-20 cursor-pointer shadow-2xs active:scale-95 ${
                      selectedTheme === t.id
                        ? "border-amber-500 bg-amber-50/60 dark:bg-slate-950 ring-2 ring-amber-400/50 shadow-md"
                        : "border-amber-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 hover:border-amber-400"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-black text-amber-700 dark:text-amber-400 tracking-wider">
                      {t.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Style */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === "uz" ? "Kalligrafiya Shrifti" : language === "ru" ? "Шрифт каллиграфии" : "Calligraphy Font Style"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: "nastaliq", label: "Nastaliq" },
                  { key: "serif", label: language === "uz" ? "Qirollik" : language === "ru" ? "Королевский" : "Royal Serif" },
                  { key: "cursive", label: language === "uz" ? "Nafis" : language === "ru" ? "Изящный" : "Cursive" },
                  { key: "modern", label: language === "uz" ? "Zamonaviy" : language === "ru" ? "Современный" : "Modern" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => {
                      cyberSound.playClick();
                      setSelectedFont(f.key as any);
                    }}
                    className={`py-2 text-center rounded-xl text-xs transition border cursor-pointer active:scale-95 ${
                      selectedFont === f.key
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 font-black shadow-xs"
                        : "bg-white/90 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-amber-200/70 dark:border-slate-800 hover:border-amber-400"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wax Seal Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Stamp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                <span>
                  {language === "uz" ? "Qadoq Muhr Bitigi" : language === "ru" ? "Сургучная печать" : "Wax Seal Motto"}
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SEALS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      cyberSound.playClick();
                      setSealText(s);
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer active:scale-95 ${
                      sealText === s
                        ? "bg-amber-600/25 text-amber-900 dark:text-amber-300 border-amber-400 font-black shadow-2xs"
                        : "bg-white/90 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-amber-200/70 dark:border-slate-800 hover:border-amber-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Verse Templates */}
            <div className="space-y-2 pt-2 border-t border-amber-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                  <span>
                    {language === "uz" ? "AI Tayyorlagan Xattotlik Matnlari" : language === "ru" ? "Тексты от ИИ" : "AI Calligraphy Verses"}
                  </span>
                </label>
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="text-[11px] text-amber-700 dark:text-amber-400 hover:text-amber-600 font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 stroke-[2.2] ${isFetching ? "animate-spin" : ""}`} />
                  <span>
                    {language === "uz" ? "Yangilash" : language === "ru" ? "Обновить" : "Refresh"}
                  </span>
                </button>
              </div>

              <div className="space-y-2">
                {cards.map((card: any) => (
                  <button
                    key={card.id}
                    onClick={() => handleSelectCardTemplate(card)}
                    className="w-full text-left p-3.5 rounded-2xl bg-white/90 dark:bg-slate-950/70 border border-amber-200/70 dark:border-slate-800/80 hover:border-amber-400 hover:bg-amber-50/30 transition group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                      <span>{card.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-400 border border-amber-500/30 font-bold">
                        {card.sealText}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {card.verse}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Edit Textarea */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === "uz" ? "Matnni Shaxsiy Tahrirlash" : language === "ru" ? "Свой вариант текста" : "Edit Message Directly"}
              </label>
              <textarea
                rows={3}
                value={customVerse}
                onChange={(e) => setCustomVerse(e.target.value)}
                className="w-full p-3 bg-white/90 dark:bg-slate-950 border border-amber-200/80 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition shadow-2xs"
              />
            </div>
          </div>

          {/* Right Column: Visual Card Preview & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* The Luxury Visual Canvas */}
            <div
              id="printable-card"
              className={`relative p-5 sm:p-12 rounded-3xl sm:rounded-[2.5rem] border transition-all duration-300 min-h-[400px] sm:min-h-[440px] flex flex-col justify-between overflow-hidden ${currentTheme.cardBg} ${currentTheme.borderClass}`}
            >
              {/* Background Luxury Guilloché / Pattern Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Decorative Corner Ornaments */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-400/40 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-400/40 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-400/40 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-400/40 rounded-br-xl pointer-events-none" />

              {/* Top Card Badge */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                    <Crown className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] tracking-widest uppercase font-bold text-amber-400/80 block">
                      {language === "uz" ? "Ehtirom & Samimiyat" : language === "ru" ? "С глубоким почтением" : "With Highest Regard"}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {language === "uz" ? "Sovg'a AI Tabriknomasi" : language === "ru" ? "Открытка Sovg'a AI" : "Sovg'a AI Greeting Card"}
                    </span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  {isPlayingAudio && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300">
                      <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" />
                      <span className="w-1 h-5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.12s]" />
                      <span className="w-1 h-2.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.24s]" />
                      <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce [animation-delay:0.36s]" />
                      <span className="text-[10px] font-mono font-bold uppercase ml-1">
                        {selectedMusic === "ney" ? "Ney" : selectedMusic === "piano" ? "Piano" : selectedMusic === "lofi" ? "Lofi" : "Voice"}
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date().toLocaleDateString(language === "uz" ? "uz-UZ" : language === "ru" ? "ru-RU" : "en-US", { year: "numeric", month: "long" })}
                  </span>
                </div>
              </div>

              {/* Center Body: Recipient & Verse */}
              <div className="relative z-10 my-8 space-y-6 text-center">
                <div className="space-y-1">
                  <span className="text-xs tracking-widest uppercase font-mono text-amber-400/80">
                    {language === "uz" ? "Hurmat va ehtirom ila:" : language === "ru" ? "С глубоким уважением:" : "Presented with deepest regard to:"}
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
                    {recipient || (language === "uz" ? "Aziz Insonim" : language === "ru" ? "Дорогому человеку" : "Honored Recipient")}
                  </h3>
                </div>

                {/* Main Verse */}
                <div className="max-w-lg mx-auto">
                  <p
                    className={`text-base sm:text-lg leading-relaxed text-slate-200 whitespace-pre-line ${fontClasses[selectedFont]}`}
                  >
                    "{customVerse || (language === "uz" ? "Ezgu orzularingiz ro'yobi doimo ko'zingizni quvontirsin." : language === "ru" ? "Пусть все ваши сокровенные мечты сбываются с легкостью и радостью." : "May your most cherished dreams and aspirations flourish in abundance.")}"
                  </p>
                </div>

                {/* Blessing Verse */}
                {customBlessing && (
                  <div className="inline-block px-5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <p className="text-xs sm:text-sm text-amber-200/90 font-medium">
                      ✦ {customBlessing} ✦
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer: Wax Seal Stamp & Signature */}
              <div className="relative z-10 flex items-end justify-between border-t border-white/10 pt-4">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {language === "uz" ? "Qadoq Muhr Raqami" : language === "ru" ? "Номер сургучной печати" : "Seal Protocol ID"}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">UZ-ATELIER-2026</span>
                </div>

                {/* Realistic Wax Seal Badge */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 border-2 border-amber-300/60 shadow-xl flex items-center justify-center text-center p-1 transform rotate-[-4deg]">
                    <div className="w-11 h-11 rounded-full border border-dashed border-amber-200/40 flex flex-col items-center justify-center">
                      <span className="text-[8px] tracking-wider uppercase font-extrabold text-amber-100 leading-none">
                        {sealText}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── LIVE NEURAL AUDIO RECITATION & INSTRUMENT SOUNDTRACK ─── */}
            <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 p-5 sm:p-6 rounded-3xl border-2 border-amber-300/80 dark:border-amber-400/40 shadow-luxury space-y-4 text-slate-900 dark:text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 stroke-[2.2] animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{language === "uz" ? "Ovozli Ijro & Musiqiy Jo'rlik" : language === "ru" ? "Голосовое Чтение с Музыкой" : "Voice Recitation & Music"}</span>
                      {isPlayingAudio && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span>{language === "uz" ? "Ijro etilmoqda" : "Playing"}</span>
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {language === "uz"
                        ? "Xattotlik tilagini sharqona cholg'u yoki pianino sadolari ostida tinglang"
                        : language === "ru"
                        ? "Слушайте поздравление под аутентичный ней или фортепиано"
                        : "Recite this card with authentic live instrumental accompaniment"}
                    </p>
                  </div>
                </div>

                {/* Primary Voice Toggle Button */}
                <button
                  onClick={handleToggleVoicePlayback}
                  className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 ${
                    isPlayingAudio
                      ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30"
                      : "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-amber-500/25"
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Square className="w-4 h-4 stroke-[2.2] fill-current" />
                      <span>{language === "uz" ? "Ijroni To'xtatish" : language === "ru" ? "Остановить" : "Stop Voice"}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 stroke-[2.2] fill-current" />
                      <span>{language === "uz" ? "Ovozli Eshitish (Musiqa bilan)" : language === "ru" ? "Слушать с музыкой" : "Recite Aloud"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Music Soundtrack Selector */}
              <div className="pt-2 border-t border-amber-200/60 dark:border-white/10 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mr-1">
                  {language === "uz" ? "Fon musiqasi:" : language === "ru" ? "Фоновая музыка:" : "Atmosphere:"}
                </span>
                {[
                  { id: "ney" as AmbientTrack, labelUz: "🪈 Sharqona Ney", labelRu: "🪈 Восточный Ней", labelEn: "🪈 Oriental Ney" },
                  { id: "piano" as AmbientTrack, labelUz: "🎹 Royal Pianino", labelRu: "🎹 Фортепиано", labelEn: "🎹 Royal Piano" },
                  { id: "lofi" as AmbientTrack, labelUz: "🌌 Lofi Tinchlik", labelRu: "🌌 Спокойный Лофай", labelEn: "🌌 Ambient Lofi" },
                  { id: "none" as AmbientTrack, labelUz: "🔇 Faqat Ovoz", labelRu: "🔇 Без музыки", labelEn: "🔇 Voice Only" },
                ].map((track) => {
                  const label = language === "uz" ? track.labelUz : language === "ru" ? track.labelRu : track.labelEn;
                  const selected = selectedMusic === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => {
                        cyberSound.playClick();
                        setSelectedMusic(track.id);
                        if (isPlayingAudio) {
                          ambientMusic.play(track.id);
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer active:scale-95 shadow-2xs ${
                        selected
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 font-black shadow-xs"
                          : "bg-white/90 dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 border-amber-200/70 dark:border-slate-700/80 hover:border-amber-400"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Export & Actions Row */}
            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-slate-900/90 dark:to-slate-950/90 p-6 rounded-3xl border-2 border-amber-200/80 dark:border-slate-800 shadow-luxury space-y-4 text-slate-900 dark:text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="px-4 py-2.5 bg-white/90 dark:bg-slate-800 hover:bg-amber-50 text-slate-800 dark:text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-200/80 dark:border-slate-700 cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <Copy className="w-4 h-4 stroke-[2.2] text-amber-600 dark:text-amber-400" />
                    <span>
                      {language === "uz" ? "Matnni Nusxalash" : language === "ru" ? "Скопировать текст" : "Copy Message"}
                    </span>
                  </button>

                  <button
                    onClick={handleShareTelegram}
                    className="px-4 py-2.5 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-500/20 cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-4 h-4 stroke-[2.2]" />
                    <span>
                      {language === "uz" ? "Telegramga Yuborish" : language === "ru" ? "Отправить в Telegram" : "Share via Telegram"}
                    </span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-2.5 bg-white/90 dark:bg-slate-800 hover:bg-amber-50 text-slate-800 dark:text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-200/80 dark:border-slate-700 cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <Printer className="w-4 h-4 stroke-[2.2] text-slate-500" />
                    <span>
                      {language === "uz" ? "Chop Etish" : language === "ru" ? "Распечатать" : "Print Card"}
                    </span>
                  </button>
                </div>

                <Link
                  href="/packaging-studio"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-2xl text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95"
                >
                  <PackageCheck className="w-4 h-4 stroke-[2.2]" />
                  <span>
                    {language === "uz" ? "Qadoqlash Qutisiga Biriktirish" : language === "ru" ? "Прикрепить к коробке" : "Attach to Packaging Box"}
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-amber-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2] text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {language === "uz" ? "Xattotlik qoidalariga mos" : language === "ru" ? "По канонам каллиграфии" : "Calligraphic precision"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2] text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {language === "uz" ? "Sovg'a qutisiga joylashga tayyor" : language === "ru" ? "Готово для коробки" : "Ready for gift packaging"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2] text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {language === "uz" ? "100% bepul va cheksiz" : language === "ru" ? "100% бесплатно и без лимитов" : "100% free & unlimited"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
