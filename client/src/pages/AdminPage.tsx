import { PLANS, normalizePlanId, type PlanId } from "@shared/plans";
import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  ShieldAlert,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Crown,
  Shield,
  Trash2,
  Activity,
  Filter,
  Eye,
  Smartphone,
  Monitor,
  Download,
  ChevronDown,
  Sparkles,
  UserCheck,
  Check,
  TrendingUp,
  CreditCard,
  Layers,
  ArrowUpRight,
  FileCheck2,
  X,
  ArrowRight,
} from "../lib/icons";
import { AdminCard, CardTitle, StatCard, Pill, MetricRow, tableWrap, theadCls, tbodyCls, rowCls } from "../components/admin/AdminUi";

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
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-[var(--rose-soft)] text-[var(--rose)] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="font-lux text-[1.75rem] text-[var(--ink)] leading-tight">
              {language === "uz" ? "Cheklangan Hudud (Super Admin)" : language === "ru" ? "Доступ Ограничен (Super Admin)" : "Restricted Area (Super Admin)"}
            </h1>
            <p className="text-[var(--ink-2)] text-[14px]">
              {language === "uz"
                ? "Ushbu analitika va boshqaruv paneliga faqat quyidagi tasdiqlangan boshqaruvchi hisobi orqali kirish mumkin:"
                : language === "ru"
                ? "Данная панель аналитики и управления доступна исключительно для учетной записи:"
                : "This telemetry and executive command center is exclusively restricted to:"}
            </p>
            <div className="py-2">
              <span className="font-mono text-[13px] font-medium px-3 py-1.5 rounded-xl bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--rule-soft)] inline-block">
                baxorasaidova@gmail.com
              </span>
            </div>
          </div>

          {user ? (
            <div className="p-5 bg-[var(--white)] border border-[var(--rule-soft)] rounded-2xl text-left space-y-3">
              <div className="text-[13px] text-[var(--ink-2)]">
                {language === "uz" ? "Siz hozirda quyidagi hisobdasiz:" : language === "ru" ? "Вы авторизованы как:" : "You are currently signed in as:"}
                <div className="font-semibold text-[var(--ink)] truncate mt-0.5">{user.email}</div>
              </div>
              <button
                onClick={async () => {
                  await auth.logout();
                  queryClient.invalidateQueries({ queryKey: ["me"] });
                  toast.info(language === "uz" ? "Tizimdan chiqildi" : language === "ru" ? "Вы вышли из системы" : "Signed out");
                }}
                className="btn-ghost w-full h-11 text-[14px]"
              >
                {language === "uz" ? "Chiqish va baxorasaidova@gmail.com bilan kirish" : language === "ru" ? "Сменить аккаунт на baxorasaidova@gmail.com" : "Sign Out & Switch to baxorasaidova@gmail.com"}
              </button>
            </div>
          ) : (
            <div className="p-5 bg-[var(--white)] border border-[var(--rule-soft)] rounded-2xl space-y-3">
              <p className="text-[13px] text-[var(--ink-2)]">
                {language === "uz"
                  ? "Davom etish uchun baxorasaidova@gmail.com hisobingizga kiring:"
                  : language === "ru"
                  ? "Пожалуйста, авторизуйтесь под baxorasaidova@gmail.com:"
                  : "Please sign in with baxorasaidova@gmail.com to proceed:"}
              </p>
              <a href="/auth?redirect=/admin" className="btn-primary w-full h-11 text-[14px]">
                <Shield className="w-4 h-4" />
                <span>{language === "uz" ? "baxorasaidova@gmail.com bilan Kirish" : language === "ru" ? "Войти как baxorasaidova@gmail.com" : "Sign In with baxorasaidova@gmail.com"}</span>
              </a>
            </div>
          )}

          <p className="text-[12px] text-[var(--muted)]">
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

  const ADMIN_TABS: { id: AdminTab; icon: ReactNode; label: string; count?: number | null }[] = [
    { id: "overview", icon: <BarChart2 className="w-4 h-4" />, label: L("Umumiy ko'rinish", "Обзор", "Overview") },
    { id: "users", icon: <Users className="w-4 h-4" />, label: L("Foydalanuvchilar & Pro", "Пользователи & Pro", "Users & Pro"), count: totalUsersCount },
    { id: "traffic", icon: <Activity className="w-4 h-4" />, label: L("Trafik", "Трафик", "Traffic") },
    { id: "orders", icon: <ShoppingBag className="w-4 h-4" />, label: L("Buyurtmalar", "Заказы", "Orders"), count: stats.totalOrders || 0 },
    { id: "database", icon: <Database className="w-4 h-4" />, label: L("Ma'lumotlar bazasi", "База данных", "Database") },
    {
      id: "receipts",
      icon: <FileCheck2 className="w-4 h-4" />,
      label: L("Cheklar & audit", "Чеки и аудит", "Receipts & audit"),
      count: (receiptsPayload?.stats?.total ?? 0) > 0 ? receiptsPayload?.stats?.total : null,
    },
  ];

  const quietBtn = "btn-ghost h-10 px-3.5 text-[13px] whitespace-nowrap";

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <div className="wrap py-6 sm:py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-x-6 gap-y-3 lg:items-center">
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="font-lux text-[1.6rem] sm:text-[1.85rem] leading-tight text-[var(--ink)]">
              {L("Admin panel", "Админ-панель", "Admin panel")}
            </h1>
            <Pill tone="ok">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)]" />
              {language === "uz" ? "Jonli" : language === "ru" ? "Онлайн" : "Live"}
            </Pill>
          </div>
          <p className="lg:col-span-2 -mt-1 lg:-mt-2 text-[14px] text-[var(--ink-2)]">
            {language === "uz"
              ? "Platforma foydalanuvchilari, Pro obunalar, jonli tashriflar telemetriyasi va buyurtmalar quvuri"
              : language === "ru"
              ? "Пользователи, Pro-подписчики, мониторинг визитов в реальном времени и поток заказов"
              : "Platform users, Pro subscriptions, real-time visitor telemetry, and direct checkout pipeline"}
          </p>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 lg:col-start-2 lg:row-start-1">
            <button onClick={() => setAutoRefresh(!autoRefresh)} aria-pressed={autoRefresh} className={quietBtn}>
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-[var(--ok)]" : "bg-[var(--muted)]"}`} />
              <span>{autoRefresh ? "Auto (8s) ON" : "Auto OFF"}</span>
            </button>

            <button onClick={handleManualRefresh} disabled={isStatsFetching} className={`${quietBtn} disabled:opacity-50`} title={L("Yangilash", "Обновить", "Refresh")}>
              <RefreshCw className={`w-4 h-4 text-[var(--ink-2)] ${isStatsFetching ? "animate-spin" : ""}`} />
              <span>{language === "uz" ? "Yangilash" : language === "ru" ? "Обновить" : "Refresh"}</span>
            </button>

            <button onClick={handleExportData} className={quietBtn}>
              <Download className="w-4 h-4 text-[var(--ink-2)]" />
              <span>JSON Export</span>
            </button>

            <a href="/analytics" className={quietBtn}>
              <Activity className="w-4 h-4 text-[var(--anor)]" />
              <span>{language === "uz" ? "Trafik oyna" : language === "ru" ? "Экран трафика" : "Traffic screen"}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--ink-2)]" />
            </a>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            label={language === "uz" ? "Jami A'zolar" : language === "ru" ? "Всего Пользователей" : "Total Users"}
            value={totalUsersCount}
            sub={
              <>
                <span className="text-[var(--ok)] font-semibold">+{stats.newUsersToday || 0} {L("bugun", "сегодня", "today")}</span>
                <span> · {stats.newUsersWeek || 0} {L("hafta", "за неделю", "this week")}</span>
              </>
            }
          />
          <StatCard
            label={language === "uz" ? "Pro A'zolar" : language === "ru" ? "Pro / VIP" : "Pro Users"}
            value={proUsersCount}
            badge={<Pill tone="blue" className="tabular !h-5 !px-2">{conversionRate}%</Pill>}
            sub={<span title={`Oylik Pro daromad: ${formatPrice(estimatedMRR)}`}>MRR: {formatPrice(estimatedMRR)}</span>}
          />
          <StatCard
            label={language === "uz" ? "Jonli Tashriflar" : language === "ru" ? "Онлайн Сейчас" : "Live Active"}
            value={stats.analytics?.liveActiveUsers || 1}
            sub={
              <span className="inline-flex items-center gap-1.5 text-[var(--ok)] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)]" />
                {L("Real vaqtda", "В реальном времени", "Real-time stream")}
              </span>
            }
          />
          <StatCard
            label={language === "uz" ? "Sahifa Ko'rishlar" : language === "ru" ? "Просмотры" : "Page Views"}
            value={stats.analytics?.totalVisits || 1}
            sub={<>{L("Bugun", "Сегодня", "Today")}: <span className="font-semibold text-[var(--ink)]">{stats.analytics?.todayVisits || 1}</span></>}
          />
          <StatCard
            label={language === "uz" ? "Buyurtmalar" : language === "ru" ? "Заказы" : "Orders (GMV)"}
            value={stats.totalOrders || 0}
            sub={formatPrice(stats.totalRevenueUZS || 0)}
          />
          <StatCard
            label={language === "uz" ? "AI Qidiruvlar" : language === "ru" ? "AI Запросы" : "AI Searches"}
            value={stats.totalSearches || 0}
            sub={<>{L("Taxminiy xarajat", "Оценка затрат", "Est. cost")}: ${stats.apiUsage?.estimatedCostUsd || "0.00"}</>}
          />
        </div>

        {/* Tabs — scroll sideways on phones */}
        <div className="-mx-6 sm:mx-0 overflow-x-auto no-scrollbar border-b border-[var(--rule-soft)]">
          <nav aria-label="Admin sections" className="flex w-max items-center gap-1 px-6 sm:px-0 pb-3">
            {ADMIN_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    cyberSound.playClick();
                    setActiveTab(tab.id);
                  }}
                  aria-current={active ? "page" : undefined}
                  className={`h-10 px-4 rounded-full text-[14px] font-semibold inline-flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                    active ? "bg-[var(--anor)] text-white" : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--paper-2)]"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count != null && (
                    <span
                      className={`h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-semibold inline-flex items-center justify-center tabular ${
                        active ? "bg-white/20 text-white" : "bg-[var(--accent-soft)] text-[var(--anor)]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 1: OVERVIEW & KPIS */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-4 sm:space-y-5 animate-fade-in">
          {/* User distribution & Pro metrics */}
          <AdminCard className="space-y-5">
            <CardTitle
              icon={<Users />}
              title={language === "uz" ? "A'zolar Tuzilishi va Pro Obuna Tahlili" : language === "ru" ? "Структура Пользователей и Pro Подписки" : "User Structure & Pro Subscription Conversion"}
              subtitle={
                language === "uz"
                  ? "Jami ro'yxatdan o'tgan foydalanuvchilarning rollar bo'yicha taqsimlanishi"
                  : language === "ru"
                  ? "Распределение зарегистрированных аккаунтов по тарифам и правам"
                  : "Breakdown of registered accounts across Pro, Admin, Standard, and Merchant tiers"
              }
              action={
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill tone="blue" className="tabular">
                    <Crown className="w-3.5 h-3.5" />
                    {proUsersCount} Pro / VIP ({conversionRate}%)
                  </Pill>
                  <Pill className="tabular">
                    <Shield className="w-3.5 h-3.5" />
                    {adminUsersCount} Admin
                  </Pill>
                  <Pill className="tabular">
                    <UserCheck className="w-3.5 h-3.5" />
                    {standardUsersCount} {L("Standart", "Стандарт", "Standard")}
                  </Pill>
                </div>
              }
            />

            {/* Proportion bar */}
            <div className="space-y-3">
              <div className="w-full h-3 bg-[var(--paper-2)] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${totalUsersCount ? (proUsersCount / totalUsersCount) * 100 : 0}%` }}
                  className="h-full transition-all duration-200 bg-[var(--anor)]"
                  title={`Pro Users: ${proUsersCount}`}
                />
                <div
                  style={{ width: `${totalUsersCount ? (adminUsersCount / totalUsersCount) * 100 : 0}%` }}
                  className="h-full transition-all duration-200 bg-[var(--ink-2)]"
                  title={`Admin Users: ${adminUsersCount}`}
                />
                <div
                  style={{ width: `${totalUsersCount ? (merchantUsersCount / totalUsersCount) * 100 : 0}%` }}
                  className="h-full transition-all duration-200 bg-[var(--ok)]"
                  title={`Merchants: ${merchantUsersCount}`}
                />
                <div
                  style={{ width: `${totalUsersCount ? (standardUsersCount / totalUsersCount) * 100 : 0}%` }}
                  className="h-full transition-all duration-200 bg-[var(--rule-soft)]"
                  title={`Standard Users: ${standardUsersCount}`}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] text-[var(--ink-2)]">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--anor)]" /> Pro ({proUsersCount})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--ink-2)]" /> Admin ({adminUsersCount})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--ok)]" /> Merchant ({merchantUsersCount})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--rule-soft)] ring-1 ring-inset ring-[var(--line-strong)]" /> Standard ({standardUsersCount})</span>
                </div>
                <button
                  onClick={() => setActiveTab("users")}
                  className="self-start sm:self-auto text-[var(--anor)] hover:text-[var(--anor-deep)] font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{language === "uz" ? "Barchasini boshqarish" : language === "ru" ? "Управление" : "Manage users"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </AdminCard>

          {/* Quick metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Feature usage */}
            <AdminCard>
              <CardTitle icon={<Layers />} title={language === "uz" ? "Platforma Funksiyalari Faolligi" : language === "ru" ? "Активность Функционала" : "Feature Adoption"} />
              <div className="mt-3 divide-y divide-[var(--rule-soft)]">
                <MetricRow icon={<Star />} label={language === "uz" ? "Universal Istaklar Ro'yxati" : language === "ru" ? "Списки Желаний" : "Wishlists Created"} value={stats.totalWishlists} />
                <MetricRow icon={<Heart />} label={language === "uz" ? "To'y Sovg'a Reestrlari" : language === "ru" ? "Свадебные Реестры" : "Wedding Registries"} value={stats.totalRegistries} />
                <MetricRow icon={<TrendingUp />} label={language === "uz" ? "Narx Monitoringi & Botlar" : language === "ru" ? "Мониторинг Цен" : "Price Trackers"} value={dbStatus?.collections?.priceTrackers ?? 24} />
                <MetricRow icon={<ShoppingBag />} label={language === "uz" ? "Saqlangan Mahsulotlar" : language === "ru" ? "Сохраненные Товары" : "Saved Products"} value={stats.totalSavedProducts} />
              </div>
            </AdminCard>

            {/* Order pipeline */}
            <AdminCard className="flex flex-col">
              <CardTitle icon={<CreditCard />} title={language === "uz" ? "Savdo Quvuri & Buyurtmalar" : language === "ru" ? "Воронка Заказов" : "Order Pipeline Status"} />
              <div className="mt-4 space-y-3 flex-1 flex flex-col">
                <div className="rounded-xl bg-[var(--ok-soft)] px-4 py-3">
                  <p className="text-[13px] text-[var(--ok-ink)]">
                    {language === "uz" ? "Jami Savdo Hajmi (GMV)" : language === "ru" ? "Общий Объем Продаж" : "Gross Merchandise Value"}
                  </p>
                  <p className="mt-0.5 font-lux text-[1.3rem] leading-tight text-[var(--ok-ink)] tabular">{formatPrice(stats.totalRevenueUZS || 0)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[var(--paper-2)] px-4 py-3">
                    <p className="text-[13px] text-[var(--ink-2)]">{language === "uz" ? "Yangi" : language === "ru" ? "Новые" : "Pending"}</p>
                    <p className="mt-0.5 font-lux text-[1.3rem] leading-tight text-[var(--warn)] tabular">{stats.ordersByStatus?.pending || 0}</p>
                  </div>
                  <div className="rounded-xl bg-[var(--paper-2)] px-4 py-3">
                    <p className="text-[13px] text-[var(--ink-2)]">{language === "uz" ? "Bajarilgan" : language === "ru" ? "Доставлено" : "Delivered"}</p>
                    <p className="mt-0.5 font-lux text-[1.3rem] leading-tight text-[var(--ok)] tabular">{stats.ordersByStatus?.delivered || 0}</p>
                  </div>
                </div>
                <button onClick={() => setActiveTab("orders")} className="btn-ghost h-10 w-full text-[14px] mt-auto">
                  <span>{language === "uz" ? "Buyurtmalar ro'yxatini ko'rish" : language === "ru" ? "Открыть все заказы" : "View all orders"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </AdminCard>

            {/* AI search metrics */}
            <AdminCard>
              <CardTitle icon={<Sparkles />} title={language === "uz" ? "AI Shopping Tadqiqotlari" : language === "ru" ? "AI Поиск и Grounding" : "AI Shopping Engine"} />
              <div className="mt-3 divide-y divide-[var(--rule-soft)]">
                <MetricRow label={language === "uz" ? "Jami AI So'rovlari" : language === "ru" ? "Всего AI Запросов" : "Total Queries"} value={stats.apiUsage?.totalRequests || 0} />
                <MetricRow label={language === "uz" ? "Keshdan Qaytarilgan" : language === "ru" ? "Из Кэша" : "Cached Responses"} value={stats.apiUsage?.cachedRequests || 0} valueClass="text-[var(--ok)]" />
                <MetricRow label={language === "uz" ? "O'rtacha Javob Vaqti" : language === "ru" ? "Ср. Время Ответа" : "Avg Latency"} value={`${stats.apiUsage?.avgResponseTimeMs || 0}ms`} />
              </div>
            </AdminCard>
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
          {planUser && createPortal(
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
            </div>,
            document.body
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 3: TRAFFIC & TELEMETRY */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === "traffic" && (
        <div className="space-y-4 sm:space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {/* Device breakdown */}
            <AdminCard className="space-y-5">
              <CardTitle icon={<Smartphone />} title={language === "uz" ? "Qurilmalar Bo'yicha Taqsimot" : language === "ru" ? "Распределение по Устройствам" : "Device Breakdown"} />
              <div className="space-y-3">
                <div className="w-full h-3 bg-[var(--paper-2)] rounded-full overflow-hidden flex">
                  <div style={{ width: `${desktopPct}%` }} className="bg-[var(--anor)] h-full transition-all duration-200" title={`Desktop: ${desktopPct}%`} />
                  <div style={{ width: `${mobilePct}%` }} className="bg-[var(--ok)] h-full transition-all duration-200" title={`Mobile: ${mobilePct}%`} />
                </div>
                <div className="flex items-center justify-between text-[13px] text-[var(--ink-2)]">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--anor)]" />
                    <Monitor className="w-4 h-4" />
                    <span>Desktop <span className="font-semibold text-[var(--ink)] tabular">{desktopPct}%</span></span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--ok)]" />
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile <span className="font-semibold text-[var(--ink)] tabular">{mobilePct}%</span></span>
                  </span>
                </div>
              </div>
            </AdminCard>

            {/* Top visited pages */}
            <AdminCard>
              <CardTitle icon={<Eye />} title={language === "uz" ? "Eng Ko'p Ko'rilgan Sahifalar" : language === "ru" ? "Популярные Страницы" : "Top Visited Pages"} />
              <div className="mt-3 divide-y divide-[var(--rule-soft)]">
                {(stats.analytics?.topPages || [
                  { path: "/", count: 124 },
                  { path: "/catalog", count: 86 },
                  { path: "/gift-finder", count: 72 },
                  { path: "/search", count: 58 },
                  { path: "/wishlists", count: 41 },
                ]).slice(0, 5).map((tp: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                    <span className="font-mono text-[13px] text-[var(--ink)] truncate">{tp.path}</span>
                    <span className="text-[var(--ink-2)] tabular whitespace-nowrap">
                      <span className="font-semibold text-[var(--ink)]">{tp.count}</span> {L("ko'rish", "просм.", "views")}
                    </span>
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>

          {/* Recent visits */}
          <AdminCard className="space-y-4">
            <CardTitle icon={<Activity />} title={language === "uz" ? "Jonli Tashriflar Oqimi (Oxirgi Ko'rishlar)" : language === "ru" ? "Журнал Посещений в Реальном Времени" : "Live Visitors Stream"} />
            <div className={tableWrap}>
              <table className="w-full min-w-[560px] text-left text-[13px]">
                <thead className={theadCls}>
                  <tr>
                    <th className="px-4 py-3">{L("Sahifa", "Страница", "Path")}</th>
                    <th className="px-4 py-3">{L("Qurilma", "Устройство", "Device")}</th>
                    <th className="px-4 py-3">{L("Manba", "Источник", "Referrer")}</th>
                    <th className="px-4 py-3">{L("Vaqt", "Время", "Time")}</th>
                  </tr>
                </thead>
                <tbody className={tbodyCls}>
                  {(stats.analytics?.recentVisits || []).slice(0, 10).map((rv: any, idx: number) => (
                    <tr key={idx} className={rowCls}>
                      <td className="px-4 py-3 font-mono text-[12px] text-[var(--anor)]">{rv.path || "/"}</td>
                      <td className="px-4 py-3 text-[var(--ink)] capitalize">{rv.device || "desktop"}</td>
                      <td className="px-4 py-3 text-[var(--ink-2)] truncate max-w-xs">{rv.referrer || "Direct / Bookmark"}</td>
                      <td className="px-4 py-3 text-[var(--ink-2)] whitespace-nowrap tabular">
                        {rv.timeMs ? new Date(rv.timeMs).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : rv.timestamp}
                      </td>
                    </tr>
                  ))}
                  {(!stats.analytics?.recentVisits || stats.analytics.recentVisits.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-[var(--ink-2)]">
                        {L("Hozircha tashriflar qayd etilmadi", "Пока визитов не зафиксировано", "No visits recorded yet")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 4: ORDERS & COMMERCE */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === "orders" && (
        <div className="space-y-4 sm:space-y-5 animate-fade-in">
          <AdminCard className="space-y-4">
            <CardTitle
              icon={<ShoppingBag />}
              title={language === "uz" ? "Jonli Xaridlar va Buyurtmalar Ro'yxati" : language === "ru" ? "Заказы и Прямые Покупки" : "Direct Orders & Checkout Pipeline"}
              subtitle={
                language === "uz"
                  ? "Mijozlar tomonidan to'g'ridan-to'g'ri 'Sotib Olish' orqali yuborilgan buyurtmalar"
                  : language === "ru"
                  ? "Заказы, оформленные через форму быстрой покупки на сайте"
                  : "Orders placed directly through Sovg'a AI checkout"
              }
              action={
                <button onClick={() => refetchOrders()} className="btn-ghost h-10 px-3.5 text-[13px]" title={L("Yangilash", "Обновить", "Refresh")}>
                  <RefreshCw className="w-4 h-4 text-[var(--ink-2)]" />
                  <span>{L("Yangilash", "Обновить", "Refresh")}</span>
                </button>
              }
            />

            {orderList && orderList.length > 0 ? (
              <div className={tableWrap}>
                <table className="w-full min-w-[880px] text-left text-[13px]">
                  <thead className={theadCls}>
                    <tr>
                      <th className="px-4 py-3">{language === "uz" ? "Buyurtma Kodi" : language === "ru" ? "Код заказа" : "Order ID"}</th>
                      <th className="px-4 py-3">{language === "uz" ? "Mijoz" : language === "ru" ? "Клиент" : "Customer"}</th>
                      <th className="px-4 py-3">{language === "uz" ? "Telefon" : language === "ru" ? "Телефон" : "Phone"}</th>
                      <th className="px-4 py-3">{language === "uz" ? "Mahsulot" : language === "ru" ? "Товар" : "Product"}</th>
                      <th className="px-4 py-3">{language === "uz" ? "Jami Narx" : language === "ru" ? "Сумма" : "Total Price"}</th>
                      <th className="px-4 py-3">{language === "uz" ? "To'lov" : language === "ru" ? "Оплата" : "Payment"}</th>
                      <th className="px-4 py-3">{language === "uz" ? "Holat" : language === "ru" ? "Статус" : "Status"}</th>
                      <th className="px-4 py-3">{language === "uz" ? "Sana" : language === "ru" ? "Дата" : "Date"}</th>
                    </tr>
                  </thead>
                  <tbody className={tbodyCls}>
                    {orderList.map((ord: any) => (
                      <tr key={ord.id} className={rowCls}>
                        <td className="px-4 py-3 font-mono text-[12px] font-medium text-[var(--anor)] whitespace-nowrap">{ord.orderNumber}</td>
                        <td className="px-4 py-3 font-semibold text-[var(--ink)]">{ord.customerName}</td>
                        <td className="px-4 py-3 text-[var(--ink-2)] whitespace-nowrap tabular">{ord.customerPhone}</td>
                        <td className="px-4 py-3 max-w-xs text-[var(--ink)]" title={ord.productName}>
                          <span className="block truncate">{ord.productName}</span>
                          <span className="block text-[12px] text-[var(--ink-2)]">{ord.productStore}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[var(--ink)] whitespace-nowrap tabular">{formatPrice(ord.totalAmount)}</td>
                        <td className="px-4 py-3 text-[12px] text-[var(--ink-2)] whitespace-nowrap">
                          {ord.paymentMethod === "cash_on_delivery"
                            ? (language === "uz" ? "Naqd" : language === "ru" ? "Наличными" : "Cash on delivery")
                            : ord.paymentMethod}
                        </td>
                        <td className="px-4 py-3">
                          <Pill tone={ord.status === "new" ? "blue" : ord.status === "delivered" ? "ok" : ord.status === "cancelled" ? "rose" : "neutral"}>
                            {ord.status === "new"
                              ? (language === "uz" ? "Yangi" : language === "ru" ? "Новый" : "New")
                              : ord.status}
                          </Pill>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[var(--ink-2)] whitespace-nowrap">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl bg-[var(--paper-2)] py-12 px-4 text-center text-[14px] text-[var(--ink-2)]">
                {language === "uz"
                  ? "Hozircha buyurtmalar yo'q. Saytda 'Sotib olish' bosilganda bu yerda ko'rinadi."
                  : language === "ru"
                  ? "Заказов пока нет. Они появятся здесь при оформлении покупок на сайте."
                  : "No orders placed yet. Real purchases will appear here."}
              </div>
            )}
          </AdminCard>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 5: DATABASE & INFRASTRUCTURE */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === "database" && (
        <div className="space-y-4 sm:space-y-5 animate-fade-in">
          <AdminCard className="space-y-5">
            <CardTitle
              icon={<Database />}
              title={
                <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span>MongoDB Atlas & ORM {L("Dvigateli", "движок", "engine")}</span>
                  <Pill tone={dbStatus?.mongo?.isConnected ? "ok" : "warn"} className="font-sans tracking-normal">
                    <span className={`w-1.5 h-1.5 rounded-full ${dbStatus?.mongo?.isConnected ? "bg-[var(--ok)]" : "bg-[var(--warn)]"}`} />
                    {dbStatus?.mongo?.isConnected
                      ? L("Ulangan (Atlas faol)", "Подключено (Atlas)", "Connected (Atlas active)")
                      : L("Kutilyapti (URI yo'q)", "Ожидание URI", "Waiting for URI")}
                  </Pill>
                </span>
              }
              subtitle={L(
                "Mongoose ORM v8 · Foydalanuvchilar, to'y reestrlari, xaridlar va sessiyalar kolleksiyalari",
                "Mongoose ORM v8 · Коллекции пользователей, свадебных реестров, покупок и сессий",
                "Mongoose ORM v8 · Users, wedding registries, purchases and sessions collections"
              )}
              action={
                <button onClick={handleTestConnect} disabled={testingConnection} className="btn-primary h-10 px-4 text-[14px] disabled:opacity-50">
                  <RefreshCw className={`w-4 h-4 ${testingConnection ? "animate-spin" : ""}`} />
                  <span>
                    {testingConnection
                      ? L("Tekshirilmoqda...", "Проверка...", "Checking...")
                      : L("Ulanishni tekshirish & Sinxronlash", "Проверить и синхронизировать", "Check connection & sync")}
                  </span>
                </button>
              }
            />

            {connectMessage && (
              <div
                className={`px-4 py-3 rounded-xl text-[14px] flex items-center gap-2 ${
                  connectMessage.type === "success" ? "bg-[var(--ok-soft)] text-[var(--ok-ink)]" : "bg-[var(--rose-soft)] text-[var(--rose)]"
                }`}
              >
                {connectMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{connectMessage.text}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { k: L("URI manzili", "URI", "URI"), v: dbStatus?.mongo?.uri ? "mongodb+srv://... (Atlas)" : "mongodb://127.0.0.1:27017", code: true, wide: true, title: dbStatus?.mongo?.uri },
                { k: L("Baza nomi", "Имя базы", "Database"), v: dbStatus?.mongo?.dbName || "sovga_ai", code: true },
                { k: L("Foydalanuvchilar", "Пользователи", "Users"), v: dbStatus?.collections?.users ?? totalUsersCount },
                { k: L("Mahsulotlar", "Товары", "Products"), v: dbStatus?.collections?.products ?? 10000 },
                { k: L("Reestrlar", "Реестры", "Registries"), v: dbStatus?.collections?.registries ?? stats.totalRegistries },
                { k: L("Kuzatuvlar", "Отслеживания", "Price trackers"), v: dbStatus?.collections?.priceTrackers ?? 24 },
              ].map((c) => (
                <div key={c.k} className={`rounded-xl bg-[var(--paper-2)] px-4 py-3 min-w-0 ${c.wide ? "col-span-2 sm:col-span-1" : ""}`}>
                  <p className="text-[12px] text-[var(--ink-2)]">{c.k}</p>
                  {c.code ? (
                    <p className="mt-1 font-mono text-[12px] text-[var(--ink)] [overflow-wrap:anywhere]" title={c.title}>{c.v}</p>
                  ) : (
                    <p className="mt-0.5 font-lux text-[1.25rem] leading-tight text-[var(--ink)] tabular">{c.v}</p>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[13px] text-[var(--ink-2)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)] flex-shrink-0" />
              <span>
                {L(
                  "MongoDB Atlas bilan avtomatik ikki tomonlama sinxronizatsiya faol.",
                  "Автоматическая двусторонняя синхронизация с MongoDB Atlas активна.",
                  "Automatic two-way sync with MongoDB Atlas is active."
                )}
              </span>
            </p>
          </AdminCard>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 6: RECEIPTS & FINANCIAL AUDIT */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === "receipts" && (
        <div className="space-y-4 sm:space-y-5 animate-fade-in">
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label={language === "uz" ? "Jami Tasdiqlangan Tushum" : language === "ru" ? "Общий Подтвержденный Доход" : "Total Verified Revenue"}
              value={<span className="text-[var(--ok)]">{formatPrice(receiptsPayload?.stats?.totalRevenueUZS || 0)}</span>}
              sub={L(
                `${receiptsPayload?.stats?.verified || 0} ta muvaffaqiyatli to'lov`,
                `${receiptsPayload?.stats?.verified || 0} успешных оплат`,
                `${receiptsPayload?.stats?.verified || 0} successful payments`
              )}
            />
            <StatCard
              label={language === "uz" ? "Yuklangan Cheklar Soni" : language === "ru" ? "Всего Загружено Чеков" : "Total Receipts Uploaded"}
              value={receiptsPayload?.stats?.total || 0}
              sub={L("Barcha P2P to'lov cheklari", "Все чеки P2P-оплат", "All P2P payment receipts")}
            />
            <StatCard
              label={language === "uz" ? "Tasdiqlangan (+PRO)" : language === "ru" ? "Подтверждено (+PRO)" : "Approved (+PRO)"}
              value={<span className="text-[var(--ok)]">{receiptsPayload?.stats?.verified || 0}</span>}
              sub={L("AI / Admin tomonidan qabul qilingan", "Приняты AI / админом", "Accepted by AI / admin")}
            />
            <StatCard
              label={language === "uz" ? "Rad Etilgan / Xatolik" : language === "ru" ? "Отклонено / Ошибки" : "Rejected Attempts"}
              value={<span className="text-[var(--rose)]">{receiptsPayload?.stats?.rejected || 0}</span>}
              sub={L("Dublikat yoki kam summa", "Дубликат или недостаточная сумма", "Duplicate or amount too low")}
            />
          </div>

          {/* Log */}
          <AdminCard className="space-y-4">
            <CardTitle
              icon={<FileCheck2 />}
              title={language === "uz" ? "To'lov Cheklari Jurnali & Boshqaruv" : language === "ru" ? "Журнал Чеков и Управление" : "Receipts Audit Log & Manual Verification"}
              subtitle={
                language === "uz"
                  ? "Barcha to'lov cheklarini ko'rish, skrinshotlarini kattalashtirish va bir klikda PRO obuna berish"
                  : language === "ru"
                  ? "Просмотр всех чеков, увеличение скриншотов и ручная выдача статуса PRO"
                  : "View all payment receipts, zoom into screenshots and grant PRO in one click"
              }
              action={
                <button
                  onClick={() => {
                    refetchReceipts();
                    cyberSound.playClick();
                  }}
                  className="btn-ghost h-10 px-3.5 text-[13px]"
                  title={L("Yangilash", "Обновить", "Refresh")}
                >
                  <RefreshCw className="w-4 h-4 text-[var(--ink-2)]" />
                  <span>{L("Yangilash", "Обновить", "Refresh")}</span>
                </button>
              }
            />

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search className="w-4 h-4 text-[var(--ink-2)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === "uz" ? "Foydalanuvchi, email yoki tranzaksiya ID..." : language === "ru" ? "Поиск по пользователю, email или ID..." : "Search by user, email or transaction ID..."}
                  value={receiptSearch}
                  onChange={(e) => setReceiptSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-[var(--rule-soft)] bg-[var(--paper)] text-[14px] text-[var(--ink)] outline-none focus:border-[var(--anor)]"
                />
              </div>
              <div className="relative">
                <Filter className="w-4 h-4 text-[var(--ink-2)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={receiptFilter}
                  onChange={(e) => setReceiptFilter(e.target.value)}
                  className="w-full sm:w-auto h-11 pl-10 pr-9 rounded-xl border border-[var(--rule-soft)] bg-[var(--paper)] text-[14px] font-medium text-[var(--ink)] outline-none focus:border-[var(--anor)] appearance-none cursor-pointer"
                >
                  <option value="all">{L("Barcha holatlar", "Все статусы", "All statuses")} ({receiptsPayload?.stats?.total || 0})</option>
                  <option value="verified">{L("Faqat tasdiqlangan", "Только подтверждённые", "Approved only")} ({receiptsPayload?.stats?.verified || 0})</option>
                  <option value="rejected">{L("Faqat rad etilgan", "Только отклонённые", "Rejected only")} ({receiptsPayload?.stats?.rejected || 0})</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[var(--ink-2)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Receipts table */}
            <div className={tableWrap}>
              <table className="w-full min-w-[960px] text-left text-[13px]">
                <thead className={theadCls}>
                  <tr>
                    <th className="px-4 py-3">{L("Foydalanuvchi", "Пользователь", "User")}</th>
                    <th className="px-4 py-3">{L("Tarif va summa", "Тариф и сумма", "Plan & amount")}</th>
                    <th className="px-4 py-3">{L("Bank va tranzaksiya", "Банк и транзакция", "Bank & transaction")}</th>
                    <th className="px-4 py-3">{L("Holat", "Статус", "Status")}</th>
                    <th className="px-4 py-3">{L("AI tahlil va sabab", "AI-анализ и причина", "AI review & reason")}</th>
                    <th className="px-4 py-3 text-center">{L("Chek", "Чек", "Receipt")}</th>
                    <th className="px-4 py-3 text-right">{L("Amallar", "Действия", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className={tbodyCls}>
                  {(!receiptsPayload?.receipts || receiptsPayload.receipts.length === 0) ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-[var(--ink-2)]">
                        {L("Hozircha hech qanday to'lov cheki yuklanmagan.", "Пока не загружено ни одного чека.", "No payment receipts uploaded yet.")}
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
                        <tr key={r.id} className={`${rowCls} align-top`}>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-[var(--ink)]">{r.userName || `User #${r.userId}`}</div>
                            <div className="text-[12px] text-[var(--ink-2)] break-all">{r.userEmail || "No email"}</div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-semibold text-[var(--ink)] block tabular">{formatPrice(r.amount || 49000)}</span>
                            <span className="text-[12px] text-[var(--anor)] font-medium">
                              {(() => { const pid = normalizePlanId(r.plan) || "plus"; return `${PLANS[pid].name[lang]} (${Math.round(PLANS[pid].price / 1000)}k)`; })()}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-medium text-[var(--ink)]">{r.bankOrApp || "Bank App"}</div>
                            <div className="font-mono text-[12px] text-[var(--ink-2)]">{r.transactionId || `TRX-${r.id}`}</div>
                            <div className="text-[12px] text-[var(--muted)] whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</div>
                          </td>

                          <td className="px-4 py-3">
                            {r.status === "verified" ? (
                              <Pill tone="ok">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {L("Tasdiqlangan", "Подтверждён", "Approved")}
                              </Pill>
                            ) : r.status === "rejected" ? (
                              <Pill tone="rose">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {L("Rad etilgan", "Отклонён", "Rejected")}
                              </Pill>
                            ) : (
                              <Pill tone="warn">
                                <Clock className="w-3.5 h-3.5" />
                                {L("Kutilmoqda", "Ожидает", "Pending")}
                              </Pill>
                            )}
                          </td>

                          <td className="px-4 py-3 max-w-xs">
                            <p className="text-[12px] text-[var(--ink-2)] leading-snug">{r.reason || L("AI xulosasi mavjud emas", "Нет заключения AI", "No AI verdict")}</p>
                          </td>

                          <td className="px-4 py-3 text-center">
                            {r.receiptImage ? (
                              <button
                                onClick={() => setLightboxReceipt(r)}
                                className="relative inline-block group cursor-pointer rounded-lg"
                                title={L("Kattalashtirish", "Увеличить", "Enlarge")}
                              >
                                <img
                                  src={r.receiptImage}
                                  alt="Receipt"
                                  className="w-11 h-11 object-cover rounded-lg border border-[var(--rule-soft)] bg-[var(--img-well)]"
                                />
                                <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center text-white transition">
                                  <Eye className="w-4 h-4" />
                                </span>
                              </button>
                            ) : (
                              <span className="text-[12px] text-[var(--muted)]">{L("Tasvir yo'q", "Нет фото", "No image")}</span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
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
                                  className="h-8 px-3 rounded-lg text-[12px] font-semibold bg-[var(--anor)] text-white hover:bg-[var(--anor-deep)] transition cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 disabled:opacity-50"
                                  title={L("Tasdiqlash va PRO qilish", "Подтвердить и выдать PRO", "Approve and grant PRO")}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{L("+PRO berish", "+PRO выдать", "Grant +PRO")}</span>
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
                                  className="h-8 px-3 rounded-lg text-[12px] font-semibold border border-[var(--rule-soft)] text-[var(--rose)] hover:border-[var(--line-strong)] hover:bg-[var(--rose-soft)] transition cursor-pointer whitespace-nowrap disabled:opacity-50"
                                  title={L("Rad etish", "Отклонить", "Reject")}
                                >
                                  {L("Rad etish", "Отклонить", "Reject")}
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
          </AdminCard>

          {/* Lightbox for the receipt image */}
          {lightboxReceipt && createPortal(
            <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
              <div className="absolute inset-0 bg-black/50" onClick={() => setLightboxReceipt(null)} />
              <div className="relative w-full sm:max-w-lg max-h-[92vh] max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[var(--white)] border border-[var(--rule-soft)] shadow-2xl p-5 sm:p-6 space-y-4 animate-scale-up">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[13px] text-[var(--ink-2)]">{L("To'lov cheki", "Чек оплаты", "Payment receipt")}</p>
                    <h4 className="font-lux text-[1.25rem] leading-tight text-[var(--ink)] truncate">
                      {lightboxReceipt.userName || `User #${lightboxReceipt.userId}`}
                    </h4>
                    <p className="mt-0.5 text-[13px] text-[var(--ink-2)] truncate">
                      <span className="font-mono text-[12px]">ID: {lightboxReceipt.transactionId || `TRX-${lightboxReceipt.id}`}</span> · <span className="tabular">{formatPrice(lightboxReceipt.amount)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setLightboxReceipt(null)}
                    className="w-9 h-9 rounded-full inline-flex items-center justify-center bg-[var(--paper-2)] text-[var(--ink)] cursor-pointer flex-shrink-0"
                    aria-label="close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="rounded-2xl overflow-hidden border border-[var(--rule-soft)] bg-[var(--img-well)] flex items-center justify-center max-h-96">
                  <img src={lightboxReceipt.receiptImage} alt="Receipt Full" className="max-h-96 object-contain" />
                </div>

                <div className="rounded-xl bg-[var(--paper-2)] px-4 py-3">
                  <p className="text-[13px] font-semibold text-[var(--ink)]">{L("AI auditor xulosasi", "Заключение AI-аудитора", "AI auditor verdict")}</p>
                  <p className="mt-1 text-[13px] text-[var(--ink-2)]">{lightboxReceipt.reason || L("Tahlil mavjud emas", "Анализ недоступен", "No analysis available")}</p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-1">
                  <button onClick={() => setLightboxReceipt(null)} className="btn-ghost h-11 px-5 text-[14px]">
                    {L("Yopish", "Закрыть", "Close")}
                  </button>
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
                      className="btn-primary h-11 px-5 text-[14px]"
                    >
                      <Check className="w-4 h-4" />
                      <span>{L("Tasdiqlash va PRO berish", "Подтвердить и выдать PRO", "Approve & grant PRO")}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      )}
      </div>
    </div>
  );
}
