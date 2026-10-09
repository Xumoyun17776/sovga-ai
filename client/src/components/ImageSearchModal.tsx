import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { research } from "../lib/api";
import { X, Camera, Upload, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import type { ImageSearchResult } from "@shared/types";

interface Props {
  onClose: () => void;
}

const sampleImages = [
  {
    title: "Wireless ANC Headphones",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop",
    hint: "Wireless headphones",
  },
  {
    title: "De'Longhi Espresso Maker",
    url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop",
    hint: "Coffee maker",
  },
  {
    title: "Artisanal Uzbek Tea Set",
    url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop",
    hint: "Uzbek ceramic tea set",
  },
];

export default function ImageSearchModal({ onClose }: Props) {
  const [, navigate] = useLocation();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [userHint, setUserHint] = useState<string>("");
  const [result, setResult] = useState<ImageSearchResult | null>(null);

  const mutation = useMutation({
    mutationFn: () => research.image({ image: selectedImage, hint: userHint }),
    onSuccess: (data: ImageSearchResult) => {
      setResult(data);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: typeof sampleImages[0]) => {
    setSelectedImage(sample.url);
    setUserHint(sample.hint);
  };

  const handleViewResearch = () => {
    if (result?.identifiedProduct) {
      onClose();
      navigate(`/search?q=${encodeURIComponent(result.identifiedProduct)}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f8f4ea] dark:from-[#111422] dark:via-[#0c0e18] dark:to-[#07090f] text-slate-900 dark:text-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-luxury relative border-2 border-amber-300/80 dark:border-amber-500/25 max-h-[92vh] max-h-[92dvh] overflow-y-auto my-auto animate-scale-in">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-amber-400/15 dark:bg-amber-400/10 blur-2xl pointer-events-none rounded-full" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-amber-200/60 dark:border-slate-700/80 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
          aria-label="Yopish"
        >
          <X className="w-4 h-4 stroke-[2.2]" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 icon-medallion icon-box-indigo shadow-md">
            <Camera className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">AI Visual Gift Search</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Upload a picture to identify & research the best deals</p>
          </div>
        </div>

        {!result ? (
          <div className="space-y-5 mt-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-amber-300/70 dark:border-white/15 rounded-3xl p-6 text-center hover:border-amber-400 transition bg-slate-50/60 dark:bg-slate-800/40">
              {selectedImage ? (
                <div className="relative inline-block">
                  <img
                    src={selectedImage}
                    alt="Uploaded preview"
                    className="max-h-48 rounded-2xl shadow-sm object-cover mx-auto"
                  />
                  <button
                    onClick={() => setSelectedImage("")}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-md hover:bg-rose-600 cursor-pointer active:scale-95"
                    aria-label="Remove image"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2">
                  <Upload className="w-8 h-8 text-amber-500 dark:text-amber-400 mx-auto stroke-[2.2]" />
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 block">Click to upload an image</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block">PNG, JPG, WebP up to 10MB</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Quick Sample Presets */}
            {!selectedImage && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Or select a sample image:</p>
                <div className="grid grid-cols-3 gap-2">
                  {sampleImages.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(s)}
                      className="group border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden hover:border-amber-400 transition text-left cursor-pointer active:scale-95 bg-white dark:bg-slate-900"
                    >
                      <img src={s.url} alt={s.title} className="h-16 w-full object-cover group-hover:scale-105 transition" />
                      <p className="p-1.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate">{s.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hint Input */}
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Optional Hint (e.g. "budget 500k", "brand name"):
              </label>
              <input
                type="text"
                placeholder="Give AI additional context..."
                value={userHint}
                onChange={(e) => setUserHint(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <button
              onClick={() => mutation.mutate()}
              disabled={!selectedImage || mutation.isPending}
              className="w-full btn-luxury-gold py-3 rounded-xl text-xs font-bold transition shadow-md disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
              <span>{mutation.isPending ? "AI Identifying Product..." : "Identify & Research Deals"}</span>
            </button>
          </div>
        ) : (
          /* Identification Result */
          <div className="space-y-5 mt-4 animate-fade-in">
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-500/20 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  AI Product Identification
                </span>
                <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/40">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  {result.confidence.toUpperCase()} CONFIDENCE
                </span>
              </div>

              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                {result.identifiedProduct}
              </h3>

              <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                {result.category && (
                  <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 font-medium">
                    {result.category}
                  </span>
                )}
                {result.brand && (
                  <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 font-medium">
                    {result.brand}
                  </span>
                )}
              </div>

              {result.confidenceExplanation && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-amber-200/60 dark:border-white/5">
                  {result.confidenceExplanation}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleViewResearch}
                className="w-full btn-luxury-gold py-3 rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>View Researched Products & Deals</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setSelectedImage("");
                }}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer active:scale-95"
              >
                Try Another Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
