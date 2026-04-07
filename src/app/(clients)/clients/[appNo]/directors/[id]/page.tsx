"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Director } from "@/types/director";
import { clientsApi } from "@/lib/api/clients";
import { InfoField, Switch } from "@/components/ui";

export default function DirectorDetailPage() {
  const { appNo, id } = useParams();
  const router = useRouter();
  const [director, setDirector] = useState<Director | null>(null);
  const [allDirectors, setAllDirectors] = useState<Director[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDIN, setHasDIN] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [dscApplication, setDscApplication] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Use the same API as the all directors listing page
        const response = await clientsApi.getDirectorAndShareHolders(
          appNo as string,
        );
        if (
          response &&
          response.data &&
          Array.isArray(response.data.directors)
        ) {
          const mappedDirectors = response.data.directors.map(
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
              kycVerified: d.kycVerified ?? false,
              dscApplication: d.dscApplication ?? false,
              createdAt: undefined,
              updatedAt: undefined,
            }),
          );
          setAllDirectors(mappedDirectors);
          // Find the director by id
          const foundDirector = mappedDirectors.find(
            (dir: any) => dir.id === id,
          );
          setDirector(foundDirector || null);
          if (foundDirector) {
            setHasDIN(foundDirector.hasDIN);
            setKycVerified(foundDirector.kycVerified);
            setDscApplication(foundDirector.dscApplication);
          }
        } else {
          setAllDirectors([]);
          setDirector(null);
        }
      } catch (error) {
        console.error("Error fetching director:", error);
        setAllDirectors([]);
        setDirector(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (appNo && id) {
      loadData();
    }
  }, [appNo, id]);

  const handleKycToggle = async () => {
    const newValue = !kycVerified;
    try {
      await clientsApi.updateDirectorStatus(appNo as string, id as string, {
        kycVerified: newValue,
      });
      setKycVerified(newValue);
    } catch (error) {
      console.error("Error updating KYC status:", error);
    }
  };

  const handleDscToggle = async () => {
    const newValue = !dscApplication;
    try {
      await clientsApi.updateDirectorStatus(appNo as string, id as string, {
        dscApplication: newValue,
      });
      setDscApplication(newValue);
    } catch (error) {
      console.error("Error updating DSC status:", error);
    }
  };

  const handleDirectorChange = (directorId: string) => {
    router.push(`/clients/${appNo}/directors/${directorId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!director) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Director not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-primary mb-6">{appNo}</h1>

        {/* Director Tabs */}
        <div className="flex gap-4 mb-6">
          {allDirectors.map((dir) => (
            <button
              key={dir.id}
              onClick={() => handleDirectorChange(dir.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                dir.id === director.id
                  ? "bg-linear-to-br from-white to-orange-100 text-secondary shadow-md"
                  : "bg-white text-secondary hover:shadow-md"
              }`}
            >
              Director {dir.directorNumber}
            </button>
          ))}
        </div>

        {/* Director Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-secondary">
                Director {director.directorNumber}
              </h2>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push(`/clients/${appNo}/directors`)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                View more Directors
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/clients/${appNo}/directors/${director.id}/documents`,
                  )
                }
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Documents
              </button>
            </div>
          </div>

          {/* DIN Toggle */}
          <div className="w-full grid grid-cols-2 justify-between border-b border-[#F9A826]">
            <div className="flex items-center gap-3 pb-4">
              <span className="text-sm font-semibold text-gray-900">
                Do you have DIN?
              </span>
              <div className="flex bg-gray-200 rounded-md overflow-hidden">
                <button
                  // onClick={() => hasDIN && handleDINToggle()}
                  className={`px-4 py-1.5 text-sm font-medium transition-all ${
                    !hasDIN
                      ? "bg-gray-400 text-white"
                      : "text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  NO
                </button>
                <button
                  // onClick={() => !hasDIN && handleDINToggle()}
                  className={`px-4 py-1.5 text-sm font-medium transition-all ${
                    hasDIN
                      ? "bg-[#F46A45] text-white"
                      : "text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  YES
                </button>
              </div>
            </div>
            <div className="pl-4">
              <InfoField
                label="DIN"
                value={director?.din || "N/A"}
                border={false}
              />
            </div>
          </div>

          {/* Director Information */}
          <div className="grid grid-cols-2 gap-x-8">
            <InfoField label="Director Name" value={director.name} />
            <InfoField label="Father name" value={director.fatherName} />
            <InfoField label="Email" value={director.email} />
            <InfoField label="Phone No." value={director.phoneNo} />
            <InfoField label="Gender" value={director.gender} />
            <InfoField
              label="Date of Birth"
              value={formatDate(director.dateOfBirth)}
            />
            <InfoField label="Nationality" value={director.nationality} />
            {director.passportNo && (
              <InfoField label="Passport No" value={director.passportNo} />
            )}
            {/* PAN and Occupation Type together */}
            <InfoField label="PAN" value={director.pan} />
            <InfoField
              label="Occupation Type"
              value={director.occupationType}
            />
            <InfoField label="Place of Birth" value={director.placeOfBirth} />
            <InfoField
              label="Education qualification"
              value={director.educationQualification}
            />
            {/* Occupation Type and Present Address together */}
            <InfoField
              label="Present address"
              value={director.presentAddress}
            />
            <InfoField
              label="Permanent Address"
              value={director.permanentAddress}
            />
            <InfoField
              label="Duration of stay at present address"
              value={director.durationOfStayAtPresentAddress}
            />
            {director.previousResidenceAddress && (
              <InfoField
                label="If Duration of stay at present address- is less than a one year then address of previous residence"
                value={director.previousResidenceAddress}
              />
            )}
            {/* <InfoField
              label="% of Shareholding"
              value={`${director.shareholdingPercentage}%`}
            /> */}
          </div>

          <div className="grid grid-cols-2 gap-8 mt-6 pt-6g">
            {/* KYC Verified */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-secondary">
                KYC Verified
              </span>

              <Switch checked={kycVerified} onChange={handleKycToggle} />
            </div>

            {/* DSC Application */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-secondary">
                DSC Application
              </span>

              <Switch checked={dscApplication} onChange={handleDscToggle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
