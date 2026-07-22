"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import { Director } from "@/types/director";
import { clientsApi } from "@/lib/api/clients";
import { InfoField, Switch, Chip } from "@/components/ui";
import CustomSelect from "@/components/ui/CustomSelect";
import FixedBackButton from "@/components/ui/FixedBackButton";
import { useClientTabEdit } from "@/hooks/useClientTabEdit";
import { useClientCompanyLabels } from "@/contexts/ClientCompanyTypeContext";
import { matchesStakeholderId, toStakeholderId } from "@/utils/stakeholderIds";

export default function DirectorDetailPage() {
  const { appNo, id } = useParams();
  const router = useRouter();
  const { labels } = useClientCompanyLabels();
  const { requireEdit, canEdit } = useClientTabEdit("director");
  const [director, setDirector] = useState<Director | null>(null);
  const [allDirectors, setAllDirectors] = useState<Director[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDIN, setHasDIN] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [dscApplication, setDscApplication] = useState(false);
  const [dinStatus, setDinStatus] = useState<string>("Pending");
  const [isStage2Enabled, setIsStage2Enabled] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Use the same API as the all directors listing page
        const response = await clientsApi.getDirectorAndShareHolders(
          appNo as string,
          false,
        );
        if (
          response &&
          response.data &&
          Array.isArray(response.data.directors)
        ) {
          const mappedDirectors = response.data.directors.map(
            (d: any, idx: number) => ({
              id: toStakeholderId(d, idx),
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
              isBankSigningAuthority: d.isBankSigningAuthority ?? false,
              dinStatus: d.dinStatus || "Pending",
              isDinActivationFeePaid: d.isDinActivationFeePaid ?? false,
              isCommitted: d.isCommitted ?? false,
              createdAt: undefined,
              updatedAt: undefined,
            }),
          );
          setAllDirectors(mappedDirectors);
          // Find the director by id
          const foundDirector = mappedDirectors.find(
            (dir: Director, idx: number) =>
              String(dir.id) === String(id) ||
              matchesStakeholderId(response.data.directors[idx], String(id)),
          );
          setDirector(foundDirector || null);
          if (foundDirector) {
            setHasDIN(foundDirector.hasDIN);
            setKycVerified(foundDirector.kycVerified);
            setDscApplication(foundDirector.dscApplication);
            const effectiveDinStatus =
              foundDirector.dinStatus === "Inactive" &&
              foundDirector.isDinActivationFeePaid
                ? "In Progress"
                : foundDirector.dinStatus || "Pending";
            setDinStatus(effectiveDinStatus);
          }
        } else {
          setAllDirectors([]);
          setDirector(null);
        }

        try {
          const trackerRes = await clientsApi.getTrackingStatus(
            appNo as string,
          );
          if (trackerRes) {
            const activeStage =
              trackerRes.stages &&
              typeof trackerRes.currentStageIndex === "number"
                ? trackerRes.stages[trackerRes.currentStageIndex]
                : null;
            const isStage2 = activeStage?.stageId === "stage_2_documents_kyc";
            setIsStage2Enabled(isStage2);
          } else {
            setIsStage2Enabled(false);
          }
        } catch (trackerErr) {
          console.error("Error fetching tracker status:", trackerErr);
          setIsStage2Enabled(false);
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
    if (!requireEdit()) return;
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
    if (!requireEdit()) return;
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

  const handleDinStatusChange = async (newValue: string) => {
    if (!isStage2Enabled || !director?.isCommitted) return;
    if (!requireEdit()) return;
    try {
      await clientsApi.updateDirectorStatus(appNo as string, id as string, {
        dinStatus: newValue,
      });
      setDinStatus(newValue);
    } catch (error) {
      console.error("Error updating DIN status:", error);
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
        <div className="text-xl text-gray-600">{labels.directorNotFound}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <FixedBackButton
            href={`/clients/${appNo}?tab=directors`}
            label={`Back to ${labels.directors}`}
          />
          <h1 className="text-3xl font-bold text-primary">
            <Link
              href={`/clients/${appNo}?tab=tracking-status`}
              className="hover:underline"
            >
              {appNo}
            </Link>
          </h1>
        </div>

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
              {labels.directorWithNumber(dir.directorNumber)}
            </button>
          ))}
        </div>

        {/* Director Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-secondary">
                {labels.directorWithNumber(director.directorNumber)}
              </h2>
              {director.isBankSigningAuthority && (
                <Chip label="Bank Signing Authority" variant="blue" />
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push(`/clients/${appNo}/directors`)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {labels.viewMoreDirectors}
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
                {labels.doYouHaveDin}
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
            <div className="pl-4 flex items-center justify-between gap-4">
              <InfoField
                label={labels.din}
                value={director?.din || "N/A"}
                border={false}
              />
              {hasDIN && (
                <div className="flex flex-col gap-1 min-w-[150px]">
                  <span className="text-[12px] font-semibold text-gray-500">
                    {labels.dinStatus}
                  </span>
                  <CustomSelect
                    ariaLabel={labels.dinStatus}
                    value={dinStatus}
                    onChange={handleDinStatusChange}
                    options={[
                      { id: "Pending", label: "Pending" },
                      { id: "Active", label: "Active" },
                      { id: "Inactive", label: "Inactive" },
                      { id: "In Progress", label: "In Progress" },
                    ]}
                    isDisabled={
                      !isStage2Enabled ||
                      !director.isCommitted ||
                      !canEdit
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Director Information */}
          <div className="grid grid-cols-2 gap-x-8">
            <InfoField
              label={labels.directorName}
              value={String(director.directorName)}
            />
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

              <Switch
                checked={kycVerified}
                onChange={handleKycToggle}
                disabled={!canEdit}
              />
            </div>

            {/* DSC Application */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-secondary">
                DSC Application
              </span>

              <Switch
                checked={dscApplication}
                onChange={handleDscToggle}
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
