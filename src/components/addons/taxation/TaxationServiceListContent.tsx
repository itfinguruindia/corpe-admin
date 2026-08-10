"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, RefreshCw, Eye, CheckCircle2, Clock } from "lucide-react";

import { clientsApi } from "@/lib/api/clients";

interface TaxationClientItem {
  _id: string;
  applicationNo: string;
  companyName?: string;
  companyType?: string;
  updatedAt: string;
  createdAt: string;
  admin?: { _id?: string; firstName?: string; lastName?: string; email?: string };
  entityType?: string;
  selectedSvcs?: string[];
  isFormSubmitted?: boolean;
  isPaid?: boolean;
  amountPaid?: number;
  status?: string;
  pricingDetails?: { total?: number };
}

const ENTITY_TYPE_NAMES: Record<string, string> = {
  individual: "Individual / Proprietor",
  llp: "LLP",
  company: "Company",
  opc: "OPC",
};

const SERVICE_NAMES: Record<string, string> = {
  gst: "GST Filing",
  itr: "Income Tax (ITR)",
  tds: "TDS Returns",
  advance: "Advance Tax",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  open: { label: "Not Started", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  draft: { label: "Draft", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  submitted: { label: "Submitted", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
  under_review: { label: "Under Review", className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" },
  completed: { label: "Completed", className: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" },
};

export default function TaxationServiceListContent({ addonId }: { addonId: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<TaxationClientItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showDiscontinuedOnly, setShowDiscontinuedOnly] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await clientsApi.getAddonServiceClients(
        addonId,
        page,
        10,
        search,
        showDiscontinuedOnly,
      );
      setClients(data.clients || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch Taxation clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [addonId, page, search, showDiscontinuedOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const paidCount = clients.filter((c) => c.isPaid).length;
  const pendingPaymentCount = clients.filter((c) => !c.isPaid).length;
  const submittedCount = clients.filter((c) => c.isFormSubmitted).length;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Total Enrolled</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Form Submitted</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{submittedCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Payment Completed</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{paidCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Payment Pending</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingPaymentCount}</p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-2 max-w-xl items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by app #, client name, email, PAN, GSTIN..."
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
        <button
          type="button"
          onClick={() => fetchClients()}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/40 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
        <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDiscontinuedOnly}
            onChange={(e) => {
              setShowDiscontinuedOnly(e.target.checked);
              setPage(1);
            }}
            className="w-3.5 h-3.5 text-rose-600 rounded focus:ring-rose-500 border-slate-300"
          />
          Show Discontinued
        </label>
      </form>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-500 text-sm">
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center p-12 text-slate-500">
            No clients found for Taxation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">App # / Client</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Filings</th>
                  <th className="p-4">Form Status</th>
                  <th className="p-4">Engagement Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {clients.map((item) => {
                  const clientName = `${item.admin?.firstName || ""} ${item.admin?.lastName || ""}`.trim() || "N/A";
                  const entityLabel = ENTITY_TYPE_NAMES[item.entityType || ""] || item.entityType || "-";
                  const filings = (item.selectedSvcs || [])
                    .map((s) => SERVICE_NAMES[s] || s)
                    .join(", ");
                  const totalAmt = item.pricingDetails?.total;
                  const statusCfg = STATUS_CONFIG[item.status || "open"] || STATUS_CONFIG.open;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <Link
                          href={`/clients/${item.applicationNo}`}
                          className="font-bold text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400"
                          title="View Client Details"
                        >
                          {item.applicationNo}
                        </Link>
                        <div className="text-xs text-slate-500">{clientName}</div>
                        <div className="text-xs text-slate-400">{item.admin?.email}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-slate-700 dark:text-slate-200">{item.companyName || "-"}</div>
                        <div className="text-xs text-slate-400 capitalize">{entityLabel}</div>
                      </td>

                      <td className="p-4">
                        {filings ? (
                          <div className="flex flex-col gap-0.5">
                            {item.selectedSvcs?.map((s) => (
                              <span key={s} className="text-xs text-slate-600 dark:text-slate-300">
                                {SERVICE_NAMES[s] || s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
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

                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </td>

                      <td className="p-4">
                        {item.isPaid ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                            {typeof totalAmt === "number" && totalAmt > 0 && (
                              <div className="text-xs text-slate-500 mt-1">₹{totalAmt.toLocaleString("en-IN")}</div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => router.push(`/addons/taxation/${item.applicationNo}`)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
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