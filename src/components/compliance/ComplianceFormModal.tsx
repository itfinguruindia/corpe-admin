"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import CustomSelect from "@/components/ui/CustomSelect";
import { Button } from "@heroui/react";
import { AlertTriangle, CalendarDays, FileText } from "lucide-react";
import {
  COMPLIANCE_CATEGORY_OPTIONS,
  COMPLIANCE_COMPANY_TYPE_OPTIONS,
  categoryToSelectId,
  normalizeComplianceCategory,
  normalizeComplianceCompanyType,
  selectIdToCategory,
  type ComplianceCategory,
  type ComplianceCompanyType,
  type ComplianceEntry,
  type ComplianceInput,
  type CompliancePenalty,
} from "@/lib/api/compliance";

const MONTHS = [
  { id: "1", label: "January" },
  { id: "2", label: "February" },
  { id: "3", label: "March" },
  { id: "4", label: "April" },
  { id: "5", label: "May" },
  { id: "6", label: "June" },
  { id: "7", label: "July" },
  { id: "8", label: "August" },
  { id: "9", label: "September" },
  { id: "10", label: "October" },
  { id: "11", label: "November" },
  { id: "12", label: "December" },
];

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D63A4] transition-colors";

const LABEL_CLASS = "mb-2 block text-sm font-medium text-gray-800";

export interface ComplianceFormState {
  day: string;
  month: string;
  category: ComplianceCategory;
  companyType: ComplianceCompanyType;
  formName: string;
  description: string;
  period: string;
  penalty: CompliancePenalty;
}

export const emptyComplianceForm = (): ComplianceFormState => ({
  day: "",
  month: "1",
  category: "GST",
  companyType: "all",
  formName: "",
  description: "",
  period: "",
  penalty: {
    title: "",
    rate: "",
    maximum: "",
    interest: "",
    section: "",
  },
});

export function entryToForm(entry: ComplianceEntry): ComplianceFormState {
  return {
    day: String(entry.day),
    month: String(entry.month),
    category: normalizeComplianceCategory(entry.category),
    companyType: normalizeComplianceCompanyType(entry.companyType),
    formName: entry.formName,
    description: entry.description,
    period: entry.period,
    penalty: { ...entry.penalty },
  };
}

function formToInput(
  form: ComplianceFormState,
  editingEntry?: ComplianceEntry | null,
): ComplianceInput {
  return {
    day: Number(form.day),
    month: Number(form.month),
    category: form.category,
    companyType: form.companyType,
    formName: form.formName.trim(),
    description: form.description.trim(),
    period: form.period.trim(),
    locationEnabled: editingEntry?.locationEnabled ?? false,
    status: editingEntry?.status ?? "pending",
    penalty: {
      title: form.penalty.title.trim(),
      rate: form.penalty.rate.trim(),
      maximum: form.penalty.maximum.trim(),
      interest: form.penalty.interest.trim(),
      section: form.penalty.section.trim(),
    },
  };
}

interface ComplianceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ComplianceInput) => Promise<void>;
  editingEntry?: ComplianceEntry | null;
  isSubmitting?: boolean;
}

