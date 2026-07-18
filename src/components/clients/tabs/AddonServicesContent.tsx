"use client";

import { useEffect, useState, useCallback } from "react";
import { Upload, Download, Eye, ChevronRight } from "lucide-react";
import { toast } from "@heroui/react";

import { clientsApi } from "@/lib/api/clients";
import { FileUploadComponent } from "@/components/upload";
import { notifyApiError } from "@/utils/apiErrors";
import axiosInstance from "@/lib/axios";

interface AddonServicesContentProps {
  appNo: string;
}

interface GstDocEntry {
  id: string;
  name: string;
  path: string;
  uploadedAt: string;
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
  directors?: GstDirectorView[];
  status?: string;
  adminDocs?: GstDocEntry[];
}

const ADDONS = [
  { id: "gst-registration", label: "GST Registration", comingSoon: false },
  { id: "epf-esi", label: "EPF / ESI Registration", comingSoon: true },
  { id: "msme", label: "MSME Registration", comingSoon: true },
  { id: "professional-tax", label: "Professional Tax", comingSoon: true },
  { id: "shop-establishment", label: "Shop & Establishment", comingSoon: true },
  { id: "iso-certification", label: "ISO Certification", comingSoon: true },
] as const;

const ADMIN_DOC_SLOTS = [
  { id: "gst-certificate", label: "GST Certificate" },
  { id: "arn-acknowledgement", label: "ARN Acknowledgement" },
];

export default function AddonServicesContent({ appNo }: AddonServicesContentProps) {
  const [selected, setSelected] = useState("gst-registration");
  const [gstData, setGstData] = useState<GstRegistrationView | null>(null);
  const [adminDocs, setAdminDocs] = useState<GstDocEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // ARN States
  const [arnInput, setArnInput] = useState("");
  const [arnError, setArnError] = useState("");
  const [savingArn, setSavingArn] = useState(false);

  const loadGst = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientsApi.getGstRegistration(appNo);
      setGstData(data);
      setAdminDocs(data?.adminDocs ?? []);
      setArnInput((data as any)?.arn ?? "");
    } catch {
      setGstData(null);
      setAdminDocs([]);
      setArnInput("");
    } finally {
      setLoading(false);
    }
  }, [appNo]);

  useEffect(() => {
    if (selected === "gst-registration") loadGst();
  }, [selected, loadGst]);

  const handleSaveArn = async () => {
    if (!arnInput) {
      setArnError("ARN is required");
      return;
    }

    // Validate ARN (15 characters: 2 letters, 12 digits, 1 alphanumeric character)
    const isValid = /^[a-zA-Z]{2}[0-9]{12}[a-zA-Z0-9]$/.test(arnInput);
    if (!isValid) {
      setArnError("Invalid ARN format. E.g. AA060826000001Z (15 characters alphanumeric).");
      return;
    }

    try {
      setSavingArn(true);
      setArnError("");
      await clientsApi.updateGstArn(appNo, arnInput.toUpperCase());
      toast.success("GST Application Reference Number (ARN) saved successfully!");
      loadGst();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to save ARN." });
    } finally {
      setSavingArn(false);
    }
  };

  const handleUpload = async (slotId: string, file: File) => {
    try {
      const result = await clientsApi.uploadGstAdminDocument(appNo, slotId, file);
      toast.success(`${ADMIN_DOC_SLOTS.find((s) => s.id === slotId)?.label ?? slotId} uploaded successfully!`);
      loadGst();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to upload document." });
    }
  };

  const findDoc = (slotId: string) => adminDocs.find((d) => d.id === slotId);

  const downloadBusinessDoc = async (docId: string, mode: "preview" | "download" = "download") => {
    try {
      const url = clientsApi.getGstBusinessDocDownloadUrl(appNo, docId);
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const blob = response.data;
      const objectUrl = URL.createObjectURL(blob);
      if (mode === "preview") {
        window.open(objectUrl, "_blank");
      } else {
        const contentDisposition = response.headers["content-disposition"];
        let filename = docId;
        if (contentDisposition) {
          const matches = /filename\*?=(?:UTF-8'')?([^;]+)/.exec(contentDisposition);
          if (matches && matches[1]) {
            filename = decodeURIComponent(matches[1].replace(/['"]/g, ""));
          } else {
            const legacyMatches = /filename="?([^";]+)"?/.exec(contentDisposition);
            if (legacyMatches && legacyMatches[1]) {
              filename = legacyMatches[1];
            }
          }
        } else {
          const extensionMap: Record<string, string> = {
            "application/pdf": ".pdf",
            "image/png": ".png",
            "image/jpeg": ".jpg",
          };
          const ext = extensionMap[blob.type] || "";
          filename = `${docId}${ext}`;
        }

        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch {
      toast.danger("Failed to download document");
    }
  };

  const renderAddonList = () => (
    <div className="w-64 shrink-0 border-r border-gray-200 pr-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Add-on Services
      </h3>
      <ul className="space-y-1">
        {ADDONS.map((addon) => {
          const isActive = selected === addon.id;
          return (
            <li key={addon.id}>
              <button
                type="button"
                disabled={addon.comingSoon}
                onClick={() => setSelected(addon.id)}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-white font-medium"
                    : addon.comingSoon
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{addon.label}</span>
                {addon.comingSoon && (
                  <span className="text-[10px] font-semibold uppercase text-gray-400">
                    Soon
                  </span>
                )}
                {!addon.comingSoon && <ChevronRight size={16} className={isActive ? "text-white" : "text-gray-400"} />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const renderGstDetail = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    const details = gstData?.gstDetails;
    const directors = gstData?.directors ?? [];
    const businessDocs = gstData?.businessDocs ?? {};
    const status = gstData?.status ?? "—";

    return (
      <div className="flex-1 grid grid-cols-[1fr_280px] gap-6">
        {/* Left: GST Info */}
        <div className="space-y-6">
          {/* Status badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-800">GST Registration</h2>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                status === "completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {status === "completed" ? "Completed" : "Open"}
            </span>
          </div>

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
  };

  return (
    <div className="flex gap-6 mt-4">
      {renderAddonList()}
      {selected === "gst-registration" && renderGstDetail()}
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
