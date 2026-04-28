"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { RootState } from "@/redux/store";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import chatService from "@/services/chat.service";
import ChatRoomList from "@/components/chat/ChatRoomList";
import ChatWindow from "@/components/chat/ChatWindow";
import NewChatModal from "@/components/chat/NewChatModal";

interface ChatRoom {
  _id: string;
  applicationNo?: string;
  companyName?: string;
  orgUser?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  lastMessage?: {
    content?: string;
    timestamp?: string;
    senderModel?: string;
  };
  unreadByAdmin: number;
  status: string;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const auth = useSelector((state: RootState) => state.auth);
  const adminId = auth?.admin?.id || "";

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const socketRef = useRef(getSocket());

  // Connect socket on mount
  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    // Listen for room updates (new messages, etc.)
    const handleRoomUpdated = () => {
      // Re-fetch rooms to update unread counts and order
      fetchRooms();
    };

    socket.on("chat:roomUpdated", handleRoomUpdated);

    return () => {
      socket.off("chat:roomUpdated", handleRoomUpdated);
      disconnectSocket();
    };
  }, []);

  // Fetch chat rooms
  const fetchRooms = useCallback(async () => {
    try {
      const data = await chatService.getChatRooms(1, 50, searchQuery);
      setRooms(data?.rooms || []);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(fetchRooms, 300);
    return () => clearTimeout(timer);
  }, [fetchRooms]);

  // Handle room query param (from clients page)
  useEffect(() => {
    const roomParam = searchParams.get("room");
    if (roomParam && rooms.length > 0) {
      const found = rooms.find((r) => r._id === roomParam);
      if (found) {
        setActiveRoom(found);
      }
    }
  }, [searchParams, rooms]);

  // Handle room selection
  const handleSelectRoom = useCallback((room: ChatRoom) => {
    setActiveRoom(room);
    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set("room", room._id);
    window.history.replaceState({}, "", url.toString());
  }, []);

  // Handle new chat room created
  const handleRoomCreated = useCallback(
    (room: any) => {
      setActiveRoom(room);
      fetchRooms();
    },
    [fetchRooms],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Split pane layout */}
      <div className="flex flex-1 overflow-hidden md:mx-6 md:mb-6 md:rounded-xl border-t md:border border-gray-200 bg-white md:shadow-sm">
        {/* Left pane — Conversation list */}
        <div
          className={`${activeRoom ? "hidden md:block" : "w-full"} md:w-[340px] shrink-0 border-r border-gray-100`}
        >
          <ChatRoomList
            rooms={rooms}
            activeRoomId={activeRoom?._id || null}
            onSelectRoom={handleSelectRoom}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNewChat={() => setShowNewChatModal(true)}
            isLoading={isLoading}
          />
        </div>

        {/* Right pane — Chat window */}
        <div
          className={`${!activeRoom ? "hidden md:block" : "flex-1"} min-w-0`}
        >
          <ChatWindow
            room={activeRoom}
            socket={socketRef.current}
            adminId={adminId}
            onBack={() => setActiveRoom(null)}
          />
        </div>
      </div>

      {/* New chat modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
}
