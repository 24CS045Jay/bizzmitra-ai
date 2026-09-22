# BizzMitra AI — Fix Pack 1: iOS Build Failure, APK Native Polish, Horizontal Swipe Bug

> **Audience:** the same AI coding agent. This is an addendum to `MOBILE_APPS_AGENT_README.md` — read that file first for context (Phases 0–5, Human Gates). This document only covers three fixes. Do not redo work already done.
> **Do not close this task until §4 Acceptance Checklist is fully green.**

---

## 0. What's broken (from the human's report + attached CI screenshots)

1. **iOS build fails every time** in GitHub Actions: `Build & Export iOS IPA` job, error `Command SwiftCompile failed with a nonzero exit code`, `Process completed with exit code 65`. The failing object paths are under `.../Release-iphonesimulator/.../x86_64/...` inside `IONFilesystemLib` (the Capacitor Filesystem plugin).
2. **APK works but doesn't feel like an app** — buttons/controls look like a scaled-down website, not a native app: unclear tap states, cramped icons, inconsistent sizing.
3. **Critical UX bug in the APK**: on the Intake screen (and other sub-sections), swiping a finger **left → right drags the whole page sideways**, like scrolling a wide website, instead of the app staying fixed to the screen width with **only vertical** scroll.

Fix all three. This doc gives root causes, ranked by likelihood, and the exact fix for each — because CI logs can have more than one true cause, verify each hypothesis against your own build log before moving to the next.

---

## 1. Fix: iOS IPA build failure (exit code 65)

### 1.1 Read the actual log first
`Process completed with exit code 65` is generic (it just means "xcodebuild failed"). The **real cause is always a few lines above** the `SwiftCompile failed` line — usually starting with `error:`. Before applying any fix below, open the full raw log (Image 2 is only the tail) and find the first line starting with `error:`. Put it verbatim at the top of `BLOCKERS.md` if none of the fixes below resolve it.

### 1.2 Hypothesis A (most likely): building/linking an x86_64 iOS Simulator slice on an Apple-Silicon GitHub runner
`macos-latest` / `macos-14`+ runners are Apple Silicon (arm64). Compiling the **x86_64 simulator** architecture on them is a known source of `SwiftCompile failed` / exit 65 for Capacitor/Cordova plugin pods, because that slice now has to go through Rosetta and frequently breaks.
Your archive step should target the **device**, not the simulator, at all — the presence of `Release-iphonesimulator` in the failing paths means something in the pipeline is still building a simulator variant (e.g., `pod install` default settings, a `Debug-iphonesimulator` scheme step left in the workflow, or Xcode resolving package dependencies for "Any iOS Simulator Device" before the archive step even runs).

**Fix — do all of these:**
1. Confirm the workflow's build step is exactly:
   ```bash
   xcodebuild archive -workspace ios/App/App.xcworkspace -scheme App \
     -configuration Release -destination 'generic/platform=iOS' \
     -archivePath build/App.xcarchive \
     -skipPackagePluginValidation -skipMacroValidation
   ```
   `generic/platform=iOS` is a **device-only** destination — if any other `-destination` value, `-sdk iphonesimulator`, or a separate `xcodebuild build`/`test` step exists earlier in the same job, remove it. Only `archive` + `-exportArchive` should run for release.
2. In `ios/App/Podfile`, add a `post_install` hook that excludes the simulator x86_64 slice so CocoaPods never even attempts it:
   ```ruby
   post_install do |installer|
     installer.pods_project.targets.each do |target|
       target.build_configurations.each do |config|
         config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'x86_64'
       end
     end
   end
   ```
   Run `cd ios/App && pod install` after editing, commit the updated `Podfile.lock`.
3. Delete any stale `~/Library/Developer/Xcode/DerivedData` between attempts (`rm -rf` at the start of the CI job) — mixed simulator/device derived data is a common cause of this exact error resurfacing on a second run even after a fix.

### 1.3 Hypothesis B: Xcode / Swift toolchain mismatch
GitHub's default Xcode version changes over time and can silently drift ahead of what Capacitor's Swift plugin sources were tested against.
**Fix:** pin it explicitly at the top of the iOS job:
```yaml
- run: sudo xcode-select -s /Applications/Xcode_16.2.app/Contents/Developer
- run: xcodebuild -version
```
Check `xcodebuild -version` in the log preceding the failure; if it's not the version pinned, the pin step is missing or wrong. Try the newest available Xcode on the runner (`ls /Applications | grep Xcode`) if 16.2 isn't present.

