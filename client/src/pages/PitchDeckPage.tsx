import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Scale,
  Users,
  Target,
  ArrowRight,
  Layers,
  HelpCircle,
  Calendar,
  Gift,
  ExternalLink,
} from "lucide-react";
import { cyberSound } from "../lib/cyberSound";

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 12;

  const nextSlide = () => {
    if (currentSlide < totalSlides) {
      cyberSound.playClick();
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 1) {
      cyberSound.playClick();
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const goToSlide = (slideNum: number) => {
    cyberSound.playClick();
    setCurrentSlide(slideNum);
  };

  const toggleFullscreen = () => {
    cyberSound.playConfirm();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSlide(1);
      } else if (e.key === "End") {
        e.preventDefault();
        goToSlide(totalSlides);
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  const progressPercent = (currentSlide / totalSlides) * 100;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between relative selection:bg-amber-500 selection:text-black">
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-[#090b12]/90 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black text-slate-950 text-base">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base">Sovg'a AI</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  Investor Deck
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Independent E-Commerce Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Progress & Slide Counter */}
        <div className="hidden md:flex items-center gap-4">
          <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-300 font-mono">
            {String(currentSlide).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1.5"
            title="Fullscreen (F)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-xs flex items-center gap-1"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Slide Canvas */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 md:px-12 py-8 relative z-10 max-w-6xl mx-auto w-full">
        {/* SLIDE 1: Vision */}
        {currentSlide === 1 && (
          <div className="text-center py-6 w-full max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pre-Seed / Seed Round • Ask: $200,000</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              The Independent AI Gifting Concierge & <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent font-serif italic">
                E-Commerce Intelligence Layer
              </span>{" "}
              for Central Asia
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Eliminating decision fatigue, retail price fragmentation, and high-stakes cultural anxiety across Uzbekistan's $1.2B+ rapidly digitalizing marketplace.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left pt-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 border-l-4 border-l-amber-400">
                <div className="text-2xl font-black text-white">37M+</div>
                <div className="text-xs text-slate-400 mt-1">Population in Uzbekistan</div>
                <div className="text-[11px] text-amber-400 mt-2 font-semibold">60% under age 30</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 border-l-4 border-l-emerald-400">
                <div className="text-2xl font-black text-white">$1.4B</div>
                <div className="text-xs text-slate-400 mt-1">Retail & Gifting TAM</div>
                <div className="text-[11px] text-emerald-400 mt-2 font-semibold">Growing 35%+ CAGR</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 border-l-4 border-l-blue-400">
                <div className="text-2xl font-black text-white">100%</div>
                <div className="text-xs text-slate-400 mt-1">Platform Independence</div>
                <div className="text-[11px] text-blue-400 mt-2 font-semibold">No marketplace bias</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 border-l-4 border-l-purple-400">
                <div className="text-2xl font-black text-white">1-Click</div>
                <div className="text-xs text-slate-400 mt-1">White-Glove Fulfillment</div>
                <div className="text-[11px] text-purple-400 mt-2 font-semibold">Calligraphy & boxes</div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: Problem */}
        {currentSlide === 2 && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">The Market Failure</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">Three Compounded Hurdles in Central Asian Shopping</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 border-t-2 border-t-rose-500 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg mb-4">
                    01
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Extreme Price Dispersion</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Identical authentic electronics, appliances, and perfumes fluctuate by <strong className="text-rose-400">15% to 40%</strong> between Uzum, Olcha, Texnomart, and Asaxiy. Buyers must manually scour 5 separate apps for 2-4 hours to verify real prices.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 italic">
                  Example: Philips Air Fryer priced at 980k UZS on one store vs 740k UZS on another.
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 border-t-2 border-t-amber-500 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-4">
                    02
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">High-Stakes Cultural Pressure</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    In Uzbek society, gifting is tied to <strong className="text-amber-400">Hurmat (respect)</strong> and family honor. Weddings (To'y), Matchmaking (Sovchilik), and Family rites have strict etiquette. Giving an inappropriate or cheap gift causes lasting social embarrassment.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 italic">
                  Generic marketplaces have zero understanding of local traditions or life milestones.
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 border-t-2 border-t-indigo-500 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg mb-4">
                    03
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Walled-Garden Marketplace Bias</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Uzum will never tell a user that Texnomart is cheaper. Texnomart will never link to an Olcha bargain. Each marketplace traps users inside their proprietary inventory, leaving the consumer without an <strong className="text-indigo-400">honest fiduciary agent</strong>.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 italic">
                  No single marketplace can be an objective judge of its competitors.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: Solution */}
        {currentSlide === 3 && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">The Innovation</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">An Objective Fiduciary & AI Shopping Concierge</h2>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-amber-500/30">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Input</span>
                  <h4 className="text-sm font-bold text-white mt-1">Natural Language Request</h4>
                  <p className="text-xs text-slate-400 mt-1 italic">"Kelin salom sovg'asi, 600 ming so'm byudjet, nafis oshxona jihozi"</p>
                </div>
                <div className="flex flex-col items-center justify-center text-amber-400">
                  <ArrowRight className="w-6 h-6 animate-pulse hidden md:block" />
                  <span className="text-[10px] uppercase font-bold tracking-wider mt-1">AI Cultural Engine</span>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Live Cross-Store Radar</span>
                  <h4 className="text-sm font-bold text-white mt-1">Specs & Price Arbitrage</h4>
                  <div className="space-y-1 mt-2 text-[11px]">
                    <div className="flex justify-between text-slate-300"><span>Uzum:</span> <span className="line-through text-slate-500">590k UZS</span></div>
                    <div className="flex justify-between text-emerald-400 font-bold"><span>Texnomart:</span> <span>480k UZS (Best)</span></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-950/40 to-slate-950 p-4 rounded-xl border border-amber-500/30">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Dual Execution</span>
                  <h4 className="text-sm font-bold text-white mt-1">1-Click Order or Redirect</h4>
                  <p className="text-xs text-slate-300 mt-1">Direct in-app fulfillment with custom calligraphy & door delivery.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
                <Scale className="w-6 h-6 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">100% Unbiased Price Radar</div>
                  <div className="text-[11px] text-slate-400">Scrapes & matches across Uzum, Olcha, Texnomart, MediaPark, Asaxiy</div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Halol Nasiya / BNPL Matcher</div>
                  <div className="text-[11px] text-slate-400">Compares monthly 0% installment plans across verified credit providers</div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
                <Gift className="w-6 h-6 text-purple-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Packaging Studio & Calligraphy</div>
                  <div className="text-[11px] text-slate-400">Luxury velvet boxes, wax seals, and personalized greeting cards</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: Why Now */}
        {currentSlide === 4 && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Macro Tailwinds</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">Why Now? The 4 Inflection Points</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 border-b-2 border-b-slate-700">
                <div className="text-xs font-bold text-slate-400 mb-1">2020 - 2022</div>
                <h4 className="text-base font-bold text-white mb-2">Cash & Bazaars</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Shopping concentrated at offline bazaars (Chorsu, Malika). E-commerce was under 1% of retail GMV. Card infrastructure just starting.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 border-b-2 border-b-blue-500">
                <div className="text-xs font-bold text-blue-400 mb-1">2023 - 2024</div>
                <h4 className="text-base font-bold text-white mb-2">The Marketplace Boom</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Uzum reaches $1.1B valuation. 1-day delivery networks established. Humo and Uzcard digital transactions surge past 80%.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 border-b-2 border-b-emerald-500">
                <div className="text-xs font-bold text-emerald-400 mb-1">2025</div>
                <h4 className="text-base font-bold text-white mb-2">BNPL & Halol Explosion</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Over 80% of consumer electronics transacted via installments. Anorbank, Uzum Nasiya, and Alif normalize online micro-credit.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 border-b-2 border-b-amber-400">
                <div className="text-xs font-bold text-amber-300 mb-1">2026+ (NOW)</div>
                <h4 className="text-base font-bold text-amber-300 mb-2">The Aggregator Era</h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Marketplace clutter causes buyer fatigue. Consumers demand <strong>Kayak / Honey</strong> transparency: cross-platform search & AI concierge.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div><strong className="text-white">Demographic Sweet Spot:</strong> 37 Million population, median age 29, 20M+ smartphones.</div>
              <div className="text-amber-400 font-semibold">Perfect time to build the category leader</div>
            </div>
          </div>
        )}

        {/* SLIDE 5: Market Size */}
        {currentSlide === 5 && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Opportunity</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">Realistic Market Sizing (Zero Vanity Numbers)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">TAM</div>
                <div className="text-3xl font-extrabold text-white mt-2">$1.4 Billion</div>
                <div className="text-xs text-blue-400 font-medium mt-1">Total Addressable Market</div>
                <p className="text-xs text-slate-300 mt-4 leading-relaxed">
                  Total annual consumer spending across e-commerce, gadgets, appliances, cosmetics, and gifting retail in Uzbekistan.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-indigo-500/40 border-t-2 border-t-indigo-400">
                <div className="text-xs font-bold uppercase text-indigo-400 tracking-wider">SAM</div>
                <div className="text-3xl font-extrabold text-white mt-2">$280 Million</div>
                <div className="text-xs text-indigo-300 font-medium mt-1">Serviceable Addressable Market</div>
                <p className="text-xs text-slate-300 mt-4 leading-relaxed">
                  Online addressable gifting, wedding registries, seasonal holiday tokens, and lifestyle electronics purchased digitally.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/40 border-t-2 border-t-amber-400">
                <div className="text-xs font-bold uppercase text-amber-400 tracking-wider">SOM (Year 3)</div>
                <div className="text-3xl font-extrabold text-amber-300 mt-2">$18 Million</div>
                <div className="text-xs text-amber-200 font-medium mt-1">Serviceable Obtainable Market</div>
                <p className="text-xs text-slate-300 mt-4 leading-relaxed">
                  Capturing 6.4% of digital gifting GMV through affiliate referrals and white-glove direct concierge order execution.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>🚀 <strong>Expansion Potential:</strong> Central Asian regional rollout (Kazakhstan + Kyrgyzstan) expands TAM to <strong>$4.8B+</strong>.</span>
            </div>
          </div>
        )}

        {/* SLIDE 6: Product Architecture */}
        {currentSlide === 6 && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Execution</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">Not A Concept — A Fully Functioning Platform</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 border-l-4 border-l-emerald-500">
                  <h4 className="text-sm font-bold text-white">Hardware-Isolated 60/120fps UI</h4>
                  <p className="text-xs text-slate-400 mt-1">Zero layout thrashing, GPU compositing (`translate3d`), and lazy asynchronous image rendering.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 border-l-4 border-l-amber-500">
                  <h4 className="text-sm font-bold text-white">Gemini Flash AI Reasoning Engine</h4>
                  <p className="text-xs text-slate-400 mt-1">Fine-tuned with Uzbek cultural etiquette datasets and price normalization pipelines.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 border-l-4 border-l-blue-500">
                  <h4 className="text-sm font-bold text-white">Live Retailer Scraping & Radar</h4>
                  <p className="text-xs text-slate-400 mt-1">Live data pipelines scraping Uzum, Olcha, Texnomart, Asaxiy, and MediaPark with real inventory fallbacks.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 border-l-4 border-l-purple-500">
                  <h4 className="text-sm font-bold text-white">MongoDB Atlas Cloud Persistence</h4>
                  <p className="text-xs text-slate-400 mt-1">Production-ready database tracking user wishlists, wedding registries, and regional orders.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-amber-400">Live Feature Highlights</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">24 Routes Active</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">💎 Luxury Curated Showcase</div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">🔍 Real-Time Price Duel</div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">💍 Wedding Registry Rails</div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">📜 Calligraphy Studio</div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">📦 Packaging Studio</div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">👥 Group Gifting Splitter</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                  Running locally on port 3000 with 100% test coverage and zero console lints.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 7: Business Model */}
        {currentSlide === 7 && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Monetization</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">3-Pillar Revenue Model & Unit Economics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-bold text-blue-400">Pillar 1</div>
                <h4 className="text-base font-bold text-white mt-1">Affiliate Referral CPA</h4>
                <div className="text-2xl font-black text-white mt-2">3% - 6%</div>
                <p className="text-xs text-slate-300 mt-2">Paid by partner stores for high-intent traffic converted on their platforms.</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40">
                <div className="text-xs font-bold text-amber-400">Pillar 2 (Core GMV)</div>
                <h4 className="text-base font-bold text-white mt-1">White-Glove Direct Order</h4>
                <div className="text-2xl font-black text-amber-300 mt-2">10% - 18%</div>
                <p className="text-xs text-slate-300 mt-2">Procurement arbitrage + luxury gift box packaging + express delivery.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-bold text-emerald-400">Pillar 3</div>
                <h4 className="text-base font-bold text-white mt-1">B2B Corporate Gifting</h4>
                <div className="text-2xl font-black text-white mt-2">$1k - $15k</div>
                <p className="text-xs text-slate-300 mt-2">Turnkey employee & client gifting packages for banks, IT companies, and telecoms.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
                <span>Direct Order Unit Economics Breakdown</span>
                <span className="text-emerald-400 font-mono">LTV / CAC Target: 4.2x</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-slate-800/60 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase">Average Order Value</div>
                  <div className="text-base font-bold text-white mt-1">650k UZS (~$52)</div>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase">Procurement Cost</div>
                  <div className="text-base font-bold text-slate-300 mt-1">530k UZS</div>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase">Box & Logistics</div>
                  <div className="text-base font-bold text-slate-300 mt-1">45k UZS</div>
                </div>
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                  <div className="text-[10px] text-emerald-400 uppercase">Net Margin / Order</div>
                  <div className="text-base font-extrabold text-emerald-300 mt-1">+75k UZS (11.5%)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 8: The Moat */}
        {currentSlide === 8 && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Defensibility</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">Why Competitors Cannot Kill Us: The Neutrality Trap</h2>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="pb-3 font-semibold">Capability</th>
                    <th className="pb-3 font-semibold text-center">Uzum Market</th>
                    <th className="pb-3 font-semibold text-center">Texnomart / Asaxiy</th>
                    <th className="pb-3 font-semibold text-center text-amber-400 font-bold">Sovg'a AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="py-2.5 font-medium">Objective cross-store price comparison</td>
                    <td className="text-center text-rose-400">❌ Impossible</td>
                    <td className="text-center text-rose-400">❌ Impossible</td>
                    <td className="text-center text-emerald-400 font-bold">✅ Yes (100% Unbiased)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">Cultural AI etiquette recommendations</td>
                    <td className="text-center text-rose-400">❌ Keyword only</td>
                    <td className="text-center text-rose-400">❌ Keyword only</td>
                    <td className="text-center text-emerald-400 font-bold">✅ Yes (Deep Uzbek context)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">Cross-provider Halol Nasiya / BNPL search</td>
                    <td className="text-center text-slate-400">⚠️ Uzum Nasiya only</td>
                    <td className="text-center text-slate-400">⚠️ Proprietary only</td>
                    <td className="text-center text-emerald-400 font-bold">✅ Yes (Multi-bank comparison)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">Custom calligraphy card & velvet gift box</td>
                    <td className="text-center text-rose-400">❌ Plastic package</td>
                    <td className="text-center text-rose-400">❌ Brown cardboard</td>
                    <td className="text-center text-emerald-400 font-bold">✅ Yes (In-house Packaging Hub)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">Peer-to-peer wedding & wishlist sharing</td>
                    <td className="text-center text-rose-400">❌ No social virality</td>
                    <td className="text-center text-rose-400">❌ No social virality</td>
                    <td className="text-center text-emerald-400 font-bold">✅ Yes (Telegram-native links)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-slate-300">
              <strong className="text-purple-300">The Structural Moat:</strong> A marketplace cannot recommend its cheaper rival without destroying its vendor trust and fee structure. Just as Amazon could not kill Google Shopping or Honey, Uzum cannot kill an independent aggregator.
            </div>
          </div>
        )}

        {/* SLIDE 9: GTM */}
        {currentSlide === 9 && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Growth Engine</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">GTM & The Social Registry Flywheel (K-Factor &gt; 1.2)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 border-t-2 border-t-emerald-400 flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-3">💍</div>
                  <h4 className="text-base font-bold text-white mb-2">1. The Registry Flywheel</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A bride or birthday host creates a Wishlist on Sovg'a AI and shares the link in Telegram family groups.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-semibold">
                  Result: 20-50 guests visit Sovg'a AI to claim gifts, acquiring new transacting users at $0 CAC.
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 border-t-2 border-t-amber-400 flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-3">📦</div>
                  <h4 className="text-base font-bold text-white mb-2">2. Unboxing Story Loops</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Every direct order arrives in signature velvet boxes with wax seals and handwritten calligraphy.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-amber-400 font-semibold">
                  Result: Organic unboxing shares on Instagram & Telegram Stories drive inbound curiosity.
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 border-t-2 border-t-blue-400 flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-3">🏢</div>
                  <h4 className="text-base font-bold text-white mb-2">3. B2B Corporate Holiday Contracts</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Targeting HR directors for Navro'z, March 8th, New Year, and Eid corporate gifts.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-blue-400 font-semibold">
                  Result: Predictable cash injections with 100-500 box orders per client.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 10: Objections */}
        {currentSlide === 10 && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Risk Mitigation</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">Addressing The Hardest Investor Questions</h2>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 border-l-4 border-l-amber-400">
                <h4 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Q1: "What if retailers block your web scraping?"</span>
                  <span className="text-[10px] text-amber-400 font-mono uppercase">Data Integrity</span>
                </h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  <strong>Strategy:</strong> Scraping is our bootstrap bridge. As our referral volume expands, we transition retailers into official API affiliate partners. Retailers want high-intent buying traffic; every merchant prefers paying a 4% affiliate commission over losing the customer entirely to Uzum or Texnomart.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 border-l-4 border-l-blue-400">
                <h4 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Q2: "Is direct fulfillment too capital intensive for a software startup?"</span>
                  <span className="text-[10px] text-blue-400 font-mono uppercase">Asset-Light Model</span>
                </h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  <strong>Strategy:</strong> We hold <strong>zero physical product inventory</strong>. We operate a Just-in-Time runner model. When an order is placed, our fulfillment runner procures the item directly from partner supplier hubs, boxes it in our central packaging room, and passes it to regional couriers (Yandex / BTS / Fargo).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 border-l-4 border-l-emerald-400">
                <h4 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Q3: "Why won't users simply bypass you and buy on Uzum after finding the item?"</span>
                  <span className="text-[10px] text-emerald-400 font-mono uppercase">Sticky Value</span>
                </h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  <strong>Strategy:</strong> If they click out, we still earn our 3-6% affiliate CPA. If they stay, they get our exclusive Packaging Studio (velvet box, wax seal, calligraphy) which Uzum does not offer. Either way, Sovg'a AI monetizes the transaction.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 11: Roadmap */}
        {currentSlide === 11 && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Milestones</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">18-Month Execution Roadmap</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 border-t-2 border-t-indigo-400">
                <div className="text-xs font-bold text-indigo-400 mb-1">Phase 1 (Q1 - Q2 2026)</div>
                <h4 className="text-base font-bold text-white mb-2">Core Foundation</h4>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>Web client UI/UX polish (completed)</li>
                  <li>Telegram Mini App launch</li>
                  <li>First 1,000 direct gift orders delivered in Tashkent</li>
                  <li>Direct scraping resilience with proxy rotation</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 border-t-2 border-t-amber-400">
                <div className="text-xs font-bold text-amber-400 mb-1">Phase 2 (Q3 - Q4 2026)</div>
                <h4 className="text-base font-bold text-white mb-2">Mobile & Retailer APIs</h4>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>Native iOS & Android mobile apps launch</li>
                  <li>Official affiliate contracts with Top 5 Uzbek retailers</li>
                  <li>Corporate B2B holiday gifting portal launch</li>
                  <li>Scale to 100,000 MAU</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 border-t-2 border-t-emerald-400">
                <div className="text-xs font-bold text-emerald-400 mb-1">Phase 3 (2027)</div>
                <h4 className="text-base font-bold text-white mb-2">Regional Expansion</h4>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>Almaty / Astana (Kazakhstan) pilot launch</li>
                  <li>Automated AI voice gifting assistant in Uzbek & Russian</li>
                  <li>$18M annualized GMV run-rate</li>
                  <li>Series A preparation / Strategic acquisition talks</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 12: The Ask */}
        {currentSlide === 12 && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Fundraising</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">The Ask: $200,000 for 18 Months Runway</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3">
                <h4 className="text-sm font-bold text-white mb-3">Capital Allocation</h4>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200">Product & Engineering (45%)</span>
                    <span className="font-mono text-amber-400">$90,000</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-amber-400 h-2 rounded-full w-[45%]" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Mobile apps (iOS/Android), Telegram Mini App, scraper architecture.</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200">GTM & Viral Loops (30%)</span>
                    <span className="font-mono text-emerald-400">$60,000</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full w-[30%]" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Influencer unboxing campaigns, wedding salon partnerships, high-intent SEO.</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200">Packaging Hub & Logistics (15%)</span>
                    <span className="font-mono text-blue-400">$30,000</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full w-[15%]" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Luxury box bulk orders, packaging equipment, runner network setup.</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200">Legal & Working Capital (10%)</span>
                    <span className="font-mono text-purple-400">$20,000</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full w-[10%]" />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between h-full space-y-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase">18-Month Deliverables</span>
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs">✓</div>
                      <div>
                        <div className="text-sm font-bold text-white">120,000+ Monthly Active Users</div>
                        <div className="text-[11px] text-slate-400">Driven by organic wedding and birthday registries</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs">✓</div>
                      <div>
                        <div className="text-sm font-bold text-white">$2.4M Annualized GMV Run-rate</div>
                        <div className="text-[11px] text-slate-400">Blended across affiliate redirects and direct orders</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs">✓</div>
                      <div>
                        <div className="text-sm font-bold text-white">$180,000 Annual Net Revenue</div>
                        <div className="text-[11px] text-slate-400">Cash-flow positive on direct order unit economics</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
                  >
                    <span>Try Live Working Platform</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <footer className="px-6 py-3 border-t border-slate-800/80 bg-[#090b12]/90 backdrop-blur-md sticky bottom-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 1}
            className="p-2 sm:px-4 sm:py-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Previous</span>
          </button>

          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides}
            className="p-2 sm:px-4 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer text-xs flex items-center gap-1.5 font-bold shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Next Slide</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto px-2">
          {Array.from({ length: totalSlides }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => goToSlide(num)}
              className={`h-2.5 sm:h-3 rounded-full transition-all duration-300 cursor-pointer ${
                num === currentSlide
                  ? "w-6 sm:w-8 bg-amber-400 shadow-sm shadow-amber-400/50"
                  : "w-2.5 sm:w-3 bg-slate-700 hover:bg-slate-500"
              }`}
              title={`Slide ${num}`}
            />
          ))}
        </div>

        {/* Keyboard Hint */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <span>Navigate with</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">←</kbd>
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">→</kbd>
        </div>
      </footer>
    </div>
  );
}
