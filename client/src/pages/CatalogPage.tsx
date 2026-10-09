import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "../lib/i18n";
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
} from "lucide-react";

export default function CatalogPage() {
  const { language } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStore, setSelectedStore] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("discount");
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
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] py-8 transition-colors relative overflow-hidden">
      {/* Ambient luxury vignette glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1100px,100vw)] h-[380px] bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in relative z-10">
      {/* Header Banner - Obsidian Ultra Luxury */}
      <div className="card-obsidian rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 stroke-[2.2]" />
            <span>
              {language === "uz"
                ? "10,000+ Tasdiqlangan Mahsulot & 30,000+ Real Do'kon Takliflari"
                : language === "ru"
                ? "10,000+ Проверенных Товаров & 30,000+ Реальных Цен"
                : "10,000+ Verified Products & 30,000+ Real Store Offers"}
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            {language === "uz" ? "O'zbekiston Do'konlari" : language === "ru" ? "Магазины Узбекистана" : "Uzbekistan Retailers"} <br />
            <span className="gold-shimmer-badge px-3 py-0.5 rounded-2xl text-slate-900 inline-block mt-1">
              {language === "uz" ? "Jonli Narxlar Katalogi" : language === "ru" ? "Каталог Живых Цен" : "Live Pricing Catalog"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {language === "uz"
              ? "Barcha tovarlar narxi Uzum Market, Texnomart, MediaPark, Idea Store va Toshkentdagi dilerlik do'konlarida muntazam tekshiriladi va 30 kunlik narxlar dinamikasi bilan taqdim etiladi."
              : language === "ru"
              ? "Цены на все товары регулярно проверяются в Uzum Market, Texnomart, MediaPark, Idea Store и дилерских магазинах Ташкента с 30-дневной динамикой цен."
              : "All product prices are verified daily across Uzum Market, Texnomart, MediaPark, Idea Store, and official Tashkent dealerships with 30-day dynamic price curves."}
          </p>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer active:scale-95 ${
            selectedCategory === "All"
              ? "btn-luxury-gold shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-700 border border-amber-200/80 dark:border-slate-700 shadow-2xs"
          }`}
        >
          <Layers className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>{language === "uz" ? "Barcha toifalar" : language === "ru" ? "Все категории" : "All Categories"}</span>
        </button>

        {categories.map((c) => (
          <button
            key={c.name}
            onClick={() => setSelectedCategory(c.name)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer active:scale-95 ${
              selectedCategory === c.name
                ? "btn-luxury-gold shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-700 border border-amber-200/80 dark:border-slate-700 shadow-2xs"
            }`}
          >
            <span>{c.name}</span>
            <span className="text-[11px] opacity-70">({c.count})</span>
          </button>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card-luxury bg-gradient-to-b from-white via-[#fcfaf5] to-[#f7f2e4] dark:from-[#10121d] dark:to-[#080a11] rounded-3xl p-4 sm:p-5 border-2 border-amber-200/80 dark:border-slate-800 shadow-luxury flex flex-col md:flex-row items-center gap-3">
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
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium transition"
          />
        </div>

        {/* Store selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 flex-1 md:flex-initial cursor-pointer"
          >
            <option value="All">{language === "uz" ? "Barcha Do'konlar" : language === "ru" ? "Все Магазины" : "All Stores"}</option>
            <option value="Uzum">Uzum Market</option>
            <option value="Olcha">Olcha.uz</option>
            <option value="Texnomart">Texnomart</option>
            <option value="MediaPark">MediaPark</option>
            <option value="Idea">Idea Store</option>
            <option value="iStore">iStore Tashkent</option>
            <option value="Craft Bazaar">Craft Bazaar (Hunarmand)</option>
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 flex-1 md:flex-initial cursor-pointer"
          >
            <option value="discount">{language === "uz" ? "Eng katta chegirma %" : language === "ru" ? "Самая большая скидка %" : "Biggest Discount %"}</option>
            <option value="price_asc">{language === "uz" ? "Eng arzonidan boshlab" : language === "ru" ? "Сначала недорогие" : "Lowest Price First"}</option>
            <option value="price_desc">{language === "uz" ? "Eng qimmatidan boshlab" : language === "ru" ? "Сначала премиальные" : "Highest Price First"}</option>
            <option value="rating">{language === "uz" ? "Mijozlar reytingi bo'yicha" : language === "ru" ? "По рейтингу покупателей" : "Top Customer Rating"}</option>
          </select>

          {/* Grid vs Table Toggle */}
          <div className="flex items-center bg-amber-100/70 dark:bg-slate-800/80 p-1 rounded-2xl border border-amber-300/70 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition cursor-pointer active:scale-95 ${
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
              className={`p-2 rounded-xl transition cursor-pointer active:scale-95 ${
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
        <div className="card-luxury bg-gradient-to-b from-white via-[#fcfaf5] to-[#f7f2e4] dark:from-[#10121d] dark:to-[#080a11] rounded-3xl p-12 text-center border-2 border-amber-200/80 dark:border-slate-800 max-w-md mx-auto space-y-4 shadow-luxury">
          <div className="w-16 h-16 icon-medallion icon-box-gold rounded-2xl flex items-center justify-center mx-auto text-amber-800 dark:text-amber-300">
            <ShoppingBag className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-lg">
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
            className="px-5 py-2.5 btn-luxury-gold text-slate-950 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
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
                className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f7f2e4] dark:from-[#12141f] dark:to-[#0a0c14] rounded-3xl border-2 border-amber-200/80 dark:border-slate-800 overflow-hidden shadow-luxury hover:border-amber-400 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Image container */}
                  <div
                    onClick={() => setQuickViewProduct(item)}
                    className="h-48 bg-amber-50/50 dark:bg-slate-900/50 relative overflow-hidden cursor-pointer"
                    title="Tezkor ko'rish"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-300/80 dark:text-slate-600 bg-amber-50/40 dark:bg-slate-900">
                        <ShoppingBag className="w-10 h-10 stroke-[1.25]" />
                      </div>
                    )}

                    {/* Discount badge */}
                    {item.discount && (
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs">
                        {item.discount}
                      </span>
                    )}

                    {/* Category tag */}
                    <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/20">
                      {item.category}
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
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white">
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
                        <span className="flex items-center gap-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-amber-100/70 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-amber-200/70 dark:border-slate-700">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
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
                      <div className="text-xs bg-amber-50/70 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-amber-200/60 dark:border-slate-700 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                          <span>{language === "uz" ? "Do'kon:" : language === "ru" ? "Магазин:" : "Store:"} <strong className="text-slate-900 dark:text-white">{item.store}</strong></span>
                          <span className="text-amber-700 dark:text-amber-400 font-bold">{item.offers.length} {language === "uz" ? "do'kon" : language === "ru" ? "магазина" : "stores"}</span>
                        </div>
                        {item.installment && (
                          <p className="text-[10px] text-slate-700 dark:text-slate-300 font-medium truncate flex items-center gap-1.5">
                            <CreditCard className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 stroke-[2.2]" />
                            <span>{item.installment}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 sm:p-5 pt-0 border-t border-amber-200/60 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-1.5 pt-2">
                    <button
                      onClick={() => setQuickViewProduct(item)}
                      title={language === "uz" ? "Tezkor ko'rish va Nasiya kalkulyatori" : language === "ru" ? "Быстрый просмотр и калькулятор рассрочки" : "Quick view & installment calculator"}
                      className="w-9 h-9 flex items-center justify-center border border-amber-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition text-slate-600 dark:text-slate-300 cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Eye className="w-4 h-4 stroke-[2.2]" />
                    </button>

                    <a
                      href={ensureProductUrl(item.name, item.store, item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 btn-luxury-gold text-slate-950 text-xs font-black rounded-xl transition shadow-xs active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>{item.store?.split(" ")[0] || (language === "uz" ? "Do'konda" : language === "ru" ? "В магазин" : "Store")}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-80 stroke-[2.2]" />
                    </a>

                    <button
                      onClick={() => setCompareProduct(item)}
                      title={language === "uz" ? "Do'kon narxlarini taqqoslash" : language === "ru" ? "Сравнить цены магазинов" : "Compare store prices"}
                      className="w-9 h-9 flex items-center justify-center border border-amber-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition text-slate-600 dark:text-slate-300 cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <BarChart2 className="w-4 h-4 stroke-[2.2]" />
                    </button>

                    <button
                      onClick={() => setTrackProduct(item)}
                      title={language === "uz" ? "Narx tushishini kuzatish" : language === "ru" ? "Следить за падением цены" : "Set price drop alert"}
                      className="w-9 h-9 flex items-center justify-center border border-amber-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition text-slate-600 dark:text-slate-300 cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Bell className="w-4 h-4 stroke-[2.2]" />
                    </button>

                    <button
                      onClick={() => setSaveProduct(item)}
                      title={language === "uz" ? "Istaklarga saqlash" : language === "ru" ? "Сохранить в желания" : "Save to Wishlist"}
                      className="w-9 h-9 flex items-center justify-center border border-amber-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 transition text-slate-600 dark:text-slate-300 cursor-pointer active:scale-95 shadow-2xs"
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
        <div className="bg-white dark:bg-[#10121d] rounded-3xl border-2 border-amber-200/80 dark:border-slate-800 overflow-hidden shadow-luxury animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-amber-50/80 dark:bg-slate-800/70 border-b border-amber-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
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
                          className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-slate-800 overflow-hidden shrink-0 cursor-pointer border border-amber-200/60 dark:border-slate-700"
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
                      <span className="px-2.5 py-1 bg-amber-100/70 dark:bg-slate-800 text-amber-950 dark:text-slate-200 border border-amber-200/60 dark:border-slate-700 rounded-lg text-[11px] font-medium">
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
                      <span className="block text-[10px] text-amber-700 dark:text-amber-400 font-bold">{item.offers?.length || 1} {language === "uz" ? "ta do'kon" : language === "ru" ? "магазина" : "stores"}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-purple-800 dark:text-purple-300 font-medium text-[11px] bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200/80 dark:border-purple-800/60">
                        {item.installment || (language === "uz" ? "Mavjud" : language === "ru" ? "Доступно" : "Available")}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{item.rating || "4.8"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setQuickViewProduct(item)}
                          className="p-1.5 border border-amber-200/80 dark:border-slate-700 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-800 dark:text-slate-200 cursor-pointer active:scale-95 shadow-2xs"
                          title={language === "uz" ? "Tezkor ko'rish" : language === "ru" ? "Быстрый просмотр" : "Quick view"}
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>
                        <a
                          href={ensureProductUrl(item.name, item.store, item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 btn-luxury-gold text-slate-950 rounded-lg font-black text-xs transition shadow-xs active:scale-95"
                          title={language === "uz" ? "Do'konda xarid qilish" : language === "ru" ? "Купить в магазине" : "Buy in store"}
                        >
                          {language === "uz" ? "Xarid" : language === "ru" ? "Купить" : "Buy"}
                        </a>
                        <button
                          onClick={() => setCompareProduct(item)}
                          className="p-1.5 border border-amber-200/80 dark:border-slate-700 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer active:scale-95 shadow-2xs"
                          title={language === "uz" ? "Taqqoslash" : language === "ru" ? "Сравнить" : "Compare"}
                        >
                          <BarChart2 className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>
                        <button
                          onClick={() => setTrackProduct(item)}
                          className="p-1.5 border border-amber-200/80 dark:border-slate-700 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer active:scale-95 shadow-2xs"
                          title={language === "uz" ? "Narx tushishini kuzatish" : language === "ru" ? "Следить за ценой" : "Track price"}
                        >
                          <Bell className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>
                        <button
                          onClick={() => setSaveProduct(item)}
                          className="p-1.5 border border-amber-200/80 dark:border-slate-700 rounded-lg hover:bg-rose-50 text-slate-600 dark:text-slate-300 cursor-pointer active:scale-95 shadow-2xs"
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
