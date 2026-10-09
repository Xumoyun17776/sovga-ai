import { useState, useEffect } from "react";
import { Link } from "wouter";
import confetti from "canvas-confetti";
import { formatPrice } from "../lib/api";
import { useToast } from "../components/Toast";
import { cyberSound } from "../lib/cyberSound";
import { useTranslation } from "../lib/i18n";
import {
  Gift,
  Users,
  Sparkles,
  Shuffle,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Send,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  Mail,
  X,
  Stamp,
  CheckCircle2,
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  wishlistHint: string;
  assignedToName?: string;
  assignedToHint?: string;
}

const ROOM_PRESETS = [
  {
    title: "IT Kompaniya Jamoasi Yangi Yili",
    budget: 300000,
    date: "2026-12-25",
    members: [
      { id: "1", name: "Anvar (Backend)", wishlistHint: "Termos yoki sifatli choy to'plami" },
      { id: "2", name: "Shahnoza (Design)", wishlistHint: "Kitob yoki xushbo'y shamlar" },
      { id: "3", name: "Jasur (Frontend)", wishlistHint: "Simsiz quloqchin yoki tech gadjet" },
      { id: "4", name: "Madina (PM)", wishlistHint: "Oshxona uchun nafis kofe finjoni" },
      { id: "5", name: "Sardor (DevOps)", wishlistHint: "Kofe uchun stakan yoki qahva donalari" },
    ],
  },
  {
    title: "Guruhdoshlar Bayram Almashuvi",
    budget: 200000,
    date: "2026-12-28",
    members: [
      { id: "1", name: "Bobur", wishlistHint: "Dasturlash kitobi yoki daftar" },
      { id: "2", name: "Zilola", wishlistHint: "Kosmetika yoki parfyum to'plami" },
      { id: "3", name: "Farrux", wishlistHint: "Powerbank yoki kabel to'plami" },
      { id: "4", name: "Kamola", wishlistHint: "Shirinliklar va shokolad qutisi" },
    ],
  },
  {
    title: "Oila A'zolari Yangi Yil Sovg'asi",
    budget: 500000,
    date: "2026-12-31",
    members: [
      { id: "1", name: "Dadam", wishlistHint: "Issiq sviter yoki qulay tapochka" },
      { id: "2", name: "Onam", wishlistHint: "Oshxona uchun sifatli tova yoki blender" },
      { id: "3", name: "Akam", wishlistHint: "Avtomobil uchun aksessuar" },
      { id: "4", name: "Singlim", wishlistHint: "Chiroyli sumka yoki taqinchoq" },
    ],
  },
];

