import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlists, registries, auth } from "../lib/api";
import { X, Heart, Star, Check, Plus } from "../lib/icons";
import { useToast } from "./Toast";
import { useTranslation } from "../lib/i18n";
import AuthModal from "./AuthModal";
import type { ResearchProduct } from "@shared/types";

interface Props {
  product: any;
  onClose: () => void;
}

export default function SaveProductModal({ product, onClose }: Props) {
  const { language } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const productName = product.name || product.title || "Product";
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: auth.me });
  const { data: userWishlists } = useQuery({ queryKey: ["wishlists"], queryFn: wishlists.list, enabled: !!user });
  const { data: userRegistries } = useQuery({ queryKey: ["registries"], queryFn: registries.list, enabled: !!user });

  const [destination, setDestination] = useState<"wishlist" | "registry">("wishlist");
  const [selectedWishlistId, setSelectedWishlistId] = useState<number | null>(null);
  const [selectedRegistryId, setSelectedRegistryId] = useState<number | null>(null);
  const [newWishlistTitle, setNewWishlistTitle] = useState("");
  const [registryPriority, setRegistryPriority] = useState("high");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const saveToWishlistMut = useMutation({
    mutationFn: async () => {
      let wlId = selectedWishlistId;
      if (!wlId) {
        if (!newWishlistTitle.trim()) {
          const defaultTitle =
            language === "uz"
              ? "Mening istaklarim"
              : language === "ru"
              ? "Мои желаемые подарки"
              : "My Researched Gifts";
          const created = await wishlists.create({ title: defaultTitle, type: "general" });
          wlId = created.id;
        } else {
          const created = await wishlists.create({ title: newWishlistTitle.trim(), type: "general" });
          wlId = created.id;
        }
      }
      if (!wlId) throw new Error("Could not find or create wishlist");
      return wishlists.addItem(wlId, {
        name: productName,
        price: product.price,
        store: product.store,
        url: product.url,
        notes: product.reason || product.whyRecommended,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlists"] });
      setSavedSuccess(true);
      const msg =
        language === "uz"
          ? `"${productName}" istaklar ro'yxatiga qo'shildi!`
          : language === "ru"
          ? `"${productName}" добавлен в список желаний!`
          : `"${productName}" added to wishlist!`;
      const title =
        language === "uz" ? "Wishlist yangilandi" : language === "ru" ? "Вишлист обновлен" : "Wishlist updated";
      toast.success(msg, title);
      setTimeout(() => onClose(), 1200);
    },
  });

  const saveToRegistryMut = useMutation({
    mutationFn: async () => {
      const regId = selectedRegistryId || (userRegistries?.length ? userRegistries[0].id : null);
      if (!regId) throw new Error("No registry available");

      return registries.addItem(regId, {
        name: productName,
        price: product.price,
        priority: registryPriority,
        quantity: 1,
        url: product.url,
        description: product.reason || product.whyRecommended,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registries"] });
      setSavedSuccess(true);
      const msg =
        language === "uz"
          ? `"${productName}" to'y sovg'alari ro'yxatiga qo'shildi!`
          : language === "ru"
          ? `"${productName}" добавлен в реестр подарков!`
          : `"${productName}" added to wedding registry!`;
      const title =
        language === "uz" ? "Reyestr yangilandi" : language === "ru" ? "Реестр обновлен" : "Registry updated";
      toast.success(msg, title);
      setTimeout(() => onClose(), 1200);
    },
  });

  if (!user) {
    return (
      <AuthModal
        isOpen={true}
        onClose={onClose}
        initialMode="register"
        customTitle={
          language === "uz"
            ? "Istaklar ro'yxatiga saqlash"
            : language === "ru"
            ? "Сохранить в список желаний"
            : "Save to Wishlist"
        }
        customMessage={
          language === "uz"
            ? "Mahsulotlarni o'z istaklar ro'yxatiga saqlash va to'y sovg'alari reyestrini tuzish uchun ro'yxatdan o'ting"
            : language === "ru"
            ? "Зарегистрируйтесь, чтобы сохранять товары в вишлист и создавать свадебные реестры"
            : "Sign up to save items to your wishlist and create wedding gift registries"
        }
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#0b1224] text-slate-900 dark:text-white rounded-2xl max-w-md w-full max-h-[92dvh] overflow-y-auto p-5 sm:p-7 shadow-sm relative border border-[var(--line)] dark:border-amber-500/25 animate-scale-in">
        {/* Ambient Top Glow */}

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-[var(--line)] dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer shadow-2xs"
          aria-label="Yopish"
        >
          <X className="w-4 h-4 stroke-[2.2]" />
        </button>

        {savedSuccess ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 icon-medallion icon-box-emerald mx-auto shadow-md">
              <Check className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              {language === "uz" ? "Muvaffaqiyatli Saqlandi!" : language === "ru" ? "Успешно Сохранено!" : "Saved Successfully!"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {language === "uz"
                ? `${destination === "wishlist" ? "Istaklar ro'yxatingizga" : "To'y sovg'alari reyestringizga"} qo'shildi.`
                : language === "ru"
                ? `Добавлено в ваш ${destination === "wishlist" ? "список желаний" : "свадебный реестр"}.`
                : `Added to your ${destination === "wishlist" ? "Wishlist" : "Wedding Registry"}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 icon-medallion icon-box-rose">
                <Heart className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                  {language === "uz" ? "Topilgan Sovg'ani Saqlash" : language === "ru" ? "Сохранить Найденный Подарок" : "Save Researched Gift"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{product.name}</p>
              </div>
            </div>

            {/* Destination Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl text-xs font-semibold border border-slate-200/80 dark:border-white/5">
              <button
                onClick={() => setDestination("wishlist")}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  destination === "wishlist"
                    ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Star className="w-3.5 h-3.5 stroke-[2.2]" /> {language === "uz" ? "Istaklar Ro'yxati" : language === "ru" ? "Список Желаний" : "Wishlist"}
              </button>
              <button
                onClick={() => setDestination("registry")}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  destination === "registry"
                    ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Heart className="w-3.5 h-3.5 stroke-[2.2]" /> {language === "uz" ? "To'y Reyestri" : language === "ru" ? "Свадебный Реестр" : "Wedding Registry"}
              </button>
            </div>

            {destination === "wishlist" && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                  {language === "uz" ? "Istaklar Ro'yxatini Tanlang" : language === "ru" ? "Выберите Список Желаний" : "Select Wishlist"}
                </label>
                {userWishlists && userWishlists.length > 0 ? (
                  <select
                    value={selectedWishlistId || ""}
                    onChange={(e) => setSelectedWishlistId(Number(e.target.value) || null)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="">
                      {language === "uz" ? "+ Yangi ro'yxat yaratish..." : language === "ru" ? "+ Создать новый список..." : "+ Create New Wishlist..."}
                    </option>
                    {userWishlists.map((w: any) => (
                      <option key={w.id} value={w.id}>
                        {w.title} ({w.items?.length || 0} {language === "uz" ? "ta buyum" : language === "ru" ? "товаров" : "items"})
                      </option>
                    ))}
                  </select>
                ) : null}

                {!selectedWishlistId && (
                  <input
                    type="text"
                    placeholder={
                      language === "uz"
                        ? "Yangi ro'yxat nomi (masalan: Mening orzularim)"
                        : language === "ru"
                        ? "Название нового списка (напр., Мой сетап мечты)"
                        : "New Wishlist Name (e.g. My Dream Setup)"
                    }
                    value={newWishlistTitle}
                    onChange={(e) => setNewWishlistTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                )}

                <button
                  onClick={() => saveToWishlistMut.mutate()}
                  disabled={saveToWishlistMut.isPending}
                  className="w-full btn-luxury-gold py-3 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-40"
                >
                  {saveToWishlistMut.isPending
                    ? language === "uz" ? "Saqlanmoqda..." : language === "ru" ? "Сохранение..." : "Saving..."
                    : language === "uz" ? "Ro'yxatga qo'shish" : language === "ru" ? "Добавить в вишлист" : "Add to Wishlist"}
                </button>
              </div>
            )}

            {destination === "registry" && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                  {language === "uz" ? "To'y Sovg'alari Reyestrini Tanlang" : language === "ru" ? "Выберите Свадебный Реестр" : "Select Wedding Registry"}
                </label>
                {userRegistries && userRegistries.length > 0 ? (
                  <>
                    <select
                      value={selectedRegistryId || userRegistries[0]?.id || ""}
                      onChange={(e) => setSelectedRegistryId(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/30"
                    >
                      {userRegistries.map((r: any) => (
                        <option key={r.id} value={r.id}>
                          {r.partnerName1} & {r.partnerName2} {language === "uz" ? "to'y reyestri" : language === "ru" ? "свадебный реестр" : "Registry"}
                        </option>
                      ))}
                    </select>

                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                        {language === "uz" ? "Sovg'a Muhimligi" : language === "ru" ? "Приоритет Подарка" : "Gift Priority"}
                      </label>
                      <select
                        value={registryPriority}
                        onChange={(e) => setRegistryPriority(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none"
                      >
                        <option value="high">
                          {language === "uz" ? "Yuqori muhimlik (Albatta kerak)" : language === "ru" ? "Высокий приоритет (Обязательно)" : "High Priority (Must Have)"}
                        </option>
                        <option value="medium">
                          {language === "uz" ? "O'rtacha muhimlik" : language === "ru" ? "Средний приоритет" : "Medium Priority"}
                        </option>
                        <option value="low">
                          {language === "uz" ? "Past muhimlik" : language === "ru" ? "Низкий приоритет" : "Low Priority"}
                        </option>
                      </select>
                    </div>

                    <button
                      onClick={() => saveToRegistryMut.mutate()}
                      disabled={saveToRegistryMut.isPending}
                      className="w-full py-3 text-white font-bold rounded-xl shadow-md text-xs transition cursor-pointer disabled:opacity-40 bg-rose-500 hover:bg-rose-600"
                    >
                      {saveToRegistryMut.isPending
                        ? language === "uz" ? "Saqlanmoqda..." : language === "ru" ? "Сохранение..." : "Saving..."
                        : language === "uz" ? "To'y reyestriga qo'shish" : language === "ru" ? "Добавить в свадебный реестр" : "Add to Wedding Registry"}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {language === "uz"
                        ? "Hali to'y reyestri yaratmagansiz."
                        : language === "ru"
                        ? "У вас пока нет свадебного реестра."
                        : "You haven't created a wedding registry yet."}
                    </p>
                    <a
                      href="/wedding"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.2]" />{" "}
                      {language === "uz"
                        ? "Avval to'y reyestrini yarating"
                        : language === "ru"
                        ? "Сначала создайте свадебный реестр"
                        : "Create Wedding Registry First"}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
