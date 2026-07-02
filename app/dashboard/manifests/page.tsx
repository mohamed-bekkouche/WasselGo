"use client";

import { useCallback, useEffect, useState } from "react";
import { IPaginatedResponse } from "@/types/paginate";
import { ROLES } from "@/lib/roles";
import { getNodeId } from "@/hooks/useAuth";
import { showToast } from "nextjs-toast-notify";
import Pagination from "@/components/commons/Pagination";
import { Plus, Search, X } from "lucide-react";
import RoleGuard from "@/lib/RoleGuard";
import StatCard from "@/components/commons/StatCard";
import { ICreateManifest, IManifestFilter, IManifestResponse } from "@/types/manifest";
import { CreateManifest, ListManifests } from "@/services/ManifestService";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { parseApiError } from "@/utils/apiErrorHandler";
import ManifestList from "@/components/dashboard/manifests/ManifestList";
import CreateManifestModal from "@/components/dashboard/manifests/CreateManifestModal";
import ManifestDetailModal from "@/components/dashboard/manifests/ManifestDetailModal";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = ["", "Draft", "Sealed", "InTransit", "Arrived"] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

export default function ManifestsPage() {
    const managerNodeId = getNodeId() ?? "";

    const [pagination, setPagination] = useState<IPaginatedResponse<IManifestResponse> | null>(null);
    const manifests = pagination?.items ?? [];

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusOption>("");
    const [page, setPage] = useState(1);

    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedManifestId, setSelectedManifestId] = useState<string | null>(null);

    // ── Fetch ─────────────────────────────────────────────────────────────

    const fetchManifests = useCallback(async () => {
        setLoading(true);
        if (!managerNodeId) {
            setPagination(null);
            setLoading(false);
            setError("No logistics node is assigned to this manager.");
            return;
        }
        setError(null);
        try {
            const filter: IManifestFilter = {
                pageNumber: page,
                pageSize: PAGE_SIZE,
                nodeId: managerNodeId,
                ...(statusFilter ? { status: statusFilter } : {}),
            };
            const res = await ListManifests(filter);
            setPagination(res);
        } catch (e: any) {
            const err = parseApiError(e);
            console.error("Fetch Manifests error", err);
            showToast.error(err.message ?? "Failed to fetch manifests");
        } finally {
            setLoading(false);
        }
    }, [managerNodeId, page, statusFilter]);

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchManifests();
        }, 400);
        return () => clearTimeout(delay);
    }, [fetchManifests]);

    const totalCount = pagination?.totalCount ?? 0;
    const inTransitCount = manifests.filter((m) => m.status === "InTransit").length;

    // ── CRUD ──────────────────────────────────────────────────────────────

    const handleCreate = async (data: ICreateManifest) => {
        if (!managerNodeId) return;
        setCreateLoading(true);
        try {
            await CreateManifest(data);
            setCreateOpen(false);
            showToast.success("Manifest created successfully");
            fetchManifests();
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to create manifest");
            console.error("Create Manifest error", err);
        } finally {
            setCreateLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <RoleGuard allowedRoles={[ROLES.MANAGER, ROLES.RECEPTIONIST]}>
            <div className="flex flex-col gap-3 h-full">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div
                                className="w-1 h-6 rounded-full"
                                style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                            />
                            <h1 className="text-[22px] font-bold text-white tracking-tight">Manifests</h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            Manage dispatch manifests for your logistics node.
                        </p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95"
                        style={{
                            background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                            boxShadow: "0 4px 16px rgba(251,191,36,0.2)",
                        }}
                    >
                        <Plus size={13} />
                        New Manifest
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Total" value={totalCount} accent="#94a3b8" />
                    <StatCard label="In Transit" value={inTransitCount} accent="#a78bfa" />
                    <StatCard label="Showing" value={manifests.length} accent="#fbbf24" />
                </div>

                {error && <ErrorBaner error={error} setError={setError} />}

                {/* ── Filters ───────────────────────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search (visual only — filter by code client-side or wire to API) */}
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
                            placeholder="Search by code or node…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent text-[12.5px] text-white placeholder:text-slate-700 focus:outline-none flex-1 min-w-0"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-slate-700 hover:text-slate-500">
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {/* Status filter */}
                    <div className="flex items-center gap-1.5">
                        {STATUS_OPTIONS.map((s) => (
                            <button
                                key={s || "all"}
                                onClick={() => { setStatusFilter(s); setPage(1); }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150"
                                style={{
                                    background: statusFilter === s
                                        ? "rgba(251,191,36,0.12)"
                                        : "rgba(255,255,255,0.025)",
                                    border: statusFilter === s
                                        ? "1px solid rgba(251,191,36,0.25)"
                                        : "1px solid rgba(255,255,255,0.06)",
                                    color: statusFilter === s ? "#fbbf24" : "#64748b",
                                }}
                            >
                                {s || "All"}
                            </button>
                        ))}
                    </div>

                    <span className="text-[11px] text-slate-700 ml-auto hidden sm:block tabular-nums">
                        {manifests.length} manifest{manifests.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <ManifestList
                    manifests={
                        search
                            ? manifests.filter(
                                (m) =>
                                    m.code.toLowerCase().includes(search.toLowerCase()) ||
                                    m.fromNodeId.toLowerCase().includes(search.toLowerCase()) ||
                                    m.toNodeId.toLowerCase().includes(search.toLowerCase())
                            )
                            : manifests
                    }
                    loading={loading}
                    onAddClick={() => setCreateOpen(true)}
                    onViewDetail={(id) => { setSelectedManifestId(id); setDetailOpen(true); }}
                />

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <Pagination
                        pageNumber={pagination.pageNumber}
                        totalPages={pagination.totalPages}
                        hasNext={pagination.hasNextPage}
                        hasPrev={pagination.hasPreviousPage}
                        onChange={(p) => setPage(p)}
                    />
                )}

                {/* Modals */}
                <CreateManifestModal
                    isOpen={createOpen}
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreate}
                    loading={createLoading}
                />

                {selectedManifestId && (
                    <ManifestDetailModal
                        isOpen={detailOpen}
                        manifestId={selectedManifestId}
                        onClose={() => { setDetailOpen(false); setSelectedManifestId(null); }}
                        onStatusChange={fetchManifests}
                    />
                )}
            </div>
        </RoleGuard>
    );
}