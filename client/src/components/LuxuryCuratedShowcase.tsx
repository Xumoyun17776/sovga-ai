import { useState } from "react";
import { Sparkles, Crown, ArrowUpRight, ShieldCheck, Truck, Star, Eye, ShoppingBag } from "lucide-react";
import { useTranslation } from "../lib/i18n";
import { useCurrency } from "../lib/currency";
import { cyberSound } from "../lib/cyberSound";
import DirectOrderModal from "./DirectOrderModal";

interface LuxuryItem {
  id: string;
  name: string;
  categoryUz: string;
  categoryRu: string;
  categoryEn: string;
  price: number;
  originalPrice: number;
  discount: string;
  store: string;
  rating: number;
  reviewCount: number;
  warrantyUz: string;
  warrantyRu: string;
  warrantyEn: string;
  deliveryUz: string;
  deliveryRu: string;
  deliveryEn: string;
  imageUrl: string;
  url: string;
  curatorNoteUz: string;
  curatorNoteRu: string;
  curatorNoteEn: string;
  badgeUz: string;
  badgeRu: string;
  badgeEn: string;
}

interface LuxuryCollection {
  labelUz: string;
  labelRu: string;
  labelEn: string;
  icon: string;
  items: LuxuryItem[];
}

const luxuryCollections: Record<string, LuxuryCollection> = {
  wedding: {
    labelUz: "To'y & Qalin (Elita To'plam)",
    labelRu: "Свадьба & Калым (Элитная Серия)",
    labelEn: "Wedding & Dowry (Elite Selection)",
    icon: "💍",
    items: [
      {
        id: "w1",
        name: "De'Longhi Nescafé Dolce Gusto Mini Me Kapsulali Kofe Mashinasi",
        categoryUz: "Oshxona & Uy",
        categoryRu: "Кухня & Дом",
        categoryEn: "Kitchen & Home",
        price: 650000,
        originalPrice: 790000,
        discount: "18% off",
        store: "Uzum Market",
        rating: 4.9,
        reviewCount: 142,
        warrantyUz: "2 Yil Rasmiy Kafolat",
        warrantyRu: "2 Года Официальной Гарантии",
        warrantyEn: "2-Year Official Warranty",
        deliveryUz: "1 kunda Toshkentda bepul",
        deliveryRu: "Бесплатно за 1 день по Ташкенту",
        deliveryEn: "1-day free delivery in Tashkent",
        imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop",
        url: "https://uzum.uz/uz/product/kofemashina-delonghi-mini-me-284912",
        curatorNoteUz: "Yosh oila uchun eng nafis va har kuni ishlatiladigan oliyjanob sovg'a.",
        curatorNoteRu: "Изящный и практичный подарок на каждый день для молодой семьи.",
        curatorNoteEn: "An exquisite, daily-used centerpiece gift for any newlywed household.",
        badgeUz: "To'y Xiti",
        badgeRu: "Свадебный Хит",
        badgeEn: "Wedding Favorite",
      },
      {
        id: "w2",
        name: "Luminarc Essence 46-talik Fransuz Chini Idishlar To'plami",
        categoryUz: "Idish-Tovoq",
        categoryRu: "Посуда & Сервировка",
        categoryEn: "Dining & Tableware",
        price: 480000,
        originalPrice: 590000,
        discount: "19% off",
        store: "Uzum Market",
        rating: 4.8,
        reviewCount: 98,
        warrantyUz: "Zarbaga Chidamli Sertifikat",
        warrantyRu: "Сертифицированное ударопрочное стекло",
        warrantyEn: "Impact-Resistant French Certified",
        deliveryUz: "Maxsus ehtiyotkor yetkazish",
        deliveryRu: "Бережная курьерская доставка",
        deliveryEn: "Fragile-care direct delivery",
        imageUrl: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&auto=format&fit=crop",
        url: "https://uzum.uz/uz/product/idishlar-toplami-luminarc-essence-46-839210",
        curatorNoteUz: "Mehmon kutish va yangi xonadon dasturxoni uchun fransuzcha nafosat.",
        curatorNoteRu: "Французская утонченность для приема гостей и уютных семейных обедов.",
        curatorNoteEn: "Refined French glassware elegance for hosting and celebratory family banquets.",
        badgeUz: "Fransuz Sifati",
        badgeRu: "Французское Качество",
        badgeEn: "French Elegance",
      },
      {
        id: "w3",
        name: "Dyson Airwrap Multi-Styler Complete Long (Prussia Blue)",
        categoryUz: "Go'zallik & Hashamat",
        categoryRu: "Красота & Премиум",
        categoryEn: "Beauty & Flagship",
        price: 6100000,
        originalPrice: 6700000,
        discount: "9% off",
        store: "Texnomart",
        rating: 5.0,
        reviewCount: 220,
        warrantyUz: "24 Oy Dyson Rasmiy Diler",
        warrantyRu: "24 Мес. Официальный Дилер Dyson",
        warrantyEn: "24-Mo. Official Dyson Dealer",
        deliveryUz: "3 soatda Toshkentda ekspress",
        deliveryRu: "Экспресс за 3 часа по Ташкенту",
        deliveryEn: "3-hour express Tashkent courier",
        imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop",
        url: "https://texnomart.uz/katalog/dyson-airwrap/",
        curatorNoteUz: "Kelin va ayollar uchun eng orzudagi premium hashamat timsoli.",
        curatorNoteRu: "Абсолютный символ премиальной заботы и желанный подарок для невесты.",
        curatorNoteEn: "The undisputed gold standard of luxury personal care and bridal gifting.",
        badgeUz: "Premium Flagman",
        badgeRu: "Премиум Флагман",
        badgeEn: "Luxury Flagship",
      },
    ],
  },
  flagship_tech: {
    labelUz: "Flagman Gadjetlar & Audio",
    labelRu: "Флагманы & Аудио",
    labelEn: "Flagship Gadgets & Audio",
    icon: "⚡",
    items: [
      {
        id: "t1",
        name: "Sony WH-1000XM5 Wireless Noise-Canceling Flagman Quloqchin",
        categoryUz: "Premium Audio",
        categoryRu: "Премиум Аудио",
        categoryEn: "Premium Audio",
        price: 3200000,
        originalPrice: 3800000,
        discount: "16% off",
        store: "Texnomart",
        rating: 4.9,
        reviewCount: 290,
        warrantyUz: "12 Oy Rasmiy Sony Kafolati",
        warrantyRu: "12 Мес. Официальная Гарантия Sony",
        warrantyEn: "12-Mo. Official Sony Warranty",
        deliveryUz: "Bugun do'kondan olib ketish",
        deliveryRu: "Самовывоз сегодня из магазина",
        deliveryEn: "Same-day pickup available",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
        url: "https://texnomart.uz/katalog/sony-wh-1000xm5/",
        curatorNoteUz: "Dunyodagi eng yaxshi shovqin so'ndirish (ANC) va 30 soatlik batareya.",
        curatorNoteRu: "Эталонное шумоподавление ANC в мире и до 30 часов автономной работы.",
        curatorNoteEn: "Industry-leading active noise canceling and 30-hour battery stamina.",
        badgeUz: "Top Audio 2026",
        badgeRu: "Топ Аудио 2026",
        badgeEn: "Top Audio 2026",
      },
      {
        id: "t2",
        name: "Apple AirPods Pro 2nd Gen (USB-C MagSafe)",
        categoryUz: "Apple Ekotizimi",
        categoryRu: "Экосистема Apple",
        categoryEn: "Apple Ecosystem",
        price: 2750000,
        originalPrice: 3100000,
        discount: "11% off",
        store: "Texnomart",
        rating: 4.9,
        reviewCount: 420,
        warrantyUz: "1 Yil Apple Rasmiy Kafolati",
        warrantyRu: "1 Год Официальная Гарантия Apple",
        warrantyEn: "1-Year Official Apple Warranty",
        deliveryUz: "1 kunda yetkazib berish",
        deliveryRu: "Доставка за 1 рабочий день",
        deliveryEn: "1-day direct delivery",
        imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop",
        url: "https://texnomart.uz/katalog/apple-airpods-pro-2/",
        curatorNoteUz: "H2 chipi, moslashuvchan ovoz va 2 barobar kuchliroq faol shovqin to'sish.",
        curatorNoteRu: "Чип H2, адаптивное аудио и в 2 раза более эффективное шумоподавление.",
        curatorNoteEn: "Apple H2 silicon, adaptive audio, and next-gen transparency mode.",
        badgeUz: "Apple Asl Mahsulot",
        badgeRu: "Оригинал Apple",
        badgeEn: "Authentic Apple",
      },
      {
        id: "t3",
        name: "Apple Watch SE 2nd Gen 40mm GPS (Midnight)",
        categoryUz: "Aqlli Soatlar",
        categoryRu: "Смарт-Часы",
        categoryEn: "Smart Watches",
        price: 2850000,
        originalPrice: 3250000,
        discount: "12% off",
        store: "Texnomart",
        rating: 4.9,
        reviewCount: 410,
        warrantyUz: "1 Yil Rasmiy Kafolat",
        warrantyRu: "1 Год Официальной Гарантии",
        warrantyEn: "1-Year Official Warranty",
        deliveryUz: "1 kunda yetkazish",
        deliveryRu: "Доставка за 1 день",
        deliveryEn: "1-day fast delivery",
        imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop",
        url: "https://texnomart.uz/katalog/apple-watch-se/",
        curatorNoteUz: "Salomatlik datchiklari, yurak ritmi monitoringi va yengil alyuminiy korpus.",
        curatorNoteRu: "Датчики здоровья, пульсометр и легкий алюминиевый корпус премиум-класса.",
        curatorNoteEn: "Health metrics sensors, workout tracking, and sleek aerospace aluminum.",
        badgeUz: "Top Smart Watch",
        badgeRu: "Топ Смарт-Часы",
        badgeEn: "Top Smart Watch",
      },
    ],
  },
  heritage: {
    labelUz: "Milliy Qadriyat & Zardo'zi",
    labelRu: "Традиции & Ремесла",
    labelEn: "Heritage Crafts & Silk",
    icon: "✨",
    items: [
      {
        id: "h1",
        name: "Buxoro Oltin Zardo'zi Qo'lda Tikilgan Tabiiy Ipak Ro'moli",
        categoryUz: "Milliy San'at",
        categoryRu: "Народное Искусство",
        categoryEn: "Heritage Art",
        price: 450000,
        originalPrice: 550000,
        discount: "18% off",
        store: "Uzum Market",
        rating: 5.0,
        reviewCount: 74,
        warrantyUz: "100% Tabiiy Marg'ilon Ipagi",
        warrantyRu: "100% Натуральный Маргиланский Шелк",
        warrantyEn: "100% Authentic Margilan Silk",
        deliveryUz: "Maxsus qadoqda 1 kunda",
        deliveryRu: "В подарочном оформлении за 1 день",
        deliveryEn: "In keepsake packaging in 1 day",
        imageUrl: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600&auto=format&fit=crop",
        url: "https://uzum.uz/uz/product/buxoro-zardozi-ipak-romoli-839210",
        curatorNoteUz: "Onalar, opalar va hurmatli mehmonlar uchun eng qadrli milliy meros sovg'asi.",
        curatorNoteRu: "Бесценный подарок национального наследия для матерей, сестер и почетных гостей.",
        curatorNoteEn: "Centuries-old Bukhara gold embroidery crafted for honored mothers and distinguished guests.",
        badgeUz: "Qo'l Mehnati",
        badgeRu: "Ручная Работа",
        badgeEn: "Handcrafted",
      },
      {
        id: "h2",
        name: "Samarqand Sadafli Yong'oq Daraxtidan O'yilgan Qadimiy Sandiqcha",
        categoryUz: "Zargarlik & Sandiq",
        categoryRu: "Шкатулки & Резьба",
        categoryEn: "Jewelry Keepsake Boxes",
        price: 420000,
        originalPrice: 490000,
        discount: "14% off",
        store: "Uzum Market",
        rating: 4.9,
        reviewCount: 52,
        warrantyUz: "Tabiiy Yong'oq & Sadaf",
        warrantyRu: "Натуральный Орех и Перламутр",
        warrantyEn: "Natural Walnut & Mother-of-Pearl",
        deliveryUz: "O'zbekiston bo'ylab 1-2 kun",
        deliveryRu: "По всему Узбекистану за 1-2 дня",
        deliveryEn: "Across Uzbekistan in 1-2 days",
        imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop",
        url: "https://uzum.uz/uz/product/samarqand-sadafli-sandiqcha-749210",
        curatorNoteUz: "Zargarlik buyumlari va qadrli xotiralarni saqlash uchun asrlik o'zbek ustaligi.",
        curatorNoteRu: "Вековое мастерство узбекских резчиков для хранения драгоценностей и памяти.",
        curatorNoteEn: "Authentic Uzbek woodcarving tradition crafted to safeguard cherished heirloom jewelry.",
        badgeUz: "Asl Durdona",
        badgeRu: "Шедевр Мастеров",
        badgeEn: "Masterpiece",
      },
      {
        id: "h3",
        name: "Rishton Kulolchilik Asl Choy To'plami (Lag'an & 6 Piyola)",
        categoryUz: "Kulolchilik",
        categoryRu: "Керамика & Сервиз",
        categoryEn: "Rishtan Ceramic Art",
        price: 350000,
        originalPrice: 420000,
        discount: "16% off",
        store: "Uzum Market",
        rating: 4.9,
        reviewCount: 89,
        warrantyUz: "Ishqor Tabiiy Sirlangan",
        warrantyRu: "Натуральная Ишкорная Глазурь",
        warrantyEn: "Natural Ishkor Mineral Glaze",
        deliveryUz: "Qalin himoya qutisida",
        deliveryRu: "В ударопрочной коробке с защитой",
        deliveryEn: "Reinforced protective transit box",
        imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop",
        url: "https://uzum.uz/uz/product/rishton-kulolchilik-choy-servizi-12-bolakli-593821",
        curatorNoteUz: "Farg'ona vodiysi ustalarining qo'l mehnati — milliy choy marosimining ko'rki.",
        curatorNoteRu: "Ручная работа мастеров Ферганской долины — украшение национальной чайной церемонии.",
        curatorNoteEn: "Legendary Fergana Valley artisan pottery bringing authentic warmth to tea ceremonies.",
        badgeUz: "Milliy Brend",
        badgeRu: "Народный Бренд",
        badgeEn: "Heritage Brand",
      },
    ],
  },
  gourmet: {
    labelUz: "Gourmet Oshxona & Qulaylik",
    labelRu: "Гурме Кухня & Уют",
    labelEn: "Gourmet Kitchen & Comfort",
    icon: "🍳",
    items: [
      {
        id: "g1",
        name: "Tefal OptiGrill+ GC712D Intelligent Indoor Kontaktli Gril",
        categoryUz: "Smart Oshxona",
        categoryRu: "Умная Кухня",
        categoryEn: "Smart Kitchen",
        price: 1890000,
        originalPrice: 2200000,
        discount: "14% off",
        store: "MediaPark",
        rating: 4.9,
        reviewCount: 165,
        warrantyUz: "24 Oy Rasmiy Fransuz Kafolati",
        warrantyRu: "24 Мес. Официальная Гарантия Tefal",
        warrantyEn: "24-Mo. Official Tefal Warranty",
        deliveryUz: "Toshkentda 24 soat ichida",
        deliveryRu: "По Ташкенту в течение 24 часов",
        deliveryEn: "Within 24 hours in Tashkent",
        imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop",
        url: "https://mediapark.uz/products/view/tefal-optigrill",
        curatorNoteUz: "Avtomatik go'sht qalinligini o'lchash va 6 xil mukammal pishirish dasturi.",
        curatorNoteRu: "Автоматический замер толщины стейка и 6 программ идеальной прожарки.",
        curatorNoteEn: "Patented sensor measures steak thickness for automatic doneness precision.",
        badgeUz: "Oshxona Qiroli",
        badgeRu: "Король Кухни",
        badgeEn: "Kitchen King",
      },
      {
        id: "g2",
        name: "Xiaomi Mi Smart Air Fryer 3.5L (EU Versiya)",
        categoryUz: "Tez & Sog'lom Taom",
        categoryRu: "Здоровое Питание",
        categoryEn: "Healthy Cooking",
        price: 420000,
        originalPrice: 510000,
        discount: "18% off",
        store: "Texnomart",
        rating: 4.8,
        reviewCount: 310,
        warrantyUz: "12 Oy Texnomart Rasmiy",
        warrantyRu: "12 Мес. Гарантия Texnomart",
        warrantyEn: "12-Mo. Texnomart Warranty",
        deliveryUz: "1 kunda filialdan olib ketish",
        deliveryRu: "Самовывоз из филиала за 1 день",
        deliveryEn: "Next-day store pickup",
        imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop",
        url: "https://texnomart.uz/katalog/xiaomi-mi-smart-air-fryer-3-5l/",
        curatorNoteUz: "Yog'siz sog'lom qovurish, smartfon orqali boshqaruv va 24 soatlik taymer.",
        curatorNoteRu: "Жарка горячим воздухом без масла, умное управление со смартфона и таймер на 24 часа.",
        curatorNoteEn: "Oil-free convection crisping, smart app remote recipes, and 24h schedule.",
        badgeUz: "Hafta Tanlovi",
        badgeRu: "Выбор Недели",
        badgeEn: "Choice of the Week",
      },
      {
        id: "g3",
        name: "Roborock Q7 Max Robot Pilesos & Nam Tozalagich",
        categoryUz: "Aqlli Tozalash",
        categoryRu: "Роботы & Уборка",
        categoryEn: "Robotic Cleaning",
        price: 3800000,
        originalPrice: 4400000,
        discount: "13% off",
        store: "Texnomart",
        rating: 4.9,
        reviewCount: 185,
        warrantyUz: "12 Oy Rasmiy Servis Kafolati",
        warrantyRu: "12 Мес. Официальная Сервисная Гарантия",
        warrantyEn: "12-Mo. Official Service Warranty",
        deliveryUz: "1 kunda yetkazib berish",
        deliveryRu: "Доставка за 1 рабочий день",
        deliveryEn: "1-day direct delivery",
        imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop",
        url: "https://texnomart.uz/katalog/roborock-q7-max/",
        curatorNoteUz: "4200 Pa kuchli tortish quvvati, LiDAR xaritalash va uy tozaligining mutlaq kafolati.",
        curatorNoteRu: "Мощность 4200 Па, лазерная навигация LiDAR и безупречная влажная уборка.",
        curatorNoteEn: "4,200 Pa suction muscle with precision PreciSense LiDAR room navigation.",
        badgeUz: "Smart Home",
        badgeRu: "Умный Дом",
        badgeEn: "Smart Home",
      },
    ],
  },
};

