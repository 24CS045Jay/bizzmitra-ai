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
  if (typeof window === "undefined") return;
  try {
    const blob = typeof data === "string" ? new Blob([data], { type: `${mimeType};charset=utf-8` }) : data;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.style.display = "none";
    anchor.href = url;
    anchor.setAttribute("download", filename);
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
      try {
        if (anchor.parentNode) {
          document.body.removeChild(anchor);
        }
        URL.revokeObjectURL(url);
      } catch {}
    }, 15000);
  } catch (err) {
    console.error("[NativeBridge] File download trigger failed:", err);
  }
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
let splashHidden = false;

/**
 * Synchronizes native mobile StatusBar style & background color to match active theme.
 * Light mode: #F5F3EE background with dark icons (Style.Light).
 * Dark mode: #181614 background with light icons (Style.Dark).
 */
export async function syncNativeTheme(theme: "light" | "dark"): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    if (theme === "dark") {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: "#181614" });
    } else {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: "#F5F3EE" });
    }
  } catch (err) {
    console.warn("[NativeBridge] StatusBar theme sync note:", err);
  }
}

/**
 * Hides the native splash screen smoothly with a 300ms fade duration.
 * Guaranteed to fire ONLY after the first themed paint has rendered.
 */
export async function hideSplashScreen(): Promise<void> {
  if (!isNative() || splashHidden) return;
  splashHidden = true;
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 300 });
    console.log("[NativeBridge] SplashScreen smoothly dismissed post-paint");
  } catch (err) {
    console.warn("[NativeBridge] SplashScreen hide note:", err);
  }
}

/**
 * Initializes native mobile runtime features:
 * - Registers hardware back button listener for Android navigation
 */
export async function initNative(): Promise<void> {
  if (!isNative() || nativeInitialized) return;
  nativeInitialized = true;

  try {
    const { App } = await import("@capacitor/app");

    // 1. Android Hardware Back Button Handling
    if (Capacitor.getPlatform() === "android") {
      await App.addListener("backButton", ({ canGoBack }: { canGoBack: boolean }) => {
        if (window.location.pathname === "/" || window.location.pathname === "/workspace/dashboard") {
          void App.exitApp();
        } else if (canGoBack) {
          window.history.back();
        } else {
          void App.exitApp();
        }
      });
    }
    console.log(`[NativeBridge] Initialized for platform: ${Capacitor.getPlatform()}`);
  } catch (err) {
    console.warn("[NativeBridge] initNative note:", err);
  }
}

