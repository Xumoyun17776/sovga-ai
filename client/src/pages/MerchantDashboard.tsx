import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Store,
  Package,
  TrendingUp,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle2,
  X,
  Sparkles,
  ShoppingBag,
  Layers,
} from "lucide-react";
import { useTranslation } from "../lib/i18n";
import { formatPrice, merchantsApi } from "../lib/api";
import { useToast } from "../components/Toast";

export default function MerchantDashboard() {
  const { language } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "settings">("overview");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new product
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodStock, setProdStock] = useState("10");
  const [prodLocation, setProdLocation] = useState("Malika A-12");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["merchantProducts"],
    queryFn: () => merchantsApi.getProducts(),
  });

  const createProductMut = useMutation({
    mutationFn: (data: any) => merchantsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchantProducts"] });
      setShowAddModal(false);
      setProdName("");
      setProdPrice("");
      setProdStock("10");
      toast.success(
        language === "uz"
          ? "Mahsulot muvaffaqiyatli qo'shildi!"
          : language === "ru"
          ? "Товар успешно добавлен!"
          : "Product added successfully!"
      );
    },
    onError: (err: any) => {
      toast.error(err.message || "Xatolik yuz berdi");
    },
  });

  const deleteProductMut = useMutation({
    mutationFn: (id: number) => merchantsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchantProducts"] });
      toast.success(
        language === "uz"
          ? "Mahsulot o'chirildi"
          : language === "ru"
          ? "Товар удален"
          : "Product removed"
      );
    },
    onError: (err: any) => {
      toast.error(err.message || "Xatolik yuz berdi");
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      toast.error(
        language === "uz"
          ? "Mahsulot nomini kiriting"
          : language === "ru"
          ? "Введите название товара"
          : "Please enter product name"
      );
      return;
    }
    const priceNum = parseFloat(prodPrice.replace(/[^0-9.]/g, ""));
    if (!priceNum || isNaN(priceNum)) {
      toast.error(
        language === "uz"
          ? "Haqiqiy narxni kiriting"
          : language === "ru"
          ? "Введите корректную цену"
          : "Please enter valid price"
      );
      return;
    }
    createProductMut.mutate({
      name: prodName.trim(),
      price: priceNum,
      stock: parseInt(prodStock) || 1,
      status: "active",
      views: 0,
      location: prodLocation,
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] relative overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Ambient luxury background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-400/25 to-amber-500/15 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-2 border border-amber-300/80 dark:border-amber-500/30 shadow-2xs">
              <Store className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>
                {language === "uz"
                  ? "Sotuvchi Kabineti"
                  : language === "ru"
                  ? "Панель продавца"
                  : "Merchant Portal"}
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white">
              Abu Sahiy & Malika B2B
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xl text-sm">
              {language === "uz"
                ? "O'z tovarlaringizni to'g'ridan-to'g'ri Sovg'a AI tizimiga qo'shing va minglab xaridorlarga vositachisiz soting."
                : language === "ru"
                ? "Добавляйте свои товары напрямую в Sovg'a AI и продавайте тысячам покупателей без посредников."
                : "Upload your inventory directly to Sovg'a AI and sell to thousands of buyers with zero commission."}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3.5 btn-luxury-gold text-slate-950 font-black rounded-2xl shadow-md active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>
              {language === "uz"
                ? "Yangi Mahsulot Qo'shish"
                : language === "ru"
                ? "Добавить товар"
                : "Add Product"}
            </span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-amber-200/80 dark:border-slate-800 mb-8 overflow-x-auto hide-scrollbar">
          {[
            {
              id: "overview",
              label:
                language === "uz"
                  ? "Asosiy Ko'rsatkichlar"
                  : language === "ru"
                  ? "Обзор показателей"
                  : "Overview",
            },
            {
              id: "products",
              label:
                language === "uz"
                  ? "Mening Tovarlarim"
                  : language === "ru"
                  ? "Мои товары"
                  : "My Inventory",
            },
            {
              id: "settings",
              label:
                language === "uz"
                  ? "Do'kon Sozlamalari"
                  : language === "ru"
                  ? "Настройки магазина"
                  : "Store Settings",
            },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer active:scale-95 ${
                activeTab === t.id
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] p-6 rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold">
                    {language === "uz" ? "Umumiy Ko'rishlar" : language === "ru" ? "Всего просмотров" : "Total Views"}
                  </h3>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/40 shadow-2xs">
                    <TrendingUp className="w-5 h-5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">12,450</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 stroke-[2.2]" />{" "}
                  {language === "uz" ? "+24% shu haftada" : language === "ru" ? "+24% на этой неделе" : "+24% this week"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] p-6 rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold">
                    {language === "uz" ? "Aktiv Tovarlar" : language === "ru" ? "Активные товары" : "Active Products"}
                  </h3>
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900/40 shadow-2xs">
                    <Package className="w-5 h-5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {products.length > 0 ? products.length : 142}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {language === "uz"
                    ? "Malika bozoridagi do'koningiz"
                    : language === "ru"
                    ? "Ваш магазин на рынке Малика"
                    : "Your Malika store branch"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] p-6 rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold">
                    {language === "uz" ? "Tahminiy Daromad" : language === "ru" ? "Ориентировочный доход" : "Est. Revenue"}
                  </h3>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                    <DollarSign className="w-5 h-5 stroke-[2.2]" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">45M UZS</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {language === "uz"
                    ? "Ushbu oydagi sotuvlar"
                    : language === "ru"
                    ? "Продажи за этот месяц"
                    : "Sales this month"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/20 overflow-hidden shadow-luxury">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-amber-50/70 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold border-b border-amber-200/80 dark:border-slate-800">
                  <tr>
                    <th className="p-4">
                      {language === "uz" ? "Mahsulot nomi" : language === "ru" ? "Название товара" : "Product Name"}
                    </th>
                    <th className="p-4">
                      {language === "uz" ? "Narxi" : language === "ru" ? "Цена" : "Price"}
                    </th>
                    <th className="p-4">
                      {language === "uz" ? "Qoldiq" : language === "ru" ? "Остаток" : "Stock"}
                    </th>
                    <th className="p-4">
                      {language === "uz" ? "Ko'rishlar" : language === "ru" ? "Просмотры" : "Views"}
                    </th>
                    <th className="p-4">
                      {language === "uz" ? "Holati" : language === "ru" ? "Статус" : "Status"}
                    </th>
                    <th className="p-4">
                      {language === "uz" ? "Amallar" : language === "ru" ? "Действия" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 dark:divide-slate-800/80">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                        Yuklanmoqda...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                        {language === "uz"
                          ? "Hozircha tovarlar mavjud emas. Yangi tovar qo'shing!"
                          : language === "ru"
                          ? "Товаров пока нет. Добавьте первый товар!"
                          : "No products added yet. Add your first product!"}
                      </td>
                    </tr>
                  ) : (
                    products.map((p: any) => (
                      <tr key={p.id} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-amber-500 stroke-[2.2] shrink-0" />
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-amber-900 dark:text-amber-300">{formatPrice(p.price)}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {p.stock} {language === "uz" ? "ta" : language === "ru" ? "шт" : "pcs"}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {p.views || 0} {language === "uz" ? "marta" : language === "ru" ? "раз" : "views"}
                        </td>
                        <td className="p-4">
                          {p.status === "active" ? (
                            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-md text-xs font-bold shadow-2xs">
                              {language === "uz" ? "Sotuvda" : language === "ru" ? "В наличии" : "In Stock"}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 rounded-md text-xs font-bold shadow-2xs">
                              {language === "uz" ? "Tugagan" : language === "ru" ? "Распродано" : "Out of Stock"}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => deleteProductMut.mutate(p.id)}
                            disabled={deleteProductMut.isPending}
                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl active:scale-95 transition cursor-pointer shadow-2xs"
                            title={language === "uz" ? "O'chirish" : language === "ru" ? "Удалить" : "Delete"}
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/20 p-6 sm:p-7 max-w-2xl shadow-luxury">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {language === "uz" ? "Do'kon Ma'lumotlari" : language === "ru" ? "Данные магазина" : "Store Information"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {language === "uz" ? "Do'kon Nomi" : language === "ru" ? "Название магазина" : "Store Name"}
                </label>
                <input
                  type="text"
                  defaultValue="Malika Tech Center"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {language === "uz" ? "Manzil / Bozor" : language === "ru" ? "Адрес / Рынок" : "Address / Market"}
                </label>
                <input
                  type="text"
                  defaultValue="Toshkent sh., Malika savdo majmuasi, A-12 do'kon"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {language === "uz" ? "Telefon raqam" : language === "ru" ? "Номер телефона" : "Phone Number"}
                </label>
                <input
                  type="text"
                  defaultValue="+998 90 123 45 67"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            {/* Ambient vignette glow */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-amber-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl opacity-70" />
            </div>

            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-luxury border-2 border-amber-300/80 dark:border-amber-500/25 relative my-auto max-h-[92vh] max-h-[92dvh] overflow-y-auto">
              {/* Top ambient glow */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

              {/* Close button */}
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer active:scale-95 shadow-2xs"
              >
                <X className="w-5 h-5 stroke-[2.2]" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-400/30">
                  <Package className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h2 className="font-display font-black text-xl text-slate-900 dark:text-white">
                  {language === "uz"
                    ? "Yangi Mahsulot Qo'shish"
                    : language === "ru"
                    ? "Добавить новый товар"
                    : "Add New Product"}
                </h2>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {language === "uz" ? "Mahsulot Nomi *" : language === "ru" ? "Название товара *" : "Product Name *"}
                  </label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder={
                      language === "uz"
                        ? "Masalan: PlayStation 5 Slim 1TB"
                        : language === "ru"
                        ? "Например: PlayStation 5 Slim 1TB"
                        : "E.g. PlayStation 5 Slim 1TB"
                    }
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 text-sm font-semibold shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      {language === "uz" ? "Narxi (UZS) *" : language === "ru" ? "Цена (UZS) *" : "Price (UZS) *"}
                    </label>
                    <input
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="6500000"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 text-sm font-semibold shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      {language === "uz" ? "Qoldiq (Soni)" : language === "ru" ? "Остаток (Кол-во)" : "Stock (Quantity)"}
                    </label>
                    <input
                      type="number"
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      placeholder="10"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 text-sm font-semibold shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {language === "uz" ? "Bozor Joylashuvi" : language === "ru" ? "Локация на рынке" : "Market Location"}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProdLocation("Malika A-12")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer border ${
                        prodLocation === "Malika A-12"
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 shadow-2xs"
                          : "border-amber-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 stroke-[2.2]" /> Malika A-12
                    </button>
                    <button
                      type="button"
                      onClick={() => setProdLocation("Abu Sahiy E-34")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer border ${
                        prodLocation === "Abu Sahiy E-34"
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 shadow-2xs"
                          : "border-amber-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 stroke-[2.2]" /> Abu Sahiy E-34
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-amber-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 font-bold text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95 transition cursor-pointer"
                  >
                    {language === "uz" ? "Bekor qilish" : language === "ru" ? "Отмена" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={createProductMut.isPending}
                    className="px-6 py-2.5 btn-luxury-gold text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 active:scale-95 transition cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                    <span>
                      {createProductMut.isPending
                        ? "Qo'shilmoqda..."
                        : language === "uz"
                        ? "Qo'shish"
                        : language === "ru"
                        ? "Добавить"
                        : "Add Product"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
