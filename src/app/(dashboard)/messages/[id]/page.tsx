"use client";

import React, { useState, use, useRef } from "react";
import {
  Paperclip,
  Image as ImageIcon,
  Smile,
  Mic,
  ArrowUp,
  X,
} from "lucide-react";
import {
  mockChatSessions,
  sendMessage,
} from "@/lib/data/mockCommunicationData";

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [messageInput, setMessageInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { id } = use(params);
  const chatData = mockChatSessions[id];

  // Handle case where chat doesn't exist
  if (!chatData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary">Chat not found</h2>
          <p className="mt-2 text-gray-600">
            {"The conversation you're looking for does't exist"}.
          </p>
        </div>
      </div>
    );
  }

  // Voice recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Here you would typically send the audio to a speech-to-text API
        // For now, we'll simulate it
        try {
          const transcribedText = await transcribeAudio(audioBlob);
          setMessageInput((prev) => prev + (prev ? " " : "") + transcribedText);
        } catch (error) {
          console.error("Transcription error:", error);
          alert("Failed to transcribe audio. Please try again.");
        }

        // Clean up
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Simulated transcription function
  // In production, replace this with actual API call to speech-to-text service
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return simulated transcription
    // In production, send audioBlob to your speech-to-text API
    return "This is a simulated transcription. Integrate with a real speech-to-text API.";
  };

  // File attachment functionality
  const handleFileAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && attachedFiles.length === 0) return;

    // In production, you would upload files here
    if (attachedFiles.length > 0) {
      console.log("Files to upload:", attachedFiles);
      // TODO: Implement file upload logic
    }

    // Use the centralized sendMessage function
    await sendMessage(id, messageInput);
    setMessageInput("");
    setAttachedFiles([]);

    // TODO: Refresh messages or use real-time updates when API is ready
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-150px-4rem)] flex-col space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#FF6A3D]">
          {chatData.applicationNo}
        </h1>
        <div className="mt-4 inline-block">
          <span className="rounded-full bg-[#FFE5DD] px-6 py-2 text-lg font-medium text-secondary">
            Communication
          </span>
        </div>
      </div>

      {/* Section Title */}
      <div>
        <h2 className="text-2xl font-semibold text-secondary">
          Client Message
        </h2>
      </div>

      {/* Chat Container */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm max-w-lg">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatData.messages.map((message) => (
            <div key={message.id}>
              {message.sender === "system" ? (
                // System Message (Join notification)
                <div className="flex justify-center">
                  <p className="text-sm text-gray-500">{message.content}</p>
                </div>
              ) : (
                // User/Team Messages
                <div
                  className={`flex ${
                    message.sender === "team" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[60%] rounded-2xl px-5 py-3 ${
                      message.sender === "team"
                        ? "bg-[#3D63A4] text-white"
                        : "bg-[#E8EEF7] text-secondary"
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-6">
          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg bg-[#E8EEF7] px-3 py-2"
                >
                  <span className="text-sm text-secondary truncate max-w-36">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-[#FF6A3D] hover:text-[#FF6A3D]/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <div className="mb-3 flex items-center gap-2 text-[#FF6A3D]">
              <div className="h-2 w-2 rounded-full bg-[#FF6A3D] animate-pulse" />
              <span className="text-sm font-medium">Recording...</span>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          {/* Message Input Container with Send Button Inside */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full rounded-xl border-2 border-[#FF6A3D] bg-white pl-6 pr-16 py-3 pb-10 text-secondary placeholder-gray-400 focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20"
            />

            {/* Attachment Icons - Bottom Left Inside Input */}
            <div className="absolute bottom-2 left-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleFileAttachment}
                className="text-[#FF6A3D] hover:text-[#FF6A3D]/80 transition-colors"
                aria-label="Attach file"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="text-[#FF6A3D] hover:text-[#FF6A3D]/80 transition-colors"
                aria-label="Add emoji"
              >
                <Smile className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="text-[#FF6A3D] hover:text-[#FF6A3D]/80 transition-colors"
                aria-label="Add GIF"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={toggleRecording}
                className={`transition-colors ${
                  isRecording
                    ? "text-[#FF6A3D] animate-pulse"
                    : "text-[#FF6A3D] hover:text-[#FF6A3D]/80"
                }`}
                aria-label={isRecording ? "Stop recording" : "Voice to text"}
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>

            {/* Send Button - Inside Input on Right */}
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() && attachedFiles.length === 0}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#3D63A4] text-white transition-all hover:bg-[#2d4d7f] disabled:bg-gray-300 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
