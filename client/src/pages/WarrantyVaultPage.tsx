import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import confetti from "canvas-confetti";
import { useToast } from "../components/Toast";
import { formatPrice } from "../lib/api";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation } from "../lib/i18n";
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
} from "lucide-react";

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

const SERVICE_CENTERS = [
  {
    store: "Texnomart",
    phone: "+998 71 209-99-44",
    hours: "09:00 - 21:00 (Har kuni)",
    address: "Toshkent sh., barcha Texnomart filiallari orqali qabul qilinadi",
  },
  {
    store: "MediaPark",
    phone: "+998 71 203-33-33",
    hours: "09:00 - 20:00",
    address: "Toshkent sh., Qoratosh ko'chasi 11A / barcha do'konlar",
  },
  {
    store: "Uzum Market",
    phone: "+998 78 777-07-99",
    hours: "24/7 Qo'llab-quvvatlash",
    address: "Istalgan Uzum topshirish punkti (PVZ) orqali rasmiylashtirish",
  },
  {
    store: "Asaxiy",
    phone: "+998 71 200-01-05",
    hours: "09:00 - 20:00",
    address: "Toshkent sh., Chilonzor 2-mavze / kuryer orqali olib ketish",
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
      toast.error("Mahsulot nomini kiriting!", "Xatolik");
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

    toast.success("Kafolat kartasi saqlandi!", "Kafolat Seyfiga muvaffaqiyatli qo'shildi");
  };

  const handleDeleteItem = (id: string) => {
    cyberSound.playClick();
    setItems(items.filter((i) => i.id !== id));
    toast.success("Kafolat kartasi o'chirildi", "O'chirildi");
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
    toast.success("Kafolat ma'lumotlari eksport qilindi!", "JSON fayl yuklab olindi");
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
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] text-slate-900 dark:text-white py-10 px-4 sm:px-6 lg:px-8 transition-colors relative overflow-hidden animate-fade-in">
      {/* Artisanal Ambient Vignette & Warm Gold Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1000px,100vw)] max-w-full h-[400px] bg-gradient-to-b from-amber-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-10 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3.5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-gold-500/20 to-amber-500/15 border border-gold-500/30 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-widest shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
            <span>Kafolat & Chek Saqlovchi "Sovg'a Hamyoni"</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-slate-900 dark:text-white">
            Kafolat Talonlari & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-300 dark:to-yellow-400">Rasmiy Servis</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-normal">
            Sovg'aga olingan yoki yaqinlaringizga berilgan har bir texnika va qimmatbaho buyum kafolatini bir joyda saqlang.
            Muddati tugashidan oldin xabardor bo'ling va servis markazi bilan bevosita bog'laning.
          </p>
        </div>

        {/* Action Header & Search & Stats */}
        <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] p-6 sm:p-7 rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl icon-medallion icon-box-gold text-slate-950 font-black text-xl flex items-center justify-center shrink-0">
                {items.length}
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Saqlangan Kafolat Kartalari</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Barcha cheklar va servis ma'lumotlari qurilmangizda xavfsiz saqlanmoqda
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportJson}
                className="px-4 py-3 bg-white/90 dark:bg-slate-900/90 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-800 dark:text-amber-200 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-amber-200/80 dark:border-slate-800 cursor-pointer shadow-2xs active:scale-95"
                title="Kafolat pasportlarini zaxiralash"
              >
                <Download className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                <span>Eksport (JSON)</span>
              </button>

              <button
                onClick={() => {
                  cyberSound.playClick();
                  setShowAddModal(true);
                }}
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 rounded-2xl text-xs sm:text-sm font-black shadow-md shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                <span>
                  {language === "uz" ? "Yangi Kafolat Qo'shish" : language === "ru" ? "Добавить Гарантию" : "Add New Warranty"}
                </span>
              </button>
            </div>
          </div>

          {/* Search bar & Status filter chips */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-amber-100 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.2]" />
              <input
                type="text"
                placeholder="Mahsulot yoki do'kon bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "Barchasi" },
                { id: "active", label: "🟢 Faol" },
                { id: "expiring", label: "🟡 Tez kunda tugaydi" },
                { id: "expired", label: "🔴 Tugagan" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    cyberSound.playClick();
                    setStatusFilter(f.id as any);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border whitespace-nowrap cursor-pointer shadow-2xs active:scale-95 ${
                    statusFilter === f.id
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black border-amber-500 shadow-xs"
                      : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-amber-200/70 dark:border-slate-800 hover:border-amber-400"
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
                className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/20 p-6 shadow-luxury flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-500/40 transition space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-300/70 dark:border-amber-500/30 font-bold">
                          {item.store}
                        </span>
                        {item.warrantyType === "official" && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 px-2 py-0.5 rounded-full font-bold">
                            Rasmiy
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                        {item.productName}
                      </h3>
                      {item.price && (
                        <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                          {formatPrice(item.price)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="w-8 h-8 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-95"
                      title="O'chirish"
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
                        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                        : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0 stroke-[2.2]" />
                      <div>
                        <span className="font-bold block">
                          {status.isExpired
                            ? "Kafolat muddati tugagan"
                            : `${status.daysRemaining} kun qoldi`}
                        </span>
                        <span className="text-[10px] opacity-80 block">Tugash: {status.expiryDate}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-lg bg-white/90 dark:bg-slate-900/90 shadow-2xs">
                      {status.isExpired ? "Tugadi" : "Faol"}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-amber-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-slate-400">Xarid sanasi:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.purchaseDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-slate-400">Kafolat muddati:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.warrantyMonths} oy</span>
                    </div>
                    {item.receiptNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 dark:text-slate-400">Chek / Talon №:</span>
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

                <div className="pt-3 border-t border-amber-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                    <span>Rasmiy ro'yxat</span>
                  </span>

                  <a
                    href={`tel:${
                      SERVICE_CENTERS.find((s) => s.store === item.store)?.phone.replace(/\s+/g, "") ||
                      "+998712000105"
                    }`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300/60 dark:border-amber-500/30 transition cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Servisga qo'ng'iroq</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/20 space-y-2 shadow-luxury">
            <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Kafolat kartasi topilmadi</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Qidiruv so'zini o'zgartiring yoki yangi kafolat kartasi qo'shing.
            </p>
          </div>
        )}

        {/* Store Service Directory */}
        <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] p-6 sm:p-8 rounded-3xl border-2 border-amber-200/80 dark:border-amber-500/20 shadow-luxury space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl icon-medallion icon-box-gold flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5 text-amber-500 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                O'zbekiston Do'konlari Rasmiy Servis Markazlari Telefonlari
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                To'g'ridan-to'g'ri bog'lanish va bepul kafolat ta'mirlash xizmatlari
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICE_CENTERS.map((sc) => (
              <div key={sc.store} className="p-4.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-amber-200/70 dark:border-slate-800 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{sc.store}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                </div>
                <a
                  href={`tel:${sc.phone.replace(/\s+/g, "")}`}
                  className="text-amber-600 dark:text-amber-400 font-mono font-black text-sm block hover:underline"
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
          <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-luxury border-2 border-amber-300/80 dark:border-amber-500/25 space-y-5 animate-scale-in text-slate-900 dark:text-white my-auto max-h-[92vh] max-h-[92dvh] overflow-y-auto relative">
            {/* Ambient Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-amber-400/15 dark:bg-amber-400/10 blur-2xl pointer-events-none rounded-full" />

            <div className="flex items-center justify-between border-b border-amber-200/80 dark:border-slate-800 pb-4">
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
                className="w-8 h-8 rounded-xl bg-white/80 dark:bg-slate-800 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white border border-amber-200/70 dark:border-slate-700 flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-95"
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
                  className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
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
                    className="w-full px-3 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
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
                    className="w-full px-3 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
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
                    className="w-full px-3 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
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
                    className="w-full px-3 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
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
                    className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === "uz" ? "Kafolat Turi" : language === "ru" ? "Тип гарантии" : "Warranty Type"}
                  </label>
                  <select
                    value={form.warrantyType}
                    onChange={(e) => setForm({ ...form, warrantyType: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
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
                  className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                >
                  {language === "uz" ? "Bekor qilish" : language === "ru" ? "Отмена" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-2xl text-xs transition shadow-md shadow-amber-500/25 cursor-pointer active:scale-95 flex items-center gap-1.5"
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
