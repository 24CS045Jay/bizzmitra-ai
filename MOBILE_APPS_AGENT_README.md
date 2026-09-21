# BizzMitra AI — Native Apps & Responsive Rollout (Agent Task Spec)

> **Audience:** an autonomous AI coding agent working in the `bizzmitra-ai/` repository.
> **Read first:** `PROJECT_OVERVIEW.md` (architecture), `THEME.md` (design tokens), `MOBILE_SETUP.md`, `capacitor.config.ts`.
> **Language:** MUST / MUST NOT / SHOULD are binding. Do not re-debate decisions in §2.

---

## 1. Goal and Deliverables

Ship the existing BizzMitra web portal as installable apps **without rewriting features**, and make every screen usable on phone, tablet and desktop.

| # | Deliverable | Path | Runs on |
|---|---|---|---|
| D1 | Signed Android APK | `release/BizzMitra-android.apk` | Android phones **and** tablets (one universal APK) |
| D2 | Signed iOS IPA | `release/BizzMitra-ios.ipa` | iPhone **and** iPad (universal) |
| D3 | Responsive web portal | deployed web app | phone / tablet / desktop browsers |
| D4 | QA evidence | `qa/` (screenshots + `qa/REPORT.md`) | — |
| D5 | Final report | `release/RELEASE_NOTES.md` | — |

Exactly two binaries are delivered (D1, D2). There is **no separate tablet APK**: the tablet layout is delivered by the responsive UI inside the same APK. If the human explicitly asks, copy D1 to `release/BizzMitra-android-tablet.apk` — do not build a different variant.

---

## 2. Fixed Decisions (do not change)

1. **Wrapper technology: Capacitor** (already present via `capacitor.config.ts`). Latest stable `@capacitor/*` packages; verify with `npm view @capacitor/core version` and keep all `@capacitor/*` on the same major.
2. **Runtime mode: remote URL.** The native shell loads the deployed portal (`server.url`), so SSR (TanStack Start/Nitro), `/api/*`, Supabase auth and all existing routes keep working unchanged. Web deploys update the apps without a store release.
3. `apps/mobile/` (Expo) is **legacy. Do not delete, modify or build it.** Add a one-line note in `MOBILE_SETUP.md` that Capacitor is the primary path.
4. **Design system is frozen:** Neu-Bold-Minimal, Warm Graphite tokens, Bricolage Grotesque + Inter Tight. No purple/blue AI gradients, no default system fonts for display type, no new UI library.
5. Desktop layout **MUST NOT regress**. Every responsive change is additive behind breakpoints.
6. One app id for both platforms (value from Human Gate H2).

---

## 3. Hard Rules

- **Secrets.** `SUPABASE_SERVICE_ROLE_KEY` and any `sb_secret_*` value MUST NEVER appear in: the native projects, `capacitor.config.ts`, the mobile shell, CI logs, committed files, or `release/`. Only `VITE_*` / publishable keys may reach the client. If you find a secret in a tracked file, stop and report it (Human Gate H0).
- **No fabrication.** Never claim a build, test or device check succeeded unless you ran it and saw the output. Anything not run is labelled `NOT VERIFIED` in `qa/REPORT.md`.
- **No fake IPA.** An unsigned or debug archive MUST NOT be presented as D2. If signing inputs are missing, stop at the gate and write `BLOCKERS.md`.
- Do not rename routes, change API contracts, change DB schema, or alter business logic.
- Do not commit keystores, `.p12`, `.mobileprovision`, or `.env*` files. Add them to `.gitignore`.
- Keep the AI boundary (`src/lib/ai/generate-artifact.ts`, `src/server/api-router.ts`) untouched.
- Work in small commits on branch `feat/native-apps`; one commit per phase.

---

## 3.1 Human Gates (the only times you may ask the human)

