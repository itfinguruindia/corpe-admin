"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  pricingPaymentService,
  PricingAndPaymentResponse,
  PaymentStep as BackendPaymentStep
} from "@/services/pricingPayment.service";
import { PricingPayment, PaymentStep as FrontendPaymentStep, StepStatus } from "@/types/pricingPayment";

import { InfoField, Chip, Switch } from "@/components/ui";
import { Lock, MoreVertical } from "lucide-react";
import { formatCurrency } from "@/utils/helpers";
import useSwal from "@/utils/useSwal";

export default function PricingAndPaymentPage() {
  const swal = useSwal();
  const { appNo } = useParams();
  const [pricingData, setPricingData] = useState<PricingPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [includeGST, setIncludeGST] = useState(false);

  useEffect(() => {
    const loadPricingData = async () => {
      if (!appNo) return;
      try {
        setIsLoading(true);
        const data = await pricingPaymentService.getPricingAndPayment(appNo as string);
        if (data) {
          setPricingData(mapBackendToFrontend(data));
        }
      } catch (error) {
        console.error("Error fetching pricing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPricingData();
  }, [appNo]);

  const mapBackendToFrontend = (data: PricingAndPaymentResponse): PricingPayment => {
    const { summary, steps } = data;

    const mapStatus = (status: string): StepStatus => {
      switch (status) {
        case "paid": return "Paid";
        case "pending": return "Pending";
        case "failed": return "Overdue";
        case "due": return "Pending";
        default: return "Pending";
      }
    };

    const paymentSteps: FrontendPaymentStep[] = steps.map((s: BackendPaymentStep) => ({
      step: s.stepNumber,
      installmentName: s.installmentName,
      amount: s.amount,
      triggerGate: s.triggerGate,
      effects: s.effects,
      status: mapStatus(s.status),
      action: s.status === "paid" ? "Payment Received" : "Send Payment Link",
      invoice: s.invoiceAvailable ? "Sent" : "Not Sent",
      paymentAlert: s.status === "paid" ? "Paid Confirmation" : (s.status === "failed" ? "Payment Failed" : "Awaiting"),
      paymentModeCapture: s.status === "paid" ? "Online" : "-", // Backend doesn't return mode yet in this API
    }));

    return {
      applicationNo: summary.applicationNo,
      companyName: summary.companyName || "N/A",
      entityType: summary.entityType || "N/A",
      plan: summary.plan,
      packageType: summary.packageType,
      totalPayable: summary.totalPayable,
      paid: summary.amountPaid,
      remainingBalance: summary.remainingBalance,
      status: summary.status,
      baseServiceFee: summary.baseServiceFee,
      gst: summary.gstAmount,
      finalPaidAmount: summary.finalPayableWithoutGST, // Frontend uses this for "Final Payable Amount" calculation
      isLocked: false, // Default to unlocked if not in API
      discount: summary.discountAmount,
      paymentSteps,
    };
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Complete":
      case "Completed":
        return "green";
      case "Active":
        return "blue";
      case "Awaiting":
        return "yellow";
      case "Blocked":
        return "red";
      default:
        return "gray";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!pricingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Pricing data not found for {appNo}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-6 border-b pb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {pricingData?.applicationNo}
          </h1>
          <h2 className="text-lg text-secondary font-medium">
            Pricing and Payment
          </h2>
        </div>

        {/* Pricing Details */}
        <div className="space-y-0">
          <InfoField label="Entity Type" value={pricingData.entityType} />
          <InfoField label="Company Name" value={pricingData.companyName} />
          <InfoField label="Plan" value={pricingData.plan} />
          <InfoField label="Package Type" value={pricingData.packageType} />

          {/* Status as Chip */}
          <div className="flex items-center justify-between border-b border-[#F9A826] py-4 max-w-xl">
            <label className="text-sm font-semibold text-gray-900">
              Status
            </label>
            <Chip
              label={pricingData.status}
              variant={getStatusVariant(pricingData.status)}
            />
          </div>
          <InfoField
            label="Base Service Fee"
            value={formatCurrency(pricingData.baseServiceFee)}
          />
          <InfoField
            label="Discount"
            value={formatCurrency(pricingData.discount || 0)}
            sublabel="(If any discount applied)"
            sublabelColor="text-blue-500"
          />
          <InfoField
            label="Total Payable"
            value={formatCurrency(pricingData.totalPayable)}
          />
          <InfoField
            label="GST"
            value={formatCurrency(pricingData.gst)}
            sublabel="(18% of Total payable fee)"
            sublabelColor="text-gray-500"
          />
          <InfoField
            label="Paid"
            value={formatCurrency(pricingData.paid)}
            sublabel="(Amount already paid)"
            sublabelColor="text-green-600"
          />
          <InfoField
            label="Remaining Balance"
            value={formatCurrency(pricingData.remainingBalance)}
            sublabel="(Remaining amount)"
            sublabelColor="text-red-500"
          />
          {/* Final Payable Amount with Lock Button */}
          <div className="border-b border-[#F9A826] py-4 max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col gap-3 min-w-11">
                <label className="text-sm font-semibold text-gray-900">
                  Final Payable Amount
                </label>
                <Switch
                  label="Include GST"
                  checked={includeGST}
                  onChange={setIncludeGST}
                />
              </div>
              <p className="text-base text-gray-700 font-bold">
                {formatCurrency(
                  includeGST
                    ? pricingData.finalPaidAmount * 1.18
                    : pricingData.finalPaidAmount,
                )}
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-all ${
                  pricingData.isLocked
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#F46A45] text-white hover:bg-[#e55a35]"
                }`}
                disabled={pricingData.isLocked}
              >
                <Lock size={16} />
                {pricingData.isLocked ? "Locked" : "Lock Payment"}
              </button>
            </div>
          </div>
          {/* Payment Steps Table */}
          {pricingData.paymentSteps && pricingData.paymentSteps.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-secondary">
                {pricingData.packageType === "Full Payment"
                  ? "Full Payment Steps"
                  : "Installment Payment Steps"}
              </h3>
              <div className="overflow-x-auto overflow-visible">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Step
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Installment Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Trigger Gate
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Effects
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Invoice
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Payment Alert
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Payment Mode
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingData.paymentSteps.map((step, index) => (
                      <tr
                        key={step.step}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {step.step}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {step.installmentName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatCurrency(step.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {step.triggerGate}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {step.effects}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Chip
                            label={step.status}
                            variant={
                              step.status === "Paid"
                                ? "green"
                                : step.status === "Pending"
                                  ? "yellow"
                                  : step.status === "Overdue"
                                    ? "red"
                                    : "blue"
                            }
                          />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {step.action === "Send Payment Link" ? (
                            <button
                              className="px-4 py-1.5 bg-[#F46A45] text-white text-sm rounded-md hover:bg-[#e55a35] transition-colors"
                              onClick={() => {
                                // TODO: Implement send payment link functionality
                                console.log(
                                  `Sending payment link for step ${step.step}`,
                                );
                              }}
                            >
                              Send Payment Link
                            </button>
                          ) : (
                            <span className="text-gray-700">{step.action}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 relative">
                          <div className="flex items-center gap-2 relative group">
                            <span>{step.invoice}</span>
                            <button
                              className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                              tabIndex={0}
                            >
                              <MoreVertical size={18} color="#888" />
                            </button>
                            <div className="absolute right-0 top-8 z-9999 hidden group-focus-within:block group-hover:block bg-white border border-gray-200 rounded shadow-lg min-w-35 py-1">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                onClick={async () => {
                                  const result = await swal({
                                    title:
                                      step.invoice === "Sent"
                                        ? "Resend Invoice?"
                                        : "Send Invoice?",
                                    text:
                                      step.invoice === "Sent"
                                        ? "Are you sure you want to resend this invoice?"
                                        : "Are you sure you want to send this invoice?",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonText:
                                      step.invoice === "Sent"
                                        ? "Yes, Resend"
                                        : "Yes, Send",
                                  });
                                  if (result.isConfirmed) {
                                    // TODO: Send/Resend logic
                                  }
                                }}
                              >
                                {step.invoice === "Sent" ? "Resend" : "Send"}
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                onClick={async () => {
                                  const result = await swal({
                                    title: "Review Invoice?",
                                    text: "Do you want to review this invoice?",
                                    icon: "info",
                                    showCancelButton: true,
                                    confirmButtonText: "Review",
                                  });
                                  if (result.isConfirmed) {
                                    // TODO: Review logic
                                  }
                                }}
                              >
                                Review
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                onClick={async () => {
                                  const result = await swal({
                                    title: "Download Invoice?",
                                    text: "Do you want to download this invoice?",
                                    icon: "question",
                                    showCancelButton: true,
                                    confirmButtonText: "Download",
                                  });
                                  if (result.isConfirmed) {
                                    // TODO: Download logic
                                  }
                                }}
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {step.paymentAlert}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {step.paymentModeCapture}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
