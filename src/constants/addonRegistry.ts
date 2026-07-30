import { RegistrationType, AddonServiceId } from "@/types/enums";

export interface AddonConfig {
  id: AddonServiceId | string;
  name: string;
  allowStandalone: boolean; // TRUE: can be used by BOTH standalone and incorporated users.
  requiresIncorporation: boolean; // TRUE: MUST complete incorporation first.
  refModel: string; // Mongoose collection model name for dynamic refPath
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
