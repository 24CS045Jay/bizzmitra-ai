import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Archive,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Database,
  Download,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Layers,
  Package,
  Printer,
  ShieldCheck,
  Sparkles,
  Zap,
  Presentation,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import {
  downloadFile,
  generateOpenApiJson,
  generatePostgreSqlDdl,
  generateTechnicalSpecMarkdown,
  generateDomainCsv,
} from "@/lib/export-engine";
import {
  exportToWordDoc,
  exportToWordDocHtml,
  exportToExcelWorkbook,
  exportToPowerPointDeck,
} from "@/lib/document-exporters";
import { getDatabaseBlueprint } from "@/lib/database-data";
import { getRoadmapForWorkspace } from "@/lib/planning-data";
import { isNative, saveAndShareFile } from "@/lib/native-bridge";
import { useStageGate } from "@/lib/workspace-stage-gate";

export const Route = createFileRoute("/workspace/export")({
  head: () => ({
    meta: [
      { title: "Universal Export Center — BizzMitra-AI" },
      {
        name: "description",
        content: "Generate and download board-ready PDFs, Word specs, Excel models, OpenAPI 3.1 schemas, and PostgreSQL DDL.",
      },
      { property: "og:title", content: "Universal Export Center — BizzMitra-AI" },
      { property: "og:description", content: "Download the complete enterprise digital transformation blueprint bundle." },
    ],
  }),
  component: ExportCenterPage,
});

