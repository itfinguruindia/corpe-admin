"use client";
import { FileText, Download } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  senderName: string | null;
  senderModel: "admin" | "orgUsers" | null;
  messageType: "text" | "system" | "audio" | "image" | "document";
  timestamp: string;
  isOwnMessage: boolean;
  fileUrl?: string;
  fileName?: string;
}

export default function MessageBubble({
  content,
  senderName,
  senderModel,
  messageType,
  timestamp,
  isOwnMessage,
  fileUrl,
  fileName,
}: MessageBubbleProps) {
  // System messages render centered
  if (messageType === "system") {
    return (
      <div className="flex justify-center py-2">
        <span className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-500">
          {content}
        </span>
      </div>
    );
  }

  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[85%] md:max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}
      >
        {/* Sender name */}
        {senderName && (
          <p
            className={`mb-1 text-xs font-semibold ${
              isOwnMessage
                ? "text-right text-[#3D63A4]"
                : "text-left text-[#FF6A3D]"
            }`}
          >
            {senderName}
          </p>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwnMessage
              ? "bg-[#3D63A4] text-white rounded-br-md"
              : "bg-[#F0F4FA] text-gray-800 rounded-bl-md"
          }`}
        >
          {messageType === "audio" && fileUrl ? (
            <div className="flex flex-col gap-2 min-w-[200px] py-1">
              <audio
                src={fileUrl}
                controls
                className="h-8 w-full max-w-[240px] filter invert brightness-100"
              />
              <span className="text-[10px] opacity-70">Voice message</span>
            </div>
          ) : messageType === "image" && fileUrl && fileName ? (
            <div className="flex flex-col gap-1">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full rounded-lg max-h-[300px] object-contain cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => window.open(fileUrl, "_blank")}
              />
            </div>
          ) : messageType === "document" && fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                isOwnMessage
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-white hover:bg-gray-50 border border-gray-100"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${isOwnMessage ? "bg-white/20" : "bg-blue-50"}`}
              >
                <FileText
                  className={`size-5 ${isOwnMessage ? "text-white" : "text-blue-600"}`}
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {content || "Document"}
                </span>
                <span
                  className={`text-[10px] ${isOwnMessage ? "text-white/60" : "text-gray-500"}`}
                >
                  Click to view
                </span>
              </div>
              <Download
                className={`size-4 ml-auto ${isOwnMessage ? "text-white/60" : "text-gray-400"}`}
              />
            </a>
          ) : (
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-break">
              {content}
            </p>
          )}
        </div>

        {/* Timestamp */}
        <p
          className={`mt-1 text-[10px] text-gray-400 ${
            isOwnMessage ? "text-right" : "text-left"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
