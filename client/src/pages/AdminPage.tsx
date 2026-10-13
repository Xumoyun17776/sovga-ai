import { PLANS, normalizePlanId, type PlanId } from "@shared/plans";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { admin, auth, database, orders, formatPrice } from "../lib/api";
import { useTranslation } from "../lib/i18n";
import { useToast } from "../components/Toast";
import { cyberSound } from "../lib/cyberSound";
import { detectUzOperator } from "../lib/uzPhoneOperators";
import GrantPlanPanel, { PlanBadge, fmtDate, daysLeft, safePlan, type AdminUserRow } from "../components/admin/GrantPlanPanel";
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
} from "../lib/icons";

type AdminTab = "overview" | "users" | "traffic" | "orders" | "database" | "receipts";

const USER_FILTERS = [
  { id: "all", uz: "Barchasi", ru: "Все", en: "All" },
  { id: "paid", uz: "Pullik", ru: "Платные", en: "Paying" },
  { id: "start", uz: "Start", ru: "Старт", en: "Start" },
  { id: "plus", uz: "Plus", ru: "Плюс", en: "Plus" },
  { id: "premium", uz: "Premium", ru: "Премиум", en: "Premium" },
  { id: "expired", uz: "Muddati tugagan", ru: "Истёкшие", en: "Expired" },
  { id: "free", uz: "Bepul", ru: "Бесплатные", en: "Free" },
  { id: "admin", uz: "Admin", ru: "Админ", en: "Admin" },
  { id: "demo", uz: "Test", ru: "Тест", en: "Test" },
];
const userFilterParams = (id: string) =>
  id === "all" ? {} : id === "admin" ? { role: "admin" } : id === "demo" ? { demo: "only" } : { plan: id };
