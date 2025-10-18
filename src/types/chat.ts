import type { MessageDTO as MessageData } from "@/types/message";

export interface ChatMessage {
  id: string;
  type: "sent" | "received";
  text: string;
  timestamp: Date;
  conversation_uuid?: string;
  sender?: string;
  engine?: string;
  message_type?: string;
  is_successful?: boolean;
  canRetry?: boolean; // For failed AI messages that can be retried
}

export interface ChatSettings {
  ai_source: string;
  python_service_url: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  uuid: string;
  conversationData?: any; // Kept broad to avoid logic change; actual type comes from ConversationService
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  first_message?: {
    message_content?: string;
    [key: string]: any;
  };
  latest_message?: {
    message_content?: string;
    [key: string]: any;
  };
}

export interface SendMessageRequest {
  text: string;
  conversation_uuid?: string;
}

export interface SendMessageResponse {
  bot_response?: string;
  response?: string;
  name?: string;
  engine?: string;
  processing_time_ms?: number;
  // Optional unified response payload from backend when it also persists messages
  visitor_message?: MessageData;
  ai_message?: MessageData;
}
