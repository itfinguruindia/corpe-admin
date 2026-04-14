"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CompanyOverview } from "@/types/company";
import { clientsApi } from "@/lib/api/clients";
import { InfoField, Switch } from "@/components/ui";
import { Chip } from "@/components/ui";

export default function CompanyOverviewPage() {
  const { appNo } = useParams();
  const [companyData, setCompanyData] = useState<CompanyOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allDocsVerify, setAllDocsVerified] = useState(false);

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setIsLoading(true);
        const response = await clientsApi.getCompanyOverview(appNo as string);
        if (response && response.data) {
          // Map API response to CompanyOverview type
          const apiData = response.data;
          const mapped: CompanyOverview = {
            id: apiData._id,
            applicationNo: appNo as string,
            allDocsVerify: apiData.areAllDocsVerified ?? false,
            cityTown:
              apiData.corporateStructure?.registeredOffice?.locality || "-",
            district:
              apiData.corporateStructure?.registeredOffice?.district || "-",
            pincode:
              apiData.corporateStructure?.registeredOffice?.pincode || "-",
            state: apiData.corporateStructure?.registeredOffice?.state || "-",
            entityType: apiData.companyType || "-",
            cinLlpin: "-", // Dummy
            isIncorporated: false, // Dummy
            industry: "-", // Dummy
            incorporationDate: "2026-01-01", // Dummy
            registeredOffice:
              apiData.corporateStructure?.registeredOffice?.locality || "-",
            branchOffice: "-", // Dummy
            status: apiData.companyStatus,
            paymentStatus: "Pending", // Dummy
            planChosen: "-", // Dummy
            contactNo: apiData.client?.phoneNumber || "-",
            contactEmail: apiData.client?.email || "-",
            clientName: `${apiData.client?.firstName || "-"} ${apiData.client?.lastName || "-"}`,
            capitalDetails:
              apiData.corporateStructure?.capitalDetails?.authorizedCapital ||
              0,
            paidUpCapital:
              apiData.corporateStructure?.capitalDetails?.paidUpCapital || 0,
            planChoose: "Basic", // Dummy
            packageType: "Full payment", // Dummy
            createdAt: undefined,
            updatedAt: undefined,
          };
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

    if (appNo) {
      loadCompanyData();
    }
  }, [appNo]);

  const handleDocsToggle = async () => {
    const newValue = !allDocsVerify;
    try {
      await clientsApi.updateAllDocsVerified(appNo as string, newValue);
      setAllDocsVerified(newValue);
    } catch (error) {
      console.error("Error updating all docs verified:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN").format(amount);
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

  if (!companyData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Company not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {companyData.applicationNo}
            </h1>
            <h2 className="text-lg text-secondary font-medium">
              Company Overview
            </h2>
          </div>

          {/* KYC Verified Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-medium text-gray-700">
              All Docs Verified
            </span>
            <Switch checked={allDocsVerify} onChange={handleDocsToggle} />
          </div>
        </div>

        {/* Company Details */}
        <div className="space-y-0">
          <InfoField label="City/Town" value={companyData.cityTown} />
          <InfoField label="District" value={companyData.district} />
          <InfoField label="Pincode" value={companyData.pincode} />
          <InfoField label="State" value={companyData.state} />
          <InfoField label="Entity Type" value={companyData.entityType} />

          <InfoField label="Industry" value={companyData.industry} />

          <InfoField
            label="Registered Office"
            value={companyData.registeredOffice}
          />
          <InfoField
            label="Branch Office"
            value={companyData.branchOffice || "N/A"}
          />

          <InfoField label="Plan Choose" value={companyData.planChosen} />
          <InfoField label="Contact No" value={companyData.contactNo} />
          <InfoField label="Contact Email" value={companyData.contactEmail} />
          <InfoField label="Client Name" value={companyData.clientName} />
          <InfoField
            label="Capital Details"
            value={formatCurrency(companyData.capitalDetails)}
            sublabel="(Recommendation - Minimum 1 Lakh INR)"
            sublabelColor="text-red-500"
          />
          <InfoField
            label="Paid up Capital"
            value={formatCurrency(companyData.paidUpCapital)}
            sublabel="(Recommendation - Minimum 1 Lakh INR)"
            sublabelColor="text-red-500"
          />
          {/* start here */}
          <InfoField
            label="CIN / LLPIN"
            value={companyData.isIncorporated ? companyData.cinLlpin : "-"}
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
              label={companyData.status}
              variant={companyData.status === "Approved" ? "green" : "gray"}
            />
          </div>
          {/*Payment Status as Chip */}
          <div className="flex items-center justify-between border-b border-[#F9A826] py-4 max-w-xl">
            <label className="text-sm font-semibold text-gray-900">
              Payment Status
            </label>
            <Chip
              label={companyData.paymentStatus}
              variant={
                companyData.paymentStatus === "Approved" ? "green" : "gray"
              }
            />
          </div>

          <InfoField label="Plan Choose" value={companyData.planChoose} />
          <InfoField label="Package Type" value={companyData.packageType} />
        </div>
      </div>
    </div>
  );
}