| Gate | Needed from human | Used for |
|---|---|---|
| H0 | Confirmation the Supabase service-role key was rotated | secret hygiene |
| H1 | Public HTTPS production URL of the portal (or a Vercel token so you can deploy) | `server.url` |
| H2 | App name, app id (e.g. `com.<company>.bizzmitra`), 1024×1024 logo PNG (else derive from `src/assets`) | branding |
| H3 | Android keystore passwords (or permission to generate a keystore and hand it back for backup) | D1 signing |
| H4 | iOS: Apple Developer Team ID + either (a) distribution certificate `.p12` + password + provisioning profile, or (b) App Store Connect API key (`.p8`, key id, issuer id) | D2 signing |
| H5 | iOS distribution method: `ad-hoc` (needs registered device UDIDs) / `app-store-connect` (TestFlight) / `development` | export options |
| H6 | GitHub repo access + Actions secrets, **only if** local build tools are unavailable | CI fallback |

If a gate is not satisfied, finish everything that does not depend on it, then write `BLOCKERS.md` listing exactly which gate, what to provide, and where to place it. Do not guess values.

---

## 4. Phase 0 — Preflight

1. `git status` clean; create branch `feat/native-apps`.
2. `npm install`, `npm run build`, `npm run dev` must succeed **before** any change. Record result in `qa/REPORT.md`.
3. Detect toolchain and record it: Node ≥ 20, JDK (21 for Capacitor ≥ 7), Android SDK (`ANDROID_HOME`), `adb`, macOS + Xcode (`xcodebuild -version`), Playwright.
   - No Android SDK → use CI fallback (§9) for D1.
   - Not on macOS → use CI fallback (§9) for D2. iOS binaries can only be built on macOS.
4. Grep the repo for the secrets pattern (`sb_secret_`, `service_role`) and report hits.
5. Read `capacitor.config.ts` as-is. **Edit it; do not overwrite blindly.**

---

## 5. Phase 1 — Responsive Portal (D3)

### 5.1 Breakpoints (single source of truth)

| Class | Width | Layout |
|---|---|---|
| `phone` | ≤ 639px | Single column. `MobileBottomNav` visible. Sidebar hidden. Drawers/modals become full-screen or bottom sheets. |
| `tablet` | 640–1023px (incl. iPad portrait 768/820/834 and iPad landscape 1024) | Collapsed **icon-rail** sidebar (expand as overlay). 2-column grids. Bottom nav hidden. Side drawers ≤ 480px wide. |
| `desktop` | ≥ 1024px | Current layout, unchanged. |

Implementation:
- Extend `src/hooks/use-mobile.tsx` to also export `useDeviceClass(): 'phone' | 'tablet' | 'desktop'`. Keep the existing `useIsMobile` export working (backwards compatible).
- Use Tailwind `sm:` (640) and `lg:` (1024) for CSS-only cases. Use the hook only when component structure changes.

### 5.2 Global rules (MUST)

1. `index`/root head: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
2. Safe areas: apply `env(safe-area-inset-top|bottom|left|right)` to `AppShell` header, `MobileBottomNav`, all drawers, modals, floating buttons (`AiCopilotPanel` FAB must not overlap the bottom nav).
3. Use `100dvh` (not `100vh`) for full-height layouts. Set `overscroll-behavior: none` on the app root; no accidental horizontal scroll.
4. Touch targets ≥ 44×44px. Add `touch-action: manipulation`. Any hover-only affordance MUST have a tap/focus equivalent.
5. All text inputs/selects/textareas `font-size ≥ 16px` on phone (prevents iOS zoom-on-focus).
6. Hero/display type uses `clamp()` (e.g. `clamp(2.5rem, 9vw, 7.5rem)`); the 72–120px desktop size must shrink gracefully. No fixed pixel heights on text containers.
7. Neumorphic shadows flatten to 1px borders < 640px (already specified in THEME.md — verify it is actually applied everywhere, including `.neu-inset` inputs).
8. Heavy effects: `effects/GridMotion.tsx`, `effects/LightRays.tsx`, `login-background.ts` MUST be disabled or capped (DPR ≤ 1.5, reduced particle count) on `phone`, and disabled when `prefers-reduced-motion`.
9. Keyboard: chat inputs (`workspace.discovery`, `AiCopilotPanel`) must stay visible above the on-screen keyboard.
10. Both light and dark themes MUST work at every breakpoint (`useTheme` unchanged).
11. Radix Dialog/Sheet: on `phone` render as full-screen or bottom sheet with safe-area padding and a visible close button.

### 5.3 Wide / complex content (MUST)

