import { Eye } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import { IPlan } from "@/types/plan";

const PLAN_META: Record<string, { bg: string; border: string; color: string }> = {
    free: { bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)", color: "#94a3b8" },
    basic: { bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.2)", color: "#38bdf8" },
    pro: { bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)", color: "#fbbf24" },
    enterprise: { bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)", color: "#a78bfa" },
};

function getPlanMeta(code: string) {
    return PLAN_META[code.toLowerCase()] ?? {
        bg: "rgba(251,191,36,0.1)",
        border: "rgba(251,191,36,0.2)",
        color: "#fbbf24",
    };
}

function getInitials(name: string) {
    return name.slice(0, 2).toUpperCase();
}

function formatPrice(amount: number, currency: string) {
    return new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: currency || "DZD",
        maximumFractionDigits: 0,
    }).format(amount);
}

const PlanRow = ({
    plan,
    isLast,
    onViewDetail,
}: {
    plan: IPlan;
    isLast: boolean;
    onViewDetail?: () => void;
}) => {
    const m = getPlanMeta(plan.code);

    return (
        <div
            className={`
                group grid grid-cols-[1fr_auto] md:grid-cols-[200px_100px_1fr_1fr_120px_auto]
                gap-4 px-5 py-4 items-center transition-all duration-150
                hover:bg-white/2.5
                ${!plan.isActive ? "opacity-50" : ""}
                ${!isLast ? "border-b border-white/4" : ""}
            `}
        >
            {/* Name + avatar */}
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0 transition-transform duration-150 group-hover:scale-[1.06]"
                    style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color }}
                >
                    {getInitials(plan.name)}
                </div>
                <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-slate-100 truncate leading-tight">
                        {plan.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {plan.maxUsers} users · {plan.maxDrivers} drivers
                    </div>
                </div>
            </div>

            {/* Code badge */}
            <div className="hidden md:flex">
                <span
                    className="text-[10.5px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-lg"
                    style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
                >
                    {plan.code}
                </span>
            </div>

            {/* Monthly price */}
            <div className="hidden md:block">
                <span className="text-[13px] font-semibold text-slate-200">
                    {formatPrice(plan.monthlyPrice, plan.currency)}
                </span>
                <span className="text-[10.5px] text-slate-600 ml-1">/mo</span>
            </div>

            {/* Yearly price */}
            <div className="hidden md:block">
                {plan.yearlyPrice ? (
                    <>
                        <span className="text-[13px] font-semibold text-slate-200">
                            {formatPrice(plan.yearlyPrice, plan.currency)}
                        </span>
                        <span className="text-[10.5px] text-slate-600 ml-1">/yr</span>
                    </>
                ) : (
                    <span className="text-[11px] text-slate-600 italic">—</span>
                )}
            </div>

            {/* Status */}
            <div className="hidden md:flex items-center gap-2">
                <span
                    className={`w-2 h-2 rounded-full shrink-0 transition-all duration-200 ${plan.isActive ? "animate-pulse" : ""}`}
                    style={{
                        background: plan.isActive ? "#34d399" : "#64748b",
                        boxShadow: plan.isActive ? "0 0 8px rgba(52,211,153,0.6)" : "none",
                    }}
                />
                <span className={`text-[12px] font-medium ${plan.isActive ? "text-emerald-400" : "text-slate-500"}`}>
                    {plan.isActive ? "Active" : "Inactive"}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
                {onViewDetail && (
                    <ActionBtn
                        title="View details"
                        variant="emerald"
                        onClick={onViewDetail}
                        revealOnHover
                    >
                        <Eye size={13} />
                    </ActionBtn>
                )}
            </div>
        </div>
    );
};

export default PlanRow;