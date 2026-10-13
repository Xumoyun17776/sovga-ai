import { useState, useRef } from "react";
import { useTranslation, tr } from "../lib/i18n";
import { Link } from "wouter";
import { useCurrency } from "../lib/currency";
import { useToast } from "../components/Toast";
import { cyberSound } from "../lib/cyberSound";
import DirectOrderModal from "../components/DirectOrderModal";
import {
  Sparkles,
  Gift,
  Printer,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  PackageCheck,
  Sliders,
  Palette,
  Stamp,
  Award,
  Box,
  Eye,
} from "../lib/icons";
import { copyText } from "../lib/clipboard";

interface BoxTheme {
  id: string;
  nameUz: string;
  descUz: string;
  boxBg: string;
  borderStyle: string;
  textColor: string;
  tagBg: string;
  tagBorder: string;
  tagText: string;
  price: number;
}

const get_BOX_THEMES = (): BoxTheme[] => [
  {
    id: "obsidian",
    nameUz: "Royal Midnight Obsidian",
    descUz: tr("To'q qora baxmal qoplama va platina hoshiya. Eng hashamatli va nufuzli sovg'alar uchun.", "Чёрный бархат и платиновая окантовка. Для самых особых подарков.", "Black velvet with a platinum edge. For the most special gifts."),
    boxBg: "bg-slate-950",
    borderStyle: "border-slate-700/80 shadow-2xl",
    textColor: "text-slate-100",
    tagBg: "bg-slate-200",
    tagBorder: "border-slate-400",
    tagText: "text-slate-950",
    price: 55000,
  },
  {
    id: "silk",
    nameUz: tr("Milliy Zardo'zi & Adras Silk", "Национальная зардози и адрас", "Uzbek zardozi & adras silk"),
    descUz: tr("O'zbek xonatlas va zardo'zi nozik naqshlari bilan bezatilgan milliy qiymatdagi quti.", "Коробка с узорами хан-атласа и золотой вышивкой зардози.", "A box decorated with khan-atlas patterns and zardozi gold embroidery."),
    boxBg: "bg-indigo-950",
    borderStyle: "border-indigo-500/40 shadow-2xl",
    textColor: "text-indigo-100",
    tagBg: "bg-amber-100",
    tagBorder: "border-amber-400",
    tagText: "text-amber-950",
    price: 65000,
  },
  {
    id: "swiss",
    nameUz: "Swiss Matte Porcelain",
    descUz: tr("Minimalist Shveytsariya uslubidagi matli qor-oq qadoq. Zamonaviy estetik ixlosmandlariga.", "Минималистичная матовая белая упаковка в швейцарском стиле.", "Minimalist matte white packaging in Swiss style."),
    boxBg: "bg-white",
    borderStyle: "border-slate-200 shadow-xl",
    textColor: "text-slate-900",
    tagBg: "bg-slate-900",
    tagBorder: "border-slate-900",
    tagText: "text-white",
    price: 45000,
  },
  {
    id: "emerald",
    nameUz: "Toshkent Zumrad & Gold Leaf",
    descUz: tr("Chuqur zumrad rangli silliq mato va tilla zarli muhr. To'y va yubileylar ramzi.", "Изумрудная ткань и золотая печать. Для свадеб и юбилеев.", "Emerald fabric with a gold seal. For weddings and anniversaries."),
    boxBg: "bg-emerald-950",
    borderStyle: "border-emerald-500/40 shadow-2xl",
    textColor: "text-emerald-100",
    tagBg: "bg-yellow-200",
    tagBorder: "border-amber-500",
    tagText: "text-amber-950",
    price: 60000,
  },
];

const get_RIBBON_COLORS = () => [
  { id: "gold", name: tr("Imperial Tilla", "Императорское золото", "Imperial gold"), colorClass: "bg-amber-400", glow: "shadow-amber-400/30" },
  { id: "indigo", name: "Royal Indigo", colorClass: "bg-indigo-600", glow: "shadow-indigo-500/30" },
  { id: "ruby", name: tr("Buxoro Yoqut", "Бухарский рубин", "Bukhara ruby"), colorClass: "bg-rose-600", glow: "shadow-rose-500/30" },
  { id: "silver", name: tr("Platina Kumush", "Платиновое серебро", "Platinum silver"), colorClass: "bg-slate-300", glow: "shadow-slate-300/30" },
];

