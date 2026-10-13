/**
 * Every page on the site, grouped by what the visitor is trying to do.
 * The navbar menu, the mobile menu, the "all tools" sheet and the homepage
 * all read from this list, so a new page only needs to be added here.
 */
import {
  Gift,
  HelpCircle,
  Box,
  BookOpen,
  ShoppingBag,
  Scale,
  ShieldAlert,
  Tag,
  Truck,
  ShieldCheck,
  Heart,
  Star,
  Users,
  Shuffle,
  Bell,
  PenTool,
  PackageCheck,
  Clock,
} from "./icons";

type T = { uz: string; ru: string; en: string };

export interface ToolLink {
  href: string;
  icon: any;
  title: T;
  desc: T;
}

export interface ToolGroup {
  id: "choose" | "prices" | "events" | "extras";
  title: T;
  items: ToolLink[];
}

export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: "choose",
    title: { uz: "Sovg'a tanlash", ru: "Выбор подарка", en: "Choosing a gift" },
    items: [
      { href: "/gift-finder", icon: Gift, title: { uz: "Sovg'a topish", ru: "Подбор подарка", en: "Gift finder" }, desc: { uz: "Kimga, qaysi bayram va qancha byudjet", ru: "Кому, какой праздник и бюджет", en: "Who it's for, occasion and budget" } },
      { href: "/gift-quiz", icon: HelpCircle, title: { uz: "Sovg'a testi", ru: "Тест подарка", en: "Gift quiz" }, desc: { uz: "4 ta savol — mos g'oyalar", ru: "4 вопроса — подходящие идеи", en: "Four questions, matching ideas" } },
      { href: "/mystery-box", icon: Box, title: { uz: "Syurpriz quti", ru: "Сюрприз-бокс", en: "Mystery box" }, desc: { uz: "Byudjetingizga mos to'plam", ru: "Набор под ваш бюджет", en: "A set that fits your budget" } },
      { href: "/cultural-etiquette", icon: BookOpen, title: { uz: "Sovg'a odobi", ru: "Этикет подарков", en: "Gift etiquette" }, desc: { uz: "Nima berish mumkin, nimadan qochish kerak", ru: "Что дарить и чего избегать", en: "What to give and what to avoid" } },
    ],
  },
  {
    id: "prices",
    title: { uz: "Narx va xarid", ru: "Цены и покупка", en: "Prices & buying" },
    items: [
      { href: "/catalog", icon: ShoppingBag, title: { uz: "Katalog", ru: "Каталог", en: "Catalog" }, desc: { uz: "Do'konlardagi joriy narxlar", ru: "Текущие цены в магазинах", en: "Current prices from stores" } },
      { href: "/compare-duel", icon: Scale, title: { uz: "Ikkita mahsulotni solishtirish", ru: "Сравнить два товара", en: "Compare two products" }, desc: { uz: "Xususiyat va narx yonma-yon", ru: "Характеристики и цены рядом", en: "Specs and prices side by side" } },
      { href: "/price-audit", icon: ShieldAlert, title: { uz: "Chegirmani tekshirish", ru: "Проверка скидки", en: "Check a discount" }, desc: { uz: "Chegirma haqiqiymi yoki yo'q", ru: "Настоящая ли скидка", en: "Is the discount real?" } },
      { href: "/aksiyalar", icon: Tag, title: { uz: "Promokodlar", ru: "Промокоды", en: "Promo codes" }, desc: { uz: "Do'kon kodlari va haftalik baraban", ru: "Коды магазинов и колесо недели", en: "Store codes and a weekly spin" } },
      { href: "/stores-delivery", icon: Truck, title: { uz: "Do'konlar va yetkazish", ru: "Магазины и доставка", en: "Stores & delivery" }, desc: { uz: "Muddatlar va topshirish punktlari", ru: "Сроки и пункты выдачи", en: "Delivery times and pickup points" } },
      { href: "/warranty-vault", icon: ShieldCheck, title: { uz: "Kafolatlar", ru: "Гарантии", en: "Warranties" }, desc: { uz: "Cheklar va kafolat muddatlari", ru: "Чеки и сроки гарантии", en: "Receipts and warranty dates" } },
    ],
  },
  {
    id: "events",
    title: { uz: "To'y va bayramlar", ru: "Свадьбы и праздники", en: "Weddings & occasions" },
    items: [
      { href: "/wedding-registry", icon: Heart, title: { uz: "To'y ro'yxati", ru: "Свадебный список", en: "Wedding registry" }, desc: { uz: "Mehmonlar bir xil sovg'a olmaydi", ru: "Гости не купят одно и то же", en: "Guests won't buy the same thing" } },
      { href: "/wishlist", icon: Star, title: { uz: "Istaklar ro'yxati", ru: "Список желаний", en: "Wishlist" }, desc: { uz: "Nima xohlayotganingizni ulashing", ru: "Поделитесь тем, что хотите", en: "Share what you'd like" } },
      { href: "/group-gifting", icon: Users, title: { uz: "Birgalikda sovg'a", ru: "Общий подарок", en: "Group gift" }, desc: { uz: "Pulni do'stlar bilan yig'ing", ru: "Скиньтесь с друзьями", en: "Chip in with friends" } },
      { href: "/secret-santa", icon: Shuffle, title: { uz: "Secret Santa", ru: "Тайный Санта", en: "Secret Santa" }, desc: { uz: "Guruh uchun qur'a", ru: "Жеребьёвка для группы", en: "Draw names for a group" } },
      { href: "/reminders", icon: Bell, title: { uz: "Eslatmalar", ru: "Напоминания", en: "Reminders" }, desc: { uz: "Tug'ilgan kun va sanalarni unutmang", ru: "Не забудьте дни рождения", en: "Never miss a birthday" } },
    ],
  },
  {
    id: "extras",
    title: { uz: "Tabrik va bezak", ru: "Поздравление и оформление", en: "Cards & wrapping" },
    items: [
      { href: "/calligraphy-card", icon: PenTool, title: { uz: "Tabriknoma", ru: "Открытка", en: "Greeting card" }, desc: { uz: "Matn yozing, dizayn tanlang", ru: "Текст и оформление", en: "Write it and pick a design" } },
      { href: "/packaging-studio", icon: PackageCheck, title: { uz: "Sovg'a qadoqlash", ru: "Упаковка", en: "Gift wrapping" }, desc: { uz: "Quti, lenta va muhr", ru: "Коробка, лента и печать", en: "Box, ribbon and seal" } },
      { href: "/time-capsule", icon: Clock, title: { uz: "Vaqt kapsulasi", ru: "Капсула времени", en: "Time capsule" }, desc: { uz: "Keyinroq ochiladigan xat", ru: "Письмо на будущее", en: "A letter to open later" } },
    ],
  },
];

/** The handful of pages shown directly in the top navigation. */
export const MAIN_LINKS: { href: string; title: T }[] = [
  { href: "/catalog", title: { uz: "Katalog", ru: "Каталог", en: "Catalog" } },
  { href: "/gift-finder", title: { uz: "Sovg'a topish", ru: "Подбор подарка", en: "Gift finder" } },
  { href: "/wedding-registry", title: { uz: "To'y ro'yxati", ru: "Свадебный список", en: "Wedding registry" } },
  { href: "/aksiyalar", title: { uz: "Aksiyalar", ru: "Акции", en: "Deals" } },
  { href: "/subscription", title: { uz: "Tariflar", ru: "Тарифы", en: "Plans" } },
];

export type Lang = "uz" | "ru" | "en";
export const pick = (t: T, lang: string) => t[(lang === "ru" || lang === "en" ? lang : "uz") as Lang];
