import { useTranslation, tr } from "./i18n";
const API = "";

async function request<T>(method: string, url: string, body?: any): Promise<T> {
  // Tell the server which language to answer in (search summaries, price notes…)
  const lang = useTranslation.getState().language;
  const res = await fetch(`${API}${url}`, {
    method,
    headers: body ? { "Content-Type": "application/json", "X-Lang": lang } : { "X-Lang": lang },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error(tr(`Tarmoq xatoligi (${res.status}). Qayta urinib ko'ring.`, `Ошибка сети (${res.status}). Попробуйте ещё раз.`, `Network error (${res.status}). Please try again.`));
  }
  if (!json.success) {
    // Plan limit reached: let the app show the upgrade sheet.
    if (json.code === "PLAN_LIMIT" && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("plan-limit", { detail: { error: json.error, ...(json.data || {}) } }));
    }
    const err: any = new Error(json.error || "Request failed");
    if (json.code) err.code = json.code;
    throw err;
  }
  // Some endpoints answer with { success, message, user } instead of { data } — hand those back whole.
  return (json.data !== undefined ? json.data : json) as T;
}

// Auth
export const auth = {
  register: (data: { email?: string; phone?: string; identifier?: string; password: string; name: string }) =>
    request<any>("POST", "/api/auth/register", data),
  login: (data: { email?: string; phone?: string; identifier?: string; password: string }) =>
    request<any>("POST", "/api/auth/login", data),
  logout: () => request<any>("POST", "/api/auth/logout"),
  me: () => request<any>("GET", "/api/auth/me"),
  updateProfile: (data: { name: string; phone?: string }) =>
    request<any>("POST", "/api/auth/update-profile", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<any>("POST", "/api/auth/change-password", data),
  sendOtp: (phone: string) =>
    request<{ demoCode?: string } | undefined>("POST", "/api/auth/send-otp", { phone }),
  verifyOtp: (data: { phone: string; code: string; name?: string }) =>
    request<any>("POST", "/api/auth/verify-otp", data),
  exportData: () => request<any>("GET", "/api/auth/export-data"),
  updatePrivacy: (settings: { incognitoSearch?: boolean; privateWishlist?: boolean; twoFactorEnabled?: boolean }) =>
    request<any>("POST", "/api/auth/privacy-settings", settings),
  terminateAllSessions: () => request<any>("POST", "/api/auth/sessions/terminate-all"),
  deleteAccount: (password?: string) => request<any>("DELETE", "/api/auth/account", { password }),
};

// Live price board (homepage proof card, price-drop strip)
export interface LiveBoardOffer { store: string; title: string; price: number; oldPrice: number | null; url: string }
export interface LiveBoardProduct { id: string; name: string; short: string; image: string | null; offers: LiveBoardOffer[]; lowest: number; highest: number; savings: number; savingsPct: number }
export interface LiveBoardDrop { store: string; title: string; price: number; oldPrice: number; pct: number; url: string; image: string | null; category: string | null }
export interface LivePriceBoard { live: boolean; checkedAt: string | null; storesChecked: string[]; listingsScanned: number; products: LiveBoardProduct[]; drops: LiveBoardDrop[] }
export const prices = {
  liveBoard: () => request<LivePriceBoard>("GET", "/api/prices/live-board"),
};

// Research
export const research = {
  search: (data: { query: string; occasion?: string; budget?: number; budgetMax?: number; currency?: string; language?: string }) =>
    request<any>("POST", "/api/research/search", data),
  gift: (criteria: any) => request<any>("POST", "/api/research/gift", criteria),
  compare: (data: { productName: string; currentPrice?: number; currentStore?: string; currency?: string }) =>
    request<any>("POST", "/api/research/compare", data),
  image: (data: { image: string; hint?: string }) =>
    request<any>("POST", "/api/research/image", data),
  getReport: (data: { product: any; query?: string }) =>
    request<{ report: string }>("POST", "/api/research/report", data),
  trending: () => request<any[]>("GET", "/api/research/trending"),
  installments: (price: number) => request<any[]>("POST", "/api/research/installments", { price }),
  alternatives: (productName: string, targetPrice?: number) =>
    request<any>("POST", "/api/research/alternatives", { productName, targetPrice }),
  trend: (productName: string, currentPrice?: number) =>
    request<any>("POST", "/api/research/trend", { productName, currentPrice }),
  storeReputation: (store: string) =>
    request<any>("GET", `/api/research/store-reputation/${encodeURIComponent(store)}`),
  calligraphyCard: (data: { recipient?: string; occasion?: string; tone?: string }) =>
    request<any>("POST", "/api/research/calligraphy-card", data),
  deliveryInfo: (region?: string) =>
    request<any>("GET", region ? `/api/research/delivery-info?region=${encodeURIComponent(region)}` : "/api/research/delivery-info"),
  compareDuel: (data: { productA: string; productB: string }) =>
    request<any>("POST", "/api/research/compare-duel", data),
  duelVotes: (a: string, b: string) =>
    request<{ a: number; b: number; voted: "A" | "B" | null }>("GET", `/api/research/duel-votes?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`),
  voteDuel: (data: { productA: string; productB: string; option: "A" | "B" }) =>
    request<{ a: number; b: number; voted: "A" | "B" | null }>("POST", "/api/research/duel-votes", data),
  bargain: (data: { productName: string; store?: string; price?: number; language?: string }) =>
    request<any>("POST", "/api/research/bargain", data),
};

// Neural Gift Detective & Psychological Persona Profiler
export const giftDetectiveApi = {
  profile: (data: {
    targetPerson: string;
    gender?: string;
    age?: number | string;
    personalityTraits: string;
    budget?: number | string;
    occasion?: string;
    language?: string;
  }) => request<any>("POST", "/api/gift-detective", data),
};

// Registries
export const registries = {
  list: () => request<any[]>("GET", "/api/registries"),
  create: (data: any) => request<any>("POST", "/api/registries", data),
  getBySlug: (slug: string) => request<any>("GET", `/api/registries/${slug}`),
  update: (id: number, data: any) => request<any>("PUT", `/api/registries/${id}`, data),
  remove: (id: number) => request<void>("DELETE", `/api/registries/${id}`),
  addItem: (id: number, data: any) => request<any>("POST", `/api/registries/${id}/items`, data),
  updateItem: (itemId: number, data: any) => request<any>("PUT", `/api/registries/items/${itemId}`, data),
  removeItem: (itemId: number) => request<void>("DELETE", `/api/registries/items/${itemId}`),
  reserveItem: (itemId: number, data: any) => request<any>("POST", `/api/registries/items/${itemId}/reserve`, data),
};

// Wishlists
export const wishlists = {
  list: () => request<any[]>("GET", "/api/wishlists"),
  create: (data: any) => request<any>("POST", "/api/wishlists", data),
  get: (id: number) => request<any>("GET", `/api/wishlists/${id}`),
  update: (id: number, data: any) => request<any>("PUT", `/api/wishlists/${id}`, data),
  remove: (id: number) => request<void>("DELETE", `/api/wishlists/${id}`),
  addItem: (id: number, data: any) => request<any>("POST", `/api/wishlists/${id}/items`, data),
  updateItem: (itemId: number, data: any) => request<any>("PUT", `/api/wishlists/items/${itemId}`, data),
  removeItem: (itemId: number) => request<void>("DELETE", `/api/wishlists/items/${itemId}`),
  getPublic: (id: number | string) => request<any>("GET", `/api/wishlists/public/${id}`),
  claimItem: (itemId: number, data: { guestName?: string; claimed?: boolean }) =>
    request<any>("POST", `/api/wishlists/public/items/${itemId}/claim`, data),
};

// Reminders
export const reminders = {
  list: () => request<any[]>("GET", "/api/reminders"),
  upcoming: () => request<any[]>("GET", "/api/reminders/upcoming"),
  create: (data: any) => request<any>("POST", "/api/reminders", data),
  update: (id: number, data: any) => request<any>("PUT", `/api/reminders/${id}`, data),
  remove: (id: number) => request<void>("DELETE", `/api/reminders/${id}`),
};

// Saved
export const saved = {
  list: () => request<any[]>("GET", "/api/saved"),
  save: (data: any) => request<any>("POST", "/api/saved", data),
  remove: (id: number) => request<void>("DELETE", `/api/saved/${id}`),
};

// Price Tracking
export const tracking = {
  list: () => request<any[]>("GET", "/api/tracking"),
  create: (data: { productName: string; targetPrice: number; currentPrice?: number; store?: string; url?: string }) =>
    request<any>("POST", "/api/tracking", data),
  remove: (id: number) => request<void>("DELETE", `/api/tracking/${id}`),
  simulateDrop: (trackerId?: number) => request<any>("POST", "/api/tracking/simulate-drop", { trackerId }),
};

// Catalog
export const catalog = {
  meta: () => request<{ live: boolean; checkedAt: string | null; stores: string[]; total: number }>("GET", "/api/catalog/meta"),
  list: (q?: string) => request<any[]>("GET", q ? `/api/catalog?q=${encodeURIComponent(q)}` : "/api/catalog"),
  categories: () => request<{ name: string; count: number; icon: string; labelUz?: string; labelRu?: string; labelEn?: string }[]>("GET", "/api/catalog/categories"),
  filter: (params: { q?: string; category?: string; store?: string; minPrice?: number; maxPrice?: number; sort?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.category) qs.set("category", params.category);
    if (params.store) qs.set("store", params.store);
    if (params.minPrice) qs.set("minPrice", String(params.minPrice));
    if (params.maxPrice) qs.set("maxPrice", String(params.maxPrice));
    if (params.sort) qs.set("sort", params.sort);
    if (params.limit) qs.set("limit", String(params.limit));
    return request<any[]>("GET", `/api/catalog?${qs.toString()}`);
  },
  get: (id: number) => request<any>("GET", `/api/catalog/${id}`),
};

// Admin
export const admin = {
  stats: () => request<any>("GET", "/api/admin/stats"),
  getUsers: (params?: { q?: string; role?: string; plan?: string; demo?: string; page?: number; pageSize?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.demo) searchParams.set("demo", params.demo);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.q) searchParams.set("q", params.q);
    if (params?.role) searchParams.set("role", params.role);
    if (params?.plan) searchParams.set("plan", params.plan);
    const qs = searchParams.toString();
    return request<any>("GET", `/api/admin/users${qs ? `?${qs}` : ""}`);
  },
  updateUserRole: (id: number, role: string) => request<any>("PATCH", `/api/admin/users/${id}/role`, { role }),
  deleteUser: (id: number) => request<any>("DELETE", `/api/admin/users/${id}`),
  getReceipts: () => request<{ receipts: any[]; stats: any }>("GET", "/api/admin/receipts"),
  updateReceiptStatus: (id: number, status: "verified" | "rejected" | "manual_review", reason?: string) =>
    request<any>("PATCH", `/api/admin/receipts/${id}`, { status, reason }),
  setUserPlan: (id: number, plan: string, days?: number, opts?: { fromNow?: boolean; note?: string }) =>
    request<any>("PATCH", `/api/admin/users/${id}/plan`, { plan, days, ...opts }),
  addDemoUsers: (count = 1500) => request<any>("POST", "/api/admin/demo-users", { count }),
  deleteDemoUsers: () => request<any>("DELETE", "/api/admin/demo-users"),
  grantPlan: (identifier: string, plan: string, days: number, opts?: { fromNow?: boolean; note?: string }) =>
    request<any>("POST", "/api/admin/grant-plan", { identifier, plan, days, ...opts }),
};

