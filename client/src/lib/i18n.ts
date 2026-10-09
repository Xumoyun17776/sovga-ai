import { create } from "zustand";

type Lang = "uz" | "ru" | "en";

const translations: Record<Lang, Record<string, any>> = {
  uz: {
    hero: { title: "Nima sotib olishni o'ylab ko'rmang.", subtitle: "Sovg'a haqiqiy mahsulotlarni izlaydi, narxlarni taqqoslaydi va shaxsga — hamda byudjetingizga — mos sovg'a topadi.", cta: "Sovg'a topish", ctaSecondary: "Eng yaxshi narxni topish", ctaWedding: "To'y ro'yxatini yaratish" },
    nav: { home: "Bosh sahifa", deals: "Katalog va Aksiya", search: "Qidirish", giftFinder: "Sovg'a topish", wedding: "To'y ro'yxati", wishlists: "Istaklarim", reminders: "Eslatmalar", admin: "Admin", login: "Kirish", logout: "Chiqish", register: "Ro'yxatdan o'tish" },
    search: { placeholder: "Nima qidiryapsiz?", button: "Qidirish", researching: "Tadqiqot olib borilmoqda...", examples: "Masalan: 'To'y sovg'asi 700 ming gacha', 'Eng yaxshi quloqchinlar'" },
    gift: { title: "Mukammal sovg'ani toping", occasion: "Bayram", budget: "Byudjet", budgetMin: "Minimal", budgetMax: "Maksimal", recipient: "Kimga", relationship: "Munosabat", interests: "Qiziqishlari", avoid: "Nimalardan qochish kerak", find: "Sovg'a topish", age: "Yoshi", gender: "Jinsi" },
    occasions: { wedding: "To'y", birthday: "Tug'ilgan kun", graduation: "Bitirish", anniversary: "Yillik", new_baby: "Yangi chaqaloq", housewarming: "Yangi uy", holiday: "Bayram", teacher: "O'qituvchi", friend: "Do'st", family: "Oila", corporate: "Korporativ", other: "Boshqa" },
    results: { bestOverall: "Eng yaxshi tanlov", bestValue: "Eng yaxshi narx", cheapest: "Eng arzon", premium: "Premium", mostUnique: "Eng noyob", sourcesResearched: "manba tekshirildi", lastChecked: "Oxirgi tekshiruv", priceNotVerified: "Narx tasdiqlanmagan", demoData: "DEMO MA'LUMOTLAR", viewDetails: "Batafsil", whyRecommended: "Nega tavsiya etildi?" },
    product: { buy: "Sotib olish", compare: "Taqqoslash", save: "Saqlash", why: "Nega bu?" },
    registry: { create: "Ro'yxat yaratish", title: "To'y ro'yxati", items: "Mahsulotlar", reserve: "Bu sovg'ani band qilish", reserved: "Band qilingan", purchased: "Sotib olingan", addItem: "Mahsulot qo'shish", guestName: "Ismingiz", message: "Xabar", share: "Ulashish" },
    wishlist: { create: "Ro'yxat yaratish", title: "Istaklar ro'yxati", addItem: "Mahsulot qo'shish" },
    common: { loading: "Yuklanmoqda...", error: "Xatolik yuz berdi", save: "Saqlash", cancel: "Bekor qilish", delete: "O'chirish", back: "Orqaga", next: "Keyingi", submit: "Yuborish", close: "Yopish" },
    howItWorks: { title: "Qanday ishlaydi", step1: "Bizga nima kerakligini ayting", step1desc: "Bayram, byudjet va qiziqishlarni kiriting", step2: "AI internetni tekshiradi", step2desc: "Haqiqiy mahsulotlar va narxlarni real vaqtda qidiradi", step3: "Eng yaxshi variantlarni oling", step3desc: "Haqiqiy narxlar va havolalar bilan taqqoslangan natijalar" },
    footer: { tagline: "Sizning AI savdo tadqiqotchingiz", rights: "Barcha huquqlar himoyalangan" },
  },
  ru: {
    hero: { title: "Перестаньте гадать, что купить.", subtitle: "Sovg'a исследует реальные товары, сравнивает цены и находит подарок, который действительно подходит человеку — и вашему бюджету.", cta: "Найти подарок", ctaSecondary: "Найти лучшую цену", ctaWedding: "Создать свадебный список" },
    nav: { home: "Главная", deals: "Каталог и скидки", search: "Поиск", giftFinder: "Найти подарок", wedding: "Свадебный список", wishlists: "Мои списки", reminders: "Напоминания", admin: "Админ", login: "Войти", logout: "Выйти", register: "Регистрация" },
    search: { placeholder: "Что вы ищете?", button: "Искать", researching: "Исследуем...", examples: "Например: 'Подарок на свадьбу до 700 тыс', 'Лучшие наушники'" },
    gift: { title: "Найдите идеальный подарок", occasion: "Повод", budget: "Бюджет", budgetMin: "Минимум", budgetMax: "Максимум", recipient: "Для кого", relationship: "Отношение", interests: "Интересы", avoid: "Чего избегать", find: "Найти подарок", age: "Возраст", gender: "Пол" },
    occasions: { wedding: "Свадьба", birthday: "День рождения", graduation: "Выпускной", anniversary: "Годовщина", new_baby: "Новорожденный", housewarming: "Новоселье", holiday: "Праздник", teacher: "Учитель", friend: "Друг", family: "Семья", corporate: "Корпоратив", other: "Другое" },
    results: { bestOverall: "Лучший выбор", bestValue: "Лучшая цена", cheapest: "Самый доступный", premium: "Премиум", mostUnique: "Самый уникальный", sourcesResearched: "источников проверено", lastChecked: "Проверено", priceNotVerified: "Цена не подтверждена", demoData: "ДЕМО ДАННЫЕ", viewDetails: "Подробнее", whyRecommended: "Почему рекомендован?" },
    product: { buy: "Купить", compare: "Сравнить", save: "Сохранить", why: "Почему это?" },
    registry: { create: "Создать список", title: "Свадебный список", items: "Товары", reserve: "Забронировать подарок", reserved: "Забронирован", purchased: "Куплен", addItem: "Добавить товар", guestName: "Ваше имя", message: "Сообщение", share: "Поделиться" },
    wishlist: { create: "Создать список", title: "Список желаний", addItem: "Добавить товар" },
    common: { loading: "Загрузка...", error: "Произошла ошибка", save: "Сохранить", cancel: "Отмена", delete: "Удалить", back: "Назад", next: "Далее", submit: "Отправить", close: "Закрыть" },
    howItWorks: { title: "Как это работает", step1: "Расскажите, что вам нужно", step1desc: "Укажите повод, бюджет и интересы", step2: "AI исследует интернет", step2desc: "Ищет реальные товары и цены в реальном времени", step3: "Получите лучшие варианты", step3desc: "Сравненные результаты с реальными ценами и ссылками" },
    footer: { tagline: "Ваш AI-исследователь покупок", rights: "Все права защищены" },
  },
  en: {
    hero: { title: "Stop wondering what to buy.", subtitle: "Sovg'a researches real products, compares prices, and finds a gift that actually fits the person — and your budget.", cta: "Find a Gift", ctaSecondary: "Find the Best Price", ctaWedding: "Create a Wedding List" },
    nav: { home: "Home", deals: "Deals & Catalog", search: "Search", giftFinder: "Gift Finder", wedding: "Wedding Registry", wishlists: "Wishlists", reminders: "Reminders", admin: "Admin", login: "Log In", logout: "Log Out", register: "Sign Up" },
    search: { placeholder: "What are you looking for?", button: "Search", researching: "Researching...", examples: "E.g.: 'Wedding gift under 700k', 'Best headphones under 800k'" },
    gift: { title: "Find the perfect gift", occasion: "Occasion", budget: "Budget", budgetMin: "Minimum", budgetMax: "Maximum", recipient: "For whom", relationship: "Relationship", interests: "Interests", avoid: "Things to avoid", find: "Find a Gift", age: "Age", gender: "Gender" },
    occasions: { wedding: "Wedding", birthday: "Birthday", graduation: "Graduation", anniversary: "Anniversary", new_baby: "New Baby", housewarming: "Housewarming", holiday: "Holiday", teacher: "Teacher", friend: "Friend", family: "Family", corporate: "Corporate", other: "Other" },
    results: { bestOverall: "Best Overall", bestValue: "Best Value", cheapest: "Cheapest Good Option", premium: "Premium Pick", mostUnique: "Most Unique", sourcesResearched: "sources researched", lastChecked: "Last checked", priceNotVerified: "Price not verified", demoData: "DEMO DATA", viewDetails: "View Details", whyRecommended: "Why recommended?" },
    product: { buy: "Buy", compare: "Compare", save: "Save", why: "Why this?" },
    registry: { create: "Create Registry", title: "Wedding Registry", items: "Items", reserve: "Reserve This Gift", reserved: "Reserved", purchased: "Purchased", addItem: "Add Item", guestName: "Your Name", message: "Message", share: "Share" },
    wishlist: { create: "Create Wishlist", title: "My Wishlists", addItem: "Add Item" },
    common: { loading: "Loading...", error: "Something went wrong", save: "Save", cancel: "Cancel", delete: "Delete", back: "Back", next: "Next", submit: "Submit", close: "Close" },
    howItWorks: { title: "How it works", step1: "Tell us what you need", step1desc: "Enter the occasion, budget, and interests", step2: "AI researches the web", step2desc: "Searches for real products and prices in real time", step3: "Get the best options", step3desc: "Compared results with real prices and direct links" },
    footer: { tagline: "Your AI Shopping Researcher", rights: "All rights reserved" },
  },
};

interface I18nState {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: (key: string) => string;
}

function getSavedLanguage(): Lang {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = window.localStorage.getItem("sovga_lang");
      if (saved === "uz" || saved === "ru" || saved === "en") return saved;
    }
  } catch {}
  return "en"; // English is now the primary default language
}

export const useTranslation = create<I18nState>((set, get) => ({
  language: getSavedLanguage(),
  setLanguage: (language) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("sovga_lang", language);
      }
    } catch {}
    set({ language });
  },
  t: (key: string) => {
    const lang = get().language;
    const keys = key.split(".");
    let val: any = translations[lang] || translations["en"];
    for (const k of keys) {
      if (val && typeof val === "object" && k in val) {
        val = val[k];
      } else {
        // Fallback to English if missing in chosen language
        let fallback: any = translations["en"];
        for (const fk of keys) {
          if (fallback && typeof fallback === "object" && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key;
          }
        }
        return typeof fallback === "string" ? fallback : key;
      }
    }
    return typeof val === "string" ? val : key;
  },
}));
