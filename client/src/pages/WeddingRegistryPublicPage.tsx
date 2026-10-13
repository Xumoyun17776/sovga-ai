import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useTranslation } from "../lib/i18n";
import { registries, formatPrice, formatDate } from "../lib/api";
import { useToast } from "../components/Toast";
import {
  Heart,
  Calendar,
  Gift,
  Check,
  X,
  Share2,
  Copy,
  Sparkles,
  DollarSign,
  ShieldCheck,
  Crown,
} from "../lib/icons";
import { copyText } from "../lib/clipboard";

export default function WeddingRegistryPublicPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [, params] = useRoute("/wedding/:slug");
  const slug = params?.slug || "";
  const qc = useQueryClient();

  const { data: registry, isLoading, isError } = useQuery({
    queryKey: ["registry", slug],
    queryFn: () => registries.getBySlug(slug),
    enabled: !!slug,
  });

  const [reserveItem, setReserveItem] = useState<number | null>(null);
  const [reserveForm, setReserveForm] = useState({
    guestName: "",
    guestEmail: "",
    message: "",
    cashAmount: "",
  });
  const [filter, setFilter] = useState<"all" | "high" | "available" | "cash">("all");
  const [copied, setCopied] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState<"payme" | "click" | "uzum">("click");

  const updateRegistryMut = useMutation({
    mutationFn: (data: any) => registries.update(registry.id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registry", slug] }),
  });

  const reserveMut = useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: any }) =>
      registries.reserveItem(itemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registry", slug] });
      setReserveItem(null);
      setReserveForm({ guestName: "", guestEmail: "", message: "", cashAmount: "" });
      toast.success("Sovg'a band qilindi! Kelin-kuyovga bu ajoyib syurpriz bo'ladi.", "Muvaffaqiyatli band qilindi");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">To'y reyestri yuklanmoqda...</p>
      </div>
    );
  }

  if (isError || !registry) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto px-4 space-y-3">
        <Heart className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto stroke-[2.2]" />
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">To'y Reyestri Topilmadi</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ushbu havola yopiq yoki mavjud emas. Kelin-kuyovdan havolani qayta so'rang.
        </p>
      </div>
    );
  }

  const copyShareLink = () => {
    copyText(window.location.href);
    setCopied(true);
    toast.success("To'y ro'yxati havolasi nusxalandi!", "Havola tayyor");
    setTimeout(() => setCopied(false), 2000);
  };

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  let items = [...(registry.items || [])].sort(
    (a: any, b: any) =>
      (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) -
      (priorityOrder[b.priority as keyof typeof priorityOrder] || 2)
  );

  if (filter === "high") items = items.filter((i) => i.priority === "high");
  if (filter === "available") items = items.filter((i) => !i.isReserved);
  if (filter === "cash") items = items.filter((i) => i.isCashGoal);

  const daysToWedding = registry.weddingDate
    ? Math.ceil((new Date(registry.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-white animate-fade-in pb-16 space-y-10">
      {/* Ambient background vignette glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      </div>

      {/* ─── CELEBRATORY COUPLE HERO HEADER ──────────────────────── */}
      <section className="pt-12 pb-8 border-b border-rose-200/50 dark:border-rose-900/30 bg-rose-500/10">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <h1 className="lux-title text-4xl sm:text-6xl lg:text-7xl text-slate-900 dark:text-white leading-[1.05]">
            {registry.partnerName1} & {registry.partnerName2}
          </h1>

          {registry.weddingDate && (
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              <span className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-rose-200/70 dark:border-slate-800 shadow-xs">
                <Calendar className="w-4 h-4 text-rose-500 stroke-[2.2]" />
                {formatDate(registry.weddingDate)}
              </span>
              {daysToWedding !== null && daysToWedding > 0 && (
                <span className="text-amber-900 dark:text-amber-200 font-bold px-3.5 py-1.5 rounded-xl border border-[var(--line)] dark:border-amber-500/30 shadow-xs bg-amber-500/15">
                  {daysToWedding} kun qoldi!
                </span>
              )}
            </div>
          )}

          {registry.message && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed italic bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-rose-200/60 dark:border-slate-800 shadow-xs">
              “{registry.message}”
            </p>
          )}

          <div className="pt-2">
            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-amber-600 hover:border-[var(--line-strong)] transition shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.2]" /> : <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />}
              <span>{copied ? "Havola Nusxalandi!" : "Do'stlar bilan ulashish"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── REGISTRY ITEMS SECTION ───────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Owner Control Panel */}
        {registry.isOwner && (
          <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-5 border border-[var(--line)] dark:border-amber-500/25 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl icon-medallion icon-box-gold text-slate-950 flex items-center justify-center shadow-xs">
                <Crown className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">To'y Reyestri Egasi Boshqaruvi</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {registry.revealPurchasers
                    ? "Xaridorlarning ismlari sizga ko'rinmoqda"
                    : "Surpriz Himoyasi Faol: Xaridorlar to'ygacha yashirin qoladi"}
                </span>
              </div>
            </div>
            <button
              onClick={() => updateRegistryMut.mutate({ revealPurchasers: !registry.revealPurchasers })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                registry.revealPurchasers
                  ? "bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[var(--line)] dark:border-slate-700"
                  : "btn-luxury-gold text-slate-950 font-bold shadow-md"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{registry.revealPurchasers ? "Surpriz Rejimini Yoqish" : "Ismlarni Ko'rsatish"}</span>
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
              <Gift className="w-6 h-6 text-amber-500 stroke-[2.2]" />
              <span>Sovg'alar & Istaklar Ro'yxati</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Boshqa mehmonlar bilishi uchun sovg'ani band qiling yoki pul fondiga hissa qo'shing.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-amber-100/50 dark:bg-slate-900/90 p-1 rounded-2xl text-xs font-semibold border border-[var(--line)] dark:border-slate-800">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filter === "all" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-xs border border-[var(--line)] dark:border-slate-700" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Barchasi ({registry.items?.length || 0})
            </button>
            <button
              onClick={() => setFilter("high")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filter === "high" ? "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-bold shadow-xs border border-rose-200/60 dark:border-rose-900/40" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Eng Muhim
            </button>
            <button
              onClick={() => setFilter("available")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filter === "available" ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs border border-emerald-200/60 dark:border-emerald-900/40" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Band Qilinmagan
            </button>
            <button
              onClick={() => setFilter("cash")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filter === "cash" ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold shadow-xs border border-[var(--line)] dark:border-amber-900/40" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Pul Fondlari
            </button>
          </div>
        </div>

        {/* Surprise Protection Notice */}
        <div className="border border-[var(--line)] dark:border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-amber-950 dark:text-amber-200 shadow-xs bg-amber-500/10">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 stroke-[2.2]" />
          <span>
            <strong>Surpriz Himoyasi Faol:</strong> Siz sovg'ani band qilganingizda takrorlanishning oldini olish uchun boshqa mehmonlarga "Band qilingan" deb ko'rinadi, lekin kelin-kuyovga kim sovg'a qilgani to'ygacha sir tutiladi!
          </span>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map((item: any) => {
            const isReserved = item.isReserved || item.status === "reserved";
            const cashProgress = item.isCashGoal
              ? Math.min(100, Math.round(((item.cashCollected || 0) / (item.cashGoalAmount || 1)) * 100))
              : 0;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition overflow-hidden flex flex-col justify-between shadow-sm ${
                  isReserved
                    ? "border-emerald-300/80 dark:border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20"
                    : "bg-white dark:bg-[#0b1224] border-[var(--line)] dark:border-amber-500/20 hover:border-[var(--line-strong)] dark:hover:border-amber-500/40"
                }`}
              >
                {/* Top Priority Accent Strip */}
                <div
                  className={`h-1.5 ${
                    item.priority === "high"
                      ? "bg-rose-500"
                      : item.priority === "medium"
                      ? "bg-amber-400"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                />

                <div className="p-5 sm:p-6 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs ${
                          item.priority === "high"
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                            : item.priority === "medium"
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-[var(--line)] dark:border-amber-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {item.priority === "high" ? "Yuqori muhimlik" : item.priority === "medium" ? "O'rta muhimlik" : "Oddiy"}
                      </span>
                      <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white mt-1.5 leading-snug">
                        {item.name}
                      </h3>
                    </div>

                    {item.category && (
                      <span className="text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-lg flex-shrink-0 shadow-2xs">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
                  )}

                  {item.price && !item.isCashGoal && (
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {formatPrice(item.price, item.currency)}
                    </p>
                  )}

                  {/* Cash Crowdfunding Progress */}
                  {item.isCashGoal && (
                    <div className="space-y-2 bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-[var(--line)] dark:border-slate-800 shadow-2xs">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {formatPrice(item.cashCollected || 0)} yig'ildi
                        </span>
                        <span className="text-slate-400 font-medium">
                          Maqsad: {formatPrice(item.cashGoalAmount)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-amber-100/70 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-[var(--line)]">
                        <div
                          className="h-full rounded-full transition-all duration-200 bg-emerald-500"
                          style={{ width: `${cashProgress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block text-right">
                        {cashProgress}% to'ldirildi
                      </span>
                    </div>
                  )}

                  {/* Action / Reservation Area */}
                  <div className="pt-2">
                    {isReserved && !item.isCashGoal ? (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50/90 dark:bg-emerald-950/40 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/80 dark:border-emerald-500/30 shadow-xs">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                        <span>Ushbu sovg'a kelin-kuyov uchun band qilindi</span>
                      </div>
                    ) : reserveItem === item.id ? (
                      <div className="space-y-3 p-4.5 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-[var(--line)] dark:border-amber-500/30 animate-fade-in text-xs shadow-md">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                          {item.isCashGoal ? "Pul Fondiga Ulush Qo'shish" : "Sovg'ani Band Qilish"}
                        </p>

                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ismingiz *</label>
                          <input
                            type="text"
                            placeholder="Ismingiz (masalan: Nodirbek)"
                            value={reserveForm.guestName}
                            onChange={(e) => setReserveForm({ ...reserveForm, guestName: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-[var(--line)] dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email yoki Telefon (ixtiyoriy)</label>
                          <input
                            type="email"
                            placeholder="Aloqa uchun (masalan: @telegram yoki email)"
                            value={reserveForm.guestEmail}
                            onChange={(e) => setReserveForm({ ...reserveForm, guestEmail: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-[var(--line)] dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
                          />
                        </div>

                        {item.isCashGoal && (
                          <div className="space-y-2">
                            <label className="font-bold text-slate-700 dark:text-slate-300 block">Ulush Miqdori (UZS) *</label>
                            <input
                              type="number"
                              placeholder="Masalan: 250000"
                              value={reserveForm.cashAmount}
                              onChange={(e) => setReserveForm({ ...reserveForm, cashAmount: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/40 font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs"
                            />
                            <div className="flex gap-1.5">
                              {[100000, 250000, 500000, 1000000].map((amt) => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => setReserveForm({ ...reserveForm, cashAmount: amt.toString() })}
                                  className="flex-1 py-1.5 dark:bg-slate-800 border border-[var(--line)] dark:border-slate-700 hover:border-[var(--line-strong)] rounded-lg text-[10px] font-bold transition cursor-pointer bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]"
                                >
                                  {amt >= 1000000 ? `${amt / 1000000} mln` : `${amt / 1000} ming`}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <span>To'lov usuli:</span>
                              {(["click", "payme", "uzum"] as const).map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setSelectedPayMethod(m)}
                                  className={`px-2.5 py-1 rounded-lg uppercase font-bold text-[10px] border transition cursor-pointer ${
                                    selectedPayMethod === m
                                      ? "bg-amber-500 text-white border-amber-500 shadow-2xs"
                                      : "bg-white dark:bg-slate-800 border-[var(--line)] dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[var(--line-strong)]"
                                  }`}
                                >
                                  {m === "uzum" ? "Uzum Nasiya" : m.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kelin-kuyovga tilaklar</label>
                          <textarea
                            placeholder="Baxtli hayot va samimiy tilaklar..."
                            rows={2}
                            value={reserveForm.message}
                            onChange={(e) => setReserveForm({ ...reserveForm, message: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-[var(--line)] dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white font-medium shadow-2xs"
                          />
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() =>
                              reserveMut.mutate({
                                itemId: item.id,
                                data: {
                                  ...reserveForm,
                                  cashAmount: reserveForm.cashAmount
                                    ? parseFloat(reserveForm.cashAmount)
                                    : undefined,
                                },
                              })
                            }
                            disabled={!reserveForm.guestName || reserveMut.isPending}
                            className="flex-1 py-3 text-white font-bold rounded-xl disabled:opacity-40 shadow-md transition cursor-pointer bg-amber-500 hover:bg-amber-400"
                          >
                            {reserveMut.isPending ? "Tasdiqlanmoqda..." : "Band Qilishni Tasdiqlash"}
                          </button>
                          <button
                            onClick={() => setReserveItem(null)}
                            className="px-3.5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-400 cursor-pointer"
                          >
                            <X className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReserveItem(item.id)}
                        className="w-full py-3 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer bg-amber-500 hover:bg-amber-400"
                      >
                        <Gift className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>{item.isCashGoal ? "Fondga Ulush Qo'shish" : "Ushbu Sovg'ani Band Qilish"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="bg-white dark:bg-[#0b1224] text-center py-16 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 p-8 space-y-3 shadow-sm">
            <Gift className="w-10 h-10 text-amber-500/60 mx-auto stroke-[2.2]" />
            <p className="text-sm font-bold text-slate-800 dark:text-white">Ushbu filtr bo'yicha sovg'alar topilmadi</p>
            <button onClick={() => setFilter("all")} className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer">
              Barcha sovg'alarni ko'rsatish
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
