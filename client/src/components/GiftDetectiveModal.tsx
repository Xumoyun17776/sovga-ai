import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  X,
  Search,
  Sparkles,
  ShieldAlert,
  Flame,
  CheckCircle2,
  ExternalLink,
  ShoppingBag,
  Zap,
  Copy,
  Check,
  Send,
  Printer,
  Compass,
  Heart,
  User,
  Fingerprint,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { giftDetectiveApi, formatPrice } from "../lib/api";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation } from "../lib/i18n";
import { useToast } from "./Toast";
import confetti from "canvas-confetti";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const personaPresets = [
  {
    labelUz: "☕ Minimalist & Kitobxon",
    labelRu: "☕ Минималист & Книголюб",
    labelEn: "☕ Minimalist & Bookworm",
    target: "Yaqin do'st",
    textUz: "Estetik narsalarni yoqtiradi, qahva ichadi, tinchlikni qadrlaydi, ko'p mutolaa qiladi, ortiqcha shovqinni yoqtirmaydi.",
    textRu: "Любит эстетику, пьет кофе, ценит покой, много читает, не выносит лишнего шума и бесполезных вещей.",
    textEn: "Loves aesthetics, specialty coffee, calm environments, reading books, dislikes clutter.",
  },
  {
    labelUz: "💻 IT Dasturchi & Gadjetlar",
    labelRu: "💻 IT Разработчик & Гаджеты",
    labelEn: "💻 Software Engineer & Tech",
    target: "Hamkasb / Do'st",
    textUz: "Kun bo'yi kompyuterda ishlaydi, zamonaviy texnika, o'yinlar va qulay ish stolini qadrlaydi. Ergonomikaga e'tiborli.",
    textRu: "Работает за компьютером, ценит умные гаджеты, качественные наушники и эргономику рабочего места.",
    textEn: "Works at computer, loves smart tech gadgets, noise canceling audio, and desktop ergonomics.",
  },
  {
    labelUz: "🌸 Nafis & Go'zallik Ishqibozi",
    labelRu: "🌸 Эстетика & Уход за собой",
    labelEn: "🌸 Beauty & Self-care Enthusiast",
    target: "Sevgan yorim / Qiz o'rtoq",
    textUz: "O'ziga qarashni, terini parvarish qilishni, xushbo'y shamlar va bej rangdagi shinam dizaynni yoqtiradi.",
    textRu: "Обожает качественный уход за кожей, эстетичные свечи, уютные детали и теплые оттенки.",
    textEn: "Loves skincare routines, luxury scented candles, cozy home decor and warm aesthetic.",
  },
  {
    labelUz: "👑 Hurmatli Rahbar / Katta Yoshli",
    labelRu: "👑 Руководитель / Старший",
    labelEn: "👑 Executive & Senior Figure",
    target: "Rahbar / Otam",
    textUz: "Jiddiy, martabasi baland, an'analarni hurmat qiladi, sifatli qalam, teri va brend mahsulotlarni qadrlaydi.",
    textRu: "Статусный человек, ценит премиальное качество, кожаные аксессуары, традиции и надежность.",
    textEn: "High-status individual, values executive leather accessories, national heritage, and enduring quality.",
  },
];

