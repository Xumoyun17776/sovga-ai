import { useState, useEffect } from "react";
import { useCurrency } from "../lib/currency";
import { useTranslation } from "../lib/i18n";
import { cyberSound } from "../lib/cyberSound";
import {
  DollarSign,
  ArrowRightLeft,
  X,
  TrendingUp,
  Check,
  Copy,
  Sparkles,
  Building2,
} from "lucide-react";

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CurrencyConverterModal({ isOpen, onClose }: CurrencyConverterModalProps) {
  const { language } = useTranslation();
  const { exchangeRate } = useCurrency();
  const [usdAmount, setUsdAmount] = useState<string>("100");
  const [uzsAmount, setUzsAmount] = useState<string>("");
  const [activeDirection, setActiveDirection] = useState<"usd_to_uzs" | "uzs_to_usd">("usd_to_uzs");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cyberSound.playClick(1200);
      const val = parseFloat(usdAmount) || 100;
      setUzsAmount(Math.round(val * exchangeRate).toLocaleString());
    }
  }, [isOpen, exchangeRate]);

  if (!isOpen) return null;

  const handleUsdChange = (val: string) => {
    setUsdAmount(val);
    setActiveDirection("usd_to_uzs");
    const numeric = parseFloat(val.replace(/[^\d.]/g, ""));
    if (!isNaN(numeric)) {
      setUzsAmount(Math.round(numeric * exchangeRate).toLocaleString());
    } else {
      setUzsAmount("0");
    }
  };

  const handleUzsChange = (val: string) => {
    const raw = val.replace(/[^\d]/g, "");
    setActiveDirection("uzs_to_usd");
    const numeric = parseFloat(raw);
    if (!isNaN(numeric)) {
      setUzsAmount(numeric.toLocaleString());
      setUsdAmount((numeric / exchangeRate).toFixed(2));
    } else {
      setUzsAmount("");
      setUsdAmount("0");
    }
  };

  const handleQuickPreset = (usd: number) => {
    cyberSound.playClick(1400);
    setUsdAmount(usd.toString());
    setActiveDirection("usd_to_uzs");
    setUzsAmount(Math.round(usd * exchangeRate).toLocaleString());
  };

  const handleCopy = () => {
    cyberSound.playConfirm();
    const textToCopy =
      activeDirection === "usd_to_uzs"
        ? `${uzsAmount} UZS`
        : `$${usdAmount} USD`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-5 sm:p-8 max-w-md w-full max-h-[92dvh] overflow-y-auto border-2 border-amber-300/80 dark:border-amber-500/25 shadow-luxury relative space-y-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-amber-400/15 dark:bg-amber-400/10 blur-2xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-amber-200/60 dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
          aria-label="Yopish"
        >
          <X className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 icon-medallion icon-box-gold shadow-md">
            <DollarSign className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
              <Building2 className="w-3 h-3 stroke-[2.2]" />
              <span>
                {language === "uz"
                  ? "MARKAZIY BANK RASMIY KURSI"
                  : language === "ru"
                  ? "ОФИЦИАЛЬНЫЙ КУРС ЦБ РУЗ"
                  : "OFFICIAL CBU RATE"}
              </span>
            </div>
            <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mt-1">
              {language === "uz"
                ? "Valyuta & Narx Konvertori"
                : language === "ru"
                ? "Конвертер Валют & Курс ЦБ"
                : "Currency & Rate Converter"}
            </h3>
          </div>
        </div>

        {/* Live CBU Exchange Rate Strip */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <TrendingUp className="w-4 h-4 text-emerald-500 stroke-[2.2]" />
            <span className="font-medium">
              {language === "uz" ? "1 USD kursi:" : language === "ru" ? "Курс 1 USD:" : "1 USD rate:"}
            </span>
          </div>
          <span className="font-mono font-extrabold text-slate-900 dark:text-amber-400 text-sm">
            {exchangeRate.toLocaleString()} UZS
          </span>
        </div>

        {/* Conversion Inputs */}
        <div className="space-y-4">
          {/* USD Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>
                {language === "uz" ? "AQSH Dollari (USD)" : language === "ru" ? "Доллар США (USD)" : "US Dollar (USD)"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">$ USD</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={usdAmount}
                onChange={(e) => handleUsdChange(e.target.value)}
                placeholder="100"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-9 h-9 rounded-xl icon-medallion icon-box-gold shadow-xs">
              <ArrowRightLeft className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>

          {/* UZS Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>
                {language === "uz" ? "O'zbekiston So'mi (UZS)" : language === "ru" ? "Узбекский Сум (UZS)" : "Uzbek Som (UZS)"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">UZS</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={uzsAmount}
                onChange={(e) => handleUzsChange(e.target.value)}
                placeholder="1,280,000"
                className="w-full pl-4 pr-16 py-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">UZS</span>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === "uz" ? "Tezkor variantlar:" : language === "ru" ? "Быстрый выбор:" : "Quick Presets:"}
          </span>
          <div className="flex flex-wrap gap-2">
            {[20, 50, 100, 200, 500, 1000].map((preset) => (
              <button
                key={preset}
                onClick={() => handleQuickPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border cursor-pointer active:scale-95 ${
                  parseFloat(usdAmount) === preset
                    ? "bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 border-transparent shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-amber-400"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl btn-luxury-gold text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 stroke-[2.2]" /> : <Copy className="w-4 h-4 stroke-[2.2]" />}
            <span>
              {copied
                ? language === "uz" ? "Nusxalandi!" : language === "ru" ? "Скопировано!" : "Copied!"
                : language === "uz" ? "Natijani nusxalash" : language === "ru" ? "Скопировать результат" : "Copy Result"}
            </span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer active:scale-95"
          >
            {language === "uz" ? "Yopish" : language === "ru" ? "Закрыть" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
