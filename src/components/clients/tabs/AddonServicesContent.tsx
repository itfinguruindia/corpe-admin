"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, FileCheck2, Loader2, ShieldCheck } from "lucide-react";
import { Chip, Spinner } from "@heroui/react";

import { useClientCompanyLabels } from "@/contexts/ClientCompanyTypeContext";
import { clientsApi } from "@/lib/api/clients";
import axiosInstance from "@/lib/axios";
import { isAddonAvailableForRegistrationType } from "@/constants/addonRegistry";
import { AddonServiceId } from "@/types/enums";

interface AddonServicesContentProps {
  appNo: string;
}

const BANK_LABELS: Record<string, string> = {
  icici: "ICICI Bank",
  hdfc: "HDFC Bank",
  axis: "Axis Bank",
  kotak: "Kotak Mahindra Bank",
  citi: "Citibank (Institutional)",
  razorpayx: "RazorpayX",
};

export default function AddonServicesContent({ appNo }: AddonServicesContentProps) {
  const { isAddonOnly, registrationType } = useClientCompanyLabels();
  const [loading, setLoading] = useState(true);
  const [gstData, setGstData] = useState<any>(null);
  const [bankData, setBankData] = useState<any>(null);

  const canViewBankSetup = isAddonAvailableForRegistrationType(AddonServiceId.BANK_ACCOUNT_SETUP, registrationType);

  useEffect(() => {
    async function loadAddons() {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [clientsApi.getGstRegistration(appNo)];
        if (canViewBankSetup) {
          promises.push(axiosInstance.get(`/admin/clients/${appNo}/bank-account-setup`));
        }

        const results = await Promise.allSettled(promises);

        if (results[0]?.status === "fulfilled") {
          const fulfilledGst = results[0] as PromiseFulfilledResult<any>;
          setGstData(fulfilledGst.value);
        }

        if (canViewBankSetup && results[1]?.status === "fulfilled") {
          const fulfilledBank = results[1] as PromiseFulfilledResult<any>;
          const data = fulfilledBank.value?.data?.data || fulfilledBank.value?.data;
          setBankData(data);
        }
      } catch (err) {
        console.error("Error loading client addon services:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAddons();
  }, [appNo, canViewBankSetup]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800">Client Add-on Services</h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage subscribed add-on services and setup applications for client application <span className="font-semibold">{appNo}</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GST Registration Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800">GST Registration</h3>
                    <p className="text-xs text-gray-500">Government Tax Registration Add-on</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${gstData?.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                    }`}
                >
                  {gstData?.status === "completed" ? "Completed" : "Open"}
                </span>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">Legal Name:</span>
                  <span className="font-semibold text-gray-800 truncate max-w-50">
                    {gstData?.gstDetails?.legalName || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ARN:</span>
                  <span className="font-mono font-medium text-gray-800">{gstData?.arn || ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Status:</span>
                  <span
                    className={`font-semibold ${gstData?.isPaid ? "text-emerald-600" : "text-amber-600"
                      }`}
                  >
                    {gstData?.isPaid ? "Paid" : "Payment Pending"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link
                href={`/addons/gst/${appNo}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white transition shadow-sm"
              >
                Manage GST Service <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Bank Account Setup Card */}
          {canViewBankSetup && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-800">Bank Account Setup</h3>
                      <p className="text-xs text-gray-500">Corporate Current Account Opening</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bankData?.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                      }`}
                  >
                    {bankData?.status === "completed" ? "Completed" : "Open"}
                  </span>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Selected Bank:</span>
                    <span className="font-semibold text-gray-800">
                      {BANK_LABELS[bankData?.bankId] || bankData?.bankId || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Type:</span>
                    <span className="font-medium text-gray-800">
                      {bankData?.accountDetails?.accountType || "Current Account"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Status:</span>
                    <span
                      className={`font-semibold ${bankData?.isPaid ? "text-emerald-600" : "text-amber-600"
                        }`}
                    >
                      {bankData?.isPaid ? "Paid" : "Payment Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link
                  href={`/addons/bank-account/${appNo}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white transition shadow-sm"
                >
                  Manage Bank Account Service <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
