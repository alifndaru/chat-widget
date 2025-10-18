import VisitorService from "@/core/services/VisitorService";
import ConversationService from "@/core/services/ConversationService";

/**
 * Visitor helper utilities
 */
export class VisitorHelper {
  /**
   * Get the current visitor UUID from session storage
   * @returns {string | null} The visitor UUID or null if not found
   */
  static getCurrentVisitorUUID(): string | null {
    return VisitorService.getVisitorUUID();
  }

  /**
   * Check if visitor is already tracked
   * @returns {boolean} True if visitor UUID exists in session storage
   */
  static isVisitorTracked(): boolean {
    return VisitorService.hasVisitor();
  }

  /**
   * Get or create visitor UUID (async operation)
   * @returns {Promise<string | null>} The visitor UUID
   */
  static async ensureVisitorUUID(): Promise<string | null> {
    return await VisitorService.getOrCreateVisitorUUID();
  }

  /**
   * Clear visitor data from session storage
   */
  static clearVisitorData(): void {
    VisitorService.clearVisitorUUID();
  }

  /**
   * Get visitor data from API
   * @param {string} uuid - The visitor UUID
   * @returns {Promise<any>} The visitor data
   */
  static async getVisitorData(uuid?: string): Promise<any> {
    const visitorUUID = uuid || VisitorService.getVisitorUUID();
    if (!visitorUUID) {
      throw new Error("No visitor UUID available");
    }
    return await VisitorService.getVisitorByUUID(visitorUUID);
  }

  /**
   * Delete visitor from backend and clear local data
   * @param {string} uuid - The visitor UUID (optional, uses current if not provided)
   * @returns {Promise<boolean>} True if deletion was successful
   */
  static async deleteVisitor(uuid?: string): Promise<boolean> {
    const visitorUUID = uuid || VisitorService.getVisitorUUID();
    if (!visitorUUID) {
      throw new Error("No visitor UUID available");
    }
    return await VisitorService.deleteVisitor(visitorUUID);
  }

  /**
   * Get conversations for current visitor
   * @returns {Promise<any[]>} Array of conversations
   */
  static async getCurrentVisitorConversations(): Promise<any[]> {
    return await ConversationService.getConversationsByCurrentVisitor();
  }

  /**
   * Get active conversation for current visitor
   * @returns {Promise<any>} Active conversation or null
   */
  static async getCurrentVisitorActiveConversation(): Promise<any> {
    return await ConversationService.getActiveConversationByCurrentVisitor();
  }

  /**
   * Create new conversation for current visitor
   * @returns {Promise<any>} New conversation or null
   */
  static async createConversationForCurrentVisitor(): Promise<any> {
    return await ConversationService.createConversationForCurrentVisitor();
  }
}

export default VisitorHelper;