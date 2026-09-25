import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Smartphone, ExternalLink, QrCode as QrIcon, Lock, Rocket, CheckCircle2 } from "lucide-react";

interface LiveAppQrCodeProps {
  url?: string | null;
  size?: number;
  appName?: string;
  onDeploy?: () => void;
  compact?: boolean;
}

export function LiveAppQrCode({ url, size = 180, appName, onDeploy, compact = false }: LiveAppQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  // Only consider it a live deployable URL if it's HTTPS and not localhost
  const isLiveDeployed = Boolean(url && url.startsWith("https://") && !url.includes("localhost"));

  useEffect(() => {
    if (!isLiveDeployed || !url) {
      setDataUrl("");
      return;
    }

    QRCode.toDataURL(url, {
      width: size,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((res) => setDataUrl(res))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [url, size, isLiveDeployed]);

  // If not deployed yet: Show locked state
  if (!isLiveDeployed) {
    return (
      <div className={`flex flex-col items-center justify-center ${compact ? 'p-3.5' : 'p-5'} rounded-2xl bg-slate-900/60 border border-dashed border-border/80 text-center space-y-3`}>
        <div
          style={{ width: size, height: size }}
          className="flex flex-col items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-slate-400 p-3 space-y-2"
        >
          <div className="size-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Lock className="size-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-300">QR Code Locked</span>
          <span className="text-[9px] text-slate-500 leading-tight">
            Requires live deployment.
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-foreground">
            <Smartphone className="size-3.5 text-muted-foreground" />
            <span>Mobile Testing</span>
          </div>
          {!compact && (
            <p className="text-[11px] text-muted-foreground max-w-[210px] leading-relaxed">
              Click <strong>Deploy to Cloud</strong> to generate your public HTTPS URL and unlock the scannable QR code.
            </p>
          )}
        </div>

        {onDeploy && (
          <button
            onClick={onDeploy}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold py-2 px-3 text-xs shadow-md shadow-indigo-600/20 hover:brightness-110 transition cursor-pointer"
          >
            <Rocket className="size-3.5" />
            <span>Deploy to Unlock QR</span>
          </button>
        )}
      </div>
    );
  }

  // Once deployed: Render the active QR Code for the public URL
  return (
    <div className={`flex flex-col items-center justify-center ${compact ? 'p-3 bg-white dark:bg-slate-900/90 max-w-[160px]' : 'p-5 bg-white dark:bg-slate-900'} rounded-2xl border border-emerald-500/30 shadow-lg text-center space-y-2`}>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>LIVE QR CODE</span>
      </div>

      <div className="relative p-1.5 rounded-xl bg-white shadow-inner border border-slate-200 dark:border-slate-800">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`Live QR Code for ${url}`}
            width={size}
            height={size}
            className="rounded-lg shadow-xs"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400"
          >
            <QrIcon className="size-8 animate-pulse text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-foreground">
          <Smartphone className="size-3 text-emerald-500" />
          <span>Scan on Mobile</span>
        </div>
        {!compact && (
          <p className="text-[10px] text-muted-foreground max-w-[200px] truncate font-mono">
            {url}
          </p>
        )}
      </div>

      {!compact && (
        <a
          href={url!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-foreground transition cursor-pointer"
        >
          <span>Open Live System</span>
          <ExternalLink className="size-3 text-primary" />
        </a>
      )}
    </div>
  );
}
