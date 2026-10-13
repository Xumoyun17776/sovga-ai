import { useState, useRef, useEffect, Suspense } from "react";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useTranslation, tr } from "../lib/i18n";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PresentationControls, Float, RoundedBox, ContactShadows, Sparkles as DreiSparkles } from "@react-three/drei";
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
} from "../lib/icons";
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

const get_TIER_CONFIG = (): Record<
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
> => ({
  bronze: {
    name: tr("Bronza Quti", "Бронзовая коробка", "Bronze box"),
    range: "150,000 — 350,000 UZS",
    boxColor: "#5a3320",
    lidColor: "#6d3f27",
    ribbonColor: "#e0b77a",
    sparkleColor: "#e8b984",
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
        description: tr("50+ sport rejimi, 14 kunlik batareya va suvga chidamli aqlli bilaguzuk.", "50+ спортивных режимов, 14 дней работы, водозащита.", "50+ sport modes, 14-day battery, water resistant."),
      },
      {
        name: "Baseus Bowie E16 Simsiz Quloqchin",
        category: "Hi-Fi Audio",
        originalPrice: 280000,
        discountedPrice: 185000,
        store: "Texnomart",
        storeUrl: "https://texnomart.uz/uz/katalog/?q=Baseus+Bowie",
        rarity: "Oddiy",
        description: tr("Chuqur bass, Bluetooth 5.3 va 30 soatlik umumiy avtonom quvvat.", "Глубокий бас, Bluetooth 5.3, до 30 часов работы.", "Deep bass, Bluetooth 5.3, up to 30 hours of playback."),
      },
      {
        name: "Xiaomi Mijia Elektr Choynak 1.5L",
        category: "Oshxona",
        originalPrice: 340000,
        discountedPrice: 249000,
        store: "MediaPark",
        storeUrl: "https://mediapark.uz/search?q=Xiaomi+Mijia+Choynak",
        rarity: "Oddiy",
        description: tr("Zanglamaydigan po'lat, tez qaynatish va ikki qavatli xavfsiz korpus.", "Нержавеющая сталь, быстрый нагрев, двойной корпус.", "Stainless steel, fast boil, double-wall body."),
      },
    ],
  },
  silver: {
    name: tr("Kumush Quti", "Серебряная коробка", "Silver box"),
    range: "400,000 — 1,200,000 UZS",
    boxColor: "#8e9bb0",
    lidColor: "#a9b4c6",
    ribbonColor: "#2350d6",
    sparkleColor: "#cfd8e6",
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
        description: tr("Zigbee qo'llab-quvvatlash, 24W kuchli ovoz va aqlli xonadon boshqaruvi.", "Zigbee, мощный звук 24 Вт и управление умным домом.", "Zigbee, 24W sound and smart-home control."),
      },
      {
        name: "DeLonghi Dolce Gusto Mini Me Kofemashina",
        category: "Premium Oshxona",
        originalPrice: 790000,
        discountedPrice: 650000,
        store: "Texnomart",
        storeUrl: "https://texnomart.uz/uz/katalog/?q=DeLonghi+Mini+Me",
        rarity: "Noyob",
        description: tr("15 bar bosim, qalin krem-penka va ixcham Yevropa dizayni.", "15 бар, плотная пенка, компактный дизайн.", "15 bar pressure, rich crema, compact design."),
      },
      {
        name: "Marshall Major IV Simsiz Naushnik",
        category: "Premium Audio",
        originalPrice: 1450000,
        discountedPrice: 1090000,
        store: "Asaxiy",
        storeUrl: "https://asaxiy.uz/product?search=Marshall+Major+IV",
        rarity: "Noyob",
        description: tr("80+ soat uzluksiz musiqa, simsiz zaryadlash va afsonaviy Marshall ovozi.", "80+ часов музыки, беспроводная зарядка, звук Marshall.", "80+ hours of music, wireless charging, classic Marshall sound."),
      },
    ],
  },
  gold: {
    name: tr("Oltin Qirollik Qutisi", "Золотая коробка", "Gold box"),
    range: "1,500,000 — 5,000,000+ UZS",
    boxColor: "#163aa8",
    lidColor: "#1d47c9",
    ribbonColor: "#e2b866",
    sparkleColor: "#f3dca3",
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
        description: tr("Faol shovqin so'ndirish (ANC), shaffoflik rejimi va fazoviy ovoz.", "Активное шумоподавление, режим прозрачности, пространственный звук.", "Active noise cancelling, transparency mode, spatial audio."),
      },
      {
        name: "Dyson Supersonic Soch Quritgich",
        category: tr("Premium Go'zallik", "Премиум-уход", "Premium beauty"),
        originalPrice: 5800000,
        discountedPrice: 4600000,
        store: "Texnomart",
        storeUrl: "https://texnomart.uz/uz/katalog/?q=Dyson+Supersonic",
        rarity: "Afsonaviy",
        description: tr("Aqlli issiqlik nazorati, kuchli V9 raqamli motor va 5 ta magnit nasadka.", "Умный контроль температуры, мотор V9, 5 насадок.", "Smart heat control, V9 motor, 5 magnetic attachments."),
      },
      {
        name: "Xiaomi Robot Vacuum X20+ Aqlli Changyutgich",
        category: tr("Flagman Tozalik", "Флагманская уборка", "Flagship cleaning"),
        originalPrice: 5100000,
        discountedPrice: 3990000,
        store: "MediaPark",
        storeUrl: "https://mediapark.uz/search?q=Xiaomi+Robot+X20",
        rarity: "Afsonaviy",
        description: tr("6000 Pa quvvat, avtomatik tozalash va quritish stansiyasi bilan.", "6000 Па, станция самоочистки и сушки.", "6000 Pa suction with a self-cleaning and drying dock."),
      },
    ],
  },
});

