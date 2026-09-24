import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { Capacitor } from "@capacitor/core";

interface AppSplashIntroProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

function isAppEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  // 1. Native Capacitor platform (Android / iOS)
  if (Capacitor.isNativePlatform()) return true;
  // 2. Standalone PWA app mode
  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  if (isStandalone) return true;
  // 3. Mobile screen viewport & mobile touch device
  const isMobileScreen = window.innerWidth <= 640;
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

    // Safety fallback: auto-close after 6 seconds if video is blocked or finishes
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, 6000);

    return () => clearTimeout(safetyTimer);
  }, [visible]);

  useEffect(() => {
    if (visible && videoRef.current) {
      const vid = videoRef.current;
      vid.currentTime = 0;
      vid.play().catch((err) => {
        console.warn("Autoplay was prevented or stalled:", err);
      });
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
          exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#09090b] text-white overflow-hidden select-none"
        >
          {/* Ambient Glow Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/20 blur-[140px]" />
            <div className="absolute -bottom-1/4 left-1/2 -translate-x-1/2 size-[500px] rounded-full bg-indigo-500/15 blur-[120px]" />
          </div>

          {/* Top Bar: Brand Pill & Skip Button */}
          <div className="absolute top-6 inset-x-6 sm:inset-x-10 flex items-center justify-between z-20">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md"
            >
              <img
                src="/logo.png"
                alt="BizzMitra"
                className="size-5 rounded-full object-cover shadow-sm"
              />
              <span className="font-display text-xs font-bold tracking-tight text-white/90">
                BizzMitra-AI
              </span>
            </motion.div>

            <div className="flex items-center gap-2">
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !videoRef.current.muted;
                    setIsMuted(videoRef.current.muted);
                  }
                }}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleFinish}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/20 transition-all backdrop-blur-md active:scale-95 shadow-lg"
              >
                <span>Skip</span>
                <X className="size-3.5" />
              </motion.button>
            </div>
          </div>

          {/* Center Cinematic Video Container */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 w-[90vw] max-w-lg aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 shadow-[0_0_50px_rgba(79,70,229,0.35)] bg-black/60 backdrop-blur-xl flex items-center justify-center"
          >
            <video
              ref={videoRef}
              src="/splash-animation.mp4"
              playsInline
              muted={isMuted}
              autoPlay
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleFinish}
              className="w-full h-full object-cover"
            />

            {/* Subtle Overlay Vignette */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/30" />

            {/* Bottom Progress Bar inside video frame */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-indigo-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>

          {/* Bottom Branding Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="relative z-10 mt-6 text-center"
          >
            <p className="font-display text-base sm:text-lg font-bold tracking-tight text-white/90">
              From Business Problem to Blueprint
            </p>
            <p className="text-xs text-white/50 mt-1 font-mono">
              Empowered by Autonomous Multi-Agent AI
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
