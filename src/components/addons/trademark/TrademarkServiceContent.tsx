"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@heroui/react";
import { Loader2, Download, Eye, Upload } from "lucide-react";

import { notifyApiError } from "@/utils/apiErrors";
import axiosInstance from "@/lib/axios";
import { FileUploadComponent } from "@/components/upload";
import TrademarkAddonTrackerView from "./TrademarkAddonTrackerView";

interface TrademarkServiceContentProps {
  appNo: string;
}

interface TrademarkDocEntry {
  id: string;
  name: string;
  path: string;
  uploadedAt: string;
}

const ADMIN_DOC_SLOTS = [
  { id: "tm-48-power-of-attorney", label: "Power of Attorney (Form TM-48)" },
  { id: "filing-receipt", label: "Trademark Application Filing Receipt" },
  { id: "examination-report", label: "Examination Report" },
];

export default function TrademarkServiceContent({ appNo }: TrademarkServiceContentProps) {
  const [loading, setLoading] = useState(true);
  const [tmData, setTmData] = useState<any>(null);
  const [adminDocs, setAdminDocs] = useState<TrademarkDocEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "tracker">("details");

  const fetchTrademarkDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/admin/clients/${appNo}/trademark-registration`);
      const data = res.data?.data || res.data;
      setTmData(data);
      setAdminDocs(data?.adminDocs ?? []);
    } catch (error) {
      console.error("Failed to fetch trademark details:", error);
      setTmData(null);
      setAdminDocs([]);
    } finally {
      setLoading(false);
    }
  }, [appNo]);

  useEffect(() => {
    fetchTrademarkDetails();
  }, [fetchTrademarkDetails]);

  const handleUploadAdminDoc = async (slotId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axiosInstance.post(
        `/admin/clients/${appNo}/trademark-registration/upload-admin-doc?docType=${encodeURIComponent(slotId)}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Document uploaded successfully!");
      fetchTrademarkDetails();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to upload admin document." });
    }
  };

  const downloadDocFile = async (path?: string, mode: "preview" | "download" = "download") => {
    if (!path) return;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      if (mode === "preview") {
        window.open(path, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = path;
        a.download = path.split("/").pop() || "document";
        a.click();
      }
      return;
    }
    try {
      const response = await axiosInstance.get(path, { responseType: "blob" });
      const blob = response.data;
      const objectUrl = URL.createObjectURL(blob);
      if (mode === "preview") {
        window.open(objectUrl, "_blank");
      } else {
        const filename = path.split("/").pop() || "document";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-primary" />
        <span className="text-xs font-semibold">Loading Trademark details...</span>
      </div>
    );
  }

  if (!tmData) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-sm">
        No trademark registration application found for application #{appNo}.
      </div>
    );
  }

  const docsToRender = [
    { label: "Logo Artwork", doc: tmData.logoDoc },
    { label: "Sound Recording", doc: tmData.soundDoc },
    { label: "Graphical Notation", doc: tmData.notationDoc },
    { label: "Shape Images", doc: tmData.shapeDoc },
    { label: "Business PAN Card", doc: tmData.docBusinessPan },
    { label: "Certificate of Incorporation / Deed", doc: tmData.docIncorpProof },
    { label: "Address Proof", doc: tmData.docAddressProof },
    { label: "Signatory PAN Card", doc: tmData.docSignatoryPan },
    { label: "Signatory Aadhaar Card", doc: tmData.docSignatoryAadhaar },
    { label: "Signatory Photograph", doc: tmData.docSignatoryPhoto },
    { label: "MSME / Udyam Certificate", doc: tmData.docMsmeCert },
    { label: "User Affidavit", doc: tmData.docAffidavit },
    { label: "Proof of Commercial Use", doc: tmData.docProofUse },
    { label: "Invoice Proof", doc: tmData.docInvoiceProof },
  ].filter((item) => item.doc && (item.doc.name || item.doc.path));

  const findAdminDoc = (slotId: string) => adminDocs.find((d) => d.id === slotId);

  return (
    <div className="space-y-6 font-sans text-gray-800">
      {/* Top Tab Controls */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "details"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Application &amp; Documents
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tracker")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "tracker"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Tracker &amp; Progress
        </button>
      </div>

      {activeTab === "details" && (
        <div className="grid grid-cols-[1fr_280px] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Trademark Details */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Trademark Details
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <InfoRow label="Mark Type" value={tmData.markType ? tmData.markType.toUpperCase() : "WORDMARK"} />
                <InfoRow label="Wordmark Text" value={tmData.wordmark} />
                <InfoRow
                  label="Usage Status"
                  value={tmData.usageStatus === "inuse" ? `In Use since ${tmData.useDate || "-"}` : "Proposed to be Used"}
                />
                <InfoRow
                  label="Business Structure"
                  value={`${tmData.businessStructure || "Company"} (${tmData.isMsme === "yes" ? "MSME" : "Non-MSME"})`}
                />
                {tmData.isNonEnglish === "yes" && (
                  <>
                    <InfoRow label="English Translation" value={tmData.translation} />
                    <InfoRow label="Transliteration" value={tmData.transliteration} />
                  </>
                )}
                {tmData.colourClaim === "yes" && (
                  <InfoRow label="Colour Claim Description" value={tmData.colourDesc} className="col-span-2" />
                )}
                {tmData.soundDesc && <InfoRow label="Sound Description" value={tmData.soundDesc} className="col-span-2" />}
                {tmData.shapeDesc && <InfoRow label="Shape Description" value={tmData.shapeDesc} className="col-span-2" />}
                <div className="col-span-2">
                  <span className="text-gray-400 block text-xs font-medium">Selected Classes</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {tmData.selectedClasses && tmData.selectedClasses.length > 0 ? (
                      tmData.selectedClasses.map((c: number) => (
                        <span key={c} className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold text-xs border border-blue-100">
                          Class {c}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs">No classes selected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Goods & Services Specifications */}
            {tmData.classSpecs && Object.keys(tmData.classSpecs).length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Goods &amp; Services Specifications
                </h3>
                <div className="space-y-3">
                  {Object.entries(tmData.classSpecs).map(([cls, spec]) => (
                    <div key={cls} className="rounded-lg border border-gray-100 bg-gray-50 p-3.5">
                      <span className="font-bold text-blue-600 text-xs block mb-1">Class {cls}</span>
                      <span className="text-gray-800 text-xs leading-relaxed">{String(spec)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signatory & Correspondence Details */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Signatory &amp; Correspondence Details
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <InfoRow label="Signatory Name" value={tmData.signatoryName} />
                <InfoRow label="Designation" value={tmData.signatoryDesignation} />
                <InfoRow label="Contact Email" value={tmData.contactEmail} />
                <InfoRow label="Contact Mobile" value={tmData.contactMobile} />
                <InfoRow label="Correspondence Address" value={tmData.address} className="col-span-2" />
                {tmData.gstin && <InfoRow label="GSTIN" value={tmData.gstin} />}
                {tmData.notes && <InfoRow label="Additional Notes" value={tmData.notes} className="col-span-2" />}
              </div>
            </div>

            {/* Uploaded Documents */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Uploaded Document Files
              </h3>
              {docsToRender.length > 0 ? (
                <div className="space-y-2">
                  {docsToRender.map(({ label, doc }, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-semibold text-gray-800 truncate max-w-[200px]">
                          {label}
                        </span>
                        <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700">
                          {doc.name || "Uploaded"}
                        </span>
                      </div>
                      {doc.path && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => downloadDocFile(doc.path, "preview")}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Preview"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadDocFile(doc.path, "download")}
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
              ) : (
                <p className="text-xs text-gray-400 italic">No document files uploaded by client yet.</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Admin Documents */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Admin Documents
              </h3>
              <div className="space-y-4">
                {ADMIN_DOC_SLOTS.map((slot) => {
                  const doc = findAdminDoc(slot.id);
                  return (
                    <div key={slot.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <p className="text-xs font-semibold text-gray-700 mb-2">{slot.label}</p>

                      {doc ? (
                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-orange-700">Uploaded</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => downloadDocFile(doc.path, "preview")}
                                className="text-orange-600 hover:text-orange-700"
                                title="Preview"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadDocFile(doc.path, "download")}
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
                          onFileSelect={(file) => handleUploadAdminDoc(slot.id, file)}
                          renderTrigger={(openPicker) => (
                            <button
                              type="button"
                              onClick={openPicker}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#F46A45] px-3 py-1.5 text-xs font-medium text-[#F46A45] transition-colors hover:bg-orange-50 cursor-pointer"
                            >
                              <Upload size={14} />
                              Upload
                            </button>
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "tracker" && (
        <TrademarkAddonTrackerView appNo={appNo} orgId={tmData.org || ""} isPaid={tmData.isPaid ?? false} />
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
  value?: string | number | null | boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-gray-400 block text-xs font-medium">{label}</span>
      <span className="text-gray-800 font-semibold text-sm">{value ?? "-"}</span>
    </div>
  );
}
