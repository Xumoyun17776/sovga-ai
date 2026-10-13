import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { reminders, auth, formatPrice } from "../lib/api";
import { useTranslation, tr } from "../lib/i18n";
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
} from "../lib/icons";

interface NationalHoliday {
  name: string;
  date: string; // MM-DD
  occasion: string;
  category: "national" | "religious" | "international";
  tip: string;
}

const get_UZBEKISTAN_HOLIDAYS = (): NationalHoliday[] => [
  {
    name: tr("Yangi Yil Bayrami", "Новый год", "New Year"),
    date: "01-01",
    occasion: "holiday",
    category: "national",
    tip: tr("Yaqinlar, oila a'zolari va hamkasblar uchun qishki sovg'alar va shirinliklar.", "Зимние подарки и сладости для близких и коллег.", "Winter gifts and sweets for family and colleagues."),
  },
  {
    name: tr("Vatan Himoyachilari Kuni", "День защитников Родины", "Defenders of the Motherland Day"),
    date: "01-14",
    occasion: "holiday",
    category: "national",
    tip: tr("Erkaklar, ota-onalar va yigitlar uchun sifatli aksessuarlar, parfyumeriya va texnika.", "Аксессуары, парфюм и техника для мужчин.", "Accessories, fragrance and gadgets for men."),
  },
  {
    name: tr("Xalqaro Xotin-qizlar Kuni (8-Mart)", "Международный женский день (8 марта)", "International Women's Day (8 March)"),
    date: "03-08",
    occasion: "holiday",
    category: "international",
    tip: tr("Onalar, opa-singillar va ayollar uchun gullar, parvarish to'plamlari va zargarlik buyumlari.", "Цветы, уход и украшения для мам, сестёр и всех женщин.", "Flowers, care sets and jewellery for mothers, sisters and all women."),
  },
  {
    name: tr("Navro'z Umumxalq Bayrami", "Навруз", "Navruz"),
    date: "03-21",
    occasion: "holiday",
    category: "national",
    tip: tr("Milliy shirinliklar, sumalak sovg'alari, dasturxon bezaklari va ipak liboslar.", "Национальные сладости, сумаляк, украшения для дастархана и шёлк.", "Traditional sweets, sumalak, table decor and silk."),
  },
  {
    name: tr("Xotira va Qadrlash Kuni", "День памяти и почестей", "Day of Remembrance and Honour"),
    date: "05-09",
    occasion: "holiday",
    category: "national",
    tip: tr("Katta yoshdagi faxriylar va ota-onalar ehtiromi uchun qulaylik va salomatlik buyumlari.", "Товары для комфорта и здоровья старшего поколения.", "Comfort and health items for older relatives and veterans."),
  },
  {
    name: tr("O'zbekiston Mustaqilligi Kuni", "День независимости Узбекистана", "Uzbekistan Independence Day"),
    date: "09-01",
    occasion: "holiday",
    category: "national",
    tip: tr("Yurt bayrami, yangi o'quv yili arafasidagi sovg'alar va milliy esdaliklar.", "Подарки к празднику и началу учебного года, национальные сувениры.", "Holiday and back-to-school gifts, national souvenirs."),
  },
  {
    name: tr("O'qituvchi va Murabbiylar Kuni", "День учителя и наставника", "Teachers' and Mentors' Day"),
    date: "10-01",
    occasion: "teacher",
    category: "national",
    tip: tr("Ustozlar uchun kitoblar, xattotlik qalamlari, termos va nafis esdalik sovg'alari.", "Книги, ручки, термосы и памятные подарки для учителей.", "Books, pens, thermoses and keepsakes for teachers."),
  },
  {
    name: tr("Konstitutsiya Kuni", "День Конституции", "Constitution Day"),
    date: "12-08",
    occasion: "holiday",
    category: "national",
    tip: tr("Korporativ esdaliklar va yangi yil tayyorgarligi.", "Корпоративные сувениры и подготовка к Новому году.", "Corporate keepsakes and New Year preparations."),
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
      toast.success(tr("Eslatma saqlandi!", "Напоминание сохранено", "Reminder saved"), "Muvaffaqiyatli");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => reminders.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      toast.success(tr("Eslatma o'chirildi", "Напоминание удалено", "Reminder deleted"), tr("O'chirildi", "Удалено", "Deleted"));
    },
  });

  const handleCreateReminder = () => {
    if (!form.personName || !form.eventDate) {
      toast.error(tr("Ism va sanani kiriting!", "Введите имя и дату", "Enter a name and date"), "Xatolik");
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
      toast.success(tr("Eslatma saqlandi!", "Напоминание сохранено", "Reminder saved"), "Muvaffaqiyatli");
    }
  };

  const handleDeleteLocal = (id: string) => {
    setLocalReminders(localReminders.filter((r) => r.id !== id));
    toast.success(tr("Eslatma o'chirildi", "Напоминание удалено", "Reminder deleted"), tr("O'chirildi", "Удалено", "Deleted"));
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
    <div className="min-h-screen text-slate-900 dark:text-white py-10 px-4 sm:px-6 lg:px-8 transition-colors relative overflow-hidden animate-fade-in">
      {/* Artisanal Ambient Vignette & Warm Gold Lighting */}

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3.5 max-w-3xl mx-auto">
          <h1 className="lux-title text-[2.4rem] sm:text-[3.2rem] text-slate-900 dark:text-white leading-[1.05]">
            {language === "uz" ? "Eslatmalar" : language === "ru" ? "Напоминания" : "Reminders"}
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            {language === "uz" ? "Yaqinlaringizning tug'ilgan kunlari, yubileylar va bayramlarni qo'shing — vaqtida eslatamiz va byudjetingizga mos g'oyalar beramiz." : language === "ru" ? "Добавьте дни рождения, годовщины и праздники близких — мы напомним вовремя и предложим идеи под ваш бюджет." : "Add birthdays, anniversaries and holidays, and we'll remind you in time with ideas that fit your budget."}
          </p>
        </div>

        {/* Tab Switcher & Add Button */}
        <div className="bg-white dark:bg-[#0b1224] flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 shadow-sm">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("personal")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "personal"
                  ? "text-white font-bold shadow-md border border-amber-500 bg-amber-500"
                  : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)]"
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
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "holidays"
                  ? "text-white font-bold shadow-md border border-amber-500 bg-amber-500"
                  : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)]"
              }`}
            >
              <Flag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
              <span>
                {language === "uz"
                  ? `O'zbekiston Bayramlari (${get_UZBEKISTAN_HOLIDAYS().length})`
                  : language === "ru"
                  ? `Праздники Узбекистана (${get_UZBEKISTAN_HOLIDAYS().length})`
                  : `Uzbekistan Holidays (${get_UZBEKISTAN_HOLIDAYS().length})`}
              </span>
            </button>
          </div>

          {activeTab === "personal" && (
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="w-full sm:w-auto px-6 py-2.5 text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer bg-amber-500 hover:bg-amber-400"
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
          <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 sm:p-8 border border-[var(--line)] dark:border-amber-500/30 shadow-sm space-y-5 animate-fade-in text-slate-900 dark:text-white">
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
                  className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === "uz" ? "Munosabat Turi" : language === "ru" ? "Повод события" : "Occasion Type"}
                </label>
                <select
                  value={form.eventType}
                  onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
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
                  className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
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
                  className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
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
                  className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)] dark:border-slate-800">
              <button
                onClick={() => setShowAdd(false)}
                className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                {language === "uz" ? "Bekor qilish" : language === "ru" ? "Отмена" : "Cancel"}
              </button>
              <button
                onClick={handleCreateReminder}
                className="px-6 py-2.5 text-white font-bold rounded-2xl text-xs transition shadow-md cursor-pointer bg-amber-500 hover:bg-amber-400"
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
              <div className="bg-white dark:bg-[#0b1224] text-center py-16 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 p-8 space-y-3 shadow-sm">
                <div className="w-14 h-14 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center mx-auto">
                  <Cake className="w-7 h-7 text-amber-500 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {tr("Hali shaxsiy eslatmalar kiritilmagan", "Личных напоминаний пока нет", "No personal reminders yet")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {tr("Yaqinlaringizning tug'ilgan kunlarini kiriting, tizim sovg'alarni oldindan tavsiya qiladi.", "Добавьте дни рождения близких — мы заранее подскажем подарки.", "Add your loved ones' birthdays and we'll suggest gifts ahead of time.")}
                </p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="px-6 py-2.5 text-white text-xs font-bold rounded-2xl shadow-md transition cursor-pointer bg-amber-500 hover:bg-amber-400"
                >
                  {tr("Birinchi eslatmani qo'shish", "Добавить первое напоминание", "Add your first reminder")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentReminders.map((r: any) => {
                  return (
                    <div
                      key={r.id}
                      className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 border border-[var(--line)] dark:border-amber-500/20 shadow-sm flex flex-col justify-between hover:border-[var(--line-strong)] dark:hover:border-amber-500/40 transition space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-[var(--line)] bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
                              {r.eventType === "birthday"
                                ? "Tug'ilgan kun"
                                : r.eventType === "wedding"
                                ? "To'y"
                                : tr("Muhim sana", "Важная дата", "Important date")}
                            </span>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                              {r.personName}
                            </h4>
                          </div>

                          <button
                            onClick={() => (user ? deleteMut.mutate(r.id) : handleDeleteLocal(r.id))}
                            className="w-8 h-8 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer shadow-2xs"
                            title={tr("O'chirish", "Удалить", "Delete")}
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-[var(--line)] dark:border-slate-800 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">{tr("Sana:", "Дата:", "Date:")}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{r.eventDate}</span>
                          </div>
                          {r.budget && (
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">{tr("Rejadagi byudjet:", "Бюджет:", "Budget:")}</span>
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

                      <div className="pt-3 border-t border-[var(--line)] dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.2]" />
                          <span>{tr("AI qidiruvi tayyor", "Поиск готов", "Search ready")}</span>
                        </span>
                        <button
                          onClick={() => handleResearchForReminder(r)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:text-amber-900 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-[var(--line)] dark:border-amber-500/30 transition cursor-pointer shadow-2xs"
                        >
                          <Search className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span>{tr("Sovg'a Topish", "Найти подарок", "Find a gift")}</span>
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
            {get_UZBEKISTAN_HOLIDAYS().map((h, idx) => {
              const daysLeft = getDaysUntilHoliday(h.date);
              const isSoon = daysLeft <= 30;

              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 border border-[var(--line)] dark:border-amber-500/20 shadow-sm flex flex-col justify-between hover:border-[var(--line-strong)] dark:hover:border-amber-500/40 transition space-y-4"
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
                                : "bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-[var(--line)] dark:border-slate-800"
                            }`}
                          >
                            {daysLeft} kundan so'ng
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{h.name}</h4>
                      </div>

                      <div className="w-10 h-10 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center shrink-0">
                        <Gift className="w-5 h-5 text-amber-500 stroke-[2.2]" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-[var(--line)] dark:border-slate-800">
                      {h.tip}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--line)] dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Bozor tahlili faol</span>
                    <button
                      onClick={() => handleResearchForHoliday(h)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl transition shadow-sm cursor-pointer bg-amber-500 hover:bg-amber-400"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950 stroke-[2.2]" />
                      <span>{tr("Sovg'alarni Ko'rish", "Смотреть подарки", "See gifts")}</span>
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
