"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@heroui/react";
import { Loader2, Download, Eye, Upload, FileText, RefreshCw, Pencil, Check, X } from "lucide-react";

import axiosInstance from "@/lib/axios";
import { clientsApi } from "@/lib/api/clients";
import { notifyApiError } from "@/utils/apiErrors";
import { FileUploadComponent } from "@/components/upload";
import TaxationAdminTrackerView from "./TaxationAdminTrackerView";

interface TaxationServiceContentProps {
  appNo: string;
}

const ENTITY_TYPE_NAMES: Record<string, string> = {
  individual: "Individual / Proprietor",
  llp: "LLP",
  company: "Company",
  opc: "OPC",
};

const SERVICE_NAMES: Record<string, string> = {
  gst: "GST Filing",
  itr: "Income Tax (ITR)",
  tds: "TDS Returns",
  advance: "Advance Tax",
};

const DOC_LABELS: Record<string, string> = {
  gstAccess: "GST portal login / authorisation",
  gstRegister: "Sales & purchase register / software access",
  gstBank: "Bank statements (latest month)",
  gstHsn: "HSN-wise summary",
  gstPrevReturn: "Last filed GSTR-1 / GSTR-3B",
  gstAnnualRecon: "Audited financials / GSTR-9 reconciliation",
  itrFin: "Financial statements (P&L + Balance Sheet)",
  itr26as: "Form 26AS / AIS access",
  itrTds: "TDS certificates (Form 16A)",
  itrBank: "Bank statements for the year",
  itrPrevYear: "Previous year's ITR / computation",
  itrAudit: "Tax audit report (3CA/3CB + 3CD)",
  itrGstRecon: "GST returns for the year",
  itrForeign: "Foreign income / DTAA documents",
  tdsTan: "TAN allotment letter",
  tdsDeductee: "Deductee details",
  tdsChallan: "Challan copies of TDS paid",
  tdsPrevAck: "Previous quarter TDS acknowledgment",
  tdsSalary: "Salary structure & perquisites",
  tds15ca: "Form 15CA/15CB",
  advProjection: "Income & expense projection",
  advPrevItr: "Previous year's ITR",
  advTdsCredit: "Form 26AS extract",
  advCapGains: "Capital gains / one-off income",
  advPrevChallan: "Previous instalment challan",
};

const TDS_SECTION_NAMES: Record<string, string> = {
  "24q": "24Q — Salary",
  "26q": "26Q — Vendors",
  "27q": "27Q — Non-resident",
  "27eq": "27EQ — TCS",
};

const DELIVERABLES: Record<string, { id: string; text: string }[]> = {
  gst: [
    { id: "dlv-gst-1", text: "Filed GSTR-1 & GSTR-3B copies with ARN, sent to your email after every cycle" },
    { id: "dlv-gst-2", text: "Monthly ITC reconciliation summary (GSTR-2B vs your purchase register)" },
    { id: "dlv-gst-3", text: "Filed GSTR-9 annual return copy, if you've opted in" },
  ],
  itr: [
    { id: "dlv-itr-1", text: "E-filed ITR copy with ITR-V / acknowledgment number" },
    { id: "dlv-itr-2", text: "Computation of income sheet showing how the tax payable was arrived at" },
    { id: "dlv-itr-3", text: "Tax audit report copy (Form 3CA/3CB + 3CD), if applicable to you" },
  ],
  tds: [
    { id: "dlv-tds-1", text: "Filed TDS return acknowledgment (Form 27A / token number) each quarter" },
    { id: "dlv-tds-2", text: "Form 16 (salary) / Form 16A (non-salary) certificates for your deductees" },
    { id: "dlv-tds-3", text: "Challan-to-deduction reconciliation statement" },
  ],
  advance: [
    { id: "dlv-advance-1", text: "Quarterly tax liability computation working" },
    { id: "dlv-advance-2", text: "Paid challan copy (Form 280) for your records" },
    { id: "dlv-advance-3", text: "Running advance-tax-paid summary for the year, for use at ITR time" },
  ],
};

const formatINR = (n: number) => n.toLocaleString("en-IN");

const QUOTE_UNITS = [
  { value: "/mo", label: "Monthly" },
  { value: "/qtr", label: "Quarterly" },
  { value: "/half-yr", label: "Half-Yearly" },
  { value: "/yr", label: "Yearly" },
  { value: "one-time", label: "One-time" },
];

