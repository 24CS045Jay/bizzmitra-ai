import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bizzmitra.ai",
  appName: "BizzMitra AI",
  webDir: ".output/public",
  server: {
    androidScheme: "https",
    iosScheme: "https",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#09090b",
      showSpinner: true,
      spinnerColor: "#4f46e5",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#09090b",
    },
  },
};

export default config;
