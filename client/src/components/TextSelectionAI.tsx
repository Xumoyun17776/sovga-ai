import { useState, useEffect } from "react";
import { Sparkles, Search } from "../lib/icons";
import { useLocation } from "wouter";

export default function TextSelectionAI() {
  const [, setLocation] = useLocation();
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      const activeSelection = window.getSelection();
      if (!activeSelection || activeSelection.isCollapsed) {
        setSelection(null);
        return;
      }

      const text = activeSelection.toString().trim();
      if (text.length > 2 && text.length < 100) {
        const range = activeSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelection({
          text,
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
      } else {
        setSelection(null);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Don't close if clicking inside the tooltip
      if ((e.target as HTMLElement).closest("#ai-selection-tooltip")) return;
      setSelection(null);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  if (!selection) return null;

  return (
    <div
      id="ai-selection-tooltip"
      className="fixed z-[99999] -translate-x-1/2 -translate-y-full animate-slide-down flex items-center gap-1 p-1 bg-slate-900 dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-700 pointer-events-auto"
      style={{ left: selection.x, top: selection.y }}
    >
      <button
        onClick={() => {
          setLocation(`/search?q=${encodeURIComponent(selection.text)}`);
          setSelection(null);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:bg-slate-700 transition"
      >
        <Search className="w-3.5 h-3.5 text-slate-300" />
        <span>Qidirish</span>
      </button>
      <div className="w-px h-4 bg-slate-700 mx-1"></div>
      <button
        onClick={() => {
          // You could trigger an AI explanation modal here
          alert(`AI Tahlili: "${selection.text}" mahsuloti bo'yicha ma'lumot qidirilmoqda...`);
          setSelection(null);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-400 hover:bg-slate-700 transition"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>AI Analiz</span>
      </button>
      
      {/* Little triangle arrow pointing down */}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 dark:bg-slate-800 border-b border-r border-slate-700 rotate-45"></div>
    </div>
  );
}