export default function TaxationServiceContent({
  appNo,
}: TaxationServiceContentProps) {
  const [loading, setLoading] = useState(true);
  const [taxData, setTaxData] = useState<any>(null);
  const [miscTitleInput, setMiscTitleInput] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "tracker">("details");
  const [uploadingDlvId, setUploadingDlvId] = useState<string | null>(null);

  const [quoteEditKey, setQuoteEditKey] = useState<string | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<string>("");
  const [quoteUnit, setQuoteUnit] = useState<string>("");
  const [savingQuote, setSavingQuote] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/admin/clients/${appNo}/taxation`);
      setTaxData(res.data?.data || res.data);
    } catch (error) {
      console.error("Failed to fetch Taxation data:", error);
      setTaxData(null);
    } finally {
      setLoading(false);
    }
  }, [appNo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUploadAdminDoc = async (file: File) => {
    try {
      await clientsApi.uploadTaxationAdminDoc(
        appNo,
        `misc-${Date.now()}`,
        file,
        miscTitleInput
      );
      setMiscTitleInput("");
      fetchData();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to upload admin document." });
    }
  };

  const handleUploadDeliverable = async (dlvId: string, file: File) => {
    try {
      setUploadingDlvId(dlvId);
      await clientsApi.uploadTaxationAdminDoc(appNo, dlvId, file);
      toast.success("Deliverable uploaded successfully");
      fetchData();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to upload deliverable." });
    } finally {
      setUploadingDlvId(null);
    }
  };

  const downloadDoc = async (
    docId: string,
    mode: "preview" | "download" = "download",
    filename?: string
  ) => {
    try {
      const url = `/admin/clients/${appNo}/taxation/doc/download?docId=${encodeURIComponent(docId)}`;
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const blob = response.data;
      const objectUrl = URL.createObjectURL(blob);
      if (mode === "preview") {
        window.open(objectUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename || docId;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch {
      toast.danger("Failed to download document");
    }
  };

  const downloadMiscDoc = async (
    index: number,
    mode: "preview" | "download" = "download",
    filename?: string
  ) => {
    try {
      const url = `/admin/clients/${appNo}/taxation/misc-doc/download?index=${index}`;
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const blob = response.data;
      const objectUrl = URL.createObjectURL(blob);
      if (mode === "preview") {
        window.open(objectUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename || `misc-document-${index}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch {
      toast.danger("Failed to download document");
    }
  };

  const saveQuote = async (item: any) => {
    const amount = parseFloat(quoteAmount);
    if (!amount || amount <= 0) {
      toast.danger("Enter a valid quote amount");
      return;
    }
    if (!quoteUnit) {
      toast.danger("Select a billing frequency (monthly, quarterly, etc.)");
      return;
    }
    if (!item?.svc || !item?.fieldId || !item?.optionId) {
      toast.danger("This line item cannot be quoted");
      return;
    }
    try {
      setSavingQuote(true);
      await axiosInstance.post(`/admin/clients/${appNo}/taxation/quote`, {
        svcId: item.svc,
        fieldId: item.fieldId,
        optionId: item.optionId,
        label: item.label,
        amount,
        unit: quoteUnit,
      });
      toast.success("Quote amount saved — client can now pay");
      setQuoteEditKey(null);
      setQuoteAmount("");
      setQuoteUnit("");
      fetchData();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to save quote." });
    } finally {
      setSavingQuote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
        <span className="text-sm font-semibold">Loading taxation data...</span>
      </div>
    );
  }

  if (!taxData) {
    return (
      <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-sm space-y-2">
        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
        <p>No Taxation data found for application #{appNo}.</p>
      </div>
    );
  }

  const documents = (taxData.documents || {}) as Record<string, any>;
  const uploadedDocs = Object.keys(documents).filter(
    (key) => key !== "miscDocs" && documents[key]?.path
  );

  const selectedSvcs: string[] = Array.isArray(taxData.selectedSvcs)
    ? taxData.selectedSvcs
    : [];

  const svcFields = (taxData.svcFields || {}) as Record<string, Record<string, string>>;

  const pricing = taxData.pricingDetails || {};

  const taxQuotes = Array.isArray(taxData.quotes) ? taxData.quotes : [];
  const hasQuoteFor = (it: any) =>
    Boolean(it.quoted) ||
    taxQuotes.some(
      (q: any) =>
        q?.svcId === it?.svc && q?.fieldId === it?.fieldId && q?.optionId === it?.optionId
    );

  return (
    <div className="flex flex-col gap-6 font-sans text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">Taxation</h2>
          {!taxData.isPaid && (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
              Payment Pending
            </span>
          )}
          {taxData.isPaid && (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
              Active
            </span>
          )}
        </div>

        <div className="flex gap-1">
          {(["details", "tracker"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 capitalize ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "details" ? "Form Details" : "Tracking Progress"}
            </button>
          ))}
        </div>
      </div>

      {taxData.isFormSubmitted && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs text-emerald-800 flex items-center gap-2">
          <span className="font-bold">Form Submitted</span>
        </div>
      )}

      {activeTab === "details" && (
      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Service Configuration */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Service Configuration
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <InfoRow
                label="Business Structure"
                value={ENTITY_TYPE_NAMES[taxData.entityType || ""] || taxData.entityType || "-"}
              />
              <InfoRow
                label="Basic Name"
                value={taxData.basicName || "-"}
              />
              <InfoRow label="PAN" value={taxData.basicPan || "-"} />
              <InfoRow label="GSTIN" value={taxData.basicGstin || "-"} />
              <InfoRow label="Contact Email" value={taxData.basicEmail || "-"} />
              <InfoRow label="Contact Mobile" value={taxData.basicMobile || "-"} />
              {taxData.basicAddress && (
                <InfoRow label="Address" value={taxData.basicAddress} className="col-span-2" />
              )}
            </div>
          </div>

          {/* Selected Filings */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Selected Filings
            </h3>
            {selectedSvcs.length > 0 ? (
              <div className="space-y-4">
                {selectedSvcs.map((svcId) => {
                  const fields = svcFields[svcId] || {};
                  return (
                    <div key={svcId} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        {SERVICE_NAMES[svcId] || svcId}
                      </p>
                      {svcId === "tds" && (
                        <div className="text-xs text-slate-600 mb-2">
                          <span className="font-semibold">Sections: </span>
                          {Array.isArray(taxData.tdsSections) && taxData.tdsSections.length > 0
                            ? taxData.tdsSections
                                .map((s: string) => TDS_SECTION_NAMES[s] || s.toUpperCase())
                                .join(", ")
                            : "-"}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                        {Object.entries(fields).map(([fieldId, val]) => (
                          <InfoRow key={fieldId} label={fieldId} value={String(val ?? "-")} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No filings selected yet.</p>
            )}
          </div>

          {/* Pricing Summary */}
          {pricing?.items && Array.isArray(pricing.items) && pricing.items.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Pricing Summary
              </h3>
              {taxData.isPaid && taxQuotes.length > 0 && (
                <p className="text-[11px] text-gray-400 -mt-3 mb-3">
                  Quotes are locked — payment has been completed.
                </p>
              )}
              <div className="space-y-2 text-xs">
                {pricing.items.map((it: any, idx: number) => {
                  const needsQuote = it.price === null || it.price === undefined;
                  const key = `${it.svc}:${it.fieldId}:${it.optionId}`;
                  const canQuote = !taxData.isPaid;
                  const isEditing = quoteEditKey === key && canQuote;
                  const existingQuote = taxQuotes.find(
                    (q: any) =>
                      q?.svcId === it?.svc &&
                      q?.fieldId === it?.fieldId &&
                      q?.optionId === it?.optionId
                  );
                  return (
                    <div key={idx} className="flex justify-between text-gray-700 gap-4 items-center">
                      <span className="flex-1 flex items-center gap-1.5">
                        {it.label}
                        {!needsQuote && hasQuoteFor(it) && (
                          <span className="rounded bg-emerald-100 text-emerald-700 px-1.5 py-0.5 text-[10px] font-bold uppercase">
                            Quoted
                          </span>
                        )}
                      </span>
                      {isEditing ? (
                        <span className="flex items-center gap-1.5 shrink-0">
                          <span className="text-gray-500">₹</span>
                          <input
                            type="number"
                            min={0}
                            value={quoteAmount}
                            onChange={(e) => setQuoteAmount(e.target.value)}
                            placeholder="Amount"
                            className="w-20 p-1.5 border border-gray-300 rounded-md text-xs text-gray-800 focus:outline-none focus:border-blue-600"
                            autoFocus
                          />
                          <select
                            value={quoteUnit}
                            onChange={(e) => setQuoteUnit(e.target.value)}
                            className="p-1.5 border border-gray-300 rounded-md text-xs text-gray-800 bg-white focus:outline-none focus:border-blue-600"
                            title="Billing frequency"
                          >
                            <option value="">Frequency…</option>
                            {QUOTE_UNITS.map((u) => (
                              <option key={u.value} value={u.value}>
                                {u.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => saveQuote(it)}
                            disabled={savingQuote}
                            className="inline-flex items-center gap-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 font-semibold disabled:opacity-50 cursor-pointer"
                            title="Save quote"
                          >
                            {savingQuote ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check size={12} />
                            )}
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuoteEditKey(null)}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-300 text-gray-600 px-2 py-1.5 font-semibold hover:bg-gray-50 cursor-pointer"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ) : needsQuote && existingQuote ? (
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold text-emerald-700">
                            ₹{formatINR(Number(existingQuote.amount) || 0)}
                            {existingQuote.unit ? ` ${existingQuote.unit}` : ""}
                          </span>
                          <span className="rounded bg-emerald-100 text-emerald-700 px-1.5 py-0.5 text-[10px] font-bold uppercase">
                            Quoted
                          </span>
                          {it.svc && it.fieldId && it.optionId && canQuote && (
                            <button
                              type="button"
                              onClick={() => {
                                setQuoteEditKey(key);
                                setQuoteAmount(String(existingQuote.amount ?? ""));
                                setQuoteUnit(existingQuote.unit || it.unit || "");
                              }}
                              className="inline-flex items-center gap-1 rounded-md border border-blue-600 text-blue-600 px-2 py-1 font-semibold hover:bg-blue-50 cursor-pointer"
                              title="Edit quote amount"
                            >
                              <Pencil size={11} />
                              Edit
                            </button>
                          )}
                        </span>
                      ) : needsQuote ? (
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="text-amber-600 font-bold">Pricing review</span>
                          {it.svc && it.fieldId && it.optionId && canQuote && (
                            <button
                              type="button"
                              onClick={() => {
                                setQuoteEditKey(key);
                                setQuoteAmount("");
                                setQuoteUnit(it.unit || "");
                              }}
                              className="inline-flex items-center gap-1 rounded-md border border-blue-600 text-blue-600 px-2 py-1 font-semibold hover:bg-blue-50 cursor-pointer"
                              title="Set quote amount"
                            >
                              <Pencil size={11} />
                              Quote
                            </button>
                          )}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold shrink-0">
                            ₹{formatINR(existingQuote ? Number(existingQuote.amount) || it.price : it.price)}
                            {existingQuote?.unit || it.unit ? ` ${existingQuote?.unit || it.unit}` : ""}
                          </span>
                          {existingQuote && canQuote && (
                            <button
                              type="button"
                              onClick={() => {
                                setQuoteEditKey(key);
                                setQuoteAmount(String(existingQuote.amount ?? it.price ?? ""));
                                setQuoteUnit(existingQuote.unit || it.unit || "");
                              }}
                              className="inline-flex items-center gap-1 rounded-md border border-blue-600 text-blue-600 px-2 py-1 font-semibold hover:bg-blue-50 cursor-pointer"
                              title="Edit quote amount"
                            >
                              <Pencil size={11} />
                              Edit
                            </button>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
                {typeof pricing.gst === "number" && (
                  <div className="flex justify-between text-gray-600 border-t border-gray-100 pt-2.5">
                    <span>GST (18%)</span>
                    <span className="font-semibold">₹{formatINR(Math.round(pricing.gst))}</span>
                  </div>
                )}
                {typeof pricing.total === "number" && (
                  <div className="flex justify-between text-sm font-extrabold text-blue-600 border-t border-gray-200 pt-3">
                    <span>Total</span>
                    <span>₹{formatINR(Math.round(pricing.total))}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Client Documents */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Client Documents
            </h3>
            {uploadedDocs.length > 0 ? (
              <div className="space-y-2">
                {uploadedDocs.map((key) => {
                  const doc = documents[key];
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-semibold text-gray-800">
                          {DOC_LABELS[key] || key}
                        </span>
                        {doc?.name && (
                          <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 truncate max-w-[180px]">
                            {doc.name}
                          </span>
                        )}
                      </div>
                      {doc?.path && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => downloadDoc(key, "preview")}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Preview"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadDoc(key, "download", doc.name)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No documents uploaded yet.</p>
            )}
          </div>

          {/* Miscellaneous Documents */}
          {Array.isArray(taxData.miscDocs) && taxData.miscDocs.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Miscellaneous Documents
              </h3>
              <div className="space-y-2">
                {taxData.miscDocs.map((doc: any, idx: number) =>
                  doc?.path ? (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-semibold text-gray-800">
                          {doc?.docType || `Document ${idx + 1}`}
                        </span>
                        {doc?.name && (
                          <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 truncate max-w-[180px]">
                            {doc.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => downloadMiscDoc(idx, "preview")}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadMiscDoc(idx, "download", doc.name)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Deliverables to Upload */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Deliverables to Upload
            </h3>
            <p className="text-xs text-gray-400">
              These are the documents promised under "Documents provided by CorpE" for the selected filings.
              Upload each one here — the client will see it with a Download button on their portal.
            </p>

            {selectedSvcs.length > 0 ? (
              <div className="space-y-4">
                {selectedSvcs.map((svcId) => {
                  const items = DELIVERABLES[svcId] || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={svcId} className="space-y-2">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {SERVICE_NAMES[svcId] || svcId}
                      </div>
                      {items.map((item) => {
                        const uploaded = (taxData.adminDocs || []).find(
                          (d: any) => d.id === item.id
                        );
                        const isUploading = uploadingDlvId === item.id;
                        return (
                          <div
                            key={item.id}
                            className={`rounded-lg border p-3 text-xs ${
                              uploaded
                                ? "border-emerald-200 bg-emerald-50/50"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className={`font-semibold flex-1 ${uploaded ? "text-emerald-800" : "text-slate-700"}`}>
                                {uploaded ? "✓ " : ""}{item.text}
                              </p>
                              <div className="shrink-0">
                                {isUploading ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-semibold">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                                  </span>
                                ) : uploaded ? (
                                  <span className="inline-flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-emerald-600 max-w-[130px] truncate" title={uploaded.name}>
                                      {uploaded.name}
                                    </span>
                                    <FileUploadComponent
                                      onFileSelect={(file) => handleUploadDeliverable(item.id, file)}
                                      renderTrigger={(openPicker) => (
                                        <button
                                          type="button"
                                          onClick={openPicker}
                                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-600 px-2 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                          title="Replace file"
                                        >
                                          <RefreshCw size={12} />
                                          Replace
                                        </button>
                                      )}
                                    />
                                  </span>
                                ) : (
                                  <FileUploadComponent
                                    onFileSelect={(file) => handleUploadDeliverable(item.id, file)}
                                    renderTrigger={(openPicker) => (
                                      <button
                                        type="button"
                                        onClick={openPicker}
                                        className="inline-flex items-center gap-1 rounded-lg border border-blue-600 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                      >
                                        <Upload size={12} />
                                        Upload
                                      </button>
                                    )}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No filings selected yet — deliverables will appear once the client picks services.</p>
            )}
          </div>

          {/* Miscellaneous Admin Documents */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Miscellaneous Admin Documents
            </h3>
            <p className="text-xs text-gray-400">
              Upload any additional document for this client. These will be visible and downloadable on the client portal.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={miscTitleInput}
                onChange={(e) => setMiscTitleInput(e.target.value)}
                placeholder="Document Title / Note (Optional)"
                className="w-full p-2.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-600"
              />

              <FileUploadComponent
                onFileSelect={(file) => handleUploadAdminDoc(file)}
                renderTrigger={(openPicker) => (
                  <button
                    type="button"
                    onClick={openPicker}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-600 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Upload size={14} />
                    Upload Miscellaneous Document
                  </button>
                )}
              />
            </div>

            {Array.isArray(taxData.adminDocs) && taxData.adminDocs.filter((d: any) => !String(d.id || "").startsWith("dlv-")).length > 0 && (
              <div className="pt-2 space-y-2 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Uploaded Admin Documents
                </span>
                {taxData.adminDocs.filter((d: any) => !String(d.id || "").startsWith("dlv-")).map((doc: any, idx: number) => (
                  <div
                    key={doc.id || idx}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-slate-800 truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                    {doc.path && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => downloadDoc(doc.id || idx, "preview", doc.name)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Preview"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadDoc(doc.id || idx, "download", doc.name)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {activeTab === "tracker" && (
        <TaxationAdminTrackerView
          appNo={appNo}
          orgId={taxData.org || ""}
          isPaid={taxData.isPaid ?? false}
        />
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-gray-400 block text-xs font-medium">{label}</span>
      <span className="text-gray-800 font-semibold text-sm">{value ?? "-"}</span>
    </div>
  );
}