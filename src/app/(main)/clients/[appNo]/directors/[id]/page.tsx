"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Director } from "@/types/director";
import { clientsApi } from "@/lib/api/clients";
import { InfoField, Switch, Chip } from "@/components/ui";
import CustomSelect from "@/components/ui/CustomSelect";
import { useClientTabEdit } from "@/hooks/useClientTabEdit";
import { useClientCompanyLabels } from "@/contexts/ClientCompanyTypeContext";
import { matchesStakeholderId, toStakeholderId } from "@/utils/stakeholderIds";
import { isSameStakeholderPerson } from "@/utils/stakeholderMatch";

export default function DirectorDetailPage() {
  const { appNo, id } = useParams();
  const { labels } = useClientCompanyLabels();
  const { requireEdit, canEdit } = useClientTabEdit("director");
  const [director, setDirector] = useState<Director | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDIN, setHasDIN] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [dscApplication, setDscApplication] = useState(false);
  const [dinStatus, setDinStatus] = useState<string>("Pending");
  const [isAlsoShareholder, setIsAlsoShareholder] = useState(false);
  const [linkedShareholderNumber, setLinkedShareholderNumber] = useState<
    number | null
  >(null);

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
          const shareholders = response.data.shareholders || [];
          const mappedDirectors = response.data.directors.map(
            (d: any, idx: number) => {
              const linkedShIdx = shareholders.findIndex((s: any) =>
                isSameStakeholderPerson(d, s),
              );
              return {
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
                isForeignResident: Boolean(
                  d.isForeignResident || d.isForeignEntity,
                ),
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
                isAlsoShareholder: linkedShIdx !== -1,
                linkedShareholderId:
                  linkedShIdx !== -1
                    ? toStakeholderId(shareholders[linkedShIdx], linkedShIdx)
                    : null,
                linkedShareholderNumber:
                  linkedShIdx !== -1 ? linkedShIdx + 1 : null,
                dinStatus: d.dinStatus || "Pending",
                isDinActivationFeePaid: d.isDinActivationFeePaid ?? false,
                isCommitted: d.isCommitted ?? false,
                createdAt: undefined,
                updatedAt: undefined,
              };
            },
          );
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
            setIsAlsoShareholder(Boolean(foundDirector.isAlsoShareholder));
            setLinkedShareholderNumber(
              foundDirector.linkedShareholderNumber ?? null,
            );
            const effectiveDinStatus =
              foundDirector.dinStatus === "Inactive" &&
              foundDirector.isDinActivationFeePaid
                ? "In Progress"
                : foundDirector.dinStatus || "Pending";
            setDinStatus(effectiveDinStatus);
          } else {
            setIsAlsoShareholder(false);
            setLinkedShareholderNumber(null);
          }
        } else {
          setDirector(null);
        }
      } catch (error) {
        console.error("Error fetching director:", error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-base text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!director) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-base text-slate-500">{labels.directorNotFound}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {labels.directorWithNumber(director.directorNumber)}
            {director.directorName && director.directorName !== "-" ? (
              <span className="ml-2 font-normal text-slate-500">
                · {director.directorName}
              </span>
            ) : null}
          </h2>
          {director.isBankSigningAuthority && (
            <Chip label="Bank Signing Authority" variant="blue" />
          )}
          {director.isForeignResident && (
            <Chip label="NRI / Foreign Resident" variant="blue" />
          )}
        </div>
      </div>

      <div className="px-5 py-6 sm:px-8">
        {/* DIN — read-only from client; status is admin-managed when DIN exists */}
        <div className="mb-6 grid w-full grid-cols-1 gap-4 border-b border-slate-100 pb-5 md:grid-cols-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">
              {labels.din}
            </span>
            {hasDIN ? (
              <>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  Provided by client
                </span>
                <span className="font-mono text-sm font-semibold text-slate-900">
                  {director.din && director.din !== "-" ? director.din : "—"}
                </span>
              </>
            ) : (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                Not provided by client
              </span>
            )}
          </div>
          <div className="flex min-w-[150px] flex-col gap-1">
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
              isDisabled={!canEdit}
            />
          </div>
        </div>

        {/* Director Information */}
        <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
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
          {(director.isForeignResident ||
            (director.passportNo && director.passportNo !== "-")) && (
            <InfoField label="Passport No" value={director.passportNo || "-"} />
          )}
          {!director.isForeignResident && (
            <InfoField label="PAN" value={director.pan} />
          )}
          <InfoField
            label="Occupation Type"
            value={director.occupationType}
          />
          <InfoField label="Place of Birth" value={director.placeOfBirth} />
          <InfoField
            label="Education qualification"
            value={director.educationQualification}
          />
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
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 border-t border-gray-100 pt-6 md:grid-cols-2">
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

          {isAlsoShareholder && (
            <div className="col-span-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              This person is also{" "}
              {linkedShareholderNumber
                ? labels.shareholderWithNumber(linkedShareholderNumber)
                : `a ${labels.shareholder.toLowerCase()}`}
              . KYC and DSC toggled here automatically sync to their{" "}
              {labels.shareholder.toLowerCase()} profile and tracking steps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
