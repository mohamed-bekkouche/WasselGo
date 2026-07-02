"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { ROLES } from "@/lib/roles";
import RoleGuard from "@/lib/RoleGuard";
import StatCard from "@/components/commons/StatCard";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { parseApiError } from "@/utils/apiErrorHandler";
import { listCompanies, updateCompany } from "@/services/CompanyService";
import CompanyList from "@/components/dashboard/company/CompanyList";
import CompanyDetailModal from "@/components/dashboard/company/CompanyDetailModal";
import {
    ICompanyResponse,
    ICompanyFilter,
    SubscriptionPlan,
    SubscriptionStatus,
} from "@/types/company";

const PAGE_SIZE = 10;

export default function CompanyPage() {
    const router = useRouter();

    // ── List state ────────────────────────────────────────────────────────────
    const [companies, setCompanies] = useState<ICompanyResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Filters ───────────────────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [planFilter, setPlanFilter] = useState<SubscriptionPlan | "">("");
    const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "">("");
    const [page, setPage] = useState(1);

    // ── Detail modal ──────────────────────────────────────────────────────────
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<ICompanyResponse | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);

    // ── Block confirm ─────────────────────────────────────────────────────────
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [blockTarget, setBlockTarget] = useState<ICompanyResponse | null>(null);
    const [blockLoading, setBlockLoading] = useState(false);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const filter: ICompanyFilter = {
                pageNumber: page,
                pageSize: PAGE_SIZE,
                search: search || undefined,
                subscriptionPlan: planFilter || undefined,
                subscriptionStatus: statusFilter || undefined,
            };
            const res = await listCompanies(filter);
            res.items.forEach(el => {
                console.log("SYBC" + el.subscriptionStatus == SubscriptionStatus.ACTIVE ? "Active" : el.subscriptionStatus); // default to active if missing
            }); // DEBUG
            setCompanies(res.items);
            setTotalCount(res.totalCount);
            setTotalPages(res.totalPages);
        } catch (e: any) {
            const err = parseApiError(e);
            setError(err.message ?? "Failed to load companies");
        } finally {
            setLoading(false);
        }
    }, [page, search, planFilter, statusFilter]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [search, planFilter, statusFilter]);



    const activeCount = companies.filter(
        (c) => c.subscriptionStatus == SubscriptionStatus.ACTIVE
    ).length;
    const suspendedCount = companies.filter(
        (c) => c.subscriptionStatus == SubscriptionStatus.SUSPENDED
    ).length;

    // ── Toggle block ──────────────────────────────────────────────────────────
    const handleToggleBlock = async () => {
        if (!blockTarget) return;
        setBlockLoading(true);
        try {
            const isSuspended = blockTarget.subscriptionStatus === SubscriptionStatus.SUSPENDED;
            await updateCompany(blockTarget.id, {
                // pass whatever your API accepts to toggle block
            });
            showToast.success(`Company ${isSuspended ? "unblocked" : "suspended"}`);
            setConfirmOpen(false);
            setBlockTarget(null);
            fetchCompanies();
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to update company");
        } finally {
            setBlockLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <RoleGuard allowedRoles={[ROLES.MANAGER, ROLES.OWNER, ROLES.ADMIN]}>
            <div className="flex flex-col gap-3 h-full">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div
                                className="w-1 h-6 rounded-full"
                                style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                            />
                            <h1 className="text-[22px] font-bold text-white tracking-tight">Companies</h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            Manage and monitor all registered companies.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/companies/create")}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95"
                        style={{
                            background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                            boxShadow: "0 4px 16px rgba(251,191,36,0.2)",
                        }}
                    >
                        <Plus size={13} />
                        New Company
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Total" value={totalCount} accent="#94a3b8" />
                    <StatCard label="Active" value={activeCount} accent="#34d399" />
                    <StatCard label="Suspended" value={suspendedCount} accent="#f87171" />
                </div>

                {error && <ErrorBaner error={error} setError={setError} />}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div
                        className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg"
                        style={{
                            background: "rgba(255,255,255,0.025)",
                            border: "1px solid rgba(255,255,255,0.07)",
                        }}
                    >
                        <Search size={13} className="text-slate-700 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by name or subdomain…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent text-[12.5px] text-white placeholder:text-slate-700 focus:outline-none flex-1 min-w-0"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="text-slate-700 hover:text-slate-500"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {/* Plan filter */}
                    <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value as SubscriptionPlan | "")}
                        className="px-3 py-2 rounded-lg text-[12.5px] text-white focus:outline-none"
                        style={{
                            background: "rgba(255,255,255,0.025)",
                            border: "1px solid rgba(255,255,255,0.07)",
                        }}
                    >
                        <option value="">All Plans</option>
                        {Object.values(SubscriptionPlan).map((p) => (
                            <option key={p} value={p} className="bg-slate-900 capitalize">
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </option>
                        ))}
                    </select>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as SubscriptionStatus | "")}
                        className="px-3 py-2 rounded-lg text-[12.5px] text-white focus:outline-none"
                        style={{
                            background: "rgba(255,255,255,0.025)",
                            border: "1px solid rgba(255,255,255,0.07)",
                        }}
                    >
                        <option value="">All Statuses</option>
                        {Object.values(SubscriptionStatus).map((s) => (
                            <option key={s} value={s} className="bg-slate-900 capitalize">
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                        ))}
                    </select>

                    <span className="text-[11px] text-slate-700 ml-auto hidden sm:block tabular-nums">
                        {totalCount} {totalCount !== 1 ? "companies" : "company"}
                    </span>
                </div>

                {/* Table */}
                <CompanyList
                    companies={companies}
                    loading={loading}
                    onAddClick={() => router.push("/companies/create")}
                    onViewDetail={(c) => {
                        setSelectedCompany(c);
                        setDetailOpen(true);
                    }}
                    onToggleBlock={(c) => {
                        setBlockTarget(c);
                        setConfirmOpen(true);
                    }}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-auto pt-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                        >
                            <ChevronLeft size={14} />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(
                                (p) =>
                                    p === 1 ||
                                    p === totalPages ||
                                    Math.abs(p - page) <= 1
                            )
                            .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === "…" ? (
                                    <span key={`ellipsis-${i}`} className="text-[12px] text-slate-600 px-1">
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p as number)}
                                        className="w-7 h-7 rounded-lg text-[12px] font-medium transition-all"
                                        style={
                                            page === p
                                                ? {
                                                    background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                                                    color: "#0f172a",
                                                }
                                                : {
                                                    color: "#94a3b8",
                                                    border: "1px solid rgba(255,255,255,0.07)",
                                                }
                                        }
                                    >
                                        {p}
                                    </button>
                                )
                            )}

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}

                {/* Detail modal */}
                {detailOpen && selectedCompany && (
                    <CompanyDetailModal
                        isOpen={detailOpen}
                        company={selectedCompany}
                        onClose={() => {
                            setDetailOpen(false);
                            setSelectedCompany(null);
                        }}
                    />
                )}

                {/* Block confirm */}
                {confirmOpen && blockTarget && (
                    <ConfirmDialog
                        title={`${blockTarget.subscriptionStatus === SubscriptionStatus.SUSPENDED ? "Unblock" : "Suspend"} Company`}
                        message={`${blockTarget.subscriptionStatus === SubscriptionStatus.SUSPENDED ? "Unblock" : "Suspend"} "${blockTarget.name}"?${blockTarget.subscriptionStatus !== SubscriptionStatus.SUSPENDED ? " All associated users will lose access." : ""}`}
                        confirmLabel="Confirm"
                        danger={blockTarget.subscriptionStatus !== SubscriptionStatus.SUSPENDED}
                        loading={blockLoading}
                        onConfirm={handleToggleBlock}
                        onCancel={() => {
                            setConfirmOpen(false);
                            setBlockTarget(null);
                        }}
                    />
                )}
            </div>
        </RoleGuard>
    );
}