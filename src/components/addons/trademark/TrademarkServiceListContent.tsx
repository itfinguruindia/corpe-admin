"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, RefreshCw, Eye, CheckCircle2, Clock } from "lucide-react";

import { clientsApi } from "@/lib/api/clients";
import { RegistrationType } from "@/types/enums";

interface TrademarkClientItem {
  _id: string;
  applicationNo: string;
  companyName?: string;
  registrationType: RegistrationType;
  companyType?: string;
  companyStatus?: string;
  updatedAt: string;
  createdAt: string;
  admin?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
  trademarkDetails?: {
    markType?: string;
    wordmark?: string;
    selectedClasses?: number[];
    businessStructure?: string;
    isMsme?: string;
  };
  isPaid?: boolean;
  isFormSubmitted?: boolean;
  amountPaid?: number;
  status?: string;
  trackerProgress?: number;
}

export default function TrademarkServiceListContent({ addonId }: { addonId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<TrademarkClientItem[]>([]);
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
      console.error("Failed to fetch Trademark clients:", error);
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

  const standaloneCount = clients.filter((c) => c.registrationType === RegistrationType.ADDON_ONLY).length;
  const incCount = clients.filter((c) => c.registrationType !== RegistrationType.ADDON_ONLY).length;
  const paidCount = clients.filter((c) => c.isPaid).length;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase text-slate-500">Total Enrolled</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase text-slate-500">Add-on Direct Users</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{standaloneCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase text-slate-500">CorpE Inc. Users</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{incCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase text-slate-500">Payment Completed</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{paidCount}</p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-2 max-w-xl items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by app #, client name, email, or wordmark..."
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
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-500 text-sm">
            Loading Trademark clients...
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center p-12 text-slate-500">
            No clients found for Trademark Registration.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">App # / Client</th>
                  <th className="p-4">Mark Type &amp; Wordmark</th>
                  <th className="p-4">Registration Origin</th>
                  <th className="p-4">Classes &amp; Structure</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Tracker Progress</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {clients.map((item) => {
                  const clientName = `${item.admin?.firstName || ""} ${item.admin?.lastName || ""}`.trim() || "N/A";
                  const isStandalone = item.registrationType === RegistrationType.ADDON_ONLY;
                  const tm = item.trademarkDetails || {};
                  const isPaid = item.isPaid ?? false;
                  const progress = item.trackerProgress || (isPaid ? 40 : 10);

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <Link
                          href={`/clients/${item.applicationNo}`}
                          className="font-bold text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400"
                          title="View Client Details"
                        >
                          #{item.applicationNo}
                        </Link>
                        <div className="text-xs text-slate-500 font-medium">{item.companyName || clientName}</div>
                        <div className="text-xs text-slate-400">{item.admin?.email}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold capitalize text-slate-800 dark:text-slate-200">
                          {tm.markType || "Wordmark"}
                        </div>
                        {tm.wordmark && (
                          <div className="text-xs text-slate-500 font-medium truncate max-w-xs">
                            &quot;{tm.wordmark}&quot;
                          </div>
                        )}
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
                        <div className="flex flex-wrap gap-1 mb-1">
                          {tm.selectedClasses && tm.selectedClasses.length > 0 ? (
                            tm.selectedClasses.map((c) => (
                              <span key={c} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                Class {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs italic">No class selected</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 capitalize">
                          {tm.businessStructure || "Company"} {tm.isMsme === "yes" ? "(MSME)" : ""}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </td>

                      <td className="p-4 w-44">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${progress === 100 ? "bg-emerald-500" : "bg-blue-600"}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => router.push(`/addons/trademark/${item.applicationNo}`)}
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
