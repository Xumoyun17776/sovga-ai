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
} from "../lib/icons";

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
      <div className="bg-white dark:bg-[#0b1224] relative w-full max-w-lg text-slate-900 dark:text-white rounded-2xl p-6 sm:p-8 border border-[var(--line)] dark:border-amber-500/25 shadow-sm overflow-y-auto max-h-[92vh] max-h-[92dvh] my-auto animate-scale-in">
        {/* Ambient Top Glow Orbs */}

        {/* Close / Guest Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer shadow-2xs"
          title={language === "uz" ? "Mehmon sifatida davom etish" : language === "ru" ? "Продолжить как гость" : "Continue as Guest"}
        >
          <X className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Header Badge */}
        <div className="text-center mb-6 relative z-10">

          <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4 bg-slate-900 dark:bg-amber-500">
            <Gift className="w-5 h-5 text-amber-400 dark:text-slate-900" />
          </div>

          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
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
              : language === "uz" ? "Ro'yxatdan o'tish" : language === "ru" ? "Регистрация" : "Create an account"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            {mode === "welcome"
              ? language === "uz" ? "Sovg'a tanlash va do'konlar narxini solishtirish uchun." : language === "ru" ? "Чтобы выбирать подарки и сравнивать цены магазинов." : "Pick gifts and compare store prices in Uzbekistan."
              : language === "uz" ? "Narx eslatmalari, to'y ro'yxatlari va saqlangan mahsulotlar uchun hisob kerak." : language === "ru" ? "Аккаунт нужен для уведомлений о ценах, свадебных списков и избранного." : "An account lets you save products, get price alerts and make wedding registries."}
          </p>
        </div>

        {/* ─── MODE 1: WELCOME HUB ─── */}
        {mode === "welcome" && (
          <div className="space-y-5 relative z-10">
            {/* VIP Member Perks */}
            <div className="grid grid-cols-1 gap-3.5 py-1">
              <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-[#f4f5f8] dark:bg-white/5 border border-[var(--line)] text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {language === "uz" ? "Narxlarni solishtirish" : language === "ru" ? "Сравнение цен" : "Price comparison"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {language === "uz" ? "Uzum, Texnomart va MediaPark narxlari bir joyda." : language === "ru" ? "Цены Uzum, Texnomart и MediaPark в одном месте." : "Uzum, Texnomart and MediaPark prices in one place."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-[#f4f5f8] dark:bg-white/5 border border-[var(--line)] text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {language === "uz" ? "Shu yerda buyurtma" : language === "ru" ? "Заказ на сайте" : "Order here"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {language === "uz" ? "Click, Payme yoki naqd pul, xohlasangiz sovg'a qadog'i bilan." : language === "ru" ? "Click, Payme или наличные, по желанию — в подарочной упаковке." : "Pay with Click, Payme or cash, with gift wrapping if you like."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-[#f4f5f8] dark:bg-white/5 border border-[var(--line)] text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {language === "uz" ? "To'y va istaklar ro'yxati" : language === "ru" ? "Свадебный список и вишлист" : "Wedding registries and wishlists"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {language === "uz" ? "Havola orqali ulashing — sovg'alar takrorlanmaydi." : language === "ru" ? "Делитесь ссылкой — подарки не повторяются." : "Share a link and avoid duplicate gifts."}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setMode("login")}
                className="w-full h-11 px-4 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white font-medium text-sm border border-[var(--line)] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{language === "uz" ? "Kirish" : language === "ru" ? "Войти" : "Sign in"}</span>
              </button>

              <button
                onClick={() => setMode("register")}
                className="w-full h-11 px-4 rounded-lg btn-luxury-gold font-medium text-sm transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{language === "uz" ? "Ro'yxatdan o'tish" : language === "ru" ? "Регистрация" : "Create account"}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Continue as Guest option */}
            <div className="text-center pt-1">
              <button
                onClick={handleDismiss}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition underline underline-offset-4 cursor-pointer"
              >
                {language === "uz" ? "Ro'yxatdan o'tmasdan davom etish" : language === "ru" ? "Продолжить без регистрации" : "Continue without an account"}
              </button>
            </div>
          </div>
        )}

        {/* ─── MODE 2 & 3: FORM (LOGIN / REGISTER) ─── */}
        {(mode === "login" || mode === "register") && (
          <div className="relative z-10 space-y-4">
            {/* Mode Switch Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-bold border border-[var(--line)] dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                  mode === "login" ? "bg-amber-500 text-white shadow-md font-semibold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {language === "uz" ? "Kirish" : language === "ru" ? "Войти" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                  mode === "register" ? "bg-amber-500 text-white shadow-md font-semibold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {language === "uz" ? "Ro'yxatdan o'tish" : language === "ru" ? "Регистрация" : "Create account"}
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-900 border border-[var(--line)] dark:border-slate-700 focus:border-amber-400 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none transition shadow-2xs"
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-900 border border-[var(--line)] dark:border-slate-700 focus:border-amber-400 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none transition shadow-2xs"
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
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/90 dark:bg-slate-900 border border-[var(--line)] dark:border-slate-700 focus:border-amber-400 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none transition shadow-2xs"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-900 border border-[var(--line)] dark:border-slate-700 focus:border-amber-400 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loginMut.isPending || registerMut.isPending}
                className="w-full py-3 rounded-xl btn-luxury-gold font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer mt-4 shadow-md disabled:opacity-50"
              >
                <span>
                  {loginMut.isPending || registerMut.isPending
                    ? language === "uz" ? "Kutilmoqda..." : language === "ru" ? "Загрузка..." : "Processing..."
                    : mode === "login"
                    ? language === "uz" ? "Tizimga Kirish" : language === "ru" ? "Войти Сейчас" : "Sign In Now"
                    : language === "uz" ? "Ro'yxatdan o'tish" : language === "ru" ? "Зарегистрироваться" : "Create account"}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </button>
            </form>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-[var(--line)] dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMode("welcome")}
                className="hover:text-amber-600 dark:hover:text-amber-300 transition cursor-pointer"
              >
                {language === "uz" ? "← Umumiy ko'rinishga qaytish" : language === "ru" ? "← Назад к обзору" : "← Back to overview"}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="hover:text-slate-800 dark:hover:text-slate-200 transition underline underline-offset-4 cursor-pointer"
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

