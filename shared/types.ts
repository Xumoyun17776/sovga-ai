// ─── AI Research Types ──────────────────────────────────────────────────

export interface ResearchProduct {
  name: string;
  price: number | null;
  originalPrice: number | null;
  currency: string;
  store: string;
  url: string;
  imageUrl: string | null;
  discount: string | null;
  rating: number | null;
  reviewCount: number | null;
  availability: string | null;
  reason: string;
  source: string;
  lastChecked: string;
  priceVerified: boolean;
  availabilityVerified: boolean;
  category: "best_overall" | "best_value" | "cheapest" | "premium" | "most_unique" | "alternative";
  offers?: OfferComparison[];
  sellerReputation?: string;
  warranty?: string;
  deliveryEstimate?: string;
  priceDropAlert?: boolean;
  specs?: Record<string, string> | string[] | any;
  installment?: string;
  storeTrustScore?: number;
  culturalFitExplanation?: string;
  tashkentDeliveryHours?: string;
}

export interface CatalogProductItem {
  id: number;
  name: string;
  category: string;
  brand: string;
  imageUrl: string | null;
  description: string | null;
  price: number | null;
  originalPrice: number | null;
  currency: string;
  store: string;
  url: string;
  discount: string | null;
  availability: string | null;
  rating: number | null;
  reviewCount: number | null;
  verified: boolean;
  warranty?: string;
  installment?: string;
  offers: OfferComparison[];
  specs?: Record<string, string> | string[] | any;
}

export interface ResearchResult {
  query: string;
  researchSummary: string;
  totalSourcesResearched: number;
  totalProductsConsidered: number;
  products: ResearchProduct[];
  rejectedProducts: RejectedProduct[];
  searchStrategies: string[];
  priceSavings: string | null;
  lastChecked: string;
  isDemo: boolean;
  cached: boolean;
  responseTimeMs?: number;
  pipelineStages?: PipelineStage[];
}

export interface PipelineStage {
  stage: "intent_analysis" | "search_plan" | "live_research" | "product_extraction" | "normalization" | "deduplication" | "price_comparison" | "ai_ranking";
  label: string;
  description: string;
  status: "completed" | "in_progress" | "pending";
  details?: string;
}

export interface RejectedProduct {
  name: string;
  reason: string;
  store?: string;
  price?: number;
}

// ─── Gift Finder Types ──────────────────────────────────────────────────

export type Occasion =
  | "wedding"
  | "birthday"
  | "graduation"
  | "anniversary"
  | "new_baby"
  | "housewarming"
  | "holiday"
  | "teacher"
  | "friend"
  | "family"
  | "corporate"
  | "other";

export interface GiftCriteria {
  occasion: Occasion;
  recipient: string;
  relationship: string;
  age?: number;
  gender?: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  interests: string[];
  personality?: string;
  style?: string;
  location?: string;
  urgency?: "low" | "medium" | "high";
  avoid: string[];
}

// ─── Wedding Registry Types ─────────────────────────────────────────────

export interface RegistryData {
  id: number;
  slug: string;
  partnerName1: string;
  partnerName2: string;
  weddingDate: string | null;
  coverImageUrl: string | null;
  message: string | null;
  isPublic: boolean;
  revealPurchasers: boolean;
  items: RegistryItemData[];
}

export interface RegistryItemData {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  currency: string;
  url: string | null;
  priority: string;
  quantity: number;
  quantityFulfilled: number;
  category: string | null;
  isCashGoal: boolean;
  cashGoalAmount: number | null;
  cashCollected: number;
  status: string;
}

export interface ReservationInput {
  itemId: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  quantity?: number;
  cashAmount?: number;
  message?: string;
}

// ─── Wishlist Types ─────────────────────────────────────────────────────

export interface WishlistData {
  id: number;
  title: string;
  description: string | null;
  type: string;
  isPublic: boolean;
  slug: string | null;
  items: WishlistItemData[];
}

export interface WishlistItemData {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  currency: string;
  url: string | null;
  store: string | null;
  priority: string;
  notes: string | null;
  purchased: boolean;
}

// ─── Event Reminder Types ───────────────────────────────────────────────

export interface EventReminderData {
  id: number;
  title: string;
  personName: string;
  eventType: string;
  eventDate: string;
  recurring: boolean;
  budget: number | null;
  currency: string;
  notes: string | null;
  daysUntil: number;
}

// ─── Search Types ───────────────────────────────────────────────────────

