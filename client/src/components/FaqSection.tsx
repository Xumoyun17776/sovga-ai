import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useTranslation } from "../lib/i18n";

interface FaqItem {
  qUz: string;
  qRu: string;
  qEn: string;
  aUz: string;
  aRu: string;
  aEn: string;
}

const faqs: FaqItem[] = [
  {
    qUz: "Sovg'a AI narxlarni qanday aniqlaydi va nega narxlar aniq?",
    qRu: "Как Sovg'a AI определяет цены и почему они точны?",
    qEn: "How does Sovg'a AI determine prices and why are they accurate?",
    aUz: "Sovg'a AI O'zbekistonning rasmiy do'konlari (Uzum Market, Texnomart, MediaPark, Idea, iStore, Craft Bazaar) ma'lumotlarini to'g'ridan-to'g'ri tekshiradi. Oddiy botlardan farqli o'laroq, tizim hech qachon mavjud bo'lmagan narx yoki soxta chegirmalarni to'qimaydi. Barcha narxlar so'mda (UZS) va O'zbekiston Markaziy Banki (CBU) rasmiy kursi bo'yicha hisoblanadi.",
    aRu: "Sovg'a AI напрямую проверяет данные ведущих магазинов Узбекистана (Uzum Market, Texnomart, MediaPark, Idea, iStore, Craft Bazaar). В отличие от обычных ботов, платформа никогда не генерирует фейковые цены или несуществующие скидки. Все цены указаны в сумах (UZS) с конвертацией по официальному курсу ЦБ РУз.",
    aEn: "Sovg'a AI directly scans official stores across Uzbekistan (Uzum Market, Texnomart, MediaPark, Idea, iStore, Craft Bazaar). Unlike generic chatbots, the platform never invents hallucinated prices or fake discounts. All prices are tracked in Uzbek Som (UZS) and calibrated against the Central Bank of Uzbekistan (CBU) exchange rates.",
  },
  {
    qUz: "To'y registridagi 'Takrorlanishning Oldini Olish' qanday ishlaydi?",
    qRu: "Как работает защита от дубликатов в Свадебном Реестре?",
    qEn: "How does 'Duplicate Prevention' in Wedding Registry work?",
    aUz: "Kelin-kuyov yoki yosh oila o'zlari orzu qilgan maishiy texnika va uy-ro'zg'or buyumlari ro'yxatini tuzadi. Mehmon havola orqali kirib, 'Sovg'a qilishni band qilish' tugmasini bosadi. Natijada boshqa mehmonlar bu narsa allaqachon tanlanganini ko'radi va takroriy sovg'a sotib olishining oldi olinadi. Kelin-kuyov esa sovg'ani to'y kunigacha kim sovg'a qilganini ko'rmasligi mumkin (Surprise Mode).",
    aRu: "Молодожены составляют список желаемой техники и товаров для дома. Гости переходят по ссылке и бронируют подарок в один клик. Другие гости видят, что товар уже зарезервирован, что полностью исключает дублирование подарков. При этом жених и невеста могут включить 'Режим Сюрприза', чтобы не знать имя дарителя до дня свадьбы.",
    aEn: "The newlyweds create their wishlist of desired appliances and home goods. Guests follow the link and reserve an item with a single click. Other guests immediately see that the gift is claimed, preventing awkward duplicate gifts. Couples can also enable 'Surprise Mode' so recipient identities stay hidden until the celebration.",
  },
  {
    qUz: "Mehmonlar sovg'ani band qilishi uchun saytdan ro'yxatdan o'tishi shartmi?",
    qRu: "Нужно ли гостям регистрироваться, чтобы забронировать подарок?",
    qEn: "Do guests need an account to reserve a gift?",
    aUz: "Yo'q, shart emas! Sovg'a AI ommaviy wishlists va to'y registrlari uchun 'Mehmon rejimi'ni qo'llab-quvvatlaydi. Mehmon shunchaki o'z ismini yozib, 1 bosishda sovg'ani band qilishi va tilak xabarini qoldirishi mumkin.",
    aRu: "Нет, не нужно! Sovg'a AI поддерживает гостевой режим для публичных вишлистов. Гость может просто ввести свое имя, забронировать подарок в один клик и оставить теплое пожелание.",
    aEn: "No, registration is completely optional! Sovg'a AI supports instant 'Guest Mode' for public wishlists. Guests can simply enter their name, claim an item in 1 click, and leave a heartfelt blessing.",
  },
  {
    qUz: "Halol Muddatli To'lov (Nasiya) qanday ishlaydi?",
    qRu: "Как работает Халяльная Рассрочка (Насия)?",
    qEn: "How do Halal Installments (Nasiya) work?",
    aUz: "Platformamiz Uzum Nasiya, Alif Nasiya va Anorbank bilan integratsiya qilingan. Mahsulot oynasida oylik to'lov summasi 3, 6, 12 yoki 24 oyga bo'lib ko'rsatiladi. Foydalanuvchilar foizsiz va kechikish jarimalarisiz halol shartlarda muddatli to'lovga xarid qilishlari mumkin.",
    aRu: "Платформа интегрирована с Uzum Nasiya, Alif Nasiya и Anorbank. В карточке товара отображается ежемесячный платеж на 3, 6, 12 или 24 месяца без скрытых комиссий, штрафов и пеней, в строгом соответствии с принципами исламского финансирования.",
    aEn: "Our platform integrates with Uzum Nasiya, Alif Nasiya, and Anorbank. Product views display monthly breakdowns for 3, 6, 12, or 24 months with zero interest markup and no late payment penalties under certified halal terms.",
  },
  {
    qUz: "Sovg'a AI xizmatlaridan foydalanish bepulmi?",
    qRu: "Бесплатен ли сервис Sovg'a AI?",
    qEn: "Is Sovg'a AI free to use?",
    aUz: "Ha, Sovg'a AI platformasi xaridorlar va to'y egalari uchun mutlaqo 100% bepul. Biz do'konlar narxiga hech qanday qo'shimcha foiz yoki ustama qo'shmaymiz.",
    aRu: "Да, сервис Sovg'a AI на 100% бесплатен для покупателей и организаторов свадеб. Мы не взимаем наценок, комиссий и дополнительных платежей сверх цен магазинов.",
    aEn: "Yes, Sovg'a AI is 100% free for gift shoppers and registry organizers. We never add markups, hidden surcharges, or store broker fees.",
  },
  {
    qUz: "AI Tabriknoma (Dedication Card) nima va uni qanday olish mumkin?",
    qRu: "Что такое AI Открытка и как ее получить?",
    qEn: "What is the AI Greeting Card and how do I generate one?",
    aUz: "Har qanday tanlangan mahsulot uchun sun'iy idrok oluvchining shaxsiyati va munosabatiga moslashtirilgan o'zbek, rus yoki ingliz tillarida nafis tabriknoma matni yozib beradi. Siz uni 1 bosishda rangli tabriknoma formatida chop etishingiz yoki Telegram orqali yaqiningizga yuborishingiz mumkin.",
    aRu: "Для каждого выбранного подарка искусственный интеллект составляет теплое персонализированное поздравление на узбекском, русском или английском языках. Вы можете распечатать стильную открытку или отправить ее близким через Telegram в 1 клик.",
    aEn: "For any selected gift, our AI generates an elegant personalized greeting card message tailored to the recipient's personality in Uzbek, Russian, or English. You can print it in high resolution or send it directly via Telegram in 1 click.",
  },
];

