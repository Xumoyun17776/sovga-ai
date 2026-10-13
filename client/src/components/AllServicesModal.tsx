import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { X, Search } from "../lib/icons";
import { useTranslation } from "../lib/i18n";
import { TOOL_GROUPS, pick } from "../lib/tools";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** Sheet listing every section of the site, grouped the same way as the navbar menu. */
export default function AllServicesModal({ isOpen, onClose }: Props) {
  const { language } = useTranslation();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return TOOL_GROUPS;
    return TOOL_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((it) => (pick(it.title, language) + " " + pick(it.desc, language)).toLowerCase().includes(needle)),
    })).filter((g) => g.items.length);
  }, [q, language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-3xl max-h-[88dvh] rounded-t-2xl sm:rounded-2xl border border-[var(--line)] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 border-b border-[var(--line)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              {language === "uz" ? "Barcha bo'limlar" : language === "ru" ? "Все разделы" : "Everything on Sovg'a"}
            </h2>
            <button onClick={onClose} aria-label={language === "uz" ? "Yopish" : language === "ru" ? "Закрыть" : "Close"} className="w-9 h-9 rounded-lg hover:bg-[var(--surface-2)] flex items-center justify-center cursor-pointer">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <label className="mt-3 flex items-center gap-2 h-10 px-3 rounded-lg border border-[var(--line)] focus-within:border-[var(--line-strong)]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={language === "uz" ? "Bo'limni qidirish" : language === "ru" ? "Найти раздел" : "Find a section"}
              className="flex-1 bg-transparent outline-none text-sm"
              autoFocus
            />
          </label>
        </div>

        <div className="overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          {groups.map((g) => (
            <div key={g.id}>
              <p className="text-xs font-semibold text-slate-500 mb-1.5 px-2">{pick(g.title, language)}</p>
              {g.items.map((it) => {
                const Icon = it.icon;
                return (
                  <Link key={it.href} href={it.href} onClick={onClose} className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-[var(--surface-2)]">
                    <Icon className="w-4 h-4 mt-0.5 text-[var(--accent)] flex-shrink-0" />
                    <span>
                      <span className="block text-sm font-medium text-slate-900">{pick(it.title, language)}</span>
                      <span className="block text-xs text-slate-500">{pick(it.desc, language)}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
          {groups.length === 0 && (
            <p className="text-sm text-slate-500 px-2">{language === "uz" ? "Hech narsa topilmadi" : language === "ru" ? "Ничего не найдено" : "Nothing found"}</p>
          )}
        </div>
      </div>
    </div>
  );
}