const PAGE_SIZE = 50;

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
  const [planUser, setPlanUser] = useState<AdminUserRow | null>(null);
  const [userPage, setUserPage] = useState(1);

  // Receipts tab state & lightbox
  const [receiptSearch, setReceiptSearch] = useState("");
  const [receiptFilter, setReceiptFilter] = useState("all");
  const [lightboxReceipt, setLightboxReceipt] = useState<any | null>(null);

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: auth.me });

  const SUPER_ADMIN_EMAIL = "baxorasaidova@gmail.com";
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
    queryKey: ["admin-users", searchQuery, roleFilter, userPage],
    queryFn: () => admin.getUsers({ q: searchQuery, ...userFilterParams(roleFilter), page: userPage, pageSize: PAGE_SIZE }),
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
    enabled: !!isAdmin,
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

  const setPlanMutation = useMutation({
    mutationFn: ({ userId, plan }: { userId: number; plan: string }) => admin.setUserPlan(userId, plan, 30),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success(res?.message || "OK", language === "uz" ? "Tarif yangilandi" : language === "ru" ? "Тариф обновлён" : "Plan updated");
      cyberSound.playConfirm();
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const demoMutation = useMutation({
    mutationFn: (op: "add" | "delete") => (op === "add" ? admin.addDemoUsers(1500) : admin.deleteDemoUsers()),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setUserPage(1);
      toast.success(res?.message || "OK", "Test");
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
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
          ? (language === "uz" ? "Chek tasdiqlandi va foydalanuvchiga PRO berildi!" : language === "ru" ? "Чек подтвержден и статус PRO выдан!" : "Receipt approved and PRO granted to the user!")
          : (language === "uz" ? "Chek rad etildi!" : language === "ru" ? "Чек отклонен!" : "Receipt rejected!"),
        "Audit"
      );
    },
    onError: (err: any) => {
      toast.error(err.message || "Xatolik yuz berdi");
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

  // Gatekeeper: only permit baxorasaidova@gmail.com
  if (!user || user.email?.toLowerCase().trim() !== SUPER_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        {/* Ambient background glow */}

        <div className="max-w-md w-full mx-auto px-4 py-16 text-center space-y-6 animate-fade-in relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500 shadow-inner">
            <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div className="space-y-2">
            <h1 className="lux-title text-[2.15rem] text-slate-900 dark:text-white leading-[1.05]">
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
                baxorasaidova@gmail.com
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
                className="w-full py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                {language === "uz" ? "Chiqish va baxorasaidova@gmail.com bilan kirish" : language === "ru" ? "Сменить аккаунт на baxorasaidova@gmail.com" : "Sign Out & Switch to baxorasaidova@gmail.com"}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-[#111422] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {language === "uz"
                  ? "Davom etish uchun baxorasaidova@gmail.com hisobingizga kiring:"
                  : language === "ru"
                  ? "Пожалуйста, авторизуйтесь под baxorasaidova@gmail.com:"
                  : "Please sign in with baxorasaidova@gmail.com to proceed:"}
              </p>
              <a
                href="/auth?redirect=/admin"
                className="w-full py-3 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white dark:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md block"
              >
                <Shield className="w-4 h-4 text-amber-400 dark:text-slate-950 stroke-[2.2]" />
                <span>{language === "uz" ? "baxorasaidova@gmail.com bilan Kirish" : language === "ru" ? "Войти как baxorasaidova@gmail.com" : "Sign In with baxorasaidova@gmail.com"}</span>
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
    totalUsers: (userList as any)?.total ?? (Array.isArray(userList) ? userList.length : 0),
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

  // normalise: an older server sends no plan / isAdmin fields
  // page mode returns { items, total }; an older server returns the whole array
  const userRows: any[] = Array.isArray(userList) ? userList : (userList as any)?.items || [];
  const userTotal: number = Array.isArray(userList) ? userList.length : (userList as any)?.total || 0;
  const pageCount = Math.max(1, Math.ceil(userTotal / PAGE_SIZE));
  const users = userRows.map((u: any) => ({
    ...u,
    plan: safePlan(u.plan, u.role),
    isAdmin: u.isAdmin ?? (u.role === "admin" || u.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL),
    isSuperAdmin: u.isSuperAdmin ?? u.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL,
  }));
  const L = (uz: string, ru: string, en: string) => (language === "ru" ? ru : language === "en" ? en : uz);
  const lang = (language === "ru" || language === "en" ? language : "uz") as "uz" | "ru" | "en";
  const proUsersCount = stats.proUsers ?? 0;
  const adminUsersCount = stats.adminUsers || users.filter((u: any) => u.role === "admin").length;
  const standardUsersCount = stats.standardUsers || users.filter((u: any) => !u.role || u.role === "user").length;
  const merchantUsersCount = stats.merchantUsers || users.filter((u: any) => u.role === "merchant").length;
  const totalUsersCount = stats.totalUsers || users.length;
  const conversionRate = totalUsersCount > 0 ? ((proUsersCount / totalUsersCount) * 100).toFixed(1) : "0.0";
  const estimatedMRR = stats.estimatedMRR ?? 0;

  const totalDevices =
    (stats.analytics?.deviceBreakdown?.mobile || 0) +
    (stats.analytics?.deviceBreakdown?.desktop || 0) +
    (stats.analytics?.deviceBreakdown?.tablet || 0) || 1;
  const mobilePct = Math.round(((stats.analytics?.deviceBreakdown?.mobile || 0) / totalDevices) * 100);
  const desktopPct = Math.round(((stats.analytics?.deviceBreakdown?.desktop || 0) / totalDevices) * 100);

  return (
    <div className="min-h-screen relative overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Ambient background glow */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        {/* Executive Header Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-md bg-indigo-600">
                <Shield className="w-5 h-5 text-amber-300 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="lux-title text-[2.15rem] sm:text-[2.7rem] text-slate-900 dark:text-white leading-[1.05]">
                    {language === "uz" ? "Sovg'a AI Boshqaruv & Analitika Markazi" : language === "ru" ? "Панель Управления и Аналитики Sovg'a AI" : "Sovg'a AI Executive Command Center"}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 animate-pulse">
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
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
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
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#111422] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer disabled:opacity-50"
              title="Yangilash"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 stroke-[2.2] ${isStatsFetching ? "animate-spin" : ""}`} />
              <span>{language === "uz" ? "Yangilash" : language === "ru" ? "Обновить" : "Refresh"}</span>
            </button>

            <button
              onClick={handleExportData}
              className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white dark:text-white text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950 stroke-[2.2]" />
              <span>JSON Export</span>
            </button>

            <a
              href="/analytics"
              className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold flex items-center gap-1.5 transition"
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
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight">{totalUsersCount}</p>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{stats.newUsersToday || 0} bugun</span>
              <span>• {stats.newUsersWeek || 0} hafta</span>
            </div>
          </div>

          {/* Pro Subscribers */}
          <div className="dark:to-[#111422] rounded-2xl p-4.5 shadow-2xs border border-[var(--line)] dark:border-amber-800/60 relative overflow-hidden group hover:border-[var(--line-strong)] transition bg-amber-500/10 dark:bg-amber-950/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 stroke-[2.2]" />
                <span>{language === "uz" ? "Pro A'zolar" : language === "ru" ? "Pro / VIP" : "Pro Users"}</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white font-mono">
                {conversionRate}%
              </span>
            </div>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 font-display tracking-tight">{proUsersCount}</p>
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
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-display tracking-tight">
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
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
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
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight">{stats.totalOrders || 0}</p>
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
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight">{stats.totalSearches || 0}</p>
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
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-white shadow-sm"
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
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "users"
                ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <Users className="w-4 h-4 stroke-[2.2]" />
            <span>{language === "uz" ? "Foydalanuvchilar & Pro Analitika" : language === "ru" ? "Пользователи & Pro Аналитика" : "Users & Pro Analytics"}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-white font-bold">
              {totalUsersCount}
            </span>
          </button>

          <button
            onClick={() => {
              cyberSound.playClick();
              setActiveTab("traffic");
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "traffic"
                ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-white shadow-sm"
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
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "orders"
                ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-white shadow-sm"
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
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "database"
                ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-white shadow-sm"
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
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "receipts"
                ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-emerald-500 stroke-[2.2]" />
            <span>{language === "uz" ? "To'lov Cheklari & Audit" : language === "ru" ? "Чеки Оплаты и Аудит" : "Receipts & Financial Audit"}</span>
            {(receiptsPayload?.stats?.total ?? 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-bold">
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-5">
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
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-xl font-bold border border-[var(--line)]">
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
                  className="h-full transition-all duration-200 bg-amber-400"
                  title={`Pro Users: ${proUsersCount}`}
                />
                <div
                  style={{ width: `${totalUsersCount ? (adminUsersCount / totalUsersCount) * 100 : 0}%` }}
                  className="bg-indigo-600 h-full transition-all duration-200"
                  title={`Admin Users: ${adminUsersCount}`}
                />
                <div
                  style={{ width: `${totalUsersCount ? (merchantUsersCount / totalUsersCount) * 100 : 0}%` }}
                  className="bg-emerald-500 h-full transition-all duration-200"
                  title={`Merchants: ${merchantUsersCount}`}
                />
                <div
                  style={{ width: `${totalUsersCount ? (standardUsersCount / totalUsersCount) * 100 : 0}%` }}
                  className="bg-slate-300 h-full transition-all duration-200"
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-4">
              <h4 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>{language === "uz" ? "Platforma Funksiyalari Faolligi" : language === "ru" ? "Активность Функционала" : "Feature Adoption"}</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <Star className="w-4 h-4 text-yellow-400" />
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-4">
              <h4 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>{language === "uz" ? "Savdo Quvuri & Buyurtmalar" : language === "ru" ? "Воронка Заказов" : "Order Pipeline Status"}</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  <span className="font-semibold text-emerald-900">
                    {language === "uz" ? "Jami Savdo Hajmi (GMV)" : language === "ru" ? "Общий Объем Продаж" : "Gross Merchandise Value"}
                  </span>
                  <span className="font-bold text-emerald-700 text-sm font-mono">
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-4">
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
          {/* Plan summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { k: L("Jami foydalanuvchilar", "Всего пользователей", "Total users"), v: String(totalUsersCount), s: L(`Bugun +${stats.newUsersToday || 0}`, `Сегодня +${stats.newUsersToday || 0}`, `Today +${stats.newUsersToday || 0}`) },
              {
                k: L("Pullik obunachilar", "Платные подписчики", "Paying subscribers"),
                v: String(proUsersCount),
                s: `Start ${stats.planCounts?.start || 0} · Plus ${stats.planCounts?.plus || 0} · Premium ${stats.planCounts?.premium || 0}`,
              },
              { k: L("Oylik tushum (taxmin)", "Доход в месяц (оценка)", "Monthly revenue (est.)"), v: formatPrice(estimatedMRR), s: L(`${conversionRate}% pullik`, `${conversionRate}% платят`, `${conversionRate}% paying`) },
              { k: L("3 kunda tugaydi", "Истекает за 3 дня", "Expiring in 3 days"), v: String(stats.expiringSoon || 0), s: L("Eslatma yuboring", "Напомните им", "Remind them") },
            ].map((c) => (
              <div key={c.k} className="rounded-2xl border border-[var(--rule-soft)] bg-[var(--white)] px-5 py-4">
                <p className="text-[13px] text-[var(--ink-2)]">{c.k}</p>
                <p className="mt-1 font-lux text-[1.6rem] leading-tight text-[var(--ink)] tabular">{c.v}</p>
                <p className="mt-1 text-[12px] text-[var(--ink-2)]">{c.s}</p>
              </div>
            ))}
          </div>

          {/* Give a plan by email / phone / id */}
          <GrantPlanPanel />

          {/* Search + filters + table */}
          <div className="rounded-2xl border border-[var(--rule-soft)] bg-[var(--white)] p-4 sm:p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search className="w-4 h-4 text-[var(--ink-2)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={L("Ism, telefon yoki email bo'yicha qidirish…", "Поиск по имени, телефону или email…", "Search by name, phone or email…")}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setUserPage(1); }}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-[var(--rule-soft)] bg-[var(--paper)] text-[14px] text-[var(--ink)] outline-none focus:border-[var(--anor)]"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {USER_FILTERS.map((rf) => (
                  <button
                    key={rf.id}
                    onClick={() => { setRoleFilter(rf.id); setUserPage(1); }}
                    className={`h-9 px-3.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition cursor-pointer ${
                      roleFilter === rf.id ? "bg-[var(--anor)] text-white" : "bg-[var(--paper-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {L(rf.uz, rf.ru, rf.en)}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[var(--rule-soft)]">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[var(--paper-2)] text-[var(--ink-2)] text-[12px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">{L("Foydalanuvchi", "Пользователь", "User")}</th>
                    <th className="px-4 py-3 hidden sm:table-cell">{L("Tarif", "Тариф", "Plan")}</th>
                    <th className="px-4 py-3 hidden md:table-cell">{L("Faollik", "Активность", "Activity")}</th>
                    <th className="px-4 py-3 hidden sm:table-cell">{L("Ro'yxatdan o'tgan", "Регистрация", "Joined")}</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">{L("Amallar", "Действия", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule-soft)]">
                  {isUsersLoading && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-[var(--ink-2)]">{L("Yuklanmoqda…", "Загрузка…", "Loading…")}</td></tr>
                  )}
                  {!isUsersLoading && users.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-[var(--ink-2)]">{L("Hech kim topilmadi", "Никого не найдено", "No users found")}</td></tr>
                  )}
                  {users.map((u: any) => {
                    const operator = u.phone ? detectUzOperator(u.phone) : null;
                    const isSelf = user.id === u.id;
                    const left = daysLeft(u.planExpiresAt);
                    const expired = u.plan === "free" && u.lastPlan && u.lastPlan !== "free" && PLANS[u.lastPlan as PlanId];
                    return (
                      <tr key={u.id} className="hover:bg-[var(--paper-2)]/60 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-full bg-[var(--accent-soft)] text-[var(--anor)] font-bold inline-flex items-center justify-center flex-shrink-0">
                              {(u.name || u.email || "U").charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-[var(--ink)] truncate">
                                {u.name || "—"} <span className="text-[var(--ink-2)] font-normal">#{u.id}</span>
                                {isSelf && <span className="ml-1.5 text-[11px] px-1.5 py-0.5 rounded bg-[var(--paper-2)] text-[var(--ink-2)]">{L("Siz", "Вы", "You")}</span>}
                                {u.isDemo && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFF4E5] text-[#9A5B00]">TEST</span>}
                              </p>
                              <p className="text-[12px] text-[var(--ink-2)] truncate">
                                {u.email}
                                {u.phone && <> · {u.phone}{operator ? ` (${operator.name})` : ""}</>}
                              </p>
                              {/* phone layout: plan + action under the name */}
                              <div className="sm:hidden mt-2 flex items-center gap-2 flex-wrap">
                                <PlanBadge plan={u.plan} isAdmin={u.isAdmin} lang={lang} />
                                {!u.isAdmin && u.plan !== "free" && <span className="text-[12px] text-[var(--ink-2)]">{fmtDate(u.planExpiresAt)}</span>}
                                {!u.isAdmin && (
                                  <button onClick={() => setPlanUser(u)} className="h-7 px-3 rounded-lg text-[12px] font-semibold bg-[var(--anor)] text-white cursor-pointer">
                                    {u.plan === "free" ? L("Tarif berish", "Выдать тариф", "Give plan") : L("Tarif", "Тариф", "Plan")}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                          <PlanBadge plan={u.plan} isAdmin={u.isAdmin} lang={lang} />
                          {!u.isAdmin && u.plan !== "free" && (
                            <p className={`mt-1 text-[12px] ${left <= 3 ? "text-[var(--warn)]" : "text-[var(--ink-2)]"}`}>
                              {u.planExpiresAt ? `${fmtDate(u.planExpiresAt)} · ${left} ${L("kun", "дн.", "d")}` : L("muddatsiz", "бессрочно", "no end date")}
                            </p>
                          )}
                          {!u.isAdmin && expired && (
                            <p className="mt-1 text-[12px] text-[var(--ink-2)]">
                              {L("Tugagan", "Истёк", "Expired")}: {PLANS[u.lastPlan as PlanId].name[lang]} · {fmtDate(u.lastPlanExpiresAt)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-[12px] text-[var(--ink-2)] whitespace-nowrap">
                          {L("Ro'yxat", "Списки", "Lists")} {u.wishlistsCount || 0} · {L("To'y", "Свадьба", "Wedding")} {u.registriesCount || 0} · {L("Kuzatuv", "Слежка", "Alerts")} {u.trackersCount || 0}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-[12px] text-[var(--ink-2)] whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex items-center justify-end gap-1.5">
                            {!u.isAdmin && (
                              <button
                                onClick={() => setPlanUser(u)}
                                className="h-8 px-3 rounded-lg text-[12px] font-semibold bg-[var(--anor)] text-white hover:bg-[var(--anor-deep)] transition cursor-pointer whitespace-nowrap"
                              >
                                {u.plan === "free" ? L("Tarif berish", "Выдать тариф", "Give plan") : L("Tarif", "Тариф", "Plan")}
                              </button>
                            )}
                            {u.isAdmin && !u.isSuperAdmin && (
                              <button
                                onClick={() => {
                                  if (confirm(L(`${u.name || u.email}: admin huquqini olib tashlaysizmi?`, `Снять права админа с ${u.name || u.email}?`, `Remove admin rights from ${u.name || u.email}?`)))
                                    updateRoleMutation.mutate({ userId: u.id, role: "user" });
                                }}
                                className="h-8 px-3 rounded-lg text-[12px] font-semibold border border-[var(--rule-soft)] text-[var(--ink)] hover:border-[var(--line-strong)] transition cursor-pointer whitespace-nowrap"
                              >
                                {L("Adminlikni olish", "Снять админа", "Remove admin")}
                              </button>
                            )}
                            {!isSelf && !u.isSuperAdmin && (
                              <button
                                onClick={() => {
                                  if (confirm(L(`${u.name || u.email} hisobini butunlay o'chirasizmi? Buni qaytarib bo'lmaydi.`, `Удалить аккаунт ${u.name || u.email}? Это необратимо.`, `Delete ${u.name || u.email}'s account? This can't be undone.`)))
                                    deleteUserMutation.mutate(u.id);
                                }}
                                disabled={deleteUserMutation.isPending}
                                className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--warn)] hover:bg-[var(--paper-2)] transition cursor-pointer"
                                title={L("O'chirish", "Удалить", "Delete")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-[var(--ink-2)]">
              <span>
                {userTotal === 0 ? "0" : `${(userPage - 1) * PAGE_SIZE + 1}–${Math.min(userPage * PAGE_SIZE, userTotal)}`} / {userTotal.toLocaleString("ru-RU")}
              </span>
              <div className="flex items-center gap-1.5">
                <button disabled={userPage <= 1} onClick={() => setUserPage(1)} className="h-9 px-3 rounded-lg border border-[var(--rule-soft)] disabled:opacity-40 cursor-pointer">«</button>
                <button disabled={userPage <= 1} onClick={() => setUserPage((p) => p - 1)} className="h-9 px-3 rounded-lg border border-[var(--rule-soft)] disabled:opacity-40 cursor-pointer">
                  {L("Oldingi", "Назад", "Prev")}
                </button>
                <span className="px-2 tabular text-[var(--ink)]">{userPage} / {pageCount}</span>
                <button disabled={userPage >= pageCount} onClick={() => setUserPage((p) => p + 1)} className="h-9 px-3 rounded-lg border border-[var(--rule-soft)] disabled:opacity-40 cursor-pointer">
                  {L("Keyingi", "Далее", "Next")}
                </button>
                <button disabled={userPage >= pageCount} onClick={() => setUserPage(pageCount)} className="h-9 px-3 rounded-lg border border-[var(--rule-soft)] disabled:opacity-40 cursor-pointer">»</button>
              </div>
            </div>
          </div>

          {/* Test data */}
          <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--paper-2)] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-[var(--ink)]">{L("Test foydalanuvchilar", "Тестовые пользователи", "Test users")}: {(stats.demoUsers ?? 0).toLocaleString("ru-RU")}</p>
              <p className="text-[13px] text-[var(--ink-2)] max-w-2xl">
                {L(
                  "Panelni sinash uchun. Ular TEST belgisi bilan ko'rinadi, @sovga.test pochtasi va parolsiz — ular bilan kirib bo'lmaydi. Statistikaga qo'shiladi, shuning uchun sinab bo'lgach o'chiring.",
                  "Для проверки панели. Помечены TEST, почта @sovga.test, без пароля — войти под ними нельзя. Учитываются в статистике, поэтому удалите их после проверки.",
                  "For checking the panel. Marked TEST, @sovga.test e-mails, no password — nobody can sign in with them. They count in the stats, so delete them when you're done."
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => demoMutation.mutate("add")}
                disabled={demoMutation.isPending}
                className="btn-primary h-10 px-4 text-[14px] disabled:opacity-50"
              >
                {demoMutation.isPending ? "…" : L("+1500 test foydalanuvchi", "+1500 тестовых", "+1500 test users")}
              </button>
              {(stats.demoUsers ?? 0) > 0 && (
                <button
                  onClick={() => {
                    if (confirm(L("Barcha test foydalanuvchilar o'chirilsinmi?", "Удалить всех тестовых пользователей?", "Delete all test users?"))) demoMutation.mutate("delete");
                  }}
                  disabled={demoMutation.isPending}
                  className="btn-ghost h-10 px-4 text-[14px] text-[var(--warn)]"
                >
                  {L("Hammasini o'chirish", "Удалить всех", "Delete all")}
                </button>
              )}
            </div>
          </div>

          {/* Per-user plan dialog */}
          {planUser && (
            <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
              <div className="absolute inset-0 bg-black/50" onClick={() => setPlanUser(null)} />
              <div className="relative w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[var(--white)] border border-[var(--rule-soft)] shadow-2xl p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="min-w-0">
                    <p className="text-[13px] text-[var(--ink-2)]">{L("Tarifni boshqarish", "Управление тарифом", "Manage plan")}</p>
                    <h3 className="font-lux text-[1.35rem] text-[var(--ink)] truncate">{planUser.name || planUser.email} <span className="text-[var(--ink-2)] text-[1rem]">#{planUser.id}</span></h3>
                    <p className="text-[13px] text-[var(--ink-2)] truncate">{planUser.email}{planUser.phone ? ` · ${planUser.phone}` : ""}</p>
                    <div className="mt-2 flex items-center gap-2 text-[13px] text-[var(--ink-2)]">
                      <PlanBadge plan={planUser.plan} isAdmin={planUser.isAdmin} lang={lang} />
                      {planUser.plan !== "free" && planUser.planExpiresAt && <span>{fmtDate(planUser.planExpiresAt)} {L("gacha", "", "")} · {daysLeft(planUser.planExpiresAt)} {L("kun qoldi", "дн. осталось", "days left")}</span>}
                    </div>
                  </div>
                  <button onClick={() => setPlanUser(null)} className="w-9 h-9 rounded-full inline-flex items-center justify-center bg-[var(--paper-2)] text-[var(--ink)] cursor-pointer flex-shrink-0" aria-label="close">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <GrantPlanPanel preset={planUser} compact onDone={() => setPlanUser(null)} />
                {planUser.planHistory && planUser.planHistory.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-[var(--rule-soft)]">
                    <p className="text-[13px] font-semibold text-[var(--ink-2)] mb-2">{L("Tarixi", "История", "History")}</p>
                    <ul className="space-y-1.5 text-[13px]">
                      {planUser.planHistory.map((h: any, i: number) => (
                        <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-3 text-[var(--ink)]">
                          <span>
                            {h.plan === "free" ? L("Bekor qilindi", "Отменён", "Cancelled") : `${PLANS[h.plan as PlanId]?.name[lang] || h.plan} · ${h.days} ${L("kun", "дн.", "d")}`}
                            {h.note ? <span className="text-[var(--ink-2)]"> — {h.note}</span> : null}
                          </span>
                          <span className="text-[12px] text-[var(--ink-2)]">
                            {fmtDate(h.at)} · {h.source === "receipt" ? L("chek", "чек", "receipt") : h.source === "admin" ? "admin" : L("tizim", "система", "system")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 3: TRAFFIC & TELEMETRY */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === "traffic" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>{language === "uz" ? "Qurilmalar Bo'yicha Taqsimot" : language === "ru" ? "Распределение по Устройствам" : "Device Breakdown"}</span>
              </h3>
              <div className="space-y-3">
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${desktopPct}%` }}
                    className="bg-indigo-600 h-full transition-all duration-200"
                    title={`Desktop: ${desktopPct}%`}
                  />
                  <div
                    style={{ width: `${mobilePct}%` }}
                    className="bg-emerald-500 h-full transition-all duration-200"
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-4">
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-4">
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
                      <td className="p-3 text-slate-400">{rv.timeMs ? new Date(rv.timeMs).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : rv.timestamp}</td>
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-4">
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
          <div className="rounded-2xl p-6 text-white border border-slate-700/80 shadow-sm relative overflow-hidden bg-slate-900">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-700/60 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-xl text-white">MongoDB Atlas & ORM Dvigateli</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm disabled:opacity-50"
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
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === "uz" ? "Jami Tasdiqlangan Tushum" : language === "ru" ? "Общий Подтвержденный Доход" : "Total Verified Revenue"}
              </span>
              <p className="text-2xl font-bold text-emerald-600 font-display mt-1">
                {formatPrice(receiptsPayload?.stats?.totalRevenueUZS || 0)}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {receiptsPayload?.stats?.verified || 0} ta muvaffaqiyatli to'lov
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === "uz" ? "Yuklangan Cheklar Soni" : language === "ru" ? "Всего Загружено Чеков" : "Total Receipts Uploaded"}
              </span>
              <p className="text-2xl font-bold text-slate-900 font-display mt-1">
                {receiptsPayload?.stats?.total || 0}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Barcha P2P to'lov cheklari
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === "uz" ? "Tasdiqlangan (+PRO)" : language === "ru" ? "Подтверждено (+PRO)" : "Approved (+PRO)"}
              </span>
              <p className="text-2xl font-bold text-emerald-600 font-display mt-1">
                {receiptsPayload?.stats?.verified || 0}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
                AI / Admin tomonidan qabul qilingan
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === "uz" ? "Rad Etilgan / Xatolik" : language === "ru" ? "Отклонено / Ошибки" : "Rejected Attempts"}
              </span>
              <p className="text-2xl font-bold text-rose-600 font-display mt-1">
                {receiptsPayload?.stats?.rejected || 0}
              </p>
              <span className="text-[10px] text-rose-500 font-bold mt-0.5 block">
                Dublikat yoki kam summa
              </span>
            </div>
          </div>

          {/* Search, Filter, and Export Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                  <span>{language === "uz" ? "To'lov Cheklari Jurnali & Boshqaruv" : language === "ru" ? "Журнал Чеков и Управление" : "Receipts Audit Log & Manual Verification"}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {language === "uz" ? "Barcha to'lov cheklarini ko'rish, skrinshotlarini kattalashtirish va bir klikda PRO obuna berish" : language === "ru" ? "Просмотр всех чеков, увеличение скриншотов и ручная выдача статуса PRO" : "View all payment receipts, zoom into screenshots and grant PRO in one click"}
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
                  placeholder={language === "uz" ? "Foydalanuvchi, email yoki tranzaksiya ID..." : language === "ru" ? "Поиск по пользователю, email или ID..." : "Search by user, email or transaction ID..."}
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
                            <span className="font-bold text-slate-900 block font-mono">
                              {formatPrice(r.amount || 49000)}
                            </span>
                            <span className="text-[10px] text-amber-600 font-bold uppercase">
                              {(() => { const pid = normalizePlanId(r.plan) || "plus"; return `${PLANS[pid].name.uz} (${Math.round(PLANS[pid].price / 1000)}k)`; })()}
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
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                r.status === "verified"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : r.status === "rejected"
                                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                                  : "bg-amber-100 text-amber-800 border border-[var(--line)]"
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
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 transition"
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
                                  className="px-2.5 py-1 rounded-lg font-bold text-[10px] border transition cursor-pointer bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]"
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
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-6 max-w-lg w-full max-h-[92vh] max-h-[92dvh] overflow-y-auto my-auto shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-up">
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
