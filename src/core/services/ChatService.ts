import ConversationService, {
  type ConversationData,
} from "@/core/services/ConversationService";
import MessageService from "@/core/services/MessageService";
import ConfigurationsService from "@/core/services/ConfigurationsService";
import type { MessageDTO as MessageData } from "@/types/message";
import type { ChatMessage, ChatSettings, ChatConversation } from "@/types/chat";
import { ErrorMessage } from "@/core/helpers/errorMessages";

// Interface for API response when creating messages
interface MessageCreateResponse {
  status?: string;
  message?: string;
  data?:
    | MessageData
    | MessageData[]
    | {
        visitor_message?: MessageData;
        error_message?: MessageData;
        ai_message?: MessageData;
      };
}

/**
 * Service untuk menangani semua operasi chat
 */
class ChatService {
  private static chatSettings: ChatSettings = {
    ai_source: "gemini",
    python_service_url: "",
  };

  /**
   * Load chat settings dari configurations dengan source ai
   */
  static async loadChatSettings(): Promise<ChatSettings> {
    try {
      const settings = await ConfigurationsService.getSettings();

      const pythonServiceSettings = settings.filter(
        (setting) => setting.source === "python_service",
      );
      pythonServiceSettings.forEach((setting) => {
        if (setting.key === "ai_source") {
          this.chatSettings.ai_source = setting.value || "gemini";
        }
        if (setting.key === "service_url") {
          this.chatSettings.python_service_url = setting.value || "";
        }
      });
      return { ...this.chatSettings };
    } catch (error) {
      console.error("Error loading chat settings:", error);
      return { ...this.chatSettings }; // Return default settings
    }
  }

  /**
   * Get current chat settings
   */
  static getChatSettings(): ChatSettings {
    return { ...this.chatSettings };
  }

  /**
   * Buat conversation baru dengan visitor UUID
   */
  static async createConversation(
    visitorUUID: string,
  ): Promise<ChatConversation> {
    try {
      if (!visitorUUID) {
        throw new Error("Visitor UUID is required");
      }

      // Create via ConversationService
      const conversationData = await ConversationService.createConversation({
        visitor_uuid: visitorUUID,
      }); // Validate that we got the required data
      if (!conversationData || !conversationData.uuid) {
        throw new Error("Invalid conversation data received from backend");
      }

      // The createConversation endpoint doesn't return ID immediately
      // We need to fetch the full conversation data to get the ID
      let fullConversationData: ConversationData = conversationData;

      // Always try to get the full conversation data with ID
      // since createConversation doesn't return the ID field
      try {
        // Add a small delay to ensure the conversation is fully created in the backend
        await new Promise((resolve) => setTimeout(resolve, 100));

        fullConversationData = await ConversationService.getConversationByUUID(
          conversationData.uuid,
        );
      } catch (error) {
        console.warn(
          "Could not fetch full conversation data, retrying:",
          error,
        );

        // Retry once more with longer delay
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          fullConversationData =
            await ConversationService.getConversationByUUID(
              conversationData.uuid,
            );
        } catch (retryError) {
          console.error(
            "Failed to fetch conversation data even after retry:",
            retryError,
          );
          // Use the original data but log that we don't have ID
          console.warn(
            "ChatService: Creating conversation without ID, messages will not be saved to database",
          );
        }
      }

      const chatConversation: ChatConversation = {
        id: fullConversationData.uuid,
        title: "New Chat",
        uuid: fullConversationData.uuid,
        conversationData: fullConversationData,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return chatConversation;
    } catch (error) {
      console.error("ChatService: Error creating conversation:", error);
      throw error;
    }
  }

  /**
   * Load messages untuk conversation
   */
  static async loadHistoryMessages(conversation: ChatConversation): Promise<{
    messages: ChatMessage[];
    hasMore: boolean;
    nextBeforeId?: number;
  }> {
    try {
      // Use the new history endpoint
      const {
        messages: messagesData,
        hasMore,
        nextBeforeId,
      } = await MessageService.getMessageHistory(
        conversation.uuid,
        50, // default limit
      );

      const messages: ChatMessage[] = messagesData
        .map((msg: MessageData) => ({
          id: msg.id.toString(),
          // Treat "visitor" as sent messages, others as received
          type: (msg.sender === "visitor" ? "sent" : "received") as
            | "sent"
            | "received",
          text: msg.message_content,
          timestamp: new Date(msg.created_at),
          conversation_uuid: conversation.uuid,
          sender: msg.sender,
          engine: msg.engine,
          message_type: msg.message_type,
          is_successful: msg.is_successful,
        }))
        // Ensure messages are sorted by timestamp (oldest first) for proper chat flow
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      return { messages, hasMore, nextBeforeId };
    } catch (error) {
      console.error("Error loading conversation messages:", error);
      return { messages: [], hasMore: false };
    }
  }

