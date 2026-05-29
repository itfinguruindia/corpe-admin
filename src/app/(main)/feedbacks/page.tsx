"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Eye, Search, Star } from "lucide-react";
import { feedbackService, IFeedbackItem } from "@/services/feedback.service";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import CustomModal from "@/components/ui/Modal";
import CustomSelect from "@/components/ui/CustomSelect";
import ExportDropdown from "@/components/ui/ExportDropdown";
import { Input, Label, TextField } from "@heroui/react";
import Link from "next/link";
import * as XLSX from "xlsx";

const RatingFilterOptions = [
  { label: "All", value: "" },
  { label: "1 Star", value: "0" },
  { label: "2 Stars", value: "1" },
  { label: "3 Stars", value: "2" },
  { label: "4 Stars", value: "3" },
  { label: "5 Stars", value: "4" },
];

const ratingSelectOptions = RatingFilterOptions.map((opt) => ({
  id: opt.value,
  label: opt.label,
}));

const emojis = [
  { emoji: "😞", label: "Sad" },
  { emoji: "😕", label: "Neutral" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😊", label: "Good" },
  { emoji: "😄", label: "Great" },
];
 
export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<IFeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const limit = 10;
      const data = await feedbackService.getAllFeedbacks({
        page,
        limit,
        search,
        rating: rating || undefined,
      });

      if (data) {
        setFeedbacks(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to load feedbacks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, rating]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchFeedbacks();
    }, 500);
    return () => clearTimeout(handler);
  }, [fetchFeedbacks]);

  useEffect(() => {
    setPage(1);
  }, [search, rating]);

  const handleOpenFeedbackModal = (feedbackText: string, rating: number) => {
    setSelectedFeedback(feedbackText || "No feedback provided.");
    setSelectedRating(rating);
    onOpen();
  };

  const handleExportFeedbacks = async (
    withDateRange: boolean,
    dateFrom?: string,
    dateTo?: string,
  ) => {
    try {
      setIsExporting(true);

      let currentPage = 1;
      let totalPagesForExport = 1;
      const rows: IFeedbackItem[] = [];

      while (currentPage <= totalPagesForExport) {
        const response = await feedbackService.getAllFeedbacks({
          page: currentPage,
          limit: 100,
          search: search || undefined,
          rating: rating || undefined,
          ...(withDateRange && dateFrom ? { dateFrom } : {}),
          ...(withDateRange && dateTo ? { dateTo } : {}),
        });

        if (!response) break;
        rows.push(...response.data);
        totalPagesForExport = response.totalPages || 1;
        currentPage += 1;
      }

      const worksheetRows = [
        [
          "Application No.",
          "Client Name",
          "Entity Type",
          "Rating",
          "Feedback",
          "Submitted On",
        ],
        ...rows.map((item) => [
          item.appNo,
          item.clientName || "N/A",
          item.entityType || "N/A",
          item.rating + 1,
          item.feedback || "No feedback",
          new Date(item.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(worksheetRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Feedbacks");
      XLSX.writeFile(
        wb,
        `feedbacks-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch (error) {
      console.error("Failed to export feedbacks:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderStars = (ratingValue: number) => {
    const numStars = ratingValue + 1;
    return (
      <div className="flex gap-1 relative z-0">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < numStars
                ? "fill-yellow-400 text-yellow-400"
                : "text-default-300"
            }
          />
        ))}
      </div>
    );
  };

  const columns: ColumnDef<IFeedbackItem>[] = useMemo(
    () => [
      {
        id: "appNo",
        label: "APPLICATION NO.",
        render: (row: IFeedbackItem) => (
          <Link
            href={`clients/${row.appNo}`}
            className="text-primary-600 font-semibold"
          >
            {row.appNo}
          </Link>
        ),
      },
      {
        id: "clientName",
        label: "CLIENT NAME",
        render: (row: IFeedbackItem) => (
          <span className="font-medium text-gray-900">
            {row.clientName || "N/A"}
          </span>
        ),
      },
      {
        id: "entityType",
        label: "ENTITY TYPE",
        render: (row: IFeedbackItem) => (
          <span className="text-gray-600 whitespace-nowrap">
            {row.entityType || "N/A"}
          </span>
        ),
      },
      {
        id: "signupFeedback",
        label: "SIGNUP FEEDBACK",
        render: (row: IFeedbackItem) => (
          <div
            className="flex items-center py-1 gap-3 cursor-pointer hover:bg-default-100 p-2 -ml-2 rounded-lg transition-colors w-max"
            onClick={() => handleOpenFeedbackModal(row.feedback, row.rating)}
          >
            {renderStars(row.rating)}
            <Eye className="size-5 text-primary" />
          </div>
        ),
      },
      {
        id: "processFeedback",
        label: "PROCESS FEEDBACK",
        render: () => <span className="text-gray-400">N/A</span>,
      },
    ],
    [],
  );

  const TopContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 mb-4 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Client Feedbacks
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Total feedbacks:{" "}
              <span className="font-semibold text-gray-900">{total}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 size-5" />
              <TextField value={search} onChange={setSearch} name="searchFeedbacks">
                <Label className="sr-only">Search feedbacks</Label>
                <Input
                  placeholder="Search feedbacks..."
                  className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none rounded-xl border border-gray-200 shadow-sm"
                />
              </TextField>
            </div>

            <div className="h-[38px] w-full sm:w-auto min-w-[140px]">
              <CustomSelect
                ariaLabel="Filter by rating"
                value={rating}
                onChange={setRating}
                options={ratingSelectOptions}
              />
            </div>

            <ExportDropdown
              title="Export Feedbacks"
              isExporting={isExporting}
              onExportDateRange={(dateFrom, dateTo) =>
                handleExportFeedbacks(true, dateFrom, dateTo)
              }
              onExportAll={() => handleExportFeedbacks(false)}
            />
          </div>
        </div>
      </div>
    );
  }, [search, rating, total]);

  return (
    <div>
      {TopContent}

      <DataTable<IFeedbackItem>
        columns={columns}
        data={feedbacks}
        keyField="_id"
        loading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        itemsPerPage={10}
        onPageChange={setPage}
        emptyMessage="No feedbacks found matching your criteria."
      />

      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title="Feedback Details"
        maxWidth="max-w-md"
      >
        <div className="p-2 flex flex-col gap-4">
          {selectedRating !== null && (
            <div className="flex items-center gap-3 px-1 py-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-4xl pl-2">{emojis[selectedRating].emoji}</span>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Rating</span>
                <span className="text-lg font-bold text-gray-800">{emojis[selectedRating].label}</span>
              </div>
              <div className="ml-auto pr-2">{renderStars(selectedRating)}</div>
            </div>
          )}
          <p className="text-base whitespace-pre-wrap leading-relaxed border p-4 rounded-lg bg-gray-50 font-medium text-gray-700">
            {selectedFeedback}
          </p>
        </div>
      </CustomModal>
    </div>
  );
}
