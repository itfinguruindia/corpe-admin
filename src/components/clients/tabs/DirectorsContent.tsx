"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Director } from "@/types/director";
import { clientsApi } from "@/lib/api/clients";
import { Button, Card, Spinner, TextArea, toast } from "@heroui/react";
import { Chip } from "@/components/ui";
import { useClientCompanyLabels } from "@/contexts/ClientCompanyTypeContext";
import { toStakeholderId } from "@/utils/stakeholderIds";
import { isSameStakeholderPerson } from "@/utils/stakeholderMatch";

interface DirectorsContentProps {
  appNo: string;
}

export default function DirectorsContent({ appNo }: DirectorsContentProps) {
  const router = useRouter();
  const { labels } = useClientCompanyLabels();
  const [directors, setDirectors] = useState<Director[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [directorsLocked, setDirectorsLocked] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const loadDirectors = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await clientsApi.getDirectorAndShareHolders(appNo, false);
      if (response && response.data && Array.isArray(response.data.directors)) {
        const shareholders = response.data.shareholders || [];
        const mappedDirectors: Director[] = response.data.directors.map(
          (d: any, idx: number) => {
            const linkedShIdx = shareholders.findIndex((s: any) =>
              isSameStakeholderPerson(d, s),
            );
            return {
              id: toStakeholderId(d, idx),
              applicationNo: appNo,
              directorNumber: idx + 1,
              hasDIN: d.hasDIN || false,
              din: d.dinNumber || "",
              directorName: d.name || "-",
              fatherName: d.fatherName || "-",
              email: d.email || "-",
              phoneNo: d.phoneNumber || "-",
              gender: d.gender
                ? d.gender.charAt(0).toUpperCase() + d.gender.slice(1)
                : "Other",
              dateOfBirth: d.dateOfBirth || "-",
              nationality: d.nationality || "-",
              passportNo: d.passportNumber || "-",
              isForeignResident: Boolean(d.isForeignResident),
              occupationType: d.occupationType || "-",
              placeOfBirth: d.placeOfBirth?.city || "-",
              educationQualification: d.educationQualification || "-",
              presentAddress: d.presentAddress || "-",
              permanentAddress: d.permanentAddress || "-",
              pan: d.panNumber || "-",
              durationOfStayAtPresentAddress: `${d.durationOfStay?.years || 0} years, ${d.durationOfStay?.months || 0} months`,
              previousResidenceAddress: d.previousAddress || "-",
              shareholdingPercentage: d.proposedShareholdingPercentage
                ? Number(d.proposedShareholdingPercentage)
                : 0,
              kycVerified: d.kycVerified ?? false,
              dscApplication: d.dscApplication ?? false,
              isBankSigningAuthority: d.isBankSigningAuthority ?? false,
              isAlsoShareholder: linkedShIdx !== -1,
              linkedShareholderNumber:
                linkedShIdx !== -1 ? linkedShIdx + 1 : null,
              isReplacement: Boolean(d.isReplacement),
              replacedDirectorSnapshot: d.replacedDirectorSnapshot || null,
              createdAt: undefined,
              updatedAt: undefined,
            } as Director;
          },
        );
        setDirectors(mappedDirectors);
      } else {
        setDirectors([]);
      }
    } catch (error) {
      console.error("Error fetching directors:", error);
      setDirectors([]);
    } finally {
      setIsLoading(false);
    }
  }, [appNo]);

  const loadChangeRequests = useCallback(async () => {
    try {
      const data = await clientsApi.listDirectorChangeRequests(appNo);
      setChangeRequests(data?.items || []);
      setDirectorsLocked(Boolean(data?.directorsLocked));
    } catch (error) {
      console.error("Error fetching director change requests:", error);
      setChangeRequests([]);
    }
  }, [appNo]);

  useEffect(() => {
    loadDirectors();
    loadChangeRequests();
  }, [loadDirectors, loadChangeRequests]);

  const handleDirectorClick = (director: Director) => {
    router.push(`/clients/${appNo}/directors/${director.id}`);
  };

  const handleReview = async (
    requestId: string,
    action: "approve" | "reject",
  ) => {
    try {
      setReviewingId(requestId);
      await clientsApi.reviewDirectorChangeRequest(appNo, requestId, {
        action,
        adminNote: adminNotes[requestId] || "",
      });
      toast.success(
        action === "approve"
          ? "Director change approved"
          : "Director change rejected",
      );
      await Promise.all([loadDirectors(), loadChangeRequests()]);
    } catch (error: any) {
      toast(
        error?.response?.data?.message ||
          `Failed to ${action} director change request`,
        { variant: "danger" },
      );
    } finally {
      setReviewingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const pendingRequests = changeRequests.filter((r) => r.status === "pending");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {directorsLocked && (
          <Card className="p-4 border border-amber-200 bg-amber-50">
            <p className="text-sm text-amber-900 font-medium">
              Objects Clause has been drafted — client director editing is
              locked. Replacement requests appear below for approval.
            </p>
          </Card>
        )}

        {pendingRequests.length > 0 && (
          <Card className="p-6 border border-orange-200">
            <h2 className="text-lg font-semibold text-secondary mb-4">
              Pending director change requests ({pendingRequests.length})
            </h2>
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div
                  key={req._id}
                  className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Replace Director {(req.directorIndex ?? 0) + 1}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        <span className="line-through opacity-70">
                          {req.previousDirectorName || "Previous"}
                        </span>
                        {" → "}
                        <span className="font-semibold text-emerald-700">
                          {req.proposedDirector?.name || "New director"}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {[
                          req.proposedDirector?.email,
                          req.proposedDirector?.phoneNumber,
                          req.proposedDirector?.panNumber,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "No extra contact details"}
                      </p>
                      {req.clientNote && (
                        <p className="text-xs text-slate-600 mt-2 italic">
                          Client note: {req.clientNote}
                        </p>
                      )}
                    </div>
                    <Chip label="Pending" variant="orange" className="text-xs" />
                  </div>

                  <TextArea
                    label="Admin note (optional)"
                    minRows={2}
                    value={adminNotes[req._id] || ""}
                    onChange={(e) =>
                      setAdminNotes((prev) => ({
                        ...prev,
                        [req._id]: e.target.value,
                      }))
                    }
                  />

                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button
                      variant="bordered"
                      color="danger"
                      isLoading={reviewingId === req._id}
                      onPress={() => handleReview(req._id, "reject")}
                    >
                      Reject
                    </Button>
                    <Button
                      color="success"
                      className="text-white"
                      isLoading={reviewingId === req._id}
                      onPress={() => handleReview(req._id, "approve")}
                    >
                      Approve replacement
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary">
              {labels.totalDirectors(directors.length)}
            </h2>
          </div>

          <div className="space-y-4">
            {directors.map((director) => {
              const snapshot = (director as any).replacedDirectorSnapshot;
              const isReplacement = Boolean((director as any).isReplacement);
              return (
                <Card
                  key={director.id}
                  className="p-4 border border-gray-200 hover:border-[#F46A45] hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleDirectorClick(director)}
                >
                  {snapshot && (
                    <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 opacity-60">
                      <p className="text-[10px] uppercase tracking-wide font-bold text-slate-500 mb-1">
                        Previous (replaced)
                      </p>
                      <p className="text-sm text-slate-600 line-through">
                        {snapshot.name || "—"}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {labels.directorWithNumber(director.directorNumber)}
                        </h3>
                        {isReplacement && (
                          <Chip
                            label="Replacement"
                            variant="green"
                            className="text-xs"
                          />
                        )}
                        {director.isBankSigningAuthority && (
                          <Chip
                            label="Bank Signing Authority"
                            variant="blue"
                            className="text-xs"
                          />
                        )}
                        {director.isAlsoShareholder && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded border border-blue-200">
                            {labels.alsoAShareholder}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {director.directorName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {director.email} • {director.phoneNo}
                        {(director as { isForeignResident?: boolean })
                          .isForeignResident && (
                          <span className="ml-2 text-xs font-medium text-[#3D63A4]">
                            • NRI / Foreign Resident
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
