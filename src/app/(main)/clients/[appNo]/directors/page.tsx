"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Director } from "@/types/director";
import { clientsApi } from "@/lib/api/clients";

export default function DirectorsPage() {
  const { appNo } = useParams();
  const router = useRouter();
  const [directors, setDirectors] = useState<Director[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDirector, setActiveDirector] = useState<number>(1);

  useEffect(() => {
    const loadDirectors = async () => {
      try {
        setIsLoading(true);
        const response = await clientsApi.getDirectorAndShareHolders(
          appNo as string,
        );
        if (
          response &&
          response.data &&
          Array.isArray(response.data.directors)
        ) {
          // Map API directors to Director type
          const mappedDirectors: Director[] = response.data.directors.map(
            (d: any, idx: number) => ({
              id: d.directorId || `${idx}`,
              applicationNo: appNo as string,
              directorNumber: idx + 1,
              hasDIN: d.hasDIN || false,
              din: d.dinNumber || "",
              directorName: d.name || "-",
              fatherName: d.fatherName || "-",
              email: d.email || "-",
              phoneNo: d.phoneNumber || "-",
              gender: d.gender
                ? d.gender.charAt(0).toUpperCase() + d.gender.slice(1)
                : "Other",
              dateOfBirth: d.dateOfBirth || "-",
              nationality: d.nationality || "-",
              passportNo: d.passportNumber || "-",
              occupationType: d.occupationType || "-",
              placeOfBirth: d.placeOfBirth?.city || "-",
              educationQualification: d.educationQualification || "-",
              presentAddress: d.presentAddress || "-",
              permanentAddress: d.permanentAddress || "-",
              pan: d.panNumber || "-",
              durationOfStayAtPresentAddress: `${d.durationOfStay?.years || 0} years, ${d.durationOfStay?.months || 0} months`,
              previousResidenceAddress: d.previousAddress || "-",
              shareholdingPercentage: d.proposedShareholdingPercentage
                ? Number(d.proposedShareholdingPercentage)
                : 0,
              kycVerified: false,
              dscApplication: false,
              createdAt: undefined,
              updatedAt: undefined,
            }),
          );
          setDirectors(mappedDirectors);
        } else {
          setDirectors([]);
        }
      } catch (error) {
        console.error("Error fetching directors:", error);
        setDirectors([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (appNo) {
      loadDirectors();
    }
  }, [appNo]);

  const handleDirectorClick = (director: Director) => {
    setActiveDirector(director.directorNumber);
    router.push(`/clients/${appNo}/directors/${director.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-primary mb-6">{appNo}</h1>

        {/* Directors List View */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary">
              Total Directors: {directors.length}
            </h2>
          </div>

          <div className="space-y-4">
            {directors.map((director) => (
              <div
                key={director.id}
                onClick={() => handleDirectorClick(director)}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#F46A45] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Director {director.directorNumber}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {director.directorName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {director.email} • {director.phoneNo}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
