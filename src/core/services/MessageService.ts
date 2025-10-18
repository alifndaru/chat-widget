import ApiService from "@/core/services/ApiService";
import type {
  MessageDTO as MessageData,
  CreateMessageDTO as CreateMessageRequest,
  UpdateMessageRequest,
  PaginatedMessageResponse,
} from "@/types/message";

class MessageService {
  /**
   * Create a new message (single)
   */
  static async createMessage(request: CreateMessageRequest): Promise<any> {
    try {
      const response = await ApiService.post("/messages", request);
      // Return the full response to handle status and message fields
      return response.data;
    } catch (error) {
      console.error("MessageService: Error creating message:", error);
      throw error;
    }
  }

  /**
   * Create visitor and AI messages in a single request
   * Expected backend payload (pair object):
   * {
   *   visitor_message: CreateMessageDTO,
   *   ai_message: CreateMessageDTO
   * }
   */
  static async createVisitorAndAiMessages(payload: {
    visitor_message: CreateMessageRequest;
    ai_message: CreateMessageRequest;
  }): Promise<{ visitor_message: MessageData; ai_message: MessageData }> {
    try {
      const response = await ApiService.post("/messages", payload);
      const data = response.data?.data ?? response.data;
      return data as { visitor_message: MessageData; ai_message: MessageData };
    } catch (error) {
      console.error(
        "MessageService: Error creating visitor+AI messages:",
        error,
      );
      console.error("Payload:", payload);
      throw error;
    }
  }

  /**
   * Get messages by conversation ID
   */
  static async getMessagesByConversationId(
    conversationId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<MessageData[]> {
    try {
      const response = await ApiService.get(
        `/messages/conversation/${conversationId}?limit=${limit}&offset=${offset}`,
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Error getting messages by conversation ID:", error);
      return [];
    }
  }

  /**
   * Get message history with cursor pagination
   */
  static async getMessageHistory(
    conversationUuid: string,
    limit: number = 50,
    beforeId?: number,
    beforeTimestamp?: string,
  ): Promise<{
    messages: MessageData[];
    hasMore: boolean;
    nextBeforeId?: number;
  }> {
    try {
      let url = `/messages/history?conversation_uuid=${conversationUuid}&limit=${limit}`;

      if (beforeId) {
        url += `&before_id=${beforeId}`;
      }

      if (beforeTimestamp) {
        url += `&before_timestamp=${beforeTimestamp}`;
      }
      const response = await ApiService.get(url);

      const result = {
        messages: response.data.data.items || [],
        hasMore: response.data.data.has_more || false,
        nextBeforeId: response.data.data.next_before_id,
      };
      return result;
    } catch (error) {
      console.error("Error getting message history:", error);
      return { messages: [], hasMore: false };
    }
  }

  /**
   * Get message by ID
   */
  static async getMessageById(id: number): Promise<MessageData> {
    try {
      const response = await ApiService.get(`/messages/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error getting message by ID:", error);
      throw error;
    }
  }

  /**
   * Update message
   */
  static async updateMessage(
    id: number,
    request: UpdateMessageRequest,
  ): Promise<MessageData> {
    try {
      const response = await ApiService.put(`/messages/${id}`, request);
      return response.data.data;
    } catch (error) {
      console.error("Error updating message:", error);
      throw error;
    }
  }

  /**
   * Delete message
   */
  static async deleteMessage(id: number): Promise<void> {
    try {
      await ApiService.delete(`/messages/${id}`);
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  }

  /**
   * List messages with pagination
   */
  static async listMessages(
    limit: number = 50,
    offset: number = 0,
  ): Promise<PaginatedMessageResponse> {
    try {
      const response = await ApiService.get(
        `/messages?limit=${limit}&offset=${offset}`,
      );
      return response.data.data;
    } catch (error) {
      console.error("Error listing messages:", error);
      throw error;
    }
  }
}

export default MessageService;
