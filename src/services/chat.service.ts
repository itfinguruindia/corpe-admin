import axiosInstance from "@/lib/axios";

/**
 * Chat REST API service for admin panel.
 * Used for initial data loading — real-time updates go through Socket.IO.
 */
const chatService = {
  /**
   * Fetch all chat rooms for admin inbox.
   */
  async getChatRooms(page = 1, limit = 20, search = "") {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("search", search);

    const response = await axiosInstance.get(`/chat/rooms?${params}`);
    return response.data?.data;
  },

  /**
   * Get-or-create a chat room for a given org.
   */
  async getOrCreateRoom(orgId: string) {
    const response = await axiosInstance.get(`/chat/rooms/org/${orgId}`);
    return response.data?.data;
  },

  /**
   * Fetch paginated messages for a chat room.
   */
  async getMessages(roomId: string, page = 1, limit = 50) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const response = await axiosInstance.get(
      `/chat/rooms/${roomId}/messages?${params}`,
    );
    return response.data?.data;
  },

  /**
   * Mark messages in a room as read.
   */
  async markAsRead(roomId: string) {
    const response = await axiosInstance.put(`/chat/rooms/${roomId}/read`);
    return response.data;
  },

  /**
   * Upload a media file for chat.
   */
  async uploadFile(roomId: string, file: Blob | File, messageType: string) {
    const formData = new FormData();
    // Provide a filename if it's a Blob without one
    const fileName =
      file instanceof File ? file.name : `${messageType}_${Date.now()}.webm`;
    formData.append("file", file, fileName);
    formData.append("messageType", messageType);

    const response = await axiosInstance.post(
      `/chat/rooms/${roomId}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data?.data;
  },
};

export default chatService;
