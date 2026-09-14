import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Cpu,
  Database,
  ExternalLink,
  Layers,
  Lock,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import {
  MANAGED_WORKSPACES,
  ManagedTenantWorkspace,
  SYSTEM_HEALTH_SERVICES,
  SystemHealthService,
} from "@/lib/admin-rbac-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Central Admin Console — BizzMitra-AI" },
      {
        name: "description",
        content: "Multi-tenant workspace administration, cloud system health monitor, and platform token analytics.",
      },
      { property: "og:title", content: "Central Admin Console — BizzMitra-AI" },
      { property: "og:description", content: "Enterprise administration, multi-tenant directory, and system health." },
    ],
  }),
  component: AdminConsolePage,
});

export function AdminConsolePage() {
  const [workspaces, setWorkspaces] = useState<ManagedTenantWorkspace[]>(MANAGED_WORKSPACES);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshHealth = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("System telemetry re-synchronized across all regions!");
    }, 600);
  };

  const handleToggleWorkspaceStatus = (id: string) => {
    const updated = workspaces.map((w) => {
      if (w.id === id) {
        const nextStatus = w.status === "active" ? ("archived" as const) : ("active" as const);
        toast.success(`Workspace "${w.name}" marked as ${nextStatus}`);
        return { ...w, status: nextStatus };
      }
      return w;
    });
    setWorkspaces(updated);
  };

  const handleSelectWorkspace = (w: ManagedTenantWorkspace) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bizzmitra.activeWorkspaceId", w.id);
      localStorage.setItem(
        "bizzmitra.workspaceContext",
        JSON.stringify({
          businessName: w.name,
          industry: w.industry,
          summary: `${w.name} enterprise workspace.`,
        })
      );
      toast.success(`Switched active workspace to "${w.name}"`);
    }
  };

  const filteredWorkspaces = useMemo(() => {
    if (statusFilter === "all") return workspaces;
    return workspaces.filter((w) => w.status === statusFilter);
  }, [statusFilter, workspaces]);

  return (
    <AppShell>
      <div className="space-y-8 pb-16">
        {/* Top Header Banner */}
        <Reveal className="neu p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <ShieldCheck className="size-3.5" />
                  Central Enterprise Admin Console
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  All Systems Operational (99.98%)
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Platform Administration & Multi-Tenant Directory
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Manage enterprise tenant workspaces, monitor cloud infrastructure telemetry, and inspect real-time AI token consumption across the organization.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleRefreshHealth}
                disabled={isRefreshing}
                className="neu-sm neu-press flex items-center gap-2 px-3.5 py-2 text-xs font-semibold hover:text-primary"
              >
                <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
                Sync Telemetry
              </button>
              <Link
                to="/workspace/solution/crm"
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Inspect Talent CRM
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-border/40 pt-6">
            <StaggerItem className="neu-inset p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Managed Workspaces</span>
                <Building2 className="size-4 text-primary" />
              </div>
              <p className="mt-1 font-display text-2xl font-extrabold">
                {workspaces.length} Tenants
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {workspaces.filter((w) => w.status === "active").length} Active Production
              </p>
            </StaggerItem>

            <StaggerItem className="neu-inset p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Total Artifacts</span>
                <Layers className="size-4 text-emerald-500" />
              </div>
              <p className="mt-1 font-display text-2xl font-extrabold">
                38 Generated
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Across 11 module engines
              </p>
            </StaggerItem>

            <StaggerItem className="neu-inset p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>AI Tokens Consumed</span>
                <Cpu className="size-4 text-blue-500" />
              </div>
              <p className="mt-1 font-display text-2xl font-extrabold">
                1.24 M
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Average latency: 280ms
              </p>
            </StaggerItem>

            <StaggerItem className="neu-inset p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Security Governance</span>
                <Lock className="size-4 text-amber-500" />
              </div>
              <p className="mt-1 font-display text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                Enforced
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                PostgreSQL RLS Active
              </p>
            </StaggerItem>
          </Stagger>
        </Reveal>

        {/* Cloud Infrastructure & System Health Services */}
        <Reveal className="neu p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold">Cloud Infrastructure Telemetry</h2>
              <p className="text-xs text-muted-foreground">
                Real-time health status, P95 network latency, and availability metrics across global cluster nodes.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Uptime SLA: 99.98%
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SYSTEM_HEALTH_SERVICES.map((srv) => (
              <div key={srv.name} className="neu-inset p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground leading-snug">{srv.name}</span>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {srv.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>Latency: <strong className="text-foreground font-mono">{srv.latencyMs}ms</strong></span>
                  <span>Uptime: <strong className="text-foreground font-mono">{srv.uptimePct}%</strong></span>
                </div>

                <div className="text-[10px] text-muted-foreground border-t border-border/20 pt-1.5 flex justify-between">
                  <span>Cluster Region:</span>
                  <span className="font-medium text-foreground">{srv.region}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Multi-Tenant Workspaces Directory Table */}
        <Reveal className="neu p-6 md:p-8 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold">Managed Multi-Tenant Workspaces</h2>
              <p className="text-xs text-muted-foreground">
                Directory of provisioned customer environments with versioning and transformation maturity scores.
              </p>
            </div>

            {/* Status Filters */}
            <div className="flex gap-1.5">
              {(["all", "active", "archived"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
                    statusFilter === st
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "neu-sm hover:text-primary"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground">
                  <th className="pb-3 font-bold">Tenant Workspace</th>
                  <th className="pb-3 font-bold">Industry Sector</th>
                  <th className="pb-3 font-bold">Primary Owner</th>
                  <th className="pb-3 font-bold">Blueprint Version</th>
                  <th className="pb-3 font-bold">Maturity Score</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredWorkspaces.map((w) => (
                  <tr key={w.id} className="hover:bg-muted/30 transition">
                    <td className="py-3.5 pr-3">
                      <div>
                        <span className="font-bold text-foreground">{w.name}</span>
                        <p className="text-[10px] font-mono text-muted-foreground">{w.id}</p>
                      </div>
                    </td>
                    <td className="py-3.5 pr-3 text-muted-foreground">{w.industry}</td>
                    <td className="py-3.5 pr-3">
                      <span className="font-medium text-foreground">{w.ownerName}</span>
                      <p className="text-[10px] text-muted-foreground">{w.ownerEmail}</p>
                    </td>
                    <td className="py-3.5 pr-3">
                      <span className="rounded bg-accent px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
                        {w.version}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{w.maturityScore}%</span>
                        <div className="h-1.5 w-14 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${w.maturityScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          w.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleSelectWorkspace(w)}
                        className="neu-sm neu-press px-2.5 py-1 text-[11px] font-semibold text-primary"
                      >
                        Switch To
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleWorkspaceStatus(w.id)}
                        className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
                      >
                        {w.status === "active" ? "Archive" : "Restore"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </AppShell>
  );
}
