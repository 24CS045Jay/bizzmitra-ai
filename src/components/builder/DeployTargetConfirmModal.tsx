import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Cloud,
  Github,
  Zap,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  RefreshCw,
  X,
  ShieldCheck,
  Server,
} from "lucide-react";
import { CloudCredentials } from "@/lib/builder/cloud-credentials-store";

interface DeployTargetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmContinue: () => void;
  onSwitchAccount: () => void;
  onUseManaged?: () => void;
  credentials: CloudCredentials;
  actionType?: "deploy" | "github";
  isUpdate?: boolean;
}

export function DeployTargetConfirmModal({
  isOpen,
  onClose,
  onConfirmContinue,
  onSwitchAccount,
  onUseManaged,
  credentials,
  actionType = "deploy",
  isUpdate = false,
}: DeployTargetConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const isCustomMode = credentials.mode === "custom" || Boolean(credentials.githubToken || credentials.vercelToken);
  const targetLabel =
    actionType === "deploy"
      ? "Vercel & Cloud Deployment"
      : isUpdate
      ? "Push Latest Changes to GitHub"
      : "GitHub Repository Creation";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative z-10 bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-5 shadow-2xl text-slate-100 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <UserCheck className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Confirm Cloud Destination
              </h3>
              <p className="text-[11px] text-slate-400">
                Target: {targetLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Account Details Box */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300">
              <ShieldCheck className="size-3 text-indigo-400" />
              <span>SAVED PERSONAL ACCOUNT</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Auto-persisted for all workspaces
            </span>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            {credentials.githubUsername && (
              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl">
                <span className="text-slate-400 flex items-center gap-2">
                  <Github className="size-3.5 text-slate-300" />
                  <span>GitHub Account</span>
                </span>
                <span className="font-bold text-white font-mono flex items-center gap-1.5">
                  {credentials.githubAvatar && (
                    <img
                      src={credentials.githubAvatar}
                      alt={credentials.githubUsername}
                      className="size-4 rounded-full"
                    />
                  )}
                  <span>@{credentials.githubUsername}</span>
                </span>
              </div>
            )}

            {credentials.vercelUsername && (
              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl">
                <span className="text-slate-400 flex items-center gap-2">
                  <Cloud className="size-3.5 text-indigo-400" />
                  <span>Vercel Destination</span>
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  {credentials.vercelTeamName || credentials.vercelUsername}
                </span>
              </div>
            )}

            {credentials.supabaseUrl && (
              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl">
                <span className="text-slate-400 flex items-center gap-2">
                  <Server className="size-3.5 text-emerald-400" />
                  <span>Database</span>
                </span>
                <span className="font-mono text-[11px] text-slate-300 truncate max-w-[180px]">
                  {credentials.supabaseUrl}
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
            Would you like to deploy using these <strong>saved personal credentials</strong>, or switch to a new account?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* 1. Continue with saved tokens */}
          <button
            type="button"
            onClick={onConfirmContinue}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 text-white font-bold py-2.5 px-4 text-xs shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            <span>{isUpdate ? "Push Updates to Connected Account" : "Continue with Saved Accounts"}</span>
            <ArrowRight className="size-3.5" />
          </button>

          {/* 2. Switch or use new account */}
          <button
            type="button"
            onClick={onSwitchAccount}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold py-2 px-4 text-xs transition cursor-pointer"
          >
            <RefreshCw className="size-3 text-indigo-400" />
            <span>Deploy to a New Account (Change Tokens)</span>
          </button>

          {/* 3. Quick fallback to BizzMitra Managed Engine */}
          {onUseManaged && (
            <button
              type="button"
              onClick={onUseManaged}
              className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 py-1 transition cursor-pointer"
            >
              Or deploy via BizzMitra Managed 1-Click Engine →
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
