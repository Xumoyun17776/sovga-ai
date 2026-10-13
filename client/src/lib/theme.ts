import { create } from "zustand";

/** Light (default) or night mode. The choice is remembered per browser; index.html applies it before first paint. */
export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const KEY = "sovga_theme";

function readStored(): Theme {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function apply(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0A1020" : "#FFFFFF");
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
}

const initial: Theme = typeof window === "undefined" ? "light" : readStored();
apply(initial);

export const useTheme = create<ThemeState>((set, get) => ({
  theme: initial,
  isDark: initial === "dark",
  setTheme: (theme) => {
    apply(theme);
    set({ theme, isDark: theme === "dark" });
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
}));
