import { useState } from "react";
import { Link } from "wouter";
import { useToast } from "../components/Toast";
import { useTranslation } from "../lib/i18n";
import {
  Heart,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Search,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Gift,
  Users,
  Home,
  Baby,
  Briefcase,
  Cake,
} from "lucide-react";

interface EtiquetteRule {
  relationId: string;
  relationNameUz: string;
  relationNameRu: string;
  relationNameEn: string;
  roleUz: string;
  roleRu: string;
  roleEn: string;
  recommendedIdeas: string[];
  taboosAndWarnings: string[];
  traditionalBlessings: string[];
  recommendedColorPackaging: string;
}

const ETIQUETTE_DATA: Record<string, EtiquetteRule> = {
  qaynona_qaynota: {
    relationId: "qaynona_qaynota",
    relationNameUz: "Qaynona & Qaynota",
    relationNameRu: "Свекровь / Теща & Свёкор / Тесть",
    relationNameEn: "Mother & Father-in-Law",
    roleUz: "Oiladagi eng ehtiromli kattalar",
    roleRu: "Самые уважаемые старшие в семье",
    roleEn: "Most revered elders of the family",
    recommendedIdeas: [
      "Sifatli chinni yoki zardo'zi choynak-piyola to'plami",
      "Elektron oyoq yoki orqa massajori (salomatlik uchun)",
      "Premium termos yoki qadimiy uslubdagi samovar",
      "Mayin paxta yoki ipak ko'rpacha / gilamcha",
      "Umra / Haj ziyorati aksessuarlari yoki xushbo'y mushklar",
    ],
    taboosAndWarnings: [
      "Hech qachon o'tkir buyumlar (pichoq, qaychi) bermaslik ma'qul. Agar berilsa, ramziy 1 tanga so'rash urfi bor.",
      "Qora yoki xira rangli qadoqlardan qoching — oq, zumrad yoki tillarang qadoqlar afzal.",
      "Haddan tashqari shaxsiy kosmetika yoki kiyim bermaslik (o'lchami to'g'ri kelmasligi noqulaylik tug'diradi).",
    ],
    traditionalBlessings: [
      "Xonadoningizdan fayz-u baraka, tinchlik-omonlik arimasin. Duolaringiz hamisha boshimizga soya bo'lsin!",
      "Ilohim umringiz uzoq, risqingiz baland bo'lsin. Farzandlar kamolini ko'rib yuring!",
    ],
    recommendedColorPackaging: "Zumrad yashil, qaymoqrang yoki tilla zarlari bo'lgan qadoq.",
  },
  kelin_salom: {
    relationId: "kelin_salom",
    relationNameUz: "Kelin Salom & Yangi Oila",
    relationNameRu: "Келин Салом & Молодая Семья",
    relationNameEn: "New Bride & Young Couple",
    roleUz: "Xonadonning yangi fayzi",
    roleRu: "Новый уют и радость дома",
    roleEn: "Grace & warmth of the new household",
    recommendedIdeas: [
      "Oshxona uchun zamonaviy kofe mashinasi yoki blender",
      "Sifatli turk yoki nemis kastryulka / tova to'plami",
      "Ipak ro'mol yoki atlas / adras matolari",
      "Yotoqxona uchun hashamatli satin choyshab to'plami",
      "Chiroyli vaza yoki xonadon interyeri aksessuarlari",
    ],
    taboosAndWarnings: [
      "Arzon, sifatsiz yoki tez sinuvchi shisha idishlardan ehtiyot bo'ling.",
      "Kelin salom sovg'asi albatta toza va ko'rkam qadoqlangan bo'lishi shart.",
      "Takrorlanadigan (5 xil bir xil choynak) sovg'alardan saqlanish uchun To'y Registratsiyasidan foydalaning.",
    ],
    traditionalBlessings: [
      "Qadamingiz qutlug' bo'lsin! Yangi xonadoningizda baxt, totuvlik va shirin kulgilar jaranglasin!",
      "Ilohim qo'sha qaringlar, ikki dunyo saodatiga erishinglar!",
    ],
    recommendedColorPackaging: "Pushti, oq atlas yoki tilla rangli lentalar.",
  },
  ota_ona: {
    relationId: "ota_ona",
    relationNameUz: "Ota-onamiz",
    relationNameRu: "Наши Родители",
    relationNameEn: "Beloved Parents",
    roleUz: "Hayotimiz ustuni va suyanchig'i",
    roleRu: "Опора и главное благословение жизни",
    roleEn: "Foundations & pillars of our lives",
    recommendedIdeas: [
      "Ortopedik qulay yostiq yoki massaj kreslosi / apparati",
      "Qon bosimi (tonometr) yoki salomatlik monitoringi moslamasi",
      "Issiq jun ko'rpa yoki hashamatli qishki chopon / nimcha",
      "Oila suratlari jamlangan maxsus raqamli foto-ramka",
      "Sanatoriy yoki oromgoh yo'llanmasi",
    ],
    taboosAndWarnings: [
      "Pulni shunchaki berishdan ko'ra, e'tibor bilan tanlangan buyum ancha qadrliroq.",
      "Narxini aytish yoki chekni qoldirish o'zbek odobiga zid.",
    ],
    traditionalBlessings: [
      "Boshimizning toji, duogo'yimiz! Yuzingizdan nur, qalbingizdan halovat arimasin. Bizning baxtimizga sog' bo'ling!",
    ],
    recommendedColorPackaging: "To'q ko'k, qaymoqrang yoki oliyjanob kumush hoshiyali qadoq.",
  },
  rahbar_ustoz: {
    relationId: "rahbar_ustoz",
    relationNameUz: "Ustoz / Hamkasb / Rahbar",
    relationNameRu: "Наставник / Коллега / Руководитель",
    relationNameEn: "Mentor / Colleague / Executive",
    roleUz: "Professional va ma'rifiy hurmat",
    roleRu: "Профессиональное и академическое уважение",
    roleEn: "Professional & esteemed intellectual respect",
    recommendedIdeas: [
      "Charm muqovali nufuzli kundalik va Parker qalami",
      "O'zbekiston tarixi yoki san'atiga oid nafis ensiklopediya",
      "Premium kapsulali kofe mashinasi yoki stol usti termos stakani",
      "Eksklyuziv choy to'plami va tog' asali to'plami",
    ],
    taboosAndWarnings: [
      "Shaxsiy atir yoki kiyim bermaslik (etikaga to'g'ri kelmaydi).",
      "Haddan tashqari qimmatbaho buyum pora yoki xushomad kabi ko'rinmasligi uchun me'yorni saqlash.",
    ],
    traditionalBlessings: [
      "Mashaqqatli va sharafli mehnatingizda zafarlar tilaymiz! Sizning ko'rsatgan yo'lingiz hamisha qadrli.",
    ],
    recommendedColorPackaging: "Obsidian qora, to'q kulrang va minimalist shveytsarcha hoshiya.",
  },
  chaqaloq: {
    relationId: "chaqaloq",
    relationNameUz: "Yangi Chaqaloq & Chilla",
    relationNameRu: "Новорожденный & Чилля",
    relationNameEn: "Newborn Baby & Chilla",
    roleUz: "Yangi tug'ilgan jajji mehmonga",
    roleRu: "Для маленького нового члена семьи",
    roleEn: "For the newborn bundle of joy",
    recommendedIdeas: [
      "Xona namlagichi (Humidifier) va havo tozalagich",
      "Kumush bolalar qoshig'i yoki tilla to'g'nog'ich (ko'zmunchoq)",
      "Paxtali organik chaqaloq kiyimlari to'plami",
      "Avto-kreslo yoki sifatli bolalar aravachasi",
      "Chaqaloqning ilk oylari xotira albomi",
    ],
    taboosAndWarnings: [
      "Sintetik yoki qattiq bo'yoqli kiyimlardan mutlaqo saqlanish kerak.",
      "Kuchli hidli sovun yoki noorganik parvarish vositalarini bermaslik.",
    ],
    traditionalBlessings: [
      "Kichkintoyning qadami qutlug' bo'lsin! Ota-onasiga rahmat keltiradigan, el suygan inson bo'lib ulg'aysin!",
    ],
    recommendedColorPackaging: "Och havorang, och yalpiz yoki mayin shaftolirang qadoq.",
  },
};

