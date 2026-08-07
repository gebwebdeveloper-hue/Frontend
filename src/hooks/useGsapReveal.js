import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useGsapReveal(options = {}) {
  const scope = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray("[data-reveal]");

      items.forEach((item) => {
        // Immediate check: if element is near or within viewport on load, show immediately without gap
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100) {
          gsap.set(item, { autoAlpha: 1, y: 0, filter: "none" });
          return;
        }

        gsap.fromTo(
          item,
          {
            autoAlpha: 0,
            y: options.y ?? 16
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: options.duration ?? 0.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 98%",
              toggleActions: "play none none none",
              once: true,
              onEnter: () => {
                gsap.set(item, { autoAlpha: 1, y: 0 });
              }
            }
          }
        );
      });

      // Multiple refresh triggers to catch layout shifts & image loads
      ScrollTrigger.refresh();
      const t1 = setTimeout(() => ScrollTrigger.refresh(), 100);
      const t2 = setTimeout(() => ScrollTrigger.refresh(), 350);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }, scope);

    return () => ctx.revert();
  }, [options.duration, options.scale, options.stagger, options.y]);

  return scope;
}
