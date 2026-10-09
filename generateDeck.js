import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_16x9";

// Define brand colors
const colors = {
  bg: "0f172a", // slate-950
  text: "f8fafc", // slate-50
  accent: "f59e0b", // amber-500
  secondary: "94a3b8" // slate-400
};

// Default slide styles
pptx.defineSlideMaster({
  title: "MASTER_SLIDE",
  background: { color: colors.bg },
  objects: [
    { rect: { x: 0, y: 0, w: "100%", h: 0.1, fill: { color: colors.accent } } }, // Top gold bar
    { text: { text: "SOVG'A AI", options: { x: '5%', y: '92%', w: '40%', fontSize: 10, color: colors.accent, fontFace: 'Arial' } } },
    { text: { text: "CONFIDENTIAL PITCH DECK", options: { x: '55%', y: '92%', w: '40%', align: 'right', fontSize: 10, color: colors.secondary, fontFace: 'Arial' } } }
  ]
});

// SLIDE 1: Title
let slide1 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
slide1.addText("SOVG'A AI", { x: "10%", y: "30%", w: "80%", fontSize: 44, bold: true, color: colors.accent, align: "center", fontFace: 'Arial' });
slide1.addText("O'zbekistonning 1-raqamli AI Xarid va Sovg'a Tadqiqotchisi", { x: "10%", y: "45%", w: "80%", fontSize: 22, color: colors.text, align: "center", fontFace: 'Arial' });
slide1.addText("Sarmoya taklifi (Seed Round)", { x: "10%", y: "55%", w: "80%", fontSize: 16, color: colors.secondary, align: "center", fontFace: 'Arial' });

// SLIDE 2: Problem
let slide2 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
slide2.addText("MUAMMO", { x: "5%", y: "10%", w: "90%", fontSize: 28, bold: true, color: colors.accent });
slide2.addText([
  { text: "1. Tarqoq bozor: ", options: { bold: true, color: colors.accent } },
  { text: "Foydalanuvchilar bitta telefonni eng arzonini topish uchun 10 ta sayt (Uzum, Texnomart, OLX) qidirishga majbur.\n\n" },
  { text: "2. Soxta chegirmalar: ", options: { bold: true, color: colors.accent } },
  { text: "Narxlar sun'iy oshirilib, yolg'on chegirmalar qo'yiladi.\n\n" },
  { text: "3. Sovg'a tanlash azobi: ", options: { bold: true, color: colors.accent } },
  { text: "Odamlar nima sovg'a qilishni bilmaydi va asab buzadi." }
], { x: "5%", y: "25%", w: "90%", h: "60%", fontSize: 20, color: colors.text, bullet: true, valign: 'top' });

// SLIDE 3: Solution
let slide3 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
slide3.addText("YECHIM - SOVG'A AI", { x: "5%", y: "10%", w: "90%", fontSize: 28, bold: true, color: colors.accent });
slide3.addText("OpenAI GPT-4o-mini asosida ishlaydigan innovatsion platforma:", { x: "5%", y: "25%", w: "90%", fontSize: 18, color: colors.secondary });
slide3.addText([
  { text: "Bitta qidiruv, yuzlab do'konlar: ", options: { bold: true, color: colors.accent } },
  { text: "AI butun O'zbekiston bozorini tahlil qilib eng arzonini topadi.\n" },
  { text: "Shaffof taqqoslash: ", options: { bold: true, color: colors.accent } },
  { text: "Soxta chegirmalarni fosh qiluvchi AI auditor.\n" },
  { text: "Shaxsiylashtirilgan sovg'alar: ", options: { bold: true, color: colors.accent } },
  { text: "Yosh, byudjet va sababga qarab to'g'ri sovg'a g'oyasini beradi." }
], { x: "5%", y: "35%", w: "90%", h: "50%", fontSize: 20, color: colors.text, bullet: true, valign: 'top' });

