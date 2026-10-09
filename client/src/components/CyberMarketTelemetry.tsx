import { ArrowUpRight, TrendingDown, ShieldCheck, Zap } from "lucide-react";

interface TickerItem {
  store: string;
  item: string;
  price: string;
  change: string;
  trend: "down" | "up" | "stable";
  url: string;
  badge: string;
}

const liveTickerData: TickerItem[] = [
  { store: "UZUM", item: "De'Longhi Mini Me", price: "650,000 UZS", change: "-18%", trend: "down", url: "https://uzum.uz/uz/product/qahva-mashinasi-delonghi-dedica-ec685-1284910", badge: "TOP DEAL" },
  { store: "TEXNOMART", item: "Sony WH-1000XM5", price: "3,200,000 UZS", change: "-16%", trend: "down", url: "https://texnomart.uz/katalog/sony-wh-1000xm5/", badge: "RASMIY" },
  { store: "MEDIAPARK", item: "Tefal OptiGrill+", price: "1,890,000 UZS", change: "-14%", trend: "down", url: "https://mediapark.uz/products/view/tefal-optigrill", badge: "24H EXP" },
  { store: "TEXNOMART", item: "AirPods Pro 2 USB-C", price: "2,750,000 UZS", change: "-11%", trend: "down", url: "https://texnomart.uz/katalog/airpods-pro-2/", badge: "0% NASIYA" },
  { store: "ASAXIY", item: "Kindle Paperwhite 16GB", price: "1,650,000 UZS", change: "STABLE", trend: "stable", url: "https://asaxiy.uz/product/kindle-paperwhite-16gb", badge: "KITOB" },
  { store: "UZUM", item: "Luminarc Essence 46pc", price: "480,000 UZS", change: "-19%", trend: "down", url: "https://uzum.uz/uz/product/idishlar-toplami-luminarc-essence-46-839210", badge: "FRANSUZ" },
  { store: "TEXNOMART", item: "Apple Watch SE 40mm", price: "2,850,000 UZS", change: "-12%", trend: "down", url: "https://texnomart.uz/katalog/apple-watch-se/", badge: "APPLE CARE" },
  { store: "UZUM", item: "Buxoro Zardo'zi Ipak", price: "450,000 UZS", change: "EXCLUSIVE", trend: "stable", url: "https://uzum.uz/uz/product/buxoro-zardozi-ipak-panosi-1284910", badge: "HANDMADE" },
  { store: "MEDIAPARK", item: "Xiaomi Air Fryer 3.5L", price: "420,000 UZS", change: "-18%", trend: "down", url: "https://mediapark.uz/products/view/xiaomi-air-fryer-35l", badge: "XIT" },
  { store: "UZUM", item: "Dior Sauvage EDP 100ml", price: "1,850,000 UZS", change: "ORIGINAL", trend: "stable", url: "https://uzum.uz/uz/product/atir-dior-sauvage-edp-100ml-1284910", badge: "PARFUM" },
];

export default function CyberMarketTelemetry() {
  return (
    <div className="w-full bg-[#030712] border-y border-slate-800/80 py-2.5 overflow-hidden select-none relative shadow-inner">
      {/* Ambient background lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Terminal Title Pill (Left pinned on desktop) */}
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-shrink-0 z-10 bg-[#030712]/90 pr-3 border-r border-slate-800">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-cyan-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>LIVE TELEMETRY</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            [TASHKENT 1ms]
          </span>
        </div>

        {/* Infinite Running Marquee */}
        <div className="overflow-hidden flex-1 relative">
          <div className="animate-ticker flex items-center gap-6">
            {[...liveTickerData, ...liveTickerData].map((t, idx) => (
              <a
                key={idx}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-xs font-mono py-1 px-3 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/70 hover:border-cyan-500/40 transition-all flex-shrink-0 group"
              >
                <span className="text-[10px] font-black text-slate-400 group-hover:text-cyan-400 transition-colors">
                  {t.store}:
                </span>
                <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {t.item}
                </span>
                <span className="font-bold text-amber-300">
                  {t.price}
                </span>
                {t.change.startsWith("-") ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.2 rounded">
                    <TrendingDown className="w-2.5 h-2.5" />
                    {t.change}
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-800/60 px-1 rounded">
                    {t.change}
                  </span>
                )}
                <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
