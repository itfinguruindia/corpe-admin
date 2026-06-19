"use client";

import Modal from "@/components/ui/Modal";
import type { PendingRegistrationItem } from "@/lib/api/marketing";

const STEP_LABELS: Record<number, string> = {
  0: "Phone verified",
  1: "Company type",
  2: "Personal details",
  3: "Business names",
  4: "Additional details",
  5: "Review",
  6: "Payment",
};

const COMPANY_TYPE_LABELS: Record<string, string> = {
  "pvt-individual": "Private Company with Individual Shareholders",
  "pvt-corporate": "Private Company with Indian/Foreign Corporate Shareholders",
  "public-individual": "Public Company with Individual Shareholders",
  "public-corporate": "Public Company with Corporate Shareholders",
  "one-person-company": "OPC - Only for Indian Citizen & Resident",
  nidhi: "Nidhi Company",
  llp: "Limited Liability Partnership",
  "foreign-subsidiary": "Foreign Subsidiary",
};

type DetailRow = {
  label: string;
  value: string;
};

const formatValue = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return null;
};

const buildDetailSections = (
  record: PendingRegistrationItem,
): Array<{ title: string; rows: DetailRow[] }> => {
  const snapshot = (record.formSnapshot || {}) as Record<string, unknown>;

  const contactRows: DetailRow[] = [];
  const pushRow = (rows: DetailRow[], label: string, value: unknown) => {
    const formatted = formatValue(value);
    if (formatted) rows.push({ label, value: formatted });
  };

  pushRow(contactRows, "Phone", record.phone || snapshot.verifiedPhone || snapshot.phoneNumber);
  pushRow(contactRows, "Email", record.email || snapshot.email);
  pushRow(
    contactRows,
    "Full name",
    [record.firstName || snapshot.firstName, record.lastName || snapshot.lastName]
      .filter(Boolean)
      .join(" "),
  );
  pushRow(contactRows, "Resident country", record.residentCountry || snapshot.residentCountry);

  const companyType =
    record.companyType ||
    (typeof snapshot.companyType === "string" ? snapshot.companyType : "");
  const companyRows: DetailRow[] = [];
  pushRow(
    companyRows,
    "Company type",
    COMPANY_TYPE_LABELS[companyType] || companyType,
  );
  pushRow(companyRows, "Company suffix", snapshot.companySuffix);
  pushRow(
    companyRows,
    "Registration state",
    record.registrationState || snapshot.registrationState,
  );
  pushRow(companyRows, "Plan", snapshot.planKey);

  const nameRows: DetailRow[] = [];
  const suggestedNames = snapshot.suggestedNames as
    | Array<{ name?: string; fullName?: string; isSelected?: boolean }>
    | undefined;

  if (Array.isArray(suggestedNames) && suggestedNames.length > 0) {
    suggestedNames.forEach((entry, index) => {
      const label = entry?.isSelected
        ? `Name option ${index + 1} (preferred)`
        : `Name option ${index + 1}`;
      pushRow(nameRows, label, entry?.fullName || entry?.name);
    });
  } else {
    pushRow(nameRows, "Name option 1", snapshot.name1);
    pushRow(nameRows, "Name option 2", snapshot.name2);
    pushRow(nameRows, "Name option 3", snapshot.name3);
  }

  pushRow(nameRows, "Business brief", snapshot.businessBrief);
  pushRow(nameRows, "Company names summary", record.companyName);

  const progressRows: DetailRow[] = [];
  const completedSteps = Array.isArray(snapshot.completedSteps)
    ? (snapshot.completedSteps as number[])
    : [];
  pushRow(
    progressRows,
    "Last step reached",
    STEP_LABELS[record.maxStepReached] ?? `Step ${record.maxStepReached}`,
  );
  pushRow(
    progressRows,
    "Completed steps",
    completedSteps.length > 0
      ? completedSteps
          .sort((a, b) => a - b)
          .map((step) => STEP_LABELS[step] ?? `Step ${step}`)
          .join(", ")
      : null,
  );
  pushRow(progressRows, "Razorpay popup opens", record.razorpayPopupOpenCount ?? 0);
  pushRow(
    progressRows,
    "Started on",
    record.createdAt ? new Date(record.createdAt).toLocaleString() : null,
  );
  pushRow(
    progressRows,
    "Last activity",
    record.lastActivityAt ? new Date(record.lastActivityAt).toLocaleString() : null,
  );

  return [
    { title: "Contact", rows: contactRows },
    { title: "Company details", rows: companyRows },
    { title: "Name application", rows: nameRows },
    { title: "Progress", rows: progressRows },
  ].filter((section) => section.rows.length > 0);
};

type PendingRegistrationDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  record: PendingRegistrationItem | null;
};

export function PendingRegistrationDetailModal({
  isOpen,
  onClose,
  record,
}: PendingRegistrationDetailModalProps) {
  if (!record) return null;

  const sections = buildDetailSections(record);
  const displayName =
    [record.firstName, record.lastName].filter(Boolean).join(" ") ||
    record.email ||
    record.phone;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registration details"
      maxWidth="md:max-w-2xl"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-base font-semibold text-slate-900">{displayName}</p>
          <p className="text-sm text-slate-600 mt-1">
            {STEP_LABELS[record.maxStepReached] ?? `Step ${record.maxStepReached}`}{" "}
            · Razorpay opened {record.razorpayPopupOpenCount ?? 0} time
            {(record.razorpayPopupOpenCount ?? 0) === 1 ? "" : "s"}
          </p>
        </div>

        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">
              {section.title}
            </h3>
            <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
              {section.rows.map((row) => (
                <div
                  key={`${section.title}-${row.label}`}
                  className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 px-4 py-3"
                >
                  <dt className="text-sm font-medium text-slate-500">
                    {row.label}
                  </dt>
                  <dd className="text-sm text-slate-900 whitespace-pre-wrap break-words">
                    {row.value}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
