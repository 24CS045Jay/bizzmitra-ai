import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const handleToggle = () => {
    if (typeof window !== "undefined") {
      let executed = false;
      const onExecute = () => {
        if (!executed) {
          executed = true;
          window.removeEventListener("bizzmitra:theme-snap-execute", onExecute);
          toggleTheme();
        }
      };

      window.addEventListener("bizzmitra:theme-snap-execute", onExecute);

      // Dispatch request to robot animation
      window.dispatchEvent(
        new CustomEvent("bizzmitra:theme-snap-request", {
          detail: { targetTheme: isDark ? "light" : "dark" },
        })
      );

      // Safety fallback: if no animation listener responds within 750ms, toggle immediately
      setTimeout(() => {
        onExecute();
      }, 750);
    } else {
      toggleTheme();
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={cn(
        "neu-sm neu-press relative flex items-center justify-center gap-2 rounded-xl p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        showLabel ? "px-3 py-2 text-xs font-semibold" : "size-9",
        className,
      )}
    >
      <div className="relative size-4">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -40, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 40, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center text-primary"
            >
              <Moon className="size-4" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 40, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -40, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center text-foreground"
            >
              <Sun className="size-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showLabel ? (
        <span>{isDark ? "Dark" : "Light"}</span>
      ) : null}
    </button>
  );
}
