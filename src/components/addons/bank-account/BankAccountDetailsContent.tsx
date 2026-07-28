"use client";

import { Download, Eye, Loader2, Upload } from "lucide-react";

import { FileUploadComponent } from "@/components/upload";
import { Switch } from "@/components/ui";

const BANK_LABELS: Record<string, string> = {
  icici: "ICICI Bank",
  hdfc: "HDFC Bank",
  axis: "Axis Bank",
  kotak: "Kotak Mahindra Bank",
  citi: "Citibank (Institutional)",
  razorpayx: "RazorpayX",
};

interface BankAccountDocView {
  name?: string;
  path?: string;
}

interface AdminDocEntry {
  id: string;
  name: string;
  path: string;
  uploadedAt: string;
}

interface BankAccountData {
  _id: string;
  org: string;
  bankId: string;
  hasGstBundle: boolean;
  panCard?: BankAccountDocView;
  incorporationCertificate?: BankAccountDocView;
  gstCertificate?: BankAccountDocView;
  addressProof?: BankAccountDocView;
  signatoryDocs?: BankAccountDocView;
  boardResolution?: BankAccountDocView;
  specimenSignature?: BankAccountDocView;
  accountDetails?: {
    accountType?: string;
    branch?: string;
    existingCustomer?: string;
    funding?: string;
    notes?: string;
    city?: string;
  };
  isPaid: boolean;
  amountPaid?: number;
  pricingDetails?: {
    baseFee?: number;
    bundleDiscount?: number;
    subtotal?: number;
    gstFee?: number;
    total?: number;
  };
  status?: string;
  adminDocs?: AdminDocEntry[];
  createdAt: string;
}

interface BankAccountDetailsContentProps {
  appNo: string;
  bankData: BankAccountData | null;
  adminDocs: AdminDocEntry[];
  kycVerified?: boolean;
  kycLoading?: boolean;
  onKycVerifiedChange?: (checked: boolean) => void;
  downloadBankDoc: (
    docType: string,
    mode?: "preview" | "download",
    adminDocId?: string,
    docName?: string
  ) => Promise<void>;
  handleAdminDocUpload: (file: File) => Promise<void>;
  uploadingAdminDoc?: boolean;
}

export default function BankAccountDetailsContent({
  appNo,
  bankData,
  adminDocs,
  kycVerified,
  kycLoading,
  onKycVerifiedChange,
  downloadBankDoc,
  handleAdminDocUpload,
  uploadingAdminDoc,
}: BankAccountDetailsContentProps) {
  if (!bankData) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        <p className="text-slate-500">No bank account setup data found for this client.</p>
      </div>
    );
  }

  const clientDocFields: { label: string; key: keyof BankAccountData }[] = [
    { label: "PAN Card", key: "panCard" },
    { label: "Certificate of Incorporation", key: "incorporationCertificate" },
    { label: "GST Registration Certificate", key: "gstCertificate" },
    { label: "Place of Business Proof", key: "addressProof" },
    { label: "Signatory PAN, Aadhaar & Photo", key: "signatoryDocs" },
    { label: "Board Resolution", key: "boardResolution" },
    { label: "Specimen Signature", key: "specimenSignature" },
  ];

  const price = bankData.pricingDetails;
  const details = bankData.accountDetails;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      {/* Left Column: Info & Client Docs */}
      <div className="space-y-6">
        {/* KYC Verification Card */}
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

        {/* Account Details Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Account Details
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <InfoRow label="Selected Bank" value={BANK_LABELS[bankData.bankId] || bankData.bankId || ""} />
            <InfoRow label="Account Type" value={details?.accountType} />
            <InfoRow label="Branch" value={details?.branch} />
            <InfoRow label="City" value={details?.city} />
            <InfoRow label="Existing Customer" value={details?.existingCustomer || "No"} />
            <InfoRow label="Initial Funding" value={details?.funding} />
            <InfoRow label="Payment Status" value={bankData.isPaid ? "Paid" : "Pending"} />
            <InfoRow label="Bundle Discount" value={bankData.hasGstBundle ? "Applied (₹500)" : "Not applicable"} />
            {details?.notes && (
              <InfoRow label="Notes" value={details.notes} className="col-span-2" />
            )}
          </div>
        </div>

        {/* Client Documents Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Client Documents
          </h3>
          <div className="space-y-2">
            {clientDocFields.map((field) => {
              const doc = bankData[field.key] as BankAccountDocView | undefined;
              const hasFile = Boolean(doc?.path || doc?.name);

              return (
                <div
                  key={field.key}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[220px]">
                      {field.label}
                    </span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${hasFile ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {hasFile ? "Uploaded" : "Pending"}
                    </span>
                  </div>

                  {hasFile && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => downloadBankDoc(field.key, "preview", undefined, field.label)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadBankDoc(field.key, "download", undefined, field.label)}
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
        </div>
      </div>

      {/* Right Column: Admin File Uploads */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Uploaded Documents
        </h3>

        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          {adminDocs && adminDocs.length > 0 ? (
            <div className="space-y-3">
              {adminDocs.map((doc, idx) => (
                <div key={doc.id || idx} className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-orange-700">Uploaded</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => downloadBankDoc("", "preview", doc.id, doc.name)}
                        className="text-orange-600 hover:text-orange-700"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadBankDoc("", "download", doc.id, doc.name)}
                        className="text-orange-600 hover:text-orange-700"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="truncate text-xs text-gray-700 font-medium">{doc.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-IN") : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-xs text-gray-400">No admin documents uploaded yet.</p>
            </div>
          )}

          <div className="pt-2">
            <FileUploadComponent
              onFileSelect={(file) => handleAdminDocUpload(file)}
              renderTrigger={(openPicker) => (
                <button
                  type="button"
                  onClick={openPicker}
                  disabled={uploadingAdminDoc}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#F46A45] px-3 py-1.5 text-xs font-medium text-[#F46A45] transition-colors hover:bg-orange-50 disabled:opacity-50"
                >
                  {uploadingAdminDoc ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  {uploadingAdminDoc ? "Uploading..." : "Upload New Document"}
                </button>
              )}
            />
          </div>
        </div>
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
      <span className="text-gray-400 block text-xs">{label}</span>
      <span className="text-gray-800 font-medium text-sm">{value ? String(value) : ""}</span>
    </div>
  );
}
