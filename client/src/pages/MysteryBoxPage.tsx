import { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PresentationControls, Float, Sparkles as DreiSparkles } from "@react-three/drei";
import {
  Sparkles,
  Gift,
  ArrowRight,
  RotateCcw,
  Heart,
  ExternalLink,
  ShieldCheck,
  Check,
  Flame,
  Award,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";
import confetti from "canvas-confetti";
import { cyberSound } from "../lib/cyberSound";
import { formatPrice } from "../lib/api";
import { useToast } from "../components/Toast";

type TierType = "bronze" | "silver" | "gold";

interface MysteryPrize {
  name: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  store: string;
  storeUrl: string;
  rarity: "Oddiy" | "Noyob" | "Afsonaviy";
  description: string;
}

const TIER_CONFIG: Record<
  TierType,
  {
    name: string;
    range: string;
    boxColor: string;
    lidColor: string;
    ribbonColor: string;
    sparkleColor: string;
    badgeBg: string;
    prizes: MysteryPrize[];
  }
> = {
  bronze: {
    name: "Bronza Quti",
    range: "150,000 — 350,000 UZS",
    boxColor: "#b45309",
    lidColor: "#d97706",
    ribbonColor: "#78350f",
    sparkleColor: "#f59e0b",
    badgeBg: "bg-amber-900/40 text-amber-300 border-amber-700/50",
    prizes: [
      {
        name: "Xiaomi Smart Band 8 Active",
        category: "Aqlli Gadjet",
        originalPrice: 320000,
        discountedPrice: 229000,
        store: "Uzum Market",
        storeUrl: "https://uzum.uz/uz/search?q=Xiaomi+Smart+Band+8",
        rarity: "Oddiy",
        description: "50+ sport rejimi, 14 kunlik batareya va suvga chidamli aqlli bilaguzuk.",
      },
      {
        name: "Baseus Bowie E16 Simsiz Quloqchin",
        category: "Hi-Fi Audio",
        originalPrice: 280000,
        discountedPrice: 185000,
        store: "Texnomart",
        storeUrl: "https://texnomart.uz/uz/katalog/?q=Baseus+Bowie",
        rarity: "Oddiy",
        description: "Chuqur bass, Bluetooth 5.3 va 30 soatlik umumiy avtonom quvvat.",
      },
      {
        name: "Xiaomi Mijia Elektr Choynak 1.5L",
        category: "Oshxona",
        originalPrice: 340000,
        discountedPrice: 249000,
        store: "MediaPark",
        storeUrl: "https://mediapark.uz/search?q=Xiaomi+Mijia+Choynak",
        rarity: "Oddiy",
        description: "Zanglamaydigan po'lat, tez qaynatish va ikki qavatli xavfsiz korpus.",
      },
    ],
  },
  silver: {
    name: "Kumush Quti",
    range: "400,000 — 1,200,000 UZS",
    boxColor: "#94a3b8",
    lidColor: "#cbd5e1",
    ribbonColor: "#3b82f6",
    sparkleColor: "#60a5fa",
    badgeBg: "bg-blue-900/40 text-blue-300 border-blue-700/50",
    prizes: [
      {
        name: "Yandex Station Midi Aqlli Kolonka (Alisa)",
        category: "Aqlli Uy",
        originalPrice: 1250000,
        discountedPrice: 940000,
        store: "Uzum Market",
        storeUrl: "https://uzum.uz/uz/search?q=Yandex+Station+Midi",
        rarity: "Noyob",
        description: "Zigbee qo'llab-quvvatlash, 24W kuchli ovoz va aqlli xonadon boshqaruvi.",
      },
      {
        name: "DeLonghi Dolce Gusto Mini Me Kofemashina",
        category: "Premium Oshxona",
        originalPrice: 790000,
        discountedPrice: 650000,
        store: "Texnomart",
        storeUrl: "https://texnomart.uz/uz/katalog/?q=DeLonghi+Mini+Me",
        rarity: "Noyob",
        description: "15 bar bosim, qalin krem-penka va ixcham Yevropa dizayni.",
      },
      {
        name: "Marshall Major IV Simsiz Naushnik",
        category: "Premium Audio",
        originalPrice: 1450000,
        discountedPrice: 1090000,
        store: "Asaxiy",
        storeUrl: "https://asaxiy.uz/product?search=Marshall+Major+IV",
        rarity: "Noyob",
        description: "80+ soat uzluksiz musiqa, simsiz zaryadlash va afsonaviy Marshall ovozi.",
      },
    ],
  },
  gold: {
    name: "Oltin Qirollik Qutisi",
    range: "1,500,000 — 5,000,000+ UZS",
    boxColor: "#f59e0b",
    lidColor: "#fbbf24",
    ribbonColor: "#dc2626",
    sparkleColor: "#fde047",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    prizes: [
      {
        name: "Apple AirPods Pro 2 (USB-C)",
        category: "Flagman Audio",
        originalPrice: 3200000,
        discountedPrice: 2450000,
        store: "Uzum Market",
        storeUrl: "https://uzum.uz/uz/search?q=AirPods+Pro+2",
        rarity: "Afsonaviy",
        description: "Faol shovqin so'ndirish (ANC), shaffoflik rejimi va fazoviy ovoz.",
      },
      {
        name: "Dyson Supersonic Soch Quritgich",
        category: "Premium Go'zallik",
        originalPrice: 5800000,
        discountedPrice: 4600000,
        store: "Texnomart",
        storeUrl: "https://texnomart.uz/uz/katalog/?q=Dyson+Supersonic",
        rarity: "Afsonaviy",
        description: "Aqlli issiqlik nazorati, kuchli V9 raqamli motor va 5 ta magnit nasadka.",
      },
      {
        name: "Xiaomi Robot Vacuum X20+ Aqlli Changyutgich",
        category: "Flagman Tozalik",
        originalPrice: 5100000,
        discountedPrice: 3990000,
        store: "MediaPark",
        storeUrl: "https://mediapark.uz/search?q=Xiaomi+Robot+X20",
        rarity: "Afsonaviy",
        description: "6000 Pa quvvat, avtomatik tozalash va quritish stansiyasi bilan.",
      },
    ],
  },
};

// 3D Procedural Gift Box Component
function GiftBox3D({
  isOpened,
  tier,
  onClick,
}: {
  isOpened: boolean;
  tier: TierType;
  onClick: () => void;
}) {
  const groupRef = useRef<any>(null);
  const lidRef = useRef<any>(null);
  const cfg = TIER_CONFIG[tier];

  useFrame((state, delta) => {
    if (groupRef.current && !isOpened) {
      groupRef.current.rotation.y += delta * 0.45;
    }
    if (isOpened && lidRef.current) {
      lidRef.current.position.y += delta * 4;
      lidRef.current.position.x += delta * 1.5;
      lidRef.current.rotation.z += delta * 1.5;
    }
  });

  return (
    <group ref={groupRef} onClick={onClick}>
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.8}>
        {/* Box Base */}
        <mesh castShadow receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color={cfg.boxColor} roughness={0.15} metalness={0.7} />
        </mesh>

        {/* Ribbons */}
        <mesh position={[0, -0.5, 1.01]}>
          <boxGeometry args={[0.38, 2, 0.04]} />
          <meshStandardMaterial color={cfg.ribbonColor} roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, -0.5, -1.01]}>
          <boxGeometry args={[0.38, 2, 0.04]} />
          <meshStandardMaterial color={cfg.ribbonColor} roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[1.01, -0.5, 0]}>
          <boxGeometry args={[0.04, 2, 0.38]} />
          <meshStandardMaterial color={cfg.ribbonColor} roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[-1.01, -0.5, 0]}>
          <boxGeometry args={[0.04, 2, 0.38]} />
          <meshStandardMaterial color={cfg.ribbonColor} roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Box Lid */}
        <group ref={lidRef} position={[0, 0.6, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.1, 0.4, 2.1]} />
            <meshStandardMaterial color={cfg.lidColor} roughness={0.15} metalness={0.75} />
          </mesh>
          <mesh position={[0, 0.21, 0]}>
            <boxGeometry args={[0.38, 0.04, 2.1]} />
            <meshStandardMaterial color={cfg.ribbonColor} />
          </mesh>
          <mesh position={[0, 0.21, 0]}>
            <boxGeometry args={[2.1, 0.04, 0.38]} />
            <meshStandardMaterial color={cfg.ribbonColor} />
          </mesh>
          {/* Ribbon Bow */}
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color={cfg.ribbonColor} />
          </mesh>
        </group>
      </Float>
      {!isOpened && (
        <DreiSparkles count={45} scale={4} size={3.5} speed={0.4} color={cfg.sparkleColor} />
      )}
    </group>
  );
}

