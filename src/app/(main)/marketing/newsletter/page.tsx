"use client";

import { Trash2, RefreshCw, FileDown, Plus } from "lucide-react";
import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import { Button, Input, Label, TextField } from "@heroui/react";
import { newsletterApi, Newsletter } from "@/lib/api/newsletter";
import useSwal from "@/utils/useSwal";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

export default function NewsLetter() {
  const [data, setData] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const swal = useSwal();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await newsletterApi.getAll();
      setData(res);
    } catch (err) {
      setError("Failed to load newsletters.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!email)
      return swal({ title: "Error", text: "Email required", icon: "error" });
    try {
      await newsletterApi.addOrUpdate(email);
      setEmail("");
      fetchData();
    } catch {
      swal({ title: "Error", text: "Failed to add/update.", icon: "error" });
    }
  };

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
        await newsletterApi.delete(id);
        fetchData();
      } catch {
        swal({ title: "Error", text: "Failed to delete.", icon: "error" });
      }
    }
  };

  const handleRefresh = () => fetchData();

  const handleExport = async () => {
    try {
      const newsletters = await newsletterApi.export();
      const wsData = [
        ["Email", "Subscribe Count"],
        ...newsletters.map((n) => [n.email, n.subscribeCount]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Newsletters");
      XLSX.writeFile(wb, "newsletters.xlsx");
    } catch {
      swal({ title: "Error", text: "Failed to export.", icon: "error" });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: ColumnDef<Newsletter>[] = [
    {
      id: "email",
      label: "Email",
      render: (item) => (
        <span className="font-semibold text-gray-900 whitespace-nowrap">
          {item.email}
        </span>
      ),
    },
    {
      id: "subscribeCount",
      label: "Subscribe Count",
      render: (item) => (
        <span className="text-gray-700">{item.subscribeCount}</span>
      ),
    },
    {
      id: "action",
      label: "Action",
      render: (item) => (
        <div className="flex items-center gap-2">
          <span title="Delete subscriber" className="inline-flex">
            <Button
              onClick={() => handleDelete(item._id)}
              className="min-w-0 h-auto p-2 text-red-600 hover:text-red-800 hover:bg-red-50"
              aria-label="Delete subscriber"
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

  // Client-side pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="w-full min-w-0">
      {/* HEADER & SEARCH TOOLBAR */}
      <div className="flex flex-col gap-6 p-6 pb-0 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
              <p className="text-sm text-gray-500 mt-1">
                Total: <span className="font-semibold text-gray-900">{data.length}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <TextField value={email} onChange={setEmail} name="newsletterEmail">
                  <Label className="sr-only">Subscriber email</Label>
                  <Input
                    type="email"
                    placeholder="Enter email..."
                    className="w-full bg-transparent px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none rounded-xl border border-gray-200 shadow-sm h-[38px]"
                  />
                </TextField>
              </div>
              <span title="Add/Subscribe" className="inline-flex">
                <Button
                  onClick={handleAdd}
                  className="flex items-center justify-center h-[38px] px-3 font-medium text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors border shadow-sm border-transparent"
                  type="button"
                >
                  <Plus size={18} className="mr-1 shrink-0" /> Add
                </Button>
              </span>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span title="Refresh" className="inline-flex">
                <Button
                  onClick={handleRefresh}
                  className="min-w-0 h-auto p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border shadow-sm border-gray-200 bg-white"
                  aria-label="Refresh subscribers"
                  type="button"
                  variant="ghost"
                >
                  <RefreshCw size={18} />
                </Button>
              </span>
              <span title="Export to Excel" className="inline-flex">
                <Button
                  onClick={handleExport}
                  className="min-w-0 h-auto p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border shadow-sm border-gray-200 bg-white"
                  aria-label="Export subscribers to Excel"
                  type="button"
                  variant="ghost"
                >
                  <FileDown size={18} />
                </Button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <DataTable<Newsletter>
        data={paginatedData}
        columns={columns}
        keyField="_id"
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={data.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        emptyMessage="No subscribers found."
      />
    </div>
  );
}
