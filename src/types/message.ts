// Shared types for messages across the app

export type MessageSender = "visitor" | "assistant" | "system" | "date";
export type MessageType = "text" | "error" | "date" | string;

export interface MessageDTO {
  id: number;
  conversation_uuid: string;
  sender: MessageSender;
  engine: string;
  message_type: MessageType;
  message_content: string;
  is_successful?: boolean;
  processing_time_ms?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageDTO {
  conversation_uuid: string;
  sender: MessageSender;
  engine: string;
  message_type: MessageType;
  message_content: string;
  is_successful?: boolean;
  processing_time_ms?: number;
  metadata?: any;
}

// Request untuk update message
export interface UpdateMessageRequest {
  conversation_uuid?: string;
  sender?: string;
  engine?: string;
  message_type?: string;
  message_content?: string;
  is_successful?: boolean;
  processing_time_ms?: number;
  metadata?: any;
}

// Response paginated list messages
export interface PaginatedMessageResponse {
  items: MessageDTO[];
  total_count: number;
  limit: number;
  offset: number;
}