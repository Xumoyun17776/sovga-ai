import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { formatPrice } from "../lib/api";
import SearchBar from "../components/SearchBar";
import PriceComparisonModal from "../components/PriceComparisonModal";
import GiftDetectiveModal from "../components/GiftDetectiveModal";
import HeroFeatureLaunchpad from "../components/HeroFeatureLaunchpad";
import AllServicesModal from "../components/AllServicesModal";
import GiftMatcherWizard from "../components/GiftMatcherWizard";
import HolographicPrivilegeCard from "../components/HolographicPrivilegeCard";
import FaqSection from "../components/FaqSection";
import { LivePriceCard, LiveProofStats, useLivePriceBoard, useCheckedAgo } from "../components/LivePriceProof";
import SectionHeader, { sectionActionCls } from "../components/SectionHeader";
import { ArrowRight, ArrowUpRight, ExternalLink, Search, Scale, Wallet, Send, Check, Heart } from "../lib/icons";

const img = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`;

const occasions = [
  { key: "wedding", photo: "1519741497674-611481863552", labelUz: "To'y", labelRu: "Свадьба", labelEn: "Wedding", hintUz: "Oshxona texnikasi, idishlar, uy uchun", hintRu: "Техника, посуда, всё для дома", hintEn: "Kitchen, dinnerware, things for the home" },
  { key: "birthday", photo: "1530103862676-de8c9debad1d", labelUz: "Tug'ilgan kun", labelRu: "День рождения", labelEn: "Birthday", hintUz: "Gadjetlar va shaxsiy sovg'alar", hintRu: "Гаджеты и личные подарки", hintEn: "Gadgets and personal gifts" },
  { key: "anniversary", photo: "1518199266791-5375a83190b7", labelUz: "Yillik", labelRu: "Годовщина", labelEn: "Anniversary", hintUz: "Esda qoladigan narsalar", hintRu: "То, что запомнится", hintEn: "Something to remember" },
  { key: "graduation", photo: "1541339907198-e08756dedf3f", labelUz: "Bitiruv", labelRu: "Выпускной", labelEn: "Graduation", hintUz: "O'qish va texnika", hintRu: "Учёба и техника", hintEn: "Study and tech" },
  { key: "new_baby", photo: "1515488042361-ee00e0ddd4e4", labelUz: "Chaqaloq", labelRu: "Малыш", labelEn: "New baby", hintUz: "Chaqaloq uchun to'plamlar", hintRu: "Наборы для малыша", hintEn: "Things for the baby" },
  { key: "housewarming", photo: "1513694203232-719a280e022f", labelUz: "Yangi uy", labelRu: "Новоселье", labelEn: "Housewarming", hintUz: "Interyer va qulaylik", hintRu: "Интерьер и уют", hintEn: "For the new home" },
];

const quickHeroChips = [
  { label: "iPhone 16 Pro Max", query: "iPhone 16 Pro Max" },
  { label: "Samsung S24 Ultra", query: "Samsung S24 Ultra" },
  { label: "Dyson Airwrap", query: "Dyson Airwrap" },
  { label: "PlayStation 5", query: "PlayStation 5" },
  { labelUz: "To'y sovg'asi", labelRu: "Свадебный подарок", labelEn: "Wedding gift", query: "to'y sovg'asi 700 ming gacha" },
];

const STORES = ["Uzum Market", "Olcha", "Texnomart", "MediaPark", "Asaxiy"];

export default function HomePage() {
  const { language } = useTranslation();
  const [, navigate] = useLocation();
  const [showDemoCompare, setShowDemoCompare] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showGiftDetective, setShowGiftDetective] = useState(false);
  const L = (uz: string, ru: string, en: string) => (language === "ru" ? ru : language === "en" ? en : uz);
  const pickL = (o: { labelUz: string; labelRu: string; labelEn: string }) => L(o.labelUz, o.labelRu, o.labelEn);

  const { data: liveBoard } = useLivePriceBoard();
  const liveGaps = liveBoard?.live ? liveBoard.products.slice(0, 4) : [];
  const liveDrops = liveBoard?.live ? liveBoard.drops.slice(0, 8) : [];
  const { clock } = useCheckedAgo(liveBoard?.checkedAt, language);
  const stores = liveBoard?.storesChecked?.length ? liveBoard.storesChecked : STORES;
  const storesText = stores.join(", ");

  const steps = [
    {
      icon: Search,
      t: L("Kimga va qanchaga — yozing", "Напишите, кому и за сколько", "Say who it's for and the budget"),
      d: L("“Onamga 500 ming so'mgacha” yoki aniq model nomi — ikkalasi ham ishlaydi.", "«Маме до 500 тысяч» или точная модель — подойдёт и то, и другое.", "“For my mum, under 500k” or an exact model — either works."),
    },
    {
      icon: Scale,
      t: L(`${STORES.length} ta do'konni solishtiramiz`, `Сравниваем ${STORES.length} магазинов`, `We compare ${STORES.length} stores`),
      d: L("Bir xil modelning narxi, yetkazish muddati va kafolatini yonma-yon ko'rasiz.", "Цена одной и той же модели, доставка и гарантия — рядом.", "Same model, side by side: price, delivery time and warranty."),
    },
    {
      icon: Wallet,
      t: L("Arzonini do'kondan oling", "Покупайте там, где дешевле", "Buy where it's cheapest"),
      d: L("To'lov do'konning o'zida. Biz narxga hech qanday ustama qo'shmaymiz.", "Оплата в самом магазине. Мы не добавляем наценку.", "You pay the store directly. We never add a markup."),
    },
  ];

  return (
    <div className="bg-[var(--paper)]">
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 top-0 h-[560px] bg-[linear-gradient(180deg,var(--hero-wash)_0%,var(--paper)_100%)]" />
        <div className="wrap relative pt-10 sm:pt-14 lg:pt-20 pb-12 lg:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-2 h-8 pl-1.5 pr-3.5 rounded-full bg-white border border-[var(--rule-soft)] shadow-sm text-[13px] font-medium text-[var(--ink-2)]">
              <span className="h-5 px-2 rounded-full bg-[var(--anor)] text-white text-[11px] font-semibold inline-flex items-center">{L("Yangi", "Новое", "New")}</span>
              {L("Do'kon narxlari har kuni yangilanadi", "Цены магазинов обновляются каждый день", "Store prices refreshed every day")}
            </span>

            <h1 className="hero-lux mt-6 text-[var(--ink)]">
              {L("Sovg'ani tanlang,", "Выберите подарок,", "Pick the gift,")}{" "}
              <span className="relative whitespace-nowrap text-[var(--anor)]">
                {L("arzonini", "дешевле", "pay less")}
                <svg aria-hidden viewBox="0 0 220 12" preserveAspectRatio="none" className="absolute left-0 -bottom-1 w-full h-3 text-[var(--anor)]/25"><path d="M2 9C60 3 160 2 218 7" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" /></svg>
              </span>{" "}
              {L("toping.", "найдите.", "for it.")}
            </h1>

            <p className="mt-6 text-[18px] leading-relaxed text-[var(--ink-2)] max-w-[34rem]">
              {L(
                "Kimga va qancha pulga — shuni yozing. Uzum, Olcha, Texnomart va boshqa do'konlardagi narxni solishtirib, qayerda arzonligini ko'rsatamiz.",
                "Напишите, кому и на какую сумму. Сравним цены в Uzum, Olcha, Texnomart и других магазинах и покажем, где дешевле.",
                "Tell us who it's for and what you want to spend. We compare Uzum, Olcha, Texnomart and others and show where it's cheapest."
              )}
            </p>

            <div className="mt-8 relative z-20 max-w-[36rem]">
              <SearchBar large />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-medium text-[var(--ink-2)] mr-1">{L("Ko'p qidiriladi:", "Часто ищут:", "Popular:")}</span>
              {quickHeroChips.map((chip) => (
                <button
                  key={chip.query}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(chip.query)}`)}
                  className="h-8 px-3.5 rounded-full bg-white border border-[var(--rule-soft)] text-[13px] font-medium text-[var(--ink)] hover:border-[var(--anor)] hover:text-[var(--anor)] transition cursor-pointer"
                >
                  {"label" in chip && chip.label ? chip.label : pickL(chip as any)}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px] text-[var(--ink-2)]">
              {[L("Ro'yxatdan o'tmasdan", "Без регистрации", "No sign-up needed"), L("Kuniga 5 ta qidiruv bepul", "5 поисков в день бесплатно", "5 free searches a day"), L("Ustama yo'q", "Без наценки", "No markup")].map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--ok-soft)] text-[var(--ok)] inline-flex items-center justify-center"><Check className="w-3 h-3" /></span>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div aria-hidden className="hidden lg:block absolute -inset-6 rounded-[36px] bg-[var(--anor)] [background-image:radial-gradient(rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:18px_18px] rotate-[2deg]" />
            <div className="relative">
              <LivePriceCard />
            </div>
          </div>
        </div>

        <div className="wrap relative pb-14 lg:pb-20">
          <LiveProofStats />
        </div>
      </section>

      {/* ─── STORE STRIP ──────────────────────────────────────────── */}
      <section className="border-y border-[var(--rule-soft)] bg-[var(--paper-2)]">
        <div className="wrap py-7 flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
          <p className="text-[13px] font-semibold text-[var(--ink-2)] flex-shrink-0">{L("Narxlarni solishtiramiz:", "Сравниваем цены:", "We compare prices at:")}</p>
          <ul className="flex flex-wrap items-center gap-x-8 sm:gap-x-12 gap-y-3">
            {STORES.map((s) => (
              <li key={s} className="font-lux text-[1.2rem] sm:text-[1.35rem] text-[var(--muted)] tracking-[-0.02em]">{s}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── SAME MODEL, DIFFERENT PRICE ──────────────────────────── */}
      {liveGaps.length >= 2 && (
        <section className="section">
          <div className="wrap">
            <SectionHeader
              kicker={L("Bugungi narxlar", "Цены сегодня", "Today's prices")}
              title={L("Bir xil model — turli narx", "Одна модель — разные цены", "Same model, different price")}
              subtitle={L(
                `${storesText} saytlaridan. ${clock} da tekshirildi, Toshkent vaqti bilan.`,
                `С сайтов ${storesText}. Проверено в ${clock} по Ташкенту.`,
                `From ${storesText}. Checked at ${clock}, Tashkent time.`
              )}
              action={
                <Link href="/catalog" className={sectionActionCls}>
                  {L("Butun katalog", "Весь каталог", "Full catalog")} <ArrowRight className="w-4 h-4" />
                </Link>
              }
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {liveGaps.map((g) => (
                <ProductCard
                  key={g.id}
                  image={g.image}
                  name={g.name}
                  price={g.offers[0].price}
                  was={g.offers[g.offers.length - 1].price}
                  pct={g.savingsPct}
                  meta={L(`Eng arzoni: ${g.offers[0].store}`, `Дешевле всего: ${g.offers[0].store}`, `Cheapest: ${g.offers[0].store}`)}
                  sub={L(`${g.offers.length} do'kon solishtirildi`, `Сравнили ${g.offers.length} магазина`, `${g.offers.length} stores compared`)}
                  url={g.offers[0].url}
                  cta={L("Do'konda ko'rish", "В магазин", "View in store")}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className={`section ${liveGaps.length >= 2 ? "pt-0 lg:pt-0" : ""}`}>
        <div className="wrap">
          <div className="rounded-[28px] bg-[var(--paper-2)] p-6 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5">
              <p className="text-sm font-semibold text-[var(--anor)] mb-3">{L("Qanday ishlaydi", "Как это работает", "How it works")}</p>
              <h2 className="text-[2rem] sm:text-[2.5rem] leading-[1.1] text-[var(--ink)]">
                {L("Bir daqiqada — eng arzon do'kon.", "Самый дешёвый магазин — за минуту.", "The cheapest store, in a minute.")}
              </h2>
              <p className="mt-4 text-[17px] text-[var(--ink-2)] leading-relaxed">
                {L("Har bir do'kon saytini alohida ochib o'tirmaysiz.", "Не нужно открывать сайт каждого магазина.", "No more opening every store's site one by one.")}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/gift-finder" className="btn-primary h-12 px-6 text-[15px]">
                  {L("Sovg'a topish", "Подобрать подарок", "Find a gift")} <ArrowRight className="w-4 h-4" />
                </Link>
                <button onClick={() => setShowDemoCompare(true)} className="btn-ghost h-12 px-6 text-[15px]">
                  {L("Namunani ko'rish", "Посмотреть пример", "See an example")}
                </button>
              </div>
            </div>
            <ol className="lg:col-span-7 grid gap-3 sm:gap-4">
              {steps.map((s, i) => (
                <li key={i} className="flex items-start gap-5 rounded-2xl bg-white border border-[var(--rule-soft)] p-5 sm:p-6">
                  <span className="tile !w-12 !h-12"><s.icon /></span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--ink-2)]">{L("Qadam", "Шаг", "Step")} {i + 1}</p>
                    <p className="mt-0.5 text-[18px] font-semibold text-[var(--ink)] leading-snug">{s.t}</p>
                    <p className="mt-1.5 text-[15px] text-[var(--ink-2)] leading-relaxed">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ─── BY OCCASION ──────────────────────────────────────────── */}
      <section className="section pt-0 lg:pt-0">
        <div className="wrap">
          <SectionHeader
            kicker={L("Bayram bo'yicha", "По поводу", "By occasion")}
            title={L("Qaysi bayramga sovg'a kerak?", "К какому празднику подарок?", "What's the occasion?")}
            subtitle={L(
              "Har bir bayramning o'z odati bor. Tanlang — mos g'oyalar va narxlarni ko'rsatamiz.",
              "У каждого праздника свои обычаи. Выберите — покажем подходящие идеи и цены.",
              "Every occasion has its customs. Pick one and we'll show ideas and prices that fit."
            )}
            action={
              <Link href="/gift-finder" className={sectionActionCls}>
                {L("Barcha g'oyalar", "Все идеи", "All ideas")} <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />
          <div className="grid grid-cols-2 lg:grid-cols-3 lg:grid-rows-[repeat(3,minmax(0,220px))] gap-3 sm:gap-5">
            {occasions.map((o, i) => {
              const big = i === 0;
              return (
                <button
                  key={o.key}
                  onClick={() => navigate(`/gift-finder?occasion=${o.key}`)}
                  className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[var(--paper-2)] text-left cursor-pointer ${
                    big ? "col-span-2 lg:row-span-2 aspect-[16/11] lg:aspect-auto" : i === occasions.length - 1 ? "col-span-2 lg:col-span-1 aspect-[16/9] sm:aspect-[2/1] lg:aspect-auto" : "aspect-[4/5] sm:aspect-[4/3] lg:aspect-auto"
                  }`}
                >
                  <img
                    src={img(o.photo, big ? 1200 : 700)}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,11,24,0)_35%,rgba(6,11,24,.8)_100%)]" />
                  <span className="absolute inset-x-0 bottom-0 p-4 sm:p-6 flex items-end justify-between gap-3">
                    <span className="min-w-0">
                      <span className={`block font-lux text-white leading-tight ${big ? "text-[1.75rem] sm:text-[2.5rem]" : "text-[1.15rem] sm:text-[1.5rem]"}`}>{pickL(o)}</span>
                      <span className={`mt-1 text-white/80 leading-snug ${big ? "block text-[15px]" : "hidden sm:block text-[14px]"}`}>
                        {L(o.hintUz, o.hintRu, o.hintEn)}
                      </span>
                    </span>
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-[#fff] text-[#0E1A36] inline-flex items-center justify-center transition group-hover:bg-[var(--anor)] group-hover:text-white">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── PRICE DROPS ──────────────────────────────────────────── */}
      {liveDrops.length >= 4 && (
        <section className="section band">
          <div className="wrap">
            <SectionHeader
              kicker={L("Chegirmalar", "Скидки", "Deals")}
              title={L("Narxi tushganlar", "Подешевело", "Price drops")}
              subtitle={L("Do'kon saytida eski narxi ko'rsatilgan haqiqiy chegirmalar.", "Настоящие скидки, где магазин показывает старую цену.", "Real discounts where the store shows the old price.")}
              action={
                <Link href="/aksiyalar" className={sectionActionCls}>
                  {L("Barcha chegirmalar", "Все скидки", "All deals")} <ArrowRight className="w-4 h-4" />
                </Link>
              }
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {liveDrops.map((d) => (
                <ProductCard
                  key={d.url}
                  image={d.image}
                  name={d.title}
                  price={d.price}
                  was={d.oldPrice}
                  pct={d.pct}
                  meta={d.store}
                  sub={d.category || ""}
                  url={d.url}
                  cta={L("Do'konda ko'rish", "В магазин", "View in store")}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── EVERYTHING ON THE SITE ───────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <HeroFeatureLaunchpad onOpenAllServices={() => setShowServicesModal(true)} onOpenGiftDetective={() => setShowGiftDetective(true)} />
        </div>
      </section>

      {/* ─── QUICK PICKER ─────────────────────────────────────────── */}
      <section className="section band">
        <div className="wrap">
          <GiftMatcherWizard />
        </div>
      </section>

      {/* ─── WEDDING REGISTRY ─────────────────────────────────────── */}
      <section className="section">
        <div className="wrap grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 relative order-2 lg:order-1">
            <div className="rounded-[28px] overflow-hidden aspect-[4/3] sm:aspect-[5/4] bg-[var(--paper-2)]">
              <img src={img("1511285560929-80b456fea0bc", 1100)} alt="" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div aria-hidden className="relative -mt-24 sm:-mt-32 mx-4 sm:mx-0 sm:ml-auto sm:-mr-6 sm:w-[78%] rounded-2xl bg-white border border-[var(--rule-soft)] shadow-[0_24px_60px_-24px_rgba(var(--shadow-color),.35)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--rule-soft)]">
                <span className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[var(--rose-soft)] text-[var(--rose)] inline-flex items-center justify-center"><Heart className="w-4 h-4" /></span>
                  <span className="font-lux text-[17px]">Ali & Madina</span>
                </span>
                <span className="text-[12px] font-semibold text-[var(--ink-2)]">{L("4 / 5 band", "4 / 5 занято", "4 / 5 taken")}</span>
              </div>
              {[
                { n: "De'Longhi Dolce Gusto", p: "650 000", r: true },
                { n: L("Rishton choy to'plami", "Чайный набор Риштан", "Rishton tea set"), p: "350 000", r: true },
                { n: "Dyson Airwrap", p: "6 100 000", r: false },
              ].map((g) => (
                <div key={g.n} className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[var(--rule-soft)] last:border-b-0 text-[14px]">
                  <span className={g.r ? "text-[var(--ink-2)]" : "text-[var(--ink)] font-semibold"}>{g.n}</span>
                  <span className="flex items-center gap-3">
                    <span className="tabular text-[var(--ink-2)] hidden sm:inline">{g.p}</span>
                    <span className={`h-6 px-2.5 rounded-full text-[12px] font-semibold inline-flex items-center ${g.r ? "bg-[var(--paper-2)] text-[var(--ink-2)]" : "bg-[var(--ok-soft)] text-[var(--ok)]"}`}>
                      {g.r ? L("Band", "Занято", "Taken") : L("Bo'sh", "Свободно", "Open")}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <p className="text-sm font-semibold text-[var(--anor)] mb-3">{L("To'y ro'yxati", "Свадебный список", "Wedding registry")}</p>
            <h2 className="text-[2rem] sm:text-[2.75rem] leading-[1.08] text-[var(--ink)]">
              {L("Mehmonlar bir xil sovg'a olib kelmaydi.", "Гости не принесут одно и то же.", "No two guests bring the same thing.")}
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-[var(--ink-2)] max-w-lg">
              {L(
                "Kerakli narsalar ro'yxatini tuzing — oshxona texnikasi, idishlar yoki sayohat uchun pul. Mehmon sovg'ani band qilganda boshqalar buni ko'radi.",
                "Составьте список нужного — техника, посуда или деньги на путешествие. Когда гость бронирует подарок, остальные это видят.",
                "List what you need — kitchen appliances, dinnerware or money for the honeymoon. When a guest reserves a gift, everyone else sees it."
              )}
            </p>
            <ul className="mt-6 space-y-3 text-[15px] text-[var(--ink)]">
              {[
                L("Bitta havola — Telegram yoki taklifnomaga qo'yasiz", "Одна ссылка — для Telegram или приглашения", "One link for Telegram or the invitation"),
                L("Har bir sovg'aning eng arzon narxi ko'rinadi", "У каждого подарка видна лучшая цена", "Each gift shows its lowest price"),
                L("Kim nima olganini faqat siz ko'rasiz", "Кто что купил, видите только вы", "Only you see who bought what"),
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="bullet-check mt-0.5"><Check /></span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/wedding" className="btn-primary h-12 px-6 text-[15px]">
                {L("Ro'yxat tuzish", "Создать список", "Create a registry")} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/wedding/ali-madina" className="btn-ghost h-12 px-6 text-[15px]">
                {L("Namunani ko'rish", "Посмотреть пример", "See an example")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PLANS ────────────────────────────────────────────────── */}
      <section className="section band">
        <div className="wrap">
          <HolographicPrivilegeCard />
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <FaqSection />
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────── */}
      <section className="pb-16 lg:pb-24">
        <div className="wrap">
          <div className="relative overflow-hidden rounded-[28px] bg-[#1F4CA8] dark:bg-[#1B3F8C] text-white px-6 py-12 sm:px-12 sm:py-16 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div aria-hidden className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(90deg,transparent,black)]" />
            <div className="relative lg:col-span-7">
              <h2 className="text-[2rem] sm:text-[2.75rem] leading-[1.08]">
                {L("Keyingi sovg'ani arzonroq oling.", "Следующий подарок — дешевле.", "Get the next gift for less.")}
              </h2>
              <p className="mt-4 text-[17px] text-white/80 max-w-xl">
                {L("Ro'yxatdan o'tish shart emas. Qidiruvga yozing yoki Telegram botdan foydalaning.", "Регистрация не нужна. Напишите в поиск или в Telegram-бот.", "No sign-up needed. Use the search or our Telegram bot.")}
              </p>
            </div>
            <div className="relative lg:col-span-5 flex flex-col sm:flex-row gap-3 lg:justify-end">
              <Link href="/gift-finder" className="inline-flex items-center justify-center gap-2 h-12 px-6 whitespace-nowrap rounded-xl bg-[#fff] text-[#1F4CA8] text-[15px] font-semibold hover:bg-[#EAF0FB] transition">
                {L("Sovg'a topish", "Подобрать подарок", "Find a gift")} <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="https://t.me/sovga_ai_bot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-white/30 text-white text-[15px] font-semibold hover:bg-white/10 transition">
                <Send className="w-4 h-4" /> Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      {showDemoCompare && (
        <PriceComparisonModal
          productName="De'Longhi Nescafé Dolce Gusto Mini Me Coffee Machine"
          currentPrice={650000}
          currentStore="Uzum Market"
          onClose={() => setShowDemoCompare(false)}
        />
      )}
      <AllServicesModal isOpen={showServicesModal} onClose={() => setShowServicesModal(false)} />
      <GiftDetectiveModal isOpen={showGiftDetective} onClose={() => setShowGiftDetective(false)} />
    </div>
  );
}

/** Product card used for the live price sections. */
function ProductCard({
  image, name, price, was, pct, meta, sub, url, cta,
}: { image?: string | null; name: string; price: number; was: number; pct: number; meta: string; sub: string; url: string; cta: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="card group flex flex-col p-3 sm:p-4">
      <span className="relative block aspect-square rounded-xl bg-[var(--img-well)] overflow-hidden">
        {image && <img src={image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-contain p-5 sm:p-7 mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />}
        {pct > 0 && (
          <span className="absolute top-2.5 left-2.5 h-6 px-2 rounded-md bg-[var(--ok)] text-white text-[12px] font-bold inline-flex items-center tabular">−{pct}%</span>
        )}
      </span>
      <span className="mt-3 sm:mt-4 text-[12px] sm:text-[13px] font-semibold text-[var(--anor)] truncate">{meta}</span>
      <span className="mt-1 text-[14px] sm:text-[15px] font-medium text-[var(--ink)] leading-snug line-clamp-2 min-h-[2.6em]">{name}</span>
      <span className="mt-3 flex flex-wrap items-baseline gap-x-2">
        <span className="price text-[1.1rem] sm:text-[1.35rem] leading-none text-[var(--ink)] whitespace-nowrap">{formatPrice(price)}</span>
        {was > price && <span className="text-[12px] sm:text-[13px] text-[var(--ink-2)] line-through whitespace-nowrap">{formatPrice(was)}</span>}
      </span>
      {sub && <span className="mt-1.5 text-[12px] text-[var(--ink-2)] truncate">{sub}</span>}
      <span className="mt-4 hidden sm:inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-[var(--rule-soft)] text-[14px] font-semibold text-[var(--ink)] group-hover:bg-[var(--anor)] group-hover:border-[var(--anor)] group-hover:text-white transition">
        {cta} <ExternalLink className="w-3.5 h-3.5" />
      </span>
    </a>
  );
}
