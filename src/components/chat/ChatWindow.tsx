"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  lazy,
  Suspense,
} from "react";
import {
  Send,
  Loader2,
  ChevronUp,
  MessageSquare,
  Smile,
  Mic,
  Play,
  CircleStop,
  Pause,
  Trash2,
  Volume2,
  Image as ImageIcon,
  Paperclip,
  FileText,
  X,
  ChevronLeft,
} from "lucide-react";
import { Socket } from "socket.io-client";
import MessageBubble from "./MessageBubble";
import chatService from "@/services/chat.service";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

interface Message {
  _id: string;
  chatRoom: string;
  sender: string | null;
  senderModel: "admin" | "orgUsers" | null;
  senderName: string | null;
  content: string;
  messageType: "text" | "system" | "audio" | "image" | "document";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
}

interface ChatRoom {
  _id: string;
  applicationNo?: string;
  companyName?: string;
  orgUser?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface ChatWindowProps {
  room: ChatRoom | null;
  socket: Socket | null;
  adminId: string;
  onBack?: () => void;
}

interface InputAreaProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  inputValue: string;
  onInputChange: (value: string) => void;
  handleSend: (
    file?: Blob | File,
    type?: "text" | "audio" | "image" | "document",
  ) => Promise<void>;
  isSending: boolean;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const InputArea = (props: InputAreaProps) => {
  const { textareaRef, inputValue, onInputChange, handleSend, isSending } =
    props;

  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [recorderStatus, setRecorderStatus] = useState<string>("inactive");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastInputCursorPosRef = useRef<number>(0);

  const handleAudioPermission = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        recorder.onstart = () => {
          setRecorderStatus("recording");
          setRecordingTime(0);
          timerRef.current = setInterval(() => {
            setRecordingTime((prev) => prev + 1);
          }, 1000);
        };

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
            const totalSize = audioChunksRef.current.reduce(
              (acc, chunk) => acc + chunk.size,
              0,
            );
            if (totalSize > 30 * 1024 * 1024) {
              recorder.stop();
              alert("Recording limit reached (30MB)");
            }
          }
        };

        recorder.onpause = () => {
          if (timerRef.current) clearInterval(timerRef.current);
          setRecorderStatus("paused");
        };
        recorder.onresume = () => {
          timerRef.current = setInterval(() => {
            setRecordingTime((prev) => prev + 1);
          }, 1000);
          setRecorderStatus("recording");
        };
        recorder.onstop = () => {
          setRecorderStatus("inactive");
          if (timerRef.current) clearInterval(timerRef.current);
          stream.getTracks().forEach((track) => track.stop());

          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          const url = URL.createObjectURL(audioBlob);
          setPreviewUrl(url);
        };

        recorder.start();
        setAudioRecorder(recorder);
      })
      .catch(console.error);
  };

  const handleDiscardAudio = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      const newTextareaValue =
        textareaRef.current.value.slice(0, lastInputCursorPosRef.current) +
        emoji +
        textareaRef.current.value.slice(lastInputCursorPosRef.current);

      onInputChange(newTextareaValue);
      textareaRef.current.focus();
    }
  };

  const handleSendAction = () => {
    if (previewUrl) {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      handleSend(audioBlob, "audio");
      handleDiscardAudio();
    } else {
      handleSend();
    }
  };

  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        {previewUrl ? (
          <div className="flex items-center gap-3 bg-[#F8FAFC] px-4 py-2 rounded-xl border border-blue-100 w-full h-[46px]">
            <audio
              ref={audioRef}
              src={previewUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <button
              type="button"
              onClick={togglePlayback}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
            >
              {isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4 ml-0.5" />
              )}
            </button>

            <div className="flex flex-1 items-center gap-1 h-6 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full bg-blue-400 transition-all duration-300 ${
                    isPlaying ? "animate-bounce" : "h-2 opacity-40"
                  }`}
                  style={{
                    height: isPlaying ? `${20 + Math.random() * 80}%` : "8px",
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: "0.5s",
                  }}
                />
              ))}
            </div>

            <span className="text-xs font-mono text-blue-600 min-w-[35px]">
              {formatTime(recordingTime)}
            </span>

            <button
              type="button"
              onClick={handleDiscardAudio}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 w-full resize-none rounded-xl pl-24 md:pl-40 border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition-all focus:border-[#FF6A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/10"
              style={{ maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
              onMouseUp={(e) =>
                (lastInputCursorPosRef.current =
                  e.currentTarget.selectionEnd ?? 0)
              }
              onKeyUp={(e) =>
                (lastInputCursorPosRef.current =
                  e.currentTarget.selectionEnd ?? 0)
              }
            />
            <div className="absolute top-1/2 -translate-y-1/2 left-2 pb-1 flex items-center gap-2 md:gap-4">
              {recorderStatus !== "inactive" ? (
                <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-mono text-gray-600">
                    {formatTime(recordingTime)}
                  </span>
                  <div className="flex items-center gap-2 border-l border-gray-200 pl-2">
                    <button
                      type="button"
                      onClick={() =>
                        recorderStatus === "recording"
                          ? audioRecorder?.pause()
                          : audioRecorder?.resume()
                      }
                      className="hover:text-[#FF6A3D] transition-colors"
                    >
                      {recorderStatus === "recording" ? (
                        <Pause className="size-4 text-secondary" />
                      ) : (
                        <Play className="size-4 text-secondary" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => audioRecorder?.stop()}
                      className="hover:text-red-500 transition-colors"
                    >
                      <CircleStop className="size-4 text-secondary" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="size-5 text-secondary" />
                  </button>

                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImageIcon className="size-5 text-secondary" />
                  </button>
                  <input
                    type="file"
                    ref={imageInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSend(file, "image");
                      e.target.value = "";
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => documentInputRef.current?.click()}
                  >
                    <Paperclip className="size-5 text-secondary" />
                  </button>
                  <input
                    type="file"
                    ref={documentInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSend(file, "document");
                      e.target.value = "";
                    }}
                  />

                  <button type="button" onClick={handleAudioPermission}>
                    <Mic className="size-5 text-secondary" />
                  </button>
                </>
              )}
            </div>
          </>
        )}
        <div className="absolute bottom-10 z-50">
          <Suspense
            fallback={
              <div className="min-w-48 min-h-32">
                <Loader2 className="animate-spin size-4 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2" />
              </div>
            }
          >
            <EmojiPicker
              open={showEmojiPicker}
              autoFocusSearch={false}
              onEmojiClick={(props) => handleEmojiClick(props.emoji)}
              lazyLoadEmojis={true}
              previewConfig={{ showPreview: false }}
            />
          </Suspense>
        </div>
      </div>
      <button
        onClick={handleSendAction}
        disabled={
          (!inputValue.trim() && !previewUrl) ||
          isSending ||
          recorderStatus !== "inactive"
        }
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3D63A4] text-white transition-all hover:bg-[#2d4d7f] active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

export default function ChatWindow({
  room,
  socket,
  adminId,
  onBack,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Load messages for current room
  useEffect(() => {
    if (!room) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setIsLoading(true);
      setPage(1);
      try {
        const data = await chatService.getMessages(room._id, 1, 50);
        setMessages(data?.messages || []);
        setHasMore(data?.hasMore || false);
        scrollToBottom();

        // Mark as read
        await chatService.markAsRead(room._id);
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    textareaRef.current?.focus();
    loadMessages();
  }, [room?._id]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket || !room) return;

    // Join the room
    socket.emit("chat:join", { roomId: room._id });

    // Listen for new messages
    const handleNewMessage = (data: { roomId: string; message: Message }) => {
      if (data.roomId === room._id) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
        scrollToBottom();

        // Mark as read since we're viewing
        socket.emit("chat:markRead", { roomId: room._id });
      }
    };

    // Typing indicators
    const handleTyping = (data: {
      roomId: string;
      userName: string;
      userType: string;
    }) => {
      if (data.roomId === room._id && data.userType !== "admin") {
        setTypingUser(data.userName);
      }
    };

    const handleStopTyping = (data: { roomId: string }) => {
      if (data.roomId === room._id) {
        setTypingUser(null);
      }
    };

    socket.on("chat:newMessage", handleNewMessage);
    socket.on("chat:userTyping", handleTyping);
    socket.on("chat:userStopTyping", handleStopTyping);

    return () => {
      socket.off("chat:newMessage", handleNewMessage);
      socket.off("chat:userTyping", handleTyping);
      socket.off("chat:userStopTyping", handleStopTyping);
      socket.emit("chat:leave", { roomId: room._id });
    };
  }, [socket, room?._id]);

  // Load older messages
  const loadMore = async () => {
    if (!room || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const container = messagesContainerRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;

      const data = await chatService.getMessages(room._id, nextPage, 50);
      setMessages((prev) => [...(data?.messages || []), ...prev]);
      setPage(nextPage);
      setHasMore(data?.hasMore || false);

      // Maintain scroll position
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
      });
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Send message
  const handleSend = async (
    file?: Blob | File,
    type: "text" | "audio" | "image" | "document" = "text",
  ) => {
    if ((!inputValue.trim() && !file) || !room || !socket) return;

    const content = inputValue.trim();
    if (type === "text") setInputValue("");
    setIsSending(true);

    // Stop typing indicator
    if (isTypingRef.current) {
      socket.emit("chat:stopTyping", { roomId: room._id });
      isTypingRef.current = false;
    }

    try {
      if (file && type !== "text") {
        // Upload to S3
        const uploadResult = await chatService.uploadFile(room._id, file, type);

        // Send via Socket
        socket.emit("chat:sendMessage", {
          roomId: room._id,
          content:
            type === "audio"
              ? "Audio Message"
              : (file as File).name || `${type} file`,
          messageType: type,
          fileUrl: uploadResult.fileUrl,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
        });
      } else {
        socket.emit("chat:sendMessage", {
          roomId: room._id,
          content,
          messageType: "text",
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Typing indicator logic
  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (!socket || !room) return;

    if (!isTypingRef.current && value.length > 0) {
      isTypingRef.current = true;
      socket.emit("chat:typing", { roomId: room._id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socket.emit("chat:stopTyping", { roomId: room._id });
      }
    }, 2000);
  };

  // Empty state — no room selected
  if (!room) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#FAFBFD] text-center px-8">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">
            Select a conversation
          </h3>
          <p className="mt-2 text-sm text-gray-400 max-w-[280px]">
            Choose a conversation from the list or start a new one to begin
            messaging.
          </p>
        </div>
      </div>
    );
  }

  const userName = room.orgUser
    ? `${room.orgUser.firstName || ""} ${room.orgUser.lastName || ""}`.trim()
    : "User";

  return (
    <div className="flex h-full flex-col bg-[#FAFBFD]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1 -ml-1 text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="overflow-hidden">
                <h3 className="text-sm md:text-base font-bold text-[#FF6A3D] truncate">
                  {room.applicationNo || "New Chat"}
                </h3>
                <p className="text-[10px] md:text-xs text-gray-500 truncate">
                  {userName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-[10px] font-medium text-green-600">
                  <span className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-green-500" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4"
      >
        {/* Load more button */}
        {hasMore && (
          <div className="flex justify-center mb-4">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-gray-500 shadow-sm border border-gray-200 transition-all hover:bg-gray-50 disabled:opacity-50"
            >
              {isLoadingMore ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ChevronUp className="h-3 w-3" />
              )}
              Load earlier messages
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#FF6A3D]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              content={msg.content}
              senderName={msg.senderName}
              senderModel={msg.senderModel}
              messageType={msg.messageType}
              timestamp={msg.createdAt}
              fileUrl={msg.fileUrl}
              fileName={msg.fileName}
              isOwnMessage={
                msg.senderModel === "admin" && msg.sender === adminId
              }
            />
          ))
        )}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex items-center gap-2 py-2">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
            </div>
            <span className="text-xs text-gray-400">
              {typingUser} is typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 md:px-6 py-4">
        <InputArea
          handleSend={handleSend}
          inputValue={inputValue}
          isSending={isSending}
          onInputChange={handleInputChange}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  );
}
