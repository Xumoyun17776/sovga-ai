import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function EasterEgg() {
  useEffect(() => {
    let pressed: string[] = [];
    const secretCode = "sovga"; // The magic word

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      pressed.push(e.key.toLowerCase());
      pressed.splice(-secretCode.length - 1, pressed.length - secretCode.length);

      if (pressed.join("") === secretCode) {
        // Fire the golden luxury confetti!
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#f59e0b', '#fbbf24', '#ffffff'] // Gold and White
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#f59e0b', '#fbbf24', '#ffffff']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
        
        // Reset code so it can be done again
        pressed = [];
      }
    };

    window.addEventListener("keyup", handleKeyDown);
    return () => window.removeEventListener("keyup", handleKeyDown);
  }, []);

  return null;
}
