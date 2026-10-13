import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { research } from "../lib/api";
import { useToast } from "../components/Toast";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation, tr } from "../lib/i18n";
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
} from "../lib/icons";
import { ambientMusic, AmbientTrack } from "../lib/ambientMusic";
import { copyText } from "../lib/clipboard";

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
    cardBg: "text-amber-100 bg-slate-900",
    textColor: "text-amber-100",
    accentColor: "text-amber-400",
    borderClass: "border-amber-500/40 shadow-sm ring-1 ring-amber-400/20",
    goldAccent: "bg-amber-300",
  },
  feruza_arabesque: {
    id: "feruza_arabesque",
    name: "Samarqand Feruzasi & Naqsh",
    badge: "Sharqona Naqsh",
    bgClass: "bg-cyan-950",
    cardBg: "text-cyan-100 bg-teal-950",
    textColor: "text-cyan-100",
    accentColor: "text-cyan-300",
    borderClass: "border-cyan-400/30 shadow-sm ring-1 ring-cyan-300/20",
    goldAccent: "bg-cyan-200",
  },
  adras_silk: {
    id: "adras_silk",
    name: "Marg'ilon Adras Ipag'i",
    badge: "Ipak Nafisligi",
    bgClass: "bg-rose-950",
    cardBg: "text-rose-100 bg-stone-900",
    textColor: "text-rose-100",
    accentColor: "text-rose-300",
    borderClass: "border-rose-400/30 shadow-sm ring-1 ring-rose-300/20",
    goldAccent: "bg-rose-200",
  },
  swiss_platinum: {
    id: "swiss_platinum",
    name: "Shveysariya Mat Platinasi",
    badge: "Minimalist Elegans",
    bgClass: "bg-slate-900",
    cardBg: "text-slate-100 bg-slate-900",
    textColor: "text-slate-100",
    accentColor: "text-indigo-300",
    borderClass: "border-slate-600 shadow-sm ring-1 ring-slate-500/20",
    goldAccent: "bg-slate-200",
  },
};

