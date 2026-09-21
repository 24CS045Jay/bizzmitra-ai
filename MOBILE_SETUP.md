# BizzMitra AI — Mobile Setup & Architecture Guide

This document outlines the mobile architecture for BizzMitra AI across Android and iOS.

---

## Architecture Overview

BizzMitra AI supports two mobile layers:

1. **Capacitor Production Shell (Primary — Recommended for Production):**
   - **Root Directories:** `android/`, `ios/`, `release/`, `mobile-shell/`
   - **Shell Configuration:** `capacitor.config.ts`
   - **Mechanism:** High-performance native wrapper loading `https://bizzmitra-ai.vercel.app/` with native hardware bridging (haptics, status bar styling, safe-share exporter, offline fallback shell).
   - **Outputs:** Signed production APK (`release/BizzMitra-android.apk`), iOS Xcode project (`ios/App/App.xcworkspace`), and GitHub Actions CI pipelines (`.github/workflows/`).

2. **Standalone Expo App (Reference / Prototype):**
   - **Directory:** `apps/mobile/`
   - **Mechanism:** Expo Router + React Native standalone codebase maintained as an isolated reference.

---

## Capacitor Native Setup (Primary)

### Prerequisites
- Node.js 20+ (Node 22 recommended)
- Java Development Kit (JDK 21)
- Android SDK (API 34/36)
- Xcode 15+ (macOS only, for local iOS builds)

### Common Commands

```bash
# Sync web changes into native platforms
npx cap sync

# Open Android Studio
npx cap open android

# Open Xcode (macOS only)
npx cap open ios

# Build release Android APK locally
cd android
./gradlew assembleRelease
```

### Keystore & Signing
- Release Keystore: `keys/bizzmitra-release.keystore`
- Alias: `bizzmitra`
- Password: `bizzmitra2026`
- Configured in: `android/app/build.gradle` via environment variables or default properties.

---

## Standalone Expo Setup (Reference)

To run the standalone Expo application in `apps/mobile`:

```bash
cd apps/mobile
npm install
npm run start
```
