import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import confetti from "canvas-confetti";
import { useToast } from "../components/Toast";
import { formatPrice } from "../lib/api";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation, tr } from "../lib/i18n";
import {
  ShieldCheck,
  Plus,
  Trash2,
  AlertTriangle,
  Clock,
  PhoneCall,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  HelpCircle,
  FileText,
  Search,
  Download,
  QrCode,
  Tag,
  Filter,
  Check,
  X,
} from "../lib/icons";

interface WarrantyItem {
  id: string;
  productName: string;
  store: string;
  purchaseDate: string;
  warrantyMonths: number;
  receiptNumber?: string;
  notes?: string;
  price?: number;
  warrantyType?: "official" | "store";
}

const DEFAULT_ITEMS: WarrantyItem[] = [
  {
    id: "item-1",
    productName: "Samsung Galaxy A55 5G",
    store: "Texnomart",
    purchaseDate: "2026-01-15",
    warrantyMonths: 12,
    receiptNumber: "TXN-984210",
    price: 4350000,
    warrantyType: "official",
    notes: "Ona uchun sovg'a. 1 yillik rasmiy dilerlik kafolati.",
  },
  {
    id: "item-2",
    productName: "Artel HD 276 FN Muzlatgich",
    store: "MediaPark",
    purchaseDate: "2025-08-10",
    warrantyMonths: 36,
    receiptNumber: "MP-552011",
    price: 2750000,
    warrantyType: "official",
    notes: "To'y sovg'asi. Kompressorga 3 yillik kafolat berilgan.",
  },
  {
    id: "item-3",
    productName: "DeLonghi Dolce Gusto Mini Me Kofemashina",
    store: "Uzum Market",
    purchaseDate: "2026-03-01",
    warrantyMonths: 12,
    receiptNumber: "UZM-110293",
    price: 650000,
    warrantyType: "official",
    notes: "Do'stning tug'ilgan kuniga sovg'a.",
  },
];

const get_SERVICE_CENTERS = () => [
  {
    store: "Texnomart",
    phone: "+998 71 209-99-44",
    hours: tr("09:00 - 21:00 (Har kuni)", "09:00 - 21:00 (ежедневно)", "09:00 - 21:00 (daily)"),
    address: tr("Toshkent sh., barcha Texnomart filiallari orqali qabul qilinadi", "Ташкент, приём во всех филиалах Texnomart", "Tashkent, accepted at all Texnomart branches"),
  },
  {
    store: "MediaPark",
    phone: "+998 71 203-33-33",
    hours: "09:00 - 20:00",
    address: tr("Toshkent sh., Qoratosh ko'chasi 11A / barcha do'konlar", "Ташкент, ул. Коратош 11А / все магазины", "Tashkent, 11A Qoratosh St. / all stores"),
  },
  {
    store: "Uzum Market",
    phone: "+998 78 777-07-99",
    hours: tr("24/7 Qo'llab-quvvatlash", "Поддержка 24/7", "24/7 support"),
    address: tr("Istalgan Uzum topshirish punkti (PVZ) orqali rasmiylashtirish", "Оформление через любой пункт выдачи Uzum", "Through any Uzum pickup point"),
  },
  {
    store: "Asaxiy",
    phone: "+998 71 200-01-05",
    hours: "09:00 - 20:00",
    address: tr("Toshkent sh., Chilonzor 2-mavze / kuryer orqali olib ketish", "Ташкент, Чиланзар-2 / курьер заберёт", "Tashkent, Chilanzar-2 / courier pickup"),
  },
];

