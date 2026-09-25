import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TransparentRobotCanvasProps {
  className?: string;
  videoSrc?: string;
  onSnapReady?: (trigger: () => void) => void;
  onSnapMoment?: () => void;
}

export function TransparentRobotCanvas({
  className = "",
  videoSrc = "/robot-animation-2.mp4",
  onSnapReady,
  onSnapMoment,
}: TransparentRobotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const snapMomentFiredRef = useRef<boolean>(false);

  useEffect(() => {
    // Initialize Video 2 (from p1/video2.mp4)
    const video = document.createElement("video");
    video.src = videoSrc;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = "auto";
    videoRef.current = video;
    video.play().catch(() => {});

    // Trigger function to run snap animation on theme toggle
    const triggerSnap = () => {
      if (videoRef.current) {
        snapMomentFiredRef.current = false;
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});

        // Precise snap trigger timing: around 650ms into the snap gesture
        setTimeout(() => {
          if (!snapMomentFiredRef.current) {
            snapMomentFiredRef.current = true;
            if (onSnapMoment) {
              onSnapMoment();
            }
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("bizzmitra:theme-snap-execute"));
            }
          }
        }, 650);
      }
    };

    if (onSnapReady) {
      onSnapReady(triggerSnap);
    }

    const handleThemeSnapRequest = () => {
      triggerSnap();
    };

    window.addEventListener("bizzmitra:theme-snap-request", handleThemeSnapRequest);

    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Process each frame to make dark studio background 100% transparent
    const renderFrame = () => {
      if (video.readyState >= 2 && !video.paused && !video.ended) {
        if (video.videoWidth > 0 && canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const width = canvas.width;
        const height = canvas.height;

        ctx.drawImage(video, 0, 0, width, height);
        const frame = ctx.getImageData(0, 0, width, height);
        const data = frame.data;
        const len = data.length;

        // Precision chroma keying with edge de-matting for crisp rendering on both Light and Dark themes
        for (let i = 0; i < len; i += 4) {
          const r = data[i]!;
          const g = data[i + 1]!;
          const b = data[i + 2]!;
          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          const chroma = maxVal - minVal;

          // Pure dark studio background
          if (chroma < 12 && maxVal < 52) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 0; // 100% transparent
          } else if (chroma >= 12 || maxVal >= 78) {
            data[i + 3] = 255; // 100% solid opacity with full original colors
          } else {
            // Anti-aliased edge blend with de-fringing for white/bright background clarity
            const t = (maxVal - 52) / (78 - 52);
            data[i + 3] = Math.floor(t * 255);
            if (t > 0) {
              const boost = 1 / (t * 0.65 + 0.35);
              data[i] = Math.min(255, Math.floor(r * boost));
              data[i + 1] = Math.min(255, Math.floor(g * boost));
              data[i + 2] = Math.min(255, Math.floor(b * boost));
            }
          }
        }

        ctx.putImageData(frame, 0, 0);
      }
      animationFrameId = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      window.removeEventListener("bizzmitra:theme-snap-request", handleThemeSnapRequest);
      cancelAnimationFrame(animationFrameId);
      video.pause();
      video.src = "";
      video.remove();
    };
  }, [videoSrc, onSnapReady, onSnapMoment]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className={cn(
        "pointer-events-none select-none h-auto w-full object-contain",
        className
      )}
    />
  );
}
