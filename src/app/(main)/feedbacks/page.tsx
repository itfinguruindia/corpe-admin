"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Eye, Search, Star } from "lucide-react";
import { feedbackService, IFeedbackItem } from "@/services/feedback.service";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import CustomModal from "@/components/ui/Modal";
import Link from "next/link";

const RatingFilterOptions = [
  { label: "All", value: "" },
  { label: "1 Star", value: "0" },
  { label: "2 Stars", value: "1" },
  { label: "3 Stars", value: "2" },
  { label: "4 Stars", value: "3" },
  { label: "5 Stars", value: "4" },
];

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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
              <input
                type="text"
                placeholder="Search feedbacks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none rounded-xl border border-gray-200 shadow-sm"
              />
            </div>

            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="h-[38px] w-full sm:w-auto min-w-[140px] appearance-none rounded-xl border border-gray-200 bg-transparent px-4 pr-8 text-sm text-gray-900 transition-all hover:bg-gray-50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-position-[right_0.5rem_center]"
            >
              {RatingFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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
