// Types for Raised Tickets features
// These interfaces are designed to be compatible with future API integration

export type TicketStatus = "open" | "close" | "resolving";
export type TicketPriority = "low" | "medium" | "high";

export interface Ticket {
  id: string;
  applicationNo: string;
  category: string;
  subject: string;
  status: TicketStatus;
  assignee: { _id: string; name: string } | null;
  priority: TicketPriority;
  createdOn: string;
  description?: string;
  updates?: TicketUpdate[];
}

export interface TicketUpdate {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: "comment" | "status_change" | "assignment";
}

// API Response types for future integration
export interface TicketsListResponse {
  data: Ticket[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface TicketDetailResponse {
  data: Ticket;
}

export interface UpdateTicketRequest {
  ticketId: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  comment?: string;
}

export interface UpdateTicketResponse {
  success: boolean;
  ticket: Ticket;
}