// SLIDE 4: Product & Tech
let slide4 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
slide4.addText("BIZNING TEXNOLOGIYA (MVP Tayyor)", { x: "5%", y: "10%", w: "90%", fontSize: 28, bold: true, color: colors.accent });
slide4.addText("Platforma allaqachon ishlab chiqilgan va sinovdan o'tgan (Real yutuqlar):", { x: "5%", y: "20%", w: "90%", fontSize: 16, color: colors.secondary });
slide4.addText([
  { text: "Live Price Tracker: ", options: { bold: true, color: colors.text } },
  { text: "Orqa fonda ishlovchi narx kuzatuvchi va Telegram orqali xabar berish.\n" },
  { text: "Ultra-Tezkor AI Search: ", options: { bold: true, color: colors.text } },
  { text: "GPT-4o-mini integratsiyasi orqali 9 soniyada bozor analizi.\n" },
  { text: "3D Interaktiv UI: ", options: { bold: true, color: colors.text } },
  { text: "Mystery Box (Syurpriz quti) va premium vizual effektlar.\n" },
  { text: "Spotlight HUD: ", options: { bold: true, color: colors.text } },
  { text: "Macbook uslubidagi universal tezkor qidiruv menyusi." }
], { x: "5%", y: "30%", w: "90%", h: "60%", fontSize: 18, color: colors.secondary, bullet: true, valign: 'top' });

// SLIDE 5: Market Size
let slide5 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
slide5.addText("BOZOR HAJMI (O'ZBEKISTON)", { x: "5%", y: "10%", w: "90%", fontSize: 28, bold: true, color: colors.accent });
slide5.addShape(pptx.ShapeType.rect, { x: "10%", y: "30%", w: "25%", h: "40%", fill: "1e293b", line: { color: colors.accent, width: 2 } });
slide5.addText("$1.2 mlrd", { x: "10%", y: "35%", w: "25%", fontSize: 32, bold: true, color: colors.text, align: "center" });
slide5.addText("Umumiy e-commerce", { x: "10%", y: "50%", w: "25%", fontSize: 14, color: colors.secondary, align: "center" });

slide5.addShape(pptx.ShapeType.rect, { x: "37.5%", y: "30%", w: "25%", h: "40%", fill: "1e293b", line: { color: colors.accent, width: 2 } });
slide5.addText("$300 mln", { x: "37.5%", y: "35%", w: "25%", fontSize: 32, bold: true, color: colors.text, align: "center" });
slide5.addText("Elektronika va Sovg'alar", { x: "37.5%", y: "50%", w: "25%", fontSize: 14, color: colors.secondary, align: "center" });

slide5.addShape(pptx.ShapeType.rect, { x: "65%", y: "30%", w: "25%", h: "40%", fill: "1e293b", line: { color: colors.accent, width: 2 } });
slide5.addText("$50 mln", { x: "65%", y: "35%", w: "25%", fontSize: 32, bold: true, color: colors.accent, align: "center" });
slide5.addText("Bizning maqsadli bozor (SOM)", { x: "65%", y: "50%", w: "25%", fontSize: 14, color: colors.secondary, align: "center" });

// SLIDE 6: Business Model
let slide6 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
slide6.addText("BIZNES MODEL (MONETIZATSIYA)", { x: "5%", y: "10%", w: "90%", fontSize: 28, bold: true, color: colors.accent });
slide6.addText([
  { text: "1. Lead Generation (CPA/CPS): ", options: { bold: true, color: colors.accent } },
  { text: "Biz orqali sotib olingan har bir tovar uchun Uzum/Texnomart/Do'konlardan 2-5% komissiya.\n\n" },
  { text: "2. PRO Obuna (Foydalanuvchilar): ", options: { bold: true, color: colors.accent } },
  { text: "Eksklyuziv chegirmalar va limitsiz AI izlanish uchun kichik oylik to'lov.\n\n" },
  { text: "3. Merchant Portal (Sotuvchilar B2B): ", options: { bold: true, color: colors.accent } },
  { text: "Kichik va o'rta sotuvchilar (Instagram/Telegram do'konlar) o'z mahsulotlarini platformaga qo'shishi uchun pullik obuna." }
], { x: "5%", y: "25%", w: "90%", h: "60%", fontSize: 18, color: colors.text, bullet: true, valign: 'top' });

