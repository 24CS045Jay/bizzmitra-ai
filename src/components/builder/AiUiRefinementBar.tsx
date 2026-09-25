import React, { useState } from "react";
import {
  Sparkles,
  SlidersHorizontal,
  Palette,
  Layout,
  Layers,
  ArrowRight,
  RotateCcw,
  Check,
  ChevronDown,
  X,
  FileDown,
  Search,
  BarChart3,
  Database,
  Clock,
  Loader2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AppUiCustomization,
  THEME_COLOR_CONFIGS,
  ThemeColor,
  LayoutStyle,
  DensityStyle,
  refineUiWithAi,
  saveUiCustomization,
  DEFAULT_UI_CUSTOMIZATION,
} from "@/lib/builder/ui-customization-store";
import { cn } from "@/lib/utils";

interface AiUiRefinementBarProps {
  customization: AppUiCustomization;
  onChange: (updated: AppUiCustomization) => void;
}

const QUICK_PROMPTS = [
  { label: "Emerald Theme", prompt: "Switch theme to Emerald Enterprise" },
  { label: "Left Sidebar", prompt: "Switch to Left Sidebar Navigation layout" },
  { label: "Add CSV Export", prompt: "Add Export to CSV quick action button" },
  { label: "Compact Mode", prompt: "Set density to compact" },
  { label: "Toggle KPIs", prompt: "Toggle KPI metric summary cards" },
  { label: "Sunset Amber", prompt: "Change color theme to Sunset Amber" },
];

