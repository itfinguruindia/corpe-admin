"use client";

import { Trash2, Search, RefreshCw, FileDown } from "lucide-react";
import * as XLSX from "xlsx";

import { useEffect, useMemo, useState } from "react";
import { marketingApi, Lead } from "@/lib/api/marketing";
import useSwal from "@/utils/useSwal";
import { useDebouncedCallback } from "@/utils/helpers";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Button, Input, Label, TextField } from "@heroui/react";
import CustomSelect from "@/components/ui/CustomSelect";

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

  const countrySelectOptions = useMemo(
    () => [
      { id: "", label: "All Countries" },
      ...countries.map((c) => ({ id: c, label: c })),
    ],
    [countries],
  );

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
          <span title="Delete lead" className="inline-flex">
            <Button
              onClick={() => handleDelete(lead._id)}
              className="min-w-0 h-auto p-2 text-red-600 hover:text-red-800 hover:bg-red-50"
              aria-label="Delete lead"
              variant="ghost"
              type="button"
            >
              <Trash2 size={18} />
            </Button>
          </span>
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
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 size-5" />
              <TextField value={search} onChange={setSearch} name="searchLeads">
                <Label className="sr-only">Search leads</Label>
                <Input
                  aria-label="Search leads"
                  placeholder="Search leads..."
                  className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none rounded-xl border border-gray-200 shadow-sm"
                />
              </TextField>
            </div>

            <div className="h-[38px] w-full sm:w-auto min-w-[168px]">
              <CustomSelect
                ariaLabel="Filter by country"
                value={country}
                onChange={setCountry}
                options={countrySelectOptions}
              />
            </div>

            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                isIconOnly
                onClick={handleRefresh}
                className="h-10 w-10 min-w-10 shrink-0 rounded-lg border border-gray-200 bg-white p-0 text-gray-600 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Refresh leads"
                type="button"
                variant="ghost"
              >
                <RefreshCw size={18} />
              </Button>
              <Button
                isIconOnly
                onClick={handleExport}
                className="h-10 w-10 min-w-10 shrink-0 rounded-lg border border-gray-200 bg-white p-0 text-gray-600 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Export leads to Excel"
                type="button"
                variant="ghost"
              >
                <FileDown size={18} />
              </Button>
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