| Component | Phone/tablet behaviour |
|---|---|
| `Mermaid.tsx` (HLD/LLD, BPMN, ERD) | Container `overflow:auto`, pinch-zoom + "Fit to width" and "Fullscreen" controls; never clip. |
| Gantt (`workspace.roadmap`) | Horizontal scroll with sticky row labels; milestone checklist stacks below. |
| DAG map (`workspace.map`) | Touch pan + pinch zoom; node tap opens inspector as bottom sheet (phone) / side sheet (tablet). |
| CRM tables (`workspace.solution.crm`) | Phone: card list per candidate; tablet/desktop: table. Stage filters become horizontally scrollable chips. |
| Data tables / schema dictionary | `overflow-x:auto` wrapper, or card list on phone. |
| SQL DDL / cURL / JSON blocks | `overflow-x:auto`, monospace, working Copy button. |
| Recharts (ROI, trends) | `ResponsiveContainer`; simplified axes/ticks on phone; touch tooltips. |
| ROI sliders | Large thumbs, value labels not obscured by finger. |
| `Pricing13`, `Showcase5`, `MiniDemo` | Stack to 1 col (phone), 2 col (tablet). |

### 5.4 Route checklist (each must pass §10 at all viewports)

`/` (landing) · `/about` · `/login` · `/signup` (incl. Turnstile) · `/dashboard` · `/workspace/new` (document upload) · `/workspace/discovery` · `/workspace/solution` · `/workspace/solution/crm` · `/workspace/architecture` · `/workspace/process` · `/workspace/wireframes` · `/workspace/data` · `/workspace/roadmap` · `/workspace/insights` · `/workspace/map` · `/workspace/collaboration` · `/workspace/export` · `/admin` · `/settings` (incl. Razorpay modal) · `/share/:token`.
Also every drawer/modal: `SolutionStudioDrawer`, `AIRegenerationModal`, `VersionControlDrawer`, `AiCopilotPanel`, `DocumentIngestionModal`, `ExportModal`, `ShareBlueprintModal`, `ScenarioComparisonModal`, `AiModelPaymentModal`, `LanguageSelector` (including Arabic RTL).

---

## 6. Phase 2 — Capacitor Shell

### 6.1 Dependencies
```bash
npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios \
  @capacitor/app @capacitor/status-bar @capacitor/splash-screen @capacitor/keyboard \
  @capacitor/haptics @capacitor/network @capacitor/filesystem @capacitor/share
npm i -D @capacitor/assets
```

### 6.2 `capacitor.config.ts` (merge into existing)
- `appId`, `appName` from H2. `webDir: 'mobile-shell'`.
- `server: { url: '<H1 URL>', cleartext: false, allowNavigation: ['<H1 host>', '*.supabase.co', 'checkout.razorpay.com', '*.razorpay.com', 'challenges.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'] }`
- `plugins`: `SplashScreen` (background `#F5F3EE`, auto-hide after ready), `StatusBar` (style follows theme), `Keyboard` (`resize: 'body'`).
- Create `mobile-shell/index.html`: minimal branded offline/fallback page (Neu-Bold-Minimal, "You're offline — Retry" button) used when the remote URL is unreachable. It must not contain secrets.

### 6.3 Native bridge (`src/lib/native-bridge.ts`)
All plugin imports MUST be dynamic and guarded by `Capacitor.isNativePlatform()` so the web build is unaffected.

Exports:
- `isNative()`, `platform()`.
- `saveAndShareFile(filename, data: Blob | string, mime)` — **required**: in-WebView `Blob` + `<a download>` does not work. On native: write via `@capacitor/filesystem` (Cache dir) then open `@capacitor/share`. On web: existing behaviour.
- `haptic(kind)`; `initNative()` (status-bar sync with theme, hide splash, Android back-button handling: go back in router history, exit on root).

Refactor **only the export call-sites** to use `saveAndShareFile`: `document-exporters.ts`, `export-engine.ts`, CRM CSV export (`workspace.solution.crm.tsx`), `workspace.export.tsx`. PDF export must also work (use share sheet, not `window.print()` popups).

Call `initNative()` once from the root layout. Add `bizzmitra:*` events untouched.

