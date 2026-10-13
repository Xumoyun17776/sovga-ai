import { Heart, Gift, Users, Home } from "../lib/icons";
import { useTranslation } from "../lib/i18n";
import SectionHeader from "./SectionHeader";

// Example ways people use Sovg'a. These are illustrative scenarios, not customer
// reviews — replace them with real, attributed reviews once you collect them.
const useCases = [
  {
    icon: Heart,
    title: { uz: "To'y ro'yxati", ru: "Свадебный список", en: "A wedding registry" },
    text: {
      uz: "Kelin-kuyov kerakli narsalar ro'yxatini tuzib, havolani qarindoshlarga yuboradi. Kim nimani olganini hamma ko'radi — beshta bir xil choynak kelmaydi.",
      ru: "Молодые составляют список нужных вещей и отправляют ссылку родственникам. Все видят, кто что берёт, — пяти одинаковых чайников не будет.",
      en: "A couple lists what they need and sends the link to relatives. Everyone can see what's been taken, so nobody brings the fifth identical kettle.",
    },
  },
  {
    icon: Gift,
    title: { uz: "Onaga tug'ilgan kun sovg'asi", ru: "Подарок маме на день рождения", en: "A birthday gift for mum" },
    text: {
      uz: "Kofe mashinasini qidirib, Uzum, Texnomart va MediaPark narxlarini bitta sahifada solishtirish va eng arzonini kafolati bilan tanlash.",
      ru: "Ищете кофемашину и сравниваете цены Uzum, Texnomart и MediaPark на одной странице, выбирая самый выгодный вариант с гарантией.",
      en: "Searching for a coffee machine and comparing Uzum, Texnomart and MediaPark on one page, then picking the cheapest one with a warranty.",
    },
  },
  {
    icon: Users,
    title: { uz: "Hamkasbga jamoaviy sovg'a", ru: "Общий подарок коллеге", en: "A team gift for a colleague" },
    text: {
      uz: "Jamoa byudjet belgilaydi, har kim o'z ulushini Payme yoki Click orqali yuboradi, kim to'laganini ro'yxatda kuzatib boradi.",
      ru: "Команда задаёт бюджет, каждый переводит свою долю через Payme или Click, а в списке видно, кто уже заплатил.",
      en: "The team sets a budget, everyone sends their share via Payme or Click, and the list shows who has already paid.",
    },
  },
  {
    icon: Home,
    title: { uz: "Yangi uyga sovg'a", ru: "Подарок на новоселье", en: "A housewarming present" },
    text: {
      uz: "Rishton choy to'plami kabi milliy sovg'a tanlash va muddatli to'lov kalkulyatori bilan oylik to'lovni oldindan bilish.",
      ru: "Выбрать национальный подарок вроде риштанского чайного сервиза и заранее посчитать ежемесячный платёж в рассрочку.",
      en: "Choosing a traditional gift like a Rishton tea set and working out the monthly installment before buying.",
    },
  },
];

export default function TestimonialsSection() {
  const { language } = useTranslation();
  const lang = (language === "uz" || language === "ru" ? language : "en") as "uz" | "ru" | "en";

  return (
    <section className="reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        align="center"
        eyebrow={lang === "uz" ? "Misollar" : lang === "ru" ? "Примеры" : "Use cases"}
        title={lang === "uz" ? <>Sovg'adan qanday <span className="text-gold-gradient">foydalanishadi</span></> : lang === "ru" ? <>Как пользуются <span className="text-gold-gradient">Sovg'a</span></> : <>How people <span className="text-gold-gradient">use Sovg'a</span></>}
        subtitle={
          lang === "uz"
            ? "Bir nechta odatiy vaziyatlar."
            : lang === "ru"
            ? "Несколько типичных ситуаций."
            : "A few typical situations."
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {useCases.map((u, i) => (
          <div key={u.title.en} className="group surface-card is-interactive rounded-2xl p-6">
            <span className={`tile ${["tile-rose", "tile-orange", "tile-sky", "tile-emerald"][i % 4]} mb-4`}>
              <u.icon className="w-5 h-5" />
            </span>
            <h3 className="font-semibold text-slate-900 dark:text-white">{u.title[lang]}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{u.text[lang]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
