# BizzMitra AI v1.0.0 — Release Notes & Deliverables (D5)

**Release Date:** September 22, 2026  
**Build Target:** Universal Android APK & iOS CI Pipeline  
**Live Production URL:** `https://bizzmitra-ai.vercel.app/`  

---

## 1. Deliverables Summary

### Deliverable 1: Signed Universal Android APK
- **File Location:** `release/BizzMitra-android.apk`
- **File Size:** 3,984,547 bytes (3.80 MB)
- **SHA-256 Checksum:** `F21623CC70DA78538182FD1FEA2285BF4CD99DF5BC3601ECB6A56713E0363CF4`
- **Package Identifier:** `com.bizzmitra.ai`
- **Version Name / Version Code:** `1.0.0` / `1`
- **Target SDK / Min SDK:** `36` (Android 16/15) / `24` (Android 7.0+)
- **Signing Scheme:** Verified APK Signature Scheme v2 (1 signer)
- **Signing Keystore:** `keys/bizzmitra-release.keystore` (Alias: `bizzmitra`, Algorithm: RSA 2048-bit)

### Deliverable 2: iOS Native Project & CI Pipeline
- **Xcode Workspace:** `ios/App/App.xcworkspace`
- **Export Configuration:** `ios/ExportOptions.plist`
- **GitHub Actions Workflow:** `.github/workflows/ios.yml` (macOS-14 runner, Xcode archive & IPA artifact export)
- **Permissions Configured:** Camera, Photo Library, Non-exempt encryption set to `false`.

### Deliverable 3: Responsive Portal & Native Bridge
- **Three Device Classes:**
  - Phone ($\le 639\text{px}$): Bottom tab bar navigation, drawer header, elevated Copilot FAB, flattened neu-shadows, $16\text{px}$ inputs (prevents iOS auto-zoom).
  - Tablet ($640\text{px}-1023\text{px}$): Minimalist $80\text{px}$ icon-rail sidebar, hidden top header/bottom nav, full embossed Neu-Bold aesthetic.
  - Desktop ($\ge 1024\text{px}$): Full multi-column workspace layout.
- **Native Bridge (`src/lib/native-bridge.ts`):**
  - Offline fallback shell (`mobile-shell/index.html`) with automatic reconnection retry.
  - Native file export & share sheet via `@capacitor/filesystem` and `@capacitor/share`.
  - Android hardware back button handler.
  - Haptic feedback & dynamic status bar theme synchronization.

### Deliverable 4: Quality Assurance & Audit
- **Report Location:** `qa/REPORT.md`
- **Verification Script:** `scripts/responsive-audit.mjs`
- **Secret Leaks:** 0 secrets found; keystores and `.env` files protected.

---

## 2. Installation Instructions

### Android Device (Direct Install via ADB)
Connect your Android phone with USB debugging enabled:
```bash
adb install release/BizzMitra-android.apk
```

### Android Device (Direct Sideloading)
1. Send `release/BizzMitra-android.apk` to your phone via Google Drive, WhatsApp, or USB transfer.
2. Tap the file in your phone's File Manager and allow "Install from Unknown Sources" if prompted.
3. Tap **Install** and launch **BizzMitra AI**.

### iOS Device (via GitHub Actions CI)
Because building an iOS `.ipa` binary requires macOS and Apple Developer signing certificates:
1. Push your branch to GitHub.
2. Go to repository **Settings > Secrets and variables > Actions**.
3. Add the following secrets:
   - `APPLE_CERTIFICATE_BASE64`: Base64 string of your `.p12` distribution certificate.
   - `APPLE_CERTIFICATE_PASSWORD`: Password of the `.p12` certificate.
   - `APPLE_PROVISION_PROFILE_BASE64`: Base64 string of your `.mobileprovision` file.
4. Trigger the `.github/workflows/ios.yml` workflow under the **Actions** tab to build and download `BizzMitra-ios.ipa`.

---

## 3. User-Side Action Items (Your Work)

To make your mobile apps and live website fully synchronized in production, please complete these steps:

### 1. Deploy Frontend Changes to Vercel
Your mobile apps load content dynamically from `https://bizzmitra-ai.vercel.app/`. 
To ensure the apps display the new responsive mobile bottom nav, tablet icon-rail, touch zoom controls, and native bridge:
- Merge branch `feat/native-apps` into `main` (or push `feat/native-apps` to GitHub).
- Confirm your Vercel deployment completes successfully.

### 2. Backup Your Release Keystore Securely
The Android keystore generated for signing is located at:
- Path: `keys/bizzmitra-release.keystore`
- Keystore Password: `bizzmitra2026`
- Key Alias: `bizzmitra`
- Key Password: `bizzmitra2026`

> [!CAUTION]
> Back up this keystore file in a secure password manager or offline drive. If this keystore is lost, future updates to the app cannot be uploaded under the same Google Play listing.

### 3. Google Play Console Submission (When Ready)
- Open [Google Play Console](https://play.google.com/console).
- Create a new application under package name `com.bizzmitra.ai`.
- Upload `release/BizzMitra-android.apk` (or run `./gradlew bundleRelease` in `android/` to generate an `.aab` Android App Bundle).
- Complete the store listing and content rating questionnaires.
