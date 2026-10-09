import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { Search, Sparkles, Camera, X, Flame, ArrowRight, ShieldCheck, Command, Mic, MicOff, Loader } from "lucide-react";
import ImageSearchModal from "./ImageSearchModal";
import { cyberSound } from "../lib/cyberSound";

const quickSearches = [
  { uz: "iPhone 16 Pro Max", ru: "iPhone 16 Pro Max", en: "iPhone 16 Pro Max", icon: "📱" },
  { uz: "Samsung S24 Ultra", ru: "Samsung S24 Ultra", en: "Samsung S24 Ultra", icon: "⚡" },
  { uz: "Dyson Airwrap", ru: "Dyson Airwrap", en: "Dyson Airwrap", icon: "💨" },
  { uz: "Konditsioner", ru: "Кондиционер", en: "Air Conditioner", icon: "❄️" },
  { uz: "Velosiped", ru: "Велосипед", en: "Bicycle", icon: "🚲" },
  { uz: "PlayStation 5", ru: "PlayStation 5", en: "PlayStation 5", icon: "🎮" },
  { uz: "To'y sovg'asi", ru: "Подарок на свадьбу", en: "Wedding gift", icon: "🎁" },
];

const trendingItems = [
  { title: "De'Longhi Dolce Gusto Mini Me", category: "Kitchen & Home", price: "650,000 UZS" },
  { title: "Sony WH-1000XM5 Wireless ANC", category: "Audio & Tech", price: "3,200,000 UZS" },
  { title: "Handcrafted Rishton Ceramic Tea Set", category: "Artisanal", price: "350,000 UZS" },
  { title: "Xiaomi Mi Smart Air Fryer 3.5L", category: "Smart Home", price: "420,000 UZS" },
  { title: "Apple AirPods Pro 2nd Gen USB-C", category: "Audio", price: "2,750,000 UZS" },
  { title: "KitchenAid Classic Stand Mixer", category: "Kitchen & Luxury", price: "1,180,000 UZS" },
];

