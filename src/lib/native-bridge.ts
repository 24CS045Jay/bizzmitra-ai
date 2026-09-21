import { Capacitor } from "@capacitor/core";

export function isNative(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

export function platform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web";
  return Capacitor.getPlatform() as "ios" | "android" | "web";
}

/**
 * Converts a Blob or string to a base64 encoded string.
 */
async function toBase64(data: Blob | string): Promise<string> {
  if (typeof data === "string") {
    // UTF-8 string to base64
    return btoa(unescape(encodeURIComponent(data)));
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data:*/*;base64, prefix
      const commaIndex = result.indexOf(",");
      resolve(commaIndex !== -1 ? result.slice(commaIndex + 1) : result);
    };
    reader.readAsDataURL(data);
  });
}

/**
 * Universal file save and share helper.
 * On native mobile (iOS / Android), WebViews do not support <a download>.
 * We write the file to the app's Cache directory and invoke the native system share sheet.
 * On web, falls back to standard anchor trigger download.
 */
export async function saveAndShareFile(
  filename: string,
  data: Blob | string,
  mimeType: string = "application/octet-stream",
): Promise<void> {
  if (isNative()) {
    try {
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      const { Share } = await import("@capacitor/share");

      const base64Data = await toBase64(data);

      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      await Share.share({
        title: filename,
        text: `BizzMitra AI Export: ${filename}`,
        url: writeResult.uri,
        dialogTitle: `Share or Save ${filename}`,
      });
      return;
    } catch (err) {
      console.error("[NativeBridge] Native save/share failed, falling back to web download:", err);
    }
  }

  // Web fallback
  const blob = typeof data === "string" ? new Blob([data], { type: mimeType }) : data;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 400);
}

export type HapticKind = "light" | "medium" | "heavy" | "success" | "warning" | "error";

export async function haptic(kind: HapticKind = "light"): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
    switch (kind) {
      case "light":
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case "medium":
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case "heavy":
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case "success":
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case "warning":
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case "error":
        await Haptics.notification({ type: NotificationType.Error });
        break;
    }
  } catch {
    // Silently continue if haptics unavailable
  }
}

let nativeInitialized = false;

/**
 * Initializes native mobile runtime features:
 * - Automatically hides splash screen once the webview has mounted
 * - Synchronizes StatusBar style with the user's active theme
 * - Registers hardware back button listener for Android navigation
 */
export async function initNative(): Promise<void> {
  if (!isNative() || nativeInitialized) return;
  nativeInitialized = true;

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const { App } = await import("@capacitor/app");

    // 1. Hide Splash Screen smoothly
    setTimeout(() => {
      void SplashScreen.hide();
    }, 450);

    // 2. Synchronize Status Bar
    const syncStatusBar = async () => {
      try {
        const isDark = document.documentElement.classList.contains("dark");
        await StatusBar.setStyle({
          style: isDark ? Style.Dark : Style.Light,
        });
        if (Capacitor.getPlatform() === "android") {
          await StatusBar.setBackgroundColor({
            color: isDark ? "#181614" : "#F5F3EE",
          });
        }
      } catch (e) {
        console.warn("[NativeBridge] StatusBar sync warning:", e);
      }
    };

    await syncStatusBar();

    // Observe theme class changes on <html>
    const observer = new MutationObserver(() => {
      void syncStatusBar();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // 3. Android Hardware Back Button Handling
    if (Capacitor.getPlatform() === "android") {
      App.addListener("backButton", ({ canGoBack }) => {
        const path = window.location.pathname;
        const isRoot = path === "/" || path === "/dashboard";
        if (!isRoot && canGoBack) {
          window.history.back();
        } else {
          void App.exitApp();
        }
      });
    }

    console.log(`[NativeBridge] Initialized for platform: ${Capacitor.getPlatform()}`);
  } catch (err) {
    console.error("[NativeBridge] initNative failed:", err);
  }
}
