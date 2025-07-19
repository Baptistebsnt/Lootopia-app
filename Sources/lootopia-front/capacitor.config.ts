import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lootopia.app",
  appName: "Lootopia",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1f2937",
      showSpinner: true,
      spinnerColor: "#3b82f6",
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#1f2937",
    },
    Geolocation: {
      permissions: ["location"],
    },
    Camera: {
      permissions: ["camera"],
    },
  },
  ios: {
    contentInset: "always",
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
