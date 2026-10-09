import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { initPerformanceTelemetry } from "./lib/vitals";

initPerformanceTelemetry();

// Initialize Telegram Mini App if opened inside Telegram
if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
  try {
    (window as any).Telegram.WebApp.ready();
    (window as any).Telegram.WebApp.expand();
  } catch (e) {
    /* ignore */
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60000, refetchOnWindowFocus: false },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
