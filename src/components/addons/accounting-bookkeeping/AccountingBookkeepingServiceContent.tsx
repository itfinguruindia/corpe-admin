"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { toast } from "@heroui/react";
import { Loader2, Download, Eye, BookOpen, Upload } from "lucide-react";

import { clientsApi } from "@/lib/api/clients";
import { notifyApiError } from "@/utils/apiErrors";
import axiosInstance from "@/lib/axios";
import { FileUploadComponent } from "@/components/upload";

import AccountingBookkeepingAdminTrackerView from "./AccountingBookkeepingAdminTrackerView";

interface AccountingBookkeepingServiceContentProps {
  appNo: string;
}

const TX_TIER_NAMES = ["0-50 txns/mo", "51-150 txns/mo", "151-300 txns/mo", "301-500 txns/mo"];

const BILLING_CYCLES: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  halfyearly: "Half-Yearly",
  yearly: "Yearly",
};

const CLIENT_DOC_SLOTS = [
  { id: "docBusinessPan", label: "Business PAN Card" },
  { id: "docIncorpProof", label: "Certificate of Incorporation" },
  { id: "docAddressProof", label: "Principal Place of Business Proof" },
  { id: "docSignatoryPan", label: "Signatory PAN Card" },
  { id: "docSignatoryAadhaar", label: "Signatory Aadhaar Card" },
  { id: "docSignatoryPhoto", label: "Signatory Photograph" },
  { id: "docBankStatements", label: "Bank Statements (Last 3 Months)" },
  { id: "docBooksExport", label: "Existing Books / Accounting Software Export" },
  { id: "docGstAccess", label: "GST Portal Access / Authorisation Letter" },
];

export default function AccountingBookkeepingServiceContent({
  appNo,
}: AccountingBookkeepingServiceContentProps) {
  const [loading, setLoading] = useState(true);
  const [abData, setAbData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"details" | "tracker">("details");

  const [miscTitleInput, setMiscTitleInput] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/admin/clients/${appNo}/accounting-bookkeeping`
      );
      setAbData(res.data?.data || res.data);
    } catch (error) {
      console.error("Failed to fetch Accounting & Bookkeeping data:", error);
      setAbData(null);
    } finally {
      setLoading(false);
    }
  }, [appNo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUploadAdminDoc = async (file: File) => {
    try {
      await clientsApi.uploadAccountingBookkeepingAdminDoc(
        appNo,
        `misc-${Date.now()}`,
        file,
        miscTitleInput
      );
      toast.success("Document uploaded successfully!");
      setMiscTitleInput("");
      fetchData();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to upload admin document." });
    }
  };

  const downloadDoc = async (
    docId: string,
    mode: "preview" | "download" = "download",
    filename?: string
  ) => {
    try {
      const url = `/admin/clients/${appNo}/accounting-bookkeeping/doc/download?docId=${encodeURIComponent(docId)}`;
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
      const url = `/admin/clients/${appNo}/accounting-bookkeeping/misc-doc/download?index=${index}`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
        <span className="text-sm font-semibold">Loading engagement data...</span>
      </div>
    );
  }

  if (!abData) {
    return (
      <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-sm space-y-2">
        <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
        <p>No Accounting & Bookkeeping data found for application #{appNo}.</p>
      </div>
    );
  }

  const uploadedDocs = CLIENT_DOC_SLOTS.filter(
    (slot) => abData[slot.id]?.path
  );

  const tierName =
    typeof abData.txTierIdx === "number"
      ? TX_TIER_NAMES[abData.txTierIdx] || "-"
      : "-";

  const billingLabel = BILLING_CYCLES[abData.billingCycle] || abData.billingCycle || "-";

  return (
    <div className="flex flex-col gap-6 font-sans text-gray-800">
      {/* Header + Tabs */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">Accounting & Bookkeeping</h2>
          {!abData.isPaid && (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
              Payment Pending
            </span>
          )}
          {abData.isPaid && (
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
                <InfoRow label="Business Structure" value={abData.businessStructure || "-"} />
                <InfoRow label="Transaction Volume" value={tierName} />
                <InfoRow label="Billing Cycle" value={billingLabel} />
                <InfoRow label="Industry" value={abData.industry || "-"} />
                {abData.otherIndustryDetails && (
                  <InfoRow label="Industry Details" value={abData.otherIndustryDetails} className="col-span-2" />
                )}
                <InfoRow label="Accounting Software" value={abData.software || "-"} />
                <InfoRow label="Existing Books" value={abData.books || "-"} />
                <InfoRow label="Bank Accounts" value={abData.bankAccounts || "-"} />
                <InfoRow label="Inventory" value={abData.inventory || "-"} />
                <InfoRow label="Multi-currency" value={abData.multicurrency || "-"} />
                <InfoRow label="GST Reconciliation" value={abData.gstrecon || "-"} />
                <InfoRow label="TDS Return Filing" value={abData.tds || "-"} />
                <InfoRow label="Financial Statements" value={abData.finstatements || "-"} />
                <InfoRow label="Support Level" value={abData.support || "-"} />
                <InfoRow label="Billing Structure" value={abData.billingStructure || "-"} />
              </div>
            </div>

            {/* Authorised Signatory & Contact */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Authorised Signatory & Contact
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <InfoRow label="Signatory Name" value={abData.signatoryName} />
                <InfoRow label="Designation" value={abData.signatoryDesignation} />
                <InfoRow label="Contact Email" value={abData.contactEmail} />
                <InfoRow label="Contact Mobile" value={abData.contactMobile} />
                <InfoRow label="Business Address" value={abData.address} className="col-span-2" />
                {abData.gstin && <InfoRow label="GSTIN" value={abData.gstin} />}
                {abData.regMonth && <InfoRow label="Registration Month" value={abData.regMonth} />}
                {abData.notes && (
                  <InfoRow label="Additional Notes" value={abData.notes} className="col-span-2" />
                )}
              </div>
            </div>

            {/* Previous Accountant (shown if addon_only) */}
            {(abData.prevAccountantName || abData.prevAccountantFirm || abData.prevAccountantContact) && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Previous Accountant / CA
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <InfoRow label="Name" value={abData.prevAccountantName} />
                  <InfoRow label="Firm" value={abData.prevAccountantFirm} />
                  <InfoRow label="Contact" value={abData.prevAccountantContact} />
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
                  {uploadedDocs.map(({ id, label }) => {
                    const doc = abData[id];
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-semibold text-gray-800">{label}</span>
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
                              onClick={() => downloadDoc(id, "preview")}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="Preview"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadDoc(id, "download", doc.name)}
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
            {Array.isArray(abData.miscDocs) && abData.miscDocs.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Miscellaneous Documents
                </h3>
                <div className="space-y-2">
                  {abData.miscDocs.map((doc: any, idx: number) =>
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

              {Array.isArray(abData.adminDocs) && abData.adminDocs.length > 0 && (
                <div className="pt-2 space-y-2 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Uploaded Admin Documents
                  </span>
                  {abData.adminDocs.map((doc: any, idx: number) => (
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
                            <Eye size={14} />
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
        <AccountingBookkeepingAdminTrackerView
          appNo={appNo}
          orgId={abData.org || ""}
          isPaid={abData.isPaid ?? false}
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
  value?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-gray-400 block text-xs font-medium">{label}</span>
      <span className="text-gray-800 font-semibold text-sm">{value ?? "-"}</span>
    </div>
  );
}
