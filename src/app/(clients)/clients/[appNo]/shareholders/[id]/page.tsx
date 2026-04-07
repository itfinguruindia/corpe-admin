"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shareholder } from "@/types/shareholder";
import { clientsApi } from "@/lib/api/clients";
import { InfoField, Switch } from "@/components/ui";

export default function ShareholderDetailPage() {
  const { appNo, id } = useParams();
  const router = useRouter();
  const [shareholder, setShareholder] = useState<Shareholder | null>(null);
  const [allShareholders, setAllShareholders] = useState<Shareholder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [kycVerified, setKycVerified] = useState(false);
  const [dscApplication, setDscApplication] = useState(false);

  useEffect(() => {
    const loadData = async () => {
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
              kycVerified: s.kycVerified ?? false,
              dscApplication: s.dscApplication ?? false,
              createdAt: undefined,
              updatedAt: undefined,
            }),
          );
          setAllShareholders(mappedShareholders);
          // Find the shareholder by id
          const foundShareholder = mappedShareholders.find(
            (sh: any) => sh.id === id,
          );
          setShareholder(foundShareholder || null);
          if (foundShareholder) {
            setKycVerified(foundShareholder.kycVerified);
            setDscApplication(foundShareholder.dscApplication);
          }
        } else {
          setAllShareholders([]);
          setShareholder(null);
        }
      } catch (error) {
        console.error("Error fetching shareholder:", error);
        setAllShareholders([]);
        setShareholder(null);
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
      await clientsApi.updateShareholderStatus(appNo as string, id as string, {
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
      await clientsApi.updateShareholderStatus(appNo as string, id as string, {
        dscApplication: newValue,
      });
      setDscApplication(newValue);
    } catch (error) {
      console.error("Error updating DSC status:", error);
    }
  };

  const handleShareholderChange = (shareholderId: string) => {
    router.push(`/clients/${appNo}/shareholders/${shareholderId}`);
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

  if (!shareholder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Shareholder not found</div>
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
          {allShareholders.map((sh) => (
            <button
              key={sh.id}
              onClick={() => handleShareholderChange(sh.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                sh.id === shareholder.id
                  ? "bg-linear-to-br from-white to-orange-100 text-secondary shadow-md"
                  : "bg-white text-secondary hover:shadow-md"
              }`}
            >
              Shareholder {sh.shareholderNumber}
            </button>
          ))}
        </div>

        {/* Shareholder Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-secondary">
                Shareholder
              </h2>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push(`/clients/${appNo}/shareholders`)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                View more Shareholders
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/clients/${appNo}/shareholders/${shareholder.id}/documents`,
                  )
                }
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Documents
              </button>
            </div>
          </div>

          {/* Shareholders Count */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Shareholders {allShareholders.length}
            </h3>
          </div>

          {/* Shareholder Information */}
          <div className="space-y-0">
            {shareholder.din && (
              <InfoField label="DIN" value={shareholder.din} />
            )}
            <InfoField
              label="Shareholder Name"
              value={shareholder.shareholderName}
            />
            <InfoField label="Father name" value={shareholder.fatherName} />
            <InfoField label="Email" value={shareholder.email} />
            <InfoField label="Phone No." value={shareholder.phoneNo} />
            <InfoField label="Gender" value={shareholder.gender} />
            <InfoField
              label="Date of Birth"
              value={formatDate(shareholder.dateOfBirth)}
            />
            <InfoField label="Nationality" value={shareholder.nationality} />
            {shareholder.passportNo && (
              <InfoField label="Passport No" value={shareholder.passportNo} />
            )}
            <InfoField
              label="Occupation Type"
              value={shareholder.occupationType}
            />
            <InfoField
              label="Place of Birth"
              value={shareholder.placeOfBirth}
            />
            <InfoField
              label="Education qualification"
              value={shareholder.educationQualification}
            />
            <InfoField
              label="Present address"
              value={shareholder.presentAddress}
            />
            <InfoField
              label="Permanent Address"
              value={shareholder.permanentAddress}
            />
            <InfoField label="PAN" value={shareholder.pan} />
            <InfoField
              label="Duration of stay at present address"
              value={shareholder.durationOfStayAtPresentAddress}
            />
            {shareholder.previousResidenceAddress && (
              <InfoField
                label="If Duration of stay at present address- is less than a one year then address of previous residence"
                value={shareholder.previousResidenceAddress}
              />
            )}
            <InfoField
              label="% of Shareholding"
              value={`${shareholder.shareholdingPercentage}%`}
            />
          </div>

          {/* KYC and DSC Toggles */}
          <div className="grid grid-cols-2 gap-8 mt-6 pt-6">
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
