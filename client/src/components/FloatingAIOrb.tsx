import { useState, useEffect, useRef, FormEvent } from "react";
import {
  Sparkles,
  Send,
  X,
  Loader2,
  Trash2,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  Crown,
  Zap,
  Mic,
  MessageSquare,
  Volume2,
  VolumeX,
  MessageCircle,
} from "../lib/icons";
import { useTranslation } from "../lib/i18n";
import { concierge, formatPrice } from "../lib/api";
import { cyberSound } from "../lib/cyberSound";
import PriceComparisonModal from "./PriceComparisonModal";

interface ProductCard {
  name: string;
  price: number;
  originalPrice?: number;
  store: string;
  imageUrl?: string;
  url?: string;
  reason?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ProductCard[];
  timestamp: string;
}

export default function FloatingAIOrb() {
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [compareProduct, setCompareProduct] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting
  const initialGreetingUz = "Assalomu alaykum! Men Sovg'a AI shaxsiy konsyerjiman. Kimga, qanday byudjetda sovg'a qidiryapsiz yoki qaysi mahsulotning eng arzon narxini bilmoqchisiz?";
  const initialGreetingRu = "Здравствуйте! Я личный консьерж Sovg'a AI. Для кого и с каким бюджетом вы ищете подарок, или какую лучшую цену хотите сравнить?";
  const initialGreetingEn = "Hello! I am your Sovg'a AI shopping concierge. Who are you looking a gift for, what is your budget, or which product prices would you like to compare?";

  const getGreeting = () => {
    if (language === "ru") return initialGreetingRu;
    if (language === "en") return initialGreetingEn;
    return initialGreetingUz;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      role: "assistant",
      content: getGreeting(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  // Update greeting on language change if only greeting is present
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "greeting") {
        return [
          {
            id: "greeting",
            role: "assistant",
            content: getGreeting(),
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ];
      }
      return prev;
    });
  }, [language]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const cleanForSpeech = (text: string) => {
    return text
      .replace(/[*_#`~[\]()]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[^\p{L}\p{N}\s.,!?-]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const speak = (rawText: string) => {
    if (!voiceOutputEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = cleanForSpeech(rawText);
      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      const voices = window.speechSynthesis.getVoices();

      if (language === "uz") {
        const match =
          voices.find((v) => v.lang.startsWith("uz") || v.lang.startsWith("tr")) ||
          voices.find((v) => v.lang.startsWith("ru")) ||
          voices[0];
        if (match) utterance.voice = match;
        utterance.lang = match?.lang || "uz-UZ";
      } else if (language === "ru") {
        const match = voices.find((v) => v.lang.startsWith("ru")) || voices[0];
        if (match) utterance.voice = match;
        utterance.lang = "ru-RU";
      } else {
        const match = voices.find((v) => v.lang.startsWith("en")) || voices[0];
        if (match) utterance.voice = match;
        utterance.lang = "en-US";
      }

      utterance.rate = 1.02;
      utterance.pitch = 1.04;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const toggleOpen = () => {
    cyberSound.playClick();
    if (isOpen) {
      stopSpeaking();
    }
    setIsOpen(!isOpen);
  };

  const handleClearChat = () => {
    cyberSound.playClick();
    stopSpeaking();
    setMessages([
      {
        id: "greeting-" + Date.now(),
        role: "assistant",
        content: getGreeting(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    cyberSound.playConfirm();
    setInputValue("");

    const userMessage: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const payloadMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await concierge.chat(payloadMessages, language);

      if (res && res.data) {
        cyberSound.playConfirm();
        const assistantMsg: Message = {
          id: "assistant-" + Date.now(),
          role: "assistant",
          content: res.data.reply || "Sizning so'rovingiz bo'yicha eng yaxshi takliflarni tayyorladim.",
          products: res.data.recommendedProducts || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        speak(assistantMsg.content);
      }
    } catch (err: any) {
      console.error("Concierge chat error:", err);
      const fallbackMsg: Message = {
        id: "error-" + Date.now(),
        role: "assistant",
        content:
          language === "uz" ? "O'zbekiston bozorini tekshirdim! Eng qulay narxlar va chegirmalar do'konlarimizda mavjud. Qidiruv paneli orqali ham darhol solishtirishingiz mumkin." : language === "ru" ? "Проверил рынок Узбекистана! Актуальные цены и предложения доступны через строку поиска." : "I checked the Uzbekistan market! The best prices and deals are available in our stores. You can also compare instantly from the search bar.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speak(fallbackMsg.content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      return;
    }
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === "uz" ? "uz-UZ" : language === "ru" ? "ru-RU" : "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        cyberSound.playConfirm();
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          handleSend(transcript);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const quickPrompts = {
    uz: [
      "Onamga 500,000 so'mga sovg'a",
      "Yangi kelin-kuyovga nima olsam bo'ladi?",
      "iPhone 16 qayerda eng arzon?",
      "Bugungi super chegirmalar",
    ],
    ru: [
      "Подарок маме до 500,000 UZS",
      "Свадебный подарок молодоженам",
      "Где дешевле iPhone 16?",
      "Лучшие скидки сегодня",
    ],
    en: [
      "Gift for mom under 500k UZS",
      "Best wedding gift idea",
      "Cheapest iPhone 16 deals",
      "Flash sales today",
    ],
  };

  const currentPrompts = quickPrompts[language] || quickPrompts.uz;

  return (
    <div className="floating-orb fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 flex flex-col items-end safe-area-mb">
      {/* Tooltip on Hover */}
      {!isOpen && isHovered && (
        <div className="mb-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-sm animate-fade-in relative items-center gap-1.5 hidden sm:flex">
          <span>{language === "uz" ? "Savolingiz bormi?" : language === "ru" ? "Есть вопрос?" : "Have a question?"}</span>
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
        </div>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-24px)] sm:w-[420px] max-w-[420px] bg-white dark:bg-[#0c0e17] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-up origin-bottom-right flex flex-col h-[min(70dvh,540px)] max-h-[580px] z-50">
          {/* Header */}
          <div className="text-white p-4 flex items-center justify-between border-b border-white/10 relative bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-500">
                  <MessageCircle className="w-4 h-4 text-slate-900" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border border-slate-900 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm text-white">
                    {language === "uz" ? "Sovg'a yordamchisi" : language === "ru" ? "Помощник Sovg'a" : "Sovg'a assistant"}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <span>{language === "uz" ? "Sovg'a va narxlar bo'yicha savollar" : language === "ru" ? "Вопросы о подарках и ценах" : "Ask about gifts and prices"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              {isSpeaking && (
                <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono mr-1">
                  <span className="w-1 h-3 bg-amber-400 rounded-full" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1 h-4.5 bg-amber-400 rounded-full" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1 h-2 bg-amber-400 rounded-full" style={{ animationDelay: "300ms" }}></span>
                  <span className="w-1 h-3.5 bg-amber-400 rounded-full" style={{ animationDelay: "450ms" }}></span>
                  <span className="ml-1 text-[9px] font-bold hidden sm:inline">OVOZ</span>
                </div>
              )}

              {/* Voice Output Toggle */}
              <button
                onClick={() => {
                  cyberSound.playClick();
                  if (isSpeaking) stopSpeaking();
                  setVoiceOutputEnabled(!voiceOutputEnabled);
                }}
                className={`p-1.5 sm:p-2 rounded-xl transition cursor-pointer ${
                  voiceOutputEnabled
                    ? "text-amber-400 bg-amber-400/10 hover:bg-amber-400/20"
                    : "text-slate-500 hover:text-white hover:bg-white/10"
                }`}
                title={voiceOutputEnabled ? "Ovozli konsyerj faol (Mute)" : "Ovozli javobni yoqish"}
              >
                {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={handleClearChat}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
                title="Chatni tozalash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={toggleOpen}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-slate-50/50 dark:bg-slate-900/40 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 bg-indigo-600">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2.5 ${
                    msg.role === "user"
                      ? "bg-slate-900 dark:bg-indigo-600 text-white rounded-tr-none shadow-sm"
                      : "bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/90 dark:border-slate-700/80 shadow-xs"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line text-xs font-medium">
                    {msg.content}
                  </p>

                  {msg.role === "assistant" && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => (isSpeaking ? stopSpeaking() : speak(msg.content))}
                        className="flex items-center gap-1 hover:text-amber-500 font-semibold transition cursor-pointer"
                        title="Ovozli tinglash"
                      >
                        <Volume2 className="w-3 h-3 text-amber-500" />
                        <span>{isSpeaking ? "To'xtatish" : "Tinglash"}</span>
                      </button>
                    </div>
                  )}

                  {/* Attached Recommended Product Cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Tavsiya etilgan eng yaxshi variantlar:
                      </span>
                      <div className="space-y-2">
                        {msg.products.map((p, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-2.5 hover:border-indigo-400 transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {p.imageUrl && (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 dark:text-white line-clamp-1 block text-[11px]">
                                  {p.name}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                    {formatPrice(p.price)}
                                  </span>
                                  <span className="text-[10px] text-slate-400">• {p.store}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setCompareProduct(p.name)}
                                className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                                title="Barcha do'konlar narxini solishtirish"
                              >
                                <Zap className="w-3.5 h-3.5" />
                              </button>
                              {p.url && (
                                <a
                                  href={p.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                                  title="Do'konga o'tish"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[9px] text-slate-400 block text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-400">
                <div className="w-7 h-7 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm bg-indigo-600">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span className="text-[11px] text-slate-500 font-mono">
                    Konsyerj javob tayyorlamoqda...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestions */}
          {messages.length <= 2 && (
            <div className="px-3 pt-2 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {currentPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[10px] font-bold whitespace-nowrap transition cursor-pointer shrink-0 border border-slate-200/60 dark:border-slate-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  language === "uz"
                    ? "Maslahat so'rang (masalan: 1 mln so'mga sovg'a)..."
                    : language === "ru"
                    ? "Спросите консьержа..."
                    : "Ask concierge..."
                }
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />

              <button
                type="button"
                onClick={startVoiceInput}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition cursor-pointer ${
                  isListening ? "text-rose-500 animate-pulse" : ""
                }`}
                title="Ovozli gapirish"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 rounded-2xl text-white transition shadow-sm disabled:opacity-40 cursor-pointer bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={toggleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group focus:outline-hidden cursor-pointer"
      >
        {/* Glow rings */}
        {isSpeaking && (
          <div className="absolute -inset-3 rounded-full border border-amber-400 opacity-75 pointer-events-none"></div>
        )}

        {/* Main Orb */}
        <div className="relative w-12 h-12 rounded-full shadow-lg flex items-center justify-center bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 transition-colors">
          {isOpen ? (
            <X className="w-5 h-5 text-white dark:text-slate-900" />
          ) : (
            <MessageCircle className="w-5 h-5 text-white dark:text-slate-900" />
          )}
        </div>

        {/* Live Notification Indicator */}
      </button>

      {/* Price Comparison Modal */}
      {compareProduct && (
        <PriceComparisonModal
          productName={compareProduct}
          onClose={() => setCompareProduct(null)}
        />
      )}
    </div>
  );
}