// Studio reflections without downloading an HDR file.
function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    return () => {
      scene.environment = null;
      tex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

// 3D gift box: lacquered body, satin ribbon, bow — the lid flies off when opened.
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
  const cfg = get_TIER_CONFIG()[tier];
  const metallicRibbon = tier !== "silver";

  useFrame((state, delta) => {
    if (groupRef.current && !isOpened) {
      groupRef.current.rotation.y += delta * 0.35;
    }
    if (isOpened && lidRef.current && lidRef.current.position.y < 6) {
      lidRef.current.position.y += delta * 3.2;
      lidRef.current.position.x += delta * 1.2;
      lidRef.current.rotation.z += delta * 1.1;
      lidRef.current.rotation.x += delta * 0.6;
    }
  });

  const lacquer = (color: string) => (
    <meshPhysicalMaterial color={color} roughness={0.26} metalness={0.2} clearcoat={1} clearcoatRoughness={0.06} envMapIntensity={0.9} />
  );
  const ribbon = (
    <meshPhysicalMaterial color={cfg.ribbonColor} roughness={0.3} metalness={metallicRibbon ? 0.8 : 0.1} clearcoat={0.6} envMapIntensity={1.2} />
  );

  return (
    <group ref={groupRef} onClick={onClick}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.7}>
        {/* body */}
        <RoundedBox args={[2, 1.7, 2]} radius={0.1} smoothness={5} position={[0, -0.55, 0]} castShadow receiveShadow>
          {lacquer(cfg.boxColor)}
        </RoundedBox>
        {/* body ribbons */}
        <RoundedBox args={[0.34, 1.71, 2.06]} radius={0.015} smoothness={2} position={[0, -0.55, 0]}>{ribbon}</RoundedBox>
        <RoundedBox args={[2.06, 1.71, 0.34]} radius={0.015} smoothness={2} position={[0, -0.55, 0]}>{ribbon}</RoundedBox>

        {/* lid + bow */}
        <group ref={lidRef} position={[0, 0.5, 0]}>
          <RoundedBox args={[2.16, 0.42, 2.16]} radius={0.09} smoothness={5} castShadow>
            {lacquer(cfg.lidColor)}
          </RoundedBox>
          <RoundedBox args={[0.34, 0.44, 2.2]} radius={0.015} smoothness={2}>{ribbon}</RoundedBox>
          <RoundedBox args={[2.2, 0.44, 0.34]} radius={0.015} smoothness={2}>{ribbon}</RoundedBox>
          <mesh position={[-0.42, 0.5, 0]} rotation={[0.1, 0.25, 0.42]} scale={[1, 0.7, 0.5]}>
            <torusGeometry args={[0.46, 0.12, 24, 64]} />
            {ribbon}
          </mesh>
          <mesh position={[0.42, 0.5, 0]} rotation={[0.1, -0.25, -0.42]} scale={[1, 0.7, 0.5]}>
            <torusGeometry args={[0.46, 0.12, 24, 64]} />
            {ribbon}
          </mesh>
          <mesh position={[0, 0.32, 0]} scale={[1.1, 0.85, 0.95]}>
            <sphereGeometry args={[0.2, 32, 24]} />
            {ribbon}
          </mesh>
        </group>
      </Float>
      {!isOpened && (
        <DreiSparkles count={40} scale={4.2} size={3} speed={0.35} color={cfg.sparkleColor} />
      )}
    </group>
  );
}