### 6.4 Native-feel requirements (also protects App Store review)
Splash screen, themed status bar, haptics on primary actions, native share/save for exports, offline screen, back-button handling. Do not ship a bare webview.

### 6.5 Assets
`resources/icon.png` (1024², from H2) and `resources/splash.png` (2732², warm off-white `#F5F3EE` with logo) → `npx @capacitor/assets generate`.

---

## 7. Phase 3 — Android (D1)

1. `npx cap add android` (skip if `android/` exists) → `npx cap sync android`.
2. `AndroidManifest.xml`: `android:windowSoftInputMode="adjustResize"`; do NOT lock orientation (tablets must rotate); `<supports-screens>` for large/xlarge; internet permission only + what plugins need. No unused permissions.
3. Set `versionCode`/`versionName` in `android/app/build.gradle` (start `1` / `1.0.0`).
4. Signing (H3): if no keystore provided, generate:
   `keytool -genkeypair -v -keystore ../keys/bizzmitra-release.keystore -alias bizzmitra -keyalg RSA -keysize 2048 -validity 10000`
   Keep it OUTSIDE git. Tell the human to back it up — losing it means no future updates under the same signature.
5. Configure `signingConfigs.release` reading passwords from env vars (never hard-coded).
6. Build: `cd android && ./gradlew assembleRelease`. Verify with `apksigner verify --verbose <apk>`.
7. Copy to `release/BizzMitra-android.apk`. Record size, `versionName`, SHA-256.
8. If (and only if) `assembleRelease` cannot be signed, deliver a **debug** APK, label it `BizzMitra-android-DEBUG.apk`, and say so plainly.

---

## 8. Phase 4 — iOS (D2)

Requires macOS + Xcode (local or CI runner).

1. `npx cap add ios` → `npx cap sync ios`.
2. `Info.plist`: `UIDeviceFamily` = iPhone + iPad; all four iPad orientations; `ITSAppUsesNonExemptEncryption` = `false`; usage-description strings only for features actually used (e.g. photo library/camera for document upload). Display name from H2.
3. Signing (H4): manual signing with the supplied certificate + profile, or automatic via App Store Connect API key. Bundle id = H2.
4. Archive (use `-workspace ios/App/App.xcworkspace` if it exists, otherwise `-project ios/App/App.xcodeproj`):
```bash
xcodebuild archive -scheme App -configuration Release \
  -archivePath build/App.xcarchive -destination 'generic/platform=iOS'
xcodebuild -exportArchive -archivePath build/App.xcarchive \
  -exportOptionsPlist ios/ExportOptions.plist -exportPath build/ipa
```
5. `ios/ExportOptions.plist`: `method` = value from H5 (`ad-hoc` | `app-store-connect` | `development`), `teamID`, `signingStyle`, `compileBitcode=false`, `stripSwiftSymbols=true`.
6. Copy the resulting `.ipa` to `release/BizzMitra-ios.ipa`. Record size, version/build, SHA-256, and the distribution method in `RELEASE_NOTES.md`.
7. State in `RELEASE_NOTES.md` how the IPA can be installed for the chosen method (TestFlight upload, registered-device ad hoc install, or Xcode). An IPA cannot be installed by simply opening it on an iPhone.

---

## 9. CI Fallback (use when local tools are missing — needs H6)

`.github/workflows/android.yml`
```yaml
name: android-apk
on: { workflow_dispatch: {} }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 21 }
      - run: npm ci
      - run: npx cap sync android
      - name: Decode keystore
        run: echo "$KS" | base64 -d > android/app/release.keystore
        env: { KS: "${{ secrets.ANDROID_KEYSTORE_B64 }}" }
      - name: Build release APK
        working-directory: android
        run: ./gradlew assembleRelease
        env:
          KEYSTORE_PATH: release.keystore
          KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
      - uses: actions/upload-artifact@v4
        with:
          name: BizzMitra-android
          path: android/app/build/outputs/apk/release/*.apk
```

