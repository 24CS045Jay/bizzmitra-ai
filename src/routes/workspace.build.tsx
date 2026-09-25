import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  Rocket,
  Code2,
  Play,
  Download,
  Github,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FolderTree,
  QrCode,
  Terminal,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { scaffoldApplication, GeneratedAppProject } from "@/lib/builder/app-scaffolder";
import {
  deployProjectToCloud,
  downloadProjectZip,
  exportToGitHub,
  checkServerCloudStatus,
  DeploymentProgressLog,
  DeploymentResult,
} from "@/lib/builder/deploy-service";
import { InteractiveAppSandbox } from "@/components/builder/InteractiveAppSandbox";
import { AiUiRefinementBar } from "@/components/builder/AiUiRefinementBar";
import {
  AppUiCustomization,
  loadUiCustomization,
  saveUiCustomization,
} from "@/lib/builder/ui-customization-store";
import { VirtualCodeExplorer } from "@/components/builder/VirtualCodeExplorer";
import { DeploymentTerminalModal } from "@/components/builder/DeploymentTerminalModal";
import { LiveAppQrCode } from "@/components/builder/LiveAppQrCode";
import { CloudAccountsModal } from "@/components/builder/CloudAccountsModal";
import { DeployTargetConfirmModal } from "@/components/builder/DeployTargetConfirmModal";
import { CloudCredentials, loadCloudCredentials } from "@/lib/builder/cloud-credentials-store";
import { cn } from "@/lib/utils";
import { Cloud, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/workspace/build")({
  head: () => ({
    meta: [
      {
        title: "Software Studio & 1-Click Launchpad | BizzMitra AI",
      },
    ],
  }),
  component: WorkspaceBuildPage,
});

