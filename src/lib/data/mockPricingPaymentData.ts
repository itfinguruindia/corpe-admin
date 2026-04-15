import { PricingPayment } from "@/types/pricingPayment";

const mockPricingPaymentData: Record<string, PricingPayment> = {
  GJC000001: {
    applicationNo: "GJC000001",
    companyName: "Tech Innovations Pvt Ltd",
    entityType: "Private Limited Company – Individual Shareholding",
    plan: "Advance",
    packageType: "Installment",

    baseServiceFee: 11999,
    discount: 1799.85,
    totalPayable: 10199.15, // 11999 - 1800
    gst: 1835.84, // 18% of totalPayable

    paid: 5599, // 999 + 4600
    finalPaidAmount: 5599.07,
    remainingBalance: 4600.07, // 10199 - 5599

    status: "Active",
    isLocked: false,

    paymentSteps: [
      {
        step: 1,
        installmentName: "Signin fee",
        amount: 999,
        triggerGate: "Account Created",
        effects: "Account Dashboard Activated",
        status: "Paid",
        action: "Payment Received",
        invoice: "Sent",
        paymentAlert: "Paid Confirmation",
        paymentModeCapture: "UPI",
      },
      {
        step: 2,
        installmentName: "Processing Fees",
        amount: 4600.07,
        triggerGate: "Docs verified",
        effects: "Drafting Enable",
        status: "Paid",
        action: "Payment Received",
        invoice: "Sent",
        paymentAlert: "Paid Confirmation",
        paymentModeCapture: "Card",
      },
      {
        step: 3,
        installmentName: "Filing Fee",
        amount: 4600.07,
        triggerGate: "Pre ROC filing",
        effects: "Filing Enabled",
        status: "Pending",
        action: "Send Payment Link",
        invoice: "Not Sent",
        paymentAlert: "Due in 2 Days",
        paymentModeCapture: "-",
      },
    ],
  },

  RAJC00002: {
    applicationNo: "RAJC00002",
    companyName: "Rajasthan Manufacturing Ltd",
    entityType: "Private Limited Company – Individual Shareholding",
    plan: "Normal",
    packageType: "Full Payment",

    baseServiceFee: 101694.92,
    discount: 2000,
    totalPayable: 99694.92,
    gst: 17945.09,

    paid: 120000, // 999 + 119001
    finalPaidAmount: 120000,
    remainingBalance: 0,

    status: "Complete",
    isLocked: true,

    paymentSteps: [
      {
        step: 1,
        installmentName: "Signin fee",
        amount: 999,
        triggerGate: "Account Created",
        effects: "Account Dashboard Activated",
        status: "Paid",
        action: "Payment Received",
        invoice: "Sent",
        paymentAlert: "Paid Confirmation",
        paymentModeCapture: "Card",
      },
      {
        step: 2,
        installmentName: "Full Payment/One go",
        amount: 119001,
        triggerGate: "Docs verified",
        effects: "Drafting Enabled",
        status: "Paid",
        action: "Payment Received",
        invoice: "Sent",
        paymentAlert: "Paid Confirmation",
        paymentModeCapture: "UPI",
      },
    ],
  },

  BHIC00001: {
    applicationNo: "BHIC00001",
    companyName: "Mumbai Retail Solutions OPC",
    entityType: "One Person Company (OPC)",
    plan: "Advance",
    packageType: "Installment",

    baseServiceFee: 110169.49,
    discount: 1000,
    totalPayable: 109169.49,
    gst: 19650.51,

    paid: 50000, // 999 + 49001
    finalPaidAmount: 50000,
    remainingBalance: 59169.49, // 109169.49 - 50000

    status: "Awaiting",
    isLocked: false,

    paymentSteps: [
      {
        step: 1,
        installmentName: "Signin fee",
        amount: 999,
        triggerGate: "Account Created",
        effects: "Account Dashboard Activated",
        status: "Paid",
        action: "Payment Received",
        invoice: "Sent",
        paymentAlert: "Paid Confirmation",
        paymentModeCapture: "UPI",
      },
      {
        step: 2,
        installmentName: "Processing Fees",
        amount: 49001,
        triggerGate: "Docs verified",
        effects: "Drafting Enable",
        status: "Paid",
        action: "Payment Received",
        invoice: "Sent",
        paymentAlert: "Paid Confirmation",
        paymentModeCapture: "Card",
      },
      {
        step: 3,
        installmentName: "Filing Fee",
        amount: 59169.49,
        triggerGate: "Pre ROC filing",
        effects: "Filing Enabled",
        status: "Overdue",
        action: "Send Payment Link",
        invoice: "Not Sent",
        paymentAlert: "Overdue by 3 Days",
        paymentModeCapture: "-",
      },
    ],
  },

  DLEC00001: {
    applicationNo: "DLEC00001",
    companyName: "Delhi Consulting Services LLP",
    entityType: "Foreign Shareholding / Subsidiary",
    plan: "Advance",
    packageType: "Full Payment",

    baseServiceFee: 152542.37,
    discount: 0,
    totalPayable: 152542.37,
    gst: 27457.63,

    paid: 180000, // 999 + 179001
    finalPaidAmount: 180000,
    remainingBalance: 0,

    status: "Complete",
    isLocked: true,

    paymentSteps: [
      {
        step: 1,
        installmentName: "Signin fee",
        amount: 999,
        triggerGate: "Account Created",
        effects: "Account Dashboard Activated",
        status: "Paid",
        action: "Payment Received",
        invoice: "Sent",
        paymentAlert: "Paid Confirmation",
        paymentModeCapture: "UPI",
      },
      {
        step: 2,
        installmentName: "Full Payment/One go",
        amount: 179001,
        triggerGate: "Docs verified",
        effects: "Drafting Enabled",
        status: "Paid",
        action: "Payment Received",
        invoice: "Sent",
        paymentAlert: "Paid Confirmation",
        paymentModeCapture: "Card",
      },
    ],
  },
};

export const fetchPricingPayment = async (
  appNo: string,
): Promise<PricingPayment | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return mockPricingPaymentData[appNo] || null;
};
