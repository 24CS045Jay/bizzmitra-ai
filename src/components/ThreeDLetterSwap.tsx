import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ThreeDLetterSwapProps {
  /** The text string to animate */
  text: string;
  /** Optional secondary text to swap to on hover (defaults to same text with styling) */
  secondaryText?: string;
  /** Additional CSS class for outer container */
  className?: string;
  /** Class for front face */
  frontClassName?: string;
  /** Class for back face */
  backClassName?: string;
  /** Stagger delay between letters in seconds (default: 0.025) */
  stagger?: number;
  /** Animation duration per letter in seconds (default: 0.4) */
  duration?: number;
  /** Initial delay before animation starts */
  delay?: number;
  /** Reverse the vertical flip direction */
  reverse?: boolean;
  /** Trigger mode: 'hover' | 'auto' | 'both' */
  trigger?: "hover" | "auto" | "both";
  /** If trigger='auto' or 'both', interval in ms between periodic auto-flips */
  autoInterval?: number;
  /** Words to apply accent style to */
  accentWords?: string[];
  /** Accent style class */
  accentClassName?: string;
}

export function ThreeDLetterSwap({
  text,
  secondaryText,
  className = "",
  frontClassName = "",
  backClassName = "",
  stagger = 0.025,
  duration = 0.42,
  delay = 0,
  reverse = false,
  trigger = "both",
  autoInterval = 4000,
  accentWords = [],
  accentClassName = "text-primary italic",
}: ThreeDLetterSwapProps) {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  // Periodic wave flip if trigger is 'auto' or 'both'
  React.useEffect(() => {
    if (trigger !== "auto" && trigger !== "both") return;

    const interval = setInterval(() => {
      if (!isHovered) {
        setIsFlipped((prev) => !prev);
      }
    }, autoInterval);

    return () => clearInterval(interval);
  }, [trigger, autoInterval, isHovered]);

  const activeFlip = isHovered ? true : isFlipped;

  // Split into words so wrapping remains natural on responsive screens
  const words = React.useMemo(() => text.split(" "), [text]);
  const secondaryWords = React.useMemo(
    () => (secondaryText ? secondaryText.split(" ") : words),
    [secondaryText, words],
  );

  let globalCharIndex = 0;

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-[0.28em] [perspective:1200px] cursor-pointer select-none",
        className,
      )}
      onMouseEnter={() => {
        if (trigger === "hover" || trigger === "both") {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (trigger === "hover" || trigger === "both") {
          setIsHovered(false);
        }
      }}
      onClick={() => setIsFlipped((prev) => !prev)}
      role="button"
      tabIndex={0}
    >
      {words.map((word, wordIdx) => {
        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const isAccent = accentWords.some(
          (acc) => cleanWord.includes(acc.toLowerCase()) || acc.toLowerCase().includes(cleanWord),
        );
        const secWord = secondaryWords[wordIdx] || word;
        const letters = word.split("");

        return (
          <span
            key={`${word}-${wordIdx}`}
            className={cn(
              "inline-flex items-baseline whitespace-nowrap px-[0.04em]",
              isAccent && accentClassName,
            )}
          >
            {letters.map((char, charIdx) => {
              const secChar = secWord[charIdx] || char;
              const charDelay = delay + globalCharIndex * stagger;
              globalCharIndex++;

              const frontRotate = reverse ? -90 : 90;
              const frontY = reverse ? "100%" : "-100%";
              const backRotate = reverse ? 90 : -90;
              const backY = reverse ? "-100%" : "100%";

              const originFront = reverse ? "50% 0%" : "50% 100%";
              const originBack = reverse ? "50% 100%" : "50% 0%";

              return (
                <span
                  key={charIdx}
                  className="relative inline-block [transform-style:preserve-3d]"
                >
                  {/* Front letter face */}
                  <motion.span
                    className={cn(
                      "inline-block will-change-transform [backface-visibility:hidden]",
                      frontClassName,
                    )}
                    animate={
                      activeFlip
                        ? { y: frontY, rotateX: frontRotate, opacity: 0 }
                        : { y: "0%", rotateX: 0, opacity: 1 }
                    }
                    transition={{
                      duration,
                      delay: charDelay,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{ transformOrigin: originFront }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>

                  {/* Back / Swapped letter face */}
                  <motion.span
                    className={cn(
                      "absolute inset-0 inline-block will-change-transform [backface-visibility:hidden]",
                      backClassName,
                      isAccent && accentClassName,
                    )}
                    animate={
                      activeFlip
                        ? { y: "0%", rotateX: 0, opacity: 1 }
                        : { y: backY, rotateX: backRotate, opacity: 0 }
                    }
                    transition={{
                      duration,
                      delay: charDelay,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{ transformOrigin: originBack }}
                  >
                    {secChar === " " ? "\u00A0" : secChar}
                  </motion.span>
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}

// Alias matching React Bits naming convention
export const LetterSwap = ThreeDLetterSwap;
