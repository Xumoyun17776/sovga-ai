import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function GlobalLoadingBar() {
  const [location] = useLocation();
  const [isRouting, setIsRouting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsRouting(true);
    setProgress(10);
    
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 90) return old;
        return old + Math.random() * 15;
      });
    }, 150);

    const finishTimeout = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsRouting(false);
        setProgress(0);
      }, 300);
    }, 400); // simulate router transition time

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimeout);
    };
  }, [location]);

  if (!isRouting && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[9999] pointer-events-none">
      <div 
        className="h-full transition-all ease-out bg-amber-400"
        style={{ 
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "300ms" : "150ms" 
        }}
      />
    </div>
  );
}
