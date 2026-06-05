"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Users, UserCheck, Download, Eye } from "lucide-react";
import { Spinner, toast } from "@heroui/react";

import { clientsApi } from "@/lib/api/clients";
import TabCard from "@/components/dashboard/TabCard";
import Modal from "@/components/ui/Modal";
import { getFileType } from "@/utils/helpers";

interface UploadedDocumentsContentProps {
  appNo: string;
}

interface UploadedDoc {
  name?: string;
  path?: string;
  uploadedAt?: string;
}

type OfficeDocType = "proofOfOffice" | "proofOfOfficeAddress";

const OFFICE_DOC_LABELS: Record<OfficeDocType, string> = {
  proofOfOffice: "Latest Electricity Bill",
  proofOfOfficeAddress:
    "Proof of Office Address with NOC (Conveyance / Lease deed / Rent Agreement)",
};

function getFileName(value?: string) {
  if (!value) return "";
  return value.split("/").pop() || value;
}

function ClientUploadCard({
  label,
  file,
  onPreview,
  onDownload,
}: {
  label: string;
  file: UploadedDoc | null;
  onPreview: () => void;
  onDownload: () => void;
}) {
  if (file?.path || file?.name) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-700">
            👤 Client Upload
          </span>
          <div className="flex items-center gap-2">
            <div title="Preview">
              <Eye
                size={16}
                onClick={onPreview}
                className="cursor-pointer text-blue-600 hover:text-blue-700"
              />
            </div>
            <div title="Download">
              <Download
                size={16}
                onClick={onDownload}
                className="cursor-pointer text-blue-600 hover:text-blue-700"
              />
            </div>
          </div>
        </div>
        <p className="truncate text-sm font-medium text-secondary">{label}</p>
        <div className="truncate text-sm text-secondary">
          {getFileName(file.name)}
        </div>
        {file.uploadedAt && (
          <div className="mt-1 text-xs text-blue-600">
            {new Date(file.uploadedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
      <div className="mb-1 text-xs font-medium text-gray-400">
        👤 Client Upload
      </div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="text-sm text-gray-400">No file uploaded</div>
    </div>
  );
}

export default function UploadedDocumentsContent({
  appNo,
}: UploadedDocumentsContentProps) {
  const router = useRouter();
  const [directors, setDirectors] = useState<
    { id: string; directorNumber: number }[]
  >([]);
  const [shareholders, setShareholders] = useState<
    { id: string; shareholderNumber: number }[]
  >([]);
  const [electricityBill, setElectricityBill] = useState<UploadedDoc | null>(
    null,
  );
  const [nocDocument, setNocDocument] = useState<UploadedDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [peopleResponse, corporateStructure] = await Promise.all([
          clientsApi.getDirectorAndShareHolders(appNo),
          clientsApi.getCorporateStructure(appNo).catch(() => null),
        ]);

        if (peopleResponse?.data) {
          const mappedDirectors = (peopleResponse.data.directors || []).map(
            (d: { directorId?: string }, idx: number) => ({
              id: d.directorId || `${idx}`,
              directorNumber: idx + 1,
            }),
          );

          const mappedShareholders = (
            peopleResponse.data.shareholders || []
          ).map((s: { shareholderId?: string }, idx: number) => ({
            id: s.shareholderId || `${idx}`,
            shareholderNumber: idx + 1,
          }));

          setDirectors(mappedDirectors);
          setShareholders(mappedShareholders);
        }

        const office = corporateStructure?.registeredOffice;
        if (office) {
          setElectricityBill(
            office.proofOfOffice || office.proofFile || null,
          );
          setNocDocument(office.proofOfOfficeAddress || null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [appNo]);

  const handleDirectorClick = (director: { id: string }) => {
    router.push(`/clients/${appNo}/directors/${director.id}/documents`);
  };

  const handleShareholderClick = (shareholder: { id: string }) => {
    router.push(`/clients/${appNo}/shareholders/${shareholder.id}/documents`);
  };

  const handleDownload = async (docType: OfficeDocType, file?: UploadedDoc | null) => {
    try {
      const blob = await clientsApi.downloadCorporateStructureDocument(
        appNo,
        docType,
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileName(file?.name) || `${docType}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Downloaded successfully");
    } catch (error) {
      console.error("Failed to download document:", error);
      toast.danger("No file uploaded yet or download failed.");
    }
  };

  const handlePreview = async (docType: OfficeDocType, file?: UploadedDoc | null) => {
    try {
      const blob = await clientsApi.downloadCorporateStructureDocument(
        appNo,
        docType,
      );
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewFileName(getFileName(file?.name) || `${docType}.pdf`);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Failed to preview document:", error);
      toast.danger("No file uploaded yet or preview failed.");
    }
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const hasOfficeDocs = Boolean(electricityBill?.path || nocDocument?.path);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="mb-2">
          <p className="text-lg text-gray-500">
            Manage and view uploaded documents for directors and shareholders.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <section>
            <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Directors</h2>
              <span className="ml-auto rounded-full bg-gray-200 px-3 py-0.5 text-sm font-medium text-gray-700">
                {directors.length}
              </span>
            </div>

            {directors.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {directors.map((director) => (
                  <TabCard
                    key={director.id}
                    label={`Director ${director.directorNumber}`}
                    onClick={() => handleDirectorClick(director)}
                    className="text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No directors listed for this application." />
            )}
          </section>

          <section>
            <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">
              <div className="rounded-lg bg-blue-50 p-2">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Shareholders</h2>
              <span className="ml-auto rounded-full bg-gray-200 px-3 py-0.5 text-sm font-medium text-gray-700">
                {shareholders.length}
              </span>
            </div>

            {shareholders.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {shareholders.map((shareholder) => (
                  <TabCard
                    key={shareholder.id}
                    label={`Shareholder ${shareholder.shareholderNumber}`}
                    onClick={() => handleShareholderClick(shareholder)}
                    className="text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No shareholders listed for this application." />
            )}
          </section>
        </div>

        {directors.length === 0 && shareholders.length === 0 && (
          <div className="mt-10">
            <EmptyState message="No entities found. Please check the application status." />
          </div>
        )}

        <section>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-secondary">
              Registered Office Documents
            </h2>

            <div className="space-y-3">
              <ClientUploadCard
                label={OFFICE_DOC_LABELS.proofOfOffice}
                file={electricityBill}
                onPreview={() =>
                  handlePreview("proofOfOffice", electricityBill)
                }
                onDownload={() =>
                  handleDownload("proofOfOffice", electricityBill)
                }
              />
              <ClientUploadCard
                label={OFFICE_DOC_LABELS.proofOfOfficeAddress}
                file={nocDocument}
                onPreview={() =>
                  handlePreview("proofOfOfficeAddress", nocDocument)
                }
                onDownload={() =>
                  handleDownload("proofOfOfficeAddress", nocDocument)
                }
              />
            </div>

            {hasOfficeDocs && (
              <div className="mt-4 rounded bg-gray-50 p-2 text-xs text-gray-600">
                Tip: Use the eye icon to preview, download icon to save file
              </div>
            )}
          </div>
        </section>
      </div>

      <Modal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        title={`Preview: ${previewFileName}`}
        maxWidth="md:max-w-[85vw]"
      >
        {!previewUrl ? (
          <p>No preview available</p>
        ) : (
          <>
            {getFileType(previewFileName) === "image" && (
              <img
                src={previewUrl}
                alt={previewFileName}
                className="max-h-[70vh] w-full rounded object-contain"
              />
            )}

            {getFileType(previewFileName) === "pdf" && (
              <iframe
                src={previewUrl}
                className="h-[70vh] w-full rounded border"
                title={previewFileName}
              />
            )}

            {getFileType(previewFileName) === "other" && (
              <div className="py-8 text-center">
                <p className="mb-4 text-gray-600">
                  Preview not available for this file type
                </p>
                <button
                  onClick={() => previewUrl && window.open(previewUrl, "_blank")}
                  className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-secondary"
                >
                  Open in New Tab
                </button>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-16 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
        <Users className="h-8 w-8 text-gray-300" />
      </div>
      <p className="font-medium text-gray-500">{message}</p>
    </div>
  );
}
