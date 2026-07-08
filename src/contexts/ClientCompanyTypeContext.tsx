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
  isOpcCompanyType,
  type StakeholderLabels,
} from "@/utils/companyTypeLabels";

type ClientCompanyTypeContextValue = {
  companyType: string | null;
  isLlp: boolean;
  isOpc: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCompanyType = async () => {
      try {
        setIsLoading(true);
        const response = await clientsApi.getCompanyOverview(appNo);
        if (!cancelled) {
          setCompanyType(response?.data?.companyType ?? null);
        }
      } catch {
        if (!cancelled) {
          setCompanyType(null);
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
      isLlp: isLlpCompanyType(companyType),
      isOpc: isOpcCompanyType(companyType),
      labels: getStakeholderLabels(companyType),
      isLoading,
    }),
    [companyType, isLoading],
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
      isLlp: false,
      isOpc: false,
      labels: getStakeholderLabels(null),
      isLoading: false,
    };
  }
  return context;
}
