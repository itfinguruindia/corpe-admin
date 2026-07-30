"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@heroui/react";
import { Loader2, Download, FileText, CheckCircle2, AlertCircle } from "lucide-react";

import { clientsApi } from "@/lib/api/clients";
import axiosInstance from "@/lib/axios";
import TrademarkAddonTrackerView from "./TrademarkAddonTrackerView";

interface TrademarkServiceContentProps {
  appNo: string;
}

export default function TrademarkServiceContent({ appNo }: TrademarkServiceContentProps) {
  const [loading, setLoading] = useState(true);
  const [tmData, setTmData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"details" | "tracker">("details");

  const fetchTrademarkDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/admin/clients/trademark-registration/${appNo}`);
      const data = res.data?.data || res.data;
      setTmData(data);
    } catch (error) {
      console.error("Failed to fetch trademark details:", error);
      toast.error("Failed to load trademark details");
    } font-medium {
      setLoading(false);
    }
  }, [appNo]);

  useEffect(() => {
    if (appNo) {
      fetchTrademarkDetails();
    }
  }, [appNo, fetchTrademarkDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
        <span>Loading Trademark details...</span>
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
  ].filter((item) => item.doc && item.doc.name);

  return (
    <div className="space-y-6">
      {/* Top Tab Controls */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "details"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Application &amp; Documents
        </button>
        <button
          onClick={() => setActiveTab("tracker")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "tracker"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Tracker &amp; Progress
        </button>
      </div>

      {activeTab === "details" && (
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mark Type</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 capitalize">
                  {tmData.markType || "Wordmark"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Usage Status</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">
                  {tmData.usageStatus === "inuse" ? `In Use since ${tmData.useDate || "N/A"}` : "Proposed to be Used"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Structure &amp; MSME</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">
                  {tmData.businessStructure || "Company"} ({tmData.isMsme === "yes" ? "MSME" : "Non-MSME"})
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment</span>
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                  tmData.isPaid ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800"
                }`}>
                  {tmData.isPaid ? `Paid ₹${(tmData.amountPaid || 0).toLocaleString("en-IN")}` : "Unpaid"}
                </span>
              </div>
            </div>

            {/* Wordmark & Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {tmData.wordmark && (
                <div>
                  <span className="font-bold text-slate-500 block">Wordmark Text</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-base">{tmData.wordmark}</span>
                </div>
              )}
              {tmData.isNonEnglish === "yes" && (
                <div>
                  <span className="font-bold text-slate-500 block">English Translation / Transliteration</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Translation: {tmData.translation || "N/A"} | Transliteration: {tmData.transliteration || "N/A"}
                  </span>
                </div>
              )}
              {tmData.selectedClasses && tmData.selectedClasses.length > 0 && (
                <div className="md:col-span-2">
                  <span className="font-bold text-slate-500 block mb-1">Selected Classes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {tmData.selectedClasses.map((c: number) => (
                      <span key={c} className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-bold text-xs">
                        Class {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Class Specifications */}
          {tmData.classSpecs && Object.keys(tmData.classSpecs).length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Goods &amp; Services Specifications
              </h3>
              <div className="space-y-2 text-xs">
                {Object.entries(tmData.classSpecs).map(([cls, spec]) => (
                  <div key={cls} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-blue-600 dark:text-blue-400 block mb-0.5">Class {cls}</span>
                    <span className="text-slate-700 dark:text-slate-300">{String(spec)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatory & Contact Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Signatory &amp; Correspondence Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 block">Signatory Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{tmData.signatoryName || "N/A"}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Designation</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{tmData.signatoryDesignation || "N/A"}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Contact Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{tmData.contactEmail || "N/A"}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Contact Mobile</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{tmData.contactMobile || "N/A"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-bold text-slate-500 block">Correspondence Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{tmData.address || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Uploaded Documents */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Uploaded Document Files
            </h3>
            {docsToRender.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {docsToRender.map(({ label, doc }, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{label}</span>
                      <span className="text-[11px] text-slate-500 truncate block max-w-xs">{doc.name}</span>
                    </div>
                    {doc.path && (
                      <a
                        href={doc.path}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No document files uploaded yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "tracker" && (
        <TrademarkAddonTrackerView appNo={appNo} orgId={tmData.org || ""} isPaid={tmData.isPaid ?? false} />
      )}
    </div>
  );
}
