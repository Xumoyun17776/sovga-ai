import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "../lib/icons";
import { useTranslation } from "../lib/i18n";

export default function NetworkStatusIndicator() {
  const { language } = useTranslation();
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showBackOnline) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
      <div
        className={`px-4 py-2.5 rounded-full flex items-center gap-2.5 shadow-sm backdrop-blur-xl border font-bold text-xs ${
          isOnline
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            : "bg-rose-500/90 text-white border-rose-600"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>
              {language === "uz"
                ? "Tarmoqqa ulandingiz"
                : language === "ru"
                ? "Соединение восстановлено"
                : "Connection Restored"}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>
              {language === "uz"
                ? "Internet uzildi. Oflaynsiz"
                : language === "ru"
                ? "Нет подключения к интернету"
                : "You are offline"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
