import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { wishlists, formatPrice } from "../lib/api";
import { useToast } from "../components/Toast";
import {
  Star,
  Check,
  Gift,
  ExternalLink,
  Share2,
  Copy,
  Send,
  Sparkles,
  ShoppingBag,
  Heart,
  UserCheck,
  Package,
  CheckCircle2,
  Coins,
} from "lucide-react";

export default function WishlistPublicPage() {
  const [, params] = useRoute("/wishlist/:id");
  const id = params?.id || "";
  const qc = useQueryClient();
  const toast = useToast();

  const [guestName, setGuestName] = useState("");
  const [claimItemId, setClaimItemId] = useState<number | null>(null);

  const { data: wishlist, isLoading, isError } = useQuery({
    queryKey: ["public-wishlist", id],
    queryFn: () => wishlists.getPublic(id),
    enabled: !!id,
  });

  const claimMut = useMutation({
    mutationFn: ({ itemId, claimed }: { itemId: number; claimed: boolean }) =>
      wishlists.claimItem(itemId, { guestName: guestName.trim() || "Do'stingiz", claimed }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["public-wishlist", id] });
      setClaimItemId(null);
      setGuestName("");
      toast.success("Sovg'a muvaffaqiyatli band qilindi! Boshqalar bir xil sovg'a olmasligi ta'minlandi.", "Band qilindi");
    },
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Istaklar ro'yxati havolasi nusxalandi!", "Ulashish");
  };

  const handleShareTelegram = () => {
    const text = `${wishlist?.ownerName || "Do'stingiz"}ning Istaklar Ro'yxati:\n"${wishlist?.title}"\nSovg'a tanlang va bir xil sovg'a bo'lmasligi uchun band qiling:`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Istaklar ro'yxati yuklanmoqda...</p>
      </div>
    );
  }

  if (isError || !wishlist) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto px-4 space-y-3">
        <Star className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto stroke-[2.2]" />
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">Istaklar ro'yxati topilmadi</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ushbu havola noto'g'ri yoki o'chirilgan bo'lishi mumkin.
        </p>
        <Link href="/" className="inline-block px-5 py-2.5 btn-luxury-gold text-slate-950 rounded-xl text-xs font-black">
          Bosh sahifaga o'tish
        </Link>
      </div>
    );
  }

  const items = wishlist.items || [];
  const claimedCount = items.filter((i: any) => i.purchased).length;
  const totalAmount = items.reduce((sum: number, i: any) => sum + (i.price || 0), 0);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in text-slate-900 dark:text-white">
      {/* Ambient background vignette glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-amber-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl opacity-70" />
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#121422] via-[#0c0e18] to-[#07090f] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-luxury border-2 border-amber-500/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide">
              <Star className="w-3.5 h-3.5 text-amber-400 stroke-[2.2]" />
              <span>{wishlist.ownerName} tomonidan tuzilgan</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition cursor-pointer active:scale-95 border border-white/10"
              >
                <Copy className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Nusxalash</span>
              </button>
              <button
                onClick={handleShareTelegram}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2AABEE] hover:bg-[#229ED9] rounded-xl text-xs font-bold text-white transition cursor-pointer active:scale-95 shadow-xs"
              >
                <Send className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Telegram</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight">
              {wishlist.title}
            </h1>
            {wishlist.description && (
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                {wishlist.description}
              </p>
            )}
          </div>

          {/* Progress / Status stats */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-amber-200/90 font-medium border-t border-amber-500/20">
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Jami: <strong className="text-white">{items.length} ta sovg'a</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.2]" />
              <span>Band qilingan: <strong className="text-white">{claimedCount} ta</strong></span>
            </span>
            {totalAmount > 0 && (
              <span className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Umumiy qiymati: <strong className="text-amber-400">{formatPrice(totalAmount)}</strong></span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Guest Notice */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/70 dark:border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950 dark:text-amber-200 shadow-xs">
        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 stroke-[2.2]" />
        <p className="leading-relaxed">
          Ushbu ro'yxatdan biror sovg'a tanlab, <strong>"Men sovg'a qilaman"</strong> tugmasini bosing.
          Bu orqali boshqa mehmonlar bir xil sovg'a sotib olmasligi kafolatlanadi!
        </p>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-500 stroke-[2.2]" />
          <span>Sovg'alar Ro'yxati ({items.length})</span>
        </h2>

        {items.length === 0 ? (
          <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl p-12 text-center border-2 border-amber-200/80 dark:border-amber-500/20 space-y-3 shadow-luxury">
            <ShoppingBag className="w-10 h-10 text-amber-500/60 mx-auto stroke-[2.2]" />
            <p className="text-sm font-bold text-slate-800 dark:text-white">Hozircha sovg'alar qo'shilmagan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {items.map((item: any) => (
              <div
                key={item.id}
                className={`rounded-2xl p-4 sm:p-5 border-2 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-luxury ${
                  item.purchased
                    ? "border-emerald-300/80 dark:border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20"
                    : "bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] border-amber-200/80 dark:border-amber-500/20 hover:border-amber-400 dark:hover:border-amber-500/40"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                    item.purchased
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-500/30"
                      : "icon-medallion icon-box-gold text-slate-950"
                  }`}>
                    {item.purchased ? <Check className="w-5 h-5 stroke-[2.2]" /> : <Gift className="w-5 h-5 stroke-[2.2]" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`font-black text-sm sm:text-base ${item.purchased ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-900 dark:text-white"}`}>
                        {item.name}
                      </h3>
                      {item.purchased && (
                        <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-500/30 text-[10px] font-bold rounded-full shadow-2xs">
                          Band qilingan {item.claimedBy ? `(${item.claimedBy})` : ""}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                      {item.price && (
                        <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{formatPrice(item.price, item.currency)}</span>
                      )}
                      {item.store && (
                        <span>Do'kon: <strong className="text-slate-800 dark:text-slate-200">{item.store}</strong></span>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic max-w-md">"{item.notes}"</p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-100 dark:border-slate-800">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-white/90 dark:bg-slate-900/90 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-amber-200/80 dark:border-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                    >
                      <span>Do'konda ko'rish</span>
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
                    </a>
                  )}

                  {!item.purchased ? (
                    claimItemId === item.id ? (
                      <div className="flex items-center gap-1.5 animate-fade-in">
                        <input
                          type="text"
                          placeholder="Ismingiz..."
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="px-3 py-2 bg-white dark:bg-slate-950 border border-amber-200/80 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500/40 w-32 text-slate-900 dark:text-white shadow-2xs"
                        />
                        <button
                          onClick={() => claimMut.mutate({ itemId: item.id, claimed: true })}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                        >
                          Tasdiqlash
                        </button>
                        <button
                          onClick={() => setClaimItemId(null)}
                          className="px-2.5 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer active:scale-95"
                        >
                          Bekor
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setClaimItemId(item.id)}
                        className="px-4 py-2.5 btn-luxury-gold text-slate-950 font-black text-xs rounded-xl transition shadow-md shadow-amber-500/25 flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
                      >
                        <UserCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Men sovg'a qilaman</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => claimMut.mutate({ itemId: item.id, claimed: false })}
                      className="px-3 py-1.5 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-bold transition cursor-pointer active:scale-95"
                      title="Bandlikni bekor qilish"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 dark:border-amber-500/20 text-center space-y-3.5 shadow-luxury">
        <div className="w-12 h-12 rounded-2xl icon-medallion icon-box-gold text-slate-950 flex items-center justify-center mx-auto shadow-md">
          <Gift className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white">
          O'zingizning Istaklar Ro'yxatingizni Yarating
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          Tug'ilgan kun, bayram yoki to'y uchun sovg'alarni Sovg'a AI bilan eng yaxshi narxlarda toping va do'stlaringizga ulashing.
        </p>
        <Link
          href="/wishlists"
          className="inline-block px-6 py-3 btn-luxury-gold text-slate-950 text-xs sm:text-sm font-black rounded-2xl transition shadow-md shadow-amber-500/25 cursor-pointer active:scale-95"
        >
          Istaklar ro'yxati tuzish
        </Link>
      </div>
    </div>
  );
}
