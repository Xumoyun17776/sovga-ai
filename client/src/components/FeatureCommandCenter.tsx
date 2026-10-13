import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { cyberSound } from "../lib/cyberSound";
import {
  ShieldAlert,
  Swords,
  Truck,
  Sparkles,
  Box,
  HelpCircle,
  Users,
  Gift,
  PackageCheck,
  PenTool,
  BookOpen,
  Heart,
  ShieldCheck,
  Wallet,
  Star,
  ArrowRight,
  SlidersHorizontal,
  Compass,
  Search,
  X,
  Info,
  CheckCircle2,
  Flame,
  ExternalLink,
  ChevronRight,
  Zap,
  Command,
  DollarSign,
} from "../lib/icons";

export type FeatureCategory = "all" | "ai_tools" | "games" | "luxury" | "fintech";

export interface FeatureItem {
  id: string;
  category: "ai_tools" | "games" | "luxury" | "fintech";
  titleUz: string;
  titleRu: string;
  titleEn: string;
  descUz: string;
  descRu: string;
  descEn: string;
  badgeUz: string;
  badgeRu: string;
  badgeEn: string;
  statusUz: string;
  statusRu: string;
  statusEn: string;
  statusColor: string;
  icon: any;
  iconGradient: string;
  iconColor: string;
  route: string;
  actionUz: string;
  actionRu: string;
  actionEn: string;
  simulatorTab?: string;
  highlightsUz: string[];
  highlightsRu: string[];
  highlightsEn: string[];
  targetUz: string;
  targetRu: string;
  targetEn: string;
}

const FEATURE_TILES = ["tile-gold", "tile-rose", "tile-violet", "tile-sky", "tile-emerald", "tile-orange", "tile-indigo", "tile-pink", "tile-teal"];

