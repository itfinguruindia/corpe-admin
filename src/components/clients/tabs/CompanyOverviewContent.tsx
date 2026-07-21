"use client";

import { useEffect, useState } from "react";
import { CompanyOverview } from "@/types/company";
import { clientsApi } from "@/lib/api/clients";
import { InfoField } from "@/components/ui";
import { Chip, Spinner, Switch } from "@heroui/react";
import { useClientTabEdit } from "@/hooks/useClientTabEdit";
import { useClientCompanyLabels } from "@/contexts/ClientCompanyTypeContext";
import { isLlpCompanyType } from "@/utils/companyTypeLabels";

interface CompanyOverviewContentProps {
  appNo: string;
}

export default function CompanyOverviewContent({
  appNo,
}: CompanyOverviewContentProps) {
  const { requireEdit, canEdit } = useClientTabEdit("company");
  const { labels } = useClientCompanyLabels();
  const [companyData, setCompanyData] = useState<CompanyOverview | null>(null);
  const [resolvedCompanyType, setResolvedCompanyType] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [allDocsVerify, setAllDocsVerified] = useState(false);


  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setIsLoading(true);
        const response = await clientsApi.getCompanyOverview(appNo);
        if (response && response.data) {
          // Map API response to CompanyOverview type
          const apiData = response.data;
          // Fetch real payment status
          let paymentStatus = "Pending";
          try {
            const psRes = await clientsApi.getPaymentStatus(appNo);
            paymentStatus = psRes?.status ?? "Pending";
          } catch { /* keep default */ }

          const isLlp = isLlpCompanyType(apiData.companyType);
          const capitalDetails =
            apiData.corporateStructure?.capitalDetails || {};

          const mapped: CompanyOverview = {
            id: apiData._id,
            applicationNo: appNo,
            allDocsVerify: apiData.areAllDocsVerified ?? false,
            cityTown:
              apiData.corporateStructure?.registeredOffice?.locality || "-",
            district:
              apiData.corporateStructure?.registeredOffice?.district || "-",
            pincode:
              apiData.corporateStructure?.registeredOffice?.pincode || "-",
            state: apiData.corporateStructure?.registeredOffice?.state || "-",
            policeStationJurisdiction:
              apiData.corporateStructure?.registeredOffice
                ?.policeStationJurisdiction || "-",
            entityType: apiData.companyType || "-",
            cinLlpin: apiData.cinLlpin || null,
            isIncorporated: !!apiData.cinLlpin,
            industry: apiData.industry || "-",
            incorporationDate: apiData.incorporationDate || null,
            registeredOffice:
              apiData.corporateStructure?.registeredOffice?.locality || "-",
            branchOffice: "-",
            status: apiData.companyStatus,
            paymentStatus,
            planChosen: apiData.planName || "-",
            contactNo: apiData.client?.phoneNumber || "-",
            contactEmail: apiData.client?.email || "-",
            officePhone:
              apiData.corporateStructure?.registeredOffice?.officePhone || "-",
            officeEmail:
              apiData.corporateStructure?.registeredOffice?.officeEmail || "-",
            clientName: `${apiData.client?.firstName || ""} ${apiData.client?.lastName || ""}`.trim() || "-",
            capitalDetails: isLlp
              ? capitalDetails.obligationOfContribution || 0
              : capitalDetails.authorizedCapital || 0,
            paidUpCapital: isLlp
              ? 0
              : capitalDetails.paidUpCapital || 0,
            planChoose: apiData.planName || "-",
            packageType: apiData.packageType || "-",
            createdAt: apiData.createdAt,
            updatedAt: apiData.updatedAt,
          };
          setResolvedCompanyType(apiData.companyType ?? null);
          setCompanyData(mapped);
          setAllDocsVerified(mapped.allDocsVerify);
        } else {
          setCompanyData(null);
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
        setCompanyData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, [appNo]);

  const handleDocsToggle = async (newValue: boolean) => {
    if (!requireEdit()) return;
    try {
      await clientsApi.updateAllDocsVerified(appNo, newValue);
      setAllDocsVerified(newValue);
    } catch (error) {
      console.error("Error updating all docs verified:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN").format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Company not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 border-b pb-6">
          <div>
            <h2 className="text-lg text-secondary font-medium">
              Company Overview
            </h2>
          </div>

          {/* KYC Verified Toggle */}
          <Switch
            isSelected={allDocsVerify}
            onChange={handleDocsToggle}
            isDisabled={!canEdit}
          >
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Content className="text-lg font-medium text-gray-700">
              All Docs Verified
            </Switch.Content>
          </Switch>
        </div>

        {/* Company Details */}
        <div className="space-y-0">
          <InfoField label="City/Town" value={companyData.cityTown} />
          <InfoField label="District" value={companyData.district} />
          <InfoField label="Pincode" value={companyData.pincode} />
          <InfoField label="State" value={companyData.state} />
          <InfoField
            label="Jurisdiction of Police station"
            value={companyData.policeStationJurisdiction}
          />
          <InfoField
            label="Entity Type"
            value={labels.formatEntityType(
              resolvedCompanyType || companyData.entityType,
            )}
          />

          <InfoField
            label="Registered Office"
            value={companyData.registeredOffice}
          />
          <InfoField
            label="Branch Office"
            value={companyData.branchOffice || "N/A"}
          />
          <InfoField label="Contact No" value={companyData.contactNo} />
          <InfoField label="Contact Email" value={companyData.contactEmail} />
          <InfoField
            label="Office Phone Number"
            value={companyData.officePhone || "-"}
          />
          <InfoField
            label="Office Email"
            value={companyData.officeEmail || "-"}
          />
          <InfoField label="Client Name" value={companyData.clientName} />
          <InfoField
            label={labels.capitalDetailsLabel}
            value={formatCurrency(companyData.capitalDetails)}
            sublabel="(Recommendation - Minimum 1 Lakh INR)"
            sublabelColor="text-red-500"
          />
          {labels.showPaidUpCapital && (
            <InfoField
              label={labels.paidUpCapitalLabel}
              value={formatCurrency(companyData.paidUpCapital)}
              sublabel="(Recommendation - Minimum 1 Lakh INR)"
              sublabelColor="text-red-500"
            />
          )}
          <InfoField
            label={labels.cinLlpinLabel}
            value={
              companyData.isIncorporated ? (companyData.cinLlpin ?? "-") : "-"
            }
            sublabel={
              !companyData.isIncorporated
                ? '(will show "-" if not incorporated )'
                : undefined
            }
          />

          <InfoField
            label="Incorporation Date"
            value={formatDate(companyData.incorporationDate)}
          />

          {/* Status as Chip */}
          <div className="flex items-center justify-between border-b border-[#F9A826] py-4 max-w-xl">
            <label className="text-sm font-semibold text-gray-900">
              Status
            </label>
            <Chip
              variant="soft"
              size="sm"
              className={
                companyData.status === "Approved"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }
            >
              {companyData.status}
            </Chip>
          </div>
          {/* Payment Status as Chip */}
          <div className="flex items-center justify-between border-b border-[#F9A826] py-4 max-w-xl">
            <label className="text-sm font-semibold text-gray-900">
              Payment Status
            </label>
            <Chip
              variant="soft"
              size="sm"
              className={
                companyData.paymentStatus === "Approved"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }
            >
              {companyData.paymentStatus}
            </Chip>
          </div>

          <InfoField label="Plan Choose" value={companyData.planChoose} />
          <InfoField label="Package Type" value={companyData.packageType} />
        </div>
      </div>
    </div>
  );
}
