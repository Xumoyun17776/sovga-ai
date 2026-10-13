import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "../lib/api";
import { detectUzOperator } from "../lib/uzPhoneOperators";
import { useToast } from "./Toast";
import { useTranslation } from "../lib/i18n";
import {
  X,
  User,
  Phone,
  Mail,
  Shield,
  KeyRound,
  Laptop,
  Trash2,
  Download,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldAlert,
  Lock,
} from "../lib/icons";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

export default function UserProfileModal({ isOpen, onClose, user: propUser }: Props) {
  const { language } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const { data: fetchedUser } = useQuery({ queryKey: ["me"], queryFn: auth.me });
  const user = propUser || fetchedUser;

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "privacy">("profile");

  // Profile edit states
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Privacy & 2FA states
  const [twoFactor, setTwoFactor] = useState(user?.privacySettings?.twoFactorEnabled || false);
  const [incognito, setIncognito] = useState(user?.privacySettings?.incognitoSearch || false);
  const [privateWishlist, setPrivateWishlist] = useState(user?.privacySettings?.privateWishlist || false);

  // Delete account modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const phoneOperator = useMemo(() => detectUzOperator(phone), [phone]);

  const updateProfileMut = useMutation({
    mutationFn: () => auth.updateProfile({ name, phone }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setProfileMsg({
        type: "success",
        text:
          language === "uz"
            ? "Profil ma'lumotlari muvaffaqiyatli saqlandi!"
            : language === "ru"
            ? "Данные профиля успешно сохранены!"
            : "Profile updated successfully!",
      });
      toast.success(
        language === "uz" ? "Saqlandi" : language === "ru" ? "Сохранено" : "Saved"
      );
    },
    onError: (err: any) => {
      setProfileMsg({
        type: "error",
        text:
          err.message ||
          (language === "uz"
            ? "Xatolik yuz berdi"
            : language === "ru"
            ? "Произошла ошибка при обновлении"
            : "Update failed"),
      });
    },
  });

  const changePasswordMut = useMutation({
    mutationFn: () => auth.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwdMsg({
        type: "success",
        text:
          language === "uz"
            ? "Parol muvaffaqiyatli o'zgartirildi!"
            : language === "ru"
            ? "Пароль успешно изменен!"
            : "Password changed successfully!",
      });
      toast.success(
        language === "uz" ? "Parol yangilandi" : language === "ru" ? "Пароль обновлен" : "Password updated"
      );
    },
    onError: (err: any) => {
      setPwdMsg({
        type: "error",
        text:
          err.message ||
          (language === "uz"
            ? "Parolni o'zgartirishda xatolik"
            : language === "ru"
            ? "Ошибка при смене пароля"
            : "Password change failed"),
      });
    },
  });

  const terminateSessionsMut = useMutation({
    mutationFn: auth.terminateAllSessions,
    onSuccess: () => {
      toast.success(
        language === "uz"
          ? "Boshqa barcha qurilmalardagi seanslar to'xtatildi!"
          : language === "ru"
          ? "Все остальные сеансы завершены!"
          : "All other sessions terminated!",
        language === "uz" ? "Xavfsizlik" : language === "ru" ? "Безопасность" : "Security"
      );
    },
  });

  const updatePrivacyMut = useMutation({
    mutationFn: (newSettings: { incognitoSearch?: boolean; privateWishlist?: boolean; twoFactorEnabled?: boolean }) =>
      auth.updatePrivacy(newSettings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success(
        language === "uz"
          ? "Maxfiylik sozlamalari yangilandi"
          : language === "ru"
          ? "Настройки приватности обновлены"
          : "Privacy settings updated"
      );
    },
  });

  const exportDataMut = useMutation({
    mutationFn: auth.exportData,
    onSuccess: (res: any) => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `sovga-ai-personal-data-${user.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success(
        language === "uz"
          ? "Ma'lumotlar JSON formatida yuklab olindi"
          : language === "ru"
          ? "Данные выгружены в формате JSON"
          : "Personal data exported"
      );
    },
    onError: () =>
      toast.error(
        language === "uz"
          ? "Eksport qilishda xatolik"
          : language === "ru"
          ? "Ошибка при экспорте данных"
          : "Export failed"
      ),
  });

  const deleteAccountMut = useMutation({
    mutationFn: (pwd: string) => auth.deleteAccount(pwd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.info(
        language === "uz"
          ? "Hisobingiz butunlay o'chirildi"
          : language === "ru"
          ? "Ваш аккаунт был удален"
          : "Account deleted"
      );
      onClose();
      window.location.href = "/";
    },
    onError: (err: any) => {
      setDeleteError(
        err.message ||
          (language === "uz"
            ? "Parol noto'g'ri kiritildi"
            : language === "ru"
            ? "Неверный пароль"
            : "Invalid password")
      );
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (!currentPassword) {
      setPwdMsg({
        type: "error",
        text:
          language === "uz"
            ? "Hozirgi parolingizni kiriting"
            : language === "ru"
            ? "Введите текущий пароль"
            : "Enter current password",
      });
      return;
    }
    if (newPassword.length < 8) {
      setPwdMsg({
        type: "error",
        text:
          language === "uz"
            ? "Yangi parol kamida 8 ta belgidan iborat bo'lsin"
            : language === "ru"
            ? "Новый пароль должен содержать минимум 8 символов"
            : "New password must be min 8 characters",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({
        type: "error",
        text:
          language === "uz"
            ? "Yangi parollar bir-biriga mos kelmadi"
            : language === "ru"
            ? "Новые пароли не совпадают"
            : "New passwords do not match",
      });
      return;
    }
    changePasswordMut.mutate();
  };

  const logoutMut = useMutation({
    mutationFn: auth.logout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.info(
        language === "uz" ? "Tizimdan chiqdingiz" : language === "ru" ? "Вы вышли из системы" : "Logged out"
      );
      onClose();
    },
  });

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Ambient background vignette glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      </div>

      <div className="bg-white dark:bg-[#0b1224] rounded-2xl max-w-lg w-full max-h-[92vh] max-h-[92dvh] overflow-y-auto p-6 sm:p-8 shadow-sm relative border border-[var(--line)] dark:border-amber-500/25 my-auto transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* User Header Profile Card */}
        <div className="flex items-center gap-4 pb-6 border-b border-[var(--line)] dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl text-white font-bold text-xl flex items-center justify-center shadow-sm border border-amber-400/20 bg-slate-950">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white truncate">
                {user.name}
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  user.role === "admin"
                    ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200"
                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-[var(--line)]"
                }`}
              >
                {user.role === "admin"
                  ? "Admin VIP"
                  : language === "uz"
                  ? "VIP A'zo"
                  : language === "ru"
                  ? "VIP Участник"
                  : "VIP Member"}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">{user.email || user.phone}</p>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl my-5 text-xs font-bold border border-slate-200/60 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "profile"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>{language === "uz" ? "Shaxsiy Ma'lumot" : language === "ru" ? "Профиль" : "Profile"}</span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "security"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Lock className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>{language === "uz" ? "Xavfsizlik & Parol" : language === "ru" ? "Безопасность" : "Security"}</span>
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "privacy"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>{language === "uz" ? "Maxfiylik Markazi" : language === "ru" ? "Приватность" : "Privacy"}</span>
          </button>
        </div>

        {/* TAB 1: PROFILE INFO */}
        {activeTab === "profile" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setProfileMsg(null);
              updateProfileMut.mutate();
            }}
            className="space-y-4 animate-fade-in"
          >
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === "uz" ? "To'liq ismingiz" : language === "ru" ? "Полное имя" : "Full Name"}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 text-xs sm:text-sm font-medium dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === "uz" ? "Telefon raqamingiz" : language === "ru" ? "Номер телефона" : "Phone Number"}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full pl-10 pr-24 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 text-xs sm:text-sm font-medium dark:text-white font-mono"
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === "uz" ? "Elektron pochta (Asosiy)" : language === "ru" ? "Email (Основной)" : "Email Address"}
              </label>
              <div className="relative opacity-70">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={
                    user.email ||
                    (language === "uz"
                      ? "Telefon orqali ro'yxatdan o'tilgan"
                      : language === "ru"
                      ? "Регистрация по телефону"
                      : "Registered via phone")
                  }
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium cursor-not-allowed dark:text-slate-400"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                {language === "uz"
                  ? "Asosiy identifikator hisob xavfsizligi uchun muzlatilgan."
                  : language === "ru"
                  ? "Основной адрес зафиксирован для защиты аккаунта."
                  : "Primary email is locked for account security."}
              </p>
            </div>

            {profileMsg && (
              <div
                className={`text-xs p-3 rounded-xl border flex items-center gap-2 ${
                  profileMsg.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300"
                    : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-800 dark:text-rose-300"
                }`}
              >
                {profileMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={updateProfileMut.isPending}
              className="w-full py-2.5 btn-luxury-gold text-slate-950 rounded-xl text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
            >
              {updateProfileMut.isPending
                ? language === "uz" ? "Saqlanmoqda..." : language === "ru" ? "Сохранение..." : "Saving..."
                : language === "uz" ? "O'zgarishlarni Saqlash" : language === "ru" ? "Сохранить Изменения" : "Save Changes"}
            </button>
          </form>
        )}

        {/* TAB 2: SECURITY & PASSWORD */}
        {activeTab === "security" && (
          <div className="space-y-5 animate-fade-in text-xs">
            {/* Active Sessions Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {language === "uz"
                        ? "Joriy Qurilma (Windows / Web)"
                        : language === "ru"
                        ? "Текущее Устройство (Windows / Web)"
                        : "Current Web Session"}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {language === "uz"
                        ? "Toshkent, O'zbekiston • Faol"
                        : language === "ru"
                        ? "Ташкент, Узбекистан • Активна"
                        : "Tashkent, Uzbekistan • Active"}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Online</span>
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {language === "uz"
                    ? "Boshqa qurilmalarda seans bormi?"
                    : language === "ru"
                    ? "Есть сеансы на других устройствах?"
                    : "Other logged in devices?"}
                </span>
                <button
                  type="button"
                  onClick={() => terminateSessionsMut.mutate()}
                  disabled={terminateSessionsMut.isPending}
                  className="px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition border border-[var(--line)] dark:border-amber-900 cursor-pointer"
                >
                  {terminateSessionsMut.isPending
                    ? language === "uz" ? "To'xtatilmoqda..." : language === "ru" ? "Завершение..." : "Terminating..."
                    : language === "uz"
                    ? "Boshqa seanslarni yopish"
                    : language === "ru"
                    ? "Завершить другие сеансы"
                    : "Terminate other sessions"}
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication Toggle */}
            <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-200/70 dark:border-purple-900/50 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-600 stroke-[2.2]" />
                  <span>
                    {language === "uz"
                      ? "2FA Ikki Bosqichli Himoya"
                      : language === "ru"
                      ? "2FA Двухфакторная Защита"
                      : "Two-Factor Authentication"}
                  </span>
                </span>
                <p className="text-[11px] text-slate-500">
                  {language === "uz"
                    ? "Har safar kirishda SMS / Kod talab qilish"
                    : language === "ru"
                    ? "Запрашивать SMS-код при каждом входе"
                    : "Require SMS code on every new sign in"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newVal = !twoFactor;
                  setTwoFactor(newVal);
                  updatePrivacyMut.mutate({ twoFactorEnabled: newVal });
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  twoFactor ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFactor ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500 stroke-[2.2]" />
                <span>
                  {language === "uz"
                    ? "Parolni O'zgartirish"
                    : language === "ru"
                    ? "Сменить Пароль"
                    : "Change Password"}
                </span>
              </h4>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {language === "uz" ? "Hozirgi parolingiz" : language === "ru" ? "Текущий пароль" : "Current Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[2.2]" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 text-xs font-medium dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4 stroke-[2.2]" /> : <Eye className="w-4 h-4 stroke-[2.2]" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {language === "uz" ? "Yangi parol" : language === "ru" ? "Новый пароль" : "New Password"}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[2.2]" />
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 text-xs font-medium dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showNew ? <EyeOff className="w-4 h-4 stroke-[2.2]" /> : <Eye className="w-4 h-4 stroke-[2.2]" />}
                  </button>
                </div>

                <PasswordStrengthIndicator password={newPassword} language={language} />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {language === "uz"
                    ? "Yangi parolni tasdiqlang"
                    : language === "ru"
                    ? "Подтвердите новый пароль"
                    : "Confirm New Password"}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[2.2]" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 text-xs font-medium dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4 stroke-[2.2]" /> : <Eye className="w-4 h-4 stroke-[2.2]" />}
                  </button>
                </div>
              </div>

              {pwdMsg && (
                <div
                  className={`text-xs p-3 rounded-xl border flex items-center gap-2 ${
                    pwdMsg.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {pwdMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[2.2]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 stroke-[2.2]" />
                  )}
                  <span>{pwdMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={changePasswordMut.isPending}
                className="w-full py-2.5 btn-luxury-gold text-slate-950 rounded-xl text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {changePasswordMut.isPending
                  ? language === "uz" ? "Yangilanmoqda..." : language === "ru" ? "Обновление..." : "Updating..."
                  : language === "uz" ? "Parolni Yangilash" : language === "ru" ? "Обновить Пароль" : "Update Password"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: PRIVACY & DATA GOVERNANCE */}
        {activeTab === "privacy" && (
          <div className="space-y-4 animate-fade-in text-xs">
            {/* Incognito Search Mode Toggle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
              <div className="space-y-0.5 pr-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span>
                    {language === "uz"
                      ? "Maxfiy Qidiruv (Incognito AI)"
                      : language === "ru"
                      ? "Инкогнито Поиск (Incognito AI)"
                      : "Incognito AI Search"}
                  </span>
                </span>
                <p className="text-[11px] text-slate-500">
                  {language === "uz"
                    ? "Qidiruv tarixini serverda va AI tahlilida saqlamaslik"
                    : language === "ru"
                    ? "Не сохранять историю запросов на сервере и в AI"
                    : "Do not save search queries in server logs"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newVal = !incognito;
                  setIncognito(newVal);
                  updatePrivacyMut.mutate({ incognitoSearch: newVal });
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                  incognito ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    incognito ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Private Wishlist Toggle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
              <div className="space-y-0.5 pr-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>
                    {language === "uz"
                      ? "Yopiq Istaklar Ro'yxati"
                      : language === "ru"
                      ? "Приватные Списки Желаний"
                      : "Private Wishlists"}
                  </span>
                </span>
                <p className="text-[11px] text-slate-500">
                  {language === "uz"
                    ? "Sovg'a ro'yxatlarini ommaviy qidiruvdan yashirish"
                    : language === "ru"
                    ? "Скрыть списки желаний из публичного поиска"
                    : "Hide wishlist from public search results"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newVal = !privateWishlist;
                  setPrivateWishlist(newVal);
                  updatePrivacyMut.mutate({ privateWishlist: newVal });
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                  privateWishlist ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privateWishlist ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Telegram Radar Alert */}
            <div className="p-4 bg-sky-50 dark:bg-sky-950/30 rounded-2xl border border-sky-200 dark:border-sky-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-900 dark:text-sky-300 flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#2AABEE]" />
                  <span>
                    {language === "uz"
                      ? "Telegram Narx Xabarnomalari"
                      : language === "ru"
                      ? "Telegram Уведомления о Ценах"
                      : "Telegram Price Drop Alerts"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "https://t.me/SovgaUzBot?start=auth_" + Date.now();
                  }}
                  className="px-2.5 py-1 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                >
                  {language === "uz" ? "Botni ulash" : language === "ru" ? "Подключить бота" : "Connect Bot"}
                </button>
              </div>
              <p className="text-[11px] text-sky-700 dark:text-sky-400">
                {language === "uz"
                  ? "Narxlar tushganida to'g'ridan-to'g'ri Telegramingizga zudlik bilan bildirishnoma keladi."
                  : language === "ru"
                  ? "Мгновенные уведомления в Telegram при падении цен на товары."
                  : "Get immediate price drop radar signals directly inside Telegram."}
              </p>
            </div>

            {/* GDPR / Data Export */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-500" />
                  <span>
                    {language === "uz"
                      ? "Shaxsiy Ma'lumotlarni Yuklab Olish"
                      : language === "ru"
                      ? "Выгрузка Персональных Данных"
                      : "Export Personal Data"}
                  </span>
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {language === "uz"
                    ? "O'zbekiston Qonunchiligi va GDPR standartlari bo'yicha to'liq JSON arxivi"
                    : language === "ru"
                    ? "Полный архив ваших данных и вишлистов по стандарту GDPR"
                    : "Complete JSON snapshot of your wishlists, searches, and profile"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => exportDataMut.mutate()}
                disabled={exportDataMut.isPending}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
              >
                {exportDataMut.isPending
                  ? language === "uz" ? "Yuklanmoqda..." : language === "ru" ? "Выгрузка..." : "Exporting..."
                  : language === "uz" ? "Eksport (JSON)" : language === "ru" ? "Экспорт (JSON)" : "Export (JSON)"}
              </button>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="pt-2">
              {!showDeleteConfirm ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => logoutMut.mutate()}
                    disabled={logoutMut.isPending}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 stroke-[2.2]" />
                    <span>{language === "uz" ? "Chiqish" : language === "ru" ? "Выйти" : "Sign Out"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl font-bold transition flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-900 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                    <span>{language === "uz" ? "Hisobni O'chirish" : language === "ru" ? "Удалить" : "Delete"}</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-300 dark:border-rose-900 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold">
                    <AlertCircle className="w-4 h-4 stroke-[2.2]" />
                    <span>
                      {language === "uz"
                        ? "Hisobni butunlay o'chirishni tasdiqlaysizmi?"
                        : language === "ru"
                        ? "Подтвердите полное удаление аккаунта"
                        : "Confirm Account Deletion"}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400">
                    {language === "uz"
                      ? "Barcha ro'yxatlaringiz va tarix qaytarib bo'lmaydigan darajada o'chiriladi. Tasdiqlash uchun parolingizni kiriting:"
                      : language === "ru"
                      ? "Все ваши списки и история будут безвозвратно удалены. Введите пароль для подтверждения:"
                      : "All your wishlists and history will be permanently wiped. Enter password to confirm:"}
                  </p>

                  <input
                    type="password"
                    placeholder={
                      language === "uz" ? "Parolingiz" : language === "ru" ? "Ваш пароль" : "Your password"
                    }
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
                  />

                  {deleteError && (
                    <p className="text-[10px] text-rose-600 font-bold">{deleteError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg font-bold cursor-pointer"
                    >
                      {language === "uz" ? "Bekor qilish" : language === "ru" ? "Отмена" : "Cancel"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAccountMut.mutate(deletePassword)}
                      disabled={deleteAccountMut.isPending}
                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold disabled:opacity-50 cursor-pointer"
                    >
                      {deleteAccountMut.isPending
                        ? language === "uz" ? "O'chirilmoqda..." : language === "ru" ? "Удаление..." : "Deleting..."
                        : language === "uz" ? "O'chirish" : language === "ru" ? "Удалить навсегда" : "Delete Permanently"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
