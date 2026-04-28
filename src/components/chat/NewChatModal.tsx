"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Loader2, MessageSquare } from "lucide-react";
import Modal from "@/components/ui/Modal";
import axiosInstance from "@/lib/axios";
import chatService from "@/services/chat.service";

interface Client {
  orgId: string;
  appNo: string;
  client: string; // Full name string
  entity: string; // companyType
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (room: any) => void;
}

export default function NewChatModal({
  isOpen,
  onClose,
  onRoomCreated,
}: NewChatModalProps) {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState<string | null>(null);

  // Fetch clients when modal opens
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setClients([]);
      return;
    }
    fetchClients();
  }, [isOpen]);

  const fetchClients = useCallback(async (searchTerm?: string) => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: "1",
        limit: "20",
      };
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await axiosInstance.get("/admin/clients", { params });
      const data = response.data?.data;
      setClients(data?.clients || []);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) fetchClients(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, isOpen]);

  const handleStartChat = async (client: Client) => {
    if (isCreating) return;
    setIsCreating(client.orgId);

    try {
      const room = await chatService.getOrCreateRoom(client.orgId);
      onRoomCreated(room);
      onClose();
    } catch (error) {
      console.error("Failed to create chat room:", error);
    } finally {
      setIsCreating(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start New Conversation"
      maxWidth="md:max-w-lg"
    >
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by application number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-[#FF6A3D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6A3D]/30"
            autoFocus
          />
        </div>

        {/* Client list */}
        <div className="max-h-[350px] overflow-y-auto rounded-lg border border-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#FF6A3D]" />
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">
                {search ? "No clients found" : "No clients available"}
              </p>
            </div>
          ) : (
            clients.map((client) => (
              <button
                key={client.orgId}
                onClick={() => handleStartChat(client)}
                disabled={isCreating === client.orgId}
                className="w-full flex items-center justify-between px-4 py-3 text-left border-b border-gray-50 transition-colors hover:bg-[#FFF5F2] disabled:opacity-60"
              >
                <div>
                  <p className="text-sm font-bold text-[#FF6A3D]">
                    {client.appNo || "—"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {client.client || "Unknown"} · {client.entity || ""}
                  </p>
                </div>
                {isCreating === client.orgId ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#FF6A3D]" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