export default function CulturalEtiquettePage() {
  const toast = useToast();
  const { language } = useTranslation();
  const [selectedRelation, setSelectedRelation] = useState<string>("qaynona_qaynota");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Quick Taboo Checker query
  const [inspectQuery, setInspectQuery] = useState("");
  const [inspectVerdict, setInspectVerdict] = useState<any | null>(null);

  const current = ETIQUETTE_DATA[selectedRelation] || ETIQUETTE_DATA.qaynona_qaynota;

  const getRelationTitle = (item: EtiquetteRule) => {
    if (language === "ru") return item.relationNameRu;
    if (language === "en") return item.relationNameEn;
    return item.relationNameUz;
  };

  const getRoleTitle = (item: EtiquetteRule) => {
    if (language === "ru") return item.roleRu;
    if (language === "en") return item.roleEn;
    return item.roleUz;
  };

  const handleCopyBlessing = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success(
      language === "uz"
        ? "Ezgu tilak nusxalandi!"
        : language === "ru"
        ? "Пожелание скопировано!"
        : "Dedication copied!",
      language === "uz" ? "Nusxalandi" : "Copied"
    );
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const evaluateEtiquette = (rawQuery: string) => {
    if (!rawQuery.trim()) return;
    const q = rawQuery.toLowerCase();
    setInspectQuery(rawQuery);

    if (q.includes("pichoq") || q.includes("нож") || q.includes("knife") || q.includes("qaychi") || q.includes("o'tkir")) {
      setInspectVerdict({
        item: rawQuery,
        status: "warning",
        title:
          language === "uz"
            ? "⚠️ O'tkir buyumlar odobi"
            : language === "ru"
            ? "⚠️ Этикет острых предметов"
            : "⚠️ Sharp Objects Etiquette",
        explanation:
          language === "uz"
            ? "O'zbek madaniyatida pichoq yoki o'tkir buyum sovg'a qilinganda munosabatlar 'kesilmasligi' uchun oluvchi ramziy ma'noda 1 tanga yoki 1000 so'm berib, buyumni 'sotib olgan' hisoblanadi. Shuningdek, pichoq albatta qinida va ehtirom bilan topshiriladi."
            : language === "ru"
            ? "В узбекской традиции при дарении ножа или острых предметов получатель символически дает монетку, чтобы 'купить' вещь и не 'разрезать' дружбу. Нож всегда преподносится в чехле."
            : "In Uzbek traditions, gifting a knife or sharp blade requires the recipient to give a nominal coin (e.g. 1,000 UZS) to symbolically 'buy' it, preserving harmonious relations. It must always be presented in a sheath.",
      });
    } else if (q.includes("soat") || q.includes("часы") || q.includes("watch")) {
      setInspectVerdict({
        item: rawQuery,
        status: "info",
        title:
          language === "uz"
            ? "ℹ️ Soat sovg'a qilish odobi"
            : language === "ru"
            ? "ℹ️ Этикет дарения часов"
            : "ℹ️ Watch & Timepiece Etiquette",
        explanation:
          language === "uz"
            ? "Soat — hurmat va vaqt qadri ramzi. Kattalarga yoki hamkasbga sovg'a qilish juda ma'qul. Ba'zi qadimiy e'tiqodlarga ko'ra, yaqin do'stga soat berilganda ham ramziy tanga so'rash urfi uchraydi."
            : language === "ru"
            ? "Часы — символ глубокого уважения и ценности времени. Прекрасный подарок старшим и коллегам."
            : "A watch symbolizes esteem and valuing time together. An honorable gift for mentors, colleagues, and elders.",
      });
    } else if (q.includes("ro'mol") || q.includes("платок") || q.includes("scarf") || q.includes("atlas") || q.includes("adras") || q.includes("ipak")) {
      setInspectVerdict({
        item: rawQuery,
        status: "good",
        title:
          language === "uz"
            ? "✦ Yuksak qadrlanadigan an'anaviy sovg'a"
            : language === "ru"
            ? "✦ Высокочтимый традиционный подарок"
            : "✦ Highly Treasured Heritage Gift",
        explanation:
          language === "uz"
            ? "Milliy matolar, ipak ro'mol va adras — o'zbek oilalarida onalar, qizlar va kelinlar uchun eng fayzli, oq niyatli va hurmatga to'la sovg'a hisoblanadi. Hech qanday taboolarga ega emas."
            : language === "ru"
            ? "Шелковые платки, атлас и адрас — благороднейший подарок для матерей, дочерей и невесток, символизирующий чистоту и почтение."
            : "Silken scarves, Adras, and Atlas fabrics embody purity, grace, and deepest filial respect in Uzbek culture.",
      });
    } else if (q.includes("pul") || q.includes("деньги") || q.includes("money") || q.includes("konvert") || q.includes("зарф")) {
      setInspectVerdict({
        item: rawQuery,
        status: "info",
        title:
          language === "uz"
            ? "✉️ Pul sovg'a qilish odobi"
            : language === "ru"
            ? "✉️ Этикет дарения денег"
            : "✉️ Cash Envelope Etiquette",
        explanation:
          language === "uz"
            ? "O'zbek to'ylari va marosimlarida pul sovg'a qilish odatiy hol. Lekin uni ochiq bermasdan, toza oq yoki tilla hoshiyali maxsus tabriknoma konvertiga solib, ikki qo'llab topshirish yuksak ehtirom belgisidir."
            : language === "ru"
            ? "Дарение денег уместно на свадьбах и юбилеях. Главное правило: купюры должны быть новыми и преподнесены в праздничном конверте обеими руками."
            : "Cash is customary at celebrations. Best etiquette dictates presenting crisp notes inside an elegant ceremonial envelope handed with both hands.",
      });
    } else if (q.includes("atir") || q.includes("духи") || q.includes("perfume") || q.includes("parfyum")) {
      setInspectVerdict({
        item: rawQuery,
        status: "good",
        title:
          language === "uz"
            ? "🌸 Xushbo'y ifor & Parfyumeriya"
            : language === "ru"
            ? "🌸 Благовония и Парфюмерия"
            : "🌸 Fragrance & Fine Perfumery",
        explanation:
          language === "uz"
            ? "Sunnat va an'analarga ko'ra, xushbo'ylik sovg'a qilish eng maqtovli amallardan biridir. O'zbek xonadonlarida mushk, ud va xushbo'y atirlar barcha yoshdagilar tomonidan minnatdorlik bilan qabul qilinadi."
            : language === "ru"
            ? "По традициям дарение приятных ароматов — одно из самых похвальных действий. Высоко ценится во всех поколениях."
            : "Gifting pleasant scents carries rich spiritual and cultural praise. Musk, oud, and fine scents are gratefully welcomed.",
      });
    } else {
      setInspectVerdict({
        item: rawQuery,
        status: "good",
        title:
          language === "uz"
            ? "✓ Munosib va maqbul tanlov"
            : language === "ru"
            ? "✓ Достойный и уместный выбор"
            : "✓ Appropriate & Suitable Selection",
        explanation:
          language === "uz"
            ? `"${rawQuery}" o'zbek xalqining mehmondo'stlik va samimiyat tamoyillariga to'liq mos keladi. Eng muhimi — pok niyat, ko'rkam qadoqlash va ehtirom bilan topshirish.`
            : language === "ru"
            ? `"${rawQuery}" полностью соответствует традициям узбекского гостеприимства. Главное — чистое намерение и красивая подача.`
            : `"${rawQuery}" harmonizes with hospitality and warmth. Sincere intention, graceful packaging, and two-handed presentation ensure delight.`,
      });
    }
  };

  const handleInspect = (e: React.FormEvent) => {
    e.preventDefault();
    evaluateEtiquette(inspectQuery);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors bg-[#fcfbf9] dark:bg-[#07080c] relative overflow-hidden">
      {/* Ambient luxury glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-400/25 to-amber-500/15 border-2 border-amber-300/80 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-widest shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
            <span>
              {language === "uz"
                ? "Madaniy Intellekt & Sharqona Sovg'a Odobi"
                : language === "ru"
                ? "Культурный Интеллект & Восточный Этикет"
                : "Cultural Intelligence & Eastern Gifting Etiquette"}
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
            {language === "uz"
              ? "O'zbek Sovg'a Odobi & Urf-odat AI"
              : language === "ru"
              ? "Узбекский Этикет Подарков & Традиции AI"
              : "Uzbek Gifting Etiquette & Heritage AI"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {language === "uz"
              ? "O'zbek xonadonlaridagi nozik munosabatlar, kelin-kuyov odoblari va an'anaviy taboolarni inobatga olgan holda sovg'a tanlang. Kimga nima yarashadi va nimalardan saqlanish kerakligini bilib oling."
              : language === "ru"
              ? "Подбирайте подарки с учетом тонкостей семейных отношений в Узбекистане, свадебных традиций и культурных правил. Узнайте, что дарить подобает, а чего избегать."
              : "Curate meaningful gifts aligned with Uzbek family traditions, respect for elders, wedding customs, and cultural guidelines."}
          </p>
        </div>

        {/* Relationship Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {Object.keys(ETIQUETTE_DATA).map((key) => {
            const item = ETIQUETTE_DATA[key];
            const isSelected = selectedRelation === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedRelation(key)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer active:scale-95 ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 font-black shadow-md shadow-amber-500/25 border-2 border-amber-400 scale-102"
                    : "bg-white/90 dark:bg-slate-900/80 hover:bg-amber-50/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-amber-200/60 dark:border-slate-800"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 stroke-[2.2] ${isSelected ? "text-slate-950 fill-slate-950" : "text-amber-500"}`} />
                <span>{getRelationTitle(item)}</span>
              </button>
            );
          })}
        </div>

        {/* Main Guidance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Recommended vs Taboos */}
          <div className="lg:col-span-7 space-y-6">
            {/* Approved & Recommended Box */}
            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 sm:p-7 border-2 border-emerald-300/80 dark:border-emerald-500/30 shadow-luxury space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border-2 border-emerald-300 dark:border-emerald-800 shadow-xs">
                  <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    {language === "uz"
                      ? "Eng Munosib va Qadrlanadigan Sovg'alar"
                      : language === "ru"
                      ? "Наиболее Уместные и Ценные Подарки"
                      : "Most Respected & Treasured Gifts"}
                  </h3>
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold">{getRoleTitle(current)}</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                {current.recommendedIdeas.map((idea, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border-2 border-emerald-200/60 dark:border-emerald-500/20 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-3 group hover:border-emerald-400 dark:hover:border-emerald-500 transition shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 stroke-[2.2] flex-shrink-0 mt-0.5" />
                      <span>{idea}</span>
                    </div>
                    <Link
                      href={`/search?q=${encodeURIComponent(idea)}`}
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95"
                    >
                      <span>{language === "uz" ? "Izlash" : language === "ru" ? "Найти" : "Search"}</span>
                      <ArrowRight className="w-3 h-3 stroke-[2.2]" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural Warnings & Taboos Box */}
            <div className="bg-gradient-to-br from-white via-[#fff8f8] to-[#fcf2f2] dark:from-[#180f14] dark:via-[#140b10] dark:to-[#0d070a] rounded-3xl p-6 sm:p-7 border-2 border-rose-300/80 dark:border-rose-500/30 shadow-luxury space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center border-2 border-rose-300 dark:border-rose-800 shadow-xs">
                  <AlertTriangle className="w-4.5 h-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    {language === "uz"
                      ? "Madaniy Nozikliklar & Ehtiyot Bo'lish Kerak Bo'lgan Holatlar"
                      : language === "ru"
                      ? "Тонкости Этикета & Предостережения"
                      : "Cultural Nuances & Etiquette Precautions"}
                  </h3>
                  <span className="text-[11px] text-rose-800 dark:text-rose-400 font-semibold">
                    {language === "uz" ? "Urf-odat va tushunmovchiliklar oldini olish" : "Avoid misunderstandings"}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                {current.taboosAndWarnings.map((warn, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/40 text-xs text-rose-950 dark:text-rose-200 font-medium flex items-start gap-2.5 leading-relaxed"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 stroke-[2.2] flex-shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Packaging Advice */}
            <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-yellow-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border-2 border-amber-200/80 dark:border-amber-500/30 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
              <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400 stroke-[2.2] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  {language === "uz"
                    ? "Tavsiya etiladigan qadoq rangi:"
                    : language === "ru"
                    ? "Рекомендуемый цвет упаковки:"
                    : "Recommended Packaging Tone:"}
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{current.recommendedColorPackaging}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Traditional Blessings (Duolar) & Interactive Taboo Checker */}
          <div className="lg:col-span-5 space-y-6">
            {/* Traditional Blessings & Dedications */}
            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 sm:p-7 border-2 border-amber-200/80 dark:border-amber-500/25 shadow-luxury space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 stroke-[2.2]" />
                <span>
                  {language === "uz"
                    ? "Kartaga yozish uchun ezgu tilaklar (Duolar)"
                    : language === "ru"
                    ? "Благословения и Пожелания для Открытки"
                    : "Traditional Blessings for Greeting Card"}
                </span>
              </h3>

              <div className="space-y-3">
                {current.traditionalBlessings.map((b, idx) => (
                  <div key={idx} className="p-4.5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border-2 border-amber-200/60 dark:border-slate-800 space-y-3 shadow-2xs">
                    <p className="text-xs italic text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                      "{b}"
                    </p>
                    <button
                      onClick={() => handleCopyBlessing(b, idx)}
                      className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1.5 transition ml-auto cursor-pointer active:scale-95 px-2.5 py-1 rounded-lg hover:bg-amber-100/60 dark:hover:bg-slate-800"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 stroke-[2.2]" />
                      )}
                      <span>
                        {copiedIndex === idx
                          ? (language === "uz" ? "Nusxalandi!" : language === "ru" ? "Скопировано!" : "Copied!")
                          : (language === "uz" ? "Matnni nusxalash" : language === "ru" ? "Скопировать" : "Copy text")}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Item Inspector */}
            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 sm:p-7 border-2 border-amber-200/80 dark:border-amber-500/25 shadow-luxury space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                <span>
                  {language === "uz"
                    ? "Sovg'a Odobini Tekshiruvchi AI"
                    : language === "ru"
                    ? "AI Проверка Этикета Подарка"
                    : "AI Gifting Etiquette Inspector"}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === "uz"
                  ? "Biror buyum sovg'a qilish to'g'ri yoki noto'g'riligiga ikkilanyapsizmi? Nomini yozing yoki tanlang:"
                  : language === "ru"
                  ? "Сомневаетесь, уместен ли данный подарок? Введите название или выберите пример:"
                  : "Unsure if a certain gift is appropriate? Type its name or pick a quick suggestion:"}
              </p>

              <form onSubmit={handleInspect} className="flex gap-2">
                <input
                  type="text"
                  value={inspectQuery}
                  onChange={(e) => setInspectQuery(e.target.value)}
                  placeholder={
                    language === "uz"
                      ? "masalan: Pichoq, Soat yoki Ro'mol..."
                      : language === "ru"
                      ? "например: Нож, Часы или Платок..."
                      : "e.g. Knife, Watch, or Scarf..."
                  }
                  className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200/80 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
                >
                  {language === "uz" ? "Tekshirish" : language === "ru" ? "Проверить" : "Inspect"}
                </button>
              </form>

              {/* Quick suggestion chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(language === "ru"
                  ? ["Нож", "Часы", "Шелковый платок", "Деньги в конверте", "Духи", "Чапан / Халат"]
                  : language === "en"
                  ? ["Knife", "Watch", "Silk Scarf", "Cash Envelope", "Perfume", "Chapan Robe"]
                  : ["Pichoq", "Soat", "Ipak ro'mol", "Pul / Konvert", "Xushbo'y atir", "To'n / Chopon"]
                ).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => evaluateEtiquette(tag)}
                    className="px-2.5 py-1 rounded-lg bg-amber-100/70 hover:bg-amber-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-950 dark:text-amber-300 text-[11px] font-semibold border border-amber-300/80 dark:border-slate-700 transition cursor-pointer active:scale-95 shadow-2xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {inspectVerdict && (
                <div
                  className={`p-4 rounded-2xl border-2 space-y-1.5 text-xs animate-fade-in shadow-xs ${
                    inspectVerdict.status === "warning"
                      ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-600/50 text-amber-950 dark:text-amber-200"
                      : inspectVerdict.status === "info"
                      ? "bg-sky-50/90 dark:bg-sky-950/40 border-sky-300 dark:border-sky-600/50 text-sky-950 dark:text-sky-200"
                      : "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/50 text-emerald-950 dark:text-emerald-200"
                  }`}
                >
                  <span className="font-bold block">{inspectVerdict.title}</span>
                  <p className="leading-relaxed font-normal">{inspectVerdict.explanation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
