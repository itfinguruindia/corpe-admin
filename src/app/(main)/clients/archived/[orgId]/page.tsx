"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Archive,
  Calendar,
  User,
  Info,
  Building2,
  Users,
  FileText,
  CreditCard,
  AlertTriangle,
  Download,
  ShieldAlert,
} from "lucide-react";
import { Spinner } from "@heroui/react";

import { clientsApi } from "@/lib/api";

type TabKey = "overview" | "names" | "members" | "docs" | "pricing" | "roc";

export default function ArchivedClientDetailPage() {
  const { orgId } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  useEffect(() => {
    if (!orgId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await clientsApi.getArchivedClientDetails(String(orgId));
        setData(result);
      } catch (err) {
        console.error("Error fetching archived client details:", err);
        setError("Failed to load archived details. It may not exist.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [orgId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner size="lg" />
        <span className="text-sm font-semibold text-gray-500">Loading archived snapshot...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <ShieldAlert className="size-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Details</h2>
        <p className="text-gray-500 mb-6">{error || "Archived application data could not be found."}</p>
        <button
          onClick={() => router.push("/clients/archived")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Back to Archived Applications
        </button>
      </div>
    );
  }

  const { snapshot, applicationNo, companyType, archivedAt, archivedBy, archiveReason, adminId } = data;
  const org = snapshot?.organisation || {};
  const nameApp = snapshot?.nameApplication || {};
  const corpStructure = snapshot?.corporateStructure || {};
  const directorDetail = snapshot?.directorDetail || {};
  const corpDocs = snapshot?.corporateDocuments || {};
  const payments = snapshot?.payments || [];
  const rocQuery = snapshot?.rocQuery || null;

  // Group directors and shareholders from details and corporate structure
  const directorsList = directorDetail?.directors || corpStructure?.directors || [];
  const shareholdersList = directorDetail?.shareholders || corpStructure?.shareholders || [];

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: Info },
    { key: "names", label: "Name Proposals", icon: Building2 },
    { key: "members", label: "Directors & Shareholders", icon: Users },
    { key: "docs", label: "Documents", icon: FileText },
    { key: "pricing", label: "Pricing & Payments", icon: CreditCard },
    { key: "roc", label: "ROC Queries", icon: AlertTriangle },
  ];

  // Helper to render uploaded document link
  const renderDocLink = (doc: any, label: string) => {
    if (!doc || (!doc.path && !doc.url)) return null;
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-150">
        <div>
          <span className="text-sm font-semibold text-gray-800 block">{label}</span>
          <span className="text-xs text-gray-500 block truncate max-w-xs">{doc.name || doc.path}</span>
        </div>
        {doc.url ? (
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-white border border-gray-250 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="size-3" />
            Download
          </a>
        ) : (
          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">No URL</span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Top navigation */}
      <button
        onClick={() => router.push("/clients/archived")}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Archived List
      </button>

      {/* Warning snapshot banner */}
      <div className="mb-6 p-4 bg-orange-50/60 border border-orange-200/80 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="size-5 text-orange-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-orange-950">Archived Application Snapshot (Read-Only)</h4>
          <p className="text-xs text-orange-900 mt-1">
            This is a locked, point-in-time snapshot taken when the organization was archived. 
            All details displayed below are read-only and reflect database state at archiving.
          </p>
        </div>
      </div>

      {/* Header section with metadata */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gray-100 text-gray-700 rounded-xl">
                <Archive className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{applicationNo || "No App No."}</h1>
                <p className="text-sm text-gray-500 font-medium">{companyType || "Company Type Unspecified"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="size-4 text-gray-400" />
                <span>
                  <strong>Archived:</strong>{" "}
                  {new Date(archivedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="size-4 text-gray-400" />
                <span>
                  <strong>By Admin:</strong> {archivedBy?.name || "System"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="size-4 text-gray-400" />
                <span>
                  <strong>Client Owner:</strong>{" "}
                  {adminId ? `${adminId.firstName} ${adminId.lastName}` : "Unknown"}
                </span>
              </div>
            </div>
          </div>

          <div className="md:max-w-sm flex-1 p-4 bg-gray-50 border border-gray-150 rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Reason for Archiving</h3>
            <p className="text-sm text-gray-700 italic">"{archiveReason || "No explanation provided"}"</p>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex flex-wrap -mb-px gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-semibold text-sm inline-flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content panel */}
      <div className="space-y-6">
        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Application Profile</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company Status</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      {org?.companyStatus || "Archived"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registration State</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{org?.registrationState || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resident Country</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{org?.residentCountry || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Original App No.</dt>
                  <dd className="mt-1 text-sm font-mono font-semibold text-gray-900">{org?.applicationNo || "N/A"}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Registered Office Details</h2>
              {corpStructure?.registeredOffice ? (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Locality</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">{corpStructure.registeredOffice.locality || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">District</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">{corpStructure.registeredOffice.district || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">State</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">{corpStructure.registeredOffice.state || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pincode</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">{corpStructure.registeredOffice.pincode || "N/A"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Police Station Jurisdiction</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">{corpStructure.registeredOffice.policeStationJurisdiction || "N/A"}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-gray-500 italic">No registered office details found in snapshot.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB: NAMES */}
        {activeTab === "names" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2">Proposed Names</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {[nameApp?.companyName1, nameApp?.companyName2, nameApp?.companyName3].map((compName, idx) => {
                  if (!compName) return null;
                  return (
                    <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded-full mb-3 inline-block">
                          Option {idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-gray-900 mb-1">{compName.name || "Unspecified"}</h3>
                        <p className="text-xs text-gray-500 mb-4">{compName.fullName || ""}</p>
                      </div>
                      <div className="space-y-2.5 pt-3 border-t border-gray-200/80 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-semibold">MCA Approval:</span>
                          <span className="font-bold text-gray-700">{compName.mcaApproval || "Pending"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-semibold">Trade Conflict:</span>
                          <span className="font-bold text-gray-700">{compName.tradeConflict || "Pending"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-semibold">Status:</span>
                          <span className={`font-bold ${compName.isApproved ? "text-green-600" : "text-gray-600"}`}>
                            {compName.isApproved ? "Approved" : "Not Approved"}
                          </span>
                        </div>
                        {compName.comment && (
                          <div className="pt-2 border-t border-dashed border-gray-200">
                            <span className="text-gray-400 font-semibold block mb-0.5">Comment:</span>
                            <span className="text-gray-600 italic">"{compName.comment}"</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2">Business brief</h2>
              <p className="text-sm text-gray-750 whitespace-pre-line mt-3">
                {nameApp?.businessBrief || "No business brief provided."}
              </p>
            </div>
          </div>
        )}

        {/* TAB: MEMBERS */}
        {activeTab === "members" && (
          <div className="space-y-6">
            {/* Directors Section */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Directors</h2>
              {directorsList.length > 0 ? (
                <div className="space-y-6">
                  {directorsList.map((dir: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <h3 className="text-base font-bold text-gray-900">{dir.name || "Director Detail"}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary-50 text-primary-700">
                          {dir.hasDIN ? `DIN: ${dir.dinNumber || "N/A"}` : "No DIN"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs mt-4">
                        <div>
                          <span className="text-gray-400 font-semibold block uppercase">PAN / PAN Card No</span>
                          <span className="text-gray-900 font-semibold text-sm">{dir.panNumber || dir.panCard || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block uppercase">Email</span>
                          <span className="text-gray-900 font-semibold text-sm">{dir.emailAddress || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block uppercase">Phone Number</span>
                          <span className="text-gray-900 font-semibold text-sm">{dir.phoneNumber || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block uppercase">Nationality</span>
                          <span className="text-gray-900 font-semibold text-sm">{dir.nationality || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block uppercase">Proposed Shareholding</span>
                          <span className="text-gray-900 font-semibold text-sm">
                            {dir.proposedShareholdingPercentage || "N/A"}% ({dir.proposedNumberOfShares || "N/A"} shares)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block uppercase">Place of Birth</span>
                          <span className="text-gray-900 font-semibold text-sm">
                            {dir.placeOfBirth?.city || "N/A"}, {dir.placeOfBirth?.country || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Display files uploaded for director */}
                      {dir.presentAddressProof && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">Director Attachments</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {renderDocLink({ path: dir.presentAddressProof, url: dir.presentAddressProofUrl || dir.presentAddressProof }, "Address Proof")}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No directors found in snapshot.</p>
              )}
            </div>

            {/* Shareholders Section */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Shareholders</h2>
              {shareholdersList.length > 0 ? (
                <div className="space-y-6">
                  {shareholdersList.map((sh: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                      <h3 className="text-base font-bold text-gray-900 mb-3">{sh.name || "Shareholder Detail"}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs mt-4">
                        <div>
                          <span className="text-gray-400 font-semibold block uppercase">PAN / PAN Card No</span>
                          <span className="text-gray-900 font-semibold text-sm">{sh.panNumber || sh.panCard || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block uppercase">Email</span>
                          <span className="text-gray-900 font-semibold text-sm">{sh.emailAddress || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block uppercase">Phone Number</span>
                          <span className="text-gray-900 font-semibold text-sm">{sh.phoneNumber || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block uppercase">Proposed Shareholding</span>
                          <span className="text-gray-900 font-semibold text-sm">
                            {sh.proposedShareholdingPercentage || "N/A"}% ({sh.proposedNumberOfShares || "N/A"} shares)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block uppercase">Number of Shares Held</span>
                          <span className="text-gray-900 font-semibold text-sm">{sh.numberOfSharesHeld || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No shareholders found in snapshot.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB: DOCUMENTS */}
        {activeTab === "docs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">MOA & AOA Documents</h2>
              <div className="space-y-4">
                {renderDocLink(corpDocs?.moa, "Memorandum of Association (MOA)") || (
                  <p className="text-sm text-gray-500 italic">No MOA document found in snapshot.</p>
                )}
                {renderDocLink(corpDocs?.aoa, "Articles of Association (AOA)") || (
                  <p className="text-sm text-gray-500 italic">No AOA document found in snapshot.</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Corporate & Partner Attachments</h2>
              <div className="space-y-4">
                {corpDocs?.companyDocuments ? (
                  <div className="space-y-3">
                    {renderDocLink(corpDocs.companyDocuments.photo, "Company Photo")}
                    {renderDocLink(corpDocs.companyDocuments.signature, "Authorized Signature")}
                    {renderDocLink(corpDocs.companyDocuments.consentToAct, "Consent to Act")}
                    {renderDocLink(corpDocs.companyDocuments.miscellaneous1, "Miscellaneous Doc 1")}
                    {renderDocLink(corpDocs.companyDocuments.miscellaneous2, "Miscellaneous Doc 2")}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No miscellaneous corporate attachments found.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PRICING */}
        {activeTab === "pricing" && (() => {
          const totalPaidInclGst = payments
            .filter((p: any) => p.status === "captured" || p.status === "paid" || p.isVerified)
            .reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0);

          return (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Pricing Snapshot</h2>
                {org?.pricingSnapshot ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <div className="p-4 bg-gray-55/60 rounded-xl">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Plan Name</span>
                      <span className="text-lg font-bold text-gray-900 mt-1 block">{org.pricingSnapshot.planName || "Standard Plan"}</span>
                    </div>
                    <div className="p-4 bg-gray-55/60 rounded-xl">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Original Price</span>
                      <span className="text-lg font-bold text-gray-900 mt-1 block">
                        {org.pricingSnapshot.currency === "USD" ? "$" : "₹"}
                        {org.pricingSnapshot.originalPrice ?? 0}
                      </span>
                    </div>
                    <div className="p-4 bg-gray-55/60 rounded-xl">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Discount</span>
                      <span className="text-lg font-bold text-green-600 mt-1 block">
                        -{org.pricingSnapshot.currency === "USD" ? "$" : "₹"}
                        {org.pricingSnapshot.discountAmount ?? 0}
                      </span>
                    </div>
                    <div className="p-4 bg-gray-55/60 rounded-xl">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Final Base Price</span>
                      <span className="text-lg font-bold text-gray-900 mt-1 block">
                        {org.pricingSnapshot.currency === "USD" ? "$" : "₹"}
                        {org.pricingSnapshot.finalPrice ?? 0}
                      </span>
                    </div>
                    <div className="p-4 bg-gray-55/60 rounded-xl">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Paid (Incl. GST)</span>
                      <span className="text-lg font-bold text-primary mt-1 block">
                        {org.pricingSnapshot.currency === "USD" ? "$" : "₹"}
                        {totalPaidInclGst}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No pricing snapshot available in database records.</p>
                )}
              </div>

              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Payment Transaction History</h2>
                {payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-bold">
                          <th className="px-4 py-3">Stage No.</th>
                          <th className="px-4 py-3">Order ID / Txn ID</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Transaction Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {payments.map((p: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-semibold text-gray-900">Stage {p.stageNumber || 1}</td>
                            <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.orderId || p.transactionId || "N/A"}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {p.currency === "USD" ? "$" : "₹"}{p.amount ?? 0}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  p.status === "captured" || p.status === "paid" || p.isVerified
                                    ? "bg-green-150 text-green-800"
                                    : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {p.status || "Paid"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {p.createdAt
                                ? new Date(p.createdAt).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No historical payment records found in snapshot.</p>
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB: ROC QUERIES */}
        {activeTab === "roc" && (
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">ROC Rejection / Query Logs</h2>
            {rocQuery ? (
              <div className="space-y-6">
                <div className="p-4 bg-red-50/40 border border-red-200 rounded-2xl">
                  <h3 className="text-sm font-bold text-red-950 flex items-center gap-2">
                    <ShieldAlert className="size-4 text-red-600" />
                    ROC Query Status: {rocQuery.status?.toUpperCase() || "REJECTED"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs text-red-900">
                    <div>
                      <strong>Round:</strong> {rocQuery.roundNumber || 1}
                    </div>
                    <div>
                      <strong>Rejection Category:</strong> {rocQuery.rejectionCategory || "N/A"}
                    </div>
                    <div>
                      <strong>Raised Date:</strong>{" "}
                      {rocQuery.queryRaisedAt ? new Date(rocQuery.queryRaisedAt).toLocaleDateString("en-IN") : "N/A"}
                    </div>
                  </div>
                  {rocQuery.queryText && (
                    <div className="mt-4 pt-3 border-t border-red-200/50 text-sm">
                      <strong>ROC Query Text:</strong>
                      <p className="mt-1 text-red-950 bg-white/60 p-3 rounded-lg border border-red-100">{rocQuery.queryText}</p>
                    </div>
                  )}
                  {rocQuery.rejectionReason && (
                    <div className="mt-4 pt-3 border-t border-red-200/50 text-sm">
                      <strong>Rejection Reason:</strong>
                      <p className="mt-1 text-red-950 bg-white/60 p-3 rounded-lg border border-red-100">{rocQuery.rejectionReason}</p>
                    </div>
                  )}
                  {rocQuery.rejectNote && (
                    <div className="mt-4 pt-3 border-t border-red-200/50 text-sm">
                      <strong>Rejection Note:</strong>
                      <p className="mt-1 text-red-950 bg-white/60 p-3 rounded-lg border border-red-100">{rocQuery.rejectNote}</p>
                    </div>
                  )}
                </div>

                {rocQuery.activityLog && rocQuery.activityLog.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">ROC Activity timeline</h4>
                    <div className="relative border-l border-gray-200 ml-3 pl-4 space-y-4">
                      {rocQuery.activityLog.map((log: any, logIdx: number) => (
                        <div key={logIdx} className="relative text-sm">
                          <div className="absolute left-[-21.5px] top-1 bg-white p-0.5 rounded-full border border-gray-300">
                            <div className="size-2 bg-gray-400 rounded-full" />
                          </div>
                          <span className="text-xs text-gray-400 font-semibold">
                            {new Date(log.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="mx-2 text-xs font-bold text-gray-500 uppercase">[{log.actor}]</span>
                          <p className="text-gray-700 font-medium mt-0.5">{log.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No historical ROC query details found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