### 1.4 Hypothesis C: stale/incompatible Capacitor Filesystem plugin version
```bash
npm view @capacitor/filesystem versions --json | tail -5
npm i @capacitor/filesystem@latest
npx cap sync ios
```
Then retry. Keep all `@capacitor/*` packages on the same major version (per the base README, §2.1).

### 1.5 Node 20 deprecation warning (Image 1)
Not the cause of the failure, but fix it while you're in the workflow file — it will hard-fail on GitHub's forced upgrade later:
```yaml
- uses: actions/setup-node@v4
  with: { node-version: 22 }
```

### 1.6 If it still fails after A–D
Do not keep guessing blindly. Add `-verbose` to the failing xcodebuild command, re-run once, and paste the **first real `error:` line** (not the exit-code summary) into `BLOCKERS.md` along with which of Hypotheses A–D were tried and their result. This is a legitimate stop point per the base README's Failure Protocol (max 3 focused attempts).

---

## 2. Fix: make the Android app feel like an app, not a shrunk website

The web portal's Neu-Bold-Minimal design should stay — this is about touch ergonomics and native chrome, not a redesign.

1. **Every tappable control ≥ 44×44px hit area** (the visible control can be smaller if centered in a larger tap zone — use padding, not just `min-width`/`min-height` on the visible box). Audit: primary buttons, icon buttons in headers/toolbars, sidebar/nav icons, close (X) buttons on drawers and modals, chips/filters, table row actions.
2. **Visible pressed state on every control** — Radix/Tailwind `active:` states (scale-down `0.97`, `.neu-press` per THEME.md, or a background shade shift) must fire on `touchstart`, not just `:hover` (hover doesn't exist on touch — this is very likely why buttons currently read as "not proper/not responding": they only had a `:hover` style, which a finger never triggers). Grep the codebase for classes styled only under `hover:` with no `active:` equivalent and add the `active:` variant.
3. **Icon-only buttons need a label or tooltip-on-long-press**, not just an icon — several toolbar/header icons (share, export, settings gear, filter) currently rely on desktop hover-tooltips, which are invisible on touch. Add `aria-label` at minimum; add a small text label where space allows.
4. **Bottom nav and primary CTAs sit clear of the OS gesture bar** — apply `env(safe-area-inset-bottom)` padding (already required by the base README §5.2.2 — verify it actually landed on every button row, not just the outer shell).
5. **Native status/nav bar color matches the current theme** (`StatusBar.setBackgroundColor` / `setStyle` from `@capacitor/status-bar`, driven by `useTheme`) so the OS chrome doesn't look like a plain grey webview frame around the app.
6. **Splash → first paint should not flash unstyled/white** — confirm `SplashScreen.hide()` only fires after the first themed paint, not immediately on native init.
7. **Remove any visible browser chrome artifacts** — pull-to-refresh circle, text-selection magnifier/callout on normal UI taps, and blue-link tap highlight. In global CSS:
   ```css
   html, body {
     -webkit-user-select: none;
     -webkit-touch-callout: none;
     -webkit-tap-highlight-color: transparent;
     overscroll-behavior-y: contain;
   }
   input, textarea, [contenteditable] {
     -webkit-user-select: text; /* re-enable where the user actually types */
   }
   ```

---

## 3. Fix: horizontal finger-swipe is dragging the whole page sideways (critical)

### 3.1 What's actually happening
This is **not** a "swipe-to-go-back" navigation gesture (that's a WKWebView/iOS thing and iOS isn't even built yet). On Android, this means the page's rendered content is **wider than the viewport** in the intake screen (and others), so a left↔right drag is a genuine horizontal scroll of oversized content — the exact "scrolling through a website sideways" feel the human is describing, instead of the content being clamped to `100vw` with vertical-only scroll like a native screen.

### 3.2 Find every offender
Run this in the live app (desktop devtools with a phone viewport, or on-device via `chrome://inspect`) on the Intake screen first, then every route in the base README's §5.4 checklist:
```js
[...document.querySelectorAll('*')].filter(
  el => el.scrollWidth > document.documentElement.clientWidth
)
```
Anything returned is a horizontal-overflow culprit. Typical causes in this codebase, check each:
- A flex/grid row (e.g. example-prompt chips on `workspace.new.tsx`, filter chips on CRM, pricing tiers) with no `flex-wrap` and no scroll-container, so it just keeps growing past the viewport.
- A fixed `width` or `min-width` in `px` on a card/panel that exceeds phone width (common with anything carried over from desktop, e.g. `min-width: 640px`).
- Long unbroken strings (URLs, IDs, table headers) without `overflow-wrap: anywhere` / `break-words`, pushing the parent wider.
- A Mermaid/SVG/table container missing `overflow-x: auto` **and also missing a max-width clamp**, so it overflows the page itself instead of scrolling inside its own box.
- Negative margins or absolutely-positioned decorative elements (from `effects/GridMotion.tsx`, `effects/LightRays.tsx`, hero sections) extending past `100vw`.

### 3.3 The fix (apply all layers — belt and suspenders)
1. **Global clamp** — add to the root stylesheet (`src/styles.css`) so a stray offender can never drag the whole page again, even if missed in the audit:
   ```css
   html, body, #root {
     max-width: 100vw;
     overflow-x: hidden;
     overscroll-behavior-x: none;
   }
   ```
2. **Fix the actual offenders found in §3.2** — this is the real fix; §3.3.1 is a safety net, not a substitute. Wrap intentionally-wide content (tables, Mermaid diagrams, code blocks, horizontally-scrolling chip rows) in an explicit `overflow-x: auto` container with `max-width: 100%`, so *that one element* scrolls sideways on purpose while the page itself does not. Replace unconstrained `flex` rows of chips/cards with either `flex-wrap` (mobile) or a deliberate horizontal-scroll strip with `scroll-snap-type: x mandatory` and visible partial-next-item peeking (a normal, expected native pattern) — do not leave them as silently-overflowing rows.
3. **Native WebView setting (Android)** — in `MainActivity.java`/`.kt` (or via a Capacitor config if exposed), ensure horizontal overscroll glow/scroll on the WebView itself is not enabled where it shouldn't be:
   ```kotlin
   bridge.webView.overScrollMode = View.OVER_SCROLL_NEVER // or ALWAYS if you want the vertical bounce, just not horizontal drag
   ```
   Vertical bounce/overscroll can stay if you want that native feel — only horizontal dragging of the page is the bug.
4. **iOS, once §1 is fixed** — set in `AppDelegate.swift` (or via the Capacitor iOS bridge config) `webView.scrollView.bounces = true` but confirm `webView.scrollView.contentSize.width` never exceeds frame width once §3.2's fixes are in; if any horizontal overflow remains, iOS will show the same sideways-drag symptom via `UIScrollView`'s native bounce even without the "swipe back" gesture.

### 3.4 Regression test — add this permanently to Phase 5 QA
Extend `scripts/responsive-audit.mjs` (from the base README §10.1) with an explicit horizontal-overflow assertion on **every** route × viewport, not just "no scrollbar visible":
```js
const overflowWidth = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth
);
expect(overflowWidth).toBeLessThanOrEqual(1); // 0–1px rounding tolerance only
```
A route fails the audit if this is nonzero. This must pass on the phone and tablet viewport sets before Phase 5 is considered complete — this is what was missing the first time.

---

## 4. Acceptance Checklist (all MUST be true before reporting done)

- [ ] iOS workflow completes; `release/BizzMitra-ios.ipa` exists and is signed (or the exact blocking `error:` line is in `BLOCKERS.md` with Hypotheses A–D results).
- [ ] Every primary button, icon button, and nav item has a visible active/pressed state on tap, and a ≥44px hit area.
- [ ] Status bar and splash colors match the app theme; no flash of unstyled content.
- [ ] `[...document.querySelectorAll('*')].filter(el => el.scrollWidth > document.documentElement.clientWidth)` returns `[]` on the Intake screen and every route in the base README §5.4 list, at phone and tablet widths.
- [ ] Manually swipe left↔right on the Intake screen and 3 other sub-sections on a real or emulated Android phone — page stays fixed horizontally; only intentional inner elements (tables, diagrams, chip strips) scroll sideways.
- [ ] `scripts/responsive-audit.mjs` horizontal-overflow assertion (§3.4) passes on all routes/viewports, committed as a permanent regression check.
- [ ] Updated `release/BizzMitra-android.apk` rebuilt after these fixes; old artifact replaced, not left alongside it.
- [ ] `qa/REPORT.md` updated with what was fixed, what was re-tested, and links/paths to the new screenshots proving the swipe bug is gone.
