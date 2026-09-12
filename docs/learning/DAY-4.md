# Day 4 — Technical Learning: Live Customizer, Field Builder & AI Regeneration (USP #2)

> Engineering journal for Day 4 of the BizzMitra-AI 8-day sprint (September 12, 2026).
> This document covers the technical concepts, implementation patterns, and design decisions
> used to build the Solution Studio Slide-Out Drawer, Dynamic Field Builder, and AI Regeneration Engine (USP #2).

---

## 1. Dynamic Runtime Schema Modeling in TypeScript

In traditional web applications, schemas are compiled statically. For USP #2 (Live Customizer), non-technical users need to define arbitrary business attributes at runtime without triggering code rebuilds or database migrations.

### Schema Definition
In `src/lib/solution-studio.ts`, schema attributes are modeled via the `CustomField` interface:

```typescript
export type FieldType = "text" | "number" | "url" | "select" | "date";

export interface CustomField {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string | undefined;
  defaultValue?: string | undefined;
  required?: boolean | undefined;
  options?: string[] | undefined;
}
```

### Key Architectural Decisions
- **CamelCase Auto-Slugification**: When users enter "Notice Period", the engine automatically derives `noticePeriod` via regex word boundary mapping:
  ```typescript
  const camel = val
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase(),
    )
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
  ```
- **Extensible Candidate Record**: Candidate models in `demo-data.ts` are extended with an optional dictionary `customValues?: Record<string, string | number>`, decoupling standard fields from user-defined metadata.

---

## 2. Dynamic Table Column Projection & Form Generation

Once new fields are added to the schema, both reading and writing interfaces must project these fields dynamically without page reload.

### Dynamic Projection in Table Headers & Cells
The CRM candidate table dynamically renders headers by concatenating standard visible columns with active custom attributes:

```tsx
{studioSettings.customFields.map((field) => (
  <th key={field.id} className={cn(cellDensityClass, "font-semibold text-primary")}>
    <span className="flex items-center gap-1">
      <Tag className="size-2.5 opacity-70" />
      {field.label}
    </span>
  </th>
))}
```

Cells are formatted according to their attribute type:
- `url`: Rendered with an external link icon and open-in-new-tab safety attributes (`rel="noreferrer"`).
- `number` / `text`: Formatted with subtle pill badges.

### Dynamic Modal Input Generation
When the "Add Candidate" modal opens, it reads `customFields` and dynamically maps each attribute to its corresponding HTML5 input type:

```tsx
{customFields.map((field) => (
  <div key={field.id}>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
      {field.label} {field.required && "*"}
    </label>
    <input
      type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
      value={customValues[field.key] ?? ""}
      onChange={(e) => setCustomValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}…`}
      required={field.required}
      className="mt-1 w-full neu-inset rounded-lg px-3 py-2 text-xs outline-none"
    />
  </div>
))}
```

---

## 3. Multi-Step Animated AI Regeneration Pipeline

User experience studies show that complex modifications feel more credible when accompanied by transparent, multi-step progress feedback rather than instant silent updates.

### The Pipeline Steps
In `src/components/AIRegenerationModal.tsx`, the regeneration engine progresses through four distinct phases:
1. **Schema AST Analysis**: Validates custom field types, uniqueness, and constraints.
2. **Data Pipeline Adjustment**: Reconciles candidate records and in-memory indices.
3. **CRM View Rebuilding**: Re-renders table columns, dynamic forms, and CSV serializers.
4. **Theme & Density Synthesis**: Applies neumorphic tokens, color classes, and spacing variables.

```typescript
const REGENERATION_STEPS: StepItem[] = [
  { id: 1, label: "Analyzing updated schema & field constraints…", icon: Database },
  { id: 2, label: "Adjusting data pipeline & type definitions…", icon: Cpu },
  { id: 3, label: "Rebuilding CRM views & dynamic table columns…", icon: Layers },
  { id: 4, label: "Applying theme accent & layout density…", icon: Sparkles },
];
```

### Version Incrementing & Automated Changelog
- When regeneration completes, the solution increments its version (`v1.0` → `v1.1` → `v1.2`).
- A timestamped entry is prepended to `versionHistory` with an automated summary of added attributes and theme adjustments.

---

## 4. Cross-Component Event Broadcasting with Native `CustomEvent`

When a user modifies theme accents or adds a custom field inside the `SolutionStudioDrawer`, other components (such as `workspace.solution.crm.tsx` and `workspace.solution.tsx`) must synchronize immediately without requiring a full page refresh.

### Event Dispatch Pattern
In `src/lib/solution-studio.ts`:
```typescript
export function saveStudioSettings(settings: StudioSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("bizzmitra:studio-updated", { detail: settings }));
}
```

### Event Listener Hook in Pages
```typescript
useEffect(() => {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<StudioSettings>;
    if (custom.detail) {
      setStudioSettings(custom.detail);
    }
  };
  window.addEventListener("bizzmitra:studio-updated", handler);
  return () => window.removeEventListener("bizzmitra:studio-updated", handler);
}, []);
```

This pattern provides zero-dependency, sub-millisecond reactive state sharing across any mounted component tree.

---

## 5. Neumorphic Tokens and Layout Density Controls

The UI Customizer supports three runtime densities:
- **Compact**: `px-3 py-1.5 text-xs` (high-density recruitment agency view)
- **Comfortable**: `px-4 py-2.5 text-xs` (balanced desktop view)
- **Spacious**: `px-5 py-3.5 text-sm` (touch-friendly or presentation view)

Combined with optional **Zebra alternating rows** (`odd:bg-card/35 even:bg-transparent`), users can adapt the interface to their visual comfort and viewport size.

---

## 6. Dynamic CSV Export Reconciliation

Exporting data to CSV must dynamically reflect schema extensions. The CSV serializer in `workspace.solution.crm.tsx` loops through active custom attributes and appends them to both the CSV header row and candidate data rows:

```typescript
const customHeaders = studioSettings.customFields.map((f) => f.label);
const headers = [...baseHeaders, ...customHeaders];

const rows = filtered.map((c) => {
  const row = [c.name, c.email, ...];
  for (const field of studioSettings.customFields) {
    const val = c.customValues?.[field.key] ?? field.defaultValue ?? "";
    row.push(`"${String(val).replace(/"/g, '""')}"`);
  }
  return row;
});
```

The exported file is timestamped and version-tagged: `bizzmitra_candidates_v1.1_2026-09-12.csv`.
