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
  gstSalesReg: "Sales register (GSTR-1)",
  gstPurchaseReg: "Purchase register / software access",
  gstSignatory: "Authorised Signatory details",
  itrPortalAccess: "Income tax e-filing portal login",
  itrSignatory: "Authorised Signatory details",
  itrAccountingAccess: "Accounting software access",
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
  tdsPortalAccess: "TDS portal login credentials",
  tdsSignatory: "Authorised Signatory details",
  advProjection: "Income & expense projection",
  advPrevItr: "Previous year's ITR",
  advTdsCredit: "Form 26AS extract",
  advCapGains: "Capital gains / one-off income",
  advPrevChallan: "Previous instalment challan",
  advSignatory: "Authorised Signatory details",
  gstAccess__letter: "GST Portal Authorisation Letter",
  gstPurchaseReg__letter: "Purchase Register Authorisation Letter",
  itrAccountingAccess__letter: "Accounting Software Authorisation Letter",
  tdsPortalAccess__letter: "TDS Portal Authorisation Letter",
};

const DOC_CATEGORY_ORDER = ["gst", "itr", "tds", "advance", "other"];

const DOC_CATEGORY_META: Record<string, { title: string; color: string }> = {
  gst: { title: "GST Filing Documents", color: "text-blue-800 border-blue-100 bg-blue-50/50" },
  itr: { title: "Income Tax (ITR) Documents", color: "text-blue-800 border-blue-100 bg-blue-50/50" },
  tds: { title: "TDS Returns Documents", color: "text-blue-800 border-blue-100 bg-blue-50/50" },
  advance: { title: "Advance Tax Documents", color: "text-blue-800 border-blue-100 bg-blue-50/50" },
  other: { title: "Other Client Documents", color: "text-blue-800 border-blue-100 bg-blue-50/50" },
};

function getDocCategory(key: string): string {
  const k = key.toLowerCase();
  if (k.startsWith("gst")) return "gst";
  if (k.startsWith("itr")) return "itr";
  if (k.startsWith("tds")) return "tds";
  if (k.startsWith("adv")) return "advance";
  return "other";
}

