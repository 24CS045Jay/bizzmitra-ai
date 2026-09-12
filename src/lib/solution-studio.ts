export type FieldType = "text" | "number" | "url" | "select" | "date";

export interface CustomField {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  options?: string[]; // for select type
}

export type TableDensity = "compact" | "comfortable" | "spacious";

export type ThemeAccent = "teal" | "indigo" | "amber" | "rose" | "violet" | "cyan";

export interface ThemeAccentConfig {
  id: ThemeAccent;
  label: string;
  colorHex: string;
  primaryClass: string;
  badgeClass: string;
  borderClass: string;
}

export const THEME_ACCENTS: ThemeAccentConfig[] = [
  {
    id: "teal",
    label: "Teal Mint (Default)",
    colorHex: "#0D9488",
    primaryClass: "bg-teal-600 text-white",
    badgeClass: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    borderClass: "border-teal-500",
  },
  {
    id: "indigo",
    label: "Electric Indigo",
    colorHex: "#6366F1",
    primaryClass: "bg-indigo-600 text-white",
    badgeClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
    borderClass: "border-indigo-500",
  },
  {
    id: "amber",
    label: "Warm Amber",
    colorHex: "#D97706",
    primaryClass: "bg-amber-600 text-white",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    borderClass: "border-amber-500",
  },
  {
    id: "rose",
    label: "Rose Quartz",
    colorHex: "#E11D48",
    primaryClass: "bg-rose-600 text-white",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
    borderClass: "border-rose-500",
  },
  {
    id: "violet",
    label: "Cyber Violet",
    colorHex: "#8B5CF6",
    primaryClass: "bg-violet-600 text-white",
    badgeClass: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
    borderClass: "border-violet-500",
  },
  {
    id: "cyan",
    label: "Deep Sky",
    colorHex: "#0284C7",
    primaryClass: "bg-sky-600 text-white",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    borderClass: "border-sky-500",
  },
];

export interface StudioVersionEntry {
  version: string;
  timestamp: string;
  changes: string[];
}

export interface StudioSettings {
  version: string;
  versionHistory: StudioVersionEntry[];
  accent: ThemeAccent;
  density: TableDensity;
  alternateRows: boolean;
  roundedCards: boolean;
  visibleStandardColumns: {
    role: boolean;
    experience: boolean;
    stage: boolean;
    rating: boolean;
    status: boolean;
    applied: boolean;
    notes: boolean;
  };
  customFields: CustomField[];
}

export const PREDEFINED_CUSTOM_FIELDS: Omit<CustomField, "id">[] = [
  {
    key: "linkedinUrl",
    label: "LinkedIn URL",
    type: "url",
    placeholder: "https://linkedin.com/in/...",
    defaultValue: "",
    required: false,
  },
  {
    key: "noticePeriod",
    label: "Notice Period",
    type: "text",
    placeholder: "e.g., Immediate, 15 Days, 30 Days",
    defaultValue: "30 Days",
    required: false,
  },
  {
    key: "expectedCtc",
    label: "Expected CTC",
    type: "text",
    placeholder: "e.g., ₹18 LPA",
    defaultValue: "Negotiable",
    required: false,
  },
  {
    key: "portfolioUrl",
    label: "Portfolio / GitHub",
    type: "url",
    placeholder: "https://github.com/...",
    defaultValue: "",
    required: false,
  },
];

export const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  version: "v1.0",
  versionHistory: [
    {
      version: "v1.0",
      timestamp: "2026-09-12 09:30",
      changes: ["Initial baseline solution generated from business discovery."],
    },
  ],
  accent: "teal",
  density: "comfortable",
  alternateRows: true,
  roundedCards: true,
  visibleStandardColumns: {
    role: true,
    experience: true,
    stage: true,
    rating: true,
    status: true,
    applied: true,
    notes: true,
  },
  customFields: [
    {
      id: "cf-1",
      key: "noticePeriod",
      label: "Notice Period",
      type: "text",
      placeholder: "e.g., 30 Days",
      defaultValue: "30 Days",
      required: false,
    },
    {
      id: "cf-2",
      key: "expectedCtc",
      label: "Expected CTC",
      type: "text",
      placeholder: "e.g., ₹18 LPA",
      defaultValue: "₹15-20 LPA",
      required: false,
    },
    {
      id: "cf-3",
      key: "linkedinUrl",
      label: "LinkedIn URL",
      type: "url",
      placeholder: "https://linkedin.com/in/...",
      defaultValue: "https://linkedin.com",
      required: false,
    },
  ],
};

const STORAGE_KEY = "bizzmitra.solutionStudio";

export function loadStudioSettings(): StudioSettings {
  if (typeof window === "undefined") return DEFAULT_STUDIO_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STUDIO_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STUDIO_SETTINGS,
      ...parsed,
      visibleStandardColumns: {
        ...DEFAULT_STUDIO_SETTINGS.visibleStandardColumns,
        ...(parsed.visibleStandardColumns || {}),
      },
      customFields: parsed.customFields || DEFAULT_STUDIO_SETTINGS.customFields,
      versionHistory: parsed.versionHistory || DEFAULT_STUDIO_SETTINGS.versionHistory,
    };
  } catch {
    return DEFAULT_STUDIO_SETTINGS;
  }
}

export function saveStudioSettings(settings: StudioSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("bizzmitra:studio-updated", { detail: settings }));
  } catch (err) {
    console.error("Failed to persist studio settings:", err);
  }
}
