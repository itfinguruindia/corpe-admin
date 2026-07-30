"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shareholder } from "@/types/shareholder";
import { clientsApi } from "@/lib/api/clients";
import { InfoField, Switch } from "@/components/ui";
import { useClientTabEdit } from "@/hooks/useClientTabEdit";
import { useClientCompanyLabels } from "@/contexts/ClientCompanyTypeContext";
import { matchesStakeholderId, toStakeholderId } from "@/utils/stakeholderIds";
import { isSameStakeholderPerson } from "@/utils/stakeholderMatch";

export default function ShareholderDetailPage() {
  const { appNo, id } = useParams();
  const { labels } = useClientCompanyLabels();
  const { requireEdit, canEdit } = useClientTabEdit("shareholder");
  const [shareholder, setShareholder] = useState<Shareholder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [kycVerified, setKycVerified] = useState(false);
  const [dscApplication, setDscApplication] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await clientsApi.getDirectorAndShareHolders(
          appNo as string,
          false,
        );
        if (
          response &&
          response.data &&
          Array.isArray(response.data.shareholders)
        ) {
          const directors = response.data.directors || [];

          const mappedShareholders = response.data.shareholders.map(
            (s: any, idx: number) => {
              const linkedDirIdx = directors.findIndex((d: any) =>
                isSameStakeholderPerson(s, d),
              );
              return {
                id: toStakeholderId(s, idx),
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
                isAlsoDirector: linkedDirIdx !== -1,
                linkedDirectorId:
                  linkedDirIdx !== -1
                    ? toStakeholderId(directors[linkedDirIdx], linkedDirIdx)
                    : null,
                linkedDirectorNumber:
                  linkedDirIdx !== -1 ? linkedDirIdx + 1 : null,
                createdAt: undefined,
                updatedAt: undefined,
              };
            },
          );
          const foundShareholder = mappedShareholders.find(
            (sh: Shareholder, idx: number) =>
              String(sh.id) === String(id) ||
              matchesStakeholderId(response.data.shareholders[idx], String(id)),
          );
          setShareholder(foundShareholder || null);
          if (foundShareholder) {
            setKycVerified(foundShareholder.kycVerified);
            setDscApplication(foundShareholder.dscApplication);
          }
        } else {
          setShareholder(null);
        }
      } catch (error) {
        console.error("Error fetching shareholder:", error);
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
    if (!requireEdit()) return;
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
    if (!requireEdit()) return;
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

  if (!shareholder) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-base text-slate-500">
          {labels.shareholderNotFound}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {labels.shareholderWithNumber(shareholder.shareholderNumber)}
            {shareholder.shareholderName &&
            shareholder.shareholderName !== "-" ? (
              <span className="ml-2 font-normal text-slate-500">
                · {shareholder.shareholderName}
              </span>
            ) : null}
          </h2>
          {shareholder.isAlsoDirector && (
            <span className="rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
              {labels.alsoADirector}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-6 sm:px-8">
        <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
          {shareholder.din && (
            <InfoField label={labels.din} value={shareholder.din} />
          )}
          <InfoField
            label={labels.shareholderName}
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
          <InfoField label="Place of Birth" value={shareholder.placeOfBirth} />
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

        {shareholder.isAlsoDirector ? (
          <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <p className="font-semibold">
                KYC &amp; DSC are managed from the{" "}
                {labels.director.toLowerCase()} profile
              </p>
              <p className="mt-1 text-blue-800/90">
                This person is also{" "}
                {shareholder.linkedDirectorNumber
                  ? labels.directorWithNumber(shareholder.linkedDirectorNumber)
                  : `a ${labels.director.toLowerCase()}`}
                . Changes made there sync automatically here and in tracking.
              </p>
              {shareholder.linkedDirectorId && (
                <Link
                  href={`/clients/${appNo}/directors/${shareholder.linkedDirectorId}`}
                  className="mt-2 inline-flex text-sm font-semibold text-[#F46A45] hover:underline"
                >
                  Open {labels.director.toLowerCase()} profile →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-secondary">
                  KYC Verified
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {kycVerified ? "Verified" : "Pending"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-secondary">
                  DSC Application
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {dscApplication ? "Applied" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        ) : (
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
          </div>
        )}
      </div>
    </div>
  );
}
