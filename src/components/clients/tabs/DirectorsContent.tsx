"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Director } from "@/types/director";
import { clientsApi } from "@/lib/api/clients";
import { Button, Card, Spinner, toast } from "@heroui/react";
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
            const stakeholderId = toStakeholderId(d, idx);
            const displayName = d.name || "-";
            return {
              id: stakeholderId,
              directorId: stakeholderId,
              applicationNo: appNo,
              directorNumber: idx + 1,
              hasDIN: d.hasDIN || false,
              din: d.dinNumber || "",
              name: displayName,
              directorName: displayName,
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

  const handleQuickDinStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    directorId: string,
    newStatus: string,
  ) => {
    e.stopPropagation();
    try {
      await clientsApi.updateDirectorStatus(appNo, directorId, {
        dinStatus: newStatus,
      });
      toast.success(`DIN status updated to ${newStatus}`);
      await loadDirectors();
    } catch (error: any) {
      toast(
        error?.response?.data?.message || "Failed to update DIN status",
        { variant: "danger" },
      );
    }
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
  const reviewedRequests = changeRequests.filter(
    (r) => r.status === "approved" || r.status === "rejected",
  );

  const openDoc = (doc: any, label: string) => {
    const url = doc?.previewUrl || doc?.url;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    toast(`No file available for ${label}`, { variant: "danger" });
  };

  const renderRequestDocs = (req: any) => {
    const pan = req?.proposedDirector?.panCard;
    const address = req?.proposedDirector?.presentAddressProof;
    const extras = (req?.supportingDocuments || []).filter(Boolean);
    const docs = [
      pan ? { label: "PAN card", doc: pan } : null,
      address ? { label: "Address proof", doc: address } : null,
      ...extras.map((d: any, i: number) => ({
        label: d?.name || `Document ${i + 1}`,
        doc: d,
      })),
    ].filter(Boolean) as { label: string; doc: any }[];

    // De-dupe by path
    const seen = new Set<string>();
    const unique = docs.filter(({ doc }) => {
      const key = String(doc?.path || doc?.previewUrl || doc?.name || "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (unique.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {unique.map(({ label, doc }) => (
          <button
            key={`${label}-${doc?.path || doc?.name}`}
            type="button"
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            onClick={() => openDoc(doc, label)}
          >
            View {label}
          </button>
        ))}
      </div>
    );
  };

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
                          req.proposedDirector?.dateOfBirth
                            ? `DOB ${req.proposedDirector.dateOfBirth}`
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" · ") || "No extra contact details"}
                      </p>
                      {req.clientNote && (
                        <div className="mt-2 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Client note
                          </p>
                          <p className="text-xs text-slate-700 mt-0.5 whitespace-pre-wrap break-words">
                            {req.clientNote}
                          </p>
                        </div>
                      )}
                    </div>
                    <Chip label="Pending" variant="orange" className="text-xs" />
                  </div>

                  {renderRequestDocs(req)}

                  <div className="w-full space-y-1.5">
                    <label
                      htmlFor={`admin-note-${req._id}`}
                      className="block text-xs font-medium text-slate-600"
                    >
                      Admin note (optional)
                    </label>
                    <textarea
                      id={`admin-note-${req._id}`}
                      rows={3}
                      value={adminNotes[req._id] || ""}
                      onChange={(e) =>
                        setAdminNotes((prev) => ({
                          ...prev,
                          [req._id]: e.target.value,
                        }))
                      }
                      placeholder="Add a note for the client (shown on reject/approve)…"
                      className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#F46A45] focus:outline-none focus:ring-1 focus:ring-[#F46A45]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button
                      variant="danger-soft"
                      isDisabled={reviewingId === req._id}
                      onClick={() => handleReview(req._id, "reject")}
                    >
                      {reviewingId === req._id ? "Rejecting..." : "Reject"}
                    </Button>
                    <Button
                      variant="primary"
                      isDisabled={reviewingId === req._id}
                      onClick={() => handleReview(req._id, "approve")}
                    >
                      {reviewingId === req._id
                        ? "Approving..."
                        : "Approve replacement"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {reviewedRequests.length > 0 && (
          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-secondary mb-4">
              Director change history
            </h2>
            <div className="space-y-3">
              {reviewedRequests.slice(0, 10).map((req) => (
                <div
                  key={req._id}
                  className="rounded-lg border border-slate-200 bg-white p-3 flex flex-wrap items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-sm text-slate-800">
                      <span className="line-through opacity-60">
                        {req.previousDirectorName || "Previous"}
                      </span>
                      {" → "}
                      <span className="font-medium">
                        {req.proposedDirector?.name || "New director"}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Reviewed
                      {req.reviewedByName ? ` by ${req.reviewedByName}` : ""}
                      {req.reviewedAt
                        ? ` · ${new Date(req.reviewedAt).toLocaleString()}`
                        : ""}
                    </p>
                    {req.adminNote && (
                      <p className="text-xs text-slate-600 mt-1 italic">
                        Note: {req.adminNote}
                      </p>
                    )}
                    <div className="mt-2">{renderRequestDocs(req)}</div>
                  </div>
                  <Chip
                    label={
                      req.status === "approved" ? "Approved" : "Rejected"
                    }
                    variant={req.status === "approved" ? "green" : "red"}
                    className="text-xs"
                  />
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {labels.directorWithNumber(director.directorNumber)}
                        </h3>
                        {(director.din || (director as any).dinNumber) && (
                          <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
                            DIN: {director.din || (director as any).dinNumber}
                          </span>
                        )}
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
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {director.directorName}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {director.email} • {director.phoneNo}
                        {(director as { isForeignResident?: boolean })
                          .isForeignResident && (
                          <span className="ml-2 text-xs font-medium text-[#3D63A4]">
                            • NRI / Foreign Resident
                          </span>
                        )}
                      </p>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 shrink-0 bg-slate-50 p-2 rounded-lg border border-slate-200"
                    >
                      <span className="text-xs font-semibold text-slate-600">
                        DIN Status:
                      </span>
                      <select
                        value={(director as any).dinStatus || "Pending"}
                        onChange={(e) =>
                          handleQuickDinStatusChange(e, director.id, e.target.value)
                        }
                        className={`text-xs font-bold rounded-md border px-2.5 py-1 outline-none transition-all cursor-pointer ${
                          (director as any).dinStatus === "Inactive"
                            ? "bg-rose-100 border-rose-300 text-rose-800"
                            : (director as any).dinStatus === "Active"
                            ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                            : (director as any).dinStatus === "In Progress"
                            ? "bg-amber-100 border-amber-300 text-amber-800"
                            : "bg-white border-slate-300 text-slate-700"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="In Progress">In Progress</option>
                      </select>
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
