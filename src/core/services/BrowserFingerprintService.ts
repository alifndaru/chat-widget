/**
 * Service untuk menghasilkan fingerprint browser yang unik
 * Digunakan untuk mencegah session hijacking pada visitor UUID
 */
class BrowserFingerprintService {
  private static readonly FINGERPRINT_KEY = "browser_fingerprint";
  private static cachedFingerprint: string | null = null;

  /**
   * Menghasilkan fingerprint browser menggunakan berbagai teknik
   */
  public static async generateFingerprint(): Promise<string> {
    try {
      const components = await Promise.all([
        this.getCanvasFingerprint(),
        this.getWebGLFingerprint(),
        this.getScreenFingerprint(),
        this.getSystemFingerprint(),
      ]);

      // Gabungkan semua komponen dan hash
      const combined = components.join("|");
      const hash = await this.hashString(combined);

      this.cachedFingerprint = hash;
      return hash;
    } catch (error) {
      console.warn("Browser fingerprinting failed, using fallback:", error);
      // Fallback ke timestamp-based fingerprint jika fingerprinting gagal
      return this.generateFallbackFingerprint();
    }
  }

  /**
   * Mendapatkan fingerprint dari canvas rendering
   */
  private static async getCanvasFingerprint(): Promise<string> {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve("no-canvas");
          return;
        }

        // Set canvas size
        canvas.width = 200;
        canvas.height = 50;

        // Draw various elements to create unique fingerprint
        ctx.fillStyle = "#f60";
        ctx.fillRect(0, 0, 200, 50);
        ctx.fillStyle = "#069";
        ctx.font = "16px Arial";
        ctx.fillText("Browser Fingerprint", 10, 30);

        // Add some graphics
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.arc(100, 25, 10, 0, 2 * Math.PI);
        ctx.stroke();

        resolve(canvas.toDataURL());
      } catch (error) {
        resolve("canvas-error");
      }
    });
  }

  /**
   * Mendapatkan fingerprint dari WebGL renderer
   */
  private static async getWebGLFingerprint(): Promise<string> {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") as any || canvas.getContext("experimental-webgl") as any;

        if (!gl) {
          resolve("no-webgl");
          return;
        }

        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          resolve(`${vendor}|${renderer}`);
        } else {
          resolve("webgl-no-debug");
        }
      } catch (error) {
        resolve("webgl-error");
      }
    });
  }

  /**
   * Mendapatkan fingerprint dari properti layar
   */
  private static getScreenFingerprint(): string {
    try {
      const screen = window.screen;
      return [
        screen.width,
        screen.height,
        screen.colorDepth,
        screen.pixelDepth,
        window.devicePixelRatio || 1,
      ].join(",");
    } catch (error) {
      return "screen-error";
    }
  }

  /**
   * Mendapatkan fingerprint dari properti sistem
   */
  private static getSystemFingerprint(): string {
    try {
      const navigator = window.navigator;
      return [
        navigator.language || "unknown",
        navigator.languages ? navigator.languages.join(",") : "unknown",
        Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
        navigator.platform || "unknown",
        navigator.hardwareConcurrency || "unknown",
        (navigator as any).deviceMemory || "unknown",
      ].join("|");
    } catch (error) {
      return "system-error";
    }
  }

  /**
   * Menghasilkan fallback fingerprint jika fingerprinting utama gagal
   */
  private static generateFallbackFingerprint(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `fallback-${timestamp}-${random}`;
  }

  /**
   * Hash string menggunakan SHA-256
   */
  private static async hashString(input: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    } catch (error) {
      // Fallback ke simple hash jika crypto API tidak tersedia
      return this.simpleHash(input);
    }
  }

  /**
   * Simple hash function sebagai fallback
   */
  private static simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Menyimpan fingerprint ke sessionStorage
   */
  public static storeFingerprint(fingerprint: string): void {
    try {
      sessionStorage.setItem(this.FINGERPRINT_KEY, fingerprint);
      this.cachedFingerprint = fingerprint;
    } catch (error) {
      console.error("Failed to store browser fingerprint:", error);
    }
  }

  /**
   * Mendapatkan fingerprint dari sessionStorage
   */
  public static getStoredFingerprint(): string | null {
    try {
      if (this.cachedFingerprint) {
        return this.cachedFingerprint;
      }

      const stored = sessionStorage.getItem(this.FINGERPRINT_KEY);
      if (stored) {
        this.cachedFingerprint = stored;
      }
      return stored;
    } catch (error) {
      console.error("Failed to get stored fingerprint:", error);
      return null;
    }
  }

  /**
   * Memvalidasi fingerprint terhadap yang tersimpan
   */
  public static validateFingerprint(fingerprint: string): boolean {
    const stored = this.getStoredFingerprint();
    return stored === fingerprint;
  }

  /**
   * Menghapus fingerprint dari sessionStorage
   */
  public static clearFingerprint(): void {
    try {
      sessionStorage.removeItem(this.FINGERPRINT_KEY);
      this.cachedFingerprint = null;
    } catch (error) {
      console.error("Failed to clear browser fingerprint:", error);
    }
  }

  /**
   * Mengecek apakah fingerprint tersedia
   */
  public static hasFingerprint(): boolean {
    return !!this.getStoredFingerprint();
  }
}

export default BrowserFingerprintService;
