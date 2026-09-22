import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Check,
  Code2,
  Copy,
  Database,
  Download,
  FileCode,
  Key,
  Layers,
  Network,
  ShieldCheck,
  Sparkles,
  Table as TableIcon,
  Terminal,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { Mermaid } from "@/components/Mermaid";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import {
  DatabaseBlueprint,
  getDatabaseBlueprint,
  TableDef,
} from "@/lib/database-data";
import { useStageGate, StageNextButton } from "@/lib/workspace-stage-gate";

export const Route = createFileRoute("/workspace/data")({
  head: () => ({
    meta: [
      { title: "Database & API Designer — BizzMitra-AI" },
      {
        name: "description",
        content: "Entity-Relationship model, PostgreSQL DDL schema, and RESTful API specifications.",
      },
      { property: "og:title", content: "Database & API Designer — BizzMitra-AI" },
      {
        property: "og:description",
        content: "PostgreSQL DDL, multi-tenant RLS schema, and RESTful API endpoints derived from architecture.",
      },
    ],
  }),
  component: DataPage,
});

type MainTab = "erd" | "tables" | "ddl" | "api";

const METHOD_BADGES: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  POST: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  PUT: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  DELETE: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
  PATCH: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

function DataPage() {
  useStageGate("data");
  const [activeTab, setActiveTab] = useState<MainTab>("erd");
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedCurlIndex, setCopiedCurlIndex] = useState<number | null>(null);
  const [activeApiCategory, setActiveApiCategory] = useState<string>("All");
  const [workspaceContext, setWorkspaceContext] = useState<{
    businessName: string;
    industry: string;
  }>({
    businessName: "TalentCraft HR Consultancy",
    industry: "HR & Recruitment Services",
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        const parsed = JSON.parse(raw);
        setWorkspaceContext({
          businessName: parsed.businessName || "TalentCraft HR Consultancy",
          industry: parsed.industry || "HR & Recruitment Services",
        });
      }
    } catch {}
  }, []);

  const blueprint: DatabaseBlueprint = useMemo(
    () => getDatabaseBlueprint(workspaceContext),
    [workspaceContext]
  );

  const [selectedTable, setSelectedTable] = useState<TableDef>(
    blueprint.tables[1] ?? blueprint.tables[0]!
  );

  // Synchronize selected table and active category when domain blueprint switches
  useEffect(() => {
    if (blueprint.tables.length > 0) {
      setSelectedTable(blueprint.tables[0]!);
    }
    setActiveApiCategory("All");
  }, [blueprint.domainId]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(blueprint.ddlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([blueprint.ddlSchema], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${blueprint.domainId}_schema_v1.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCurl = (curl: string, index: number) => {
    navigator.clipboard.writeText(curl);
    setCopiedCurlIndex(index);
    setTimeout(() => setCopiedCurlIndex(null), 2000);
  };

  const filteredApis =
    activeApiCategory === "All"
      ? blueprint.apiSpecifications
      : blueprint.apiSpecifications.filter((api) => api.category === activeApiCategory);

  return (
    <AppShell>
      <ArtifactHeader id="data" kicker="Step 07" title="Database & API Designer" />

      {/* Blueprint Context Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">Data Architecture Context:</span>
          <span className="font-bold text-foreground">{workspaceContext.businessName}</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
            {workspaceContext.industry}
          </span>
        </div>
        <Link to="/workspace/process" className="font-medium text-primary hover:underline">
          View BPMN Process Intelligence →
        </Link>
      </div>

      <GenerationSequence steps={GENERATION_STEPS.data} run={() => generateArtifact("data")}>
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="neu p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Database Tables
                </span>
                <div className="mt-1 font-display text-2xl font-bold text-foreground">
                  {blueprint.metrics.tableCount}
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">PostgreSQL 16+ RLS</span>
              </div>
              <div className="neu p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  REST Endpoints
                </span>
                <div className="mt-1 font-display text-2xl font-bold text-foreground">
                  {blueprint.metrics.apiCount}
                </div>
                <span className="text-[10px] text-sky-600 font-medium">OpenAPI 3.1 Ready</span>
              </div>
              <div className="neu p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Multi-Tenancy
                </span>
                <div className="mt-1 font-display text-2xl font-bold text-emerald-600">
                  {blueprint.metrics.multiTenancy}
                </div>
                <span className="text-[10px] text-muted-foreground">Row Policies Active</span>
              </div>
              <div className="neu p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Compliance
                </span>
                <div className="mt-1 font-display text-2xl font-bold text-indigo-600">
                  {blueprint.metrics.compliance}
                </div>
                <span className="text-[10px] text-muted-foreground">Immutable Audit Trail</span>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("erd")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === "erd"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "neu hover:bg-accent/40"
                  }`}
                >
                  <Network className="h-3.5 w-3.5" />
                  Entity-Relationship Diagram
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tables")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === "tables"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "neu hover:bg-accent/40"
                  }`}
                >
                  <TableIcon className="h-3.5 w-3.5" />
                  Table Schema Dictionary
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ddl")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === "ddl"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "neu hover:bg-accent/40"
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5" />
                  PostgreSQL DDL Script
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("api")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === "api"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "neu hover:bg-accent/40"
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  RESTful API Specifications
                </button>
              </div>

              {activeTab === "ddl" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent/40 transition-colors"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        Copied DDL!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy SQL
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSql}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download .sql
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: ERD */}
          {activeTab === "erd" && (
            <motion.div
              key="erd"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="neu p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-3">
                  <div>
                    <h2 className="font-display text-base font-bold flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      Relational Data Architecture (ERD) — {blueprint.domainTitle}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Production-grade entity-relationship model with primary keys, foreign constraints, and cardinality.
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    Crow's Foot Notation
                  </span>
                </div>
                <div className="mt-5 overflow-x-auto rounded-xl bg-background/60 p-4 shadow-inner">
                  <Mermaid key={`${blueprint.domainId}-erd`} chart={blueprint.erdDiagram} />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: Table Dictionary */}
          {activeTab === "tables" && (
            <motion.div
              key="tables"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 gap-6 lg:grid-cols-4"
            >
              {/* Sidebar Tables List */}
              <div className="neu space-y-2 p-4 lg:col-span-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Database Tables ({blueprint.tables.length})
                </h3>
                <div className="space-y-1.5 pt-2">
                  {blueprint.tables.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTable(t)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                        selectedTable.id === t.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-accent/40 text-foreground"
                      }`}
                    >
                      <span className="font-mono">{t.name}</span>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${
                          selectedTable.id === t.id
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Schema Details */}
              <div className="neu p-6 lg:col-span-3">
                <div className="flex flex-wrap items-center justify-between border-b border-border/30 pb-3">
                  <div>
                    <h3 className="font-mono text-base font-bold text-foreground">
                      Table: {selectedTable.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedTable.description}
                    </p>
                  </div>
                  <span className="rounded-md border border-border/40 bg-background/80 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                    {selectedTable.columns.length} columns defined
                  </span>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground">
                        <th className="pb-2 font-semibold">Column Name</th>
                        <th className="pb-2 font-semibold">Data Type</th>
                        <th className="pb-2 font-semibold">Constraints</th>
                        <th className="pb-2 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 font-mono">
                      {selectedTable.columns.map((col) => (
                        <tr key={col.name} className="hover:bg-accent/20 transition-colors">
                          <td className="py-2.5 font-bold text-foreground flex items-center gap-1.5">
                            {col.constraints.includes("PRIMARY KEY") && (
                              <Key className="h-3 w-3 text-amber-500 shrink-0" />
                            )}
                            {col.name}
                          </td>
                          <td className="py-2.5 text-primary">{col.type}</td>
                          <td className="py-2.5 text-[11px] text-muted-foreground">
                            {col.constraints}
                          </td>
                          <td className="py-2.5 font-sans text-xs text-muted-foreground">
                            {col.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: PostgreSQL DDL Script */}
          {activeTab === "ddl" && (
            <motion.div
              key="ddl"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="neu p-6">
                <div className="flex items-center justify-between border-b border-border/30 pb-3">
                  <div>
                    <h2 className="font-display text-base font-bold flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-primary" />
                      PostgreSQL 16+ DDL & Row Level Security (RLS) Script
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ready to execute against Supabase, Neon, AWS RDS, or local Docker containers.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      RLS Enabled
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-border/40 bg-zinc-950 p-4 font-mono text-xs text-emerald-400 shadow-inner overflow-x-auto max-h-[500px] overflow-y-auto">
                  <pre>{blueprint.ddlSchema}</pre>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: API Specifications */}
          {activeTab === "api" && (
            <motion.div
              key="api"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {blueprint.apiCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveApiCategory(cat)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                        activeApiCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "border border-border/50 bg-background hover:bg-accent/40 text-muted-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  Showing {filteredApis.length} endpoints
                </span>
              </div>

              <div className="space-y-4">
                {filteredApis.map((api, idx) => (
                  <div key={api.path + api.method} className="neu p-5 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className={`rounded border px-2 py-0.5 font-mono text-xs font-bold ${
                            METHOD_BADGES[api.method] ?? "bg-muted text-muted-foreground"
                          }`}
                        >
                          {api.method}
                        </span>
                        <code className="font-mono text-sm font-semibold text-foreground">
                          {api.path}
                        </code>
                        <span className="rounded bg-muted/60 px-2 py-0.5 text-[10px] uppercase font-semibold text-muted-foreground">
                          {api.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-background/80 border border-border/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                          {api.auth}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCurl(api.curlExample, idx)}
                          className="inline-flex items-center gap-1 rounded bg-accent/60 px-2 py-1 text-[11px] font-medium hover:bg-accent transition-colors"
                        >
                          {copiedCurlIndex === idx ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy cURL
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="mt-2.5 text-xs text-muted-foreground font-medium">
                      {api.summary}
                    </p>

                    {/* Payloads Split */}
                    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {api.requestBody && (
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Request JSON
                          </span>
                          <pre className="mt-1 max-h-40 overflow-auto rounded-lg border border-border/30 bg-background/80 p-2.5 font-mono text-[11px] text-foreground">
                            {api.requestBody}
                          </pre>
                        </div>
                      )}
                      <div className={api.requestBody ? "" : "lg:col-span-2"}>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Response (200 OK)
                        </span>
                        <pre className="mt-1 max-h-40 overflow-auto rounded-lg border border-border/30 bg-background/80 p-2.5 font-mono text-[11px] text-foreground">
                          {api.responseBody}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <StageNextButton currentStageId="data" label="Proceed to Delivery Roadmap" />
        </div>
      </GenerationSequence>
    </AppShell>
  );
}