const featuresList: FeatureItem[] = [
  // ── 1. AI & MARKET INTELLIGENCE ──
  {
    id: "spotlight-console",
    category: "ai_tools",
    titleUz: "Tez qidiruv",
    titleRu: "Быстрый поиск",
    titleEn: "Quick search",
    descUz: "Istalgan vosita, sahifa yoki do'konni bir joydan toping. Klaviaturada Ctrl+K ni bosing.",
    descRu: "Найдите любой инструмент, страницу или магазин из одного окна. Нажмите Ctrl+K.",
    descEn: "Jump to any tool, page or store from one place. Press Ctrl+K on a keyboard.",
    badgeUz: "Navigatsiya",
    badgeRu: "Навигация",
    badgeEn: "Navigation",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Command,
    iconGradient: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-500",
    route: "action:command-palette",
    actionUz: "Ochish",
    actionRu: "Открыть",
    actionEn: "Open",
    highlightsUz: [
      "Klaviatura (Ctrl+K) shart emas — sichqoncha bilan 1 bosishda ochiladi",
      "Barcha 15 ta servis, sovg'a kalkulyatori va do'konlarga tezkor o'tish",
      "Mobil telefon, planshet va kompyuterda birdek qulay",
    ],
    highlightsRu: [
      "Без клавиатуры (Ctrl+K) — открывается в 1 клик мыши",
      "Быстрый переход ко всем 15 сервисам и каталогам",
      "Одинаково удобно на смартфонах, планшетах и ПК",
    ],
    highlightsEn: [
      "Zero keyboard dependency — instant 1-click execution",
      "Instant routing to all 15 concierge services and stores",
      "Optimized for touchscreens, mobile devices, and desktops",
    ],
    targetUz: "Barcha foydalanuvchilar va mobil qurilmalar",
    targetRu: "Все пользователи и мобильные устройства",
    targetEn: "Mobile users and quick platform navigation",
  },
  {
    id: "price-audit",
    category: "ai_tools",
    titleUz: "Narx tekshiruvi",
    titleRu: "Проверка цены",
    titleEn: "Price check",
    descUz: "Chegirma haqiqiymi yoki narx avval ko'tarilganmi — 30 kunlik narx tarixi bilan tekshiring.",
    descRu: "Проверьте по истории цен за 30 дней, настоящая ли скидка или цену сначала подняли.",
    descEn: "Check a 30-day price history to see whether a discount is real or the price was raised first.",
    badgeUz: "Narxlar",
    badgeRu: "Цены",
    badgeEn: "Prices",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: ShieldAlert,
    iconGradient: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-500",
    route: "/price-audit",
    actionUz: "Narxni tekshirish",
    actionRu: "Проверить цену",
    actionEn: "Check a price",
    highlightsUz: [
      "30 kunlik haqiqiy narxlar dinamikasi grafigi",
      "Soxta chegirma koeffitsiyenti (Haqiqiy vs Reklama)",
      "Uzum, Texnomart va Asaxiy bozor medianasi tahlili",
    ],
    highlightsRu: [
      "30-дневный график реальной динамики цен",
      "Коэффициент поддельных скидок (Реальность vs Маркетинг)",
      "Рыночная медиана цен Uzum, Texnomart и Asaxiy",
    ],
    highlightsEn: [
      "30-day verified price history graph",
      "Fake discount deception ratio",
      "Live market median across Uzum, Texnomart, Asaxiy",
    ],
    targetUz: "Katta xaridlar, smartfonlar va maishiy texnika",
    targetRu: "Крупные покупки, электроника и смартфоны",
    targetEn: "Major appliances, tech gear and smartphones",
  },
  {
    id: "compare-duel",
    category: "ai_tools",
    titleUz: "Ikki mahsulotni solishtirish",
    titleRu: "Сравнить два товара",
    titleEn: "Compare two products",
    descUz: "Ikki modelni xususiyatlari, narxi va kafolati bo'yicha yonma-yon ko'ring.",
    descRu: "Сравните две модели по характеристикам, цене и гарантии.",
    descEn: "See two models side by side: specs, price and warranty.",
    badgeUz: "Narxlar",
    badgeRu: "Цены",
    badgeEn: "Prices",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: Swords,
    iconGradient: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-500",
    route: "/compare-duel",
    actionUz: "Solishtirish",
    actionRu: "Сравнить",
    actionEn: "Compare",
    simulatorTab: "duel",
    highlightsUz: [
      "Boshma-bosh texnik parametrlar taqqoslashi",
      "Foydalanuvchi obro' indeksi va chidamlilik bahosi",
      "AI xolis g'oliblik xulosasi va byudjet tejovi",
    ],
    highlightsRu: [
      "Очное сравнение спецификаций и характеристик",
      "Рейтинг долговечности и индекс удовлетворенности",
      "Беспристрастный вердикт AI с расчетом выгоды",
    ],
    highlightsEn: [
      "Head-to-head parameter & specification breakdown",
      "Durability rating and owner satisfaction index",
      "Unbiased AI final verdict with exact savings metric",
    ],
    targetUz: "Ikki xil sovg'a o'rtasida ikkilanib turganlar",
    targetRu: "Для тех, кто выбирает между двумя подарками",
    targetEn: "Shoppers deciding between two candidate items",
  },
  {
    id: "stores-delivery",
    category: "ai_tools",
    titleUz: "Do'konlar va yetkazish",
    titleRu: "Магазины и доставка",
    titleEn: "Stores and delivery",
    descUz: "Hududingiz bo'yicha topshirish punktlari, yetkazish muddati va narxi.",
    descRu: "Пункты выдачи, сроки и стоимость доставки в вашем регионе.",
    descEn: "Pickup points, delivery times and costs for your region.",
    badgeUz: "Yetkazish",
    badgeRu: "Доставка",
    badgeEn: "Delivery",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: Truck,
    iconGradient: "from-purple-500/20 to-indigo-500/10",
    iconColor: "text-purple-500",
    route: "/stores-delivery",
    actionUz: "Ko'rish",
    actionRu: "Смотреть",
    actionEn: "View",
    simulatorTab: "logistics",
    highlightsUz: [
      "500+ Uzum va Texnomart punktlari geolokatsiyasi",
      "Toshkent bo'ylab 3 soatlik favqulodda ekspress xizmati",
      "Samarqand, Buxoro, Farg'ona va viloyatlarga real yetkazish muddati",
    ],
    highlightsRu: [
      "Геолокация 500+ пунктов Uzum и филиалов Texnomart",
      "3-часовой экспресс по Ташкенту",
      "Точные сроки доставки в Самарканд, Бухару, Фергану и области",
    ],
    highlightsEn: [
      "500+ pickup nodes and store directory geolocation",
      "3-hour Tashkent emergency express courier",
      "Accurate ground transit schedules for all regions",
    ],
    targetUz: "Sovg'asi zudlik bilan kerak bo'lgan xaridorlar",
    targetRu: "Срочные подарки и заказы в регионы",
    targetEn: "Urgent gifts and regional deliveries",
  },
  {
    id: "gift-finder",
    category: "ai_tools",
    titleUz: "Sovg'a topish",
    titleRu: "Подбор подарка",
    titleEn: "Gift finder",
    descUz: "Kimga, qanday bayram va byudjet — bir necha savolga javob bering va mos variantlarni oling.",
    descRu: "Ответьте на пару вопросов — кому, какой повод и бюджет — и получите подходящие варианты.",
    descEn: "Answer a few questions about who it's for, the occasion and budget, and get matching ideas.",
    badgeUz: "Sovg'alar",
    badgeRu: "Подарки",
    badgeEn: "Gifts",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: Sparkles,
    iconGradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-500",
    route: "/gift-finder",
    actionUz: "Boshlash",
    actionRu: "Начать",
    actionEn: "Start",
    highlightsUz: [
      "4 bosqichli tezkor xarakter tahlili",
      "Aniq byudjet doirasida eng yaxshi 3 variant",
      "Do'konlardagi jonli mavjudlik va narx auditi",
    ],
    highlightsRu: [
      "4-шаговый анализ психотипа получателя",
      "Топ-3 варианта строго в рамках лимита",
      "Проверка наличия и цен в магазинах",
    ],
    highlightsEn: [
      "4-step recipient psychographic matching",
      "Top 3 optimal matches strictly within budget",
      "Live store stock and certified price verification",
    ],
    targetUz: "Nima sovg'a qilishni bilmayotgan har bir inson",
    targetRu: "Для тех, кто ищет вдохновение и идеи",
    targetEn: "Anyone seeking the mathematically ideal gift",
  },

  // ── 2. INTERACTIVE FUN & SURPRISE ──
  {
    id: "mystery-box",
    category: "games",
    titleUz: "Syurpriz quti",
    titleRu: "Сюрприз-бокс",
    titleEn: "Mystery box",
    descUz: "Byudjetni kiriting — biz bir-biriga mos 3-4 ta sovg'adan iborat to'plam tuzamiz.",
    descRu: "Укажите бюджет — мы соберём набор из 3–4 подарков, которые хорошо сочетаются.",
    descEn: "Set a budget and we'll put together a set of 3–4 gifts that go well together.",
    badgeUz: "Sovg'alar",
    badgeRu: "Подарки",
    badgeEn: "Gifts",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Box,
    iconGradient: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-500",
    route: "/mystery-box",
    actionUz: "Qutini ochish",
    actionRu: "Открыть",
    actionEn: "Open a box",
    highlightsUz: [
      "3D animatsiyali interaktiv virtual quti ochish",
      "Byudjetga mos 3-4 ta sinxron sovg'a to'plami",
      "Haqiqiy do'kon havolalari va 1-bosqichda buyurtma",
    ],
    highlightsRu: [
      "Интерактивное виртуальное 3D открытие коробки",
      "Сбалансированный набор из 3-4 подарков под бюджет",
      "Прямые ссылки на покупку и заказ в 1 клик",
    ],
    highlightsEn: [
      "Interactive virtual 3D unboxing physics experience",
      "Harmonious 3-4 item surprise combination",
      "Verified direct retailer links & instant checkout",
    ],
    targetUz: "Syurpriz qilishni va hissiyot ulashishni istovchilar",
    targetRu: "Любители сюрпризов и ярких эмоций",
    targetEn: "Givers who want to create memorable surprises",
  },
  {
    id: "gift-quiz",
    category: "games",
    titleUz: "Sovg'a testi",
    titleRu: "Тест подарка",
    titleEn: "Gift quiz",
    descUz: "To'rtta qisqa savol orqali qanday sovg'a mos kelishini aniqlang. Yoki barabanni aylantiring.",
    descRu: "Четыре коротких вопроса помогут понять, какой подарок подойдёт. Или крутите колесо.",
    descEn: "Four short questions to work out what kind of gift fits. Or try the prize wheel.",
    badgeUz: "Sovg'alar",
    badgeRu: "Подарки",
    badgeEn: "Gifts",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    icon: HelpCircle,
    iconGradient: "from-indigo-500/20 to-blue-500/10",
    iconColor: "text-indigo-500",
    route: "/gift-quiz",
    actionUz: "Testni boshlash",
    actionRu: "Начать тест",
    actionEn: "Take the quiz",
    highlightsUz: [
      "Shaxsiyat arxetipini aniqlovchi 4 ta savol",
      "Interaktiv sovg'alar omad g'ildiragi (Wheel of Fortune)",
      "Olingan natijani do'stlarga yuborish imkoniyati",
    ],
    highlightsRu: [
      "4 вопроса для определения архетипа личности",
      "Интерактивное колесо фортуны с подарками",
      "Возможность поделиться результатом с друзьями",
    ],
    highlightsEn: [
      "4 archetypal personality classification questions",
      "Interactive lucky gift roulette spinning wheel",
      "One-click result sharing with friends & family",
    ],
    targetUz: "Qiziqarli o'yin orqali tanlashni xohlovchilar",
    targetRu: "Для тех, кто хочет игровой и легкий выбор",
    targetEn: "Users who enjoy gamified decision making",
  },
  {
    id: "group-gifting",
    category: "games",
    titleUz: "Birgalikda sovg'a",
    titleRu: "Общий подарок",
    titleEn: "Group gift",
    descUz: "Hamkasblar yoki do'stlar bilan pul yig'ing, kim to'laganini kuzating va ulushlarni Payme/Click orqali yuboring.",
    descRu: "Соберите деньги с коллегами или друзьями, отслеживайте, кто заплатил, и отправляйте доли через Payme/Click.",
    descEn: "Collect money with colleagues or friends, track who has paid, and send shares via Payme or Click.",
    badgeUz: "Tadbirlar",
    badgeRu: "События",
    badgeEn: "Events",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: Users,
    iconGradient: "from-emerald-500/20 to-green-500/10",
    iconColor: "text-emerald-500",
    route: "/group-gifting",
    actionUz: "Yig'im boshlash",
    actionRu: "Начать сбор",
    actionEn: "Start a group gift",
    highlightsUz: [
      "Payme va Click orqali avtomatik to'lov hisoblash",
      "Jonli yig'ilgan mablag' progress-bari",
      "Har bir hissa qo'shuvchi uchun samimiy tilaklar devori",
    ],
    highlightsRu: [
      "Расчет долей и прямые ссылки Payme и Click",
      "Живой прогресс-бар собранных средств",
      "Стена пожеланий для каждого участника сбора",
    ],
    highlightsEn: [
      "Automated share splitting with Payme & Click links",
      "Live funding pool progress bar",
      "Interactive guestbook and wishes board for contributors",
    ],
    targetUz: "Ofis jamoalari, do'stlar davrasi va sinfdoshlar",
    targetRu: "Офисные команды, друзья и одноклассники",
    targetEn: "Corporate teams, friend circles and cohorts",
  },
  {
    id: "secret-santa",
    category: "games",
    titleUz: "Secret Santa",
    titleRu: "Тайный Санта",
    titleEn: "Secret Santa",
    descUz: "Ishtirokchilarni qo'shing, byudjetni belgilang va kim kimga sovg'a berishini tasodifiy tanlang.",
    descRu: "Добавьте участников, задайте бюджет и случайно распределите, кто кому дарит.",
    descEn: "Add people, set a budget and randomly draw who gives a gift to whom.",
    badgeUz: "Tadbirlar",
    badgeRu: "События",
    badgeEn: "Events",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: Gift,
    iconGradient: "from-rose-500/20 to-red-500/10",
    iconColor: "text-rose-500",
    route: "/secret-santa",
    actionUz: "Guruh yaratish",
    actionRu: "Создать группу",
    actionEn: "Set up a group",
    highlightsUz: [
      "Adolatli avtomatlashtirilgan anonim juftlash algoritmi",
      "Aniq byudjet limiti belgilash (masalan: 200,000 UZS gacha)",
      "Sovg'a qabul qiluvchining orzular ro'yxati (wishlist)",
    ],
    highlightsRu: [
      "Честный автоматический алгоритм анонимной жеребьевки",
      "Фиксированный бюджетный лимит (например: до 200,000 сум)",
      "Список желаний (вишлист) получателя",
    ],
    highlightsEn: [
      "Fair cryptographic anonymized matching engine",
      "Strict budget cap setting (e.g. up to 200k UZS)",
      "Recipient wishlist preview for perfect matches",
    ],
    targetUz: "Yangi yil va bayramlarda korporativ jamoalar",
    targetRu: "Праздничные корпоративы и компании друзей",
    targetEn: "Corporate party rooms and holiday celebrations",
  },

  // ── 3. LUXURY ATELIER & TRADITIONS ──
  {
    id: "packaging-studio",
    category: "luxury",
    titleUz: "Sovg'a qadoqlash",
    titleRu: "Упаковка подарка",
    titleEn: "Gift wrapping",
    descUz: "Quti, lenta va muhrni tanlang, kartochkaga matn yozing.",
    descRu: "Выберите коробку, ленту и печать, добавьте текст на карточку.",
    descEn: "Choose a box, ribbon and seal, and add a message card.",
    badgeUz: "Dizayn",
    badgeRu: "Оформление",
    badgeEn: "Design",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    icon: PackageCheck,
    iconGradient: "from-indigo-500/20 to-violet-500/10",
    iconColor: "text-indigo-500",
    route: "/packaging-studio",
    actionUz: "Tanlash",
    actionRu: "Выбрать",
    actionEn: "Choose wrapping",
    highlightsUz: [
      "4 xil hashamatli qutilar (Black Obsidian, Royal Emerald, etc.)",
      "Haqiqiy mumli muhr (Wax Seal) bosish xizmati",
      "Lazerda o'yilgan shaxsiy metall esdalik lavhasi",
    ],
    highlightsRu: [
      "4 премиальные коробки (Черный Обсидиан, Королевский Изумруд)",
      "Настоящая сургучная печать ручной работы",
      "Металлическая табличка с лазерной гравировкой текста",
    ],
    highlightsEn: [
      "4 bespoke royal box architectures (Black Obsidian, Royal Emerald)",
      "Authentic artisanal wax seal monogram stamping",
      "Laser-engraved personalized metal keepsake plaque",
    ],
    targetUz: "Eng qadrli va nufuzli insonlar uchun",
    targetRu: "Для самых статусных и дорогих людей",
    targetEn: "High-net-worth VIP and prestige gifting",
  },
  {
    id: "calligraphy-card",
    category: "luxury",
    titleUz: "Tabriknoma",
    titleRu: "Открытка",
    titleEn: "Greeting card",
    descUz: "Tabrik matnini yozing yoki tayyor matnni tanlang va uslubini belgilang.",
    descRu: "Напишите поздравление или выберите готовое и оформите его.",
    descEn: "Write a message or pick a ready one, then choose a style.",
    badgeUz: "Dizayn",
    badgeRu: "Оформление",
    badgeEn: "Design",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: PenTool,
    iconGradient: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-500",
    route: "/calligraphy-card",
    actionUz: "Tabriknoma yaratish",
    actionRu: "Создать открытку",
    actionEn: "Make a card",
    highlightsUz: [
      "Buxoro zarhalli va Samarqand feruza bezaklari",
      "O'zbek xattotlik san'atidagi klassik shriftlar",
      "To'y, tug'ilgan kun va yubileylar uchun tayyor tabrik duolari",
    ],
    highlightsRu: [
      "Бухарские золотые и самаркандские бирюзовые орнаменты",
      "Классические узбекские каллиграфические шрифты",
      "Коллекция дуа и пожеланий для свадеб и юбилеев",
    ],
    highlightsEn: [
      "Bukhara gold-foil and Samarkand turquoise motifs",
      "Classic artisanal calligraphy typography",
      "Curated library of traditional Uzbek wedding blessings",
    ],
    targetUz: "To'ylar, yubileylar va ehtiromli tabriklar",
    targetRu: "Свадьбы, юбилеи и праздничные поздравления",
    targetEn: "Weddings, anniversaries and heartfelt blessings",
  },
  {
    id: "cultural-etiquette",
    category: "luxury",
    titleUz: "Sovg'a odobi",
    titleRu: "Этикет подарков",
    titleEn: "Gift etiquette",
    descUz: "Qaynona-qaynotaga, kelin salomga yoki yangi uyga nima sovg'a qilish odat bo'lgani va nimadan qochish kerakligi.",
    descRu: "Что принято дарить родителям супруга, на келин салом или новоселье, и чего лучше избегать.",
    descEn: "What's customary to give in-laws, at a kelin salom or a housewarming, and what to avoid.",
    badgeUz: "Maslahat",
    badgeRu: "Советы",
    badgeEn: "Advice",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    icon: BookOpen,
    iconGradient: "from-teal-500/20 to-emerald-500/10",
    iconColor: "text-teal-500",
    route: "/cultural-etiquette",
    actionUz: "O'qish",
    actionRu: "Читать",
    actionEn: "Read the guide",
    simulatorTab: "cultural",
    highlightsUz: [
      "Qudalar va yangi oila uchun milliy me'yorlar",
      "Sovg'a qilishda qat'iy taqiqlangan buyumlar (taboolar)",
      "Har bir sovg'a bilan aytiladigan samimiy duolar matnlari",
    ],
    highlightsRu: [
      "Национальные нормы для сватов и новой семьи",
      "Строгие табу при дарении подарков",
      "Тексты традиционных благословений к каждому подарку",
    ],
    highlightsEn: [
      "Etiquette protocol for in-laws and new families",
      "Cultural taboos to strictly avoid when gifting",
      "Heartfelt blessing formulas matched to gifts",
    ],
    targetUz: "To'y oldi xaridlari va milliy mehmondorchilik",
    targetRu: "Подготовка к свадьбам и визитам к родственникам",
    targetEn: "Traditional Uzbek family gatherings and in-law visits",
  },
  {
    id: "wedding-registry",
    category: "luxury",
    titleUz: "To'y ro'yxati",
    titleRu: "Свадебный список",
    titleEn: "Wedding registry",
    descUz: "Kerakli narsalar ro'yxatini tuzing va mehmonlarga yuboring. Band qilingan sovg'ani boshqalar ko'radi.",
    descRu: "Составьте список нужных вещей и отправьте гостям. Забронированные подарки видны всем.",
    descEn: "List what you need and share it with guests. Reserved gifts are visible to everyone.",
    badgeUz: "Tadbirlar",
    badgeRu: "События",
    badgeEn: "Events",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: Heart,
    iconGradient: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-500",
    route: "/wedding/ali-madina",
    actionUz: "Ro'yxatni ochish",
    actionRu: "Открыть список",
    actionEn: "Open registry",
    highlightsUz: [
      "Takrorlanishning oldini oluvchi band qilish tizimi",
      "Kelin-kuyov uchun sayohat jamg'armasi (Payme/Click)",
      "Mehmonlar uchun bitta havola orqali ulashish",
    ],
    highlightsRu: [
      "Система бронирования подарков без дубликатов",
      "Фонд свадебного путешествия (Payme/Click)",
      "Удобный шеринг по одной ссылке для всех гостей",
    ],
    highlightsEn: [
      "Reservation locks completely eliminating duplicate gifts",
      "Integrated honeymoon dream travel fund collection",
      "Seamless single-link sharing for wedding guests",
    ],
    targetUz: "Yangi turmush qurayotgan kelin-kuyovlar",
    targetRu: "Молодожены и их гости",
    targetEn: "Engaged couples and their wedding guests",
  },

  // ── 4. FINTECH & SECURITY ──
  {
    id: "currency-converter",
    category: "fintech",
    titleUz: "Valyuta kalkulyatori",
    titleRu: "Конвертер валют",
    titleEn: "Currency converter",
    descUz: "Dollar va so'm o'rtasida Markaziy bank kursi bo'yicha hisoblang.",
    descRu: "Пересчёт долларов и сумов по курсу Центрального банка.",
    descEn: "Convert between dollars and sum at the Central Bank rate.",
    badgeUz: "Hisob-kitob",
    badgeRu: "Расчёты",
    badgeEn: "Money",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: DollarSign,
    iconGradient: "from-emerald-500/20 to-green-500/10",
    iconColor: "text-emerald-500",
    route: "action:currency-converter",
    actionUz: "Hisoblash",
    actionRu: "Посчитать",
    actionEn: "Convert",
    highlightsUz: [
      "MB rasmiy kursi bo'yicha aniq hisob-kitob (1 USD = 12,850 UZS)",
      "Tezkor oldindan belgilangan summalar ($20, $50, $100, $500, $1000)",
      "1 bosishda natijani nusxalash va audio haptik",
    ],
    highlightsRu: [
      "Точный расчет по официальному курсу ЦБ",
      "Быстрые пресеты сумм ($20, $50, $100, $500, $1000)",
      "Копирование результата в 1 клик и звуковой отклик",
    ],
    highlightsEn: [
      "Exact calculation verified with CBU rates",
      "Instant preset buttons ($20, $50, $100, $500, $1000)",
      "1-click clipboard copy with tactile sound feedback",
    ],
    targetUz: "Xorijiy texnika xaridi va narxlarni dollarda baholovchilar",
    targetRu: "Покупатели техники и конвертирующие цены в валюту",
    targetEn: "Cross-currency shoppers and electronics buyers",
  },
  {
    id: "warranty-vault",
    category: "fintech",
    titleUz: "Kafolatlar",
    titleRu: "Гарантии",
    titleEn: "Warranty tracker",
    descUz: "Cheklarni saqlang va kafolat muddati tugashidan oldin eslatma oling.",
    descRu: "Храните чеки и получайте напоминание до окончания гарантии.",
    descEn: "Keep your receipts and get reminded before a warranty runs out.",
    badgeUz: "Hisob-kitob",
    badgeRu: "Расчёты",
    badgeEn: "Money",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: ShieldCheck,
    iconGradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-500",
    route: "/warranty-vault",
    actionUz: "Ochish",
    actionRu: "Открыть",
    actionEn: "Open",
    highlightsUz: [
      "Texnikalar kafolat muddati teskari taymeri",
      "Chek va kafolat talonlarini bulutda saqlash",
      "O'zbekiston rasmiy servis markazlari bilan to'g'ridan-to'g'ri aloqa",
    ],
    highlightsRu: [
      "Таймер обратного отсчета гарантии на технику",
      "Облачный архив чеков и гарантийных талонов",
      "Прямые контакты официальных сервисных центров",
    ],
    highlightsEn: [
      "Digital warranty countdown tracker for electronics",
      "Encrypted cloud locker for sales receipts and slips",
      "Direct directory of official authorized service centers",
    ],
    targetUz: "Qimmatbaho texnika va gadjet egalari",
    targetRu: "Владельцы дорогой техники и гаджетов",
    targetEn: "Owners of premium appliances and electronic devices",
  },
  {
    id: "installment-simulator",
    category: "fintech",
    titleUz: "Muddatli to'lov kalkulyatori",
    titleRu: "Калькулятор рассрочки",
    titleEn: "Installment calculator",
    descUz: "3, 6 va 12 oylik to'lovlarni Texnomart va Uzum Nasiya shartlari bo'yicha solishtiring.",
    descRu: "Сравните платежи на 3, 6 и 12 месяцев по условиям Texnomart и Uzum Nasiya.",
    descEn: "Compare 3, 6 and 12-month payments on Texnomart and Uzum Nasiya terms.",
    badgeUz: "Hisob-kitob",
    badgeRu: "Расчёты",
    badgeEn: "Money",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: Wallet,
    iconGradient: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-500",
    route: "#ai-lab-studio",
    actionUz: "Hisoblash",
    actionRu: "Посчитать",
    actionEn: "Calculate",
    simulatorTab: "installment",
    highlightsUz: [
      "3, 6 va 12 oylik to'lovlar jadvalini hisoblash",
      "Uzum Nasiya vs Texnomart solishtiruvi",
      "Yashirin komissiyalarsiz shaffof xarajatlar",
    ],
    highlightsRu: [
      "График платежей на 3, 6 и 12 месяцев",
      "Сравнение условий Uzum Nasiya и Texnomart",
      "Полная прозрачность без скрытых комиссий",
    ],
    highlightsEn: [
      "Transparent 3, 6, and 12-month payment schedules",
      "Direct comparison: Uzum Nasiya vs Texnomart",
      "Zero hidden fees and fully halal financing breakdown",
    ],
    targetUz: "Byudjetini rejalashtirib, bo'lib to'lashni afzal ko'ruvchilar",
    targetRu: "Покупатели, планирующие бюджет рассрочки",
    targetEn: "Prudent shoppers planning zero-markup installments",
  },
  {
    id: "vip-privilege-card",
    category: "fintech",
    titleUz: "Pro obuna",
    titleRu: "Подписка Pro",
    titleEn: "Pro membership",
    descUz: "Ko'proq qidiruv, narx eslatmalari va maxsus takliflar.",
    descRu: "Больше поисков, уведомления о ценах и специальные предложения.",
    descEn: "More searches, price alerts and members-only offers.",
    badgeUz: "Obuna",
    badgeRu: "Подписка",
    badgeEn: "Membership",
    statusUz: "",
    statusRu: "",
    statusEn: "",
    statusColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Star,
    iconGradient: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-500",
    route: "#vip-card-section",
    actionUz: "Batafsil",
    actionRu: "Подробнее",
    actionEn: "Learn more",
    highlightsUz: [
      "Shaxsiy AI Shopping konsyerji 24/7",
      "14 viloyat bo'ylab bepul ekspress yetkazish",
      "Yopiq premium chegirmalar va keshbek tizimi",
    ],
    highlightsRu: [
      "Персональный AI-консьерж 24/7",
      "Бесплатная доставка по всем 14 регионам",
      "Доступ к закрытым распродажам и кешбэку",
    ],
    highlightsEn: [
      "Dedicated 24/7 AI shopping concierge hotline",
      "Priority free transit across all 14 provinces",
      "Private invitation-only drops and loyalty cashback",
    ],
    targetUz: "Muntazam xarid qiluvchi va yuqori darajadagi mijozlar",
    targetRu: "Постоянные и премиальные клиенты",
    targetEn: "High-volume buyers and corporate VIP clients",
  },
];

