"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { toast } from "@heroui/react";

import Modal from "@/components/ui/Modal";
import { clientsApi } from "@/lib/api/clients";
import {
  DOCUMENT_ISSUE_SUGGESTIONS,
  buildDocumentAnchorId,
  type DocumentIssueClientRoute,
  type DocumentIssueEntityType,
} from "@/constants/documentIssue";
import { notifyApiError } from "@/utils/apiErrors";

export type DocumentIssueTarget = {
  entityType: DocumentIssueEntityType;
  entityId: string;
  entityLabel: string;
  fieldKey: string;
  documentLabel: string;
  clientRoute: DocumentIssueClientRoute;
};

type ExistingDocumentIssue = {
  _id: string;
  documentAnchorId: string;
  comment: string;
  createdByName?: string;
  createdAt: string;
};

type DocumentIssueModalProps = {
  isOpen: boolean;
  onClose: () => void;
  applicationNo: string;
  target: DocumentIssueTarget | null;
  onSuccess?: () => void;
};

export function DocumentIssueModal({
  isOpen,
  onClose,
  applicationNo,
  target,
  onSuccess,
}: DocumentIssueModalProps) {
  const [comment, setComment] = useState("");
  const [existingIssue, setExistingIssue] =
    useState<ExistingDocumentIssue | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetState = () => {
    setComment("");
    setExistingIssue(null);
  };

  const loadExistingIssue = async () => {
    if (!target) return;

    setIsLoading(true);
    try {
      const issues = await clientsApi.listDocumentIssues(applicationNo, "open");
      const anchorId = buildDocumentAnchorId({
        entityType: target.entityType,
        entityId: target.entityId,
        fieldKey: target.fieldKey,
      });
      const match = (issues as ExistingDocumentIssue[]).find(
        (issue) => issue.documentAnchorId === anchorId,
      );
      setExistingIssue(match ?? null);
    } catch (error) {
      notifyApiError(error, {
        fallback: "Could not load document issue.",
        actionLabel: "load document issue",
      });
      setExistingIssue(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !target) {
      resetState();
      return;
    }

    void loadExistingIssue();
  }, [isOpen, target, applicationNo]);

  const handleClose = () => {
    if (isSubmitting || isDeleting) return;
    resetState();
    onClose();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setComment((prev) => {
      if (!prev.trim()) return suggestion;
      if (prev.includes(suggestion)) return prev;
      return `${prev.trim()}\n${suggestion}`;
    });
  };

  const handleSubmit = async () => {
    if (!target || existingIssue) return;
    const trimmed = comment.trim();
    if (!trimmed) {
      toast.danger("Please enter a comment for the client.");
      return;
    }

    try {
      setIsSubmitting(true);
      await clientsApi.createDocumentIssue(applicationNo, {
        ...target,
        comment: trimmed,
      });
      toast.success("Document issue raised. The client will be notified.");
      resetState();
      onSuccess?.();
      onClose();
    } catch (error) {
      notifyApiError(error, {
        fallback: "Could not raise document issue.",
        actionLabel: "raise document issue",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingIssue) return;

    try {
      setIsDeleting(true);
      await clientsApi.deleteDocumentIssue(applicationNo, existingIssue._id);
      toast.success("Document issue removed. You can send a new one if needed.");
      setExistingIssue(null);
      setComment("");
      onSuccess?.();
    } catch (error) {
      notifyApiError(error, {
        fallback: "Could not delete document issue.",
        actionLabel: "delete document issue",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatSentDate = (value: string) => {
    try {
      return new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return value;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={existingIssue ? "Document issue sent" : "Raise document issue"}
      maxWidth="md:max-w-xl"
    >
      {target && (
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="font-semibold text-slate-800">{target.documentLabel}</p>
            {target.entityLabel && (
              <p className="text-slate-600 mt-1">{target.entityLabel}</p>
            )}
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-500 text-center py-6">
              Loading issue status...
            </p>
          ) : existingIssue ? (
            <>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm font-semibold text-emerald-900">
                  Already sent to client
                </p>
                <p className="text-xs text-emerald-800 mt-1">
                  Sent on {formatSentDate(existingIssue.createdAt)}
                  {existingIssue.createdByName
                    ? ` by ${existingIssue.createdByName}`
                    : ""}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-medium text-slate-500 mb-2">
                  Comment shown to client
                </p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {existingIssue.comment}
                </p>
              </div>

              <div className="flex justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Deleting..." : "Delete issue"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Quick suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {DOCUMENT_ISSUE_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-primary hover:text-primary transition-colors text-left"
                    >
                      {suggestion.split(".")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="document-issue-comment"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Comment for client
                </label>
                <textarea
                  id="document-issue-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  placeholder="Describe what needs to be corrected..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send to client"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

type DocumentIssueButtonProps = {
  applicationNo: string;
  target: DocumentIssueTarget;
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
};

export function DocumentIssueButton({
  applicationNo,
  target,
  onSuccess,
  disabled = false,
  className = "",
}: DocumentIssueButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title="Raise document issue"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={
          className ||
          "inline-flex items-center gap-1.5 text-primary hover:text-secondary disabled:text-gray-300 disabled:cursor-not-allowed"
        }
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Comment</span>
      </button>

      <DocumentIssueModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        applicationNo={applicationNo}
        target={target}
        onSuccess={onSuccess}
      />
    </>
  );
}
