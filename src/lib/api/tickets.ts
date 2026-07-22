// Data for Raised Tickets features
import axiosInstance from "@/lib/axios";
import { Ticket } from "@/types/tickets";

export interface IUpdateTicketPayload {
  ticketId: string;
  status?: string;
  assignee?: string | null;
  priority?: string;
  comment?: string;
}

function mapAssignee(
  assignee: unknown,
): { _id: string; name: string } | null {
  if (!assignee || typeof assignee !== "object") return null;
  const a = assignee as { _id?: string; name?: string };
  if (!a._id) return null;
  return { _id: String(a._id), name: a.name ?? "—" };
}

function mapTicketItem(item: Record<string, unknown>): Ticket {
  return {
    id: String(item._id),
    applicationNo: (item.applicationNo as string) || "N/A",
    category: (item.category as string) || "General",
    subject: item.subject as string,
    status: item.status as Ticket["status"],
    assignee: mapAssignee(item.assignee),
    priority: item.priority as Ticket["priority"],
    createdOn: (item.createdAt as string) ?? "",
    description: item.message as string | undefined,
    updates: (item.updates as Ticket["updates"]) || [],
  };
}

export class TicketApi {
  /**
   * Fetch all tickets (admin-authenticated).
   */
  static async getAllTickets(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    status: string = "all",
    priority: string = "all",
  ): Promise<{ tickets: Ticket[]; totalItems: number; totalPages: number }> {
    try {
      const response = await axiosInstance.get("/admin/support/tickets", {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status !== "all" ? { status } : {}),
          ...(priority !== "all" ? { priority } : {}),
        },
      });

      const result = response.data;
      if (result.success && result.data && Array.isArray(result.data.tickets)) {
        return {
          tickets: result.data.tickets.map((item: Record<string, unknown>) =>
            mapTicketItem(item),
          ),
          totalItems: result.data.total ?? 0,
          totalPages: result.data.totalPages ?? 0,
        };
      }
      return { tickets: [], totalItems: 0, totalPages: 0 };
    } catch (error) {
      console.error("Error fetching tickets:", error);
      return { tickets: [], totalItems: 0, totalPages: 0 };
    }
  }

  /**
   * Update a ticket's status, assignee, or priority.
   */
  static async updateTicket(payload: IUpdateTicketPayload): Promise<boolean> {
    const { ticketId, ...rest } = payload;
    try {
      const response = await axiosInstance.put(
        `/admin/support/ticket/${ticketId}`,
        rest,
      );
      return response.data?.success === true;
    } catch (error) {
      console.error("Error updating ticket:", error);
      return false;
    }
  }

  static async getTicketById(ticketId: string): Promise<Ticket | null> {
    try {
      const response = await axiosInstance.get(
        `/admin/support/ticket/${ticketId}`,
      );
      const data = response.data?.data ?? response.data;
      if (response.data?.success && data) {
        return mapTicketItem(data as Record<string, unknown>);
      }
      return null;
    } catch (error) {
      console.error("Error fetching ticket:", error);
      return null;
    }
  }

  /**
   * Unread open tickets for the signed-in admin (not yet in seenAdmins).
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const response = await axiosInstance.get(
        "/admin/support/tickets/unread-count",
      );
      return Number(response.data?.data?.count || 0);
    } catch (error) {
      console.error("Error fetching unread ticket count:", error);
      return 0;
    }
  }

  /**
   * Mark all currently open tickets as seen by the signed-in admin.
   */
  static async markTicketsSeen(): Promise<boolean> {
    try {
      const response = await axiosInstance.post(
        "/admin/support/tickets/mark-seen",
      );
      return response.data?.success === true;
    } catch (error) {
      console.error("Error marking tickets as seen:", error);
      return false;
    }
  }
}