  // Load older messages for infinite scroll
  static async loadOlderMessages(
    conversationUuid: string,
    oldestMessageId: number,
    limit: number = 20,
  ): Promise<{
    messages: ChatMessage[];
    hasMore: boolean;
    nextBeforeId?: number;
  }> {
    try {
      const {
        messages: messagesData,
        hasMore,
        nextBeforeId,
      } = await MessageService.getMessageHistory(
        conversationUuid,
        limit,
        oldestMessageId, // beforeId for pagination
      );

      const messages: ChatMessage[] = messagesData
        .map((msg: MessageData) => ({
          id: msg.id.toString(),
          type: (msg.sender === "visitor" ? "sent" : "received") as
            | "sent"
            | "received",
          text: msg.message_content,
          timestamp: new Date(msg.created_at),
          conversation_uuid: conversationUuid,
          sender: msg.sender,
          engine: msg.engine,
          message_type: msg.message_type,
          is_successful: msg.is_successful,
        }))
        // Ensure messages are sorted by timestamp (oldest first) for proper chat flow
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      return { messages, hasMore, nextBeforeId };
    } catch (error) {
      console.error("Error loading older messages:", error);
      return { messages: [], hasMore: false };
    }
  }

  /**
   * Helper to map MessageData -> ChatMessage
   */
  private static mapToChatMessage(
    msg: MessageData,
    conversationUuid: string,
  ): ChatMessage {
    return {
      id: msg.id.toString(),
      type: msg.sender === "visitor" ? "sent" : "received",
      text: msg.message_content,
      timestamp: new Date(msg.created_at),
      conversation_uuid: conversationUuid,
      sender: msg.sender,
      engine: msg.engine,
      message_type: msg.message_type,
      is_successful: msg.is_successful,
      canRetry: msg.sender !== "visitor" && msg.is_successful === false, // AI messages that failed can be retried
    };
  }

