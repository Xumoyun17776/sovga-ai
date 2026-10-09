import { useState, useRef } from "react";
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
} from "lucide-react";

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

const BOX_THEMES: BoxTheme[] = [
  {
    id: "obsidian",
    nameUz: "Royal Midnight Obsidian",
    descUz: "To'q qora baxmal qoplama va platina hoshiya. Eng hashamatli va nufuzli sovg'alar uchun.",
    boxBg: "bg-slate-950",
    borderStyle: "border-slate-700/80 shadow-2xl shadow-slate-950/40",
    textColor: "text-slate-100",
    tagBg: "bg-gradient-to-r from-slate-200 via-white to-slate-300",
    tagBorder: "border-slate-400",
    tagText: "text-slate-950",
    price: 55000,
  },
  {
    id: "silk",
    nameUz: "Milliy Zardo'zi & Adras Silk",
    descUz: "O'zbek xonatlas va zardo'zi nozik naqshlari bilan bezatilgan milliy qiymatdagi quti.",
    boxBg: "bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950",
    borderStyle: "border-indigo-500/40 shadow-2xl shadow-indigo-950/40",
    textColor: "text-indigo-100",
    tagBg: "bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300",
    tagBorder: "border-amber-400",
    tagText: "text-amber-950",
    price: 65000,
  },
  {
    id: "swiss",
    nameUz: "Swiss Matte Porcelain",
    descUz: "Minimalist Shveytsariya uslubidagi matli qor-oq qadoq. Zamonaviy estetik ixlosmandlariga.",
    boxBg: "bg-white",
    borderStyle: "border-slate-200 shadow-xl shadow-slate-200/50",
    textColor: "text-slate-900",
    tagBg: "bg-slate-900",
    tagBorder: "border-slate-900",
    tagText: "text-white",
    price: 45000,
  },
  {
    id: "emerald",
    nameUz: "Toshkent Zumrad & Gold Leaf",
    descUz: "Chuqur zumrad rangli silliq mato va tilla zarli muhr. To'y va yubileylar ramzi.",
    boxBg: "bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950",
    borderStyle: "border-emerald-500/40 shadow-2xl shadow-emerald-950/40",
    textColor: "text-emerald-100",
    tagBg: "bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400",
    tagBorder: "border-amber-500",
    tagText: "text-amber-950",
    price: 60000,
  },
];

const RIBBON_COLORS = [
  { id: "gold", name: "Imperial Tilla", colorClass: "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500", glow: "shadow-amber-400/30" },
  { id: "indigo", name: "Royal Indigo", colorClass: "bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700", glow: "shadow-indigo-500/30" },
  { id: "ruby", name: "Buxoro Yoqut", colorClass: "bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700", glow: "shadow-rose-500/30" },
  { id: "silver", name: "Platina Kumush", colorClass: "bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400", glow: "shadow-slate-300/30" },
];

const WAX_SEALS = [
  { id: "baxt", label: "Baxt & Saodat", symbol: "✦" },
  { id: "hurmat", label: "Hurmat & Ehtirom", symbol: "⚜" },
  { id: "omad", label: "Omad & Muvaffaqiyat", symbol: "★" },
  { id: "mehr", label: "Mehr & Muhabbat", symbol: "❤" },
];

