import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { formatPrice } from "../lib/api";
import { useToast } from "../components/Toast";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation } from "../lib/i18n";
import {
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  Share2,
  Copy,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Send,
  Coins,
  ArrowRight,
  TrendingUp,
  Heart,
  MessageSquare,
  X,
  Wallet,
  QrCode,
  Check,
} from "lucide-react";

interface Contributor {
  id: string;
  name: string;
  paid: boolean;
  amount: number;
}

const CAMPAIGN_PRESETS = [
  {
    title: "Ota-onamiz uchun DeLonghi Kofe Mashinasi",
    amount: 1800000,
    contributors: ["Jamshid (Tashkilotchi)", "Madina", "Otabek", "Dilshod"],
  },
  {
    title: "Ustozimiz uchun iPad Air & Apple Pencil",
    amount: 8500000,
    contributors: ["Akmal (Guruh sardori)", "Shahzod", "Zarina", "Farrux", "Nilufar"],
  },
  {
    title: "Hamkasbimizga Nikoh To'yi Sovg'asi (Smartfon)",
    amount: 4200000,
    contributors: ["Bobur (Team Lead)", "Anvar", "Malika", "Sardor"],
  },
  {
    title: "Do'stimizga Tug'ilgan Kunga Sony Naushnik",
    amount: 3200000,
    contributors: ["Rustam", "Aziz", "Jasur", "Nodir"],
  },
];

