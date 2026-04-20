"use client";

import { Trash2, Search, RefreshCw, FileDown } from "lucide-react";
import * as XLSX from "xlsx";

import { useEffect, useState } from "react";
import { marketingApi, Lead } from "@/lib/api/marketing";
import useSwal from "@/utils/useSwal";
import { useDebouncedCallback } from "@/utils/helpers";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

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

  const columns: ColumnDef<Lead>[] = [
    {
      id: "name",
      label: "Name",
      render: (lead) => (
        <span className="font-semibold text-gray-900 whitespace-nowrap">
          {lead.firstName} {lead.lastName}
        </span>
      ),
    },
    {
      id: "email",
      label: "Email",
      render: (lead) => (
        <span className="text-gray-700 whitespace-nowrap">{lead.email}</span>
      ),
    },
    {
      id: "phone",
      label: "Phone",
      render: (lead) => (
        <span className="text-gray-700 whitespace-nowrap">
          {lead.CountryCode} {lead.phone}
        </span>
      ),
    },
    {
      id: "companyName",
      label: "Company",
      render: (lead) => (
        <span className="text-gray-700 whitespace-nowrap">
          {lead.companyName}
        </span>
      ),
    },
    {
      id: "country",
      label: "Country",
      render: (lead) => (
        <span className="text-gray-700 whitespace-nowrap">{lead.country}</span>
      ),
    },
    {
      id: "message",
      label: "Message",
      render: (lead) => (
        <span className="max-w-xs truncate block text-gray-700">
          {lead.message || "-"}
        </span>
      ),
    },
    {
      id: "createdAt",
      label: "Created",
      render: (lead) => (
        <span className="text-gray-700 whitespace-nowrap">
          {new Date(lead.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "ipAddress",
      label: "IP Address",
      render: (lead) => (
        <span className="text-gray-700 whitespace-nowrap">
          {lead.ipAddress || "-"}
        </span>
      ),
    },
    {
      id: "formType",
      label: "Form Type",
      render: (lead) => (
        <span className="text-gray-700 whitespace-nowrap">
          {lead.formType || "-"}
        </span>
      ),
    },
    {
      id: "action",
      label: "Action",
      render: (lead) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDelete(lead._id)}
            className="cursor-pointer p-2 text-red-600 transition-colors hover:text-red-800"
            title="Delete lead"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full min-w-0">
      {/* HEADER & SEARCH TOOLBAR */}
      <div className="flex flex-col gap-6 p-6 pb-0 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Marketing Leads
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Total leads:{" "}
                <span className="font-semibold text-gray-900">{total}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
              <input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none rounded-xl border border-gray-200 shadow-sm"
              />
            </div>

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-[38px] w-full sm:w-auto min-w-[140px] appearance-none rounded-xl border border-gray-200 bg-transparent px-4 pr-8 text-sm text-gray-900 transition-all hover:bg-gray-50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-position-[right_0.5rem_center]"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleRefresh}
                className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border shadow-sm border-gray-200 bg-white"
                title="Refresh"
                type="button"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={handleExport}
                className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border shadow-sm border-gray-200 bg-white"
                title="Export to Excel"
                type="button"
              >
                <FileDown size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <DataTable<Lead>
        data={leadsData}
        columns={columns}
        keyField="_id"
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
