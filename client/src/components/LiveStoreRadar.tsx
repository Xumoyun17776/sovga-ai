import { useState } from "react";
import { Store, ShoppingBag, Cpu, Smartphone, BookOpen, Tag, ArrowUpRight, Zap, CheckCircle2, Clock, ShieldCheck } from "../lib/icons";
import { useTranslation } from "../lib/i18n";

interface RetailerData {
  id: string;
  name: string;
  taglineUz: string;
  taglineRu: string;
  taglineEn: string;
  icon: any;
  accentColor: string;
  badgeUz: string;
  badgeRu: string;
  badgeEn: string;
  deliverySpeedUz: string;
  deliverySpeedRu: string;
  deliverySpeedEn: string;
  warrantyUz: string;
  warrantyRu: string;
  warrantyEn: string;
  installmentUz: string;
  installmentRu: string;
  installmentEn: string;
  coverageUz: string;
  coverageRu: string;
  coverageEn: string;
  popularSearches: { query: string; url: string }[];
  officialUrl: string;
}

const retailers: RetailerData[] = [
  {
    id: "uzum",
    name: "Uzum Market",
    taglineUz: "O'zbekistondagi eng yirik milliy marketpleys",
    taglineRu: "Крупнейший национальный маркетплейс в Узбекистане",
    taglineEn: "Uzbekistan's largest domestic e-commerce marketplace",
    icon: ShoppingBag,
    accentColor: "from-purple-600 to-indigo-600",
    badgeUz: "1 Kunda Bepul PVZ",
    badgeRu: "1 День Бесплатно в ПВЗ",
    badgeEn: "Next-Day Free Pickup",
    deliverySpeedUz: "Ertaga Toshkent & 500+ shahar punktlariga",
    deliverySpeedRu: "Завтра в Ташкент и 500+ пунктов выдачи",
    deliverySpeedEn: "Next day to Tashkent & 500+ pickup hubs",
    warrantyUz: "14 kun qaytarish kafolati",
    warrantyRu: "14 дней гарантия возврата",
    warrantyEn: "14-day hassle-free return policy",
    installmentUz: "Uzum Nasiya (3, 6, 12 oy)",
    installmentRu: "Uzum Nasiya (3, 6, 12 мес)",
    installmentEn: "Uzum Nasiya (3, 6, 12 months)",
    coverageUz: "500+ Tarqatish punkti (PVZ)",
    coverageRu: "500+ Пунктов выдачи (ПВЗ)",
    coverageEn: "500+ Regional pickup points",
    popularSearches: [
      { query: "Redmi A3", url: "https://uzum.uz/uz/product/smartfon-xiaomi-redmi-a3-1123490" },
      { query: "iPhone 16 Pro Max", url: "https://uzum.uz/uz/product/iphone-16-pro-max-smartfon-1930096?skuId=6807599" },
      { query: "AirPods Pro 2", url: "https://uzum.uz/uz/product/apple-airpods-pro-2-type-c-1029481" },
      { query: "MacBook Air", url: "https://uzum.uz/uz/product/macbook-air-m4m3m2-136-16-gb256-1834151" },
    ],
    officialUrl: "https://uzum.uz/uz/product/smartfon-xiaomi-redmi-a3-1123490",
  },
  {
    id: "texnomart",
    name: "Texnomart",
    taglineUz: "Maishiy texnika va smartfonlar rasmiy dileri",
    taglineRu: "Официальный дилер бытовой техники и смартфонов",
    taglineEn: "Authorized electronics and appliance retailer",
    icon: Cpu,
    accentColor: "from-rose-600 to-red-600",
    badgeUz: "3 Soatda Toshkentda",
    badgeRu: "За 3 часа в Ташкенте",
    badgeEn: "3-Hour Express Tashkent",
    deliverySpeedUz: "Toshkentda 3 soatlik tezkor yetkazish",
    deliverySpeedRu: "Экспресс-доставка за 3 часа по Ташкенту",
    deliverySpeedEn: "3-hour express courier delivery in Tashkent",
    warrantyUz: "1-3 yil rasmiy ishlab chiqaruvchi kafolati",
    warrantyRu: "1-3 года официальной гарантии производителя",
    warrantyEn: "1-3 years official manufacturer warranty",
    installmentUz: "Texnomart Muddatli to'lov (12-24 oy, 0% foiz)",
    installmentRu: "Рассрочка Texnomart (12-24 мес, 0%)",
    installmentEn: "Texnomart Installments (12-24 mos, 0% markup)",
    coverageUz: "35+ Katta rasmiy do'konlar",
    coverageRu: "35+ Флагманских магазинов",
    coverageEn: "35+ Flagship retail branches",
    popularSearches: [
      { query: "Redmi A3", url: "https://texnomart.uz/katalog/redmi-a3/" },
      { query: "Samsung VC18M", url: "https://texnomart.uz/product/detail/80149/" },
      { query: "Samsung A55", url: "https://texnomart.uz/product/detail/80149/" },
      { query: "Smartfonlar", url: "https://texnomart.uz/katalog/smartfonlar" },
    ],
    officialUrl: "https://texnomart.uz/katalog/redmi-a3/",
  },
  {
    id: "mediapark",
    name: "MediaPark",
    taglineUz: "Eng katta maishiy texnika gipermarketlari",
    taglineRu: "Крупнейшие гипермаркеты бытовой техники",
    taglineEn: "Premier nationwide consumer electronics hypermarkets",
    icon: Smartphone,
    accentColor: "from-emerald-600 to-teal-600",
    badgeUz: "24 Soatda Yetkazish",
    badgeRu: "Доставка за 24 часа",
    badgeEn: "24-Hour Delivery",
    deliverySpeedUz: "Toshkentda 24 soat ichida eshikkacha",
    deliverySpeedRu: "До двери в течение 24 часов в Ташкенте",
    deliverySpeedEn: "Doorstep courier in Tashkent within 24 hours",
    warrantyUz: "Rasmiy servis markazlari kafolati",
    warrantyRu: "Гарантия официальных сервисных центров",
    warrantyEn: "Official manufacturer service center warranty",
    installmentUz: "Uzum Nasiya, Alif va Anorbank",
    installmentRu: "Uzum Nasiya, Alif и Anorbank",
    installmentEn: "Uzum Nasiya, Alif and Anorbank",
    coverageUz: "28+ Gipermarketlar tarmog'i",
    coverageRu: "28+ Гипермаркетов по стране",
    coverageEn: "28+ Nationwide hypermarket chain",
    popularSearches: [
      { query: "Artel Choynak", url: "https://mediapark.uz/uz/products/view/elektr-choynak-artel-art-ke-7499-39" },
      { query: "Smartfonlar", url: "https://mediapark.uz/uz/products/view/elektr-choynak-artel-art-ke-7499-39" },
      { query: "Blender va mikser", url: "https://mediapark.uz/uz/products/view/elektr-choynak-artel-art-ke-7499-39" },
      { query: "Elektr choynak", url: "https://mediapark.uz/uz/products/view/elektr-choynak-artel-art-ke-7499-39" },
    ],
    officialUrl: "https://mediapark.uz/uz/products/view/elektr-choynak-artel-art-ke-7499-39",
  },
  {
    id: "asaxiy",
    name: "Asaxiy.uz",
    taglineUz: "Kitoblar, texnika va intellektual sovg'alar",
    taglineRu: "Книги, электроника и интеллектуальные подарки",
    taglineEn: "Books, electronics & intellectual lifestyle gifts",
    icon: BookOpen,
    accentColor: "from-sky-600 to-blue-600",
    badgeUz: "O'zbekiston Bo'ylab",
    badgeRu: "По всему Узбекистану",
    badgeEn: "Nationwide Shipping",
    deliverySpeedUz: "Toshkentda 1 kun / viloyatlarga BTS orqali",
    deliverySpeedRu: "1 день по Ташкенту / регионы через BTS",
    deliverySpeedEn: "1 day in Tashkent / provinces via BTS Express",
    warrantyUz: "1 yil rasmiy dilerlik kafolati",
    warrantyRu: "1 год официальной дилерской гарантии",
    warrantyEn: "1-year official dealer guarantee",
    installmentUz: "Asaxiy Nasiya, ZoodPay",
    installmentRu: "Asaxiy Nasiya, ZoodPay",
    installmentEn: "Asaxiy Nasiya, ZoodPay",
    coverageUz: "22+ Qabul punktlari",
    coverageRu: "22+ Пункта выдачи",
    coverageEn: "22+ Pickup branches",
    popularSearches: [
      { query: "iPhone 15 Pro", url: "https://asaxiy.uz/product/smartfon-iphone-15-pro-128gb-chernyy-titan" },
      { query: "Samsung S24 Ultra", url: "https://asaxiy.uz/product/smartfon-samsung-galaxy-s24-ultra-12256gb-seryy-titan" },
      { query: "MacBook Pro M4", url: "https://asaxiy.uz/product/noutbuk-apple-macbook-pro-16-m4-max-48gb512gb-silver" },
      { query: "AirPods 3", url: "https://asaxiy.uz/product/besprovodnye-naushniki-apple-airpods-3" },
    ],
    officialUrl: "https://asaxiy.uz/product/smartfon-iphone-15-pro-128gb-chernyy-titan",
  },
  {
    id: "olcha",
    name: "Olcha.uz",
    taglineUz: "Smartfonlar, gadjetlar va rasmiy texnika yetakchisi",
    taglineRu: "Лидер по смартфонам, гаджетам и официальной технике",
    taglineEn: "Leading marketplace for smartphones, gadgets & tech",
    icon: Smartphone,
    accentColor: "from-rose-600 to-red-600",
    badgeUz: "Smartfonlar & Nasiya",
    badgeRu: "Смартфоны и Рассрочка",
    badgeEn: "Smartphones & Installments",
    deliverySpeedUz: "Toshkentda 1 kun / Viloyatlarga 1-3 kun",
    deliverySpeedRu: "1 день по Ташкенту / 1-3 дня по регионам",
    deliverySpeedEn: "1 day in Tashkent / 1-3 days across regions",
    warrantyUz: "12-24 oy to'liq rasmiy brend kafolati",
    warrantyRu: "12-24 месяца официальной гарантии",
    warrantyEn: "12-24 months official manufacturer warranty",
    installmentUz: "Olcha Nasiya 0% foizsiz to'lov",
    installmentRu: "Olcha Nasiya беспроцентная рассрочка",
    installmentEn: "Olcha Nasiya 0% installments",
    coverageUz: "Toshkent va butun O'zbekiston viloyatlari",
    coverageRu: "Ташкент и все регионы Узбекистана",
    coverageEn: "Tashkent and all Uzbekistan regions",
    popularSearches: [
      { query: "iPhone 16 Pro Max", url: "https://olcha.uz/oz/product/view/apple-iphone-16-pro-max-256gb-desert-titanium" },
      { query: "Samsung S24 Ultra", url: "https://olcha.uz/oz/product/view/samsung-galaxy-s24-ultra-12256gb" },
      { query: "Redmi Note 13 Pro", url: "https://olcha.uz/oz/product/view/xiaomi-redmi-note-13-pro-8256gb" },
      { query: "Dyson Airwrap", url: "https://olcha.uz/oz/product/view/stayler-dyson-airwrap-complete-long" },
    ],
    officialUrl: "https://olcha.uz",
  },
  {
    id: "idea",
    name: "Idea Store",
    taglineUz: "Respublika bo'ylab noutbuklar va maishiy texnika",
    taglineRu: "Ноутбуки и бытовая техника по всей республике",
    taglineEn: "Laptops and smart appliances nationwide",
    icon: Store,
    accentColor: "from-amber-500 to-amber-600",
    badgeUz: "Rasmiy Kafolat",
    badgeRu: "Официальная Гарантия",
    badgeEn: "Official Warranty",
    deliverySpeedUz: "Kuryer orqali xavfsiz yetkazish",
    deliverySpeedRu: "Безопасная курьерская доставка",
    deliverySpeedEn: "Secure courier delivery",
    warrantyUz: "Rasmiy 1-2 yillik brend kafolati",
    warrantyRu: "Официальная гарантия бренда 1-2 года",
    warrantyEn: "1-2 year authorized brand guarantee",
    installmentUz: "ZoodPay, Anorbank, Uzum Nasiya",
    installmentRu: "ZoodPay, Anorbank, Uzum Nasiya",
    installmentEn: "ZoodPay, Anorbank, Uzum Nasiya",
    coverageUz: "Toshkent va viloyatlar bo'ylab",
    coverageRu: "По Ташкенту и областям",
    coverageEn: "Tashkent and all regional centers",
    popularSearches: [
      { query: "Dior Sauvage", url: "https://uzum.uz/uz/product/atir-dior-sauvage-edp-100ml-1284910" },
      { query: "KitchenAid Classic", url: "https://idea.uz/products/kitchenaid-classic" },
      { query: "Sony Quloqchin", url: "https://idea.uz/products/sony-wh-1000xm5" },
      { query: "Braun Ustara", url: "https://idea.uz/products/braun-series-9" },
    ],
    officialUrl: "https://idea.uz/products/kitchenaid-classic",
  },
];

