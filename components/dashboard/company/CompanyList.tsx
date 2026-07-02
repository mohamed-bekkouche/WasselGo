"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import EmptyState from "@/components/commons/EmptyState";
import { Building2 } from "lucide-react";
import CompanyRow from "./CompanyRow";
import { ICompanyResponse } from "@/types/company";

interface CompanyListProps {
    companies: ICompanyResponse[];
    loading?: boolean;
    onAddClick?: () => void;
    onViewDetail?: (company: ICompanyResponse) => void;
    onToggleBlock?: (company: ICompanyResponse) => void;
}

const HEADERS = ["Company", "Owner", "Plan", "Status", "Actions"];

export default function CompanyList({
    companies,
    loading,
    onAddClick,
    onViewDetail,
    onToggleBlock,
}: CompanyListProps) {
    const shell = (children: React.ReactNode) => (
        <div
            style={{
                background: "#060a10",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
        >
            {children}
        </div>
    );

    if (loading) return shell(<SkeletonList rows={3} />);

    if (companies.length === 0) {
        return shell(
            <div className="flex justify-center items-center min-h-55">
                <EmptyState
                    title="No companies yet"
                    description="Create a company to start managing branches and shipments."
                    icon={Building2}
                    actionLabel="+ Create Company"
                    tone="warning"
                    onAction={onAddClick}
                />
            </div>
        );
    }

    return shell(
        <>
            {/* Section header — mirrors driver modal's section divider */}
            <div
                className="flex items-center gap-3 px-5 py-3 border-b border-white/4"
                style={{ background: "rgba(255,255,255,0.015)" }}
            >



                {/* Column labels */}
                <div className="hidden md:grid grid-cols-[1fr_320px_140px_140px_120px] gap-4 flex-1">
                    {HEADERS.map((h, i) => (
                        <div
                            key={i}
                            className={`text-[9px] uppercase tracking-[0.14em] text-slate-800 font-semibold ${i === 4 ? "justify-self-end" : ""}`}
                        >
                            {h}
                        </div>
                    ))}
                </div>
            </div>

            {/* Rows */}
            {companies.map((c, idx) => (
                <CompanyRow
                    key={c.id}
                    company={c}
                    isLast={idx === companies.length - 1}
                    onViewDetail={onViewDetail ? () => onViewDetail(c) : undefined}
                    onToggleBlock={onToggleBlock ? () => onToggleBlock(c) : undefined}
                />
            ))}
        </>
    );
}