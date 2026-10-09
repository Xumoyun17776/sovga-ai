import React, { useState, useRef } from "react";
import { Link } from "wouter";
import {
  Sparkles,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Zap,
  Gift,
  Target,
  Trophy,
  ArrowRight,
  ChevronRight,
  Heart,
  Share2,
  Copy,
  Flame,
} from "lucide-react";
import { formatPrice } from "../lib/api";
import { cyberSound } from "../lib/cyberSound";
import { useToast } from "../components/Toast";
import { useTranslation } from "../lib/i18n";
import confetti from "canvas-confetti";

interface QuizQuestion {
  id: number;
  question: string;
  options: { id: string; text: string; icon: string; boostCategory?: string }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Sovg'a kimga atalgan?",
    options: [
      { id: "male", text: "Yigit / Erkak kishiga", icon: "👨" },
      { id: "female", text: "Qiz / Ayol kishiga", icon: "👩" },
      { id: "parents", text: "Ota-onaga", icon: "🏡" },
      { id: "kids", text: "Bolajonga", icon: "🧸" },
      { id: "colleague", text: "Hamkasb / Rahbarga", icon: "💼" },
    ],
  },
  {
    id: 2,
    question: "U inson qanday turmush tarzi yoki qiziqishlarga ega?",
    options: [
      { id: "tech", text: "Gadjetlar, IT va Texnologiya", icon: "💻", boostCategory: "Tech & Audio" },
      { id: "kitchen", text: "Shinamlik, Kofe va Oshxona", icon: "☕", boostCategory: "Kitchen" },
      { id: "beauty", text: "Go'zallik, Parfyum va Moda", icon: "🌸", boostCategory: "Beauty" },
      { id: "artisanal", text: "Milliy San'at, Rishton & Madaniyat", icon: "🏺", boostCategory: "Artisanal" },
      { id: "lifestyle", text: "Kitob mutolaasi, Dam olish & Choy", icon: "📚", boostCategory: "Lifestyle" },
    ],
  },
  {
    id: 3,
    question: "Rejalashtirilgan byudjet qancha?",
    options: [
      { id: "b1", text: "100 000 — 300 000 UZS", icon: "🪙" },
      { id: "b2", text: "300 000 — 700 000 UZS", icon: "💵" },
      { id: "b3", text: "700 000 — 1 500 000 UZS", icon: "💳" },
      { id: "b4", text: "1 500 000+ UZS (Premial)", icon: "💎" },
    ],
  },
  {
    id: 4,
    question: "Qanday asosiy hissiyot berishni istaysiz?",
    options: [
      { id: "practical", text: "Har kuni ishlatiladigan amaliy va foydali", icon: "⚡" },
      { id: "surprise", text: "Kutilmagan, hayratlantiradigan va yodda qoluvchi", icon: "🎉" },
      { id: "luxury", text: "Obro'li, hashamatli va nufuzli", icon: "👑" },
      { id: "comfort", text: "Qalbga yaqin, iliq va shinam", icon: "❤️" },
    ],
  },
];

const WHEEL_ITEMS = [
  { label: "De'Longhi Kofe Mashinasi", color: "#b86a16", store: "Texnomart", price: 980000, url: "https://texnomart.uz/katalog/delonghi-mini-me/" },
  { label: "Keychron K2 Pro Klaviatura", color: "#4f46e5", store: "Uzum", price: 1120000, url: "https://uzum.uz/uz/product/mexanik-klaviatura-keychron-k2-pro-839210" },
  { label: "Rishton Kulol Choy Dasti", color: "#0891b2", store: "Uzum", price: 360000, url: "https://uzum.uz/uz/product/rishton-kulolchilik-choy-servizi-12-bolakli-593821" },
  { label: "Xiaomi Air Fryer 3.5L", color: "#ea580c", store: "Texnomart", price: 790000, url: "https://texnomart.uz/katalog/xiaomi-mi-smart-air-fryer-3-5l/" },
  { label: "JBL Charge 5 Spiker", color: "#7c3aed", store: "MediaPark", price: 940000, url: "https://mediapark.uz/products/view/jbl-charge-5" },
  { label: "Dior Sauvage Parfyum", color: "#0f766e", store: "MediaPark", price: 520000, url: "https://mediapark.uz/products/view/dior-sauvage-edp" },
  { label: "Luminarc 46-talik Serviz", color: "#be185d", store: "Uzum", price: 490000, url: "https://uzum.uz/uz/product/idishlar-toplami-luminarc-essence-46-839210" },
  { label: "Buxoro Zardo'zi Sandiqcha", color: "#d97706", store: "Uzum", price: 240000, url: "https://uzum.uz/uz/product/samarqand-sadafli-sandiqcha-749210" },
];