// SLIDE 7: Competitors vs Us
let slide7 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
slide7.addText("RAQOBATCHILAR VA USTUNLIGIMIZ", { x: "5%", y: "10%", w: "90%", fontSize: 28, bold: true, color: colors.accent });
slide7.addTable([
  [ { text: "Xususiyatlar", options: { bold: true, color: "000000", fill: colors.accent } }, { text: "Uzum Market", options: { bold: true, color: "000000", fill: "ffffff" } }, { text: "SOVG'A AI", options: { bold: true, color: "000000", fill: colors.accent } } ],
  [ "Butun bozor bo'yicha qidiruv", "Yo'q (Faqat o'zini tovarlari)", "HA (Global web-scraper)" ],
  [ "AI Sovg'a G'oyalari", "Yo'q (Faqat oddiy filtr)", "HA (GPT-4o-mini)" ],
  [ "Xolis narx auditori", "Yo'q", "HA (Eng arzonini ko'rsatadi)" ],
  [ "Telegram Orqali Kuzatish", "Yo'q", "HA (Live Tracking)" ]
], { x: "5%", y: "30%", w: "90%", rowH: 0.6, fontSize: 16, color: colors.text, border: { type: "solid", color: "334155" } });
slide7.addText("Ustunligimiz: Biz do'kon emasmiz, biz bozor hakami va xaridorgarmiz!", { x: "5%", y: "80%", w: "90%", fontSize: 16, bold: true, color: colors.accent, align: "center" });

// SLIDE 8: Traction / Hozirgi Holat
let slide8 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
slide8.addText("HOZIRGI HOLAT (TRACTION)", { x: "5%", y: "10%", w: "90%", fontSize: 28, bold: true, color: colors.accent });
slide8.addText([
  { text: "Full-Stack MVP 100% tayyor: ", options: { bold: true, color: colors.accent } },
  { text: "Server (Node.js/Express) va Frontend (React/Vite) ishlab turibdi.\n" },
  { text: "Xavfsizlik yo'lga qo'yilgan: ", options: { bold: true, color: colors.accent } },
  { text: "Barcha backdoorlar yopildi, avtorizatsiya ishlamoqda.\n" },
  { text: "OpenAI Integratsiyasi: ", options: { bold: true, color: colors.accent } },
  { text: "Asosiy dvigatel to'liq GPT-4o-mini API siga ulangan va 9 soniyada bozor analizi qila oladi.\n" },
  { text: "Dizayn: ", options: { bold: true, color: colors.accent } },
  { text: "Premium qora-tilla (luxury) stilga standartlashtirilgan." }
], { x: "5%", y: "25%", w: "90%", h: "60%", fontSize: 18, color: colors.text, bullet: true, valign: 'top' });

// SLIDE 9: Investment Request
let slide9 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
slide9.addText("SARMOYA SO'ROVI", { x: "5%", y: "10%", w: "90%", fontSize: 28, bold: true, color: colors.accent });
slide9.addText("Micro-Seed Round: $10,000 USD (Qisman yoki to'liq)", { x: "5%", y: "20%", w: "90%", fontSize: 22, bold: true, color: "22c55e" });
slide9.addText("Mablag' qanday sarflanadi (Keyingi 6 oy uchun):", { x: "5%", y: "35%", w: "90%", fontSize: 18, color: colors.secondary });
slide9.addTable([
  [ "Infratuzilma (AWS/Vercel) va OpenAI API To'lovlari", "$2,000" ],
  [ "Yuridik Ro'yxatdan o'tish (MChJ) va litsenziyalar", "$1,000" ],
  [ "Telegram Bot rasmiy tasdig'i va SMS Gateways", "$1,000" ],
  [ "Marketing va Birinchi Mijozlarni Jalb Qilish (CAC)", "$4,000" ],
  [ "Zaxira Foni (Runway / Unexpected costs)", "$2,000" ]
], { x: "10%", y: "45%", w: "80%", rowH: 0.5, fontSize: 16, color: colors.text, fill: "1e293b", border: { pt: 1, color: "334155" } });

// SLIDE 10: Contact
let slide10 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
slide10.addText("KELAJAKKA BIRGALIKDA", { x: "10%", y: "25%", w: "80%", fontSize: 36, bold: true, color: colors.accent, align: "center" });
slide10.addText("O'zbekistonning eng aqlli savdo platformasiga aylanishda bizga qo'shiling.", { x: "10%", y: "40%", w: "80%", fontSize: 18, color: colors.text, align: "center" });
slide10.addText("Loyiha Asoschisi: Xumoyun\nAloqa: xumoyunravshanov166@gmail.com\nTelegram: @SovgaUzBot (Simulyatsiya)", { x: "10%", y: "60%", w: "80%", fontSize: 16, color: colors.secondary, align: "center" });

// Save File
pptx.writeFile({ fileName: "Sovga_AI_Pitch_Deck.pptx" }).then(() => {
  console.log("Pitch deck generated successfully!");
}).catch((err) => {
  console.error("Error generating pitch deck:", err);
});
