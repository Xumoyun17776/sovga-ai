import React, { useState, useEffect, useMemo, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "../lib/i18n";
import { auth } from "../lib/api";
import { useToast } from "./Toast";
import { cyberSound } from "../lib/cyberSound";
import { detectUzOperator } from "../lib/uzPhoneOperators";
import SmsNotificationBanner from "./SmsNotificationBanner";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import {
  X,
  Gift,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Send,
  Phone,
  AlertCircle,
  Check,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Smartphone,
} from "../lib/icons";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  customTitle?: string;
  customMessage?: string;
  onSuccess?: () => void;
}

// Utility to format 9-digit UZ phone: "90 123 45 67"
function formatUzPhone(digitsOnly: string): string {
  const clean = digitsOnly.replace(/\D/g, "").slice(0, 9);
  if (!clean) return "";
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)} ${clean.slice(2)}`;
  if (clean.length <= 7) return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5)}`;
  return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 7)} ${clean.slice(7, 9)}`;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  customTitle,
  customMessage,
  onSuccess,
}: Props) {
  const { language } = useTranslation();
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
    phoneRaw: "", // e.g. "901234567"
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

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError("");
      setForgotPasswordActive(false);
      setForgotSent(false);
      setUseOtp(false);
      setOtpStep("phone");
      setOtpDigits(["", "", "", ""]);
      setDemoHint("");
    }
  }, [isOpen, initialMode]);

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
        email: method === "email" ? form.email : undefined,
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
        language === "uz"
          ? "Muvaffaqiyatli kirildi"
          : language === "ru"
          ? "Успешный вход"
          : "Authenticated"
      );
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (e: Error) =>
      setError(
        e.message ||
          (language === "uz"
            ? "Kirishda xatolik yuz berdi"
            : language === "ru"
            ? "Ошибка при входе"
            : "Sign in error")
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
          ? `Hisobingiz muvaffaqiyatli yaratildi, ${data.name}!`
          : language === "ru"
          ? `Аккаунт успешно создан, ${data.name}!`
          : `Account created, ${data.name}!`,
        language === "uz"
          ? "Xush kelibsiz"
          : language === "ru"
          ? "Добро пожаловать"
          : "Welcome"
      );
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (e: Error) =>
      setError(
        e.message ||
          (language === "uz"
            ? "Ro'yxatdan o'tishda xatolik yuz berdi"
            : language === "ru"
            ? "Ошибка при регистрации"
            : "Registration error")
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
      if (res?.demoCode) {
        setDemoHint(res.demoCode);
      }
      toast.info(
        language === "uz"
          ? "SMS tasdiqlash kodi yuborildi!"
          : language === "ru"
          ? "SMS код подтверждения отправлен!"
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
            ? "Ошибка отправки SMS"
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
        language === "uz"
          ? "SMS orqali tasdiqlandi"
          : language === "ru"
          ? "Подтверждено по SMS"
          : "Verified via SMS"
      );
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) =>
      setError(
        err.message ||
          (language === "uz"
            ? "Kod noto'g'ri kiritildi"
            : language === "ru"
            ? "Неверный код"
            : "Invalid verification code")
      ),
  });

  if (!isOpen) return null;

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
            ? "Пожалуйста, введите ваше полное имя"
            : "Please enter your full name"
        );
        return;
      }
      if (form.password.length < 8) {
        setError(
          language === "uz"
            ? "Parol kamida 8 ta belgidan iborat bo'lishi lozim"
            : language === "ru"
            ? "Пароль должен содержать не менее 8 символов"
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
            ? "Введите корректный адрес электронной почты"
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
        ? "Инструкция по сбросу пароля отправлена!"
        : "Password recovery link sent!",
      language === "uz" ? "Xabarnoma yuborildi" : language === "ru" ? "Инструкция отправлена" : "Recovery link sent"
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

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full max-h-[92vh] max-h-[92dvh] overflow-y-auto p-6 sm:p-8 shadow-sm relative border border-slate-100 dark:border-slate-800 my-auto transition-all">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={language === "uz" ? "Yopish" : language === "ru" ? "Закрыть" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-amber-400/20 bg-slate-950">
              <Gift className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
              {customTitle ||
                (forgotPasswordActive
                  ? language === "uz"
                    ? "Parolni tiklash"
                    : language === "ru"
                    ? "Восстановление пароля"
                    : "Password Recovery"
                  : otpStep === "code"
                  ? language === "uz"
                    ? "SMS Tasdiqlash"
                    : language === "ru"
                    ? "SMS Подтверждение"
                    : "SMS Verification"
                  : mode === "login"
                  ? language === "uz"
                    ? "Xush Kelibsiz"
                    : language === "ru"
                    ? "С Возвращением"
                    : "Welcome Back"
                  : language === "uz"
                  ? "Yangi hisob yaratish"
                  : language === "ru"
                  ? "Создать VIP Аккаунт"
                  : "Create VIP Account")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              {customMessage ||
                (forgotPasswordActive
                  ? language === "uz"
                    ? "Hisobingizga ulangan telefon yoki pochtangizni kiriting"
                    : language === "ru"
                    ? "Введите привязанный номер телефона или email"
                    : "Enter your registered email or phone"
                  : otpStep === "code"
                  ? language === "uz"
                    ? `+998 ${formatUzPhone(form.phoneRaw)} raqamiga yuborilgan 4 xonali kodni kiriting`
                    : language === "ru"
                    ? `Введите 4-значный код, отправленный на +998 ${formatUzPhone(form.phoneRaw)}`
                    : `Enter the 4-digit verification code sent to +998 ${formatUzPhone(form.phoneRaw)}`
                  : language === "uz"
                  ? "Bozordagi eng arzon narxlar va AI sovg'a maslahatchisi sizni kutmoqda"
                  : language === "ru"
                  ? "Лучшие проверенные цены в Узбекистане и персональный AI советник"
                  : "Unlock real-time price drops, verified bargains and bespoke AI gifting")}
            </p>
          </div>

          {/* OTP CODE STEP */}
          {otpStep === "code" ? (
            <div className="space-y-5 animate-fade-in">
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
                    className="w-13 h-14 text-center text-2xl font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-slate-900 dark:text-white transition"
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
                  <span>
                    {language === "uz"
                      ? "Qayta kod olish"
                      : language === "ru"
                      ? "Отправить код повторно"
                      : "Resend Code"}
                  </span>
                </button>

                <span className="font-mono font-bold">
                  {otpTimer > 0
                    ? `0:${otpTimer < 10 ? `0${otpTimer}` : otpTimer}`
                    : language === "uz"
                    ? "Muddati tugadi"
                    : language === "ru"
                    ? "Истек"
                    : "Expired"}
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
            <div className="space-y-4">
              {forgotSent ? (
                <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">
                    {language === "uz"
                      ? "Xabar yuborildi!"
                      : language === "ru"
                      ? "Инструкция отправлена!"
                      : "Instructions Sent!"}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    {language === "uz"
                      ? "Parolni qayta tiklash bo'yicha ko'rsatma Telegram yoki pochtangizga muvaffaqiyatli yuborildi."
                      : language === "ru"
                      ? "Ссылка для сброса пароля отправлена в Telegram или на вашу почту."
                      : "Password reset link has been dispatched to your registered channel."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordActive(false);
                      setForgotSent(false);
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition mt-2 cursor-pointer"
                  >
                    {language === "uz"
                      ? "Kirish oynasiga qaytish"
                      : language === "ru"
                      ? "Вернуться ко входу"
                      : "Back to Sign In"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 text-xs font-medium dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>
                      {language === "uz"
                        ? "Tiklash havolasini yuborish"
                        : language === "ru"
                        ? "Отправить ссылку для сброса"
                        : "Send Recovery Link"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordActive(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-semibold cursor-pointer"
                    >
                      {language === "uz"
                        ? "← Bekor qilish va kirish"
                        : language === "ru"
                        ? "← Отмена и вход"
                        : "← Cancel & Sign In"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Mode Switcher Tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-4 text-xs font-bold border border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer font-bold ${
                    mode === "login"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
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
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer font-bold ${
                    mode === "register"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {language === "uz" ? "Ro'yxatdan o'tish" : language === "ru" ? "Регистрация" : "Register"}
                </button>
              </div>

              {/* Fast 1-Click Social Auth (Telegram) */}
              <div className="space-y-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "https://t.me/SovgaUzBot?start=auth_" + Date.now();
                  }}
                  className="w-full py-2.5 px-4 btn-telegram text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {language === "uz"
                      ? "Telegram orqali tezkor kirish"
                      : language === "ru"
                      ? "Войти через Telegram"
                      : "Sign in with Telegram"}
                  </span>
                </button>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                    <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">
                      {language === "uz"
                        ? "yoki hisob orqali"
                        : language === "ru"
                        ? "или через аккаунт"
                        : "or with credentials"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Method Switcher: Phone vs Email */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setMethod("phone");
                    setError("");
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    method === "phone"
                      ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-white border-slate-900 dark:border-amber-500 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{language === "uz" ? "Telefon raqam" : language === "ru" ? "Номер телефона" : "Phone"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod("email");
                    setError("");
                    setUseOtp(false);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    method === "email"
                      ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-white border-slate-900 dark:border-amber-500 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
              </div>

              {/* Phone Login Sub-mode: Password VS SMS OTP */}
              {method === "phone" && (
                <div className="flex items-center justify-between p-2 mb-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-[var(--line)] dark:border-amber-900/40 text-xs">
                  <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {useOtp
                        ? language === "uz"
                          ? "SMS kod orqali kirish"
                          : language === "ru"
                          ? "Вход по SMS"
                          : "SMS OTP sign in"
                        : language === "uz"
                        ? "Parol orqali kirish"
                        : language === "ru"
                        ? "Вход по паролю"
                        : "Password sign in"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setUseOtp(!useOtp)}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    {useOtp
                      ? language === "uz"
                        ? "Parol bilan kirish →"
                        : language === "ru"
                        ? "Войти по паролю →"
                        : "Sign in with password →"
                      : language === "uz"
                      ? "SMS kod bilan kirish →"
                      : language === "ru"
                      ? "Войти по SMS →"
                      : "Sign in with SMS OTP →"}
                  </button>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "register" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {language === "uz" ? "To'liq ismingiz" : language === "ru" ? "Полное имя" : "Full Name"}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder={language === "uz" ? "Ism va Familiya" : language === "ru" ? "Имя и Фамилия" : "John Doe"}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-xs font-medium dark:text-white transition"
                      />
                    </div>
                  </div>
                )}

                {method === "phone" ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {language === "uz" ? "Telefon raqamingiz" : language === "ru" ? "Номер телефона" : "Phone Number"}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
                        <span>🇺🇿</span>
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
                        className="w-full pl-22 pr-24 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-xs font-mono font-bold dark:text-white tracking-wide transition"
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
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {language === "uz" ? "Elektron pochta manzili" : language === "ru" ? "Адрес электронной почты" : "Email Address"}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="foydalanuvchi@mail.uz"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-xs font-medium dark:text-white transition"
                      />
                    </div>
                  </div>
                )}

                {/* Password Field (Only shown if NOT in OTP mode) */}
                {(!useOtp || method === "email") && (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
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
                              ? "Parolingiz"
                              : language === "ru"
                              ? "Ваш пароль"
                              : "Enter password"
                          }
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          required
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-xs font-medium dark:text-white transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
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
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          {language === "uz" ? "Parolni tasdiqlang" : language === "ru" ? "Подтвердите пароль" : "Confirm Password"}
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={language === "uz" ? "Parolni qayta tering" : language === "ru" ? "Повторите пароль" : "Re-enter password"}
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            required
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-xs font-medium dark:text-white transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
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
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                            {language === "uz" ? "Meni eslab qolish" : language === "ru" ? "Запомнить меня" : "Remember me"}
                          </span>
                        </label>
                      </div>
                    )}
                  </>
                )}

                {error && (
                  <div className="text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-amber-500/20 bg-slate-950 hover:bg-black"
                >
                  <span>
                    {isPending
                      ? language === "uz"
                        ? "Yuklanmoqda..."
                        : language === "ru"
                        ? "Загрузка..."
                        : "Processing..."
                      : useOtp && method === "phone"
                      ? language === "uz"
                        ? "SMS Tasdiqlash Kodini Olish"
                        : language === "ru"
                        ? "Получить SMS Код Подтверждения"
                        : "Send SMS Code"
                      : mode === "login"
                      ? language === "uz"
                        ? "Tizimga Kirish"
                        : language === "ru"
                        ? "Войти в Аккаунт"
                        : "Sign In"
                      : language === "uz"
                      ? "Hisob yaratish & Kirish"
                      : language === "ru"
                      ? "Создать VIP Аккаунт и Войти"
                      : "Create Account & Sign In"}
                  </span>
                  {!isPending && <ArrowRight className="w-4 h-4 text-amber-400" />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

