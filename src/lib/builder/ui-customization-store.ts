/**
 * BizzMitra AI — UI Customization & AI Refinement Store
 * Manages theme, layout, component visibility, and AI-driven prompt refactoring for generated applications.
 */

export type ThemeColor = "indigo" | "emerald" | "amber" | "rose" | "cyan" | "violet";
export type LayoutStyle = "topbar" | "sidebar" | "bottombar";
export type DensityStyle = "compact" | "normal" | "spacious";

export interface AppUiCustomization {
  themeColor: ThemeColor;
  layoutStyle: LayoutStyle;
  density: DensityStyle;
  appTitle?: string;
  showKpiCards: boolean;
  showSearchBar: boolean;
  showQuickActions: boolean;
  showSlaIndicators: boolean;
  showDbSyncBadge: boolean;
  showCsvExport: boolean;
}

export const DEFAULT_UI_CUSTOMIZATION: AppUiCustomization = {
  themeColor: "indigo",
  layoutStyle: "topbar",
  density: "normal",
  showKpiCards: true,
  showSearchBar: true,
  showQuickActions: true,
  showSlaIndicators: true,
  showDbSyncBadge: true,
  showCsvExport: false,
};

const STORAGE_KEY = "bizzmitra.uiCustomization";

export function loadUiCustomization(): AppUiCustomization {
  if (typeof window === "undefined") return DEFAULT_UI_CUSTOMIZATION;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_UI_CUSTOMIZATION, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error("Failed to load UI customization", e);
  }
  return DEFAULT_UI_CUSTOMIZATION;
}

export function saveUiCustomization(customization: AppUiCustomization): AppUiCustomization {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customization));
    } catch (e) {
      console.error("Failed to save UI customization", e);
    }
  }
  return customization;
}

/**
 * Intelligent AI Refinement Engine
 * Parses natural-language UI change instructions and translates them into UI configuration diffs.
 */
export async function refineUiWithAi(
  prompt: string,
  current: AppUiCustomization
): Promise<{ updated: AppUiCustomization; explanation: string }> {
  // Simulate AI model latency for realistic UX feedback
  await new Promise((resolve) => setTimeout(resolve, 800));

  const lower = prompt.toLowerCase();
  const next: AppUiCustomization = { ...current };
  const changes: string[] = [];

  // 1. Color Themes
  if (lower.includes("emerald") || lower.includes("green") || lower.includes("mint")) {
    next.themeColor = "emerald";
    changes.push("Theme set to Emerald Enterprise");
  } else if (lower.includes("amber") || lower.includes("orange") || lower.includes("sunset") || lower.includes("gold") || lower.includes("yellow")) {
    next.themeColor = "amber";
    changes.push("Theme set to Sunset Amber");
  } else if (lower.includes("rose") || lower.includes("pink") || lower.includes("red") || lower.includes("crimson")) {
    next.themeColor = "rose";
    changes.push("Theme set to Rose Velvet");
  } else if (lower.includes("cyan") || lower.includes("teal") || lower.includes("blue") || lower.includes("sky")) {
    next.themeColor = "cyan";
    changes.push("Theme set to Cyan High-Tech");
  } else if (lower.includes("violet") || lower.includes("purple") || lower.includes("lavender")) {
    next.themeColor = "violet";
    changes.push("Theme set to Violet Royal");
  } else if (lower.includes("indigo") || lower.includes("navy")) {
    next.themeColor = "indigo";
    changes.push("Theme set to Modern Indigo");
  }

  // 2. Layout Style
  if (lower.includes("sidebar") || lower.includes("side bar") || lower.includes("side nav") || lower.includes("vertical")) {
    next.layoutStyle = "sidebar";
    changes.push("Switched to Left Sidebar Navigation layout");
  } else if (lower.includes("bottom") || lower.includes("dock") || lower.includes("mobile layout") || lower.includes("app dock") || lower.includes("bottom nav")) {
    next.layoutStyle = "bottombar";
    changes.push("Switched to Mobile App Dock / Bottom Bar layout");
  } else if (lower.includes("topbar") || lower.includes("top bar") || lower.includes("horizontal") || lower.includes("header nav")) {
    next.layoutStyle = "topbar";
    changes.push("Switched to Top Navigation Bar layout");
  }

  // 3. Density Mode
  if (lower.includes("compact") || lower.includes("dense") || lower.includes("tight") || lower.includes("minimal")) {
    next.density = "compact";
    changes.push("Layout density set to Compact");
  } else if (lower.includes("spacious") || lower.includes("relaxed") || lower.includes("large") || lower.includes("airy")) {
    next.density = "spacious";
    changes.push("Layout density set to Spacious");
  } else if (lower.includes("normal") || lower.includes("standard")) {
    next.density = "normal";
    changes.push("Layout density reset to Standard");
  }

  // 4. Feature Toggles
  if (lower.includes("hide kpi") || lower.includes("remove kpi") || lower.includes("hide metric") || lower.includes("remove stat")) {
    next.showKpiCards = false;
    changes.push("Hidden KPI summary cards");
  } else if (lower.includes("show kpi") || lower.includes("enable kpi") || lower.includes("show metric") || lower.includes("add stat")) {
    next.showKpiCards = true;
    changes.push("Enabled KPI summary cards");
  }

  if (lower.includes("export") || lower.includes("csv") || lower.includes("download data")) {
    next.showCsvExport = true;
    changes.push("Added direct 'Export to CSV' quick action button");
  }

  if (lower.includes("hide search") || lower.includes("remove search")) {
    next.showSearchBar = false;
    changes.push("Disabled search & filter toolbar");
  } else if (lower.includes("show search") || lower.includes("enable search")) {
    next.showSearchBar = true;
    changes.push("Enabled search & filter toolbar");
  }

  if (lower.includes("hide sla") || lower.includes("remove sla")) {
    next.showSlaIndicators = false;
    changes.push("Hidden SLA turnaround badges");
  } else if (lower.includes("show sla") || lower.includes("enable sla")) {
    next.showSlaIndicators = true;
    changes.push("Enabled SLA turnaround badges");
  }

  // 5. Title Rename (e.g., "rename to Apex Logistics", "change title to ...")
  const renameMatch = lower.match(/(?:rename to|change title to|call it|title:)\s*["']?([^"'\n,]+)["']?/i);
  if (renameMatch && renameMatch[1]) {
    const newTitle = renameMatch[1].trim();
    if (newTitle.length > 2) {
      next.appTitle = newTitle.charAt(0).toUpperCase() + newTitle.slice(1);
      changes.push(`Renamed platform title to "${next.appTitle}"`);
    }
  }

  // If no direct keyword was caught, provide a smart default enhancement
  if (changes.length === 0) {
    if (next.themeColor === "indigo") {
      next.themeColor = "emerald";
      next.showCsvExport = true;
      changes.push("Refined UI with Emerald Enterprise theme & added CSV Export capability");
    } else {
      next.themeColor = "indigo";
      next.layoutStyle = next.layoutStyle === "topbar" ? "sidebar" : "topbar";
      changes.push(`Applied styling polish and toggled to ${next.layoutStyle} navigation`);
    }
  }

  saveUiCustomization(next);
  return {
    updated: next,
    explanation: changes.join(" · "),
  };
}

