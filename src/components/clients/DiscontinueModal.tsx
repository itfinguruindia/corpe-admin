"use client";

import { useState, useEffect } from "react";
import { AlertOctagon, RotateCcw, History, AlertTriangle, Calendar, User } from "lucide-react";

import Modal from "@/components/ui/Modal";
import type { Client } from "@/components/clients/ClientsTable";

export interface DiscontinueHistoryItem {
  _id?: string;
  action: "discontinue" | "restore";
  reason: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  performedBy?: {
    name?: string;
    email?: string;
  } | null;
  createdAt: string;
}

interface DiscontinueModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  mode: "discontinue" | "restore" | "history";
  onConfirm?: (reason: string) => Promise<void>;
  historyData?: {
    applicationNo?: string;
    companyStatus?: string;
    discontinueReason?: string | null;
    restoreReason?: string | null;
    previousCompanyStatus?: string | null;
    history?: DiscontinueHistoryItem[];
  } | null;
  loadingHistory?: boolean;
}

export default function DiscontinueModal({
  isOpen,
  onClose,
  client,
  mode,
  onConfirm,
  historyData,
  loadingHistory = false,
}: DiscontinueModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen, client, mode]);

  if (!isOpen || !client) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason.");
      return;
    }
    if (!onConfirm) return;

    try {
      setSubmitting(true);
      setError(null);
      await onConfirm(reason.trim());
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to process request");
    } finally {
      setSubmitting(false);
    }
  };

  const isDiscontinue = mode === "discontinue";
  const isRestore = mode === "restore";

  const modalTitle = isDiscontinue
    ? `Discontinue Application: ${client.appNo}`
    : isRestore
    ? `Restore Application: ${client.appNo}`
    : `Application History: ${client.appNo}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="md:max-w-2xl">
      <div className="space-y-4 p-1">
        {mode === "history" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Current Status</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 uppercase">{client.status}</span>
              </div>
              {client.discontinueReason && (
                <div className="max-w-md">
                  <span className="text-slate-500 font-medium block">Latest Discontinue Reason</span>
                  <span className="text-slate-700 dark:text-slate-300 italic">{client.discontinueReason}</span>
                </div>
              )}
            </div>

            {loadingHistory ? (
              <div className="py-8 text-center text-sm text-slate-500">Loading history logs...</div>
            ) : !historyData?.history || historyData.history.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">No discontinue or restore history logs found.</div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {historyData.history.map((item, idx) => {
                  const isDisc = item.action === "discontinue";
                  return (
                    <div
                      key={item._id || idx}
                      className={`p-3.5 rounded-xl border ${
                        isDisc
                          ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                          : "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            isDisc
                              ? "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300"
                              : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          {isDisc ? <AlertOctagon size={13} /> : <RotateCcw size={13} />}
                          {item.action}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(item.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                        Reason: {item.reason}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                        {item.performedBy?.name ? (
                          <span className="flex items-center gap-1">
                            <User size={11} /> {item.performedBy.name} ({item.performedBy.email || "Admin"})
                          </span>
                        ) : (
                          <span>System Admin</span>
                        )}
                        {item.previousStatus && item.newStatus && (
                          <span>
                            {item.previousStatus} → {item.newStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isDiscontinue ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Discontinuing this application will mark its status as <strong>Discontinued</strong>, exclude it from active client list views, and display the discontinuation modal to the client upon login.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Restoring this application will revert its status back to its last active status (
                  <strong>{client.status || "pending"}</strong>) and re-enable active client access.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Name
              </label>
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{client.client} ({client.entity})</p>
            </div>

            <div>
              <label htmlFor="discontinue-reason" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for {isDiscontinue ? "Discontinuing" : "Restoring"} <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="discontinue-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  isDiscontinue
                    ? "Enter detailed reason for discontinuing application..."
                    : "Enter detailed reason for restoring application..."
                }
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition flex items-center gap-1.5 ${
                  isDiscontinue
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                } ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {submitting ? (
                  "Processing..."
                ) : isDiscontinue ? (
                  <>
                    <AlertOctagon size={14} /> Discontinue Application
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} /> Restore Application
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
