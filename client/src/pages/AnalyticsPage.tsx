import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Users,
  Eye,
  Globe,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  ArrowUpRight,
  PieChart,
} from "lucide-react";
import { analytics } from "../lib/api";
import { cyberSound } from "../lib/cyberSound";

export default function AnalyticsPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: stats, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["analytics-stats"],
    queryFn: analytics.stats,
    refetchInterval: autoRefresh ? 8000 : false, // Auto-refresh every 8s
  });

  const handleManualRefresh = () => {
    cyberSound.playClick();
    refetch();
  };

  const statData = stats?.data || stats || {
    totalVisits: 1,
    uniqueVisitors: 1,
    todayVisits: 1,
    liveActiveUsers: 1,
    totalRegisteredUsers: 0,
    deviceBreakdown: { mobile: 0, desktop: 1, tablet: 0 },
    topPages: [{ path: "/", count: 1 }],
    recentVisits: [],
    last7Days: [],
  };

  const totalDevices =
    (statData.deviceBreakdown?.mobile || 0) +
    (statData.deviceBreakdown?.desktop || 0) +
    (statData.deviceBreakdown?.tablet || 0) || 1;

  const mobilePercent = Math.round(((statData.deviceBreakdown?.mobile || 0) / totalDevices) * 100);
  const desktopPercent = Math.round(((statData.deviceBreakdown?.desktop || 0) / totalDevices) * 100);

  return (
    <div className="min-h-screen bg-[#080a11] text-slate-100 px-4 sm:px-6 lg:px-8 py-8 relative selection:bg-amber-500 selection:text-black">
      {/* Glow ambient background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 text-sm">
                <Activity className="w-4 h-4 text-slate-950 stroke-[2.2]" />
              </span>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                Live Visitor & User Analytics
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Real-Time</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sovg'a AI platformasi tashriflari, jonli foydalanuvchilar va sahifalar monitoringi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                autoRefresh
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{autoRefresh ? "Auto-Refresh ON (8s)" : "Auto-Refresh OFF"}</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isFetching}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 stroke-[2.2] ${isFetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Yangilash</span>
            </button>

            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition active:scale-95"
            >
              <span>Saytga o'tish</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
            </Link>
          </div>
        </div>

        {/* 4 Primary Top Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Live Active */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Hozir Saytda</span>
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {statData.liveActiveUsers}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">So'nggi 10 daqiqadagi faol foydalanuvchilar</p>
          </div>

          {/* Total Visits */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Jami Tashriflar</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {statData.totalVisits.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>Bugun: +{statData.todayVisits} ta yangi ko'rish</span>
            </div>
          </div>

          {/* Unique Visitors */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Noyob Mehmonlar</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {statData.uniqueVisitors.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Alohida qurilmalar va brauzerlar</p>
          </div>

          {/* Registered Users */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Ro'yxatdan O'tganlar</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {statData.totalRegisteredUsers}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tizimdagi shaxsiy profillar</p>
          </div>
        </div>

        {/* 2-Column: Top Visited Pages & Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Visited Pages (2 Cols) */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Eng ko'p ochilgan sahifalar</span>
                </h3>
                <p className="text-xs text-slate-400">Foydalanuvchilar qaysi bo'limlarga ko'proq kirmoqda</p>
              </div>
              <span className="text-xs text-amber-400 font-mono font-bold">Path Hits</span>
            </div>

            <div className="space-y-3">
              {statData.topPages.map((page: { path: string; count: number }, idx: number) => {
                const percent = Math.min(Math.round((page.count / statData.totalVisits) * 100), 100);
                const isPitch = page.path === "/pitch" || page.path === "/presentation";
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 text-slate-500 font-mono text-[11px]">{idx + 1}.</span>
                        <span className={`font-mono truncate ${isPitch ? "text-amber-400 font-bold" : "text-slate-200"}`}>
                          {page.path}
                        </span>
                        {isPitch && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Pitch Deck
                          </span>
                        )}
                        {page.path === "/" && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-800 text-slate-300">
                            Bosh Sahifa
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-white">{page.count} marta</span>
                        <span className="text-slate-500 text-[11px]">({percent}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPitch ? "bg-amber-400" : "bg-gradient-to-r from-emerald-500 to-teal-400"
                        }`}
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Device & Browser Breakdown (1 Col) */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Qurilmalar Taqsirlanishi</h3>
                <p className="text-xs text-slate-400">Telefonlar va kompyuterlar ulushi</p>
              </div>

              <div className="space-y-4 mt-5">
                {/* Mobile */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Mobil Telefonlar</div>
                      <div className="text-[11px] text-slate-400">iPhone, Android, Telegram</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-400">{mobilePercent}%</div>
                    <div className="text-[10px] text-slate-500">{statData.deviceBreakdown?.mobile || 0} ta</div>
                  </div>
                </div>

                {/* Desktop */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Kompyuter / Noutbuk</div>
                      <div className="text-[11px] text-slate-400">Windows, Mac, Linux</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-blue-400">{desktopPercent}%</div>
                    <div className="text-[10px] text-slate-500">{statData.deviceBreakdown?.desktop || 0} ta</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              💡 <strong>Telegram & Tashqi linklar:</strong> Mobil foydalanuvchilar Telegram orqali kirganda to'g'ridan-to'g'ri hisoblanadi.
            </div>
          </div>
        </div>

        {/* Recent Visitor Activity Stream */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">So'nggi Tashriflar Jurnali</h3>
              <p className="text-xs text-slate-400">Saytga kirgan oxirgi so'rovlar ketma-ketligi</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">Live Stream</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[11px]">
                  <th className="pb-2 font-medium">Vaqt</th>
                  <th className="pb-2 font-medium">Sahifa</th>
                  <th className="pb-2 font-medium">Qurilma</th>
                  <th className="pb-2 font-medium">Brauzer</th>
                  <th className="pb-2 font-medium">Manzil (IP Mask)</th>
                  <th className="pb-2 font-medium text-right">Referrer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {statData.recentVisits?.length > 0 ? (
                  statData.recentVisits.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 font-mono text-slate-400 text-[11px]">{item.timestamp}</td>
                      <td className="py-2.5 font-mono font-bold text-emerald-400">{item.path}</td>
                      <td className="py-2.5">
                        <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                          {item.device}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-300">{item.browser}</td>
                      <td className="py-2.5 font-mono text-slate-400 text-[11px]">{item.ip}</td>
                      <td className="py-2.5 text-right text-slate-400 text-[11px] truncate max-w-[120px]">
                        {item.referrer || "Direct"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                      Hozircha tashriflar qayd etilmadi. Sayt bo'ylab yurganda bu yerda paydo bo'ladi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
