import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import { gsap } from "gsap";

export interface GridMotionProps {
  items?: (string | ReactNode)[];
  gradientColor?: string;
  className?: string;
}

export const GridMotion: FC<GridMotionProps> = ({
  items = [],
  gradientColor = "var(--background)",
  className = "",
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouseXRef = useRef<number>(typeof window !== "undefined" ? window.innerWidth / 2 : 500);
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return false;
  });

  const totalItems = 28;
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`);

  // Populate all 28 cells cycling through available items if fewer than 28 are provided
  const combinedItems =
    items.length > 0
      ? Array.from({ length: totalItems }, (_, index) => items[index % items.length])
      : defaultItems;

  // Track responsive viewport: disable full desktop GSAP loop on < 768px
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    // Retain lagSmoothing(0) from React Bits source for responsive parallax tracking
    gsap.ticker.lagSmoothing(0);

    const handleMouseMove = (e: MouseEvent): void => {
      mouseXRef.current = e.clientX;
    };

    const updateMotion = (): void => {
      const maxMoveAmount = 300;
      const baseDuration = 0.8;
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1;
          const moveAmount =
            ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) *
            direction;

          const inertia = inertiaFactors[index % inertiaFactors.length] ?? 0.3;
          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertia,
            ease: "power3.out",
            overwrite: "auto",
          });
        }
      });
    };

    const removeAnimationLoop = () => gsap.ticker.remove(updateMotion);
    gsap.ticker.add(updateMotion);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      removeAnimationLoop();
      rowRefs.current.forEach((row) => {
        if (row) gsap.killTweensOf(row);
      });
    };
  }, [isDesktop]);

  // Mobile fallback: static dimmed background with subtle gradient to avoid desktop animation weight
  if (!isDesktop) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
        aria-hidden="true"
      >
        <div
          className="h-full w-full opacity-35"
          style={{
            background: `radial-gradient(ellipse at center, ${gradientColor} 0%, transparent 80%)`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className={`pointer-events-none h-full w-full overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <section
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 z-[4] bg-[length:250px]" />
        <div className="relative z-[2] flex-none h-[150vh] w-[150vw] origin-center rotate-[-15deg] grid grid-cols-1 grid-rows-4 gap-4">
          {Array.from({ length: 4 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-7 gap-4"
              style={{ willChange: "transform, filter" }}
              ref={(el) => {
                rowRefs.current[rowIndex] = el;
              }}
            >
              {Array.from({ length: 7 }, (_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex];
                return (
                  <div key={itemIndex} className="relative">
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[10px] bg-card/70 border border-border/30 dark:bg-[#111] dark:border-white/5 text-[1.5rem]">
                      {typeof content === "string" ? (
                        <div
                          className="absolute left-0 top-0 h-full w-full bg-cover bg-center brightness-90 contrast-[1.05] blur-[1px] dark:brightness-75 dark:contrast-[1.02]"
                          style={{
                            backgroundImage: `url(${content})`,
                            transform: "scale(1.04)",
                          }}
                        />
                      ) : (
                        <div className="z-[1] p-4 text-center">{content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="pointer-events-none relative left-0 top-0 h-full w-full" />
      </section>
    </div>
  );
};

export default GridMotion;
