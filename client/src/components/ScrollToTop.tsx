import { useState, useEffect } from "react";
import { ArrowUp } from "../lib/icons";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Tepaga qaytish"
      className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8 z-40 p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-md hover:shadow-md hover:border-[var(--line-strong)] transition-all duration-300 group"
    >
      <ArrowUp className="w-5 h-5 group-hover:text-amber-500 transition-colors" />
    </button>
  );
}
