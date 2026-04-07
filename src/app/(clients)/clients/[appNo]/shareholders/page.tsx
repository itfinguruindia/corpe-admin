"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shareholder } from "@/types/shareholder";
import { clientsApi } from "@/lib/api/clients";

export default function ShareholdersPage() {
  const { appNo } = useParams();
  const router = useRouter();
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeShareholder, setActiveShareholder] = useState<number>(1);

  useEffect(() => {
    const loadShareholders = async () => {
      try {
        setIsLoading(true);
        const response = await clientsApi.getDirectorAndShareHolders(
          appNo as string,
        );
        if (
          response &&
          response.data &&
          Array.isArray(response.data.shareholders)
        ) {
          const mappedShareholders = response.data.shareholders.map(
            (s: any, idx: number) => ({
              id: s.shareholderId || `${idx}`,
              applicationNo: appNo as string,
              shareholderNumber: idx + 1,
              hasDIN: false,
              din: s.dinNumber || "",
              shareholderName: s.name || "-",
              fatherName: s.fatherName || "-",
              email: s.email || "-",
              phoneNo: s.phoneNumber || "-",
              gender: s.gender
                ? s.gender.charAt(0).toUpperCase() + s.gender.slice(1)
                : "Other",
              dateOfBirth: s.dateOfBirth || "-",
              nationality: s.nationality || "-",
              passportNo: s.passportNumber || "-",
              occupationType: s.occupationType || "-",
              placeOfBirth: s.placeOfBirth?.city || "-",
              educationQualification: s.educationQualification || "-",
              presentAddress: s.presentAddress || "-",
              permanentAddress: s.permanentAddress || "-",
              pan: s.panNumber || "-",
              durationOfStayAtPresentAddress: `${s.durationOfStay?.years || 0} years, ${s.durationOfStay?.months || 0} months`,
              previousResidenceAddress: s.previousAddress || "-",
              shareholdingPercentage: s.proposedShareholdingPercentage
                ? Number(s.proposedShareholdingPercentage)
                : 0,
              kycVerified: false,
              dscApplication: false,
              createdAt: undefined,
              updatedAt: undefined,
            }),
          );
          setShareholders(mappedShareholders);
        } else {
          setShareholders([]);
        }
      } catch (error) {
        console.error("Error fetching shareholders:", error);
        setShareholders([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (appNo) {
      loadShareholders();
    }
  }, [appNo]);

  const handleShareholderClick = (shareholder: Shareholder) => {
    setActiveShareholder(shareholder.shareholderNumber);
    router.push(`/clients/${appNo}/shareholders/${shareholder.id}`);
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

        {/* Shareholder Tabs */}
        <div className="flex gap-4 mb-6">
          {shareholders.map((shareholder) => (
            <button
              key={shareholder.id}
              onClick={() => handleShareholderClick(shareholder)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeShareholder === shareholder.shareholderNumber
                  ? "bg-gradient-to-br from-white to-orange-100 text-secondary shadow-md"
                  : "bg-white text-secondary hover:shadow-md"
              }`}
            >
              Shareholder {shareholder.shareholderNumber}
            </button>
          ))}
        </div>

        {/* Shareholders List View */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary">
              Shareholders {shareholders.length}
            </h2>
          </div>

          <div className="space-y-4">
            {shareholders.map((shareholder) => (
              <div
                key={shareholder.id}
                onClick={() => handleShareholderClick(shareholder)}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#F46A45] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Shareholder {shareholder.shareholderNumber}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {shareholder.shareholderName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {shareholder.email} • {shareholder.phoneNo}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      Shareholding: {shareholder.shareholdingPercentage}%
                    </div>
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
