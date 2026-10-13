import { useEffect, useState } from "react";
import { Search } from "../lib/icons";

const animals = [
  { id: 1, emoji: "🦊", name: "Tulkicha", action: "Uzum Marketni izlayapti..." },
  { id: 2, emoji: "🐰", name: "Quyoncha", action: "Texnomartda yuguryapti..." },
  { id: 3, emoji: "🐱", name: "Mushukcha", action: "MediaParkni tekshiryapti..." },
  { id: 4, emoji: "🐼", name: "Panda", action: "Eng yaxshi chegirmalarni kutyapti..." },
  { id: 5, emoji: "🐶", name: "Kuchukcha", action: "Omborlarni iskalamoqda..." },
];

export default function CuteSearchAnimals() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % animals.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-[var(--line)] dark:border-amber-900/30 shadow-inner mt-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 opacity-50"></div>
      
      <div className="flex flex-col items-center justify-center space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Sovg'a AI kichik yordamchilari ishda!
        </h3>
        
        <div className="flex items-end justify-center gap-4 sm:gap-8 h-16">
          {animals.map((animal, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div 
                key={animal.id} 
                className={`flex flex-col items-center transition-all duration-200 ${isActive ? 'scale-125 -translate-y-4' : 'scale-90 opacity-60 grayscale-[30%]'}`}
              >
                <div className="relative">
                  <span className="text-3xl sm:text-4xl filter drop-shadow-md">{animal.emoji}</span>
                  {isActive && (
                    <div className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 rounded-full p-1 shadow-md border border-slate-100 dark:border-slate-700">
                      <Search className="w-3 h-3 text-amber-500" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-6 flex items-center justify-center">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 animate-pulse bg-amber-50 dark:bg-amber-950/40 px-4 py-1.5 rounded-full border border-[var(--line)] dark:border-amber-900/50">
            {animals[activeIndex].emoji} {animals[activeIndex].name} {animals[activeIndex].action}
          </p>
        </div>
      </div>
    </div>
  );
}
