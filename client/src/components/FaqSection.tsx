import { useState } from "react";
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
    qUz: "Sovg'a bepulmi?",
    qRu: "Sovg'a бесплатный?",
    qEn: "Is Sovg'a free?",
    aUz: "Asosiy qismi bepul: kuniga 5 ta qidiruv va 2 ta narx kuzatuvi. Ko'proq kerak bo'lsa, oyiga 14 999 so'mdan boshlanadigan tarif bor. Do'kon narxiga hech qanday ustama qo'shmaymiz.",
    aRu: "Основное бесплатно: 5 поисков в день и 2 отслеживания цены. Если нужно больше, есть тарифы от 14 999 сум в месяц. Мы не добавляем наценку к ценам магазинов.",
    aEn: "The basics are free: 5 searches a day and 2 price alerts. If you need more, plans start at 14,999 UZS a month. We never add a markup to store prices.",
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
      <div className="lg:col-span-4">
        <p className="text-sm font-semibold text-[var(--anor)] mb-3">FAQ</p>
        <h2 className="text-[2rem] sm:text-[2.5rem] leading-[1.1]">
          {language === "uz" ? "Ko'p beriladigan savollar" : language === "ru" ? "Частые вопросы" : "Frequently asked questions"}
        </h2>
        <p className="mt-4 text-[17px] text-[var(--ink-2)] max-w-xs">
          {language === "uz" ? "Javob topilmasa, Telegramda yozing: " : language === "ru" ? "Не нашли ответ — напишите в Telegram: " : "Didn't find it? Message us on Telegram: "}
          <a href="https://t.me/sovga_ai_bot" target="_blank" rel="noreferrer" className="font-semibold text-[var(--anor)] hover:underline">@sovga_ai_bot</a>
        </p>
      </div>

      <ol className="lg:col-span-8 space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          const question = language === "uz" ? faq.qUz : language === "ru" ? faq.qRu : faq.qEn;
          const answer = language === "uz" ? faq.aUz : language === "ru" ? faq.aRu : faq.aEn;
          return (
            <li key={idx} className={`rounded-2xl border transition-colors ${isOpen ? "border-[var(--line-hover)] bg-white shadow-sm" : "border-[var(--rule-soft)] bg-white hover:border-[var(--line-hover)]"}`}>
              <button
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                className="w-full px-5 sm:px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer group"
              >
                <span className="text-[17px] font-semibold text-[var(--ink)] leading-snug">{question}</span>
                <span className={`w-8 h-8 rounded-full flex-shrink-0 inline-flex items-center justify-center text-lg leading-none transition ${isOpen ? "bg-[var(--anor)] text-white" : "bg-[var(--paper-2)] text-[var(--ink)]"}`}>{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && <p className="px-5 sm:px-6 pb-6 -mt-1 text-[15px] text-[var(--ink-2)] leading-relaxed max-w-2xl">{answer}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
