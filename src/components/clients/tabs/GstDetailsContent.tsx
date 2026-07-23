"use client";

import { Upload, Download, Eye, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui";
import { FileUploadComponent } from "@/components/upload";

interface GstDocEntry {
  id: string;
  name: string;
  path: string;
  uploadedAt: string;
}

interface GstMiscDocView {
  docType?: string;
  name?: string;
  path?: string;
  status?: string;
  uploadedAt?: string;
}

interface GstDirectorView {
  name: string;
  email: string;
  phone: string;
  authorized: boolean;
  docs: Record<string, any>;
}

interface GstRegistrationView {
  _id: string;
  org?: string;
  gstDetails?: {
    legalName?: string;
    tradeName?: string;
    natureOfBusiness?: string;
    reason?: string;
    dateLiable?: string;
    hsnSac?: string;
    hsnSacCoveredByCorpE?: boolean;
    bankAccount?: string;
    ifsc?: string;
    principalAddress?: string;
    deliveryMethod?: string;
    deliveryEmail?: string;
    deliveryAddress?: string;
    additionalPlaces?: boolean;
    additionalPlacesText?: string;
  };
  businessDocs?: Record<string, { name: string; path: string; status?: string }>;
  miscDocs?: GstMiscDocView[];
  directors?: GstDirectorView[];
  status?: string;
  arn?: string;
  adminDocs?: GstDocEntry[];
}

interface GstDetailsContentProps {
  appNo: string;
  gstData: GstRegistrationView | null;
  adminDocs: GstDocEntry[];
  arnInput: string;
  arnError: string;
  savingArn: boolean;
  setArnInput: (val: string) => void;
  setArnError: (val: string) => void;
  handleSaveArn: () => Promise<void>;
  handleUpload: (slotId: string, file: File) => Promise<void>;
  downloadBusinessDoc: (docId: string, mode: "preview" | "download") => Promise<void>;
  downloadMiscDoc: (index: number, mode: "preview" | "download") => Promise<void>;
  ADMIN_DOC_SLOTS: { id: string; label: string }[];
  kycVerified?: boolean;
  onKycVerifiedChange?: (checked: boolean) => void;
  kycLoading?: boolean;
}

export default function GstDetailsContent({
  appNo,
  gstData,
  adminDocs,
  arnInput,
  arnError,
  savingArn,
  setArnInput,
  setArnError,
  handleSaveArn,
  handleUpload,
  downloadBusinessDoc,
  downloadMiscDoc,
  ADMIN_DOC_SLOTS,
  kycVerified,
  onKycVerifiedChange,
  kycLoading,
}: GstDetailsContentProps) {
  const details = gstData?.gstDetails;
  const directors = gstData?.directors ?? [];
  const businessDocs = gstData?.businessDocs ?? {};

  const findDoc = (slotId: string) => adminDocs.find((d) => d.id === slotId);

  return (
    <div className="grid grid-cols-[1fr_280px] gap-6">
      {/* Left: GST Info */}
      <div className="space-y-6">
        {/* KYC Verified Toggle */}
        {onKycVerifiedChange !== undefined && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">KYC Verification</h3>
                <p className="text-xs text-gray-500 mt-0.5">Details and Document verification</p>
              </div>
              <div className="flex items-center gap-2">
                {kycLoading && <Loader2 className="animate-spin h-4 w-4 text-primary" />}
                <Switch
                  checked={!!kycVerified}
                  onChange={(c) => onKycVerifiedChange(c)}
                  disabled={kycLoading}
                />
              </div>
            </div>
            <div className="mt-3">
              {kycVerified ? (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700">
                  Pending Verification
                </span>
              )}
            </div>
          </div>
        )}

        {/* GST Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            GST Details
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <InfoRow label="Legal Name" value={details?.legalName} />
            <InfoRow label="Trade Name" value={details?.tradeName} />
            <InfoRow label="Nature of Business" value={details?.natureOfBusiness} />
            <InfoRow label="Reason" value={details?.reason} />
            <InfoRow label="Date Liable" value={details?.dateLiable} />
            <InfoRow label="HSN / SAC" value={details?.hsnSac} />
            <InfoRow
              label="CorpE covers HSN/SAC?"
              value={details?.hsnSacCoveredByCorpE ? "Yes" : "No"}
            />
            <InfoRow label="Bank Account" value={details?.bankAccount} />
            <InfoRow label="IFSC" value={details?.ifsc} />
            <InfoRow label="Principal Address" value={details?.principalAddress} />
            <InfoRow label="Delivery Method" value={details?.deliveryMethod} />
            <InfoRow label="Delivery Email" value={details?.deliveryEmail} />
            <InfoRow label="Delivery Address" value={details?.deliveryAddress} />
            <InfoRow
              label="Additional Places of Business"
              value={details?.additionalPlaces ? "Yes" : "No"}
            />
            {details?.additionalPlaces && (
              <InfoRow label="Additional Places Details" value={details?.additionalPlacesText} className="col-span-2" />
            )}
          </div>
        </div>

        {/* Directors */}
        {directors.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Directors / Promoters
            </h3>
            <div className="space-y-3">
              {directors.map((dir, idx) => (
                <div key={idx} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800 text-sm">{dir.name || `Director ${idx + 1}`}</span>
                    {dir.authorized && (
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
                        Authorised Signatory
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
                    <span>Email: {dir.email || "—"}</span>
                    <span>Phone: {dir.phone || "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Business Documents */}
        {Object.keys(businessDocs).length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Business Documents
            </h3>
            <div className="space-y-2">
              {Object.entries(businessDocs).map(([docId, doc]) => (
                <div
                  key={docId}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[180px]">
                      {doc.name || docId}
                    </span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        doc.status === "clientUpload"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {doc.status === "clientUpload" ? "Uploaded" : "Pending"}
                    </span>
                  </div>
                  {doc.path && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => downloadBusinessDoc(docId, "preview")}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadBusinessDoc(docId, "download")}
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
          </div>
        )}
      </div>

        {/* Miscellaneous Documents */}
        {gstData?.miscDocs && gstData.miscDocs.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Miscellaneous Documents
            </h3>
            <div className="space-y-2">
              {gstData.miscDocs.map((doc: GstMiscDocView, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[180px]">
                      {doc.name || `Document ${idx + 1}`}
                    </span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        doc.status === "clientUpload"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {doc.status === "clientUpload" ? "Uploaded" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {doc.docType && (
                      <span className="text-[10px] text-gray-400 italic max-w-[120px] truncate">
                        {doc.docType}
                      </span>
                    )}
                    {doc.path && (
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
                          onClick={() => downloadMiscDoc(idx, "download")}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Right: Admin File Uploads */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Uploaded Documents
        </h3>

        {ADMIN_DOC_SLOTS.map((slot) => {
          const doc = findDoc(slot.id);
          return (
            <div key={slot.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-gray-600 mb-3">{slot.label}</p>

              {doc ? (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-orange-700">Uploaded</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="text-orange-600 hover:text-orange-700"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        className="text-orange-600 hover:text-orange-700"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="truncate text-xs text-gray-700">{doc.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ""}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-center">
                  <p className="text-xs text-gray-400 mb-2">No file uploaded</p>
                </div>
              )}

              <div className="mt-3">
                <FileUploadComponent
                  onFileSelect={(file) => handleUpload(slot.id, file)}
                  renderTrigger={(openPicker) => (
                    <button
                      type="button"
                      onClick={openPicker}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#F46A45] px-3 py-1.5 text-xs font-medium text-[#F46A45] transition-colors hover:bg-orange-50"
                    >
                      <Upload size={14} />
                      Upload
                    </button>
                  )}
                />
              </div>

              {slot.id === "arn-acknowledgement" && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                    GST Application Reference Number (ARN)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. AA060826000001Z"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-800 focus:border-primary focus:outline-none uppercase font-mono"
                      maxLength={15}
                      value={arnInput}
                      onChange={(e) => {
                        setArnInput(e.target.value.toUpperCase());
                        setArnError("");
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSaveArn}
                      disabled={savingArn}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                      {savingArn ? "Saving..." : "Save"}
                    </button>
                  </div>
                  {arnError && (
                    <p className="text-[10px] text-red-500 mt-1 font-medium">{arnError}</p>
                  )}
                  {gstData?.arn && !arnError && (
                    <p className="text-[10px] text-green-600 mt-1 font-medium">
                      Current ARN: <span className="font-mono">{gstData.arn}</span> (Saved)
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value?: string | null | boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-gray-400 block">{label}</span>
      <span className="text-gray-800 font-medium">{value ?? "—"}</span>
    </div>
  );
}