function WorkspaceBuildPage() {
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "spec">("preview");
  const [workspaceContext, setWorkspaceContext] = useState<any>(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("bizzmitra.workspaceContext");
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {}
    return {};
  });
  const [uiCustomization, setUiCustomization] = useState<AppUiCustomization>(() => loadUiCustomization());
  const [project, setProject] = useState<GeneratedAppProject>(() => {
    const cust = loadUiCustomization();
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("bizzmitra.workspaceContext");
        if (raw) {
          const parsed = JSON.parse(raw);
          return scaffoldApplication(parsed, cust);
        }
      }
    } catch (e) {
      // fallback
    }
    return scaffoldApplication({}, cust);
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<DeploymentProgressLog[]>([]);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [isAlreadyDeployedModalOpen, setIsAlreadyDeployedModalOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);
  const [lastPushedAt, setLastPushedAt] = useState<string | null>(null);
  const [isExportingGit, setIsExportingGit] = useState(false);
  const [isVerifyingRepo, setIsVerifyingRepo] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"deploy" | "github">("deploy");
  const [cloudCreds, setCloudCreds] = useState<CloudCredentials>(() => loadCloudCredentials());

  const isAlreadyDeployed = Boolean(deploymentResult?.success && deploymentResult?.liveUrl);

  // Sync workspace context from localStorage or active database workspace
  useEffect(() => {
    const syncContext = async () => {
      try {
        let parsed: any = {};
        const raw = localStorage.getItem("bizzmitra.workspaceContext");
        if (raw) parsed = JSON.parse(raw);

        const activeWsId = localStorage.getItem("bizzmitra.activeWorkspaceId");
        if (activeWsId && !activeWsId.startsWith("ws-") && (!parsed.problemStatement || !parsed.businessName)) {
          const { data: ws } = await supabase
            .from("workspaces")
            .select("problem_statement, name, industry")
            .eq("id", activeWsId)
            .maybeSingle();

          if (ws) {
            parsed = {
              ...parsed,
              businessName: ws.name || parsed.businessName,
              problemStatement: ws.problem_statement || parsed.problemStatement,
              industry: ws.industry || parsed.industry,
            };
          }
        }

        setWorkspaceContext(parsed);
        const compiled = scaffoldApplication(parsed, uiCustomization);
        setProject(compiled);
      } catch (e) {
        console.error("Failed to load workspace context", e);
      }
    };

    syncContext();

    const handleWorkspaceUpdate = () => {
      syncContext();
    };

    window.addEventListener("bizzmitra:workspace-updated", handleWorkspaceUpdate);
    window.addEventListener("bizzmitra:workspace-changed", handleWorkspaceUpdate);
    window.addEventListener("storage", handleWorkspaceUpdate);

    return () => {
      window.removeEventListener("bizzmitra:workspace-updated", handleWorkspaceUpdate);
      window.removeEventListener("bizzmitra:workspace-changed", handleWorkspaceUpdate);
      window.removeEventListener("storage", handleWorkspaceUpdate);
    };
  }, []);

  // Sync isolated GitHub repository URL and deployment state strictly for the current project
  useEffect(() => {
    if (typeof window === "undefined" || !project.projectName) return;
    try {
      const activeWsId = localStorage.getItem("bizzmitra.activeWorkspaceId");
      const projectKey = `bizzmitra.githubUrl_${project.projectName}`;
      const projectTimeKey = `bizzmitra.githubLastPushedAt_${project.projectName}`;
      const wsKey = activeWsId ? `bizzmitra.githubUrl_${activeWsId}` : null;
      const wsTimeKey = activeWsId ? `bizzmitra.githubLastPushedAt_${activeWsId}` : null;

      // Check project-specific or workspace-specific repository
      const savedProjectUrl = localStorage.getItem(projectKey) || (wsKey ? localStorage.getItem(wsKey) : null);
      const savedProjectTime = localStorage.getItem(projectTimeKey) || (wsTimeKey ? localStorage.getItem(wsTimeKey) : null);

      if (savedProjectUrl) {
        // Prevent Apex Logistics repo URL from leaking into other distinct problem statements
        const isSavedApex =
          savedProjectUrl.toLowerCase().includes("bizzmitra-logistics") ||
          savedProjectUrl.toLowerCase().includes("apex");
        const isCurrentProjectApex =
          project.projectName.toLowerCase().includes("apex") ||
          project.appTitle.toLowerCase().includes("apex");

        if (isSavedApex && !isCurrentProjectApex) {
          // Cross-project contamination detected: reset to unpushed state
          setGithubUrl(null);
          setLastPushedAt(null);
        } else {
          setGithubUrl(savedProjectUrl);
          setLastPushedAt(savedProjectTime || null);
        }
      } else {
        setGithubUrl(null);
        setLastPushedAt(null);
      }

      // Check project-specific deployment result (Strictly isolated by projectName)
      const projectDepKey = `bizzmitra.deploymentResult_${project.projectName}`;
      const savedDep = localStorage.getItem(projectDepKey);
      if (savedDep) {
        try {
          const parsed = JSON.parse(savedDep);
          if (parsed && (parsed.projectName === project.projectName || !parsed.projectName)) {
            setDeploymentResult(parsed);
          } else {
            setDeploymentResult(null);
          }
        } catch {
          setDeploymentResult(null);
        }
      } else {
        setDeploymentResult(null);
      }
    } catch (e) {}
  }, [project.projectName]);

  const executeDeploy = async (forceManaged = false) => {
    setIsDeploying(true);
    setIsModalOpen(true);

    // Re-scaffold with current context and customization right before deploying
    const latestProject = scaffoldApplication({
      ...workspaceContext,
      solutionTitle: uiCustomization.appTitle || workspaceContext.solutionTitle,
    }, uiCustomization);
    setProject(latestProject);

    const res = await deployProjectToCloud(
      latestProject,
      (logs) => {
        setDeploymentLogs(logs);
      },
      { forceManaged }
    );

    setDeploymentResult(res);
    setIsDeploying(false);

    if (res.success) {
      toast.success("🚀 Live Cloud Deployment Successful!");
      try {
        const activeWsId = localStorage.getItem("bizzmitra.activeWorkspaceId");
        localStorage.setItem(`bizzmitra.deploymentResult_${project.projectName}`, JSON.stringify(res));
        localStorage.setItem(`bizzmitra.isDeployed_${project.projectName}`, "true");
        if (activeWsId) {
          localStorage.setItem(`bizzmitra.deploymentResult_${activeWsId}`, JSON.stringify(res));
          localStorage.setItem(`bizzmitra.isDeployed_${activeWsId}`, "true");
        }
      } catch (e) {}
    } else {
      toast.error(res.error || "Deployment encountered an issue.");
    }
  };

  const handleDeploy = () => {
    // If project is already deployed once, do NOT deploy again.
    // Instead, suggest pushing the latest code to GitHub so it automatically updates!
    if (isAlreadyDeployed) {
      setIsAlreadyDeployedModalOpen(true);
      toast.info("Project is already deployed! Push latest code to GitHub to automatically update the live link.");
      return;
    }

    const creds = loadCloudCredentials();
    const hasPersonalTokens = Boolean(creds.vercelToken || creds.githubToken);
    if (hasPersonalTokens) {
      setPendingAction("deploy");
      setIsConfirmModalOpen(true);
    } else {
      executeDeploy(false);
    }
  };

  const handleDownloadZip = async () => {
    try {
      toast.info("Packaging project into .ZIP bundle...");
      await downloadProjectZip(project);
      toast.success("Download started!");
    } catch (err: any) {
      toast.error("Failed to download zip: " + err.message);
    }
  };

  const executeExportGitHub = async (forceManaged = false) => {
    setIsExportingGit(true);
    const isUpdate = Boolean(githubUrl);
    toast.info(isUpdate ? "Pushing latest changes to GitHub..." : "Creating repository on GitHub...");

    // Re-scaffold to ensure any customizations, prompt refinements, or blueprint updates are included
    const latestProject = scaffoldApplication({
      ...workspaceContext,
      solutionTitle: uiCustomization.appTitle || workspaceContext.solutionTitle,
    }, uiCustomization);
    setProject(latestProject);

    const res = await exportToGitHub(latestProject, { forceManaged });
    setIsExportingGit(false);

    if (res.success && res.repoUrl) {
      setGithubUrl(res.repoUrl);
      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLastPushedAt(timeStr);
      try {
        const activeWsId = localStorage.getItem("bizzmitra.activeWorkspaceId");
        const projectKey = `bizzmitra.githubUrl_${latestProject.projectName}`;
        const projectTimeKey = `bizzmitra.githubLastPushedAt_${latestProject.projectName}`;
        localStorage.setItem(projectKey, res.repoUrl);
        localStorage.setItem(projectTimeKey, timeStr);
        if (activeWsId) {
          localStorage.setItem(`bizzmitra.githubUrl_${activeWsId}`, res.repoUrl);
          localStorage.setItem(`bizzmitra.githubLastPushedAt_${activeWsId}`, timeStr);
        }
      } catch (e) {}

      if (res.isUpdate || isUpdate) {
        toast.success(`Successfully pushed latest changes to GitHub! (${res.fileCount || "All"} files synced)`);
        if (isAlreadyDeployed) {
          toast.info("⚡ Live deployed link will automatically update with these new GitHub changes.");
        }
      } else {
        toast.success("Repository created and pushed to GitHub!");
        if (isAlreadyDeployed) {
          toast.info("⚡ Live deployed link will automatically sync with this GitHub repo.");
        }
        window.open(res.repoUrl, "_blank");
      }
    } else {
      const isCredentialError =
        res.code === "MISSING_GITHUB_TOKEN" ||
        res.code === "INVALID_GITHUB_TOKEN" ||
        res.error?.toLowerCase().includes("credential") ||
        res.error?.toLowerCase().includes("token") ||
        res.error?.toLowerCase().includes("auth") ||
        res.error?.toLowerCase().includes("bad credentials");

      if (isCredentialError) {
        toast.error(
          res.error || "GitHub Personal Access Token required to push repositories.",
          {
            duration: 8000,
            action: {
              label: "Connect GitHub",
              onClick: () => setIsCloudModalOpen(true),
            },
          }
        );
        setIsCloudModalOpen(true);
      } else {
        toast.error(res.error || "Failed to push to GitHub.");
      }
    }
  };

  const handleViewRepo = async () => {
    const isSavedApex = Boolean(
      githubUrl &&
        (githubUrl.toLowerCase().includes("bizzmitra-logistics") ||
          githubUrl.toLowerCase().includes("apex"))
    );
    const isCurrentProjectApex =
      project.projectName.toLowerCase().includes("apex") ||
      project.appTitle.toLowerCase().includes("apex");

    // If no repo exists OR if current repo URL belongs to Apex for a non-Apex problem statement:
    if (!githubUrl || (isSavedApex && !isCurrentProjectApex)) {
      toast.info(`Creating dedicated GitHub repository for "${project.appTitle}"...`);
      await executeExportGitHub(false);
      return;
    }

    setIsVerifyingRepo(true);
    try {
      const verifyRes = await fetch(`/api/github/check?repoUrl=${encodeURIComponent(githubUrl)}`);
      const verifyData = await verifyRes.json();

      if (!verifyData.exists) {
        toast.info("GitHub repository not found (404). Creating repository and pushing all project files now...");
        setIsVerifyingRepo(false);
        await executeExportGitHub(false);
        return;
      }
    } catch (e) {
      // If check fails, allow opening
    } finally {
      setIsVerifyingRepo(false);
    }

    window.open(githubUrl, "_blank");
  };

  const handleExportGitHub = async () => {
    const creds = loadCloudCredentials();
    const hasPersonalTokens = Boolean(creds.githubToken);
    if (hasPersonalTokens) {
      setPendingAction("github");
      setIsConfirmModalOpen(true);
    } else {
      // Check if server deployment environment has managed GitHub credentials configured
      const serverStatus = await checkServerCloudStatus();
      if (!serverStatus.hasManagedGithub) {
        toast.info("Please connect your GitHub account to push repositories.", {
          duration: 6000,
          action: {
            label: "Connect",
            onClick: () => setIsCloudModalOpen(true),
          },
        });
        setIsCloudModalOpen(true);
        return;
      }
      executeExportGitHub(false);
    }
  };

  const handleRegenerate = () => {
    toast.info("Re-compiling application code from blueprint...");
    setTimeout(() => {
      let ctx: any = {};
      try {
        const raw = localStorage.getItem("bizzmitra.workspaceContext");
        if (raw) ctx = JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse context for regeneration", e);
      }
      setProject(
        scaffoldApplication({
          ...ctx,
          businessName: ctx.businessName,
          industry: ctx.industry,
          problemStatement: ctx.problemStatement || ctx.description,
          solutionTitle: uiCustomization.appTitle || ctx.solutionTitle || ctx.name,
          goals: ctx.goals,
          constraints: ctx.constraints || ctx.constraints_text,
          intakeMode: ctx.intakeMode || ctx.intake_mode,
          intakeMethod: ctx.intakeMethod || ctx.intake_method,
          language: ctx.language || ctx.language_code,
          sourceDetails: ctx.sourceDetails,
          createdAt: ctx.createdAt || ctx.created_at,
        }, uiCustomization)
      );
      toast.success("Application code synthesized cleanly!");
    }, 600);
  };

  const liveUrl = deploymentResult?.liveUrl || null;

  return (
    <AppShell>
      <div className="space-y-6 pb-20">
        {/* Header with Navigation Breadcrumbs & Stage Progress */}
        <ArtifactHeader
          id="solution"
          title="Software Studio & 1-Click Launchpad"
          kicker="Stage 5 · Working Software"
          onRegenerate={handleRegenerate}
        />

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border/70 p-3 rounded-2xl shadow-xs">
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Synthesis Engine:</span> Autonomous Blueprint to Production Web Application
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="Re-synthesize code from blueprint"
            >
              <RefreshCw className="size-3.5" />
              <span className="hidden sm:inline">Regenerate Code</span>
            </button>

            <button
              onClick={handleDownloadZip}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent transition cursor-pointer"
              title="Download Standalone .ZIP"
            >
              <Download className="size-3.5 text-primary" />
              <span>Download .ZIP</span>
            </button>

            {githubUrl ? (
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={handleExportGitHub}
                  disabled={isExportingGit}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
                  title="Push latest changes and modifications to your GitHub repository"
                >
                  {isExportingGit ? (
                    <Loader2 className="size-3.5 animate-spin text-white" />
                  ) : (
                    <UploadCloud className="size-3.5 text-white" />
                  )}
                  <span>{isExportingGit ? "Pushing Latest..." : "Push Latest to GitHub"}</span>
                  {lastPushedAt && (
                    <span className="hidden sm:inline font-mono text-[10px] text-indigo-200 bg-indigo-700/60 px-1.5 py-0.2 rounded">
                      {lastPushedAt}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleViewRepo}
                  disabled={isVerifyingRepo || isExportingGit}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                  title="Open Repository on GitHub (Verifies existence)"
                >
                  {isVerifyingRepo ? (
                    <Loader2 className="size-3.5 animate-spin text-indigo-400" />
                  ) : (
                    <Github className="size-3.5" />
                  )}
                  <span className="hidden md:inline">{isVerifyingRepo ? "Verifying..." : "View Repo"}</span>
                  <ExternalLink className="size-3 text-slate-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleExportGitHub}
                disabled={isExportingGit}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent transition cursor-pointer disabled:opacity-50"
                title="Create GitHub Repository and Push Code"
              >
                {isExportingGit ? (
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                ) : (
                  <Github className="size-3.5" />
                )}
                <span>{isExportingGit ? "Creating Repo..." : "🐙 Push to GitHub"}</span>
              </button>
            )}

            <button
              onClick={() => {
                const targetUrl = typeof window !== "undefined"
                  ? `${window.location.origin}/preview/solution`
                  : "/preview/solution";
                window.open(targetUrl, "_blank");
              }}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold shadow-md transition cursor-pointer"
              title="Launch standalone full-screen website in new tab"
            >
              <ExternalLink className="size-3.5" />
              <span>Open in New Tab</span>
            </button>

            <button
              onClick={() => setIsCloudModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-2 text-xs font-semibold transition cursor-pointer"
              title="Configure Cloud Deployment Mode & Personal Tokens"
            >
              <Cloud className="size-3.5" />
              <span>
                {cloudCreds.mode === "custom"
                  ? `BYOC: @${cloudCreds.githubUsername || "Custom"}`
                  : "Cloud: Managed"}
              </span>
            </button>

            {isAlreadyDeployed ? (
              <button
                onClick={handleDeploy}
                className="flex items-center gap-2 rounded-xl bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600/30 text-emerald-300 px-4 py-2 text-xs font-bold transition cursor-pointer shadow-md"
                title="Project is already live. Click to view GitHub auto-sync guidance"
              >
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>⚡ Deployed & Live · Push to Update</span>
              </button>
            ) : (
              <button
                onClick={handleDeploy}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:brightness-110 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
              >
                <Rocket className="size-4 animate-bounce" />
                <span>🚀 1-Click Deploy to Cloud</span>
              </button>
            )}
          </div>
        </div>

        {/* Live System Banner if deployed */}
        {liveUrl && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="relative flex size-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-3 bg-emerald-500"></span>
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Live Production System Active
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[10px] font-mono text-emerald-600 dark:text-emerald-300">
                    Auto-Sync via GitHub Active
                  </span>
                </div>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-mono font-bold text-foreground hover:underline inline-flex items-center gap-1.5 mt-0.5"
                >
                  <span>{liveUrl}</span>
                  <ExternalLink className="size-3.5 text-primary" />
                </a>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Pushing latest code to GitHub automatically rebuilds and updates this permanent live link.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={handleExportGitHub}
                disabled={isExportingGit}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25 px-3 py-1.5 text-xs font-bold text-indigo-400 transition cursor-pointer"
                title="Push latest changes to GitHub to update live website"
              >
                <UploadCloud className="size-3.5" />
                <span>Push Updates to Live</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition cursor-pointer"
              >
                <QrCode className="size-3.5 text-emerald-500" />
                <span>View Mobile QR</span>
              </button>
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow transition cursor-pointer"
              >
                <span>Launch Live System</span>
                <ArrowRight className="size-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-border/80 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("preview")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer",
                activeTab === "preview"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Play className="size-3.5" />
              <span>Live Interactive App</span>
            </button>

            <button
              onClick={() => setActiveTab("code")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer",
                activeTab === "code"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Code2 className="size-3.5" />
              <span>Virtual Code Explorer ({Object.keys(project.files).length} Files)</span>
            </button>

            <button
              onClick={() => setActiveTab("spec")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer",
                activeTab === "spec"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Layers className="size-3.5" />
              <span>Cloud Architecture & Specs</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>Pre-validated with TypeScript 5 & Vite</span>
          </div>
        </div>

        {/* Tab 1: Live Interactive Sandbox */}
        {activeTab === "preview" && (
          <div className="space-y-4">
            <AiUiRefinementBar
              customization={uiCustomization}
              onChange={(updated) => {
                setUiCustomization(updated);
                saveUiCustomization(updated);
                const updatedProject = scaffoldApplication({
                  ...workspaceContext,
                  solutionTitle: updated.appTitle || workspaceContext.solutionTitle,
                }, updated);
                setProject(updatedProject);
              }}
            />
            <InteractiveAppSandbox
              appTitle={uiCustomization.appTitle || project.appTitle}
              context={workspaceContext}
              liveUrl={
                liveUrl ||
                (typeof window !== "undefined" ? `${window.location.origin}/preview/solution` : null)
              }
              onOpenStandalone={() => {
                const targetUrl = typeof window !== "undefined"
                  ? `${window.location.origin}/preview/solution`
                  : "/preview/solution";
                window.open(targetUrl, "_blank");
              }}
              customization={uiCustomization}
            />
          </div>
        )}

        {/* Tab 2: Code Explorer */}
        {activeTab === "code" && (
          <div className="h-[650px]">
            <VirtualCodeExplorer
              files={project.files}
              projectName={project.projectName}
              onDownloadZip={handleDownloadZip}
            />
          </div>
        )}

        {/* Tab 3: Cloud Architecture & Deployment Specs */}
        {activeTab === "spec" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-bold text-foreground">Deployment Specification</h3>
                  <span className="text-xs font-mono text-primary font-semibold">Vercel Edge v13 API</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-accent/40 border border-border/60">
                    <span className="text-muted-foreground">Application ID</span>
                    <div className="font-mono font-bold text-foreground mt-1">{project.projectName}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-accent/40 border border-border/60">
                    <span className="text-muted-foreground">Runtime Engine</span>
                    <div className="font-mono font-bold text-foreground mt-1">Vite + React 18 + Node.js Edge</div>
                  </div>
                  <div className="p-3 rounded-xl bg-accent/40 border border-border/60">
                    <span className="text-muted-foreground">Data Storage</span>
                    <div className="font-mono font-bold text-foreground mt-1">Reactive In-Memory + LocalStorage</div>
                  </div>
                  <div className="p-3 rounded-xl bg-accent/40 border border-border/60">
                    <span className="text-muted-foreground">SSL / TLS Protocol</span>
                    <div className="font-mono font-bold text-emerald-500 mt-1">Auto Wildcard Edge HTTPS</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Virtual File Tree Manifest
                  </h4>
                  <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
                    {Object.keys(project.files).map((f) => (
                      <div key={f} className="flex items-center justify-between text-slate-400">
                        <span>├── {f}</span>
                        <span className="text-[10px] text-slate-600">
                          {project.files[f]?.length || 0} bytes
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile QR & Handover Card */}
            <div className="space-y-4">
              <LiveAppQrCode
                url={liveUrl}
                appName={project.appTitle}
                onDeploy={handleDeploy}
              />

              <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-sm text-xs">
                <h4 className="font-bold text-foreground">Ready for Investor / Judge Demo</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Judges can test both the in-browser interactive preview or scan the QR code to open the live system on their smartphones with zero setup.
                </p>
                <div className="pt-2">
                  {isAlreadyDeployed ? (
                    <button
                      onClick={handleDeploy}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 py-2.5 font-bold transition cursor-pointer shadow"
                    >
                      <CheckCircle2 className="size-4 text-emerald-400" />
                      <span>Live Deployed · Push to Update</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleDeploy}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 font-bold hover:brightness-105 transition cursor-pointer shadow"
                    >
                      <Rocket className="size-4" />
                      <span>Deploy to Cloud</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deployment Modal */}
        <DeploymentTerminalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          logs={deploymentLogs}
          isDeploying={isDeploying}
          result={deploymentResult}
          projectName={project.projectName}
          onExportGitHub={handleExportGitHub}
          onDownloadZip={handleDownloadZip}
          githubUrl={githubUrl}
        />

        {/* Cloud Accounts & BYOC Settings Modal */}
        <CloudAccountsModal
          isOpen={isCloudModalOpen}
          onClose={() => setIsCloudModalOpen(false)}
          onSaved={(newCreds) => setCloudCreds(newCreds)}
        />

        {/* Pre-Flight Deployment Destination Confirmation Modal */}
        <DeployTargetConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          credentials={cloudCreds}
          actionType={pendingAction}
          isUpdate={Boolean(githubUrl)}
          onConfirmContinue={() => {
            setIsConfirmModalOpen(false);
            if (pendingAction === "deploy") {
              executeDeploy(false);
            } else {
              executeExportGitHub(false);
            }
          }}
          onSwitchAccount={() => {
            setIsConfirmModalOpen(false);
            setIsCloudModalOpen(true);
          }}
          onUseManaged={() => {
            setIsConfirmModalOpen(false);
            if (pendingAction === "deploy") {
              executeDeploy(true);
            } else {
              executeExportGitHub(true);
            }
          }}
        />

        {/* Already Deployed & GitHub Auto-Sync Guidance Modal */}
        {isAlreadyDeployedModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-950 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">Project Already Deployed!</h3>
                      <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[9px] font-mono font-bold">
                        Live Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No need to deploy again — updates automatically reflect via GitHub
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAlreadyDeployedModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Active Deployed URL Box */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Current Live Deployed URL
                  </div>
                  <a
                    href={liveUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono font-bold text-emerald-400 hover:underline truncate block mt-0.5"
                  >
                    {liveUrl}
                  </a>
                </div>
                <a
                  href={liveUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition cursor-pointer"
                >
                  <span>Visit</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>

              {/* Step-by-Step Auto Deployment Explanation */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-indigo-400" />
                  <span>How Updates Work (Zero Redeploy Needed):</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className="size-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] flex items-center justify-center font-bold">1</span>
                      <span>Edit & Refine</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Modify UI themes, layout orientation, or records in Studio.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-indigo-500/40 bg-indigo-950/20 space-y-1">
                    <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <span className="size-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                      <span>Push to GitHub</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Click <strong>Push to GitHub</strong> to sync your latest commits.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-emerald-500/40 bg-emerald-950/20 space-y-1">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <span className="size-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                      <span>Auto Live Sync!</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Live website updates immediately without a new link.
                    </p>
                  </div>
                </div>
              </div>

              {/* Informative Guidance Notice */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2.5">
                <UploadCloud className="size-4 text-indigo-400 mt-0.5 shrink-0" />
                <p className="leading-relaxed text-[11px]">
                  Manual re-deployments create duplicate server instances. By pushing to GitHub, continuous deployment immediately builds and serves your newest modifications to the existing link.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setIsAlreadyDeployedModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsAlreadyDeployedModalOpen(false);
                    handleExportGitHub();
                  }}
                  disabled={isExportingGit}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-4 py-2 text-xs font-bold shadow-lg shadow-indigo-500/30 transition cursor-pointer disabled:opacity-50"
                >
                  {isExportingGit ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="size-3.5" />
                  )}
                  <span>{isExportingGit ? "Pushing to GitHub..." : "🐙 Push Latest to GitHub Now"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
