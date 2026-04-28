// Data for Raised Tickets features
import { Ticket } from "@/types/tickets";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/";

export interface IUpdateTicketPayload {
  ticketId: string;
  status?: string;
  assignee?: string | null;
  priority?: string;
}

export class TicketApi {
  /**
   * Fetch all tickets
   * @returns Promise<Ticket[]>
   */
  static async getAllTickets(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    status: string = "all",
    priority: string = "all",
  ): Promise<{ tickets: Ticket[]; totalItems: number; totalPages: number }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search ? { search } : {}),
        ...(status !== "all" ? { status } : {}),
        ...(priority !== "all" ? { priority } : {}),
      });

      const response = await fetch(
        `${API_URL}support/tickets?${queryParams.toString()}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const result = await response.json();
      if (result.success && result.data && Array.isArray(result.data.tickets)) {
        const tickets = result.data.tickets.map((item: any) => ({
          id: item._id,
          applicationNo: item.applicationNo || "N/A",
          category: item.category,
          subject: item.subject,
          status: item.status,
          assignee: item.assignee,
          priority: item.priority,
          createdOn: item.createdAt,
          description: item.message,
          updates: item.updates || [],
        }));
        return {
          tickets,
          totalItems: result.data.total,
          totalPages: result.data.totalPages,
        };
      }
      return { tickets: [], totalItems: 0, totalPages: 0 };
    } catch (error) {
      console.error("Error fetching tickets:", error);
      return { tickets: [], totalItems: 0, totalPages: 0 };
    }
  }

  /**
   * Update a ticket's status
   * @param ticketId - Ticket ID
   * @param status - New status
   * @param assignee - New assignee
   * @param priority - New priority
   * @returns Promise<boolean>
   */
  static async updateTicket(payload: IUpdateTicketPayload): Promise<boolean> {
    const { ticketId, ...rest } = payload;
    try {
      const response = await fetch(`${API_URL}support/ticket/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rest),
      });
      if (!response.ok) {
        throw new Error("Failed to update ticket");
      }
      return true;
    } catch (error) {
      console.error("Error updating ticket:", error);
      return false;
    }
  }
}
