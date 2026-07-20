"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Eye,
  CreditCard,
  Receipt,
  RotateCcw,
  Landmark,
  Search,
  IndianRupee,
} from "lucide-react";
import {
  Button,
  Chip,
  Input,
  Label,
  Modal,
  TextField,
  Tabs,
  Spinner,
  useOverlayState,
} from "@heroui/react";

import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import {
  accountingApi,
  RazorpayEntity,
  RazorpayListResponse,
} from "@/lib/api/accounting";

type ResourceTab = "payments" | "orders" | "refunds" | "settlements";

const PAGE_SIZE = 20;

function formatAmount(paise?: number, currency = "INR"): string {
  if (typeof paise !== "number") return "—";
  const value = paise / 100;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `₹${value.toFixed(2)}`;
  }
}

function formatUnix(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusColor(
  status?: string,
): "success" | "warning" | "danger" | "accent" | "default" {
  const s = (status || "").toLowerCase();
  if (["captured", "paid", "processed", "refunded"].includes(s)) return "success";
  if (["authorized", "created", "pending"].includes(s)) return "warning";
  if (["failed", "cancelled"].includes(s)) return "danger";
  return "default";
}

function StatusChip({ status }: { status?: string }) {
  return (
    <Chip color={statusColor(status)} variant="soft" size="sm" className="capitalize">
      {status || "unknown"}
    </Chip>
  );
}

function IdCell({ value }: { value?: string }) {
  if (!value) return <span className="text-slate-400">—</span>;
  return (
    <span className="font-mono text-xs text-slate-700" title={value}>
      {value}
    </span>
  );
}

export default function RazorpayAccountingPage() {
  const [tab, setTab] = useState<ResourceTab>("payments");
  const [items, setItems] = useState<RazorpayEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailData, setDetailData] = useState<RazorpayEntity | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [orderPayments, setOrderPayments] = useState<RazorpayEntity[]>([]);

  const detailModal = useOverlayState({
    isOpen: detailOpen,
    onOpenChange: (open) => {
      setDetailOpen(open);
      if (!open) {
        setDetailData(null);
        setOrderPayments([]);
      }
    },
  });

  const skip = (page - 1) * PAGE_SIZE;

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let response: RazorpayListResponse;
      const params = { count: PAGE_SIZE, skip };

      if (tab === "payments") {
        response = await accountingApi.listPayments(params);
      } else if (tab === "orders") {
        response = await accountingApi.listOrders(params);
      } else if (tab === "refunds") {
        response = await accountingApi.listRefunds(params);
      } else {
        response = await accountingApi.listSettlements(params);
      }

      const list = Array.isArray(response?.items) ? response.items : [];
      setItems(list);
      setHasMore(list.length >= PAGE_SIZE);
    } catch (err) {
      console.error("Failed to load Razorpay data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load Razorpay data. Please try again.",
      );
      setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [tab, skip]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const openDetail = async (entity: RazorpayEntity) => {
    const id = String(entity.id || "");
    if (!id) return;

    setDetailLoading(true);
    setDetailData(null);
    setOrderPayments([]);
    setDetailTitle(`${tab.slice(0, -1)} · ${id}`);
    setDetailOpen(true);

    try {
      let data: RazorpayEntity;
      if (tab === "payments") data = await accountingApi.getPayment(id);
      else if (tab === "orders") {
        data = await accountingApi.getOrder(id);
        try {
          const related = await accountingApi.getOrderPayments(id);
          setOrderPayments(Array.isArray(related?.items) ? related.items : []);
        } catch {
          setOrderPayments([]);
        }
      } else if (tab === "refunds") data = await accountingApi.getRefund(id);
      else data = await accountingApi.getSettlement(id);
      setDetailData(data);
    } catch (err) {
      console.error("Failed to load detail:", err);
      setDetailData(entity);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSearchById = async () => {
    const id = searchId.trim();
    if (!id) {
      loadList();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let data: RazorpayEntity;
      if (tab === "payments") data = await accountingApi.getPayment(id);
      else if (tab === "orders") data = await accountingApi.getOrder(id);
      else if (tab === "refunds") data = await accountingApi.getRefund(id);
      else data = await accountingApi.getSettlement(id);
      setItems([data]);
      setHasMore(false);
      setPage(1);
    } catch (err) {
      console.error("Search failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : `No ${tab.slice(0, -1)} found for that ID.`,
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const paymentColumns: ColumnDef<RazorpayEntity>[] = useMemo(
    () => [
      {
        id: "id",
        label: "Payment ID",
        render: (row) => <IdCell value={row.id as string} />,
      },
      {
        id: "amount",
        label: "Amount",
        render: (row) => (
          <span className="font-semibold text-slate-900 whitespace-nowrap">
            {formatAmount(row.amount as number, row.currency as string)}
          </span>
        ),
      },
      {
        id: "status",
        label: "Status",
        render: (row) => <StatusChip status={row.status as string} />,
      },
      {
        id: "method",
        label: "Method",
        render: (row) => (
          <span className="capitalize text-slate-700">
            {(row.method as string) || "—"}
          </span>
        ),
      },
      {
        id: "email",
        label: "Email",
        render: (row) => (
          <span className="text-slate-700 whitespace-nowrap">
            {(row.email as string) || "—"}
          </span>
        ),
      },
      {
        id: "contact",
        label: "Contact",
        render: (row) => (
          <span className="text-slate-700 whitespace-nowrap">
            {(row.contact as string) || "—"}
          </span>
        ),
      },
      {
        id: "order_id",
        label: "Order ID",
        render: (row) => <IdCell value={row.order_id as string} />,
      },
      {
        id: "created_at",
        label: "Created",
        render: (row) => (
          <span className="text-slate-600 whitespace-nowrap">
            {formatUnix(row.created_at as number)}
          </span>
        ),
      },
      {
        id: "actions",
        label: "Actions",
        canHide: false,
        render: (row) => (
          <Button
            size="sm"
            variant="ghost"
            className="text-secondary"
            onPress={() => openDetail(row)}
          >
            <Eye size={14} />
            View
          </Button>
        ),
      },
    ],
    [tab],
  );

  const orderColumns: ColumnDef<RazorpayEntity>[] = useMemo(
    () => [
      {
        id: "id",
        label: "Order ID",
        render: (row) => <IdCell value={row.id as string} />,
      },
      {
        id: "amount",
        label: "Amount",
        render: (row) => (
          <span className="font-semibold text-slate-900 whitespace-nowrap">
            {formatAmount(row.amount as number, row.currency as string)}
          </span>
        ),
      },
      {
        id: "amount_paid",
        label: "Paid",
        render: (row) =>
          formatAmount(row.amount_paid as number, row.currency as string),
      },
      {
        id: "amount_due",
        label: "Due",
        render: (row) =>
          formatAmount(row.amount_due as number, row.currency as string),
      },
      {
        id: "status",
        label: "Status",
        render: (row) => <StatusChip status={row.status as string} />,
      },
      {
        id: "receipt",
        label: "Receipt",
        render: (row) => (
          <span className="text-slate-700">{(row.receipt as string) || "—"}</span>
        ),
      },
      {
        id: "attempts",
        label: "Attempts",
        render: (row) => String(row.attempts ?? 0),
      },
      {
        id: "created_at",
        label: "Created",
        render: (row) => formatUnix(row.created_at as number),
      },
      {
        id: "actions",
        label: "Actions",
        canHide: false,
        render: (row) => (
          <Button
            size="sm"
            variant="ghost"
            className="text-secondary"
            onPress={() => openDetail(row)}
          >
            <Eye size={14} />
            View
          </Button>
        ),
      },
    ],
    [tab],
  );

  const refundColumns: ColumnDef<RazorpayEntity>[] = useMemo(
    () => [
      {
        id: "id",
        label: "Refund ID",
        render: (row) => <IdCell value={row.id as string} />,
      },
      {
        id: "payment_id",
        label: "Payment ID",
        render: (row) => <IdCell value={row.payment_id as string} />,
      },
      {
        id: "amount",
        label: "Amount",
        render: (row) => (
          <span className="font-semibold text-slate-900">
            {formatAmount(row.amount as number, row.currency as string)}
          </span>
        ),
      },
      {
        id: "status",
        label: "Status",
        render: (row) => <StatusChip status={row.status as string} />,
      },
      {
        id: "created_at",
        label: "Created",
        render: (row) => formatUnix(row.created_at as number),
      },
      {
        id: "actions",
        label: "Actions",
        canHide: false,
        render: (row) => (
          <Button
            size="sm"
            variant="ghost"
            className="text-secondary"
            onPress={() => openDetail(row)}
          >
            <Eye size={14} />
            View
          </Button>
        ),
      },
    ],
    [tab],
  );

  const settlementColumns: ColumnDef<RazorpayEntity>[] = useMemo(
    () => [
      {
        id: "id",
        label: "Settlement ID",
        render: (row) => <IdCell value={row.id as string} />,
      },
      {
        id: "amount",
        label: "Amount",
        render: (row) => (
          <span className="font-semibold text-slate-900">
            {formatAmount(row.amount as number, row.currency as string)}
          </span>
        ),
      },
      {
        id: "status",
        label: "Status",
        render: (row) => <StatusChip status={row.status as string} />,
      },
      {
        id: "fees",
        label: "Fees",
        render: (row) =>
          formatAmount(row.fees as number, row.currency as string),
      },
      {
        id: "tax",
        label: "Tax",
        render: (row) => formatAmount(row.tax as number, row.currency as string),
      },
      {
        id: "created_at",
        label: "Created",
        render: (row) => formatUnix(row.created_at as number),
      },
      {
        id: "actions",
        label: "Actions",
        canHide: false,
        render: (row) => (
          <Button
            size="sm"
            variant="ghost"
            className="text-secondary"
            onPress={() => openDetail(row)}
          >
            <Eye size={14} />
            View
          </Button>
        ),
      },
    ],
    [tab],
  );

  const columns =
    tab === "payments"
      ? paymentColumns
      : tab === "orders"
        ? orderColumns
        : tab === "refunds"
          ? refundColumns
          : settlementColumns;

  const capturedTotal = useMemo(() => {
    if (tab !== "payments") return null;
    return items
      .filter((i) => String(i.status).toLowerCase() === "captured")
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  }, [items, tab]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#FFF1EB] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#F46A45]">
            <CreditCard size={14} />
            Accounting
          </div>
          <h1 className="text-2xl font-bold text-[#1e3a8a]">Razorpay</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Live payments, orders, refunds and settlements from your Razorpay
            account — synced via Razorpay APIs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {capturedTotal !== null && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                <IndianRupee size={12} />
                Captured on this page
              </div>
              <div className="text-lg font-bold text-emerald-900">
                {formatAmount(capturedTotal)}
              </div>
            </div>
          )}
          <Button
            variant="secondary"
            className="border border-slate-200 bg-white"
            onPress={() => loadList()}
            isDisabled={loading}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) => {
            setTab(String(key) as ResourceTab);
            setPage(1);
            setSearchId("");
            setError(null);
          }}
          className="w-full"
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Razorpay resources" className="gap-1">
              <Tabs.Tab id="payments" className="px-4">
                <CreditCard size={14} />
                Payments
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="orders" className="px-4">
                <Receipt size={14} />
                Orders
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="refunds" className="px-4">
                <RotateCcw size={14} />
                Refunds
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="settlements" className="px-4">
                <Landmark size={14} />
                Settlements
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <TextField className="flex-1">
            <Label className="text-xs font-semibold text-slate-500">
              Search by Razorpay ID
            </Label>
            <Input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder={`e.g. pay_… / order_… / rfnd_…`}
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchById();
              }}
            />
          </TextField>
          <Button
            className="bg-[#F46A45] text-white"
            onPress={handleSearchById}
            isDisabled={loading}
          >
            <Search size={15} />
            {searchId.trim() ? "Find" : "Clear & reload"}
          </Button>
        </div>
      </div>

      <DataTable<RazorpayEntity>
        data={items}
        columns={columns}
        keyField={(row) => String(row.id || Math.random())}
        loading={loading}
        error={error}
        currentPage={page}
        totalPages={hasMore ? page + 1 : page}
        totalItems={skip + items.length + (hasMore ? 1 : 0)}
        itemsPerPage={PAGE_SIZE}
        onPageChange={(next) => {
          setSearchId("");
          setPage(next);
        }}
        showColumnVisibilityToggle
        columnVisibilityStorageKey={`accounting-razorpay-${tab}`}
        emptyMessage={`No ${tab} found in Razorpay for this page.`}
        tableMinHeight="min-h-[55vh]"
        columnMinWidth={160}
      />

      <Modal state={detailModal}>
        <Modal.Backdrop className="bg-black/50 backdrop-blur-sm">
          <Modal.Container placement="center" className="p-4">
            <Modal.Dialog className="flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl outline-none max-h-[90vh]">
              <Modal.Header className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
                <Modal.Heading className="text-lg font-semibold text-slate-900">
                  {detailTitle}
                </Modal.Heading>
                <Modal.CloseTrigger
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close modal"
                />
              </Modal.Header>
              <Modal.Body className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-slate-700">
                {detailLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Spinner />
                  </div>
                ) : detailData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        ["ID", detailData.id],
                        ["Status", detailData.status],
                        [
                          "Amount",
                          formatAmount(
                            detailData.amount as number,
                            detailData.currency as string,
                          ),
                        ],
                        ["Currency", detailData.currency],
                        ["Method", detailData.method],
                        ["Email", detailData.email],
                        ["Contact", detailData.contact],
                        ["Order ID", detailData.order_id],
                        ["Payment ID", detailData.payment_id],
                        ["Receipt", detailData.receipt],
                        ["Created", formatUnix(detailData.created_at as number)],
                      ]
                        .filter(([, v]) => v !== undefined && v !== null && v !== "")
                        .map(([label, value]) => (
                          <div
                            key={String(label)}
                            className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                          >
                            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              {label}
                            </div>
                            <div className="mt-0.5 break-all text-sm font-medium text-slate-800">
                              {String(value)}
                            </div>
                          </div>
                        ))}
                    </div>

                    {orderPayments.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm font-bold text-slate-800">
                          Payments on this order
                        </h3>
                        <div className="space-y-2">
                          {orderPayments.map((p) => (
                            <div
                              key={String(p.id)}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
                            >
                              <IdCell value={p.id as string} />
                              <StatusChip status={p.status as string} />
                              <span className="font-semibold">
                                {formatAmount(
                                  p.amount as number,
                                  p.currency as string,
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <details className="rounded-lg border border-slate-200 bg-white">
                      <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-600">
                        Raw JSON
                      </summary>
                      <pre className="max-h-72 overflow-auto border-t border-slate-100 bg-slate-950 p-3 text-xs text-emerald-300">
                        {JSON.stringify(detailData, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No details available.</p>
                )}
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