export function ExportCenterPage() {
  useStageGate("export");
  const [activePreview, setActivePreview] = useState<"spec" | "openapi" | "sql">("spec");
  const [packagingProgress, setPackagingProgress] = useState<number | null>(null);

  const workspaceContext = useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("bizzmitra.workspaceContext");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const scenarioName = workspaceContext?.name ?? "Enterprise Modernization Blueprint";
  const dbBlueprint = useMemo(() => getDatabaseBlueprint(workspaceContext), [workspaceContext]);
  const roadmap = useMemo(() => getRoadmapForWorkspace(workspaceContext), [workspaceContext]);

  const openApiContent = useMemo(() => generateOpenApiJson(workspaceContext), [workspaceContext]);
  const sqlDdlContent = useMemo(() => generatePostgreSqlDdl(workspaceContext), [workspaceContext]);
  const specMarkdownContent = useMemo(() => generateTechnicalSpecMarkdown(workspaceContext), [workspaceContext]);

  const previewContent =
    activePreview === "spec"
      ? specMarkdownContent
      : activePreview === "openapi"
        ? openApiContent
        : sqlDdlContent;

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(previewContent);
    toast.success("Preview contents copied to clipboard!");
  };

  const handleDownloadSpec = () => {
    downloadFile(`${scenarioName.replace(/\s+/g, "_")}_Spec_v1.3.md`, specMarkdownContent, "text/markdown");
    toast.success("Downloaded Technical Specification (.md)");
  };

  const handleDownloadOpenApi = () => {
    downloadFile(`${scenarioName.replace(/\s+/g, "_")}_OpenAPI_v1.1.json`, openApiContent, "application/json");
    toast.success("Downloaded OpenAPI 3.1 Specification (.json)");
  };

  const handleDownloadSql = () => {
    downloadFile(`${dbBlueprint.domainId}_schema_v1.sql`, sqlDdlContent, "application/sql");
    toast.success(`Downloaded PostgreSQL 16+ DDL (${dbBlueprint.domainId}_schema_v1.sql)`);
  };

  const handleDownloadCsv = () => {
    const content = generateDomainCsv(workspaceContext);
    const filename = `${scenarioName.replace(/\s+/g, "_")}_Data.csv`;
    downloadFile(filename, content, "text/csv");
    toast.success(`Downloaded Domain Master Dataset (${filename})`);
  };

  const handlePrintPdf = () => {
    if (isNative()) {
      const docHtml = exportToWordDocHtml(scenarioName, workspaceContext);
      void saveAndShareFile(`${scenarioName.replace(/\s+/g, "_")}_Executive_Blueprint.html`, docHtml, "text/html");
      toast.success("Opened Executive Blueprint in Share Sheet");
    } else {
      window.print();
    }
  };

  const handleDownloadWord = () => {
    exportToWordDoc(scenarioName, workspaceContext);
    toast.success("Downloaded Microsoft Word Blueprint (.doc)");
  };

  const handleDownloadExcel = () => {
    exportToExcelWorkbook(scenarioName, workspaceContext);
    toast.success("Downloaded Microsoft Excel Estimates Model (.xls)");
  };

  const handleDownloadPowerPoint = () => {
    exportToPowerPointDeck(scenarioName, workspaceContext);
    toast.success("Downloaded Microsoft PowerPoint Presentation (.ppt)");
  };

  const handleDownloadCompleteBundle = () => {
    setPackagingProgress(10);
    const stages = [25, 55, 85, 100];
    let i = 0;
    const interval = setInterval(() => {
      setPackagingProgress(stages[i]!);
      i++;
      if (i >= stages.length) {
        clearInterval(interval);
        setTimeout(() => {
          setPackagingProgress(null);
          handleDownloadWord();
          setTimeout(() => handleDownloadExcel(), 300);
          setTimeout(() => handleDownloadPowerPoint(), 600);
          setTimeout(() => handleDownloadOpenApi(), 900);
          setTimeout(() => handleDownloadSql(), 1200);
          toast.success("Universal Blueprint Package successfully bundled and downloaded!");
        }, 600);
      }
    }, 450);
  };

  const formats = [
    {
      id: "pdf",
      title: "Executive PDF Blueprint",
      format: "PDF Document",
      desc: `Board-ready executive presentation for ${scenarioName} with architecture diagrams and financial ROI.`,
      badge: "Print & Export",
      action: handlePrintPdf,
      icon: Printer,
    },
    {
      id: "word",
      title: "Microsoft Word Architecture Spec",
      format: "Word Document (.doc)",
      desc: `Full editable implementation blueprint for ${scenarioName} with system requirements and domain models.`,
      badge: "Microsoft Word",
      action: handleDownloadWord,
      icon: FileText,
    },
    {
      id: "excel",
      title: "Microsoft Excel Estimates & Financial Model",
      format: "Excel Workbook (.xls)",
      desc: "Multi-sheet workbook containing sprint task estimates, cost breakdown, and ROI sensitivity analysis.",
      badge: "Multi-Sheet Excel",
      action: handleDownloadExcel,
      icon: FileSpreadsheet,
    },
    {
      id: "ppt",
      title: "Microsoft PowerPoint Executive Deck",
      format: "PowerPoint Deck (.ppt)",
      desc: "Executive slide deck with problem definition, high-level architecture, roadmap, and payback metrics.",
      badge: "PowerPoint Deck",
      action: handleDownloadPowerPoint,
      icon: Presentation,
    },
    {
      id: "openapi",
      title: "RESTful API Specification",
      format: "OpenAPI 3.1 JSON",
      desc: `Interactive endpoint schemas for ${dbBlueprint.domainId.toUpperCase()} domain entities and operations.`,
      badge: "Swagger Ready",
      action: handleDownloadOpenApi,
      icon: FileCode2,
    },
    {
      id: "sql",
      title: "PostgreSQL 16+ DDL Schema",
      format: "SQL Script",
      desc: `Production schema with ${dbBlueprint.tables.length} domain tables, GIN indexes on custom JSONB fields, and Row Level Security.`,
      badge: "Multi-Tenant RLS",
      action: handleDownloadSql,
      icon: Database,
    },
    {
      id: "csv",
      title: `${dbBlueprint.domainId.toUpperCase()} Master Domain Data`,
      format: "Excel / CSV",
      desc: `Production baseline records tailored to the active problem statement and domain schema.`,
      badge: "Live Data",
      action: handleDownloadCsv,
      icon: FileSpreadsheet,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8 pb-16">
        {/* Dynamic Blueprint Context Banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Active Blueprint Context: {scenarioName}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              Industry: <span className="font-semibold text-foreground">{workspaceContext?.industry || "Custom Enterprise"}</span> &bull; Problem Statement: <span className="font-medium text-foreground">{workspaceContext?.problemStatement || workspaceContext?.description || "Full-stack enterprise modernization and workflow engine"}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-md bg-background/80 px-2.5 py-1 text-xs font-mono font-medium border border-border/50 text-foreground">
              {dbBlueprint.domainId.toUpperCase()} ENGINE
            </span>
            <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {(dbBlueprint.tables || []).length} Tables · {(dbBlueprint.apiSpecifications || dbBlueprint.apiEndpoints || []).length} APIs
            </span>
          </div>
        </div>

        {/* Top Header Banner */}
        <Reveal className="neu p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Package className="size-3.5" />
                  Universal Export Center · Multi-Format Bundle
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  v1.3 Implementation Ready
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Universal Blueprint Deliverables & Export Center
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Download the complete enterprise digital transformation package for <strong>{scenarioName}</strong> in board-ready PDF, Word, Excel, PowerPoint, OpenAPI 3.1 JSON, domain CSV, or PostgreSQL 16 DDL.
              </p>
            </div>

            {/* One-Click Download Complete Package Button */}
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <button
                type="button"
                onClick={handleDownloadCompleteBundle}
                disabled={packagingProgress !== null}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
              >
                <Archive className="size-4" />
                {packagingProgress !== null
                  ? `Packaging Blueprint (${packagingProgress}%)...`
                  : "Download Complete Bundle (ZIP)"}
              </button>
              <span className="text-[11px] text-muted-foreground">
                Packages all 7 enterprise formats in one click
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/40 pt-6 sm:grid-cols-4">
            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                Governance Sign-Off
              </div>
              <p className="mt-1 font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
                100% Approved
              </p>
              <p className="text-[11px] text-muted-foreground">All Key Stakeholders Signed</p>
            </div>

            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Layers className="size-3.5 text-primary" />
                Export Formats
              </div>
              <p className="mt-1 font-display text-xl font-bold">7 Deliverables</p>
              <p className="text-[11px] text-muted-foreground">PDF, Word, Excel, PPT, OpenAPI, SQL, CSV</p>
            </div>

            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <FileCode2 className="size-3.5 text-blue-500" />
                Schema & API Engine
              </div>
              <p className="mt-1 font-display text-xl font-bold">{(dbBlueprint.tables || []).length} Tables · PG 16</p>
              <p className="text-[11px] text-muted-foreground">{(dbBlueprint.apiSpecifications || dbBlueprint.apiEndpoints || []).length} REST endpoints defined</p>
            </div>

            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Zap className="size-3.5 text-amber-500" />
                Delivery Velocity
              </div>
              <p className="mt-1 font-display text-xl font-bold">{(roadmap as any).targetTimelineWeeks || (roadmap as any).totalWeeks || 8} Weeks</p>
              <p className="text-[11px] text-muted-foreground">{roadmap.totalPersonDays || 70} Person-days planned</p>
            </div>
          </div>
        </Reveal>

        {/* 5 Export Format Cards Grid */}
        <Reveal className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Individual Deliverables</h2>
            <p className="text-xs text-muted-foreground">
              Click any card to trigger immediate client-side download.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {formats.map((f) => (
              <div
                key={f.id}
                onClick={f.action}
                className="neu p-5 space-y-3 cursor-pointer group hover:border-primary/50 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
                    <f.icon className="size-5" />
                  </div>
                  <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {f.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition">
                    {f.title}
                  </h3>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{f.format}</p>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="border-t border-border/30 pt-3 flex items-center justify-between text-xs font-bold text-primary">
                  <span>Download File</span>
                  <Download className="size-3.5 group-hover:translate-y-0.5 transition" />
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* In-Browser Interactive Spec Inspector */}
        <Reveal className="neu p-6 md:p-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold">Live In-Browser Spec Inspector</h2>
              <p className="text-xs text-muted-foreground">
                Inspect raw generated contracts before exporting to local disk.
              </p>
            </div>

            {/* Preview Selector Tabs & Copy Action */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-accent/40 p-1">
                {(
                  [
                    { key: "spec", label: "Technical Spec (MD)" },
                    { key: "openapi", label: "OpenAPI 3.1 JSON" },
                    { key: "sql", label: "PostgreSQL 16 DDL" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActivePreview(tab.key)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                      activePreview === tab.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyPreview}
                className="neu-sm neu-press flex items-center gap-1.5 px-3 py-1 text-xs font-semibold hover:text-primary"
              >
                <Copy className="size-3.5" />
                Copy
              </button>
            </div>
          </div>

          {/* Code View Area */}
          <div className="rounded-xl bg-muted/40 p-4 font-mono text-xs overflow-x-auto max-h-[480px] border border-border/40">
            <pre className="text-foreground/90 whitespace-pre leading-relaxed">
              {previewContent}
            </pre>
          </div>
        </Reveal>
      </div>
    </AppShell>
  );
}