const get_OCCASIONS = (): { key: OccasionKey; label: string }[] => [
  { key: "birthday", label: tr("Tavallud kuni", "День рождения", "Birthday") },
  { key: "wedding", label: tr("Nikoh to'yi", "Свадьба", "Wedding") },
  { key: "parents", label: tr("Ota-ona ehtiromi", "Родителям", "For parents") },
  { key: "eid", label: tr("Hayit ayyomi", "Хайит", "Eid") },
  { key: "navruz", label: tr("Navro'zi Olam", "Навруз", "Navruz") },
  { key: "beshik", label: tr("Beshik to'yi", "Бешик-той", "Beshik toy (new baby)") },
  { key: "kelin", label: tr("Kelin salom", "Келин салом", "Kelin salom") },
  { key: "newyear", label: tr("Yangi yil", "Новый год", "New Year") },
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
    copyText(fullText);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
      colors: ["#d9431f", "#b53518", "#4338ca"],
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
    <div className="min-h-screen text-slate-900 dark:text-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors relative overflow-hidden animate-fade-in">
      {/* Ambient luxury glow */}

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3.5">
          <h1 className="lux-title text-[2.4rem] sm:text-[3.2rem] text-slate-900 dark:text-white leading-[1.05]">
            {language === "uz" ? "Tabriknoma" : language === "ru" ? "Открытка" : "Greeting card"}
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            {language === "uz" ? "Tabrik matnini o'zingiz yozing yoki tayyor matnni tanlang, so'ng uslub va bezakni belgilang." : language === "ru" ? "Напишите поздравление сами или выберите готовое, затем подберите стиль и оформление." : "Write your own message or pick a ready one, then choose the style and decoration."}
          </p>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Controls & Presets (5 cols) */}
          <div className="bg-white dark:bg-[#0b1224] lg:col-span-5 space-y-6 p-6 sm:p-7 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 shadow-sm text-slate-900 dark:text-white">
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
                className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-950 border border-[var(--line)] dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition shadow-2xs"
              />
            </div>

            {/* Occasion Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === "uz" ? "Qutlov Munosabati" : language === "ru" ? "Повод для поздравления" : "Celebration Occasion"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {get_OCCASIONS().map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      cyberSound.playClick();
                      setOccasion(item.key);
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-semibold transition border text-center cursor-pointer ${
                      occasion === item.key
                        ? "text-white border-amber-500 font-bold shadow-md bg-amber-500"
                        : "bg-white/90 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)]"
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
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between h-20 cursor-pointer shadow-2xs ${
                      selectedTheme === t.id
                        ? "border-amber-500 bg-amber-50/60 dark:bg-slate-950 ring-2 ring-amber-400/50 shadow-md"
                        : "border-[var(--line)] dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 hover:border-[var(--line-strong)]"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">
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
                    className={`py-2 text-center rounded-xl text-xs transition border cursor-pointer ${
                      selectedFont === f.key
                        ? "text-white border-amber-400 font-bold shadow-xs bg-amber-500"
                        : "bg-white/90 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)]"
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
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                      sealText === s
                        ? "bg-amber-600/25 text-amber-900 dark:text-amber-300 border-amber-400 font-bold shadow-2xs"
                        : "bg-white/90 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Verse Templates */}
            <div className="space-y-2 pt-2 border-t border-[var(--line)] dark:border-slate-800">
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
                    className="w-full text-left p-3.5 rounded-2xl bg-white/90 dark:bg-slate-950/70 border border-[var(--line)] dark:border-slate-800/80 hover:border-[var(--line-strong)] hover:bg-amber-50/30 transition group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                      <span>{card.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
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
                className="w-full p-3 bg-white/90 dark:bg-slate-950 border border-[var(--line)] dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition shadow-2xs"
              />
            </div>
          </div>

          {/* Right Column: Visual Card Preview & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* The Luxury Visual Canvas */}
            <div
              id="printable-card"
              className={`relative p-5 sm:p-12 rounded-2xl sm:rounded-[2.5rem] border transition-all duration-300 min-h-[400px] sm:min-h-[440px] flex flex-col justify-between overflow-hidden ${currentTheme.cardBg} ${currentTheme.borderClass}`}
            >
              {/* Background Luxury Guilloché / Pattern Accents */}

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
                    <span className="text-[10px] tracking-wide uppercase font-bold text-amber-400/80 block">
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
                      <span className="w-1 h-3 bg-amber-400 rounded-full" />
                      <span className="w-1 h-5 bg-amber-400 rounded-full [animation-delay:0.12s]" />
                      <span className="w-1 h-2.5 bg-amber-400 rounded-full [animation-delay:0.24s]" />
                      <span className="w-1 h-4 bg-amber-400 rounded-full [animation-delay:0.36s]" />
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
                  <span className="text-xs tracking-wide uppercase font-mono text-amber-400/80">
                    {language === "uz" ? "Hurmat va ehtirom ila:" : language === "ru" ? "С глубоким уважением:" : "Presented with deepest regard to:"}
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white font-display">
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
                    {language === "uz" ? "Qadoq Muhr Raqami" : language === "ru" ? "Номер сургучной печати" : "Card ID"}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">UZ-ATELIER-2026</span>
                </div>

                {/* Realistic Wax Seal Badge */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full border border-[var(--line)] shadow-sm flex items-center justify-center text-center p-1 transform rotate-[-4deg] bg-amber-600">
                    <div className="w-11 h-11 rounded-full border border-dashed border-[var(--line)] flex flex-col items-center justify-center">
                      <span className="text-[8px] tracking-wider uppercase font-semibold text-amber-100 leading-none">
                        {sealText}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── LIVE NEURAL AUDIO RECITATION & INSTRUMENT SOUNDTRACK ─── */}
            <div className="p-5 sm:p-6 rounded-2xl border border-[var(--line)] dark:border-amber-400/40 shadow-sm space-y-4 text-slate-900 dark:text-white bg-amber-500/15">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{language === "uz" ? "Ovozli Ijro & Musiqiy Jo'rlik" : language === "ru" ? "Голосовое Чтение с Музыкой" : "Voice Recitation & Music"}</span>
                      {isPlayingAudio && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
                  className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    isPlayingAudio
                      ? "bg-rose-500 hover:bg-rose-600 text-white"
                      : "text-white bg-amber-500 hover:bg-amber-400"
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
              <div className="pt-2 border-t border-[var(--line)] dark:border-white/10 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mr-1">
                  {language === "uz" ? "Fon musiqasi:" : language === "ru" ? "Фоновая музыка:" : "Atmosphere:"}
                </span>
                {[
                  { id: "ney" as AmbientTrack, labelUz: "Sharqona Ney", labelRu: "Восточный Ней", labelEn: "Oriental Ney" },
                  { id: "piano" as AmbientTrack, labelUz: "Royal Pianino", labelRu: "Фортепиано", labelEn: "Royal Piano" },
                  { id: "lofi" as AmbientTrack, labelUz: tr("Lofi Tinchlik", "Спокойный лофай", "Ambient Lofi"), labelRu: "Спокойный Лофай", labelEn: "Ambient Lofi" },
                  { id: "none" as AmbientTrack, labelUz: tr("Faqat Ovoz", "Без музыки", "Voice only"), labelRu: "Без музыки", labelEn: "Voice Only" },
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
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer shadow-2xs ${
                        selected
                          ? "text-white border-amber-400 font-bold shadow-xs bg-amber-500"
                          : "bg-white/90 dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 border-[var(--line)] dark:border-slate-700/80 hover:border-[var(--line-strong)]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Export & Actions Row */}
            <div className="bg-white dark:bg-[#0b1224] p-6 rounded-2xl border border-[var(--line)] dark:border-slate-800 shadow-sm space-y-4 text-slate-900 dark:text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="px-4 py-2.5 bg-white/90 dark:bg-slate-800 hover:bg-amber-50 text-slate-800 dark:text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--line)] dark:border-slate-700 cursor-pointer shadow-2xs"
                  >
                    <Copy className="w-4 h-4 stroke-[2.2] text-amber-600 dark:text-amber-400" />
                    <span>
                      {language === "uz" ? "Matnni Nusxalash" : language === "ru" ? "Скопировать текст" : "Copy Message"}
                    </span>
                  </button>

                  <button
                    onClick={handleShareTelegram}
                    className="px-4 py-2.5 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 stroke-[2.2]" />
                    <span>
                      {language === "uz" ? "Telegramga Yuborish" : language === "ru" ? "Отправить в Telegram" : "Share via Telegram"}
                    </span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-2.5 bg-white/90 dark:bg-slate-800 hover:bg-amber-50 text-slate-800 dark:text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-[var(--line)] dark:border-slate-700 cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-4 h-4 stroke-[2.2] text-slate-500" />
                    <span>
                      {language === "uz" ? "Chop Etish" : language === "ru" ? "Распечатать" : "Print Card"}
                    </span>
                  </button>
                </div>

                <Link
                  href="/packaging-studio"
                  className="px-5 py-2.5 text-white font-bold rounded-2xl text-xs transition flex items-center gap-2 shadow-sm bg-amber-500 hover:bg-amber-400"
                >
                  <PackageCheck className="w-4 h-4 stroke-[2.2]" />
                  <span>
                    {language === "uz" ? "Qadoqlash Qutisiga Biriktirish" : language === "ru" ? "Прикрепить к коробке" : "Attach to Packaging Box"}
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[var(--line)] dark:border-slate-800/80 text-slate-600 dark:text-slate-400 text-[11px]">
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
