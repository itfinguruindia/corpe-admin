"use client";

import React, { useEffect, useState } from "react";
import { Search, RefreshCw, Eye, X, Award, CheckCircle2, Clock } from "lucide-react";

import { clientsApi } from "@/lib/api/clients";
import { RegistrationType } from "@/types/enums";
import TrademarkServiceContent from "./TrademarkServiceContent";

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
  amountPaid?: number;
  status?: string;
}

export default function TrademarkServiceListContent({ addonId }: { addonId: string }) {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<TrademarkClientItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [selectedAppNo, setSelectedAppNo] = useState<string | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await clientsApi.getAddonServiceClients(addonId, page, 10, search);
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
  }, [addonId, page, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by company, application #, or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </form>

        <button
          onClick={fetchClients}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Clients Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Client / Business</th>
                <th className="px-4 py-3.5">App #</th>
                <th className="px-4 py-3.5">Mark Type &amp; Wordmark</th>
                <th className="px-4 py-3.5">Classes</th>
                <th className="px-4 py-3.5">Structure &amp; MSME</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    Loading Trademark clients...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No enrolled clients found.
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
                  const tm = client.trademarkDetails || {};
                  const isPaid = client.isPaid ?? false;

                  return (
                    <tr key={client._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">
                        {client.companyName || "Unnamed Business"}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {client.admin?.email || client.admin?.phoneNumber || ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">
                        #{client.applicationNo}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold capitalize text-slate-800 dark:text-slate-200 block">
                          {tm.markType || "Wordmark"}
                        </span>
                        {tm.wordmark && (
                          <span className="text-[11px] text-slate-500 font-medium truncate block max-w-xs">
                            "{tm.wordmark}"
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {tm.selectedClasses && tm.selectedClasses.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {tm.selectedClasses.map((c) => (
                              <span key={c} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                Class {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 capitalize">
                        {tm.businessStructure || "Company"} ({tm.isMsme === "yes" ? "MSME" : "Non-MSME"})
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}>
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedAppNo(client.applicationNo)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500">Showing page {page} of {totalPages} ({total} total clients)</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Client Details Drawer / Modal */}
      {selectedAppNo && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 h-full shadow-2xl overflow-y-auto p-6 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" /> Trademark Application Details
                </h2>
                <p className="text-xs text-slate-500">Application #{selectedAppNo}</p>
              </div>
              <button
                onClick={() => setSelectedAppNo(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TrademarkServiceContent appNo={selectedAppNo} />
          </div>
        </div>
      )}
    </div>
  );
}
