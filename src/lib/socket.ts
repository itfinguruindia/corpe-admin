"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getSocketUrlFromApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  // Convert e.g. https://api.corpe.io/api -> https://api.corpe.io
  return apiUrl.replace(/\/api\/?$/, "");
}

/**
 * Connect to the Socket.IO server.
 * Should be called from the messages page only.
 */
export function connectSocket(): Socket {
  if (typeof window === "undefined") {
    throw new Error("Socket connection can only be initialized in the browser");
  }

  if (socket?.connected) return socket;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  socket = io(getSocketUrlFromApiUrl(), {
    auth: { token },
    transports: ["websocket"],
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
