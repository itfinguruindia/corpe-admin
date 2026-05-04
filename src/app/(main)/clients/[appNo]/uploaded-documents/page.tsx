"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Users, UserCheck } from "lucide-react";
import { clientsApi } from "@/lib/api/clients";
import TabCard from "@/components/dashboard/TabCard";

export default function UploadedDocumentsPage() {
  const { appNo } = useParams();
  const router = useRouter();
  const [directors, setDirectors] = useState<{ id: string; directorNumber: number }[]>([]);
  const [shareholders, setShareholders] = useState<{ id: string; shareholderNumber: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await clientsApi.getDirectorAndShareHolders(
          appNo as string,
        );

        if (response && response.data) {
          // Map directors
          const mappedDirectors = (response.data.directors || []).map(
            (d: any, idx: number) => ({
              id: d.directorId || `${idx}`,
              directorNumber: idx + 1,
            }),
          );

          // Map shareholders
          const mappedShareholders = (response.data.shareholders || []).map(
            (s: any, idx: number) => ({
              id: s.shareholderId || `${idx}`,
              shareholderNumber: idx + 1,
            }),
          );

          setDirectors(mappedDirectors);
          setShareholders(mappedShareholders);
        }
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

  const handleDirectorClick = (director: { id: string }) => {
    router.push(`/clients/${appNo}/directors/${director.id}/documents`);
  };

  const handleShareholderClick = (shareholder: { id: string }) => {
    router.push(`/clients/${appNo}/shareholders/${shareholder.id}/documents`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 animate-pulse">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">{appNo}</h1>
          <p className="text-gray-500 mt-2 text-lg">Manage and view uploaded documents for directors and shareholders.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Directors Section */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <UserCheck className="text-primary w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Directors</h2>
              <span className="bg-gray-200 text-gray-700 px-3 py-0.5 rounded-full text-sm font-medium ml-auto">
                {directors.length}
              </span>
            </div>
            
            {directors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {directors.map((director) => (
                  <TabCard
                    key={director.id}
                    label={`Director ${director.directorNumber}`}
                    onClick={() => handleDirectorClick(director)}
                    className="text-left hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No directors listed for this application." />
            )}
          </section>

          {/* Shareholders Section */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Users className="text-blue-600 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Shareholders</h2>
              <span className="bg-gray-200 text-gray-700 px-3 py-0.5 rounded-full text-sm font-medium ml-auto">
                {shareholders.length}
              </span>
            </div>

            {shareholders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shareholders.map((shareholder) => (
                  <TabCard
                    key={shareholder.id}
                    label={`Shareholder ${shareholder.shareholderNumber}`}
                    onClick={() => handleShareholderClick(shareholder)}
                    className="text-left hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No shareholders listed for this application." />
            )}
          </section>
        </div>

        {directors.length === 0 && shareholders.length === 0 && (
          <div className="mt-20">
            <EmptyState message="No entities found. Please check the application status." />
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
      <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="text-gray-300 w-8 h-8" />
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );
}
