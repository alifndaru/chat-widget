import ApiService from "@/core/services/ApiService";
import VisitorService from "@/core/services/VisitorService";

export interface ConversationData {
  id?: number;
  uuid: string;
  visitor_uuid?: string;
  started_at?: string;
  updated_at?: string;
  status?: string;
  title?: string; // Add title field for frontend use
  first_message?: {
    message_content?: string;
    [key: string]: any;
  };
  latest_message?: {
    message_content?: string;
    [key: string]: any;
  };
}

export interface CreateConversationRequest {
  visitor_uuid: string;
}

export interface UpdateConversationRequest {
  status?: string;
  title?: string; // Add title field for future backend support
}

export interface PaginatedConversationResponse {
  items: ConversationData[];
  total_count: number;
  limit: number;
  offset: number;
}

class ConversationService {
  /**
   * Create a new conversation
   */
  static async createConversation(
    request: CreateConversationRequest,
  ): Promise<ConversationData> {
    try {
      const response = await ApiService.post("/conversations", request);
      return response.data.data;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  /**
   * List conversations with pagination
   */
  static async listConversations(
    limit: number = 10,
    offset: number = 0,
  ): Promise<PaginatedConversationResponse> {
    try {
      const response = await ApiService.get(
        `/conversations?limit=${limit}&offset=${offset}`,
      );
      return response.data.data;
    } catch (error) {
      console.error("Error listing conversations:", error);
      throw error;
    }
  }

  /**
   * Get conversation with visitor data by UUID
   */
  static async getConversationWithVisitorByUUID(
    uuid: string,
  ): Promise<ConversationData> {
    try {
      const response = await ApiService.get(
        `/conversations/${uuid}/with-visitor`,
      );
      return response.data.data;
    } catch (error) {
      console.error("Error getting conversation with visitor by UUID:", error);
      throw error;
    }
  }

  /**
   * Get conversation by UUID
   */
  static async getConversationByUUID(uuid: string): Promise<ConversationData> {
    try {
      const response = await ApiService.get(`/conversations/${uuid}`);
      return response.data.data;
    } catch (error) {
      console.error("Error getting conversation by UUID:", error);
      throw error;
    }
  }

  /**
   * Get conversations by visitor ID
   */
  static async getConversationsByVisitorId(
    visitorId: number,
  ): Promise<ConversationData[]> {
    try {
      const response = await ApiService.get(
        `/conversations/visitor/${visitorId}`,
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Error getting conversations by visitor ID:", error);
      return [];
    }
  }

  /**
   * Get conversations by visitor UUID
   */
  static async getConversationsByVisitorUuid(
    visitor_uuid: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<ConversationData[]> {
    try {
      const slug = `${visitor_uuid}?limit=${limit}&offset=${offset}`;
      const response = await ApiService.get("/conversations/visitor", slug);
      const data = response.data?.data;
      // Support both array and paginated object
      if (Array.isArray(data)) return data as ConversationData[];
      if (data && Array.isArray(data.items))
        return data.items as ConversationData[];
      return [];
    } catch (error) {
      console.error("Error getting conversations by visitor UUID:", error);
      return [];
    }
  }

  /**
   * Get active conversation by visitor ID
   */
  static async getActiveConversationByVisitorId(
    visitorId: number,
  ): Promise<ConversationData> {
    try {
      const response = await ApiService.get(
        `/conversations/visitor/${visitorId}/active`,
      );
      return response.data.data;
    } catch (error) {
      console.error("Error getting active conversation by visitor ID:", error);
      throw error;
    }
  }

  /**
   * Get active conversation by visitor UUID
   */
  static async getActiveConversationByVisitorUuid(
    visitorUuid: string,
  ): Promise<ConversationData | null> {
    try {
      // First try the dedicated active endpoint if it exists
      try {
        const response = await ApiService.get(
          `/conversations/visitor/${visitorUuid}/active`,
        );
        return response.data.data;
      } catch (activeEndpointError) {
        const conversations =
          await this.getConversationsByVisitorUuid(visitorUuid);

        // Find the most recent conversation or one marked as active
        // You may need to adjust this logic based on your data structure
        if (conversations.length > 0) {
          // Return the most recently updated conversation as active
          const sortedConversations = conversations.sort((a, b) => {
            const dateA = new Date(a.updated_at || a.started_at || "");
            const dateB = new Date(b.updated_at || b.started_at || "");
            return dateB.getTime() - dateA.getTime();
          });
          return sortedConversations[0];
        }

        return null;
      }
    } catch (error) {
      console.error(
        "Error getting active conversation by visitor UUID:",
        error,
      );
      return null;
    }
  }

  /**
   * Update conversation
   */
  static async updateConversation(
    id: number,
    request: UpdateConversationRequest,
  ): Promise<ConversationData> {
    try {
      const response = await ApiService.put(`/conversations/${id}`, request);
      return response.data.data;
    } catch (error) {
      console.error("Error updating conversation:", error);
      throw error;
    }
  }

  /**
   * Delete conversation
   */
  static async deleteConversation(id: number): Promise<void> {
    try {
      await ApiService.delete(`/conversations/${id}`);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  }

  /**
   * Get conversations by visitor UUID from session storage
   */
  static async getConversationsByCurrentVisitor(): Promise<ConversationData[]> {
    try {
      // Get visitor UUID from session storage
      const visitorUUID = VisitorService.getVisitorUUID();

      if (!visitorUUID) {
        console.warn("No visitor UUID found in session storage");
        return [];
      }

      // Get conversations using visitor UUID directly
      return await this.getConversationsByVisitorUuid(visitorUUID);
    } catch (error) {
      console.error("Error getting conversations by current visitor:", error);
      return [];
    }
  }

  /**
   * Get active conversation by current visitor UUID from session storage
   */
  static async getActiveConversationByCurrentVisitor(): Promise<ConversationData | null> {
    try {
      // Get visitor UUID from session storage
      const visitorUUID = VisitorService.getVisitorUUID();

      if (!visitorUUID) {
        console.warn("No visitor UUID found in session storage");
        return null;
      }

      // Get active conversation using visitor UUID directly
      return await this.getActiveConversationByVisitorUuid(visitorUUID);
    } catch (error) {
      console.error(
        "Error getting active conversation by current visitor:",
        error,
      );
      return null;
    }
  }

  /**
   * Create conversation for current visitor from session storage
   */
  static async createConversationForCurrentVisitor(): Promise<ConversationData | null> {
    try {
      // Get visitor UUID from session storage
      const visitorUUID = VisitorService.getVisitorUUID();

      if (!visitorUUID) {
        console.warn("No visitor UUID found in session storage");
        return null;
      }

      // Create conversation with visitor UUID
      return await this.createConversation({ visitor_uuid: visitorUUID });
    } catch (error) {
      console.error("Error creating conversation for current visitor:", error);
      return null;
    }
  }
}

export default ConversationService;
