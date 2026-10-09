import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Wallet,
  Sparkles,
  Crown,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { auth, formatPrice } from "../lib/api";
import { useTranslation } from "../lib/i18n";
import { useToast } from "./Toast";
import { cyberSound } from "../lib/cyberSound";

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const { language } = useTranslation();
  const toast = useToast();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: auth.me });

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const referralCode = user?.id ? `SOVGA-${user.id * 7 + 104}` : "SOVGA-VIP";
  const origin = typeof window !== "undefined" ? window.location.origin : "https://sovga.uz";
  const referralLink = `${origin}/?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    cyberSound.playClick();
    toast.success(
      language === "uz" ? "Taklif havolasi nusxalandi!" : language === "ru" ? "Реферальная ссылка скопирована!" : "Referral link copied!",
      language === "uz" ? "Muvaffaqiyatli" : "Success"
    );
    setTimeout(() => setCopied(false), 2500);
  };

  const shareTextUz = `🎁 Sovg'a AI — O'zbekistondagi barcha do'konlar narxlarini eng arzonini topib beruvchi sun'iy intellekt! Mening havolam orqali kiring va 20,000 UZS bonus oling: ${referralLink}`;
  const shareTextRu = `🎁 Sovg'a AI — AI поисковик лучших цен по магазинам Узбекистана! Переходи по моей ссылке и получи бонус 20 000 UZS: ${referralLink}`;
  const shareText = language === "ru" ? shareTextRu : shareTextUz;

  const openTelegramShare = () => {
    cyberSound.playClick();
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const openWhatsappShare = () => {
    cyberSound.playClick();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] text-slate-900 dark:text-white rounded-3xl p-5 sm:p-8 max-w-lg w-full max-h-[92dvh] overflow-y-auto shadow-luxury border-2 border-amber-300/80 dark:border-amber-500/25 space-y-6 animate-scale-in relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-amber-400/15 dark:bg-amber-400/10 blur-2xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Gift className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase border border-amber-300/70 dark:border-amber-500/30">
                <Sparkles className="w-3 h-3 text-amber-500 stroke-[2.2]" />
                <span>Viral Referral & Cashback</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white mt-0.5">
                {language === "uz" ? "Do'stni Taklif Qilish & Keshbek" : language === "ru" ? "Приглашай Друзей и Получай Кэшбэк" : "Invite Friends & Earn Cashback"}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-amber-200/60 dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
            aria-label="Yopish"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Value Proposition Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-orange-500/10 border border-amber-300 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-500 stroke-[2.2]" />
            <span>
              {language === "uz"
                ? "Har bir taklif qilingan do'stingiz uchun 25,000 UZS keshbek yoki 1 oy bepul PRO!"
                : language === "ru"
                ? "За каждого приглашенного друга — 25 000 UZS кэшбэк или 1 месяц PRO бесплатно!"
                : "Earn 25,000 UZS cashback or 1 month free PRO for every invited friend!"}
            </span>
          </p>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
            {language === "uz"
              ? "Do'stingiz saytga kirganda 20,000 UZS boshlang'ich sovg'a vaucheriga ega bo'ladi."
              : "Ваш друг также получает ваучер на 20 000 UZS при первой покупке."}
          </p>
        </div>

        {/* Referral Link Copy Bar */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            {language === "uz" ? "Sizning Shaxsiy Taklif Havolangiz" : language === "ru" ? "Ваша Персональная Ссылка" : "Your Referral Link"}
          </label>
          <div className="flex items-center gap-2 p-2 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-amber-200/80 dark:border-slate-700 shadow-2xs">
            <span className="font-mono text-xs text-slate-700 dark:text-slate-300 px-2 truncate flex-1 select-all">
              {referralLink}
            </span>
            <button
              onClick={copyLink}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95 ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "btn-luxury-gold text-slate-950"
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 stroke-[2.2]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.2]" />}
              <span>{copied ? (language === "uz" ? "Nusxalandi" : "Скопировано") : (language === "uz" ? "Nusxalash" : "Копировать")}</span>
            </button>
          </div>
        </div>

        {/* 1-Click Social Sharing Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={openTelegramShare}
            className="py-3 px-4 rounded-2xl bg-[#229ED9] hover:bg-[#1e8ec3] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-sky-500/10 cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4 stroke-[2.2]" />
            <span>Telegramda Ulashish</span>
          </button>
          <button
            onClick={openWhatsappShare}
            className="py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-500/10 cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4 stroke-[2.2]" />
            <span>WhatsAppda Ulashish</span>
          </button>
        </div>

        {/* Tiers Roadmap */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {language === "uz" ? "Mukofot Darajalari (Roadmap)" : "Уровни Наград"}
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">1 ta do'st</span>
              <span className="font-black text-emerald-600 block">25,000 UZS</span>
              <span className="text-[9px] text-slate-500 block">Keshbek</span>
            </div>
            <div className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 space-y-1">
              <span className="text-[10px] text-amber-600 font-mono block">3 ta do'st</span>
              <span className="font-black text-amber-600 dark:text-amber-400 block">1 Oy PRO</span>
              <span className="text-[9px] text-slate-500 block">Bepul obuna</span>
            </div>
            <div className="p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 space-y-1">
              <span className="text-[10px] text-purple-600 font-mono block">5+ do'st</span>
              <span className="font-black text-purple-600 dark:text-purple-400 block">VIP Gold</span>
              <span className="text-[9px] text-slate-500 block">Cheksiz konsyerj</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Avtomatik keshbek hisoblanishi faol</span>
          </span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
            ID: {referralCode}
          </span>
        </div>
      </div>
    </div>
  );
}