export interface SearchRequest {
  query: string;
  occasion?: Occasion;
  budget?: number;
  budgetMax?: number;
  currency?: string;
  language?: string;
}

export interface PriceComparisonRequest {
  productName: string;
  currentPrice?: number;
  currentStore?: string;
  currency?: string;
}

export interface OfferComparison {
  store: string;
  price: number;
  currency: string;
  originalPrice?: number | null;
  discount?: string | null;
  availability: string;
  verified: boolean;
  url: string;
  deliveryTime?: string;
  isLowestPrice: boolean;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  store: string;
}

export interface ComparisonResult {
  productName: string;
  query: string;
  exactMatches: OfferComparison[];
  equivalentAlternatives: {
    name: string;
    price: number;
    currency: string;
    store: string;
    url: string;
    savingsAmount: number;
    savingsPercent: number;
    isTrulyEquivalent: boolean;
    equivalenceExplanation: string;
    specificationDifferences: string[];
  }[];
  priceHistory: {
    currentPrice: number;
    price30DaysAgo: number;
    changePercent: number;
    trend: "down" | "up" | "stable";
    historyPoints: PriceHistoryPoint[];
  };
  installmentOptions?: {
    store: string;
    monthlyPayment: number;
    months: number;
    provider: string;
  }[];
  bestTimeBuyAdvice?: {
    recommendation: "buy_now" | "wait" | "fair_price";
    reason: string;
    targetPrice?: number;
  };
  specComparison?: {
    feature: string;
    values: Record<string, string>;
  }[];
  researchSummary: string;
  verifiedCount: number;
  lastChecked: string;
}

// ─── Image Search Types ─────────────────────────────────────────────────

export interface ImageSearchResult {
  identifiedProduct: string | null;
  category: string | null;
  brand: string | null;
  confidence: "high" | "medium" | "low";
  confidenceExplanation?: string;
  searchResults: ResearchResult | null;
}

// ─── Admin Types ────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalSearches: number;
  totalRegistries: number;
  totalWishlists: number;
  totalSavedProducts: number;
  popularOccasions: { occasion: string; count: number }[];
  recentSearches: { query: string; createdAt: string }[];
  apiUsage: {
    totalRequests: number;
    cachedRequests: number;
    avgResponseTimeMs: number;
    estimatedCostUsd: number;
  };
  providersHealth: {
    name: string;
    status: "online" | "degraded" | "offline";
    latencyMs: number;
    type: string;
  }[];
}

// ─── i18n Types ─────────────────────────────────────────────────────────

export type Language = "uz" | "ru" | "en";

export interface TranslationStrings {
  [key: string]: string | TranslationStrings;
}

// ─── API Response Types ─────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Shopping Provider Types ────────────────────────────────────────────

export interface ShoppingProvider {
  name: string;
  searchProducts(query: string, options?: SearchOptions): Promise<ProviderProduct[]>;
  getProduct(url: string): Promise<ProviderProduct | null>;
  getPrice(url: string): Promise<number | null>;
  getAvailability(url: string): Promise<string | null>;
  getProductDetails(url: string): Promise<any>;
  isAvailable(): Promise<boolean>;
}

export interface SearchOptions {
  maxResults?: number;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  location?: string;
}

export interface ProviderProduct {
  name: string;
  price: number | null;
  originalPrice: number | null;
  currency: string;
  store: string;
  url: string;
  imageUrl: string | null;
  availability: string | null;
  rating: number | null;
  reviewCount: number | null;
  description: string | null;
  source: string;
  verified?: boolean;
}

// ─── Price Drop Tracking Types ──────────────────────────────────────────

export interface PriceTrackerData {
  id: number;
  userId: number;
  productId?: number | null;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  currency: string;
  store?: string;
  url?: string;
  userEmail?: string;
  active: boolean;
  notified: boolean;
  createdAt: string;
}

// ─── Subscription & AI Receipt Verification Types ───────────────────────

export interface SubscriptionReceiptRecord {
  id: number;
  userId: number;
  userEmail?: string;
  userName?: string;
  plan: "pro_monthly" | "pro_annual";
  amount: number;
  expectedAmount: number;
  currency: string;
  bankOrApp: string;
  transactionId?: string | null;
  paymentDate?: string | null;
  status: "verified" | "rejected" | "manual_review";
  verificationConfidence: "high" | "medium" | "low";
  reason: string;
  receiptImage?: string;
  createdAt: string;
  verifiedAt?: string;
}