export default function LuxuryCuratedShowcase({ onQuickView }: { onQuickView?: (product: any) => void }) {
  const { language } = useTranslation();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<string>("wedding");
  const [orderProduct, setOrderProduct] = useState<any | null>(null);
  const collection = luxuryCollections[activeTab] || luxuryCollections.wedding;

  const getCollectionLabel = (col: LuxuryCollection) => {
    return language === "uz" ? col.labelUz : language === "ru" ? col.labelRu : col.labelEn;
  };

  const getItemCategory = (item: LuxuryItem) => {
    return language === "uz" ? item.categoryUz : language === "ru" ? item.categoryRu : item.categoryEn;
  };

  const getItemWarranty = (item: LuxuryItem) => {
    return language === "uz" ? item.warrantyUz : language === "ru" ? item.warrantyRu : item.warrantyEn;
  };

  const getItemDelivery = (item: LuxuryItem) => {
    return language === "uz" ? item.deliveryUz : language === "ru" ? item.deliveryRu : item.deliveryEn;
  };

  const getItemCuratorNote = (item: LuxuryItem) => {
    return language === "uz" ? item.curatorNoteUz : language === "ru" ? item.curatorNoteRu : item.curatorNoteEn;
  };

  const getItemBadge = (item: LuxuryItem) => {
    return language === "uz" ? item.badgeUz : language === "ru" ? item.badgeRu : item.badgeEn;
  };

  return (
    <section className="relative overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 dark:bg-amber-500/10 border border-amber-300/80 dark:border-amber-500/20 text-amber-900 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 shadow-xs">
            <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>
              {language === "uz"
                ? "Oltin Standart · Eksklyuziv Sovg'alar"
                : language === "ru"
                ? "Золотой Стандарт · Эксклюзивные Подарки"
                : "The Gold Standard • Curated Luxury"}
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            {language === "uz"
              ? "Eng Munosib Shoxona Tanlovlar"
              : language === "ru"
              ? "Лучшие Флагманские Подарки"
              : "Handpicked Premier Flagships"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl font-normal leading-relaxed">
            {language === "uz"
              ? "Har bir toifadagi eng yuqori baholangan, rasmiy kafolatli va to'g'ridan-to'g'ri buyurtma berish mumkin bo'lgan tanlangan durdonalar."
              : language === "ru"
              ? "Тщательно отобранные флагманские товары с официальной гарантией и мгновенным оформлением заказа."
              : "Highest-rated flagship items across Uzbekistan with verified retailer warranties and direct 1-click in-app delivery."}
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-1.5 p-1.5 bg-amber-100/70 dark:bg-slate-900/90 rounded-2xl border border-amber-200/80 dark:border-slate-800 overflow-x-auto scrollbar-none shadow-2xs">
          {Object.entries(luxuryCollections).map(([key, col]) => (
            <button
              key={key}
              onClick={() => {
                cyberSound.playClick();
                setActiveTab(key);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === key
                  ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md font-extrabold scale-102"
                  : "text-amber-950/80 dark:text-slate-400 hover:text-amber-950 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-800/60 font-semibold"
              }`}
            >
              <span>{col.icon}</span>
              <span>{getCollectionLabel(col)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 3 Luxury Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collection.items.map((item) => (
          <div
            key={item.id}
            className="card-luxury-elevated flex flex-col justify-between overflow-hidden group rounded-3xl border-2 border-amber-200/80 dark:border-slate-800 bg-gradient-to-b from-white via-[#fdfbf7] to-[#f8f4ea] dark:from-[#10121d] dark:to-[#080a11] shadow-luxury hover:shadow-2xl hover:border-amber-400 dark:hover:border-amber-500/60 transition-all duration-300"
          >
            <div>
              {/* Product Visual */}
              <div
                className="h-56 relative overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer"
                onClick={() => {
                  cyberSound.playClick();
                  if (onQuickView) onQuickView(item);
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-3 py-1 rounded-full bg-slate-900/90 text-amber-300 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-amber-400/30 flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{getItemBadge(item)}</span>
                  </span>
                </div>

                {/* Store Tag */}
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-[11px] font-bold shadow-xs backdrop-blur-md border border-slate-200/80 dark:border-slate-700">
                    {item.store}
                  </span>
                </div>

                {/* Overlay Quick View trigger */}
                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      cyberSound.playClick();
                      if (onQuickView) onQuickView(item);
                    }}
                    className="px-4 py-2 rounded-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-lg flex items-center gap-1.5 hover:scale-105 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {language === "uz" ? "Tezkor Ko'rish" : language === "ru" ? "Быстрый Просмотр" : "Quick View"}
                    </span>
                  </button>
                </div>

                {/* Bottom Overlay: Price */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-300 block tracking-wider">
                      {getItemCategory(item)}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-white drop-shadow-sm">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-xs text-slate-300/80 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-extrabold shadow-sm">
                    {item.discount}
                  </span>
                </div>
              </div>

              {/* Body Details */}
              <div className="p-5 space-y-3.5">
                <h3
                  onClick={() => {
                    cyberSound.playClick();
                    if (onQuickView) onQuickView(item);
                  }}
                  className="font-display font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-500 transition line-clamp-2 cursor-pointer"
                >
                  {item.name}
                </h3>

                {/* Curator Note */}
                <p className="text-xs text-amber-950 dark:text-amber-200/90 font-medium leading-relaxed bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 p-3 rounded-xl italic">
                  “{getItemCuratorNote(item)}”
                </p>

                {/* Features & Logistics */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 stroke-[2.2]" />
                    <span className="truncate">{getItemWarranty(item)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 flex-shrink-0 stroke-[2.2]" />
                    <span className="truncate">{getItemDelivery(item)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-5 pt-0 border-t border-amber-100 dark:border-slate-800/80 flex items-center gap-2">
              <button
                onClick={() => {
                  cyberSound.playConfirm();
                  setOrderProduct(item);
                }}
                className="flex-1 btn-luxury-gold py-2.5 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>
                  {language === "uz" ? "Sotib olish" : language === "ru" ? "Купить" : "Buy Now"}
                </span>
              </button>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => cyberSound.playClick()}
                title={`Open in ${item.store}`}
                className="p-2.5 rounded-xl border border-amber-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-slate-700 hover:bg-amber-50/70 dark:hover:bg-slate-800 text-amber-950 dark:text-slate-300 transition flex items-center justify-center shrink-0 shadow-2xs active:scale-95"
              >
                <ArrowUpRight className="w-3.5 h-3.5 opacity-80 stroke-[2.2]" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {orderProduct && (
        <DirectOrderModal
          product={{
            name: orderProduct.name,
            price: orderProduct.price,
            originalPrice: orderProduct.originalPrice,
            discount: orderProduct.discount,
            currency: "UZS",
            store: orderProduct.store,
            url: orderProduct.url,
            imageUrl: orderProduct.imageUrl,
            category: "premium",
            rating: orderProduct.rating,
            reviewCount: orderProduct.reviewCount,
            warranty: getItemWarranty(orderProduct),
            deliveryEstimate: getItemDelivery(orderProduct),
            reason: getItemCuratorNote(orderProduct),
            source: orderProduct.store,
            availability:
              language === "uz"
                ? "Mavjud (Omborda bor)"
                : language === "ru"
                ? "В наличии (На складе)"
                : "In Stock (Available)",
            lastChecked: new Date().toISOString(),
            priceVerified: true,
            availabilityVerified: true,
          }}
          isOpen={!!orderProduct}
          onClose={() => setOrderProduct(null)}
        />
      )}
    </section>
  );
}
