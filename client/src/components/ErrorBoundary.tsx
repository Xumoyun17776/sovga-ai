import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "../lib/icons";
import { Link } from "wouter";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 text-white">
          <div className="relative max-w-lg w-full text-center space-y-6 z-10">
            
            <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto animate-pulse">
              <AlertCircle className="w-10 h-10" />
            </div>

            <div className="space-y-3">
              <h2 className="font-display font-bold text-3xl tracking-tight">
                Tizim Xatosi (Kernel Panic)
              </h2>
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Sovg'a AI interfeysida kutilmagan to'qnashuv yuz berdi. Iltimos, sahifani yangilang yoki asosiy menyuga qayting.
              </p>
              
              {this.state.error?.message && (
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-rose-500/20 mt-4 text-left shadow-inner">
                  <p className="text-[10px] font-mono font-bold text-rose-400 mb-1 uppercase tracking-wider">Exception Trace:</p>
                  <p className="text-xs font-mono text-slate-300 truncate">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-2xl text-xs font-bold transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Qayta yuklash (Reboot)</span>
              </button>

              <Link
                href="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl text-xs font-semibold transition flex items-center gap-2 border border-slate-700/80 hover:border-slate-600 hover:text-white"
              >
                <Home className="w-4 h-4" />
                <span>Bosh sahifaga</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
