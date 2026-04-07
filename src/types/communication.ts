// Types for Communication/Messaging features
// These interfaces are designed to be compatible with future API integration

export interface ClientMessage {
  id: string;
  applicationNo: string;
  companyName: string;
  clientName: string;
  lastMessage?: string;
  unreadCount?: number;
  timestamp?: string;
}

export interface Message {
  id: string;
  sender: "client" | "team" | "system";
  content: string;
  timestamp: string;
  senderName?: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: "image" | "document" | "other";
  size?: number;
}

export interface ChatSession {
  id: string;
  applicationNo: string;
  companyName: string;
  messages: Message[];
  participants?: Participant[];
  status?: "active" | "closed" | "archived";
}

export interface Participant {
  id: string;
  name: string;
  role: "client" | "team" | "admin";
  avatar?: string;
}

// API Response types for future integration
export interface MessagesListResponse {
  data: ClientMessage[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ChatSessionResponse {
  data: ChatSession;
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
  attachments?: File[];
}

export interface SendMessageResponse {
  success: boolean;
  message: Message;
}
