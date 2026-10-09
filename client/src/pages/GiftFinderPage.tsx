import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "../lib/i18n";
import { research } from "../lib/api";
import { useCurrency } from "../lib/currency";
import { cyberSound } from "../lib/cyberSound";
import ResearchResults, { ResearchSkeleton } from "../components/ResearchResults";
import GiftDetectiveModal from "../components/GiftDetectiveModal";
import {
  ArrowLeft,
  ArrowRight,
  Gift,
  Sparkles,
  CheckCircle2,
  Tag,
  DollarSign,
  UserCheck,
  Heart,
  Cake,
  GraduationCap,
  Baby,
  Home,
  BookOpen,
  Users,
  Briefcase,
  Sliders,
  ShieldCheck,
  Compass,
  Fingerprint,
} from "lucide-react";
import type { GiftCriteria, Occasion } from "@shared/types";

interface OccasionMeta {
  key: Occasion;
  icon: any;
  tipEn: string;
  tipUz: string;
  tipRu: string;
}

const occasions: OccasionMeta[] = [
  { key: "wedding", icon: Heart, tipEn: "Family & Kitchen Essentials", tipUz: "Oila & oshxona anjomlari", tipRu: "Для дома и кухни" },
  { key: "birthday", icon: Cake, tipEn: "Personal Gadgets & Keepsakes", tipUz: "Shaxsiy gadjetlar & sovg'alar", tipRu: "Гаджеты и личные подарки" },
  { key: "anniversary", icon: Sparkles, tipEn: "Romantic Mementos", tipUz: "Unutilmas esdaliklar", tipRu: "Романтические сувениры" },
  { key: "graduation", icon: GraduationCap, tipEn: "Career & Tech Stationery", tipUz: "Karyera & ta'lim jihozlari", tipRu: "Карьера и технологии" },
  { key: "new_baby", icon: Baby, tipEn: "Baby Care & Nursery Sets", tipUz: "Chaqaloq & parvarish to'plamlari", tipRu: "Наборы для новорожденных" },
  { key: "housewarming", icon: Home, tipEn: "Kitchen, Decor & Cozy Comforts", tipUz: "Oshxona, dekor & qulaylik", tipRu: "Кухня, уют и декор" },
  { key: "holiday", icon: Gift, tipEn: "Festive Delights & Gift Sets", tipUz: "Bayramona shirinliklar & to'plamlar", tipRu: "Праздничные наборы" },
  { key: "teacher", icon: BookOpen, tipEn: "Books & Premium Stationery", tipUz: "Kitoblar & sifatli kanselyariya", tipRu: "Книги и канцелярия" },
  { key: "friend", icon: Users, tipEn: "Hobbies, Gaming & Gadgets", tipUz: "Qiziqarli xobbi & gadjetlar", tipRu: "Хобби и умные гаджеты" },
  { key: "family", icon: Home, tipEn: "Home Appliances & Comfort", tipUz: "Maishiy texnika & kiyim-kechak", tipRu: "Техника и уют для семьи" },
  { key: "corporate", icon: Briefcase, tipEn: "Executive VIP Business Gifts", tipUz: "Premium biznes sovg'alar", tipRu: "Деловые VIP подарки" },
  { key: "other", icon: Sparkles, tipEn: "Custom Curated Surprise", tipUz: "Maxsus individual sovg'a", tipRu: "Индивидуальный подбор" },
];

const relationshipPresetsMap: Record<string, string[]> = {
  en: ["Close Friend", "Best Mate", "Spouse / Partner", "Beloved Mother", "Respected Father", "Sibling", "Colleague", "Executive / Boss"],
  uz: ["Yaqin do'st", "Eng yaqin qadrdon", "Turmush o'rtoq / Yoringiz", "Onajonim", "Otam", "Aka / Uka / Opa / Singil", "Hamkasb", "Rahbar / Boshliq"],
  ru: ["Близкий друг", "Лучший друг", "Супруг / Супруга", "Мама", "Отец", "Брат / Сестра", "Коллега", "Руководитель"],
};