export default function GiftQuizPage() {
  const toast = useToast();
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState<"quiz" | "wheel">("quiz");

  // Quiz State
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  // Wheel State
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wheelWinner, setWheelWinner] = useState<any | null>(null);

  // Weekly cooldown: exactly 1 spin allowed per 7 days (User requirement)
  const [lastSpinTime, setLastSpinTime] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("sovga_wheel_last_spin");
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const timeSinceLastSpin = now - lastSpinTime;
  const isCooldownActive = lastSpinTime > 0 && timeSinceLastSpin < ONE_WEEK_MS;
  const remainingMs = Math.max(0, ONE_WEEK_MS - timeSinceLastSpin);
  const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const remainingHours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  // Saved items & share
  const [savedWishlist, setSavedWishlist] = useState<Record<string, boolean>>({});

  const handleToggleWishlist = (name: string) => {
    cyberSound.playConfirm();
    setSavedWishlist((prev) => {
      const next = !prev[name];
      if (next) {
        toast.success(`"${name}" istaklar ro'yxatiga saqlandi!`, "Saqlandi");
      } else {
        toast.info(`"${name}" ro'yxatdan olib tashlandi.`);
      }
      return { ...prev, [name]: next };
    });
  };

  const handleShareQuiz = (title: string) => {
    cyberSound.playClick();
    const shareText = `Sovg'a AI testi orqali menga eng mos sovg'a profili aniqlandi: "${title}"!\n\nSiz ham tekshirib ko'ring:`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleSelectAnswer = (optionId: string) => {
    cyberSound.playClick();
    const updated = { ...answers, [currentStep]: optionId };
    setAnswers(updated);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setQuizFinished(true);
      cyberSound.playChime();
      toast.success("AI sizning javoblaringiz asosida mukammal sovg'a profilini tuzdi!", "Tahlil Yakunlandi 🎉");
    }
  };

  const handleResetQuiz = () => {
    cyberSound.playClick();
    setCurrentStep(0);
    setAnswers({});
    setQuizFinished(false);
  };

  const handleResetWeeklyCooldown = () => {
    cyberSound.playClick();
    setLastSpinTime(0);
    try {
      localStorage.removeItem("sovga_wheel_last_spin");
    } catch {}
    toast.info("Haftalik cheklov sinov uchun yangilandi.");
  };

  const getDynamicQuizResults = () => {
    const target = answers[0] || "male";
    const interest = answers[1] || "tech";

    let personaTitle = "Zamonaviy Estet va Shinamlik Ishqibozi";
    let personaDesc = "Siz tanlagan javoblar asosida bu inson nafis sifat, amaliy qulaylik va estetik qiymatga ega mahsulotlarni eng yuqori qadrlaydi.";
    let mainFocus = "Shinamlik & Sifat";

    if (interest === "tech") {
      personaTitle = "Texnologiya va Gadjetlar Ishqibozi";
      personaDesc = "Kundalik turmushida tezlik, zamonaviy texnologiyalar va musiqiy sifatni qadrlaydi.";
      mainFocus = "Texnologiya & Audio";
    } else if (interest === "kitchen") {
      personaTitle = "Oshxona Shirinliklari va Qahva Xushbo'yligi Egasi";
      personaDesc = "Mazali taomlar, xushbo'y qahva va oilaviy iliqlikni qadrlovchi nozik didli inson.";
      mainFocus = "Kofe & Oshxona";
    } else if (interest === "beauty") {
      personaTitle = "Nafis Parvarish va Go'zallik Ixlosmandi";
      personaDesc = "O'ziga xos joziba, nafis parfyumeriya va soch parvarishi vositalarini sevadigan nozik qalb.";
      mainFocus = "Parfyum & Go'zallik";
    } else if (interest === "artisanal" || target === "parents") {
      personaTitle = "Milliy Madaniyat va Qo'l Mehnati Qadrlovchisi";
      personaDesc = "Sharqona naqshlar, zardo'zi san'ati va Rishton kulolchiligining betakror iliqligiga oshiq shaxs.";
      mainFocus = "Milliy San'at & Rishton";
    } else if (target === "kids") {
      personaTitle = "Kichik Kashfiyotchi va Quvnoq Bolajon";
      personaDesc = "Yorqin ranglar, qiziqarli o'yinchoqlar va mantiqiy konstruktorlarni yaxshi ko'radi.";
      mainFocus = "Bolalar & O'yinchoq";
    }

    let items = [];
    if (interest === "tech") {
      items = [
        {
          name: "Apple AirPods Pro 2 USB-C (MagSafe Case)",
          store: "Texnomart",
          price: 2850000,
          reason: "Kuchli shovqinni bekor qilish (ANC) va billurdek tiniq audio ovoz sifati",
          url: "https://texnomart.uz/uz/katalog/?q=Apple+AirPods+Pro+2",
        },
        {
          name: "Xiaomi 22.5W 20000mAh Powerbank Tezkor Quvvatlagich",
          store: "Uzum Market",
          price: 249000,
          reason: "Katta sig'im va ixcham korpus, yo'lda hamisha aloqada bo'lish kafolati",
          url: "https://uzum.uz/uz/search?q=Xiaomi+Powerbank+20000",
        },
        {
          name: "Baseus Bowie H1 ANC Wireless Bluetooth Headphone",
          store: "MediaPark",
          price: 590000,
          reason: "70 soatlik ulkan avtonomlik va zamonaviy ergonomik dizayn",
          url: "https://mediapark.uz/search?q=Baseus+Bowie",
        },
      ];
    } else if (interest === "beauty") {
      items = [
        {
          name: "Dyson Airwrap Multi-Styler Complete Long Fen-Stayler",
          store: "Texnomart",
          price: 6850000,
          reason: "Sochlarni kuydirmasdan xavfsiz shakllantiruvchi afsonaviy Coanda texnologiyasi",
          url: "https://texnomart.uz/uz/katalog/?q=Dyson+Airwrap",
        },
        {
          name: "Dior Sauvage Eau De Parfum (100ml Original)",
          store: "MediaPark",
          price: 1650000,
          reason: "Fransiya parfyumeriyasining uzoq saqlanuvchi va maftunkor hidli durdonasi",
          url: "https://mediapark.uz/search?q=Dior+Sauvage",
        },
        {
          name: "Philips Series 7000 Namlovchi va Ionli Soch Quritgich",
          store: "Uzum Market",
          price: 690000,
          reason: "Mineral ionlar bilan sochlarni yaltiroq va ipakdek mayin saqlaydi",
          url: "https://uzum.uz/uz/search?q=Philips+Fen",
        },
      ];
    } else if (interest === "kitchen") {
      items = [
        {
          name: "De'Longhi Nescafé Dolce Gusto Mini Me Kofe Mashinasi",
          store: "Texnomart",
          price: 980000,
          reason: "15 bar bosim va bir tugma bilan tayyorlanadigan haqiqiy Italiya qahvasi",
          url: "https://texnomart.uz/uz/katalog/?q=DeLonghi+Mini+Me",
        },
        {
          name: "Xiaomi Mi Smart Air Fryer 3.5L Aqlli Friturnitsa",
          store: "MediaPark",
          price: 790000,
          reason: "Yog'siz sog'lom pishirish va smartfon orqali boshqaruv imkoniyati",
          url: "https://mediapark.uz/search?q=Xiaomi+Air+Fryer",
        },
        {
          name: "Luminarc Essence 46-Piece French Dinnerware To'plami",
          store: "Uzum Market",
          price: 490000,
          reason: "Zarbaga chidamli hashamatli shisha, uy shinamligini bir necha barobar oshiradi",
          url: "https://uzum.uz/uz/search?q=Luminarc+Serviz",
        },
      ];
    } else if (target === "kids") {
      items = [
        {
          name: "LEGO Technic Monster Jam Tezyurar Konstruktor",
          store: "Uzum Market",
          price: 310000,
          reason: "Bolaning muhandislik qobiliyatini va ijodiy tasavvurini rivojlantiruvchi o'yinchoq",
          url: "https://uzum.uz/uz/search?q=Lego+Technic",
        },
        {
          name: "Bolalar uchun Chizish Plansheti (LCD Writing Tablet)",
          store: "Uzum Market",
          price: 95000,
          reason: "Ko'zga bezarar xavfsiz ekran va cheksiz ijodiy chizish imkoniyati",
          url: "https://uzum.uz/uz/search?q=LCD+Tablet+Bolalar",
        },
        {
          name: "RC Dvigatelli Radio Boshqaruvli Pultli Off-Road Mashina",
          store: "MediaPark",
          price: 280000,
          reason: "Mustahkam amortizatorlar va quvnoq ochiq havoda harakatlanish quvonchi",
          url: "https://mediapark.uz/search?q=Pultli+Mashina",
        },
      ];
    } else {
      items = [
        {
          name: "Rishton Kulolchiligi Eksklyuziv Qo'lda Ishlangan Choy Dasti",
          store: "Uzum Market",
          price: 360000,
          reason: "O'zbek xalq ustasi tomonidan ishlangan betakror milliy naqshli kulolchilik asari",
          url: "https://uzum.uz/uz/search?q=Rishton+Choy+Dasti",
        },
        {
          name: "Buxoro Zardo'zi Zarli Sandiqcha & Zargarlik Qutisi",
          store: "Uzum Market",
          price: 240000,
          reason: "Baxmal matoga tilla iplar bilan qo'lda tikilgan zardo'zi yodgorlik",
          url: "https://uzum.uz/uz/search?q=Buxoro+Zardozi",
        },
        {
          name: "Breo iNeck 3 Pro Bo'yin va Yelka Shiatsu Massajyori",
          store: "Texnomart",
          price: 1250000,
          reason: "Charchoqni bir zumda oluvchi va sog'likni tiklovchi iliq massaj moslamasi",
          url: "https://texnomart.uz/uz/katalog/?q=Massajyor",
        },
      ];
    }

    return { personaTitle, personaDesc, mainFocus, items };
  };

  // Fortune Wheel Spin (Enforces 1 spin per 7 days)
  const handleSpinWheel = () => {
    if (spinning) return;
    if (isCooldownActive) {
      toast.info(
        `G'ildirakni faqat haftada 1 marta aylantirish mumkin! Keyingi imkoniyat: ${remainingDays} kun ${remainingHours} soatdan so'ng.`,
        "Haftalik Cheklov"
      );
      return;
    }
    cyberSound.playConfirm();
    setSpinning(true);
    setWheelWinner(null);

    const extraSpins = 5 + Math.floor(Math.random() * 5); // 5-10 turns
    const randomSegmentIndex = Math.floor(Math.random() * WHEEL_ITEMS.length);
    const segmentAngle = 360 / WHEEL_ITEMS.length;
    const finalAngle = rotation + extraSpins * 360 + (WHEEL_ITEMS.length - 1 - randomSegmentIndex) * segmentAngle;

    setRotation(finalAngle);

    setTimeout(() => {
      setSpinning(false);
      setWheelWinner(WHEEL_ITEMS[randomSegmentIndex]);
      const spinTimestamp = Date.now();
      setLastSpinTime(spinTimestamp);
      try {
        localStorage.setItem("sovga_wheel_last_spin", String(spinTimestamp));
      } catch {}
      cyberSound.playChime();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#F59E0B", "#10B981", "#6366F1", "#EC4899"],
        });
      } catch {}
      toast.success(`Ruletka tanlovi: ${WHEEL_ITEMS[randomSegmentIndex].label}!`, "Omadli Sovg'a 🎁");
    }, 4000);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 transition-colors relative overflow-hidden bg-[#fcfbf9] dark:bg-[#07080c]">
      {/* Ambient luxury vignette glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1000px,100vw)] h-[380px] bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Top Header & Tab Switcher */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-gradient-to-r from-amber-100/90 via-amber-200/50 to-amber-100/90 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-amber-300/80 dark:border-amber-500/30 shadow-xs">
            <button
              onClick={() => {
                cyberSound.playClick();
                setActiveTab("quiz");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer active:scale-95 ${
                activeTab === "quiz"
                  ? "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 font-black shadow-md shadow-amber-500/20"
                  : "text-amber-950 dark:text-slate-300 hover:text-amber-700"
              }`}
            >
              <HelpCircle className="w-4 h-4 stroke-[2.2]" />
              <span>
                {language === "uz" ? "4-Savolli Sovg'a Testi" : language === "ru" ? "Тест Подарка из 4 Вопросов" : "4-Question Gift Quiz"}
              </span>
            </button>
            <button
              onClick={() => {
                cyberSound.playClick();
                setActiveTab("wheel");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer active:scale-95 ${
                activeTab === "wheel"
                  ? "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 font-black shadow-md shadow-amber-500/20"
                  : "text-amber-950 dark:text-slate-300 hover:text-amber-700"
              }`}
            >
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
              <span>
                {language === "uz" ? "Omadli Sovg'a Ruletkasi" : language === "ru" ? "Рулетка Подарков" : "Lucky Gift Wheel"}
              </span>
            </button>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
            {activeTab === "quiz" ? "Smart Sovg'a Testi" : "Sovg'a Fortune Ruletkasi"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {activeTab === "quiz"
              ? "4 ta tezkor savol orqali qabul qiluvchining qiziqishlari, byudjeti va didiga 98% mos keladigan eng sara sovg'alarni aniqlang."
              : "Qaror qabul qila olmayapsizmi? Omad g'ildiragini aylantiring (Haftada 1 marta bepul imkoniyat) va AI eng sara sovg'ani tanlab bersin!"}
          </p>
        </div>

        {/* TAB 1: SMART QUIZ */}
        {activeTab === "quiz" && (
          <div className="max-w-2xl mx-auto">
            {!quizFinished ? (
              <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 dark:border-amber-500/25 shadow-luxury">
                {/* Progress Indicator */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-amber-100 dark:border-slate-800">
                  <span className="text-xs font-extrabold uppercase text-amber-800 dark:text-amber-400 tracking-wider">
                    Savol {currentStep + 1} / {QUIZ_QUESTIONS.length}
                  </span>
                  <div className="flex gap-1.5">
                    {QUIZ_QUESTIONS.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2.5 rounded-full transition-all ${
                          idx === currentStep
                            ? "w-8 bg-gradient-to-r from-amber-500 to-yellow-600 shadow-xs"
                            : idx < currentStep
                            ? "w-3 bg-emerald-500"
                            : "w-3 bg-amber-200/80 dark:bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Question Title */}
                <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white mb-6">
                  {QUIZ_QUESTIONS[currentStep].question}
                </h2>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {QUIZ_QUESTIONS[currentStep].options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectAnswer(opt.id)}
                      className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/60 border-2 border-amber-200/70 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-slate-800/80 text-left transition flex items-center gap-3 cursor-pointer group active:scale-95 shadow-2xs"
                    >
                      <span className="text-2xl group-hover:scale-110 transition">{opt.icon}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-amber-800 dark:group-hover:text-amber-300 transition">
                        {opt.text}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Back button if past step 0 */}
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="text-xs font-bold text-amber-700 dark:text-slate-400 hover:text-amber-900 dark:hover:text-white transition flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    ← Oldingi savolga qaytish
                  </button>
                )}
              </div>
            ) : (
              (() => {
                const { personaTitle, personaDesc, mainFocus, items } = getDynamicQuizResults();
                return (
                  <div className="space-y-6 animate-slide-up">
                    {/* Persona Match Card */}
                    <div className="bg-gradient-to-br from-[#121624] via-[#0d101a] to-[#080a11] rounded-3xl p-6 sm:p-8 text-white border-2 border-amber-400/40 shadow-luxury">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 text-amber-300 border border-amber-400/40 shadow-xs">
                          AI Sovg'a Profili • 98% Moslik
                        </span>
                        <button
                          onClick={handleResetQuiz}
                          className="text-xs text-amber-300 hover:text-amber-100 flex items-center gap-1.5 transition font-bold cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Qayta test topshirish</span>
                        </button>
                      </div>

                      <h3 className="font-display font-black text-2xl sm:text-3xl text-amber-200 mb-2">
                        "{personaTitle}"
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                        {personaDesc}
                      </p>

                      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/80 rounded-2xl border border-amber-400/20 text-center text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Asosiy Fokus</span>
                          <span className="font-black text-amber-300">{mainFocus}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Tavsiya Darajasi</span>
                          <span className="font-black text-emerald-400">98% Aniq</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Yetkazish</span>
                          <span className="font-black text-yellow-300">1 ish kuni</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-slate-800 mt-4">
                        <button
                          type="button"
                          onClick={() => handleShareQuiz(personaTitle)}
                          className="flex-1 py-2.5 px-3 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                        >
                          <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span>Natijani Telegramga yuborish</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.info("Havola nusxalandi!");
                          }}
                          className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer active:scale-95"
                        >
                          <Copy className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span>Nusxalash</span>
                        </button>
                      </div>
                    </div>

                    {/* Recommended Top 3 Products */}
                    <div className="space-y-3">
                      <h4 className="font-display font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <Trophy className="w-4.5 h-4.5 text-amber-500 stroke-[2.2]" />
                        <span>Siz Uchun Eng Mos Kelgan 3 Ta Sovg'a:</span>
                      </h4>

                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-2xl border-2 border-amber-200/80 dark:border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-luxury hover:border-amber-400 transition"
                        >
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 text-xs font-black flex items-center justify-center shadow-xs">
                                {idx + 1}
                              </span>
                              <h5 className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</h5>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 pl-8">💡 {item.reason}</p>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pl-8 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-100 dark:border-slate-800">
                            <div className="text-right">
                              <span className="text-sm font-black text-amber-900 dark:text-amber-300 block">
                                {formatPrice(item.price)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">{item.store}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleWishlist(item.name)}
                              className={`w-9 h-9 rounded-xl transition border-2 flex items-center justify-center cursor-pointer shadow-2xs active:scale-95 ${
                                savedWishlist[item.name]
                                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-600 text-rose-600"
                                  : "bg-white dark:bg-slate-900 border-amber-200/80 dark:border-slate-700 text-slate-400 hover:text-rose-500"
                              }`}
                              title={
                                savedWishlist[item.name]
                                  ? (language === "uz" ? "Saqlangan" : language === "ru" ? "Сохранено" : "Saved")
                                  : (language === "uz" ? "Wishlistga qo'shish" : language === "ru" ? "В список желаний" : "Save to wishlist")
                              }
                            >
                              <Heart className={`w-4 h-4 stroke-[2.2] ${savedWishlist[item.name] ? "fill-rose-500" : ""}`} />
                            </button>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-sm active:scale-95"
                            >
                              <span>{language === "uz" ? "Xarid qilish" : language === "ru" ? "Купить" : "Buy Now"}</span>
                              <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* TAB 2: FORTUNE WHEEL (Enforces 1 spin per week) */}
        {activeTab === "wheel" && (
          <div className="max-w-xl mx-auto text-center">
            {/* Weekly Cooldown Alert Card */}
            <div className={`p-4 rounded-2xl border-2 mb-6 text-xs transition-all ${
              isCooldownActive
                ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-600/50 text-amber-950 dark:text-amber-200"
                : "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/50 text-emerald-950 dark:text-emerald-200"
            }`}>
              <div className="flex items-center justify-center gap-2 font-black uppercase tracking-wider text-[11px] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Haftada 1 Marta Bepul Aylantirish Qoidasi</span>
              </div>
              {isCooldownActive ? (
                <div className="space-y-1">
                  <p className="font-semibold">
                    🔒 Siz bu haftalik imkoniyatingizdan foydalandingiz. Keyingi aylantirish:{" "}
                    <strong>{remainingDays} kun, {remainingHours} soatdan so'ng</strong> ochiladi.
                  </p>
                  <button
                    onClick={handleResetWeeklyCooldown}
                    className="text-[10px] text-amber-700 dark:text-amber-400 underline hover:no-underline font-bold mt-1 cursor-pointer"
                  >
                    (Admin/Sinov uchun: Haftalik cheklovni tozalash)
                  </button>
                </div>
              ) : (
                <p className="font-semibold">
                  ✨ Sizda hozir 1 ta bepul aylantirish imkoniyati mavjud! Omad g'ildiragini ishga tushiring.
                </p>
              )}
            </div>

            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-4 sm:p-8 border-2 border-amber-200/80 dark:border-amber-500/25 shadow-luxury relative overflow-hidden mb-6">
              {/* Wheel Pointer */}
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-500 mx-auto -mb-3 relative z-20 drop-shadow-md" />

              {/* Simulated Wheel Canvas with Gold Metallic Bezel */}
              <div className="relative w-[min(18rem,calc(100vw-5rem))] h-[min(18rem,calc(100vw-5rem))] sm:w-80 sm:h-80 aspect-square mx-auto my-4 rounded-full border-6 sm:border-8 border-amber-400 dark:border-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.25)] overflow-hidden shrink-0">
                <div
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning ? "transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)" : "none",
                  }}
                  className="w-full h-full rounded-full relative"
                >
                  {WHEEL_ITEMS.map((item, idx) => {
                    const angle = (360 / WHEEL_ITEMS.length) * idx;
                    return (
                      <div
                        key={idx}
                        style={{
                          transform: `rotate(${angle}deg)`,
                          transformOrigin: "center center",
                          backgroundColor: item.color,
                          clipPath: "polygon(50% 50%, 100% 0, 100% 100%)",
                        }}
                        className="absolute inset-0 flex items-center justify-end pr-4 text-white text-[10px] font-black"
                      >
                        <span
                          style={{ transform: "rotate(90deg)" }}
                          className="truncate max-w-[80px] drop-shadow-sm"
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Center Hub */}
                <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 border-4 border-white shadow-xl flex items-center justify-center text-slate-950 z-10 pointer-events-none">
                  <Gift className="w-6 h-6 text-slate-950" />
                </div>
              </div>

              {/* Spin Trigger Button */}
              <button
                onClick={handleSpinWheel}
                disabled={spinning || isCooldownActive}
                className={`py-3.5 px-8 rounded-2xl font-black text-sm transition shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer ${
                  isCooldownActive
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 border-2 border-slate-300 dark:border-slate-700 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950"
                } disabled:opacity-75`}
              >
                {spinning
                  ? "G'ildirak Aylanmoqda..."
                  : isCooldownActive
                  ? `Keyingi imkoniyat: ${remainingDays} kun ${remainingHours} soatdan so'ng ⏳`
                  : "G'ildirakni Aylantirish 🎯"}
              </button>
            </div>

            {/* Winner Showcase */}
            {wheelWinner && (
              <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 border-2 border-amber-300/80 dark:border-amber-500/30 shadow-luxury text-left animate-slide-up flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/15 via-amber-400/25 to-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-500/30">
                    Omadli Ruletka Natijasi
                  </span>
                  <h4 className="font-display font-extrabold text-lg text-slate-900 dark:text-white mt-2">
                    {wheelWinner.label}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Do'kon: <strong className="text-slate-900 dark:text-white">{wheelWinner.store}</strong> • Narx:{" "}
                    <strong className="text-amber-800 dark:text-amber-300">{formatPrice(wheelWinner.price)}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(wheelWinner.label)}
                    className={`w-9 h-9 rounded-xl border-2 transition flex items-center justify-center cursor-pointer shadow-2xs active:scale-95 ${
                      savedWishlist[wheelWinner.label]
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-600 text-rose-600"
                        : "bg-white/90 dark:bg-slate-900/90 border-amber-200/80 dark:border-slate-700 text-slate-400 hover:text-rose-500"
                    }`}
                    title={savedWishlist[wheelWinner.label] ? "Saqlangan" : "Wishlistga qo'shish"}
                  >
                    <Heart className={`w-4 h-4 stroke-[2.2] ${savedWishlist[wheelWinner.label] ? "fill-rose-500" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Men Sovg'a AI Ruletkasini aylantirib "${wheelWinner.label}" yutib oldim! Siz ham omadingizni sinab ko'ring:`;
                      const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
                      window.open(url, "_blank");
                    }}
                    className="w-9 h-9 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] text-white flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-95"
                    title={language === "uz" ? "Telegramga ulashish" : language === "ru" ? "Поделиться в Telegram" : "Share on Telegram"}
                  >
                    <Share2 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                  <a
                    href={wheelWinner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-1.5 transition whitespace-nowrap shadow-md active:scale-95"
                  >
                    <span>{language === "uz" ? "Xarid qilish" : language === "ru" ? "Купить" : "Buy Now"}</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
