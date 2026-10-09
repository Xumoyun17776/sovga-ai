import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "../lib/i18n";
import { auth } from "../lib/api";
import { useToast } from "../components/Toast";
import { cyberSound } from "../lib/cyberSound";
import { detectUzOperator } from "../lib/uzPhoneOperators";
import SmsNotificationBanner from "../components/SmsNotificationBanner";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import {
  Gift,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Send,
  ArrowRight,
  CheckCircle2,
  Phone,
  AlertCircle,
  Check,
  ChevronLeft,
  Smartphone,
  RotateCcw,
} from "lucide-react";

// Utility to format 9-digit UZ phone: "90 123 45 67"
function formatUzPhone(digitsOnly: string): string {
  const clean = digitsOnly.replace(/\D/g, "").slice(0, 9);
  if (!clean) return "";
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)} ${clean.slice(2)}`;
  if (clean.length <= 7) return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5)}`;
  return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 7)} ${clean.slice(7, 9)}`;
}

export default function AuthPage() {
  const { language } = useTranslation();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const toast = useToast();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [useOtp, setUseOtp] = useState(false);
  const [otpStep, setOtpStep] = useState<"phone" | "code">("phone");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(60);
  const [demoHint, setDemoHint] = useState("");

  const [form, setForm] = useState({
    name: "",
    phoneRaw: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [forgotPasswordActive, setForgotPasswordActive] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const phoneOperator = useMemo(() => detectUzOperator(form.phoneRaw), [form.phoneRaw]);

  // Get redirect target from URL query if available
  const redirectTarget = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("redirect") || "/";
    } catch {
      return "/";
    }
  }, []);

  useEffect(() => {
    let timerId: any;
    if (otpStep === "code" && otpTimer > 0) {
      timerId = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timerId);
  }, [otpStep, otpTimer]);

  const loginMut = useMutation({
    mutationFn: () => {
      const fullPhone = form.phoneRaw ? `+998${form.phoneRaw}` : "";
      const identifier = method === "phone" ? fullPhone : form.email;
      return auth.login({
        identifier,
        email: method === "email" ? form.email.trim() : undefined,
        phone: method === "phone" ? fullPhone : undefined,
        password: form.password,
      });
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["me"] });
      cyberSound.play("success");
      toast.success(
        language === "uz"
          ? `Xush kelibsiz, ${data.name || "foydalanuvchi"}!`
          : language === "ru"
          ? `С возвращением, ${data.name || "пользователь"}!`
          : `Welcome back, ${data.name || "user"}!`,
        language === "uz" ? "Muvaffaqiyatli kirildi" : language === "ru" ? "Успешный вход" : "Authenticated"
      );
      navigate(redirectTarget);
    },
    onError: (e: Error) =>
      setError(
        e.message ||
          (language === "uz"
            ? "Kirishda xatolik yuz berdi"
            : language === "ru"
            ? "Ошибка при входе"
            : "Sign in failed")
      ),
  });

  const registerMut = useMutation({
    mutationFn: () => {
      const fullPhone = form.phoneRaw ? `+998${form.phoneRaw}` : "";
      const identifier = method === "phone" ? fullPhone : form.email;
      return auth.register({
        name: form.name.trim(),
        identifier,
        email: method === "email" ? form.email.trim() : undefined,
        phone: method === "phone" ? fullPhone : undefined,
        password: form.password,
      });
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["me"] });
      cyberSound.play("success");
      toast.success(
        language === "uz"
          ? `Hisobingiz muvaffaqiyatli ochildi, ${data.name}!`
          : language === "ru"
          ? `Аккаунт успешно создан, ${data.name}!`
          : `Account created, ${data.name}!`,
        language === "uz" ? "Xush kelibsiz" : language === "ru" ? "Добро пожаловать" : "Welcome"
      );
      navigate(redirectTarget);
    },
    onError: (e: Error) =>
      setError(
        e.message ||
          (language === "uz"
            ? "Ro'yxatdan o'tishda xatolik yuz berdi"
            : language === "ru"
            ? "Ошибка при регистрации"
            : "Registration failed")
      ),
  });

  const sendOtpMut = useMutation({
    mutationFn: () => {
      const fullPhone = `+998${form.phoneRaw}`;
      return auth.sendOtp(fullPhone);
    },
    onSuccess: (res: any) => {
      setOtpStep("code");
      setOtpTimer(60);
      if (res.demoCode) {
        setDemoHint(res.demoCode);
      }
      toast.info(
        language === "uz"
          ? "SMS tasdiqlash kodi yuborildi!"
          : language === "ru"
          ? "SMS-код подтверждения отправлен!"
          : "SMS code dispatched!"
      );
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    },
    onError: (err: any) =>
      setError(
        err.message ||
          (language === "uz"
            ? "SMS jo'natishda xatolik"
            : language === "ru"
            ? "Ошибка при отправке SMS"
            : "SMS dispatch error")
      ),
  });

  const verifyOtpMut = useMutation({
    mutationFn: (codeStr: string) => {
      const fullPhone = `+998${form.phoneRaw}`;
      return auth.verifyOtp({ phone: fullPhone, code: codeStr, name: form.name });
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["me"] });
      cyberSound.play("success");
      toast.success(
        language === "uz"
          ? `Xush kelibsiz, ${data.name}!`
          : language === "ru"
          ? `Добро пожаловать, ${data.name}!`
          : `Welcome, ${data.name}!`,
        language === "uz" ? "SMS orqali tasdiqlandi" : language === "ru" ? "Подтверждено по SMS" : "Verified via SMS"
      );
      navigate(redirectTarget);
    },
    onError: (err: any) =>
      setError(
        err.message ||
          (language === "uz"
            ? "Kod noto'g'ri kiritildi"
            : language === "ru"
            ? "Неверный проверочный код"
            : "Invalid code entered")
      ),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (method === "phone" && useOtp) {
      if (form.phoneRaw.length !== 9) {
        setError(
          language === "uz"
            ? "To'liq 9 ta raqamli telefon raqamingizni kiriting"
            : language === "ru"
            ? "Введите полный 9-значный номер телефона"
            : "Please enter a valid 9-digit phone number"
        );
        return;
      }
      sendOtpMut.mutate();
      return;
    }

    if (mode === "register") {
      if (!form.name || form.name.trim().length < 2) {
        setError(
          language === "uz"
            ? "Iltimos, to'liq ismingizni kiriting"
            : language === "ru"
            ? "Пожалуйста, введите полное имя"
            : "Please enter your full name"
        );
        return;
      }
      if (form.password.length < 8) {
        setError(
          language === "uz"
            ? "Parol kamida 8 ta belgidan iborat bo'lishi lozim"
            : language === "ru"
            ? "Пароль должен содержать минимум 8 символов"
            : "Password must be at least 8 characters"
        );
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError(
          language === "uz"
            ? "Parollar bir-biriga mos kelmadi"
            : language === "ru"
            ? "Пароли не совпадают"
            : "Passwords do not match"
        );
        return;
      }
    } else {
      if (!form.password) {
        setError(
          language === "uz"
            ? "Iltimos, parolingizni kiriting"
            : language === "ru"
            ? "Пожалуйста, введите пароль"
            : "Please enter your password"
        );
        return;
      }
    }

    if (method === "phone") {
      if (form.phoneRaw.length !== 9) {
        setError(
          language === "uz"
            ? "To'liq 9 ta raqamli telefon raqamingizni kiriting"
            : language === "ru"
            ? "Введите полный 9-значный номер телефона"
            : "Please enter a valid 9-digit phone number"
        );
        return;
      }
    } else {
      if (!form.email.includes("@") || !form.email.includes(".")) {
        setError(
          language === "uz"
            ? "Haqiqiy elektron pochta manzilini kiriting"
            : language === "ru"
            ? "Пожалуйста, введите корректный адрес email"
            : "Please enter a valid email address"
        );
        return;
      }
    }

    if (mode === "login") loginMut.mutate();
    else registerMut.mutate();
  };

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const updated = [...otpDigits];
    updated[index] = clean;
    setOtpDigits(updated);

    if (clean && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    const fullCode = updated.join("");
    if (fullCode.length === 4) {
      verifyOtpMut.mutate(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length > 0) {
      const updated = ["", "", "", ""];
      for (let i = 0; i < pasted.length; i++) {
        updated[i] = pasted[i];
      }
      setOtpDigits(updated);
      if (pasted.length === 4) {
        verifyOtpMut.mutate(pasted);
      } else {
        otpInputsRef.current[pasted.length]?.focus();
      }
    }
  };

  const handleAutoFillOtp = (code: string) => {
    const digits = code.split("").slice(0, 4);
    setOtpDigits(digits);
    verifyOtpMut.mutate(code);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
    toast.success(
      language === "uz"
        ? "Parolni tiklash yo'riqnomasi yuborildi!"
        : language === "ru"
        ? "Инструкция по восстановлению пароля отправлена!"
        : "Password recovery link sent!",
      language === "uz" ? "Xabarnoma yuborildi" : language === "ru" ? "Уведомление отправлено" : "Recovery link sent"
    );
  };

  const isPending = loginMut.isPending || registerMut.isPending || sendOtpMut.isPending || verifyOtpMut.isPending;

  return (
    <>
      {/* REALISTIC INCOMING SMS BANNER SIMULATOR */}
      {demoHint && otpStep === "code" && (
        <SmsNotificationBanner
          code={demoHint}
          phone={`+998 ${formatUzPhone(form.phoneRaw)}`}
          onFillCode={handleAutoFillOtp}
        />
      )}

      <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
        {/* Ambient Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-[400px] bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Back Link */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
            <span>
              {language === "uz"
                ? "Bosh sahifaga qaytish"
                : language === "ru"
                ? "Вернуться на главную"
                : "Back to Home"}
            </span>
          </button>
        </div>

        {/* Header Branding */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-500/90 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/10 border border-amber-400/20">
            <Gift className="w-8 h-8 text-amber-400 stroke-[2.2]" />
          </div>
          <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white tracking-tight">
            {forgotPasswordActive
              ? language === "uz" ? "Parolni tiklash" : language === "ru" ? "Сброс пароля" : "Password Recovery"
              : otpStep === "code"
              ? language === "uz" ? "SMS Tasdiqlash" : language === "ru" ? "SMS Подтверждение" : "SMS Verification"
              : mode === "login"
              ? language === "uz" ? "Xush Kelibsiz" : language === "ru" ? "С Возвращением" : "Welcome Back"
              : language === "uz" ? "VIP Hisob Yaratish" : language === "ru" ? "Создать VIP Аккаунт" : "Create VIP Account"}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            {forgotPasswordActive
              ? language === "uz"
                ? "Hisobingizga ulangan telefon yoki pochtangizni kiriting"
                : language === "ru"
                ? "Введите телефон или email, привязанный к аккаунту"
                : "Enter your registered email or phone"
              : otpStep === "code"
              ? language === "uz"
                ? `+998 ${formatUzPhone(form.phoneRaw)} raqamiga yuborilgan 4 xonali kodni kiriting`
                : language === "ru"
                ? `Введите 4-значный код, отправленный на +998 ${formatUzPhone(form.phoneRaw)}`
                : `Enter the 4-digit code sent to +998 ${formatUzPhone(form.phoneRaw)}`
              : language === "uz"
              ? "Bozordagi eng arzon narxlar, do'konlar solishtiruvi va AI sovg'a yordamchisi"
              : language === "ru"
              ? "Лучшие цены на рынке, сравнение магазинов и умный AI-ассистент"
              : "Access real-time Uzbekistan store comparisons, AI gift advisor & price drops"}
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
          {otpStep === "code" ? (
            /* OTP VERIFICATION VIEW */
            <div className="bg-white dark:bg-[#111422] rounded-3xl p-6 sm:p-8 shadow-luxury border-2 border-amber-200/80 dark:border-slate-800 space-y-6">
              {/* 4-Box PIN Code Input */}
              <div className="flex justify-center gap-3 py-2">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otpDigits[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-14 h-15 text-center text-2xl font-mono font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-slate-900 dark:text-white transition"
                  />
                ))}
              </div>

              {error && (
                <div className="text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Timer & Resend */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setOtpDigits(["", "", "", ""]);
                    sendOtpMut.mutate();
                  }}
                  disabled={otpTimer > 0 || sendOtpMut.isPending}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === "uz" ? "Qayta kod olish" : language === "ru" ? "Отправить повторно" : "Resend Code"}</span>
                </button>

                <span className="font-mono font-bold">
                  {otpTimer > 0
                    ? `0:${otpTimer < 10 ? `0${otpTimer}` : otpTimer}`
                    : language === "uz" ? "Muddati tugadi" : language === "ru" ? "Время истекло" : "Code expired"}
                </span>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep("phone");
                    setError("");
                  }}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold cursor-pointer"
                >
                  {language === "uz"
                    ? "← Telefon raqamni o'zgartirish"
                    : language === "ru"
                    ? "← Изменить номер телефона"
                    : "← Change Phone Number"}
                </button>
              </div>
            </div>
          ) : forgotPasswordActive ? (
            /* FORGOT PASSWORD VIEW */
            <div className="bg-white dark:bg-[#111422] rounded-3xl p-6 sm:p-8 shadow-luxury border-2 border-amber-200/80 dark:border-slate-800 space-y-4">
              {forgotSent ? (
                <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto stroke-[2.2]" />
                  <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">
                    {language === "uz" ? "Xabar yuborildi!" : language === "ru" ? "Инструкция отправлена!" : "Instructions Sent!"}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    {language === "uz"
                      ? "Parolni qayta tiklash bo'yicha ko'rsatma Telegram yoki pochtangizga muvaffaqiyatli yuborildi."
                      : language === "ru"
                      ? "Инструкция по сбросу пароля отправлена в Telegram или на ваш email."
                      : "Password reset link has been dispatched to your registered channel."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordActive(false);
                      setForgotSent(false);
                    }}
                    className="w-full py-2.5 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white dark:text-slate-950 rounded-xl text-xs font-bold transition mt-2 cursor-pointer active:scale-95"
                  >
                    {language === "uz" ? "Kirish oynasiga qaytish" : language === "ru" ? "Вернуться ко входу" : "Back to Sign In"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {language === "uz" ? "Telefon yoki Pochta" : language === "ru" ? "Телефон или Email" : "Phone or Email"}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[2.2]" />
                      <input
                        type="text"
                        placeholder={
                          language === "uz"
                            ? "Telefon (+998...) yoki Pochta"
                            : language === "ru"
                            ? "Телефон (+998...) или Email"
                            : "Phone or Email"
                        }
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 text-xs sm:text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>
                      {language === "uz"
                        ? "Tiklash havolasini yuborish"
                        : language === "ru"
                        ? "Отправить ссылку на сброс"
                        : "Send Recovery Link"}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </button>
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordActive(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-semibold cursor-pointer active:scale-95"
                    >
                      {language === "uz" ? "← Bekor qilish va kirish" : language === "ru" ? "← Отмена и вход" : "← Cancel & Sign In"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mode Selector Tabs (Login vs Register) */}
              <div className="flex bg-slate-100 dark:bg-[#0c0e18] rounded-2xl p-1 text-xs font-bold border border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className={`flex-1 py-2.5 rounded-xl transition cursor-pointer font-bold active:scale-95 ${
                    mode === "login"
                      ? "bg-white dark:bg-[#111422] shadow-xs text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
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
                  className={`flex-1 py-2.5 rounded-xl transition cursor-pointer font-bold active:scale-95 ${
                    mode === "register"
                      ? "bg-white dark:bg-[#111422] shadow-xs text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {language === "uz" ? "Ro'yxatdan o'tish" : language === "ru" ? "Регистрация" : "Create Account"}
                </button>
              </div>

              {/* Main Auth Form Card */}
              <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-[#111422] rounded-3xl p-6 sm:p-8 shadow-luxury border-2 border-amber-200/80 dark:border-slate-800 space-y-4"
              >
                {/* Telegram 1-Click Fast Auth Button */}
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "https://t.me/SovgaUzBot?start=auth_" + Date.now();
                  }}
                  className="w-full py-3 px-4 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2.5 shadow-md shadow-sky-500/10 cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4 text-white stroke-[2.2]" />
                  <span>
                    {language === "uz"
                      ? "Telegram orqali tezkor kirish"
                      : language === "ru"
                      ? "Быстрый вход через Telegram"
                      : "Instant Telegram Login"}
                  </span>
                </button>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                    <span className="bg-white dark:bg-[#111422] px-3 text-slate-400">
                      {language === "uz"
                        ? "yoki hisob orqali"
                        : language === "ru"
                        ? "или через аккаунт"
                        : "or with credentials"}
                    </span>
                  </div>
                </div>

                {/* Method Selector: Phone vs Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {language === "uz" ? "Kirish usuli:" : language === "ru" ? "Способ входа:" : "Login Method:"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMethod("phone");
                        setError("");
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                        method === "phone"
                          ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 shadow-xs"
                          : "bg-slate-50 dark:bg-[#0c0e18] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>{language === "uz" ? "Telefon raqam" : language === "ru" ? "Телефон" : "Phone"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMethod("email");
                        setError("");
                        setUseOtp(false);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                        method === "email"
                          ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 shadow-xs"
                          : "bg-slate-50 dark:bg-[#0c0e18] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>Email</span>
                    </button>
                  </div>
                </div>

                {/* Phone Sub-mode: Password VS SMS OTP */}
                {method === "phone" && (
                  <div className="flex items-center justify-between p-2.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-xs">
                    <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-amber-600 stroke-[2.2]" />
                      <span>
                        {useOtp
                          ? language === "uz" ? "SMS kod orqali kirish" : language === "ru" ? "Вход по SMS-коду" : "SMS OTP Sign In"
                          : language === "uz" ? "Parol orqali kirish" : language === "ru" ? "Вход по паролю" : "Password Sign In"}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setUseOtp(!useOtp)}
                      className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer active:scale-95"
                    >
                      {useOtp
                        ? language === "uz" ? "Parol bilan kirish →" : language === "ru" ? "Войти по паролю →" : "Use password →"
                        : language === "uz" ? "SMS kod bilan kirish →" : language === "ru" ? "Войти по SMS →" : "Use SMS code →"}
                    </button>
                  </div>
                )}

                {/* Full Name (Only when Registering) */}
                {mode === "register" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {language === "uz" ? "To'liq ismingiz" : language === "ru" ? "Полное имя" : "Full Name"}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder={
                          language === "uz"
                            ? "Masalan: Azamat Karimov"
                            : language === "ru"
                            ? "Например: Азамат Каримов"
                            : "e.g. John Doe"
                        }
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-xs sm:text-sm font-medium dark:text-white transition"
                      />
                    </div>
                  </div>
                )}

                {/* Phone Input with Auto-formatting and Operator Badge */}
                {method === "phone" ? (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {language === "uz" ? "Telefon raqamingiz" : language === "ru" ? "Номер телефона" : "Phone Number"}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
                        <span className="text-sm">🇺🇿</span>
                        <span>+998</span>
                      </div>
                      <input
                        type="tel"
                        placeholder="90 123 45 67"
                        value={formatUzPhone(form.phoneRaw)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
                          setForm({ ...form, phoneRaw: raw });
                        }}
                        required
                        className="w-full pl-22 pr-24 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-xs sm:text-sm font-mono font-bold dark:text-white tracking-wide transition"
                      />
                      {phoneOperator && (
                        <div
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold select-none animate-fade-in"
                          style={{
                            borderColor: phoneOperator.color + "40",
                            backgroundColor: phoneOperator.color + "15",
                            color: phoneOperator.color,
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: phoneOperator.color }} />
                          <span>{phoneOperator.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Email Input */
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {language === "uz" ? "Elektron pochta manzili" : language === "ru" ? "Email адрес" : "Email Address"}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="foydalanuvchi@mail.uz"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-xs sm:text-sm font-medium dark:text-white transition"
                      />
                    </div>
                  </div>
                )}

                {/* Password Input (Shown only if NOT in OTP mode) */}
                {(!useOtp || method === "email") && (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {language === "uz" ? "Maxfiy parol" : language === "ru" ? "Пароль" : "Password"}
                        </label>
                        {mode === "login" && (
                          <button
                            type="button"
                            onClick={() => setForgotPasswordActive(true)}
                            className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                          >
                            {language === "uz" ? "Parolni unutdingizmi?" : language === "ru" ? "Забыли пароль?" : "Forgot password?"}
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder={
                            mode === "register"
                              ? language === "uz"
                                ? "Kamida 8 ta belgi kiriting"
                                : language === "ru"
                                ? "Минимум 8 символов"
                                : "Minimum 8 characters"
                              : language === "uz"
                              ? "Parolingizni kiriting"
                              : language === "ru"
                              ? "Введите пароль"
                              : "Enter password"
                          }
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          required
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-xs sm:text-sm font-medium dark:text-white transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {mode === "register" && form.password && (
                        <PasswordStrengthIndicator password={form.password} language={language} />
                      )}
                    </div>

                    {mode === "register" && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {language === "uz" ? "Parolni tasdiqlang" : language === "ru" ? "Подтвердите пароль" : "Confirm Password"}
                          </label>
                          {form.confirmPassword && (
                            <span
                              className={`text-[10px] font-bold flex items-center gap-1 ${
                                form.password === form.confirmPassword ? "text-emerald-600" : "text-rose-500"
                              }`}
                            >
                              {form.password === form.confirmPassword ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  {language === "uz" ? "Mos keldi" : language === "ru" ? "Совпадает" : "Matches"}
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3" />
                                  {language === "uz" ? "Mos emas" : language === "ru" ? "Не совпадает" : "Mismatch"}
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={
                              language === "uz"
                                ? "Parolni qayta tering"
                                : language === "ru"
                                ? "Повторите пароль"
                                : "Re-enter password"
                            }
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            required
                            className={`w-full pl-10 pr-10 py-2.5 border rounded-xl outline-none text-xs sm:text-sm font-medium transition dark:bg-slate-800 dark:text-white ${
                              form.confirmPassword && form.password !== form.confirmPassword
                                ? "border-rose-300 focus:ring-2 focus:ring-rose-500 bg-rose-50/20"
                                : form.confirmPassword && form.password === form.confirmPassword
                                ? "border-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-emerald-50/20"
                                : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-400"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {mode === "login" && (
                      <div className="flex items-center justify-between pt-0.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={form.rememberMe}
                            onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300"
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                            {language === "uz" ? "Meni eslab qolish" : language === "ru" ? "Запомнить меня" : "Remember me"}
                          </span>
                        </label>
                      </div>
                    )}
                  </>
                )}

                {/* Error Message Box */}
                {error && (
                  <div className="text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3.5 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-amber-500/20 active:scale-95"
                >
                  <span>
                    {isPending
                      ? language === "uz" ? "Yuklanmoqda..." : language === "ru" ? "Загрузка..." : "Processing..."
                      : useOtp && method === "phone"
                      ? language === "uz"
                        ? "SMS Tasdiqlash Kodini Olish"
                        : language === "ru"
                        ? "Получить SMS-Код"
                        : "Send SMS Code"
                      : mode === "login"
                      ? language === "uz"
                        ? "Tizimga Kirish"
                        : language === "ru"
                        ? "Войти в Sovg'a"
                        : "Sign In to Sovg'a"
                      : language === "uz"
                      ? "Hisob Yaratish & Kirish"
                      : language === "ru"
                      ? "Создать VIP Аккаунт"
                      : "Create VIP Account"}
                  </span>
                  {!isPending && <ArrowRight className="w-4 h-4 text-amber-400 dark:text-slate-950 stroke-[2.2]" />}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