export default function SecretSantaPage() {
  const toast = useToast();
  const { language } = useTranslation();

  const [roomTitle, setRoomTitle] = useState("Kompaniya Jamoasi Yangi Yil Sovg'asi");
  const [budgetPerPerson, setBudgetPerPerson] = useState<number>(250000);
  const [eventDate, setEventDate] = useState("2026-12-25");
  const [isShuffled, setIsShuffled] = useState(false);

  // Private Envelope Modal State
  const [showEnvelopeModal, setShowEnvelopeModal] = useState(false);
  const [selectedUserForEnvelope, setSelectedUserForEnvelope] = useState<string>("");
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);

  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem("sovga_secret_santa_members");
      if (saved) return JSON.parse(saved);
    } catch {}
    return ROOM_PRESETS[0].members;
  });

  useEffect(() => {
    try {
      localStorage.setItem("sovga_secret_santa_members", JSON.stringify(members));
    } catch {}
  }, [members]);

  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberHint, setNewMemberHint] = useState("");

  const handleApplyPreset = (preset: typeof ROOM_PRESETS[0]) => {
    cyberSound.playClick();
    setRoomTitle(preset.title);
    setBudgetPerPerson(preset.budget);
    setEventDate(preset.date);
    setMembers(preset.members);
    setIsShuffled(false);
    toast.success("Shablon yuklandi!", preset.title);
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    cyberSound.playClick();
    setMembers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newMemberName.trim(),
        wishlistHint: newMemberHint.trim() || "AI tavsiya qilgan foydali sovg'a",
      },
    ]);
    setNewMemberName("");
    setNewMemberHint("");
    setIsShuffled(false);
    toast.success(`${newMemberName} xonaga qo'shildi!`, "Qo'shildi");
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 3) {
      toast.error("Kamida 3 kishi bo'lishi lozim!", "Cheklov");
      return;
    }
    cyberSound.playClick();
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setIsShuffled(false);
  };

  // Derangement matching (no one gets themselves)
  const handleShuffle = () => {
    if (members.length < 3) {
      toast.error("Sovg'a almashish uchun kamida 3 kishi kerak!", "Kam ishtirokchi");
      return;
    }

    cyberSound.playConfirm();

    const n = members.length;
    let indices = members.map((_, i) => i);
    let valid = false;

    // Shuffle until derangement
    while (!valid) {
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      valid = indices.every((targetIdx, originalIdx) => targetIdx !== originalIdx);
    }

    const updated = members.map((member, idx) => ({
      ...member,
      assignedToName: members[indices[idx]].name,
      assignedToHint: members[indices[idx]].wishlistHint,
    }));

    setMembers(updated);
    setIsShuffled(true);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ["#6366f1", "#10b981", "#f59e0b", "#ec4899"],
    });
    cyberSound.play("success");

    toast.success("AI ishtirokchilarni anonim tarzda juftlashtirdi!", "Muvaffaqiyatli 🎉");
  };

  const handleOpenEnvelopeModal = (memberName?: string) => {
    cyberSound.playClick();
    setSelectedUserForEnvelope(memberName || members[0]?.name || "");
    setIsEnvelopeOpened(false);
    setShowEnvelopeModal(true);
  };

  const handleRevealEnvelope = () => {
    cyberSound.playConfirm();
    setIsEnvelopeOpened(true);
    confetti({
      particleCount: 40,
      spread: 45,
      origin: { y: 0.6 },
      colors: ["#fbbf24", "#f59e0b", "#ef4444"],
    });
  };

  const handleShareTelegram = () => {
    cyberSound.playConfirm();
    const text =
      `🎁 *MAXFIY SOVG'A (SECRET SANTA) TADFIRI*\n` +
      `──────────────────────────────\n` +
      `🏷 *Xona:* ${roomTitle}\n` +
      `💰 *Belgilangan byudjet:* ${formatPrice(budgetPerPerson)} gacha\n` +
      `📅 *Topshirish kuni:* ${eventDate}\n` +
      `👥 *Ishtirokchilar:* ${members.length} kishi\n\n` +
      `AI barchani anonim juftlashtirdi! O'zingizning maxfiy do'stingizni bilish uchun havolaga kiring: \n` +
      `${window.location.origin}/secret-santa`;

    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const selectedMemberData = members.find((m) => m.name === selectedUserForEnvelope);

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#07080c] text-slate-900 dark:text-white py-8 sm:py-12 transition-colors relative overflow-hidden animate-fade-in">
      {/* Artisanal Ambient Vignette & Warm Gold Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1000px,100vw)] max-w-full h-[400px] bg-gradient-to-b from-amber-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-10 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-gold-500/20 to-amber-500/15 border border-gold-500/30 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-widest shadow-xs">
            <Gift className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
            <span>Anonim Sovg'a Almashuvi & Secret Santa</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
            Maxfiy Sovg'a <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">(Secret Santa) Xonasi</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
            Jamoangiz yoki do'stlaringiz uchun anonim sovg'a almashish tadbirini tashkillashtiring. 
            AI har bir kishiga maxfiy do'st biriktiradi va belgilangan byudjet doirasida eng zo'r sovg'alarni topib beradi.
          </p>

          {/* Room Presets */}
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400">Tezkor xonalar:</span>
            {ROOM_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p)}
                className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition border-2 border-amber-200/60 dark:border-slate-800 cursor-pointer shadow-2xs active:scale-95"
              >
                {p.title.split(" ")[0]} ({p.members.length} kishi)
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Room Setup & Master Shuffle */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 sm:p-7 border-2 border-amber-200/80 dark:border-amber-500/25 shadow-luxury space-y-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                  Xona Boshqaruvi
                </span>
                <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mt-1">
                  {roomTitle}
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tadbir nomi:</label>
                  <input
                    type="text"
                    value={roomTitle}
                    onChange={(e) => setRoomTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200/80 dark:border-slate-700 font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Byudjet (bir kishiga):</label>
                    <input
                      type="number"
                      value={budgetPerPerson}
                      onChange={(e) => setBudgetPerPerson(Number(e.target.value))}
                      step="25000"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200/80 dark:border-slate-700 font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Topshirish sanasi:</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200/80 dark:border-slate-700 font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shuffle Master Action */}
              <div className="pt-2 space-y-2.5">
                <button
                  onClick={handleShuffle}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
                >
                  <Shuffle className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                  <span>{isShuffled ? "Qaytadan aralashtirish (Re-shuffle)" : "AI orqali juftlashtirish"}</span>
                </button>

                {isShuffled && (
                  <button
                    onClick={() => handleOpenEnvelopeModal()}
                    className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-700 to-pink-700 hover:from-rose-500 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-rose-600/20 cursor-pointer active:scale-95"
                  >
                    <Mail className="w-4 h-4 text-amber-200 stroke-[2.2]" />
                    <span>Maxfiy Konvertimni Ochish</span>
                  </button>
                )}

                <button
                  onClick={handleShareTelegram}
                  className="w-full py-3 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4 text-white stroke-[2.2]" />
                  <span>Guruhga taklif havolasini yuborish</span>
                </button>
              </div>

              {isShuffled && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-200 text-xs flex items-center gap-2 font-semibold shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.2] flex-shrink-0" />
                  <span>Juftliklar tuzildi! Hech kim o'z-o'ziga tushmaganligi kafolatlanadi.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Participants List & Wishlist Suggestions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Add Participant Input */}
            <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-3xl p-6 border-2 border-amber-200/80 dark:border-amber-500/25 shadow-luxury space-y-4">
              <h2 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500 stroke-[2.2]" />
                <span>
                  {language === "uz"
                    ? `Ishtirokchi qo'shish (${members.length} kishi)`
                    : language === "ru"
                    ? `Добавить участника (${members.length} чел.)`
                    : `Add Participant (${members.length} people)`}
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder={
                    language === "uz"
                      ? "Ishtirokchi ismi (masalan: Nodir)..."
                      : language === "ru"
                      ? "Имя участника (например, Нодир)..."
                      : "Participant name (e.g. Alex)..."
                  }
                  className="sm:col-span-5 px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200/80 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  value={newMemberHint}
                  onChange={(e) => setNewMemberHint(e.target.value)}
                  placeholder={
                    language === "uz"
                      ? "Sovg'a istagi (masalan: Kitob, quloqchin)..."
                      : language === "ru"
                      ? "Пожелание (например: книга, наушники)..."
                      : "Wishlist hint (e.g. Book, headphones)..."
                  }
                  className="sm:col-span-5 px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200/80 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleAddMember}
                  className="sm:col-span-2 px-3 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.2]" />
                  <span>{language === "uz" ? "Qo'shish" : language === "ru" ? "Добавить" : "Add"}</span>
                </button>
              </div>
            </div>

            {/* Participants Cards with Secret Envelope Button */}
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] rounded-2xl p-4.5 border-2 border-amber-200/70 dark:border-amber-500/25 shadow-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-amber-400"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{member.name}</span>
                      <span className="text-[11px] bg-amber-100/70 dark:bg-slate-800 text-amber-950 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-md border border-amber-300/80 dark:border-slate-700">
                        {member.wishlistHint}
                      </span>
                    </div>

                    {isShuffled && (
                      <div className="pt-1 flex items-center gap-2 text-xs">
                        <span className="text-slate-400 font-medium">Holat:</span>
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 stroke-[2.2]" />
                          <span>Maxfiy juft biriktirildi</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isShuffled && (
                      <button
                        onClick={() => handleOpenEnvelopeModal(member.name)}
                        className="px-3.5 py-2 bg-gradient-to-r from-amber-500/15 via-amber-400/25 to-amber-500/15 border border-amber-300/80 hover:border-amber-400 text-amber-900 dark:text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                        title="Faqat o'zingizning konvertingizni oching"
                      >
                        <Mail className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                        <span>Konvertni ko'rish</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 dark:bg-slate-850 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Private Secret Envelope Modal */}
        {showEnvelopeModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
            <div className="bg-gradient-to-br from-[#121624] via-[#0d101a] to-[#080a11] text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-400/40 relative text-center space-y-5 animate-scale-in my-auto max-h-[92vh] max-h-[92dvh] overflow-y-auto">
              <button
                onClick={() => setShowEnvelopeModal(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <Gift className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="font-display font-black text-xl text-white">
                  Maxfiy Konvert
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Faqat o'zingizga tegishli ismni tanlang va konvertni oching!
                </p>
              </div>

              {/* Member selector */}
              {!isEnvelopeOpened && (
                <div className="space-y-4">
                  <div className="text-left text-xs">
                    <label className="font-bold text-amber-300 block mb-1.5">Siz kimsiz?</label>
                    <select
                      value={selectedUserForEnvelope}
                      onChange={(e) => setSelectedUserForEnvelope(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-amber-400/30 rounded-xl text-xs font-semibold text-white outline-none focus:border-amber-400"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.name} className="bg-slate-900 text-white">
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Wax seal interactive button */}
                  <div className="py-4">
                    <button
                      onClick={handleRevealEnvelope}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-700 via-amber-600 to-amber-800 border-4 border-amber-300/80 shadow-2xl flex flex-col items-center justify-center mx-auto transition transform hover:scale-105 active:scale-95 cursor-pointer shadow-amber-500/25"
                    >
                      <Mail className="w-8 h-8 text-amber-100 stroke-[2.2]" />
                      <span className="text-[9px] font-black uppercase text-amber-200 mt-1">
                        Ochish
                      </span>
                    </button>
                    <span className="text-[11px] text-amber-300/80 mt-2 block font-medium">
                      Konvert muhrini bosib oching
                    </span>
                  </div>
                </div>
              )}

              {/* Opened envelope secret details */}
              {isEnvelopeOpened && selectedMemberData && (
                <div className="space-y-4 animate-scale-in">
                  <div className="p-5 rounded-2xl bg-slate-950 border-2 border-amber-400/40 text-center space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                      Siz sovg'a berishingiz kerak bo'lgan inson:
                    </span>

                    <h4 className="text-2xl font-black text-amber-200">
                      {selectedMemberData.assignedToName || "Maxfiy Do'st"}
                    </h4>

                    <div className="bg-slate-900 p-3 rounded-xl border border-amber-400/20 text-xs">
                      <span className="text-slate-400 block text-[10px]">Ushbu insonning istagi:</span>
                      <span className="font-semibold text-amber-200 mt-0.5 block">
                        "{selectedMemberData.assignedToHint || "Foydali sovg'a"}"
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Byudjet chegarasi: <strong className="text-white">{formatPrice(budgetPerPerson)}</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={`/search?q=${encodeURIComponent(selectedMemberData.assignedToHint || "sovg'a")} ${budgetPerPerson}`}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                      <span>Ushbu byudjetda AI sovg'a izlash</span>
                    </Link>

                    <button
                      onClick={() => setShowEnvelopeModal(false)}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer active:scale-95"
                    >
                      Maxfiy saqlash & Yopish
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
