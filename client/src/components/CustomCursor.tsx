import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show custom cursor on desktop (hover enabled devices)
    if (window.matchMedia("(hover: none)").matches) return;
    setIsVisible(true);
    document.body.classList.add("cursor-none");

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "a" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("cursor-pointer")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseOver);

    return () => {
      document.body.classList.remove("cursor-none");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* The trailing, larger glowing ring */}
      <div
        className="pointer-events-none fixed top-0 left-0 z-[10000] rounded-full mix-blend-difference transition-all duration-300 ease-out flex items-center justify-center"
        style={{
          width: isHovering ? "60px" : "32px",
          height: isHovering ? "60px" : "32px",
          transform: `translate(${position.x - (isHovering ? 30 : 16)}px, ${position.y - (isHovering ? 30 : 16)}px)`,
          border: isHovering ? "1px solid rgba(245, 158, 11, 0.8)" : "1px solid rgba(255, 255, 255, 0.4)",
          backgroundColor: isHovering ? "rgba(245, 158, 11, 0.1)" : "transparent",
        }}
      />
      {/* The precise center dot */}
      <div
        className="pointer-events-none fixed top-0 left-0 z-[10000] w-2 h-2 bg-amber-400 rounded-full mix-blend-difference transition-transform duration-75"
        style={{
          transform: `translate(${position.x - 4}px, ${position.y - 4}px) scale(${isHovering ? 0 : 1})`,
          boxShadow: "0 0 10px rgba(245, 158, 11, 0.8)",
        }}
      />
    </>
  );
}
