import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auth } from "../lib/api";
import { useToast } from "./Toast";
import { useTranslation } from "../lib/i18n";
import {
  Gift,
  X,
  Sparkles,
  User,
  Shield,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Zap,
  Tag,
  Heart,
  Eye,
  EyeOff,
} from "lucide-react";

export default function FirstVisitWelcomeModal() {
  const { language } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"welcome" | "login" | "register">("welcome");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: auth.me });

  useEffect(() => {
    // Only trigger for first-time visitors who are not logged in
    try {
      if (typeof window !== "undefined") {
        const dismissed = window.localStorage.getItem("sovga_first_visit_dismissed");
        if (!dismissed && !user) {
          // Delay by 700ms for smooth page appearance
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 700);
          return () => clearTimeout(timer);
        }
      }
    } catch {}
  }, [user]);

  const handleDismiss = () => {
    try {
      window.localStorage.setItem("sovga_first_visit_dismissed", "true");
    } catch {}
    setIsOpen(false);
  };

  const loginMut = useMutation({
    mutationFn: (credentials?: { email: string; password: string }) =>
      auth.login(credentials || { email: form.email, password: form.password }),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success(`Welcome, ${data.name || "Explorer"}!`, "Successfully signed in");
      handleDismiss();
    },
    onError: (e: Error) => setError(e.message),
  });

  const registerMut = useMutation({
    mutationFn: () => auth.register({ name: form.name, email: form.email, password: form.password }),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success(`Account created, welcome ${data.name}!`, "Welcome to Sovg'a AI");
      handleDismiss();
    },
    onError: (e: Error) => setError(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "register") {
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters (kamida 6 ta belgi)");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match (parollar mos kelmadi)");
        return;
      }
      registerMut.mutate();
    } else {
      loginMut.mutate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300/80 dark:border-amber-500/25 shadow-luxury overflow-y-auto max-h-[92vh] max-h-[92dvh] my-auto animate-scale-in">
        {/* Ambient Top Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-14 bg-amber-400/15 dark:bg-amber-400/10 blur-2xl pointer-events-none rounded-full" />

        {/* Close / Guest Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
          title={language === "uz" ? "Mehmon sifatida davom etish" : language === "ru" ? "Продолжить как гость" : "Continue as Guest"}
        >
          <X className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Header Badge */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 dark:bg-slate-800/90 border border-amber-300/80 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 text-[11px] font-bold tracking-wider uppercase mb-4 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse stroke-[2.2]" />
            <span>
              {language === "uz"
                ? "VIP Kirish • Xush Kelibsiz"
                : language === "ru"
                ? "VIP Доступ • Добро пожаловать"
                : "VIP Access • First Visit Welcome"}
            </span>
          </div>

          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_0_30px_rgba(245,158,11,0.35)] border border-amber-300/40">
            <Gift className="w-7 h-7 text-slate-950 stroke-[2.2]" />
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            {mode === "welcome"
              ? language === "uz"
                ? "Sovg'a AI ga Xush Kelibsiz"
                : language === "ru"
                ? "Добро пожаловать в Sovg'a AI"
                : "Welcome to Sovg'a AI"
              : mode === "login"
              ? language === "uz"
                ? "Akkauntingizga Kiring"
                : language === "ru"
                ? "Вход в Аккаунт"
                : "Sign In to Your Account"
              : language === "uz"
              ? "VIP Akkaunt Ochish"
              : language === "ru"
              ? "Создать VIP Аккаунт"
              : "Create Your VIP Account"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            {mode === "welcome"
              ? language === "uz"
                ? "O'zbekistonning 1-raqamli AI xarid konsyerji va eng arzon narxlar qidiruv tizimi."
                : language === "ru"
                ? "Главный AI шопинг-консьерж и поисковик лучших цен по Узбекистану."
                : "The premier AI shopping concierge and live price engine for Uzbekistan."
              : language === "uz"
              ? "Jonli narx monitoringi, to'y reyestrlari va 1-bosishda xaridlardan foydalaning."
              : language === "ru"
              ? "Получите доступ к мониторингу цен, свадебным реестрам и быстрой покупке."
              : "Access real-time price drop alerts, wedding registries, and 1-click checkout."}
          </p>
        </div>

        {/* ─── MODE 1: WELCOME HUB ─── */}
        {mode === "welcome" && (
          <div className="space-y-5 relative z-10">
            {/* VIP Member Perks */}
            <div className="grid grid-cols-1 gap-2.5 bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-amber-200/70 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {language === "uz" ? "Jonli Narxlar Arbitraji" : language === "ru" ? "Арбитраж Цен в Реальном Времени" : "Real-Time Price Arbitrage"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === "uz"
                      ? "Uzum, Texnomart va MediaPark bo'yicha eng arzon asl narxlarni taqqoslaydi."
                      : language === "ru"
                      ? "Сравнение цен Uzum, Texnomart и MediaPark для поиска лучшей сделки."
                      : "Scans Uzum, Texnomart & MediaPark for lowest verified price."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {language === "uz" ? "Ilova Ichida To'g'ridan-to'g'ri Xarid" : language === "ru" ? "Прямой Заказ в Приложении" : "In-App Direct Checkout"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === "uz"
                      ? "Click, Payme yoki Naqd to'lov orqali sovg'a qutisida buyurtma bering."
                      : language === "ru"
                      ? "Заказ с Click, Payme или наличными в подарочной упаковке."
                      : "Order directly with Click, Payme or Cash with gift packaging."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {language === "uz" ? "To'y & Istaklar Reyestri" : language === "ru" ? "Свадебный Реестр и Вишлист" : "Wedding & Wishlist Registries"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === "uz"
                      ? "Bir xil sovg'a takrorlanmaydigan shaxsiy ro'yxatni yaqinlarga ulashing."
                      : language === "ru"
                      ? "Удобный список желаний для друзей без дубликатов подарков."
                      : "Shareable gift registries with zero duplicate gifts."}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setMode("login")}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-2xs"
              >
                <span>{language === "uz" ? "Kirish" : language === "ru" ? "Войти" : "Sign In"}</span>
              </button>

              <button
                onClick={() => setMode("register")}
                className="w-full py-3 px-4 rounded-xl btn-luxury-gold font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md"
              >
                <span>{language === "uz" ? "Akkaunt Ochish" : language === "ru" ? "Создать Аккаунт" : "Create Account"}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Continue as Guest option */}
            <div className="text-center pt-1">
              <button
                onClick={handleDismiss}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition underline underline-offset-4 cursor-pointer active:scale-95"
              >
                {language === "uz"
                  ? "Mehmon sifatida ko'rib chiqish →"
                  : language === "ru"
                  ? "Продолжить без регистрации как гость →"
                  : "Continue as Guest / Explore without signing in →"}
              </button>
            </div>
          </div>
        )}

        {/* ─── MODE 2 & 3: FORM (LOGIN / REGISTER) ─── */}
        {(mode === "login" || mode === "register") && (
          <div className="relative z-10 space-y-4">
            {/* Mode Switch Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-bold border border-amber-200/70 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer active:scale-95 ${
                  mode === "login" ? "bg-amber-500 text-slate-950 shadow-md font-extrabold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {language === "uz" ? "Kirish" : language === "ru" ? "Вход" : "Sign In"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer active:scale-95 ${
                  mode === "register" ? "bg-amber-500 text-slate-950 shadow-md font-extrabold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {language === "uz" ? "Akkaunt Ochish" : language === "ru" ? "Регистрация" : "Create Account"}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-500 dark:text-red-400 flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {language === "uz" ? "To'liq Ismingiz" : language === "ru" ? "Ваше полное имя" : "Your Full Name"}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.2]" />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={language === "uz" ? "Masalan: Jasur Karimov" : language === "ru" ? "Например: Жасур Каримов" : "e.g. Jasur Karimov"}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-900 border border-amber-200/80 dark:border-slate-700 focus:border-amber-400 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {language === "uz" ? "Email Manzili" : language === "ru" ? "Email адрес" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.2]" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-900 border border-amber-200/80 dark:border-slate-700 focus:border-amber-400 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none transition shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {language === "uz" ? "Maxfiy Parol" : language === "ru" ? "Пароль" : "Password"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.2]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/90 dark:bg-slate-900 border border-amber-200/80 dark:border-slate-700 focus:border-amber-400 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 stroke-[2.2]" /> : <Eye className="w-4 h-4 stroke-[2.2]" />}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {language === "uz" ? "Parolni Tasdiqlang" : language === "ru" ? "Подтвердите пароль" : "Confirm Password"}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.2]" />
                    <input
                      type="password"
                      required
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-900 border border-amber-200/80 dark:border-slate-700 focus:border-amber-400 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loginMut.isPending || registerMut.isPending}
                className="w-full py-3 rounded-xl btn-luxury-gold font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer mt-4 active:scale-95 shadow-md disabled:opacity-50"
              >
                <span>
                  {loginMut.isPending || registerMut.isPending
                    ? language === "uz" ? "Kutilmoqda..." : language === "ru" ? "Загрузка..." : "Processing..."
                    : mode === "login"
                    ? language === "uz" ? "Tizimga Kirish" : language === "ru" ? "Войти Сейчас" : "Sign In Now"
                    : language === "uz" ? "VIP Akkaunt Ochish" : language === "ru" ? "Создать VIP Аккаунт" : "Create VIP Account"}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </button>
            </form>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-amber-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMode("welcome")}
                className="hover:text-amber-600 dark:hover:text-amber-300 transition cursor-pointer active:scale-95"
              >
                {language === "uz" ? "← Umumiy ko'rinishga qaytish" : language === "ru" ? "← Назад к обзору" : "← Back to overview"}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="hover:text-slate-800 dark:hover:text-slate-200 transition underline underline-offset-4 cursor-pointer active:scale-95"
              >
                {language === "uz" ? "Mehmon sifatida ko'rish" : language === "ru" ? "Войти как гость" : "Explore as Guest"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