export function AiUiRefinementBar({ customization, onChange }: AiUiRefinementBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);
  const [history, setHistory] = useState<AppUiCustomization[]>([]);

  const handleApplyAiPrompt = async (textToUse?: string) => {
    const inputQuery = textToUse || prompt;
    if (!inputQuery.trim()) {
      toast.warning("Please type an instruction (e.g. 'Switch to Emerald and add CSV export')");
      return;
    }

    setIsRefining(true);
    try {
      setHistory((prev) => [customization, ...prev]);
      const res = await refineUiWithAi(inputQuery, customization);
      onChange(res.updated);
      toast.success(res.explanation || "AI UI Refinement applied successfully!");
      if (!textToUse) setPrompt("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to refine UI with AI");
    } finally {
      setIsRefining(false);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const [previous, ...rest] = history;
      onChange(previous);
      saveUiCustomization(previous);
      setHistory(rest);
      toast.info("Reverted to previous UI state.");
    } else {
      onChange(DEFAULT_UI_CUSTOMIZATION);
      saveUiCustomization(DEFAULT_UI_CUSTOMIZATION);
      toast.info("Reset to default UI state.");
    }
  };

  const updateSetting = <K extends keyof AppUiCustomization>(key: K, value: AppUiCustomization[K]) => {
    setHistory((prev) => [customization, ...prev]);
    const updated = { ...customization, [key]: value };
    onChange(updated);
    saveUiCustomization(updated);
  };

  const currentTheme = THEME_COLOR_CONFIGS[customization.themeColor];

  return (
    <div className="space-y-3">
      {/* Main Refinement Control Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4 shadow-xl backdrop-blur-md space-y-3">
        {/* Top: AI Prompt Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-indigo-400">
              <Sparkles className="size-4 animate-pulse" />
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isRefining) {
                  e.preventDefault();
                  handleApplyAiPrompt();
                }
              }}
              placeholder="Ask AI to refine the UI (e.g. 'Make theme emerald & switch to sidebar', 'Add CSV export', 'Compact mode')..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* AI Refine Submit Button */}
            <button
              type="button"
              onClick={() => handleApplyAiPrompt()}
              disabled={isRefining || !prompt.trim()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition disabled:opacity-40 cursor-pointer"
            >
              {isRefining ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Refining UI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="size-3.5" />
                  <span>Refine with AI</span>
                </>
              )}
            </button>

            {/* Visual Customizer Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsVisualModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2.5 text-xs font-semibold text-slate-200 transition cursor-pointer"
              title="Open Visual Styling Controls"
            >
              <Palette className="size-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Visual Customizer</span>
              <span className="sm:hidden">Theme</span>
            </button>

            {/* Undo / Revert Button */}
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 px-2.5 py-2.5 text-xs font-semibold text-slate-300 transition cursor-pointer"
                title="Undo last change"
              >
                <RotateCcw className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom: Quick Preset Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <span>Quick Presets:</span>
          </span>
          {QUICK_PROMPTS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyAiPrompt(chip.prompt)}
              disabled={isRefining}
              className="rounded-lg bg-slate-800/70 hover:bg-indigo-950/60 hover:text-indigo-300 hover:border-indigo-500/40 border border-slate-700/60 px-2.5 py-1 text-slate-300 transition cursor-pointer"
            >
              {chip.label}
            </button>
          ))}

          {/* Active theme indicator */}
          <div className="ml-auto hidden md:flex items-center gap-2 pl-2 border-l border-slate-800 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className={cn("size-2 rounded-full", currentTheme.swatchClass)} />
              <span className="font-semibold text-slate-300">{currentTheme.name}</span>
            </span>
            <span>·</span>
            <span className="capitalize">{customization.layoutStyle} Layout</span>
            <span>·</span>
            <span className="capitalize">{customization.density} Density</span>
          </div>
        </div>
      </div>

      {/* Visual Customizer Floating Modal */}
      {isVisualModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setIsVisualModalOpen(false)}
          />
          <div className="relative z-10 bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Palette className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Visual Theme & Layout Customizer
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Live UI styling without writing or modifying code
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVisualModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
              {/* 1. Theme Color Palette */}
              <div className="space-y-2">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <Palette className="size-3.5 text-indigo-400" />
                  <span>Color Theme Accent</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(THEME_COLOR_CONFIGS) as ThemeColor[]).map((themeKey) => {
                    const cfg = THEME_COLOR_CONFIGS[themeKey];
                    const isSelected = customization.themeColor === themeKey;
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => updateSetting("themeColor", themeKey)}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-xl border transition text-left cursor-pointer",
                          isSelected
                            ? "border-white/50 bg-slate-900 shadow-md ring-1 ring-white/20 text-white font-bold"
                            : "border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 text-slate-400"
                        )}
                      >
                        <span className={cn("size-3.5 rounded-full shrink-0", cfg.swatchClass)} />
                        <span className="text-[11px] truncate">{cfg.name}</span>
                        {isSelected && <Check className="size-3 ml-auto text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Navigation & Layout Style */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <Layout className="size-3.5 text-indigo-400" />
                  <span>Navigation Layout Orientation</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSetting("layoutStyle", "topbar")}
                    className={cn(
                      "p-3 rounded-xl border transition text-left cursor-pointer",
                      customization.layoutStyle === "topbar"
                        ? "border-indigo-500 bg-indigo-950/30 text-white font-bold"
                        : "border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white"
                    )}
                  >
                    <div className="text-xs font-bold">Top Navbar</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Horizontal banner with inline tab controls
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSetting("layoutStyle", "sidebar")}
                    className={cn(
                      "p-3 rounded-xl border transition text-left cursor-pointer",
                      customization.layoutStyle === "sidebar"
                        ? "border-indigo-500 bg-indigo-950/30 text-white font-bold"
                        : "border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white"
                    )}
                  >
                    <div className="text-xs font-bold">Left Sidebar</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Vertical navigation drawer with quick actions
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSetting("layoutStyle", "bottombar")}
                    className={cn(
                      "p-3 rounded-xl border transition text-left cursor-pointer",
                      customization.layoutStyle === "bottombar"
                        ? "border-indigo-500 bg-indigo-950/30 text-white font-bold"
                        : "border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white"
                    )}
                  >
                    <div className="text-xs font-bold">Mobile App Dock</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Bottom navigation bar optimized for touch & apps
                    </p>
                  </button>
                </div>
              </div>

              {/* 3. Layout Density */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <Layers className="size-3.5 text-indigo-400" />
                  <span>Layout Density</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["compact", "normal", "spacious"] as DensityStyle[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => updateSetting("density", d)}
                      className={cn(
                        "py-2 px-3 rounded-xl border text-center transition capitalize cursor-pointer",
                        customization.density === d
                          ? "border-indigo-500 bg-indigo-950/40 text-white font-bold"
                          : "border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Section & Component Toggles */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="size-3.5 text-indigo-400" />
                  <span>Component Feature Switches</span>
                </label>

                <div className="space-y-2 rounded-xl bg-slate-900/50 border border-slate-800/80 p-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300 flex items-center gap-2">
                      <BarChart3 className="size-3.5 text-slate-400" />
                      <span>KPI Metrics Overview Cards</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={customization.showKpiCards}
                      onChange={(e) => updateSetting("showKpiCards", e.target.checked)}
                      className="size-4 rounded accent-indigo-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300 flex items-center gap-2">
                      <Search className="size-3.5 text-slate-400" />
                      <span>Search & Filter Toolbar</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={customization.showSearchBar}
                      onChange={(e) => updateSetting("showSearchBar", e.target.checked)}
                      className="size-4 rounded accent-indigo-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300 flex items-center gap-2">
                      <FileDown className="size-3.5 text-emerald-400" />
                      <span>Export to CSV Button</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={customization.showCsvExport}
                      onChange={(e) => updateSetting("showCsvExport", e.target.checked)}
                      className="size-4 rounded accent-indigo-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300 flex items-center gap-2">
                      <Clock className="size-3.5 text-amber-400" />
                      <span>SLA Status Badges</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={customization.showSlaIndicators}
                      onChange={(e) => updateSetting("showSlaIndicators", e.target.checked)}
                      className="size-4 rounded accent-indigo-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300 flex items-center gap-2">
                      <Database className="size-3.5 text-indigo-400" />
                      <span>Database Live Sync Indicator</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={customization.showDbSyncBadge}
                      onChange={(e) => updateSetting("showDbSyncBadge", e.target.checked)}
                      className="size-4 rounded accent-indigo-600 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onChange(DEFAULT_UI_CUSTOMIZATION);
                  saveUiCustomization(DEFAULT_UI_CUSTOMIZATION);
                  toast.info("Reset to factory defaults");
                }}
                className="text-[11px] text-slate-400 hover:text-white transition cursor-pointer"
              >
                Reset to Default
              </button>
              <button
                type="button"
                onClick={() => setIsVisualModalOpen(false)}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-xs font-bold text-white shadow transition cursor-pointer"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
