# BizzMitra-AI — Theme & Motion Conventions

## Chosen direction: **A — "Warm Graphite"**

Chosen because the product is light-mode-first (document/artifact heavy reading
surfaces: framing docs, ER diagrams, roadmaps) and because burnt coral on warm
off-white reads as "consulting-grade companion", not "another purple AI wrapper".
Direction B (Ink & Citrus) was rejected for this round.

Design language: **Neu-Bold-Minimal** — minimalist layout skeleton, oversized
display typography as the hero visual, soft neumorphism used selectively as an
accent (buttons, chat input, workspace switcher, active artifact cards, toggles).

## Tokens

All tokens live in `src/styles.css` (Tailwind v4 CSS-first `@theme inline`).
Never hardcode hex/`text-white`/`bg-blue-500` in components.

| Token | Light | Role |
| --- | --- | --- |
| `--background` | `#F5F3EE`-equivalent oklch | page base |
| `--surface` / `--surface-2` | warm greys | neumorphic bases |
| `--primary` | burnt coral `#FF5A3C`-equivalent | single accent: CTAs, focus rings, active states |
| `--foreground` / `--ink` | near-black `#1B1B1B` | type |
| `--muted-foreground` | `#8A8478`-equivalent | secondary copy |
| `--sage` | muted olive `#7A8B6F` | AI-confidence indicators only |
| `--chart-1..5` | coral, sage, graphite, amber, stone | all Recharts series |

Dark mode is a full mirror of the same palette (`.dark`).

## Typography

- Display: **Bricolage Grotesque** (700–900, tracking `-0.03em`), used at
  72–120px on desktop hero. Utility: `font-display`.
- Body: **Inter Tight** (400–600). Utility: default `font-sans`.
- Never Inter/Poppins/system-ui as display type.

## Neumorphic utilities

`neu`, `neu-sm`, `neu-inset`, `neu-press` (press = scale 0.97 + inset shadow).
Below `640px` these flatten to a 1px border — soft shadows go muddy on mobile.

## Motion conventions (Framer Motion / `motion/react`)

| Surface | Motion |
| --- | --- |
| Route change | fade + 10px rise, 200ms ease-out (`PageTransition`) |
| Hero headline | word stagger, 40ms/word |
| Cards | `whileInView` fade+rise stagger; hover `y:-4, scale:1.015`, 150ms |
| Buttons | neumorphic press (scale .97 + inset), not colour-only |
| Sidebar / tabs | shared-element `layoutId` sliding pill |
| AI thinking | custom breathing 3-dot pulse in coral — never a spinner |
| AI response | word-by-word typewriter, ~18ms/char |
| Artifact generation | animated 4-step progress list, then content fades in |
| Stats | count-up on mount |

## Mock AI boundary

Every simulated generation goes through `src/lib/ai/generate-artifact.ts`
(`generateArtifact(kind, ctx)`). Swap its body for a Groq/Gemini call — no UI
changes required. Seed content lives in `src/lib/demo-data.ts`.