export default function SearchBar({
  large = false,
  initialQuery = "",
  onSearch,
}: {
  large?: boolean;
  initialQuery?: string;
  onSearch?: (q: string) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const { t, language } = useTranslation();

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Kechirasiz, sizning brauzeringizda Ovozli Qidiruv qo'llab-quvvatlanmaydi.");
      return;
    }
    
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = language === "uz" ? "uz-UZ" : language === "ru" ? "ru-RU" : "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;
      
      recognition.onstart = () => {
        cyberSound.playConfirm();
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        // Let user see what was typed for a second, then search?
        // Wait, it triggers onChange, they can hit enter.
      };
      
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsFocused(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    if (onSearch) onSearch(trimmed);
  };

  const handleSelectQuery = (text: string) => {
    setQuery(text);
    setIsFocused(false);
    navigate(`/search?q=${encodeURIComponent(text)}`);
    if (onSearch) onSearch(text);
  };

  const handleQuick = (q: typeof quickSearches[0]) => {
    const text = q[language as keyof typeof q] || q.en;
    setQuery(text);
    setIsFocused(false);
    navigate(`/search?q=${encodeURIComponent(text)}`);
    if (onSearch) onSearch(text);
  };

  // Filter trending items matching user typed input
  const filteredSuggestions = query.trim()
    ? trendingItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : trendingItems.slice(0, 4);

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center bg-gradient-to-r from-white via-[#fcfaf7] to-white dark:from-[#131622] dark:via-[#10121d] dark:to-[#131622] backdrop-blur-xl rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 z-20 ${
          isFocused
            ? "border-amber-500 ring-4 ring-amber-500/20 shadow-2xl shadow-amber-900/10 dark:shadow-black/60"
            : "border-amber-300/80 hover:border-amber-400 dark:border-white/10 dark:hover:border-amber-400/50 shadow-[0_12px_40px_-5px_rgba(200,154,59,0.15)] dark:shadow-[0_12px_40px_-5px_rgba(0,0,0,0.6)]"
        } ${large ? "p-2 sm:p-2.5" : "p-1.5"}`}
      >
        <div className={`flex items-center justify-center shrink-0 ${large ? "w-10 h-10 sm:w-11 sm:h-11 ml-1 sm:ml-1.5" : "w-8 h-8 sm:w-9 sm:h-9 ml-1"} rounded-xl sm:rounded-2xl icon-medallion icon-box-gold transition-all duration-300 ${isFocused ? "scale-105 shadow-md shadow-amber-500/30" : ""}`}>
          <Search className={`${large ? "w-4 h-4 sm:w-5 sm:h-5" : "w-3.5 h-3.5 sm:w-4 sm:h-4"} stroke-[2.2]`} />
        </div>
        <input
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className={`flex-1 min-w-0 bg-transparent outline-none ${
            large ? "px-2.5 sm:px-4 py-2.5 sm:py-3.5 text-sm sm:text-lg font-bold" : "px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-base font-bold"
          } text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500`}
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full mr-0.5 sm:mr-1 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}

        {/* Fast Spotlight Command Palette Trigger (Desktop only) */}
        <button
          type="button"
          onClick={() => {
            cyberSound.playConfirm();
            window.dispatchEvent(new CustomEvent("open-command-palette"));
          }}
          title="Spotlight & Tezkor Buyruqlar (1-bosishda ochish)"
          className="hidden sm:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 border border-transparent hover:border-amber-300/50 dark:hover:border-amber-700/40 transition-all mr-1 flex-shrink-0 cursor-pointer active:scale-95"
        >
          <Command className={large ? "w-4 h-4 sm:w-5 sm:h-5" : "w-4 h-4"} strokeWidth={2.2} />
        </button>

        {/* Voice Search Mic Icon */}
        <button
          type="button"
          onClick={startListening}
          title="Ovozli Qidiruv (Voice Search)"
          className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl transition-all mr-0.5 sm:mr-1 flex-shrink-0 relative cursor-pointer active:scale-95 border ${
            isListening 
              ? "text-rose-600 bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 animate-pulse" 
              : "text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-transparent hover:border-rose-200 dark:hover:border-rose-900/40"
          }`}
        >
          {isListening && (
            <span className="absolute inset-0 rounded-xl sm:rounded-2xl bg-rose-400 opacity-20 animate-ping"></span>
          )}
          <Mic className={large ? "w-4 h-4 sm:w-5 sm:h-5" : "w-4 h-4"} strokeWidth={2.2} />
        </button>

        {/* Visual / Image Search Camera Icon */}
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          title="Rasm orqali qidirish (AI Visual Search)"
          className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/40 transition-all mr-1 sm:mr-2 flex-shrink-0 cursor-pointer active:scale-95"
        >
          <Camera className={large ? "w-4 h-4 sm:w-5 sm:h-5" : "w-4 h-4"} strokeWidth={2.2} />
        </button>

        <button
          type="submit"
          className={`${
            large ? "px-4 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-base" : "px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm"
          } bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:brightness-105 text-white font-black rounded-xl sm:rounded-2xl transition-all duration-200 shadow-md shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 flex-shrink-0 cursor-pointer`}
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 stroke-[2.2] animate-pulse" />
          <span className="hidden sm:inline">{t("search.button")}</span>
        </button>
      </form>

      {/* Live Auto-Complete Suggestions Dropdown */}
      {isFocused && (
        <div className="absolute left-0 right-0 top-full mt-2.5 bg-white/95 dark:bg-[#12141f]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-amber-300/80 dark:border-slate-800 p-4 sm:p-5 z-30 animate-fade-in space-y-3.5 text-slate-900 dark:text-white">
          <div className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-amber-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              {query.trim() ? "O'xshash mahsulotlar" : "O'zbekistonda ommabop qidiruvlar"}
            </span>
            <span className="text-[10px] bg-amber-100/80 dark:bg-slate-800 text-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-300/60 dark:border-slate-700">Jonli AI</span>
          </div>

          <div className="space-y-1.5">
            {filteredSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuery(item.title)}
                className="w-full text-left p-3 rounded-2xl hover:bg-amber-50/80 dark:hover:bg-slate-800/80 transition-all duration-200 flex items-center justify-between group border border-transparent hover:border-amber-200 dark:hover:border-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <Search className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition block">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-950 dark:text-amber-300 bg-amber-100/80 dark:bg-slate-800 group-hover:bg-amber-200/80 dark:group-hover:bg-slate-700 px-2 py-0.5 rounded-md transition border border-amber-200/70 dark:border-slate-700">
                    {item.price}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
                </div>
              </button>
            ))}
          </div>

          {/* Quick preset chips inside dropdown */}
          <div className="pt-2 border-t border-amber-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1.5 font-bold">Tavsiya etilgan qidiruvlar:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickSearches.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectQuery(q[language as keyof typeof q] || q.en)}
                  className="text-[11px] font-bold px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-950 dark:text-amber-300 rounded-lg transition border border-amber-200/60 dark:border-slate-700 cursor-pointer"
                >
                  {q[language as keyof typeof q] || q.en}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick searches beneath search bar (only on compact bars, since HomePage has dedicated hero chips) */}
      {!large && (
        <div className="mt-3.5 flex flex-wrap gap-2 justify-center">
          {quickSearches.map((q, i) => (
            <button
              key={i}
              onClick={() => handleQuick(q)}
              className="text-xs px-3.5 py-1.5 bg-white dark:bg-slate-900/80 border border-amber-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-full hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 font-bold"
            >
              <span className="text-sm">{q.icon}</span>
              <span>{q[language as keyof typeof q] || q.en}</span>
            </button>
          ))}
        </div>
      )}

      {showImageModal && <ImageSearchModal onClose={() => setShowImageModal(false)} />}
    </div>
  );
}
