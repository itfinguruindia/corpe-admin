"use client";

import { useCallback, useMemo, useState } from "react";
import {
  RefreshCw,
  MessageSquare,
  CalendarDays,
  Phone,
  IndianRupee,
} from "lucide-react";
import {
  Button,
  Chip,
  DateField,
  DateRangePicker,
  Description,
  Label,
  RangeCalendar,
  Spinner,
} from "@heroui/react";
import {
  getLocalTimeZone,
  today,
  type DateValue,
} from "@internationalized/date";

import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import {
  accountingApi,
  SmsUsageByDate,
  SmsUsageByNumber,
  SmsUsageReport,
} from "@/lib/api/accounting";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/permissions";
import OtpSessionsPanel from "./OtpSessionsPanel";

type DateRange = {
  start: DateValue;
  end: DateValue;
};

function defaultRange(): DateRange {
  const end = today(getLocalTimeZone());
  return { start: end.subtract({ days: 29 }), end };
}

function toIsoDate(value: DateValue): string {
  return value.toString(); // YYYY-MM-DD
}

function formatCost(cost: number, unit = "USD"): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: unit || "USD",
      maximumFractionDigits: 4,
    }).format(cost);
  } catch {
    return `${unit} ${cost.toFixed(4)}`;
  }
}

export default function SmsUsageAccountingPage() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission(PERMISSIONS.ACCOUNTING_VIEW);

  const [range, setRange] = useState<DateRange | null>(() => defaultRange());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SmsUsageReport | null>(null);

  const loadReport = useCallback(async () => {
    if (!canView) return;
    if (!range?.start || !range?.end) {
      setError("Please select a start and end date.");
      return;
    }

    const startDate = toIsoDate(range.start);
    const endDate = toIsoDate(range.end);

    setLoading(true);
    setError(null);
    try {
      const data = await accountingApi.getSmsUsage({ startDate, endDate });
      setReport(data);
    } catch (err: unknown) {
      console.error("Failed to load SMS usage:", err);
      const axiosErr = err as {
        response?: { status?: number; data?: { message?: string } };
        code?: string;
        message?: string;
      };
      const message =
        axiosErr?.response?.data?.message ||
        (axiosErr?.code === "ECONNABORTED"
          ? "Request timed out while fetching Twilio data. Try a shorter date range."
          : err instanceof Error
            ? err.message
            : "Failed to load SMS usage");
      setError(message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [canView, range]);

  const byDateColumns: ColumnDef<SmsUsageByDate>[] = useMemo(
    () => [
      {
        id: "date",
        label: "Date",
        render: (row) => (
          <span className="font-medium text-slate-800 whitespace-nowrap">
            {row.date}
          </span>
        ),
      },
      {
        id: "count",
        label: "Messages",
        render: (row) => (
          <span className="text-slate-700 tabular-nums">{row.count}</span>
        ),
      },
      {
        id: "segments",
        label: "Segments",
        render: (row) => (
          <span className="text-slate-700 tabular-nums">{row.segments}</span>
        ),
      },
      {
        id: "cost",
        label: "Cost",
        render: (row) => (
          <span className="font-semibold text-slate-900 tabular-nums">
            {formatCost(row.cost, report?.totals.priceUnit)}
          </span>
        ),
      },
    ],
    [report?.totals.priceUnit],
  );

  const byNumberColumns: ColumnDef<SmsUsageByNumber>[] = useMemo(
    () => [
      {
        id: "to",
        label: "Destination",
        render: (row) => (
          <span className="font-mono text-sm text-slate-800 whitespace-nowrap">
            {row.to || "—"}
          </span>
        ),
      },
      {
        id: "count",
        label: "Messages",
        render: (row) => (
          <span className="text-slate-700 tabular-nums">{row.count}</span>
        ),
      },
      {
        id: "segments",
        label: "Segments",
        render: (row) => (
          <span className="text-slate-700 tabular-nums">{row.segments}</span>
        ),
      },
      {
        id: "cost",
        label: "Cost",
        render: (row) => (
          <span className="font-semibold text-slate-900 tabular-nums">
            {formatCost(row.cost, report?.totals.priceUnit)}
          </span>
        ),
      },
    ],
    [report?.totals.priceUnit],
  );

  if (!canView) {
    return (
      <div className="p-6 text-slate-600">
        You do not have permission to view accounting reports.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 p-1">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2B4C7E] flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            SMS Usage
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage stored OTP numbers, unblock sessions, and pull live Twilio
            usage.
          </p>
        </div>
        <Button
          type="button"
          onPress={loadReport}
          isDisabled={loading || !range?.start || !range?.end}
          className="bg-[#2B4C7E] text-white"
        >
          {loading ? (
            <Spinner size="sm" color="current" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">{loading ? "Loading…" : "Load report"}</span>
        </Button>
      </div>

      <OtpSessionsPanel />

      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <DateRangePicker
            className="w-full max-w-md"
            value={range}
            onChange={(next) => setRange(next)}
            maxValue={today(getLocalTimeZone())}
            granularity="day"
          >
            <Label>Report date range</Label>
            <DateField.Group fullWidth>
              <DateField.InputContainer>
                <DateField.Input slot="start">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateRangePicker.RangeSeparator />
                <DateField.Input slot="end">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
              </DateField.InputContainer>
              <DateField.Suffix>
                <DateRangePicker.Trigger>
                  <DateRangePicker.TriggerIndicator />
                </DateRangePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <Description>
              Large ranges can take longer — Twilio is queried live with a 5,000
              message safety cap.
            </Description>
            <DateRangePicker.Popover>
              <RangeCalendar aria-label="SMS usage date range">
                <RangeCalendar.Header>
                  <RangeCalendar.YearPickerTrigger>
                    <RangeCalendar.YearPickerTriggerHeading />
                    <RangeCalendar.YearPickerTriggerIndicator />
                  </RangeCalendar.YearPickerTrigger>
                  <RangeCalendar.NavButton slot="previous" />
                  <RangeCalendar.NavButton slot="next" />
                </RangeCalendar.Header>
                <RangeCalendar.Grid>
                  <RangeCalendar.GridHeader>
                    {(day) => (
                      <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                    )}
                  </RangeCalendar.GridHeader>
                  <RangeCalendar.GridBody>
                    {(date) => <RangeCalendar.Cell date={date} />}
                  </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
                <RangeCalendar.YearPickerGrid>
                  <RangeCalendar.YearPickerGridBody>
                    {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
                  </RangeCalendar.YearPickerGridBody>
                </RangeCalendar.YearPickerGrid>
              </RangeCalendar>
            </DateRangePicker.Popover>
          </DateRangePicker>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {report && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<MessageSquare className="h-4 w-4" />}
              label="Messages"
              value={String(report.totals.totalMessages)}
            />
            <StatCard
              icon={<CalendarDays className="h-4 w-4" />}
              label="Segments"
              value={String(report.totals.totalSegments)}
            />
            <StatCard
              icon={<IndianRupee className="h-4 w-4" />}
              label="Total cost"
              value={formatCost(
                report.totals.totalCost,
                report.totals.priceUnit,
              )}
            />
            <StatCard
              icon={<Phone className="h-4 w-4" />}
              label="Unique numbers"
              value={String(report.byNumber.length)}
            />
          </div>

          {report.truncated && (
            <Chip color="warning" variant="soft" size="sm">
              Results truncated at {report.fetchCap} messages. Narrow the date
              range for a complete total.
            </Chip>
          )}

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-800">
              Usage by date
            </h2>
            <DataTable
              columns={byDateColumns}
              data={report.byDate}
              keyField="date"
              emptyMessage="No messages in this date range."
              columnVisibilityStorageKey="accounting-sms-by-date"
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-800">
              Usage by destination (highest cost first)
            </h2>
            <DataTable
              columns={byNumberColumns}
              data={report.byNumber}
              keyField="to"
              emptyMessage="No destination numbers in this date range."
              columnVisibilityStorageKey="accounting-sms-by-number"
            />
          </section>
        </>
      )}

      {!report && !loading && !error && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-500">
          Choose a date range and click <strong>Load report</strong> to pull
          live usage from Twilio.
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold text-slate-900 tabular-nums">
        {value}
      </div>
    </div>
  );
}
