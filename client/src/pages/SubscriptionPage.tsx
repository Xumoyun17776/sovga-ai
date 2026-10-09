import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  UploadCloud,
  AlertCircle,
  Loader2,
  Crown,
  Sparkles,
  ArrowRight,
  X,
  History,
  FileCheck2,
  Download,
  ExternalLink,
  ChevronRight,
  Receipt,
  ScanLine,
} from "lucide-react";
import { useTranslation } from "../lib/i18n";
import { useToast } from "../components/Toast";
import { auth, subscription, formatPrice } from "../lib/api";
import { cyberSound } from "../lib/cyberSound";

type PlanType = "pro_monthly" | "pro_annual";

export default function SubscriptionPage() {
  const { language } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedPlan, setSelectedPlan] = useState<PlanType>("pro_monthly");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeCardTab, setActiveCardTab] = useState<"Uzcard" | "Humo">("Uzcard");
  const [copiedCard, setCopiedCard] = useState<string | null>(null);

  // Receipt upload state
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState(0);

  // Invoices & receipt modal state
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // User session
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: auth.me });
  const isUserPro = user?.role === "pro" || user?.role === "admin";

  // Receipt history
  const { data: receiptHistory, refetch: refetchReceipts } = useQuery({
    queryKey: ["user-receipts"],
    queryFn: subscription.getReceipts,
    enabled: !!user,
  });

  const cards = [
    {
      type: "Uzcard" as const,
      number: "8600 4904 1234 5678",
      clean: "8600490412345678",
      name: "SOVG'A AI (XUMOYUN R.)",
      bank: "Kapitalbank / Ipak Yo'li",
      expiry: "12 / 28",
      gradient: "from-[#0f172a] via-[#1e293b] to-[#0f172a]",
      accent: "text-amber-400",
    },
    {
      type: "Humo" as const,
      number: "9860 1201 5566 7788",
      clean: "9860120155667788",
      name: "SOVG'A AI (XUMOYUN R.)",
      bank: "NBU / SQB Bank",
      expiry: "10 / 29",
      gradient: "from-[#022c22] via-[#064e3b] to-[#022c22]",
      accent: "text-emerald-400",
    },
  ];

  const currentPrice = selectedPlan === "pro_annual" ? 450000 : 49000;
  const currentCard = cards.find((c) => c.type === activeCardTab) || cards[0];

  // Cycling scanning progress text
  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      setAnalysisPhase(1);
      interval = setInterval(() => {
        setAnalysisPhase((prev) => (prev >= 3 ? 1 : prev + 1));
      }, 1400);
    } else {
      setAnalysisPhase(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const copyToClipboard = (text: string, cardType: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCard(cardType);
    cyberSound.playClick();
    toast.success(
      language === "uz" ? "Karta raqami nusxalandi!" : language === "ru" ? "Номер карты скопирован!" : "Card number copied!",
      cardType
    );
    setTimeout(() => setCopiedCard(null), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(
        language === "uz"
          ? "Iltimos, faqat rasm faylini tanlang (PNG, JPG, WebP)"
          : language === "ru"
          ? "Пожалуйста, выберите изображение (PNG, JPG, WebP)"
          : "Please select an image file (PNG, JPG, WebP)"
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        language === "uz" ? "Rasm hajmi 10MB dan oshmasligi kerak" : language === "ru" ? "Размер файла не более 10MB" : "File size must be under 10MB"
      );
      return;
    }

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
      setVerificationResult(null);
      cyberSound.playClick();
    };
    reader.readAsDataURL(file);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#fbbf24"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#f59e0b", "#10b981"],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#6366f1", "#ec4899"],
        });
      }, 250);
    } catch {
      // ignore
    }
  };

  const verifyReceiptMutation = useMutation({
    mutationFn: (data: { receiptImage: string; plan: PlanType }) => subscription.verifyReceipt(data),
    onMutate: () => {
      setIsAnalyzing(true);
    },
    onSuccess: (res) => {
      setIsAnalyzing(false);
      setVerificationResult(res);

      if (res.verified) {
        cyberSound.playConfirm();
        triggerConfetti();
        queryClient.invalidateQueries({ queryKey: ["me"] });
        queryClient.invalidateQueries({ queryKey: ["user-receipts"] });
        refetchReceipts();
        toast.success(
          language === "uz"
            ? "Chek tasdiqlandi! Sizga PRO obuna berildi!"
            : language === "ru"
            ? "Чек подтвержден! Вам выдан статус PRO!"
            : "Receipt verified! Pro subscription activated!",
          language === "uz" ? "Muvaffaqiyatli" : language === "ru" ? "Успешно" : "Success"
        );
      } else {
        toast.error(
          res.reason || (language === "uz" ? "Chek tasdiqlanmadi" : language === "ru" ? "Чек не подтвержден" : "Receipt verification failed"),
          language === "uz" ? "Rad etildi" : language === "ru" ? "Отклонено" : "Rejected"
        );
      }
    },
    onError: (err: any) => {
      setIsAnalyzing(false);
      toast.error(err.message || "Xatolik yuz berdi");
    },
  });

  const handleStartAnalysis = () => {
    if (!receiptImage) {
      toast.error(
        language === "uz" ? "Iltimos, avval to'lov cheki rasmini yuklang" : language === "ru" ? "Пожалуйста, прикрепите чек оплаты" : "Please attach the payment receipt screenshot first"
      );
      return;
    }
    verifyReceiptMutation.mutate({ receiptImage, plan: selectedPlan });
  };

  const proFeatures = {
    uz: [
      "Cheksiz AI qidiruv va chuqur narx auditi",
      "AI Chek Skaneri & Avtomatik lahzalik faollashtirish",
      "VIP Secret Santa maxsus bayram xonalari",
      "30 kunlik narxlar tarixi & tushish signallari",
      "Eksklyuziv hamkorlik chegirma vaucherlari",
      "3D Premium qadoqlash studiyasi",
      "Prioritetli 24/7 shaxsiy sovg'a konsyerji",
    ],
    ru: [
      "Безлимитный AI поиск и глубокий аудит цен",
      "AI Сканер чеков с моментальной активацией",
      "VIP закрытые комнаты Secret Santa",
      "30-дневная история цен и сигналы падения",
      "Эксклюзивные закрытые партнерские скидки",
      "3D Премиум студия упаковки",
      "Приоритетный 24/7 персональный консьерж",
    ],
    en: [
      "Unlimited AI research and deep market price audits",
      "Instant AI Receipt Auditor & auto-activation",
      "VIP Secret Santa private lounges",
      "30-day price history & drop alert signals",
      "Exclusive curated partner discounts",
      "3D Luxury gift packaging atelier",
      "Priority 24/7 concierge gift advisor",
    ],
  };

  const currentProFeatures = proFeatures[language] || proFeatures.en;

  const pastReceiptsList = Array.isArray(receiptHistory) ? receiptHistory : [];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#fcfbf9] dark:bg-[#07080c] text-slate-900 dark:text-slate-100 transition-colors relative overflow-hidden">
      {/* Ambient luxury vignette glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1000px,100vw)] max-w-full h-[400px] bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Inline HUD Laser styles */}
      <style>{`
        @keyframes laserSweep {
          0% { top: 0%; opacity: 0.9; }
          50% { top: 96%; opacity: 1; }
          100% { top: 0%; opacity: 0.9; }
        }
        .laser-beam-anim {
          animation: laserSweep 1.8s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 fill-amber-500" />
            <span>Sovg'a AI VIP Club</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-slate-900 dark:text-white">
            {language === "uz" ? "Premium Pro Obuna" : language === "ru" ? "Премиум Подписка Pro" : "Premium Pro Subscription"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            {language === "uz"
              ? "Kartangizdan to'lov qiling, chekni yuklang — sun'iy intellekt (AI) chekni avtomatik tekshirib, darhol PRO maqomini beradi!"
              : language === "ru"
              ? "Оплатите с карты и загрузите чек — AI автоматически проверит платеж и мгновенно откроет статус PRO!"
              : "Transfer via card and upload your receipt — our AI automatically audits the receipt and instantly activates PRO!"}
          </p>
        </div>

        {/* Pro Status Banner (if already Pro) */}
        {isUserPro && (
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-orange-500/15 border-2 border-amber-400/40 rounded-3xl p-6 text-center shadow-lg shadow-amber-500/10 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 flex items-center justify-center mx-auto shadow-md">
              <Crown className="w-6 h-6 fill-slate-950" />
            </div>
            <h3 className="font-display font-black text-xl text-amber-900 dark:text-amber-300">
              {language === "uz" ? "Sizning PRO / VIP Obunangiz Faol!" : language === "ru" ? "Ваша подписка PRO активна!" : "Your PRO / VIP Subscription is Active!"}
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-200/80 max-w-md mx-auto">
              {language === "uz"
                ? "Barcha cheksiz AI qidiruvlari, chuqur narx auditi va VIP imkoniyatlar siz uchun ochiq."
                : language === "ru"
                ? "Все безлимитные AI функции, аудит цен и VIP сервисы доступны без ограничений."
                : "All unlimited AI shopping, deep audits, and VIP privileges are fully unlocked."}
            </p>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Monthly Plan */}
          <div
            onClick={() => setSelectedPlan("pro_monthly")}
            className={`cursor-pointer active:scale-95 relative p-7 rounded-3xl border-2 transition-all space-y-6 ${
              selectedPlan === "pro_monthly"
                ? "border-amber-500 bg-white dark:bg-slate-900 shadow-xl shadow-amber-500/10 ring-4 ring-amber-500/10"
                : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  {language === "uz" ? "Oylik Reja" : language === "ru" ? "Ежемесячно" : "Monthly Plan"}
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  Pro Monthly <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                </h3>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === "pro_monthly" ? "border-amber-500 bg-amber-500 text-white" : "border-slate-300"}`}>
                {selectedPlan === "pro_monthly" && <Check className="w-3.5 h-3.5 stroke-[2.2]" />}
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">49,000 UZS</span>
                <span className="text-slate-500 text-xs sm:text-sm font-semibold">
                  {language === "uz" ? "/oy" : language === "ru" ? "/мес" : "/mo"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {language === "uz" ? "Har oyda bekor qilish mumkin" : language === "ru" ? "Без долгосрочных обязательств" : "Cancel anytime"}
              </p>
            </div>

            <ul className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {currentProFeatures.slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 stroke-[2.2]" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Annual Plan (Best Value) */}
          <div
            onClick={() => setSelectedPlan("pro_annual")}
            className={`cursor-pointer active:scale-95 relative p-7 rounded-3xl border-2 transition-all space-y-6 ${
              selectedPlan === "pro_annual"
                ? "border-amber-500 bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:to-slate-900 shadow-xl shadow-amber-500/10 ring-4 ring-amber-500/10"
                : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-slate-300"
            }`}
          >
            <div className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
              {language === "uz" ? "2 OY BEPUL (20% TEJASH)" : language === "ru" ? "2 МЕСЯЦА В ПОДАРОК" : "2 MONTHS FREE"}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  {language === "uz" ? "Yillik VIP Reja" : language === "ru" ? "Годовой VIP" : "Annual VIP Plan"}
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  Pro Annual <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                </h3>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === "pro_annual" ? "border-amber-500 bg-amber-500 text-white" : "border-slate-300"}`}>
                {selectedPlan === "pro_annual" && <Check className="w-3.5 h-3.5 stroke-[2.2]" />}
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">450,000 UZS</span>
                <span className="text-slate-500 text-xs sm:text-sm font-semibold">
                  {language === "uz" ? "/yil" : language === "ru" ? "/год" : "/yr"}
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">
                {language === "uz" ? "Oyligi atigi 37,500 UZS ga to'g'ri keladi" : language === "ru" ? "Всего 37 500 UZS в месяц" : "Equivalent to 37,500 UZS / mo"}
              </p>
            </div>

            <ul className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {currentProFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 stroke-[2.2]" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            onClick={() => {
              cyberSound.playClick();
              setShowPaymentModal(true);
            }}
            className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-5 h-5 stroke-[2.2]" />
            <span>
              {language === "uz"
                ? `Karta orqali to'lash (${formatPrice(currentPrice)})`
                : language === "ru"
                ? `Оплатить картой (${formatPrice(currentPrice)})`
                : `Pay via Card (${formatPrice(currentPrice)})`}
            </span>
            <ArrowRight className="w-4 h-4 ml-1 stroke-[2.2]" />
          </button>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              {language === "uz"
                ? "Click, Payme, Uzum Bank va barcha Humo / Uzcard kartalari qabul qilinadi"
                : language === "ru"
                ? "Принимаются Click, Payme, Uzum Bank и любые карты Humo / Uzcard"
                : "Supports Click, Payme, Uzum Bank & all Humo / Uzcard bank cards"}
            </span>
          </p>
        </div>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* PAYMENT & AI RECEIPT VERIFICATION MODAL */}
        {/* ──────────────────────────────────────────────────────────── */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
            {/* Ambient vignette glow */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl opacity-70" />
            </div>

            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-amber-300/80 dark:border-amber-500/25 space-y-6 my-8 animate-scale-up">
              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold">
                      ELITE P2P AI CHECKOUT
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {selectedPlan === "pro_annual" ? "VIP Yillik (450,000 UZS)" : "Pro Oylik (49,000 UZS)"}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white mt-1">
                    {language === "uz" ? "Karta orqali To'lov & Chekni Yuklash" : language === "ru" ? "Оплата Картой и Загрузка Чека" : "Card Payment & AI Receipt Audit"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer active:scale-95"
                >
                  <X className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>

              {/* Step 1: Realistic 3D Bank Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{language === "uz" ? "1-Qadam: Pul o'tkazish" : language === "ru" ? "Шаг 1: Перевод средств" : "Step 1: Transfer Funds"}</span>
                  <span className="text-amber-600 dark:text-amber-400 font-black text-sm">
                    {formatPrice(currentPrice)}
                  </span>
                </div>

                {/* Card Type Selector Tabs */}
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  {cards.map((c) => (
                    <button
                      key={c.type}
                      onClick={() => {
                        cyberSound.playClick();
                        setActiveCardTab(c.type);
                      }}
                      className={`py-1.5 text-xs font-black rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                        activeCardTab === c.type
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>{c.type}</span>
                    </button>
                  ))}
                </div>

                {/* Realistic 3D Luxury Bank Card Graphic */}
                <div
                  className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-tr ${currentCard.gradient} border border-amber-500/30 shadow-xl shadow-slate-950/20 text-white select-none transition-all duration-300`}
                >
                  {/* Subtle glossy background pattern */}
                  <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                  <div className="absolute top-0 right-0 p-4 opacity-15 text-6xl font-black font-display pointer-events-none">
                    SOVG'A
                  </div>

                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                        {currentCard.bank}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-display font-black tracking-wider text-xs text-amber-300">
                          SOVG'A AI VIP CLUB
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black font-mono tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                        {currentCard.type}
                      </span>
                    </div>
                  </div>

                  {/* Gold EMV Chip & Contactless Wave */}
                  <div className="flex items-center gap-3 my-4 relative z-10">
                    {/* Realistic Gold EMV Chip */}
                    <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center border border-amber-200">
                      <div className="w-full h-full border border-amber-700/40 rounded-sm grid grid-cols-3 grid-rows-2 gap-0.5 opacity-80">
                        <div className="border-r border-b border-amber-800/30"></div>
                        <div className="border-r border-b border-amber-800/30"></div>
                        <div className="border-b border-amber-800/30"></div>
                        <div className="border-r border-amber-800/30"></div>
                        <div className="border-r border-amber-800/30"></div>
                        <div></div>
                      </div>
                    </div>

                    {/* Contactless Wi-Fi Icon */}
                    <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                      <line x1="12" y1="20" x2="12.01" y2="20" />
                    </svg>
                  </div>

                  {/* Embossed Card Number */}
                  <div className="my-2 relative z-10 flex items-center justify-between">
                    <span className="font-mono text-lg sm:text-xl font-bold tracking-widest text-white drop-shadow-md">
                      {currentCard.number}
                    </span>
                    <button
                      onClick={() => copyToClipboard(currentCard.clean, currentCard.type)}
                      className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-[11px] flex items-center gap-1 transition shadow-sm cursor-pointer"
                      title="Karta raqamini nusxalash"
                    >
                      {copiedCard === currentCard.type ? (
                        <>
                          <Check className="w-3 h-3 text-slate-950" />
                          <span>Nusxalandi</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Nusxalash</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Card Holder & Expiry */}
                  <div className="flex items-end justify-between pt-2 border-t border-white/10 text-[10px] font-mono text-slate-300 relative z-10">
                    <div>
                      <span className="text-[9px] block text-slate-400 uppercase">Karta egasi</span>
                      <span className="font-bold text-white tracking-wider">{currentCard.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] block text-slate-400 uppercase">Muddati</span>
                      <span className="font-bold text-white tracking-wider">{currentCard.expiry}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Payment App Shortcuts */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <a
                    href={`https://my.click.uz/`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => copyToClipboard(currentCard.clean, "Click")}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 text-center transition group flex flex-col items-center justify-center"
                  >
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 group-hover:scale-105 transition">Click Up</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Ilova orqali</span>
                  </a>
                  <a
                    href={`https://payme.uz/`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => copyToClipboard(currentCard.clean, "Payme")}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-teal-400 dark:hover:border-teal-500 text-center transition group flex flex-col items-center justify-center"
                  >
                    <span className="text-xs font-black text-teal-600 dark:text-teal-400 group-hover:scale-105 transition">Payme</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Ilova orqali</span>
                  </a>
                  <a
                    href={`https://uzumbank.uz/`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => copyToClipboard(currentCard.clean, "Uzum")}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-purple-400 dark:hover:border-purple-500 text-center transition group flex flex-col items-center justify-center"
                  >
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400 group-hover:scale-105 transition">Uzum Bank</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Ilova orqali</span>
                  </a>
                </div>
              </div>

              {/* Step 2: Upload receipt */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{language === "uz" ? "2-Qadam: To'lov chekini yuklash" : language === "ru" ? "Шаг 2: Прикрепите чек оплаты" : "Step 2: Upload Payment Receipt"}</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG, WebP</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {!receiptImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-amber-300 dark:border-slate-700 hover:border-amber-500 rounded-2xl bg-amber-50/30 dark:bg-slate-800/30 text-center space-y-2 cursor-pointer transition group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto group-hover:scale-105 transition">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {language === "uz" ? "Chek skrinshotini bu yerga bosing yoki tashlang" : language === "ru" ? "Нажмите для загрузки чека" : "Click to select or drop receipt screenshot"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {language === "uz" ? "Payme, Click yoki Uzum Bank to'lov cheki skrinshoti" : language === "ru" ? "Чек из Payme, Click или Uzum Bank" : "Receipt from Payme, Click or Uzum Bank"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Futuristic HUD Scanning Overlay when analyzing */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                        {/* Neon Laser Beam */}
                        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] laser-beam-anim" />

                        {/* Cyber HUD Brackets */}
                        <div className="w-full h-full border border-emerald-500/40 rounded-xl relative pointer-events-none p-3 flex flex-col justify-between">
                          <div className="flex justify-between text-[9px] font-mono text-emerald-400 font-bold">
                            <span>[AI_SCAN_OCR]</span>
                            <span>STATUS: LIVE</span>
                          </div>
                          <div className="text-center space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono text-xs font-bold animate-pulse">
                              <ScanLine className="w-3.5 h-3.5 animate-spin" />
                              <span>
                                {analysisPhase === 1
                                  ? "1/3: Fiskal rekvizitlar aniqlanmoqda..."
                                  : analysisPhase === 2
                                  ? "2/3: Bank tranzaksiyasi tekshirilmoqda..."
                                  : "3/3: Gemini Vision to'lovni tasdiqlamoqda..."}
                              </span>
                            </div>
                            <p className="text-[10px] text-emerald-200/80 font-mono">
                              Replay attack & tranzaksiya dublikati tekshiruvi faol
                            </p>
                          </div>
                          <div className="flex justify-between text-[9px] font-mono text-emerald-400 font-bold">
                            <span>TARGET: {formatPrice(currentPrice)}</span>
                            <span>GATEWAY: SECURE</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={receiptImage}
                          alt="Chek"
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                            {receiptFileName || "to'lov_cheki.png"}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Tayyor (Yuklandi)</span>
                          </span>
                        </div>
                      </div>
                      {!isAnalyzing && (
                        <button
                          onClick={() => {
                            setReceiptImage(null);
                            setReceiptFileName("");
                            setVerificationResult(null);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                          title="O'chirish"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Verification Status / Results */}
              {isAnalyzing && (
                <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-2 text-center animate-pulse">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>{language === "uz" ? "AI Chekni Tahlil Qilmoqda..." : language === "ru" ? "AI Анализирует Чек..." : "AI is Auditing Receipt..."}</span>
                  </div>
                  <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400">
                    {language === "uz"
                      ? "Gemini Vision to'lov summasi, bank va tranzaksiya holatini tekshirmoqda..."
                      : language === "ru"
                      ? "Gemini Vision распознает сумму, банк и статус платежа..."
                      : "Gemini Vision is auditing amount, bank, and transaction authenticity..."}
                  </p>
                </div>
              )}

              {/* Result on Success */}
              {verificationResult?.verified && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-400 rounded-2xl space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-sm font-black">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500 text-white" />
                    <span>{language === "uz" ? "Chek Tasdiqlandi! PRO Faol!" : language === "ru" ? "Чек Подтвержден! PRO Активирован!" : "Receipt Verified! PRO Activated!"}</span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    {verificationResult.message}
                  </p>
                  {verificationResult.receipt && (
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-emerald-900 dark:text-emerald-300 border-t border-emerald-200/50">
                      <div>Summa: <b>{formatPrice(verificationResult.receipt.amount || currentPrice)}</b></div>
                      <div>Bank: <b>{verificationResult.receipt.bankOrApp || "Payme/Click"}</b></div>
                      <div className="col-span-2 text-[10px] text-slate-500 truncate">
                        Tranzaksiya: <b>{verificationResult.receipt.transactionId || "TRX-OK"}</b>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Result on Failure */}
              {verificationResult && !verificationResult.verified && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 rounded-2xl space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>{verificationResult.message || "Chek rad etildi"}</span>
                  </div>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed">
                    {verificationResult.reason || "To'lov summasi kam yoki chek tasdiqlanmadi."}
                  </p>
                </div>
              )}

              {/* Step 3: Trigger button */}
              <div>
                {!verificationResult?.verified ? (
                  <button
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing || !receiptImage}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-2xl transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm active:scale-95"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === "uz" ? "AI Tekshirmoqda..." : language === "ru" ? "AI Проверяет..." : "AI Auditing..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                        <span>{language === "uz" ? "AI Orqali Chekni Tekshirish & Pro Olish" : language === "ru" ? "Проверить Чек через AI и Получить Pro" : "Verify Receipt via AI & Activate Pro"}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition shadow-lg text-xs sm:text-sm cursor-pointer active:scale-95"
                  >
                    {language === "uz" ? "Tayyor! Pro Imkoniyatlaridan Foydalanish" : language === "ru" ? "Готово! Начать пользоваться Pro" : "Done! Start using Pro Features"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* PAYMENT HISTORY & INVOICES DRAWER */}
        {/* ──────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] border-2 border-amber-200/80 dark:border-amber-500/25 rounded-3xl p-6 shadow-luxury space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-display font-black text-slate-900 dark:text-white text-base">
                  {language === "uz" ? "Mening To'lov Tarixim & Kvitansiyalar" : language === "ru" ? "Моя История Платежей и Чеки" : "My Receipts & Invoices"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === "uz" ? "Yuklangan barcha to'lov cheklari va ularning AI audit holati" : language === "ru" ? "Все загруженные чеки и статус AI аудита" : "All uploaded receipts and AI audit results"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="px-3 py-1.5 rounded-xl border border-amber-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <History className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{showHistoryDrawer ? (language === "uz" ? "Yopish" : "Закрыть") : (language === "uz" ? "Ko'rish" : "Показать")}</span>
            </button>
          </div>

          {showHistoryDrawer && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fade-in">
              {pastReceiptsList.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  {language === "uz" ? "Siz hali to'lov cheki yuklamagansiz." : language === "ru" ? "Вы еще не загружали чеков." : "No receipts uploaded yet."}
                </div>
              ) : (
                <div className="space-y-2">
                  {pastReceiptsList.map((rec: any) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                            rec.status === "verified"
                              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                              : rec.status === "rejected"
                              ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                              : "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                          }`}
                        >
                          {rec.status === "verified" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {rec.plan === "pro_annual" ? "Pro Annual (VIP)" : "Pro Monthly"}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="font-mono text-slate-600 dark:text-slate-400">
                              {formatPrice(rec.amount || 49000)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                            <span>ID: {rec.transactionId || `TRX-${rec.id}`}</span>
                            <span>•</span>
                            <span>{rec.bankOrApp || "Bank"}</span>
                            <span>•</span>
                            <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            rec.status === "verified"
                              ? "bg-emerald-500 text-white"
                              : rec.status === "rejected"
                              ? "bg-rose-500 text-white"
                              : "bg-amber-500 text-white"
                          }`}
                        >
                          {rec.status === "verified"
                            ? (language === "uz" ? "Tasdiqlangan" : "Одобрено")
                            : rec.status === "rejected"
                            ? (language === "uz" ? "Rad etilgan" : "Отклонено")
                            : (language === "uz" ? "Ko'rib chiqilmoqda" : "В обработке")}
                        </span>

                        <button
                          onClick={() => setSelectedInvoice(rec)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                          title="Kvitansiya ko'rish"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* FORMAL DIGITAL INVOICE / VOUCHER MODAL */}
        {/* ──────────────────────────────────────────────────────────── */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
            {/* Ambient vignette glow */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-amber-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl opacity-70" />
            </div>

            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-amber-300/80 dark:border-amber-500/25 space-y-6 animate-scale-up my-auto max-h-[92vh] max-h-[92dvh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    RASMIY ELEKTRON KVITANSIYA
                  </span>
                  <h3 className="text-xl font-display font-black text-slate-900 dark:text-white mt-0.5">
                    Sovg'a AI VIP Obuna
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition cursor-pointer active:scale-95"
                >
                  <X className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>

              {/* Receipt Body */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-400">Tranzaksiya ID:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedInvoice.transactionId || `TRX-${selectedInvoice.id}`}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-400">Sana & Vaqt:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{new Date(selectedInvoice.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-400">Tarif:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedInvoice.plan === "pro_annual" ? "Pro Annual (12 oy)" : "Pro Monthly (1 oy)"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-400">Bank / Ilova:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedInvoice.bankOrApp || "Click / Payme"}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-black">
                  <span className="text-slate-500">To'langan Summa:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatPrice(selectedInvoice.amount || 49000)}</span>
                </div>
              </div>

              {/* Official AI Verification Stamp */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 block">
                    AI AUDIT TASDIQLANDI
                  </span>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-tight">
                    {selectedInvoice.reason || "Fiskal to'lov cheki haqiqiyligi tasdiqlangan."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full py-3.5 btn-luxury-gold text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-md shadow-amber-500/25"
              >
                <Download className="w-4 h-4 stroke-[2.2]" />
                <span>Kvitansiyani Chop Etish / Saqlash</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
