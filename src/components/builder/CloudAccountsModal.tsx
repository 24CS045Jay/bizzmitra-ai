import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Cloud,
  Github,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Database,
  Lock,
  Loader2,
  Sparkles,
  Server
} from "lucide-react";
import { toast } from "sonner";
import {
  CloudCredentials,
  loadCloudCredentials,
  saveCloudCredentials,
  testGithubToken,
  testVercelToken,
} from "@/lib/builder/cloud-credentials-store";

interface CloudAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (creds: CloudCredentials) => void;
}

export function CloudAccountsModal({ isOpen, onClose, onSaved }: CloudAccountsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [creds, setCreds] = useState<CloudCredentials>({ mode: "managed" });
  const [githubInput, setGithubInput] = useState("");
  const [vercelInput, setVercelInput] = useState("");
  const [supabaseUrlInput, setSupabaseUrlInput] = useState("");
  const [supabaseKeyInput, setSupabaseKeyInput] = useState("");

  const [testingGithub, setTestingGithub] = useState(false);
  const [testingVercel, setTestingVercel] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const current = loadCloudCredentials();
      setCreds(current);
      setGithubInput(current.githubToken || "");
      setVercelInput(current.vercelToken || "");
      setSupabaseUrlInput(current.supabaseUrl || "");
      setSupabaseKeyInput(current.supabaseAnonKey || "");
    }
  }, [isOpen]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const handleVerifyGithub = async () => {
    setTestingGithub(true);
    const res = await testGithubToken(githubInput);
    setTestingGithub(false);
    if (res.valid) {
      const updated = {
        ...creds,
        githubToken: githubInput.trim(),
        githubUsername: res.username,
        githubAvatar: res.avatarUrl,
      };
      setCreds(updated);
      saveCloudCredentials(updated);
      toast.success(`Verified! Connected to GitHub as @${res.username}`);
    } else {
      toast.error(res.error || "GitHub token verification failed.");
    }
  };

  const handleVerifyVercel = async () => {
    setTestingVercel(true);
    const res = await testVercelToken(vercelInput);
    setTestingVercel(false);
    if (res.valid) {
      const updated = {
        ...creds,
        vercelToken: vercelInput.trim(),
        vercelUsername: res.username,
        vercelTeamName: res.teamName,
      };
      setCreds(updated);
      saveCloudCredentials(updated);
      toast.success(`Verified! Connected to Vercel account (${res.teamName})`);
    } else {
      toast.error(res.error || "Vercel token verification failed.");
    }
  };

  const handleSaveAndApply = () => {
    const updated = saveCloudCredentials({
      mode: creds.mode,
      githubToken: githubInput.trim() || undefined,
      githubUsername: creds.githubUsername,
      githubAvatar: creds.githubAvatar,
      vercelToken: vercelInput.trim() || undefined,
      vercelUsername: creds.vercelUsername,
      vercelTeamName: creds.vercelTeamName,
      supabaseUrl: supabaseUrlInput.trim() || undefined,
      supabaseAnonKey: supabaseKeyInput.trim() || undefined,
    });
    setCreds(updated);
    toast.success(
      creds.mode === "custom"
        ? "Personal cloud deployment configuration active!"
        : "Switched to BizzMitra Managed 1-Click Cloud."
    );
    if (onSaved) onSaved(updated);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Clickable Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Centered Modal Content Card */}
      <div className="relative z-10 bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Pinned Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
              <Cloud className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Cloud Provider & Deployment Settings
              </h3>
              <p className="text-xs text-slate-400">
                Choose between instant managed edge cloud or deploy directly to your personal accounts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setCreds({ ...creds, mode: "managed" })}
            className={`flex items-start gap-3 p-3.5 rounded-xl text-left transition cursor-pointer ${
              creds.mode === "managed"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Zap className="size-5 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>BizzMitra Managed Engine</span>
                <span className="rounded-full bg-emerald-400/20 px-1.5 py-0.2 text-[9px] text-emerald-300 font-bold">
                  Recommended for Demo
                </span>
              </div>
              <p className="text-[11px] opacity-80 mt-1 leading-relaxed">
                Zero setup. Instant 12s Vercel deployment, working live QR code, and pre-connected PostgreSQL DB.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCreds({ ...creds, mode: "custom" })}
            className={`flex items-start gap-3 p-3.5 rounded-xl text-left transition cursor-pointer ${
              creds.mode === "custom"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Server className="size-5 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold">Personal Accounts (BYOC)</div>
              <p className="text-[11px] opacity-80 mt-1 leading-relaxed">
                Deploy directly to your personal GitHub repositories, Vercel projects, and Supabase database.
              </p>
            </div>
          </button>
        </div>

        {/* Custom Mode Form */}
        {creds.mode === "custom" && (
          <div className="space-y-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 p-4 sm:p-5">
            {/* 1. GitHub Account */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-white flex items-center gap-2">
                  <Github className="size-4 text-slate-300" />
                  <span>Personal GitHub Access Token</span>
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=BizzMitra%20Autonomous%20Deployer"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  <span>Generate Token (repo scope)</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>

              <div className="flex gap-2">
                <input
                  type="password"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyGithub}
                  disabled={testingGithub || !githubInput}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {testingGithub ? <Loader2 className="size-4 animate-spin" /> : "Verify"}
                </button>
              </div>

              {creds.githubUsername && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                  {creds.githubAvatar && (
                    <img
                      src={creds.githubAvatar}
                      alt={creds.githubUsername}
                      className="size-4 rounded-full"
                    />
                  )}
                  <CheckCircle2 className="size-3.5" />
                  <span>Connected as <strong>@{creds.githubUsername}</strong></span>
                </div>
              )}
            </div>

            {/* 2. Vercel Account */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-white flex items-center gap-2">
                  <Cloud className="size-4 text-indigo-400" />
                  <span>Personal Vercel API Token</span>
                </label>
                <a
                  href="https://vercel.com/account/tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  <span>Create Vercel Token</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>

              <div className="flex gap-2">
                <input
                  type="password"
                  value={vercelInput}
                  onChange={(e) => setVercelInput(e.target.value)}
                  placeholder="vcp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyVercel}
                  disabled={testingVercel || !vercelInput}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {testingVercel ? <Loader2 className="size-4 animate-spin" /> : "Verify"}
                </button>
              </div>

              {creds.vercelUsername && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="size-3.5" />
                  <span>Connected to Vercel account: <strong>{creds.vercelTeamName || creds.vercelUsername}</strong></span>
                </div>
              )}
            </div>

            {/* 3. Supabase Database (Optional) */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-white flex items-center gap-2">
                  <Database className="size-4 text-emerald-400" />
                  <span>Personal Supabase Database (Optional)</span>
                </label>
                <span className="text-[10px] text-slate-500">Defaults to BizzMitra Cloud PostgreSQL</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="password"
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="Supabase Publishable / Anon Key"
                  className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Pinned Footer Actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-800/80 shrink-0 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Lock className="size-3" />
            Tokens stored locally in encrypted browser session
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              Save & Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
