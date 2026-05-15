"use client";

import { useState } from "react";
import { templates } from "@/lib/data/mockTempletesUrlData";
import { Search, FileText, Download, Upload, Eye } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  Input,
  Label,
  Modal,
  TextField,
  useOverlayState,
} from "@heroui/react";

const TemplatesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const previewOverlay = useOverlayState({
    onOpenChange: (open) => {
      if (!open) {
        setPreviewUrl("");
        setPreviewFileName("");
      }
    },
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
    setPreviewUrl(url);
    setPreviewFileName(fileName);
    previewOverlay.open();
  };

  const closePreview = () => {
    previewOverlay.close();
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <TextField value={searchQuery} onChange={setSearchQuery} name="searchTemplates">
              <Label className="sr-only">Search templates</Label>
              <Input
                type="text"
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </TextField>
          </div>
          <Button
            type="button"
            onPress={handleImport}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shrink-0"
          >
            <Upload className="w-5 h-5" />
            Import
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {filteredTemplates.length}{" "}
        {filteredTemplates.length === 1 ? "template" : "templates"} found
      </div>

      {/* Grid of Templates */}
      <div
        id="templates-grid"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="flex flex-col h-full bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200"
          >
            {/* Preview Container */}
            <div className="relative h-64 bg-gray-100 overflow-hidden">
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(template.url)}`}
                className="w-full h-full origin-top-left"
                title={template.fileName}
              />
            </div>

            <Card.Content className="flex flex-col flex-1 p-4">
              {/* File Icon and Name */}
              <div className="flex items-start gap-2 min-h-12 mb-3">
                <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 leading-snug">
                  {template.fileName}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-auto">
                <Button
                  type="button"
                  isIconOnly
                  onPress={() => handlePreview(template.url, template.fileName)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  aria-label={`Preview ${template.fileName}`}
                >
                  <Eye className="w-5 h-5" />
                </Button>
                <Button
                  type="button"
                  onPress={() =>
                    handleDownload(template.url, template.fileName)
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </Button>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <EmptyState className="flex flex-col items-center justify-center text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No templates found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search query
          </p>
        </EmptyState>
      )}

      {/* Preview Modal */}
      <Modal state={previewOverlay}>
        <Modal.Backdrop className="bg-black/50 backdrop-blur-sm">
          <Modal.Container placement="center" className="p-4">
            <Modal.Dialog className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col outline-none">
              <Modal.Header className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                  <Modal.Heading className="text-lg font-semibold text-gray-900 truncate">
                    {previewFileName}
                  </Modal.Heading>
                </div>
                <Modal.CloseTrigger
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 shrink-0"
                  aria-label="Close preview"
                />
              </Modal.Header>

              <Modal.Body className="flex-1 min-h-0 overflow-hidden bg-gray-100 p-0">
                {previewUrl ? (
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`}
                    className="w-full h-full border-0"
                    title={previewFileName}
                  />
                ) : null}
              </Modal.Body>

              <Modal.Footer className="p-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                <Button
                  type="button"
                  onPress={closePreview}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200 font-medium"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onPress={() => {
                    if (previewUrl) {
                      handleDownload(previewUrl, previewFileName);
                    }
                    closePreview();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
};

export default TemplatesPage;
