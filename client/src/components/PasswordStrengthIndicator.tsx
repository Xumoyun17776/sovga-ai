import React from "react";
import { Check } from "../lib/icons";

interface Props {
  password: string;
  language?: string;
  showChecklist?: boolean;
}

export default function PasswordStrengthIndicator({
  password,
  language = "en",
  showChecklist = true,
}: Props) {
  if (!password) return null;

  const hasLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const criteriaMet = [hasLength, hasLower && hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  let label = language === "uz" ? "Juda zaif" : language === "ru" ? "Очень слабый" : "Very Weak";
  let barColor = "bg-rose-500";
  let textColor = "text-rose-500";
  let percent = 25;

  if (criteriaMet === 2) {
    label = language === "uz" ? "O'rtacha" : language === "ru" ? "Средний" : "Fair";
    barColor = "bg-amber-500";
    textColor = "text-amber-500";
    percent = 50;
  } else if (criteriaMet === 3) {
    label = language === "uz" ? "Yaxshi" : language === "ru" ? "Хороший" : "Strong";
    barColor = "bg-blue-500";
    textColor = "text-blue-500";
    percent = 75;
  } else if (criteriaMet >= 4) {
    label = language === "uz" ? "Mukammal" : language === "ru" ? "Отличный" : "Very Strong";
    barColor = "bg-emerald-500";
    textColor = "text-emerald-500";
    percent = 100;
  }

  return (
    <div className="space-y-2 pt-1 animate-fade-in">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500 dark:text-slate-400">
          {language === "uz"
            ? "Parol mustahkamligi:"
            : language === "ru"
            ? "Надежность пароля:"
            : "Password strength:"}
        </span>
        <span className={`font-bold ${textColor}`}>{label}</span>
      </div>

      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {showChecklist && (
        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
          <div className={`flex items-center gap-1.5 ${hasLength ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400"}`}>
            {hasLength ? <Check className="w-3 h-3 text-emerald-500 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 ml-1 shrink-0" />}
            <span>{language === "uz" ? "8+ ta belgi" : language === "ru" ? "8+ символов" : "8+ characters"}</span>
          </div>

          <div className={`flex items-center gap-1.5 ${hasLower && hasUpper ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400"}`}>
            {hasLower && hasUpper ? <Check className="w-3 h-3 text-emerald-500 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 ml-1 shrink-0" />}
            <span>{language === "uz" ? "Katta va kichik harf" : language === "ru" ? "Заглавные и строчные" : "Upper & lower case"}</span>
          </div>

          <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400"}`}>
            {hasNumber ? <Check className="w-3 h-3 text-emerald-500 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 ml-1 shrink-0" />}
            <span>{language === "uz" ? "Raqamlar (0-9)" : language === "ru" ? "Цифры (0-9)" : "Numbers (0-9)"}</span>
          </div>

          <div className={`flex items-center gap-1.5 ${hasSpecial ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400"}`}>
            {hasSpecial ? <Check className="w-3 h-3 text-emerald-500 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 ml-1 shrink-0" />}
            <span>{language === "uz" ? "Maxsus belgi (!@#)" : language === "ru" ? "Спецсимвол (!@#)" : "Symbol (!@#)"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
