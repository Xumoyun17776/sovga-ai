import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  UploadCloud,
  AlertCircle,
  Loader2,
  ArrowRight,
  X,
  History,
  Download,
  ExternalLink,
  Receipt,
  Clock,
  Info,
  Send,
} from "../lib/icons";
import { useTranslation } from "../lib/i18n";
import { useToast } from "../components/Toast";
import { auth, subscription, formatPrice } from "../lib/api";
import { PLANS, PAID_PLANS, PLAN_DAYS, normalizePlanId, type PlanId } from "@shared/plans";
import { cyberSound } from "../lib/cyberSound";
import { copyText } from "../lib/clipboard";
import { PayStep, StatusPill, UsageBar } from "../components/subscription/parts";

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
  const [dragOver, setDragOver] = useState(false);

  // Invoices & receipt modal state
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // User session
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: auth.me });
  const { data: planInfo, isLoading: planInfoLoading } = useQuery({ queryKey: ["plans"], queryFn: subscription.plans, staleTime: 10 * 60 * 1000 });
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
  }));
  const L = (uz: string, ru: string, en: string) => (language === "uz" ? uz : language === "ru" ? ru : en);
  const lang = (language === "ru" || language === "en" ? language : "uz") as "uz" | "ru" | "en";
  const locale = language === "ru" ? "ru-RU" : language === "uz" ? "uz-UZ" : "en-GB";
  const planName = (id: PlanId) => PLANS[id].name[language as "uz" | "ru" | "en"] || PLANS[id].name.en;
  const planLabel = (raw: string) => {
    const id = normalizePlanId(raw);
    return id ? `${planName(id)} · ${formatPrice(PLANS[id].price)}` : raw;
  };
  /** Card transfers are always in so'm, whatever display currency the visitor picked. */
  const fmtUzs = (n: number) => `${n.toLocaleString("ru-RU")} ${L("so'm", "сум", "UZS")}`;
  const currentPrice = PLANS[selectedPlan].price;
  const currentCard: any = cards.find((c: any) => c.type === activeCardTab) || cards[0];

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

  const copyAmount = () => {
    copyText(String(currentPrice));
    setCopiedCard("amount");
    cyberSound.playClick();
    toast.success(L("Summa nusxalandi", "Сумма скопирована", "Amount copied"), fmtUzs(currentPrice));
    setTimeout(() => setCopiedCard(null), 2500);
  };

  const handleFile = (file: File | undefined) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
    // let the same file be picked again after "remove"
    e.target.value = "";
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#1F4CA8", "#1F7A4D", "#4A7BE6", "#EAF0FB"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#1F4CA8", "#1F7A4D"],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#1F4CA8", "#4A7BE6"],
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

  // ── derived view values ──────────────────────────────────────────────
  const fmtLimit = (n: number) => (n === -1 ? L("Cheksiz", "Без лимита", "Unlimited") : String(n));
  const daysLeft = status?.expiresAt ? Math.max(0, Math.ceil((new Date(status.expiresAt).getTime() - Date.now()) / 86_400_000)) : null;
  const expiresText = status?.expiresAt
    ? new Date(status.expiresAt).toLocaleDateString(locale, { day: "numeric", month: "long" })
    : null;
  const isVerified = !!verificationResult?.verified;
  const isPending = !!verificationResult && !verificationResult.verified && !!verificationResult.pending;
  const isRejected = !!verificationResult && !verificationResult.verified && !verificationResult.pending;
  const statusLabel = (s: string) =>
    s === "verified"
      ? language === "uz" ? "Tasdiqlangan" : language === "ru" ? "Одобрено" : "Approved"
      : s === "rejected"
      ? language === "uz" ? "Rad etilgan" : language === "ru" ? "Отклонено" : "Rejected"
      : language === "uz" ? "Ko'rib chiqilmoqda" : language === "ru" ? "В обработке" : "Under review";
  const phaseText =
    analysisPhase === 1
      ? L("1/3: Fiskal rekvizitlar aniqlanmoqda…", "1/3: Считываем реквизиты чека…", "1/3: Reading the receipt details…")
      : analysisPhase === 2
      ? L("2/3: Bank tranzaksiyasi tekshirilmoqda…", "2/3: Проверяем банковскую транзакцию…", "2/3: Checking the bank transaction…")
      : L("3/3: Gemini Vision to'lovni tasdiqlamoqda…", "3/3: Gemini Vision подтверждает платёж…", "3/3: Gemini Vision is confirming the payment…");

  const openPayment = (id: PlanType) => {
    cyberSound.playClick();
    setSelectedPlan(id);
    if (!user) {
      window.location.href = `/auth?redirect=${encodeURIComponent(`/subscription?plan=${id}`)}`;
      return;
    }
    setShowPaymentModal(true);
  };

  const copyBtn = (active: boolean, onClick: () => void, label: string) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="btn-ghost h-9 w-9 sm:w-auto px-0 sm:px-3 text-[13px] flex-shrink-0"
    >
      {active ? <Check className="w-3.5 h-3.5 text-[var(--ok)]" /> : <Copy className="w-3.5 h-3.5" />}
      <span className="hidden sm:inline">{active ? L("Nusxalandi", "Скопировано", "Copied") : L("Nusxalash", "Копировать", "Copy")}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <div className="wrap py-10 sm:py-14 space-y-10 sm:space-y-14">
        {/* ── Header + current plan ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            <p className="text-[14px] font-semibold text-[var(--anor)]">{L("Tariflar", "Тарифы", "Plans")}</p>
            <h1 className="mt-2 font-lux text-[2.25rem] sm:text-[3rem] leading-[1.06] tracking-[-0.03em] text-[var(--ink)]">
              {L("Bepul boshlang, kerak bo'lsa — kengaytiring", "Начните бесплатно, расширьте, когда нужно", "Start free, upgrade when you need more")}
            </h1>
            <p className="mt-4 max-w-[38rem] text-[17px] leading-relaxed text-[var(--ink-2)]">
              {L(
                `Bepul tarifda kuniga ${PLANS.free.searchesPerDay} ta qidiruv va ${PLANS.free.trackers} ta narx kuzatuvi bor. Pullik tariflar oylik — karta orqali to'laysiz, hech qachon avtomatik yechib olinmaydi.`,
                `Бесплатно — ${PLANS.free.searchesPerDay} поисков в день и ${PLANS.free.trackers} отслеживания цены. Платные тарифы помесячные: оплата переводом на карту, без автосписаний.`,
                `Free gives you ${PLANS.free.searchesPerDay} searches a day and ${PLANS.free.trackers} price alerts. Paid plans are monthly — you pay by card transfer and are never charged automatically.`
              )}
            </p>
          </div>

          {status && (
            <section className="lg:col-span-5 rounded-2xl bg-[var(--white)] border border-[var(--rule-soft)] p-5 sm:p-6" aria-label={L("Joriy tarif", "Текущий тариф", "Current plan")}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--ink-2)]">{L("Joriy tarif", "Текущий тариф", "Current plan")}</p>
                  <p className="mt-1 font-lux text-[1.75rem] leading-tight text-[var(--ink)]">{planName(currentPlanId)}</p>
                </div>
                {daysLeft !== null ? (
                  <div className="text-right flex-shrink-0">
                    <p className="price text-[1.75rem] leading-none text-[var(--ink)]">{daysLeft}</p>
                    <p className="mt-1 text-[13px] text-[var(--ink-2)] whitespace-nowrap">
                      {L("kun qoldi", "дн. осталось", daysLeft === 1 ? "day left" : "days left")}
                    </p>
                  </div>
                ) : (
                  <span className="h-7 px-3 rounded-full bg-[var(--paper-2)] text-[13px] font-semibold text-[var(--ink-2)] inline-flex items-center flex-shrink-0">
                    {L("Muddatsiz", "Бессрочно", "No end date")}
                  </span>
                )}
              </div>
              {expiresText && (
                <p className="mt-1 text-[14px] text-[var(--ink-2)]">
                  {L("Tugash sanasi:", "Действует до", "Active until")} {expiresText}
                </p>
              )}
              <div className="mt-5 space-y-4">
                <UsageBar label={L("AI qidiruv bugun", "AI-поиск сегодня", "AI searches today")} used={status.searchesToday} limit={status.searchLimit} unlimitedLabel="∞" />
                <UsageBar label={L("Narx kuzatuvi", "Отслеживание цен", "Price alerts")} used={status.trackers} limit={status.trackerLimit} unlimitedLabel="∞" />
              </div>
              {!user && (
                <a href={`/auth?redirect=${encodeURIComponent("/subscription")}`} className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--anor)] hover:text-[var(--anor-deep)]">
                  {L("Tarif sotib olish uchun kiring", "Войдите, чтобы купить тариф", "Sign in to buy a plan")} <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </section>
          )}
        </div>

        {/* ── Plans ─────────────────────────────────────────────────── */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 items-stretch">
            {(["free", ...PAID_PLANS] as PlanId[]).map((id) => {
              const p = PLANS[id];
              const isPaid = id !== "free";
              const isSelected = isPaid && selectedPlan === id;
              const isCurrent = currentPlanId === id;
              const featured = id === "plus";
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
                  className={`relative flex flex-col rounded-3xl p-6 sm:p-7 transition ${isPaid ? "cursor-pointer" : ""} ${
                    featured
                      ? "bg-[var(--anor)] text-[#fff] shadow-[0_24px_60px_-28px_rgba(31,76,168,.6)]"
                      : `bg-[var(--white)] border ${isSelected ? "border-[var(--anor)]" : "border-[var(--rule-soft)] hover:border-[var(--line-hover)]"}`
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 min-h-[28px]">
                    <h3 className={`font-lux text-[1.35rem] ${featured ? "" : "text-[var(--ink)]"}`}>{planName(id)}</h3>
                    {featured && (
                      <span className="h-7 px-3 rounded-full bg-white/15 text-[12px] font-semibold inline-flex items-center whitespace-nowrap">
                        {L("Ko'p tanlanadi", "Популярный", "Most popular")}
                      </span>
                    )}
                  </div>
                  <p className={`mt-2 text-[14px] leading-snug min-h-[2.5rem] ${featured ? "text-white/75" : "text-[var(--ink-2)]"}`}>{p.tagline[lang] || p.tagline.en}</p>
                  <p className="mt-5 flex items-baseline gap-2">
                    <span className={`price text-[2.25rem] leading-none ${featured ? "" : "text-[var(--ink)]"}`}>{p.price.toLocaleString("ru-RU")}</span>
                    <span className={`text-[14px] ${featured ? "text-white/75" : "text-[var(--ink-2)]"}`}>{L("so'm / oy", "сум / мес", "UZS / mo")}</span>
                  </p>

                  <div className="mt-6">
                    {isCurrent ? (
                      <span
                        className={`w-full h-12 rounded-xl text-[15px] font-semibold inline-flex items-center justify-center gap-2 ${
                          featured ? "bg-white/15 text-[#fff]" : "bg-[var(--ok-soft)] text-[var(--ok-ink)]"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" /> {L("Joriy tarif", "Текущий тариф", "Current plan")}
                      </span>
                    ) : isPaid ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPayment(id as PlanType);
                        }}
                        className={`w-full h-12 rounded-xl text-[15px] font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer ${
                          featured
                            ? "bg-[#fff] text-[#1F4CA8] hover:bg-[#EAF0FB]"
                            : "bg-[var(--paper-2)] text-[var(--ink)] hover:bg-[var(--accent-soft)]"
                        }`}
                      >
                        {L(`${planName(id)} tarifini tanlash`, `Выбрать «${planName(id)}»`, `Choose ${planName(id)}`)}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="w-full h-12 rounded-xl text-[15px] inline-flex items-center justify-center text-[var(--ink-2)] border border-dashed border-[var(--rule-soft)]">
                        {L("Hammaga ochiq", "Доступен всем", "Available to everyone")}
                      </span>
                    )}
                  </div>

                  <ul className={`mt-6 pt-5 space-y-3 text-[14.5px] flex-1 border-t ${featured ? "border-white/20" : "border-[var(--rule-soft)]"}`}>
                    {features.map((f) => (
                      <li
                        key={f.text}
                        className={`flex items-start gap-3 ${
                          f.ok ? (featured ? "text-[#fff]" : "text-[var(--ink)]") : featured ? "text-white/55" : "text-[var(--muted)]"
                        }`}
                      >
                        <span
                          className={`mt-0.5 w-5 h-5 rounded-full inline-flex items-center justify-center flex-shrink-0 ${
                            f.ok
                              ? featured
                                ? "bg-[#fff] text-[#1F4CA8]"
                                : "bg-[var(--accent-soft)] text-[var(--anor)]"
                              : featured
                              ? "bg-white/10"
                              : "bg-[var(--paper-2)]"
                          }`}
                        >
                          {f.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        </span>
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-[14px] text-[var(--ink-2)] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--ok)]" />
            <span>
              {L(
                "Click, Payme, Uzum Bank va barcha Humo / Uzcard kartalari orqali to'lash mumkin. Tarif 30 kun amal qiladi, avtomatik yechib olinmaydi.",
                "Оплата через Click, Payme, Uzum Bank и любые карты Humo / Uzcard. Тариф действует 30 дней, без автосписаний.",
                "Pay with Click, Payme, Uzum Bank or any Humo / Uzcard card. Each plan lasts 30 days — nothing is charged automatically."
              )}
            </span>
          </p>
        </div>

        {/* ── How paying works ──────────────────────────────────────── */}
        <section className="rounded-3xl bg-[var(--paper-2)] p-6 sm:p-8 lg:p-10">
          <h2 className="font-lux text-[1.5rem] sm:text-[1.75rem] leading-tight text-[var(--ink)]">
            {L("To'lov qanday ishlaydi", "Как проходит оплата", "How paying works")}
          </h2>
          <ol className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
            {[
              {
                t: L("Tarifni tanlang", "Выберите тариф", "Choose a plan"),
                d: L("Start, Plus yoki Premium — 30 kunga.", "Старт, Плюс или Премиум — на 30 дней.", "Start, Plus or Premium — for 30 days."),
              },
              {
                t: L("Kartaga o'tkazing", "Переведите на карту", "Transfer the amount"),
                d: L("Aynan ko'rsatilgan summani Click, Payme, Uzum yoki bank ilovasidan yuboring.", "Отправьте ровно указанную сумму через Click, Payme, Uzum или банк.", "Send the exact amount from Click, Payme, Uzum or your bank app."),
              },
              {
                t: L("Chekni yuklang", "Загрузите чек", "Upload the receipt"),
                d: L("To'lov chekining skrinshotini yuklang — AI summa va sanani tekshiradi.", "Загрузите скриншот чека — AI проверит сумму и дату.", "Add a screenshot of the receipt — AI checks the amount and date."),
              },
              {
                t: L("Tarif yoqiladi", "Тариф включается", "Your plan switches on"),
                d: L("Chek tasdiqlansa — darhol. Aniq bo'lmasa, admin qo'lda tekshiradi.", "Если чек подтверждён — сразу. Если неясно, проверит администратор.", "Right away if the receipt checks out. If unclear, an admin reviews it."),
              },
            ].map((s, i) => (
              <li key={s.t} className="flex items-start gap-3.5">
                <span className="w-8 h-8 rounded-full bg-[var(--white)] border border-[var(--rule-soft)] text-[var(--anor)] text-[14px] font-semibold inline-flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="font-semibold text-[15px] text-[var(--ink)]">{s.t}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-[var(--ink-2)]">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Payment history ───────────────────────────────────────── */}
        {user && (
          <section className="rounded-2xl bg-[var(--white)] border border-[var(--rule-soft)]">
            <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
              <div className="flex items-center gap-3 min-w-0">
                <span className="tile !hidden sm:!inline-flex"><Receipt /></span>
                <div className="min-w-0">
                  <h2 className="font-lux text-[1.2rem] text-[var(--ink)]">
                    {L("To'lovlarim", "Мои платежи", "My payments")}
                    {pastReceiptsList.length > 0 && <span className="ml-2 text-[14px] font-sans font-semibold text-[var(--ink-2)] tabular-nums">{pastReceiptsList.length}</span>}
                  </h2>
                  <p className="text-[14px] text-[var(--ink-2)]">
                    {language === "uz" ? "Yuklangan barcha to'lov cheklari va ularning AI audit holati" : language === "ru" ? "Все загруженные чеки и статус AI аудита" : "All uploaded receipts and AI audit results"}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setShowHistoryDrawer(!showHistoryDrawer)} className="btn-ghost h-10 px-3.5 text-[14px] flex-shrink-0" aria-expanded={showHistoryDrawer}>
                <History className="w-4 h-4" />
                <span>{showHistoryDrawer ? (language === "uz" ? "Yopish" : language === "ru" ? "Закрыть" : "Close") : (language === "uz" ? "Ko'rish" : language === "ru" ? "Показать" : "View")}</span>
              </button>
            </div>

            {showHistoryDrawer && (
              <div className="border-t border-[var(--rule-soft)] animate-fade-in">
                {pastReceiptsList.length === 0 ? (
                  <p className="px-6 py-10 text-center text-[14px] text-[var(--ink-2)]">
                    {language === "uz" ? "Siz hali to'lov cheki yuklamagansiz." : language === "ru" ? "Вы еще не загружали чеков." : "No receipts uploaded yet."}
                  </p>
                ) : (
                  <>
                    {/* desktop table */}
                    <table className="hidden md:table w-full text-[14px]">
                      <thead>
                        <tr className="text-left text-[13px] text-[var(--ink-2)]">
                          <th className="font-semibold px-6 py-3">{L("Sana", "Дата", "Date")}</th>
                          <th className="font-semibold px-3 py-3">{L("Tarif", "Тариф", "Plan")}</th>
                          <th className="font-semibold px-3 py-3 text-right">{L("Summa", "Сумма", "Amount")}</th>
                          <th className="font-semibold px-3 py-3">{L("Bank / ilova", "Банк / приложение", "Bank / app")}</th>
                          <th className="font-semibold px-3 py-3">{L("Holat", "Статус", "Status")}</th>
                          <th className="px-6 py-3"><span className="sr-only">{L("Kvitansiya", "Квитанция", "Receipt")}</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastReceiptsList.map((rec: any) => (
                          <tr key={rec.id} className="border-t border-[var(--rule-soft)] align-top">
                            <td className="px-6 py-4 whitespace-nowrap text-[var(--ink)]">
                              {new Date(rec.createdAt).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                              <span className="block text-[12.5px] text-[var(--ink-2)] font-mono truncate max-w-[11rem]">{rec.transactionId || `TRX-${rec.id}`}</span>
                            </td>
                            <td className="px-3 py-4 font-semibold text-[var(--ink)]">{(normalizePlanId(rec.plan) && planName(normalizePlanId(rec.plan)!)) || rec.plan}</td>
                            <td className="px-3 py-4 text-right tabular-nums text-[var(--ink)] whitespace-nowrap">{formatPrice(rec.amount || 49000)}</td>
                            <td className="px-3 py-4 text-[var(--ink-2)]">{rec.bankOrApp || "Bank"}</td>
                            <td className="px-3 py-4">
                              <StatusPill status={rec.status} label={statusLabel(rec.status)} />
                              {rec.status === "rejected" && rec.reason && <p className="mt-1.5 text-[13px] leading-snug text-[var(--ink-2)] max-w-[18rem]">{rec.reason}</p>}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button type="button" onClick={() => setSelectedInvoice(rec)} className="btn-ghost h-9 px-3 text-[13px]">
                                {L("Ko'rish", "Открыть", "Open")}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* phone list */}
                    <ul className="md:hidden divide-y divide-[var(--rule-soft)]">
                      {pastReceiptsList.map((rec: any) => (
                        <li key={rec.id}>
                          <button type="button" onClick={() => setSelectedInvoice(rec)} className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 hover:bg-[var(--paper-2)] transition">
                            <div className="min-w-0">
                              <p className="font-semibold text-[15px] text-[var(--ink)]">{planLabel(rec.plan)}</p>
                              <p className="mt-0.5 text-[13px] text-[var(--ink-2)]">
                                {new Date(rec.createdAt).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })} · {rec.bankOrApp || "Bank"}
                              </p>
                              {rec.status === "rejected" && rec.reason && <p className="mt-1 text-[13px] text-[var(--ink-2)]">{rec.reason}</p>}
                            </div>
                            <StatusPill status={rec.status} label={statusLabel(rec.status)} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PAYMENT: numbered steps                                      */}
      {/* ──────────────────────────────────────────────────────────── */}
      {showPaymentModal && createPortal(
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-[rgba(6,11,24,.62)] animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="pay-title">
          <div className="min-h-full flex items-end sm:items-center justify-center sm:p-6">
            <div className="w-full sm:max-w-[640px] bg-[var(--white)] border border-[var(--rule-soft)] rounded-t-3xl sm:rounded-3xl shadow-[0_24px_60px_-24px_rgba(14,26,54,.45)]">
              {/* header */}
              <div className="flex items-start justify-between gap-4 px-5 sm:px-8 pt-6 pb-5 border-b border-[var(--rule-soft)]">
                <div className="min-w-0">
                  <h3 id="pay-title" className="font-lux text-[1.5rem] sm:text-[1.75rem] leading-tight text-[var(--ink)]">
                    {L("Karta orqali to'lash", "Оплата картой", "Pay by card")}
                  </h3>
                  <p className="mt-1 text-[14px] text-[var(--ink-2)]">
                    {planName(selectedPlan)} · {fmtUzs(currentPrice)} · {PLAN_DAYS} {L("kun", "дней", "days")}. {L("Avtomatik yechib olinmaydi.", "Без автосписаний.", "No auto-charge.")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  aria-label={L("Yopish", "Закрыть", "Close")}
                  className="w-10 h-10 -mr-2 rounded-xl inline-flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--paper-2)] transition cursor-pointer flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ol className="px-5 sm:px-8 py-6 sm:py-7">
                {/* 1 — plan */}
                <PayStep n={1} done title={L("Tarifni tanlang", "Выберите тариф", "Choose your plan")}>
                  <div role="radiogroup" className="grid grid-cols-3 gap-2">
                    {(PAID_PLANS as PlanType[]).map((id) => {
                      const on = selectedPlan === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          disabled={isAnalyzing}
                          onClick={() => {
                            cyberSound.playClick();
                            setSelectedPlan(id);
                          }}
                          className={`rounded-xl border px-2.5 sm:px-3.5 py-2.5 text-left transition cursor-pointer disabled:cursor-not-allowed ${
                            on ? "border-[var(--anor)] bg-[var(--accent-soft)]" : "border-[var(--rule-soft)] bg-[var(--white)] hover:border-[var(--line-strong)]"
                          }`}
                        >
                          <span className={`block text-[14px] font-semibold ${on ? "text-[var(--anor)]" : "text-[var(--ink)]"}`}>{planName(id)}</span>
                          <span className="block text-[13px] text-[var(--ink-2)] tabular-nums whitespace-nowrap">{PLANS[id].price.toLocaleString("ru-RU")}</span>
                        </button>
                      );
                    })}
                  </div>
                </PayStep>

                {planInfoLoading ? (
                  <li className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 sm:gap-x-4" aria-busy="true">
                    <span />
                    <div className="h-40 rounded-2xl bg-[var(--paper-2)] animate-pulse" />
                  </li>
                ) : cards.length === 0 ? (
                  /* no payment card configured on the server */
                  <li className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 sm:gap-x-4">
                    <span />
                    <div className="rounded-2xl bg-[var(--paper-2)] p-5 sm:p-6">
                      <div className="flex items-start gap-3">
                        <span className="tile !w-10 !h-10"><Info /></span>
                        <div className="min-w-0">
                          <p className="font-semibold text-[15px] text-[var(--ink)]">
                            {L("To'lov kartasi hali sozlanmagan.", "Карта для оплаты ещё не настроена.", "The payment card isn't set up yet.")}
                          </p>
                          <p className="mt-1 text-[14px] leading-relaxed text-[var(--ink-2)]">
                            {L(
                              "Tarifni faollashtirish uchun Telegram orqali yozing — admin qo'lda yoqib beradi.",
                              "Чтобы подключить тариф, напишите нам в Telegram — администратор включит его вручную.",
                              "Message us on Telegram to activate a plan — an admin will switch it on for you."
                            )}
                          </p>
                          <a href="https://t.me/sovga_ai_bot" target="_blank" rel="noreferrer" className="btn-telegram mt-4 inline-flex items-center gap-2 h-10 px-4 text-[14px] font-semibold">
                            <Send className="w-4 h-4" /> @sovga_ai_bot
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                ) : (
                  <>
                    {/* 2 — transfer */}
                    <PayStep
                      n={2}
                      done={!!receiptImage}
                      title={L("Aynan shu summani kartaga o'tkazing", "Переведите ровно эту сумму на карту", "Transfer the exact amount to this card")}
                      hint={L("Click, Payme, Uzum yoki istalgan bank ilovasidan.", "Через Click, Payme, Uzum или любое банковское приложение.", "From Click, Payme, Uzum or any bank app.")}
                    >
                      {cards.length > 1 && (
                        <div className="mb-3 inline-flex gap-1 p-1 rounded-xl bg-[var(--paper-2)]" role="tablist">
                          {cards.map((c: any) => {
                            const on = currentCard?.type === c.type;
                            return (
                              <button
                                key={c.type}
                                type="button"
                                role="tab"
                                aria-selected={on}
                                onClick={() => {
                                  cyberSound.playClick();
                                  setActiveCardTab(c.type);
                                }}
                                className={`h-8 px-3 rounded-lg text-[13px] font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
                                  on ? "bg-[var(--white)] text-[var(--ink)] shadow-[0_1px_2px_rgba(14,26,54,.08)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]"
                                }`}
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                {c.type}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <dl className="rounded-2xl border border-[var(--rule-soft)] bg-[var(--paper-2)] divide-y divide-[var(--rule-soft)]">
                        <div className="px-4 sm:px-5 py-3.5">
                          <dt className="text-[13px] text-[var(--ink-2)]">
                            {L("Karta raqami", "Номер карты", "Card number")} · {currentCard.type}
                          </dt>
                          <dd className="mt-1 flex items-center justify-between gap-3">
                            <span className="font-mono text-[17px] sm:text-[22px] font-medium sm:tracking-[0.02em] text-[var(--ink)] tabular-nums min-w-0 whitespace-nowrap">{currentCard.number}</span>
                            {copyBtn(copiedCard === currentCard.type, () => copyToClipboard(currentCard.clean, currentCard.type), L("Karta raqamini nusxalash", "Скопировать номер карты", "Copy card number"))}
                          </dd>
                        </div>
                        <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3">
                          <dt className="text-[13px] text-[var(--ink-2)]">{L("Karta egasi", "Владелец карты", "Card holder")}</dt>
                          <dd className="text-[15px] font-semibold text-[var(--ink)] text-right truncate">{currentCard.name}</dd>
                        </div>
                        <div className="px-4 sm:px-5 py-3.5">
                          <dt className="text-[13px] text-[var(--ink-2)]">{L("O'tkaziladigan summa", "Сумма перевода", "Amount to send")}</dt>
                          <dd className="mt-1 flex items-center justify-between gap-3">
                            <span className="flex items-baseline gap-1.5 min-w-0">
                              <span className="price text-[24px] leading-none text-[var(--ink)]">{currentPrice.toLocaleString("ru-RU")}</span>
                              <span className="text-[14px] text-[var(--ink-2)]">{L("so'm", "сум", "UZS")}</span>
                            </span>
                            {copyBtn(copiedCard === "amount", copyAmount, L("Summani nusxalash", "Скопировать сумму", "Copy amount"))}
                          </dd>
                        </div>
                      </dl>

                      <p className="mt-3 text-[13px] text-[var(--ink-2)]">{L("Ilovani ochish (karta raqami nusxalanadi):", "Открыть приложение (номер карты скопируется):", "Open an app (the card number is copied):")}</p>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {[
                          { label: "Click Up", href: "https://my.click.uz/", key: "Click" },
                          { label: "Payme", href: "https://payme.uz/", key: "Payme" },
                          { label: "Uzum Bank", href: "https://uzumbank.uz/", key: "Uzum" },
                        ].map((a) => (
                          <a
                            key={a.key}
                            href={a.href}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => copyToClipboard(currentCard.clean, a.key)}
                            className="btn-ghost h-10 px-2 text-[13px] whitespace-nowrap"
                          >
                            {a.label}
                            <ExternalLink className="w-3.5 h-3.5 text-[var(--ink-2)] hidden sm:block" />
                          </a>
                        ))}
                      </div>
                    </PayStep>

                    {/* 3 — upload */}
                    <PayStep
                      n={3}
                      done={!!verificationResult}
                      title={L("To'lov chekini yuklang", "Загрузите чек оплаты", "Upload the payment receipt")}
                      hint={L("Ilovadagi chek skrinshoti: summa, sana va karta ko'rinsin.", "Скриншот чека из приложения: видны сумма, дата и карта.", "A screenshot from the app showing the amount, date and card.")}
                    >
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                      {!receiptImage ? (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                          }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            handleFile(e.dataTransfer.files?.[0]);
                          }}
                          className={`w-full rounded-2xl border-2 border-dashed px-5 py-7 text-center transition cursor-pointer ${
                            dragOver ? "border-[var(--anor)] bg-[var(--accent-soft)]" : "border-[var(--rule-soft)] bg-[var(--paper-2)] hover:border-[var(--line-strong)]"
                          }`}
                        >
                          <span className="tile mx-auto"><UploadCloud /></span>
                          <span className="mt-3 block text-[15px] font-semibold text-[var(--ink)]">
                            {L("Rasmni shu yerga tashlang yoki tanlang", "Перетащите изображение или выберите файл", "Drop the screenshot here or choose a file")}
                          </span>
                          <span className="mt-1 block text-[13px] text-[var(--ink-2)]">PNG, JPG, WebP · {L("10 MB gacha", "до 10 МБ", "up to 10 MB")}</span>
                        </button>
                      ) : (
                        <div className="rounded-2xl border border-[var(--rule-soft)] bg-[var(--paper-2)] overflow-hidden">
                          <div className="relative bg-[var(--img-well)] flex items-center justify-center">
                            <img src={receiptImage} alt={L("To'lov cheki", "Чек оплаты", "Payment receipt")} className="max-h-64 w-auto object-contain" />
                            {isAnalyzing && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="absolute inset-0 bg-[var(--white)] opacity-80" />
                                <span className="relative inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[var(--white)] border border-[var(--rule-soft)] text-[13px] font-semibold text-[var(--ink)]">
                                  <Loader2 className="w-4 h-4 animate-spin text-[var(--anor)]" />
                                  {L("Tekshirilmoqda…", "Проверяем…", "Checking…")}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[var(--rule-soft)]">
                            <div className="min-w-0">
                              <p className="text-[14px] font-semibold text-[var(--ink)] truncate">{receiptFileName || "to'lov_cheki.png"}</p>
                              <p className="text-[13px] text-[var(--ok)] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {L("Yuklandi — tekshirishga tayyor", "Загружено — готово к проверке", "Uploaded — ready to check")}
                              </p>
                            </div>
                            {!isAnalyzing && (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-ghost h-9 px-3 text-[13px] hidden sm:inline-flex">
                                  {L("Almashtirish", "Заменить", "Replace")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReceiptImage(null);
                                    setReceiptFileName("");
                                    setVerificationResult(null);
                                  }}
                                  aria-label={L("O'chirish", "Удалить", "Remove")}
                                  title={L("O'chirish", "Удалить", "Remove")}
                                  className="w-9 h-9 rounded-xl inline-flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--rose)] hover:bg-[var(--rose-soft)] transition cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!isVerified && (
                        <button type="button" onClick={handleStartAnalysis} disabled={isAnalyzing || !receiptImage} className="btn-primary mt-4 w-full h-12 text-[15px]">
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {language === "uz" ? "AI tekshirmoqda…" : language === "ru" ? "AI проверяет…" : "AI is checking…"}
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              {L("Chekni tekshirish va tarifni yoqish", "Проверить чек и включить тариф", "Verify receipt & activate plan")}
                            </>
                          )}
                        </button>
                      )}
                    </PayStep>

                    {/* 4 — result */}
                    <PayStep n={4} last done={isVerified} title={L("Natija", "Результат", "Result")}>
                      <div aria-live="polite">
                        {isAnalyzing ? (
                          <div className="rounded-2xl bg-[var(--accent-soft)] p-4 sm:p-5">
                            <p className="flex items-center gap-2 text-[15px] font-semibold text-[var(--ink)]">
                              <Loader2 className="w-4 h-4 animate-spin text-[var(--anor)]" />
                              {phaseText}
                            </p>
                            <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--ink-2)]">
                              {L(
                                "Gemini Vision to'lov summasi, bank va tranzaksiya holatini tekshirmoqda. Chek avval ishlatilmaganini ham tekshiramiz.",
                                "Gemini Vision проверяет сумму, банк и статус платежа, а также что чек не использовался раньше.",
                                "Gemini Vision is checking the amount, bank and transaction — and that the receipt hasn't been used before."
                              )}
                            </p>
                          </div>
                        ) : isVerified ? (
                          <div className="rounded-2xl bg-[var(--ok-soft)] p-4 sm:p-5">
                            <p className="flex items-center gap-2 text-[15px] font-semibold text-[var(--ok-ink)]">
                              <CheckCircle2 className="w-5 h-5 text-[var(--ok)]" />
                              {L(`Chek tasdiqlandi — ${planName(selectedPlan)} faol`, `Чек подтверждён — «${planName(selectedPlan)}» активен`, `Receipt verified — ${planName(selectedPlan)} is active`)}
                            </p>
                            {verificationResult.message && <p className="mt-1.5 text-[14px] text-[var(--ok-ink)]">{verificationResult.message}</p>}
                            {verificationResult.receipt && (
                              <dl className="mt-3 pt-3 border-t border-[rgba(63,160,110,.3)] grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] text-[var(--ok-ink)]">
                                <div>
                                  <dt className="opacity-75">{L("Summa", "Сумма", "Amount")}</dt>
                                  <dd className="font-semibold tabular-nums">{formatPrice(verificationResult.receipt.amount || currentPrice)}</dd>
                                </div>
                                <div>
                                  <dt className="opacity-75">{L("Bank / ilova", "Банк / приложение", "Bank / app")}</dt>
                                  <dd className="font-semibold">{verificationResult.receipt.bankOrApp || "Payme/Click"}</dd>
                                </div>
                                <div className="col-span-2 min-w-0">
                                  <dt className="opacity-75">{L("Tranzaksiya", "Транзакция", "Transaction")}</dt>
                                  <dd className="font-mono truncate">{verificationResult.receipt.transactionId || "TRX-OK"}</dd>
                                </div>
                              </dl>
                            )}
                            <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-primary mt-4 w-full h-12 text-[15px]">
                              {L("Tayyor! Foydalanishni boshlash", "Готово! Начать пользоваться", "Done! Start using it")}
                            </button>
                          </div>
                        ) : isPending ? (
                          <div className="rounded-2xl bg-[var(--paper-2)] border border-[var(--rule-soft)] p-4 sm:p-5">
                            <p className="flex items-center gap-2 text-[15px] font-semibold text-[var(--ink)]">
                              <Clock className="w-4 h-4 text-[var(--warn)]" />
                              {verificationResult.message || L("Chek tekshiruvga yuborildi", "Чек отправлен на проверку", "Receipt sent for review")}
                            </p>
                            {verificationResult.reason && <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--ink-2)]">{verificationResult.reason}</p>}
                            <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-2)]">
                              {L(
                                "Admin qo'lda tekshiradi. Holatini pastdagi «To'lovlarim» bo'limida ko'rasiz — oynani yopishingiz mumkin.",
                                "Администратор проверит вручную. Статус появится в разделе «Мои платежи» — окно можно закрыть.",
                                "An admin will check it by hand. You'll see the status under “My payments” — you can close this window."
                              )}
                            </p>
                          </div>
                        ) : isRejected ? (
                          <div className="rounded-2xl bg-[var(--rose-soft)] p-4 sm:p-5">
                            <p className="flex items-center gap-2 text-[15px] font-semibold text-[var(--rose)]">
                              <AlertCircle className="w-4 h-4" />
                              {verificationResult.message || L("Chek rad etildi", "Чек отклонён", "Receipt rejected")}
                            </p>
                            <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--ink)]">
                              {verificationResult.reason || L("To'lov summasi kam yoki chek tasdiqlanmadi.", "Сумма меньше нужной или чек не подтверждён.", "The amount is too low or the receipt couldn't be confirmed.")}
                            </p>
                            <p className="mt-2 text-[13px] text-[var(--ink-2)]">
                              {L("Summani tekshiring va aniqroq skrinshot yuklang.", "Проверьте сумму и загрузите более чёткий скриншот.", "Check the amount and upload a clearer screenshot.")}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[14px] text-[var(--ink-2)]">
                            {L(
                              "Chek tekshirilgach natija shu yerda chiqadi. Tasdiqlansa, tarif darhol 30 kunga yoqiladi.",
                              "Результат появится здесь после проверки. Если чек подтверждён, тариф включится сразу на 30 дней.",
                              "The result shows up here after the check. If the receipt is confirmed, the plan turns on right away for 30 days."
                            )}
                          </p>
                        )}
                      </div>
                    </PayStep>
                  </>
                )}
              </ol>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* RECEIPT DETAILS MODAL                                        */}
      {/* ──────────────────────────────────────────────────────────── */}
      {selectedInvoice && createPortal(
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-[rgba(6,11,24,.62)] animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="invoice-title">
          <div className="min-h-full flex items-end sm:items-center justify-center sm:p-6">
            <div className="w-full sm:max-w-md bg-[var(--white)] border border-[var(--rule-soft)] rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 space-y-5 shadow-[0_24px_60px_-24px_rgba(14,26,54,.45)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 id="invoice-title" className="font-lux text-[1.4rem] leading-tight text-[var(--ink)]">
                    {L("To'lov kvitansiyasi", "Квитанция об оплате", "Payment receipt")}
                  </h3>
                  <p className="mt-0.5 text-[14px] text-[var(--ink-2)]">Sovg'a · {planLabel(selectedInvoice.plan)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  aria-label={L("Yopish", "Закрыть", "Close")}
                  className="w-10 h-10 -mr-2 rounded-xl inline-flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--paper-2)] transition cursor-pointer flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <dl className="rounded-2xl bg-[var(--paper-2)] divide-y divide-[var(--rule-soft)] text-[14px]">
                {[
                  { k: L("Tranzaksiya ID", "ID транзакции", "Transaction ID"), v: selectedInvoice.transactionId || `TRX-${selectedInvoice.id}`, mono: true },
                  { k: L("Sana va vaqt", "Дата и время", "Date & time"), v: new Date(selectedInvoice.createdAt).toLocaleString(locale) },
                  { k: L("Tarif", "Тариф", "Plan"), v: `${planLabel(selectedInvoice.plan)} · 30 ${L("kun", "дней", "days")}` },
                  { k: L("Bank / ilova", "Банк / приложение", "Bank / app"), v: selectedInvoice.bankOrApp || "Click / Payme" },
                ].map((r) => (
                  <div key={r.k} className="flex items-start justify-between gap-4 px-4 py-3">
                    <dt className="text-[var(--ink-2)] flex-shrink-0">{r.k}</dt>
                    <dd className={`font-semibold text-[var(--ink)] text-right min-w-0 break-all ${r.mono ? "font-mono text-[13px]" : ""}`}>{r.v}</dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-4 px-4 py-3.5">
                  <dt className="text-[var(--ink-2)]">{L("To'langan summa", "Оплаченная сумма", "Amount paid")}</dt>
                  <dd className="price text-[20px] text-[var(--ink)]">{formatPrice(selectedInvoice.amount || 49000)}</dd>
                </div>
              </dl>

              <div
                className={`rounded-2xl p-4 flex items-start gap-3 ${
                  selectedInvoice.status === "verified"
                    ? "bg-[var(--ok-soft)] text-[var(--ok-ink)]"
                    : selectedInvoice.status === "rejected"
                    ? "bg-[var(--rose-soft)] text-[var(--rose)]"
                    : "bg-[var(--paper-2)] border border-[var(--rule-soft)] text-[var(--ink)]"
                }`}
              >
                {selectedInvoice.status === "verified" ? (
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                ) : selectedInvoice.status === "rejected" ? (
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 text-[var(--warn)]" />
                )}
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold">
                    {selectedInvoice.status === "verified"
                      ? L("AI tekshiruvi tasdiqladi", "Проверка AI пройдена", "Verified by AI check")
                      : statusLabel(selectedInvoice.status)}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-snug opacity-90">
                    {selectedInvoice.reason ||
                      (selectedInvoice.status === "verified"
                        ? L("Fiskal to'lov cheki haqiqiyligi tasdiqlangan.", "Подлинность фискального чека подтверждена.", "The fiscal receipt was confirmed as genuine.")
                        : "")}
                  </p>
                </div>
              </div>

              <button type="button" onClick={() => window.print()} className="btn-primary w-full h-12 text-[15px]">
                <Download className="w-4 h-4" />
                {L("Kvitansiyani chop etish / saqlash", "Распечатать / сохранить", "Print / save receipt")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
