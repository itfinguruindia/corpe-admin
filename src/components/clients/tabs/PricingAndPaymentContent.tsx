"use client";

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
import { Card, Spinner } from "@heroui/react";

interface PricingAndPaymentContentProps {
  appNo: string;
}

export default function PricingAndPaymentContent({
  appNo,
}: PricingAndPaymentContentProps) {
  const swal = useSwal();
  const [pricingData, setPricingData] = useState<PricingPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [includeGST, setIncludeGST] = useState(false);

  useEffect(() => {
    const loadPricingData = async () => {
      try {
        setIsLoading(true);
        const data = await pricingPaymentService.getPricingAndPayment(appNo);
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

    const paymentSteps: FrontendPaymentStep[] = steps.map((s: BackendPaymentStep, index: number) => {
      let actionText = "-";
      if (s.status === "paid") {
        actionText = "Payment Received";
      } else if ([4, 6, 7].includes(s.stepNumber)) {
        actionText = s.paymentLinkSent ? "Resend Payment Link" : "Send Payment Link";
      }

      return {
        step: index + 1,
        stepNumber: s.stepNumber,
        installmentName: s.installmentName,
        amount: s.amount,
        triggerGate: s.triggerGate,
        effects: s.effects,
        status: mapStatus(s.status),
        action: actionText,
        invoice: s.invoiceAvailable ? "Sent" : "Not Sent",
        paymentAlert: s.status === "paid" ? "Paid Confirmation" : (s.status === "failed" ? "Payment Failed" : "Awaiting"),
        paymentModeCapture: s.status === "paid" ? "Online" : "-", // Backend doesn't return mode yet in this API
        breakdown: s.breakdown,
        paymentLinkSent: s.paymentLinkSent,
        paymentLinkSentAt: s.paymentLinkSentAt,
      };
    });

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
      finalPayableWithGST: summary.finalPayableWithGST,
      isLocked: steps.some((s: BackendPaymentStep) => s.isLocked === true),
      discount: summary.discountAmount,
      paymentSteps,
      currency: summary.currency || "INR",
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
      case "Overdue":
        return "red";
      default:
        // "First Installment Due", "Second Installment Due", etc.
        if (status.includes("Installment Due") || status.includes("Pending")) return "yellow";
        return "gray";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
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
      <Card className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6 border-b pb-6">
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
            value={formatCurrency(pricingData.baseServiceFee, pricingData.currency)}
          />
          <InfoField
            label="Discount"
            value={formatCurrency(pricingData.discount || 0, pricingData.currency)}
            sublabel="(If any discount applied)"
            sublabelColor="text-blue-500"
          />
          <InfoField
            label="Total Payable"
            value={formatCurrency(pricingData.totalPayable, pricingData.currency)}
          />
          <InfoField
            label="GST"
            value={formatCurrency(pricingData.gst, pricingData.currency)}
            sublabel={`(${((pricingData.gst / (pricingData.totalPayable || 1)) * 100).toFixed(0)}% of Total payable fee)`}
            sublabelColor="text-gray-500"
          />
          <InfoField
            label="Paid"
            value={formatCurrency(pricingData.paid, pricingData.currency)}
            sublabel="(Amount already paid)"
            sublabelColor="text-green-600"
          />
          <InfoField
            label="Remaining Balance"
            value={formatCurrency(pricingData.remainingBalance, pricingData.currency)}
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
                    ? (pricingData.finalPayableWithGST ?? pricingData.finalPaidAmount)
                    : pricingData.finalPaidAmount,
                  pricingData.currency,
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
                          <div className="font-medium text-gray-900">{step.installmentName}</div>
                          {step.breakdown && (
                            <div className="text-xs text-gray-500 mt-2 flex flex-col gap-1 bg-gray-50 p-2.5 rounded border border-gray-100 max-w-xs shadow-sm">
                              {/* DIN Activation Fee Breakdown */}
                              {typeof step.breakdown.dinCount === "number" && (
                                <>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">DIN Activation Rate:</span>
                                    <span className="font-semibold text-gray-700">
                                      {formatCurrency(step.breakdown.dinRate || 0, pricingData.currency)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">Directors Count:</span>
                                    <span className="font-semibold text-gray-700">
                                      {step.breakdown.dinCount}
                                    </span>
                                  </div>
                                  {(step.breakdown as any).dinDirectors?.length > 0 && (
                                    <div className="flex flex-col gap-0.5 border-t border-gray-100 pt-1 mt-0.5">
                                      {(step.breakdown as any).dinDirectors.map((dir: any, di: number) => (
                                        <div key={di} className="flex justify-between gap-4 text-[10px] text-gray-400">
                                          <span>{dir.name}:</span>
                                          <span>{formatCurrency((step.breakdown as any).dinRate || 0, pricingData.currency)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {(step.breakdown as any).paidDinDirectors?.length > 0 && (
                                    <div className="flex flex-col gap-0.5 border-t border-gray-100 pt-1 mt-0.5 text-green-600">
                                      <div className="text-[10px] font-medium text-green-700 mb-0.5">Previously Paid:</div>
                                      {(step.breakdown as any).paidDinDirectors.map((dir: any, di: number) => (
                                        <div key={di} className="flex justify-between gap-4 text-[10px]">
                                          <span>{dir.name}:</span>
                                          <span>✓ {formatCurrency((step.breakdown as any).dinRate || 0, pricingData.currency)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="border-t border-gray-200 my-1"></div>
                                  <div className="flex justify-between gap-4 font-semibold text-gray-900 text-[11px]">
                                    <span>Total Activation Fee:</span>
                                    <span>
                                      {formatCurrency((step.breakdown as any).dinTotal || 0, pricingData.currency)}
                                    </span>
                                  </div>
                                  {typeof (step.breakdown as any).totalPaidSoFar === "number" && (step.breakdown as any).totalPaidSoFar > 0 && (
                                    <div className="flex justify-between gap-4 text-green-700 text-[11px] font-medium mt-0.5">
                                      <span>Total Paid So Far:</span>
                                      <span>{formatCurrency((step.breakdown as any).totalPaidSoFar, pricingData.currency)}</span>
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Stage 7 — Name Extension Attempts */}
                              {step.stepNumber === 7 && step.breakdown.attempts && step.breakdown.attempts.length > 0 && (
                                <div className="flex flex-col gap-1.5 border-t border-gray-200 pt-2 mt-1">
                                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                    Extension Attempts
                                  </span>
                                  {step.breakdown.attempts.map((att: any) => {
                                    const statusColor =
                                      att.status === 'done' ? 'text-green-700 bg-green-50 border-green-200' :
                                      att.status === 'expired' ? 'text-red-700 bg-red-50 border-red-200' :
                                      att.status === 'paid' || att.status === 'in_progress' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                                      'text-amber-700 bg-amber-50 border-amber-200';
                                    const statusLabel =
                                      att.status === 'done' ? 'Completed' :
                                      att.status === 'paid' ? 'Paid' :
                                      att.status === 'in_progress' ? 'In Progress' :
                                      att.status === 'expired' ? 'Expired' : 'Pending';
                                    return (
                                      <div key={att.attemptNumber} className={`flex items-center justify-between border rounded px-2.5 py-1.5 text-[10px] font-semibold ${statusColor}`}>
                                        <span>{att.attemptNumber === 1 ? '1st' : '2nd'} Attempt</span>
                                        <div className="flex items-center gap-2">
                                          <span>{formatCurrency(att.amount, pricingData.currency || 'INR')}</span>
                                          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border border-current">
                                            {statusLabel}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Regular Installments / Surcharges / Breakdown (excl. DIN) */}
                              {typeof step.breakdown.dinCount !== "number" && (
                                <>
                                  {/* Installment Base */}
                                  {typeof step.breakdown.installmentBase === "number" && step.breakdown.installmentBase > 0 && (
                                    <div className="flex justify-between gap-4">
                                      <span className="text-gray-500">Installment Base:</span>
                                      <span className="font-semibold text-gray-700">
                                        {formatCurrency(step.breakdown.installmentBase, pricingData.currency)}
                                      </span>
                                    </div>
                                  )}

                                  {/* Extra Directors */}
                                  {typeof step.breakdown.indianCount === "number" && step.breakdown.indianCount > 0 && (
                                    <div className="flex justify-between gap-4">
                                      <span className="text-gray-500">Extra Directors (Indian) ({step.breakdown.indianCount}):</span>
                                      <span className="font-semibold text-gray-700">
                                        +{formatCurrency(step.breakdown.indianCount * (step.breakdown.indianRate || 0), pricingData.currency)}
                                      </span>
                                    </div>
                                  )}

                                  {typeof step.breakdown.foreignCount === "number" && step.breakdown.foreignCount > 0 && (
                                    <div className="flex justify-between gap-4">
                                      <span className="text-gray-500">Extra Directors (Foreign) ({step.breakdown.foreignCount}):</span>
                                      <span className="font-semibold text-gray-700">
                                        +{formatCurrency(step.breakdown.foreignCount * (step.breakdown.foreignRate || 0), pricingData.currency)}
                                      </span>
                                    </div>
                                  )}

                                  {/* Non-Shareholders */}
                                  {typeof step.breakdown.nonShareholderCount === "number" && step.breakdown.nonShareholderCount > 0 && (
                                    <div className="flex justify-between gap-4">
                                      <span className="text-gray-500">Non-Shareholder Directors ({step.breakdown.nonShareholderCount}):</span>
                                      <span className="font-semibold text-gray-700">
                                        +{formatCurrency(step.breakdown.nonShareholderCount * (step.breakdown.nonShareholderRate || 0), pricingData.currency)}
                                      </span>
                                    </div>
                                  )}

                                  {/* GST details */}
                                  {typeof step.breakdown.gstAmount === "number" && step.breakdown.gstAmount > 0 && (
                                    <div className="flex justify-between gap-4">
                                      <span className="text-gray-500">GST ({step.breakdown.gstPercentage}%):</span>
                                      <span className="font-semibold text-gray-700">
                                        +{formatCurrency(step.breakdown.gstAmount, pricingData.currency)}
                                      </span>
                                    </div>
                                  )}

                                  {/* Total */}
                                  {typeof step.breakdown.installmentTotal === "number" && (
                                    <>
                                      <div className="border-t border-gray-200 my-1"></div>
                                      <div className="flex justify-between gap-4 font-semibold text-gray-900 text-[11px]">
                                        <span>Total:</span>
                                        <span>
                                          {formatCurrency(step.breakdown.installmentTotal, pricingData.currency)}
                                        </span>
                                      </div>
                                      {typeof (step.breakdown as any).totalPaidSoFar === "number" && (step.breakdown as any).totalPaidSoFar > 0 && (
                                        <div className="flex justify-between gap-4 text-green-700 text-[11px] font-medium mt-0.5">
                                          <span>Total Paid So Far:</span>
                                          <span>{formatCurrency((step.breakdown as any).totalPaidSoFar, pricingData.currency)}</span>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatCurrency(step.amount, pricingData.currency)}
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
                          {["Send Payment Link", "Resend Payment Link"].includes(step.action) ? (
                            <div className="flex flex-col gap-1 items-start">
                              <button
                                className={`px-4 py-1.5 text-sm rounded-md transition-colors font-medium cursor-pointer ${
                                  step.action === "Resend Payment Link"
                                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                                    : "bg-[#F46A45] hover:bg-[#e55a35] text-white"
                                }`}
                                onClick={async () => {
                                  try {
                                    const actionLabel = step.action === "Resend Payment Link" ? "Resend" : "Send";
                                    const confirmed = await swal({
                                      title: `${actionLabel} Payment Link?`,
                                      text: `Are you sure you want to ${actionLabel.toLowerCase()} the payment link for Step ${step.step}?`,
                                      icon: "question",
                                      showCancelButton: true,
                                      confirmButtonText: `Yes, ${actionLabel}`,
                                    });
                                    if (!confirmed.isConfirmed) return;

                                    const success = await pricingPaymentService.sendPaymentLink(
                                      appNo,
                                      step.stepNumber
                                    );

                                    if (success) {
                                      await swal({
                                        title: "Sent!",
                                        text: "Payment link has been successfully marked as sent.",
                                        icon: "success",
                                      });
                                      // Refresh pricing data
                                      const data = await pricingPaymentService.getPricingAndPayment(appNo);
                                      if (data) {
                                        setPricingData(mapBackendToFrontend(data));
                                      }
                                    } else {
                                      await swal({
                                        title: "Error",
                                        text: "Failed to send payment link.",
                                        icon: "error",
                                      });
                                    }
                                  } catch (error) {
                                    console.error(error);
                                  }
                                }}
                              >
                                {step.action}
                              </button>
                              {step.paymentLinkSentAt && (
                                <span className="text-[10px] text-gray-400 font-medium">
                                  Sent: {new Date(step.paymentLinkSentAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
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
      </Card>
    </div>
  );
}
