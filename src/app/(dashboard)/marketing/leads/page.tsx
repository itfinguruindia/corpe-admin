"use client";

import { Trash2, Search, RefreshCw, FileDown } from "lucide-react";
import * as XLSX from "xlsx";

import { useEffect, useState } from "react";
import { marketingApi, Lead } from "@/lib/api/marketing";
import Pagination from "@/components/ui/Pagination";
import useSwal from "@/utils/useSwal";
import { useDebouncedCallback } from "@/utils/helpers";

export default function LeadsPage() {
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const itemsPerPage = 10;
  const swal = useSwal();
  const [countries, setCountries] = useState<string[]>([]);

  // Debounced search handler
  const handleSearch = useDebouncedCallback((page: number) => {
    fetchLeads(page);
  }, 300);

  const fetchLeads = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketingApi.getAllLeads(
        page,
        itemsPerPage,
        search || undefined,
        country || undefined,
      );
      setLeadsData(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads. Please try again later.");
      setLeadsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLeads(1);
  }, []);

  // Fetch leads when search or country filters change
  useEffect(() => {
    handleSearch(1);
  }, [search, country]);

  const handleDelete = async (id: string) => {
    const result = await swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await marketingApi.deleteLead(id);
        await swal({
          title: "Deleted!",
          text: "Lead has been deleted.",
          icon: "success",
        });
        fetchLeads(currentPage);
      } catch (err) {
        console.error("Error deleting lead:", err);
        await swal({
          title: "Error",
          text: "Failed to delete lead. Please try again.",
          icon: "error",
        });
      }
    }
  };

  // Handler for refresh button
  const handleRefresh = () => {
    fetchLeads(currentPage);
  };

  // Handler for export button
  const handleExport = async () => {
    try {
      // Fetch all leads with a large limit (e.g., 100000)
      const data = await marketingApi.getAllLeads(
        1,
        100000,
        search || undefined,
        country || undefined,
      );
      const leads = data.data || [];
      // Prepare worksheet data
      const wsData = [
        [
          "First Name",
          "Last Name",
          "Email",
          "Country Code",
          "Phone",
          "Company Name",
          "Country",
          "Message",
          "Created At",
          "IP Address",
          "Form Type",
        ],
        ...leads.map((lead: any) => [
          lead.firstName,
          lead.lastName,
          lead.email,
          lead.CountryCode,
          lead.phone,
          lead.companyName,
          lead.country,
          lead.message,
          lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "",
          lead.ipAddress,
          lead.formType,
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads");
      XLSX.writeFile(wb, "leads.xlsx");
    } catch (err) {
      swal({ title: "Error", text: "Failed to export leads.", icon: "error" });
    }
  };

  const handlePageChange = (page: number) => {
    fetchLeads(page);
  };

  // Extract unique countries from leads for filter dropdown (after initial fetch)
  useEffect(() => {
    if (leadsData.length > 0) {
      const uniqueCountries = Array.from(
        new Set(leadsData.map((lead) => lead.country)),
      );
      setCountries(uniqueCountries);
    }
  }, [leadsData]);

  return (
    <div className="w-full min-w-0">
      {/* ORANGE TOOLBAR */}
      <div className="mb-6 flex min-h-16 flex-wrap items-center justify-between gap-4 bg-[#F46A45] px-6 py-3 text-white">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Marketing Leads</h1>
          <p className="text-sm text-white/90">
            Total leads: <span className="font-semibold">{total}</span>
          </p>
          {/* Refresh and Export Buttons */}
          <button
            onClick={handleRefresh}
            className="ml-2 p-2 rounded hover:bg-white/20"
            title="Refresh"
            type="button"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={handleExport}
            className="ml-2 p-2 rounded hover:bg-white/20"
            title="Export to Excel"
            type="button"
          >
            <FileDown size={20} />
          </button>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
              size={18}
            />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-white/50 bg-white/90 pl-10 pr-3 text-base text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/70 sm:w-72"
            />
          </div>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="h-9 min-w-44 rounded-lg border border-white/50 bg-white/90 px-3 text-black focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && leadsData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No leads found.</p>
        </div>
      )}

      {/* Table Section */}
      {!loading && leadsData.length > 0 && (
        <div className="w-full max-w-full min-w-0 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-max w-full">
              <thead>
                <tr className="border-b border-black">
                  <th className="whitespace-nowrap px-6 py-3 text-left text-base font-bold text-secondary">
                    Name
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-base font-bold text-secondary">
                    Email
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-base font-bold text-secondary">
                    Phone
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-base font-bold text-secondary">
                    Company
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-base font-bold text-secondary">
                    Country
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-base font-bold text-secondary">
                    Message
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-base font-bold text-secondary">
                    Created
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-base font-bold text-secondary">
                    IP Address
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-base font-bold text-secondary">
                    Form Type
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-center text-base font-bold text-secondary">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {leadsData.map((lead) => (
                  <tr
                    key={lead._id}
                    className="border-b border-black text-gray-900 transition-colors hover:bg-[#F6FAFF]"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {lead.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {lead.CountryCode} {lead.phone}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {lead.companyName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {lead.country}
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-700">
                      {lead.message || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {lead.ipAddress || "-"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {lead.formType || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="cursor-pointer p-2 text-red-600 transition-colors hover:text-red-800"
                          title="Delete lead"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
