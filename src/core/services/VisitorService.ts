import ApiService from "@/core/services/ApiService";

export interface VisitorData {
  id?: number;
  uuid: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface ApiResponse {
  status: string;
  message: string;
  data: VisitorData;
}

/**
 * Service untuk mengelola visitor tracking
 */
class VisitorService {
  private static readonly VISITOR_UUID_KEY = "visitor_uuid";

  /**
   * Membuat visitor baru dan menyimpan UUID ke sessionStorage
   */
  public static async createVisitor(): Promise<string | null> {
    try {
      const response = await ApiService.post("/visitors", {});

      // API returns 201 status code for successful creation
      if (response.status === 201 && response.data.status === "success" && response.data.data) {
        const visitorUUID = response.data.data.uuid;
        sessionStorage.setItem(this.VISITOR_UUID_KEY, visitorUUID);
        return visitorUUID;
      }

      console.error("Failed to create visitor:", response.data);
      return null;
    } catch (error) {
      console.error("Error creating visitor:", error);
      return null;
    }
  }

  /**
   * Mendapatkan UUID visitor dari sessionStorage
   */
  public static getVisitorUUID(): string | null {
    return sessionStorage.getItem(this.VISITOR_UUID_KEY);
  }

  /**
   * Mendapatkan atau membuat visitor UUID
   */
  public static async getOrCreateVisitorUUID(): Promise<string | null> {
    let visitorUUID = this.getVisitorUUID();

    if (!visitorUUID) {
      visitorUUID = await this.createVisitor();
    }

    return visitorUUID;
  }

  /**
   * Mendapatkan data visitor berdasarkan UUID
   */
  public static async getVisitorByUUID(
    uuid: string,
  ): Promise<VisitorData | null> {
    try {
      const response = await ApiService.get("/visitors", uuid);

      // API returns 200 status code for successful retrieval
      if (response.status === 200 && response.data.status === "success" && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error("Error getting visitor:", error);
      return null;
    }
  }

  /**
   * Menghapus visitor UUID dari sessionStorage
   */
  public static clearVisitorUUID(): void {
    sessionStorage.removeItem(this.VISITOR_UUID_KEY);
  }

  /**
   * Menghapus visitor dari backend
   */
  public static async deleteVisitor(uuid: string): Promise<boolean> {
    try {
      const response = await ApiService.delete(`/visitors/${uuid}`);

      // API returns 200 status code for successful deletion
      if (response.status === 200 && response.data.status === "success") {
        this.clearVisitorUUID();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting visitor:", error);
      return false;
    }
  }

  /**
   * Cek apakah visitor sudah ada
   */
  public static hasVisitor(): boolean {
    return !!this.getVisitorUUID();
  }
}

export default VisitorService;
