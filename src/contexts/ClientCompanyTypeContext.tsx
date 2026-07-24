"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { clientsApi } from "@/lib/api/clients";
import {
  getStakeholderLabels,
  isLlpCompanyType,
  isMoaAoaExcludedCompanyType,
  isOpcCompanyType,
  type StakeholderLabels,
} from "@/utils/companyTypeLabels";

type ClientCompanyTypeContextValue = {
  companyType: string | null;
  registrationType: string | null;
  isAddonOnly: boolean;
  isLlp: boolean;
  isOpc: boolean;
  isMoaAoaExcluded: boolean;
  labels: StakeholderLabels;
  isLoading: boolean;
};

const ClientCompanyTypeContext =
  createContext<ClientCompanyTypeContextValue | null>(null);

export function ClientCompanyTypeProvider({
  appNo,
  children,
}: {
  appNo: string;
  children: React.ReactNode;
}) {
  const [companyType, setCompanyType] = useState<string | null>(null);
  const [registrationType, setRegistrationType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCompanyType = async () => {
      try {
        setIsLoading(true);
        const response = await clientsApi.getCompanyOverview(appNo);
        if (!cancelled) {
          setCompanyType(response?.data?.companyType ?? null);
          setRegistrationType(response?.data?.registrationType ?? null);
        }
      } catch {
        if (!cancelled) {
          setCompanyType(null);
          setRegistrationType(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadCompanyType();

    return () => {
      cancelled = true;
    };
  }, [appNo]);

  const value = useMemo(
    () => ({
      companyType,
      registrationType,
      isAddonOnly: registrationType === "addon_only",
      isLlp: isLlpCompanyType(companyType),
      isOpc: isOpcCompanyType(companyType),
      isMoaAoaExcluded: isMoaAoaExcludedCompanyType(companyType),
      labels: getStakeholderLabels(companyType),
      isLoading,
    }),
    [companyType, registrationType, isLoading],
  );

  return (
    <ClientCompanyTypeContext.Provider value={value}>
      {children}
    </ClientCompanyTypeContext.Provider>
  );
}

export function useClientCompanyLabels(): ClientCompanyTypeContextValue {
  const context = useContext(ClientCompanyTypeContext);
  if (!context) {
    return {
      companyType: null,
      registrationType: null,
      isAddonOnly: false,
      isLlp: false,
      isOpc: false,
      isMoaAoaExcluded: false,
      labels: getStakeholderLabels(null),
      isLoading: false,
    };
  }
  return context;
}
