import ApiService from "@/core/services/ApiService";

export interface Setting {
  id?: string;
  source?: string;
  key: string;
  value: string;
  data_type?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface CreateSettingRequest {
  source?: string;
  key: string;
  value: string;
  data_type?: string;
  description?: string;
}

export interface UpdateSettingRequest {
  source?: string;
  key?: string;
  value?: string;
  data_type?: string;
  description?: string;
}

/**
 * @description service to call settings API
 */
class SettingsService {
  /**
   * @description get all settings
   * @returns Promise<Setting[]>
   */
  public static async getSettings(): Promise<Setting[]> {
    const response = await ApiService.get("/settings");
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * @description get setting by key
   * @param key
   * @returns Promise<Setting>
   */
  public static async getSettingByKey(key: string): Promise<Setting> {
    const response = await ApiService.get(`/settings/${key}`);
    return response.data || {};
  }

  /**
   * @description create a new setting
   * @param setting
   * @returns Promise<Setting>
   */
  public static async createSetting(
    setting: CreateSettingRequest,
  ): Promise<Setting> {
    const apiPayload = {
      source: setting.source || "admin",
      key: setting.key,
      value: setting.value,
      type: setting.data_type || "string", // Backend expects 'type', not 'data_type'
      description: setting.description || "",
    };

    const response = await ApiService.post("/settings", apiPayload);
    return response.data;
  }

  /**
   * @description update existing setting
   * @param id
   * @param setting
   * @returns Promise<Setting>
   */
  public static async updateSetting(
    id: string,
    setting: UpdateSettingRequest,
  ): Promise<Setting> {
    const apiPayload: any = {};
    if (setting.source !== undefined) apiPayload.source = setting.source;
    if (setting.key !== undefined) apiPayload.key = setting.key;
    if (setting.value !== undefined) apiPayload.value = setting.value;
    if (setting.data_type !== undefined) apiPayload.type = setting.data_type; // Backend expects 'type', not 'data_type'
    if (setting.description !== undefined)
      apiPayload.description = setting.description;

    const response = await ApiService.put(`/settings/${id}`, apiPayload);
    return response.data;
  }

  /**
   * @description delete setting
   * @param id
   * @returns Promise<void>
   */
  public static async deleteSetting(id: string): Promise<void> {
    await ApiService.delete(`/settings/${id}`);
  }

  /**
   * @description group settings by category
   * @param settings
   * @returns Record<string, Setting[]>
   */
  public static groupSettingsByCategory(
    settings: Setting[],
  ): Record<string, Setting[]> {
    // No enhanceSettings, just group by key prefix or fallback
    return settings.reduce((groups: Record<string, Setting[]>, setting) => {
      // Use key prefix as category if available
      const parts = setting.key.split(".");
      const category =
        parts.length > 1
          ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
          : "Uncategorized";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(setting);
      return groups;
    }, {});
  }

  /**
   * @description get setting categories
   * @param settings
   * @returns string[]
   */
  public static getCategories(settings: Setting[]): string[] {
    // No enhanceSettings, just get categories from key prefix
    const categories = settings.map((setting) => {
      const parts = setting.key.split(".");
      return parts.length > 1
        ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
        : "Uncategorized";
    });
    return Array.from(new Set(categories));
  }
}

export default SettingsService;