export default function GiftDetectiveModal({ isOpen, onClose }: Props) {
  const { language } = useTranslation();
  const toast = useToast();

  const [targetPerson, setTargetPerson] = useState("Yaqin do'stim");
  const [gender, setGender] = useState("Ayol");
  const [age, setAge] = useState("20-30");
  const [personalityTraits, setPersonalityTraits] = useState("");
  const [budget, setBudget] = useState("500,000 UZS");
  const [occasion, setOccasion] = useState("Tug'ilgan kun");
  const [copiedScript, setCopiedScript] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: any) => giftDetectiveApi.profile(data),
    onSuccess: () => {
      cyberSound.playVictoryFanfare();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Tahlil jarayonida xatolik yuz berdi");
    },
  });

  if (!isOpen) return null;

  const handleStartInvestigation = () => {
    if (!personalityTraits.trim()) {
      toast.error(
        language === "uz"
          ? "Iltimos, insonning qiziqishlari yoki shaxsiyati haqida qisqacha yozing"
          : "Пожалуйста, опишите увлечения или характер человека"
      );
      return;
    }
    cyberSound.playConfirm();
    mutation.mutate({
      targetPerson,
      gender,
      age,
      personalityTraits,
      budget,
      occasion,
      language,
    });
  };

  const handleCopyScript = (text: string) => {
    cyberSound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    toast.success(
      language === "uz" ? "Nusxalandi! Sovg'a berayotganda ayting." : "Скопировано в буфер!",
      "Sovg'a Detektivi"
    );
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const dossier = mutation.data?.data;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card-luxury bg-white dark:bg-[#0c0e17] text-slate-900 dark:text-slate-100 rounded-3xl w-full max-w-4xl max-h-[92vh] max-h-[92dvh] flex flex-col shadow-luxury border-2 border-amber-300/80 dark:border-amber-500/30 relative my-auto animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white border-b border-white/10 relative">
          <button
            onClick={() => {
              cyberSound.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase mb-1">
            <Fingerprint className="w-4 h-4 text-amber-400 stroke-[2.2]" />
            <span>AI NEURAL GIFT DETECTIVE · FBI-GRADE PERSONA DOSSIER</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl icon-medallion icon-box-indigo flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-indigo-400 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight flex items-center gap-2">
                <span>
                  {language === "uz"
                    ? "AI Sovg'a Detektivi & Shaxsiyat Psixologiyasi"
                    : language === "ru"
                    ? "AI Детектив Подарков & Психология Личности"
                    : "AI Gift Detective & Psychological Persona DNA"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase font-mono">
                  PREMIUM
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
            {language === "uz"
              ? "Ushbu insonning qiziqishlari va xarakterini tahlil qilib, uning psixologik arxitipini, taqiqlangan sovg'alarini va 100% quvonch keltiradigan haqiqiy variantlarni aniqlaymiz."
              : language === "ru"
              ? "Анализ психотипа человека: скрытые триггеры дофамина, строгие анти-подарки и точный подбор с ценами в Узбекистане."
              : "Deep psychological profiling: decode persona archetypes, uncover fatal red-flag gifts, and pinpoint precision products."}
          </p>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* If no dossier yet, show inquiry form */}
          {!dossier ? (
            <div className="space-y-5 max-w-3xl mx-auto">
              {/* Quick Persona Templates */}
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  {language === "uz" ? "Tezkor Shaxsiyat Shabloni (1-bosishda):" : "Готовые шаблоны психотипа:"}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {personaPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        cyberSound.playClick();
                        setTargetPerson(preset.target);
                        setPersonalityTraits(
                          language === "uz" ? preset.textUz : language === "ru" ? preset.textRu : preset.textEn
                        );
                      }}
                      className="p-2.5 rounded-2xl border border-amber-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 text-left transition cursor-pointer group active:scale-95 shadow-2xs"
                    >
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block group-hover:text-amber-500 transition">
                        {language === "uz" ? preset.labelUz : language === "ru" ? preset.labelRu : preset.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === "uz" ? "Kimga beriladi?" : "Кому дарите?"}
                  </label>
                  <input
                    type="text"
                    value={targetPerson}
                    onChange={(e) => setTargetPerson(e.target.value)}
                    placeholder="Masalan: Yaqin do'stim, Onajonim..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === "uz" ? "Yoshi & Jinsi" : "Возраст и пол"}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="flex-1 px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium outline-none"
                    >
                      <option value="Ayol">Ayol (Female)</option>
                      <option value="Erkak">Erkak (Male)</option>
                      <option value="Bola">Bola (Child)</option>
                    </select>
                    <input
                      type="text"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Yosh: 25"
                      className="w-20 px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === "uz" ? "Byudjet & Sabab" : "Бюджет и повод"}
                  </label>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Masalan: 700,000 UZS"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium outline-none"
                  />
                </div>
              </div>

              {/* Personality Description Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === "uz"
                    ? "Insonning shaxsiyati, sevimli mashg'ulotlari, fe'l-atvori yoki Instagram/Telegram bio-si:"
                    : "Характер, увлечения, образ жизни или привычки человека:"}
                </label>
                <textarea
                  rows={4}
                  value={personalityTraits}
                  onChange={(e) => setPersonalityTraits(e.target.value)}
                  placeholder={
                    language === "uz"
                      ? "Masalan: Ko'p qahva ichadi, IT sohasida ishlaydi, kitob mutolaa qiladi, shovqindan charchaydi, sifatli va estetik jihozlarni qadrlaydi..."
                      : "Например: Любит хороший кофе, работает в IT, ценит тишину, читает нон-фикшн, обращает внимание на дизайн и материалы..."
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={handleStartInvestigation}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <>
                    <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>
                      {language === "uz"
                        ? "Psixologik dosye va O'zbekiston bozori tahlil qilinmoqda..."
                        : "Формирование психологического досье..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                    <span>
                      {language === "uz"
                        ? "🕵️‍♂️ Psixologik Tekshiruv & Dosyeni Ochish"
                        : "🕵️‍♂️ Сформировать Психологическое Досье"}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* ─── DOSSIER REVEAL SCREEN (SHOCK VALUE) ────────────────────────── */
            <div className="space-y-6 animate-fade-in">
              {/* Reset Button */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                  <Fingerprint className="w-4 h-4 text-amber-500 stroke-[2.2]" />
                  <span>DOSSIER #{Math.floor(100000 + Math.random() * 900000)} VERIFIED</span>
                </span>
                <button
                  onClick={() => {
                    cyberSound.playClick();
                    mutation.reset();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:text-amber-600 transition cursor-pointer shadow-2xs active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>{language === "uz" ? "Yangi tahlil" : "Новый анализ"}</span>
                </button>
              </div>

              {/* Archetype Hero Banner */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border border-amber-500/30 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono font-black uppercase tracking-wider">
                      {dossier.archetype.badge || "CLASS A+ ARCHETYPE"}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
                      {dossier.archetype.name}
                    </h3>
                  </div>

                  {/* 4-Metric Psychological Holographic Scores */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-400 block">Kreativlik</span>
                      <span className="text-sm font-black text-amber-400 font-mono">
                        {dossier.archetype.radarScores?.creativity || 88}%
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-400 block">Ratsionallik</span>
                      <span className="text-sm font-black text-cyan-400 font-mono">
                        {dossier.archetype.radarScores?.rationality || 92}%
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-400 block">Hissiyot</span>
                      <span className="text-sm font-black text-rose-400 font-mono">
                        {dossier.archetype.radarScores?.emotionality || 74}%
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-400 block">Texnologik</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {dossier.archetype.radarScores?.techSavviness || 85}%
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pt-2 border-t border-white/10">
                  {dossier.archetype.psychologicalSummary}
                </p>
              </div>

              {/* Dopamine Triggers vs Red Flags Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dopamine Triggers */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Zap className="w-4 h-4 stroke-[2.2]" />
                    <span>Dofamin & Hissiy Triggerlar</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {dossier.dopamineTriggers?.map((trig: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.2] shrink-0 mt-0.5" />
                        <span>{trig}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Strict Red Flags */}
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
                    <span>Taqiqlangan Sovg'alar (Red Flags)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {dossier.forbiddenRedFlags?.map((flag: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 stroke-[2.2] shrink-0 mt-0.5" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 3 Precision Matched Real Products */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  🎯 O'zbekiston Bozoridan 100% Aniq Munosib Sovg'alar:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {dossier.precisionGifts?.map((gift: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-500/40 transition"
                    >
                      <div className="space-y-2">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img
                            src={gift.imageUrl}
                            alt={gift.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/90 text-amber-400 font-mono text-[10px] font-bold border border-amber-400/30">
                            {gift.emotionalImpactScore} MOSLIK
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold">{gift.store}</span>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                            {gift.name}
                          </h4>
                          <span className="font-black text-amber-600 dark:text-amber-400 text-sm mt-1 block">
                            {formatPrice(gift.price)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          {gift.whyItWorks}
                        </p>
                      </div>

                      <a
                        href={gift.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>{gift.store}da ochish</span>
                        <ExternalLink className="w-3 h-3 stroke-[2.2] opacity-80" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Presentation Tactic & Script */}
              {dossier.presentationTactic && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50 dark:from-[#131626] dark:via-[#0f1120] dark:to-[#0b0d18] border-2 border-amber-200/80 dark:border-amber-500/30 shadow-luxury space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Lightbulb className="w-4 h-4 stroke-[2.2]" />
                      <span>Sovg'ani Taqdim Etish Taktikasi & Nutq</span>
                    </div>

                    <button
                      onClick={() => handleCopyScript(dossier.presentationTactic.exactWordsToSay)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-300/70 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 text-xs font-bold transition cursor-pointer active:scale-95 shadow-2xs"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.2]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.2]" />}
                      <span>{copiedScript ? "Nusxalandi!" : "Nutqdan nusxa olish"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                        Qachon va qanday berish:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {dossier.presentationTactic.deliveryMoment}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                        Aytiladigan samimiy so'zlar:
                      </span>
                      <blockquote className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800 italic text-slate-800 dark:text-slate-200 font-medium">
                        "{dossier.presentationTactic.exactWordsToSay}"
                      </blockquote>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
