# Blueprint Buddy

# MASTER PROMPT — Paste this entire document into your AI coding tool (Claude Code / Cursor / bolt.new / lovable / v0 / Windsurf)

---

## ROLE

You are a senior full-stack product engineer and UI/UX designer. You are building a **demo-round, investor/judge-facing prototype** of a SaaS platform called **BizzMitra-AI**. This is NOT the final production build — it is a polished, believable, highly-animated **frontend-first prototype** that *looks and feels* like a fully working enterprise SaaS product, backed by a lightweight Node.js + Supabase + JWT setup that simulates real behavior using realistic mock/seed data instead of a fully wired AI backend.

Read this entire prompt before writing any code. Do not start with a generic dashboard template. Do not default to a typical "AI startup" look (dark navy + purple gradient + glassmorphism cards + Inter font + rocket-ship hero). That look is overused and will make this look like every other AI wrapper. Follow the design system in Section 3 exactly.

---

## 1. PRODUCT CONTEXT (read this so every screen you build is on-brand)

**Product name:** BizzMitra-AI ("Mitra" = friend/companion in Hindi/Sanskrit) — positioned as an AI business transformation companion, not a generic tool.

**One-line pitch:** *"From business problem to implementation-ready blueprint, in one AI-guided workspace — not five disconnected tools."*

**What it does:** A user describes a business problem (typed, spoken, or via uploaded PDF/DOCX/PPT) → the AI asks clarifying discovery questions → the AI generates a connected chain of artifacts: problem framing → solution recommendation → tech stack → architecture (HLD/LLD) → process workflow (BPMN) → database/API design → UX wireframes → effort estimate & roadmap → all inside one persistent, versioned, exportable workspace.

**Target users:** non-technical founders, business analysts, product managers, solution architects, enterprise digital-transformation leads.

**Core differentiator to visually communicate:** everything lives in ONE connected workspace — competitors (ChatGPT, Lucidchart, LeanIX, Jira) each solve one isolated slice. Your UI should visually reinforce "connectedness" — e.g. a workspace/artifact map, linked breadcrumbs between artifacts, a visible chain/thread motif.

---

## 2. TECH STACK (explicit — do not substitute)

- **Frontend:** React (Vite) + TypeScript + Tailwind CSS (heavily customized theme, not default config) + Framer Motion for animation
- **Backend:** Node.js + Express (REST API layer)
- **Database:** Supabase (PostgreSQL) — use it for schema/tables even in prototype mode (workspaces, users, artifacts, messages)
- **Auth:** JWT-based authentication implemented end-to-end (signup, login, protected routes, refresh token handling, logout) — real auth flow, not Supabase's built-in auth widget. Passwords hashed (bcrypt), tokens signed and verified on the Express server, stored client-side appropriately (httpOnly cookie preferred, or secure localStorage pattern — pick one and implement it correctly).
- **Routing:** React Router
- **State:** React Context or Zustand (lightweight — avoid Redux boilerplate for a prototype)
- **Diagrams:** Mermaid.js (render architecture/ER/BPMN diagrams from text — this can be pre-seeded static Mermaid strings for the demo)
- **Icons:** Lucide React
- **Charts (dashboard):** Recharts

### Prototype scope rule — read carefully
This is Round 1. **Full working AI generation and CRUD are NOT required.** What IS required:
- Every screen is fully built, fully styled, fully animated, and fully navigable
- Auth (signup/login/logout/protected routes) actually works end-to-end with the Node.js + JWT + Supabase stack
- Every AI-generation flow (chat discovery, artifact generation, export) is *simulated*: realistic typing/streaming animation, a believable delay (1.5–3s with a skeleton/loading state), then renders **pre-written, high-quality, realistic sample output** (see Section 5 for the seed content to use) — so it *feels* live even though it's returning curated content
- Data can be stored in Supabase and fetched normally where it's simple (workspace list, saved artifacts) — but the "AI brain" itself is mocked
- Structure the code so a real LLM call can later replace the mock function with zero UI changes (isolate the mock behind a single `generateArtifact()` service function)

---

## 3. DESIGN SYSTEM — THIS IS THE MOST IMPORTANT SECTION

**Do not generate a default, template-looking, "AI SaaS" theme.** No default shadcn look, no stock dark-navy-and-purple-gradient hero, no generic Inter/system-ui font at default weights, no cookie-cutter glassmorphism cards, no rocket/sparkle iconography clichés. Judges have seen that exact look hundreds of times this year — it must not look like a Claude/ChatGPT-generated demo.

### 3.1 Core design direction: **Neu-Bold-Minimal**
A deliberate fusion of three ideas:

1. **Soft Neumorphism (used selectively, not everywhere)** — apply to key interactive surfaces only: buttons, toggle switches, the AI chat input bar, card containers holding an "active" artifact, the workspace switcher. Use soft dual-direction shadows (light source top-left) on an off-white or deep-charcoal base so elements look gently extruded/pressed from the background. Do NOT neumorphism every element — overuse kills contrast and accessibility. Use it as an accent language for 15-20% of surfaces.
2. **Bold Typography as the hero visual element** — instead of illustrations or stock imagery, use oversized, high-contrast type as the primary visual anchor on the landing page and section headers. Pick a distinctive display typeface pairing:
   - Display/headline font: something with real character — e.g. **"Clash Display", "General Sans", "Bricolage Grotesque", "Space Grotesk"**, or **"Fraunces"** (serif-bold option) — NOT Inter, NOT Poppins, NOT the default system font.
   - Body font: a clean, highly legible grotesk — e.g. **"Satoshi", "Inter Tight", "Geist"** — paired to contrast with the display font.
   - Headline sizes should feel unapologetically large (e.g. 72–120px on desktop hero), tight letter-spacing, heavy weight (700–900) on key phrases, with a lighter-weight accent word or two for rhythm.
3. **Minimalist structural UI** — generous whitespace, restrained color usage (see palette below), no unnecessary borders/dividers, clear grid alignment, content-first layouts. Minimalism governs the *layout skeleton*; neumorphism and bold type are the *accent layers* on top of it.

### 3.2 Color palette (pick ONE of these directions and commit fully — do not mix)
**Direction A — "Warm Graphite"** (recommended, distinct from typical AI blue):
- Background: `#F5F3EE` (warm off-white) / dark mode `#181614`
- Primary accent: `#FF5A3C` (a confident burnt-orange/coral — NOT purple, NOT the typical AI blue-violet)
- Secondary accent: `#1B1B1B` (near-black for text and neumorphic base)
- Supporting neutral: `#EDEAE3`, `#8A8478`
- Success/AI-highlight: a muted olive/sage `#7A8B6F` used sparingly for "AI confidence" indicators

**Direction B — "Ink & Citrus"** (alternative):
- Background: `#0E0F0C` dark / `#FAFAF6` light
- Primary accent: `#C9F04A` (acid lime/citrus)
- Secondary: `#232620`
- Used for a bolder, more startup-hackathon energy

Pick Direction A unless the build environment strongly favors dark-mode-first, in which case use Direction B. State clearly in a `THEME.md`/`tailwind.config` comment which one was chosen and why, and implement it consistently — every button, focus ring, chart color, and badge must come from this palette, not Tailwind's default `blue-500`/`purple-600` defaults.

### 3.3 Motion & animation requirements (component-wise, not just page transitions)
Use Framer Motion throughout. Every interactive surface needs intentional motion — nothing should feel static or "AI-default."

- **Page/route transitions:** subtle fade + 8–12px vertical slide on route change (150–250ms, ease-out)
- **Landing page hero:** staggered word-by-word or line-by-line reveal of the bold headline on load (stagger ~40ms/word), a subtly animated background element (e.g. a slow-moving grain/noise texture, or a mermaid-diagram-style connecting-lines animation representing "problem → blueprint")
- **Cards (feature cards, module cards, workspace cards):** on hover — lift (translateY -4px), soft shadow deepen, slight scale (1.01–1.02), 150ms ease; on scroll into view — staggered fade+slide-up using `whileInView`
- **Buttons:** neumorphic press effect on click (scale down 0.97 + shadow inset), not just a color change
- **AI chat/discovery screen:** simulate realistic AI "thinking" with a custom animated indicator (not a generic spinner — design a small pulsing dot sequence or a subtly breathing shape in the accent color), then stream the AI's response text character-by-character or word-by-word (typewriter effect, ~15–25ms/char)
- **Artifact generation (architecture/DB/roadmap screens):** show a progress sequence (e.g. "Analyzing context → Mapping requirements → Drafting architecture → Finalizing") as an animated step list before the Mermaid diagram or content fades/draws in
- **Navigation/sidebar:** icons and active-state indicator use a smooth sliding "pill" background (layoutId-based Framer Motion shared-element transition), not an instant class swap
- **Toggle/switches, tabs:** smooth sliding thumb/indicator, not a hard cut
- **Numbers/stats on the Transformation Dashboard:** count-up animation on load
- **Micro-details:** cursor-aware subtle tilt/parallax on hero graphic elements is a nice-to-have if time allows

### 3.4 What to explicitly avoid
- Default shadcn/ui out-of-the-box look with zero customization
- Purple-to-blue gradients as the "AI" signal
- Generic rocket ship / sparkle / brain icon as the hero motif
- Inter or system-ui at default weight as the display font
- Glassmorphism as the primary language (blur-everything look) — allowed only as a very subtle accent, never dominant
- Symmetric, centered, template-feeling landing pages with a giant screenshot in a browser mockup — instead use bold type, asymmetric layout, and real interactive component previews

---

## 4. INFORMATION ARCHITECTURE / PAGES TO BUILD

Build all of the following as fully designed, animated, navigable screens.

### Public / Marketing
1. **Landing Page** — bold-type hero with the one-line pitch, a live-feeling mini interactive demo widget (type a problem → animated fake AI response preview), "problem vs solution" comparison section (mirrors the competitive table: fragmented tools vs BizzMitra-AI in one workspace), module showcase grid (11 core modules from the blueprint — animate each on scroll), pricing tiers (Free / Pro / Team / Enterprise), testimonials/logos placeholder section, footer.
2. **Login** / **Signup** pages — neumorphic input fields, real JWT flow, form validation with animated error states, "Continue with Google" placeholder button (UI only).