  /**
   * Send message dan terima response dari AI
   * - Prefer single-endpoint flow using /chat that returns and persists both visitor & AI messages
   * - Fallback: if backend doesn't return persisted messages, save via /messages
   */
  static async sendMessage(
    conversation: ChatConversation,
    messageText: string,
  ): Promise<{
    visitorMessage: ChatMessage;
    aiMessage: ChatMessage;
    dateIndicator?: ChatMessage;
  }> {
    // Check if we have conversation data
    if (!conversation.conversationData) {
      console.error("Invalid conversation - missing conversationData");
      throw new Error("Invalid conversation - missing conversationData");
    }

    // We use conversation.uuid directly, no need for numeric ID

    // Check if this is the first message in the conversation
    const isFirstMessage =
      !conversation.messages || conversation.messages.length === 0;

    // Prepare local visitor message (for optimistic UI / fallback)
    const tempVisitorMessage: ChatMessage = {
      id: this.generateMessageUuid(),
      type: "sent",
      text: messageText,
      timestamp: new Date(),
      conversation_uuid: conversation.uuid,
      sender: "visitor",
      engine: "visitor",
      message_type: "text",
    };

    try {
      // Single call to backend: POST /messages dengan sender="visitor"
      // Backend akan menyimpan visitor message, memicu AI, menyimpan AI message, dan mengembalikan AI message
      const response: MessageCreateResponse =
        await MessageService.createMessage({
          conversation_uuid: conversation.uuid,
          sender: "visitor",
          engine: this.chatSettings.ai_source,
          message_type: "text",
          message_content: messageText,
        });

      // Check if response indicates AI failure
      const isAIResponseFailed =
        response.status === "warning" ||
        response.message?.includes("AI response failed");

      let visitorMessage: ChatMessage;
      let aiMessage: ChatMessage;
      let dateIndicator: ChatMessage | undefined;

      // Create date indicator if this is the first message
      if (isFirstMessage) {
        const today = new Date();
        // Use local date instead of UTC to avoid timezone issues
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`; // Format: YYYY-MM-DD in local timezone

        dateIndicator = {
          id: this.generateMessageUuid(),
          type: "received", // Using "received" type but with special sender
          text: dateString,
          timestamp: today,
          conversation_uuid: conversation.uuid,
          sender: "date",
          engine: "system",
          message_type: "date",
          is_successful: true,
        };
      }

      if (isAIResponseFailed) {
        // Handle AI failure - create error message using backend message
        const responseData = response.data;

        if (
          responseData &&
          typeof responseData === "object" &&
          !Array.isArray(responseData)
        ) {
          // Single visitor message, create error message using backend message
          visitorMessage = this.mapToChatMessage(
            responseData as MessageData,
            conversation.uuid,
          );
          // Use visitor-friendly error message instead of technical message
          aiMessage = {
            id: this.generateMessageUuid(),
            type: "received",
            text: ErrorMessage(response.message || "AI response failed"),
            timestamp: new Date(),
            conversation_uuid: conversation.uuid,
            sender: "system",
            engine: "system",
            message_type: "error",
            is_successful: false,
          };
        } else {
          // Fallback: create both messages in frontend, but prioritize backend error message
          visitorMessage = {
            id: this.generateMessageUuid(),
            type: "sent",
            text: messageText,
            timestamp: new Date(),
            conversation_uuid: conversation.uuid,
            sender: "visitor",
            engine: this.chatSettings.ai_source,
            message_type: "text",
          };

          aiMessage = {
            id: this.generateMessageUuid(),
            type: "received",
            text: ErrorMessage(response.message || "AI response failed"),
            timestamp: new Date(),
            conversation_uuid: conversation.uuid,
            sender: "system",
            engine: "system",
            message_type: "error",
            is_successful: false,
          };
        }
      } else {
        // Normal case: AI response successful
        // Backend returns single AI message, create visitor message in frontend
        const responseData = response.data;
        aiMessage = this.mapToChatMessage(
          (responseData || response) as MessageData,
          conversation.uuid,
        );
        visitorMessage = {
          id: this.generateMessageUuid(),
          type: "sent",
          text: messageText,
          timestamp: new Date(),
          conversation_uuid: conversation.uuid,
          sender: "visitor",
          engine: this.chatSettings.ai_source,
          message_type: "text",
        };
      }

      return { visitorMessage, aiMessage, dateIndicator };
    } catch (error) {
      console.error("Error sending message:", error);

      // Try to extract error message from backend response
      let errorText = "Network error or server unavailable";
      if (error && typeof error === "object" && "response" in error) {
        const response = (error as any).response;
        if (response?.data?.message) {
          errorText = response.data.message;
        } else if (response?.data?.error) {
          errorText = response.data.error;
        }
      } else if (error instanceof Error) {
        errorText = error.message;
      }

      // Build error message for UI
      const errorMessage: ChatMessage = {
        id: this.generateMessageUuid(),
        type: "received",
        text: errorText,
        timestamp: new Date(),
        conversation_uuid: conversation.uuid,
        sender: "system",
        engine: "system",
        message_type: "error",
        is_successful: false,
      };

      // Return UI-only messages on error (no DB persistence here)
      // Include date indicator if this was first message
      const result: {
        visitorMessage: ChatMessage;
        aiMessage: ChatMessage;
        dateIndicator?: ChatMessage;
      } = {
        visitorMessage: tempVisitorMessage,
        aiMessage: errorMessage,
      };

      if (isFirstMessage) {
        const today = new Date();
        // Use local date instead of UTC to avoid timezone issues
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`; // Format: YYYY-MM-DD in local timezone

        result.dateIndicator = {
          id: this.generateMessageUuid(),
          type: "received",
          text: dateString,
          timestamp: today,
          conversation_uuid: conversation.uuid,
          sender: "date",
          engine: "system",
          message_type: "date",
          is_successful: true,
        };
      }

      return result;
    }
  }

  /**
   * Update conversation title berdasarkan first message
   */
  static generateConversationTitle(firstMessage: string): string {
    const title = firstMessage.substring(0, 50);
    return title.length === 50 ? title + "..." : title;
  }

  /**
   * Generate unique message UUID
   */
  private static generateMessageUuid(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Format time untuk display
   */
  static formatTime(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  /**
   * Convert ChatMessage ke format untuk UI components
   */
  static convertToUIMessage(
    message: ChatMessage,
    getAssetPath: (path: string) => string,
  ) {
    return {
      id: message.id,
      type: message.type === "sent" ? "out" : "in",
      name: message.type === "received" ? "Assistant" : undefined,
      image:
        message.type === "sent"
          ? getAssetPath("media/avatars/blank.png")
          : getAssetPath("media/avatars/blank.png.jpg"),
      time: this.formatTime(message.timestamp),
      text: message.text,
      conversation_uuid: message.conversation_uuid,
      sender: message.sender,
      engine: message.engine,
      message_type: message.message_type,
    };
  }
}

export default ChatService;
