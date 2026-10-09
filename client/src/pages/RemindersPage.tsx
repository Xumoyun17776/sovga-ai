import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { reminders, auth, formatPrice } from "../lib/api";
import { useTranslation } from "../lib/i18n";
import { useToast } from "../components/Toast";
import {
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  Bell,
  Cake,
  Heart,
  GraduationCap,
  Gift,
  ArrowRight,
  Clock,
  TrendingDown,
  CheckCircle2,
  Search,
  Flag,
} from "lucide-react";

interface NationalHoliday {
  name: string;
  date: string; // MM-DD
  occasion: string;
  category: "national" | "religious" | "international";
  tip: string;
}

const UZBEKISTAN_HOLIDAYS: NationalHoliday[] = [
  {
    name: "Yangi Yil Bayrami",
    date: "01-01",
    occasion: "holiday",
    category: "national",
    tip: "Yaqinlar, oila a'zolari va hamkasblar uchun qishki sovg'alar va shirinliklar.",
  },
  {
    name: "Vatan Himoyachilari Kuni",
    date: "01-14",
    occasion: "holiday",
    category: "national",
    tip: "Erkaklar, ota-onalar va yigitlar uchun sifatli aksessuarlar, parfyumeriya va texnika.",
  },
  {
    name: "Xalqaro Xotin-qizlar Kuni (8-Mart)",
    date: "03-08",
    occasion: "holiday",
    category: "international",
    tip: "Onalar, opa-singillar va ayollar uchun gullar, parvarish to'plamlari va zargarlik buyumlari.",
  },
  {
    name: "Navro'z Umumxalq Bayrami",
    date: "03-21",
    occasion: "holiday",
    category: "national",
    tip: "Milliy shirinliklar, sumalak sovg'alari, dasturxon bezaklari va ipak liboslar.",
  },
  {
    name: "Xotira va Qadrlash Kuni",
    date: "05-09",
    occasion: "holiday",
    category: "national",
    tip: "Katta yoshdagi faxriylar va ota-onalar ehtiromi uchun qulaylik va salomatlik buyumlari.",
  },
  {
    name: "O'zbekiston Mustaqilligi Kuni",
    date: "09-01",
    occasion: "holiday",
    category: "national",
    tip: "Yurt bayrami, yangi o'quv yili arafasidagi sovg'alar va milliy esdaliklar.",
  },
  {
    name: "O'qituvchi va Murabbiylar Kuni",
    date: "10-01",
    occasion: "teacher",
    category: "national",
    tip: "Ustozlar uchun kitoblar, xattotlik qalamlari, termos va nafis esdalik sovg'alari.",
  },
  {
    name: "Konstitutsiya Kuni",
    date: "12-08",
    occasion: "holiday",
    category: "national",
    tip: "Korporativ esdaliklar va yangi yil tayyorgarligi.",
  },
];

