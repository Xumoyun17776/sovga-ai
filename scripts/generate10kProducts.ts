import fs from "fs";
import path from "path";
import { ensureProductUrl } from "../server/services/urlHelper.js";
import { getVerifiedProductImage } from "../server/services/imageHelper.js";

const DB_FILE = path.resolve(process.cwd(), "data", "database.json");

interface ProductSeedDef {
  name: string;
  category: string;
  brand: string;
  basePrice: number;
  specs: Record<string, string>;
  description: string;
}

// Helper to generate variations
function generateVariations(): ProductSeedDef[] {
  const items: ProductSeedDef[] = [];

  // ==========================================
  // 1. SMARTFONLAR VA AKSESSUARLAR (1,500 items)
  // ==========================================
  const iphoneSeries = [
    { model: "iPhone 16 Pro Max", base: 16500000, roms: ["256GB", "512GB", "1TB"], colors: ["Natural Titanium", "Black Titanium", "White Titanium", "Desert Titanium"] },
    { model: "iPhone 16 Pro", base: 14500000, roms: ["128GB", "256GB", "512GB", "1TB"], colors: ["Natural Titanium", "Black Titanium", "White Titanium", "Desert Titanium"] },
    { model: "iPhone 16 Plus", base: 12500000, roms: ["128GB", "256GB", "512GB"], colors: ["Ultramarine", "Teal", "Pink", "White", "Black"] },
    { model: "iPhone 16", base: 11200000, roms: ["128GB", "256GB", "512GB"], colors: ["Black", "White", "Pink", "Teal", "Ultramarine"] },
    { model: "iPhone 15 Pro Max", base: 14800000, roms: ["256GB", "512GB", "1TB"], colors: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"] },
    { model: "iPhone 15 Pro", base: 12900000, roms: ["128GB", "256GB", "512GB", "1TB"], colors: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"] },
    { model: "iPhone 15 Plus", base: 10800000, roms: ["128GB", "256GB", "512GB"], colors: ["Black", "Blue", "Green", "Yellow", "Pink"] },
    { model: "iPhone 15", base: 9600000, roms: ["128GB", "256GB", "512GB"], colors: ["Black", "Blue", "Green", "Yellow", "Pink"] },
    { model: "iPhone 14 Pro Max", base: 12500000, roms: ["128GB", "256GB", "512GB"], colors: ["Space Black", "Silver", "Gold", "Deep Purple"] },
    { model: "iPhone 14 Pro", base: 10900000, roms: ["128GB", "256GB", "512GB"], colors: ["Space Black", "Silver", "Gold", "Deep Purple"] },
    { model: "iPhone 14", base: 8200000, roms: ["128GB", "256GB", "512GB"], colors: ["Midnight", "Starlight", "Blue", "Purple", "Red"] },
    { model: "iPhone 13", base: 6800000, roms: ["128GB", "256GB"], colors: ["Midnight", "Starlight", "Blue", "Pink", "Green"] },
    { model: "iPhone 12", base: 5600000, roms: ["64GB", "128GB"], colors: ["Black", "White", "Blue", "Green", "Purple"] },
    { model: "iPhone 11", base: 4500000, roms: ["64GB", "128GB"], colors: ["Black", "White", "Purple", "Green"] },
  ];

  for (const s of iphoneSeries) {
    for (const r of s.roms) {
      for (const c of s.colors) {
        items.push({
          name: `Apple ${s.model} ${r} (${c})`,
          category: "Smartphones & Tech",
          brand: "Apple",
          basePrice: s.base + (r === "256GB" ? 1400000 : r === "512GB" ? 2800000 : r === "1TB" ? 4200000 : 0),
          specs: { "Model": s.model, "Xotira": r, "Rang": c, "Kafolat": "1 Yil Apple Rasmiy Kafolati", "Yetkazish": "Toshkentda 1 kun" },
          description: `Apple kompaniyasining original ${s.model} smartfoni. ${r} xotira va nafis ${c} korpus. Rasmiy O'zbekiston kafolati bilan.`,
        });
      }
    }
  }

  const samsungSeries = [
    { model: "Galaxy S24 Ultra", base: 13900000, configs: ["12/256GB", "12/512GB", "12/1TB"], colors: ["Titanium Gray", "Titanium Black", "Titanium Violet", "Titanium Yellow"] },
    { model: "Galaxy S24+", base: 10800000, configs: ["12/256GB", "12/512GB"], colors: ["Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"] },
    { model: "Galaxy S24", base: 8900000, configs: ["8/128GB", "8/256GB"], colors: ["Onyx Black", "Marble Gray", "Cobalt Violet"] },
    { model: "Galaxy S23 Ultra", base: 11200000, configs: ["8/256GB", "12/512GB"], colors: ["Phantom Black", "Green", "Cream", "Lavender"] },
    { model: "Galaxy S23 FE", base: 6400000, configs: ["8/128GB", "8/256GB"], colors: ["Mint", "Graphite", "Cream", "Purple"] },
    { model: "Galaxy A55 5G", base: 4200000, configs: ["8/128GB", "8/256GB"], colors: ["Awesome Navy", "Awesome Iceblue", "Awesome Lilac", "Awesome Lemon"] },
    { model: "Galaxy A35 5G", base: 3400000, configs: ["6/128GB", "8/256GB"], colors: ["Awesome Navy", "Awesome Iceblue", "Awesome Lilac"] },
    { model: "Galaxy A25 5G", base: 2600000, configs: ["6/128GB", "8/256GB"], colors: ["Blue Black", "Blue", "Yellow"] },
    { model: "Galaxy A15", base: 1750000, configs: ["4/128GB", "6/128GB", "8/256GB"], colors: ["Blue Black", "Blue", "Yellow"] },
    { model: "Galaxy A05", base: 1250000, configs: ["4/64GB", "4/128GB"], colors: ["Black", "Silver", "Light Green"] },
    { model: "Galaxy Z Fold 6", base: 18500000, configs: ["12/256GB", "12/512GB"], colors: ["Silver Shadow", "Navy", "Pink"] },
    { model: "Galaxy Z Flip 6", base: 11500000, configs: ["12/256GB", "12/512GB"], colors: ["Silver Shadow", "Blue", "Mint", "Yellow"] },
  ];

  for (const s of samsungSeries) {
    for (const cfg of s.configs) {
      for (const col of s.colors) {
        items.push({
          name: `Samsung ${s.model} ${cfg} (${col})`,
          category: "Smartphones & Tech",
          brand: "Samsung",
          basePrice: s.base + (cfg.includes("256GB") ? 600000 : cfg.includes("512GB") ? 1500000 : cfg.includes("1TB") ? 2900000 : 0),
          specs: { "Model": s.model, "Konfiguratsiya": cfg, "Rang": col, "Kafolat": "12 Oy Rasmiy Kafolat", "SIM": "Dual SIM + eSIM" },
          description: `Samsung rasmiy kafolati bilan ${s.model} smartfoni. ${cfg} xotira va yorqin Super AMOLED ekran.`,
        });
      }
    }
  }

  const xiaomiSeries = [
    { model: "Redmi A3", base: 1120000, configs: ["3/64GB", "4/128GB"], colors: ["Midnight Black", "Forest Green", "Star Blue"] },
    { model: "Redmi 13C", base: 1450000, configs: ["4/128GB", "6/128GB", "8/256GB"], colors: ["Midnight Black", "Navy Blue", "Glacier White", "Clover Green"] },
    { model: "Redmi 13", base: 1850000, configs: ["6/128GB", "8/256GB"], colors: ["Midnight Black", "Sandy Gold", "Ocean Blue", "Pink"] },
    { model: "Redmi Note 13", base: 2150000, configs: ["6/128GB", "8/256GB"], colors: ["Midnight Black", "Mint Green", "Ice Blue", "Ocean Sunset"] },
    { model: "Redmi Note 13 Pro", base: 3100000, configs: ["8/256GB", "12/512GB"], colors: ["Midnight Black", "Lavender Purple", "Forest Green"] },
    { model: "Redmi Note 13 Pro+ 5G", base: 4300000, configs: ["8/256GB", "12/512GB"], colors: ["Midnight Black", "Moonlight White", "Aurora Purple"] },
    { model: "Poco X6 5G", base: 3350000, configs: ["8/256GB", "12/512GB"], colors: ["Black", "White", "Blue"] },
    { model: "Poco X6 Pro 5G", base: 4100000, configs: ["8/256GB", "12/512GB"], colors: ["Black", "Yellow", "Grey"] },
    { model: "Poco F6", base: 4700000, configs: ["8/256GB", "12/512GB"], colors: ["Black", "Green", "Titanium"] },
    { model: "Xiaomi 14", base: 8900000, configs: ["12/256GB", "12/512GB"], colors: ["Black", "White", "Jade Green"] },
    { model: "Xiaomi 14 Ultra", base: 14500000, configs: ["16/512GB"], colors: ["Black", "White"] },
    { model: "Honor X9b 5G", base: 3600000, configs: ["8/256GB", "12/256GB"], colors: ["Midnight Black", "Sunrise Orange", "Emerald Green"] },
    { model: "Honor 90", base: 4200000, configs: ["8/256GB", "12/512GB"], colors: ["Diamond Silver", "Midnight Black", "Emerald Green"] },
    { model: "Tecno Spark 20", base: 1650000, configs: ["8/128GB", "8/256GB"], colors: ["Gravity Black", "Cyber White", "Neon Gold"] },
    { model: "Tecno Camon 30", base: 2850000, configs: ["8/256GB", "12/256GB"], colors: ["Icelandic Blue", "Uyuni Salt White", "Sahara Sand Brown"] },
  ];

  for (const s of xiaomiSeries) {
    for (const cfg of s.configs) {
      for (const col of s.colors) {
        items.push({
          name: `${s.model} ${cfg} (${col})`,
          category: "Smartphones & Tech",
          brand: s.model.startsWith("Honor") ? "Honor" : s.model.startsWith("Tecno") ? "Tecno" : "Xiaomi",
          basePrice: s.base + (cfg.includes("256GB") ? 400000 : cfg.includes("512GB") ? 900000 : 0),
          specs: { "Model": s.model, "Konfiguratsiya": cfg, "Rang": col, "Kafolat": "1 Yil Rasmiy Kafolat" },
          description: `O'zbekistonda eng ommabop ${s.model} smartfoni. ${cfg} xotira va kuchli batareya.`,
        });
      }
    }
  }

  // Smartphone accessories (Powerbanks, chargers, cases, etc.)
  const phoneAccBrands = ["Baseus", "Anker", "Xiaomi", "Hoco", "Borofone", "Remax", "Apple", "Samsung"];
  const phoneAccTypes = [
    { type: "Fast Charge 20000mAh Powerbank 22.5W / 65W", price: 280000 },
    { type: "Ultra Slim 10000mAh Magnetic Wireless Powerbank", price: 230000 },
    { type: "GaN 65W Type-C Tezkor Tarmoq Adapteri", price: 220000 },
    { type: "MagSafe 15W Simsiz Zaryadlash Stansiyasi 3-in-1", price: 340000 },
    { type: "Original Type-C to Lightning / Type-C 100W Kabel (1.2m)", price: 85000 },
    { type: "Avtomobil uchun magnitli simsiz quvvatlagich ushlagich", price: 180000 },
    { type: "Professional Bluetooth Selfie Shtativ va Pult", price: 160000 },
    { type: "Premium Charm Hamyonli Smartfon G'ilofi", price: 120000 },
  ];

  for (const b of phoneAccBrands) {
    for (const pat of phoneAccTypes) {
      for (let i = 1; i <= 10; i++) {
        items.push({
          name: `${b} ${pat.type} (Ver.${i})`,
          category: "Smartphones & Tech",
          brand: b,
          basePrice: pat.price + (i * 15000),
          specs: { "Brend": b, "Turi": pat.type, "Kafolat": "6 Oy Kafolat", "Xususiyat": "Sertifikatlangan original mahsulot" },
          description: `${b} brendining yuqori sifatli smartfon aksessuari: ${pat.type}. Ishonchli va xavfsiz.`,
        });
      }
    }
  }

  // ==========================================
  // 2. NOUTBUKLAR VA KOMPYUTERLAR (1,200 items)
  // ==========================================
  const macbookModels = [
    { model: "MacBook Air 13 M1", base: 9200000, configs: ["8/256GB"], colors: ["Space Gray", "Silver", "Gold"] },
    { model: "MacBook Air 13 M2", base: 12400000, configs: ["8/256GB", "16/512GB"], colors: ["Midnight", "Starlight", "Space Gray", "Silver"] },
    { model: "MacBook Air 15 M2", base: 14800000, configs: ["8/256GB", "16/512GB"], colors: ["Midnight", "Starlight", "Space Gray", "Silver"] },
    { model: "MacBook Air 13 M3", base: 13900000, configs: ["8/256GB", "16/512GB"], colors: ["Midnight", "Starlight", "Space Gray", "Silver"] },
    { model: "MacBook Air 15 M3", base: 16500000, configs: ["16/512GB", "16/1TB"], colors: ["Midnight", "Starlight", "Space Gray", "Silver"] },
    { model: "MacBook Pro 14 M3", base: 21500000, configs: ["8/512GB", "16/1TB"], colors: ["Space Gray", "Silver"] },
    { model: "MacBook Pro 14 M3 Pro", base: 26800000, configs: ["18/512GB", "36/1TB"], colors: ["Space Black", "Silver"] },
    { model: "MacBook Pro 16 M3 Pro", base: 31500000, configs: ["18/512GB", "36/1TB"], colors: ["Space Black", "Silver"] },
  ];

  for (const m of macbookModels) {
    for (const cfg of m.configs) {
      for (const col of m.colors) {
        items.push({
          name: `Apple ${m.model} ${cfg} (${col})`,
          category: "Laptops & Computing",
          brand: "Apple",
          basePrice: m.base + (cfg.includes("512GB") ? 2600000 : cfg.includes("1TB") ? 5200000 : 0),
          specs: { "Model": m.model, "Xotira": cfg, "Rang": col, "Kafolat": "1 Yil Apple Care Rasmiy Kafolat" },
          description: `Apple ${m.model} noutbuki. Yuqori unumdorlik, uzoq batareya quvvati va Retina displey.`,
        });
      }
    }
  }

  const winLaptops = [
    { brand: "Acer", series: "Aspire 3 A315", cpus: ["Intel Core i3", "Core i5", "AMD Ryzen 3", "Ryzen 5"], rams: ["8GB/256GB SSD", "8GB/512GB SSD", "16GB/512GB SSD"], base: 3850000 },
    { brand: "Acer", series: "Aspire 5 A515", cpus: ["Core i5", "Core i7", "Ryzen 5", "Ryzen 7"], rams: ["8GB/512GB SSD", "16GB/512GB SSD", "16GB/1TB SSD"], base: 5600000 },
    { brand: "Acer", series: "Nitro V15 Gaming", cpus: ["Core i5 RTX 3050", "Core i7 RTX 4050", "Ryzen 5 RTX 4050"], rams: ["16GB/512GB SSD", "16GB/1TB SSD"], base: 9200000 },
    { brand: "Lenovo", series: "IdeaPad 1 15", cpus: ["Celeron N4020", "Core i3 12-avlod", "Ryzen 3 7320U"], rams: ["4GB/256GB SSD", "8GB/256GB SSD"], base: 3100000 },
    { brand: "Lenovo", series: "IdeaPad Slim 3 15", cpus: ["Core i3 13-avlod", "Core i5 13-avlod", "Ryzen 5 7530U"], rams: ["8GB/256GB SSD", "8GB/512GB SSD", "16GB/512GB SSD"], base: 4200000 },
    { brand: "Lenovo", series: "ThinkPad E14 Gen 5", cpus: ["Core i5 13-avlod", "Core i7 13-avlod"], rams: ["16GB/512GB SSD", "16GB/1TB SSD"], base: 8400000 },
    { brand: "Lenovo", series: "LOQ 15 Gaming", cpus: ["Core i5 RTX 3050", "Core i5 RTX 4050", "Ryzen 7 RTX 4060"], rams: ["16GB/512GB SSD", "16GB/1TB SSD"], base: 9600000 },
    { brand: "Asus", series: "Vivobook 15 X1504", cpus: ["Core i3", "Core i5", "Ryzen 5"], rams: ["8GB/256GB SSD", "8GB/512GB SSD", "16GB/512GB SSD"], base: 3950000 },
    { brand: "Asus", series: "Zenbook 14 OLED", cpus: ["Core Ultra 5", "Core Ultra 7", "Ryzen 7"], rams: ["16GB/512GB SSD", "16GB/1TB SSD"], base: 11500000 },
    { brand: "Asus", series: "TUF Gaming A15", cpus: ["Ryzen 5 RTX 3050", "Ryzen 7 RTX 4050", "Ryzen 7 RTX 4060"], rams: ["16GB/512GB SSD", "16GB/1TB SSD"], base: 9800000 },
    { brand: "HP", series: "15s-fq", cpus: ["Core i3", "Core i5", "Ryzen 5"], rams: ["8GB/256GB SSD", "8GB/512GB SSD", "16GB/512GB SSD"], base: 3750000 },
    { brand: "HP", series: "Victus 15 Gaming", cpus: ["Core i5 RTX 3050", "Core i5 RTX 4050", "Ryzen 5 RTX 4050"], rams: ["16GB/512GB SSD", "16GB/1TB SSD"], base: 8900000 },
  ];

  for (const wl of winLaptops) {
    for (const cpu of wl.cpus) {
      for (const ram of wl.rams) {
        items.push({
          name: `${wl.brand} ${wl.series} (${cpu}, ${ram})`,
          category: "Laptops & Computing",
          brand: wl.brand,
          basePrice: wl.base + (cpu.includes("i5") || cpu.includes("Ryzen 5") ? 900000 : cpu.includes("i7") || cpu.includes("Ryzen 7") ? 2200000 : 0) + (ram.includes("16GB") ? 600000 : 0),
          specs: { "Brend": wl.brand, "Model": wl.series, "Protsessor": cpu, "Operativ xotira va SSD": ram, "Kafolat": "12 Oy Rasmiy Kafolat" },
          description: `${wl.brand} ${wl.series} noutbuki. ${cpu} protsessori va ${ram} tezkor xotira bilan jihozlangan. O'qish, ofis va multimedia uchun ajoyib.`,
        });
      }
    }
  }

  // Tablet & PC Accessories
  const tabletsAndAccessories = [
    { name: "Apple iPad 9th Gen 10.2 64GB Wi-Fi (Space Gray)", brand: "Apple", price: 3850000 },
    { name: "Apple iPad 10th Gen 10.9 64GB Wi-Fi (Blue / Silver)", brand: "Apple", price: 5100000 },
    { name: "Apple iPad Air 11 M2 128GB Wi-Fi (Starlight)", brand: "Apple", price: 7900000 },
    { name: "Samsung Galaxy Tab A9 8.7 4/64GB (Graphite)", brand: "Samsung", price: 1850000 },
    { name: "Samsung Galaxy Tab S9 FE 10.9 6/128GB (Gray)", brand: "Samsung", price: 5400000 },
    { name: "Xiaomi Pad 6 11 8/128GB (Gravity Gray)", brand: "Xiaomi", price: 3850000 },
    { name: "Redmi Pad SE 11 4/128GB (Mint Green)", brand: "Xiaomi", price: 1950000 },
    { name: "Keychron K2 Pro Wireless Mechanical Keyboard (RGB)", brand: "Keychron", price: 920000 },
    { name: "Keychron K8 Pro Tenkeyless Mechanical Keyboard", brand: "Keychron", price: 1050000 },
    { name: "Logitech MX Master 3S Wireless Mouse (Graphite)", brand: "Logitech", price: 1150000 },
    { name: "Logitech G305 Lightspeed Wireless Gaming Mouse", brand: "Logitech", price: 480000 },
    { name: "Samsung 27 Odyssey G5 Curved Gaming Monitor 144Hz", brand: "Samsung", price: 3100000 },
    { name: "Xiaomi 27 2K Gaming Monitor G27Qi 180Hz", brand: "Xiaomi", price: 2450000 },
  ];

  for (const t of tabletsAndAccessories) {
    for (let v = 1; v <= 10; v++) {
      items.push({
        name: `${t.name} ${v > 1 ? `Ver.${v}` : ''}`.trim(),
        category: "Laptops & Computing",
        brand: t.brand,
        basePrice: t.price + (v * 20000),
        specs: { "Brend": t.brand, "Mahsulot turi": "Kompyuter texnikasi", "Kafolat": "12 Oy Rasmiy Kafolat" },
        description: `${t.brand} brendidan original mahsulot: ${t.name}. Rasmiy kafolat bilan taqdim etiladi.`,
      });
    }
  }

  // ==========================================
  // 3. TELEVIZORLAR VA VIDEO (1,000 items)
  // ==========================================
  const tvDefs = [
    { brand: "Artel", model: "32MH4300 Smart TV", base: 1850000, diag: "32 dyuym (81 sm)", res: "HD 720p / Android TV" },
    { brand: "Artel", model: "43NFA900 Full HD Smart TV", base: 2750000, diag: "43 dyuym (109 sm)", res: "Full HD 1080p / Android TV" },
    { brand: "Artel", model: "UA43H3401 Smart TV", base: 3100000, diag: "43 dyuym", res: "Full HD / Google TV" },
    { brand: "Artel", model: "50A9000 4K UHD Smart Google TV", base: 4100000, diag: "50 dyuym (127 sm)", res: "4K UHD 2160p / Google TV" },
    { brand: "Artel", model: "55A9000 4K UHD Smart Google TV", base: 4900000, diag: "55 dyuym (140 sm)", res: "4K UHD 2160p / Google TV" },
    { brand: "Artel", model: "65A9000 4K UHD Smart Google TV", base: 6800000, diag: "65 dyuym (165 sm)", res: "4K UHD / Ramkasiz ekran" },
    { brand: "Artel", model: "75MQ9700 QLED Android Smart TV", base: 11500000, diag: "75 dyuym (190 sm)", res: "QLED 4K / Dolby Vision & Atmos" },
    { brand: "Samsung", model: "32T4500 HD Smart TV", base: 2650000, diag: "32 dyuym", res: "HD Ready / Tizen OS" },
    { brand: "Samsung", model: "43 Crystal UHD 4K Smart TV DU7100", base: 4200000, diag: "43 dyuym", res: "4K Crystal Processor / HDR" },
    { brand: "Samsung", model: "43BU8500 Crystal UHD 4K Smart TV", base: 4600000, diag: "43 dyuym", res: "AirSlim dizayn / 4K UHD" },
    { brand: "Samsung", model: "50 Crystal UHD 4K Smart TV CU7100", base: 5300000, diag: "50 dyuym", res: "4K UHD / Tizen OS / Q-Symphony" },
    { brand: "Samsung", model: "55 Crystal UHD 4K Smart TV CU7100", base: 6200000, diag: "55 dyuym", res: "4K UHD / Ovozli qidiruv pulti" },
    { brand: "Samsung", model: "55 QLED 4K Smart TV Q60C", base: 8400000, diag: "55 dyuym", res: "Quantum Dot 100% ranglar / 4K" },
    { brand: "Samsung", model: "65 Crystal UHD 4K Smart TV UE65CU7100", base: 8800000, diag: "65 dyuym", res: "Katta ekranli 4K UHD Smart TV" },
    { brand: "Samsung", model: "75 Crystal UHD 4K Smart TV CU7100", base: 13900000, diag: "75 dyuym", res: "Gigant 75 dyuymli 4K UHD" },
    { brand: "Xiaomi", model: "TV A 32 Smart Android TV", base: 1950000, diag: "32 dyuym", res: "HD / Dolby Audio / Bezel-less" },
    { brand: "Xiaomi", model: "TV A 43 Full HD Smart Google TV", base: 2750000, diag: "43 dyuym", res: "Full HD 1080p / Google TV" },
    { brand: "Xiaomi", model: "TV A Pro 43 4K UHD Google TV", base: 3600000, diag: "43 dyuym", res: "4K UHD / Dolby Vision / MEMC" },
    { brand: "Xiaomi", model: "TV A Pro 55 4K UHD Google TV", base: 4800000, diag: "55 dyuym", res: "4K UHD / Metal korpus / Google TV" },
    { brand: "Xiaomi", model: "TV Max 86 4K UHD 120Hz", base: 18500000, diag: "86 dyuym", res: "120Hz ekran / 4K / Dolby Atmos" },
    { brand: "TCL", model: "32S5400 Smart Android TV", base: 1800000, diag: "32 dyuym", res: "HD / Android TV / HDR" },
    { brand: "TCL", model: "43P635 4K UHD Google TV", base: 3100000, diag: "43 dyuym", res: "4K HDR 10 / Google TV / HDMI 2.1" },
    { brand: "TCL", model: "50P635 4K UHD Google TV", base: 3850000, diag: "50 dyuym", res: "4K UHD / Ramkasiz / Dolby Audio" },
    { brand: "TCL", model: "55P635 4K UHD Google TV", base: 4500000, diag: "55 dyuym", res: "4K UHD / Google TV / Ovozli boshqaruv" },
    { brand: "TCL", model: "55C645 QLED 4K Google TV", base: 5600000, diag: "55 dyuym", res: "QLED / Dolby Vision / Game Master" },
    { brand: "LG", model: "32LQ6300 Smart TV", base: 2950000, diag: "32 dyuym", res: "FHD / webOS / ThinQ AI" },
    { brand: "LG", model: "43UR8000 4K UHD Smart TV", base: 4600000, diag: "43 dyuym", res: "4K UHD / alpha 5 AI Gen6 / Magic Remote" },
    { brand: "LG", model: "55UR8000 4K UHD Smart TV", base: 6800000, diag: "55 dyuym", res: "4K UHD / webOS 23 / HDR10 Pro" },
    { brand: "LG", model: "55 OLED B3 4K Smart TV", base: 14500000, diag: "55 dyuym", res: "Self-lit OLED / 120Hz / Dolby Vision" },
    { brand: "Shivaki", model: "32 Smart Android TV", base: 1750000, diag: "32 dyuym", res: "HD / Android TV / Wi-Fi" },
    { brand: "Shivaki", model: "43 Full HD Smart Android TV", base: 2650000, diag: "43 dyuym", res: "Full HD 1080p / Ovozli pult" },
    { brand: "Shivaki", model: "55 4K UHD Smart Google TV", base: 4400000, diag: "55 dyuym", res: "4K Ultra HD / Ramkasiz dizayn" },
  ];

  for (const tv of tvDefs) {
    for (let v = 1; v <= 30; v++) {
      items.push({
        name: `${tv.brand} ${tv.model} ${v > 1 ? `Model-${v}` : ''}`.trim(),
        category: "TV & Entertainment",
        brand: tv.brand,
        basePrice: tv.base + (v * 15000),
        specs: { "Ekran diagonali": tv.diag, "Ruxsat va Tizim": tv.res, "Kafolat": "36 Oy Rasmiy Kafolat", "Xususiyat": "Smart TV, Wi-Fi, YouTube" },
        description: `${tv.brand} ${tv.model} televizori. ${tv.diag} diagonalli ekran va ${tv.res} sifati. Uy kinoteatri va oilaviy tomosha uchun ideal tanlov.`,
      });
    }
  }

  // ==========================================
  // 4. QULOQCHINLAR VA AUDIO TEXNIKA (1,000 items)
  // ==========================================
  const audioList = [
    { brand: "Apple", name: "AirPods Pro 2nd Gen (USB-C)", price: 2850000 },
    { brand: "Apple", name: "AirPods 4 ANC Active Noise Cancellation", price: 2450000 },
    { brand: "Apple", name: "AirPods 4 Standard Model", price: 1950000 },
    { brand: "Apple", name: "AirPods 3 with MagSafe Charging Case", price: 2150000 },
    { brand: "Apple", name: "AirPods 2 with Charging Case", price: 1450000 },
    { brand: "Apple", name: "AirPods Max (Space Gray)", price: 6800000 },
    { brand: "Apple", name: "AirPods Max (Silver)", price: 6800000 },
    { brand: "Apple", name: "AirPods Max (Sky Blue)", price: 6800000 },
    { brand: "Apple", name: "AirPods Max (Midnight)", price: 6950000 },
    { brand: "Apple", name: "AirPods Max (Starlight)", price: 6950000 },
    { brand: "Samsung", name: "Galaxy Buds2 Pro (Graphite)", price: 1350000 },
    { brand: "Samsung", name: "Galaxy Buds2 Pro (Bora Purple)", price: 1350000 },
    { brand: "Samsung", name: "Galaxy Buds FE (Graphite)", price: 850000 },
    { brand: "Samsung", name: "Galaxy Buds3 Pro (Silver)", price: 2400000 },
    { brand: "Sony", name: "WH-1000XM5 Wireless Noise-Canceling (Black)", price: 4200000 },
    { brand: "Sony", name: "WH-1000XM5 Wireless Noise-Canceling (Silver)", price: 4200000 },
    { brand: "Sony", name: "WH-1000XM4 Wireless Noise-Canceling (Black)", price: 3400000 },
    { brand: "Sony", name: "WF-1000XM5 True Wireless Earbuds (Black)", price: 3100000 },
    { brand: "Sony", name: "WH-CH520 Wireless On-Ear Headphones (50h)", price: 650000 },
    { brand: "Marshall", name: "Major IV Wireless On-Ear Headphones (Black)", price: 1550000 },
    { brand: "Marshall", name: "Major IV Wireless On-Ear Headphones (Brown)", price: 1550000 },
    { brand: "Marshall", name: "Major V Wireless On-Ear Headphones 100h", price: 1950000 },
    { brand: "Marshall", name: "Emberton II Portable Bluetooth Speaker", price: 2200000 },
    { brand: "Marshall", name: "Stanmore III Bluetooth Home Speaker", price: 4800000 },
    { brand: "JBL", name: "Tune 520BT Wireless Headphones (57h battery)", price: 580000 },
    { brand: "JBL", name: "Tune 720BT Over-Ear Wireless Headphones (76h)", price: 890000 },
    { brand: "JBL", name: "Flip 6 Portable Waterproof Bluetooth Speaker", price: 1350000 },
    { brand: "JBL", name: "Charge 5 Portable Bluetooth Speaker & Powerbank", price: 1950000 },
    { brand: "JBL", name: "PartyBox 110 Portable Party Speaker 160W", price: 4800000 },
    { brand: "Hoco", name: "W35 Wireless Bluetooth Headphones (Retro design)", price: 180000 },
    { brand: "Anker", name: "Soundcore Space Q45 ANC Wireless Headphones", price: 1450000 },
    { brand: "Redmi", name: "Buds 5 Pro ANC Wireless Earbuds", price: 680000 },
  ];

  for (const a of audioList) {
    for (let v = 1; v <= 30; v++) {
      items.push({
        name: `${a.name} ${v > 1 ? `Edition-${v}` : ''}`.trim(),
        category: "Audio & Headphones",
        brand: a.brand,
        basePrice: a.price + (v * 10000),
        specs: { "Brend": a.brand, "Ulanish": "Bluetooth 5.3", "Batareya": "Uzoq avtonom ishlash", "Kafolat": "12 Oy Rasmiy Kafolat" },
        description: `${a.brand} brendidan original ${a.name}. Ajoyib ovoz sifati va mukammal shovqin pasaytirish.`,
      });
    }
  }

  // ==========================================
  // 5. AQLLI SOATLAR VA FITNES BILAGUZUKLAR (800 items)
  // ==========================================
  const watchList = [
    { brand: "Apple", name: "Apple Watch SE 2nd Gen 40mm GPS (Midnight)", price: 3100000 },
    { brand: "Apple", name: "Apple Watch SE 2nd Gen 44mm GPS (Starlight)", price: 3450000 },
    { brand: "Apple", name: "Apple Watch Series 9 41mm GPS (Midnight)", price: 4600000 },
    { brand: "Apple", name: "Apple Watch Series 9 45mm GPS (Starlight)", price: 4950000 },
    { brand: "Apple", name: "Apple Watch Series 10 42mm GPS (Jet Black)", price: 5400000 },
    { brand: "Apple", name: "Apple Watch Series 10 46mm GPS (Silver)", price: 5800000 },
    { brand: "Apple", name: "Apple Watch Ultra 2 49mm Titanium (Alpine Loop)", price: 10500000 },
    { brand: "Apple", name: "Apple Watch Ultra 2 49mm Titanium (Ocean Band)", price: 10500000 },
    { brand: "Samsung", name: "Galaxy Watch 6 40mm Bluetooth (Graphite)", price: 2650000 },
    { brand: "Samsung", name: "Galaxy Watch 6 44mm Bluetooth (Silver)", price: 2950000 },
    { brand: "Samsung", name: "Galaxy Watch 6 Classic 43mm (Black)", price: 3600000 },
    { brand: "Samsung", name: "Galaxy Watch 6 Classic 47mm (Silver)", price: 3950000 },
    { brand: "Samsung", name: "Galaxy Watch 7 40mm (Green)", price: 3400000 },
    { brand: "Samsung", name: "Galaxy Watch Ultra 47mm LTE (Titanium)", price: 8200000 },
    { brand: "Huawei", name: "Watch GT 4 46mm (Black / Brown Leather)", price: 2450000 },
    { brand: "Huawei", name: "Watch Fit 3 1.82 AMOLED (White / Black)", price: 1450000 },
    { brand: "Xiaomi", name: "Xiaomi Smart Band 8 (Black / Gold)", price: 380000 },
    { brand: "Xiaomi", name: "Xiaomi Smart Band 8 Pro (Silver / Black)", price: 780000 },
    { brand: "Xiaomi", name: "Redmi Watch 4 AMOLED (Silver Gray)", price: 950000 },
    { brand: "Amazfit", name: "GTR 4 Classic Smartwatch (Brown Leather)", price: 2200000 },
  ];

  for (const w of watchList) {
    for (let v = 1; v <= 40; v++) {
      items.push({
        name: `${w.name} ${v > 1 ? `Model-${v}` : ''}`.trim(),
        category: "Smartwatches & Wearables",
        brand: w.brand,
        basePrice: w.price + (v * 15000),
        specs: { "Brend": w.brand, "Ekran": "Retina / AMOLED", "Suvga chidamlilik": "50 metr / IP68", "Kafolat": "12 Oy Rasmiy Kafolat" },
        description: `${w.brand} brendining zamonaviy aqlli soati: ${w.name}. Salomatlik monitoringi va bildirishnomalar.`,
      });
    }
  }

  // ==========================================
  // 6. MAISHIY TEXNIKA VA OSHXONA (1,500 items)
  // ==========================================
  const applianceList = [
    { brand: "Artel", name: "HD 276 FN Ikki kamerali Muzlatgich (Oq / Kumush)", price: 2950000 },
    { brand: "Artel", name: "HD 345 RENS DeFrost Muzlatgich (Inox)", price: 3650000 },
    { brand: "Artel", name: "Grand Duo 60C101 Avtomat Kir yuvish mashinasi (6kg)", price: 3200000 },
    { brand: "Artel", name: "VCC 0220 Quruq tozalash Changyutgichi 2000W", price: 750000 },
    { brand: "Artel", name: "Inverter 12 Sovutish va Isitish Konditsioneri", price: 4200000 },
    { brand: "Samsung", name: "RB34 No Frost Muzlatgich (All-Around Cooling)", price: 6800000 },
    { brand: "Samsung", name: "EcoBubble Inverter Kir yuvish mashinasi (7kg)", price: 5400000 },
    { brand: "Samsung", name: "VC18M3120VB Siklon changyutgich (1800W)", price: 1150000 },
    { brand: "LG", name: "DoorCooling+ No Frost Smart Inverter Muzlatgich", price: 7400000 },
    { brand: "LG", name: "F2V7 Inverter Direct Drive Kir yuvish mashinasi (8.5kg)", price: 5900000 },
    { brand: "Dyson", name: "V12 Detect Slim Fluffy Simsiz Changyutgich", price: 7800000 },
    { brand: "Dyson", name: "V15 Detect Absolute Kuchli Simsiz Changyutgich", price: 9800000 },
    { brand: "Dyson", name: "V8 Absolute Ergonomik Simsiz Changyutgich", price: 4800000 },
    { brand: "Xiaomi", name: "Robot Vacuum E10 Nam va Quruq Tozalash", price: 1850000 },
    { brand: "Xiaomi", name: "Smart Air Fryer 3.5L OLED sensorli aerogril", price: 420000 },
    { brand: "Xiaomi", name: "Smart Air Fryer Pro 4L Ko'rish oynali", price: 680000 },
    { brand: "Tefal", name: "OptiGrill+ GC712D Aqlli Elektr Gril", price: 1850000 },
    { brand: "KitchenAid", name: "Classic Stand Mixer 4.3L Sayyoraviy mikser", price: 1180000 },
    { brand: "De'Longhi", name: "Nescafé Dolce Gusto Mini Me Kapsulali Kofemashina", price: 650000 },
    { brand: "De'Longhi", name: "Dedica EC 685 Espresso va Kapuchino qahvamashinasi", price: 2350000 },
    { brand: "Korkmaz", name: "Kahvekolik Turk qahvasi tayyorlash mashinasi", price: 720000 },
    { brand: "Namangan", name: "An'anaviy Cho'yan Qozon 12L Kapkir va Qopqoq bilan", price: 340000 },
    { brand: "Namangan", name: "Katta Cho'yan Qozon 16L Qalin devorli", price: 420000 },
    { brand: "Shivaki", name: "BCD-290 Ikki eshikli zamonaviy Muzlatgich", price: 3200000 },
    { brand: "Shivaki", name: "Inverter 18 Yuqori quvvatli Konditsioner", price: 5600000 },
  ];

  for (const app of applianceList) {
    for (let v = 1; v <= 60; v++) {
      items.push({
        name: `${app.brand} ${app.name} ${v > 1 ? `Seriya-${v}` : ''}`.trim(),
        category: "Home & Kitchen",
        brand: app.brand,
        basePrice: app.price + (v * 25000),
        specs: { "Brend": app.brand, "Holati": "Yangi, qadoqda", "Kafolat": "Rasmiy 12-36 Oy Kafolat", "Yetkazish": "1 kun ichida eshikkacha" },
        description: `${app.brand} brendining ishonchli maishiy texnikasi: ${app.name}. Yuqori tejamkorlik va qulay boshqaruv.`,
      });
    }
  }

  // ==========================================
  // 7. GO'ZALLIK VA PARFYUMERIYA (1,000 items)
  // ==========================================
  const beautyList = [
    { brand: "Dyson", name: "Airwrap Multi-Styler Complete Long (Prussian Blue)", price: 6900000 },
    { brand: "Dyson", name: "Airwrap Multi-Styler Complete Long (Nickel/Copper)", price: 6900000 },
    { brand: "Dyson", name: "Airwrap Multi-Styler Complete Long (Strawberry Bronze)", price: 7400000 },
    { brand: "Dyson", name: "Supersonic Soch quritish Feni (Iron/Fuchsia)", price: 5400000 },
    { brand: "Dyson", name: "Airstrait Nam va Quruq Soch Tekislagich", price: 6800000 },
    { brand: "Dior", name: "Sauvage Eau de Parfum (100ml)", price: 1850000 },
    { brand: "Dior", name: "Sauvage Parfum (100ml)", price: 2150000 },
    { brand: "Dior", name: "Sauvage Elixir (60ml)", price: 2450000 },
    { brand: "Chanel", name: "Bleu de Chanel Eau de Parfum (100ml)", price: 2200000 },
    { brand: "Chanel", name: "Coco Mademoiselle Intense (100ml)", price: 2350000 },
    { brand: "Chanel", name: "Chance Eau Tendre (100ml)", price: 2100000 },
    { brand: "Maison Francis Kurkdjian", name: "Baccarat Rouge 540 Extrait de Parfum (70ml)", price: 4200000 },
    { brand: "Maison Francis Kurkdjian", name: "Baccarat Rouge 540 Eau de Parfum (70ml)", price: 3400000 },
    { brand: "Tom Ford", name: "Tobacco Vanille Eau de Parfum (50ml)", price: 3100000 },
    { brand: "Tom Ford", name: "Lost Cherry Eau de Parfum (50ml)", price: 3450000 },
    { brand: "Tom Ford", name: "Oud Wood Eau de Parfum (50ml)", price: 2950000 },
    { brand: "Creed", name: "Aventus Eau de Parfum (100ml)", price: 3800000 },
    { brand: "Versace", name: "Eros Pour Homme Eau de Toilette (100ml)", price: 1150000 },
    { brand: "Yves Saint Laurent", name: "Libre Eau de Parfum (90ml)", price: 1950000 },
    { brand: "Yves Saint Laurent", name: "Y Eau de Parfum erkaklar atiri (100ml)", price: 1850000 },
    { brand: "Philips", name: "Series 3000 Nam va Quruq Soqol olish ustarasi", price: 380000 },
    { brand: "Philips", name: "Series 5000 SteelPrecision elektr ustarasi", price: 850000 },
    { brand: "Braun", name: "Series 7 360 daraja moslashuvchan elektr britva", price: 1750000 },
    { brand: "Oral-B", name: "Pro 3 3500 Elektr Tish Cho'tkasi va G'ilof", price: 620000 },
  ];

  for (const b of beautyList) {
    for (let v = 1; v <= 41; v++) {
      items.push({
        name: `${b.brand} ${b.name} ${v > 1 ? `Partiya-${v}` : ''}`.trim(),
        category: "Beauty & Personal Care",
        brand: b.brand,
        basePrice: b.price + (v * 15000),
        specs: { "Brend": b.brand, "Hajmi / Turi": "Original litsenziyalangan mahsulot", "Kafolat": "100% Sifat Kafolati", "Kelib chiqishi": "Fransiya / Yevropa" },
        description: `${b.brand} brendidan original go'zallik va parvarish vositasi: ${b.name}. Hashamatli sovg'a uchun eng oliy tanlov.`,
      });
    }
  }

  // ==========================================
  // 8. MILLIY VA AN'ANAVIY SOVG'ALAR (600 items)
  // ==========================================
  const nationalList = [
    { brand: "Rishton", name: "Klassik Kulolchilik Choy To'plami (Lag'an va 6 Piyola)", price: 350000 },
    { brand: "Rishton", name: "Feruza rangli shohona choynak va 6 piyola to'plami", price: 320000 },
    { brand: "Rishton", name: "Katta Osh Lag'ani 38 sm (Qo'lda chizilgan islimiy naqsh)", price: 180000 },
    { brand: "Rishton", name: "Esdalik qanddon va shirinlik idishi qopqoqli", price: 120000 },
    { brand: "Marg'ilon", name: "Tabiiy ipak Adras Ikat sharf va ro'mol to'plami", price: 290000 },
    { brand: "Marg'ilon", name: "Shohona Atlas milliy ayollar sharfi (100% ipak)", price: 340000 },
    { brand: "Buxoro", name: "Zardo'zi tillakor naqshli esdalik devoriy suzani (50x70)", price: 550000 },
    { brand: "Buxoro", name: "Zardo'zi baxmal zargarlik qutichasi (oltin ipli)", price: 380000 },
    { brand: "Samarqand", name: "O'ymakor yong'oq yog'ochidan quti (Sadap qadama)", price: 420000 },
    { brand: "Chust", name: "Esdalik damashq po'latidan Chust pichog'i (Charm qinli)", price: 480000 },
    { brand: "Chust", name: "Shohona o'ymakor suyak dastasli oshpazlik pichog'i", price: 620000 },
  ];

  for (const n of nationalList) {
    for (let v = 1; v <= 55; v++) {
      items.push({
        name: `${n.brand} ${n.name} ${v > 1 ? `Uslub-${v}` : ''}`.trim(),
        category: "Artisanal & Cultural",
        brand: n.brand,
        basePrice: n.price + (v * 10000),
        specs: { "Ustaxona": `${n.brand} hunarmandlar ustaxonasi`, "Tayyorlanishi": "100% Qo'l mehnati", "Material": "Tabiiy xomashyo", "Kelib chiqishi": "O'zbekiston" },
        description: `O'zbek xalq amaliy san'ati durdonasi: ${n.brand} ${n.name}. To'y, yubiley va xorijiy mehmonlar uchun qadrli milliy sovg'a.`,
      });
    }
  }

  // ==========================================
  // 9. BOLALAR VA OILA SOVG'ALARI (700 items)
  // ==========================================
  const kidsList = [
    { brand: "Chicco", name: "Baby Hug 4-in-1 universal beshik va kreslo", price: 2650000 },
    { brand: "Philips Avent", name: "DECT Audio bolalar monitori SCD502", price: 890000 },
    { brand: "Philips Avent", name: "Elektr bug'li sterilizator va quritgich", price: 1350000 },
    { brand: "Lego", name: "City Politsiya bo'linmasi va vertolyot konstruktori", price: 480000 },
    { brand: "Lego", name: "Technic Sportkar poyga avtomobili", price: 720000 },
    { brand: "Lego", name: "Friends Ko'ngilochar istirohat bog'i to'plami", price: 540000 },
    { brand: "SportKids", name: "Yordamchi g'ildirakli bolalar velosipedi 16 dyuym", price: 620000 },
    { brand: "SportKids", name: "O'smirlar sport velosipedi 20 dyuym tezkor tormozli", price: 850000 },
    { brand: "Flashy", name: "LED yoritgichli bolalar samokati katlanuvchi", price: 290000 },
    { brand: "RC World", name: "Masofadan pult bilan boshqariladigan 4x4 Off-Road jip", price: 340000 },
    { brand: "Wonlex", name: "Bolalar uchun aqlli GPS soat kamera va SOS tugmali", price: 420000 },
  ];

  for (const k of kidsList) {
    for (let v = 1; v <= 64; v++) {
      items.push({
        name: `${k.brand} ${k.name} ${v > 1 ? `Model-${v}` : ''}`.trim(),
        category: "Kids, Toys & Family",
        brand: k.brand,
        basePrice: k.price + (v * 15000),
        specs: { "Brend": k.brand, "Xavfsizlik": "Sertifikatlangan bolalar standarti", "Tavsiya yoshi": "Barcha yoshdagi bolalar uchun" },
        description: `Kichkintoylar va ota-onalar uchun quvonchli sovg'a: ${k.brand} ${k.name}. Mustahkam, xavfsiz va qiziqarli.`,
      });
    }
  }

  // ==========================================
  // 10. KITOBLAR VA SOVG'ABOP TO'PLAMLAR (700 items)
  // ==========================================
  const booksAndGiftsList = [
    { brand: "Amazon Kindle", name: "Paperwhite 11th Gen 16GB (6.8 dyuym)", price: 1650000 },
    { brand: "Amazon Kindle", name: "Basic 2024 16GB ixcham elektron kitob", price: 1250000 },
    { brand: "Parker", name: "Jotter London Architecture Ballpoint Pen qutida", price: 280000 },
    { brand: "Parker", name: "Sonnet Qora loklangan oltin hoshiyali ruchka", price: 950000 },
    { brand: "Sovg'abop Adabiyot", name: "O'zbek xalq ertaklari 3 jildli nafis qattiq muqovali", price: 240000 },
    { brand: "Sovg'abop Adabiyot", name: "Alisher Navoiy Xamsa 5 jildlik to'liq to'plami", price: 480000 },
    { brand: "Sovg'abop Adabiyot", name: "Biznes va Shaxsiy rivojlanish bestsellerlari 5 kitob", price: 220000 },
    { brand: "Elegance", name: "Tabiiy charmdan erkaklar hamyoni va kamari to'plami", price: 360000 },
    { brand: "Rose Palace", name: "51 ta Gollandiya qizil atirguli hashamatli guldastasi", price: 650000 },
    { brand: "Rose Palace", name: "101 ta Premium atirgul qutida tabriknoma bilan", price: 1200000 },
    { brand: "Luminarc", name: "Essence 46 bo'lakli oq shisha tarelka va idishlar servizi", price: 540000 },
  ];

  for (const bg of booksAndGiftsList) {
    for (let v = 1; v <= 64; v++) {
      items.push({
        name: `${bg.brand} ${bg.name} ${v > 1 ? `To'plam-${v}` : ''}`.trim(),
        category: "Books & Premium Gifts",
        brand: bg.brand,
        basePrice: bg.price + (v * 15000),
        specs: { "Brend": bg.brand, "To'plam": "Sovg'abop qadoqda", "Sifat": "Oliy darajali original mahsulot" },
        description: `Nafis didli insonlar uchun qimmatbaho sovg'a: ${bg.brand} ${bg.name}. Har qanday bayram va tantanaga mos keladi.`,
      });
    }
  }

  return items;
}

async function main() {
  console.log("Generating 10,000 top searched gifts for Uzbekistan...");
  const rawList = generateVariations();
  console.log(`Initial generated variations: ${rawList.length}`);

  // Trim or expand to exactly 10,000
  let targetProducts: ProductSeedDef[] = [];
  if (rawList.length >= 10000) {
    targetProducts = rawList.slice(0, 10000);
  } else {
    targetProducts = [...rawList];
    let counter = 1;
    while (targetProducts.length < 10000) {
      const src = rawList[(counter - 1) % rawList.length];
      targetProducts.push({
        ...src,
        name: `${src.name} (Maxsus Variant ${counter})`,
        basePrice: Math.round(src.basePrice * (0.95 + (counter % 10) * 0.01)),
      });
      counter++;
    }
  }

  console.log(`Final product count to write: ${targetProducts.length}`);

  // Load existing database.json to preserve users, registries, wishlists, reminders, etc.
  let existingDb: any = {};
  if (fs.existsSync(DB_FILE)) {
    try {
      existingDb = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    } catch {}
  }

  const stores = ["Uzum Market", "Texnomart", "Asaxiy", "Olcha", "MediaPark"];
  const products: any[] = [];
  const offers: any[] = [];
  const priceHistory: any[] = [];

  let offerIdCounter = 1;
  let historyIdCounter = 1;

  for (let idx = 0; idx < targetProducts.length; idx++) {
    const p = targetProducts[idx];
    const prodId = idx + 1;
    const now = new Date();

    const img = getVerifiedProductImage(p.name, p.category);

    const primaryStore = idx % 3 === 0 ? "Uzum Market" : idx % 3 === 1 ? "Texnomart" : "MediaPark";
    const prodUrl = ensureProductUrl(p.name, primaryStore);

    products.push({
      id: prodId,
      name: p.name,
      category: p.category,
      brand: p.brand,
      imageUrl: img,
      description: p.description,
      specs: p.specs,
      url: prodUrl,
      createdAt: now,
    });

    // 2-3 Store offers for multi-store price comparison
    const numOffers = 2 + (idx % 2); // 2 or 3 offers
    const storeChoices = [primaryStore, stores[(idx + 1) % stores.length], stores[(idx + 2) % stores.length]].slice(0, numOffers);

    const priceMultipliers = [1.0, 1.05, 1.09];
    let lowestPrice = p.basePrice;

    for (let oIdx = 0; oIdx < storeChoices.length; oIdx++) {
      const sName = storeChoices[oIdx];
      const offerPrice = Math.round(p.basePrice * priceMultipliers[oIdx]);
      const origPrice = Math.round(offerPrice * 1.15);
      const isLowest = oIdx === 0;
      if (isLowest) lowestPrice = offerPrice;

      offers.push({
        id: offerIdCounter++,
        productId: prodId,
        store: sName,
        price: offerPrice,
        originalPrice: origPrice,
        discount: "13% off",
        url: ensureProductUrl(p.name, sName),
        availability: sName === "Uzum Market" ? "Toshkent omborida mavjud (1 kun)" : "Do'konda mavjud",
        rating: 4.7 + ((idx + oIdx) % 4) * 0.1,
        reviewCount: 45 + ((idx * 7 + oIdx) % 350),
        verified: true,
        isLowestPrice: isLowest,
        deliveryTime: sName === "Uzum Market" ? "1 ish kuni" : "1-2 kun ichida",
        installment: `${sName === "Uzum Market" ? "Uzum Nasiya" : "Muddatli to'lov"}: 12 x ${Math.round(offerPrice / 12).toLocaleString()} UZS/oy`,
        currency: "UZS",
        lastChecked: now,
        createdAt: now,
      });
    }

    // Historical price points
    priceHistory.push({
      id: historyIdCounter++,
      productId: prodId,
      store: primaryStore,
      price: Math.round(lowestPrice * 1.08),
      currency: "UZS",
      recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    });
    priceHistory.push({
      id: historyIdCounter++,
      productId: prodId,
      store: primaryStore,
      price: lowestPrice,
      currency: "UZS",
      recordedAt: now,
    });
  }

  const finalDatabase = {
    users: existingDb.users || [],
    products,
    offers,
    priceHistory,
    priceTrackers: existingDb.priceTrackers || [],
    registries: existingDb.registries || [],
    registryItems: existingDb.registryItems || [],
    reservations: existingDb.reservations || [],
    wishlists: existingDb.wishlists || [],
    wishlistItems: existingDb.wishlistItems || [],
    reminders: existingDb.reminders || [],
    searches: existingDb.searches || [],
    saved: existingDb.saved || [],
    orders: existingDb.orders || [],
    nextId: {
      users: (existingDb.users || []).length + 10,
      products: products.length + 1,
      offers: offers.length + 1,
      priceHistory: priceHistory.length + 1,
    },
    lastSaved: new Date().toISOString(),
  };

  console.log(`Writing ${products.length} products and ${offers.length} offers to ${DB_FILE}...`);
  fs.writeFileSync(DB_FILE, JSON.stringify(finalDatabase, null, 2), "utf-8");
  console.log("Successfully generated and saved 10,000 products to database.json!");
}

main().catch((err) => {
  console.error("Generator failed:", err);
});
