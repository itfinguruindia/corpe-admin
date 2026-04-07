// Mock data for Raised Tickets features
// TODO: Replace with actual API calls when backend is ready

import { Ticket } from "@/types/tickets";

// Mock tickets list
export const mockTickets: Ticket[] = [
  {
    id: "1",
    applicationNo: "GUJC000001",
    category: "Compliance",
    subject: "Update in registration docs",
    status: "open",
    assignee: "Shaili",
    priority: "medium",
    createdOn: "2025-05-11T00:00:00Z",
    description:
      "Need to update the registration documents for compliance requirements.",
    updates: [
      {
        id: "u1",
        author: "Shaili",
        content: "Started reviewing the documents.",
        timestamp: "2025-05-11T10:00:00Z",
        type: "comment",
      },
    ],
  },
  {
    id: "2",
    applicationNo: "GUJC000001",
    category: "Marketing",
    subject: "Update in registration docs",
    status: "open",
    assignee: "Chhaya",
    priority: "high",
    createdOn: "2025-08-15T00:00:00Z",
    description:
      "Marketing materials need to be updated with new registration information.",
    updates: [
      {
        id: "u1",
        author: "Chhaya",
        content: "Working on updating the marketing collateral.",
        timestamp: "2025-08-15T14:30:00Z",
        type: "comment",
      },
    ],
  },
];

// Future API functions (to be implemented)
/**
 * Fetch all tickets
 * @returns Promise<Ticket[]>
 */
export async function fetchTickets(): Promise<Ticket[]> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/tickets');
  // return response.json();
  return Promise.resolve(mockTickets);
}

/**
 * Fetch a specific ticket
 * @param id - Ticket ID
 * @returns Promise<Ticket | null>
 */
export async function fetchTicket(id: string): Promise<Ticket | null> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/tickets/${id}`);
  // return response.json();
  const ticket = mockTickets.find((t) => t.id === id);
  return Promise.resolve(ticket || null);
}

/**
 * Update a ticket's status
 * @param ticketId - Ticket ID
 * @param status - New status
 * @returns Promise<boolean>
 */
export async function updateTicketStatus(
  ticketId: string,
  status: string,
): Promise<boolean> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/tickets/${ticketId}`, {
  //   method: 'PATCH',
  //   body: JSON.stringify({ status }),
  // });
  // return response.ok;
  console.log("Updating ticket", ticketId, "status to:", status);
  return Promise.resolve(true);
}

/**
 * Update a ticket's priority
 * @param ticketId - Ticket ID
 * @param priority - New priority
 * @returns Promise<boolean>
 */
export async function updateTicketPriority(
  ticketId: string,
  priority: string,
): Promise<boolean> {
  // TODO: Replace with actual API call
  console.log("Updating ticket", ticketId, "priority to:", priority);
  return Promise.resolve(true);
}

/**
 * Add a comment to a ticket
 * @param ticketId - Ticket ID
 * @param comment - Comment content
 * @returns Promise<boolean>
 */
export async function addTicketComment(
  ticketId: string,
  comment: string,
): Promise<boolean> {
  // TODO: Replace with actual API call
  console.log("Adding comment to ticket", ticketId, ":", comment);
  return Promise.resolve(true);
}
