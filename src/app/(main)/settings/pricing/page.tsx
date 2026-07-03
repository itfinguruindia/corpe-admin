"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "@heroui/react";
import { pricingPlansService } from "@/services/pricingPlans.service";
import type {
  AdminPricingPlan,
  AdminPricingStage,
  PricingPlanUpdateRequest,
  PricingStageAmount,
} from "@/types/pricingPlans";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/permissions";

function isRateStageAmount(
  amount: AdminPricingStage["amount"],
): amount is {
  extraDirectorIndian: number;
  extraDirectorForeign: number;
  nonShareholder: number;
} {
  return (
    typeof amount === "object" &&
    amount !== null &&
    "extraDirectorIndian" in amount
  );
}

function isAttemptStageAmount(
  amount: AdminPricingStage["amount"],
): amount is { attempt1: number; attempt2: number } {
  return typeof amount === "object" && amount !== null && "attempt1" in amount;
}

function getCoreInstallmentTotal(stages: AdminPricingStage[]): number {
  return stages
    .filter((s) => [1, 4, 6].includes(s.stageNumber))
    .reduce((sum, s) => sum + (typeof s.amount === "number" ? s.amount : 0), 0);
}

function PlanEditor({
  plan,
  onSaved,
}: {
  plan: AdminPricingPlan;
  onSaved: (updated: AdminPricingPlan) => void;
}) {
  const [draft, setDraft] = useState<AdminPricingPlan>(plan);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft({
      ...plan,
      stages: [...plan.stages].sort((a, b) => a.stageNumber - b.stageNumber),
    });
  }, [plan]);

  const coreTotal = useMemo(
    () => getCoreInstallmentTotal(draft.stages),
    [draft.stages],
  );

  const updateStage = (
    stageNumber: number,
    patch: Partial<AdminPricingStage>,
  ) => {
    setDraft((current) => ({
      ...current,
      stages: current.stages.map((stage) =>
        stage.stageNumber === stageNumber ? { ...stage, ...patch } : stage,
      ),
    }));
  };

  const updateStageAmountField = (
    stageNumber: number,
    field: string,
    value: number,
  ) => {
    setDraft((current) => ({
      ...current,
      stages: current.stages.map((stage) => {
        if (stage.stageNumber !== stageNumber) return stage;
        if (typeof stage.amount === "number") {
          return { ...stage, amount: value };
        }
        return {
          ...stage,
          amount: {
            ...(stage.amount as Record<string, number>),
            [field]: value,
          } as PricingStageAmount,
        };
      }),
    }));
  };

  const handleDiscountAmountChange = (amount: number) => {
    const originalPrice = draft.originalPrice;
    const percentage =
      originalPrice > 0 ? Math.round((amount / originalPrice) * 100) : 0;
    setDraft((current) => ({
      ...current,
      discount: {
        label: current.discount?.label || "Discount",
        amount,
        percentage,
      },
      finalPrice: Math.max(0, originalPrice - amount),
    }));
  };

  const handleSave = async () => {
    if (Math.abs(draft.finalPrice - coreTotal) > 1) {
      toast.danger(
        `Stage 1 + Stage 4 + Stage 6 must equal final price (${coreTotal} ≠ ${draft.finalPrice}).`,
      );
      return;
    }

    const payload: PricingPlanUpdateRequest = {
      companyTypeLabel: draft.companyTypeLabel,
      originalPrice: draft.originalPrice,
      discount: draft.discount,
      finalPrice: draft.finalPrice,
      gstPercentage: draft.gstPercentage,
      currency: draft.currency,
      optionalAddOns: draft.optionalAddOns,
      stages: draft.stages.map((stage) => ({
        stage: stage.stage,
        stageNumber: stage.stageNumber,
        percentage: stage.percentage,
        amount: stage.amount,
        taxable: stage.taxable,
        paymentTrigger: stage.paymentTrigger,
        platformTrigger: stage.platformTrigger,
        conditional: stage.conditional,
        trigger: stage.trigger,
        corpeDeliverables: stage.corpeDeliverables || [],
        clientProvides: stage.clientProvides || [],
      })),
    };

    setSaving(true);
    try {
      const updated = await pricingPlansService.updatePlan(plan._id, payload);
      onSaved(updated);
      setDraft({
        ...updated,
        stages: [...updated.stages].sort(
          (a, b) => a.stageNumber - b.stageNumber,
        ),
      });
      toast.success(`${draft.planName} updated successfully.`);
    } catch (error: any) {
      toast.danger(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update pricing plan.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-secondary">
            {draft.planName}
          </h3>
          <p className="text-sm text-gray-500">{draft.companyTypeLabel}</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#FF6A3D] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a2d] disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-6 border-b border-slate-100">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            Original price
          </span>
          <input
            type="number"
            min={0}
            value={draft.originalPrice}
            onChange={(e) => {
              const originalPrice = Number(e.target.value) || 0;
              const discountAmount = draft.discount?.amount || 0;
              setDraft((current) => ({
                ...current,
                originalPrice,
                finalPrice: Math.max(0, originalPrice - discountAmount),
              }));
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            Discount amount
          </span>
          <input
            type="number"
            min={0}
            value={draft.discount?.amount || 0}
            onChange={(e) =>
              handleDiscountAmountChange(Number(e.target.value) || 0)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            Final price
          </span>
          <input
            type="number"
            min={0}
            value={draft.finalPrice}
            readOnly
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700">GST %</span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={draft.gstPercentage}
            onChange={(e) =>
              setDraft((current) => ({
                ...current,
                gstPercentage: Number(e.target.value) || 0,
              }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="px-6 py-3 text-xs text-amber-700 bg-amber-50 border-b border-amber-100">
        Core fee check: Stage 1 + Stage 4 + Stage 6 = {coreTotal}. Final price ={" "}
        {draft.finalPrice}.
        {Math.abs(draft.finalPrice - coreTotal) > 1 ? " These must match." : ""}
      </div>

      <div className="divide-y divide-slate-100">
        {draft.stages
          .slice()
          .sort((a, b) => a.stageNumber - b.stageNumber)
          .map((stage) => (
            <div key={stage.stageNumber} className="px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-semibold text-secondary">
                    Stage {stage.stageNumber}: {stage.stage}
                  </p>
                  <p className="text-xs text-gray-500">{stage.percentage}</p>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={stage.taxable !== false}
                    onChange={(e) =>
                      updateStage(stage.stageNumber, {
                        taxable: e.target.checked,
                      })
                    }
                  />
                  Taxable (GST applies)
                </label>
              </div>

              {typeof stage.amount === "number" && (
                <label className="text-sm block max-w-xs">
                  <span className="mb-1 block font-medium text-gray-700">
                    Amount ({draft.currency})
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={stage.amount}
                    onChange={(e) =>
                      updateStage(stage.stageNumber, {
                        amount: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </label>
              )}

              {isRateStageAmount(stage.amount) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(
                    [
                      ["extraDirectorIndian", "Extra director (Indian)"],
                      ["extraDirectorForeign", "Extra director (Foreign)"],
                      ["nonShareholder", "Non-shareholder director"],
                    ] as const
                  ).map(([field, label]) => (
                    <label key={field} className="text-sm">
                      <span className="mb-1 block font-medium text-gray-700">
                        {label}
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={(stage.amount as any)[field]}
                        onChange={(e) =>
                          updateStageAmountField(
                            stage.stageNumber,
                            field,
                            Number(e.target.value) || 0,
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </label>
                  ))}
                </div>
              )}

              {isAttemptStageAmount(stage.amount) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl">
                  {(
                    [
                      ["attempt1", "Attempt 1"],
                      ["attempt2", "Attempt 2"],
                    ] as const
                  ).map(([field, label]) => (
                    <label key={field} className="text-sm">
                      <span className="mb-1 block font-medium text-gray-700">
                        {label}
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={(stage.amount as any)[field]}
                        onChange={(e) =>
                          updateStageAmountField(
                            stage.stageNumber,
                            field,
                            Number(e.target.value) || 0,
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default function PricingSettingsPage() {
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canEdit = isSuperAdmin || hasPermission(PERMISSIONS.PRICING_EDIT);
  const [plans, setPlans] = useState<AdminPricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("");

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pricingPlansService.getAllPlans();
      setPlans(data);
      if (!selectedType && data.length > 0) {
        setSelectedType(data[0].companyType);
      }
    } catch (error: any) {
      toast.danger(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load pricing plans.",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const companyTypes = useMemo(() => {
    const map = new Map<string, string>();
    plans.forEach((plan) => {
      if (!map.has(plan.companyType)) {
        map.set(plan.companyType, plan.companyTypeLabel);
      }
    });
    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1]),
    );
  }, [plans]);

  const visiblePlans = useMemo(
    () => plans.filter((plan) => plan.companyType === selectedType),
    [plans, selectedType],
  );

  if (!canEdit) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-sm text-center text-gray-600">
        You do not have permission to edit pricing plans.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#FF6A3D] mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to settings
          </Link>
          <h1 className="text-4xl font-bold text-[#FF6A3D]">
            Pricing Management
          </h1>
          <p className="mt-2 text-base text-gray-600 max-w-3xl">
            Edit live pricing for new registrations. Existing clients continue
            using their frozen pricing snapshot from when they paid the signing
            fee.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading pricing plans...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="rounded-xl bg-white shadow-sm p-4 h-fit">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Company types
            </p>
            <div className="space-y-1">
              {companyTypes.map(([companyType, label]) => (
                <button
                  key={companyType}
                  type="button"
                  onClick={() => setSelectedType(companyType)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedType === companyType
                      ? "bg-[#FF6A3D] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-6">
            {visiblePlans.length === 0 ? (
              <div className="rounded-xl bg-white p-8 shadow-sm text-gray-500">
                No pricing plans found for this company type.
              </div>
            ) : (
              visiblePlans.map((plan) => (
                <PlanEditor
                  key={plan._id}
                  plan={plan}
                  onSaved={(updated) => {
                    setPlans((current) =>
                      current.map((item) =>
                        item._id === updated._id ? updated : item,
                      ),
                    );
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
