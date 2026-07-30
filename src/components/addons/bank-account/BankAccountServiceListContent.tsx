"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, RefreshCw, Eye, Building2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

import { clientsApi } from "@/lib/api/clients";

import { RegistrationType } from "@/types/enums";

interface BankAccountClientItem {
  _id: string;
  applicationNo: string;
  companyName?: string;
  registrationType: RegistrationType;
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
  bankId?: string;
  isPaid?: boolean;
  hasGstBundle?: boolean;
  accountDetails?: {
    accountType?: string;
    branch?: string;
    existingCustomer?: string;
    funding?: string;
    notes?: string;
  };
  trackerProgress?: number;
  currentStageIndex?: number;
}

const BANK_LABELS: Record<string, string> = {
  icici: "ICICI Bank",
  hdfc: "HDFC Bank",
  axis: "Axis Bank",
  kotak: "Kotak Mahindra Bank",
  citi: "Citibank (Institutional)",
  razorpayx: "RazorpayX",
};

export default function BankAccountServiceListContent({ addonId }: { addonId: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<BankAccountClientItem[]>([]);
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
      console.error("Failed to fetch bank account clients:", error);
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

  const paidCount = clients.filter((c) => c.isPaid).length;
  const pendingPaymentCount = clients.filter((c) => !c.isPaid).length;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Total Enrolled</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Payment Completed</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{paidCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Payment Pending</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingPaymentCount}</p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by app #, client name, email..."
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
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/40 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
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
            No clients found for Bank Account Setup.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">App # / Client</th>
                  <th className="p-4">Bank Selected</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Account Type / Branch</th>
                  <th className="p-4">Tracker Progress</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {clients.map((item) => {
                  const clientName = `${item.admin?.firstName || ""} ${item.admin?.lastName || ""}`.trim() || "N/A";
                  const progress = item.trackerProgress || 0;

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
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {BANK_LABELS[item.bankId || ""] || item.bankId || ""}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        {item.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-slate-700 dark:text-slate-200">
                          {item.accountDetails?.accountType || ""}
                        </div>
                        <div className="text-xs text-slate-400">{item.accountDetails?.branch || ""}</div>
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
                          onClick={() => router.push(`/addons/bank-account/${item.applicationNo}`)}
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