const interestSuggestionsMap: Record<string, string[]> = {
  en: [
    "Artisanal Coffee & Tea",
    "Culinary & Kitchen Tech",
    "Hi-Fi Audio & Headphones",
    "Smart Home & IoT Gadgets",
    "Heritage Crafts & Ceramics",
    "Athletics & Fitness",
    "Books & Literature",
    "Gaming & Mechanical Keyboards",
    "Luxury Travel & Luggage",
    "Aesthetic Interior Decor",
  ],
  uz: [
    "Qahva & Choy anjomlari",
    "Oshpazlik & Oshxona anjomlari",
    "Quloqchin & Musiqa",
    "Aqlli Uy & Gadjetlar",
    "Milliy San'at & Kulolchilik",
    "Sport & Fitnes",
    "Kitoblar & Adabiyot",
    "Geyming & Kompyuter",
    "Sayohat & Chemodanlar",
    "Nafis Xonadon Dekori",
  ],
  ru: [
    "Кофе и чайные наборы",
    "Кулинария и посуда",
    "Аудио и наушники",
    "Умный дом и гаджеты",
    "Народные промыслы",
    "Фитнес и спорт",
    "Книги и литература",
    "Гейминг и аксессуары",
    "Путешествия",
    "Интерьерный декор",
  ],
};

const stepTitlesMap: Record<string, string[]> = {
  en: ["Occasion & Reason", "Recipient Persona", "Budget Calibration (UZS)", "Interests & Guardrails"],
  uz: ["Ayyom yoki Sabab", "Sovg'a Oluvchi Ma'lumotlari", "Byudjet (So'mda)", "Qiziqishlar & Moslashtirish"],
  ru: ["Повод или Событие", "Профиль Получателя", "Калибровка Бюджета (UZS)", "Интересы и Пожелания"],
};

