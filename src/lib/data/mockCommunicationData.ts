// Mock data for Communication features
// TODO: Replace with actual API calls when backend is ready

import { ClientMessage, ChatSession } from "@/types/communication";

// Mock client messages list
export const mockClientMessages: ClientMessage[] = [
  {
    id: "1",
    applicationNo: "GUJC000001",
    companyName: "Tech Solutions Pvt Ltd",
    clientName: "Rajesh Kumar",
    lastMessage: "Lorem Ipsum is simply dummy text...",
    unreadCount: 2,
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    applicationNo: "RAJC000002",
    companyName: "Global Enterprises",
    clientName: "Priya Sharma",
    lastMessage: "The printing and typesetting industry...",
    unreadCount: 0,
    timestamp: "2024-01-14T15:45:00Z",
  },
];

// Mock chat sessions with messages
export const mockChatSessions: Record<string, ChatSession> = {
  "1": {
    id: "1",
    applicationNo: "GUJC000001",
    companyName: "GUJC000001",
    status: "active",
    messages: [
      {
        id: "m1",
        sender: "team",
        content: "Lorem Ipsum",
        timestamp: "2024-01-15T10:30:00Z",
        senderName: "Support Team",
      },
      {
        id: "m2",
        sender: "team",
        content:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        timestamp: "2024-01-15T10:31:00Z",
        senderName: "Support Team",
      },
      {
        id: "m3",
        sender: "system",
        content: "Corpé Team joined the conversation",
        timestamp: "2024-01-15T10:32:00Z",
      },
      {
        id: "m4",
        sender: "client",
        content:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever",
        timestamp: "2024-01-15T10:35:00Z",
        senderName: "Client",
      },
    ],
  },
  "2": {
    id: "2",
    applicationNo: "RAJC000002",
    companyName: "RAJC000002",
    status: "active",
    messages: [
      {
        id: "m1",
        sender: "team",
        content: "Hello! How can we help you today?",
        timestamp: "2024-01-14T15:45:00Z",
        senderName: "Support Team",
      },
      {
        id: "m2",
        sender: "client",
        content: "I need assistance with my application.",
        timestamp: "2024-01-14T15:50:00Z",
        senderName: "Client",
      },
    ],
  },
};

// Future API functions (to be implemented)
/**
 * Fetch all client messages
 * @returns Promise<ClientMessage[]>
 */
export async function fetchClientMessages(): Promise<ClientMessage[]> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/messages');
  // return response.json();
  return Promise.resolve(mockClientMessages);
}

/**
 * Fetch a specific chat session
 * @param id - Chat session ID
 * @returns Promise<ChatSession | null>
 */
export async function fetchChatSession(
  id: string,
): Promise<ChatSession | null> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/messages/${id}`);
  // return response.json();
  return Promise.resolve(mockChatSessions[id] || null);
}

/**
 * Send a message in a chat
 * @param chatId - Chat session ID
 * @param content - Message content
 * @returns Promise<boolean>
 */
export async function sendMessage(
  chatId: string,
  content: string,
): Promise<boolean> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/messages/${chatId}`, {
  //   method: 'POST',
  //   body: JSON.stringify({ content }),
  // });
  // return response.ok;
  console.log("Sending message to chat", chatId, ":", content);
  return Promise.resolve(true);
}
