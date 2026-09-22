import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Columns,
  Eye,
  EyeOff,
  HelpCircle,
  Palette,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Sparkles,
  Tag,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  DEFAULT_STUDIO_SETTINGS,
  PREDEFINED_CUSTOM_FIELDS,
  THEME_ACCENTS,
  loadStudioSettings,
  saveStudioSettings,
  type CustomField,
  type FieldType,
  type StudioSettings,
  type TableDensity,
  type ThemeAccent,
} from "@/lib/solution-studio";
import { cn } from "@/lib/utils";
import { AIRegenerationModal } from "./AIRegenerationModal";

interface SolutionStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerRegeneration?: () => void;
  onSettingsChange?: (settings: StudioSettings) => void;
}

export function SolutionStudioDrawer({
  isOpen,
  onClose,
  onTriggerRegeneration,
  onSettingsChange,
}: SolutionStudioDrawerProps) {
  const [settings, setSettings] = useState<StudioSettings>(() => loadStudioSettings());
  const [activeTab, setActiveTab] = useState<"ui" | "fields" | "versions">("ui");
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Field Builder Form State
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldKey, setFieldKey] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [fieldPlaceholder, setFieldPlaceholder] = useState("");
  const [fieldDefault, setFieldDefault] = useState("");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldError, setFieldError] = useState("");

  // Sync settings when opened
  useEffect(() => {
    if (isOpen) {
      const current = loadStudioSettings();
      setSettings(current);
    }
  }, [isOpen]);

  const updateSettings = (updater: (prev: StudioSettings) => StudioSettings) => {
    setSettings((prev) => {
      const next = updater(prev);
      saveStudioSettings(next);
      onSettingsChange?.(next);
      return next;
    });
  };

  const handleLabelChange = (val: string) => {
    setFieldLabel(val);
    // Auto-slugify to camelCase if user hasn't typed custom key
    const camel = val
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase(),
      )
      .replace(/\s+/g, "")
      .replace(/[^a-zA-Z0-9]/g, "");
    setFieldKey(camel);
    setFieldError("");
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLabel.trim()) {
      setFieldError("Field label is required");
      return;
    }
    const cleanKey = fieldKey.trim() || fieldLabel.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (settings.customFields.some((f) => f.key.toLowerCase() === cleanKey.toLowerCase())) {
      setFieldError(`Key "${cleanKey}" already exists in schema`);
      return;
    }

    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      label: fieldLabel.trim(),
      key: cleanKey,
      type: fieldType,
      placeholder: fieldPlaceholder.trim() || undefined,
      defaultValue: fieldDefault.trim() || undefined,
      required: fieldRequired,
    };

    updateSettings((prev) => ({
      ...prev,
      customFields: [...prev.customFields, newField],
    }));

    // Reset form
    setFieldLabel("");
    setFieldKey("");
    setFieldType("text");
    setFieldPlaceholder("");
    setFieldDefault("");
    setFieldRequired(false);
    setFieldError("");
  };

  const handleQuickAddField = (preset: (typeof PREDEFINED_CUSTOM_FIELDS)[number]) => {
    if (settings.customFields.some((f) => f.key === preset.key)) {
      setFieldError(`"${preset.label}" is already in your schema.`);
      return;
    }
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      ...preset,
    };
    updateSettings((prev) => ({
      ...prev,
      customFields: [...prev.customFields, newField],
    }));
    setFieldError("");
  };

  const handleAccentChange = (accent: ThemeAccent) => {
    updateSettings((prev) => ({ ...prev, accent }));
  };

  const handleDensityChange = (density: TableDensity) => {
    updateSettings((prev) => ({ ...prev, density }));
  };

  const toggleStandardColumn = (col: keyof StudioSettings["visibleStandardColumns"]) => {
    updateSettings((prev) => ({
      ...prev,
      visibleStandardColumns: {
        ...prev.visibleStandardColumns,
        [col]: !prev.visibleStandardColumns[col],
      },
    }));
  };

  const resetDefaults = () => {
    saveStudioSettings(DEFAULT_STUDIO_SETTINGS);
    setSettings(DEFAULT_STUDIO_SETTINGS);
    onSettingsChange?.(DEFAULT_STUDIO_SETTINGS);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Container */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface/80">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary shadow-inner">
                  <Sliders className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-extrabold text-base tracking-tight">Solution Studio</h3>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {settings.version}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    USP #2: Live Customizer & Schema Engine
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={resetDefaults}
                  title="Reset to default settings"
                  className="grid size-8 place-items-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="size-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="grid size-8 place-items-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Subheader / Tabs */}
            <div className="flex border-b border-border bg-muted/40 p-1.5 gap-1 text-xs">
              <button
                onClick={() => setActiveTab("ui")}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5",
                  activeTab === "ui"
                    ? "bg-card text-foreground shadow-sm neu-inset"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Palette className="size-3.5" />
                UI & Theme
              </button>
              <button
                onClick={() => setActiveTab("fields")}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5",
                  activeTab === "fields"
                    ? "bg-card text-foreground shadow-sm neu-inset"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Columns className="size-3.5" />
                Field Builder ({settings.customFields.length})
              </button>
              <button
                onClick={() => setActiveTab("versions")}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5",
                  activeTab === "versions"
                    ? "bg-card text-foreground shadow-sm neu-inset"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Sparkles className="size-3.5" />
                Versions ({settings.versionHistory.length})
              </button>
            </div>

            {/* Top Quick-Regenerate Action Bar (Immediate access without scrolling) */}
            <div className="p-3.5 bg-gradient-to-r from-primary/15 via-primary/5 to-accent/15 border-b border-border flex flex-col gap-1.5 shrink-0 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  Ready to apply customizations?
                </span>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-extrabold text-primary">
                  v{settings.version}
                </span>
              </div>
              <button
                onClick={() => {
                  if (onTriggerRegeneration) {
                    onTriggerRegeneration();
                  } else {
                    setIsRegenerating(true);
                  }
                }}
                className="neu-press w-full rounded-xl bg-primary py-2.5 px-4 text-xs font-bold text-primary-foreground shadow-md flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all"
              >
                <Wand2 className="size-3.5 animate-spin-slow text-primary-foreground" />
                Regenerate Solution with AI (v{settings.version})
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {activeTab === "ui" && (
                <div className="space-y-6">
                  {/* Theme Accent Picker */}
                  <div className="neu p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Palette className="size-3.5 text-primary" />
                        Theme Accent
                      </label>
                      <span className="text-[10px] font-semibold text-primary uppercase">
                        {THEME_ACCENTS.find((a) => a.id === settings.accent)?.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {THEME_ACCENTS.map((accent) => {
                        const isSelected = settings.accent === accent.id;
                        return (
                          <button
                            key={accent.id}
                            onClick={() => handleAccentChange(accent.id)}
                            className={cn(
                              "p-2.5 rounded-xl flex items-center gap-2 border transition-all text-left",
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                                : "border-border/60 hover:bg-accent/50",
                            )}
                          >
                            <span
                              className="size-3.5 rounded-full shadow-sm shrink-0"
                              style={{ backgroundColor: accent.colorHex }}
                            />
                            <span className="text-xs font-medium truncate">{accent.label.split(" ")[0]}</span>
                            {isSelected && <Check className="size-3 ml-auto text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Table Density */}
                  <div className="neu p-4 rounded-xl space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      CRM Table Density
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["compact", "comfortable", "spacious"] as TableDensity[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => handleDensityChange(d)}
                          className={cn(
                            "py-2 px-3 rounded-lg text-xs font-semibold capitalize border transition-all",
                            settings.density === d
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "border-border/60 hover:bg-accent text-muted-foreground",
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Style Toggles */}
                  <div className="neu p-4 rounded-xl space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Layout Preferences
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/40 cursor-pointer text-xs">
                        <span>Zebra Alternating Rows</span>
                        <input
                          type="checkbox"
                          checked={settings.alternateRows}
                          onChange={(e) =>
                            updateSettings((prev) => ({ ...prev, alternateRows: e.target.checked }))
                          }
                          className="size-4 accent-primary rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/40 cursor-pointer text-xs">
                        <span>Neumorphic Soft Depth</span>
                        <input
                          type="checkbox"
                          checked={settings.roundedCards}
                          onChange={(e) =>
                            updateSettings((prev) => ({ ...prev, roundedCards: e.target.checked }))
                          }
                          className="size-4 accent-primary rounded"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Standard Column Visibility */}
                  <div className="neu p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Candidate Table Columns
                      </label>
                      <span className="text-[10px] text-muted-foreground">Toggle visibility</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        Object.keys(
                          settings.visibleStandardColumns,
                        ) as (keyof StudioSettings["visibleStandardColumns"])[]
                      ).map((col) => {
                        const isVisible = settings.visibleStandardColumns[col];
                        return (
                          <button
                            key={col}
                            onClick={() => toggleStandardColumn(col)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 rounded-lg text-xs capitalize border transition-all",
                              isVisible
                                ? "bg-accent/70 border-border text-foreground font-semibold"
                                : "opacity-50 border-dashed border-border text-muted-foreground",
                            )}
                          >
                            <span>{col}</span>
                            {isVisible ? (
                              <Eye className="size-3 text-primary" />
                            ) : (
                              <EyeOff className="size-3 text-muted-foreground" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "fields" && (
                <div className="space-y-5">
                  {/* Schema Health & Counter Overview */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="neu-inset p-2.5 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Standard
                      </p>
                      <p className="font-display text-base font-extrabold text-foreground">8</p>
                    </div>
                    <div className="neu-inset p-2.5 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-primary font-semibold">
                        Custom
                      </p>
                      <p className="font-display text-base font-extrabold text-primary">
                        {settings.customFields.length}
                      </p>
                    </div>
                    <div className="neu-inset p-2.5 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-sage font-semibold">
                        Total Schema
                      </p>
                      <p className="font-display text-base font-extrabold text-sage">
                        {8 + settings.customFields.length}
                      </p>
                    </div>
                  </div>

                  {/* Quick-Add Suggestions */}
                  <div className="neu p-3.5 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Sparkles className="size-3 text-primary" />
                        Quick-Add Recommended Fields
                      </p>
                      <span className="text-[10px] text-muted-foreground">Click to add</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PREDEFINED_CUSTOM_FIELDS.map((preset) => {
                        const exists = settings.customFields.some((f) => f.key === preset.key);
                        return (
                          <button
                            key={preset.key}
                            type="button"
                            disabled={exists}
                            onClick={() => handleQuickAddField(preset)}
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1",
                              exists
                                ? "opacity-50 cursor-not-allowed bg-accent/30 text-muted-foreground border-border/40"
                                : "bg-card hover:bg-primary/10 border-border hover:border-primary text-foreground font-medium",
                            )}
                          >
                            <Plus className="size-3 text-primary" />
                            {preset.label}
                            {exists && <Check className="size-3 text-emerald-500 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Custom Attributes List */}
                  <div className="neu p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Tag className="size-3.5 text-primary" />
                        Active Custom Attributes ({settings.customFields.length})
                      </p>
                      <span className="text-[10px] text-muted-foreground">Auto-synced</span>
                    </div>

                    {settings.customFields.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-3 text-center">
                        No custom attributes added yet. Use the presets above or form below.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {settings.customFields.map((field) => (
                          <div
                            key={field.id}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-card/60 hover:bg-card transition-colors"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-foreground">
                                  {field.label}
                                </span>
                                <span className="rounded bg-primary/15 px-1.5 py-0.2 text-[9px] font-mono font-bold text-primary uppercase">
                                  {field.type}
                                </span>
                                {field.required && (
                                  <span className="rounded bg-destructive/15 px-1 py-0.2 text-[9px] font-bold text-destructive">
                                    Req
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                key: {field.key} {field.defaultValue && `· def: "${field.defaultValue}"`}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                updateSettings((prev) => ({
                                  ...prev,
                                  customFields: prev.customFields.filter((f) => f.id !== field.id),
                                }));
                              }}
                              className="size-7 grid place-items-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              title="Delete attribute"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Custom Field Form */}
                  <div className="neu p-4 rounded-xl space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Plus className="size-3.5 text-primary" />
                      Create Custom Attribute
                    </p>

                    <form onSubmit={handleAddField} className="space-y-3">
                      {fieldError && (
                        <div className="p-2 rounded-lg bg-destructive/10 text-destructive text-xs">
                          {fieldError}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Attribute Label *
                          </label>
                          <input
                            type="text"
                            value={fieldLabel}
                            onChange={(e) => handleLabelChange(e.target.value)}
                            placeholder="e.g., Notice Period"
                            className="w-full mt-1 neu-inset rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Field Key (JSON) *
                          </label>
                          <input
                            type="text"
                            value={fieldKey}
                            onChange={(e) => setFieldKey(e.target.value)}
                            placeholder="noticePeriod"
                            className="w-full mt-1 neu-inset rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Type
                          </label>
                          <select
                            value={fieldType}
                            onChange={(e) => setFieldType(e.target.value as FieldType)}
                            className="w-full mt-1 neu-inset rounded-lg px-2 py-1.5 text-xs outline-none capitalize"
                          >
                            <option value="text">Text (String)</option>
                            <option value="number">Number</option>
                            <option value="url">URL Link</option>
                            <option value="date">Date</option>
                            <option value="select">Select / Tag</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Placeholder
                          </label>
                          <input
                            type="text"
                            value={fieldPlaceholder}
                            onChange={(e) => setFieldPlaceholder(e.target.value)}
                            placeholder="e.g., 30 Days"
                            className="w-full mt-1 neu-inset rounded-lg px-2.5 py-1.5 text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 items-center">
                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Default Value
                          </label>
                          <input
                            type="text"
                            value={fieldDefault}
                            onChange={(e) => setFieldDefault(e.target.value)}
                            placeholder="e.g., Immediate"
                            className="w-full mt-1 neu-inset rounded-lg px-2.5 py-1.5 text-xs outline-none"
                          />
                        </div>
                        <div className="pt-4 flex items-center">
                          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={fieldRequired}
                              onChange={(e) => setFieldRequired(e.target.checked)}
                              className="size-4 accent-primary rounded"
                            />
                            <span>Required attribute</span>
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="neu-press w-full rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground shadow-sm hover:brightness-105 flex items-center justify-center gap-1.5"
                      >
                        <Plus className="size-3.5" />
                        Add Attribute to Pipeline Schema
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === "versions" && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Solution Version History
                  </p>
                  <div className="space-y-3">
                    {settings.versionHistory.map((v, i) => (
                      <div key={i} className="neu p-3.5 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary">{v.version}</span>
                          <span className="text-[10px] text-muted-foreground">{v.timestamp}</span>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          {v.changes.map((c, j) => (
                            <li key={j}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer / AI Regeneration Trigger */}
            <div className="p-4 border-t border-border bg-surface/90 flex flex-col gap-2">
              <button
                onClick={() => {
                  if (onTriggerRegeneration) {
                    onTriggerRegeneration();
                  } else {
                    setIsRegenerating(true);
                  }
                }}
                className="neu-press w-full rounded-xl bg-primary py-3 px-4 text-xs font-bold text-primary-foreground shadow-md flex items-center justify-center gap-2 hover:brightness-105 transition-all"
              >
                <Wand2 className="size-4 animate-spin-slow" />
                Regenerate Solution with AI (v{settings.version})
              </button>
              <p className="text-[10px] text-center text-muted-foreground">
                Synthesizes schema customizations into CRM views in real time.
              </p>
            </div>
          </motion.aside>

          {/* AI Regeneration Modal */}
          <AIRegenerationModal
            isOpen={isRegenerating}
            onClose={() => setIsRegenerating(false)}
            onComplete={(updated) => {
              setSettings(updated);
              onSettingsChange?.(updated);
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
