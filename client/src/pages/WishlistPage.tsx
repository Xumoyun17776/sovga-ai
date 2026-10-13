import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { wishlists, auth, formatPrice } from "../lib/api";
import { useToast } from "../components/Toast";
import GiftCardModal from "../components/GiftCardModal";
import AuthModal from "../components/AuthModal";
import {
  Star,
  Plus,
  Trash2,
  Check,
  ShoppingBag,
  Share2,
  Copy,
  Send,
  Sparkles,
  ExternalLink,
  Gift,
  Coins,
  Search,
} from "../lib/icons";
import { copyText } from "../lib/clipboard";

export default function WishlistPage() {
  const { t, language } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const [, setLocation] = useLocation();

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: auth.me });
  const { data: lists, isLoading } = useQuery({ queryKey: ["wishlists"], queryFn: wishlists.list, enabled: !!user });

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "general" });
  const [showAddItem, setShowAddItem] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState({ name: "", url: "", price: "", store: "", priority: "medium", notes: "" });
  const [expandedWl, setExpandedWl] = useState<number | null>(null);

  // Selected item for Gift Certificate Modal
  const [selectedGiftCardItem, setSelectedGiftCardItem] = useState<any | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const createMut = useMutation({
    mutationFn: (data: any) => wishlists.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlists"] });
      setShowCreate(false);
      setForm({ title: "", description: "", type: "general" });
      toast.success(
        language === "uz" ? "Yangi istaklar ro'yxati yaratildi!" : language === "ru" ? "Новый список желаний создан!" : "New wishlist created!",
        language === "uz" ? "Yaratildi" : language === "ru" ? "Создано" : "Created"
      );
    },
  });

  const deleteWishlistMut = useMutation({
    mutationFn: (id: number) => wishlists.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlists"] });
      toast.info(language === "uz" ? "Istaklar ro'yxati o'chirildi" : language === "ru" ? "Список желаний удален" : "Wishlist deleted");
    },
  });

  const addItemMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => wishlists.addItem(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlists"] });
      setShowAddItem(null);
      setItemForm({ name: "", url: "", price: "", store: "", priority: "medium", notes: "" });
      toast.success(
        language === "uz" ? "Sovg'a qo'shildi!" : language === "ru" ? "Подарок добавлен!" : "Gift added!",
        language === "uz" ? "Muvaffaqiyatli" : language === "ru" ? "Успешно" : "Success"
      );
    },
  });

  const deleteItemMut = useMutation({
    mutationFn: (itemId: number) => wishlists.removeItem(itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlists"] });
      toast.info(language === "uz" ? "Sovg'a ro'yxatdan o'chirildi" : language === "ru" ? "Подарок удален из списка" : "Gift removed from wishlist");
    },
  });

  const togglePurchased = useMutation({
    mutationFn: ({ itemId, purchased }: { itemId: number; purchased: boolean }) =>
      wishlists.updateItem(itemId, { purchased }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlists"] }),
  });

  const handleShareWishlist = (wl: any) => {
    const url = `${window.location.origin}/wishlist/${wl.id}`;
    copyText(url);
    toast.success(
      language === "uz" ? "Istaklar ro'yxati ommaviy havolasi nusxalandi!" : language === "ru" ? "Публичная ссылка на список желаний скопирована!" : "Public wishlist link copied!",
      language === "uz" ? "Ulashish" : language === "ru" ? "Поделиться" : "Share"
    );
  };

  const handleShareTelegram = (wl: any) => {
    const url = `${window.location.origin}/wishlist/${wl.id}`;
    const text = language === "uz"
      ? `Mening Istaklar Ro'yxatim:\n"${wl.title}"\nSovg'alarni ko'rish va bir xil bo'lmasligi uchun band qilish:`
      : language === "ru"
      ? `Мой список желаний:\n"${wl.title}"\nПосмотреть подарки и забронировать:`
      : `My Wishlist:\n"${wl.title}"\nCheck out gifts and claim to avoid duplicates:`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank");
  };

  const handleResearchForWishlist = (wl: any) => {
    const prompt = language === "uz" ? `${wl.title} sovg'alar` : language === "ru" ? `${wl.title} подарки` : `${wl.title} gifts`;
    setLocation(`/search?q=${encodeURIComponent(prompt)}`);
  };

  if (!user) {
    return (
      <div className="relative min-h-[60vh] max-w-lg mx-auto px-4 py-16 text-center space-y-6 animate-fade-in text-slate-900 dark:text-white">
        {/* Ambient background vignette glow */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        </div>

        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-[var(--line)] dark:border-amber-500/30 bg-amber-500/20">
          <Star className="w-10 h-10 text-yellow-400 fill-yellow-400/30 stroke-[2.2]" />
        </div>
        <div className="space-y-2">
          <h1 className="lux-title text-[2.15rem] sm:text-[3.2rem] text-slate-900 dark:text-white leading-[1.05]">
            {t("wishlist.title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed font-normal">
            {language === "uz"
              ? "O'zingiz yoqtirgan mahsulotlarni saqlang, do'stlaringiz bilan ulashing va bir xil sovg'alardan saqlaning. Davom etish uchun hisobingizga kiring yoki ro'yxatdan o'ting."
              : language === "ru"
              ? "Сохраняйте любимые товары, делитесь с друзьями и избегайте повторных подарков. Войдите в аккаунт или зарегистрируйтесь, чтобы продолжить."
              : "Save your favorite products, share them with friends, and avoid duplicate gifts. Sign in or register to continue."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-3.5 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer bg-amber-500 hover:bg-amber-400"
          >
            <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.2]" />
            <span>
              {language === "uz" ? "Ro'yxatdan o'tish / Kirish" : language === "ru" ? "Регистрация / Вход" : "Sign Up / Sign In"}
            </span>
          </button>
          <Link
            href="/auth?redirect=/wishlists"
            className="px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-800 dark:text-amber-200 font-bold rounded-2xl text-xs sm:text-sm border border-[var(--line)] dark:border-slate-800 transition shadow-2xs flex items-center justify-center"
          >
            <span>
              {language === "uz" ? "To'liq sahifada ochish" : language === "ru" ? "Открыть на отдельной странице" : "Open in full page"}
            </span>
          </Link>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="register"
          customTitle={language === "uz" ? "Istaklar Ro'yxatiga Kirish" : language === "ru" ? "Вход в список желаний" : "Sign In to Wishlist"}
          customMessage={language === "uz" ? "Sovg'alarni saqlash va yaqinlaringizga ulashish uchun ro'yxatdan o'ting" : language === "ru" ? "Зарегистрируйтесь, чтобы сохранять подарки и делиться ими с близкими" : "Sign up to save gifts and share them with loved ones"}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in text-slate-900 dark:text-white">
      {/* Ambient background vignette glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="lux-title text-[2.15rem] sm:text-[3.2rem] text-slate-900 dark:text-white flex items-center gap-2.5 leading-[1.05]">
            <Star className="w-7 h-7 text-yellow-400 fill-yellow-400 stroke-[2.2]" />
            <span>{t("wishlist.title")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-normal">
            {language === "uz"
              ? "Universal istaklar ro'yxati: Do'stlaringiz bilan ulashing va bir xil sovg'alardan saqlaning."
              : language === "ru"
              ? "Универсальный список желаний: делитесь с друзьями и избегайте повторных подарков."
              : "Universal wishlist: share with friends and avoid duplicate gifts."}
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-6 py-3 text-white font-bold rounded-2xl transition shadow-md text-xs sm:text-sm self-start sm:self-auto cursor-pointer bg-amber-500 hover:bg-amber-400"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>{t("wishlist.create")}</span>
        </button>
      </div>

      {/* Create Wishlist Form */}
      {showCreate && (
        <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 sm:p-7 shadow-sm border border-[var(--line)] dark:border-amber-500/25 animate-fade-in space-y-4">
          <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
            {language === "uz" ? "Yangi istaklar ro'yxatini yaratish" : language === "ru" ? "Создать новый список желаний" : "Create a new wishlist"}
          </h3>
          <div className="space-y-3 text-xs sm:text-sm">
            <input
              placeholder={
                language === "uz"
                  ? "Masalan: 25 yoshimga tug'ilgan kun istaklarim, Yangi xonadonim uchun..."
                  : language === "ru"
                  ? "Например: Желания на 25-летие, Для новой квартиры..."
                  : "E.g.: 25th Birthday Wishes, For new apartment..."
              }
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/95 dark:bg-slate-950 border border-[var(--line)] dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white font-semibold shadow-2xs"
            />
            <input
              placeholder={
                language === "uz"
                  ? "Tavsif (ixtiyoriy): Do'stlaringizga kichik eslatma..."
                  : language === "ru"
                  ? "Описание (необязательно): Небольшая заметка для друзей..."
                  : "Description (optional): A small note for your friends..."
              }
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/95 dark:bg-slate-950 border border-[var(--line)] dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white shadow-2xs"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-3 border border-[var(--line)] dark:border-slate-800 rounded-xl outline-none bg-white/95 dark:bg-slate-950 font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
            >
              <option value="general">{language === "uz" ? "Umumiy" : language === "ru" ? "Общий" : "General"}</option>
              <option value="birthday">{language === "uz" ? "Tug'ilgan kun" : language === "ru" ? "День рождения" : "Birthday"}</option>
              <option value="tech">{language === "uz" ? "Texnika va Gadjetlar" : language === "ru" ? "Техника и гаджеты" : "Tech & Gadgets"}</option>
              <option value="home">{language === "uz" ? "Uy va Oshxona" : language === "ru" ? "Дом и кухня" : "Home & Kitchen"}</option>
              <option value="fashion">{language === "uz" ? "Kiyim va Aksessuarlar" : language === "ru" ? "Одежда и аксессуары" : "Fashion & Accessories"}</option>
            </select>
          </div>
          <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--line)] dark:border-slate-800">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={() => createMut.mutate(form)}
              disabled={!form.title}
              className="px-6 py-2.5 text-white text-xs font-bold rounded-xl disabled:opacity-30 transition shadow-md cursor-pointer bg-amber-500 hover:bg-amber-400"
            >
              {t("common.save")}
            </button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-center py-12 text-slate-400">{t("common.loading")}</p>}

      {/* Wishlists Accordion Cards */}
      <div className="space-y-5">
        {lists?.map((wl: any) => {
          const items = wl.items || [];
          const completedCount = items.filter((i: any) => i.purchased).length;
          const totalSum = items.reduce((sum: number, i: any) => sum + (i.price || 0), 0);
          const isExpanded = expandedWl === wl.id;

          return (
            <div
              key={wl.id}
              className="bg-white dark:bg-[#0b1224] rounded-2xl shadow-sm border border-[var(--line)] dark:border-amber-500/20 overflow-hidden transition"
            >
              {/* Card Header */}
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] dark:border-slate-800">
                <div
                  onClick={() => setExpandedWl(isExpanded ? null : wl.id)}
                  className="cursor-pointer space-y-1 flex-1"
                >
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white hover:text-amber-600 transition">
                      {wl.title}
                    </h2>
                    <span className="text-[11px] border border-[var(--line)] px-2.5 py-0.5 rounded-full font-bold bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
                      {items.length} {language === "uz" ? "ta sovg'a" : language === "ru" ? "подарков" : "gifts"}
                    </span>
                  </div>
                  {wl.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{wl.description}</p>
                  )}
                  {totalSum > 0 && (
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 pt-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
                      <span>{language === "uz" ? "Jami qiymati" : language === "ru" ? "Общая стоимость" : "Total value"}: <strong className="text-amber-600 dark:text-amber-400 font-bold">{formatPrice(totalSum)}</strong></span>
                      {completedCount > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                          ({completedCount} {language === "uz" ? "ta band qilingan" : language === "ru" ? "забронировано" : "claimed"})
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Toolbar Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Research with AI */}
                  <button
                    onClick={() => handleResearchForWishlist(wl)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-[var(--line)] dark:border-amber-500/30 text-amber-900 dark:text-amber-300 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                    title={language === "uz" ? "Ushbu mavzuda AI tadqiqotini ishga tushirish" : language === "ru" ? "Запустить AI поиск по этой теме" : "Run AI search for this wishlist"}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
                    <span>{language === "uz" ? "AI Sovg'a Qidirish" : language === "ru" ? "AI Поиск подарков" : "AI Gift Search"}</span>
                  </button>

                  {/* Share Link */}
                  <button
                    onClick={() => handleShareWishlist(wl)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white/90 dark:bg-slate-900/90 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[var(--line)] dark:border-slate-800 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                    title={language === "uz" ? "Ommaviy havolani nusxalash" : language === "ru" ? "Скопировать публичную ссылку" : "Copy public link"}
                  >
                    <Copy className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>{language === "uz" ? "Ulashish" : language === "ru" ? "Поделиться" : "Share"}</span>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => handleShareTelegram(wl)}
                    className="p-2 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-xl transition shadow-2xs cursor-pointer"
                    title={language === "uz" ? "Telegram orqali ulashish" : language === "ru" ? "Поделиться в Telegram" : "Share via Telegram"}
                  >
                    <Send className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>

                  {/* Delete Wishlist */}
                  <button
                    onClick={() => {
                      const msg = language === "uz"
                        ? "Ushbu istaklar ro'yxatini o'chirmoqchimisiz?"
                        : language === "ru"
                        ? "Вы уверены, что хотите удалить этот список желаний?"
                        : "Are you sure you want to delete this wishlist?";
                      if (confirm(msg)) {
                        deleteWishlistMut.mutate(wl.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition cursor-pointer"
                    title={language === "uz" ? "Ro'yxatni o'chirish" : language === "ru" ? "Удалить список" : "Delete wishlist"}
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Items List (Expanded) */}
              <div className="p-5 sm:p-6 space-y-3.5">
                <div className="space-y-2.5">
                  {items.map((item: any) => (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl transition border ${
                        item.purchased
                          ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-500/30"
                          : "bg-white/90 dark:bg-slate-900/90 border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)] dark:hover:border-slate-700 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <button
                          onClick={() =>
                            togglePurchased.mutate({ itemId: item.id, purchased: !item.purchased })
                          }
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition flex-shrink-0 cursor-pointer ${
                            item.purchased
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-2xs"
                              : "border-slate-300 dark:border-slate-600 hover:border-[var(--line-strong)]"
                          }`}
                        >
                          {item.purchased && <Check className="w-3 h-3 stroke-[2.2]" />}
                        </button>

                        <div className="min-w-0">
                          <p
                            className={`text-xs sm:text-sm font-bold truncate ${
                              item.purchased ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {item.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            {item.price && (
                              <span className="font-bold text-amber-600 dark:text-amber-400">
                                {formatPrice(item.price, item.currency)}
                              </span>
                            )}
                            {item.store && <span>· {item.store}</span>}
                            {item.claimedBy && (
                              <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                {language === "uz" ? "Band" : language === "ru" ? "Забронировал" : "Claimed"}: {item.claimedBy}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-500 hover:text-amber-600 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            title={language === "uz" ? "Do'konda ko'rish" : language === "ru" ? "Посмотреть в магазине" : "View in store"}
                          >
                            <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
                          </a>
                        )}

                        {/* Gift Dedication Card */}
                        <button
                          onClick={() => setSelectedGiftCardItem(item)}
                          className="p-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 transition cursor-pointer"
                          title={language === "uz" ? "Tabriknoma / Sertifikat chop etish" : language === "ru" ? "Распечатать открытку / сертификат" : "Print postcard / certificate"}
                        >
                          <Gift className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>

                        <button
                          onClick={() => deleteItemMut.mutate(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                          title={language === "uz" ? "O'chirish" : language === "ru" ? "Удалить" : "Delete"}
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Item Form or Button */}
                {showAddItem === wl.id ? (
                  <div className="mt-3 p-4.5 bg-white/95 dark:bg-slate-950 rounded-2xl animate-fade-in space-y-3 border border-[var(--line)] dark:border-amber-500/30 shadow-inner">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {language === "uz" ? "Yangi sovg'a qo'shish:" : language === "ru" ? "Добавить новый подарок:" : "Add a new gift:"}
                    </h4>
                    <input
                      placeholder={
                        language === "uz"
                          ? "Mahsulot nomi (masalan: DeLonghi kofemashinasi)"
                          : language === "ru"
                          ? "Название товара (например: кофемашина DeLonghi)"
                          : "Product name (e.g. DeLonghi coffee machine)"
                      }
                      value={itemForm.name}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[var(--line)] dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white shadow-2xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder={language === "uz" ? "Narxi (UZS)" : language === "ru" ? "Цена (UZS)" : "Price (UZS)"}
                        value={itemForm.price}
                        onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                        className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[var(--line)] dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white shadow-2xs"
                      />
                      <input
                        placeholder={language === "uz" ? "Do'kon (masalan: Uzum Market)" : language === "ru" ? "Магазин (например: Uzum Market)" : "Store (e.g. Uzum Market)"}
                        value={itemForm.store}
                        onChange={(e) => setItemForm({ ...itemForm, store: e.target.value })}
                        className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[var(--line)] dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white shadow-2xs"
                      />
                    </div>
                    <input
                      placeholder={language === "uz" ? "Havola / URL (ixtiyoriy)" : language === "ru" ? "Ссылка / URL (необязательно)" : "Link / URL (optional)"}
                      value={itemForm.url}
                      onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[var(--line)] dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white shadow-2xs"
                    />
                    <div className="flex justify-end gap-2 pt-1 border-t border-[var(--line)] dark:border-slate-800">
                      <button
                        onClick={() => setShowAddItem(null)}
                        className="px-3.5 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        {t("common.cancel")}
                      </button>
                      <button
                        onClick={() =>
                          addItemMut.mutate({
                            id: wl.id,
                            data: {
                              ...itemForm,
                              price: itemForm.price ? parseFloat(itemForm.price) : null,
                            },
                          })
                        }
                        disabled={!itemForm.name}
                        className="px-5 py-2 text-white text-xs font-bold rounded-xl disabled:opacity-30 transition shadow-md cursor-pointer bg-amber-500 hover:bg-amber-400"
                      >
                        {t("common.save")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddItem(wl.id)}
                    className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.2]" />
                    <span>{language === "uz" ? "Sovg'a qo'shish" : language === "ru" ? "Добавить подарок" : "Add gift"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {lists?.length === 0 && !isLoading && (
        <div className="bg-white dark:bg-[#0b1224] text-center py-16 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 shadow-sm space-y-3">
          <ShoppingBag className="w-12 h-12 mx-auto text-amber-500/60 stroke-[2.2]" />
          <h3 className="font-display font-bold text-slate-900 dark:text-white text-base sm:text-lg">
            {language === "uz" ? "Hozircha istaklar ro'yxati mavjud emas" : language === "ru" ? "Списков желаний пока нет" : "No wishlists yet"}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto font-normal">
            {language === "uz"
              ? "O'zingiz uchun yoki yaqiningizga birinchi istaklar ro'yxatingizni tuzing."
              : language === "ru"
              ? "Создайте свой первый список желаний для себя или близких."
              : "Create your first wishlist for yourself or your loved ones."}
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-2.5 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer bg-amber-500 hover:bg-amber-400"
          >
            {language === "uz" ? "Yangi ro'yxat tuzish" : language === "ru" ? "Создать новый список" : "Create new list"}
          </button>
        </div>
      )}

      {/* Gift Dedication Modal */}
      {selectedGiftCardItem && (
        <GiftCardModal
          product={{
            name: selectedGiftCardItem.name,
            price: selectedGiftCardItem.price,
            store: selectedGiftCardItem.store,
            url: selectedGiftCardItem.url,
            reason: selectedGiftCardItem.notes || (language === "uz" ? "Istaklar ro'yxatidan tanlangan maxsus sovg'a" : language === "ru" ? "Особенный подарок из списка желаний" : "Special gift selected from wishlist"),
          }}
          onClose={() => setSelectedGiftCardItem(null)}
        />
      )}
    </div>
  );
}