export default function GiftFinderPage() {
  const { t, language } = useTranslation();
  const { formatPrice } = useCurrency();
  const [step, setStep] = useState(0);
  const [showGiftDetective, setShowGiftDetective] = useState(false);

  const relationships = relationshipPresetsMap[language] || relationshipPresetsMap["en"];
  const interests = interestSuggestionsMap[language] || interestSuggestionsMap["en"];
  const stepTitles = stepTitlesMap[language] || stepTitlesMap["en"];

  const [criteria, setCriteria] = useState<Partial<GiftCriteria>>({
    occasion: undefined,
    recipient: "",
    relationship: relationships[0],
    budgetMin: 200000,
    budgetMax: 700000,
    currency: "UZS",
    interests: [],
    avoid: [],
  });
  const [interestInput, setInterestInput] = useState("");

  const mutation = useMutation({ mutationFn: (c: any) => research.gift(c) });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "detective") {
      setShowGiftDetective(true);
    }
    const occ = params.get("occasion") as Occasion | null;
    if (occ && occasions.some((o) => o.key === occ)) {
      setCriteria((c) => ({ ...c, occasion: occ }));
      setStep(1);
    }
  }, []);

  const totalSteps = 4;

  const toggleInterest = (tag: string) => {
    const current = criteria.interests || [];
    if (current.includes(tag)) {
      setCriteria((c) => ({ ...c, interests: current.filter((x) => x !== tag) }));
    } else {
      setCriteria((c) => ({ ...c, interests: [...current, tag] }));
    }
  };

  const steps = [
    // Step 0: Occasion Picker
    <div className="space-y-6 animate-fade-in" key="step-0">
      <div className="text-center max-w-lg mx-auto mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-300 dark:border-amber-800/80">
          <Compass className="w-3.5 h-3.5" />
          <span>{language === "uz" ? "1-BOSQICH" : language === "ru" ? "ШАГ 1" : "STEP 1: OCCASION"}</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
          {language === "uz"
            ? "Qaysi Ayyom yoki Tadbir Uchun?"
            : language === "ru"
            ? "Для какого повода выбираем?"
            : "What is the Special Occasion?"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5">
          {language === "uz"
            ? "Sovg'a AI milliy an'analar va zamonaviy talablarga mos eng munosib sovg'alarni taqdim etadi."
            : language === "ru"
            ? "Искусственный интеллект подберёт идеальные варианты с учётом культурных традиций Узбекистана."
            : "Sovg'a AI cross-references verified market inventories for genuine etiquette & top-tier value."}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {occasions.map((o) => {
          const selected = criteria.occasion === o.key;
          const OccasionIcon = o.icon;
          const tip = language === "uz" ? o.tipUz : language === "ru" ? o.tipRu : o.tipEn;
          return (
            <button
              key={o.key}
              onClick={() => {
                cyberSound.playClick(1200);
                setCriteria((c) => ({ ...c, occasion: o.key }));
                setStep(1);
              }}
              className={`p-4 rounded-3xl border-2 transition-all text-left flex flex-col justify-between h-36 group cursor-pointer active:scale-95 ${
                selected
                  ? "border-amber-500 bg-gradient-to-b from-amber-500/15 via-amber-500/10 to-amber-500/5 dark:from-amber-950/50 dark:to-[#131622] shadow-md ring-2 ring-amber-500/30"
                  : "border-amber-200/70 dark:border-slate-800 bg-gradient-to-b from-white via-[#fcfaf5] to-[#f7f2e4] dark:from-[#131622] dark:to-[#0a0c14] hover:border-amber-400 dark:hover:border-slate-700 hover:shadow-luxury"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl icon-medallion flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  selected
                    ? "icon-box-gold shadow-md shadow-amber-500/25"
                    : "bg-amber-100/70 text-amber-800 dark:bg-slate-800/80 dark:text-amber-300 border border-amber-200/70 dark:border-slate-700"
                }`}
              >
                <OccasionIcon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-display font-bold text-sm text-slate-900 dark:text-white block group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">
                  {t(`occasions.${o.key}`)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-1 mt-0.5">{tip}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>,

    // Step 1: Recipient Profile
    <div className="space-y-6 max-w-xl mx-auto animate-fade-in" key="step-1">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-300 dark:border-amber-800/80">
          <UserCheck className="w-3.5 h-3.5" />
          <span>{language === "uz" ? "2-BOSQICH" : language === "ru" ? "ШАГ 2" : "STEP 2: PERSONA"}</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
          {language === "uz"
            ? "Sovg'a Kim Uchun Tanlanmoqda?"
            : language === "ru"
            ? "Для кого подбирается подарок?"
            : "Who is the Lucky Recipient?"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          {language === "uz"
            ? "Oluvchi haqida qisqacha ma'lumot bering — bu tavsiyaning aniq va qadrli chiqishini ta'minlaydi."
            : language === "ru"
            ? "Укажите немного информации, чтобы рекомендации были точными и памятными."
            : "Share a few details so our neural oracle can craft deeply personalized suggestions."}
        </p>
      </div>

      <div className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f7f2e4] dark:from-[#131622] dark:to-[#0a0c14] p-6 sm:p-7 rounded-3xl border-2 border-amber-200/80 dark:border-slate-800 shadow-luxury space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block mb-1.5">
            {language === "uz"
              ? "Sovg'a Oluvchining Ismi yoki Maqomi *"
              : language === "ru"
              ? "Имя или статус получателя *"
              : "Recipient's Name or Title *"}
          </label>
          <input
            type="text"
            placeholder={
              language === "uz"
                ? "Masalan: Ali & Madina, Dadam, Davron aka"
                : language === "ru"
                ? "Например: Али и Мадина, Папа, Рустам ака"
                : "e.g. Alex & Olivia, Dad, CEO John, Elena"
            }
            value={criteria.recipient || ""}
            onChange={(e) => setCriteria((c) => ({ ...c, recipient: e.target.value }))}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900/90 border border-amber-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-amber-500 transition"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block mb-1.5">
            {language === "uz"
              ? "Sizga Kim Bo'ladi (Munosabat)"
              : language === "ru"
              ? "Кем приходится вам (Отношения)"
              : "Relationship to You"}
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {relationships.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setCriteria((c) => ({ ...c, relationship: r }))}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  criteria.relationship === r
                    ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-xs"
                    : "bg-amber-50/80 dark:bg-slate-800 text-amber-950 dark:text-slate-200 border border-amber-200/70 dark:border-slate-700 hover:bg-amber-100 dark:hover:bg-slate-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder={language === "uz" ? "Yoki o'zingiz yozing..." : language === "ru" ? "Или введите своё..." : "Or type custom relationship..."}
            value={criteria.relationship || ""}
            onChange={(e) => setCriteria((c) => ({ ...c, relationship: e.target.value }))}
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900/90 border border-amber-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {language === "uz" ? "Yoshi (ixtiyoriy)" : language === "ru" ? "Возраст (опционально)" : "Age (Optional)"}
            </label>
            <input
              type="number"
              placeholder="e.g. 28"
              value={criteria.age || ""}
              onChange={(e) => setCriteria((c) => ({ ...c, age: parseInt(e.target.value) || undefined }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900/90 border border-amber-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {language === "uz" ? "Jinsi (ixtiyoriy)" : language === "ru" ? "Пол (опционально)" : "Gender (Optional)"}
            </label>
            <select
              value={criteria.gender || ""}
              onChange={(e) => setCriteria((c) => ({ ...c, gender: e.target.value || undefined }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900/90 border border-amber-300/80 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="">{language === "uz" ? "Farqi yo'q / Barchasi" : language === "ru" ? "Любой / Не важно" : "Any / Not specified"}</option>
              <option value="male">{language === "uz" ? "Erkak / Yigit" : language === "ru" ? "Мужчина / Парень" : "Gentleman / Male"}</option>
              <option value="female">{language === "uz" ? "Ayol / Qiz" : language === "ru" ? "Женщина / Девушка" : "Lady / Female"}</option>
              <option value="couple">{language === "uz" ? "Juftlik (Kelin-kuyov)" : language === "ru" ? "Пара (Молодожены)" : "Couple / Newlyweds"}</option>
            </select>
          </div>
        </div>
      </div>
    </div>,

    // Step 2: Budget Setting
    <div className="space-y-6 max-w-xl mx-auto animate-fade-in" key="step-2">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-300 dark:border-amber-800/80">
          <DollarSign className="w-3.5 h-3.5" />
          <span>{language === "uz" ? "3-BOSQICH" : language === "ru" ? "ШАГ 3" : "STEP 3: BUDGET"}</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
          {language === "uz"
            ? "Rejalashtirilgan Byudjetingiz Qancha?"
            : language === "ru"
            ? "Какой планируемый бюджет?"
            : "Calibrate Target Budget Window"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          {language === "uz"
            ? "Sovg'a AI faqat ushbu oraliqdagi O'zbekiston do'konlarida haqiqiy narxi tasdiqlangan tovarlarni izlaydi."
            : language === "ru"
            ? "Поиск осуществляется только по реальным подтвержденным ценам официальных магазинов Узбекистана."
            : "All results are strictly price-verified across Tashkent flagship hubs and official online stores."}
        </p>
      </div>

      <div className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f7f2e4] dark:from-[#131622] dark:to-[#0a0c14] p-6 sm:p-8 rounded-3xl border-2 border-amber-200/80 dark:border-slate-800 shadow-luxury space-y-6">
        <div className="text-center bg-gradient-to-r from-amber-100/90 via-amber-200/60 to-amber-100/90 dark:from-slate-800 dark:to-slate-900 p-4 rounded-2xl border-2 border-amber-300 dark:border-amber-500/30">
          <span className="text-xs font-bold text-amber-900 dark:text-amber-400 uppercase tracking-widest block mb-1">
            {language === "uz" ? "Tanlangan Byudjet Oralig'i" : language === "ru" ? "Выбранный Диапазон" : "Active Budget Window"}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-950 dark:text-amber-200">
            {formatPrice(criteria.budgetMin || 0)} — {formatPrice(criteria.budgetMax || 0)}
          </span>
        </div>

        {/* Quick Budget Chips */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
            {language === "uz" ? "Ommabop Byudjetlar:" : language === "ru" ? "Популярные Бюджеты:" : "Popular Market Brackets:"}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { min: 150000, max: 300000, label: "< 300K UZS" },
              { min: 300000, max: 500000, label: "300K - 500K" },
              { min: 500000, max: 800000, label: "500K - 800K" },
              { min: 800000, max: 2000000, label: "800K - 2.0M" },
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  cyberSound.playClick();
                  setCriteria((c) => ({ ...c, budgetMin: preset.min, budgetMax: preset.max }));
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  criteria.budgetMax === preset.max
                    ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white border-amber-600 shadow-xs"
                    : "bg-amber-50/80 dark:bg-slate-800 text-amber-950 dark:text-slate-200 border border-amber-200/70 dark:border-slate-700 hover:bg-amber-100 dark:hover:bg-slate-700"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>{language === "uz" ? "Minimal chegara" : language === "ru" ? "Минимум" : "Floor Minimum"}: {formatPrice(criteria.budgetMin || 0)}</span>
            </div>
            <input
              type="range"
              min={50000}
              max={3000000}
              step={50000}
              value={criteria.budgetMin || 200000}
              onChange={(e) => setCriteria((c) => ({ ...c, budgetMin: parseInt(e.target.value) }))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>{language === "uz" ? "Maksimal chegara" : language === "ru" ? "Максимум" : "Ceiling Maximum"}: {formatPrice(criteria.budgetMax || 0)}</span>
            </div>
            <input
              type="range"
              min={100000}
              max={10000000}
              step={50000}
              value={criteria.budgetMax || 700000}
              onChange={(e) => setCriteria((c) => ({ ...c, budgetMax: parseInt(e.target.value) }))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>,

    // Step 3: Interests & Avoidance
    <div className="space-y-6 max-w-xl mx-auto animate-fade-in" key="step-3">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-300 dark:border-amber-800/80">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === "uz" ? "4-BOSQICH" : language === "ru" ? "ШАГ 4" : "STEP 4: CURATION"}</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
          {language === "uz"
            ? "Qiziqishlar & Nomaqbul Buyumlar"
            : language === "ru"
            ? "Интересы и Исключения"
            : "Taste Profile & Guardrails"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          {language === "uz"
            ? "AI oddiy shablon sovg'alarni chiqarib tashlab, chin dildan yoqadigan narsalarni tanlashiga ko'maklashing."
            : language === "ru"
            ? "Помогите AI отфильтровать банальности и найти подарки, вызывающие искренний восторг."
            : "Eliminate generic clichés and pinpoint high-sentiment bespoke gifts."}
        </p>
      </div>

      <div className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f7f2e4] dark:from-[#131622] dark:to-[#0a0c14] p-6 sm:p-7 rounded-3xl border-2 border-amber-200/80 dark:border-slate-800 shadow-luxury space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block mb-2">
            {language === "uz"
              ? "Sevimli Qiziqishlar va Mashg'ulotlarni Tanlang:"
              : language === "ru"
              ? "Выберите сферы интересов:"
              : "Select Favorite Interests & Lifestyle Dimensions:"}
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {interests.map((tag) => {
              const selected = criteria.interests?.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleInterest(tag)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition border cursor-pointer ${
                    selected
                      ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white border-amber-600 shadow-xs"
                      : "bg-amber-50/80 dark:bg-slate-800 text-amber-950 dark:text-slate-200 border border-amber-200/70 dark:border-slate-700 hover:bg-amber-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {selected ? "✓ " : "+ "}
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={
                language === "uz"
                  ? "Yoki boshqa qiziqishni yozib Enter bosing..."
                  : language === "ru"
                  ? "Или введите свой интерес и нажмите Enter..."
                  : "Or type custom interest and press Enter..."
              }
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && interestInput.trim()) {
                  toggleInterest(interestInput.trim());
                  setInterestInput("");
                }
              }}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900/90 border border-amber-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block mb-1">
            {language === "uz"
              ? "Sovg'a Qilinmasligi Kerak Bo'lgan Narsalar (vergul bilan):"
              : language === "ru"
              ? "Что НЕ дарить (через запятую):"
              : "Items / Categories to Strictly Avoid (comma-separated):"}
          </label>
          <input
            type="text"
            placeholder={
              language === "uz"
                ? "Masalan: kiyim-kechak, plastik buyumlar, arzon atirlar"
                : language === "ru"
                ? "Например: одежда, пластик, дешёвый парфюм"
                : "e.g. clothing sizing, cheap plastics, duplicate mugs"
            }
            onChange={(e) =>
              setCriteria((c) => ({
                ...c,
                avoid: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              }))
            }
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900/90 border border-amber-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>
    </div>,
  ];

  const handleLaunchResearch = () => {
    cyberSound.playConfirm();
    mutation.mutate(criteria);
  };

  if (mutation.isSuccess && mutation.data) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] text-slate-900 dark:text-white py-8 transition-colors relative overflow-hidden">
        {/* Ambient luxury vignette glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1000px,100vw)] h-[380px] bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 animate-fade-in relative z-10">
          <button
            onClick={() => {
              mutation.reset();
              setStep(0);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition cursor-pointer bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 active:scale-95 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />{" "}
            {language === "uz" ? "Yangi sovg'a qidiruvi boshlash" : language === "ru" ? "Начать новый поиск подарка" : "Configure New Gift Search"}
          </button>

          <div className="border-b border-amber-200/70 dark:border-slate-800 pb-4">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              {criteria.recipient
                ? `${criteria.recipient} — ${
                    language === "uz"
                      ? "AI Sovg'a Tavsiyalari"
                      : language === "ru"
                      ? "Подборка подарков от ИИ"
                      : "AI Curated Gifts"
                  }`
                : language === "uz"
                ? "AI Sovg'a Tavsiyalari"
                : language === "ru"
                ? "Подборка подарков от ИИ"
                : "AI Curated Gift Dossier"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              {language === "uz" ? "Sabab" : language === "ru" ? "Повод" : "Occasion"}: <span className="font-semibold text-slate-900 dark:text-slate-200">{t(`occasions.${criteria.occasion}`)}</span> · {language === "uz" ? "Byudjet" : language === "ru" ? "Бюджет" : "Target Budget"}:{" "}
              <span className="font-semibold text-amber-700 dark:text-amber-400">{formatPrice(criteria.budgetMax || 0)}</span>
            </p>
          </div>

          <ResearchResults result={mutation.data} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] text-slate-900 dark:text-white py-8 sm:py-12 transition-colors relative overflow-hidden">
      {/* Ambient luxury vignette glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1000px,100vw)] h-[380px] bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 relative z-10">
      {/* ─── VIP AI GIFT DETECTIVE LAUNCHER BANNER ─── */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            cyberSound.playConfirm();
            setShowGiftDetective(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-indigo-500/15 border border-amber-400/50 hover:border-amber-400 text-slate-800 dark:text-slate-200 text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer shadow-sm group"
        >
          <Fingerprint className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>
            {language === "uz"
              ? "Yangi: AI Sovg'a Detektivi (Psixologik DNA Scanner) rejimini ochish"
              : language === "ru"
              ? "Новинка: AI Детектив Подарков (Психологический ДНК Сканер)"
              : "Launch AI Gift Detective & Psychological DNA Scanner"}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Stepper Progress Header */}
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-amber-700 dark:text-amber-400 font-extrabold uppercase tracking-wider">
            {language === "uz"
              ? `${step + 1}-BOSQICH / JAMI ${totalSteps} TA`
              : language === "ru"
              ? `ШАГ ${step + 1} ИЗ ${totalSteps}`
              : `STEP ${step + 1} OF ${totalSteps}`}
          </span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">{stepTitles[step]}</span>
        </div>
        <div className="w-full h-2.5 bg-amber-100/90 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-amber-200/60 dark:border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-full transition-all duration-300 shadow-xs"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {mutation.isPending ? (
        <div className="text-center py-16 space-y-5">
          <div className="w-14 h-14 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
              {language === "uz"
                ? "O'zbekistonda Jonli Mahsulotlar Izlanmoqda..."
                : language === "ru"
                ? "Поиск актуальных предложений в Узбекистане..."
                : "Scanning Uzbekistan Retail Telemetry in Real-Time..."}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {language === "uz"
                ? "Uzum Market, Texnomart, MediaPark va Toshkentdagi rasmiy do'konlarda real narxlar, zaxira va yetkazib berish shartlari tekshirilmoqda."
                : language === "ru"
                ? "Сверяем актуальные цены, складские остатки и условия доставки в Uzum, Texnomart, MediaPark и Asaxiy."
                : "Aggregating live stock, delivery guarantees, and authentic warranty pricing from Uzum, Texnomart, MediaPark & Asaxiy."}
            </p>
          </div>
          <div className="max-w-3xl mx-auto mt-6">
            <ResearchSkeleton />
          </div>
        </div>
      ) : (
        <div>{steps[step]}</div>
      )}

      {/* Navigation Controls */}
      {!mutation.isPending && (
        <div className="max-w-xl mx-auto flex items-center justify-between pt-5 border-t border-amber-200/70 dark:border-slate-800">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" /> {language === "uz" ? "Ortga" : language === "ru" ? "Назад" : "Back"}
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={() => {
                cyberSound.playClick();
                setStep(step + 1);
              }}
              disabled={step === 0 && !criteria.occasion}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:brightness-105 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-500/25 transition disabled:opacity-30 cursor-pointer active:scale-95"
            >
              {language === "uz" ? "Davom etish" : language === "ru" ? "Продолжить" : "Continue"}{" "}
              <ArrowRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          ) : (
            <button
              onClick={handleLaunchResearch}
              disabled={!criteria.occasion}
              className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:brightness-105 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/30 transition cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-200 stroke-[2.2]" />{" "}
              {language === "uz"
                ? "Eng Maqbul Variantlarni Topish"
                : language === "ru"
                ? "Найти лучшие предложения"
                : "Synthesize Optimal Gifts"}
            </button>
          )}
        </div>
      )}

      {/* AI Gift Detective & Psychological Persona DNA Modal */}
      <GiftDetectiveModal
        isOpen={showGiftDetective}
        onClose={() => setShowGiftDetective(false)}
      />
      </div>
    </div>
  );
}
