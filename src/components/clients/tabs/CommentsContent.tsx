"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, Download, Paperclip, Trash2, X } from "lucide-react";
import { Spinner, toast } from "@heroui/react";

import Modal from "@/components/ui/Modal";
import { clientsApi } from "@/lib/api/clients";
import {
  GLOBAL_COMMENT_AREAS,
  type GlobalCommentArea,
  type GlobalCommentItem,
} from "@/constants/globalCommentAreas";
import { getFileType } from "@/utils/helpers";
import { usePermissions } from "@/hooks/usePermissions";
import { requireClientTabEdit } from "@/utils/clientPermissions";

interface CommentsContentProps {
  appNo: string;
}

const areaBadgeColors: Record<string, string> = {
  "Name Application": "bg-blue-100 text-blue-800",
  "Corporate Structure": "bg-amber-100 text-amber-900",
  "Director & Shareholders": "bg-violet-100 text-violet-900",
  "Document Upload": "bg-emerald-100 text-emerald-900",
  "Registration Documents": "bg-rose-100 text-rose-900",
};

const formatCommentDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function CommentsContent({ appNo }: CommentsContentProps) {
  const { admin } = usePermissions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [comments, setComments] = useState<GlobalCommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>("all");
  const [newArea, setNewArea] = useState<GlobalCommentArea>("Name Application");
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");

  const loadComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await clientsApi.getGlobalComments(
        appNo,
        selectedAreaFilter,
      );
      setComments(Array.isArray(data?.comments) ? data.comments : []);
    } catch (error) {
      console.error("Failed to load comments:", error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [appNo, selectedAreaFilter]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  useEffect(() => {
    return () => {
      if (previewUrl) window.URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePostComment = async () => {
    if (!requireClientTabEdit(admin, "application")) return;
    if (!newMessage.trim()) {
      toast("Please enter a comment message", { variant: "warning" });
      return;
    }

    try {
      setIsPosting(true);
      await clientsApi.createGlobalComment(appNo, {
        content: newMessage.trim(),
        area: newArea,
        files: selectedFiles.length > 0 ? selectedFiles : undefined,
      });
      setNewMessage("");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast("Comment posted", { variant: "success" });
      await loadComments();
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast("Failed to post comment", { variant: "danger" });
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!requireClientTabEdit(admin, "application")) return;
    try {
      await clientsApi.deleteGlobalComment(appNo, commentId);
      toast("Comment deleted", { variant: "success" });
      await loadComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast("Failed to delete comment", { variant: "danger" });
    }
  };

  const handlePreview = async (
    commentId: string,
    filePath: string,
    fileName: string,
  ) => {
    try {
      const blob = await clientsApi.getGlobalCommentFileBlob(
        appNo,
        commentId,
        filePath,
      );
      if (previewUrl) window.URL.revokeObjectURL(previewUrl);
      setPreviewFileName(fileName);
      setPreviewUrl(window.URL.createObjectURL(blob));
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Preview failed:", error);
      toast("Failed to preview file", { variant: "danger" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-secondary">
          Post a Comment to Client
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Comments are one-way (admin to client) and appear on the related form
          page sidebar.
        </p>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Regarding
          </label>
          <select
            value={newArea}
            onChange={(e) => setNewArea(e.target.value as GlobalCommentArea)}
            className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {GLOBAL_COMMENT_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Message
          </label>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={4}
            placeholder="Write your comment for the client..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Attachments
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const picked = Array.from(e.target.files || []);
                if (picked.length === 0) return;
                setSelectedFiles((prev) => [...prev, ...picked]);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Paperclip size={16} />
              Attach files
            </button>
            {selectedFiles.length > 0 && (
              <span className="text-xs text-slate-500">
                {selectedFiles.length} file
                {selectedFiles.length > 1 ? "s" : ""} selected
              </span>
            )}
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Paperclip size={14} className="shrink-0 text-slate-400" />
                    <span className="truncate text-sm text-slate-700">
                      {file.name}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedFiles((prev) =>
                        prev.filter((_, fileIndex) => fileIndex !== index),
                      )
                    }
                    className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handlePostComment}
          disabled={isPosting}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {isPosting ? "Posting..." : "Post Comment"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-secondary">
            All Comments
          </h2>
          <select
            value={selectedAreaFilter}
            onChange={(e) => setSelectedAreaFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="all">All Areas</option>
            {GLOBAL_COMMENT_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {comments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            No comments posted yet
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="rounded-lg border border-slate-200 bg-slate-50/50 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        areaBadgeColors[comment.area] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {comment.area}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatCommentDate(comment.createdAt)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(comment._id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>

                <p className="mb-1 text-sm font-semibold text-secondary">
                  {comment.createdByName}
                </p>
                <p className="whitespace-pre-wrap text-sm text-slate-700">
                  {comment.content}
                </p>

                {(comment.files?.length ?? 0) > 0 && (
                  <div className="mt-3 space-y-2">
                    {comment.files.map((file) => (
                      <div
                        key={`${comment._id}-${file.path}`}
                        className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2"
                      >
                        <span className="truncate text-sm text-slate-700">
                          {file.name}
                        </span>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            title="Preview"
                            onClick={() =>
                              handlePreview(comment._id, file.path, file.name)
                            }
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            title="Download"
                            onClick={() =>
                              clientsApi.downloadGlobalCommentFile(
                                appNo,
                                comment._id,
                                file.path,
                                file.name,
                              )
                            }
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
        }}
        title={`Preview: ${previewFileName}`}
        maxWidth="md:max-w-[85vw]"
      >
        {!previewUrl ? (
          <p>No preview available</p>
        ) : (
          <>
            {getFileType(previewFileName) === "image" && (
              <img
                src={previewUrl}
                alt={previewFileName}
                className="max-h-[70vh] w-full rounded object-contain"
              />
            )}
            {getFileType(previewFileName) === "pdf" && (
              <iframe
                src={previewUrl}
                className="h-[70vh] w-full rounded border"
                title={previewFileName}
              />
            )}
            {getFileType(previewFileName) === "other" && (
              <div className="py-8 text-center">
                <p className="mb-4 text-slate-600">
                  No inline preview for this file type.
                </p>
                <button
                  type="button"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
                  onClick={() =>
                    previewUrl && window.open(previewUrl, "_blank")
                  }
                >
                  Open in new tab
                </button>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
