"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Director } from "@/types/director";
import { clientsApi } from "@/lib/api/clients";
import { Card, Spinner } from "@heroui/react";
import { Chip } from "@/components/ui";
import { useClientCompanyLabels } from "@/contexts/ClientCompanyTypeContext";

interface DirectorsContentProps {
  appNo: string;
}

export default function DirectorsContent({ appNo }: DirectorsContentProps) {
  const router = useRouter();
  const { labels } = useClientCompanyLabels();
  const [directors, setDirectors] = useState<Director[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDirectors = async () => {
      try {
        setIsLoading(true);
        const response = await clientsApi.getDirectorAndShareHolders(appNo, false);
        if (
          response &&
          response.data &&
          Array.isArray(response.data.directors)
        ) {
          const mappedDirectors: Director[] = response.data.directors.map(
            (d: any, idx: number) => ({
              id: d.directorId || `${idx}`,
              applicationNo: appNo,
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
              isForeignResident: Boolean(d.isForeignResident),
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
              kycVerified: d.kycVerified ?? false,
              dscApplication: d.dscApplication ?? false,
              isBankSigningAuthority: d.isBankSigningAuthority ?? false,
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

    loadDirectors();
  }, [appNo]);

  const handleDirectorClick = (director: Director) => {
    router.push(`/clients/${appNo}/directors/${director.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary">
              {labels.totalDirectors(directors.length)}
            </h2>
          </div>

          <div className="space-y-4">
            {directors.map((director) => (
              <Card
                key={director.id}
                className="p-4 border border-gray-200 hover:border-[#F46A45] hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleDirectorClick(director)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {labels.directorWithNumber(director.directorNumber)}
                      </h3>
                      {director.isBankSigningAuthority && (
                        <Chip
                          label="Bank Signing Authority"
                          variant="blue"
                          className="text-xs"
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {director.directorName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {director.email} • {director.phoneNo}
                      {(director as { isForeignResident?: boolean })
                        .isForeignResident && (
                        <span className="ml-2 text-xs font-medium text-[#3D63A4]">
                          • NRI / Foreign Resident
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