// Analytics
export const analytics = {
  track: (path: string, referrer?: string) =>
    request<{ success: boolean; totalVisits: number }>("POST", "/api/analytics/track", { path, referrer }),
  stats: () => request<any>("GET", "/api/analytics/stats"),
  live: () => request<any>("GET", "/api/analytics/live"),
};

// Database (MongoDB)
export const database = {
  status: () => request<any>("GET", "/api/database/status"),
  connect: (uri?: string) => request<any>("POST", "/api/database/connect", { uri }),
};

// Orders (Direct Purchases)
export const orders = {
  create: (data: any) => request<any>("POST", "/api/orders", data),
  list: () => request<any[]>("GET", "/api/orders"),
  getById: (id: number) => request<any>("GET", `/api/orders/${id}`),
};

// Merchants
export const merchantsApi = {
  getProducts: () => request<any>("GET", "/api/merchants/products"),
  createProduct: (data: any) => request<any>("POST", "/api/merchants/products", data),
  deleteProduct: (id: number) => request<any>("DELETE", `/api/merchants/products/${id}`),
};

// Promocodes
export const promocodesApi = {
  getCodes: () => request<any>("GET", "/api/promocodes"),
};

// Subscription & AI Receipt Verification
export const subscription = {
  upgrade: () => request<any>("POST", "/api/subscription/upgrade"),
  verifyReceipt: (data: { receiptImage: string; plan?: string }) =>
    request<any>("POST", "/api/subscription/verify-receipt", data),
  getReceipts: () => request<any>("GET", "/api/subscription/receipts"),
  plans: () =>
    request<{ plans: any[]; payment: { cards: { type: string; number: string }[]; holder: string } }>("GET", "/api/subscription/plans"),
  status: () =>
    request<{ signedIn: boolean; plan: string; expiresAt: string | null; searchesToday: number; searchLimit: number; trackers: number; trackerLimit: number; registry: boolean }>("GET", "/api/subscription/status"),
};

// Subscription
export const subscriptionApi = {
  upgrade: () => request<any>("POST", "/api/subscription/upgrade"),
};

// AI Shopping Concierge Chatbot
export const concierge = {
  chat: (messages: Array<{ role: "user" | "assistant"; content: string }>, language?: string) =>
    request<any>("POST", "/api/concierge/chat", { messages, language }),
};

// Utility
export function formatPrice(price: number | null, currency = "UZS"): string {
  if (price === null || price === undefined) return "Narx ko'rsatilmagan";
  const userCur = (typeof window !== "undefined" && localStorage.getItem("sovga_currency")) || currency;
  if (userCur === "USD") {
    const usd = (price / 12850);
    return `$${usd >= 100 ? Math.round(usd).toLocaleString("en-US") : usd.toFixed(2)}`;
  }
  return `${Math.round(price).toLocaleString("en-US")} ${currency}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