export default function RemindersPage() {
  const { t, language } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: auth.me });

  // Server reminders if logged in
  const { data: serverReminders = [], isLoading } = useQuery({
    queryKey: ["reminders"],
    queryFn: reminders.list,
    enabled: !!user,
  });

  // Local reminders for guests
  const [localReminders, setLocalReminders] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("sovga_local_reminders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<"personal" | "holidays">("personal");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: "",
    personName: "",
    eventType: "birthday",
    eventDate: "",
    budget: "350000",
    notes: "",
  });

  useEffect(() => {
    try {
      localStorage.setItem("sovga_local_reminders", JSON.stringify(localReminders));
    } catch (e) {}
  }, [localReminders]);

  const createMut = useMutation({
    mutationFn: (data: any) =>
      reminders.create({
        ...data,
        budget: data.budget ? parseFloat(data.budget) : 350000,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      setShowAdd(false);
      setForm({ title: "", personName: "", eventType: "birthday", eventDate: "", budget: "350000", notes: "" });
      toast.success("Eslatma saqlandi!", "Muvaffaqiyatli");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => reminders.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Eslatma o'chirildi", "O'chirildi");
    },
  });

  const handleCreateReminder = () => {
    if (!form.personName || !form.eventDate) {
      toast.error("Ism va sanani kiriting!", "Xatolik");
      return;
    }

    if (user) {
      createMut.mutate(form);
    } else {
      const newLocal = {
        id: "loc-" + Date.now(),
        personName: form.personName,
        eventType: form.eventType,
        eventDate: form.eventDate,
        budget: Number(form.budget) || 350000,
        notes: form.notes,
        createdAt: new Date().toISOString(),
      };
      setLocalReminders([newLocal, ...localReminders]);
      setShowAdd(false);
      setForm({ title: "", personName: "", eventType: "birthday", eventDate: "", budget: "350000", notes: "" });
      toast.success("Eslatma saqlandi!", "Muvaffaqiyatli");
    }
  };

  const handleDeleteLocal = (id: string) => {
    setLocalReminders(localReminders.filter((r) => r.id !== id));
    toast.success("Eslatma o'chirildi", "O'chirildi");
  };

  const handleResearchForHoliday = (holiday: NationalHoliday) => {
    navigate(`/search?q=${encodeURIComponent(holiday.name + " sovg'asi")}`);
  };

  const handleResearchForReminder = (r: any) => {
    const budgetText = r.budget ? ` ${Math.round(r.budget / 1000)} ming so'm` : "";
    const query = `${r.personName} uchun ${r.eventType} sovg'asi${budgetText}`;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  // Helper to compute days until holiday this year
  const getDaysUntilHoliday = (dateMMDD: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const [month, day] = dateMMDD.split("-").map(Number);
    let target = new Date(currentYear, month - 1, day);

    if (target.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
      target = new Date(currentYear + 1, month - 1, day);
    }

    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const currentReminders = user ? serverReminders : localReminders;

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] text-slate-900 dark:text-white py-10 px-4 sm:px-6 lg:px-8 transition-colors relative overflow-hidden animate-fade-in">
      {/* Artisanal Ambient Vignette & Warm Gold Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1000px,100vw)] max-w-full h-[400px] bg-gradient-to-b from-amber-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-10 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3.5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-gold-500/20 to-amber-500/15 border border-gold-500/30 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-widest shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
            <span>Muhim Sanalar & Sovg'a Taqvimi</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-slate-900 dark:text-white">
            Sovg'a Eslatmalari & <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Bayramlar Taqvimi</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Yaqinlaringizning tug'ilgan kunlari, yubileylari hamda O'zbekiston umumxalq bayramlarini
            oldindan rejalashtiring. AI belgilangan byudjetingizga mos sovg'alarni o'z vaqtida topib beradi.
          </p>
        </div>

        {/* Tab Switcher & Add Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] p-4 sm:p-5 rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("personal")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer active:scale-95 ${
                activeTab === "personal"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/25 border border-amber-500"
                  : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-amber-200/70 dark:border-slate-800 hover:border-amber-400"
              }`}
            >
              {language === "uz"
                ? `Shaxsiy Sanalarim (${currentReminders.length})`
                : language === "ru"
                ? `Мои Памятные Даты (${currentReminders.length})`
                : `My Personal Dates (${currentReminders.length})`}
            </button>
            <button
              onClick={() => setActiveTab("holidays")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === "holidays"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/25 border border-amber-500"
                  : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-amber-200/70 dark:border-slate-800 hover:border-amber-400"
              }`}
            >
              <Flag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              <span>
                {language === "uz"
                  ? `O'zbekiston Bayramlari (${UZBEKISTAN_HOLIDAYS.length})`
                  : language === "ru"
                  ? `Праздники Узбекистана (${UZBEKISTAN_HOLIDAYS.length})`
                  : `Uzbekistan Holidays (${UZBEKISTAN_HOLIDAYS.length})`}
              </span>
            </button>
          </div>

          {activeTab === "personal" && (
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[2.2]" />
              <span>
                {language === "uz" ? "Yangi Sana Qo'shish" : language === "ru" ? "Добавить Дату" : "Add New Date"}
              </span>
            </button>
          )}
        </div>

        {/* Add Modal / Form */}
        {showAdd && (
          <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl p-6 sm:p-8 border-2 border-amber-300/80 dark:border-amber-500/30 shadow-luxury space-y-5 animate-fade-in text-slate-900 dark:text-white">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === "uz" ? "Yangi Shaxsiy Eslatma Yaratish" : language === "ru" ? "Создать Новое Напоминание" : "Create New Personal Reminder"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === "uz" ? "Yaqiningizning Ismi *" : language === "ru" ? "Имя близкого человека *" : "Person Name *"}
                </label>
                <input
                  type="text"
                  placeholder={
                    language === "uz"
                      ? "Masalan: Onajonim, Otabek, Davron"
                      : language === "ru"
                      ? "Например: Мама, Отабек, Даврон"
                      : "E.g. Mom, Alex, David"
                  }
                  value={form.personName}
                  onChange={(e) => setForm({ ...form, personName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === "uz" ? "Munosabat Turi" : language === "ru" ? "Повод события" : "Occasion Type"}
                </label>
                <select
                  value={form.eventType}
                  onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
                >
                  <option value="birthday">
                    {language === "uz" ? "Tug'ilgan kun" : language === "ru" ? "День рождения" : "Birthday"}
                  </option>
                  <option value="wedding">
                    {language === "uz" ? "To'y / Nikoh" : language === "ru" ? "Свадьба" : "Wedding"}
                  </option>
                  <option value="anniversary">
                    {language === "uz" ? "Yubiley / Yillik sana" : language === "ru" ? "Годовщина / Юбилей" : "Anniversary"}
                  </option>
                  <option value="graduation">
                    {language === "uz" ? "O'qishni bitirish" : language === "ru" ? "Выпускной" : "Graduation"}
                  </option>
                  <option value="other">
                    {language === "uz" ? "Boshqa maxsus sana" : language === "ru" ? "Другая важная дата" : "Other Special Occasion"}
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === "uz" ? "Sana *" : language === "ru" ? "Дата *" : "Date *"}
                </label>
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === "uz" ? "Rejalashtirilgan Byudjet (UZS)" : language === "ru" ? "Планируемый бюджет (UZS)" : "Planned Budget (UZS)"}
                </label>
                <input
                  type="number"
                  placeholder="350000"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === "uz" ? "Qo'shimcha Qiziqishlar / Izoh (ixtiyoriy)" : language === "ru" ? "Интересы / Заметки (необязательно)" : "Interests / Notes (optional)"}
                </label>
                <input
                  type="text"
                  placeholder={
                    language === "uz"
                      ? "Masalan: Texnika ishqibozi, sevimli rangi ko'k..."
                      : language === "ru"
                      ? "Например: Любит гаджеты, синий цвет..."
                      : "E.g. Tech lover, favorite color blue..."
                  }
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-100 dark:border-slate-800">
              <button
                onClick={() => setShowAdd(false)}
                className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer active:scale-95"
              >
                {language === "uz" ? "Bekor qilish" : language === "ru" ? "Отмена" : "Cancel"}
              </button>
              <button
                onClick={handleCreateReminder}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-2xl text-xs transition shadow-md shadow-amber-500/25 cursor-pointer active:scale-95"
              >
                {language === "uz" ? "Eslatmani Saqlash" : language === "ru" ? "Сохранить Напоминание" : "Save Reminder"}
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Personal Reminders */}
        {activeTab === "personal" && (
          <div className="space-y-4">
            {currentReminders.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/20 p-8 space-y-3 shadow-luxury">
                <div className="w-14 h-14 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center mx-auto">
                  <Cake className="w-7 h-7 text-amber-500 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Hali shaxsiy eslatmalar kiritilmagan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Yaqinlaringizning tug'ilgan kunlarini kiriting, tizim sovg'alarni oldindan tavsiya qiladi.
                </p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black rounded-2xl shadow-md shadow-amber-500/25 transition cursor-pointer active:scale-95"
                >
                  Birinchi eslatmani qo'shish
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentReminders.map((r: any) => {
                  return (
                    <div
                      key={r.id}
                      className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl p-6 border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-500/40 transition space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold border border-amber-300/70 dark:border-amber-500/30">
                              {r.eventType === "birthday"
                                ? "Tug'ilgan kun"
                                : r.eventType === "wedding"
                                ? "To'y"
                                : "Muhim sana"}
                            </span>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                              {r.personName}
                            </h4>
                          </div>

                          <button
                            onClick={() => (user ? deleteMut.mutate(r.id) : handleDeleteLocal(r.id))}
                            className="w-8 h-8 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-95"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-amber-100 dark:border-slate-800 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Sana:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{r.eventDate}</span>
                          </div>
                          {r.budget && (
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">Rejadagi byudjet:</span>
                              <span className="font-bold text-amber-600 dark:text-amber-400">
                                {formatPrice(r.budget)}
                              </span>
                            </div>
                          )}
                          {r.notes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 italic border-t border-amber-50 dark:border-slate-800">
                              "{r.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-amber-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.2]" />
                          <span>AI qidiruvi tayyor</span>
                        </span>
                        <button
                          onClick={() => handleResearchForReminder(r)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:text-amber-900 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-300/70 dark:border-amber-500/30 transition cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <Search className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span>Sovg'a Topish</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: National Holidays */}
        {activeTab === "holidays" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {UZBEKISTAN_HOLIDAYS.map((h, idx) => {
              const daysLeft = getDaysUntilHoliday(h.date);
              const isSoon = daysLeft <= 30;

              return (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl p-6 border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-500/40 transition space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                            {h.date.replace("-", ".")}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isSoon
                                ? "bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-400/80 dark:border-amber-500/40"
                                : "bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-amber-200/70 dark:border-slate-800"
                            }`}
                          >
                            {daysLeft} kundan so'ng
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">{h.name}</h4>
                      </div>

                      <div className="w-10 h-10 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center shrink-0">
                        <Gift className="w-5 h-5 text-amber-500 stroke-[2.2]" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-amber-100 dark:border-slate-800">
                      {h.tip}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-amber-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Bozor tahlili faol</span>
                    <button
                      onClick={() => handleResearchForHoliday(h)}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-slate-950 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 transition shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950 stroke-[2.2]" />
                      <span>Sovg'alarni Ko'rish</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
