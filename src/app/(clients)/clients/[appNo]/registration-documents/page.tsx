"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Edit, Upload, Download, Eye, ChevronDown } from "lucide-react";
import { fetchRegistrationData } from "@/lib/data/mockRegistrationDocumentsData";
import {
  RegistrationData,
  RegistrationDocument,
} from "@/types/registrationDocuments";

export default function RegistrationDocumentsPage() {
  const { appNo } = useParams();
  const [data, setData] = useState<RegistrationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cinInput, setCinInput] = useState("");
  const [isEditingCin, setIsEditingCin] = useState(false); // To toggle readonly if needed
  const [companyStatus, setCompanyStatus] = useState<string>("pending");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!appNo) return;
      try {
        setIsLoading(true);
        const result = await fetchRegistrationData("GUJC000001" as string);
        setData(result);
        if (result?.cin) setCinInput(result.cin);
      } catch (error) {
        console.error("Failed to load registration data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [appNo]);

  const handleCinSubmit = () => {
    console.log("Submitting CIN:", cinInput);
    // TODO: Implement API call
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Data not found for {appNo}</div>
      </div>
    );
  }

  const pendingCount = data.documents.filter(
    (d) => d.status === "pending",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6">
      <div className="max-w-full">
        {/* Header: App No */}
        <h1 className="text-3xl font-bold text-primary mb-8">{appNo}</h1>

        <div className="flex items-center justify-between mb-8">
          <div className="relative">
            <div className="bg-linear-to-r from-orange-50 to-white px-6 py-3 rounded-xl border-l-4 border-orange-200 shadow-sm">
              <h2 className="text-xl font-semibold text-secondary">
                Registration Documents
              </h2>
            </div>
            {/* Gradient shadow/blur effect behind/below if needed, simplified for first pass */}
          </div>

          {/* Status Badge */}
          {pendingCount > 0 && (
            <div className="bg-[#F7C948] text-secondary px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
              highlights pending documnets
            </div>
          )}
        </div>

        {/* Company Status */}
        <div className="mb-8 relative">
          <div
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className="flex items-center gap-2 cursor-pointer text-secondary font-medium hover:text-[#2c4a7c] transition-colors w-fit"
          >
            <span>Company Status: {companyStatus}</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`}
            />
          </div>
          {isStatusDropdownOpen && (
            <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
              {["pending", "under-process", "delayed", "completed"].map(
                (status) => (
                  <div
                    key={status}
                    onClick={() => {
                      setCompanyStatus(status);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      companyStatus === status
                        ? "bg-orange-50 text-[#F46A45] font-semibold"
                        : "text-secondary"
                    }`}
                  >
                    {status}
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* CIN Section */}
        <div className="flex items-center mb-12 border-b border-gray-200 pb-8">
          <label className="text-lg font-bold text-black min-w-20">CIN</label>
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <input
              type="text"
              value={cinInput}
              onChange={(e) => setCinInput(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#F46A45]/20 focus:border-[#F46A45] transition-all bg-white"
              placeholder="Enter CIN"
            />
            <button
              onClick={handleCinSubmit}
              className="bg-[#F46A45] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#d55a39] transition-colors shadow-sm"
            >
              Submit
            </button>
            {/* Edit Icon for CIN */}
            <button className="p-2 text-primary hover:bg-orange-50 rounded-lg transition-colors border border-[#F46A45] aspect-square flex items-center justify-center w-10 h-10">
              <Edit size={18} />
            </button>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-0 max-w-5xl">
          {data.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between py-6 border-b border-gray-200 last:border-0 hover:bg-gray-50/50 transition-colors"
            >
              <span className="text-lg font-bold text-black">{doc.name}</span>

              <div className="flex items-center gap-6">
                {/* View */}
                <button
                  className="text-primary hover:text-[#d55a39] transition-colors p-1"
                  title="View"
                >
                  <Eye size={24} />
                </button>
                {/* Download */}
                <button
                  className="text-primary hover:text-[#d55a39] transition-colors p-1"
                  title="Download"
                >
                  <Download size={24} />
                </button>
                {/* Edit */}
                <button
                  className="text-primary hover:text-[#d55a39] transition-colors p-1"
                  title="Edit"
                >
                  <Edit size={24} />
                </button>
                {/* Upload/Share */}
                <button
                  className="text-primary hover:text-[#d55a39] transition-colors p-1"
                  title="Upload"
                >
                  <Upload size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
