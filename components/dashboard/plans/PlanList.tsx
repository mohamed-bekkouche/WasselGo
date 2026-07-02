"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import EmptyState from "@/components/commons/EmptyState";
import { CreditCard } from "lucide-react";
import { IPlan } from "@/types/plan";
import PlanRow from "./PlanRow";

interface PlanListProps {
    plans: IPlan[];
    loading?: boolean;
    onViewDetail?: (plan: IPlan) => void;
    onAddClick?: () => void;
}

export default function PlanList({ plans, loading, onAddClick, onViewDetail }: PlanListProps) {
    const tableStyle: React.CSSProperties = {
        background: "#060a10",
        height: "100%",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
    };

    if (loading) return <div style={tableStyle}><SkeletonList rows={4} /></div>;

    if (plans.length === 0) {
        return (
            <div className="flex justify-center items-center" style={tableStyle}>
                <EmptyState
                    title="No Plans yet"
                    description="Create your first subscription plan to get started."
                    icon={CreditCard}
                    actionLabel="+ Add Plan"
                    tone="warning"
                    onAction={onAddClick}
                />
            </div>
        );
    }

    return (
        <div style={tableStyle}>
            <div
                className="hidden md:grid grid-cols-[200px_100px_1fr_1fr_120px_auto] gap-4 px-5 py-2.5 border-b border-white/5"
                style={{ background: "rgba(255,255,255,0.015)" }}
            >
                {["Plan", "Code", "Monthly", "Yearly", "Status", ""].map((h, i) => (
                    <div key={i} className="text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold">
                        {h}
                    </div>
                ))}
            </div>
            {plans.map((plan, idx) => (
                <PlanRow
                    key={plan.id}
                    plan={plan}
                    isLast={idx === plans.length - 1}
                    onViewDetail={onViewDetail ? () => onViewDetail(plan) : undefined}
                />
            ))}
        </div>
    );
}