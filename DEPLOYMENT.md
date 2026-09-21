# BizzMitra AI — Production Deployment Guide

This guide details the end-to-end deployment workflow for the **BizzMitra AI Platform**, covering the centralized web portal, server API gateway, Supabase database, and multi-platform native app distributions.

---

## 1. Production Architecture Overview

```
                         CLIENTS
        Web Desktop · Web Tablet · Mobile PWA · Android APK/AAB · iOS TestFlight
                           │
                           ▼
               CENTRALIZED API GATEWAY
           (TanStack Start Nitro Server @ /api/*)
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
 Supabase Auth        AI Engine (Groq)    Supabase PostgreSQL
  & RBAC Engine      & Solution Builder   with Multi-Tenant RLS
```

---

## 2. Web & Server Deployment

### 2.1 Environment Configuration
Ensure the following environment variables are configured on your hosting provider (Vercel, AWS ECS, or Node Server):

```env
# Supabase Configuration
SUPABASE_URL="https://pyqbmgkusnvyyjdsyqyj.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_UNXcq8DuZlHhTimGfZVx4A_qVCnnnZh"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_r-9ktd2UNo0Dv1xZEJwhLQ_PQBKXa5n"

# AI Inference Keys (Server-side only)
GROQ_API_KEY="your_production_groq_key"
GEMINI_API_KEY="your_production_gemini_key"

# Client Public Keys
VITE_SUPABASE_URL="https://pyqbmgkusnvyyjdsyqyj.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_UNXcq8DuZlHhTimGfZVx4A_qVCnnnZh"
VITE_RAZORPAY_KEY_ID="rzp_test_TcCkj2XoiCr1tZ"
```

### 2.2 Vercel Deployment (Recommended)
The repository includes automatic Nitro Vercel server preset configuration.
1. Connect GitHub repository to Vercel.
2. Set Framework Preset: **Other** / **Vite**.
3. Build Command: `npm run build`
4. Output Directory: `.output/public`
5. Deploy.

### 2.3 Standalone Node / Docker Server
To run the server as a high-performance container or self-hosted VM:
```bash
# 1. Build client and Nitro server
npm run build

# 2. Start production Nitro server
node .output/server/index.mjs
```
The server listens on `http://0.0.0.0:3000` by default.

---

## 3. Database & Security Setup

1. **PostgreSQL 16 Multi-Tenant RLS**:
   Execute the migration script in `supabase/full_schema_setup.sql` to enforce Row Level Security:
   ```sql
   ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
   ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
   ```
2. **Storage Buckets**:
   - Create bucket `documents` (Private, authenticated upload only).
   - Create bucket `exports` (Private with signed URL access).

---

## 4. Mobile Apps Production Deployment

### 4.1 Android Production (Google Play)
1. In `apps/mobile/eas.json`, verify profile `production`.
2. Build the Android App Bundle:
   ```bash
   cd apps/mobile
   eas build --platform android --profile production
   ```
3. Download the signed `.aab` file and upload to Google Play Console.

### 4.2 iOS Production (Apple App Store)
1. Build the IPA for App Store submission:
   ```bash
   cd apps/mobile
   eas build --platform ios --profile production
   ```
2. Submit to TestFlight / App Store Review:
   ```bash
   eas submit --platform ios
   ```

---

## 5. Health Check & Validation Endpoints

Test that the central API gateway is responding:
- `GET /api/notifications` (Status 200)
- `GET /api/export/docx?workspaceName=Test` (Status 200, Content-Type: application/msword)
- `GET /manifest.json` (Status 200, PWA manifest valid)
- `GET /sw.js` (Status 200, Service worker registered)
