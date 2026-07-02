"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import StatCard from "@/components/commons/StatCard";
import { IPlan, ICreatePlan } from "@/types/plan";
import { createPlan, getPlans } from "@/services/PlanService";
import PlanList from "@/components/dashboard/plans/PlanList";
import CreatePlanModal from "@/components/dashboard/plans/CreatePlanModal";
import PlanDetailModal from "@/components/dashboard/plans/PlanDetailModal";

export default function PlansPage() {
    const [plans, setPlans] = useState<IPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null);

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPlans();
            setPlans(res);
        } catch (e: any) {
            showToast.error(e?.message ?? "Failed to fetch plans");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPlans(); }, [fetchPlans]);

    const filtered = plans.filter((p) =>
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = plans.filter((p) => p.isActive).length;

    const handleCreate = async (data: ICreatePlan) => {
        setCreateLoading(true);
        try {
            await createPlan(data);
            setCreateOpen(false);
            showToast.success("Plan created successfully");
            fetchPlans();
        } catch (e: any) {
            const serverErrors = e?.response?.data?.errors;
            const firstServerError = serverErrors
                ? Object.values(serverErrors).flat().find(Boolean)
                : null;
            const msg =
                firstServerError ??
                e?.response?.data?.message ??
                e?.message ??
                "Failed to create plan";
            showToast.error(msg as string);
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 h-full">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pt-1">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div
                            className="w-1 h-6 rounded-full"
                            style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                        />
                        <h1 className="text-[22px] font-bold text-white tracking-tight">Plans</h1>
                    </div>
                    <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                        Manage subscription plans and their limits.
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
                    New Plan
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <StatCard label="Total" value={plans.length} accent="#94a3b8" />
                <StatCard label="Active" value={activeCount} accent="#34d399" />
                <StatCard label="Showing" value={filtered.length} accent="#fbbf24" />
            </div>

            {/* Search */}
            <div className="flex flex-wrap items-center gap-3">
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
                        placeholder="Search by name or code…"
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
                <span className="text-[11px] text-slate-700 ml-auto hidden sm:block tabular-nums">
                    {filtered.length} plan{filtered.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* List */}
            <PlanList
                plans={filtered}
                loading={loading}
                onAddClick={() => setCreateOpen(true)}
                onViewDetail={(plan) => { setSelectedPlan(plan); setDetailOpen(true); }}
            />

            {/* Modals */}
            <CreatePlanModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={handleCreate}
                loading={createLoading}
            />

            {selectedPlan && (
                <PlanDetailModal
                    isOpen={detailOpen}
                    plan={selectedPlan}
                    onClose={() => {
                        setDetailOpen(false);
                        setSelectedPlan(null);
                    }}
                    onUpdated={fetchPlans}
                />
            )}
        </div>
    );
}