export default function WarrantyVaultPage() {
  const toast = useToast();
  const { language } = useTranslation();
  const [items, setItems] = useState<WarrantyItem[]>(() => {
    try {
      const saved = localStorage.getItem("sovga_warranty_vault");
      return saved ? JSON.parse(saved) : DEFAULT_ITEMS;
    } catch {
      return DEFAULT_ITEMS;
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expiring" | "expired">("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    productName: "",
    store: "Texnomart",
    purchaseDate: new Date().toISOString().split("T")[0],
    warrantyMonths: 12,
    receiptNumber: "",
    price: "",
    warrantyType: "official" as "official" | "store",
    notes: "",
  });

  useEffect(() => {
    try {
      localStorage.setItem("sovga_warranty_vault", JSON.stringify(items));
    } catch {}
  }, [items]);

  // Helper to calculate days remaining
  const calculateDaysRemaining = (purchaseDate: string, warrantyMonths: number) => {
    const start = new Date(purchaseDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + warrantyMonths);

    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      daysRemaining: diffDays,
      expiryDate: end.toLocaleDateString("uz-UZ", { year: "numeric", month: "short", day: "numeric" }),
      isExpired: diffDays <= 0,
      isNearExpiry: diffDays > 0 && diffDays <= 45,
    };
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim()) {
      toast.error(tr("Mahsulot nomini kiriting!", "Введите название товара", "Enter the product name"), "Xatolik");
      return;
    }

    cyberSound.playConfirm();

    const newItem: WarrantyItem = {
      id: "w-" + Date.now().toString(36),
      productName: form.productName.trim(),
      store: form.store,
      purchaseDate: form.purchaseDate,
      warrantyMonths: Number(form.warrantyMonths) || 12,
      receiptNumber: form.receiptNumber.trim() || undefined,
      price: form.price ? Number(form.price) : undefined,
      warrantyType: form.warrantyType,
      notes: form.notes.trim() || undefined,
    };

    setItems([newItem, ...items]);
    setShowAddModal(false);
    setForm({
      productName: "",
      store: "Texnomart",
      purchaseDate: new Date().toISOString().split("T")[0],
      warrantyMonths: 12,
      receiptNumber: "",
      price: "",
      warrantyType: "official",
      notes: "",
    });

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
      colors: ["#10b981", "#3b82f6"],
    });

    toast.success(tr("Kafolat kartasi saqlandi!", "Гарантийная карта сохранена", "Warranty card saved"), tr("Kafolat Seyfiga muvaffaqiyatli qo'shildi", "Добавлено в хранилище гарантий", "Added to your warranty vault"));
  };

  const handleDeleteItem = (id: string) => {
    cyberSound.playClick();
    setItems(items.filter((i) => i.id !== id));
    toast.success(tr("Kafolat kartasi o'chirildi", "Гарантийная карта удалена", "Warranty card deleted"), tr("O'chirildi", "Удалено", "Deleted"));
  };

  const handleExportJson = () => {
    cyberSound.playConfirm();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sovga_ai_kafolat_seyfi_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(tr("Kafolat ma'lumotlari eksport qilindi!", "Данные гарантий экспортированы", "Warranty data exported"), "JSON fayl yuklab olindi");
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.receiptNumber && item.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      const st = calculateDaysRemaining(item.purchaseDate, item.warrantyMonths);
      if (statusFilter === "active") return !st.isExpired;
      if (statusFilter === "expiring") return st.isNearExpiry;
      if (statusFilter === "expired") return st.isExpired;

      return true;
    });
  }, [items, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen text-slate-900 dark:text-white py-10 px-4 sm:px-6 lg:px-8 transition-colors relative overflow-hidden animate-fade-in">
      {/* Artisanal Ambient Vignette & Warm Gold Lighting */}

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3.5 max-w-3xl mx-auto">
          <h1 className="lux-title text-[2.4rem] sm:text-[3.2rem] text-slate-900 dark:text-white leading-[1.05]">
            {language === "uz" ? "Kafolatlar" : language === "ru" ? "Гарантии" : "Warranty tracker"}
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            {language === "uz" ? "Texnika va qimmatbaho buyumlar cheklarini bir joyda saqlang, kafolat tugashidan oldin eslatma oling va servis markazi bilan bog'laning." : language === "ru" ? "Храните чеки на технику и ценные вещи в одном месте, получайте напоминание до конца гарантии и связывайтесь с сервисным центром." : "Keep receipts for electronics and valuables in one place, get a reminder before the warranty ends, and contact the service center."}
          </p>
        </div>

        {/* Action Header & Search & Stats */}
        <div className="bg-white dark:bg-[#0b1224] p-6 sm:p-7 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl icon-medallion icon-box-gold text-slate-950 font-bold text-xl flex items-center justify-center shrink-0">
                {items.length}
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">{tr("Saqlangan Kafolat Kartalari", "Сохранённые гарантийные карты", "Saved warranty cards")}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tr("Barcha cheklar va servis ma'lumotlari qurilmangizda xavfsiz saqlanmoqda", "Все чеки и сервисные данные хранятся на вашем устройстве", "All receipts and service details are stored on your device")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportJson}
                className="px-4 py-3 bg-white/90 dark:bg-slate-900/90 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-800 dark:text-amber-200 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-[var(--line)] dark:border-slate-800 cursor-pointer shadow-2xs"
                title={tr("Kafolat pasportlarini zaxiralash", "Сохранить резервную копию гарантий", "Back up your warranties")}
              >
                <Download className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                <span>{tr("Eksport (JSON)", "Экспорт (JSON)", "Export (JSON)")}</span>
              </button>

              <button
                onClick={() => {
                  cyberSound.playClick();
                  setShowAddModal(true);
                }}
                className="flex-1 sm:flex-none px-6 py-3 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer bg-amber-500 hover:bg-amber-400"
              >
                <Plus className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                <span>
                  {language === "uz" ? "Yangi Kafolat Qo'shish" : language === "ru" ? "Добавить Гарантию" : "Add New Warranty"}
                </span>
              </button>
            </div>
          </div>

          {/* Search bar & Status filter chips */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--line)] dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.2]" />
              <input
                type="text"
                placeholder={tr("Mahsulot yoki do'kon bo'yicha qidirish...", "Поиск по товару или магазину...", "Search by product or store...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-xl text-xs font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: tr("Barchasi", "Все", "All") },
                { id: "active", label: tr("🟢 Faol", "🟢 Действует", "🟢 Active") },
                { id: "expiring", label: tr("🟡 Tez kunda tugaydi", "🟡 Скоро истекает", "🟡 Expiring soon") },
                { id: "expired", label: tr("Tugagan", "Истекла", "Expired") },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    cyberSound.playClick();
                    setStatusFilter(f.id as any);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border whitespace-nowrap cursor-pointer shadow-2xs ${
                    statusFilter === f.id
                      ? "text-white font-bold border-amber-500 shadow-xs bg-amber-500"
                      : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Warranty Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const status = calculateDaysRemaining(item.purchaseDate, item.warrantyMonths);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#0b1224] rounded-2xl border border-[var(--line)] dark:border-amber-500/20 p-6 shadow-sm flex flex-col justify-between hover:border-[var(--line-strong)] dark:hover:border-amber-500/40 transition space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-[var(--line)] font-bold bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
                          {item.store}
                        </span>
                        {item.warrantyType === "official" && (
                          <span className="text-[10px] border px-2 py-0.5 rounded-full font-bold bg-[#f4f5f8] dark:bg-white/5 text-slate-600 dark:text-slate-300 border-[var(--line)]">
                            {tr("Rasmiy", "Официальная", "Official")}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                        {item.productName}
                      </h3>
                      {item.price && (
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          {formatPrice(item.price)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="w-8 h-8 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer shadow-2xs"
                      title={tr("O'chirish", "Удалить", "Delete")}
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.2]" />
                    </button>
                  </div>

                  {/* Status Banner */}
                  <div
                    className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between shadow-2xs ${
                      status.isExpired
                        ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                        : status.isNearExpiry
                        ? "bg-amber-50 dark:bg-amber-950/30 border-[var(--line)] dark:border-amber-800 text-amber-800 dark:text-amber-300"
                        : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0 stroke-[2.2]" />
                      <div>
                        <span className="font-bold block">
                          {status.isExpired
                            ? tr("Kafolat muddati tugagan", "Гарантия истекла", "Warranty expired")
                            : tr(`${status.daysRemaining} kun qoldi`, `Осталось ${status.daysRemaining} дн.`, `${status.daysRemaining} days left`)}
                        </span>
                        <span className="text-[10px] opacity-80 block">{tr("Tugash", "Истекает", "Ends")}: {status.expiryDate}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-lg bg-white/90 dark:bg-slate-900/90 shadow-2xs">
                      {status.isExpired ? tr("Tugadi", "Истекла", "Expired") : tr("Faol", "Действует", "Active")}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-[var(--line)] dark:border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-slate-400">{tr("Xarid sanasi:", "Дата покупки:", "Purchase date:")}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.purchaseDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-slate-400">{tr("Kafolat muddati:", "Срок гарантии:", "Warranty period:")}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.warrantyMonths} oy</span>
                    </div>
                    {item.receiptNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 dark:text-slate-400">{tr("Chek / Talon №:", "Чек / талон №:", "Receipt / coupon no.:")}</span>
                        <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{item.receiptNumber}</span>
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 italic border-t border-amber-50 dark:border-slate-800">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--line)] dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                    <span>{tr("Rasmiy ro'yxat", "Официальный список", "Official list")}</span>
                  </span>

                  <a
                    href={`tel:${
                      get_SERVICE_CENTERS().find((s) => s.store === item.store)?.phone.replace(/\s+/g, "") ||
                      "+998712000105"
                    }`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-[var(--line)] dark:border-amber-500/30 transition cursor-pointer shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>{tr("Servisga qo'ng'iroq", "Позвонить в сервис", "Call service")}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="bg-white dark:bg-[#0b1224] text-center py-12 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 space-y-2 shadow-sm">
            <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{tr("Kafolat kartasi topilmadi", "Гарантийная карта не найдена", "No warranty card found")}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tr("Qidiruv so'zini o'zgartiring yoki yangi kafolat kartasi qo'shing.", "Измените запрос или добавьте новую гарантийную карту.", "Change your search or add a new warranty card.")}
            </p>
          </div>
        )}

        {/* Store Service Directory */}
        <div className="bg-white dark:bg-[#0b1224] p-6 sm:p-8 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5 text-amber-500 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {tr("O'zbekiston Do'konlari Rasmiy Servis Markazlari Telefonlari", "Телефоны сервисных центров магазинов", "Store service centre phone numbers")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tr("To'g'ridan-to'g'ri bog'lanish va bepul kafolat ta'mirlash xizmatlari", "Прямая связь и бесплатный гарантийный ремонт", "Direct contact and free warranty repairs")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {get_SERVICE_CENTERS().map((sc) => (
              <div key={sc.store} className="p-4.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-[var(--line)] dark:border-slate-800 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{sc.store}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                </div>
                <a
                  href={`tel:${sc.phone.replace(/\s+/g, "")}`}
                  className="text-amber-600 dark:text-amber-400 font-mono font-bold text-sm block hover:underline"
                >
                  {sc.phone}
                </a>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{sc.hours}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block line-clamp-2">{sc.address}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#0b1224] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-sm border border-[var(--line)] dark:border-amber-500/25 space-y-5 animate-scale-in text-slate-900 dark:text-white my-auto max-h-[92vh] max-h-[92dvh] overflow-y-auto relative">
            {/* Ambient Top Glow */}

            <div className="flex items-center justify-between border-b border-[var(--line)] dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-amber-500 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {language === "uz" ? "Yangi Kafolat Kartasi Qo'shish" : language === "ru" ? "Добавить Гарантийную Карту" : "Add New Warranty Card"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === "uz" ? "Chek va mahsulot ma'lumotlarini kiriting" : language === "ru" ? "Введите данные чека и товара" : "Enter receipt and product details"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-white/80 dark:bg-slate-800 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white border border-[var(--line)] dark:border-slate-700 flex items-center justify-center transition cursor-pointer shadow-2xs"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === "uz" ? "Mahsulot Nomi *" : language === "ru" ? "Название товара *" : "Product Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    language === "uz"
                      ? "Masalan: Dyson Airwrap, Artel Kir yuvish..."
                      : language === "ru"
                      ? "Например: Dyson Airwrap, Стиральная машина..."
                      : "E.g. Dyson Airwrap, Artel Washer..."
                  }
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === "uz" ? "Do'kon" : language === "ru" ? "Магазин" : "Retail Store"}
                  </label>
                  <select
                    value={form.store}
                    onChange={(e) => setForm({ ...form, store: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
                  >
                    <option value="Texnomart">Texnomart</option>
                    <option value="MediaPark">MediaPark</option>
                    <option value="Uzum Market">Uzum Market</option>
                    <option value="Asaxiy">Asaxiy</option>
                    <option value="Malika Bozor">Malika Bozor</option>
                    <option value="Boshqa do'kon">
                      {language === "uz" ? "Boshqa do'kon" : language === "ru" ? "Другой магазин" : "Other Retailer"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === "uz" ? "Kafolat Muddati" : language === "ru" ? "Срок гарантии" : "Warranty Period"}
                  </label>
                  <select
                    value={form.warrantyMonths}
                    onChange={(e) => setForm({ ...form, warrantyMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
                  >
                    <option value={6}>6 {language === "uz" ? "oy" : language === "ru" ? "мес" : "months"}</option>
                    <option value={12}>12 {language === "uz" ? "oy (1 yil)" : language === "ru" ? "мес (1 год)" : "months (1 yr)"}</option>
                    <option value={24}>24 {language === "uz" ? "oy (2 yil)" : language === "ru" ? "мес (2 года)" : "months (2 yrs)"}</option>
                    <option value={36}>36 {language === "uz" ? "oy (3 yil)" : language === "ru" ? "мес (3 года)" : "months (3 yrs)"}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === "uz" ? "Xarid Sanasi" : language === "ru" ? "Дата покупки" : "Purchase Date"}
                  </label>
                  <input
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === "uz" ? "Chek / Talon Raqami" : language === "ru" ? "Номер чека / талона" : "Receipt / Card No"}
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: TXN-4920"
                    value={form.receiptNumber}
                    onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === "uz" ? "Narxi (UZS)" : language === "ru" ? "Цена (UZS)" : "Price (UZS)"}
                  </label>
                  <input
                    type="number"
                    placeholder="3200000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === "uz" ? "Kafolat Turi" : language === "ru" ? "Тип гарантии" : "Warranty Type"}
                  </label>
                  <select
                    value={form.warrantyType}
                    onChange={(e) => setForm({ ...form, warrantyType: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
                  >
                    <option value="official">
                      {language === "uz" ? "Rasmiy Dilerlik (100% Asl)" : language === "ru" ? "Официальная гарантия (100% оригинал)" : "Official Dealer (100% Authentic)"}
                    </option>
                    <option value="store">
                      {language === "uz" ? "Do'kon Kafolati" : language === "ru" ? "Гарантия магазина" : "Store / Retailer Warranty"}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === "uz" ? "Eslatma / Izoh" : language === "ru" ? "Заметки / Примечание" : "Notes / Details"}
                </label>
                <input
                  type="text"
                  placeholder={
                    language === "uz"
                      ? "Masalan: Dadamga yubileyga olingan..."
                      : language === "ru"
                      ? "Например: Подарок отцу на юбилей..."
                      : "E.g. Gift for Dad's anniversary..."
                  }
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-[var(--line)] dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                >
                  {language === "uz" ? "Bekor qilish" : language === "ru" ? "Отмена" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-white font-bold rounded-2xl text-xs transition shadow-md cursor-pointer flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400"
                >
                  <Check className="w-4 h-4 stroke-[2.2]" />
                  <span>{language === "uz" ? "Kartani Saqlash" : language === "ru" ? "Сохранить Карту" : "Save Card"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
