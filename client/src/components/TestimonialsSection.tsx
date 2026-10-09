import { Star, CheckCircle2, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  city: string;
  avatar: string;
  rating: number;
  text: string;
  scenario: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Madina Solihova",
    role: "Kelin / Yosh oila",
    city: "Toshkent, Chilonzor",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop",
    rating: 5,
    scenario: "To'y Registri & Takrorlanishning Oldini Olish",
    text: "To'yimiz uchun Sovg'a AI to'y registridan foydalandik. Qarindoshlarimiz 4-5 ta bir xil dazmol yoki choynak olib kelishining oldi olindi! Mehmonlarimiz ro'yxatdan o'tmasdan ham sovg'ani band qila olgani juda qulay bo'ldi.",
  },
  {
    name: "Jahongir Karimxo'jayev",
    role: "Muhandis",
    city: "Samarqand",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop",
    rating: 5,
    scenario: "Onajonim tavalludiga sovg'a",
    text: "Onamning tavalludlariga De'Longhi kofe mashinasini qidirdim. Sovg'a AI Uzum, Texnomart va MediaPark narxlarini bitta oynada ko'rsatib berdi. 140 000 so'm tejab, Toshkentdan Samarqandga 1 kunda yetkazib berishdi.",
  },
  {
    name: "Otabek Rustamov",
    role: "HR & Jamoa yetakchisi",
    city: "Toshkent, Mirobod",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop",
    rating: 5,
    scenario: "Korporativ & Hamkasblar sovg'alari",
    text: "Kompaniyamizda har oy xodimlar tavalludi nishonlanadi. Sovg'a AI orqali byudjetimizga mos eng o'ziga xos gadjetlarni topamiz va Telegram hisobotini darhol jamoa chatiga yuboramiz. Vaqtimiz bir necha soatga qisqardi.",
  },
  {
    name: "Kamola Yusupova",
    role: "Dizayner",
    city: "Buxoro",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop",
    rating: 5,
    scenario: "Yangi xonadon ko'rgani borish",
    text: "Yangi uyga ko'chgan do'stlarimizga milliy Rishton kulolchiligi choy to'plamini tanladik. Halol nasiya kalkulyatori va rasmiy kafolat ma'lumotlari xarid qilishda to'liq ishonch bag'ishladi.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-900 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-500/10 border border-amber-300/80 dark:border-amber-500/20 px-3.5 py-1.5 rounded-full shadow-2xs">
          Haqiqiy Xaridorlar Fikrlari
        </span>
        <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 dark:text-white">
          O'zbekiston bo'ylab 10 000+ baxtli sovg'a egalari
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal">
          Har kuni minglab yurtdoshlarimiz Sovg'a AI orqali vaqt va mablag'larini tejab, yaqinlariga unutilmas quvonch ulashmoqdalar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-b from-white via-[#fcfaf5] to-[#f7f2e4] dark:from-[#10121d] dark:to-[#080a11] rounded-3xl p-5 sm:p-6 border-2 border-amber-200/80 dark:border-slate-800 shadow-luxury hover:shadow-2xl hover:border-amber-400 dark:hover:border-amber-500/60 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-amber-300/80 dark:text-amber-500/40 group-hover:text-amber-500 transition" />
              </div>

              <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 bg-amber-50/90 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl w-fit border border-amber-200/80 dark:border-slate-700 shadow-2xs">
                {t.scenario}
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{t.text}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-5 mt-4 border-t border-amber-100 dark:border-slate-800/80">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-300/80 dark:border-amber-500/40 shadow-xs"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">{t.name}</h4>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{t.role} · {t.city}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
