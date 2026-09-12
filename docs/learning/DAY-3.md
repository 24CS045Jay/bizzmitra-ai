# Day 3 — Technical Learning: Solution Builder & Interactive HR CRM

> Engineering journal for Day 3 of the BizzMitra-AI 8-day sprint (September 12, 2026).
> This document covers the technical concepts, implementation patterns, and design decisions
> used to build the Solution Builder and Interactive Workable HR CRM (USP #1).

---

## 1. React State Management for CRUD Tables

The HR CRM candidate pipeline table is entirely **state-driven** using React's `useState` hook:

```typescript
const [candidates, setCandidates] = useState<CRMCandidate[]>([...HR_CRM_CANDIDATES]);
```

**Key patterns used:**
- **Immutable updates**: When adding a candidate, we spread the previous state and prepend the new record (`[newCandidate, ...prev]`), ensuring React detects the state change and re-renders.
- **Derived state with `useMemo`**: Filtered candidates are computed reactively — they recalculate whenever search, stage, status, or experience filters change, without storing a separate "filtered" state.
- **Stable callbacks with `useCallback`**: Event handlers like `addCandidate`, `exportCSV`, and `handlePunchIn` are memoised to prevent unnecessary child re-renders.

### Why not useReducer?
For CRUD tables with simple add/filter operations, `useState` + `useMemo` is sufficient. `useReducer` becomes valuable when state transitions grow complex (e.g., undo/redo, batch updates, conflict resolution).

---

## 2. Client-Side CSV Export

CSV export is implemented entirely in the browser without any server call:

```typescript
const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = `bizzmitra_candidates_${date}.csv`;
link.click();
URL.revokeObjectURL(link.href);
```

**How it works:**
1. **Blob API** — creates a binary file object in memory.
2. **URL.createObjectURL** — generates a temporary download URL.
3. **Programmatic link click** — triggers the browser's native download dialog.
4. **URL.revokeObjectURL** — frees the allocated memory after the download starts.

**CSV formatting considerations:**
- Notes containing commas or quotes are wrapped in double quotes with internal quotes escaped (`""` convention).
- The export respects the current filter state — only visible/filtered candidates are exported.

---

## 3. Interactive Filter Patterns

### Multi-filter composition
Filters are composed as a chain of `Array.filter()` conditions inside a `useMemo`:

```typescript
const filtered = useMemo(() => {
  return candidates.filter((c) => {
    if (stageFilter !== "All" && c.stage !== stageFilter) return false;
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    if (c.experience < expRange[0] || c.experience > expRange[1]) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
    }
    return true;
  });
}, [candidates, stageFilter, statusFilter, expRange, searchQuery]);
```

This pattern is O(n) per filter change — fast enough for client-side datasets up to ~10,000 rows.

### Animated stage tabs
The active tab uses Framer Motion's `layoutId` to create a smooth pill animation:
```tsx
<motion.span layoutId="stage-pill" className="..." />
```
This creates the illusion of the pill physically moving between tabs rather than appearing/disappearing.

---

## 4. Modal Form Pattern

The Add Candidate modal follows a clean separation pattern:

1. **Overlay**: Semi-transparent backdrop with `onClick={onClose}` for dismissal.
2. **Content panel**: `onClick={(e) => e.stopPropagation()}` prevents clicks inside the modal from closing it.
3. **Form validation**: HTML5 `required` attributes for client-side validation.
4. **Auto-focus**: `useEffect` + `useRef` to focus the first input on mount for accessibility.
5. **Spring animation**: Modal scales up with `type: "spring"` for a premium feel.

---

## 5. Timer Implementation (Attendance Punch Clock)

The live elapsed timer uses `setInterval` with cleanup:

```typescript
useEffect(() => {
  if (!isPunchedIn || !punchInTime) return;
  const id = setInterval(() => {
    setElapsed(Math.floor((Date.now() - punchInTime.getTime()) / 1000));
  }, 1000);
  return () => clearInterval(id);
}, [isPunchedIn, punchInTime]);
```

**Key points:**
- The interval is created only when `isPunchedIn` is true — no wasted cycles.
- The cleanup function (`return () => clearInterval(id)`) prevents memory leaks when the component unmounts or the punch state changes.
- Elapsed time is derived from the difference between `Date.now()` and `punchInTime`, not from an incrementing counter. This avoids drift over long sessions.

---

## 6. Build vs. Buy Decision Matrix Design

The decision matrix uses a **multi-dimensional scoring model**:

| Dimension | What it measures |
|-----------|-----------------|
| Cost Efficiency | Total cost of ownership over 12 months |
| Delivery Speed | Time from decision to first production deployment |
| Control | Ability to customise workflows, data schema, and integrations |
| Agency Fit | How well the option matches a boutique 8-person agency's needs |

Each score is rendered as a proportional width bar (`width: ${(score/5) * 100}%`) with colour coding based on the verdict (Recommended = primary, Viable = amber, Rejected = muted).

---

## 7. TypeScript Type Design for Domain Models

```typescript
export type CRMCandidate = {
  id: string;
  name: string;
  email: string;
  role: string;
  experience: number;
  stage: "Screening" | "Interview" | "Offer" | "Rejected";
  rating: number;
  status: "Active" | "On Hold" | "Hired" | "Withdrawn";
  appliedDate: string;
  notes: string;
};
```

**Design decisions:**
- `stage` uses a **string union type** instead of an enum — this is idiomatic modern TypeScript and works better with `Array.filter()` comparisons.
- `appliedDate` is stored as an ISO string (`"2026-09-01"`) rather than a `Date` object — this makes it serialisable for JSON/localStorage without conversion.
- `rating` is a plain number (1–5) rather than a branded type — sufficient for display purposes.

---

## 8. File-Based Routing with TanStack Router

The CRM page is created as `workspace.solution.crm.tsx`, which TanStack Router automatically maps to the route `/workspace/solution/crm`:

```
src/routes/
  workspace.solution.tsx      → /workspace/solution
  workspace.solution.crm.tsx  → /workspace/solution/crm
```

The dot notation (`workspace.solution.crm`) creates a **nested path** without requiring a layout wrapper. This is a key advantage of TanStack Router's file-based convention.

---

## 9. Neumorphic UI Tokens Used

| Token | Usage |
|-------|-------|
| `neu` | Main container cards (candidate table, attendance section) |
| `neu-inset` | Inner recessed surfaces (stat cards, filter inputs, score bars) |
| `neu-sm` | Small interactive elements (filter buttons, badge pills) |
| `neu-press` | Pressable buttons with active-state shadow inversion |

---

## 10. Performance Considerations

- **`useMemo` for filtered data**: Prevents re-filtering on every render — only runs when dependencies change.
- **`useCallback` for event handlers**: Prevents unnecessary re-creation of functions that are passed as props.
- **`AnimatePresence` with `key` on table rows**: Enables smooth enter/exit animations without re-mounting the entire table.
- **Pagination consideration**: Current implementation renders all 15 candidates. For production with 1,000+ records, virtualised lists (e.g., `@tanstack/react-virtual`) would be needed.
