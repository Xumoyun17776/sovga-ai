import { useState, useRef } from "react";
import { formatPrice } from "../lib/api";
import { useToast } from "./Toast";
import { useTranslation } from "../lib/i18n";
import { X, Printer, Send, Copy, Sparkles, Heart, Gift, ExternalLink, Check, ShoppingBag } from "lucide-react";

interface Props {
  product: {
    name: string;
    price?: number | null;
    currency?: string;
    store?: string;
    imageUrl?: string | null;
    reason?: string;
    specs?: any;
    url?: string;
  };
  onClose: () => void;
}

export default function GiftCardModal({ product, onClose }: Props) {
  const { language } = useTranslation();
  const toast = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const defaultRecipient =
    language === "uz" ? "Aziz do'stim" : language === "ru" ? "Дорогой друг" : "Dear Friend";
  const defaultGiver =
    language === "uz" ? "Sizning do'stingiz" : language === "ru" ? "Твой друг" : "Your Friend";
  const defaultMessage =
    language === "uz"
      ? "Ushbu ajoyib sovg'a maxsus siz uchun Sovg'a AI tadqiqoti orqali tanlandi. Har kuni sizga quvonch keltirsin!"
      : language === "ru"
      ? "Этот особенный подарок был подобран специально для вас с помощью Sovg'a AI. Пусть он дарит радость каждый день!"
      : "This special gift was curated especially for you through Sovg'a AI research. May it bring you joy every single day!";

  const [recipientName, setRecipientName] = useState(defaultRecipient);
  const [giverName, setGiverName] = useState(defaultGiver);
  const [personalMessage, setPersonalMessage] = useState(defaultMessage);
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSendTelegram = () => {
    const cardTitle =
      language === "uz"
        ? "*MAXSUS SOVG'A KARTASI*"
        : language === "ru"
        ? "*ОСОБЕННЫЙ ПОДАРОЧНЫЙ СЕРТИФИКАТ*"
        : "*EXCLUSIVE GIFT CERTIFICATE & CARD*";
    const toLabel = language === "uz" ? "Kimga" : language === "ru" ? "Кому" : "To";
    const fromLabel = language === "uz" ? "Kimdan" : language === "ru" ? "От кого" : "From";
    const giftLabel =
      language === "uz" ? "Tanlangan sovg'a" : language === "ru" ? "Выбранный подарок" : "Selected gift";
    const storeLabel = language === "uz" ? "Do'kon" : language === "ru" ? "Магазин" : "Store";
    const defaultStore =
      language === "uz" ? "O'zbekiston do'koni" : language === "ru" ? "Магазин Узбекистана" : "Uzbekistan Retailer";
    const reasonLabel =
      language === "uz" ? "Nega tanlandi" : language === "ru" ? "Почему выбран" : "Why selected";
    const defaultReason =
      language === "uz"
        ? "AI tadqiqoti bo'yicha eng yaxshi variant"
        : language === "ru"
        ? "Лучший выбор по данным AI исследования"
        : "Best option verified by AI market research";
    const linkLabel =
      language === "uz" ? "Xarid havolasi" : language === "ru" ? "Ссылка на покупку" : "Store Link";
    const platformLabel =
      language === "uz"
        ? "Sovg'a AI — O'zbekistondagi AI xarid tadqiqotchisi"
        : language === "ru"
        ? "Sovg'a AI — AI шопинг-исследователь в Узбекистане"
        : "Sovg'a AI — Uzbekistan's Premier AI Shopping Researcher";

    const text =
      `${cardTitle}\n` +
      `${toLabel}: ${recipientName}\n` +
      `${fromLabel}: ${giverName}\n\n` +
      `"${personalMessage}"\n\n` +
      `*${giftLabel}:* ${product.name}\n` +
      `*${storeLabel}:* ${product.store || defaultStore}\n` +
      `*${reasonLabel}:* ${product.reason || defaultReason}\n\n` +
      `*${linkLabel}:* ${product.url || window.location.href}\n` +
      `${platformLabel}`;

    const url = `https://t.me/share/url?url=${encodeURIComponent(
      product.url || window.location.href
    )}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopyText = () => {
    const cardTitle =
      language === "uz"
        ? "MAXSUS SOVG'A KARTASI"
        : language === "ru"
        ? "ОСОБЕННЫЙ ПОДАРОЧНЫЙ СЕРТИФИКАТ"
        : "EXCLUSIVE GIFT CERTIFICATE & CARD";
    const toLabel = language === "uz" ? "Kimga" : language === "ru" ? "Кому" : "To";
    const fromLabel = language === "uz" ? "Kimdan" : language === "ru" ? "От кого" : "From";
    const giftLabel =
      language === "uz" ? "Tanlangan sovg'a" : language === "ru" ? "Выбранный подарок" : "Selected gift";
    const storeLabel = language === "uz" ? "Do'kon" : language === "ru" ? "Магазин" : "Store";
    const defaultStore =
      language === "uz" ? "O'zbekiston do'koni" : language === "ru" ? "Магазин Узбекистана" : "Uzbekistan Retailer";
    const reasonLabel =
      language === "uz" ? "Nega tanlandi" : language === "ru" ? "Почему выбран" : "Why selected";
    const defaultReason =
      language === "uz"
        ? "AI tadqiqoti bo'yicha eng yaxshi variant"
        : language === "ru"
        ? "Лучший выбор по данным AI исследования"
        : "Best option verified by AI market research";
    const linkLabel = language === "uz" ? "Havola" : language === "ru" ? "Ссылка" : "Link";

    const text =
      `${cardTitle}\n` +
      `${toLabel}: ${recipientName}\n` +
      `${fromLabel}: ${giverName}\n\n` +
      `"${personalMessage}"\n\n` +
      `${giftLabel}: ${product.name}\n` +
      `${storeLabel}: ${product.store || defaultStore}\n` +
      `${reasonLabel}: ${product.reason || defaultReason}\n` +
      `${linkLabel}: ${product.url || window.location.href}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    const toastMsg =
      language === "uz"
        ? "Sovg'a kartasi matni nusxalandi!"
        : language === "ru"
        ? "Текст открытки скопирован!"
        : "Gift card message copied to clipboard!";
    const toastTitle =
      language === "uz" ? "Nusxalandi" : language === "ru" ? "Скопировано" : "Copied";
    toast.success(toastMsg, toastTitle);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] text-slate-900 dark:text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-luxury relative my-auto border-2 border-amber-300/80 dark:border-amber-500/25 max-h-[92vh] max-h-[92dvh] overflow-y-auto print:p-0 print:m-0 print:border-none print:shadow-none animate-scale-in">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-14 bg-amber-400/15 dark:bg-amber-400/10 blur-2xl pointer-events-none rounded-full print:hidden" />

        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-amber-200/60 dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs print:hidden"
          aria-label="Yopish"
        >
          <X className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 print:hidden">
          <div className="w-11 h-11 icon-medallion icon-box-purple">
            <Gift className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
              {language === "uz"
                ? "Chop Etiladigan AI Sovg'a Sertifikati & Tabriknomasi"
                : language === "ru"
                ? "Печатный AI Подарочный Сертификат & Открытка"
                : "Printable AI Gift Certificate & Dedication Card"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === "uz"
                ? "Sovg'ani shaxsiylashtiring, chop eting yoki AI tavsiyanomasi bilan birga yuboring"
                : language === "ru"
                ? "Персонализируйте, распечатайте или отправьте открытку с AI-обоснованием"
                : "Personalize and print or send a dedication card with the AI backstory"}
            </p>
          </div>
        </div>

        {/* Customization Inputs (Hidden on Print) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-white/10 print:hidden text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {language === "uz" ? "Kimga (Qabul qiluvchi):" : language === "ru" ? "Кому (Получатель):" : "To (Recipient):"}
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-amber-500/30 font-semibold"
              placeholder={
                language === "uz"
                  ? "Masalan: Aziz do'stim Bobur"
                  : language === "ru"
                  ? "Например: Дорогой Бобур"
                  : "e.g. Dear Bobur"
              }
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {language === "uz" ? "Kimdan (Yuboruvchi):" : language === "ru" ? "От кого (Отправитель):" : "From (Sender):"}
            </label>
            <input
              type="text"
              value={giverName}
              onChange={(e) => setGiverName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-amber-500/30 font-semibold"
              placeholder={
                language === "uz"
                  ? "Masalan: Ali & Madina"
                  : language === "ru"
                  ? "Например: Али и Мадина"
                  : "e.g. Ali & Madina"
              }
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {language === "uz" ? "Tabrik / Dildan so'zlar:" : language === "ru" ? "Поздравление / Тёплые слова:" : "Dedication Message:"}
            </label>
            <textarea
              rows={2}
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder={
                language === "uz"
                  ? "Tabrik matnini yozing..."
                  : language === "ru"
                  ? "Напишите текст поздравления..."
                  : "Write your dedication message..."
              }
            />
          </div>
        </div>

        {/* ─── ELEGANT PRINTABLE CARD CONTAINER ─────────────────────── */}
        <div
          ref={printRef}
          className="border-2 border-slate-200 bg-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 relative overflow-hidden"
        >
          {/* Ornamental corner stamp */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center">
                <Gift className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <span className="font-display font-black text-xs uppercase tracking-widest text-slate-900 block">
                  {language === "uz"
                    ? "SOVG'A SERTIFIKATI"
                    : language === "ru"
                    ? "ПОДАРОЧНЫЙ СЕРТИФИКАТ"
                    : "GIFT CERTIFICATE"}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Verified Gift Dedication · Sovg'a AI
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                {language === "uz" ? "Sana" : language === "ru" ? "Дата" : "Date"}
              </span>
              <span className="text-xs font-semibold text-slate-700">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Greeting Box */}
          <div className="space-y-2">
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-slate-900">
              {language === "uz" ? "Hurmatli" : language === "ru" ? "Уважаемый(ая)" : "Dear"}{" "}
              <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-4">{recipientName}</span>!
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              "{personalMessage}"
            </p>
          </div>

          {/* Product Showcase */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
              )}
            </div>

            <div className="flex-1 space-y-1.5 text-center sm:text-left">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                {product.store || (language === "uz" ? "Tadqiq qilingan mahsulot" : language === "ru" ? "Исследованный товар" : "Researched Product")}
              </span>
              <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 leading-snug">
                {product.name}
              </h4>
              {product.price && (
                <div className="text-sm font-extrabold text-slate-900">
                  {formatPrice(product.price, product.currency)}
                </div>
              )}
            </div>
          </div>

          {/* AI Grounded Reason */}
          {product.reason && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-600" />{" "}
                {language === "uz"
                  ? "Nega aynan bu sovg'a tanlandi?"
                  : language === "ru"
                  ? "Почему именно этот подарок?"
                  : "Why this gift was selected?"}
              </span>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {product.reason}
              </p>
            </div>
          )}

          {/* Signature Footer */}
          <div className="flex items-end justify-between border-t border-slate-200 pt-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                {language === "uz" ? "Samimiyat bilan:" : language === "ru" ? "С наилучшими пожеланиями:" : "With warm regards:"}
              </span>
              <span className="font-display font-extrabold text-slate-900 text-sm sm:text-base">{giverName}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">
                {language === "uz" ? "Tadqiqot platformasi:" : language === "ru" ? "Платформа исследований:" : "Research platform:"}
              </span>
              <span className="font-bold text-slate-900">sovga.uz</span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Print, Telegram, Copy) (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 mt-6 print:hidden">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition border border-slate-200/80 dark:border-white/10 active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 stroke-[2.2]" /> : <Copy className="w-4 h-4 stroke-[2.2]" />}
            <span>
              {copied
                ? language === "uz" ? "Nusxalandi!" : language === "ru" ? "Скопировано!" : "Copied!"
                : language === "uz" ? "Matnni nusxalash" : language === "ru" ? "Скопировать текст" : "Copy Text"}
            </span>
          </button>

          <button
            onClick={handleSendTelegram}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold text-xs rounded-xl transition shadow-xs active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4 stroke-[2.2]" />
            <span>
              {language === "uz" ? "Telegramda yuborish" : language === "ru" ? "Отправить в Telegram" : "Send via Telegram"}
            </span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 btn-luxury-gold font-bold text-xs rounded-xl transition shadow-md active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 stroke-[2.2]" />
            <span>
              {language === "uz" ? "Kartani chop etish (Print)" : language === "ru" ? "Распечатать карту (Print)" : "Print Certificate (PDF)"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