export default function GroupGiftingPage() {
  const toast = useToast();
  const { language } = useTranslation();

  const [campaignTitle, setCampaignTitle] = useState(() => {
    try {
      return localStorage.getItem("sovga_gg_title") || "Ota-onamiz uchun DeLonghi Kofe Mashinasi";
    } catch {
      return "Ota-onamiz uchun DeLonghi Kofe Mashinasi";
    }
  });
  const [targetAmount, setTargetAmount] = useState<number>(() => {
    try {
      const v = localStorage.getItem("sovga_gg_target");
      return v ? Number(v) : 1800000;
    } catch {
      return 1800000;
    }
  });
  const [cardOrPhone, setCardOrPhone] = useState(() => {
    try {
      return localStorage.getItem("sovga_gg_card") || "8600 5304 1234 5678";
    } catch {
      return "8600 5304 1234 5678";
    }
  });
  const [recipientPerson, setRecipientPerson] = useState(() => {
    try {
      return localStorage.getItem("sovga_gg_recipient") || "Ota-onamiz";
    } catch {
      return "Ota-onamiz";
    }
  });

  const [contributors, setContributors] = useState<Contributor[]>(() => {
    try {
      const saved = localStorage.getItem("sovga_gg_contributors");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "1", name: "Jamshid (Tashkilotchi)", paid: true, amount: 450000 },
      { id: "2", name: "Madina", paid: true, amount: 450000 },
      { id: "3", name: "Otabek", paid: false, amount: 450000 },
      { id: "4", name: "Dilshod", paid: false, amount: 450000 },
    ];
  });

  const [wishes, setWishes] = useState<
    { id: string; name: string; amount: number; message: string; paymentMethod: string; date: string }[]
  >(() => {
    try {
      const saved = localStorage.getItem("sovga_gg_wishes");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "w1",
        name: "Jamshid",
        amount: 450000,
        message: "Ota-onamiz uzoq umr ko'rishsin, yangi kofe mashinasi muborak bo'lsin!",
        paymentMethod: "PAYME",
        date: "Bugun, 10:15",
      },
      {
        id: "w2",
        name: "Madina",
        amount: 450000,
        message: "Doim xonadonimizdan quvonch va xushbo'y qahva hidi arimasin!",
        paymentMethod: "CLICK",
        date: "Bugun, 11:30",
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("sovga_gg_title", campaignTitle);
      localStorage.setItem("sovga_gg_target", String(targetAmount));
      localStorage.setItem("sovga_gg_card", cardOrPhone);
      localStorage.setItem("sovga_gg_recipient", recipientPerson);
      localStorage.setItem("sovga_gg_contributors", JSON.stringify(contributors));
      localStorage.setItem("sovga_gg_wishes", JSON.stringify(wishes));
    } catch {}
  }, [campaignTitle, targetAmount, cardOrPhone, recipientPerson, contributors, wishes]);

  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [contributeName, setContributeName] = useState("");
  const [contributeAmount, setContributeAmount] = useState<number | "">("");
  const [contributeMessage, setContributeMessage] = useState("");
  const [paymentProvider, setPaymentProvider] = useState<"payme" | "click" | "uzum">("payme");

  const [newContributorName, setNewContributorName] = useState("");

  // Calculations
  const totalPeople = contributors.length || 1;
  const sharePerPerson = Math.round(targetAmount / totalPeople);

  const totalCollected = contributors
    .filter((c) => c.paid)
    .reduce((sum, c) => sum + c.amount, 0);

  const progressPercent = Math.min(100, Math.round((totalCollected / targetAmount) * 100));
  const remainingAmount = Math.max(0, targetAmount - totalCollected);

  const handleApplyPreset = (preset: typeof CAMPAIGN_PRESETS[0]) => {
    cyberSound.playClick();
    setCampaignTitle(preset.title);
    setTargetAmount(preset.amount);
    const share = Math.round(preset.amount / preset.contributors.length);
    setContributors(
      preset.contributors.map((name, i) => ({
        id: String(i + 1),
        name,
        paid: i === 0,
        amount: share,
      }))
    );
    toast.success("Shablon yuklandi!", preset.title);
  };

  const handleAddContributor = () => {
    if (!newContributorName.trim()) return;
    cyberSound.playClick();
    const newShare = Math.round(targetAmount / (contributors.length + 1));
    const updated = [
      ...contributors.map((c) => ({ ...c, amount: newShare })),
      {
        id: Date.now().toString(),
        name: newContributorName.trim(),
        paid: false,
        amount: newShare,
      },
    ];
    setContributors(updated);
    setNewContributorName("");
    toast.success(`${newContributorName} ro'yxatga qo'shildi!`, "Qo'shildi");
  };

  const handleTogglePaid = (id: string) => {
    cyberSound.playClick();
    setContributors((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, paid: !c.paid } : c));
      const newlyPaid = updated.find((c) => c.id === id)?.paid;
      if (newlyPaid) {
        cyberSound.play("success");
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.7 },
          colors: ["#10b981", "#3b82f6", "#6366f1"],
        });
      }
      return updated;
    });
  };

  const handleRemoveContributor = (id: string) => {
    if (contributors.length <= 1) {
      toast.error("Kamida bitta ishtirokchi bo'lishi kerak!", "Xatolik");
      return;
    }
    cyberSound.playClick();
    const filtered = contributors.filter((c) => c.id !== id);
    const newShare = Math.round(targetAmount / filtered.length);
    setContributors(filtered.map((c) => ({ ...c, amount: newShare })));
  };

  const handleTargetChange = (val: number) => {
    setTargetAmount(val);
    const newShare = Math.round(val / (contributors.length || 1));
    setContributors((prev) => prev.map((c) => ({ ...c, amount: newShare })));
  };

  const handleContributeSubmit = () => {
    if (!contributeName.trim()) {
      toast.error("Iltimos, ismingizni kiriting!");
      return;
    }
    const amt = typeof contributeAmount === "number" && contributeAmount > 0 ? contributeAmount : sharePerPerson;

    cyberSound.playConfirm();

    // Add to wishes
    const newWish = {
      id: Date.now().toString(),
      name: contributeName.trim(),
      amount: amt,
      message: contributeMessage.trim() || "Tabriklayman! Sovg'a yoqadi degan umiddaman!",
      paymentMethod: paymentProvider.toUpperCase(),
      date: "Hozirgina",
    };
    setWishes([newWish, ...wishes]);

    // Check if contributor exists or add new
    const existing = contributors.find((c) => c.name.toLowerCase() === contributeName.trim().toLowerCase());
    if (existing) {
      setContributors(contributors.map((c) => (c.id === existing.id ? { ...c, paid: true, amount: amt } : c)));
    } else {
      setContributors([
        ...contributors,
        { id: Date.now().toString(), name: contributeName.trim(), paid: true, amount: amt },
      ]);
    }

    setShowContributeModal(false);
    setContributeName("");
    setContributeAmount("");
    setContributeMessage("");

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#6366f1", "#f59e0b"],
    });
    cyberSound.play("chime");
    toast.success(`${formatPrice(amt)} miqdoridagi hissa muvaffaqiyatli qabul qilindi!`, "To'lov Qabul Qilindi 🎉");
  };

  const handleShareTelegram = () => {
    cyberSound.playConfirm();
    const text =
      `🎁 *JAMOAVIY SOVG'A POOL*\n` +
      `──────────────────────\n` +
      `📌 *Sovg'a:* ${campaignTitle}\n` +
      `🎯 *Jami summa:* ${formatPrice(targetAmount)}\n` +
      `👥 *Ishtirokchilar:* ${contributors.length} kishi\n` +
      `💰 *Har bir kishi ulushi:* ${formatPrice(sharePerPerson)}\n` +
      `💳 *Karta raqam:* \`${cardOrPhone}\`\n\n` +
      `📊 *Yig'ilgan summa:* ${formatPrice(totalCollected)} (${progressPercent}%)\n` +
      `⏳ *Qolgan summa:* ${formatPrice(remainingAmount)}\n\n` +
      `📱 Payme orqali to'lash: https://payme.uz/fallback/pay/${cardOrPhone.replace(/\\s+/g, "")}\n\n` +
      `Iltimos, o'z ulushingizni tashlab xabar bering!`;

    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopyCard = () => {
    cyberSound.playClick();
    navigator.clipboard.writeText(cardOrPhone.replace(/\s+/g, ""));
    toast.success("Karta raqami nusxalandi!", "Nusxalandi");
  };

  const cleanCard = cardOrPhone.replace(/\s+/g, "");

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] text-slate-900 dark:text-white py-8 sm:py-12 transition-colors relative overflow-hidden animate-fade-in">
      {/* Artisanal Ambient Vignette & Warm Gold Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1000px,100vw)] max-w-full h-[400px] bg-gradient-to-b from-amber-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-10 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-gold-500/20 to-amber-500/15 border border-gold-500/30 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-widest shadow-xs">
            <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
            <span>Jamoaviy Xarid & Splitter</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
            Jamoaviy Sovg'a & <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Payme / Click Ulushi</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
            Do'stlar, sinfdoshlar yoki hamkasblar bilan birgalikda orzudagi katta sovg'ani xarid qiling. 
            Har bir kishining ulushini avtomatik hisoblab, to'lovlarni real vaqtda kuzating.
          </p>

          {/* Campaign Presets Carousel */}
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400">Tezkor shablon:</span>
            {CAMPAIGN_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p)}
                className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition border-2 border-amber-200/60 dark:border-slate-800 cursor-pointer shadow-2xs active:scale-95"
              >
                {p.title.split(" ")[0]} ({p.contributors.length} kishi)
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Pool Progress & Payment Hub */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Progress Card */}
            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 sm:p-7 border-2 border-amber-200/80 dark:border-amber-500/25 shadow-luxury space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                    Target Sovg'a
                  </span>
                  <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
                    {campaignTitle}
                  </h3>
                </div>
                <span className={`text-xs font-black px-3.5 py-1 rounded-full border-2 flex-shrink-0 shadow-xs ${
                  progressPercent >= 100 
                    ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700" 
                    : "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                }`}>
                  {progressPercent}% Yig'ildi
                </span>
              </div>

              {/* Custom Progress Bar */}
              <div className="space-y-2">
                <div className="w-full h-4 bg-amber-100/70 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border-2 border-amber-200/80 dark:border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progressPercent >= 100
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm"
                        : "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 shadow-sm"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-bold pt-1">
                  <span>
                    Yig'ildi: <strong className="text-emerald-700 dark:text-emerald-400">{formatPrice(totalCollected)}</strong>
                  </span>
                  <span>
                    Jami: <strong className="text-slate-900 dark:text-white">{formatPrice(targetAmount)}</strong>
                  </span>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white/90 dark:bg-slate-900/60 p-3.5 rounded-2xl border-2 border-amber-200/70 dark:border-slate-800 text-center shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                    Har bir kishi ulushi
                  </span>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block mt-0.5">
                    {formatPrice(sharePerPerson)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Teng taqsimot</span>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/60 p-3.5 rounded-2xl border-2 border-amber-200/70 dark:border-slate-800 text-center shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                    Qolgan summa
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-700 dark:text-amber-300 block mt-0.5">
                    {formatPrice(remainingAmount)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    {contributors.filter((c) => !c.paid).length} kishi kutilmoqda
                  </span>
                </div>
              </div>

              {/* Payme & Click Deep Link Action Box */}
              <div className="p-4.5 rounded-2xl bg-gradient-to-br from-[#121624] via-[#0d101a] to-[#080a11] text-white border-2 border-amber-400/40 shadow-luxury space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-400 stroke-[2.2]" />
                    <span>Karta raqami (Ulush uchun):</span>
                  </span>
                  <button
                    onClick={handleCopyCard}
                    className="text-[11px] font-bold text-amber-300 hover:text-white transition flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Nusxalash</span>
                  </button>
                </div>

                <div className="font-mono text-base font-black tracking-widest bg-slate-900/80 p-2.5 rounded-xl border border-amber-400/30 text-center text-amber-200">
                  {cardOrPhone}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <a
                    href={`https://payme.uz/fallback/pay/${cleanCard}?amount=${sharePerPerson * 100}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-black rounded-xl text-center transition flex items-center justify-center gap-1 shadow-xs active:scale-95"
                  >
                    <span>Payme</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
                  </a>

                  <a
                    href={`https://my.click.uz`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-black rounded-xl text-center transition flex items-center justify-center gap-1 shadow-xs active:scale-95"
                  >
                    <span>Click</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
                  </a>

                  <button
                    onClick={() => {
                      cyberSound.playClick();
                      setShowQrModal(true);
                    }}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white text-[11px] font-bold rounded-xl text-center transition flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer active:scale-95"
                  >
                    <QrCode className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>QR Kod</span>
                  </button>
                </div>
              </div>

              {/* Quick Online Contribute Button */}
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setShowContributeModal(true);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-95"
              >
                <Wallet className="w-4 h-4 text-emerald-200 stroke-[2.2]" />
                <span>O'z Ulushimni To'lash & Tabrik Yozish</span>
              </button>

              {/* Telegram Share Button */}
              <button
                onClick={handleShareTelegram}
                className="w-full py-3.5 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4 text-white stroke-[2.2]" />
                <span>Guruhga Telegramda yuborish</span>
              </button>
            </div>
          </div>

          {/* Right Column: Setup Campaign & Contributor List */}
          <div className="lg:col-span-7 space-y-6">
            {/* Settings Box */}
            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 border-2 border-amber-200/80 dark:border-amber-500/25 shadow-luxury space-y-4">
              <h2 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Jamoaviy Sovg'a Ma'lumotlari</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Sovg'a nomi & Maqsad:</label>
                  <input
                    type="text"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200/80 dark:border-slate-700 font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    placeholder="e.g. Sardorga Yangi Noutbuk"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Jami byudjet (UZS):</label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => handleTargetChange(Number(e.target.value))}
                    step="50000"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200/80 dark:border-slate-700 font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === "uz" ? "To'lov qabul qiluvchi karta:" : language === "ru" ? "Карта для сбора средств:" : "Collection Card / Account:"}
                  </label>
                  <input
                    type="text"
                    value={cardOrPhone}
                    onChange={(e) => setCardOrPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200/80 dark:border-slate-700 font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    placeholder="8600 ...."
                  />
                </div>
              </div>
            </div>

            {/* Contributors Manager */}
            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 border-2 border-amber-200/80 dark:border-amber-500/25 shadow-luxury space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>
                    {language === "uz"
                      ? `Ishtirokchilar ro'yxati (${contributors.length} kishi)`
                      : language === "ru"
                      ? `Список участников (${contributors.length} чел.)`
                      : `Contributors List (${contributors.length} people)`}
                  </span>
                </h2>
                <span className="text-xs text-amber-800 dark:text-amber-400 font-semibold">
                  {language === "uz" ? "To'laganlarni belgilang" : language === "ru" ? "Отметьте оплативших" : "Check off contributors who paid"}
                </span>
              </div>

              {/* Add New Contributor Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newContributorName}
                  onChange={(e) => setNewContributorName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddContributor()}
                  placeholder={
                    language === "uz"
                      ? "Yangi ishtirokchi ismini yozing (masalan: Anvar)..."
                      : language === "ru"
                      ? "Введите имя участника (например, Анвар)..."
                      : "Enter contributor name (e.g. Alex)..."
                  }
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-200/80 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleAddContributor}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 text-slate-950 font-black rounded-2xl text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.2]" />
                  <span>{language === "uz" ? "Qo'shish" : language === "ru" ? "Добавить" : "Add"}</span>
                </button>
              </div>

              {/* List */}
              <div className="space-y-2 pt-1">
                {contributors.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                      c.paid
                        ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60"
                        : "bg-white/90 dark:bg-slate-900/60 border-amber-200/60 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleTogglePaid(c.id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition border-2 cursor-pointer active:scale-95 ${
                          c.paid
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-transparent hover:border-amber-400"
                        }`}
                        title={c.paid ? "To'langan (Bekor qilish)" : "To'landi deb belgilash"}
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                      </button>

                      <div>
                        <span className={`text-xs font-bold block ${c.paid ? "text-emerald-950 dark:text-emerald-200" : "text-slate-800 dark:text-slate-200"}`}>
                          {c.name}
                        </span>
                        <span className={`text-[11px] font-semibold ${c.paid ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}`}>
                          {c.paid ? "To'landi ✓" : "Kutilmoqda..."}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-xs text-slate-900 dark:text-white">
                        {formatPrice(c.amount)}
                      </span>
                      <button
                        onClick={() => handleRemoveContributor(c.id)}
                        className="w-7 h-7 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wishes Wall (Tabriklar va Tilaklar Devori) */}
            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 border-2 border-amber-200/80 dark:border-amber-500/25 shadow-luxury space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Tabriklar Devori ({wishes.length} ta tilak)</span>
                </h2>
                <span className="text-xs text-amber-800 dark:text-amber-400 font-semibold">Do'stlar va hamkasblar tilaklari</span>
              </div>

              <div className="space-y-3">
                {wishes.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/60 border-2 border-amber-200/60 dark:border-slate-800 space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{w.name}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-slate-900 text-amber-400 uppercase">
                          {w.paymentMethod}
                        </span>
                      </div>
                      <span className="font-black text-emerald-700 dark:text-emerald-400">{formatPrice(w.amount)}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic font-serif">"{w.message}"</p>
                    <span className="text-[10px] text-slate-400 block">{w.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Group Trust Guarantee Banner */}
            <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-yellow-50 dark:from-slate-900 dark:to-slate-800 p-4.5 rounded-2xl border-2 border-amber-200/80 dark:border-amber-500/30 flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Shaffoflik & Aniqlik Kafolati</span>
                <span>
                  Hisoblagich har bir kishi qo'shilganda yoki chiqarilganda ulushni teng qayta hisoblaydi. 
                  Hech kimdan ortiqcha yoki kam mablag' talab etilmaydi.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Modal for In-person Contribution */}
        {showQrModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in overflow-y-auto">
            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl max-w-sm w-full max-h-[92dvh] overflow-y-auto p-5 sm:p-6 shadow-2xl border-2 border-amber-300/80 dark:border-amber-500/30 relative text-center space-y-5 animate-scale-in">
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center border-2 border-amber-300 mx-auto mb-2">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                  To'lov QR Kodi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Payme yoki Click ilovasi orqali skaner qiling
                </p>
              </div>

              {/* Stylized QR Code Graphic */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-amber-200 dark:border-slate-800 inline-block shadow-inner">
                <svg viewBox="0 0 100 100" className="w-44 h-44 mx-auto text-slate-900 dark:text-amber-400 fill-current">
                  <rect x="0" y="0" width="30" height="30" rx="4" />
                  <rect x="5" y="5" width="20" height="20" fill="white" className="dark:fill-slate-900" />
                  <rect x="10" y="10" width="10" height="10" />

                  <rect x="70" y="0" width="30" height="30" rx="4" />
                  <rect x="75" y="5" width="20" height="20" fill="white" className="dark:fill-slate-900" />
                  <rect x="80" y="10" width="10" height="10" />

                  <rect x="0" y="70" width="30" height="30" rx="4" />
                  <rect x="5" y="75" width="20" height="20" fill="white" className="dark:fill-slate-900" />
                  <rect x="10" y="80" width="10" height="10" />

                  <rect x="36" y="8" width="6" height="6" />
                  <rect x="46" y="8" width="6" height="6" />
                  <rect x="56" y="8" width="6" height="6" />
                  <rect x="36" y="20" width="6" height="6" />
                  <rect x="48" y="24" width="8" height="8" />
                  <rect x="8" y="38" width="8" height="8" />
                  <rect x="22" y="44" width="6" height="6" />
                  <rect x="36" y="38" width="10" height="10" fill="#f59e0b" />
                  <rect x="52" y="38" width="8" height="8" />
                  <rect x="66" y="44" width="8" height="8" />
                  <rect x="80" y="38" width="6" height="6" />
                  <rect x="36" y="54" width="8" height="8" />
                  <rect x="50" y="54" width="6" height="6" />
                  <rect x="62" y="60" width="8" height="8" />
                  <rect x="80" y="54" width="8" height="8" />
                  <rect x="38" y="70" width="6" height="6" />
                  <rect x="48" y="78" width="8" height="8" />
                  <rect x="62" y="74" width="6" height="6" />
                  <rect x="78" y="74" width="12" height="12" />
                  <rect x="42" y="88" width="8" height="8" />
                  <rect x="56" y="88" width="8" height="8" />
                </svg>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-amber-900 dark:text-amber-300 block">
                  {cardOrPhone}
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white block">
                  Ulush: {formatPrice(sharePerPerson)}
                </span>
              </div>

              <button
                onClick={handleCopyCard}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 text-slate-950 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
              >
                <Copy className="w-4 h-4" />
                <span>Karta Raqamini Nusxalash</span>
              </button>
            </div>
          </div>
        )}

        {/* Online Contribution & Wish Modal */}
        {showContributeModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in overflow-y-auto">
            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl max-w-md w-full max-h-[92dvh] overflow-y-auto p-5 sm:p-7 shadow-2xl border-2 border-amber-300/80 dark:border-amber-500/30 relative animate-scale-in space-y-4">
              <button
                onClick={() => setShowContributeModal(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-300">
                  Onlayn Hissa Qo'shish
                </span>
                <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mt-2">
                  Sovg'aga Ulush Qo'shish
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tavsiya etilgan ulush: <strong>{formatPrice(sharePerPerson)}</strong>
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ismingiz:</label>
                  <input
                    type="text"
                    placeholder="Ismingizni kiriting..."
                    value={contributeName}
                    onChange={(e) => setContributeName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200/80 dark:border-slate-700 font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === "uz" ? "Ulush miqdori (UZS):" : language === "ru" ? "Сумма взноса (UZS):" : "Contribution Share (UZS):"}
                  </label>
                  <input
                    type="number"
                    placeholder={sharePerPerson.toString()}
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value ? parseInt(e.target.value) : "")}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200/80 dark:border-slate-700 font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === "uz" ? "To'lov usuli:" : language === "ru" ? "Способ оплаты:" : "Payment method:"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "payme", label: "Payme" },
                      { id: "click", label: "Click" },
                      { id: "uzum", label: "Uzum Bank" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaymentProvider(p.id as any)}
                        className={`py-2 px-3 rounded-xl border-2 text-center font-black text-xs transition cursor-pointer ${
                          paymentProvider === p.id
                            ? "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 border-amber-400 shadow-xs"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-amber-200/70 dark:border-slate-700 hover:border-amber-400"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === "uz" ? "Tabrik so'zlari yoki tilagingiz:" : language === "ru" ? "Поздравление или пожелание:" : "Greeting or best wish message:"}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={
                      language === "uz"
                        ? "Sovg'a egasiga samimiy tilaklaringizni yozing..."
                        : language === "ru"
                        ? "Напишите ваши теплые пожелания виновнику торжества..."
                        : "Write a warm congratulatory message..."
                    }
                    value={contributeMessage}
                    onChange={(e) => setContributeMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200/80 dark:border-slate-700 font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                onClick={handleContributeSubmit}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                <span>
                  {language === "uz" ? "To'lovni Tasdiqlash & Tabrikni Joylash" : language === "ru" ? "Подтвердить Оплату & Оставить Пожелание" : "Confirm Contribution & Post Wish"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
