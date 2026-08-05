"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let listenersAttached = false;

function getSocketConfigFromApiUrl(): { url: string; path: string } {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  const parsedUrl = new URL(apiUrl);
  const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

  return {
    url: parsedUrl.origin,
    path: socketPath.startsWith("/") ? socketPath : `/${socketPath}`,
  };
}

function attachSocketListeners(instance: Socket) {
  if (listenersAttached) return;
  listenersAttached = true;

  instance.on("connect", () => {
    console.log("[Socket.IO] Connected:", instance.id);
  });

  instance.on("connect_error", (err) => {
    // Always log — prod chat breakage is hard to spot without this
    console.warn("[Socket.IO] Connection error (retrying):", err.message);
  });

  instance.on("disconnect", (reason) => {
    console.log("[Socket.IO] Disconnected:", reason);
  });
}

/**
 * Connect to the Socket.IO server.
 * Requires a valid access token in localStorage.
 */
export function connectSocket(): Socket | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("accessToken");
  if (!token) {
    return null;
  }

  const { url, path } = getSocketConfigFromApiUrl();

  if (socket) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  // Polling first: prod nginx for api.corpe.io currently fails WebSocket
  // upgrades (HTTP 400 / Engine.IO code 3). Starting with websocket-first
  // never falls back and breaks chat entirely. Polling works on both envs;
  // socket.io will upgrade to websocket when the proxy allows it.
  socket = io(url, {
    path,
    auth: { token },
    transports: ["polling", "websocket"],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });

  attachSocketListeners(socket);

  return socket;
}

/**
 * Get the current socket instance (may be null if not connected).
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect the socket. Call on page unmount or logout.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    listenersAttached = false;
  }
}
