"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { toast } from "@heroui/react";
import { Loader2, Download, Eye, Upload } from "lucide-react";

import { notifyApiError } from "@/utils/apiErrors";
import axiosInstance from "@/lib/axios";
import { clientsApi } from "@/lib/api/clients";
import { FileUploadComponent } from "@/components/upload";
import { DocumentIssueButton } from "@/components/clients/DocumentIssueModal";
import Modal from "@/components/ui/Modal";
import DocumentPreviewBody from "@/components/ui/DocumentPreviewBody";
import { createPreviewObjectUrlFromBlob } from "@/utils/documentPreview";

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
  { id: "tm-statement", label: "Statement" },
  { id: "tm-certificate", label: "Trademark Certificate" },
];

export default function TrademarkServiceContent({ appNo }: TrademarkServiceContentProps) {
  const [loading, setLoading] = useState(true);
  const [tmData, setTmData] = useState<any>(null);
  const [adminDocs, setAdminDocs] = useState<TrademarkDocEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "tracker">("details");
  const [miscTitleInput, setMiscTitleInput] = useState("");

  const [previewState, setPreviewState] = useState<{
    isOpen: boolean;
    url: string | null;
    fileName: string;
    loading: boolean;
  }>({
    isOpen: false,
    url: null,
    fileName: "",
    loading: false,
  });

  const closePreview = () => {
    if (previewState.url) {
      URL.revokeObjectURL(previewState.url);
    }
    setPreviewState({
      isOpen: false,
      url: null,
      fileName: "",
      loading: false,
    });
  };

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

  const handleUploadAdminDoc = async (slotId: string, file: File, title?: string) => {
    try {
      await clientsApi.uploadTrademarkAdminDoc(appNo, slotId, file, title);
      toast.success("Document uploaded successfully!");
      fetchTrademarkDetails();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to upload admin document." });
    }
  };

  const downloadDocFile = async (
    docId: string,
    mode: "preview" | "download" = "download",
    adminDocId?: string,
    filename?: string,
  ) => {
    try {
      const name = filename || docId;
      if (mode === "preview") {
        setPreviewState({
          isOpen: true,
          url: null,
          fileName: name,
          loading: true,
        });
      }
      const url = clientsApi.getTrademarkDocDownloadUrl(appNo, docId, adminDocId);
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const blob = response.data;
      if (mode === "preview") {
        const preview = createPreviewObjectUrlFromBlob(blob, name);
        setPreviewState({
          isOpen: true,
          url: preview.url,
          fileName: preview.fileName,
          loading: false,
        });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch {
      if (mode === "preview") {
        setPreviewState((prev) => ({ ...prev, loading: false }));
      }
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
    { docId: "logoDoc", label: "Logo Artwork", doc: tmData.logoDoc },
    { docId: "soundDoc", label: "Sound Recording", doc: tmData.soundDoc },
    { docId: "notationDoc", label: "Graphical Notation", doc: tmData.notationDoc },
    { docId: "shapeDoc", label: "Shape Images", doc: tmData.shapeDoc },
    { docId: "docBusinessPan", label: "Business PAN Card", doc: tmData.docBusinessPan },
    { docId: "docIncorpProof", label: "Certificate of Incorporation / Deed", doc: tmData.docIncorpProof },
    { docId: "docAddressProof", label: "Address Proof", doc: tmData.docAddressProof },
    { docId: "docSignatoryPan", label: "Signatory PAN Card", doc: tmData.docSignatoryPan },
    { docId: "docSignatoryAadhaar", label: "Signatory Aadhaar Card", doc: tmData.docSignatoryAadhaar },
    { docId: "docSignatoryPhoto", label: "Signatory Photograph", doc: tmData.docSignatoryPhoto },
    { docId: "docMsmeCert", label: "MSME / Udyam Certificate", doc: tmData.docMsmeCert },
    { docId: "docAffidavit", label: "User Affidavit", doc: tmData.docAffidavit },
    { docId: "docProofUse", label: "Proof of Commercial Use", doc: tmData.docProofUse },
    { docId: "docInvoiceProof", label: "Invoice Proof", doc: tmData.docInvoiceProof },
  ].filter((item) => item.doc && (item.doc.name || item.doc.path));

  const findAdminDoc = (slotId: string) => adminDocs.find((d) => d.id === slotId);

  return (
    <div className="flex flex-col gap-6 font-sans text-gray-800">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">Trademark Registration</h2>
          {!tmData.isPaid && (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
              Payment Pending
            </span>
          )}
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 ${
              activeTab === "details"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Form Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tracker")}
            className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 ${
              activeTab === "tracker"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Tracking Progress
          </button>
        </div>
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
                {tmData.markType === "colour" && tmData.colourSwatch && (
                  <InfoRow
                    label="Claimed Colour"
                    value={
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block w-4 h-4 rounded-md border border-gray-200"
                          style={{ background: tmData.colourSwatch }}
                        />
                        {tmData.colourSwatch}
                      </span>
                    }
                  />
                )}
                {tmData.markType === "colour" && tmData.colourMarkDesc && (
                  <InfoRow label="Colour Mark Description" value={tmData.colourMarkDesc} className="col-span-2" />
                )}
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
                  {docsToRender.map(({ docId, label, doc }, i) => (
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
                      <div className="flex items-center gap-1.5 shrink-0">
                        {doc.path && (
                          <>
                            <button
                              type="button"
                              onClick={() => downloadDocFile(docId, "preview")}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="Preview"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadDocFile(docId, "download", undefined, doc.name)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="Download"
                            >
                              <Download size={14} />
                            </button>
                          </>
                        )}
                        <DocumentIssueButton
                          applicationNo={appNo}
                          target={{
                            entityType: "trademark",
                            entityId: "trademark",
                            entityLabel: "Trademark Registration",
                            fieldKey: docId,
                            documentLabel: label,
                            clientRoute: "add-ons/trademark-registration",
                          }}
                          className="inline-flex items-center text-primary hover:text-secondary p-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No document files uploaded by client yet.</p>
              )}
            </div>

            {/* Miscellaneous Client Documents */}
            {Array.isArray(tmData.miscDocs) && tmData.miscDocs.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Miscellaneous Client Documents
                </h3>
                <div className="space-y-2">
                  {tmData.miscDocs.map((doc: any, idx: number) =>
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
                            onClick={() => downloadDocFile(`misc-${idx}`, "preview", `misc-${idx}`)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Preview"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadDocFile(`misc-${idx}`, "download", `misc-${idx}`, doc.name)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                          <DocumentIssueButton
                            applicationNo={appNo}
                            target={{
                              entityType: "trademark",
                              entityId: "misc",
                              entityLabel: "Trademark Miscellaneous Document",
                              fieldKey: `misc-${idx}`,
                              documentLabel: doc?.docType || doc?.name || `Miscellaneous Document ${idx + 1}`,
                              clientRoute: "add-ons/trademark-registration",
                            }}
                            className="inline-flex items-center text-primary hover:text-secondary p-1"
                          />
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
                                onClick={() => downloadDocFile(doc.id, "preview", slot.id)}
                                className="text-orange-600 hover:text-orange-700"
                                title="Preview"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadDocFile(doc.id, "download", slot.id, doc.name)}
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
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-primary"
                />

                <FileUploadComponent
                  onFileSelect={(file) => handleUploadAdminDoc(`misc-${Date.now()}`, file, miscTitleInput)}
                  renderTrigger={(openPicker) => (
                    <button
                      type="button"
                      onClick={openPicker}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Upload size={14} />
                      Upload Miscellaneous Document
                    </button>
                  )}
                />
              </div>

              {adminDocs.filter((d) => d.id?.startsWith("misc-")).length > 0 && (
                <div className="pt-2 space-y-2 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Uploaded Misc Documents
                  </span>
                  {adminDocs
                    .filter((d) => d.id?.startsWith("misc-"))
                    .map((doc, idx) => (
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
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => downloadDocFile(doc.id, "preview", doc.id)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Preview"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadDocFile(doc.id, "download", doc.id, doc.name)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "tracker" && (
        <TrademarkAddonTrackerView appNo={appNo} orgId={tmData.org || ""} isPaid={tmData.isPaid ?? false} />
      )}

      <Modal
        isOpen={previewState.isOpen}
        onClose={closePreview}
        title={previewState.fileName ? `Document Preview: ${previewState.fileName}` : "Document Preview"}
        maxWidth="md:max-w-[90vw]"
      >
        <DocumentPreviewBody
          url={previewState.url}
          fileName={previewState.fileName}
          loading={previewState.loading}
        />
      </Modal>
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
