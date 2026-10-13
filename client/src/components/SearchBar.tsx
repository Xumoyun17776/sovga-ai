import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { Search, Sparkles, Camera, X, Flame, ArrowRight, ShieldCheck, Command, Mic, MicOff, Loader } from "../lib/icons";
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
        className={`relative z-20 flex items-center bg-white border transition-all ${
          isFocused ? "border-[var(--anor)] ring-4 ring-[var(--anor)]/10" : "border-[var(--rule-soft)] hover:border-[var(--line-strong)]"
        } ${large ? "h-16 rounded-2xl p-1.5 shadow-[0_10px_30px_-12px_rgba(var(--shadow-color),.22)]" : "h-11 rounded-xl p-1"}`}
      >
        <Search className={`${large ? "w-5 h-5 ml-3" : "w-4 h-4 ml-2"} text-[var(--ink-2)] flex-shrink-0`} />
        <input
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          aria-label={t("search.placeholder")}
          className={`flex-1 min-w-0 h-full bg-transparent outline-none px-3 ${large ? "text-[17px]" : "text-[15px]"} text-[var(--ink)] placeholder:text-[var(--ink-2)]/70`}
        />

        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear" className="p-2 text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={startListening}
          title={t("search.placeholder")}
          aria-label="Voice search"
          className={`flex items-center justify-center w-10 h-10 flex-shrink-0 cursor-pointer transition-colors ${isListening ? "text-[var(--anor)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]"}`}
        >
          <Mic className="w-[18px] h-[18px]" />
        </button>
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          aria-label="Image search"
          className="flex items-center justify-center w-10 h-10 mr-1 flex-shrink-0 text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer transition-colors"
        >
          <Camera className="w-[18px] h-[18px]" />
        </button>

        <button type="submit" className={`btn-primary h-full ${large ? "px-6 text-[15px] !rounded-xl" : "px-4 text-sm !rounded-lg"}`}>
          <Search className="w-4 h-4 sm:hidden" />
          <span className="hidden sm:inline">{t("search.button")}</span>
        </button>
      </form>

      {/* Live Auto-Complete Suggestions Dropdown */}
      {isFocused && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-[var(--rule-soft)] p-5 z-30 space-y-3.5 text-[var(--ink)]">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-[var(--line)] dark:border-slate-800">
            <span className="flex items-center gap-1.5 text-[var(--ink)]">
              <Flame className="w-3.5 h-3.5 text-[var(--anor)]" />
              {query.trim() ? "O'xshash mahsulotlar" : "O'zbekistonda ommabop qidiruvlar"}
            </span>
            
          </div>

          <div className="space-y-1.5">
            {filteredSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuery(item.title)}
                className="w-full text-left p-3 rounded-2xl hover:bg-[var(--paper-2)] dark:hover:bg-slate-800/80 transition-all duration-200 flex items-center justify-between group border border-transparent hover:border-[var(--line-strong)] dark:hover:border-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[var(--anor)] transition-transform">
                    <Search className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-[var(--anor)] dark:group-hover:text-amber-400 transition block">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--anor)] bg-[var(--accent-soft)] dark:bg-slate-800  dark:group-hover:bg-slate-700 px-2 py-0.5 rounded-md transition border border-[var(--line)] dark:border-slate-700">
                    {item.price}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[var(--anor)] dark:group-hover:text-amber-400 transition" />
                </div>
              </button>
            ))}
          </div>

          {/* Quick preset chips inside dropdown */}
          <div className="pt-2 border-t border-[var(--line)] dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1.5 font-bold">Tavsiya etilgan qidiruvlar:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickSearches.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectQuery(q[language as keyof typeof q] || q.en)}
                  className="text-[11px] font-bold px-2.5 py-1 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition border border-[var(--line)] dark:border-slate-700 cursor-pointer bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]"
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
              className="text-xs px-3.5 py-1.5 bg-white dark:bg-slate-900/80 border border-[var(--line)] dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-full hover:border-[var(--line-strong)] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-1.5 font-bold"
            >
              <span>{q[language as keyof typeof q] || q.en}</span>
            </button>
          ))}
        </div>
      )}

      {showImageModal && <ImageSearchModal onClose={() => setShowImageModal(false)} />}
    </div>
  );
}
