import { ReactNode, useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CyberCommandPalette from "./CyberCommandPalette";
import FloatingCyberDock from "./FloatingCyberDock";
import MobileBottomNav from "./MobileBottomNav";
import FirstVisitWelcomeModal from "./FirstVisitWelcomeModal";
import CyberAmbientMesh from "./CyberAmbientMesh";
import CurrencyConverterModal from "./CurrencyConverterModal";
import LiveSocialProof from "./LiveSocialProof";
import FloatingAIOrb from "./FloatingAIOrb";
import NetworkStatusIndicator from "./NetworkStatusIndicator";
import GlobalLoadingBar from "./GlobalLoadingBar";
import SEOHead from "./SEOHead";
import ScrollToTop from "./ScrollToTop";
import EasterEgg from "./EasterEgg";
import CustomCursor from "./CustomCursor";
import TextSelectionAI from "./TextSelectionAI";
import { useTheme } from "../lib/theme";

export default function Layout({ children }: { children: ReactNode }) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsCommandPaletteOpen(true);
    const handleOpenCurrency = () => setIsCurrencyModalOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (!isInput && (e.key === "d" || e.key === "D") && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Global Instant Theme Toggle
        useTheme.getState().toggleTheme();
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
      
      {/* Premium Texture Overlay */}
      <div className="grain-overlay"></div>

      {/* Background Ambient Cyber Aurora */}
      <CyberAmbientMesh />

      <div className="relative z-10 flex flex-col min-h-screen min-h-[100dvh] w-full">
        <Navbar />
        <main className="flex-1 pb-24 sm:pb-28 lg:pb-8 w-full safe-area-pb">{children}</main>
        <Footer />
      </div>

      {/* 1st Time Visitor Login & Welcome Onboarding Modal */}
      <FirstVisitWelcomeModal />

      {/* Global Aerospace HUD & Command Dock */}
      <CyberCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
      <CurrencyConverterModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
      />
      <MobileBottomNav />

      {/* Global Conversion Triggers & Interactive Orbs */}
      <LiveSocialProof />
      <FloatingAIOrb />
      <ScrollToTop />
      <EasterEgg />
      <TextSelectionAI />
    </div>
  );
}