export default function MysteryBoxPage() {
  const toast = useToast();
  const [, navigate] = useLocation();

  const [tier, setTier] = useState<TierType>("gold");
  const [isOpened, setIsOpened] = useState(false);
  const [wonPrize, setWonPrize] = useState<MysteryPrize | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const currentCfg = TIER_CONFIG[tier];

  const handleOpenBox = () => {
    if (isOpened) return;
    cyberSound.playConfirm();
    setIsOpened(true);

    // Pick random prize from tier
    const pool = currentCfg.prizes;
    const randomPrize = pool[Math.floor(Math.random() * pool.length)];

    // Confetti explosion
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ["#fbbf24", "#f59e0b", "#ffffff", "#ef4444"],
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ["#fbbf24", "#f59e0b", "#ffffff", "#ef4444"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    setTimeout(() => {
      setWonPrize(randomPrize);
      cyberSound.play("success");
      toast.success("Syurpriz quti ochildi!", randomPrize.name);
    }, 1200);
  };

  const handleReset = () => {
    cyberSound.playClick();
    setIsOpened(false);
    setWonPrize(null);
    setIsWishlisted(false);
  };

  const handleToggleWishlist = () => {
    if (!wonPrize) return;
    cyberSound.playClick();
    setIsWishlisted(!isWishlisted);

    try {
      const saved = JSON.parse(localStorage.getItem("sovga_wishlist") || "[]");
      if (!isWishlisted) {
        saved.push({
          id: Date.now(),
          name: wonPrize.name,
          price: wonPrize.discountedPrice,
          store: wonPrize.store,
          url: wonPrize.storeUrl,
          date: new Date().toLocaleDateString("uz-UZ"),
        });
        localStorage.setItem("sovga_wishlist", JSON.stringify(saved));
        toast.success("Wishlistga saqlandi!");
      } else {
        const filtered = saved.filter((s: any) => s.name !== wonPrize.name);
        localStorage.setItem("sovga_wishlist", JSON.stringify(filtered));
        toast.info("Wishlistdan olib tashlandi");
      }
    } catch {}
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-between relative overflow-hidden bg-gradient-to-br from-[#faf6ec] via-[#f7f0df] to-[#f0e4c8] dark:from-[#0b0e18] dark:via-[#070912] dark:to-[#04050a] text-slate-900 dark:text-white py-8 px-4 transition-colors">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/15 via-transparent to-transparent pointer-events-none" />

      {/* Top Header & Tier Selection */}
      <div className="z-10 text-center max-w-xl mx-auto space-y-3.5">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-300/70 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Interaktiv 3D Syurpriz Qutisi</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 dark:from-amber-200 dark:via-yellow-300 dark:to-amber-500 tracking-tight">
          AI Mystery Box
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal">
          Qutini ochish uchun ustiga bosing va haqiqiy O'zbekiston do'konlaridagi eng katta chegirmali sovg'ani qo'lga kiriting!
        </p>

        {/* Tier Selector Chips */}
        {!isOpened && (
          <div className="flex items-center justify-center gap-2 pt-2">
            {(["bronze", "silver", "gold"] as TierType[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  cyberSound.playClick();
                  setTier(t);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition border cursor-pointer active:scale-95 ${
                  tier === t
                    ? `${TIER_CONFIG[t].badgeBg} ring-2 ring-amber-400/80 shadow-md`
                    : "bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 border-amber-200/60 dark:border-slate-800 hover:border-amber-400"
                }`}
              >
                {TIER_CONFIG[t].name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3D Canvas Box Area */}
      <div
        className="w-full max-w-2xl h-[min(340px,42vh)] sm:h-[420px] z-10 cursor-pointer relative"
        onClick={handleOpenBox}
      >
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 6], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.2} castShadow />
          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 0.3, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 2]}
          >
            <Suspense fallback={null}>
              <GiftBox3D isOpened={isOpened} tier={tier} onClick={handleOpenBox} />
            </Suspense>
          </PresentationControls>
        </Canvas>

        {!isOpened && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none text-center">
            <span className="text-[11px] font-bold tracking-widest uppercase text-amber-900 dark:text-amber-300 bg-white/90 dark:bg-slate-900/90 px-4 py-1.5 rounded-full border border-amber-300/80 dark:border-amber-400/30 shadow-md backdrop-blur-sm animate-pulse">
              👆 Ochish uchun bosing
            </span>
          </div>
        )}
      </div>

      {/* Won Prize Revelation Card */}
      {wonPrize && (
        <div className="z-20 w-full max-w-md px-4 animate-scale-in">
          <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:to-[#0a0c16] backdrop-blur-md p-6 sm:p-7 rounded-3xl border-2 border-amber-300/90 dark:border-amber-500/40 text-center relative overflow-hidden shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30">
                ✦ {wonPrize.rarity} Sovg'a
              </span>
              <span className="text-slate-500 dark:text-slate-400">{wonPrize.category}</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {wonPrize.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{wonPrize.description}</p>
            </div>

            {/* Price Box */}
            <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-2xl border border-amber-200/80 dark:border-slate-800 flex items-center justify-around shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Asl narxi</span>
                <span className="text-xs text-slate-400 dark:text-slate-400 line-through">
                  {formatPrice(wonPrize.originalPrice)}
                </span>
              </div>
              <div className="h-6 w-px bg-amber-200/80 dark:bg-slate-800" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                  Syurpriz Chegirmada
                </span>
                <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-300">
                  {formatPrice(wonPrize.discountedPrice)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={wonPrize.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 btn-luxury-gold text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg active:scale-95 cursor-pointer"
              >
                <span>{wonPrize.store}da Ko'rish</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
              </a>

              <button
                onClick={handleToggleWishlist}
                className={`py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer active:scale-95 ${
                  isWishlisted
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-300 dark:border-rose-500/40 shadow-xs"
                    : "bg-white/90 dark:bg-slate-800 hover:bg-amber-50 text-slate-700 dark:text-white border-amber-200/80 dark:border-slate-700"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 stroke-[2.2] ${isWishlisted ? "fill-current text-rose-500" : ""}`} />
                <span>{isWishlisted ? "Wishlistda" : "Saqlash"}</span>
              </button>
            </div>

            {/* Reset Re-roll button */}
            <button
              onClick={handleReset}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition flex items-center justify-center gap-1.5 mx-auto pt-1 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Boshqa Qutini Ochib Ko'rish</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer hint */}
      {!wonPrize && (
        <div className="z-10 text-center text-xs text-slate-500 dark:text-slate-400 pb-2">
          <span>Haqiqiy narxlar Uzum Market, Texnomart va MediaPark omborlari orqali sinxronlashtirilgan.</span>
        </div>
      )}
    </div>
  );
}
