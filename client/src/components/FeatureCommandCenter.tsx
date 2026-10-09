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
} from "lucide-react";

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

const featuresList: FeatureItem[] = [
  // ── 1. AI & MARKET INTELLIGENCE ──
  {
    id: "spotlight-console",
    category: "ai_tools",
    titleUz: "Spotlight Konsoli & Barcha Funksiyalar (1-bosish)",
    titleRu: "Spotlight Консоль & Быстрый Доступ (1 клик)",
    titleEn: "Spotlight Command Center & Fast Palette (1-click)",
    descUz: "Saytdagi barcha 15+ funksiyalar, xaridlar va filtrlarni klaviatura (Ctrl+K)siz, sichqoncha bilan 1 bosishda ochish.",
    descRu: "Доступ ко всем 15+ сервисам, поиску и фильтрам в 1 клик мыши без необходимости нажимать Ctrl+K.",
    descEn: "1-click access to all 15+ platform modules, tools, and actions without needing keyboard shortcuts.",
    badgeUz: "Spotlight HUD",
    badgeRu: "Spotlight HUD",
    badgeEn: "Spotlight HUD",
    statusUz: "⚡ 1-Bosish",
    statusRu: "⚡ 1-Клик",
    statusEn: "⚡ 1-Click",
    statusColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Command,
    iconGradient: "from-amber-500/20 to-yellow-500/10",
    iconColor: "text-amber-500",
    route: "action:command-palette",
    actionUz: "Spotlightni ochish",
    actionRu: "Открыть Spotlight",
    actionEn: "Open Spotlight",
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
    titleUz: "AI Narx Auditori & Soxta Chegirma Foshi",
    titleRu: "AI Аудитор Цен и Фальшивых Скидок",
    titleEn: "AI Price Auditor & Fake Discount Buster",
    descUz: "Sun'iy ko'tarilgan boshlang'ich narxlar va soxta foizlarni fosh qiling. 30 kunlik narx grafigi va bozor medianasi tahlili.",
    descRu: "Разоблачение искусственно завышенных цен и мнимых скидок. 30-дневная история динамики и рыночная медиана цен.",
    descEn: "Expose inflated baselines and fake discount stickers. 30-day verified historical trends and live market median.",
    badgeUz: "Fintech Audit",
    badgeRu: "Финтех Аудит",
    badgeEn: "Fintech Audit",
    statusUz: "🔥 Trend",
    statusRu: "🔥 Тренд",
    statusEn: "🔥 Trending",
    statusColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: ShieldAlert,
    iconGradient: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-500",
    route: "/price-audit",
    actionUz: "Narxni tekshirish",
    actionRu: "Проверить цену",
    actionEn: "Audit Price",
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
    titleUz: "AI Sovg'a Qiyoslagich & Texnik Duel",
    titleRu: "AI Сравнение Товаров & Очная Дуэль",
    titleEn: "AI Gift Comparison & Spec Duel",
    descUz: "Ikkita mashhur modelni boshma-bosh to'qnashtiring: narx, xususiyatlar, obro' balli va AI xolis g'oliblik hukmi.",
    descRu: "Сравните две флагманские модели лицом к лицу: цена, рейтинги надежности, спецификации и беспристрастный AI вердикт.",
    descEn: "Pit two popular models head-to-head: pricing, verified scores, suitability matrix, and definitive AI verdict.",
    badgeUz: "Boshma-Bosh Duel",
    badgeRu: "Очная Дуэль",
    badgeEn: "Head-to-Head Duel",
    statusUz: "⚡ Jonli AI",
    statusRu: "⚡ Живой AI",
    statusEn: "⚡ Live AI",
    statusColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: Swords,
    iconGradient: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-500",
    route: "/compare-duel",
    actionUz: "Duelni boshlash",
    actionRu: "Начать дуэль",
    actionEn: "Launch Duel",
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
    titleUz: "14 Viloyat Do'konlari & Logistika Radari",
    titleRu: "Магазины, ПВЗ и Доставка по Областям",
    titleEn: "Stores, Pickup Points & Regional Transit",
    descUz: "Uzum PVZ punktlari, Texnomart filiallari, Toshkentda 3 soatlik ekspress va 14 viloyatga real yetkazish muddatlari xaritasi.",
    descRu: "Пункты выдачи Uzum, филиалы Texnomart, 3-часовой экспресс по Ташкенту и реальные сроки доставки по 14 регионам.",
    descEn: "Uzum pickup nodes, Texnomart stores, 3-hour Tashkent express, and accurate ground transit times for all 14 regions.",
    badgeUz: "14 Viloyat Logistikasi",
    badgeRu: "14 Регионов",
    badgeEn: "14 Regions Transit",
    statusUz: "📍 Jonli Xarita",
    statusRu: "📍 Живая Карта",
    statusEn: "📍 Live Map",
    statusColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: Truck,
    iconGradient: "from-purple-500/20 to-indigo-500/10",
    iconColor: "text-purple-500",
    route: "/stores-delivery",
    actionUz: "Logistika xaritasi",
    actionRu: "Карта логистики",
    actionEn: "Explore Delivery",
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
    titleUz: "AI Shaxsiy Sovg'a Tanlovchi (Matcher)",
    titleRu: "AI Персональный Подборщик Подарков",
    titleEn: "AI Autonomous Gift Matcher",
    descUz: "Yoshi, qiziqishi, munosabati va aniq byudjetingizga asoslanib, O'zbekiston do'konlaridagi eng munosib sovg'ani ajratib beradi.",
    descRu: "На основе возраста, интересов и лимита бюджета подбирает идеальный подарок среди ведущих магазинов Узбекистана.",
    descEn: "Considers age, interests, relationship, and strict budget limit to calculate the mathematically optimal present.",
    badgeUz: "Smart Matcher",
    badgeRu: "Умный Подбор",
    badgeEn: "Smart Matcher",
    statusUz: "🎯 98% Aniq",
    statusRu: "🎯 98% Точность",
    statusEn: "🎯 98% Accuracy",
    statusColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: Sparkles,
    iconGradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-500",
    route: "/gift-finder",
    actionUz: "Sovg'a qidirish",
    actionRu: "Подобрать подарок",
    actionEn: "Find Gifts",
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
    titleUz: "AI Syurpriz Quti (Mystery Box & Unboxing)",
    titleRu: "AI Коробка-Сюрприз (Mystery Box)",
    titleEn: "AI Mystery Box & 3D Unboxing",
    descUz: "Byudjetingizga mos 3-4 ta bir-birini to'ldiruvchi sovg'a to'plami va interaktiv virtual 3D ochish animatsiyalari.",
    descRu: "Набор из 3-4 взаимодополняющих подарков под ваш бюджет с эффектом виртуального 3D открытия коробки.",
    descEn: "Curated 3-4 item surprise gift set matched to your exact budget with virtual 3D celebratory unboxing physics.",
    badgeUz: "3D Virtual Unboxing",
    badgeRu: "3D Анбоксинг",
    badgeEn: "3D Unboxing",
    statusUz: "✨ Yangi",
    statusRu: "✨ Новинка",
    statusEn: "✨ New Arrival",
    statusColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Box,
    iconGradient: "from-amber-500/20 to-yellow-500/10",
    iconColor: "text-amber-500",
    route: "/mystery-box",
    actionUz: "Qutini ochish",
    actionRu: "Открыть коробку",
    actionEn: "Open Mystery Box",
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
    titleUz: "Sovg'a Testi & Omad Ruletkasi",
    titleRu: "Тест Подарка & Колесо Фортуны",
    titleEn: "Psychometric Gift Quiz & Lucky Wheel",
    descUz: "4 ta psixologik savol bilan 98% aniq sovg'a toping yoki omadli sovg'a ruletkasini aylantirib, g'oyalarni kashf eting.",
    descRu: "Найдите идеальный подарок за 4 вопроса личности или испытайте интерактивное колесо фортуны.",
    descEn: "Discover the 98% accurate gift match through 4 psychology questions or spin the interactive lucky roulette wheel.",
    badgeUz: "Psixometrik Test",
    badgeRu: "Тест Личности",
    badgeEn: "Personality Quiz",
    statusUz: "🎲 Interaktiv",
    statusRu: "🎲 Интерактив",
    statusEn: "🎲 Interactive",
    statusColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    icon: HelpCircle,
    iconGradient: "from-indigo-500/20 to-blue-500/10",
    iconColor: "text-indigo-500",
    route: "/gift-quiz",
    actionUz: "Testni boshlash",
    actionRu: "Начать тест",
    actionEn: "Start Quiz",
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
    titleUz: "Jamoaviy Sovg'a & Payme/Click Splitter",
    titleRu: "Групповой Сбор & Payme/Click Splitter",
    titleEn: "Group Gifting Pool & Payment Splitter",
    descUz: "Hamkasblar yoki do'stlar bilan katta sovg'aga mablag' to'plang. Payme & Click havolalari, progress bar va tabriklar devori.",
    descRu: "Сбор средств на крупный подарок с друзьями или коллегами. Прямые ссылки Payme / Click и прогресс-бар сбора.",
    descEn: "Crowdfund premium gifts together with colleagues or friends. Automated progress tracking and direct Payme/Click links.",
    badgeUz: "Jamoaviy Ulush",
    badgeRu: "Групповой Сбор",
    badgeEn: "Group Crowdfund",
    statusUz: "💳 Payme & Click",
    statusRu: "💳 Payme & Click",
    statusEn: "💳 Payme & Click",
    statusColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: Users,
    iconGradient: "from-emerald-500/20 to-green-500/10",
    iconColor: "text-emerald-500",
    route: "/group-gifting",
    actionUz: "Fond ochish",
    actionRu: "Создать сбор",
    actionEn: "Start Pool",
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
    titleUz: "Maxfiy Sovg'a (Secret Santa) Xonasi",
    titleRu: "Тайный Санта (Secret Santa) Комната",
    titleEn: "Secret Santa & Holiday Party Room",
    descUz: "Jamoangiz yoki sinfdoshlar uchun anonim sovg'a almashish. Adolatli tasodifiy juftlashtirish va byudjet chegaralari.",
    descRu: "Анонимный обмен подарками для команд или друзей. Честная жеребьевка и подбор подарков под фиксированный лимит.",
    descEn: "Anonymous gift exchanges for teams and friends. Fair randomized pairing algorithm and strict budget enforcement.",
    badgeUz: "Anonim Almashuv",
    badgeRu: "Анонимный Обмен",
    badgeEn: "Secret Exchange",
    statusUz: "🎉 Bayramona",
    statusRu: "🎉 Праздник",
    statusEn: "🎉 Holiday Room",
    statusColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: Gift,
    iconGradient: "from-rose-500/20 to-red-500/10",
    iconColor: "text-rose-500",
    route: "/secret-santa",
    actionUz: "Xona yaratish",
    actionRu: "Создать комнату",
    actionEn: "Launch Room",
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
    titleUz: "Qadoqlash & Mumli Muhr Studiyasi",
    titleRu: "Студия Упаковки и Сургучной Печати",
    titleEn: "Royal Packaging & Wax Seal Atelier",
    descUz: "4 xil qirollik qutilari, haqiqiy ipak lentalar, mumli muhr (Wax Seal) va metall lavhadagi shaxsiy lazer o'ymakorligi.",
    descRu: "4 королевские коробки, натуральные шелковые ленты, сургучная печать и металлическая гравированная табличка.",
    descEn: "4 royal gift boxes, genuine silk ribbons, bespoke wax seal stamps, and laser-engraved metal plaque inscriptions.",
    badgeUz: "Atelier Qadoqlash",
    badgeRu: "Ателье Упаковки",
    badgeEn: "Royal Atelier",
    statusUz: "💎 Qirollik",
    statusRu: "💎 Премиум",
    statusEn: "💎 Royal Grade",
    statusColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    icon: PackageCheck,
    iconGradient: "from-indigo-500/20 to-violet-500/10",
    iconColor: "text-indigo-500",
    route: "/packaging-studio",
    actionUz: "Studiyani ochish",
    actionRu: "Открыть студию",
    actionEn: "Open Studio",
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
    titleUz: "Kalligrafik Tabriknoma & Zardo'zlik Duolari",
    titleRu: "Каллиграфические Открытки & Дуа",
    titleEn: "Artisanal Calligraphy Cards & Blessings",
    descUz: "Buxoro zardo'zligi, Samarqand feruzasi va Marg'ilon adrasi uslubidagi zarhalli xattotlik kartochkalarini loyihalash va chop etish.",
    descRu: "Создание открыток в стиле бухарского золота, самаркандской бирюзы и маргиланского адраса с готовыми дуа.",
    descEn: "Design gold-foil calligraphy greeting cards in Bukhara zardozi, Samarkand turquoise, and Margilan ikat aesthetics.",
    badgeUz: "Xattotlik Studiyasi",
    badgeRu: "Студия Каллиграфии",
    badgeEn: "Calligraphy Atelier",
    statusUz: "📜 Buxoro Zardo'zi",
    statusRu: "📜 Золотое Тиснение",
    statusEn: "📜 Gold Embossed",
    statusColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: PenTool,
    iconGradient: "from-amber-500/20 to-yellow-500/10",
    iconColor: "text-amber-500",
    route: "/calligraphy-card",
    actionUz: "Tabriknoma yaratish",
    actionRu: "Создать открытку",
    actionEn: "Design Card",
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
    titleUz: "O'zbek Sovg'a Odobi & Urf-odat AI",
    titleRu: "Узбекский Этикет Подарков & Традиции",
    titleEn: "Uzbek Gift Etiquette & Traditions Advisor",
    descUz: "Qaynona-qaynota, kelin salom va yangi xonadonlar uchun milliy nozikliklar, taboolar va samimiy o'zbekona duolar to'plami.",
    descRu: "Тонкости этикета для сватов, келин салом, табу новоселья и искренние национальные благословения.",
    descEn: "Centuries-old traditions for in-laws, Kelin Salom, housewarming taboos, and heartfelt cultural blessings.",
    badgeUz: "Madaniy Intellekt",
    badgeRu: "Культурный Интеллект",
    badgeEn: "Cultural Etiquette",
    statusUz: "🕌 Milliy Qadriyat",
    statusRu: "🕌 Традиции",
    statusEn: "🕌 Heritage AI",
    statusColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    icon: BookOpen,
    iconGradient: "from-teal-500/20 to-emerald-500/10",
    iconColor: "text-teal-500",
    route: "/cultural-etiquette",
    actionUz: "Odob qoidalarini ko'rish",
    actionRu: "Смотреть этикет",
    actionEn: "Explore Etiquette",
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
    titleUz: "To'y Registratsiyasi & Surprise Protection",
    titleRu: "Свадебный Реестр & Защита от Дубликатов",
    titleEn: "Wedding Registry & Duplicate Protection",
    descUz: "Mehmonlar bir xil sovg'ani olmasligi uchun band qilish, kelin-kuyov orzular ro'yxati va orzudagi sayohat jamg'armasi.",
    descRu: "Создайте персональный реестр желанных подарков: техника, фарфор или медовый месяц. Алгоритм исключает повторы!",
    descEn: "Curate your gift registry with reservation locks to prevent duplicate presents, plus honeymoon cash pool.",
    badgeUz: "Zero Duplicates",
    badgeRu: "Без Дубликатов",
    badgeEn: "Zero Duplicates",
    statusUz: "💍 To'y Ro'yxati",
    statusRu: "💍 Свадьба",
    statusEn: "💍 Wedding Protocol",
    statusColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: Heart,
    iconGradient: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-500",
    route: "/wedding/ali-madina",
    actionUz: "Registratsiyani ko'rish",
    actionRu: "Смотреть реестр",
    actionEn: "View Registry",
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
    titleUz: "Valyuta & Markaziy Bank Kursi Konvertori",
    titleRu: "Конвертер Валют & Курс ЦБ Узбекистана",
    titleEn: "Currency Converter & CBU Live Exchange Rate",
    descUz: "O'zbekiston Markaziy Banki rasmiy kursi asosida jonli ikki tomonlama dollar va so'm kalkulyatori, tezkor miqdorlar.",
    descRu: "Двусторонний калькулятор долларов и сумов по официальному курсу ЦБ РУз с быстрыми шаблонами сумм.",
    descEn: "Bilateral USD to UZS currency calculator based on official Central Bank of Uzbekistan daily rates.",
    badgeUz: "Markaziy Bank",
    badgeRu: "Центральный Банк",
    badgeEn: "Central Bank UZ",
    statusUz: "💵 Jonli Kurs",
    statusRu: "💵 Курс ЦБ",
    statusEn: "💵 Live Rate",
    statusColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: DollarSign,
    iconGradient: "from-emerald-500/20 to-green-500/10",
    iconColor: "text-emerald-500",
    route: "action:currency-converter",
    actionUz: "Kalkulyatorni ochish",
    actionRu: "Открыть калькулятор",
    actionEn: "Open Calculator",
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
    titleUz: "Raqamli Kafolat & Cheklar Hamyoni (Vault)",
    titleRu: "Кошелек Гарантий & Цифровой Архив Чеков",
    titleEn: "Digital Warranty Vault & Receipt Wallet",
    descUz: "Texnika va sovg'alar kafolat muddati hisoblagichi, cheklar arxivi hamda O'zbekiston do'konlarining rasmiy servis telefonlari.",
    descRu: "Трекинг гарантийных сроков на технику, защищенный архив чеков и контакты официальных сервис-центров.",
    descEn: "Digital warranty countdown for appliances, cloud receipt locker, and direct access to manufacturer service centers.",
    badgeUz: "Kafolat Hamyoni",
    badgeRu: "Кошелек Гарантий",
    badgeEn: "Warranty Vault",
    statusUz: "🛡️ Xavfsiz Arxiv",
    statusRu: "🛡️ Защищено",
    statusEn: "🛡️ Secured Vault",
    statusColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: ShieldCheck,
    iconGradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-500",
    route: "/warranty-vault",
    actionUz: "Hamyonni ochish",
    actionRu: "Открыть кошелек",
    actionEn: "Open Vault",
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
    titleUz: "0-0-12 Halol Muddatli To'lov & Nasiya",
    titleRu: "Калькулятор Рассрочки 0-0-12 Без Переплат",
    titleEn: "0-0-12 Halal Installment & Nasiya Simulator",
    descUz: "Texnomart, Uzum Nasiya va Anorbank 0% ustamasiz oylik to'lovlarini real vaqt rejimida taqqoslash va qulay xaridni rejalashtirish.",
    descRu: "Сравнение условий Uzum Nasiya, Texnomart и банковской рассрочки без скрытых переплат за 3, 6 или 12 месяцев.",
    descEn: "Compare transparent 3, 6, and 12-month installment payment plans across Texnomart and Uzum Nasiya.",
    badgeUz: "Nasiya Hisoblagich",
    badgeRu: "Калькулятор Рассрочки",
    badgeEn: "Installment Engine",
    statusUz: "0% Ustamasiz",
    statusRu: "0% Переплат",
    statusEn: "0% Surcharge",
    statusColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: Wallet,
    iconGradient: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-500",
    route: "#ai-lab-studio",
    actionUz: "Simulyatorni ochish",
    actionRu: "Открыть калькулятор",
    actionEn: "Launch Calculator",
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
    titleUz: "Holographic VIP Privilege Pass",
    titleRu: "Голографическая VIP Карта Привилегий",
    titleEn: "Holographic VIP Privilege Pass",
    descUz: "Keshbek statusi, shaxsiy konsyerj xizmati, 14 viloyatga bepul yetkazish va yopiq sotuvlardagi eksklyuziv narxlar tizimi.",
    descRu: "Кешбэк статус, персональный консьерж-сервис, бесплатная доставка по Узбекистану и закрытые распродажи.",
    descEn: "Tiered cashback status, bespoke human concierge, free nationwide transit, and invite-only flash drops.",
    badgeUz: "VIP Status",
    badgeRu: "VIP Привилегия",
    badgeEn: "VIP Privilege",
    statusUz: "👑 Eksklyuziv",
    statusRu: "👑 Эксклюзив",
    statusEn: "👑 Exclusive",
    statusColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Star,
    iconGradient: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-500",
    route: "#vip-card-section",
    actionUz: "Karta tafsilotlari",
    actionRu: "Смотреть карту",
    actionEn: "View VIP Pass",
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
      labelEn: "All Services",
      count: featuresList.length,
      icon: Compass,
    },
    {
      key: "ai_tools" as FeatureCategory,
      labelUz: "⚡ AI & Bozor",
      labelRu: "⚡ AI & Рынок",
      labelEn: "⚡ AI & Market",
      count: featuresList.filter((f) => f.category === "ai_tools").length,
      icon: Sparkles,
    },
    {
      key: "games" as FeatureCategory,
      labelUz: "🎁 Syurpriz & O'yinlar",
      labelRu: "🎁 Сюрпризы & Игры",
      labelEn: "🎁 Fun & Games",
      count: featuresList.filter((f) => f.category === "games").length,
      icon: Box,
    },
    {
      key: "luxury" as FeatureCategory,
      labelUz: "👑 Hashamat & Studiya",
      labelRu: "👑 Люкс & Ателье",
      labelEn: "👑 Luxury Atelier",
      count: featuresList.filter((f) => f.category === "luxury").length,
      icon: PackageCheck,
    },
    {
      key: "fintech" as FeatureCategory,
      labelUz: "💰 Moliya & Xavfsizlik",
      labelRu: "💰 Финтех & Защита",
      labelEn: "💰 Fintech & Vault",
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
    <section id="features-hub-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
      {/* ─── COMMAND CENTER HEADER ───────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 dark:bg-amber-500/10 border border-slate-800 dark:border-amber-500/20 text-slate-200 dark:text-amber-400 text-xs font-mono font-bold tracking-wider uppercase mb-3 shadow-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {language === "uz"
                ? "EKOTIZIM NAVIGATORI"
                : language === "ru"
                ? "НАВИГАТОР ЭКОСИСТЕМЫ"
                : "PLATFORM DIRECTORY"}
            </span>
            <span className="text-slate-600 dark:text-slate-500">•</span>
            <span className="text-amber-400 font-semibold">
              {language === "uz"
                ? `${featuresList.length} TA XIZMAT`
                : language === "ru"
                ? `${featuresList.length} СЕРВИСОВ`
                : `${featuresList.length} SERVICES`}
            </span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            {language === "uz" ? (
              <>
                Barcha Imkoniyatlar & <span className="gold-gradient-text">Eksklyuziv Xizmatlar</span>
              </>
            ) : language === "ru" ? (
              <>
                Все Возможности & <span className="gold-gradient-text">Эксклюзивные Сервисы</span>
              </>
            ) : (
              <>
                The Complete <span className="gold-gradient-text">Platform Feature Command Hub</span>
              </>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-2 font-normal leading-relaxed">
            {language === "uz"
              ? "Bozor tahlili, o'yinlar, mumli muhrli qadoqlash studiyasi va jamoaviy to'lovlar — barchasi bir markazda tartiblangan."
              : language === "ru"
              ? "Анализ цен, анбоксинг, королевская студия упаковки и групповой сбор — все сервисы структурированы в одном хабе."
              : "Live price arbitrage, mystery unboxing, royal wax seal atelier, and payment pools organized in one unified command center."}
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
              className="w-full pl-9.5 pr-8 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-amber-400 shadow-xs transition"
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
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-900 dark:border dark:border-slate-800 dark:hover:border-amber-400/60 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 group cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>
              {language === "uz"
                ? "AI Lab Simulyatorlari"
                : language === "ru"
                ? "Лаборатория AI"
                : "AI Simulators Lab"}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* ─── VIRAL FEATURE SPOTLIGHT HERO RIBBON ───────────── */}
      <div className="mb-8 rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-[#fffdfa] via-[#fbf6ec] to-[#f5eddb] dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/40 border-2 border-amber-300/90 dark:border-amber-500/30 text-slate-900 dark:text-white relative overflow-hidden shadow-luxury flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 dark:bg-amber-400/20 border border-amber-500/30 dark:border-amber-400/30 text-amber-900 dark:text-amber-300 text-[10px] font-bold tracking-wider uppercase">
            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>
              {language === "uz"
                ? "HAFTA TRENDI · VIRTUAL 3D UNBOXING"
                : language === "ru"
                ? "ТРЕНД НЕДЕЛИ · 3D АНБОКСИНГ"
                : "FEATURE OF THE WEEK · 3D UNBOXING"}
            </span>
          </div>

          <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
            {language === "uz"
              ? "AI Syurpriz Quti: Byudjetingizga mos sovg'alar & 3D Unboxing"
              : language === "ru"
              ? "AI Коробка-Сюрприз: Подарки под ваш бюджет и 3D анбоксинг"
              : "AI Mystery Box: Budget-tailored surprise gift set with 3D unboxing"}
          </h3>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            {language === "uz"
              ? "Sovg'a tanlashga vaqtingiz kammi? Byudjetingizni kiriting, AI 3-4 ta bir-birini to'ldiruvchi original sovg'alar jamlanmasini tuzib beradi va virtual 3D qutini ochadi."
              : language === "ru"
              ? "Мало времени на выбор? Укажите бюджет, и AI подберет идеальный сет из 3-4 подарков с эффектным 3D открытием коробки."
              : "Short on time? Set your budget limit and let AI curate a harmonious 3-4 gift bundle with virtual 3D unboxing physics."}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-amber-900 dark:text-amber-300/80 font-mono">
            <span className="flex items-center gap-1 bg-white/80 dark:bg-white/5 px-2.5 py-0.5 rounded-md border border-amber-200/80 dark:border-white/10 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />{" "}
              {language === "uz" ? "100% Real Do'kon Narxlari" : language === "ru" ? "100% Реальные Цены" : "100% Real Store Prices"}
            </span>
            <span className="flex items-center gap-1 bg-white/80 dark:bg-white/5 px-2.5 py-0.5 rounded-md border border-amber-200/80 dark:border-white/10 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />{" "}
              {language === "uz" ? "0% O'xshash bo'lmagan sovg'alar" : language === "ru" ? "0% Дубликатов" : "0% Duplicate Gifts"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 relative z-10 w-full lg:w-auto">
          <Link
            href="/mystery-box"
            className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl btn-luxury-gold text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Box className="w-4 h-4 text-slate-950" />
            <span>{language === "uz" ? "Qutini Ochish" : language === "ru" ? "Открыть Коробку" : "Open Mystery Box"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/gift-quiz"
            className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-amber-100/80 hover:bg-amber-200/80 dark:bg-white/10 dark:hover:bg-white/15 border border-amber-300/80 dark:border-white/20 text-amber-950 dark:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md shadow-xs"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
            <span>{language === "uz" ? "Test & Ruletka" : language === "ru" ? "Тест & Рулетка" : "Quiz & Wheel"}</span>
          </Link>
        </div>
      </div>

      {/* ─── CATEGORY FILTER SWITCHER ───────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md font-extrabold scale-102"
                  : "bg-white dark:bg-slate-900/80 text-amber-950/80 dark:text-slate-300 hover:text-amber-950 dark:hover:text-white border border-amber-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-slate-700 shadow-2xs font-semibold"
              }`}
            >
              <CatIcon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-amber-700 dark:text-slate-400"}`} />
              <span>{label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-amber-100/70 dark:bg-slate-800 text-amber-950 dark:text-slate-400"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── FEATURE CARDS GRID ─────────────────────────────── */}
      {filteredFeatures.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                className="group card-luxury bg-gradient-to-b from-white via-[#fcfaf5] to-[#f7f2e4] dark:from-[#10121d] dark:to-[#080a11] rounded-3xl p-6 border-2 border-amber-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/60 shadow-luxury hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Subtle Ambient Hover Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 group-hover:bg-amber-500/20 rounded-full blur-2xl transition-all pointer-events-none" />

                <div>
                  {/* Header row: Icon & Status Badge */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-300"
                    >
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${f.statusColor}`}>
                        {status}
                      </span>
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
                        className="w-7 h-7 rounded-xl bg-amber-100/70 hover:bg-amber-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-900 dark:text-slate-400 hover:text-amber-950 dark:hover:text-white flex items-center justify-center transition border border-amber-200/60 dark:border-slate-700"
                      >
                        <Info className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>
                    </div>
                  </div>

                  {/* Domain Category Pill */}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 bg-amber-50/90 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-amber-200/80 dark:border-slate-700/60 inline-block mb-2">
                    {badge}
                  </span>

                  {/* Feature Title */}
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug mb-2">
                    {title}
                  </h3>

                  {/* Feature Description */}
                  <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed font-normal">
                    {desc}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-5 pt-3.5 border-t border-amber-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-950 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <span>{action}</span>
                  <div className="w-7 h-7 rounded-xl bg-amber-100/80 dark:bg-slate-800 group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-amber-600 group-hover:text-white text-amber-900 dark:text-slate-300 flex items-center justify-center transition-all shadow-2xs">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform stroke-[2.2]" />
                  </div>
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
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 max-w-lg w-full max-h-[92dvh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-5 animate-scale-in"
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
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${previewFeature.iconGradient} bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center`}
              >
                <previewFeature.icon className={`w-6 h-6 ${previewFeature.iconColor}`} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">
                  {language === "uz" ? previewFeature.badgeUz : language === "ru" ? previewFeature.badgeRu : previewFeature.badgeEn}
                </span>
                <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white mt-1">
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
                {language === "uz" ? "Asosiy Afzalliklari:" : language === "ru" ? "Ключевые Возможности:" : "Key Advantages:"}
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