interface FeatureCommandCenterProps {
  onSelectSimulatorTab?: (tab: string) => void;
}

export default function FeatureCommandCenter({ onSelectSimulatorTab }: FeatureCommandCenterProps) {
  const { language } = useTranslation();
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState<FeatureCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewFeature, setPreviewFeature] = useState<FeatureItem | null>(null);

  const categories = [
    {
      key: "all" as FeatureCategory,
      labelUz: "Barchasi",
      labelRu: "Все",
      labelEn: "All",
      count: featuresList.length,
      icon: Compass,
    },
    {
      key: "ai_tools" as FeatureCategory,
      labelUz: "Narxlar va xarid",
      labelRu: "Цены и покупки",
      labelEn: "Prices & shopping",
      count: featuresList.filter((f) => f.category === "ai_tools").length,
      icon: Sparkles,
    },
    {
      key: "games" as FeatureCategory,
      labelUz: "Sovg'a g'oyalari",
      labelRu: "Идеи подарков",
      labelEn: "Gift ideas",
      count: featuresList.filter((f) => f.category === "games").length,
      icon: Box,
    },
    {
      key: "luxury" as FeatureCategory,
      labelUz: "Tadbirlar va dizayn",
      labelRu: "События и оформление",
      labelEn: "Occasions & design",
      count: featuresList.filter((f) => f.category === "luxury").length,
      icon: PackageCheck,
    },
    {
      key: "fintech" as FeatureCategory,
      labelUz: "Hisob-kitob",
      labelRu: "Расчёты",
      labelEn: "Money",
      count: featuresList.filter((f) => f.category === "fintech").length,
      icon: ShieldCheck,
    },
  ];

  const filteredFeatures = useMemo(() => {
    let list = featuresList;
    if (activeCategory !== "all") {
      list = list.filter((f) => f.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.titleUz.toLowerCase().includes(q) ||
          f.titleRu.toLowerCase().includes(q) ||
          f.titleEn.toLowerCase().includes(q) ||
          f.descUz.toLowerCase().includes(q) ||
          f.descRu.toLowerCase().includes(q) ||
          f.descEn.toLowerCase().includes(q) ||
          f.badgeUz.toLowerCase().includes(q) ||
          f.badgeRu.toLowerCase().includes(q) ||
          f.badgeEn.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const handleCardClick = (feature: FeatureItem) => {
    cyberSound.playClick();
    if (feature.route === "action:command-palette") {
      window.dispatchEvent(new CustomEvent("open-command-palette"));
      return;
    }
    if (feature.route === "action:currency-converter") {
      window.dispatchEvent(new CustomEvent("open-currency-converter"));
      return;
    }
    if (feature.route.startsWith("#")) {
      if (feature.simulatorTab && onSelectSimulatorTab) {
        onSelectSimulatorTab(feature.simulatorTab);
      }
      const targetId = feature.route.replace("#", "");
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(feature.route);
    }
  };

  const handleOpenPreview = (e: React.MouseEvent, feature: FeatureItem) => {
    e.stopPropagation();
    cyberSound.playConfirm();
    setPreviewFeature(feature);
  };

  return (
    <section id="features-hub-section" className="reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
      {/* ─── COMMAND CENTER HEADER ───────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="max-w-2xl">
          <span className="eyebrow mb-3">{language === "uz" ? "Katalog" : language === "ru" ? "Каталог" : "Directory"}</span>
          <h2 className="font-display font-semibold text-[1.75rem] leading-tight sm:text-4xl tracking-[-0.035em] text-slate-900 dark:text-white">
            {language === "uz" ? <>Barcha <span className="text-gold-gradient">vositalar</span></> : language === "ru" ? <>Все <span className="text-gold-gradient">инструменты</span></> : <>Everything <span className="text-gold-gradient">Sovg'a can do</span></>}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            {language === "uz"
              ? `${featuresList.length} ta vosita: narxlar, sovg'a g'oyalari, tadbirlar va hisob-kitoblar.`
              : language === "ru"
              ? `${featuresList.length} инструментов: цены, идеи подарков, события и расчёты.`
              : `${featuresList.length} tools for prices, gift ideas, occasions and money.`}
          </p>
        </div>

        {/* Real-time search & Quick jump */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Instant Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === "uz"
                  ? "Xizmatlarni qidirish..."
                  : language === "ru"
                  ? "Поиск сервисов..."
                  : "Filter features..."
              }
              className="w-full h-10 pl-9.5 pr-8 rounded-lg bg-white dark:bg-white/5 border border-[var(--line)] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-slate-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              cyberSound.playConfirm();
              document.getElementById("ai-lab-studio")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-10 px-4 rounded-lg bg-white dark:bg-white/5 border border-[var(--line)] hover:border-[var(--line-strong)] text-slate-700 dark:text-slate-200 text-sm font-medium transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>
              {language === "uz" ? "Kalkulyatorlar" : language === "ru" ? "Калькуляторы" : "Calculators"}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* ─── VIRAL FEATURE SPOTLIGHT HERO RIBBON ───────────── */}
      <div className="panel-ink ring-gold mb-8 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

        <div className="space-y-2 relative z-10 max-w-2xl">
          <span className="eyebrow">
            {language === "uz" ? "Tavsiya etamiz" : language === "ru" ? "Рекомендуем" : "Worth a try"}
          </span>

          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight pt-1">
            {language === "uz" ? "Syurpriz quti: byudjetingizga mos sovg'alar to'plami" : language === "ru" ? "Сюрприз-бокс: набор подарков под ваш бюджет" : "Mystery box: a gift set that fits your budget"}
          </h3>

          <p className="text-sm text-slate-300/80 leading-relaxed font-normal">
            {language === "uz" ? "Tanlashga vaqt yo'qmi? Byudjetni kiriting — biz bir-biriga mos 3-4 ta sovg'ani tanlab beramiz." : language === "ru" ? "Нет времени выбирать? Укажите бюджет — мы подберём 3–4 подарка, которые хорошо сочетаются." : "Short on time? Enter your budget and we'll pick 3–4 gifts that go well together."}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="bullet-check is-emerald"><CheckCircle2 className="w-3 h-3" /></span>
              {language === "uz" ? "Do'kon narxlari" : language === "ru" ? "Цены магазинов" : "Real store prices"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bullet-check is-emerald"><CheckCircle2 className="w-3 h-3" /></span>
              {language === "uz" ? "Takrorlanmaydi" : language === "ru" ? "Без повторов" : "No duplicates"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 relative z-10 w-full lg:w-auto">
          <Link
            href="/mystery-box"
            className="flex-1 sm:flex-initial h-12 px-6 rounded-xl btn-luxury-gold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{language === "uz" ? "Qutini ochish" : language === "ru" ? "Открыть" : "Try it"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/gift-quiz"
            className="flex-1 sm:flex-initial h-12 px-5 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white text-sm font-medium transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{language === "uz" ? "Sovg'a testi" : language === "ru" ? "Тест подарка" : "Gift quiz"}</span>
          </Link>
        </div>
      </div>

      {/* ─── CATEGORY FILTER SWITCHER ───────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          const CatIcon = cat.icon;
          const label = language === "uz" ? cat.labelUz : language === "ru" ? cat.labelRu : cat.labelEn;

          return (
            <button
              key={cat.key}
              onClick={() => {
                cyberSound.playClick();
                setActiveCategory(cat.key);
              }}
              className={`flex items-center gap-2 h-9 px-3.5 rounded-full text-sm font-medium transition whitespace-nowrap cursor-pointer select-none border ${
                isActive
                  ? "btn-gold"
                  : "bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-[var(--line)] hover:border-[var(--line-strong)]"
              }`}
            >
              <span>{label}</span>
              <span
                className={`text-xs tabular-nums ${isActive ? "text-amber-950/60" : "text-slate-400"}`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── FEATURE CARDS GRID ─────────────────────────────── */}
      {filteredFeatures.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="font-bold text-slate-900 dark:text-white text-base">
            {language === "uz"
              ? "Bunday xizmat topilmadi"
              : language === "ru"
              ? "Сервисы не найдены"
              : "No features found"}
          </h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {language === "uz"
              ? `"${searchQuery}" bo'yicha hech qanday natija chiqmadi. Boshqa so'z bilan qidiring yoki toifani o'zgartiring.`
              : language === "ru"
              ? `По запросу «${searchQuery}» ничего не найдено. Попробуйте другие ключевые слова.`
              : `No matches found for "${searchQuery}". Try different keywords.`}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
          >
            {language === "uz" ? "Filtrni tozalash" : language === "ru" ? "Сбросить фильтр" : "Reset filter"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFeatures.map((f) => {
            const Icon = f.icon;
            const title = language === "uz" ? f.titleUz : language === "ru" ? f.titleRu : f.titleEn;
            const desc = language === "uz" ? f.descUz : language === "ru" ? f.descRu : f.descEn;
            const badge = language === "uz" ? f.badgeUz : language === "ru" ? f.badgeRu : f.badgeEn;
            const status = language === "uz" ? f.statusUz : language === "ru" ? f.statusRu : f.statusEn;
            const action = language === "uz" ? f.actionUz : language === "ru" ? f.actionRu : f.actionEn;

            return (
              <div
                key={f.id}
                onClick={() => handleCardClick(f)}
                className="surface-card is-interactive group rounded-2xl p-5 flex flex-col justify-between cursor-pointer relative"
              >
                {/* Subtle Ambient Hover Glow */}

                <div>
                  {/* Header row: Icon & Status Badge */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className={`tile ${FEATURE_TILES[featuresList.findIndex((x) => x.id === f.id) % FEATURE_TILES.length]}`}>
                      <Icon className="w-5 h-5" />
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{badge}</span>
                      {/* Info / Quick Preview button */}
                      <button
                        onClick={(e) => handleOpenPreview(e, f)}
                        title={
                          language === "uz"
                            ? "Tezkor ma'lumot"
                            : language === "ru"
                            ? "Быстрый просмотр"
                            : "Quick preview"
                        }
                        className="w-7 h-7 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition"
                        aria-label="Info"
                      >
                        <Info className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>
                    </div>
                  </div>

                  {/* Domain Category Pill */}

                  {/* Feature Title */}
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white leading-snug mb-1.5">
                    {title}
                  </h3>

                  {/* Feature Description */}
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {desc}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white">
                  <span>{action}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── QUICK FEATURE PREVIEW MODAL / DRAWER ───────────── */}
      {previewFeature && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto"
          onClick={() => setPreviewFeature(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-8 max-w-lg w-full max-h-[92dvh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-sm relative space-y-5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewFeature(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl ${previewFeature.iconGradient} bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center`}
              >
                <previewFeature.icon className={`w-6 h-6 ${previewFeature.iconColor}`} />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-[var(--line)] bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
                  {language === "uz" ? previewFeature.badgeUz : language === "ru" ? previewFeature.badgeRu : previewFeature.badgeEn}
                </span>
                <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mt-1">
                  {language === "uz" ? previewFeature.titleUz : language === "ru" ? previewFeature.titleRu : previewFeature.titleEn}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === "uz" ? previewFeature.descUz : language === "ru" ? previewFeature.descRu : previewFeature.descEn}
            </p>

            {/* Highlights List */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider mb-2">
                {language === "uz" ? "Imkoniyatlar" : language === "ru" ? "Возможности" : "What it does"}
              </h4>
              {(language === "uz"
                ? previewFeature.highlightsUz
                : language === "ru"
                ? previewFeature.highlightsRu
                : previewFeature.highlightsEn
              ).map((hl, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>

            {/* Target Audience */}
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <strong className="text-slate-800 dark:text-slate-200">
                {language === "uz" ? "Kimlar uchun mos:" : language === "ru" ? "Для кого подходит:" : "Ideal For:"}
              </strong>{" "}
              {language === "uz" ? previewFeature.targetUz : language === "ru" ? previewFeature.targetRu : previewFeature.targetEn}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  setPreviewFeature(null);
                  handleCardClick(previewFeature);
                }}
                className="flex-1 py-3 rounded-xl btn-luxury-gold text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>
                  {language === "uz" ? previewFeature.actionUz : language === "ru" ? previewFeature.actionRu : previewFeature.actionEn}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setPreviewFeature(null)}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
              >
                {language === "uz" ? "Yopish" : language === "ru" ? "Закрыть" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
