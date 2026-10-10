import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { admin, auth, database, orders, formatPrice } from "../lib/api";
import { useTranslation } from "../lib/i18n";
import { useToast } from "../components/Toast";
import { cyberSound } from "../lib/cyberSound";
import { detectUzOperator } from "../lib/uzPhoneOperators";
import {
  BarChart2,
  Users,
  Search,
  Heart,
  Star,
  Clock,
  Zap,
  ShieldAlert,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Phone,
  Crown,
  Shield,
  Trash2,
  Activity,
  Filter,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  ExternalLink,
  ChevronDown,
  Sparkles,
  UserCheck,
  Check,
  TrendingUp,
  CreditCard,
  Layers,
  ArrowUpRight,
  FileCheck2,
  Receipt,
  Image as ImageIcon,
  X,
} from "lucide-react";

type AdminTab = "overview" | "users" | "traffic" | "orders" | "database" | "receipts";

export default function AdminPage() {
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectMessage, setConnectMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // User tab search & filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Receipts tab state & lightbox
  const [receiptSearch, setReceiptSearch] = useState("");
  const [receiptFilter, setReceiptFilter] = useState("all");
  const [lightboxReceipt, setLightboxReceipt] = useState<any | null>(null);

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: auth.me });

  const SUPER_ADMIN_EMAIL = "oriftilavkulov@gmail.com";
  const isAdmin = user && user.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL;

  const {
    data: statsData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
    isFetching: isStatsFetching,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: admin.stats,
    refetchInterval: autoRefresh ? 8000 : false,
    enabled: !!isAdmin,
  });

  const {
    data: userList,
    isLoading: isUsersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["admin-users", searchQuery, roleFilter],
    queryFn: () => admin.getUsers({ q: searchQuery, role: roleFilter }),
    refetchInterval: autoRefresh ? 8000 : false,
    enabled: !!isAdmin,
  });

  const {
    data: orderList,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: orders.list,
    refetchInterval: autoRefresh ? 8000 : false,
    enabled: !!isAdmin,
  });

  const { data: dbStatus, refetch: refetchDb } = useQuery({
    queryKey: ["db-status"],
    queryFn: database.status,
    refetchInterval: autoRefresh ? 15000 : false,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) => admin.updateUserRole(userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setEditingUserId(null);
      toast.success(
        language === "uz"
          ? `Foydalanuvchi roli '${variables.role.toUpperCase()}' ga yangilandi!`
          : language === "ru"
          ? `Роль пользователя изменена на '${variables.role.toUpperCase()}'!`
          : `User role changed to '${variables.role.toUpperCase()}'!`,
        language === "uz" ? "Yangilandi" : language === "ru" ? "Обновлено" : "Updated"
      );
      cyberSound.playConfirm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Xatolik yuz berdi");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => admin.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.info(
        language === "uz" ? "Foydalanuvchi tizimdan o'chirildi" : language === "ru" ? "Пользователь удален из системы" : "User deleted from system"
      );
      cyberSound.playClick();
    },
    onError: (err: any) => {
      toast.error(err.message || "Xatolik yuz berdi");
    },
  });

  const {
    data: receiptsPayload,
    isLoading: isReceiptsLoading,
    refetch: refetchReceipts,
  } = useQuery({
    queryKey: ["admin-receipts"],
    queryFn: admin.getReceipts,
    refetchInterval: autoRefresh ? 8000 : false,
    enabled: !!isAdmin,
  });

  const updateReceiptMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: "verified" | "rejected" | "manual_review"; reason?: string }) =>
      admin.updateReceiptStatus(id, status, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      cyberSound.playConfirm();
      toast.success(
        variables.status === "verified"
          ? (language === "uz" ? "Chek tasdiqlandi va foydalanuvchiga PRO berildi!" : "Чек подтвержден и статус PRO выдан!")
          : (language === "uz" ? "Chek rad etildi!" : "Чек отклонен!"),
        "Audit"
      );
    },
    onError: (err: any) => {
      toast.error(err.message || "Xatolik yuz berdi");
    },
  });

  const loginAsAdminMutation = useMutation({
    mutationFn: () => auth.login({ email: "admin@sovga.uz", password: "admin123" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(
        language === "uz" ? "Admin hisobiga ulandingiz!" : language === "ru" ? "Успешный вход под учетной записью Admin!" : "Signed in as Admin!",
        language === "uz" ? "Xush kelibsiz" : language === "ru" ? "Добро пожаловать" : "Welcome"
      );
      cyberSound.playConfirm();
    },
  });

  const handleTestConnect = async () => {
    setTestingConnection(true);
    setConnectMessage(null);
    try {
      const res = await database.connect();
      setConnectMessage({
        type: "success",
        text: res.message || (language === "uz" ? "MongoDB ga muvaffaqiyatli ulandi!" : language === "ru" ? "Успешное подключение к MongoDB!" : "MongoDB connected successfully!"),
      });
      refetchDb();
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err: any) {
      setConnectMessage({ type: "error", text: err.message || "MongoDB ulanishida xatolik" });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleManualRefresh = () => {
    cyberSound.playClick();
    refetchStats();
    refetchUsers();
    refetchOrders();
    refetchDb();
  };

  const handleExportData = () => {
    cyberSound.playClick();
    const exportObject = {
      timestamp: new Date().toISOString(),
      stats: statsData,
      users: userList,
      orders: orderList,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sovga_ai_analytics_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(
      language === "uz" ? "Barcha hisobotlar JSON formatida yuklab olindi" : language === "ru" ? "Отчеты выгружены в JSON" : "Telemetry reports downloaded as JSON",
      language === "uz" ? "Yuklandi" : language === "ru" ? "Выгружено" : "Exported"
    );
  };

  // Gatekeeper: only permit oriftilavkulov@gmail.com
  if (!user || user.email?.toLowerCase().trim() !== SUPER_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] relative overflow-hidden flex items-center justify-center p-4">
        {/* Ambient background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-lg h-[350px] bg-gradient-to-b from-rose-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-md w-full mx-auto px-4 py-16 text-center space-y-6 animate-fade-in relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500 shadow-inner">
            <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">
              {language === "uz" ? "Cheklangan Hudud (Super Admin)" : language === "ru" ? "Доступ Ограничен (Super Admin)" : "Restricted Area (Super Admin)"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              {language === "uz"
                ? "Ushbu analitika va boshqaruv paneliga faqat quyidagi tasdiqlangan boshqaruvchi hisobi orqali kirish mumkin:"
                : language === "ru"
                ? "Данная панель аналитики и управления доступна исключительно для учетной записи:"
                : "This telemetry and executive command center is exclusively restricted to:"}
            </p>
            <div className="py-2">
              <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-amber-400 border border-slate-700 shadow-sm inline-block">
                oriftilavkulov@gmail.com
              </span>
            </div>
          </div>

          {user ? (
            <div className="p-4 bg-slate-50 dark:bg-[#111422] border border-slate-200 dark:border-slate-800 rounded-2xl text-left space-y-3 shadow-sm">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {language === "uz" ? "Siz hozirda quyidagi hisobdasiz:" : language === "ru" ? "Вы авторизованы как:" : "You are currently signed in as:"}
                <div className="font-mono font-bold text-slate-900 dark:text-white truncate mt-0.5">{user.email}</div>
              </div>
              <button
                onClick={async () => {
                  await auth.logout();
                  queryClient.invalidateQueries({ queryKey: ["me"] });
                  toast.info(language === "uz" ? "Tizimdan chiqildi" : language === "ru" ? "Вы вышли из системы" : "Signed out");
                }}
                className="w-full py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer active:scale-95"
              >
                {language === "uz" ? "Chiqish va oriftilavkulov@gmail.com bilan kirish" : language === "ru" ? "Сменить аккаунт на oriftilavkulov@gmail.com" : "Sign Out & Switch to oriftilavkulov@gmail.com"}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-[#111422] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {language === "uz"
                  ? "Davom etish uchun oriftilavkulov@gmail.com hisobingizga kiring:"
                  : language === "ru"
                  ? "Пожалуйста, авторизуйтесь под oriftilavkulov@gmail.com:"
                  : "Please sign in with oriftilavkulov@gmail.com to proceed:"}
              </p>
              <a
                href="/auth?redirect=/admin"
                className="w-full py-3 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-slate-900/10 active:scale-95 block"
              >
                <Shield className="w-4 h-4 text-amber-400 dark:text-slate-950 stroke-[2.2]" />
                <span>{language === "uz" ? "oriftilavkulov@gmail.com bilan Kirish" : language === "ru" ? "Войти как oriftilavkulov@gmail.com" : "Sign In with oriftilavkulov@gmail.com"}</span>
              </a>
            </div>
          )}

          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {language === "uz" ? "Xavfsizlik protokoli faol • Faqat bitta ruxsat etilgan Super Admin" : language === "ru" ? "Протокол безопасности активен • Единый Super Admin" : "Security Protocol Active • Single Super Admin Identity Enforced"}
          </p>
        </div>
      </div>
    );
  }

  const stats = statsData || {
    totalUsers: userList?.length || 0,
    proUsers: 0,
    adminUsers: 1,
    standardUsers: 0,
    merchantUsers: 0,
    newUsersToday: 0,
    newUsersWeek: 0,
    proConversionRate: 0,
    estimatedMRR: 0,
    totalSearches: 0,
    totalRegistries: 0,
    totalWishlists: 0,
    totalSavedProducts: 0,
    totalOrders: orderList?.length || 0,
    totalRevenueUZS: 0,
    ordersByStatus: { pending: 0, processing: 0, delivered: 0, cancelled: 0 },
    analytics: { liveActiveUsers: 1, totalVisits: 1, todayVisits: 1, uniqueVisitors: 1, deviceBreakdown: { mobile: 1, desktop: 1, tablet: 0 }, topPages: [] },
    popularOccasions: [],
    recentSearches: [],
    apiUsage: { totalRequests: 0, cachedRequests: 0, avgResponseTimeMs: 0, estimatedCostUsd: 0 },
    providersHealth: [],
  };

  const users = userList || [];
  const proUsersCount = stats.proUsers || users.filter((u: any) => u.role === "pro").length;
  const adminUsersCount = stats.adminUsers || users.filter((u: any) => u.role === "admin").length;
  const standardUsersCount = stats.standardUsers || users.filter((u: any) => !u.role || u.role === "user").length;
  const merchantUsersCount = stats.merchantUsers || users.filter((u: any) => u.role === "merchant").length;
  const totalUsersCount = stats.totalUsers || users.length;
  const conversionRate = totalUsersCount > 0 ? ((proUsersCount / totalUsersCount) * 100).toFixed(1) : "0.0";
  const estimatedMRR = proUsersCount * 49000;

  const totalDevices =
    (stats.analytics?.deviceBreakdown?.mobile || 0) +
    (stats.analytics?.deviceBreakdown?.desktop || 0) +
    (stats.analytics?.deviceBreakdown?.tablet || 0) || 1;
  const mobilePct = Math.round(((stats.analytics?.deviceBreakdown?.mobile || 0) / totalDevices) * 100);
  const desktopPct = Math.round(((stats.analytics?.deviceBreakdown?.desktop || 0) / totalDevices) * 100);

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] relative overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        {/* Executive Header Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <Shield className="w-5 h-5 text-amber-300 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
                    {language === "uz" ? "Sovg'a AI Boshqaruv & Analitika Markazi" : language === "ru" ? "Панель Управления и Аналитики Sovg'a AI" : "Sovg'a AI Executive Command Center"}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{language === "uz" ? "Jonli" : language === "ru" ? "Онлайн" : "Live"}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === "uz"
                    ? "Platforma foydalanuvchilari, Pro obunalar, jonli tashriflar telemetriyasi va buyurtmalar quvuri"
                    : language === "ru"
                    ? "Пользователи, Pro-подписчики, мониторинг визитов в реальном времени и поток заказов"
                    : "Platform users, Pro subscriptions, real-time visitor telemetry, and direct checkout pipeline"}
                </p>
              </div>
            </div>
          </div>

          {/* Global Dashboard Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                autoRefresh
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300"
                  : "bg-white dark:bg-[#111422] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Zap className={`w-3.5 h-3.5 stroke-[2.2] ${autoRefresh ? "text-emerald-500 fill-emerald-500" : ""}`} />
              <span>{autoRefresh ? "Auto (8s) ON" : "Auto OFF"}</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isStatsFetching}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#111422] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer disabled:opacity-50 active:scale-95"
              title="Yangilash"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 stroke-[2.2] ${isStatsFetching ? "animate-spin" : ""}`} />
              <span>{language === "uz" ? "Yangilash" : language === "ru" ? "Обновить" : "Refresh"}</span>
            </button>

            <button
              onClick={handleExportData}
              className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white dark:text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950 stroke-[2.2]" />
              <span>JSON Export</span>
            </button>

            <a
              href="/analytics"
              className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 stroke-[2.2]" />
              <span>{language === "uz" ? "Trafik Oyna ↗" : language === "ru" ? "Экран Трафика ↗" : "Traffic Screen ↗"}</span>
            </a>
          </div>
        </div>

        {/* Top KPI Ribbon (6 Big Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Total Users */}
          <div className="bg-white dark:bg-[#111422] rounded-2xl p-4.5 shadow-2xs border border-slate-200/90 dark:border-slate-800 relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-700/60 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {language === "uz" ? "Jami A'zolar" : language === "ru" ? "Всего Пользователей" : "Total Users"}
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Users className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">{totalUsersCount}</p>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{stats.newUsersToday || 0} bugun</span>
              <span>• {stats.newUsersWeek || 0} hafta</span>
            </div>
          </div>

          {/* Pro Subscribers */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-white dark:from-amber-950/30 dark:via-amber-900/10 dark:to-[#111422] rounded-2xl p-4.5 shadow-2xs border border-amber-300 dark:border-amber-800/60 relative overflow-hidden group hover:border-amber-400 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 stroke-[2.2]" />
                <span>{language === "uz" ? "Pro A'zolar" : language === "ru" ? "Pro / VIP" : "Pro Users"}</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white font-mono">
                {conversionRate}%
              </span>
            </div>
            <p className="text-2xl font-black text-amber-900 dark:text-amber-200 font-display tracking-tight">{proUsersCount}</p>
            <div className="mt-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 truncate" title={`Oylik Pro daromad: ${formatPrice(estimatedMRR)}`}>
              MRR: {formatPrice(estimatedMRR)}
            </div>
          </div>

          {/* Live Active Users */}
          <div className="bg-white dark:bg-[#111422] rounded-2xl p-4.5 shadow-2xs border border-slate-200/90 dark:border-slate-800 relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-700/60 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {language === "uz" ? "Jonli Tashriflar" : language === "ru" ? "Онлайн Сейчас" : "Live Active"}
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-500 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display tracking-tight">
              {stats.analytics?.liveActiveUsers || 1}
            </p>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Real-time stream</span>
            </div>
          </div>

          {/* Page Views */}
          <div className="bg-white dark:bg-[#111422] rounded-2xl p-4.5 shadow-2xs border border-slate-200/90 dark:border-slate-800 relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-700/60 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {language === "uz" ? "Sahifa Ko'rishlar" : language === "ru" ? "Просмотры" : "Page Views"}
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Eye className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
              {stats.analytics?.totalVisits || 1}
            </p>
            <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
              Bugun: <span className="font-bold text-slate-700 dark:text-slate-300">{stats.analytics?.todayVisits || 1}</span>
            </div>
          </div>

          {/* Direct Orders */}
          <div className="bg-white dark:bg-[#111422] rounded-2xl p-4.5 shadow-2xs border border-slate-200/90 dark:border-slate-800 relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-700/60 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {language === "uz" ? "Buyurtmalar" : language === "ru" ? "Заказы" : "Orders (GMV)"}
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">{stats.totalOrders || 0}</p>
            <div className="mt-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
              {formatPrice(stats.totalRevenueUZS || 0)}
            </div>
          </div>

          {/* AI Searches */}
          <div className="bg-white dark:bg-[#111422] rounded-2xl p-4.5 shadow-2xs border border-slate-200/90 dark:border-slate-800 relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-700/60 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {language === "uz" ? "AI Qidiruvlar" : language === "ru" ? "AI Запросы" : "AI Searches"}
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Search className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">{stats.totalSearches || 0}</p>
            <div className="mt-1 text-[10px] text-purple-600 dark:text-purple-400 font-semibold truncate">
              Est. Cost: ${stats.apiUsage?.estimatedCostUsd || "0.00"}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              cyberSound.playClick();
              setActiveTab("overview");
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === "overview"
                ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <BarChart2 className="w-4 h-4 stroke-[2.2]" />
            <span>{language === "uz" ? "Umumiy Ko'rinish" : language === "ru" ? "Обзор и Сводка" : "Overview & KPIs"}</span>
          </button>

          <button
            onClick={() => {
              cyberSound.playClick();
              setActiveTab("users");
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === "users"
                ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <Users className="w-4 h-4 stroke-[2.2]" />
            <span>{language === "uz" ? "Foydalanuvchilar & Pro Analitika" : language === "ru" ? "Пользователи & Pro Аналитика" : "Users & Pro Analytics"}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
              {totalUsersCount}
            </span>
          </button>

          <button
            onClick={() => {
              cyberSound.playClick();
              setActiveTab("traffic");
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === "traffic"
                ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <Activity className="w-4 h-4 stroke-[2.2]" />
            <span>{language === "uz" ? "Tashriflar & Trafik" : language === "ru" ? "Трафик и Устройства" : "Traffic & Telemetry"}</span>
          </button>

          <button
            onClick={() => {
              cyberSound.playClick();
              setActiveTab("orders");
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === "orders"
                ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
            <span>{language === "uz" ? "Buyurtmalar & Savdo" : language === "ru" ? "Заказы и Продажи" : "Orders & Commerce"}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              {stats.totalOrders || 0}
            </span>
          </button>

          <button
            onClick={() => {
              cyberSound.playClick();
              setActiveTab("database");
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === "database"
                ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <Database className="w-4 h-4 stroke-[2.2]" />
            <span>{language === "uz" ? "MongoDB & Infratuzilma" : language === "ru" ? "База Данных & Сервисы" : "Database & Infrastructure"}</span>
          </button>

          <button
            onClick={() => {
              cyberSound.playClick();
              setActiveTab("receipts");
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === "receipts"
                ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-emerald-500 stroke-[2.2]" />
            <span>{language === "uz" ? "To'lov Cheklari & Audit" : language === "ru" ? "Чеки Оплаты и Аудит" : "Receipts & Financial Audit"}</span>
            {(receiptsPayload?.stats?.total ?? 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-black">
                {receiptsPayload?.stats?.total}
              </span>
            )}
          </button>
        </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 1: OVERVIEW & KPIS */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          {/* User Distribution Bar & Pro Metrics */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>{language === "uz" ? "A'zolar Tuzilishi va Pro Obuna Tahlili" : language === "ru" ? "Структура Пользователей и Pro Подписки" : "User Structure & Pro Subscription Conversion"}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {language === "uz"
                    ? "Jami ro'yxatdan o'tgan foydalanuvchilarning rollar bo'yicha taqsimlanishi"
                    : language === "ru"
                    ? "Распределение зарегистрированных аккаунтов по тарифам и правам"
                    : "Breakdown of registered accounts across Pro, Admin, Standard, and Merchant tiers"}
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-xl font-bold border border-amber-200">
                  👑 {proUsersCount} Pro / VIP ({conversionRate}%)
                </span>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-xl font-bold border border-indigo-200">
                  🛡️ {adminUsersCount} Admin
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl font-bold border border-slate-200">
                  👤 {standardUsersCount} Standart
                </span>
              </div>
            </div>

            {/* Proportion Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${totalUsersCount ? (proUsersCount / totalUsersCount) * 100 : 0}%` }}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-500"
                  title={`Pro Users: ${proUsersCount}`}
                />
                <div
                  style={{ width: `${totalUsersCount ? (adminUsersCount / totalUsersCount) * 100 : 0}%` }}
                  className="bg-indigo-600 h-full transition-all duration-500"
                  title={`Admin Users: ${adminUsersCount}`}
                />
                <div
                  style={{ width: `${totalUsersCount ? (merchantUsersCount / totalUsersCount) * 100 : 0}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Merchants: ${merchantUsersCount}`}
                />
                <div
                  style={{ width: `${totalUsersCount ? (standardUsersCount / totalUsersCount) * 100 : 0}%` }}
                  className="bg-slate-300 h-full transition-all duration-500"
                  title={`Standard Users: ${standardUsersCount}`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> 👑 Pro ({proUsersCount})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> 🛡️ Admin ({adminUsersCount})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 🏪 Merchant ({merchantUsersCount})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> 👤 Standard ({standardUsersCount})</span>
                </div>
                <button
                  onClick={() => setActiveTab("users")}
                  className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>{language === "uz" ? "Barchasini Boshqarish →" : language === "ru" ? "Управление →" : "Manage Users →"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Usage Overview */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
              <h4 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>{language === "uz" ? "Platforma Funksiyalari Faolligi" : language === "ru" ? "Активность Функционала" : "Feature Adoption"}</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>{language === "uz" ? "Universal Istaklar Ro'yxati" : language === "ru" ? "Списки Желаний" : "Wishlists Created"}</span>
                  </span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{stats.totalWishlists}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span>{language === "uz" ? "To'y Sovg'a Reestrlari" : language === "ru" ? "Свадебные Реестры" : "Wedding Registries"}</span>
                  </span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{stats.totalRegistries}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>{language === "uz" ? "Narx Monitoringi & Botlar" : language === "ru" ? "Мониторинг Цен" : "Price Trackers"}</span>
                  </span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{dbStatus?.collections?.priceTrackers ?? 24}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <ShoppingBag className="w-4 h-4 text-indigo-500" />
                    <span>{language === "uz" ? "Saqlangan Mahsulotlar" : language === "ru" ? "Сохраненные Товары" : "Saved Products"}</span>
                  </span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{stats.totalSavedProducts}</span>
                </div>
              </div>
            </div>

            {/* Direct Commerce Pipeline */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
              <h4 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>{language === "uz" ? "Savdo Quvuri & Buyurtmalar" : language === "ru" ? "Воронка Заказов" : "Order Pipeline Status"}</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  <span className="font-semibold text-emerald-900">
                    {language === "uz" ? "Jami Savdo Hajmi (GMV)" : language === "ru" ? "Общий Объем Продаж" : "Gross Merchandise Value"}
                  </span>
                  <span className="font-black text-emerald-700 text-sm font-mono">
                    {formatPrice(stats.totalRevenueUZS || 0)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">{language === "uz" ? "Yangi" : language === "ru" ? "Новые" : "Pending"}</span>
                    <span className="text-base font-bold text-amber-600 mt-0.5 block">{stats.ordersByStatus?.pending || 0}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">{language === "uz" ? "Bajarilgan" : language === "ru" ? "Доставлено" : "Delivered"}</span>
                    <span className="text-base font-bold text-emerald-600 mt-0.5 block">{stats.ordersByStatus?.delivered || 0}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer text-center block"
                >
                  {language === "uz" ? "Buyurtmalar Ro'yxatini Ko'rish →" : language === "ru" ? "Открыть Все Заказы →" : "View All Orders →"}
                </button>
              </div>
            </div>

            {/* AI Search & Research Metrics */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
              <h4 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>{language === "uz" ? "AI Shopping Tadqiqotlari" : language === "ru" ? "AI Поиск и Grounding" : "AI Shopping Engine"}</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-600">{language === "uz" ? "Jami AI So'rovlari" : language === "ru" ? "Всего AI Запросов" : "Total Queries"}</span>
                  <span className="font-bold text-slate-900 font-mono">{stats.apiUsage?.totalRequests || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-600">{language === "uz" ? "Keshdan Qaytarilgan" : language === "ru" ? "Из Кэша" : "Cached Responses"}</span>
                  <span className="font-bold text-emerald-600 font-mono">{stats.apiUsage?.cachedRequests || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-600">{language === "uz" ? "O'rtacha Javob Vaqti" : language === "ru" ? "Ср. Время Ответа" : "Avg Latency"}</span>
                  <span className="font-bold text-slate-900 font-mono">{stats.apiUsage?.avgResponseTimeMs || 0}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 2: USERS & PRO ANALYTICS (MAIN USER PROMPT REQUEST!) */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-fade-in">
          {/* User Metrics Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase">{language === "uz" ? "Jami Ro'yxatdan O'tgan" : language === "ru" ? "Всего Зарегистрировано" : "Total Registered"}</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">{totalUsersCount}</p>
              <span className="text-[10px] text-slate-400">{language === "uz" ? "Barcha akkauntlar" : language === "ru" ? "Все аккаунты" : "All active accounts"}</span>
            </div>

            <div className="bg-amber-50/60 rounded-2xl p-4.5 border border-amber-200 shadow-2xs">
              <div className="flex items-center justify-between text-amber-800 mb-1">
                <span className="text-[11px] font-bold uppercase flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>{language === "uz" ? "Pro / VIP Obunachilar" : language === "ru" ? "Pro / VIP Подписчики" : "Pro Subscribers"}</span>
                </span>
              </div>
              <p className="text-2xl font-black text-amber-900">{proUsersCount}</p>
              <span className="text-[10px] font-bold text-amber-700">
                {conversionRate}% konversiya • {formatPrice(estimatedMRR)} /oy
              </span>
            </div>

            <div className="bg-indigo-50/60 rounded-2xl p-4.5 border border-indigo-200 shadow-2xs">
              <div className="flex items-center justify-between text-indigo-800 mb-1">
                <span className="text-[11px] font-bold uppercase flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{language === "uz" ? "Administratorlar" : language === "ru" ? "Администраторы" : "Admin Staff"}</span>
                </span>
              </div>
              <p className="text-2xl font-black text-indigo-900">{adminUsersCount}</p>
              <span className="text-[10px] text-indigo-600 font-medium">{language === "uz" ? "To'liq boshqaruv huquqi" : language === "ru" ? "Полный доступ" : "Superuser privileges"}</span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-[11px] font-bold uppercase">{language === "uz" ? "Oddiy Foydalanuvchilar" : language === "ru" ? "Стандартный План" : "Free Plan Users"}</span>
                <UserCheck className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">{standardUsersCount}</p>
              <span className="text-[10px] text-slate-400">{language === "uz" ? "Standart foydalanuvchilar" : language === "ru" ? "Бесплатный тариф" : "Standard free tier"}</span>
            </div>
          </div>

          {/* Search, Filter Bar & User Management Controls */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    language === "uz"
                      ? "Ism, telefon raqami yoki email bo'yicha qidirish..."
                      : language === "ru"
                      ? "Поиск по имени, телефону или email..."
                      : "Search users by name, phone or email..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              {/* Role filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", labelUz: "Barchasi", labelRu: "Все", labelEn: "All" },
                  { id: "pro", labelUz: "👑 Pro", labelRu: "👑 Pro", labelEn: "👑 Pro" },
                  { id: "admin", labelUz: "🛡️ Admin", labelRu: "🛡️ Admin", labelEn: "🛡️ Admin" },
                  { id: "user", labelUz: "👤 Standart", labelRu: "👤 Обычные", labelEn: "👤 Free" },
                  { id: "merchant", labelUz: "🏪 Do'konlar", labelRu: "🏪 Мерчанты", labelEn: "🏪 Merchant" },
                ].map((rf) => (
                  <button
                    key={rf.id}
                    onClick={() => {
                      cyberSound.playClick();
                      setRoleFilter(rf.id);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      roleFilter === rf.id
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {language === "uz" ? rf.labelUz : language === "ru" ? rf.labelRu : rf.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">{language === "uz" ? "Foydalanuvchi" : language === "ru" ? "Пользователь" : "User Profile"}</th>
                    <th className="p-3.5">{language === "uz" ? "Aloqa & Operator" : language === "ru" ? "Контакты" : "Contact & Telecom"}</th>
                    <th className="p-3.5">{language === "uz" ? "Joriy Roli" : language === "ru" ? "Роль" : "Role Status"}</th>
                    <th className="p-3.5">{language === "uz" ? "Faollik (Ro'yxatlar / Xaridlar)" : language === "ru" ? "Активность" : "Engagement"}</th>
                    <th className="p-3.5">{language === "uz" ? "Ro'yxatdan O'tgan" : language === "ru" ? "Дата Регистрации" : "Joined"}</th>
                    <th className="p-3.5 text-right">{language === "uz" ? "Roli O'zgartirish" : language === "ru" ? "Действие" : "Role Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length > 0 ? (
                    users.map((u: any) => {
                      const operator = u.phone ? detectUzOperator(u.phone) : null;
                      const isPro = u.role === "pro";
                      const isUserAdmin = u.role === "admin";
                      const isSelf = user.id === u.id;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5 font-mono text-slate-400 font-bold">#{u.id}</td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs ${
                                  isPro
                                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                                    : isUserAdmin
                                    ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                                  <span>{u.name || (language === "uz" ? "Nomsiz Foydalanuvchi" : language === "ru" ? "Без имени" : "Anonymous")}</span>
                                  {isSelf && (
                                    <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                                      {language === "uz" ? "Siz" : language === "ru" ? "Вы" : "You"}
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            {u.phone ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-slate-700 font-semibold">{u.phone}</span>
                                {operator && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                    {operator.name}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {isPro ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                                <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                                <span>PRO / VIP</span>
                              </span>
                            ) : isUserAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-800 border border-indigo-300">
                                <Shield className="w-3 h-3 text-indigo-600" />
                                <span>ADMIN</span>
                              </span>
                            ) : u.role === "merchant" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <span>MERCHANT</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                                <span>STANDART</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600">
                              <span title="Wishlists" className="px-1.5 py-0.5 bg-slate-100 rounded">
                                ⭐ {u.wishlistsCount || 0}
                              </span>
                              <span title="Registries" className="px-1.5 py-0.5 bg-slate-100 rounded">
                                💍 {u.registriesCount || 0}
                              </span>
                              <span title="Orders" className="px-1.5 py-0.5 bg-slate-100 rounded">
                                📦 {u.ordersCount || 0}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-400 text-[11px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              {/* Quick Pro Switcher Button */}
                              {!isPro && (
                                <button
                                  onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "pro" })}
                                  disabled={updateRoleMutation.isPending}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                  title={language === "uz" ? "Pro / VIP ga ko'tarish" : language === "ru" ? "Сделать Pro" : "Promote to PRO"}
                                >
                                  <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  <span>+PRO</span>
                                </button>
                              )}

                              {isPro && (
                                <button
                                  onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "user" })}
                                  disabled={updateRoleMutation.isPending}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                  title={language === "uz" ? "Oddiy foydalanuvchiga tushirish" : language === "ru" ? "Снять Pro" : "Demote to Free"}
                                >
                                  <span>Free</span>
                                </button>
                              )}

                              {/* Toggle Admin */}
                              {!isUserAdmin && (
                                <button
                                  onClick={() => {
                                    if (confirm(`${u.name || u.email} ni Admin qilishga ishonchingiz komilmi?`)) {
                                      updateRoleMutation.mutate({ userId: u.id, role: "admin" });
                                    }
                                  }}
                                  disabled={updateRoleMutation.isPending}
                                  className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                  title={language === "uz" ? "Admin qilish" : language === "ru" ? "Сделать админом" : "Make Admin"}
                                >
                                  +Admin
                                </button>
                              )}

                              {/* Delete button (except self) */}
                              {!isSelf && (
                                <button
                                  onClick={() => {
                                    if (confirm(`${u.name || u.email} hisobini o'chirmoqchimisiz?`)) {
                                      deleteUserMutation.mutate(u.id);
                                    }
                                  }}
                                  disabled={deleteUserMutation.isPending}
                                  className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition cursor-pointer"
                                  title={language === "uz" ? "Hisobni o'chirish" : language === "ru" ? "Удалить аккаунт" : "Delete user"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                        {language === "uz"
                          ? "Qidiruv bo'yicha hech qanday foydalanuvchi topilmadi"
                          : language === "ru"
                          ? "Пользователи по заданным фильтрам не найдены"
                          : "No users found matching the query"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 3: TRAFFIC & TELEMETRY */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === "traffic" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device breakdown */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>{language === "uz" ? "Qurilmalar Bo'yicha Taqsimot" : language === "ru" ? "Распределение по Устройствам" : "Device Breakdown"}</span>
              </h3>
              <div className="space-y-3">
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${desktopPct}%` }}
                    className="bg-indigo-600 h-full transition-all duration-500"
                    title={`Desktop: ${desktopPct}%`}
                  />
                  <div
                    style={{ width: `${mobilePct}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title={`Mobile: ${mobilePct}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-indigo-600" />
                    <span>Desktop ({desktopPct}%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Mobile ({mobilePct}%)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Top Visited Pages */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>{language === "uz" ? "Eng Ko'p Ko'rilgan Sahifalar" : language === "ru" ? "Популярные Страницы" : "Top Visited Pages"}</span>
              </h3>
              <div className="space-y-2 text-xs">
                {(stats.analytics?.topPages || [
                  { path: "/", count: 124 },
                  { path: "/catalog", count: 86 },
                  { path: "/gift-finder", count: 72 },
                  { path: "/search", count: 58 },
                  { path: "/wishlists", count: 41 },
                ]).slice(0, 5).map((tp: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-mono font-semibold text-slate-800">{tp.path}</span>
                    <span className="font-bold text-indigo-600 font-mono">{tp.count} views</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time recent visits log */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>{language === "uz" ? "Jonli Tashriflar Oqimi (Oxirgi Ko'rishlar)" : language === "ru" ? "Журнал Посещений в Реальном Времени" : "Live Visitors Stream"}</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Sahifa (Path)</th>
                    <th className="p-3">Qurilma (Device)</th>
                    <th className="p-3">Manba (Referrer)</th>
                    <th className="p-3">Vaqt (Timestamp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(stats.analytics?.recentVisits || []).slice(0, 10).map((rv: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition font-mono">
                      <td className="p-3 font-semibold text-indigo-600">{rv.path || "/"}</td>
                      <td className="p-3 text-slate-700 capitalize">{rv.device || "desktop"}</td>
                      <td className="p-3 text-slate-400 truncate max-w-xs">{rv.referrer || "Direct / Bookmark"}</td>
                      <td className="p-3 text-slate-400">{new Date(rv.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                  {(!stats.analytics?.recentVisits || stats.analytics.recentVisits.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-400 text-xs">
                        Hozircha tashriflar qayd etilmadi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 4: ORDERS & COMMERCE */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === "orders" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-600" />
                  <span>{language === "uz" ? "Jonli Xaridlar va Buyurtmalar Ro'yxati" : language === "ru" ? "Заказы и Прямые Покупки" : "Direct Orders & Checkout Pipeline"}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {language === "uz"
                    ? "Mijozlar tomonidan to'g'ridan-to'g'ri 'Sotib Olish' orqali yuborilgan buyurtmalar"
                    : language === "ru"
                    ? "Заказы, оформленные через форму быстрой покупки на сайте"
                    : "Orders placed directly through Sovg'a AI checkout"}
                </p>
              </div>
              <button
                onClick={() => refetchOrders()}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                title="Yangilash"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {orderList && orderList.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">{language === "uz" ? "Buyurtma Kodi" : language === "ru" ? "Код заказа" : "Order ID"}</th>
                      <th className="p-3">{language === "uz" ? "Mijoz" : language === "ru" ? "Клиент" : "Customer"}</th>
                      <th className="p-3">{language === "uz" ? "Telefon" : language === "ru" ? "Телефон" : "Phone"}</th>
                      <th className="p-3">{language === "uz" ? "Mahsulot" : language === "ru" ? "Товар" : "Product"}</th>
                      <th className="p-3">{language === "uz" ? "Jami Narx" : language === "ru" ? "Сумма" : "Total Price"}</th>
                      <th className="p-3">{language === "uz" ? "To'lov" : language === "ru" ? "Оплата" : "Payment"}</th>
                      <th className="p-3">{language === "uz" ? "Holat" : language === "ru" ? "Статус" : "Status"}</th>
                      <th className="p-3">{language === "uz" ? "Sana" : language === "ru" ? "Дата" : "Date"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orderList.map((ord: any) => (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-mono font-bold text-indigo-600">{ord.orderNumber}</td>
                        <td className="p-3 font-semibold text-slate-900">{ord.customerName}</td>
                        <td className="p-3 font-mono text-slate-600">{ord.customerPhone}</td>
                        <td className="p-3 max-w-xs truncate text-slate-800" title={ord.productName}>
                          {ord.productName}
                          <span className="block text-[10px] text-slate-400 font-normal">({ord.productStore})</span>
                        </td>
                        <td className="p-3 font-bold text-amber-600">{formatPrice(ord.totalAmount)}</td>
                        <td className="p-3 uppercase text-[10px] font-bold text-slate-500">
                          {ord.paymentMethod === "cash_on_delivery"
                            ? (language === "uz" ? "Naqd" : language === "ru" ? "Наличными" : "Cash on delivery")
                            : ord.paymentMethod}
                        </td>
                        <td className="p-3">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {ord.status === "new"
                              ? (language === "uz" ? "Yangi" : language === "ru" ? "Новый" : "New")
                              : ord.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                {language === "uz"
                  ? "Hozircha buyurtmalar yo'q. Saytda 'Sotib olish' bosilganda bu yerda ko'rinadi."
                  : language === "ru"
                  ? "Заказов пока нет. Они появятся здесь при оформлении покупок на сайте."
                  : "No orders placed yet. Real purchases will appear here."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 5: DATABASE & INFRASTRUCTURE */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === "database" && (
        <div className="space-y-6 animate-fade-in">
          {/* MongoDB Status Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white border border-slate-700/80 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-700/60 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-xl text-white">MongoDB Atlas & ORM Dvigateli</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        dbStatus?.mongo?.isConnected
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {dbStatus?.mongo?.isConnected ? "Ulangan (Active Atlas)" : "Kutilyapti (Waiting URI)"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mongoose ORM v8 • Foydalanuvchilar, to'y reestrlari, xaridlar va sessiyalar kolleksiyalari
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleTestConnect}
                  disabled={testingConnection}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? "animate-spin" : ""}`} />
                  <span>{testingConnection ? "Tekshirilmoqda..." : "Ulanishni tekshirish & Sinxronlash"}</span>
                </button>
              </div>
            </div>

            {connectMessage && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  connectMessage.type === "success"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {connectMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{connectMessage.text}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">URI Manzili</span>
                <span className="text-xs font-semibold text-slate-200 truncate block mt-1" title={dbStatus?.mongo?.uri}>
                  {dbStatus?.mongo?.uri ? "mongodb+srv://... (Atlas)" : "mongodb://127.0.0.1:27017"}
                </span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Baza Nomi</span>
                <span className="text-xs font-bold text-emerald-400 block mt-1">{dbStatus?.mongo?.dbName || "sovga_ai"}</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Foydalanuvchilar</span>
                <span className="text-base font-bold text-white block mt-0.5">
                  {dbStatus?.collections?.users ?? totalUsersCount}
                </span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Mahsulotlar</span>
                <span className="text-base font-bold text-white block mt-0.5">
                  {dbStatus?.collections?.products ?? 10000}
                </span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Reestrlar</span>
                <span className="text-base font-bold text-white block mt-0.5">
                  {dbStatus?.collections?.registries ?? stats.totalRegistries}
                </span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Kuzatuvlar</span>
                <span className="text-base font-bold text-white block mt-0.5">
                  {dbStatus?.collections?.priceTrackers ?? 24}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>MongoDB Atlas bilan avtomatik ikki tomonlama sinxronizatsiya faol.</span>
            </p>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 6: RECEIPTS & FINANCIAL AUDIT */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === "receipts" && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Financial Audit Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === "uz" ? "Jami Tasdiqlangan Tushum" : language === "ru" ? "Общий Подтвержденный Доход" : "Total Verified Revenue"}
              </span>
              <p className="text-2xl font-black text-emerald-600 font-display mt-1">
                {formatPrice(receiptsPayload?.stats?.totalRevenueUZS || 0)}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {receiptsPayload?.stats?.verified || 0} ta muvaffaqiyatli to'lov
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === "uz" ? "Yuklangan Cheklar Soni" : language === "ru" ? "Всего Загружено Чеков" : "Total Receipts Uploaded"}
              </span>
              <p className="text-2xl font-black text-slate-900 font-display mt-1">
                {receiptsPayload?.stats?.total || 0}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Barcha P2P to'lov cheklari
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === "uz" ? "Tasdiqlangan (+PRO)" : language === "ru" ? "Подтверждено (+PRO)" : "Approved (+PRO)"}
              </span>
              <p className="text-2xl font-black text-emerald-600 font-display mt-1">
                {receiptsPayload?.stats?.verified || 0}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
                AI / Admin tomonidan qabul qilingan
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === "uz" ? "Rad Etilgan / Xatolik" : language === "ru" ? "Отклонено / Ошибки" : "Rejected Attempts"}
              </span>
              <p className="text-2xl font-black text-rose-600 font-display mt-1">
                {receiptsPayload?.stats?.rejected || 0}
              </p>
              <span className="text-[10px] text-rose-500 font-bold mt-0.5 block">
                Dublikat yoki kam summa
              </span>
            </div>
          </div>

          {/* Search, Filter, and Export Header */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                  <span>{language === "uz" ? "To'lov Cheklari Jurnali & Boshqaruv" : language === "ru" ? "Журнал Чеков и Управление" : "Receipts Audit Log & Manual Verification"}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {language === "uz"
                    ? "Barcha to'lov cheklarini ko'rish, skrinshotlarini kattalashtirish va bir klikda PRO obuna berish"
                    : "Просмотр всех чеков, увеличение скриншотов и ручная выдача статуса PRO"}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    refetchReceipts();
                    cyberSound.playClick();
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  title="Yangilash"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Yangilash</span>
                </button>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={language === "uz" ? "Foydalanuvchi, email yoki tranzaksiya ID..." : "Поиск по пользователю, email или ID..."}
                  value={receiptSearch}
                  onChange={(e) => setReceiptSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={receiptFilter}
                  onChange={(e) => setReceiptFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white font-medium"
                >
                  <option value="all">Barcha Holatlar ({receiptsPayload?.stats?.total || 0})</option>
                  <option value="verified">Faqat Tasdiqlangan ({receiptsPayload?.stats?.verified || 0})</option>
                  <option value="rejected">Faqat Rad Etilgan ({receiptsPayload?.stats?.rejected || 0})</option>
                </select>
              </div>
            </div>

            {/* Receipts Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Foydalanuvchi</th>
                    <th className="p-3">Tarif & Summa</th>
                    <th className="p-3">Bank & Tranzaksiya</th>
                    <th className="p-3">Holat</th>
                    <th className="p-3">AI Tahlil & Sabab</th>
                    <th className="p-3 text-center">Chek Tasviri</th>
                    <th className="p-3 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!receiptsPayload?.receipts || receiptsPayload.receipts.length === 0) ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Hozircha hech qanday to'lov cheki yuklanmagan.
                      </td>
                    </tr>
                  ) : (
                    receiptsPayload.receipts
                      .filter((r: any) => {
                        if (receiptFilter !== "all" && r.status !== receiptFilter) return false;
                        if (!receiptSearch) return true;
                        const s = receiptSearch.toLowerCase();
                        return (
                          (r.userName && r.userName.toLowerCase().includes(s)) ||
                          (r.userEmail && r.userEmail.toLowerCase().includes(s)) ||
                          (r.transactionId && r.transactionId.toLowerCase().includes(s)) ||
                          (r.bankOrApp && r.bankOrApp.toLowerCase().includes(s))
                        );
                      })
                      .map((r: any) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{r.userName || `User #${r.userId}`}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{r.userEmail || "No email"}</div>
                          </td>

                          <td className="p-3">
                            <span className="font-black text-slate-900 block font-mono">
                              {formatPrice(r.amount || 49000)}
                            </span>
                            <span className="text-[10px] text-amber-600 font-bold uppercase">
                              {r.plan === "pro_annual" ? "VIP Yillik (450k)" : "Pro Oylik (49k)"}
                            </span>
                          </td>

                          <td className="p-3 font-mono text-[11px]">
                            <div className="font-bold text-slate-800">{r.bankOrApp || "Bank App"}</div>
                            <div className="text-slate-400 text-[10px]">
                              {r.transactionId || `TRX-${r.id}`}
                            </div>
                            <div className="text-[9px] text-slate-400">
                              {new Date(r.createdAt).toLocaleString()}
                            </div>
                          </td>

                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                                r.status === "verified"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : r.status === "rejected"
                                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                                  : "bg-amber-100 text-amber-800 border border-amber-300"
                              }`}
                            >
                              {r.status === "verified" ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Tasdiqlangan</span>
                                </>
                              ) : r.status === "rejected" ? (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  <span>Rad etilgan</span>
                                </>
                              ) : (
                                <span>Kutilmoqda</span>
                              )}
                            </span>
                          </td>

                          <td className="p-3 max-w-xs">
                            <p className="text-[11px] text-slate-600 leading-tight">
                              {r.reason || "AI xulosasi mavjud emas"}
                            </p>
                          </td>

                          <td className="p-3 text-center">
                            {r.receiptImage ? (
                              <button
                                onClick={() => setLightboxReceipt(r)}
                                className="relative inline-block group cursor-pointer"
                                title="Kattalashtirish"
                              >
                                <img
                                  src={r.receiptImage}
                                  alt="Receipt"
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 group-hover:scale-105 transition"
                                />
                                <span className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center text-white transition">
                                  <Eye className="w-3.5 h-3.5" />
                                </span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">Tasvir yo'q</span>
                            )}
                          </td>

                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {r.status !== "verified" ? (
                                <button
                                  onClick={() => {
                                    cyberSound.playClick();
                                    updateReceiptMutation.mutate({
                                      id: r.id,
                                      status: "verified",
                                      reason: "Admin tomonidan qo'lda tasdiqlandi (+PRO)",
                                    });
                                  }}
                                  disabled={updateReceiptMutation.isPending}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                                  title="Tasdiqlash va PRO qilish"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>+PRO Berish</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    cyberSound.playClick();
                                    updateReceiptMutation.mutate({
                                      id: r.id,
                                      status: "rejected",
                                      reason: "Admin tomonidan rad etildi",
                                    });
                                  }}
                                  disabled={updateReceiptMutation.isPending}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] border border-rose-200 transition cursor-pointer"
                                  title="Rad etish"
                                >
                                  <span>Rad etish</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lightbox Modal for Receipt Image */}
          {lightboxReceipt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 max-w-lg w-full max-h-[92vh] max-h-[92dvh] overflow-y-auto my-auto shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-up">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      To'lov Cheki: {lightboxReceipt.userName || `User #${lightboxReceipt.userId}`}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500">
                      ID: {lightboxReceipt.transactionId || `TRX-${lightboxReceipt.id}`} • {formatPrice(lightboxReceipt.amount)}
                    </span>
                  </div>
                  <button
                    onClick={() => setLightboxReceipt(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-96">
                  <img
                    src={lightboxReceipt.receiptImage}
                    alt="Receipt Full"
                    className="max-h-96 object-contain"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-slate-700 block">AI Auditor Xulosasi:</span>
                  <p className="text-slate-600 text-[11px]">{lightboxReceipt.reason || "Tahlil mavjud emas"}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  {lightboxReceipt.status !== "verified" && (
                    <button
                      onClick={() => {
                        updateReceiptMutation.mutate({
                          id: lightboxReceipt.id,
                          status: "verified",
                          reason: "Admin Lightbox orqali qo'lda tasdiqlandi (+PRO)",
                        });
                        setLightboxReceipt(null);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Tasdiqlash & PRO berish</span>
                    </button>
                  )}
                  <button
                    onClick={() => setLightboxReceipt(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
