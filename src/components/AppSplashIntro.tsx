import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, X, Play, ArrowRight } from "lucide-react";
import { Capacitor } from "@capacitor/core";

interface AppSplashIntroProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

function isAppEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  // 1. Native Capacitor platform (Android / iOS app container)
  if (Capacitor.isNativePlatform()) return true;
  // 2. Standalone PWA app mode (Installed to Home Screen)
  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  if (isStandalone) return true;
  // 3. Mobile screen viewport on mobile OS device
  const isMobileScreen = window.innerWidth <= 768;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
  return isMobileScreen && isMobileUA;
}

export function AppSplashIntro({ onComplete, forceShow = false }: AppSplashIntroProps) {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (forceShow) return true;
    if (!isAppEnvironment()) return false;
    const hasSeen = window.sessionStorage.getItem("bizzmitra_splash_played");
    return !hasSeen;
  });

  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleFinish = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("bizzmitra_splash_played", "true");
    }
    setVisible(false);
    onComplete?.();
  };

  useEffect(() => {
    if (!visible) return;

    // Safety fallback: allow up to 25s for slow loading networks, then dismiss
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, 25000);

    return () => clearTimeout(safetyTimer);
  }, [visible]);

  useEffect(() => {
    if (visible && videoRef.current) {
      const vid = videoRef.current;
      vid.currentTime = 0;
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn("Autoplay notice:", err);
            // Fallback play muted if blocked by browser policy
            vid.muted = true;
            setIsMuted(true);
            vid.play().catch(() => {});
          });
      }
    }
  }, [visible]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(pct);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="bizzmitra-splash-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col justify-between bg-black text-white overflow-hidden select-none safe-area-inset"
        >
          {/* Full Screen Cinematic Animation Layer */}
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src="/splash-animation.mp4"
              playsInline
              muted={isMuted}
              autoPlay
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleFinish}
              onError={() => {
                console.warn("Video failed to play, closing splash.");
                handleFinish();
              }}
              className="w-full h-full object-contain sm:object-cover"
            />
            {/* Ambient gradients for high-contrast mobile UI overlays */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
          </div>

          {/* Top Bar: Brand Pill, Audio Control & Skip Button */}
          <header className="relative z-20 pt-safe px-5 pt-4 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-2.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 backdrop-blur-xl shadow-lg"
            >
              <img
                src="/logo.png"
                alt="BizzMitra"
                className="size-5 rounded-full object-cover shadow-sm ring-1 ring-white/20"
              />
              <span className="font-display text-xs font-bold tracking-tight text-white/95">
                BizzMitra AI
              </span>
            </motion.div>

            <div className="flex items-center gap-2">
              <motion.button
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    videoRef.current.muted = !videoRef.current.muted;
                    setIsMuted(videoRef.current.muted);
                  }
                }}
                className="rounded-full border border-white/15 bg-black/40 p-2 text-white/80 hover:text-white hover:bg-black/60 transition-colors backdrop-blur-xl shadow-lg active:scale-90"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFinish();
                }}
                className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 hover:bg-white/25 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-xl transition-all active:scale-95 shadow-xl"
              >
                <span>Skip</span>
                <ArrowRight className="size-3.5" />
              </motion.button>
            </div>
          </header>

          {/* Bottom Bar: Tagline & Sleek Progress Track */}
          <footer className="relative z-20 pb-safe px-6 pb-6 text-center space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-1"
            >
              <p className="font-display text-base font-bold tracking-tight text-white/95 drop-shadow-md">
                From Business Idea to Full Blueprint
              </p>
              <p className="text-[11px] text-white/60 font-mono tracking-wide">
                Autonomous Multi-Agent Architecture
              </p>
            </motion.div>

            {/* Micro Progress Bar */}
            <div className="w-full max-w-xs mx-auto h-1 rounded-full bg-white/20 overflow-hidden backdrop-blur-md">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-indigo-400 to-emerald-400 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
