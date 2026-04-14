"use client";

import { Trash2, RefreshCw, FileDown, Plus } from "lucide-react";
import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import { newsletterApi, Newsletter } from "@/lib/api/newsletter";
import useSwal from "@/utils/useSwal";

export default function NewsLetter() {
  const [data, setData] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
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
              <input
                type="email"
                placeholder="Enter email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:w-64 bg-transparent px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none rounded-xl border border-gray-200 shadow-sm h-[38px]"
              />
              <button
                onClick={handleAdd}
                className="flex items-center justify-center p-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors border shadow-sm border-transparent h-[38px] px-3 font-medium text-sm"
                title="Add/Subscribe"
                type="button"
              >
                <Plus size={18} className="mr-1" /> Add
              </button>
            </div>

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

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      )}
      {!loading && data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No subscribers found.</p>
        </div>
      )}
      {!loading && data.length > 0 && (
        <div className="w-full max-w-full min-w-0 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table id="subscribers-table" className="min-w-max w-full">
              <thead>
                <tr className="border-b border-black">
                  <th className="whitespace-nowrap px-6 py-3 text-left text-base font-bold text-secondary">
                    Email
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-base font-bold text-secondary">
                    Subscribe Count
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-center text-base font-bold text-secondary">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-black text-gray-900 transition-colors hover:bg-[#F6FAFF]"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                      {item.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {item.subscribeCount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="cursor-pointer p-2 text-red-600 transition-colors hover:text-red-800"
                        title="Delete subscriber"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