export default function LiveStoreRadar() {
  const { language } = useTranslation();
  const [selectedId, setSelectedId] = useState<string>("uzum");
  const current = retailers.find((r) => r.id === selectedId) || retailers[0];

  const currentTagline = language === "uz" ? current.taglineUz : language === "ru" ? current.taglineRu : current.taglineEn;
  const currentBadge = language === "uz" ? current.badgeUz : language === "ru" ? current.badgeRu : current.badgeEn;
  const currentDelivery = language === "uz" ? current.deliverySpeedUz : language === "ru" ? current.deliverySpeedRu : current.deliverySpeedEn;
  const currentWarranty = language === "uz" ? current.warrantyUz : language === "ru" ? current.warrantyRu : current.warrantyEn;
  const currentInstallment = language === "uz" ? current.installmentUz : language === "ru" ? current.installmentRu : current.installmentEn;
  const currentCoverage = language === "uz" ? current.coverageUz : language === "ru" ? current.coverageRu : current.coverageEn;

  return (
    <section className="relative overflow-hidden">
      <div className="card-luxury-elevated p-6 sm:p-9 bg-white border border-slate-200">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-slate-900">
              {language === "uz"
                ? "O'zbekiston Retail Gigantlari Bilan To'g'ridan-To'g'ri Aloqa"
                : language === "ru"
                ? "Прямая Интеграция с Ритейл-Гигантами Узбекистана"
                : "Direct Integration with Uzbekistan's Retail Giants"}
            </h2>
          </div>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 self-start sm:self-auto bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              {language === "uz"
                ? "6 ta Do'kon Jonli Ulangan"
                : language === "ru"
                ? "6 Магазинов Подключено"
                : "6 Verified Stores Live"}
            </span>
          </span>
        </div>

        {/* Store Selection Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">
          {retailers.map((r) => {
            const isSelected = r.id === selectedId;
            const Icon = r.icon;
            const badge = language === "uz" ? r.badgeUz : language === "ru" ? r.badgeRu : r.badgeEn;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-102"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-slate-500"}`} />
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600"}`}>
                    {badge.split(" ")[0]}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-xs truncate">{r.name}</p>
                  <p className={`text-[10px] truncate ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                    {badge}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Retailer Deep-Dive Panel */}
        <div className="bg-white dark:bg-[#0b1224] p-6 rounded-2xl border border-slate-200/80 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-xl text-slate-900">{current.name}</h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {currentBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentTagline}</p>
            </div>

            <a
              href={current.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-luxury-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start md:self-auto shadow-sm"
            >
              <span>
                {language === "uz"
                  ? `${current.name} Bosh Sahifasi`
                  : language === "ru"
                  ? `Главная ${current.name}`
                  : `${current.name} Official Page`}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>{language === "uz" ? "Yetkazib Berish:" : language === "ru" ? "Доставка:" : "Delivery:"}</span>
              </div>
              <p className="font-bold text-slate-800 text-xs">{currentDelivery}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === "uz" ? "Rasmiy Kafolat:" : language === "ru" ? "Официальная Гарантия:" : "Official Warranty:"}</span>
              </div>
              <p className="font-bold text-slate-800 text-xs">{currentWarranty}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === "uz" ? "Bo'lib To'lash (Nasiya):" : language === "ru" ? "Рассрочка (Насия):" : "Installment Plans:"}</span>
              </div>
              <p className="font-bold text-slate-800 text-xs">{currentInstallment}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>{language === "uz" ? "Tarmoq Qamrovi:" : language === "ru" ? "Охват Сети:" : "Store Network:"}</span>
              </div>
              <p className="font-bold text-slate-800 text-xs">{currentCoverage}</p>
            </div>
          </div>

          {/* One-Click Direct Shopping Queries */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 block mb-2.5">
              {language === "uz"
                ? `${current.name}da 1 marta bosish bilan to'g'ridan-to'g'ri ochiladigan toifalar:`
                : language === "ru"
                ? `Быстрый переход к популярным товарам в ${current.name}:`
                : `Direct 1-click popular categories on ${current.name}:`}
            </span>
            <div className="flex flex-wrap gap-2">
              {current.popularSearches.map((ps, idx) => (
                <a
                  key={idx}
                  href={ps.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-900 text-slate-800 hover:text-white border border-slate-200 hover:border-slate-900 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs group"
                >
                  <span>{ps.query}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