const get_WAX_SEALS = () => [
  { id: "baxt", label: tr("Baxt & Saodat", "Счастье и радость", "Happiness & joy"), symbol: "✦" },
  { id: "hurmat", label: tr("Hurmat & Ehtirom", "Уважение", "Respect"), symbol: "⚜" },
  { id: "omad", label: tr("Omad & Muvaffaqiyat", "Удача и успех", "Luck & success"), symbol: "★" },
  { id: "mehr", label: tr("Mehr & Muhabbat", "Любовь и тепло", "Love & warmth"), symbol: "❤" },
];

export default function PackagingStudioPage() {
  const { language } = useTranslation();
  const toast = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const boxCardRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useCurrency();

  const [selectedBox, setSelectedBox] = useState<string>("obsidian");
  const [selectedRibbon, setSelectedRibbon] = useState<string>("gold");
  const [selectedSeal, setSelectedSeal] = useState<string>("baxt");
  const [recipientName, setRecipientName] = useState(tr("Aziz Do'stim", "Дорогой друг", "Dear friend"));
  const [senderName, setSenderName] = useState(tr("Samimiyat bilan", "С теплом", "With warm wishes"));
  const [customMessage, setCustomMessage] = useState(
    tr("Ushbu sovg'a sizga quvonch, baraka va eng yorqin lahzalarni hadya etsin!", "Пусть этот подарок принесёт вам радость и самые яркие моменты!", "May this gift bring you joy and your brightest moments!")
  );
  const [copied, setCopied] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // 3D Perspective Gyro Tilt (RAF GPU Accelerated)
  const rafId = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!printRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rX = ((y - centerY) / centerY) * -9;
    const rY = ((x - centerX) / centerX) * 9;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (printRef.current) {
        printRef.current.style.transform = `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg)`;
      }
    });
  };

  const handleMouseLeave = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (printRef.current) {
      printRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
  };

  const currentTheme = get_BOX_THEMES().find((b) => b.id === selectedBox) || get_BOX_THEMES()[0];
  const currentRibbon = get_RIBBON_COLORS().find((r) => r.id === selectedRibbon) || get_RIBBON_COLORS()[0];
  const currentSeal = get_WAX_SEALS().find((s) => s.id === selectedSeal) || get_WAX_SEALS()[0];

  const handlePrint = () => {
    cyberSound.playConfirm();
    window.print();
  };

  const handleCopyCode = () => {
    cyberSound.playConfirm();
    const text = `Sovg'a — ${tr("sovg'a qadog'i", "упаковка подарка", "gift wrapping")}\n` +
      `${tr("Quti", "Коробка", "Box")}: ${currentTheme.nameUz}\n` +
      `${tr("Lenta", "Лента", "Ribbon")}: ${currentRibbon.name}\n` +
      `${tr("Muhr", "Печать", "Seal")}: ${currentSeal.label}\n` +
      `${tr("Kimga", "Кому", "To")}: ${recipientName}\n` +
      `${tr("Kimdan", "От кого", "From")}: ${senderName}\n` +
      `${tr("Tilak", "Пожелание", "Message")}: "${customMessage}"\n` +
      `${tr("Narxi", "Цена", "Price")}: ${formatPrice(currentTheme.price)}\n` +
      `sovga.uz/packaging-studio`;

    copyText(text);
    setCopied(true);
    toast.success(tr("Qadoqlash pasporti ma'lumotlari nusxalandi!", "Данные упаковки скопированы", "Wrapping details copied"), "Nusxalandi");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors relative overflow-hidden">
      {/* Ambient luxury glow */}

      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="lux-title text-[2.4rem] sm:text-[3.2rem] text-slate-900 dark:text-white leading-[1.05]">
            {language === "uz" ? "Sovg'a qadoqlash" : language === "ru" ? "Упаковка подарка" : "Gift wrapping"}
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            {language === "uz" ? "Xaridingizni sovg'aga tayyorlang: quti, ipak lenta, muhr va ism yozilgan kartochkani tanlang." : language === "ru" ? "Подготовьте покупку к вручению: выберите коробку, ленту, печать и именную карточку." : "Get your purchase ready to give: choose a box, ribbon, seal and a name card."}
          </p>
        </div>

        {/* Main Studio Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live 3D Studio Preview Container */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24">
            <div
              ref={boxCardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="bg-white dark:bg-[#0b1224] p-3 sm:p-4 rounded-2xl border border-[var(--line)] dark:border-slate-800 shadow-sm transition-all duration-200"
              style={{
                perspective: "1000px",
              }}
            >
              <div
                ref={printRef}
                className={`relative rounded-2xl p-5 sm:p-12 min-h-[400px] sm:min-h-[480px] flex flex-col justify-between overflow-hidden max-w-full ${currentTheme.boxBg} ${currentTheme.borderStyle}`}
                style={{
                  transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
                  transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                  willChange: "transform",
                }}
              >
                {/* Subtle background ambient mesh */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Opened Box Silk Interior Preview */}
                {isOpened ? (
                  <div className="absolute inset-4 rounded-2xl border border-amber-500/40 p-6 flex flex-col items-center justify-center text-center z-30 animate-fade-in bg-amber-950/90">
                    <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-4 shadow-sm">
                      <Gift className="w-8 h-8 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wide text-amber-400 font-bold mb-1">
                      Atelier Ichki Baxmal Qoplama
                    </span>
                    <h4 className="text-xl font-bold text-white mb-2">{tr("Sovg'angiz xavfsiz himoyada", "Ваш подарок надёжно защищён", "Your gift is well protected")}</h4>
                    <p className="text-xs text-slate-300 max-w-sm mb-4">
                      {tr("Ikki qatlamli ipak mato va zardo'zi o'ralgan maxsus bo'lma ichida joylashtiriladi.", "Укладывается в отдельный отсек с двойной шёлковой обивкой.", "Packed in a separate compartment lined with two layers of silk.")}
                    </p>
                    <button
                      onClick={() => {
                        cyberSound.playClick();
                        setIsOpened(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-white text-xs font-bold hover:bg-amber-300 transition cursor-pointer"
                    >
 {tr("Qutini yopish", "Закрыть коробку", "Close the box")} 
 </button>
                  </div>
                ) : (
                  <>
                    {/* Vertical Ribbon Cross */}
                    <div
                      className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-9 sm:w-14 ${currentRibbon.colorClass} shadow-sm ${currentRibbon.glow} opacity-95 pointer-events-none`}
                    />

                    {/* Horizontal Ribbon Cross */}
                    <div
                      className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-9 sm:h-14 ${currentRibbon.colorClass} shadow-sm ${currentRibbon.glow} opacity-95 pointer-events-none`}
                    />

                    {/* Center Royal Wax Seal (Mumlu Muhr) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div
                        onClick={() => {
                          cyberSound.playHoloChime();
                          setIsOpened(true);
                        }}
                        className="relative group cursor-pointer transition-transform"
                        title={tr("Qutini ochish uchun bosing", "Нажмите, чтобы открыть коробку", "Click to open the box")}
                      >
                        {/* Wax drip edge simulation */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1.5 shadow-sm flex items-center justify-center border border-amber-600/50 transition-all bg-amber-700">
                          <div className="w-full h-full rounded-full border border-amber-500/40 flex flex-col items-center justify-center text-amber-200 text-center shadow-inner bg-amber-800">
                            <span className="text-xl sm:text-2xl font-bold">{currentSeal.symbol}</span>
                            <span className="text-[8px] font-bold uppercase tracking-wide text-amber-300">
                              {currentSeal.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Top Header Card Stamp */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-white flex items-center gap-2 text-xs font-semibold">
                    <Award className="w-3.5 h-3.5 text-amber-400 stroke-[2.2]" />
                    <span>{tr("Sovg'a AI Atelier", "Мастерская упаковки", "Gift wrapping studio")}</span>
                  </div>
                  <button
                    onClick={() => {
                      cyberSound.playHoloChime();
                      setIsOpened(!isOpened);
                    }}
                    className="text-[11px] font-mono tracking-wider text-amber-300 bg-black/40 hover:bg-black/60 px-3 py-1 rounded-xl border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>{isOpened ? "Yopish" : tr("Ochib ko'rish", "Открыть", "Open")}</span>
                  </button>
                </div>

                {/* Bottom Custom Engraved Plaque (Metall O'ymakorlik Lavhasi) */}
                <div className="relative z-10 mt-auto pt-24 sm:pt-32">
                  <div
                    className={`p-5 rounded-2xl border shadow-sm ${currentTheme.tagBg} ${currentTheme.tagBorder} ${currentTheme.tagText} transition-all duration-300 backdrop-blur-sm`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide opacity-60 block">
                          {tr("Maxsus bag'ishlov:", "Посвящение:", "Dedication:")}
                        </span>
                        <h3 className="font-display font-semibold text-base sm:text-lg tracking-tight">
                          {recipientName || "Hurmatli Mehmon"}
                        </h3>
                        <p className="text-xs italic leading-relaxed opacity-85 line-clamp-2">
                          "{customMessage}"
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[9px] uppercase font-bold opacity-60 block">{tr("Kimdan:", "От кого:", "From:")}</span>
                        <span className="text-xs font-semibold block">{senderName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons for Card */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handlePrint}
                className="flex-1 py-3.5 btn-luxury-gold text-slate-950 font-semibold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                <span>Chop etish (Print)</span>
              </button>
              <button
                onClick={handleCopyCode}
                className="py-3.5 px-4 bg-amber-100/70 hover:bg-amber-200/70 dark:bg-slate-800 dark:hover:bg-slate-750 text-amber-950 dark:text-slate-200 font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition border border-[var(--line)] dark:border-slate-700 cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600 stroke-[2.2]" /> : <Copy className="w-4 h-4 stroke-[2.2]" />}
                <span>{copied ? "Nusxalandi" : tr("Pasportni nusxalash", "Скопировать детали", "Copy details")}</span>
              </button>
            </div>
          </div>

        {/* Right Column: Customization Controls Panel */}
        <div className="lg:col-span-6 space-y-6">
          {/* Step 1: Select Box Material */}
          <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 border border-[var(--line)] dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                <span>{tr("1. Quti uslubi va materialini tanlang", "1. Выберите стиль и материал коробки", "1. Choose the box style and material")}</span>
              </h2>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-400 bg-amber-100/90 dark:bg-amber-500/10 px-3 py-1 rounded-full border border-[var(--line)] dark:border-amber-500/20 shadow-2xs">
                {formatPrice(currentTheme.price)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {get_BOX_THEMES().map((theme) => {
                const isSelected = selectedBox === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      cyberSound.playClick(1300);
                      setSelectedBox(theme.id);
                    }}
                    className={`p-4 rounded-2xl text-left border transition cursor-pointer ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/90 dark:bg-amber-950/30 ring-2 ring-amber-400/20 shadow-md"
                        : "border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)] dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{theme.nameUz}</span>
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        {formatPrice(theme.price)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{theme.descUz}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Satin Ribbon Color */}
          <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 border border-[var(--line)] dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              <span>{tr("2. Ipak lenta rangini tanlang", "2. Выберите цвет ленты", "2. Choose the ribbon colour")}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {get_RIBBON_COLORS().map((ribbon) => {
                const isSelected = selectedRibbon === ribbon.id;
                return (
                  <button
                    key={ribbon.id}
                    onClick={() => {
                      cyberSound.playClick(1500);
                      setSelectedRibbon(ribbon.id);
                    }}
                    className={`p-3 rounded-2xl text-center border transition flex flex-col items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/90 dark:bg-amber-950/30 ring-2 ring-amber-400/20 shadow-md"
                        : "border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)] dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 shadow-2xs"
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full ${ribbon.colorClass} shadow-md`} />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{ribbon.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Select Wax Seal (Mumlu Muhr) */}
          <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 border border-[var(--line)] dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Stamp className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              <span>{tr("3. Mumli muhr ramzini tanlang (Wax Seal)", "3. Выберите сургучную печать", "3. Choose the wax seal")}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {get_WAX_SEALS().map((seal) => {
                const isSelected = selectedSeal === seal.id;
                return (
                  <button
                    key={seal.id}
                    onClick={() => {
                      cyberSound.playConfirm();
                      setSelectedSeal(seal.id);
                    }}
                    className={`p-3 rounded-2xl text-center border transition cursor-pointer ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/90 dark:bg-amber-950/30 ring-2 ring-amber-400/20 font-bold shadow-md"
                        : "border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)] dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 shadow-2xs"
                    }`}
                  >
                    <span className="text-xl block mb-1 text-amber-700 dark:text-amber-400">{seal.symbol}</span>
                    <span className="text-[11px] text-slate-900 dark:text-slate-200 font-bold block leading-tight">{seal.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Calligraphy Plaque Engraving */}
          <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 border border-[var(--line)] dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              <span>{tr("4. Metall lavhadagi bag'ishlov matni", "4. Текст на металлической табличке", "4. Text for the metal plate")}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Kimga (Recipient):</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-amber-50/60 dark:bg-slate-800/80 rounded-xl border border-[var(--line)] dark:border-slate-700 font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  placeholder="e.g. Malika Karimova"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">{tr("Kimdan (From):", "От кого:", "From:")}</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-amber-50/60 dark:bg-slate-800/80 rounded-xl border border-[var(--line)] dark:border-slate-700 font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  placeholder={tr("e.g. Jamshid va Oila a'zolari", "например, Джамшид и семья", "e.g. Jamshid and family")}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {tr("Bag'ishlov so'zlari (Engraved dedication):", "Текст посвящения (гравировка):", "Engraved dedication:")}
                </label>
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-amber-50/60 dark:bg-slate-800/80 rounded-xl border border-[var(--line)] dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 text-xs shadow-2xs"
                  placeholder={tr("Samimiy tilak matnini kiriting...", "Введите пожелание...", "Write your wish...")}
                />
              </div>
            </div>
          </div>

          {/* Order Action Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                cyberSound.playConfirm();
                setShowOrderModal(true);
              }}
              className="w-full py-4.5 btn-luxury-gold text-slate-950 font-bold rounded-2xl text-sm sm:text-base transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <PackageCheck className="w-5 h-5 text-slate-950 stroke-[2.2]" />
              <span>{tr("Shu qadoqda buyurtma berish", "Заказать в этой упаковке", "Order with this wrapping")} ({formatPrice(currentTheme.price)})</span>
            </button>
          </div>

          {/* Delivery & Trust Guarantee */}
          <div className="bg-amber-50/80 dark:bg-slate-900/80 p-4.5 rounded-2xl border border-[var(--line)] dark:border-slate-800 flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.2]" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">{tr("Atelier Kafolati", "Гарантия упаковки", "Packaging guarantee")}</span>
              <span>
                {tr("Barcha qutilar xavfsiz ikki qatlamli termopaketda yetkaziladi. Quti shikastlanishdan 100% himoyalangan.", "Все коробки доставляются в двойном защитном пакете.", "Every box ships in a double protective bag.")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

      {showOrderModal && (
        <DirectOrderModal
          product={{
            name: `${tr("Sovg'a qadog'i", "Подарочная упаковка", "Gift wrapping")}: ${currentTheme.nameUz} (${tr("lenta", "лента", "ribbon")}: ${currentRibbon.name}, ${tr("muhr", "печать", "seal")}: ${currentSeal.label})`,
            price: currentTheme.price,
            originalPrice: null,
            imageUrl: null,
            discount: null,
            source: "Sovg'a Atelier",
            lastChecked: new Date().toISOString(),
            priceVerified: true,
            availabilityVerified: true,
            store: tr("Sovg'a AI Atelier", "Мастерская упаковки", "Gift wrapping studio"),
            url: "https://sovga.uz/packaging-studio",
            currency: "UZS",
            rating: 5,
            reviewCount: 42,
            availability: tr("Mavjud", "В наличии", "Available"),
            category: "premium",
            reason: customMessage,
            warranty: tr("Sifat kafolati", "Гарантия качества", "Quality guarantee"),
            deliveryEstimate: tr("1 ish kunida Toshkent va viloyatlar", "1 рабочий день — Ташкент и регионы", "1 business day, Tashkent and regions"),
          }}
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </div>
  );
}
