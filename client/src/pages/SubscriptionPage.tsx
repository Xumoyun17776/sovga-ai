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
} from "../lib/icons";
import { useTranslation } from "../lib/i18n";
import { useToast } from "../components/Toast";
import { auth, subscription, formatPrice } from "../lib/api";
import { PLANS, PAID_PLANS, normalizePlanId, type PlanId } from "@shared/plans";
import { cyberSound } from "../lib/cyberSound";
import { copyText } from "../lib/clipboard";

type PlanType = Exclude<PlanId, "free">;

const planFromUrl = (): PlanType => {
  try {
    const p = normalizePlanId(new URLSearchParams(window.location.search).get("plan"));
    return p && p !== "free" ? p : "plus";
  } catch {
    return "plus";
  }
};

export default function SubscriptionPage() {
  const { language } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedPlan, setSelectedPlan] = useState<PlanType>(planFromUrl);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeCardTab, setActiveCardTab] = useState<string>("");
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
  const { data: planInfo } = useQuery({ queryKey: ["plans"], queryFn: subscription.plans, staleTime: 10 * 60 * 1000 });
  const { data: status } = useQuery({ queryKey: ["plan-status"], queryFn: subscription.status });
  const currentPlanId: PlanId = (status?.plan as PlanId) || "free";

  // Receipt history
  const { data: receiptHistory, refetch: refetchReceipts } = useQuery({
    queryKey: ["user-receipts"],
    queryFn: subscription.getReceipts,
    enabled: !!user,
  });

  const fmtCard = (n: string) => n.replace(/(\d{4})(?=\d)/g, "$1 ");
  const cards = (planInfo?.payment?.cards || []).map((c: { type: string; number: string }) => ({
    type: c.type,
    number: fmtCard(c.number),
    clean: c.number,
    name: planInfo?.payment?.holder || "SOVG'A",
    bank: c.type,
    gradient:
      c.type === "Humo"
        ? "from-[#022c22] via-[#064e3b] to-[#022c22] bg-[#022c22]"
        : c.type === "Visa"
        ? "bg-gradient-to-br from-[#0b1a4a] via-[#14286e] to-[#0b1a4a] bg-[#14286e]"
        : "from-[#0f172a] via-[#1e293b] to-[#0f172a] bg-[#0f172a]",
    accent: c.type === "Humo" ? "text-emerald-400" : "text-amber-400",
  }));
  const L = (uz: string, ru: string, en: string) => (language === "uz" ? uz : language === "ru" ? ru : en);
  const planName = (id: PlanId) => PLANS[id].name[language as "uz" | "ru" | "en"] || PLANS[id].name.en;
  const planLabel = (raw: string) => {
    const id = normalizePlanId(raw);
    return id ? `${planName(id)} · ${formatPrice(PLANS[id].price)}` : raw;
  };
  const currentPrice = PLANS[selectedPlan].price;
  const currentCard: any = cards.find((c: any) => c.type === activeCardTab) || cards[0];
  const activeType = currentCard?.type;

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
    copyText(text);
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
        colors: ["#d9431f", "#10b981", "#d9431f", "#ec4899", "#818cf8"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#d9431f", "#10b981"],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#d9431f", "#ec4899"],
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

      if (res.pending) {
        refetchReceipts();
        toast.success(
          res.reason || L("Chek tekshiruvga yuborildi", "Чек отправлен на проверку", "Receipt sent for review"),
          L("Qabul qilindi", "Принято", "Received")
        );
      } else if (res.verified) {
        cyberSound.playConfirm();
        triggerConfetti();
        queryClient.invalidateQueries({ queryKey: ["plan-status"] });
        queryClient.invalidateQueries({ queryKey: ["me"] });
        queryClient.invalidateQueries({ queryKey: ["user-receipts"] });
        refetchReceipts();
        toast.success(
          L(`Chek tasdiqlandi! ${planName(selectedPlan)} tarifi 30 kunga yoqildi.`, `Чек подтверждён! Тариф «${planName(selectedPlan)}» включён на 30 дней.`, `Receipt verified! ${planName(selectedPlan)} is on for 30 days.`),
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


  const pastReceiptsList = Array.isArray(receiptHistory) ? receiptHistory : [];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors relative overflow-hidden">
      {/* Ambient luxury vignette glow */}

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

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 pb-10 border-b border-[var(--ink)]">
          <h1 className="lg:col-span-7 lux-title text-[3rem] sm:text-[4.5rem] text-[var(--ink)] leading-[0.95]">
            <span className="thin">{L("Oylik", "Месячные", "Monthly")}</span> {L("tariflar", "тарифы", "plans")}
          </h1>
          <p className="lg:col-span-5 lg:pt-6 text-[17px] text-[var(--ink-2)] leading-relaxed">
            {L("Qancha ko'p qidirsangiz — shuncha ko'p imkoniyat. Karta orqali to'lang, chekni yuklang — tarif 30 kunga yoqiladi.", "Чем больше вы ищете — тем больше возможностей. Оплатите картой, загрузите чек — тариф включится на 30 дней.", "Pick how much you need. Pay by card, upload the receipt, and the plan is on for 30 days.")}
          </p>
        </div>

        {/* Current plan & today's usage */}
        {status && (
          <div className="plan-status surface-card rounded-2xl p-5 sm:p-6 grid sm:grid-cols-[1fr_auto] gap-4 items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{L("Joriy tarif", "Текущий тариф", "Current plan")}</p>
              <p className="mt-1 font-lux text-3xl text-slate-900 dark:text-white">
                {planName(currentPlanId)}
                {status.expiresAt && (
                  <span className="ml-3 align-middle text-xs font-sans text-slate-500 dark:text-slate-400">
                    {L("tugash sanasi", "до", "until")} {new Date(status.expiresAt).toLocaleDateString(language === "ru" ? "ru-RU" : language === "uz" ? "uz-UZ" : "en-GB", { day: "numeric", month: "long" })}
                  </span>
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-[22rem]">
              {[
                { label: L("AI qidiruv bugun", "AI-поиск сегодня", "AI searches today"), used: status.searchesToday, limit: status.searchLimit },
                { label: L("Narx kuzatuvi", "Отслеживание цен", "Price alerts"), used: status.trackers, limit: status.trackerLimit },
              ].map((m) => {
                const pct = m.limit === -1 ? 0 : Math.min(100, Math.round((m.used / Math.max(1, m.limit)) * 100));
                return (
                  <div key={m.label} className="rounded-xl border border-[var(--line)] px-3 py-2.5">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.label}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                      {m.used} / {m.limit === -1 ? "∞" : m.limit}
                    </p>
                    <div className="mt-1.5 h-1.5 rounded-full bg-slate-200/70 dark:bg-white/[0.06] overflow-hidden">
                      <div className={`h-full rounded-full ${pct >= 90 ? "bg-rose-500" : "bg-[var(--accent)]"}`} style={{ width: m.limit === -1 ? "100%" : `${pct}%`, opacity: m.limit === -1 ? 0.35 : 1 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(["free", ...PAID_PLANS] as PlanId[]).map((id) => {
            const p = PLANS[id];
            const isPaid = id !== "free";
            const isSelected = isPaid && selectedPlan === id;
            const isCurrent = currentPlanId === id;
            const featured = id === "plus";
            const fmtLimit = (n: number) => (n === -1 ? L("Cheksiz", "Без лимита", "Unlimited") : String(n));
            const features: { ok: boolean; text: string }[] = [
              { ok: true, text: L(`${fmtLimit(p.searchesPerDay)} ta AI qidiruv / kun`, `${fmtLimit(p.searchesPerDay)} AI-поисков в день`, `${fmtLimit(p.searchesPerDay)} AI searches / day`) },
              { ok: true, text: L(`${fmtLimit(p.trackers)} ta narx kuzatuvi`, `${fmtLimit(p.trackers)} отслеживаний цены`, `${fmtLimit(p.trackers)} price alerts`) },
              { ok: true, text: L("Katalog va jonli narxlar", "Каталог и живые цены", "Catalog & live prices") },
              { ok: p.registry, text: L("To'y ro'yxati yaratish", "Свадебный список", "Wedding registry") },
              { ok: p.prioritySupport, text: L("Ustuvor yordam", "Приоритетная поддержка", "Priority support") },
            ];
            return (
              <div
                key={id}
                onClick={() => isPaid && setSelectedPlan(id as PlanType)}
                className={`plan-card ${featured ? "is-featured" : ""} ${isSelected ? "is-selected" : ""} relative rounded-2xl p-6 flex flex-col ${isPaid ? "cursor-pointer" : ""}`}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] text-white plan-ribbon">
                    {L("Ommabop", "Популярный", "Most popular")}
                  </span>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-lux text-[1.9rem] leading-none text-slate-900 dark:text-white">{planName(id)}</h3>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 min-h-[2rem]">{p.tagline[language as "uz" | "ru" | "en"] || p.tagline.en}</p>
                  </div>
                  {isPaid && (
                    <span className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-slate-300 dark:border-slate-600"}`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </span>
                  )}
                </div>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display font-bold text-[2rem] leading-none tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {p.price === 0 ? "0" : p.price.toLocaleString("en-US")}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{L("so'm / oy", "сум / мес", "UZS / mo")}</span>
                </div>
                <ul className="mt-5 space-y-2.5 text-sm flex-1">
                  {features.map((f) => (
                    <li key={f.text} className={`flex items-start gap-2.5 ${f.ok ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-600"}`}>
                      <span className={`bullet-check mt-0.5 ${f.ok ? (featured ? "is-gold" : "") : "opacity-30"}`}>
                        {f.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      </span>
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {isCurrent ? (
                    <span className="w-full h-11 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" /> {L("Joriy tarif", "Текущий тариф", "Current plan")}
                    </span>
                  ) : isPaid ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cyberSound.playClick();
                        setSelectedPlan(id as PlanType);
                        if (!user) {
                          window.location.href = `/auth?redirect=${encodeURIComponent(`/subscription?plan=${id}`)}`;
                          return;
                        }
                        setShowPaymentModal(true);
                      }}
                      className={`w-full h-11 rounded-xl text-sm inline-flex items-center justify-center gap-2 cursor-pointer ${featured ? "btn-luxury-gold" : "btn-ghost justify-center"}`}
                    >
                      {L(`${planName(id)} tarifini tanlash`, `Выбрать «${planName(id)}»`, `Choose ${planName(id)}`)}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="w-full h-11 rounded-xl text-sm inline-flex items-center justify-center text-slate-500 dark:text-slate-400 border border-dashed border-[var(--line)]">
                      {L("Hammaga ochiq", "Доступен всем", "Available to everyone")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          {L(
            "Click, Payme, Uzum Bank va barcha Humo / Uzcard kartalari orqali to'lash mumkin. Tarif 30 kun amal qiladi, avtomatik yechib olinmaydi.",
            "Оплата через Click, Payme, Uzum Bank и любые карты Humo / Uzcard. Тариф действует 30 дней, без автосписаний.",
            "Pay with Click, Payme, Uzum Bank or any Humo / Uzcard card. Each plan lasts 30 days — nothing is charged automatically."
          )}
        </p>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* PAYMENT & AI RECEIPT VERIFICATION MODAL */}
        {/* ──────────────────────────────────────────────────────────── */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
            {/* Ambient vignette glow */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            </div>

            <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-sm border border-[var(--line)] dark:border-amber-500/25 space-y-6 my-8 animate-scale-up">
              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      {planLabel(selectedPlan)} / {L("oy", "мес", "mo")}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white mt-1">
                    {L("Karta orqali to'lash", "Оплата картой", "Pay by card")}
                  </h3>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>

              {/* Step 1: Realistic 3D Bank Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{language === "uz" ? "1-Qadam: Pul o'tkazish" : language === "ru" ? "Шаг 1: Перевод средств" : "Step 1: Transfer Funds"}</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                    {formatPrice(currentPrice)}
                  </span>
                </div>

                {cards.length === 0 ? (
                  <div className="rounded-2xl border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700/50 p-5 text-sm text-slate-700 dark:text-slate-200 space-y-3">
                    <p className="font-semibold">
                      {L("To'lov kartasi hali sozlanmagan.", "Карта для оплаты ещё не настроена.", "The payment card isn't set up yet.")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {L(
                        "Tarifni faollashtirish uchun Telegram orqali yozing — admin qo'lda yoqib beradi.",
                        "Чтобы подключить тариф, напишите нам в Telegram — администратор включит его вручную.",
                        "Message us on Telegram to activate a plan — an admin will switch it on for you."
                      )}
                    </p>
                    <a href="https://t.me/sovga_ai_bot" target="_blank" rel="noreferrer" className="btn-telegram inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold">
                      @sovga_ai_bot
                    </a>
                  </div>
                ) : (
                <>
                {/* Card Type Selector Tabs */}
                <div className={`${cards.length > 1 ? "grid" : "hidden"} grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl`}>
                  {cards.map((c: any) => (
                    <button
                      key={c.type}
                      onClick={() => {
                        cyberSound.playClick();
                        setActiveCardTab(c.type);
                      }}
                      className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
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

                {/* Card to pay into */}
                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4 sm:p-5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{L("Karta", "Карта", "Card")} · {currentCard.type}</span>
                    <span>{currentCard.name}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="font-mono text-xl sm:text-2xl font-semibold tracking-wide text-slate-900 tabular-nums">
                      {currentCard.number}
                    </span>
                    <button
                      onClick={() => copyToClipboard(currentCard.clean, currentCard.type)}
                      className="btn-ghost h-9 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                    >
                      {copiedCard === currentCard.type ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCard === currentCard.type ? L("Nusxalandi", "Скопировано", "Copied") : L("Nusxalash", "Копировать", "Copy")}
                    </button>
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
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 transition">Click Up</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Ilova orqali</span>
                  </a>
                  <a
                    href={`https://payme.uz/`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => copyToClipboard(currentCard.clean, "Payme")}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-teal-400 dark:hover:border-teal-500 text-center transition group flex flex-col items-center justify-center"
                  >
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 transition">Payme</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Ilova orqali</span>
                  </a>
                  <a
                    href={`https://uzumbank.uz/`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => copyToClipboard(currentCard.clean, "Uzum")}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-purple-400 dark:hover:border-purple-500 text-center transition group flex flex-col items-center justify-center"
                  >
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 transition">Uzum Bank</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Ilova orqali</span>
                  </a>
                </div>
                </>
                )}
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
                    className="p-6 border border-dashed border-[var(--line)] dark:border-slate-700 hover:border-[var(--line-strong)] rounded-2xl bg-amber-50/30 dark:bg-slate-800/30 text-center space-y-2 cursor-pointer transition group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto transition">
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
                        <div className="absolute left-0 right-0 h-1 laser-beam-anim" />

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
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400 rounded-2xl space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-sm font-bold">
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
                    className="w-full py-3.5 text-white font-bold rounded-2xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm bg-amber-500 hover:bg-amber-400"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === "uz" ? "AI Tekshirmoqda..." : language === "ru" ? "AI Проверяет..." : "AI Auditing..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                        <span>{L("Chekni tekshirish va tarifni yoqish", "Проверить чек и включить тариф", "Verify receipt & activate plan")}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition shadow-sm text-xs sm:text-sm cursor-pointer"
                  >
                    {L("Tayyor! Foydalanishni boshlash", "Готово! Начать пользоваться", "Done! Start using it")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* PAYMENT HISTORY & INVOICES DRAWER */}
        {/* ──────────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0b1224] border border-[var(--line)] dark:border-amber-500/25 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                  {L("To'lovlarim", "Мои платежи", "My payments")}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === "uz" ? "Yuklangan barcha to'lov cheklari va ularning AI audit holati" : language === "ru" ? "Все загруженные чеки и статус AI аудита" : "All uploaded receipts and AI audit results"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="px-3 py-1.5 rounded-xl border border-[var(--line)] dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{showHistoryDrawer ? (language === "uz" ? "Yopish" : language === "ru" ? "Закрыть" : "Close") : (language === "uz" ? "Ko'rish" : language === "ru" ? "Показать" : "View")}</span>
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
                              {planLabel(rec.plan)}
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
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            rec.status === "verified"
                              ? "bg-emerald-500 text-white"
                              : rec.status === "rejected"
                              ? "bg-rose-500 text-white"
                              : "bg-amber-500 text-white"
                          }`}
                        >
                          {rec.status === "verified"
                            ? (language === "uz" ? "Tasdiqlangan" : language === "ru" ? "Одобрено" : "Approved")
                            : rec.status === "rejected"
                            ? (language === "uz" ? "Rad etilgan" : language === "ru" ? "Отклонено" : "Rejected")
                            : (language === "uz" ? "Ko'rib chiqilmoqda" : language === "ru" ? "В обработке" : "Under review")}
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
            </div>

            <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-sm border border-[var(--line)] dark:border-amber-500/25 space-y-6 animate-scale-up my-auto max-h-[92vh] max-h-[92dvh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    RASMIY ELEKTRON KVITANSIYA
                  </span>
                  <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mt-0.5">
                    Sovg'a AI VIP Obuna
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition cursor-pointer"
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
                  <span className="font-bold text-slate-900 dark:text-white">{planLabel(selectedInvoice.plan)} · 30 {L("kun", "дней", "days")}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-400">Bank / Ilova:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedInvoice.bankOrApp || "Click / Payme"}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold">
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
                  <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
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
                className="w-full py-3.5 btn-luxury-gold text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
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
