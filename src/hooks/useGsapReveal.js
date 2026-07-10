import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useGsapReveal(options = {}) {
  const scope = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray("[data-reveal]").forEach((item, index) => {
        gsap.fromTo(
          item,
          {
            autoAlpha: 0,
            y: options.y ?? 36,
            filter: "blur(18px)",
            scale: options.scale ?? 1
          },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            scale: 1,
            duration: options.duration ?? 0.9,
            delay: index * (options.stagger ?? 0.05),
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 82%"
            }
          }
        );
      });
    }, scope);

    return () => ctx.revert();
  }, [options.duration, options.scale, options.stagger, options.y]);

  return scope;
}