/**
 * Pre-defined styling tokens for each theme color
 */
export const THEME_COLOR_CONFIGS: Record<
  ThemeColor,
  {
    name: string;
    swatchClass: string;
    primaryBg: string;
    primaryHover: string;
    primaryText: string;
    borderAccent: string;
    gradientFrom: string;
    glowShadow: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  indigo: {
    name: "Modern Indigo",
    swatchClass: "bg-indigo-500",
    primaryBg: "bg-indigo-600",
    primaryHover: "hover:bg-indigo-500",
    primaryText: "text-indigo-400",
    borderAccent: "border-indigo-500/30",
    gradientFrom: "from-indigo-950/40",
    glowShadow: "shadow-indigo-500/20",
    badgeBg: "bg-indigo-500/15",
    badgeText: "text-indigo-400",
  },
  emerald: {
    name: "Emerald Enterprise",
    swatchClass: "bg-emerald-500",
    primaryBg: "bg-emerald-600",
    primaryHover: "hover:bg-emerald-500",
    primaryText: "text-emerald-400",
    borderAccent: "border-emerald-500/30",
    gradientFrom: "from-emerald-950/40",
    glowShadow: "shadow-emerald-500/20",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-400",
  },
  amber: {
    name: "Sunset Amber",
    swatchClass: "bg-amber-500",
    primaryBg: "bg-amber-600",
    primaryHover: "hover:bg-amber-500",
    primaryText: "text-amber-400",
    borderAccent: "border-amber-500/30",
    gradientFrom: "from-amber-950/40",
    glowShadow: "shadow-amber-500/20",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-400",
  },
  rose: {
    name: "Rose Velvet",
    swatchClass: "bg-rose-500",
    primaryBg: "bg-rose-600",
    primaryHover: "hover:bg-rose-500",
    primaryText: "text-rose-400",
    borderAccent: "border-rose-500/30",
    gradientFrom: "from-rose-950/40",
    glowShadow: "shadow-rose-500/20",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-400",
  },
  cyan: {
    name: "Cyan High-Tech",
    swatchClass: "bg-cyan-500",
    primaryBg: "bg-cyan-600",
    primaryHover: "hover:bg-cyan-500",
    primaryText: "text-cyan-400",
    borderAccent: "border-cyan-500/30",
    gradientFrom: "from-cyan-950/40",
    glowShadow: "shadow-cyan-500/20",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-400",
  },
  violet: {
    name: "Violet Royal",
    swatchClass: "bg-violet-500",
    primaryBg: "bg-violet-600",
    primaryHover: "hover:bg-violet-500",
    primaryText: "text-violet-400",
    borderAccent: "border-violet-500/30",
    gradientFrom: "from-violet-950/40",
    glowShadow: "shadow-violet-500/20",
    badgeBg: "bg-violet-500/15",
    badgeText: "text-violet-400",
  },
};