export default function MysteryBoxPage() {
  const { language } = useTranslation();
  const toast = useToast();
  const [, navigate] = useLocation();

  const [tier, setTier] = useState<TierType>("gold");
  const [isOpened, setIsOpened] = useState(false);
  const [wonPrize, setWonPrize] = useState<MysteryPrize | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const currentCfg = get_TIER_CONFIG()[tier];

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
        colors: ["#818cf8", "#d9431f", "#ffffff", "#ef4444"],
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ["#818cf8", "#d9431f", "#ffffff", "#ef4444"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    setTimeout(() => {
      setWonPrize(randomPrize);
      cyberSound.play("success");
      toast.success(tr("Syurpriz quti ochildi!", "Коробка открыта!", "Box opened!"), randomPrize.name);
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
        toast.info(tr("Wishlistdan olib tashlandi", "Удалено из избранного", "Removed from your wishlist"));
      }
    } catch {}
  };

  return (
    <div className="bg-white dark:bg-[#0b1224] min-h-[calc(100vh-80px)] flex flex-col items-center justify-between relative overflow-hidden text-slate-900 dark:text-white py-8 px-4 transition-colors">
      {/* Background radial glow */}
      

      {/* Top Header & Tier Selection */}
      <div className="z-10 text-center max-w-xl mx-auto space-y-3.5">
        <h1 className="lux-title text-[2.4rem] sm:text-[3.2rem] text-slate-900 dark:text-white leading-[1.05]">
            {language === "uz" ? "Syurpriz quti" : language === "ru" ? "Сюрприз-бокс" : "Mystery box"}
          </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            {language === "uz" ? "Qutini bosing — do'konlardagi chegirmali mahsulotlardan sovg'a chiqadi." : language === "ru" ? "Нажмите на коробку — внутри подарок из товаров со скидкой." : "Tap the box to reveal a gift picked from discounted products."}
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
                    ? `${get_TIER_CONFIG()[t].badgeBg} ring-2 ring-amber-400/80 shadow-md`
                    : "bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 border-[var(--line)] dark:border-slate-800 hover:border-[var(--line-strong)]"
                }`}
              >
                {get_TIER_CONFIG()[t].name}
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
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.6, 6.4], fov: 42 }} gl={{ antialias: true, toneMappingExposure: 0.95 }}>
          <StudioEnvironment />
          <ambientLight intensity={0.15} />
          <directionalLight position={[4, 6, 5]} intensity={1.4} castShadow />
          <directionalLight position={[-5, 2, -3]} intensity={1.8} color="#6f9bff" />
          <pointLight position={[2, -1, 3]} intensity={10} color="#ffd59a" />
          <ContactShadows position={[0, -1.75, 0]} opacity={0.45} scale={8} blur={2.6} far={3} />
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
            <span className="text-[11px] font-bold tracking-wide uppercase text-amber-900 dark:text-amber-300 bg-white/90 dark:bg-slate-900/90 px-4 py-1.5 rounded-full border border-[var(--line)] dark:border-amber-400/30 shadow-md backdrop-blur-sm animate-pulse">
 {tr("Ochish uchun bosing", "Нажмите, чтобы открыть", "Click to open")}
 </span>
          </div>
        )}
      </div>

      {/* Won Prize Revelation Card */}
      {wonPrize && (
        <div className="z-20 w-full max-w-md px-4 animate-scale-in">
          <div className="bg-white dark:bg-[#0b1224] backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-[var(--line)] dark:border-amber-500/40 text-center relative overflow-hidden shadow-sm space-y-4 text-slate-900 dark:text-white">
            

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30">
                ✦ {wonPrize.rarity} Sovg'a
              </span>
              <span className="text-slate-500 dark:text-slate-400">{wonPrize.category}</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {wonPrize.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{wonPrize.description}</p>
            </div>

            {/* Price Box */}
            <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-2xl border border-[var(--line)] dark:border-slate-800 flex items-center justify-around shadow-xs">
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
                <span className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-300">
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
                className="py-3 btn-luxury-gold text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
              >
                <span>{wonPrize.store}da Ko'rish</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
              </a>

              <button
                onClick={handleToggleWishlist}
                className={`py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                  isWishlisted
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-300 dark:border-rose-500/40 shadow-xs"
                    : "bg-white/90 dark:bg-slate-800 hover:bg-amber-50 text-slate-700 dark:text-white border-[var(--line)] dark:border-slate-700"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 stroke-[2.2] ${isWishlisted ? "fill-current text-rose-500" : ""}`} />
                <span>{isWishlisted ? "Wishlistda" : "Saqlash"}</span>
              </button>
            </div>

            {/* Reset Re-roll button */}
            <button
              onClick={handleReset}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition flex items-center justify-center gap-1.5 mx-auto pt-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{tr("Boshqa Qutini Ochib Ko'rish", "Открыть другую коробку", "Open another box")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer hint */}
      {!wonPrize && (
        <div className="z-10 text-center text-xs text-slate-500 dark:text-slate-400 pb-2">
          <span>{tr("Narxlar taxminiy — xariddan oldin do'kon sahifasida tekshiring.", "Цены ориентировочные — проверьте их на сайте магазина перед покупкой.", "Prices are estimates — check them on the store page before buying.")}</span>
        </div>
      )}
    </div>
  );
}
