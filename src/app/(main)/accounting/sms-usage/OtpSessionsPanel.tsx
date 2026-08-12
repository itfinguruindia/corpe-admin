"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, RefreshCw, ShieldOff } from "lucide-react";
import { Button, Chip, Input, Label, Spinner, TextField } from "@heroui/react";

import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import {
  accountingApi,
  OtpBlockedIpRow,
  OtpSessionRow,
} from "@/lib/api/accounting";
import useSwal from "@/utils/useSwal";

function formatWhen(value?: string | Date | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function remainingLabel(until?: string | Date | null): string {
  if (!until) return "";
  const ms = new Date(until).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const minutes = Math.max(1, Math.ceil(ms / 60000));
  return `${minutes} min left`;
}

export default function OtpSessionsPanel() {
  const swal = useSwal();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<OtpSessionRow[]>([]);
  const [blockedIps, setBlockedIps] = useState<OtpBlockedIpRow[]>([]);
  const [query, setQuery] = useState("");
  const [clearingKey, setClearingKey] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountingApi.getOtpSessions();
      setSessions(data.sessions || []);
      setBlockedIps(data.blockedIps || []);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
      };
      setError(
        axiosErr?.response?.data?.message ||
          (err instanceof Error ? err.message : "Failed to load OTP sessions"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const filteredSessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (row) =>
        row.phone.toLowerCase().includes(q) ||
        row.ips.some((ip) => ip.toLowerCase().includes(q)),
    );
  }, [sessions, query]);

  const clearSession = useCallback(
    async (params: { phone?: string; ip?: string }, label: string) => {
      const result = await swal({
        title: "Clear this session?",
        text: `This immediately unblocks ${label} so they can request OTP again.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2B4C7E",
        cancelButtonColor: "#94a3b8",
        confirmButtonText: "Clear session",
      });
      if (!result.isConfirmed) return;

      const key = params.phone || params.ip || "";
      setClearingKey(key);
      try {
        await accountingApi.clearOtpSession(params);
        await swal({
          title: "Unblocked",
          text: `${label} can request OTP immediately.`,
          icon: "success",
        });
        await loadSessions();
      } catch (err: unknown) {
        const axiosErr = err as {
          response?: { data?: { message?: string } };
        };
        await swal({
          title: "Could not clear session",
          text:
            axiosErr?.response?.data?.message ||
            (err instanceof Error ? err.message : "Please try again."),
          icon: "error",
        });
      } finally {
        setClearingKey(null);
      }
    },
    [loadSessions, swal],
  );

  const sessionColumns: ColumnDef<OtpSessionRow>[] = useMemo(
    () => [
      {
        id: "phone",
        label: "Phone number",
        render: (row) => (
          <span className="font-mono text-sm text-slate-800 whitespace-nowrap">
            {row.phone}
          </span>
        ),
      },
      {
        id: "ips",
        label: "IP address",
        render: (row) => (
          <span className="font-mono text-xs text-slate-600">
            {row.ips.length ? row.ips.join(", ") : "—"}
          </span>
        ),
      },
      {
        id: "attempts",
        label: "Attempts",
        render: (row) => (
          <span className="tabular-nums text-slate-700">
            {row.sentCount} sent / {row.attemptCount}
          </span>
        ),
      },
      {
        id: "lastAttemptAt",
        label: "Last request",
        render: (row) => (
          <span className="whitespace-nowrap text-slate-700">
            {formatWhen(row.lastAttemptAt)}
          </span>
        ),
      },
      {
        id: "status",
        label: "Status",
        render: (row) =>
          row.blocked ? (
            <Chip color="danger" variant="soft" size="sm">
              Blocked · {remainingLabel(row.blockedUntil)}
            </Chip>
          ) : (
            <Chip color="success" variant="soft" size="sm">
              Active
            </Chip>
          ),
      },
      {
        id: "actions",
        label: "Session",
        canHide: false,
        render: (row) => (
          <Button
            size="sm"
            className="bg-white text-[#2B4C7E] border border-slate-200"
            isDisabled={clearingKey === row.phone}
            onPress={() => clearSession({ phone: row.phone }, row.phone)}
          >
            {clearingKey === row.phone ? (
              <Spinner size="sm" color="current" />
            ) : (
              <ShieldOff className="h-3.5 w-3.5" />
            )}
            <span className="ml-1.5">Clear session</span>
          </Button>
        ),
      },
    ],
    [clearSession, clearingKey],
  );

  const ipColumns: ColumnDef<OtpBlockedIpRow>[] = useMemo(
    () => [
      {
        id: "ip",
        label: "Blocked IP",
        render: (row) => (
          <span className="font-mono text-sm text-slate-800">{row.ip}</span>
        ),
      },
      {
        id: "reason",
        label: "Reason",
        render: (row) => (
          <span className="text-slate-700">{row.reason.replace(/_/g, " ")}</span>
        ),
      },
      {
        id: "blockedUntil",
        label: "Blocked until",
        render: (row) => (
          <span className="whitespace-nowrap text-slate-700">
            {formatWhen(row.blockedUntil)} ({remainingLabel(row.blockedUntil)})
          </span>
        ),
      },
      {
        id: "actions",
        label: "Session",
        canHide: false,
        render: (row) => (
          <Button
            size="sm"
            className="bg-white text-red-700 border border-red-200"
            isDisabled={clearingKey === row.ip}
            onPress={() => clearSession({ ip: row.ip }, row.ip)}
          >
            {clearingKey === row.ip ? (
              <Spinner size="sm" color="current" />
            ) : (
              <Ban className="h-3.5 w-3.5" />
            )}
            <span className="ml-1.5">Unblock IP</span>
          </Button>
        ),
      },
    ],
    [clearSession, clearingKey],
  );

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            OTP numbers & blocks
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Stored registration OTP requests. Clear a session to unblock that
            number or IP immediately.
          </p>
        </div>
        <Button
          type="button"
          onPress={() => void loadSessions()}
          isDisabled={loading}
          className="bg-[#2B4C7E] text-white"
        >
          {loading ? (
            <Spinner size="sm" color="current" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">{loading ? "Loading…" : "Refresh"}</span>
        </Button>
      </div>

      <TextField
        className="max-w-sm"
        value={query}
        onChange={setQuery}
        name="searchOtpSessions"
      >
        <Label>Search number or IP</Label>
        <Input placeholder="+91… or IP" />
      </TextField>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DataTable
        columns={sessionColumns}
        data={filteredSessions}
        keyField="phone"
        loading={loading}
        emptyMessage="No OTP numbers stored yet. They appear here when someone requests a registration OTP."
        columnVisibilityStorageKey="accounting-otp-sessions"
        tableMinHeight="min-h-[240px]"
      />

      {blockedIps.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-base font-semibold text-slate-800">
            Blocked IP addresses
          </h3>
          <DataTable
            columns={ipColumns}
            data={blockedIps}
            keyField="ip"
            emptyMessage="No blocked IPs."
            columnVisibilityStorageKey="accounting-otp-blocked-ips"
            tableMinHeight="min-h-[160px]"
          />
        </div>
      )}
    </section>
  );
}
