import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X, Bell } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "alert";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info", title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const value = {
    toast: addToast,
    success: (message: string, title?: string) => addToast(message, "success", title),
    error: (message: string, title?: string) => addToast(message, "error", title),
    info: (message: string, title?: string) => addToast(message, "info", title),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slide-up ${
              t.type === "success"
                ? "bg-white/95 border-emerald-200 text-emerald-950 shadow-emerald-500/10"
                : t.type === "error"
                ? "bg-white/95 border-red-200 text-red-950 shadow-red-500/10"
                : "bg-white/95 border-brand-200 text-gray-900 shadow-brand-500/10"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
              {t.type === "info" && <Info className="w-5 h-5 text-brand-500" />}
              {t.type === "alert" && <Bell className="w-5 h-5 text-amber-500" />}
            </div>

            <div className="flex-1 min-w-0">
              {t.title && <h5 className="font-bold text-xs tracking-wide uppercase text-gray-800 mb-0.5">{t.title}</h5>}
              <p className="text-xs sm:text-sm font-medium text-gray-700 leading-snug">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful fallback if invoked outside provider
    return {
      toast: (msg: string) => console.log(msg),
      success: (msg: string) => console.log(msg),
      error: (msg: string) => console.error(msg),
      info: (msg: string) => console.info(msg),
    };
  }
  return ctx;
}
