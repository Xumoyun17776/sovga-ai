import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { Request } from "express";

interface VisitRecord {
  id: string;
  visitorHash: string;
  path: string;
  timestamp: string;
  timeMs: number;
  device: "mobile" | "desktop" | "tablet";
  browser: string;
  ip: string;
  referrer: string;
}

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitorHashes: string[];
  pathCounts: Record<string, number>;
  dailyCounts: Record<string, number>; // "YYYY-MM-DD" -> count
  deviceCounts: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  recentVisits: VisitRecord[];
}

const ANALYTICS_FILE = path.resolve(process.cwd(), "data", "analytics.json");

/** True for real site pages ("/", "/catalog", "/wedding/ali-madina"), false for files and dev/API paths. */
export function isPagePath(p: string): boolean {
  if (!p.startsWith("/")) return false;
  if (/^\/(api|assets|src|@|node_modules)/.test(p)) return false;
  const last = p.split("/").pop() || "";
  return !last.includes(".");
}

class AnalyticsService {
  private data: AnalyticsData;
  private activeVisitors = new Map<string, number>(); // visitorHash -> lastActiveMs

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): AnalyticsData {
    try {
      if (fs.existsSync(ANALYTICS_FILE)) {
        const raw = fs.readFileSync(ANALYTICS_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err: any) {
      console.warn("⚠️ [Analytics] Could not load analytics.json, initializing fresh:", err?.message);
    }
    return {
      totalVisits: 0,
      uniqueVisitorHashes: [],
      pathCounts: {},
      dailyCounts: {},
      deviceCounts: { mobile: 0, desktop: 0, tablet: 0 },
      recentVisits: [],
    };
  }

  private saveThrottleTimeout: NodeJS.Timeout | null = null;
  private saveDebounced() {
    if (this.saveThrottleTimeout) return;
    this.saveThrottleTimeout = setTimeout(() => {
      this.saveThrottleTimeout = null;
      try {
        fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(this.data, null, 2), "utf-8");
      } catch (err: any) {
        console.error("❌ [Analytics] Failed to save analytics data:", err?.message);
      }
    }, 2000);
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded[0]) {
      return forwarded[0].trim();
    }
    return req.socket.remoteAddress || "127.0.0.1";
  }

  private parseUserAgent(ua = ""): { device: "mobile" | "desktop" | "tablet"; browser: string } {
    const lower = ua.toLowerCase();
    let device: "mobile" | "desktop" | "tablet" = "desktop";
    if (/tablet|ipad|playbook|silk/i.test(lower)) {
      device = "tablet";
    } else if (/mobile|iphone|android|blackberry|iemobile|opera mini/i.test(lower)) {
      device = "mobile";
    }

    let browser = "Other";
    if (lower.includes("edg/")) browser = "Edge";
    else if (lower.includes("chrome/")) browser = "Chrome";
    else if (lower.includes("safari/") && !lower.includes("chrome/")) browser = "Safari";
    else if (lower.includes("firefox/")) browser = "Firefox";
    else if (lower.includes("opera") || lower.includes("opr/")) browser = "Opera";
    else if (lower.includes("telegram")) browser = "Telegram Webview";

    return { device, browser };
  }

  /**
   * Record a new page visit
   */
  public recordVisit(req: Request, targetPath?: string, referrer?: string): { success: boolean; totalVisits: number } {
    try {
      const rawPath = targetPath || req.path || "/";
      const cleanPath = rawPath.split("?")[0].toLowerCase() || "/";

      // Ignore anything that isn't a page: API calls, built assets, dev-server modules, files with an extension
      if (!isPagePath(cleanPath)) {
        return { success: false, totalVisits: this.data.totalVisits };
      }

      const ip = this.getClientIp(req);
      const ua = String(req.headers["user-agent"] || "");
      const { device, browser } = this.parseUserAgent(ua);

      // Create anonymous hash of IP + User-Agent for privacy
      const visitorHash = crypto
        .createHash("sha256")
        .update(`${ip}_${ua}`)
        .digest("hex")
        .slice(0, 16);

      const now = new Date();
      const timeMs = now.getTime();
      const todayStr = now.toISOString().slice(0, 10); // "YYYY-MM-DD"

      // Increment counters
      this.data.totalVisits++;

      if (!this.data.uniqueVisitorHashes.includes(visitorHash)) {
        this.data.uniqueVisitorHashes.push(visitorHash);
      }

      this.data.pathCounts[cleanPath] = (this.data.pathCounts[cleanPath] || 0) + 1;
      this.data.dailyCounts[todayStr] = (this.data.dailyCounts[todayStr] || 0) + 1;
      this.data.deviceCounts[device] = (this.data.deviceCounts[device] || 0) + 1;

      // Track live active visitor
      this.activeVisitors.set(visitorHash, timeMs);

      // Add to recent visits (keep last 50)
      const record: VisitRecord = {
        id: crypto.randomUUID().slice(0, 8),
        visitorHash,
        path: cleanPath,
        timestamp: now.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        timeMs,
        device,
        browser,
        ip: ip.includes(":") ? "IPv6" : ip.split(".").slice(0, 2).join(".") + ".x.x",
        referrer: referrer || String(req.headers["referer"] || "Direct"),
      };

      this.data.recentVisits.unshift(record);
      if (this.data.recentVisits.length > 50) {
        this.data.recentVisits = this.data.recentVisits.slice(0, 50);
      }

      this.saveDebounced();
      return { success: true, totalVisits: this.data.totalVisits };
    } catch (err: any) {
      console.error("❌ [Analytics] Error recording visit:", err?.message);
      return { success: false, totalVisits: this.data.totalVisits };
    }
  }

  /**
   * Return aggregated analytics
   */
  public getStats(totalUsers: number = 0) {
    const now = Date.now();
    const activeCutoff = now - 10 * 60 * 1000; // 10 minutes

    // Clean up active visitors
    let liveCount = 0;
    this.activeVisitors.forEach((lastActive, hash) => {
      if (lastActive >= activeCutoff) {
        liveCount++;
      } else {
        this.activeVisitors.delete(hash);
      }
    });

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayVisits = this.data.dailyCounts[todayStr] || 0;

    // Top pages sorted by count
    const topPages = Object.entries(this.data.pathCounts)
      .filter(([p]) => isPagePath(p))
      .map(([pathName, count]) => ({ path: pathName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Last 7 days trend
    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const dStr = d.toISOString().slice(0, 10);
      last7Days.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count: this.data.dailyCounts[dStr] || 0,
      });
    }

    return {
      totalVisits: Math.max(this.data.totalVisits, 1),
      uniqueVisitors: Math.max(this.data.uniqueVisitorHashes.length, 1),
      todayVisits: Math.max(todayVisits, 1),
      liveActiveUsers: Math.max(liveCount, 1), // At least current viewer
      totalRegisteredUsers: totalUsers,
      deviceBreakdown: this.data.deviceCounts,
      topPages,
      recentVisits: this.data.recentVisits.filter((v) => isPagePath(v.path)).slice(0, 20),
      last7Days,
    };
  }
}

export const analyticsService = new AnalyticsService();