export default function ComplianceFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingEntry,
  isSubmitting = false,
}: ComplianceFormModalProps) {
  const [form, setForm] = useState<ComplianceFormState>(emptyComplianceForm());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(editingEntry ? entryToForm(editingEntry) : emptyComplianceForm());
      setErrors({});
    }
  }, [isOpen, editingEntry]);

  const updateField = <K extends keyof ComplianceFormState>(
    key: K,
    value: ComplianceFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const updatePenalty = (key: keyof CompliancePenalty, value: string) => {
    setForm((prev) => ({
      ...prev,
      penalty: { ...prev.penalty, [key]: value },
    }));
    setErrors((prev) => ({ ...prev, [`penalty.${key}`]: "" }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const day = Number(form.day);

    if (!form.day || !Number.isInteger(day) || day < 1 || day > 31) {
      next.day = "Enter a valid day (1–31)";
    }

    if (!form.formName.trim()) next.formName = "Form name is required";
    if (!form.period.trim()) next.period = "Period is required";

    const penaltyFields: (keyof CompliancePenalty)[] = [
      "title",
      "rate",
      "maximum",
      "interest",
      "section",
    ];
    for (const field of penaltyFields) {
      if (!form.penalty[field].trim()) {
        next[`penalty.${field}`] = "Required";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formToInput(form, editingEntry));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEntry ? "Edit Compliance Entry" : "Add Compliance Entry"}
      maxWidth="md:max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Date */}
        <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={18} className="text-[#3D63A4]" />
            <h4 className="text-sm font-semibold text-gray-900">Date</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="compliance-day" className={LABEL_CLASS}>
                Day <span className="text-red-500">*</span>
              </label>
              <input
                id="compliance-day"
                type="number"
                min={1}
                max={31}
                value={form.day}
                onChange={(e) => updateField("day", e.target.value)}
                placeholder="e.g. 15"
                className={`${INPUT_CLASS} ${errors.day ? "border-red-500" : ""}`}
              />
              {errors.day && (
                <p className="text-xs text-red-500 mt-1">{errors.day}</p>
              )}
            </div>
            <div>
              <CustomSelect
                ariaLabel="Month"
                label="Month"
                value={form.month}
                options={MONTHS}
                onChange={(v) => updateField("month", v)}
              />
            </div>
          </div>
        </section>

        {/* Filing Details */}
        <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-[#3D63A4]" />
            <h4 className="text-sm font-semibold text-gray-900">Filing Details</h4>
          </div>
          <div className="space-y-4">
            <CustomSelect
              ariaLabel="Category"
              label="Category"
              value={categoryToSelectId(form.category)}
              options={COMPLIANCE_CATEGORY_OPTIONS}
              onChange={(v) =>
                updateField("category", selectIdToCategory(v))
              }
            />

            <CustomSelect
              ariaLabel="Company type"
              label="Company Type"
              value={form.companyType}
              options={COMPLIANCE_COMPANY_TYPE_OPTIONS}
              onChange={(v) =>
                updateField(
                  "companyType",
                  normalizeComplianceCompanyType(v),
                )
              }
            />

            <div>
              <label htmlFor="compliance-form-name" className={LABEL_CLASS}>
                Form Name <span className="text-red-500">*</span>
              </label>
              <input
                id="compliance-form-name"
                type="text"
                value={form.formName}
                onChange={(e) => updateField("formName", e.target.value)}
                placeholder="e.g. GSTR-3B"
                className={`${INPUT_CLASS} ${errors.formName ? "border-red-500" : ""}`}
              />
              {errors.formName && (
                <p className="text-xs text-red-500 mt-1">{errors.formName}</p>
              )}
            </div>

            <div>
              <label htmlFor="compliance-description" className={LABEL_CLASS}>
                Description
              </label>
              <textarea
                id="compliance-description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                placeholder="Brief description of the filing requirement"
                className={`${INPUT_CLASS} resize-none`}
              />
            </div>

            <div>
              <label htmlFor="compliance-period" className={LABEL_CLASS}>
                Period <span className="text-red-500">*</span>
              </label>
              <input
                id="compliance-period"
                type="text"
                value={form.period}
                onChange={(e) => updateField("period", e.target.value)}
                placeholder="e.g. Monthly / Q1 FY 2025-26"
                className={`${INPUT_CLASS} ${errors.period ? "border-red-500" : ""}`}
              />
              {errors.period && (
                <p className="text-xs text-red-500 mt-1">{errors.period}</p>
              )}
            </div>
          </div>
        </section>

        {/* Penalty */}
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={18} className="text-amber-700" />
            <h4 className="text-sm font-semibold text-amber-900">
              Penalty Details
            </h4>
          </div>
          <p className="text-xs text-amber-800 mb-4">All fields are required</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(
              [
                ["title", "Penalty Title", "e.g. Late filing penalty"],
                ["rate", "Penalty Rate", "e.g. ₹200/day"],
                ["maximum", "Maximum", "e.g. capped at ₹5,000"],
                ["interest", "Interest", "e.g. 1.5% per month"],
                ["section", "Section", "e.g. Sec 234E / 271H"],
              ] as const
            ).map(([key, label, placeholder]) => (
              <div
                key={key}
                className={key === "section" ? "sm:col-span-2" : ""}
              >
                <label htmlFor={`penalty-${key}`} className={LABEL_CLASS}>
                  {label} <span className="text-red-500">*</span>
                </label>
                <input
                  id={`penalty-${key}`}
                  type="text"
                  value={form.penalty[key]}
                  onChange={(e) => updatePenalty(key, e.target.value)}
                  placeholder={placeholder}
                  className={`${INPUT_CLASS} ${errors[`penalty.${key}`] ? "border-red-500" : ""}`}
                />
                {errors[`penalty.${key}`] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors[`penalty.${key}`]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            isDisabled={isSubmitting}
            className="rounded-lg text-gray-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isDisabled={isSubmitting}
            className="rounded-lg bg-[#FF6A3D] text-white hover:bg-[#e55a2d]"
          >
            {isSubmitting
              ? "Saving..."
              : editingEntry
                ? "Update Entry"
                : "Create Entry"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
