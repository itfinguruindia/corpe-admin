"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Director } from "@/types/director";
import { Shareholder } from "@/types/shareholder";
import { fetchDirectors } from "@/lib/data/mockDirectorsData";
import { fetchShareholders } from "@/lib/data/mockShareholdersData";
import TabCard from "@/components/dashboard/TabCard";

export default function UploadedDocumentsPage() {
  const { appNo } = useParams();
  const router = useRouter();
  const [directors, setDirectors] = useState<Director[]>([]);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [directorsData, shareholdersData] = await Promise.all([
          fetchDirectors(appNo as string),
          fetchShareholders(appNo as string),
        ]);
        setDirectors(directorsData);
        setShareholders(shareholdersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (appNo) {
      loadData();
    }
  }, [appNo]);

  const handleDirectorClick = (director: Director) => {
    router.push(`/clients/${appNo}/directors/${director.id}/documents`);
  };

  const handleShareholderClick = (shareholder: Shareholder) => {
    router.push(`/clients/${appNo}/shareholders/${shareholder.id}/documents`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5 pl-0">
      <div className="max-w-[231px] mx-auto ml-5">
        {/* Header */}
        <h1 className="text-3xl font-bold text-primary mb-2">{appNo}</h1>

        <div className="space-y-4 pt-10">
          {/* Directors Section */}
          {directors.map((director) => (
            <TabCard
              key={director.id}
              label={`Director ${director.directorNumber}`}
              onClick={() => handleDirectorClick(director)}
              className="text-left"
            />
          ))}

          {/* Shareholders Section */}
          {shareholders.map((shareholder) => (
            <TabCard
              key={shareholder.id}
              label={`Shareholder ${shareholder.shareholderNumber}`}
              onClick={() => handleShareholderClick(shareholder)}
              className="text-left"
            />
          ))}

          {directors.length === 0 && shareholders.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
              No directors or shareholders found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
