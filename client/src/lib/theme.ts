import { create } from "zustand";
import { cyberSound } from "./cyberSound";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem("sovga_theme");
    if (saved === "dark" || saved === "light") return saved;
    // Fall back to system preference or default dark
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {}
  // Default to cyber-luxury dark mode for the premium experience
  return "dark";
}

function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

// Immediately execute on load
if (typeof window !== "undefined") {
  const initial = getInitialTheme();
  applyThemeClass(initial);
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  isDark: getInitialTheme() === "dark",
  setTheme: (theme: Theme) => {
    try {
      localStorage.setItem("sovga_theme", theme);
    } catch {}
    applyThemeClass(theme);
    set({ theme, isDark: theme === "dark" });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next: Theme = current === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("sovga_theme", next);
    } catch {}
    applyThemeClass(next);
    cyberSound.playClick(1400);
    set({ theme: next, isDark: next === "dark" });
  },
}));
