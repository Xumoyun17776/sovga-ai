import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "../lib/i18n";
import { registries, auth, formatPrice } from "../lib/api";
import { Heart, Plus, Trash2, ExternalLink, Copy, Check, Sparkles, Gift } from "../lib/icons";
import AuthModal from "../components/AuthModal";
import { copyText } from "../lib/clipboard";

export default function WeddingRegistryPage() {
  const { t, language } = useTranslation();
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: auth.me });
  const { data: regs, isLoading } = useQuery({ queryKey: ["registries"], queryFn: registries.list, enabled: !!user });

  const [showCreate, setShowCreate] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [form, setForm] = useState({ partnerName1: "", partnerName2: "", weddingDate: "", message: "" });
  const [showAddItem, setShowAddItem] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState({ name: "", description: "", price: "", priority: "medium", quantity: 1, category: "", isCashGoal: false, cashGoalAmount: "" });
  const [copied, setCopied] = useState(false);

  const createMut = useMutation({
    mutationFn: (data: any) => registries.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["registries"] }); setShowCreate(false); setForm({ partnerName1: "", partnerName2: "", weddingDate: "", message: "" }); },
  });

  const updateRegMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => registries.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registries"] }),
  });

  const addItemMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => registries.addItem(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["registries"] }); setShowAddItem(null); setItemForm({ name: "", description: "", price: "", priority: "medium", quantity: 1, category: "", isCashGoal: false, cashGoalAmount: "" }); },
  });

  const deleteItemMut = useMutation({
    mutationFn: (itemId: number) => registries.removeItem(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registries"] }),
  });

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6 animate-fade-in text-slate-900 dark:text-white">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-rose-300/80 dark:border-rose-500/30 bg-rose-500/20">
          <Heart className="w-10 h-10 text-rose-500 fill-rose-400/40" />
        </div>
        <div className="space-y-3">
          <h1 className="lux-title text-[2.15rem] sm:text-[3.2rem] text-slate-900 dark:text-white leading-[1.05]">
            {t("registry.title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            {language === "uz" ? "To'y sovg'alari ro'yxatini yarating va mehmonlarga bitta havola yuboring — sovg'alar takrorlanmaydi." : language === "ru" ? "Создайте список свадебных подарков и отправьте гостям одну ссылку — подарки не будут повторяться." : "Make a list of wedding gifts and send guests one link, so nobody buys the same thing twice."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-3.5 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer bg-amber-500 hover:bg-amber-400"
          >
            <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
            <span>Ro'yxatdan o'tish / Kirish</span>
          </button>
          <Link
            href="/auth?redirect=/wedding"
            className="px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-800 dark:text-amber-200 font-bold rounded-2xl text-xs sm:text-sm border border-[var(--line)] dark:border-amber-500/30 transition shadow-2xs flex items-center justify-center"
          >
            <span>To'liq sahifada ochish</span>
          </Link>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="register"
          customTitle="To'y Reyestrini Boshqarish"
          customMessage="To'y sovg'alari ro'yxatini yaratish va mehmonlarga ulashish uchun ro'yxatdan o'ting"
        />
      </div>
    );
  }

  const copyLink = (slug: string) => {
    copyText(`${window.location.origin}/wedding/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in text-slate-900 dark:text-white">
      {/* Ambient background vignette glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="lux-title text-[2.15rem] sm:text-[3.2rem] text-slate-900 dark:text-white leading-[1.05]">
            {t("registry.title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1 max-w-md text-sm">
            {language === "uz" ? "Kelin-kuyov uchun sovg'alar ro'yxati. Mehmonlarga ulashing va kerakli narsalarni oling." : language === "ru" ? "Список подарков для молодожёнов. Поделитесь с гостями и получите то, что действительно нужно." : "A gift list for the couple. Share it with guests and get what you actually need."}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-6 py-3 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition shadow-md cursor-pointer bg-amber-500 hover:bg-amber-400"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>{t("registry.create")}</span>
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 sm:p-7 shadow-sm border border-[var(--line)] dark:border-amber-500/25 mb-8 animate-fade-in">
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-4">
            Yangi Ro'yxat Yaratish
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kelin/Kuyov Ismi 1</label>
              <input
                placeholder="Masalan: Sardor"
                value={form.partnerName1}
                onChange={(e) => setForm({ ...form, partnerName1: e.target.value })}
                className="w-full px-4 py-2.5 border border-[var(--line)] dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 text-sm font-semibold shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kelin/Kuyov Ismi 2</label>
              <input
                placeholder="Masalan: Malika"
                value={form.partnerName2}
                onChange={(e) => setForm({ ...form, partnerName2: e.target.value })}
                className="w-full px-4 py-2.5 border border-[var(--line)] dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 text-sm font-semibold shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">To'y Sanasi</label>
              <input
                type="date"
                value={form.weddingDate}
                onChange={(e) => setForm({ ...form, weddingDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-[var(--line)] dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 text-sm font-semibold shadow-2xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mehmonlarga Xabar</label>
              <textarea
                placeholder="Bizning to'yimizga tashrif buyurayotganingizdan xursandmiz! Bu yerda bizga kerakli bo'lgan buyumlar ro'yxati..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 border border-[var(--line)] dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 text-sm font-semibold shadow-2xs"
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5 border-t border-[var(--line)] dark:border-slate-800 pt-4">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Bekor Qilish
            </button>
            <button
              onClick={() => createMut.mutate(form)}
              disabled={!form.partnerName1 || !form.partnerName2}
              className="px-6 py-2.5 text-white text-xs font-bold uppercase tracking-wider rounded-xl disabled:opacity-50 shadow-md cursor-pointer bg-amber-500 hover:bg-amber-400"
            >
              Saqlash va Yaratish
            </button>
          </div>
        </div>
      )}

      {/* Registries list */}
      {isLoading && (
        <div className="text-center py-16">
          <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Ro'yxatlar yuklanmoqda...</p>
        </div>
      )}

      <div className="space-y-6">
        {regs?.map((reg: any) => (
          <div key={reg.id} className="bg-white dark:bg-[#0b1224] rounded-2xl shadow-sm border border-[var(--line)] dark:border-amber-500/20 overflow-hidden">
            <div className="p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-amber-600 dark:text-amber-400">{reg.partnerName1}</span>
                  <span className="text-slate-400 font-normal text-lg">&</span>
                  <span className="text-amber-600 dark:text-amber-400">{reg.partnerName2}</span>
                </h2>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/wedding/${reg.slug}`}
                    className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border border-blue-200 dark:border-blue-900 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Ommaviy Ko'rinish</span>
                  </Link>
                  <button
                    onClick={() => copyLink(reg.slug)}
                    className={`text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border shadow-2xs cursor-pointer ${
                      copied
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                        : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)]"
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 stroke-[2.2]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.2]" />}
                    {copied ? "Nusxalandi!" : "Havolani Nusxalash"}
                  </button>
                </div>
              </div>

              {reg.message && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed bg-white/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-[var(--line)] dark:border-slate-800 shadow-2xs">
                  "{reg.message}"
                </p>
              )}

              {/* Privacy Surprise Mode Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-amber-50/70 dark:bg-amber-950/20 border border-[var(--line)] dark:border-amber-500/30 p-4.5 rounded-2xl mb-6 gap-4 shadow-xs">
                <div>
                  <span className="font-bold text-sm text-amber-950 dark:text-amber-300 block mb-0.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Surpriz Himoya Rejimi
                  </span>
                  <span className="text-xs text-amber-900/80 dark:text-amber-300/80">
                    {reg.revealPurchasers
                      ? "Xaridorlarning ismlari sizga ko'rinadi."
                      : "Xaridorlar ismlari yashirin. Sovg'alar to'y kuningizgacha surpriz bo'lib qoladi!"}
                  </span>
                </div>
                <button
                  onClick={() => updateRegMut.mutate({ id: reg.id, data: { revealPurchasers: !reg.revealPurchasers } })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 shadow-sm cursor-pointer ${
                    reg.revealPurchasers
                      ? "text-white font-bold bg-amber-500"
                      : "bg-white/90 dark:bg-slate-900 text-amber-900 dark:text-amber-300 border border-[var(--line)] dark:border-amber-500/30 hover:bg-amber-100"
                  }`}
                >
                  {reg.revealPurchasers ? "Surprizni Yoqish (Yashirish)" : "Ismlarni Ko'rsatish"}
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-2">
                  Sovg'alar Ro'yxati ({reg.items?.length || 0})
                </h4>
                {reg.items?.length > 0 ? (
                  reg.items.map((item: any) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/90 dark:bg-[#151722] border border-[var(--line)] dark:border-slate-800 rounded-2xl group hover:border-[var(--line-strong)] dark:hover:border-amber-600/50 transition shadow-xs">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border shadow-2xs ${
                            item.priority === "high" ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800" :
                            item.priority === "medium" ? "bg-amber-50 text-amber-700 border-[var(--line)] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" :
                            "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}>
                            {item.priority === "high" ? "Yuqori" : item.priority === "medium" ? "O'rta" : "Past"}
                          </span>
                          <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {item.name}
                          </span>
                          {item.status === "reserved" && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                              {t("registry.reserved")}
                            </span>
                          )}
                        </div>
                        {item.price && (
                          <span className="text-sm font-bold text-amber-600 dark:text-amber-400 block mt-1">
                            {formatPrice(item.price)}
                          </span>
                        )}
                        {item.isCashGoal && (
                          <div className="mt-2.5 p-3 bg-amber-50/50 dark:bg-slate-900/50 rounded-xl border border-[var(--line)] dark:border-slate-800">
                            <div className="flex justify-between text-[10px] font-bold mb-1.5">
                              <span className="text-slate-600 dark:text-slate-400">Pul Yig'ish Maqsadi:</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                {formatPrice(item.cashCollected || 0)} / {formatPrice(item.cashGoalAmount)}
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-amber-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-[var(--line)]">
                              <div
                                className="h-full rounded-full transition-all bg-emerald-500"
                                style={{ width: `${Math.min(100, ((item.cashCollected || 0) / (item.cashGoalAmount || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteItemMut.mutate(item.id)}
                        className="mt-3 sm:mt-0 p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition self-end sm:self-center cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2.2]" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 bg-white/70 dark:bg-slate-900/50 rounded-2xl border border-[var(--line)] dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Hali sovg'alar qo'shilmadi.</p>
                  </div>
                )}
              </div>

              {/* Add Item Form */}
              {showAddItem === reg.id ? (
                <div className="mt-5 p-5 bg-white/95 dark:bg-[#151722] border border-[var(--line)] dark:border-amber-500/25 rounded-2xl animate-fade-in shadow-inner">
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Yangi Sovg'a Qo'shish
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Nomi</label>
                      <input
                        placeholder="Masalan: Dyson changyutgichi"
                        value={itemForm.name}
                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-[var(--line)] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Narxi (UZS)</label>
                      <input
                        type="number"
                        placeholder="Narxi"
                        value={itemForm.price}
                        onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                        className="w-full px-3 py-2 border border-[var(--line)] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Kategoriya</label>
                      <input
                        placeholder="Masalan: Maishiy texnika"
                        value={itemForm.category}
                        onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                        className="w-full px-3 py-2 border border-[var(--line)] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Muhimligi</label>
                      <select
                        value={itemForm.priority}
                        onChange={(e) => setItemForm({ ...itemForm, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-[var(--line)] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                      >
                        <option value="high">Yuqori (Eng kerakli)</option>
                        <option value="medium">O'rta</option>
                        <option value="low">Past</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 p-3.5 bg-amber-50/50 dark:bg-slate-900 border border-[var(--line)] dark:border-slate-800 rounded-xl">
                      <label className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={itemForm.isCashGoal}
                          onChange={(e) => setItemForm({ ...itemForm, isCashGoal: e.target.checked })}
                          className="w-4 h-4 text-amber-500 rounded border-[var(--line)] focus:ring-amber-500"
                        />
                        <span>Pul yig'ish maqsadimi? (Katta sovg'a uchun ulush qilib to'lash)</span>
                      </label>
                      {itemForm.isCashGoal && (
                        <div className="mt-3 pl-7 animate-fade-in">
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Maqsad Qilingan Summa</label>
                          <input
                            type="number"
                            placeholder="Kerakli jami summa"
                            value={itemForm.cashGoalAmount}
                            onChange={(e) => setItemForm({ ...itemForm, cashGoalAmount: e.target.value })}
                            className="w-full sm:w-1/2 px-3.5 py-2 border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-sm font-bold text-emerald-900 dark:text-emerald-300 outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-[var(--line)] dark:border-slate-800">
                    <button
                      onClick={() => setShowAddItem(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      Bekor Qilish
                    </button>
                    <button
                      onClick={() =>
                        addItemMut.mutate({
                          id: reg.id,
                          data: {
                            ...itemForm,
                            price: itemForm.price ? parseFloat(itemForm.price) : null,
                            cashGoalAmount: itemForm.cashGoalAmount ? parseFloat(itemForm.cashGoalAmount) : null,
                          },
                        })
                      }
                      disabled={!itemForm.name}
                      className="px-6 py-2.5 text-white text-xs font-bold uppercase tracking-wider rounded-xl disabled:opacity-50 shadow-md transition cursor-pointer bg-amber-500 hover:bg-amber-400"
                    >
                      Qo'shish
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddItem(reg.id)}
                  className="mt-5 w-full py-3.5 border border-dashed border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)] dark:hover:border-amber-600 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-200 transition cursor-pointer bg-white/40 dark:bg-slate-900/30"
                >
                  <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" /> Sovg'a Qo'shish
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {regs?.length === 0 && !isLoading && (
        <div className="bg-white dark:bg-[#0b1224] text-center py-20 rounded-2xl border border-[var(--line)] dark:border-amber-500/20 shadow-sm mt-6">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-400/40" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">Hali ro'yxatlar yo'q</h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm max-w-sm mx-auto mb-6 font-normal">
            O'zingizning birinchi to'y sovg'alari ro'yxatingizni yarating va yaqinlaringizga ulashing.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer bg-amber-500 hover:bg-amber-400"
          >
            Yangi Ro'yxat Yaratish
          </button>
        </div>
      )}
    </div>
  );
}
