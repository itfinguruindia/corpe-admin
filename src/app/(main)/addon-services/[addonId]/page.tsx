"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw, Layers, ExternalLink } from "lucide-react";
import { clientsApi } from "@/lib/api/clients";

const ADDON_NAMES: Record<string, string> = {
  "gst-registration": "GST Registration"
};

interface AddonClientItem {
  _id: string;
  applicationNo: string;
  companyName?: string;
  registrationType: "full_incorporation" | "addon_only";
  companyType: string;
  companyStatus: string;
  updatedAt: string;
  createdAt: string;
  admin?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
  gstDetails?: {
    legalName?: string;
    tradeName?: string;
  };
  isFormSubmitted?: boolean;
  isPaid?: boolean;
  arn?: string;
  gstStatus?: string;
  trackerProgress?: number;
  currentStageIndex?: number;
}

export default function AddonServiceClientsPage({
  params,
}: {
  params: Promise<{ addonId: string }>;
}) {
  const resolvedParams = use(params);
  const addonId = resolvedParams.addonId;
  const serviceTitle = ADDON_NAMES[addonId];
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<AddonClientItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await clientsApi.getAddonServiceClients(addonId, page, 10, search);
      setClients(data.clients || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch addon service clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [addonId, page, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  if (!serviceTitle) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        <p className="text-center text-slate-500">Invalid Add-on</p>
      </div>
    );
  }

  // Metric stats
  const standaloneCount = clients.filter((c) => c.registrationType === "addon_only").length;
  const incCount = clients.filter((c) => c.registrationType !== "addon_only").length;
  const submittedCount = clients.filter((c) => c.isFormSubmitted).length;

  return (
    <div className="w-full p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" /> {serviceTitle} Clients
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View and manage all clients enrolled in {serviceTitle} (both standalone & incorporated).
          </p>
        </div>

        <button
          onClick={() => fetchClients()}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/40 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Total Enrolled</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Add-on Direct Users</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{standaloneCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">CorpE Inc. Users</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{incCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Form Submitted</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{submittedCount}</p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by app #, client name, email, legal name, or ARN..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-500 text-sm">
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center p-12 text-slate-500">
            No clients found for {serviceTitle}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">App # / Client</th>
                  <th className="p-4">Legal / Trade Name</th>
                  <th className="p-4">Registration Origin</th>
                  <th className="p-4">GST Form Status</th>
                  <th className="p-4">ARN</th>
                  <th className="p-4">Tracker Progress</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {clients.map((item) => {
                  const clientName = `${item.admin?.firstName || ""} ${item.admin?.lastName || ""}`.trim() || "N/A";
                  const isStandalone = item.registrationType === "addon_only";
                  const companyName = item.companyName || item.gstDetails?.legalName || item.gstDetails?.tradeName || item.companyType;
                  const progress = item.trackerProgress || 0;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{item.applicationNo}</div>
                        <div className="text-xs text-slate-500">{clientName}</div>
                        <div className="text-xs text-slate-400">{item.admin?.email}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-slate-700 dark:text-slate-200">{companyName}</div>
                        <div className="text-xs text-slate-400 capitalize">{item.companyType}</div>
                      </td>

                      <td className="p-4">
                        {isStandalone ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Add-on Direct
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                            CorpE Incorporation
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.isFormSubmitted
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isFormSubmitted ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {item.isFormSubmitted ? "Submitted" : "Form Pending"}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {item.arn || "—"}
                      </td>

                      <td className="p-4 w-44">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                progress === 100 ? "bg-emerald-500" : "bg-blue-600"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => router.push(`/clients/${item.applicationNo}?tab=addon-services`)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                        >
                          Workspace <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
