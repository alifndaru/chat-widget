import VisitorService from "@/core/services/VisitorService";
import ConversationService, { type ConversationData } from "@/core/services/ConversationService";

export interface ChatInitOptions {
  autoCreateConversation?: boolean;
  forceNewVisitor?: boolean;
}

export interface ChatInitResult {
  success: boolean;
  visitorUUID: string | null;
  conversation: ConversationData | null;
  error?: string;
}

/**
 * Comprehensive chat initialization helper
 * Handles visitor and conversation initialization in a single, reusable function
 */
export class ChatInitializationHelper {
  /**
   * Initialize chat session with visitor and conversation
   * @param options Configuration options for initialization
   * @returns Promise<ChatInitResult> Initialization result
   */
  static async initializeChatSession(
    options: ChatInitOptions = {}
  ): Promise<ChatInitResult> {
    try {
      // Initialize visitor
      const visitorResult = await this.initializeVisitor(options);

      if (!visitorResult.success) {
        return {
          success: false,
          visitorUUID: null,
          conversation: null,
          error: visitorResult.error || "Failed to initialize visitor"
        };
      }

      // Initialize conversation
      const conversationResult = await this.initializeConversation(
        visitorResult.visitorUUID!,
        options
      );

      return {
        success: conversationResult.success,
        visitorUUID: visitorResult.visitorUUID,
        conversation: conversationResult.conversation,
        error: conversationResult.error
      };

    } catch (error) {
      console.error("Chat initialization error:", error);
      return {
        success: false,
        visitorUUID: null,
        conversation: null,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  /**
   * Initialize visitor only
   * @param options Configuration options
   * @returns Promise<{success: boolean, visitorUUID: string | null, error?: string}>
   */
  static async initializeVisitor(
    options: ChatInitOptions = {}
  ): Promise<{success: boolean, visitorUUID: string | null, error?: string}> {
    try {
      // Clear existing visitor if force new is requested
      if (options.forceNewVisitor) {
        VisitorService.clearVisitorUUID();
      }

      // Get or create visitor UUID
      const visitorUUID = await VisitorService.getOrCreateVisitorUUID();

      if (!visitorUUID) {
        return {
          success: false,
          visitorUUID: null,
          error: "Failed to get or create visitor UUID"
        };
      }

      return {
        success: true,
        visitorUUID
      };

    } catch (error) {
      console.error("Visitor initialization error:", error);
      return {
        success: false,
        visitorUUID: null,
        error: error instanceof Error ? error.message : "Failed to initialize visitor"
      };
    }
  }

  /**
   * Initialize conversation only
   * @param visitorUUID Visitor UUID to use
   * @param options Configuration options
   * @returns Promise<{success: boolean, conversation: ConversationData | null, error?: string}>
   */
  static async initializeConversation(
    visitorUUID: string,
    options: ChatInitOptions = {}
  ): Promise<{success: boolean, conversation: ConversationData | null, error?: string}> {
    try {
      let conversation: ConversationData | null = null;

      if (options.autoCreateConversation) {
        // Create new conversation
        conversation = await ConversationService.createConversation({
          visitor_uuid: visitorUUID
        });

        if (!conversation) {
          return {
            success: false,
            conversation: null,
            error: "Failed to create new conversation"
          };
        }
      } else {
        // Try to get active conversation first
        conversation = await ConversationService.getActiveConversationByVisitorUuid(visitorUUID);

        // If no active conversation exists, create one
        if (!conversation) {
          conversation = await ConversationService.createConversation({
            visitor_uuid: visitorUUID
          });

          if (!conversation) {
            return {
              success: false,
              conversation: null,
              error: "Failed to get active conversation or create new one"
            };
          }
        }
      }

      return {
        success: true,
        conversation
      };

    } catch (error) {
      console.error("Conversation initialization error:", error);
      return {
        success: false,
        conversation: null,
        error: error instanceof Error ? error.message : "Failed to initialize conversation"
      };
    }
  }

  /**
   * Quick initialization - get existing or create new session
   * @returns Promise<ChatInitResult> Quick initialization result
   */
  static async quickInit(): Promise<ChatInitResult> {
    return this.initializeChatSession({
      autoCreateConversation: false // Use existing or create if none exists
    });
  }

  /**
   * Fresh session initialization - force new visitor and conversation
   * @returns Promise<ChatInitResult> Fresh session result
   */
  static async freshInit(): Promise<ChatInitResult> {
    return this.initializeChatSession({
      forceNewVisitor: true,
      autoCreateConversation: true
    });
  }

  /**
   * Check if chat session is ready by verifying visitor exists on backend
   * @returns Promise<boolean> True if visitor exists on backend
   */
  static async isSessionReady(): Promise<boolean> {
    try {
      const visitorUUID = VisitorService.getVisitorUUID();
      if (!visitorUUID) {
        return false;
      }

      // Verify visitor exists on backend
      const visitorData = await VisitorService.getVisitorByUUID(visitorUUID);
      return !!visitorData;
    } catch (error) {
      console.error("Error checking session readiness:", error);
      return false;
    }
  }

  /**
   * Get current session status
   * @returns {visitorUUID: string | null, hasConversation: boolean}
   */
  static getSessionStatus(): {visitorUUID: string | null, hasConversation: boolean} {
    const visitorUUID = VisitorService.getVisitorUUID();
    return {
      visitorUUID,
      hasConversation: false // Could be enhanced to check for active conversation
    };
  }

  /**
   * Ensure chat session exists (visitor + conversation)
   * Reuses existing session or creates new one if needed
   * @returns Promise<ChatInitResult> Session initialization result
   */
  static async ensureSession(): Promise<ChatInitResult> {
    try {
      // Check if visitor exists in localStorage
      let visitorUUID = VisitorService.getVisitorUUID();
      
      if (!visitorUUID) {
        // No visitor UUID in localStorage, initialize new session
        return await this.quickInit();
      }

      // Verify visitor exists on backend
      try {
        const visitorData = await VisitorService.getVisitorByUUID(visitorUUID);

        if (!visitorData) {
          // Visitor UUID exists locally but not on backend, reinitialize
          VisitorService.clearVisitorUUID();
          return await this.quickInit();
        }

        // Visitor exists, check for active conversation
        const conversation =
          await ConversationService.getActiveConversationByVisitorUuid(
            visitorUUID
          );

        if (!conversation) {
          // Create new conversation for existing visitor
          const newConversation = await ConversationService.createConversation({
            visitor_uuid: visitorUUID,
          });

          return {
            success: !!newConversation,
            visitorUUID,
            conversation: newConversation,
            error: newConversation
              ? undefined
              : "Failed to create conversation",
          };
        }

        // Everything exists, return current session
        return {
          success: true,
          visitorUUID,
          conversation,
        };
      } catch (error) {
        // Backend error, try to reinitialize
        console.error("Error verifying session:", error);
        VisitorService.clearVisitorUUID();
        return await this.quickInit();
      }

    } catch (error) {
      console.error('Session ensure error:', error);
      return {
        success: false,
        visitorUUID: null,
        conversation: null,
        error: error instanceof Error ? error.message : 'Failed to ensure session'
      };
    }
  }
}

export default ChatInitializationHelper;
