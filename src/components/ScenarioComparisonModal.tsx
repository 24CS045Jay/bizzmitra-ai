import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeftRight,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Coins,
  Copy,
  Plus,
  Scale,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { RoadmapBlueprint } from "@/lib/planning-data";

export interface ScenarioData {
  id: string;
  name: string;
  targetTimelineWeeks: number;
  totalPersonDays: number;
  estimatedBudgetLakhs: number;
  riskProfile: "Low" | "Medium" | "High";
  phasesCount: number;
  keySteps: string[];
  tradeoffSummary: string;
  confidenceScore: number;
}

interface ScenarioComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBlueprint: RoadmapBlueprint;
  workspaceId?: string;
  onSelectScenario?: (scenario: ScenarioData) => void;
}

export function ScenarioComparisonModal({
  isOpen,
  onClose,
  currentBlueprint,
  workspaceId,
  onSelectScenario,
}: ScenarioComparisonModalProps) {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [selectedAId, setSelectedAId] = useState<string>("");
  const [selectedBId, setSelectedBId] = useState<string>("");
  const [newScenarioName, setNewScenarioName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize baseline and predefined comparison variants
  useEffect(() => {
    const baseline: ScenarioData = {
      id: "baseline",
      name: currentBlueprint.scenarioName || "Standard Phased Rollout",
      targetTimelineWeeks: currentBlueprint.targetTimelineWeeks || 9,
      totalPersonDays: currentBlueprint.totalPersonDays || 168,
      estimatedBudgetLakhs: Math.round(((currentBlueprint.totalPersonDays || 168) * 12500) / 10000) / 10,
      riskProfile: "Medium",
      phasesCount: currentBlueprint.phases.length || 3,
      keySteps: currentBlueprint.phases.map((p) => p.name),
      tradeoffSummary: "Balanced delivery balancing velocity with risk control and team capacity.",
      confidenceScore: currentBlueprint.confidenceScore || 88,
    };

    const fastTrack: ScenarioData = {
      id: "fast-track",
      name: "Fast-Track Rollout (Aggressive)",
      targetTimelineWeeks: Math.max(5, Math.round(baseline.targetTimelineWeeks * 0.65)),
      totalPersonDays: Math.round(baseline.totalPersonDays * 0.88),
      estimatedBudgetLakhs: Math.round(baseline.estimatedBudgetLakhs * 1.2 * 10) / 10,
      riskProfile: "High",
      phasesCount: 2,
      keySteps: [
        "Concurrent Architecture & MVP Sprint (Weeks 1–3)",
        "Hardened UAT & Production Launch (Weeks 4–6)",
      ],
      tradeoffSummary: "35% faster time-to-market. Requires senior team allocation and premium contractors.",
      confidenceScore: 74,
    };

    const phasedConservative: ScenarioData = {
      id: "phased-conservative",
      name: "Enterprise Phased Rollout (Risk-Averse)",
      targetTimelineWeeks: Math.round(baseline.targetTimelineWeeks * 1.5),
      totalPersonDays: Math.round(baseline.totalPersonDays * 1.15),
      estimatedBudgetLakhs: Math.round(baseline.estimatedBudgetLakhs * 1.1 * 10) / 10,
      riskProfile: "Low",
      phasesCount: 4,
      keySteps: [
        "Discovery & Architecture Validation (Weeks 1–3)",
        "Core Module Staged Deployment (Weeks 4–8)",
        "Parallel Dry-Run & Staff Training (Weeks 9–11)",
        "Full Cutover & Post-Go-Live Support (Weeks 12–14)",
      ],
      tradeoffSummary: "Zero business disruption and thorough audit trail. Takes longer to reach full ROI.",
      confidenceScore: 94,
    };

    // Load any saved scenarios from DB / localStorage
    const savedLocal = window.localStorage.getItem(`bizzmitra.scenarios.${workspaceId ?? "default"}`);
    let loadedFromStorage: ScenarioData[] = [];
    if (savedLocal) {
      try {
        loadedFromStorage = JSON.parse(savedLocal);
      } catch { }
    }

    const all = [baseline, fastTrack, phasedConservative, ...loadedFromStorage];
    setScenarios(all);
    setSelectedAId(baseline.id);
    setSelectedBId(fastTrack.id);
  }, [currentBlueprint, workspaceId]);

  const scenarioA = scenarios.find((s) => s.id === selectedAId) ?? scenarios[0]!;
  const scenarioB = scenarios.find((s) => s.id === selectedBId) ?? scenarios[1] ?? scenarios[0]!;

  // Duplicate current blueprint into a new variant
  async function handleDuplicateScenario() {
    if (!newScenarioName.trim()) return;
    setSaving(true);

    const newScenario: ScenarioData = {
      id: `scenario-${Date.now()}`,
      name: newScenarioName.trim(),
      targetTimelineWeeks: scenarioA.targetTimelineWeeks,
      totalPersonDays: scenarioA.totalPersonDays,
      estimatedBudgetLakhs: scenarioA.estimatedBudgetLakhs,
      riskProfile: scenarioA.riskProfile,
      phasesCount: scenarioA.phasesCount,
      keySteps: [...scenarioA.keySteps],
      tradeoffSummary: `Custom variant created from ${scenarioA.name}.`,
      confidenceScore: scenarioA.confidenceScore,
    };

    // Save to Supabase table if user & workspace are present
    if (user && workspaceId && !workspaceId.startsWith("ws-")) {
      const { error } = await supabase.from("blueprint_scenarios").insert({
        parent_blueprint_id: workspaceId,
        user_id: user.id,
        name: newScenario.name,
        data: newScenario as any,
      });
      if (error) toast.error(`DB sync: ${error.message}`);
    }

    // Always persist to localStorage for instant reliability
    const updated = [...scenarios, newScenario];
    setScenarios(updated);
    window.localStorage.setItem(
      `bizzmitra.scenarios.${workspaceId ?? "default"}`,
      JSON.stringify(updated.filter((s) => !["baseline", "fast-track", "phased-conservative"].includes(s.id))),
    );

    setSelectedBId(newScenario.id);
    setNewScenarioName("");
    setIsCreating(false);
    setSaving(false);
    toast.success(`Created scenario variant "${newScenario.name}"`);
  }

  if (!isOpen) return null;

  // Compute diffs
  const timelineDiff = scenarioB.targetTimelineWeeks - scenarioA.targetTimelineWeeks;
  const effortDiff = scenarioB.totalPersonDays - scenarioA.totalPersonDays;
  const budgetDiff = Math.round((scenarioB.estimatedBudgetLakhs - scenarioA.estimatedBudgetLakhs) * 10) / 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/35 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="neu bg-card w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-border p-6 shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Scale className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-foreground">
                Scenario Comparison Matrix
              </h2>
              <p className="text-xs text-muted-foreground">
                Compare delivery variations, speed vs. cost trade-offs, and critical path risk profiles.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Action strip: Select Scenarios & Create Variant */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">Comparing:</span>
            <select
              value={selectedAId}
              onChange={(e) => setSelectedAId(e.target.value)}
              className="neu-inset px-2.5 py-1.5 text-xs font-bold bg-transparent outline-none rounded-lg"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ArrowLeftRight className="size-3.5 text-muted-foreground" />
            <select
              value={selectedBId}
              onChange={(e) => setSelectedBId(e.target.value)}
              className="neu-inset px-2.5 py-1.5 text-xs font-bold bg-transparent outline-none rounded-lg"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {!isCreating ? (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="neu-sm neu-press flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary hover:brightness-105"
            >
              <Plus className="size-3.5" />
              Duplicate into Variant
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                placeholder="e.g. Fast Rollout Q4"
                className="neu-inset px-3 py-1 text-xs bg-transparent outline-none w-48"
              />
              <button
                type="button"
                disabled={saving || !newScenarioName.trim()}
                onClick={() => void handleDuplicateScenario()}
                className="neu-press rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Comparative Cards Side-by-Side */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Scenario A Card */}
            <div className="neu-inset p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Scenario A (Baseline)
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      scenarioA.riskProfile === "Low"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : scenarioA.riskProfile === "Medium"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-rose-500/10 text-rose-600"
                    }`}
                  >
                    {scenarioA.riskProfile} Risk
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold mt-1 text-foreground">
                  {scenarioA.name}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {scenarioA.tradeoffSummary}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 border-y border-border/60 py-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Timeline</p>
                    <p className="text-sm font-bold mt-0.5">{scenarioA.targetTimelineWeeks} Weeks</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Effort</p>
                    <p className="text-sm font-bold mt-0.5">{scenarioA.totalPersonDays} d</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Budget</p>
                    <p className="text-sm font-bold mt-0.5">₹{scenarioA.estimatedBudgetLakhs}L</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-bold text-foreground mb-2">Key Phased Steps:</p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {scenarioA.keySteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="size-3 text-primary shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {onSelectScenario && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectScenario(scenarioA);
                    onClose();
                  }}
                  className="neu-sm neu-press w-full mt-5 py-2 text-xs font-bold text-foreground"
                >
                  Activate This Scenario
                </button>
              )}
            </div>

            {/* Scenario B Card */}
            <div className="neu-inset p-5 flex flex-col justify-between border-primary/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Scenario B (Comparison)
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      scenarioB.riskProfile === "Low"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : scenarioB.riskProfile === "Medium"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-rose-500/10 text-rose-600"
                    }`}
                  >
                    {scenarioB.riskProfile} Risk
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold mt-1 text-foreground">
                  {scenarioB.name}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {scenarioB.tradeoffSummary}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 border-y border-border/60 py-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Timeline</p>
                    <p className="text-sm font-bold mt-0.5 flex items-center gap-1">
                      {scenarioB.targetTimelineWeeks} Weeks
                      {timelineDiff !== 0 && (
                        <span
                          className={`text-[10px] font-bold ${
                            timelineDiff < 0 ? "text-emerald-500" : "text-amber-500"
                          }`}
                        >
                          ({timelineDiff > 0 ? `+${timelineDiff}` : timelineDiff}w)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Effort</p>
                    <p className="text-sm font-bold mt-0.5 flex items-center gap-1">
                      {scenarioB.totalPersonDays} d
                      {effortDiff !== 0 && (
                        <span
                          className={`text-[10px] font-bold ${
                            effortDiff < 0 ? "text-emerald-500" : "text-amber-500"
                          }`}
                        >
                          ({effortDiff > 0 ? `+${effortDiff}` : effortDiff}d)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Budget</p>
                    <p className="text-sm font-bold mt-0.5 flex items-center gap-1">
                      ₹{scenarioB.estimatedBudgetLakhs}L
                      {budgetDiff !== 0 && (
                        <span
                          className={`text-[10px] font-bold ${
                            budgetDiff < 0 ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          ({budgetDiff > 0 ? `+₹${budgetDiff}` : `₹${budgetDiff}`}L)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-bold text-foreground mb-2">Key Phased Steps:</p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {scenarioB.keySteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="size-3 text-primary shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {onSelectScenario && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectScenario(scenarioB);
                    onClose();
                  }}
                  className="neu-press w-full mt-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground glow-primary"
                >
                  Activate This Scenario
                </button>
              )}
            </div>
          </div>

          {/* Variance Analysis Summary */}
          <div className="neu p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-primary/5">
            <div className="flex items-center gap-3">
              <Sparkles className="size-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">AI Scenario Recommendation</p>
                <p className="text-xs text-muted-foreground">
                  {timelineDiff < 0
                    ? `Choosing "${scenarioB.name}" will accelerate go-live by ${Math.abs(timelineDiff)} weeks with an estimated budget variance of ₹${Math.abs(budgetDiff)}L.`
                    : `Choosing "${scenarioB.name}" provides ${timelineDiff} additional weeks of testing buffer, maximizing compliance confidence.`}
                </p>
              </div>
            </div>
            <span className="neu-sm px-3 py-1 text-xs font-extrabold text-primary shrink-0">
              Confidence: {scenarioB.confidenceScore}%
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
