import React, { useState, useEffect } from "react";
import { MessageSquare, Copy, Check, Sparkles, X, ArrowDownRight } from "../lib/icons";
import { useToast } from "./Toast";
import { cyberSound } from "../lib/cyberSound";
import { copyText } from "../lib/clipboard";

interface Props {
  code: string;
  phone: string;
  onFillCode?: (code: string) => void;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export default function SmsNotificationBanner({
  code,
  phone,
  onFillCode,
  onDismiss,
  autoDismissMs = 30000,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);
  const toast = useToast();

  useEffect(() => {
    try {
      cyberSound.play("chime");
    } catch {}
    const t = setTimeout(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    }, autoDismissMs);
    return () => clearTimeout(t);
  }, [code, autoDismissMs, onDismiss]);

  if (!visible || !code) return null;

  const handleCopy = () => {
    copyText(code);
    setCopied(true);
    toast.info("Tasdiqlash kodi nusxalandi");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFill = () => {
    if (onFillCode) {
      onFillCode(code);
      try {
        cyberSound.play("click");
      } catch {}
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md">
      <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl border border-amber-400/40 text-white p-4 rounded-2xl shadow-sm ring-1 ring-amber-400/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold shadow-md flex-shrink-0 animate-pulse bg-amber-500">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  SMS Gateway • Sovg'a AI
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Kodingiz: <span className="font-mono font-bold text-amber-300 text-base tracking-wide">{code}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setVisible(false);
              if (onDismiss) onDismiss();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            title="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-slate-400 mt-2">
          Maxfiy xabarnoma: Kodni hech kimga bermang. Muddati: 2 daqiqa.
        </p>

        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-slate-700/80 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? "Nusxalandi" : "Nusxalash"}</span>
          </button>

          {onFillCode && (
            <button
              type="button"
              onClick={handleFill}
              className="flex-1 py-1.5 px-3 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer bg-amber-500 hover:bg-amber-400"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Avto Kiritish</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