const TDS_SECTION_NAMES: Record<string, string> = {
  "24q": "24Q - Salary",
  "26q": "26Q - Vendors",
  "27q": "27Q - Non-resident",
  "27eq": "27EQ - TCS",
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

// Fixed billing frequency per service - the admin no longer picks a frequency.
const FIXED_QUOTE_UNITS: Record<string, string> = {
  gst: "/mo",
  itr: "/yr",
  tds: "/qtr",
  advance: "/qtr",
};

const UNIT_LABELS: Record<string, string> = {
  "/mo": "Monthly",
  "/qtr": "Quarterly",
  "/half-yr": "Half-Yearly",
  "/yr": "Yearly",
  "one-time": "One-time",
};

const QUOTE_STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: "Awaiting client confirmation", className: "bg-blue-100 text-blue-700 border-blue-300" },
  revising: { label: "Client requested a revision", className: "bg-amber-100 text-amber-700 border-amber-300" },
  needs_call: { label: "Client needs to book a call", className: "bg-purple-100 text-purple-700 border-purple-300" },
  accepted: { label: "Quotation accepted by client", className: "bg-emerald-100 text-emerald-700 border-emerald-300" },
};

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
  const [quoteAltAmount, setQuoteAltAmount] = useState<string>("");
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

  const downloadAdminDocFile = async (
    doc: any,
    mode: "preview" | "download" = "download"
  ) => {
    try {
      const url = `/admin/clients/${appNo}/taxation/doc/download?adminDocId=${encodeURIComponent(doc.id || doc.name || "")}`;
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const rawBlob = response.data;
      const contentType = rawBlob?.type || response.headers?.["content-type"] || (doc?.name?.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/png");
      const blob = rawBlob instanceof Blob && rawBlob.type ? rawBlob : new Blob([rawBlob], { type: contentType });
      const objectUrl = URL.createObjectURL(blob);
      if (mode === "preview") {
        window.open(objectUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = doc.name || doc.id || "deliverable";
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
    const altAmount = quoteAltAmount ? parseFloat(quoteAltAmount) : null;
    if (altAmount != null && (!altAmount || altAmount <= 0)) {
      toast.danger("Enter a valid revised price (or leave it empty)");
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
        altAmount,
        unit: FIXED_QUOTE_UNITS[item.svc] || null,
      });
      toast.success("Quote saved - the client will confirm it before paying");
      setQuoteEditKey(null);
      setQuoteAmount("");
      setQuoteAltAmount("");
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
              Paid
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

          {/* Directors / Key Stakeholders */}
          {(() => {
            const docFields = taxData.docFields || {};
            const directorsList = Array.isArray(docFields.itrDirectors)
              ? docFields.itrDirectors
              : Array.isArray(taxData.directors)
              ? taxData.directors
              : [];
            if (directorsList.length === 0) return null;
            return (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Directors / Key Stakeholders ({directorsList.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {directorsList.map((dir: any, idx: number) => (
                    <div key={idx} className="rounded-lg border border-gray-100 bg-gray-50/70 p-3.5 text-xs space-y-1.5">
                      <div className="font-bold text-gray-800 text-sm">{dir.name || `Director #${idx + 1}`}</div>
                      <div className="space-y-1 text-gray-600">
                        <div><span className="font-semibold text-gray-500">PAN:</span> {dir.pan || "-"}</div>
                        <div><span className="font-semibold text-gray-500">DIN / Ref:</span> {dir.din || dir.directorId || "-"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* TDS Deductees List */}
          {(() => {
            const docFields = taxData.docFields || {};
            const deducteesList = Array.isArray(docFields.tdsDeductee)
              ? docFields.tdsDeductee
              : Array.isArray(docFields.tdsDeductees)
              ? docFields.tdsDeductees
              : [];
            if (deducteesList.length === 0) return null;
            return (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  TDS Deductees List ({deducteesList.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {deducteesList.map((d: any, idx: number) => (
                    <div key={idx} className="rounded-lg border border-gray-100 bg-gray-50/70 p-3.5 text-xs space-y-1.5">
                      <div className="font-bold text-gray-800 text-sm">{d.name || `Deductee #${idx + 1}`}</div>
                      <div className="space-y-1 text-gray-600">
                        <div><span className="font-semibold text-gray-500">PAN:</span> {d.pan || "-"}</div>
                        <div><span className="font-semibold text-gray-500">Amount:</span> ₹{d.amount || "0"}</div>
                        <div><span className="font-semibold text-gray-500">Section:</span> {d.section || "-"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

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
              {QUOTE_STATUS_META[taxData.quoteStatus] && (
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border mb-3 ${QUOTE_STATUS_META[taxData.quoteStatus].className}`}
                >
                  {QUOTE_STATUS_META[taxData.quoteStatus].label}
                </span>
              )}
              {taxData.isPaid && taxQuotes.length > 0 && (
                <p className="text-[11px] text-gray-400 -mt-3 mb-3">
                  Quotes are locked - payment has been completed.
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
                        <span className="flex flex-col sm:flex-row items-end gap-2 shrink-0">
                          <span className="flex items-center gap-1.5">
                            <span className="text-gray-400 text-[10px] font-bold uppercase">Quote</span>
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
                            <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap">
                              {UNIT_LABELS[FIXED_QUOTE_UNITS[it.svc] || ""] || FIXED_QUOTE_UNITS[it.svc] || ""}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="text-gray-400 text-[10px] font-bold uppercase">Revised (optional)</span>
                            <span className="text-gray-500">₹</span>
                            <input
                              type="number"
                              min={0}
                              value={quoteAltAmount}
                              onChange={(e) => setQuoteAltAmount(e.target.value)}
                              placeholder="Optional"
                              className="w-20 p-1.5 border border-gray-300 rounded-md text-xs text-gray-800 focus:outline-none focus:border-blue-600"
                            />
                          </span>
                          <span className="flex items-center gap-1.5">
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
                              onClick={() => {
                                setQuoteEditKey(null);
                                setQuoteAltAmount("");
                              }}
                              className="inline-flex items-center gap-1 rounded-md border border-gray-300 text-gray-600 px-2 py-1.5 font-semibold hover:bg-gray-50 cursor-pointer"
                              title="Cancel"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        </span>
                      ) : needsQuote && existingQuote ? (
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold text-emerald-700">
                            {(() => {
                              const itemMultiplier = it.multiplier || (it.unit === "/qtr" || existingQuote?.unit === "/qtr" ? 3 : 1);
                              const itemMonthlyPrice = it.monthlyPrice != null ? Number(it.monthlyPrice) : (itemMultiplier > 1 && existingQuote?.amount ? Math.round(Number(existingQuote.amount) / itemMultiplier) : null);
                              return itemMultiplier > 1 && itemMonthlyPrice != null ? (
                                <>
                                  <span className="font-normal text-emerald-600">
                                    {itemMultiplier} x 
                                  </span>
                                  ₹{formatINR(Number(existingQuote.amount) || 0)}
                                  {existingQuote.unit ? ` ${existingQuote.unit}` : ""}
                                </>
                              ) : (
                                <>
                                  ₹{formatINR(Number(existingQuote.amount) || 0)}
                                  {existingQuote.unit ? ` ${existingQuote.unit}` : ""}
                                </>
                              );
                            })()}
                            {existingQuote.altAmount != null && (
                              <span className="ml-1.5 text-[10px] font-bold text-blue-600">
                                Revised: ₹{formatINR(Number(existingQuote.altAmount) || 0)}
                              </span>
                            )}
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
                                setQuoteAltAmount(existingQuote.altAmount != null ? String(existingQuote.altAmount) : "");
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
                                setQuoteAltAmount("");
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
                            {(() => {
                              const finalPrice = existingQuote ? Number(existingQuote.amount) || it.price : it.price;
                              const displayUnit = existingQuote?.unit || it.unit;
                              const itemMultiplier = it.multiplier || (displayUnit === "/qtr" ? 3 : 1);
                              const itemMonthlyPrice = it.monthlyPrice != null ? Number(it.monthlyPrice) : (itemMultiplier > 1 && finalPrice != null ? Math.round(Number(finalPrice) / itemMultiplier) : null);
                              return itemMultiplier > 1 && itemMonthlyPrice != null ? (
                                <>
                                  {/* <span className="font-normal text-gray-400">
                                    ₹{formatINR(itemMonthlyPrice)}/mo × {itemMultiplier} ={" "}
                                  </span> */}
                                  ₹{formatINR(Number(finalPrice) || 0)}
                                  {displayUnit ? ` ${displayUnit}` : ""}
                                </>
                              ) : (
                                <>
                                  ₹{formatINR(Number(finalPrice) || 0)}
                                  {displayUnit ? ` ${displayUnit}` : ""}
                                </>
                              );
                            })()}
                            {existingQuote?.altAmount != null && (
                              <span className="ml-1.5 text-[10px] font-bold text-blue-600">
                                Revised: ₹{formatINR(Number(existingQuote.altAmount) || 0)}
                              </span>
                            )}
                          </span>
                          {existingQuote && canQuote && (
                            <button
                              type="button"
                              onClick={() => {
                                setQuoteEditKey(key);
                                setQuoteAmount(String(existingQuote.amount ?? it.price ?? ""));
                                setQuoteAltAmount(existingQuote.altAmount != null ? String(existingQuote.altAmount) : "");
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
                {Array.isArray(taxData.quoteHistory) && taxData.quoteHistory.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Quote History
                    </span>
                    <div className="mt-2 space-y-1.5">
                      {taxData.quoteHistory.map((q: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-[11px] text-gray-500 gap-4">
                          <span className="flex-1">{q.label}</span>
                          <span className="font-semibold text-gray-700 shrink-0">
                            ₹{formatINR(Number(q.amount) || 0)}
                            {q.unit ? ` ${q.unit}` : ""}
                            {q.clearedAt ? ` · ${new Date(q.clearedAt).toLocaleDateString()}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
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
              <div className="space-y-5">
                {DOC_CATEGORY_ORDER.map((catId) => {
                  const catDocs = uploadedDocs.filter((key) => getDocCategory(key) === catId);
                  if (catDocs.length === 0) return null;
                  const meta = DOC_CATEGORY_META[catId] || DOC_CATEGORY_META.other;
                  return (
                    <div key={catId} className="space-y-2">
                      <div className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border ${meta.color}`}>
                        <span>{meta.title}</span>
                        <span className="text-[10px] font-bold opacity-75">
                          {catDocs.length} {catDocs.length === 1 ? "file" : "files"}
                        </span>
                      </div>
                      <div className="space-y-1.5 pl-0.5">
                        {catDocs.map((key) => {
                          const doc = documents[key];
                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/70 p-3 hover:bg-gray-100/70 transition-colors"
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
                                    className="text-blue-600 hover:text-blue-700 p-1 cursor-pointer"
                                    title="Preview"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => downloadDoc(key, "download", doc.name)}
                                    className="text-blue-600 hover:text-blue-700 p-1 cursor-pointer"
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
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No documents uploaded yet.</p>
            )}
          </div>

          {/* Client Credentials & Form Entries */}
          {taxData.docFields && Object.keys(taxData.docFields).length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Portal Credentials & Provided Details
              </h3>
              <div className="space-y-3">
                {/* Authorised Signatory */}
                {taxData.docFields.signatory && (
                  <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3 space-y-1 text-xs">
                    <span className="font-bold text-gray-700 block mb-1">Authorised Signatory</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                      <div><span className="font-semibold text-gray-500">Name:</span> {taxData.docFields.signatory.name || "N/A"}</div>
                      <div><span className="font-semibold text-gray-500">PAN:</span> {taxData.docFields.signatory.pan || "N/A"}</div>
                      <div><span className="font-semibold text-gray-500">Mobile:</span> {taxData.docFields.signatory.mobile || "N/A"}</div>
                      <div><span className="font-semibold text-gray-500">Email:</span> {taxData.docFields.signatory.email || "N/A"}</div>
                    </div>
                  </div>
                )}

                {/* GST Credentials */}
                {taxData.docFields.gstAccess && (
                  <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3 space-y-1 text-xs">
                    <span className="font-bold text-gray-700 block mb-1">GST Portal Credentials</span>
                    {taxData.docFields.gstAccess.useLetter ? (
                      <span className="text-blue-600 font-semibold">Authorisation Letter Uploaded (see Client Documents)</span>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                        <div><span className="font-semibold text-gray-500">User ID / GSTIN:</span> {taxData.docFields.gstAccess.login || "N/A"}</div>
                        <div><span className="font-semibold text-gray-500">Password:</span> {taxData.docFields.gstAccess.password || "••••••••"}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* ITR Credentials */}
                {taxData.docFields.itrPortalAccess && (
                  <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3 space-y-1 text-xs">
                    <span className="font-bold text-gray-700 block mb-1">Income Tax Portal Credentials</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                      <div><span className="font-semibold text-gray-500">User ID (PAN):</span> {taxData.docFields.itrPortalAccess.login || "N/A"}</div>
                      <div><span className="font-semibold text-gray-500">Password:</span> {taxData.docFields.itrPortalAccess.password || "••••••••"}</div>
                    </div>
                  </div>
                )}

                {/* TDS Credentials */}
                {taxData.docFields.tdsPortalAccess && (
                  <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3 space-y-1 text-xs">
                    <span className="font-bold text-gray-700 block mb-1">TDS Portal Credentials</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                      <div><span className="font-semibold text-gray-500">User ID (TAN):</span> {taxData.docFields.tdsPortalAccess.login || "N/A"}</div>
                      <div><span className="font-semibold text-gray-500">Password:</span> {taxData.docFields.tdsPortalAccess.password || "••••••••"}</div>
                    </div>
                  </div>
                )}

                {/* Software Access */}
                {(taxData.docFields.gstPurchaseReg || taxData.docFields.itrAccountingAccess) && (
                  <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3 space-y-1 text-xs">
                    <span className="font-bold text-gray-700 block mb-1">Accounting Software Access</span>
                    {(() => {
                      const sw = taxData.docFields.gstPurchaseReg || taxData.docFields.itrAccountingAccess;
                      if (!sw) return null;
                      if (sw.useLetter) {
                        return <span className="text-blue-600 font-semibold">Authorisation Letter Uploaded (see Client Documents)</span>;
                      }
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-gray-600">
                          <div><span className="font-semibold text-gray-500">Software:</span> {sw.softwareName || "N/A"}</div>
                          <div><span className="font-semibold text-gray-500">User ID:</span> {sw.login || "N/A"}</div>
                          <div><span className="font-semibold text-gray-500">Password:</span> {sw.password || "••••••••"}</div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

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
              Documents provided by CorpE
            </h3>

            {selectedSvcs.length > 0 ? (
              <div className="space-y-4">
                {selectedSvcs.map((svcId) => {
                  const items = DELIVERABLES[svcId] || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={svcId} className="space-y-3">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
                        {SERVICE_NAMES[svcId] || svcId}
                      </div>
                      <div className="space-y-4">
                        {items.map((item) => {
                          const uploaded = (taxData.adminDocs || []).find(
                            (d: any) => d.id === item.id
                          );
                          const isUploading = uploadingDlvId === item.id;
                          return (
                            <div
                              key={item.id}
                              className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-2xs"
                            >
                              <p className="text-xs font-semibold text-gray-700 leading-normal">
                                {item.text}
                              </p>

                              {isUploading ? (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                                  </span>
                                </div>
                              ) : uploaded ? (
                                <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-blue-700 uppercase">Uploaded</span>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => downloadAdminDocFile(uploaded, "preview")}
                                        className="text-blue-600 hover:text-blue-700 p-0.5 cursor-pointer"
                                        title="Preview"
                                      >
                                        <Eye size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => downloadAdminDocFile(uploaded, "download")}
                                        className="text-blue-600 hover:text-blue-700 p-0.5 cursor-pointer"
                                        title="Download"
                                      >
                                        <Download size={14} />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="truncate text-xs font-semibold text-gray-800" title={uploaded.name}>
                                    {uploaded.name}
                                  </p>
                                  {uploaded.uploadedAt && (
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                      {new Date(uploaded.uploadedAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-3.5 text-center">
                                  <p className="text-xs text-gray-400">No file uploaded</p>
                                </div>
                              )}

                              <div>
                                <FileUploadComponent
                                  onFileSelect={(file) => handleUploadDeliverable(item.id, file)}
                                  renderTrigger={(openPicker) => (
                                    <button
                                      type="button"
                                      onClick={openPicker}
                                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#F46A45] px-3 py-2 text-xs font-semibold text-[#F46A45] hover:bg-orange-50 transition-colors cursor-pointer"
                                    >
                                      <Upload size={14} />
                                      {uploaded ? "Replace" : "Upload"}
                                    </button>
                                  )}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No filings selected yet - deliverables will appear once the client picks services.</p>
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