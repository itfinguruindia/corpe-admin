"use client";

import { MessageSquare, Search } from "lucide-react";
import {
  Button,
  EmptyState,
  Input,
  Label,
  Spinner,
  TextField,
} from "@heroui/react";
import RefreshButton from "@/components/ui/RefreshButton";

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

interface ChatRoomListProps {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  onSelectRoom: (room: ChatRoom) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewChat: () => void;
  onRefresh?: () => void;
  isLoading: boolean;
}

const formatTime = (timestamp?: string) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export default function ChatRoomList({
  rooms,
  activeRoomId,
  onSelectRoom,
  searchQuery,
  onSearchChange,
  onNewChat,
  onRefresh,
  isLoading,
}: ChatRoomListProps) {
  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">Conversations</h2>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <RefreshButton
                onClick={onRefresh}
                isLoading={isLoading}
                ariaLabel="Refresh conversations"
              />
            )}
            <Button
            type="button"
            onClick={onNewChat}
            className="rounded-lg bg-[#FF6A3D] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#e55a2f] active:scale-95 h-auto min-h-0"
          >
            + New Chat
          </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <TextField value={searchQuery} onChange={onSearchChange} name="searchRooms">
            <Label className="sr-only">Search conversations</Label>
            <Input
              type="text"
              placeholder="Search by app no. or company..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 transition-colors focus:border-[#FF6A3D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6A3D]/30"
            />
          </TextField>
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="text-[#FF6A3D]" />
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState className="flex flex-col items-center justify-center py-12 text-center px-4">
            <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </p>
          </EmptyState>
        ) : (
          rooms.map((room) => (
            <Button
              key={room._id}
              type="button"
              variant="ghost"
              onClick={() => onSelectRoom(room)}
              className={`w-full h-auto min-h-0 justify-start rounded-none border-b border-gray-50 px-4 py-3 text-left font-normal transition-colors hover:bg-gray-50 ${
                activeRoomId === room._id
                  ? "bg-[#FFF5F2] border-l-[3px] border-l-[#FF6A3D]"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#FF6A3D] truncate">
                      {room.applicationNo || "—"}
                    </p>
                    {room.unreadByAdmin > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF6A3D] px-1.5 text-[10px] font-bold text-white">
                        {room.unreadByAdmin > 99 ? "99+" : room.unreadByAdmin}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 truncate">
                    {room.orgUser
                      ? `${room.orgUser.firstName || ""} ${room.orgUser.lastName || ""}`
                      : "Unknown User"}
                  </p>
                  {room.lastMessage?.content && (
                    <p className="mt-1 text-xs text-gray-400 truncate">
                      {room.lastMessage.senderModel === "admin" && (
                        <span className="font-medium text-gray-500">You: </span>
                      )}
                      {room.lastMessage.content}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">
                  {formatTime(room.lastMessage?.timestamp)}
                </span>
              </div>
            </Button>
          ))
        )}
      </div>
    </div>
  );
}
