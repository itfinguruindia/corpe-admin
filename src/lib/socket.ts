import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Derive the Socket.IO server URL from the API URL.
 * NEXT_PUBLIC_API_URL = "http://localhost:8000/api/" → "http://localhost:8000"
 */
function getSocketUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/";
  // Strip the /api/ or /api suffix to get base URL
  return apiUrl.replace(/\/api\/?$/, "");
}

/**
 * Connect to the Socket.IO server.
 * Should be called from the messages page only.
 */
export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  socket = io(getSocketUrl(), {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket.on("connect", () => {
    console.log("[Socket.IO] Connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket.IO] Connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket.IO] Disconnected:", reason);
  });

  return socket;
}

/**
 * Get the current socket instance (may be null if not connected).
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect the socket. Call on page unmount.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
