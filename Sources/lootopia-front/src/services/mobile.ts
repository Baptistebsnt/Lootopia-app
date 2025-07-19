import { Geolocation } from "@capacitor/geolocation";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Device } from "@capacitor/device";
import { Network } from "@capacitor/network";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { StatusBar, Style } from "@capacitor/status-bar";
export class MobileService {
  private static instance: MobileService;
  private isMobile: boolean = false;
  private constructor() {
    this.checkPlatform();
  }
  static getInstance(): MobileService {
    if (!MobileService.instance) {
      MobileService.instance = new MobileService();
    }
    return MobileService.instance;
  }
  private async checkPlatform() {
    try {
      const info = await Device.getInfo();
      this.isMobile = info.platform !== "web";
      if (this.isMobile) {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#1f2937" });
      }
    } catch {
    }
  }
  async getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
  } | null> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  }
  async watchLocation(
    callback: (position: { latitude: number; longitude: number }) => void
  ) {
    try {
      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
        },
        (position) => {
          if (position) {
            callback({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        }
      );
      return watchId;
    } catch (error) {
      console.error("Error watching location:", error);
      return null;
    }
  }
  async takePhoto(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      return image.dataUrl || null;
    } catch (error) {
      console.error("Error taking photo:", error);
      return null;
    }
  }
  async scanQRCode(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      return image.dataUrl || null;
    } catch (error) {
      console.error("Error scanning QR code:", error);
      return null;
    }
  }
  async vibrate(duration: number = 100) {
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.error("Error vibrating:", error);
    }
  }
  async impact(style: ImpactStyle = ImpactStyle.Medium) {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.error("Error impact:", error);
    }
  }
  async checkNetworkStatus(): Promise<{
    connected: boolean;
    connectionType: string;
  }> {
    try {
      const status = await Network.getStatus();
      return {
        connected: status.connected,
        connectionType: status.connectionType,
      };
    } catch (error) {
      console.error("Error checking network:", error);
      return { connected: true, connectionType: "unknown" };
    }
  }
  isMobilePlatform(): boolean {
    return this.isMobile;
  }
  async requestLocationPermission(): Promise<boolean> {
    try {
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location === "granted") {
        return true;
      }
      const request = await Geolocation.requestPermissions();
      return request.location === "granted";
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return false;
    }
  }
}
export const mobileService = MobileService.getInstance();