`.github/workflows/ios.yml`
```yaml
name: ios-ipa
on: { workflow_dispatch: {} }
jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx cap sync ios
      - uses: apple-actions/import-codesign-certs@v3
        with:
          p12-file-base64: ${{ secrets.IOS_CERT_P12_B64 }}
          p12-password: ${{ secrets.IOS_CERT_PASSWORD }}
      - name: Install provisioning profile
        run: |
          mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
          echo "${{ secrets.IOS_PROFILE_B64 }}" | base64 -d > ~/Library/MobileDevice/Provisioning\ Profiles/app.mobileprovision
      - name: Archive and export
        run: |
          xcodebuild archive -scheme App -configuration Release \
            -archivePath build/App.xcarchive -destination 'generic/platform=iOS' \
            -workspace ios/App/App.xcworkspace
          xcodebuild -exportArchive -archivePath build/App.xcarchive \
            -exportOptionsPlist ios/ExportOptions.plist -exportPath build/ipa
      - uses: actions/upload-artifact@v4
        with: { name: BizzMitra-ios, path: build/ipa/*.ipa }
```
Adjust the archive command for `-project` if no workspace exists, and add explicit manual-signing build settings if Xcode reports signing errors. Secrets are set by the human in GitHub → Settings → Secrets; never print them.

---

## 10. Phase 5 — QA (D4)

### 10.1 Automated responsive audit
Create `scripts/responsive-audit.mjs` (Playwright). For every route in §5.4 (seed/demo login where auth is needed), every viewport, and both themes:

| Viewport | Size |
|---|---|
| phone-small | 360×640 |
| phone | 390×844 |
| phone-large | 430×932 |
| tablet-portrait | 768×1024 |
| tablet-portrait-lg | 820×1180 |
| tablet-landscape | 1024×768 |
| desktop | 1440×900 |

Assertions per page: `document.documentElement.scrollWidth <= window.innerWidth` (no horizontal page scroll); no console errors; no element clipped outside the viewport (except intentional scroll containers); tap targets ≥ 44px on phone. Save screenshots to `qa/screenshots/<viewport>/<theme>/<route>.png`. **Open and visually review the screenshots**, fix defects, and re-run until clean.

### 10.2 Native smoke tests (when emulators/simulators are available)
- Android emulator: Pixel 7 (phone) and Pixel Tablet — install D1, then test: cold start + splash, login, dashboard, open a workspace, CRM add candidate, run AI regeneration, **CSV/Word/SQL/OpenAPI export opens share sheet**, Razorpay modal opens, document upload, theme toggle, rotate device, hardware back button, kill network → offline screen → retry.
- iOS simulator: iPhone 15 and iPad (10th gen) — same list, minus hardware back.
- Not runnable → mark `NOT VERIFIED` with the reason. Never omit.

### 10.3 Acceptance criteria (all MUST be true)
1. `npm run build` passes; desktop screenshots show no regression.
2. Audit passes on all routes × viewports × themes.
3. `release/BizzMitra-android.apk` exists, is release-signed (`apksigner verify` OK) and installs on emulator.
4. `release/BizzMitra-ios.ipa` exists, is signed for the H5 method.
5. All export formats work inside the native apps via share/save.
6. No secret strings in APK/IPA contents (`grep -R "sb_secret_\|service_role"` on the unpacked bundles returns nothing).
7. `qa/REPORT.md` lists pass/fail/NOT VERIFIED for every item above.

---

## 11. Final Output Layout

```
release/
├── BizzMitra-android.apk
├── BizzMitra-ios.ipa
└── RELEASE_NOTES.md      # versions, SHA-256, sizes, install steps, known limitations
qa/
├── REPORT.md
└── screenshots/...
BLOCKERS.md               # only if any gate is unsatisfied
```
`RELEASE_NOTES.md` MUST contain: what was built, exact commands run, tool versions, what was `NOT VERIFIED`, and the human follow-ups (keystore backup, store submission steps if wanted).

## 12. Failure Protocol

Build error → read the log, fix root cause, retry (max 3 focused attempts per error), then document in `BLOCKERS.md`. Never disable a check, lower a threshold, or hide a failure to reach "done". If stuck on a Human Gate, stop and report — do not invent credentials, certificates or IDs.

## 13. Order of Execution

Phase 0 → Phase 1 (commit) → Phase 2 (commit) → Phase 3 (commit) → Phase 4 (commit) → Phase 5 → final report.
Phase 1 (responsive) MUST be finished and deployed to the production URL **before** the native builds are treated as final, because the apps load that URL.
