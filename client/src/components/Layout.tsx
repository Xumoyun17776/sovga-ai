import { ReactNode, useState, useEffect, lazy, Suspense } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
const CyberCommandPalette = lazy(() => import("./CyberCommandPalette"));
import FloatingCyberDock from "./FloatingCyberDock";
import MobileBottomNav from "./MobileBottomNav";
import FirstVisitWelcomeModal from "./FirstVisitWelcomeModal";
const CurrencyConverterModal = lazy(() => import("./CurrencyConverterModal"));
const FloatingAIOrb = lazy(() => import("./FloatingAIOrb"));
import NetworkStatusIndicator from "./NetworkStatusIndicator";
import GlobalLoadingBar from "./GlobalLoadingBar";
import SEOHead from "./SEOHead";
import ScrollToTop from "./ScrollToTop";
import UpgradeModal from "./UpgradeModal";
const TextSelectionAI = lazy(() => import("./TextSelectionAI"));
import { useLocation } from "wouter";

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  // Heavy modals are only downloaded the first time they're opened.
  const [paletteUsed, setPaletteUsed] = useState(false);
  const [currencyUsed, setCurrencyUsed] = useState(false);
  useEffect(() => { if (isCommandPaletteOpen) setPaletteUsed(true); }, [isCommandPaletteOpen]);
  useEffect(() => { if (isCurrencyModalOpen) setCurrencyUsed(true); }, [isCurrencyModalOpen]);

  useEffect(() => {
    const handleOpen = () => setIsCommandPaletteOpen(true);
    const handleOpenCurrency = () => setIsCurrencyModalOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) {
        // Close the top-most open modal overlay by triggering its own close (X) button.
        const overlays = Array.from(
          document.querySelectorAll<HTMLElement>("div.fixed.inset-0")
        ).filter((el) => {
          const z = parseInt(getComputedStyle(el).zIndex || "0", 10);
          return z >= 40 && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden" && !!el.querySelector("button");
        });
        const top = overlays[overlays.length - 1];
        const closeBtn =
          top?.querySelector<HTMLButtonElement>('button[aria-label*="lose" i], button[aria-label*="yopish" i], button[title*="lose" i]') ||
          top?.querySelector<HTMLButtonElement>("button:has(> svg.lucide-x)");
        if (closeBtn) {
          e.preventDefault();
          closeBtn.click();
          return;
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("open-command-palette", handleOpen);
    window.addEventListener("open-currency-converter", handleOpenCurrency);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("open-command-palette", handleOpen);
      window.removeEventListener("open-currency-converter", handleOpenCurrency);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-transparent text-slate-900 dark:text-slate-100 relative transition-colors duration-300 w-full overflow-x-hidden overflow-x-clip">
      <SEOHead />
      <GlobalLoadingBar />
      <NetworkStatusIndicator />
      

      <div className="relative z-10 flex flex-col min-h-screen min-h-[100dvh] w-full">
        <Navbar />
        <main className="flex-1 pb-24 sm:pb-28 lg:pb-8 w-full safe-area-pb"><div key={location} className="page-enter">{children}</div></main>
        <Footer />
      </div>

      {/* 1st Time Visitor Login & Welcome Onboarding Modal */}
      <FirstVisitWelcomeModal />

      {/* Global Aerospace HUD & Command Dock */}
      <Suspense fallback={null}>
        {paletteUsed && (
          <CyberCommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
          />
        )}
        {currencyUsed && (
          <CurrencyConverterModal
            isOpen={isCurrencyModalOpen}
            onClose={() => setIsCurrencyModalOpen(false)}
          />
        )}
      </Suspense>
      <MobileBottomNav />

      {/* Global Conversion Triggers & Interactive Orbs */}
      <Suspense fallback={null}>
        <FloatingAIOrb />
        <TextSelectionAI />
      </Suspense>
      <ScrollToTop />
      <UpgradeModal />
    </div>
  );
}
