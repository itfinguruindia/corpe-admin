"use client";

import { useMemo } from "react";
import Modal from "@/components/ui/Modal";
import type { Lead } from "@/lib/api/marketing";

type LeadExtraDetailsModalProps = {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
};

function formatDetailValue(value: unknown): string {
  if (value == null) return "-";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function LeadExtraDetailsModal({
  lead,
  isOpen,
  onClose,
}: LeadExtraDetailsModalProps) {
  const entries = useMemo(() => {
    const details = lead?.extraDetails;
    if (!details || typeof details !== "object" || Array.isArray(details)) {
      return [];
    }
    return Object.entries(details).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    );
  }, [lead]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lead details"
      maxWidth="md:max-w-lg"
    >
      <div className="space-y-4">
        {lead ? (
          <p className="text-sm text-gray-600">
            {[lead.firstName, lead.lastName].filter(Boolean).join(" ")}
            {lead.email ? ` · ${lead.email}` : ""}
            {lead.formType ? ` · ${lead.formType}` : ""}
          </p>
        ) : null}

        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">
            No extra details were provided for this lead.
          </p>
        ) : (
          <dl className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-1 gap-1 bg-white px-4 py-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-3"
              >
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {key}
                </dt>
                <dd className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                  {formatDetailValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </Modal>
  );
}