export default function PackagingStudioPage() {
  const toast = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const boxCardRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useCurrency();

  const [selectedBox, setSelectedBox] = useState<string>("obsidian");
  const [selectedRibbon, setSelectedRibbon] = useState<string>("gold");
  const [selectedSeal, setSelectedSeal] = useState<string>("baxt");
  const [recipientName, setRecipientName] = useState("Aziz Do'stim");
  const [senderName, setSenderName] = useState("Samimiyat bilan");
  const [customMessage, setCustomMessage] = useState(
    "Ushbu sovg'a sizga quvonch, baraka va eng yorqin lahzalarni hadya etsin!"
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

  const currentTheme = BOX_THEMES.find((b) => b.id === selectedBox) || BOX_THEMES[0];
  const currentRibbon = RIBBON_COLORS.find((r) => r.id === selectedRibbon) || RIBBON_COLORS[0];
  const currentSeal = WAX_SEALS.find((s) => s.id === selectedSeal) || WAX_SEALS[0];

  const handlePrint = () => {
    cyberSound.playConfirm();
    window.print();
  };

  const handleCopyCode = () => {
    cyberSound.playConfirm();
    const text = `SOVG'A AI | PREMIUM QADOQLASH PASPORTI\n` +
      `──────────────────────\n` +
      `Quti Uslubi: ${currentTheme.nameUz}\n` +
      `Lenta Turi: ${currentRibbon.name}\n` +
      `Mumlu Muhr: ${currentSeal.label}\n` +
      `Kimga: ${recipientName}\n` +
      `Kimdan: ${senderName}\n` +
      `Dildan so'zlar: "${customMessage}"\n` +
      `Qadoqlash narxi: ${formatPrice(currentTheme.price)}\n` +
      `Manzil: sovga.uz/packaging-studio`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Qadoqlash pasporti ma'lumotlari nusxalandi!", "Nusxalandi");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors bg-[#fcfbf9] dark:bg-[#07080c] relative overflow-hidden">
      {/* Ambient luxury glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 dark:bg-amber-500/10 text-amber-900 dark:text-amber-400 border border-amber-300/80 dark:border-amber-500/20 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
            <span>SOVG'A ATELIER · 3D INTERACTIVE</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
            Hashamatli Qadoqlash & 3D Muhr Studiyasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400 leading-relaxed font-normal">
            Har qanday xaridingizni qirollik darajasidagi sovg'aga aylantiring. Haqiqiy ipak lentalar, 
            qo'lda quyilgan mumli muhr va recipient nomiga yozilgan metall o'ymakorlik lavhasi.
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
              className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f8f3e5] dark:from-[#121420] dark:to-[#090b12] p-3 sm:p-4 rounded-3xl border-2 border-amber-200/80 dark:border-slate-800 shadow-luxury transition-all duration-200"
              style={{
                perspective: "1000px",
              }}
            >
              <div
                ref={printRef}
                className={`relative rounded-3xl p-5 sm:p-12 min-h-[400px] sm:min-h-[480px] flex flex-col justify-between overflow-hidden max-w-full ${currentTheme.boxBg} ${currentTheme.borderStyle}`}
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
                  <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-amber-950/90 via-slate-900/95 to-slate-950 border border-amber-500/40 p-6 flex flex-col items-center justify-center text-center z-30 animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-4 shadow-lg shadow-amber-500/20">
                      <Gift className="w-8 h-8 animate-bounce stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
                      Atelier Ichki Baxmal Qoplama
                    </span>
                    <h4 className="text-xl font-bold text-white mb-2">Sovg'angiz xavfsiz himoyada</h4>
                    <p className="text-xs text-slate-300 max-w-sm mb-4">
                      Ikki qatlamli ipak mato va zardo'zi o'ralgan maxsus bo'lma ichida joylashtiriladi.
                    </p>
                    <button
                      onClick={() => {
                        cyberSound.playClick();
                        setIsOpened(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition cursor-pointer active:scale-95"
                    >
                      Qutini yopish ✕
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Vertical Ribbon Cross */}
                    <div
                      className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-9 sm:w-14 ${currentRibbon.colorClass} shadow-lg ${currentRibbon.glow} opacity-95 pointer-events-none`}
                    />

                    {/* Horizontal Ribbon Cross */}
                    <div
                      className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-9 sm:h-14 ${currentRibbon.colorClass} shadow-lg ${currentRibbon.glow} opacity-95 pointer-events-none`}
                    />

                    {/* Center Royal Wax Seal (Mumlu Muhr) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div
                        onClick={() => {
                          cyberSound.playHoloChime();
                          setIsOpened(true);
                        }}
                        className="relative group cursor-pointer active:scale-95 transition-transform"
                        title="Qutini ochish uchun bosing"
                      >
                        {/* Wax drip edge simulation */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 p-1.5 shadow-2xl flex items-center justify-center border-2 border-amber-600/50 group-hover:scale-105 transition-all">
                          <div className="w-full h-full rounded-full border border-amber-500/40 flex flex-col items-center justify-center text-amber-200 text-center shadow-inner bg-gradient-to-br from-amber-800 via-amber-900 to-slate-950">
                            <span className="text-xl sm:text-2xl font-bold">{currentSeal.symbol}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-amber-300">
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
                    <span>Sovg'a AI Atelier</span>
                  </div>
                  <button
                    onClick={() => {
                      cyberSound.playHoloChime();
                      setIsOpened(!isOpened);
                    }}
                    className="text-[11px] font-mono tracking-wider text-amber-300 bg-black/40 hover:bg-black/60 px-3 py-1 rounded-xl border border-white/10 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>{isOpened ? "Yopish" : "Ochib ko'rish"}</span>
                  </button>
                </div>

                {/* Bottom Custom Engraved Plaque (Metall O'ymakorlik Lavhasi) */}
                <div className="relative z-10 mt-auto pt-24 sm:pt-32">
                  <div
                    className={`p-5 rounded-2xl border shadow-xl ${currentTheme.tagBg} ${currentTheme.tagBorder} ${currentTheme.tagText} transition-all duration-300 backdrop-blur-sm`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block">
                          Maxsus bag'ishlov:
                        </span>
                        <h3 className="font-display font-extrabold text-base sm:text-lg tracking-tight">
                          {recipientName || "Hurmatli Mehmon"}
                        </h3>
                        <p className="text-xs italic leading-relaxed opacity-85 line-clamp-2">
                          "{customMessage}"
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[9px] uppercase font-bold opacity-60 block">Kimdan:</span>
                        <span className="text-xs font-extrabold block">{senderName}</span>
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
                className="flex-1 py-3.5 btn-luxury-gold text-slate-950 font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                <span>Chop etish (Print)</span>
              </button>
              <button
                onClick={handleCopyCode}
                className="py-3.5 px-4 bg-amber-100/70 hover:bg-amber-200/70 dark:bg-slate-800 dark:hover:bg-slate-750 text-amber-950 dark:text-slate-200 font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition border border-amber-200/80 dark:border-slate-700 cursor-pointer shadow-2xs active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600 stroke-[2.2]" /> : <Copy className="w-4 h-4 stroke-[2.2]" />}
                <span>{copied ? "Nusxalandi" : "Pasportni nusxalash"}</span>
              </button>
            </div>
          </div>

        {/* Right Column: Customization Controls Panel */}
        <div className="lg:col-span-6 space-y-6">
          {/* Step 1: Select Box Material */}
          <div className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#121420] dark:to-[#0a0c14] rounded-3xl p-6 border-2 border-amber-200/80 dark:border-slate-800 shadow-luxury space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                <span>1. Quti uslubi va materialini tanlang</span>
              </h2>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-400 bg-amber-100/90 dark:bg-amber-500/10 px-3 py-1 rounded-full border border-amber-300/80 dark:border-amber-500/20 shadow-2xs">
                {formatPrice(currentTheme.price)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BOX_THEMES.map((theme) => {
                const isSelected = selectedBox === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      cyberSound.playClick(1300);
                      setSelectedBox(theme.id);
                    }}
                    className={`p-4 rounded-2xl text-left border-2 transition cursor-pointer active:scale-95 ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/90 dark:bg-amber-950/30 ring-2 ring-amber-400/20 shadow-md"
                        : "border-amber-200/70 dark:border-slate-800 hover:border-amber-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{theme.nameUz}</span>
                      <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-400">
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
          <div className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#121420] dark:to-[#0a0c14] rounded-3xl p-6 border-2 border-amber-200/80 dark:border-slate-800 shadow-luxury space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              <span>2. Ipak lenta rangini tanlang</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {RIBBON_COLORS.map((ribbon) => {
                const isSelected = selectedRibbon === ribbon.id;
                return (
                  <button
                    key={ribbon.id}
                    onClick={() => {
                      cyberSound.playClick(1500);
                      setSelectedRibbon(ribbon.id);
                    }}
                    className={`p-3 rounded-2xl text-center border-2 transition flex flex-col items-center gap-2 cursor-pointer active:scale-95 ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/90 dark:bg-amber-950/30 ring-2 ring-amber-400/20 shadow-md"
                        : "border-amber-200/70 dark:border-slate-800 hover:border-amber-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 shadow-2xs"
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
          <div className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#121420] dark:to-[#0a0c14] rounded-3xl p-6 border-2 border-amber-200/80 dark:border-slate-800 shadow-luxury space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Stamp className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              <span>3. Mumli muhr ramzini tanlang (Wax Seal)</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {WAX_SEALS.map((seal) => {
                const isSelected = selectedSeal === seal.id;
                return (
                  <button
                    key={seal.id}
                    onClick={() => {
                      cyberSound.playConfirm();
                      setSelectedSeal(seal.id);
                    }}
                    className={`p-3 rounded-2xl text-center border-2 transition cursor-pointer active:scale-95 ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/90 dark:bg-amber-950/30 ring-2 ring-amber-400/20 font-bold shadow-md"
                        : "border-amber-200/70 dark:border-slate-800 hover:border-amber-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 shadow-2xs"
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
          <div className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#121420] dark:to-[#0a0c14] rounded-3xl p-6 border-2 border-amber-200/80 dark:border-slate-800 shadow-luxury space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              <span>4. Metall lavhadagi bag'ishlov matni</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Kimga (Recipient):</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-amber-50/60 dark:bg-slate-800/80 rounded-xl border border-amber-200/80 dark:border-slate-700 font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  placeholder="e.g. Malika Karimova"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Kimdan (From):</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-amber-50/60 dark:bg-slate-800/80 rounded-xl border border-amber-200/80 dark:border-slate-700 font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  placeholder="e.g. Jamshid va Oila a'zolari"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Bag'ishlov so'zlari (Engraved dedication):
                </label>
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-amber-50/60 dark:bg-slate-800/80 rounded-xl border border-amber-200/80 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 text-xs shadow-2xs"
                  placeholder="Samimiy tilak matnini kiriting..."
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
              className="w-full py-4.5 btn-luxury-gold text-slate-950 font-black rounded-2xl text-sm sm:text-base transition shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <PackageCheck className="w-5 h-5 text-slate-950 stroke-[2.2]" />
              <span>Ushbu Qadoqda Xarid Qilish / Buyurtma Berish ({formatPrice(currentTheme.price)})</span>
            </button>
          </div>

          {/* Delivery & Trust Guarantee */}
          <div className="bg-amber-50/80 dark:bg-slate-900/80 p-4.5 rounded-2xl border border-amber-200/80 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.2]" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Atelier Kafolati</span>
              <span>
                Barcha qutilar xavfsiz ikki qatlamli termopaketda yetkaziladi. Quti shikastlanishdan 100% himoyalangan.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

      {showOrderModal && (
        <DirectOrderModal
          product={{
            name: `Sovg'a Atelier Qadoq: ${currentTheme.nameUz} (Lenta: ${currentRibbon.name}, Muhr: ${currentSeal.label})`,
            price: currentTheme.price,
            originalPrice: null,
            imageUrl: null,
            discount: null,
            source: "Sovg'a Atelier",
            lastChecked: new Date().toISOString(),
            priceVerified: true,
            availabilityVerified: true,
            store: "Sovg'a AI Atelier",
            url: "https://sovga.uz/packaging-studio",
            currency: "UZS",
            rating: 5,
            reviewCount: 42,
            availability: "Mavjud",
            category: "premium",
            reason: customMessage,
            warranty: "100% Sifat kafolati",
            deliveryEstimate: "1 ish kunida Toshkent va viloyatlar",
          }}
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </div>
  );
}
