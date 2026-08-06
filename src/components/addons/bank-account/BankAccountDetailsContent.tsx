"use client";

import { useEffect, useState } from "react";
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

export interface BankMiscDocView {
  name?: string;
  path?: string;
  docType?: string;
  status?: string;
  uploadedAt?: string;
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
  signatoryPan?: BankAccountDocView;
  signatoryAadhaar?: BankAccountDocView;
  signatoryPhoto?: BankAccountDocView;
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
  openedAccountDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
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
  miscDocs?: BankMiscDocView[];
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
  downloadBankMiscDoc?: (index: number, mode?: "preview" | "download") => Promise<void>;
  handleAdminDocUpload: (file: File) => Promise<void>;
  uploadingAdminDoc?: boolean;
  onOpenedAccountInfoSave?: (payload: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  }) => Promise<void>;
}

export default function BankAccountDetailsContent({
  appNo,
  bankData,
  adminDocs,
  kycVerified,
  kycLoading,
  onKycVerifiedChange,
  downloadBankDoc,
  downloadBankMiscDoc,
  handleAdminDocUpload,
  uploadingAdminDoc,
  onOpenedAccountInfoSave,
}: BankAccountDetailsContentProps) {
  const [openedAccountForm, setOpenedAccountForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });
  const [openedAccountSaving, setOpenedAccountSaving] = useState(false);
  const [openedAccountError, setOpenedAccountError] = useState("");

  useEffect(() => {
    setOpenedAccountForm({
      accountHolderName: bankData?.openedAccountDetails?.accountHolderName || "",
      accountNumber: bankData?.openedAccountDetails?.accountNumber || "",
      ifscCode: bankData?.openedAccountDetails?.ifscCode || "",
      bankName: bankData?.openedAccountDetails?.bankName || "",
    });
  }, [bankData]);

  const handleSaveOpenedAccount = async () => {
    const accountNumber = openedAccountForm.accountNumber.trim();
    const ifscCode = openedAccountForm.ifscCode.trim().toUpperCase();

    if (accountNumber && !/^\d{9,18}$/.test(accountNumber)) {
      setOpenedAccountError("Account number must be 9-18 digits.");
      return;
    }
    if (ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      setOpenedAccountError("Enter a valid IFSC code.");
      return;
    }

    setOpenedAccountError("");
    setOpenedAccountSaving(true);
    try {
      await onOpenedAccountInfoSave?.({
        accountHolderName: openedAccountForm.accountHolderName.trim(),
        accountNumber,
        ifscCode,
        bankName: openedAccountForm.bankName.trim(),
      });
    } finally {
      setOpenedAccountSaving(false);
    }
  };

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
    { label: "Signatory PAN Card", key: "signatoryPan" },
    { label: "Signatory Aadhaar Card", key: "signatoryAadhaar" },
    { label: "Signatory Photograph", key: "signatoryPhoto" },
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
                    <span className="text-xs font-medium text-gray-700 truncate max-w-55">
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

        {/* Miscellaneous Documents */}
        {bankData?.miscDocs && bankData.miscDocs.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Miscellaneous Documents
            </h3>
            <div className="space-y-2">
              {bankData.miscDocs.map((doc: BankMiscDocView, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-gray-700 truncate max-w-45">
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
                      <span className="text-[10px] text-gray-400 italic max-w-30 truncate">
                        {doc.docType}
                      </span>
                    )}
                    {doc.path && downloadBankMiscDoc && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => downloadBankMiscDoc(idx, "preview")}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadBankMiscDoc(idx, "download")}
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
      </div>

      {/* Right Column: Admin File Uploads */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Uploaded Documents
        </h3>

        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-700">Board Resolution for Account Opening</p>

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
              <p className="text-xs text-gray-400">No file uploaded</p>
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
                  {uploadingAdminDoc ? "Uploading..." : "Upload"}
                </button>
              )}
            />
          </div>
        </div>

        {/* Opened Account Details */}
        {onOpenedAccountInfoSave !== undefined && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-gray-700">Opened Account Details</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Actual account info once the account is activated
                </p>
              </div>
              {bankData.openedAccountDetails?.accountNumber && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-700">
                  Saved
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={openedAccountForm.accountHolderName}
                  onChange={(e) =>
                    setOpenedAccountForm((prev) => ({ ...prev, accountHolderName: e.target.value }))
                  }
                  placeholder="e.g. Acme Solutions Pvt Ltd"
                  className="w-full rounded border border-gray-400 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Account Number
                </label>
                <input
                  type="text"
                  value={openedAccountForm.accountNumber}
                  onChange={(e) =>
                    setOpenedAccountForm((prev) => ({ ...prev, accountNumber: e.target.value }))
                  }
                  placeholder="9-18 digits"
                  className="w-full rounded border border-gray-400 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={openedAccountForm.ifscCode}
                  onChange={(e) =>
                    setOpenedAccountForm((prev) => ({ ...prev, ifscCode: e.target.value }))
                  }
                  placeholder="e.g. ICIC0001234"
                  className="w-full rounded border border-gray-400 px-3 py-2 text-sm text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={openedAccountForm.bankName}
                  onChange={(e) =>
                    setOpenedAccountForm((prev) => ({ ...prev, bankName: e.target.value }))
                  }
                  placeholder="e.g. ICICI Bank"
                  className="w-full rounded border border-gray-400 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]"
                />
              </div>
            </div>

            {openedAccountError && (
              <p className="text-xs font-medium text-red-600">{openedAccountError}</p>
            )}

            <button
              type="button"
              onClick={handleSaveOpenedAccount}
              disabled={openedAccountSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-[#FF6A3D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e55a35] disabled:opacity-60"
            >
              {openedAccountSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              {openedAccountSaving ? "Saving..." : "Save Account Details"}
            </button>
          </div>
        )}
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
