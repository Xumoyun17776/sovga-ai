import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { tracking, auth, formatPrice } from "../lib/api";
import { X, Bell, Check, TrendingDown, Shield, Send } from "../lib/icons";
import { useToast } from "./Toast";
import AuthModal from "./AuthModal";
import type { ResearchProduct } from "@shared/types";

interface Props {
  product?: ResearchProduct;
  productName?: string;
  currentPrice?: number;
  currency?: string;
  store?: string;
  url?: string;
  onClose: () => void;
}

export default function PriceTrackModal(props: Props) {
  const { onClose } = props;
  const toast = useToast();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: auth.me });

  const name = props.product?.name || props.productName || "Product";
  const curPrice = props.product?.price || props.currentPrice || 1000000;
  const store = props.product?.store || props.store;
  const url = props.product?.url || props.url;

  const suggestedTarget = Math.round((curPrice * 0.88) / 10000) * 10000;
  const [targetPrice, setTargetPrice] = useState(suggestedTarget.toString());
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      tracking.create({
        productName: name,
        targetPrice: parseFloat(targetPrice),
        currentPrice: curPrice || undefined,
        store,
        url,
      }),
    onSuccess: () => {
      setSuccess(true);
      toast.success(
        `Narx ${formatPrice(parseFloat(targetPrice))} ga tushganda sizga xabar beriladi!`,
        "Narx kuzatuvi faollashtirildi"
      );
      setTimeout(() => onClose(), 1500);
    },
    onError: (err: any) => {
      toast.error(err.message || "Xatolik yuz berdi");
    },
  });

  // Enforce registration before tracking
  if (!user) {
    return (
      <AuthModal
        isOpen={true}
        onClose={onClose}
        initialMode="register"
        customTitle="Narx monitoringini faollashtirish"
        customMessage="Mahsulot narxi arzonlashganda birinchi bo'lib bildirishnoma olish uchun ro'yxatdan o'ting"
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#0b1224] text-slate-900 dark:text-white rounded-2xl max-w-sm w-full max-h-[92dvh] overflow-y-auto p-5 sm:p-6 shadow-sm relative border border-[var(--line)] dark:border-amber-500/25 animate-scale-in">
        {/* Ambient Top Glow */}

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-[var(--line)] dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer shadow-2xs"
          aria-label="Yopish"
        >
          <X className="w-4 h-4 stroke-[2.2]" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 icon-medallion icon-box-emerald mx-auto shadow-md">
              <Check className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Narx monitoringi yoqildi!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Uzum Market, Texnomart va MediaPark do'konlarida narx {formatPrice(parseFloat(targetPrice))} ga tushganda sizga darhol xabar beramiz.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 icon-medallion icon-box-gold">
                <Bell className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Narx tushishini kuzatish</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Arzonlashganda birinchi bo'lib bilib oling</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 text-xs space-y-1">
              <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{name}</span>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Hozirgi tekshirilgan narx:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{formatPrice(curPrice)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                Kutilayotgan narx (UZS)
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
              <div className="flex gap-1.5 mt-2">
                {[5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTargetPrice(Math.round(curPrice * (1 - pct / 100)).toString())}
                    className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold transition cursor-pointer border border-slate-200/60 dark:border-white/5"
                  >
                    -{pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-[11px] text-slate-600 dark:text-slate-300 bg-amber-50/70 dark:bg-amber-950/30 p-3 rounded-2xl border border-[var(--line)] dark:border-amber-500/20">
              <TrendingDown className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 stroke-[2.2]" />
              <span>Uzum Market, Texnomart, Asaxiy va MediaPark narxlari har kuni tekshirib boriladi.</span>
            </div>

            <button
              onClick={() => mutation.mutate()}
              disabled={!targetPrice || mutation.isPending}
              className="w-full btn-luxury-gold py-3 rounded-xl text-xs font-bold shadow-md transition disabled:opacity-40 cursor-pointer"
            >
              {mutation.isPending ? "Faollashtirilmoqda..." : "Kuzatuvni boshlash"}
            </button>

            <button
              onClick={() => {
                mutation.mutate(); setTimeout(() => { window.open("https://t.me/SovgaUzBot?start=track_" + Date.now(), "_blank"); }, 1000);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Telegram orqali kuzatish</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

