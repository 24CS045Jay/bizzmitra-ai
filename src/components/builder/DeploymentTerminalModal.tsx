import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Terminal,
  X,
  AlertCircle,
  Copy,
  Sparkles,
  Github,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { DeploymentProgressLog, DeploymentResult } from "@/lib/builder/deploy-service";
import { LiveAppQrCode } from "./LiveAppQrCode";

interface DeploymentTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: DeploymentProgressLog[];
  isDeploying: boolean;
  result: DeploymentResult | null;
  projectName: string;
  onExportGitHub?: () => void;
  onDownloadZip?: () => void;
  githubUrl?: string | null;
}

export function DeploymentTerminalModal({
  isOpen,
  onClose,
  logs,
  isDeploying,
  result,
  projectName,
  onExportGitHub,
  onDownloadZip,
  githubUrl,
}: DeploymentTerminalModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const isComplete = Boolean(result?.success && !isDeploying);
  const liveUrl = isComplete ? (result?.liveUrl || `https://${projectName}.vercel.app`) : null;

  const handleCopyLink = () => {
    if (liveUrl) {
      navigator.clipboard.writeText(liveUrl);
      toast.success("Live URL copied to clipboard!");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={!isDeploying ? onClose : undefined} />
      <div className="relative z-10 bg-slate-950 border border-slate-800 rounded-3xl max-w-3xl w-full p-5 sm:p-7 space-y-5 sm:space-y-6 shadow-2xl text-slate-100 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 size-48 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-24 -left-24 size-48 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              <Terminal className="size-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {isComplete ? "🚀 Live Production Deployment" : "Cloud Deployment Pipeline"}
                </h3>
                {isDeploying && (
                  <span className="flex items-center gap-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                    <Loader2 className="size-3 animate-spin" />
                    Deploying to Vercel...
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Target: Vercel Edge Serverless Network</p>
            </div>
          </div>

          {!isDeploying && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Terminal Build Stepper */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/90 p-4 font-mono text-xs space-y-3">
          <div className="text-[11px] text-slate-500 flex items-center justify-between border-b border-slate-800 pb-2">
            <span>PIPELINE EXECUTION LOGS</span>
            <span className="text-slate-400">HOST: api.vercel.com</span>
          </div>

          <div className="space-y-2.5">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {log.status === "done" && <CheckCircle2 className="size-4 text-emerald-400" />}
                  {log.status === "running" && <Loader2 className="size-4 text-indigo-400 animate-spin" />}
                  {log.status === "pending" && <Clock className="size-4 text-slate-600" />}
                  {log.status === "error" && <AlertCircle className="size-4 text-rose-400" />}
                </div>

                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                  <span
                    className={`truncate min-w-0 ${
                      log.status === "done"
                        ? "text-emerald-300 font-medium"
                        : log.status === "running"
                        ? "text-white font-bold"
                        : "text-slate-500"
                    }`}
                  >
                    [{log.step}/{log.totalSteps}] {log.label}
                  </span>
                  {log.timestamp && (
                    <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Handover Card */}
        {isComplete && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6 min-w-0">
              {/* QR Code */}
              <div className="shrink-0 flex items-center justify-center">
                <LiveAppQrCode url={liveUrl} size={120} compact={true} />
              </div>

              {/* URL & Actions */}
              <div className="flex-1 min-w-0 space-y-3.5 w-full flex flex-col justify-between text-center sm:text-left">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE PRODUCTION ACTIVE
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1">Application is Online!</h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Your software is globally accessible with SSL certificate and edge acceleration.
                  </p>
                </div>

                {/* Copyable URL bar */}
                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 min-w-0 shadow-inner">
                  <span className="truncate flex-1 font-bold text-left select-all min-w-0">{liveUrl}</span>
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-300 transition shrink-0 cursor-pointer"
                    title="Copy URL"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-1">
                  <a
                    href={liveUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 shrink-0"
                  >
                    <span>Launch Live App</span>
                    <ExternalLink className="size-3.5" />
                  </a>

                  {onDownloadZip && (
                    <button
                      onClick={onDownloadZip}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2.5 text-xs font-semibold text-slate-200 transition cursor-pointer shrink-0"
                      title="Download Source Code .ZIP"
                    >
                      <Download className="size-3.5" />
                      <span>ZIP</span>
                    </button>
                  )}

                  {onExportGitHub && (
                    <button
                      onClick={onExportGitHub}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2.5 text-xs font-semibold text-slate-200 transition cursor-pointer shrink-0"
                      title="Push to GitHub"
                    >
                      <Github className="size-3.5" />
                      <span>{githubUrl ? "Push Latest to GitHub" : "Push to GitHub"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
          <span>Deployment Engine: BizzMitra Autonomous Compiler</span>
          <span>Zero Server Overhead · 100% Edge Powered</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
