import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout";

// Code Splitting for Ultra-Fast Initial Load
const HomePage = lazy(() => import("./pages/HomePage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const GiftFinderPage = lazy(() => import("./pages/GiftFinderPage"));
const WeddingRegistryPage = lazy(() => import("./pages/WeddingRegistryPage"));
const WeddingRegistryPublicPage = lazy(() => import("./pages/WeddingRegistryPublicPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const WishlistPublicPage = lazy(() => import("./pages/WishlistPublicPage"));
const RemindersPage = lazy(() => import("./pages/RemindersPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const PackagingStudioPage = lazy(() => import("./pages/PackagingStudioPage"));
const GroupGiftingPage = lazy(() => import("./pages/GroupGiftingPage"));
const PriceAuditPage = lazy(() => import("./pages/PriceAuditPage"));
const CulturalEtiquettePage = lazy(() => import("./pages/CulturalEtiquettePage"));
const SecretSantaPage = lazy(() => import("./pages/SecretSantaPage"));
const CalligraphyCardPage = lazy(() => import("./pages/CalligraphyCardPage"));
const StoresDeliveryPage = lazy(() => import("./pages/StoresDeliveryPage"));
const WarrantyVaultPage = lazy(() => import("./pages/WarrantyVaultPage"));
const CompareDuelPage = lazy(() => import("./pages/CompareDuelPage"));
const MysteryBoxPage = lazy(() => import("./pages/MysteryBoxPage"));
const GiftQuizPage = lazy(() => import("./pages/GiftQuizPage"));
const PitchDeckPage = lazy(() => import("./pages/PitchDeckPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const MerchantDashboard = lazy(() => import("./pages/MerchantDashboard"));
const AksiyalarPage = lazy(() => import("./pages/AksiyalarPage"));
const TimeCapsulePage = lazy(() => import("./pages/TimeCapsulePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
import { useEffect } from "react";
import { useLocation } from "wouter";
import { analytics } from "./lib/api";

import { ToastProvider } from "./components/Toast";
import { CurrencyProvider } from "./lib/currency";
import ErrorBoundary from "./components/ErrorBoundary";
import { useTranslation } from "./lib/i18n";

function LoadingFallback() {
  const { language } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfbf9] dark:bg-[#07080c] text-slate-900 dark:text-white transition-colors relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative w-20 h-20 flex items-center justify-center mb-6">
        <div className="absolute inset-0 bg-amber-400/20 dark:bg-amber-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute inset-0 border-t-2 border-l-2 border-amber-500 rounded-full animate-spin" />
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
          AI
        </div>
      </div>
      <h2 className="text-xl font-display font-black tracking-tight mb-2 text-slate-900 dark:text-white">
        {language === "uz" ? "Yuklanmoqda..." : language === "ru" ? "Загрузка..." : "Loading..."}
      </h2>
      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[260px] text-center font-normal">
        {language === "uz"
          ? "Interfeys va komponentlar ishga tushirilmoqda"
          : language === "ru"
          ? "Инициализация интерфейса и компонентов"
          : "Initializing neural interface and components"}
      </p>
    </div>
  );
}

function PageTracker() {
  const [location] = useLocation();
  useEffect(() => {
    analytics.track(location, typeof document !== "undefined" ? document.referrer : undefined).catch(() => {});
  }, [location]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <PageTracker />
      <ToastProvider>
        <CurrencyProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Switch>
              <Route path="/pitch" component={PitchDeckPage} />
              <Route path="/presentation" component={PitchDeckPage} />
              <Route path="/analytics" component={AnalyticsPage} />
              <Route path="/stats" component={AnalyticsPage} />
              <Route>
                <Layout>
                  <ErrorBoundary>
                    <Switch>
                      <Route path="/" component={HomePage} />
                      <Route path="/subscription" component={SubscriptionPage} />
                      <Route path="/merchant" component={MerchantDashboard} />
                      <Route path="/catalog" component={CatalogPage} />
                      <Route path="/search" component={SearchResultsPage} />
                      <Route path="/gift-finder" component={GiftFinderPage} />
                      <Route path="/packaging-studio" component={PackagingStudioPage} />
                      <Route path="/packaging" component={PackagingStudioPage} />
                      <Route path="/calligraphy-card" component={CalligraphyCardPage} />
                      <Route path="/group-gifting" component={GroupGiftingPage} />
                      <Route path="/price-audit" component={PriceAuditPage} />
                      <Route path="/audit" component={PriceAuditPage} />
                      <Route path="/cultural-etiquette" component={CulturalEtiquettePage} />
                      <Route path="/etiquette" component={CulturalEtiquettePage} />
                      <Route path="/secret-santa" component={SecretSantaPage} />
                      <Route path="/santa" component={SecretSantaPage} />
                      <Route path="/stores-delivery" component={StoresDeliveryPage} />
                      <Route path="/delivery" component={StoresDeliveryPage} />
                      <Route path="/warranty-vault" component={WarrantyVaultPage} />
                      <Route path="/vault" component={WarrantyVaultPage} />
                      <Route path="/compare-duel" component={CompareDuelPage} />
                      <Route path="/duel" component={CompareDuelPage} />
                      <Route path="/mystery-box" component={MysteryBoxPage} />
                      <Route path="/mystery" component={MysteryBoxPage} />
                      <Route path="/gift-quiz" component={GiftQuizPage} />
                      <Route path="/quiz" component={GiftQuizPage} />
                      <Route path="/wedding" component={WeddingRegistryPage} />
                      <Route path="/wedding-registry" component={WeddingRegistryPage} />
                      <Route path="/registry" component={WeddingRegistryPage} />
                      <Route path="/wedding/:slug" component={WeddingRegistryPublicPage} />
                      <Route path="/wishlist" component={WishlistPage} />
                      <Route path="/wishlists" component={WishlistPage} />
                      <Route path="/wishlist/:id" component={WishlistPublicPage} />
                      <Route path="/aksiyalar" component={AksiyalarPage} />
                      <Route path="/promos" component={AksiyalarPage} />
                      <Route path="/time-capsule" component={TimeCapsulePage} />
                      <Route path="/capsule" component={TimeCapsulePage} />
                      <Route path="/reminders" component={RemindersPage} />
                      <Route path="/admin" component={AdminPage} />
                      <Route path="/auth" component={AuthPage} />
                      <Route component={NotFoundPage} />
                    </Switch>
                  </ErrorBoundary>
                </Layout>
              </Route>
            </Switch>
          </Suspense>
        </CurrencyProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
