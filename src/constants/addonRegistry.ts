import { RegistrationType, AddonServiceId } from "@/types/enums";

export interface AddonConfig {
  id: AddonServiceId | string;
  name: string;
  allowStandalone: boolean; // TRUE: can be used by BOTH standalone and incorporated users.
  requiresIncorporation: boolean; // TRUE: MUST complete incorporation first.
  refModel?: string; // Mongoose collection model name for dynamic refPath
  active: boolean;
}

export const ADDON_REGISTRY: Record<string, AddonConfig> = {
  [AddonServiceId.GST_REGISTRATION]: {
    id: AddonServiceId.GST_REGISTRATION,
    name: "GST Registration",
    allowStandalone: true,
    requiresIncorporation: false,
    refModel: "gstRegistration",
    active: true,
  },
  [AddonServiceId.BANK_ACCOUNT_SETUP]: {
    id: AddonServiceId.BANK_ACCOUNT_SETUP,
    name: "Bank Account Setup",
    allowStandalone: false,
    requiresIncorporation: true,
    refModel: "bankAccountSetup",
    active: true,
  },
  [AddonServiceId.MSME_UDYAM_REGISTRATION]: {
    id: AddonServiceId.MSME_UDYAM_REGISTRATION,
    name: "MSME-Udyam Registration",
    allowStandalone: true,
    requiresIncorporation: false,
    refModel: "msmeRegistration",
    active: true,
  },
  [AddonServiceId.STARTUP_GROWTH_SUITE]: {
    id: AddonServiceId.STARTUP_GROWTH_SUITE,
    name: "Startup Growth Suite",
    allowStandalone: true,
    requiresIncorporation: false,
    refModel: "startupGrowthSuite",
    active: true,
  },
  [AddonServiceId.ANNUAL_COMPLIANCE]: {
    id: AddonServiceId.ANNUAL_COMPLIANCE,
    name: "Annual Compliance",
    allowStandalone: true,
    requiresIncorporation: false,
    refModel: "annualCompliance",
    active: true,
  },
  [AddonServiceId.ACCOUNTING_BOOKKEEPING]: {
    id: AddonServiceId.ACCOUNTING_BOOKKEEPING,
    name: "Accounting & Bookkeeping",
    allowStandalone: true,
    requiresIncorporation: false,
    refModel: "accountingBookkeeping",
    active: true,
  },
  [AddonServiceId.TAXATION]: {
    id: AddonServiceId.TAXATION,
    name: "Taxation",
    allowStandalone: true,
    requiresIncorporation: false,
    refModel: "taxation",
    active: true,
  },
  [AddonServiceId.AUDITING]: {
    id: AddonServiceId.AUDITING,
    name: "Auditing",
    allowStandalone: true,
    requiresIncorporation: false,
    refModel: "auditing",
    active: true,
  },
  [AddonServiceId.TRADEMARK_REGISTRATION]: {
    id: AddonServiceId.TRADEMARK_REGISTRATION,
    name: "Trademark Registration",
    allowStandalone: true,
    requiresIncorporation: false,
    refModel: "trademarkRegistration",
    active: true,
  },
  [AddonServiceId.PAYROLL]: {
    id: AddonServiceId.PAYROLL,
    name: "Payroll",
    allowStandalone: true,
    requiresIncorporation: false,
    refModel: "payroll",
    active: true,
  },
  [AddonServiceId.VIRTUAL_OFFICE_SETUP]: {
    id: AddonServiceId.VIRTUAL_OFFICE_SETUP,
    name: "Virtual Office Setup",
    allowStandalone: true,
    requiresIncorporation: false,
    refModel: "virtualOfficeSetup",
    active: true,
  },
};

/**
 * Helper to check if an addon service is visible / available for a given registration type.
 */
export function isAddonAvailableForRegistrationType(
  addonId: AddonServiceId | string,
  registrationType: RegistrationType | string | null | undefined
): boolean {
  const config = ADDON_REGISTRY[addonId];
  if (!config || !config.active) return false;

  const isStandalone = registrationType === RegistrationType.ADDON_ONLY;
  if (isStandalone && !config.allowStandalone) {
    return false;
  }
  if (config.requiresIncorporation && registrationType !== RegistrationType.FULL_INCORPORATION) {
    return false;
  }
  return true;
}
