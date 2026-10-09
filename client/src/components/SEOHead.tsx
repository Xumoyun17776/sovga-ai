import { useEffect } from "react";
import { useLocation } from "wouter";

export default function SEOHead({ title, description }: { title?: string, description?: string }) {
  const [location] = useLocation();

  useEffect(() => {
    // Dynamic Title
    const baseTitle = "Sovg'a AI — 1-raqamli AI Xarid Tadqiqotchisi";
    let newTitle = baseTitle;

    if (title) {
      newTitle = `${title} | Sovg'a AI`;
    } else {
      // Auto-generate title based on route if not explicitly provided
      if (location === "/catalog") newTitle = "Katalog va Chegirmalar | Sovg'a AI";
      else if (location.startsWith("/search")) newTitle = "Qidiruv Natijalari | Sovg'a AI";
      else if (location === "/gift-finder") newTitle = "AI Sovg'a Topuvchi | Sovg'a AI";
      else if (location.startsWith("/wedding")) newTitle = "To'y va Istaklar Ro'yxati | Sovg'a AI";
      else if (location === "/compare-duel") newTitle = "AI Qiyoslagich va Duel | Sovg'a AI";
      else if (location === "/merchant") newTitle = "Sotuvchilar Portali | Sovg'a AI";
      else if (location === "/auth") newTitle = "Tizimga Kirish | Sovg'a AI";
    }

    document.title = newTitle;

    // Dynamic Meta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }
  }, [location, title, description]);

  return null;
}
