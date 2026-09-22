# BizzMitra AI — Complete Project Blueprint & Architecture Knowledge Base

> **Single-Source System Knowledge Document**  
> *Designed for LLMs (ChatGPT, Claude, Gemini) and Senior Engineers to understand, analyze, debug, and extend the entire BizzMitra AI codebase without needing repository zip uploads or file exploration.*

---

## 📋 Table of Contents
1. [AI Instructions & Persona Context](#1-ai-instructions--persona-context)
2. [Executive Summary & Product Vision](#2-executive-summary--product-vision)
3. [Core Unique Selling Propositions (USPs)](#3-core-unique-selling-propositions-usps)
4. [Complete Technology Stack & Dependencies](#4-complete-technology-stack--dependencies)
5. [Design System & Neu-Bold-Minimal Theme](#5-design-system--neu-bold-minimal-theme)
6. [Complete Repository Directory Tree](#6-complete-repository-directory-tree)
7. [Comprehensive File-by-File Dictionary](#7-comprehensive-file-by-file-dictionary)
   - [7.1 Root Configuration & Metadata Files](#71-root-configuration--metadata-files)
   - [7.2 Presentation Routes (`src/routes/`)](#72-presentation-routes-srcroutes)
   - [7.3 Application Components (`src/components/`)](#73-application-components-srccomponents)
   - [7.4 Business Logic & Data Stores (`src/lib/`)](#74-business-logic--data-stores-srclib)
   - [7.5 Server & API Gateway (`src/server/` & `src/server.ts`)](#75-server--api-gateway-srcserver--srcserverts)
   - [7.6 Custom React Hooks (`src/hooks/`)](#76-custom-react-hooks-srchooks)
   - [7.7 Integrations & Database (`src/integrations/` & `supabase/`)](#77-integrations--database-srcintegrations--supabase)
   - [7.8 Native Mobile Application (`apps/mobile/`)](#78-native-mobile-application-appsmobile)
8. [End-to-End Feature & Workflow Walkthrough](#8-end-to-end-feature--workflow-walkthrough)
9. [Database Schema, Security (RLS) & State Storage](#9-database-schema-security-rls--state-storage)
10. [RESTful API Gateway Specifications](#10-restful-api-gateway-specifications)
11. [Seeded Demonstration Storyline & Domain Payload](#11-seeded-demonstration-storyline--domain-payload)
12. [Environment Configuration & Deployment](#12-environment-configuration--deployment)

---

## 1. AI Instructions & Persona Context

When working with this codebase or answering queries as an assistant:
- **Role**: Senior Full-Stack Product Architect and Enterprise Systems Designer.
- **Design Philosophy**: Adhere strictly to the **Neu-Bold-Minimal** aesthetic (Direction A: Warm Graphite) with Bricolage Grotesque display typography and selective soft neumorphism. Never introduce generic purple-to-blue AI gradients, default unstyled cards, or standard system fonts.
- **Routing Paradigm**: Uses `@tanstack/react-router` and TanStack Start. Files inside `src/routes/` are file-based routes with `createFileRoute`. Layouts render `<Outlet />`. Root layout is `src/routes/__root.tsx`. Dynamic route params use bare `$` (e.g. `share.$token.tsx`).
- **AI Boundary**: Keep the isolated AI mock boundary in mind (`src/lib/ai/generate-artifact.ts` and `src/server/api-router.ts`). Any real LLM integration (Groq, Gemini, Anthropic) swaps behind this service boundary with zero UI disruption.
- **Cross-Component Reactivity**: The application coordinates state across routes using `localStorage` alongside custom browser event dispatches (`bizzmitra:studio-updated`, `bizzmitra:role-changed`, `bizzmitra:snapshot-restored`).

---

## 2. Executive Summary & Product Vision

### 2.1 Identity & Meaning
- **Product Name**: **BizzMitra AI**
- **Etymology**: *"Mitra"* means friend, ally, or trusted companion in Sanskrit and Hindi. BizzMitra AI is positioned as an **Enterprise Business Transformation Companion**, not an isolated tool or simple prompt wrapper.
- **One-Line Pitch**: *"From unstructured business problem to implementation-ready enterprise blueprint, in one unified, connected workspace — eliminating fragmented tools."*

### 2.2 The Problem It Solves
Traditional enterprise digital transformations are broken and fragmented:
1. Business teams define issues in static Word docs and emails.
2. Business analysts conduct discovery interviews manually over weeks.
3. System architects build separate diagrams in Lucidchart/Visio.
4. Database engineers independently model schemas in SQL/ER tools.
5. Project managers build disconnected delivery roadmaps in Jira or Excel.
6. Financial teams compute ROI in isolated spreadsheets.

Result: Disconnected artifacts, outdated documentation, architectural misalignment, slow time-to-market, and massive transformation failure rates.

### 2.3 The BizzMitra Solution
BizzMitra AI collapses this entire multi-month transformation lifecycle into a single **interlinked, versioned, interactive AI workspace**. An executive or architect inputs an unstructured problem (text or document upload), and the platform generates a continuous, connected chain of artifacts:
`Problem Framing → Solution Architecture (HLD/LLD) → Process Workflows (BPMN 2.0) → Dynamic HR CRM Application → Entity-Relationship Data Model & REST APIs → Implementation Roadmap & Gantt → Financial ROI Cockpit → Connected DAG Traceability Map → Enterprise Governance & Multi-Format Exports`.

---

## 3. Core Unique Selling Propositions (USPs)

### 🌟 USP #1: The Workable Prototype (Interactive HR CRM & Attendance Engine)
- **Location**: `/workspace/solution/crm` (`src/routes/workspace.solution.crm.tsx`)
- **Premise**: Instead of just generating static documentation, BizzMitra generates a **fully functional, interactive working prototype** directly inside the blueprint.
- **Capabilities**:
  - Full candidate pipeline state machine (Screening → Interview → Offer → Rejected) with count badges.
  - Multi-attribute search, experience range filtering, and dynamic candidate creation.
  - In-browser CSV generator via `Blob` API for candidate rosters.
  - Live employee attendance punch-clock with elapsed time tracker (`setInterval`), punch history logs, and automatic hours calculation.

### 🌟 USP #2: Solution Studio & Dynamic Schema Customizer with AI Regeneration
- **Location**: `src/components/SolutionStudioDrawer.tsx` & `src/components/AIRegenerationModal.tsx`
- **Premise**: Non-technical stakeholders can customize data schemas and user interfaces at runtime without writing code or redeploying.
- **Capabilities**:
  - **Dynamic Field Builder**: Non-technical users add custom attributes (e.g. `LinkedIn URL`, `Notice Period`, `Expected CTC`, `Portfolio`) supporting types `text`, `number`, `url`, `select`, `date` with required validation.
  - **UI Styler**: Live table density toggle (`compact`, `comfortable`, `spacious`), zebra row shading, neumorphic depth toggles, and accent palette switching (Teal, Indigo, Amber, Rose, Violet, Cyan).
  - **AI Regeneration Engine**: A 4-step animated synthesis pipeline (*Schema AST Analysis → Data Pipeline Adjustment → CRM View Rebuilding → Theme Synthesis*) that updates views across routes with zero reload, auto-incrementing blueprint versions from `v1.0` to `v1.1`.

### 🌟 USP #3: Connected Artifact Dependency Graph (DAG) & Traceability Engine
- **Location**: `/workspace/map` (`src/routes/workspace.map.tsx`)
- **Premise**: Eliminates disconnected business artifacts by proving 100% provenance back to the core business problem.
- **Capabilities**:
  - 11-node visual topology across 5 enterprise tiers: Foundation, Analysis, Solution & Workable Apps, Blueprints, and Execution.
  - Interactive bidirectional dependency computation: Clicking any node highlights in-degree (parent inputs consumed in amber) and out-degree (child outputs produced in emerald), while dimming unrelated nodes.
  - Node inspection drawer detailing artifact maturity, versions, input dependencies, output specifications, and direct navigation links.

---

## 4. Complete Technology Stack & Dependencies

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                                │
│   React 19.2 + TypeScript 5.8 + TanStack Router (File-Based Routes)     │
│   Tailwind CSS v4 (Neu-Bold-Minimal) + Motion (Framer Motion v13)       │
│   Mermaid.js 11 (Diagrams) + Recharts 2.15 (Data Viz) + Lucide React    │
├─────────────────────────────────────────────────────────────────────────┤
│                              SERVER TIER                                │
│   TanStack Start (Nitro 3.0 Engine) + Centralized API Gateway (/api/*)  │
│   Pure Client-Side Document Serializers (PDF, Word, CSV, SQL, OpenAPI)  │
├─────────────────────────────────────────────────────────────────────────┤
│                           DATA & AUTH TIER                              │
│   Supabase PostgreSQL 16 + Row-Level Security (RLS) Policies            │
│   Supabase Auth + Custom Profiles + 4-Tier RBAC Engine                  │
├─────────────────────────────────────────────────────────────────────────┤
│                           NATIVE MOBILE TIER                            │
│   React Native + Expo SDK 52 + Expo Router (Android APK & iOS)          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Frontend Framework & Libraries
- **React**: `19.2.0` (Latest modern concurrent React)
- **TypeScript**: `5.8.3` (Strict type safety)
- **Routing**: `@tanstack/react-router` `1.170.18` & `@tanstack/react-start` `1.168.32`
- **Data Fetching / Cache**: `@tanstack/react-query` `^5.101.1`
- **Styling**: `tailwindcss` `^4.2.1` with `@tailwindcss/vite` plugin
- **Motion & Animations**: `motion` `^13.1.1` (Framer Motion), `gsap` `^3.15.0`
- **UI Components & Primitives**: Radix UI (Dialog, Dropdown, Tabs, Tooltip, Sheet, Popover, Select, Accordion, Avatar, etc.)
- **Icons**: `lucide-react` `^0.575.0`
- **Diagrams & Charts**: `mermaid` `^11.17.2` (for architecture, BPMN, and ERD generation) and `recharts` `^2.15.4`
- **Forms & Validation**: `react-hook-form` `^7.71.2` + `zod` `^3.24.2` + `@hookform/resolvers`
- **Toasts**: `sonner` `^2.0.7`
- **Payments**: Razorpay Checkout SDK (`https://checkout.razorpay.com/v1/checkout.js`)

### 4.2 Backend & Data Storage
- **Runtime**: Node.js (v20+) / Nitro Server (`nitro@3.0.260603-beta`)
- **Database**: Supabase PostgreSQL 16
- **Database Client**: `@supabase/supabase-js` `^2.112.4`
- **Security**: PostgreSQL Row Level Security (RLS) on all tables

### 4.3 Mobile Application (`apps/mobile/`)
- **Runtime**: React Native `0.76.7`
- **Framework**: Expo SDK `52.0.37`
- **Navigation**: Expo Router `^4.0.17`
- **Icons**: `@expo/vector-icons`
- **Distribution Targets**: Android APK / AAB, iOS TestFlight

---

## 5. Design System & Neu-Bold-Minimal Theme

Documented in `THEME.md` and configured in `src/styles.css`.

### 5.1 The Aesthetic: Neu-Bold-Minimal
A deliberate combination of three design movements:
1. **Soft Neumorphism (Selective ~15-20%)**: Reserved for primary interactive controls (active artifact cards, buttons, chat input bar, toggles). Uses soft dual-direction light-source shadows. Below `640px` (mobile), shadows flatten to clean 1px borders to prevent muddy rendering.
2. **Bold Typography as Visual Anchor**:
   - **Display / Hero Font**: `Bricolage Grotesque` (Weights: 700–900, tracking `-0.03em`, rendered at 72–120px on desktop).
   - **Body / Content Font**: `Inter Tight` (Weights: 400–600).
   - *Explicitly avoids*: Default Inter, Poppins, or system fonts for display type.
3. **Minimalist Structural Skeleton**: Generous whitespace, content-first grid layouts, warm neutral backgrounds, and restrained color accents.

### 5.2 Color Tokens (Direction A — Warm Graphite)
- **Background (`--background`)**: `#F5F3EE` (Warm off-white base) / Dark mode: `#181614`
- **Primary Accent (`--primary`)**: `#FF5A3C` (Confident burnt coral / terracotta — NOT generic AI purple/blue)
- **Foreground / Ink (`--foreground`)**: `#1B1B1B` (Near-black for high contrast readability)
- **Surfaces (`--surface`, `--surface-2`)**: Warm tactile greys for extruded neumorphic cards
- **Muted Foreground (`--muted-foreground`)**: `#8A8478` (Subtle secondary copy)
- **AI Confidence / Success (`--sage`)**: `#7A8B6F` (Muted olive/sage for readiness badges)
- **Charts (`--chart-1` to `--chart-5`)**: Curated coral, sage, graphite, amber, stone

### 5.3 Neumorphic CSS Classes
- `.neu`: Standard soft dual-direction box shadow (`5px 5px 10px #d5d3ce, -5px -5px 10px #ffffff`).
- `.neu-sm`: Compact subtle shadow for small chips and controls.
- `.neu-inset`: Inverted inner shadow for inputs, toggles, and pressed states.
- `.neu-press`: Interactive active click effect (scales to 0.97 + applies inset shadow).

---

## 6. Complete Repository Directory Tree

```text
bizzmitra-ai/
├── .env                              # Root environment variables (Supabase, Razorpay)
├── .env.local                        # Local development overrides
├── .gitignore                        # Git exclusion rules
├── AGENTS.md                         # Lovable sync & git branch rules
├── DEPLOYMENT.md                     # Production deployment guide (Vercel, Node, Docker)
├── MOBILE_SETUP.md                   # Mobile setup & build instructions (Expo SDK 52)
├── README.md                         # Product overview & prompt specification
├── ROADMAP-8-DAYS.md                 # 8-day sprint execution roadmap
├── THEME.md                          # Design tokens, typography & motion guidelines
├── bunfig.toml                       # Bun runtime configuration
├── capacitor.config.ts               # Capacitor cross-platform mobile wrapper config
├── components.json                   # shadcn component registration configuration
├── eslint.config.js                  # ESLint 9 configuration
├── package.json                      # Workspace dependencies and scripts
├── tsconfig.json                     # TypeScript compiler settings & path aliases
├── vite.config.ts                    # Vite build configuration with TanStack Start & Tailwind
│
├── apps/
│   └── mobile/                       # React Native / Expo SDK 52 Native Mobile App
│       ├── app.json                  # Expo project metadata (slug, bundleIdentifier)
│       ├── eas.json                  # Expo Application Services cloud build profiles
│       ├── package.json              # Mobile package dependencies
│       ├── tsconfig.json             # Mobile TypeScript settings
│       ├── app/                      # Expo Router File-Based Routing
│       │   ├── _layout.tsx           # Mobile root navigation stack & query provider
│       │   ├── settings.tsx          # Mobile settings, credentials & session manager
│       │   ├── (auth)/               # Mobile authentication screens
│       │   │   ├── _layout.tsx       # Auth stack layout
│       │   │   ├── login.tsx         # Mobile JWT login screen
│       │   │   └── signup.tsx        # Mobile account registration screen
│       │   ├── (tabs)/               # Bottom Tab Navigation
│       │   │   ├── _layout.tsx       # Tab bar configuration & icons
│       │   │   ├── index.tsx         # Mobile Home & Transformation Overview
│       │   │   ├── projects.tsx      # Mobile Workspaces & Blueprints List
│       │   │   ├── ai.tsx            # Mobile AI Companion Chat & Discovery
│       │   │   ├── documents.tsx     # Mobile Uploaded Docs & Ingestion
│       │   │   └── notifications.tsx # Mobile Transformation Activity Alerts
│       │   └── artifact/
│       │       └── [id].tsx          # Mobile Dynamic Artifact Viewer
│       └── src/
│           ├── hooks/                # Mobile useAuth, useWorkspaces hooks
│           ├── services/             # Mobile API client service
│           └── types/                # Mobile shared data interfaces
│
├── docs/                             # Engineering Architecture & Changelogs
│   ├── ARCHITECTURE.md               # 20-module technical system architecture
│   ├── CHANGELOG.md                  # Comprehensive Day 1-8 implementation changelog
│   ├── ROADMAP-8-DAYS.md             # Sprint milestones and verification checklist
│   └── learning/                     # Architecture study notes
│
├── public/                           # Static public assets (favicons, icons, manifest)
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
│
├── supabase/                         # Database Schemas & Migrations
│   ├── config.toml                   # Supabase local environment config
│   ├── full_schema_setup.sql         # Complete production SQL DDL (Tables, RLS, Triggers)
│   └── migrations/                   # Individual versioned migration files
│
└── src/                              # Main Full-Stack Application Source
    ├── router.tsx                    # TanStack Router instance creation
    ├── routeTree.gen.ts              # Auto-generated TanStack route tree
    ├── server.ts                     # Nitro server entrypoint with API dispatcher
    ├── start.ts                      # Client-side router hydrator
    ├── styles.css                    # Global Tailwind v4 CSS, fonts & neu utility tokens
    │
    ├── assets/                       # Images, logos and brand graphics
    │
    ├── hooks/                        # Custom React Hooks
    │   ├── use-mobile.tsx            # Window breakpoint listener for responsive layouts
    │   ├── useAuth.tsx               # Supabase JWT Auth context, login, signup, bypass
    │   └── useTheme.tsx              # Dark/Light mode switcher with localStorage sync
    │
    ├── integrations/                 # External Service Connectors
    │   └── supabase/
    │       ├── auth-attacher.ts      # HTTP header token attacher
    │       ├── auth-middleware.ts    # SSR auth verification middleware
    │       ├── client.server.ts      # Server-side Supabase client factory
    │       ├── client.ts             # Client-side Supabase singleton client
    │       ├── cron-auth.ts          # Scheduled job authentication
    │       ├── previewAuthStorage.ts # In-memory / cookie auth storage adapter
    │       └── types.ts              # Auto-generated Supabase database type interfaces
    │
    ├── lib/                          # Core Data Models, Engines & Helpers
    │   ├── admin-rbac-data.ts        # RBAC definitions (Admin, Architect, Analyst, Viewer)
    │   ├── architecture-data.ts      # HLD/LLD Mermaid schemas, component inspect details
    │   ├── artifact-map-data.ts      # 11-node DAG graph data, in/out dependencies
    │   ├── collaboration-data.ts     # Governance sign-offs, stage gates, threaded reviews
    │   ├── database-data.ts          # Crow's Foot ERD, PostgreSQL DDL, REST API endpoints
    │   ├── demo-data.ts              # Master seed scenario, 15 CRM candidates, punch records
    │   ├── document-exporters.ts     # Client-side Word Doc HTML & CSV table generators
    │   ├── document-parser.ts        # Client-side PDF/DOCX/TXT text extractor
    │   ├── error-capture.ts          # Global client/server error buffer
    │   ├── error-page.ts             # Catastrophic SSR failure HTML fallback renderer
    │   ├── export-engine.ts          # Universal serializers (OpenAPI JSON, SQL DDL, Markdown)
    │   ├── i18n.ts                   # Multi-language dictionary (EN, HI, ES, FR, DE, JA, AR)
    │   ├── login-background.ts       # Animated canvas background generator
    │   ├── lovable-error-reporting.ts# Telemetry crash reporter
    │   ├── planning-data.ts          # 3-phase delivery roadmap, Gantt bars, FTE staffing
    │   ├── process-data.ts           # BPMN 2.0 As-Is vs To-Be flows, bottleneck matrices
    │   ├── razorpay.ts               # Razorpay checkout script loader & payment trigger
    │   ├── risk-evaluator.ts         # Risk matrix calculator & mitigation scoring
    │   ├── roi-data.ts               # Dynamic financial ROI calculator algorithm & curves
    │   ├── solution-studio.ts        # Schema customization store & CustomEvent bus
    │   ├── utils.ts                  # ClassName merging helper (clsx + twMerge)
    │   ├── version-control-data.ts   # Blueprint AST diff engine & snapshot models
    │   └── ai/
    │       ├── generate-artifact-payloads.ts # Seed payloads for all 8 artifact types
    │       └── generate-artifact.ts          # Mock AI generator with simulated latency
    │
    ├── server/                       # Server-Side Routing Layer
    │   └── api-router.ts             # Centralized REST API (/api/auth, /api/workspaces, etc.)
    │
    ├── shared/                       # Cross-Tier Type Definitions
    │   └── types/
    │       └── api-types.ts          # Shared API request and response interfaces
    │
    ├── components/                   # React Application Components
    │   ├── About10.tsx               # About page mission & team showcase
    │   ├── AiCopilotPanel.tsx        # Persistent slide-out AI assistant drawer
    │   ├── AiModelPaymentModal.tsx   # AI credit purchase & Razorpay payment dialog
    │   ├── AIRegenerationModal.tsx   # 4-step animated AST rebuilding synthesis modal
    │   ├── AppShell.tsx              # Authenticated workspace layout, sidebar & RBAC bar
    │   ├── AppSidebar2.tsx           # Enhanced collapsible desktop navigation sidebar
    │   ├── ArtifactHeader.tsx        # Universal artifact header with breadcrumbs & actions
    │   ├── Auth6.tsx                 # Neumorphic login/signup presentation component
    │   ├── BlueprintConfidenceScore.tsx # Animated radial maturity score widget
    │   ├── DocumentIngestionModal.tsx # Multi-file drag-and-drop parsing dialog
    │   ├── ExportModal.tsx           # Quick export selection modal
    │   ├── Footer11.tsx              # Public site footer with system status indicator
    │   ├── GenerationSequence.tsx    # 4-stage animated loading stepper for AI synthesis
    │   ├── LanguageSelector.tsx      # Language dropdown switcher
    │   ├── LiveProcessStreamer.tsx   # Animated simulated real-time event ticker
    │   ├── Mermaid.tsx               # Reactive Mermaid.js text-to-SVG diagram renderer
    │   ├── MiniDemo.tsx              # Interactive landing page problem-to-blueprint widget
    │   ├── MobileBottomNav.tsx       # Bottom navigation bar for mobile web viewports
    │   ├── Navigation12.tsx          # Public marketing top navigation bar
    │   ├── Pricing13.tsx             # Interactive 3-tier pricing matrix
    │   ├── ScenarioComparisonModal.tsx # Side-by-side blueprint scenario comparison
    │   ├── ShareBlueprintModal.tsx   # Public share link & expiration configuration modal
    │   ├── Showcase5.tsx             # 11-module interactive feature showcase grid
    │   ├── SolutionStudioDrawer.tsx  # Dynamic schema attribute customizer & theme editor
    │   ├── ThemeToggle.tsx           # Dark/light mode button with animated icon
    │   ├── ThreeDLetterSwap.tsx      # 3D typography hover transition effect
    │   ├── Turnstile.tsx             # Cloudflare Turnstile anti-bot challenge widget
    │   ├── VersionControlDrawer.tsx  # Blueprint snapshot history & AST visual diff viewer
    │   ├── WireframeVisualizer.tsx   # Interactive mockup canvas & screen flow connector
    │   ├── effects/                  # Visual Special Effects
    │   │   ├── GridMotion.tsx        # Animated high-tech background grid lines
    │   │   └── LightRays.tsx         # Volumetric light ray canvas shader
    │   ├── motion/                   # Reusable Framer Motion Primitives
    │   │   └── primitives.tsx        # PageTransition, FadeIn, StaggerList wrappers
    │   └── ui/                       # 46 shadcn/Radix UI Styled Primitives
    │       ├── accordion.tsx, alert.tsx, avatar.tsx, badge.tsx, button.tsx,
    │       ├── card.tsx, dialog.tsx, dropdown-menu.tsx, input.tsx, select.tsx,
    │       ├── sheet.tsx, sidebar.tsx, sonner.tsx, table.tsx, tabs.tsx, etc.
    │
    └── routes/                       # 23 File-Based Presentation Routes
        ├── __root.tsx                # App root layout (providers, toaster, global error)
        ├── README.md                 # Routing conventions documentation
        ├── index.tsx                 # Public Landing Page (Hero, MiniDemo, Showcase)
        ├── about.tsx                 # Company, Mission & Story Page
        ├── login.tsx                 # Authentication Login Route
        ├── signup.tsx                # Account Registration Route with Turnstile
        ├── dashboard.tsx             # Workspaces Directory & Transformation Overview
        ├── settings.tsx              # Profile, RBAC Roles & AI Token Wallet
        ├── admin.tsx                 # Central Admin Console & Cloud Health Telemetry
        ├── share.$token.tsx          # Public View-Only Blueprint Sharing Portal
        ├── workspace.new.tsx         # Multi-Modal Problem Intake & Document Upload
        ├── workspace.discovery.tsx   # Dynamic AI Interview & Business Analysis Engine
        ├── workspace.solution.tsx    # Solution Pillars & Build-vs-Buy Decision Matrix
        ├── workspace.solution.crm.tsx# [USP #1] Interactive HR CRM & Attendance Engine
        ├── workspace.architecture.tsx# HLD/LLD Mermaid Diagrams & Component Inspector
        ├── workspace.process.tsx     # BPMN 2.0 As-Is vs To-Be & Swimlane Workflows
        ├── workspace.wireframes.tsx  # UX Screen Visualizer & Interactive Flows
        ├── workspace.data.tsx        # Crow's Foot ERD, DDL SQL Script & OpenAPI Specs
        ├── workspace.roadmap.tsx     # 3-Phase Gantt Roadmap, FTE Staffing & Risk Register
        ├── workspace.insights.tsx    # Dynamic Financial ROI Cockpit & Value Curves
        ├── workspace.map.tsx         # [USP #3] Connected 11-Node DAG Topology Graph
        ├── workspace.collaboration.tsx# Stage-Gate Governance, 4-Role Sign-Off & Audit
        └── workspace.export.tsx      # Universal Client-Side Export Center (PDF, Word, etc.)
```

---

## 7. Comprehensive File-by-File Dictionary

### 7.1 Root Configuration & Metadata Files
- **`package.json`**: Root package manifest defining scripts (`dev`, `build`, `preview`, `cap:sync`, `lint`, `format`) and all production/dev dependencies.
- **`vite.config.ts`**: Vite 8 bundler configuration. Integrates `@tanstack/router-plugin`, `@tailwindcss/vite`, `@vitejs/plugin-react`, and `vite-tsconfig-paths`.
- **`tsconfig.json`**: TypeScript configuration with ESNext target and `@/*` alias mapping to `./src/*`.
- **`THEME.md`**: Complete documentation of the Warm Graphite design palette, typography rules, neumorphic utility tokens, and Framer Motion animation timings.
- **`DEPLOYMENT.md`**: Detailed production operations manual covering environment variables, Vercel edge deployment, standalone Node.js containerization, and Supabase RLS setups.
- **`MOBILE_SETUP.md`**: Expo SDK 52 setup and local build guide for generating Android `.apk`/`.aab` and iOS binaries.
- **`AGENTS.md`**: Guidelines protecting git history and synchronization integrity with the Lovable platform.

### 7.2 Presentation Routes (`src/routes/`)
- **`__root.tsx`**: Root route component wrapping the entire web application. Instantiates `QueryClientProvider`, `AuthProvider`, `ThemeProvider`, global `Toaster`, language initialization, meta tags, and `NotFoundComponent` / `ErrorComponent` boundaries.
- **`index.tsx` (`/`)**: Main public landing page. Features the hero section with Bricolage Grotesque typography, the live interactive `MiniDemo` problem analyzer, problem-vs-solution comparison, `Showcase5` module preview, `Pricing13` tiers, and `Footer11`.
- **`about.tsx` (`/about`)**: Explains the company mission, transformation methodology, architectural principles, and core founding team.
- **`login.tsx` (`/login`)**: Neumorphic login portal with client-side form validation, test account 1-click bypass, error handling, and redirection to `/dashboard`.
- **`signup.tsx` (`/signup`)**: User registration portal featuring password strength verification, Cloudflare Turnstile anti-bot integration, and auto-provisioning into Supabase `profiles`.
- **`dashboard.tsx` (`/dashboard`)**: Transformation command center. Lists active enterprise workspaces, maturity progress rings, readiness scores, and instant workspace launch CTAs.
- **`workspace.new.tsx` (`/workspace/new`)**: Multi-modal problem intake interface. Provides a rich textarea, example prompt chips, document drag-and-drop ingestion (PDF/DOCX/PPT), and immediate parsing into transformation context.
- **`workspace.discovery.tsx` (`/workspace/discovery`)**: Multi-turn AI discovery interview. Displays dynamic AI questions, rationale tags ("Why we ask"), context completeness meters, and the synthesized Futurrizon Business Analysis report (As-Is vs To-Be, stakeholder matrices, gap severity ratings).
- **`workspace.solution.tsx` (`/workspace/solution`)**: Solution blueprint hub. Displays the 4 recommended architectural modules (Core ATS, Client Portal, Smart Attendance, Analytics Engine) and an interactive Build-vs-Buy-vs-Hybrid scoring matrix.
- **`workspace.solution.crm.tsx` (`/workspace/solution/crm`)**: **[USP #1]** The interactive working candidate pipeline and attendance punch clock. Supports stage filtering, search, candidate additions, live CSV download, and live timer punch logs.
- **`workspace.architecture.tsx` (`/workspace/architecture`)**: System architecture canvas. Renders High-Level (HLD) and Low-Level (LLD) Mermaid diagrams, with a slide-out component inspector detailing runtime, security, data contracts, and SLA metrics.
- **`workspace.process.tsx` (`/workspace/process`)**: Business process intelligence. Models As-Is (manual 14.2-day cycle) vs. To-Be (automated 2.4-day cycle) BPMN flows, swimlanes across 4 enterprise roles, and bottleneck resolution cards.
- **`workspace.wireframes.tsx` (`/workspace/wireframes`)**: AI UX Designer. Visualizes wireframe screen mockups (Candidate Intake, Recruiter Kanban, Client Feedback Portal) with connected navigation paths.
- **`workspace.data.tsx` (`/workspace/data`)**: Database and API specifications. Renders a Crow's Foot ERD, an interactive schema dictionary, a copyable PostgreSQL 16+ DDL script with RLS, and OpenAPI 3.1 endpoint documentation with instant cURL commands.
- **`workspace.roadmap.tsx` (`/workspace/roadmap`)**: AI implementation planning engine. Features a 3-tier phased timeline, SVG Gantt chart across 9 weeks, milestone decomposition checklist, FTE staffing calculator, and enterprise risk mitigation register.
- **`workspace.insights.tsx` (`/workspace/insights`)**: Dynamic ROI cockpit. Live interactive sliders (recruiter headcount, volume, hourly cost, automation percentage) calculate net annual savings, payback period, 3-year ROI multiple, and 36-month value trajectory charts.
- **`workspace.map.tsx` (`/workspace/map`)**: **[USP #3]** Connected Artifact Map. Renders an 11-node Directed Acyclic Graph (DAG) with dynamic in-degree/out-degree dependency computation and node metadata inspection.
- **`workspace.collaboration.tsx` (`/workspace/collaboration`)**: Governance and review engine. Features a 3-state stage-gate workflow (`Draft` → `Under Review` → `Approved`), 4-role sign-off matrix, threaded review comments, and an immutable activity audit log.
- **`workspace.export.tsx` (`/workspace/export`)**: Universal export center. Client-side serialization into Executive PDF, Word Doc HTML, CSV, OpenAPI 3.1 JSON, PostgreSQL DDL SQL, and Markdown specifications.
- **`admin.tsx` (`/admin`)**: Central administrative console. Displays multi-tenant workspace directories, real-time multi-region cloud health telemetry (Cloudflare, Supabase, BullMQ, Bedrock), and platform token consumption statistics.
- **`settings.tsx` (`/settings`)**: User preferences, organization profiles, RBAC role switcher, metered AI credit wallet with live top-up simulation, and subscription tier manager.
- **`share.$token.tsx` (`/share/:token`)**: Public view-only blueprint portal for external stakeholders, secured via unique access tokens and expiry validation.

### 7.3 Application Components (`src/components/`)
- **`AppShell.tsx`**: Primary authenticated layout wrapper. Contains top header, responsive navigation, role selector with event emission (`bizzmitra:role-changed`), workspace switcher, and mobile triggers.
- **`AppSidebar2.tsx`**: Collapsible desktop sidebar with active route highlighting using Framer Motion shared layout animations.
- **`ArtifactHeader.tsx`**: Standardized top navigation bar for all artifact screens, providing dynamic breadcrumbs, version badges, action buttons, and links to the DAG map.
- **`SolutionStudioDrawer.tsx`**: **[USP #2]** Slide-out customization drawer. Enables adding dynamic schema fields and adjusting UI styling (density, zebra striping, accent colors) with cross-route event broadcasting.
- **`AIRegenerationModal.tsx`**: **[USP #2]** 4-step animated synthesis modal simulating schema AST analysis, pipeline adjustment, view rebuilding, and version advancement.
- **`VersionControlDrawer.tsx`**: Slide-out timeline of workspace snapshots (`v1.0` through `v1.3`) with visual AST diffs and 1-click state rollback.
- **`AiCopilotPanel.tsx`**: Floating, collapsible AI copilot assistant offering contextual tips, schema recommendations, and artifact explanations on any screen.
- **`DocumentIngestionModal.tsx`**: Drag-and-drop modal for uploading PDF, DOCX, or PPT business files, extracting text on the client side.
- **`Mermaid.tsx`**: Robust client-side wrapper around `mermaid.render()`. Renders text-based diagram strings into clean, responsive SVGs with auto-zooming and error fallbacks.
- **`MiniDemo.tsx`**: Interactive landing page widget allowing prospective users to type or click sample problems and watch an animated AI blueprint preview.
- **`BlueprintConfidenceScore.tsx`**: Circular SVG progress gauge visualizing maturity and AI-readiness percentages.
- **`LanguageSelector.tsx`**: Header dropdown supporting instant translation across 7 international languages.
- **`ThemeToggle.tsx`**: Animated dark/light mode toggle button persisting preference into `localStorage`.
- **`Turnstile.tsx`**: Cloudflare Turnstile challenge component verifying human signups.
- **`AiModelPaymentModal.tsx`**: Metered AI credit top-up dialog with Razorpay checkout integration.
- **`MobileBottomNav.tsx`**: Mobile-optimized bottom navigation bar for small touch devices.
- **`effects/GridMotion.tsx` & `effects/LightRays.tsx`**: WebGL/Canvas visual effects providing subtle ambient movement in headers and marketing sections.
- **`motion/primitives.tsx`**: Reusable Framer Motion components (`PageTransition`, `FadeIn`, `StaggerList`, `ScaleIn`).

### 7.4 Business Logic & Data Stores (`src/lib/`)
- **`demo-data.ts`**: The master dataset containing the canonical e-commerce/HR transformation scenario, 15 pre-seeded CRM candidates, attendance punch records, and workspace configurations.
- **`architecture-data.ts`**: Mermaid strings for High-Level (HLD) and Low-Level (LLD) diagrams, plus specifications for all 7 architectural subsystems.
- **`process-data.ts`**: Mermaid BPMN diagrams comparing manual vs. automated workflows, 4-tier swimlane configurations, and bottleneck analysis tables.
- **`database-data.ts`**: Mermaid Crow's Foot ERD syntax, table dictionary definitions, production PostgreSQL DDL scripts, and OpenAPI 3.1 endpoint schemas.
- **`planning-data.ts`**: 3-phase delivery schedule, Gantt timeline bar coordinates, milestone checklists, FTE staffing allocations, and risk matrices.
- **`roi-data.ts`**: Algorithmic financial formulas calculating direct labor savings, revenue capacity expansion, payback timeline, and 36-month ROI trajectories.
- **`artifact-map-data.ts`**: Directed Acyclic Graph (DAG) node definitions, layer assignments, in-degree input maps, and out-degree output connections.
- **`collaboration-data.ts`**: Stage-gate review state machine, 4-role sign-off matrix, reviewer profiles, and threaded feedback messages.
- **`version-control-data.ts`**: Snapshot definitions (`v1.0` to `v1.3`), AST difference calculators, and rollback state handlers.
- **`admin-rbac-data.ts`**: Definitions and permission matrices for `Admin`, `Architect`, `Analyst`, and `Viewer` roles, plus cloud health telemetry and token economics metrics.
- **`export-engine.ts`**: Client-side document serializers generating OpenAPI 3.1 JSON, PostgreSQL DDL SQL, and Technical Specification Markdown.
- **`document-exporters.ts`**: Client-side generators for Microsoft Word (`.doc` HTML) and Microsoft Excel (`.csv`).
- **`document-parser.ts`**: In-browser client parser extracting text from uploaded PDF and text documents.
- **`solution-studio.ts`**: State manager for dynamic custom fields and UI preferences, broadcasting `bizzmitra:studio-updated` custom events.
- **`i18n.ts`**: Internationalization engine providing translations for English, Hindi, Spanish, French, German, Japanese, and Arabic.
- **`razorpay.ts`**: Client utility dynamically loading the Razorpay checkout script and triggering payment verification dialogs.
- **`ai/generate-artifact.ts`**: Isolated service boundary returning realistic payloads with simulated streaming delays, designed for seamless replacement with live LLM API calls.
- **`ai/generate-artifact-payloads.ts`**: Mock content dictionaries for all 8 core artifact types.

### 7.5 Server & API Gateway (`src/server/` & `src/server.ts`)
- **`src/server.ts`**: Nitro server entrypoint. Intercepts incoming requests, routes `/api/*` traffic through `handleApiRoute`, handles SSR page rendering via `@tanstack/react-start`, and provides graceful error fallbacks.
- **`src/server/api-router.ts`**: Centralized server-side REST API router servicing both Web and Mobile clients with 8 endpoint groups (Auth, Profiles, Workspaces, Artifacts, AI Orchestration, Documents, Multi-Format Exports, Notifications).

### 7.6 Custom React Hooks (`src/hooks/`)
- **`useAuth.tsx`**: Complete authentication provider wrapping Supabase Auth. Manages active user session, token retrieval, login, registration, logout, and automatic bypass for demo accounts.
- **`useTheme.tsx`**: Theme provider handling dark/light class toggling on the `<html>` root element and synchronization with `localStorage`.
- **`use-mobile.tsx`**: React hook listening to `(max-width: 768px)` media queries to conditionally render responsive layouts.

### 7.7 Integrations & Database (`src/integrations/` & `supabase/`)
- **`src/integrations/supabase/client.ts`**: Initializes the singleton Supabase client using project credentials.
- **`src/integrations/supabase/types.ts`**: Strongly-typed TypeScript interfaces mapping directly to Supabase PostgreSQL database tables.
- **`supabase/full_schema_setup.sql`**: Production database setup script. Creates all 8 core tables (`profiles`, `workspaces`, `workspace_members`, `artifacts`, `discovery_messages`, `uploaded_documents`, `blueprint_scenarios`, `blueprint_shares`), installs updated-at triggers, user signup hooks, and establishes Row Level Security (RLS) policies.

### 7.8 Native Mobile Application (`apps/mobile/`)
- **`app/_layout.tsx`**: Root stack navigator managing global theme styles and query clients.
- **`app/(tabs)/_layout.tsx`**: Configures bottom tabs with icons for Home, Projects, AI, Documents, and Notifications.
- **`app/(tabs)/index.tsx`**: Mobile dashboard displaying transformation metrics and quick actions.
- **`app/(tabs)/projects.tsx`**: Mobile list of workspaces and blueprints.
- **`app/(tabs)/ai.tsx`**: Mobile-optimized conversational discovery chat.
- **`app/(tabs)/documents.tsx`**: Mobile file viewer and document ingestion trigger.
- **`app/artifact/[id].tsx`**: Dynamic mobile viewer rendering generated blueprint artifacts.
- **`app/settings.tsx`**: Mobile profile and connection manager.

---

## 8. End-to-End Feature & Workflow Walkthrough

```text
  [1. Intake Screen]  ──▶  [2. AI Discovery Chat]  ──▶  [3. Solution Engine]
  Type problem statement     Multi-turn interview        4-Module blueprint &
  or upload PDF/DOCX         Gap analysis & maturity     Build vs Buy matrix
                                                               │
                                                               ▼
  [5. Architecture]   ◀──  [4. Solution Studio]    ◀──  [Workable CRM]
  Mermaid HLD/LLD &        Dynamic Schema Customizer     Interactive pipeline
  Component Inspector      & AI AST Regeneration         & Punch Clock
         │
         ▼
  [6. Process Flow]   ──▶  [7. Data & REST APIs]   ──▶  [8. Roadmap & Gantt]
  BPMN 2.0 As-Is vs        Crow's Foot ERD, DDL SQL,    3-Tier timeline, FTEs,
  To-Be Swimlanes          OpenAPI specs & cURL         Risk mitigation register
                                                               │
                                                               ▼
  [11. Universal Export] ◀── [10. Governance & Audit] ◀── [9. Dynamic ROI]
  PDF, Word, CSV, SQL,       Stage-Gate review, 4-role    Live sliders, 36-mo
  OpenAPI specifications     sign-off & activity logs     trajectory & curves
```

1. **Intake & Problem Formulation**: User inputs a business bottleneck or uploads a requirements document. BizzMitra extracts the core context and provisions a new workspace.
2. **AI Discovery & Business Analysis**: An adaptive interview identifies missing operational parameters (volume, tooling, team size) and produces a comprehensive As-Is vs. To-Be gap analysis.
3. **Solution Architecture & Handoff**: The engine defines the solution pillars and provides a scored Build-vs-Buy-vs-Hybrid decision matrix.
4. **Interactive Working Prototype**: Users immediately test the solution in the interactive HR CRM, sorting candidates and simulating time tracking.
5. **Solution Studio Customization**: Non-technical users add custom data attributes and modify visual themes. The AI AST engine regenerates the blueprint, bumping it to `v1.1`.
6. **Technical Architecture & Infrastructure**: High-Level and Low-Level Mermaid diagrams map microservices, queues, and persistent storage, while the Component Inspector evaluates SLAs.
7. **Process Modeling (BPMN 2.0)**: Visualizes operational flow across 4 swimlanes, validating an 83% cycle time reduction.
8. **Data Modeling & API Gateway**: Auto-generates relational database schemas (ERD), executable PostgreSQL 16 DDL with RLS, and interactive OpenAPI 3.1 specifications.
9. **Execution Roadmap & Risk Register**: Generates an interactive 9-week Gantt chart, milestone checklists, required team headcount, and mitigation protocols.
10. **Financial ROI Cockpit**: Live interactive sliders model cost savings, revenue capacity expansion, and payback break-even curves.
11. **Artifact DAG & Traceability**: The 11-node Directed Acyclic Graph validates that every database table, API endpoint, and task maps directly back to the original problem.
12. **Enterprise Governance & Export**: Multi-stakeholder sign-offs lock the blueprint, which can then be exported in one click into Executive PDF, Word, CSV, SQL, or OpenAPI JSON formats.

---

## 9. Database Schema, Security (RLS) & State Storage

### 9.1 PostgreSQL Database Schema (`supabase/full_schema_setup.sql`)

```sql
-- 1. Profiles Table (Linked to Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  company TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Workspaces Table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  problem_statement TEXT,
  industry TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  maturity_score INT NOT NULL DEFAULT 0,
  ai_readiness_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Workspace Members Table (Multi-User Collaboration)
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

-- 4. Artifacts Table (Versioned Blueprint Deliverables)
CREATE TABLE public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  module_type TEXT NOT NULL CHECK (
    module_type IN ('framing', 'solution', 'stack', 'architecture', 'process', 'ux', 'data', 'roadmap')
  ),
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Discovery Messages Table (Chat History)
CREATE TABLE public.discovery_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Uploaded Documents Table
CREATE TABLE public.uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Blueprint Scenarios Table
CREATE TABLE public.blueprint_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_blueprint_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 8. Blueprint Shareable Links Table
CREATE TABLE public.blueprint_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
```

### 9.2 Row Level Security (RLS) Policies
All tables enforce PostgreSQL Row Level Security based on workspace ownership and membership:
```sql
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access workspaces they own or belong to"
  ON public.workspaces FOR ALL
  USING (owner_id = auth.uid() OR public.has_workspace_access(id));

CREATE POLICY "Users can access artifacts of permitted workspaces"
  ON public.artifacts FOR ALL
  USING (public.has_workspace_access(workspace_id));
```

### 9.3 Client-Side Storage & Reactive Event Keys
The application synchronizes dynamic state between routes using `localStorage` and `CustomEvent` dispatches:
- **`bizzmitra.workspaceCtx`**: Active workspace ID, title, and prompt statement.
- **`bizzmitra_studio_config`**: Active studio schema fields, table density, zebra striping, and accent color.
- **`bizzmitra_user_role`**: Current simulated RBAC role (`admin`, `architect`, `analyst`, `viewer`).
- **`bizzmitra_token_wallet`**: Current remaining metered credit balance and burn rate.
- **Event: `bizzmitra:studio-updated`**: Broadcasted when custom fields or styles change to update views without reloads.
- **Event: `bizzmitra:role-changed`**: Broadcasted when user switches role in the header to update permissions across components.
- **Event: `bizzmitra:snapshot-restored`**: Broadcasted when rolling back a historical snapshot.

---

## 10. RESTful API Gateway Specifications

Located in `src/server/api-router.ts`. Serves Web Desktop, Tablet, PWA, and Expo Mobile clients.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registers new user and provisions Supabase profile | No |
| `GET` | `/api/auth/me` | Fetches current user profile and subscription plan | Bearer JWT |
| `GET` | `/api/workspaces` | Lists all workspaces owned by the authenticated user | Bearer JWT |
| `POST` | `/api/workspaces` | Creates a new workspace from problem context | Bearer JWT |
| `GET` | `/api/artifacts?workspaceId=...` | Retrieves versioned artifacts for a workspace | Bearer JWT |
| `POST` | `/api/artifacts` | Saves a new artifact version | Bearer JWT |
| `POST` | `/api/ai/generate` | Centralized AI artifact generator with version incrementing | Bearer JWT |
| `GET` | `/api/documents?workspaceId=...` | Lists uploaded documents associated with a workspace | Bearer JWT |
| `GET` | `/api/export/:format` | Universal deliverable export (`docx`, `csv`, `openapi`, `sql`, `md`) | Public / Param |
| `GET` | `/api/notifications` | Returns transformation alerts and governance approvals | Bearer JWT |

---

## 11. Seeded Demonstration Storyline & Domain Payload

To ensure complete narrative consistency across all demo screens, the platform uses a pre-seeded, realistic enterprise scenario:

### The Business Bottleneck
> *"Our tech staffing agency is overwhelmed — recruiter screening takes 14.2 days per placement, manual candidate status updates are scattered across spreadsheets and WhatsApp, attendance disputes cause client billing delays of 3 weeks, and client satisfaction has fallen to 68%."*

### The Generated Transformation Blueprint
- **Solution Pillars**:
  1. *Core ATS*: AI resume parser & candidate pipeline automation.
  2. *Client Feedback Portal*: Self-serve review and candidate interview scheduling.
  3. *Smart Attendance Punch Clock*: Tamper-resistant live attendance tracking.
  4. *Executive Analytics Engine*: Placement velocity and margin reporting.
- **Process Transformation**: Reduces cycle time from **14.2 days down to 2.4 days** (83% reduction).
- **Financial Return (ROI)**:
  - Direct annual labor savings: **$86,400**
  - Additional capacity revenue: **$144,000**
  - Net annual benefit: **$205,400**
  - Break-even payback period: **2.8 months**
  - 3-Year Cumulative ROI Multiple: **6.2x**
- **Data Model**: Relational PostgreSQL schema linking `organizations`, `candidates`, `candidate_custom_fields`, `clients`, `attendance_punches`, and `audit_logs`.

---

## 12. Environment Configuration & Deployment

### 12.1 Environment Variables Configuration (`.env`)
```env
# Supabase Configuration (Database & Auth)
SUPABASE_URL="https://pyqbmgkusnvyyjdsyqyj.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_UNXcq8DuZlHhTimGfZVx4A_qVCnnnZh"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_r-9ktd2UNo0Dv1xZEJwhLQ_PQBKXa5n"

# Client-Facing Mirrors (Vite)
VITE_SUPABASE_URL="https://pyqbmgkusnvyyjdsyqyj.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_UNXcq8DuZlHhTimGfZVx4A_qVCnnnZh"

# Payment Gateway (Razorpay)
VITE_RAZORPAY_KEY_ID="rzp_test_TcCkj2XoiCr1tZ"

# AI Inference Keys (Optional for live LLM replacement)
GROQ_API_KEY="your_groq_api_key_here"
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 12.2 Development Commands
```bash
# 1. Install dependencies
npm install

# 2. Start local Vite development server
npm run dev

# 3. Type-check and build production bundle
npm run build

# 4. Preview local production Nitro server
npm run preview
```

### 12.3 Production Hosting
- **Vercel (Recommended)**: Framework preset: Vite/Other. Build command: `npm run build`. Output directory: `.output/public`.
- **Standalone Node / Docker VM**: Run `npm run build` followed by `node .output/server/index.mjs` (listens on `http://0.0.0.0:3000`).
- **Native Mobile**: Navigate to `apps/mobile`, configure `EXPO_PUBLIC_API_URL`, and run `npx eas-cli build --platform android`.

---

*This document contains the entire structural, architectural, functional, and behavioral knowledge of BizzMitra AI. An LLM or software engineer reading this has the equivalent context of inspecting the complete project repository.*
