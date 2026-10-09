import React, { useState } from "react";
import {
  X,
  ShoppingBag,
  CheckCircle2,
  Truck,
  CreditCard,
  Gift,
  ShieldCheck,
  Sparkles,
  Phone,
  User,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { formatPrice, orders } from "../lib/api";
import { cyberSound } from "../lib/cyberSound";
import { useToast } from "./Toast";
import { useTranslation } from "../lib/i18n";
import { getProductFallbackImage } from "../lib/imageHelper";
import type { ResearchProduct } from "@shared/types";

interface Props {
  product: ResearchProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

const UZBEK_REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand viloyati",
  "Farg'ona viloyati",
  "Andijon viloyati",
  "Namangan viloyati",
  "Buxoro viloyati",
  "Xorazm viloyati",
  "Qashqadaryo viloyati",
  "Surxondaryo viloyati",
  "Navoiy viloyati",
  "Jizzax viloyati",
  "Sirdaryo viloyati",
  "Qoraqalpog'iston Respublikasi",
];

export default function DirectOrderModal({ product, isOpen, onClose }: Props) {
  const { language } = useTranslation();
  const toast = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+998 ");
  const [customerAddress, setCustomerAddress] = useState("");
  const [region, setRegion] = useState("Toshkent shahri");
  const [giftPackaging, setGiftPackaging] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "click" | "payme" | "installment">("cash_on_delivery");
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  if (!isOpen || !product) return null;

  const basePrice = product.price || 0;
  const packagingFee = giftPackaging ? 25000 : 0;
  const deliveryFee = region === "Toshkent shahri" ? 0 : 20000;
  const totalAmount = basePrice + packagingFee + deliveryFee;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("+998")) {
      val = "+998 ";
    }
    setCustomerPhone(val);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error(
        language === "uz"
          ? "Iltimos, ismingizni kiriting"
          : language === "ru"
          ? "Пожалуйста, введите ваше имя"
          : "Please enter your full name"
      );
      return;
    }

    if (customerPhone.trim().length < 13) {
      toast.error(
        language === "uz"
          ? "Iltimos, to'liq telefon raqamingizni kiriting (+998 XX XXX XX XX)"
          : language === "ru"
          ? "Пожалуйста, введите полный номер телефона (+998 XX XXX XX XX)"
          : "Please enter your full phone number (+998 XX XXX XX XX)"
      );
      return;
    }

    if (!customerAddress.trim()) {
      toast.error(
        language === "uz"
          ? "Iltimos, yetkazib berish manzilini kiriting"
          : language === "ru"
          ? "Пожалуйста, введите адрес доставки"
          : "Please enter your delivery address"
      );
      return;
    }

    setLoading(true);
    cyberSound.playClick();

    try {
      const newOrder = await orders.create({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        region,
        productName: product.name || "Noma'lum mahsulot",
        productPrice: product.price || 0,
        productStore: product.store || "Uzum Market",
        productUrl: product.url || "",
        productImage: product.imageUrl || null,
        quantity: 1,
        giftPackaging,
        giftMessage: giftPackaging ? giftMessage.trim() : null,
        paymentMethod,
      });

      setConfirmedOrder(newOrder);
      cyberSound.playConfirm();
      toast.success(
        language === "uz"
          ? `Buyurtmangiz muvaffaqiyatli qabul qilindi! Buyurtma kodi: ${newOrder.orderNumber}`
          : language === "ru"
          ? `Ваш заказ успешно принят! Номер заказа: ${newOrder.orderNumber}`
          : `Your direct order has been received! Order ID: ${newOrder.orderNumber}`,
        language === "uz"
          ? "Xarid Rasmiylashtirildi 🎉"
          : language === "ru"
          ? "Заказ Оформлен 🎉"
          : "Order Placed 🎉"
      );
    } catch (err: any) {
      console.error("Order error:", err);
      toast.error(
        err.message ||
          (language === "uz"
            ? "Buyurtma berishda xatolik yuz berdi"
            : language === "ru"
            ? "Произошла ошибка при оформлении заказа"
            : "An error occurred while placing your order")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmedOrder(null);
    setCustomerName("");
    setCustomerPhone("+998 ");
    setCustomerAddress("");
    setGiftPackaging(false);
    setGiftMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl shadow-luxury border-2 border-amber-300/80 dark:border-amber-500/25 overflow-hidden my-auto animate-scale-in max-h-[92vh] max-h-[92dvh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative border-b border-white/10">
          <button
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
            aria-label="Yopish"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wider uppercase mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span>
              {language === "uz"
                ? "Sovg'a AI Kafolatli Xarid"
                : language === "ru"
                ? "Sovg'a AI Гарантированная Покупка"
                : "Sovg'a AI Verified Direct Checkout"}
            </span>
          </div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
            {confirmedOrder
              ? language === "uz"
                ? "Buyurtma Tasdiqlandi!"
                : language === "ru"
                ? "Заказ Подтвержден!"
                : "Order Confirmed!"
              : language === "uz"
              ? "Tezkor Xaridni Rasmiylashtirish"
              : language === "ru"
              ? "Быстрое Оформление Заказа"
              : "Direct Express Checkout"}
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            {confirmedOrder
              ? language === "uz"
                ? "Operatorimiz tez orada siz bilan bog'lanadi va yetkazib berishni boshlaydi"
                : language === "ru"
                ? "Наш консьерж свяжется с вами в ближайшее время для подтверждения доставки"
                : "Our courier concierge will reach out to you shortly to coordinate express delivery."
              : language === "uz"
              ? "Mahsulot to'g'ridan-to'g'ri ko'rsatilgan eng arzon narxda uyingizgacha yetkaziladi"
              : language === "ru"
              ? "Прямая доставка до вашей двери по лучшей проверенной цене в Узбекистане"
              : "Direct doorstep delivery across Uzbekistan with 100% authentic retailer warranty."}
          </p>
        </div>

        {confirmedOrder ? (
          /* Confirmation Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-6 max-h-[75vh] max-h-[75dvh] overflow-y-auto">
            <div className="w-16 h-16 icon-medallion icon-box-emerald mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold">
                {language === "uz" ? "BUYURTMA KODI" : language === "ru" ? "НОМЕР ЗАКАЗА" : "ORDER ID"}: {confirmedOrder.orderNumber}
              </span>
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                {language === "uz"
                  ? `Rahmat, ${confirmedOrder.customerName}!`
                  : language === "ru"
                  ? `Спасибо, ${confirmedOrder.customerName}!`
                  : `Thank you, ${confirmedOrder.customerName}!`}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs max-w-md mx-auto leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-white">{confirmedOrder.productName}</span>{" "}
                {language === "uz"
                  ? "buyurtmangiz tizimimizga muvaffaqiyatli qabul qilindi. Tez orada kuryerimiz siz bilan bog'lanadi."
                  : language === "ru"
                  ? "ваш заказ успешно принят. Курьер свяжется с вами в ближайшее время."
                  : "has been secured in our system. Our concierge courier will contact you shortly to coordinate express delivery."}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 text-left text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-400">
                  {language === "uz" ? "Yetkazish manzili:" : language === "ru" ? "Адрес доставки:" : "Delivery Address:"}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {confirmedOrder.region}, {confirmedOrder.customerAddress}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-400">
                  {language === "uz" ? "Aloqa telefoni:" : language === "ru" ? "Контактный телефон:" : "Contact Phone:"}
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {confirmedOrder.customerPhone}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-400">
                  {language === "uz" ? "To'lov turi:" : language === "ru" ? "Способ оплаты:" : "Payment Method:"}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white capitalize">
                  {confirmedOrder.paymentMethod === "click"
                    ? "Click"
                    : confirmedOrder.paymentMethod === "payme"
                    ? "Payme"
                    : confirmedOrder.paymentMethod === "installment"
                    ? language === "uz"
                      ? "Muddatli to'lov (Nasiya)"
                      : language === "ru"
                      ? "Рассрочка 0% (Насия)"
                      : "0% Installments (Nasiya)"
                    : language === "uz"
                    ? "Qabul qilib olganda naqd / karta"
                    : language === "ru"
                    ? "Наличными или картой при получении"
                    : "Cash / Card on Delivery"}
                </span>
              </div>
              <div className="flex justify-between py-1 text-sm font-bold text-slate-900 dark:text-white pt-1">
                <span>{language === "uz" ? "Jami to'lov:" : language === "ru" ? "Итого к оплате:" : "Total Amount:"}</span>
                <span className="text-amber-500">{formatPrice(confirmedOrder.totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-3.5 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer active:scale-95"
            >
              {language === "uz"
                ? "Tushunarli, Davom Etish"
                : language === "ru"
                ? "Понятно, Вернуться"
                : "Done, Return to Platform"}
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-5 max-h-[75vh] max-h-[75dvh] overflow-y-auto flex-1">
            {/* Product Summary Mini Card */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/10">
              <img
                src={product.imageUrl || getProductFallbackImage(product.name, product.category)}
                alt={product.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getProductFallbackImage(product.name, product.category);
                }}
                className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                  {product.store}
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate mt-1">
                  {product.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-extrabold text-xs text-amber-600 dark:text-amber-400">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  {product.originalPrice && product.originalPrice > (product.price || 0) && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">
                      {formatPrice(product.originalPrice, product.currency)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Inputs */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                  <span>
                    {language === "uz"
                      ? "Ismingiz va Familiyangiz *"
                      : language === "ru"
                      ? "Имя и Фамилия *"
                      : "Full Name *"}
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sardor Aliyev"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                  <span>
                    {language === "uz"
                      ? "Telefon Raqamingiz *"
                      : language === "ru"
                      ? "Номер Телефона *"
                      : "Phone Number (+998) *"}
                  </span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                    <span>{language === "uz" ? "Viloyat / Shahar" : language === "ru" ? "Регион / Город" : "Region / City"}</span>
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition cursor-pointer"
                  >
                    {UZBEK_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                    <span>{language === "uz" ? "Yetkazish muddati" : language === "ru" ? "Срок доставки" : "Delivery Estimate"}</span>
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>
                      {region === "Toshkent shahri"
                        ? language === "uz"
                          ? "1 ish kuni (Bepul)"
                          : language === "ru"
                          ? "1 рабочий день (Бесплатно)"
                          : "1 Business Day (Free)"
                        : language === "uz"
                        ? "1-2 kun (20,000 UZS)"
                        : language === "ru"
                        ? "1-2 дня (20 000 UZS)"
                        : "1-2 Days (20,000 UZS)"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === "uz"
                    ? "Aniq manzil (Tuman, ko'cha, uy raqami) *"
                    : language === "ru"
                    ? "Точный адрес (Район, улица, дом/кв) *"
                    : "Delivery Address (District, street, house/apt) *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    language === "uz"
                      ? "Masalan: Chilonzor tumani, 9-mavze, 14-uy"
                      : language === "ru"
                      ? "Например: Чиланзарский р-н, квартал 9, дом 14"
                      : "e.g. Chilanzar district, 9th block, apt 14"
                  }
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                />
              </div>

              {/* Gift Packaging Checkbox */}
              <div className="p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={giftPackaging}
                    onChange={(e) => setGiftPackaging(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                    <Gift className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>
                      {language === "uz"
                        ? "Hashamatli sovg'a qadoqi va tabriknoma (+25,000 UZS)"
                        : language === "ru"
                        ? "Премиальная подарочная упаковка и открытка (+25 000 UZS)"
                        : "Luxury Satin Gift Packaging & Greeting Card (+25,000 UZS)"}
                    </span>
                  </div>
                </label>

                {giftPackaging && (
                  <div className="pt-2 animate-fade-in">
                    <input
                      type="text"
                      placeholder={
                        language === "uz"
                          ? "Tabriknomaga tilaklar..."
                          : language === "ru"
                          ? "Пожелания для поздравительной открытки..."
                          : "Personal greeting note for the card..."
                      }
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-white/10 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                  <span>
                    {language === "uz"
                      ? "To'lov usulini tanlang"
                      : language === "ru"
                      ? "Выберите способ оплаты"
                      : "Select Payment Method"}
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash_on_delivery")}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 ${
                      paymentMethod === "cash_on_delivery"
                        ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-slate-900 dark:text-amber-300 font-bold shadow-xs ring-1 ring-amber-400/30"
                        : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-xl">💵</span>
                    <span className="text-[11px] leading-tight font-semibold">
                      {language === "uz" ? "Qabul qilganda" : language === "ru" ? "При получении" : "Cash on Delivery"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("click")}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 ${
                      paymentMethod === "click"
                        ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-slate-900 dark:text-amber-300 font-bold shadow-xs ring-1 ring-amber-400/30"
                        : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-xl">💳</span>
                    <span className="text-[11px] leading-tight font-semibold">Click</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("payme")}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 ${
                      paymentMethod === "payme"
                        ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-slate-900 dark:text-amber-300 font-bold shadow-xs ring-1 ring-amber-400/30"
                        : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-xl">📱</span>
                    <span className="text-[11px] leading-tight font-semibold">Payme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("installment")}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 ${
                      paymentMethod === "installment"
                        ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-slate-900 dark:text-amber-300 font-bold shadow-xs ring-1 ring-amber-400/30"
                        : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-xl">📑</span>
                    <span className="text-[11px] leading-tight font-semibold">Nasiya (3/6/12)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Total and Submit */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {language === "uz" ? "Jami to'lov:" : language === "ru" ? "Итого к оплате:" : "Total Amount:"}
                  </span>
                  <div className="font-display font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                    {formatPrice(totalAmount, product.currency)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>
                    {language === "uz"
                      ? "Rasmiy Kafolat"
                      : language === "ru"
                      ? "Официальная Гарантия"
                      : "100% Official Warranty"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-luxury-gold py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>
                    {language === "uz"
                      ? "Buyurtma rasmiylashtirilmoqda..."
                      : language === "ru"
                      ? "Оформление заказа..."
                      : "Processing Direct Order..."}
                  </span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                    <span>
                      {language === "uz"
                        ? "Buyurtmani Tasdiqlash"
                        : language === "ru"
                        ? "Подтвердить Заказ"
                        : "Confirm & Place Direct Order"}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
