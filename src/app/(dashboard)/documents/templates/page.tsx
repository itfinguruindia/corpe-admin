"use client";

import { useState } from "react";
import { templates } from "@/lib/data/mockTempletesUrlData";
import { Search, FileText, Download, Upload, Eye, X } from "lucide-react";

const TemplatesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    url: string;
    fileName: string;
  }>({
    isOpen: false,
    url: "",
    fileName: "",
  });

  // Filter templates based on search query
  const filteredTemplates = templates.filter((template) =>
    template.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (url: string, fileName: string) => {
    setPreviewModal({
      isOpen: true,
      url,
      fileName,
    });
  };

  const closePreview = () => {
    setPreviewModal({
      isOpen: false,
      url: "",
      fileName: "",
    });
  };

  const handleImport = () => {
    // Handle import functionality
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".doc,.docx,.pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log("Importing file:", file.name);
        // Add your import logic here
      }
    };
    input.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Document Templates</h1>

        {/* Search Bar with Import Button */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={handleImport}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
          >
            <Upload className="w-5 h-5" />
            Import
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {filteredTemplates.length}{" "}
        {filteredTemplates.length === 1 ? "template" : "templates"} found
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200"
          >
            {/* Preview Container */}
            <div className="relative h-64 bg-gray-100 overflow-hidden">
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(template.url)}`}
                className="w-full h-full  origin-top-left"
                title={template.fileName}
              />
            </div>

            {/* Template Info */}
            <div className="p-4 space-y-3">
              {/* File Icon and Name */}
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                  {template.fileName}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handlePreview(template.url, template.fileName)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    handleDownload(template.url, template.fileName)
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No templates found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search query
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closePreview}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {previewModal.fileName}
                </h2>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Body - Preview */}
            <div className="flex-1 overflow-hidden bg-gray-100">
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewModal.url)}`}
                className="w-full h-full"
                title={previewModal.fileName}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closePreview}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(previewModal.url, previewModal.fileName);
                  closePreview();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