### Authenticated app (behind JWT-protected routes)
3. **Workspace Selector / Dashboard Home** — list/grid of workspaces (create new workspace CTA), each workspace card shows a small "AI readiness" or "maturity" progress ring.
4. **New Workspace / Intake Screen** — the core "describe your business problem" screen: large text input, drag-and-drop document upload zone (PDF/DOCX/PPT, styled distinctly, with file-type icons and upload progress animation), a few example prompt chips users can click.
5. **AI Discovery Chat** — conversational UI where the AI asks 2–3 clarifying questions (simulated, pre-scripted based on the sample scenario in Section 5) with the typewriter/streaming animation described above.
6. **Solution Overview / Problem Framing artifact page** — clean document-style layout showing: problem framing, recommended solution approach + trade-offs, recommended tech stack, with an editable/regenerate affordance (icon buttons — regenerate can be non-functional but must animate a "regenerating" state on click).
7. **Solution Architecture Builder** — renders an HLD Mermaid diagram, with a toggle between HLD/LLD, and a right-side panel explaining each architecture component.
8. **Process Intelligence Designer** — BPMN-style Mermaid flowchart of the "before vs after" process, swimlane view toggle.
9. **AI UX Designer / Wireframes** — a gallery of simple wireframe-style screen mockups (can be simplified SVG/HTML block mockups representing screens, not real hi-fi UI) with a navigation-flow diagram connecting them.
10. **Database & Integration Designer** — Mermaid ER diagram + a styled table listing suggested REST API endpoints (method, path, description).
11. **AI Planning Engine / Roadmap** — a horizontal animated timeline/roadmap (phases, milestones, effort estimate cards, a simple Gantt-style bar chart via Recharts) plus a small "AI ROI calculator" widget (Section 6.2 differentiator) with sliders that recalculate a mock savings number live.
12. **Transformation Dashboard** — the "home base" analytics view: digital maturity score, AI-readiness score, automation opportunities count, project health, all as animated stat cards + a couple of Recharts charts (radar chart for readiness dimensions works well here and is visually distinctive).
13. **Workspace artifact map** — a visual node-graph (can use a simple custom SVG/Framer Motion layout, not necessarily a heavy graph library) showing how all the generated artifacts connect — this is your strongest visual differentiator vs competitors, make it a signature screen.
14. **Export modal** — triggered from any artifact page; shows format choices (PDF/Word/Excel/PPT) with a satisfying animated "preparing export" state and a mock download.
15. **Settings / Team / Admin** (lighter effort, but present): profile, workspace members with roles, a simple billing/plan page reflecting the pricing tiers.

---

## 5. SEED / MOCK CONTENT TO USE

Use this specific example scenario consistently across all demo screens so the product tells one coherent story (do not use generic Lorem Ipsum or "Business X" placeholders — specificity sells the demo):

> **Sample business problem (pre-filled/example):** "Our e-commerce support team is overwhelmed — 60% of tickets are repetitive order-status and return questions, average response time is 14 hours, and we're losing repeat customers because of it."

Have the AI discovery flow ask things like: "What's your current support volume per day?", "Do you have an existing helpdesk tool (Zendesk, Freshdesk, none)?", "What's your team size?" — then generate a coherent chain: recommended solution = AI-assisted support triage + self-serve order-status automation → recommended stack (e.g. Node.js + a helpdesk API integration + a small ML classification step) → architecture diagram → DB schema for tickets/orders → 6-week phased roadmap with effort estimates → ROI estimate (e.g. "~35% reduction in first-response time, ~₹X/month saved"). Keep all numbers/content internally consistent across the artifact pages so a reviewer clicking through the whole workspace sees one believable, connected story — this directly demonstrates the "connected workspace" USP.

---

## 6. DELIVERABLE EXPECTATIONS FOR THIS ROUND

- A working, deployable (Vercel/Render-friendly) React + Node.js + Supabase project
- Real JWT auth flow (signup → login → protected dashboard → logout)
- Every page in Section 4 fully built, styled per Section 3, and reachable via navigation — no dead links, no "TODO" placeholder screens
- One coherent seeded demo journey (Section 5) that a judge/user can click through start to finish in under 3 minutes and come away impressed
- Fully responsive (mobile, tablet, desktop) — test the neumorphic elements especially at small sizes since soft shadows can look muddy on mobile; simplify them there if needed
- A short `THEME.md` documenting the chosen palette/fonts/animation conventions so Round 2 development stays consistent
- Code structured so swapping the mock `generateArtifact()` function for a real LLM call (Groq/Gemini) later requires no UI rework

Now build it. Start with the Tailwind theme config and design tokens (fonts, colors, shadow presets for the neumorphic components) before writing any page, then build the landing page, then auth, then the core workspace/artifact flow.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bizzmitra-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3920f119-df5c-46b3-8bf0-fde64d7fbdd1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