export default function FaqSection() {
  const { language } = useTranslation();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 dark:bg-amber-500/10 text-amber-900 dark:text-amber-400 border border-amber-300/80 dark:border-amber-500/20 text-xs font-bold uppercase tracking-wider shadow-2xs">
          <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>
            {language === "uz"
              ? "Ko'p Beriladigan Savollar"
              : language === "ru"
              ? "Часто Задаваемые Вопросы"
              : "Frequently Asked Questions"}
          </span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 dark:text-white">
          {language === "uz"
            ? "Sovg'a AI haqida bilishingiz kerak bo'lgan barcha narsalar"
            : language === "ru"
            ? "Все, что нужно знать о платформе Sovg'a AI"
            : "Everything You Need to Know About Sovg'a AI"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal">
          {language === "uz"
            ? "Xaridlarni rejalashtirish, to'y registri va narxlarni taqqoslash bo'yicha asosiy javoblar."
            : language === "ru"
            ? "Главные ответы по планированию подарков, свадебному реестру и сравнению цен."
            : "Essential guidance on smart shopping, wedding registries, and price arbitrage across Uzbekistan."}
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          const question = language === "uz" ? faq.qUz : language === "ru" ? faq.qRu : faq.qEn;
          const answer = language === "uz" ? faq.aUz : language === "ru" ? faq.aRu : faq.aEn;

          return (
            <div
              key={idx}
              className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f7f2e4] dark:from-[#11131f] dark:to-[#080a11] rounded-2xl border-2 border-amber-200/80 dark:border-slate-800 overflow-hidden shadow-luxury transition hover:border-amber-400 dark:hover:border-amber-500/60"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-amber-50/60 dark:hover:bg-slate-800/50 transition cursor-pointer"
              >
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                  {question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${
                    isOpen ? "rotate-180 text-amber-600 dark:text-amber-400" : "text-slate-400"
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-amber-200/60 dark:border-slate-800 bg-amber-50/40 dark:bg-slate-900/40">
                  {answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
