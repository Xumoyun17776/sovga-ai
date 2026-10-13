import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCheckedAgo } from "../components/LivePriceProof";
import { useTranslation, trData } from "../lib/i18n";
import { catalog, formatPrice } from "../lib/api";
import { ensureProductUrl } from "../lib/urlHelper";
import PriceComparisonModal from "../components/PriceComparisonModal";
import PriceTrackModal from "../components/PriceTrackModal";
import SaveProductModal from "../components/SaveProductModal";
import ProductQuickViewModal from "../components/ProductQuickViewModal";
import {
  ShoppingBag,
  Search,
  Filter,
  BarChart2,
  Bell,
  Heart,
  ExternalLink,
  ShieldCheck,
  Star,
  TrendingDown,
  Sparkles,
  ArrowUpDown,
  Truck,
  LayoutGrid,
  Table as TableIcon,
  CreditCard,
  Eye,
  ArrowUpRight,
  Layers,
} from "../lib/icons";

export default function CatalogPage() {
  const { language } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStore, setSelectedStore] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals state
  const [compareProduct, setCompareProduct] = useState<any | null>(null);
  const [trackProduct, setTrackProduct] = useState<any | null>(null);
  const [saveProduct, setSaveProduct] = useState<any | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  // Queries
  const { data: categories = [] } = useQuery({
    queryKey: ["catalog-categories"],
    queryFn: catalog.categories,
  });
  const { data: meta } = useQuery({ queryKey: ["catalog-meta"], queryFn: catalog.meta, staleTime: 5 * 60 * 1000 });
  const { clock: checkedClock } = useCheckedAgo(meta?.checkedAt, language);
  const storeOptions = meta?.live && meta.stores.length ? meta.stores : ["Uzum", "Olcha", "Texnomart", "MediaPark"];
  const catLabel = (c: { name: string; labelUz?: string; labelRu?: string; labelEn?: string }) =>
    (language === "uz" ? c.labelUz : language === "ru" ? c.labelRu : c.labelEn) || c.name;
  const catByName = new Map(categories.map((c: any) => [c.name, c]));

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["catalog-products", selectedCategory, selectedStore, searchQuery, sortBy],
    queryFn: () =>
      catalog.filter({
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        store: selectedStore !== "All" ? selectedStore : undefined,
        q: searchQuery || undefined,
        sort: sortBy,
        limit: 100,
      }),
  });

  return (
    <div className="min-h-screen py-8 transition-colors relative overflow-hidden">
      {/* Ambient luxury vignette glow */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in relative z-10">
      {/* Header Banner - Obsidian Ultra Luxury */}
      <div className="bg-white dark:bg-[#0b1224] border border-[var(--line)] rounded-2xl p-6 sm:p-10 relative overflow-hidden">
        
        <div className="relative z-10 max-w-2xl space-y-3.5">
          <h1 className="lux-title text-[2.4rem] sm:text-[3.2rem] text-slate-900 dark:text-white leading-[1.05]">
            {language === "uz" ? "Katalog" : language === "ru" ? "Каталог" : "Catalog"}
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-3 max-w-2xl leading-relaxed">
            {meta?.live
              ? language === "uz"
                ? `${meta.stores.join(" va ")} saytlaridan ${meta.total} ta haqiqiy mahsulot — do'kon rasmi, joriy narx va to'g'ridan-to'g'ri havola bilan. ${checkedClock} da tekshirildi (Toshkent vaqti).`
                : language === "ru"
                ? `${meta.total} реальных товаров с сайтов ${meta.stores.join(" и ")} — с фото магазина, текущей ценой и прямой ссылкой. Проверено в ${checkedClock} (по Ташкенту).`
                : `${meta.total} real listings from ${meta.stores.join(" and ")} — with the store's photo, current price and a direct link. Checked at ${checkedClock} Tashkent time.`
              : language === "uz" ? "Uzum, Olcha, Texnomart va boshqa do'konlardagi mahsulotlar va narxlar." : language === "ru" ? "Товары и цены Uzum, Olcha, Texnomart и других магазинов." : "Products and prices from Uzum, Olcha, Texnomart and other stores."}
          </p>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            selectedCategory === "All"
              ? "btn-luxury-gold shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-700 border border-[var(--line)] dark:border-slate-700 shadow-2xs"
          }`}
        >
          <Layers className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>{language === "uz" ? "Barcha toifalar" : language === "ru" ? "Все категории" : "All Categories"}</span>
        </button>

        {categories.map((c) => (
          <button
            key={c.name}
            onClick={() => setSelectedCategory(c.name)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === c.name
                ? "btn-luxury-gold shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-700 border border-[var(--line)] dark:border-slate-700 shadow-2xs"
            }`}
          >
            {c.labelEn && <span aria-hidden="true">{c.icon}</span>}
            <span>{catLabel(c)}</span>
            <span className="text-[11px] opacity-70">({c.count})</span>
          </button>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#0b1224] card-luxury rounded-2xl p-4 sm:p-5 border border-[var(--line)] dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-amber-600 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === "uz"
                ? "Katalogdan qidirish: mahsulot nomi, brend yoki xususiyat..."
                : language === "ru"
                ? "Поиск по каталогу: название товара, бренд или характеристика..."
                : "Search catalog: product name, brand, or specifications..."
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--line)] dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium transition"
          />
        </div>

        {/* Store selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--line)] dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 flex-1 min-w-0 md:flex-initial cursor-pointer"
          >
            <option value="All">{language === "uz" ? "Barcha do'konlar" : language === "ru" ? "Все магазины" : "All stores"}</option>
            {storeOptions.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--line)] dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 flex-1 min-w-0 md:flex-initial cursor-pointer"
          >
            <option value="popular">{language === "uz" ? "Eng ommabop" : language === "ru" ? "Популярные" : "Most popular"}</option>
            <option value="discount">{language === "uz" ? "Eng katta chegirma %" : language === "ru" ? "Самая большая скидка %" : "Biggest Discount %"}</option>
            <option value="price_asc">{language === "uz" ? "Eng arzonidan boshlab" : language === "ru" ? "Сначала недорогие" : "Lowest Price First"}</option>
            <option value="price_desc">{language === "uz" ? "Eng qimmatidan boshlab" : language === "ru" ? "Сначала премиальные" : "Highest Price First"}</option>
            <option value="rating">{language === "uz" ? "Mijozlar reytingi bo'yicha" : language === "ru" ? "По рейтингу покупателей" : "Top Customer Rating"}</option>
          </select>

          {/* Grid vs Table Toggle */}
          <div className="flex items-center bg-amber-100/70 dark:bg-slate-800/80 p-1 rounded-2xl border border-[var(--line)] dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition cursor-pointer ${
                viewMode === "grid"
                  ? "btn-luxury-gold shadow-xs"
                  : "text-amber-950 dark:text-slate-400 hover:text-black dark:hover:text-white"
              }`}
              title={language === "uz" ? "Kartochkalar ko'rinishi" : language === "ru" ? "Вид карточек" : "Grid view"}
            >
              <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-xl transition cursor-pointer ${
                viewMode === "table"
                  ? "btn-luxury-gold shadow-xs"
                  : "text-amber-950 dark:text-slate-400 hover:text-black dark:hover:text-white"
              }`}
              title={language === "uz" ? "Jadval ko'rinishi" : language === "ru" ? "Вид таблицы" : "Table view"}
            >
              <TableIcon className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {language === "uz" ? "Katalog va do'kon narxlari yuklanmoqda..." : language === "ru" ? "Загрузка каталога и цен магазинов..." : "Loading catalog and verified store prices..."}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && products.length === 0 && (
        <div className="bg-white dark:bg-[#0b1224] card-luxury rounded-2xl p-12 text-center border border-[var(--line)] dark:border-slate-800 max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 icon-medallion icon-box-gold rounded-2xl flex items-center justify-center mx-auto text-amber-800 dark:text-amber-300">
            <ShoppingBag className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-slate-900 dark:text-white text-lg">
              {language === "uz" ? "Mahsulot topilmadi" : language === "ru" ? "Товары не найдены" : "No Products Found"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === "uz"
                ? "Tanlangan filtrlar yoki qidiruv so'rovi bo'yicha tovarlar mavjud emas. Filtrlarni tozalang."
                : language === "ru"
                ? "По выбранным фильтрам товары не найдены. Попробуйте сбросить фильтры."
                : "No products match your selected filters or search query. Clear filters to see all."}
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedStore("All");
              setSearchQuery("");
            }}
            className="px-5 py-2.5 btn-luxury-gold text-slate-950 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            {language === "uz" ? "Barcha filtrlarni tozalash" : language === "ru" ? "Сбросить все фильтры" : "Clear All Filters"}
          </button>
        </div>
      )}

      {/* Products Grid or Table */}
      {!isLoading && products.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((item: any) => {
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#0b1224] rounded-2xl border border-[var(--line)] dark:border-slate-800 overflow-hidden shadow-sm hover:border-[var(--line-strong)] dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image container */}
                  <div
                    onClick={() => setQuickViewProduct(item)}
                    className="h-52 bg-white relative overflow-hidden cursor-pointer"
                    title="Tezkor ko'rish"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-300/80 dark:text-slate-600 bg-amber-50/40 dark:bg-slate-900">
                        <ShoppingBag className="w-10 h-10 stroke-[1.25]" />
                      </div>
                    )}

                    {/* Discount badge */}
                    {item.discount && (
                      <span className="absolute top-3 left-3 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs bg-rose-500">
                        {item.discount}
                      </span>
                    )}

                    {/* Category tag */}
                    <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/20">
                      {catByName.get(item.category) ? catLabel(catByName.get(item.category) as any) : item.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-amber-800/80 dark:text-amber-400 uppercase tracking-wider block">
                        {item.brand}
                      </span>
                      <h3
                        onClick={() => setQuickViewProduct(item)}
                        className="font-display font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 mt-0.5 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition cursor-pointer"
                      >
                        {item.name}
                      </h3>
                    </div>

                    {/* Price row */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-semibold text-slate-900 dark:text-white">
                        {formatPrice(item.price, item.currency)}
                      </span>
                      {item.originalPrice && item.originalPrice > (item.price || 0) && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(item.originalPrice, item.currency)}
                        </span>
                      )}
                    </div>

                    {/* Rating & Verified badge */}
                    <div className="flex items-center gap-2">
                      {item.rating && (
                        <span className="flex items-center gap-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-amber-100/70 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-[var(--line)] dark:border-slate-700">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {item.rating}
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">({item.reviewCount || 100})</span>
                        </span>
                      )}

                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Verified
                      </span>
                    </div>

                    {/* Store Offers summary pill */}
                    {item.offers && item.offers.length > 0 && (
                      <div className="text-xs bg-amber-50/70 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-[var(--line)] dark:border-slate-700 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                          <span>{language === "uz" ? "Do'kon:" : language === "ru" ? "Магазин:" : "Store:"} <strong className="text-slate-900 dark:text-white">{item.store}</strong></span>
                          <span className="text-amber-700 dark:text-amber-400 font-bold">{item.offers.length} {language === "uz" ? "do'kon" : language === "ru" ? (item.offers.length === 1 ? "магазин" : "магазина") : item.offers.length === 1 ? "store" : "stores"}</span>
                        </div>
                        {item.installment && (
                          <p className="text-[10px] text-slate-700 dark:text-slate-300 font-medium truncate flex items-center gap-1.5">
                            <CreditCard className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 stroke-[2.2]" />
                            <span>{trData(item.installment)}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 sm:p-5 pt-0 border-t border-[var(--line)] dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-1.5 pt-2">
                    <button
                      onClick={() => setQuickViewProduct(item)}
                      title={language === "uz" ? "Tezkor ko'rish va Nasiya kalkulyatori" : language === "ru" ? "Быстрый просмотр и калькулятор рассрочки" : "Quick view & installment calculator"}
                      className="w-9 h-9 flex items-center justify-center border border-[var(--line)] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl hover:border-[var(--line-strong)] hover:text-amber-600 dark:hover:text-amber-300 transition text-slate-600 dark:text-slate-300 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-4 h-4 stroke-[2.2]" />
                    </button>

                    <a
                      href={ensureProductUrl(item.name, item.store, item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 btn-luxury-gold text-slate-950 text-xs font-bold rounded-xl transition shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>{item.store?.split(" ")[0] || (language === "uz" ? "Do'konda" : language === "ru" ? "В магазин" : "Store")}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-80 stroke-[2.2]" />
                    </a>

                    <button
                      onClick={() => setCompareProduct(item)}
                      title={language === "uz" ? "Do'kon narxlarini taqqoslash" : language === "ru" ? "Сравнить цены магазинов" : "Compare store prices"}
                      className="w-9 h-9 flex items-center justify-center border border-[var(--line)] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition text-slate-600 dark:text-slate-300 cursor-pointer shadow-2xs"
                    >
                      <BarChart2 className="w-4 h-4 stroke-[2.2]" />
                    </button>

                    <button
                      onClick={() => setTrackProduct(item)}
                      title={language === "uz" ? "Narx tushishini kuzatish" : language === "ru" ? "Следить за падением цены" : "Set price drop alert"}
                      className="w-9 h-9 flex items-center justify-center border border-[var(--line)] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl hover:border-[var(--line-strong)] hover:text-amber-600 dark:hover:text-amber-300 transition text-slate-600 dark:text-slate-300 cursor-pointer shadow-2xs"
                    >
                      <Bell className="w-4 h-4 stroke-[2.2]" />
                    </button>

                    <button
                      onClick={() => setSaveProduct(item)}
                      title={language === "uz" ? "Istaklarga saqlash" : language === "ru" ? "Сохранить в желания" : "Save to Wishlist"}
                      className="w-9 h-9 flex items-center justify-center border border-[var(--line)] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 transition text-slate-600 dark:text-slate-300 cursor-pointer shadow-2xs"
                    >
                      <Heart className="w-4 h-4 stroke-[2.2]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Products Table View */}
      {!isLoading && products.length > 0 && viewMode === "table" && (
        <div className="bg-white dark:bg-[#0d1530] rounded-2xl border border-[var(--line)] dark:border-slate-800 overflow-hidden shadow-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-amber-50/80 dark:bg-slate-800/70 border-b border-[var(--line)] dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                  <th className="p-4">{language === "uz" ? "Mahsulot" : language === "ru" ? "Товар" : "Product"}</th>
                  <th className="p-4">{language === "uz" ? "Kategoriya / Brend" : language === "ru" ? "Категория / Бренд" : "Category / Brand"}</th>
                  <th className="p-4">{language === "uz" ? "Eng yaxshi narx" : language === "ru" ? "Лучшая цена" : "Best Price"}</th>
                  <th className="p-4">{language === "uz" ? "Do'kon / Takliflar" : language === "ru" ? "Магазин / Предложения" : "Store / Offers"}</th>
                  <th className="p-4">{language === "uz" ? "Bo'lib to'lash" : language === "ru" ? "Рассрочка" : "Installments"}</th>
                  <th className="p-4">{language === "uz" ? "Reyting" : language === "ru" ? "Рейтинг" : "Rating"}</th>
                  <th className="p-4 text-right">{language === "uz" ? "Amallar" : language === "ru" ? "Действия" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 dark:divide-slate-800/60">
                {products.map((item: any) => (
                  <tr key={item.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setQuickViewProduct(item)}
                          className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-slate-800 overflow-hidden shrink-0 cursor-pointer border border-[var(--line)] dark:border-slate-700"
                          title={language === "uz" ? "Tezkor ko'rish" : language === "ru" ? "Быстрый просмотр" : "Quick view"}
                        >
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-400 bg-amber-50 dark:bg-slate-800">
                              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4
                            onClick={() => setQuickViewProduct(item)}
                            className="font-bold text-slate-900 dark:text-white line-clamp-1 cursor-pointer hover:text-amber-700 dark:hover:text-amber-400 transition"
                          >
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-amber-800/70 dark:text-amber-400/80">{item.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 dark:bg-slate-800 dark:text-slate-200 border border-[var(--line)] dark:border-slate-700 rounded-lg text-[11px] font-medium bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {formatPrice(item.price, item.currency)}
                      </div>
                      {item.discount && (
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                          {item.discount}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{item.store}</span>
                      <span className="block text-[10px] text-amber-700 dark:text-amber-400 font-bold">{item.offers?.length || 1} {language === "uz" ? "ta do'kon" : language === "ru" ? ((item.offers?.length || 1) === 1 ? "магазин" : "магазина") : (item.offers?.length || 1) === 1 ? "store" : "stores"}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-[11px] px-2 py-0.5 rounded-md border bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
                        {trData(item.installment) || (language === "uz" ? "Mavjud" : language === "ru" ? "Доступно" : "Available")}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span>{item.rating || "4.8"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setQuickViewProduct(item)}
                          className="p-1.5 border border-[var(--line)] dark:border-slate-700 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-800 dark:text-slate-200 cursor-pointer shadow-2xs"
                          title={language === "uz" ? "Tezkor ko'rish" : language === "ru" ? "Быстрый просмотр" : "Quick view"}
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>
                        <a
                          href={ensureProductUrl(item.name, item.store, item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 btn-luxury-gold text-slate-950 rounded-lg font-bold text-xs transition shadow-xs"
                          title={language === "uz" ? "Do'konda xarid qilish" : language === "ru" ? "Купить в магазине" : "Buy in store"}
                        >
                          {language === "uz" ? "Xarid" : language === "ru" ? "Купить" : "Buy"}
                        </a>
                        <button
                          onClick={() => setCompareProduct(item)}
                          className="p-1.5 border border-[var(--line)] dark:border-slate-700 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer shadow-2xs"
                          title={language === "uz" ? "Taqqoslash" : language === "ru" ? "Сравнить" : "Compare"}
                        >
                          <BarChart2 className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>
                        <button
                          onClick={() => setTrackProduct(item)}
                          className="p-1.5 border border-[var(--line)] dark:border-slate-700 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer shadow-2xs"
                          title={language === "uz" ? "Narx tushishini kuzatish" : language === "ru" ? "Следить за ценой" : "Track price"}
                        >
                          <Bell className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>
                        <button
                          onClick={() => setSaveProduct(item)}
                          className="p-1.5 border border-[var(--line)] dark:border-slate-700 rounded-lg hover:bg-rose-50 text-slate-600 dark:text-slate-300 cursor-pointer shadow-2xs"
                          title={language === "uz" ? "Saqlash" : language === "ru" ? "Сохранить" : "Save"}
                        >
                          <Heart className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {compareProduct && (
        <PriceComparisonModal
          productName={compareProduct.name}
          currentPrice={compareProduct.price}
          currentStore={compareProduct.store}
          onClose={() => setCompareProduct(null)}
        />
      )}

      {/* Price Track Modal */}
      {trackProduct && (
        <PriceTrackModal
          product={trackProduct}
          onClose={() => setTrackProduct(null)}
        />
      )}

      {/* Save Modal */}
      {saveProduct && (
        <SaveProductModal
          product={saveProduct}
          onClose={() => setSaveProduct(null)}
        />
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
      </div>
    </div>
  );
}
