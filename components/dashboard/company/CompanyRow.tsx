import { Eye, Power, Globe } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import { ICompanyResponse, SubscriptionStatus, SubscriptionPlan } from "@/types/company";

const STATUS_META: Record<string, { label: string; color: string; bg: string; glow?: string }> = {
    [SubscriptionStatus.ACTIVE]: { label: "Active", color: "#34d399", bg: "rgba(52,211,153,0.08)", glow: "0 0 8px rgba(52,211,153,0.5)" },
    [SubscriptionStatus.TRIAL]: { label: "Trial", color: "#22d3ee", bg: "rgba(34,211,238,0.08)" },
    [SubscriptionStatus.SUSPENDED]: { label: "Suspended", color: "#f87171", bg: "rgba(248,113,113,0.08)" },
    [SubscriptionStatus.CANCELED]: { label: "Canceled", color: "#64748b", bg: "rgba(100,116,139,0.08)" },
    [SubscriptionStatus.EXPIRED]: { label: "Expired", color: "#fb923c", bg: "rgba(251,146,60,0.08)" },
};

const PLAN_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
    [SubscriptionPlan.FREE]: { label: "Free", color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.15)" },
    [SubscriptionPlan.BASIC]: { label: "Basic", color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.15)" },
    [SubscriptionPlan.PRO]: { label: "Pro", color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.15)" },
    [SubscriptionPlan.ENTERPRISE]: { label: "Enterprise", color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.15)" },
};

const CompanyRow = ({
    company,
    isLast,
    onViewDetail,
    onToggleBlock,
}: {
    company: ICompanyResponse;
    isLast: boolean;
    onViewDetail?: () => void;
    onToggleBlock?: () => void;
}) => {
    const statusMeta = STATUS_META[company.subscriptionStatus] ?? STATUS_META[SubscriptionStatus.ACTIVE];
    const planMeta = PLAN_META[company.subscriptionPlan] ?? PLAN_META[SubscriptionPlan.FREE];
    const initial = company.name?.[0]?.toUpperCase() ?? "C";
    const isSuspended = company.subscriptionStatus === SubscriptionStatus.SUSPENDED;

    return (
        <div
            className={`
                group grid grid-cols-[1fr_auto] md:grid-cols-[1fr_320px_140px_140px_120px]
                gap-4 px-5 py-3.5 items-center transition-all duration-150
                hover:bg-white/2.5
                ${isSuspended ? "bg-red-500/2" : ""}
                ${!isLast ? "border-b border-white/4" : ""}
            `}
        >
            {/* Avatar + name + subdomain */}
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0 transition-transform duration-200 group-hover:scale-[1.06]"
                    style={{
                        background: "rgba(251,191,36,0.08)",
                        border: "1px solid rgba(251,191,36,0.18)",
                        color: "#fbbf24",
                    }}
                >
                    {initial}
                </div>
                <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-slate-100 truncate leading-snug">
                        {company.name}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                        <Globe size={9} className="text-slate-700 shrink-0" />
                        <span className="text-[10.5px] text-slate-700 truncate">{company.subdomain}</span>
                    </div>
                </div>
            </div>

            {/* Owner */}
            <div className="hidden md:flex flex-col gap-0.5 min-w-0">
                {company.owner ? (
                    <>
                        <span className="text-[12px] text-slate-400 truncate font-medium">
                            {company.owner.fullName ?? company.owner.email}
                        </span>
                        {company.owner.fullName && (
                            <span className="text-[10.5px] text-slate-700 truncate">{company.owner.email}</span>
                        )}
                    </>
                ) : (
                    <span className="text-[10.5px] text-slate-700 italic">No owner</span>
                )}
            </div>

            {/* Plan badge */}
            <div className="hidden md:block">
                <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{
                        background: planMeta.bg,
                        color: planMeta.color,
                        border: `1px solid ${planMeta.border}`,
                    }}
                >
                    {planMeta.label}
                </span>
            </div>

            {/* Status */}
            <div className="hidden md:flex items-center gap-1.5">
                <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${company.subscriptionStatus === SubscriptionStatus.ACTIVE ? "animate-pulse" : ""}`}
                    style={{
                        background: statusMeta.color,
                        boxShadow: statusMeta.glow ?? "none",
                    }}
                />
                <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: statusMeta.bg, color: statusMeta.color }}
                >
                    {statusMeta.label}
                </span>
            </div>



            {/* Actions */}
            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {onViewDetail && (
                    <ActionBtn title="View & edit" variant="emerald" onClick={onViewDetail} revealOnHover>
                        <Eye size={12} />
                    </ActionBtn>
                )}
                {onToggleBlock && (
                    <ActionBtn
                        onClick={onToggleBlock}
                        title={isSuspended ? "Unblock company" : "Suspend company"}
                        variant={isSuspended ? "emerald" : "red"}
                        revealOnHover
                    >
                        <Power size={12} className={isSuspended ? "text-emerald-400" : "text-rose-400"} />
                    </ActionBtn>
                )}
            </div>
        </div>
    );
};

export default CompanyRow;