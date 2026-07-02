"use client";

import { useCallback, useEffect, useState } from "react";
import { showToast } from "nextjs-toast-notify";

import RoleGuard from "@/lib/RoleGuard";
import StatCard from "@/components/commons/StatCard";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { ROLES } from "@/lib/roles";
import { getCompanyId } from "@/hooks/useAuth";
import { parseApiError } from "@/utils/apiErrorHandler";

import { getPlans, initiateUpgrade, cancelSubscription } from "@/services/PlanService";
import { getCompanySubscription } from "@/services/SubscriptionService";

import { IPlan } from "@/types/plan";
import { ICompanySubscription } from "@/types/subscription";

import UpgradeModal from "@/components/dashboard/subscription/UpgradeModal";
import SubscriptionStatusBadge from "@/components/dashboard/subscription/SubscriptionStatusBadge";

export default function SubscriptionPage() {
    const companyId = getCompanyId() ?? "";

    // ── State ──────────────────────────────────────────────────────────────
    const [plans, setPlans] = useState<IPlan[]>([]);
    const [current, setCurrent] = useState<ICompanySubscription | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [upgradeOpen, setUpgradeOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null);
    const [upgradeLoading, setUpgradeLoading] = useState(false);

    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    // ── Fetch ──────────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        if (!companyId) {
            setError("No company assigned to this account.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [plansRes, subRes] = await Promise.allSettled([
                getPlans(),
                getCompanySubscription(companyId),
            ]);

            if (plansRes.status === "fulfilled") setPlans(plansRes.value);
            else showToast.error("Failed to load plans.");

            if (subRes.status === "fulfilled") setCurrent(subRes.value);
            // no active subscription is a valid state — don't error
        } catch (e: any) {
            const err = parseApiError(e);
            setError(err.message ?? "Failed to load subscription data.");
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Upgrade ────────────────────────────────────────────────────────────
    const handleUpgradeClick = (plan: IPlan) => {
        setSelectedPlan(plan);
        setUpgradeOpen(true);
    };

    const handleUpgradeConfirm = async (billingCycle: string) => {
        if (!selectedPlan || !companyId) return;
        setUpgradeLoading(true);
        try {
            const result = await initiateUpgrade({
                companyId,
                planId: selectedPlan.id,
                billingCycle,
                successUrl: `${window.location.origin}/dashboard/subscription?success=1`,
                failureUrl: `${window.location.origin}/dashboard/subscription?failed=1`,
            });
            // redirect to Chargily checkout page
            window.location.href = result.successUrl;
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to initiate upgrade.");
        } finally {
            setUpgradeLoading(false);
        }
    };

    // ── Cancel ─────────────────────────────────────────────────────────────
    const handleCancelConfirm = async () => {
        setCancelLoading(true);
        try {
            await cancelSubscription();
            showToast.success("Subscription cancelled.");
            setCancelOpen(false);
            fetchData();
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to cancel subscription.");
        } finally {
            setCancelLoading(false);
        }
    };

    // ── Derived ────────────────────────────────────────────────────────────
    const isCurrentPlan = (plan: IPlan) =>
        current?.subscriptionPlanId === plan.id &&
        (current?.status === "Active" || current?.status === "Trialing");

    const isActivePlan = (plan: IPlan) =>
        current?.subscriptionPlanId === plan.id && current?.status === "Active";

    const canCancel = current?.status === "Active" || current?.status === "Trialing";

    const renewsLabel =
        current?.status === "Trialing" && current.trialEndDate
            ? new Date(current.trialEndDate).toLocaleDateString()
            : current?.endDate
                ? new Date(current.endDate).toLocaleDateString()
                : "—";

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <RoleGuard allowedRoles={[ROLES.OWNER, ROLES.MANAGER]}>
            <div className="flex flex-col gap-3 h-full">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div
                                className="w-1 h-6 rounded-full"
                                style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                            />
                            <h1 className="text-[22px] font-bold text-white tracking-tight">Subscription</h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            Manage your plan and billing.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard
                        label="Current plan"
                        value={loading ? "…" : (current?.subscriptionPlan?.name ?? "None")}
                        accent="#fbbf24"
                    />
                    <StatCard
                        label="Status"
                        value={loading ? "…" : (current?.status ?? "—")}
                        accent={
                            current?.status === "Active" ? "#34d399" :
                                current?.status === "Trialing" ? "#fbbf24" :
                                    "#64748b"
                        }
                    />
                    <StatCard
                        label={current?.status === "Trialing" ? "Trial ends" : "Renews"}
                        value={loading ? "…" : renewsLabel}
                        accent="#94a3b8"
                    />
                </div>

                {error && <ErrorBaner error={error} setError={setError} />}

                {/* ── Available Plans ───────────────────────────────────────── */}
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 mt-1">
                    Available plans
                </p>

                {loading ? (
                    <div className="text-[13px] text-slate-500">Loading plans…</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {plans.filter((p) => p.isActive).map((plan) => {
                            const isCurrent = isCurrentPlan(plan);
                            const isActive = isActivePlan(plan);
                            const isUpgrade =
                                !current || plan.monthlyPrice > (current.subscriptionPlan?.monthlyPrice ?? 0);

                            return (
                                <div
                                    key={plan.id}
                                    className="relative rounded-xl p-4 flex flex-col gap-2 transition-all"
                                    style={{
                                        background: "rgba(255,255,255,0.025)",
                                        border: isCurrent
                                            ? "0.5px solid rgba(251,191,36,0.35)"
                                            : "0.5px solid rgba(255,255,255,0.07)",
                                    }}
                                >
                                    {isActive && (
                                        <span
                                            className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                            style={{ background: "#065f46", color: "#34d399" }}
                                        >
                                            Current
                                        </span>
                                    )}
                                    {current?.status === "Trialing" && isCurrent && (
                                        <span
                                            className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                            style={{ background: "#78350f", color: "#fbbf24" }}
                                        >
                                            Trial
                                        </span>
                                    )}

                                    <div className="text-[14px] font-semibold text-white pr-16">{plan.name}</div>

                                    <div className="text-[22px] font-bold text-amber-400 leading-tight">
                                        {plan.monthlyPrice.toLocaleString()}
                                        <span className="text-[12px] font-normal text-slate-500 ml-1">
                                            {plan.currency} / mo
                                        </span>
                                    </div>

                                    {plan.yearlyPrice && (
                                        <div className="text-[11px] text-slate-600">
                                            or {plan.yearlyPrice.toLocaleString()} {plan.currency} / year
                                        </div>
                                    )}

                                    <ul className="space-y-1 mt-1 flex-1">
                                        <li className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                            <span className="text-emerald-400 text-[10px]">✓</span>
                                            {plan.maxUsers} users
                                        </li>
                                        <li className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                            <span className="text-emerald-400 text-[10px]">✓</span>
                                            {plan.maxShipmentsPerMonth?.toLocaleString() ?? "—"} shipments / month
                                        </li>
                                        <li className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                            <span className="text-emerald-400 text-[10px]">✓</span>
                                            {plan.maxDrivers} drivers
                                        </li>
                                    </ul>

                                    {isActive ? (
                                        <button
                                            disabled
                                            className="mt-2 w-full py-2 rounded-lg text-[12px] font-medium cursor-default"
                                            style={{
                                                background: "rgba(52,211,153,0.08)",
                                                color: "#34d399",
                                                border: "0.5px solid rgba(52,211,153,0.15)",
                                            }}
                                        >
                                            ✓ Current plan
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpgradeClick(plan)}
                                            className="mt-2 w-full py-2 rounded-lg text-[12px] font-semibold transition-all hover:opacity-90 active:scale-95"
                                            style={{ background: "#fbbf24", color: "#0f1117" }}
                                        >
                                            {isUpgrade ? "Upgrade →" : "Switch plan"}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Current subscription details ──────────────────────────── */}
                {current && (
                    <div
                        className="rounded-xl p-4 mt-1"
                        style={{
                            background: "rgba(255,255,255,0.025)",
                            border: "0.5px solid rgba(255,255,255,0.07)",
                        }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[13px] font-semibold text-white">Subscription details</span>
                            <SubscriptionStatusBadge status={current.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-y-2.5 text-[12px]">
                            <span className="text-slate-500">Plan</span>
                            <span className="text-white">{current.subscriptionPlan?.name ?? "—"}</span>

                            <span className="text-slate-500">Billing</span>
                            <span className="text-white capitalize">{current.billingCycle}</span>

                            <span className="text-slate-500">Provider</span>
                            <span className="text-white">{current.paymentProvider ?? "—"}</span>

                            <span className="text-slate-500">Started</span>
                            <span className="text-white">
                                {current.startDate ? new Date(current.startDate).toLocaleDateString() : "—"}
                            </span>

                            {current.endDate && (
                                <>
                                    <span className="text-slate-500">
                                        {current.status === "Trialing" ? "Trial ends" : "Renews"}
                                    </span>
                                    <span className="text-white">
                                        {new Date(current.endDate).toLocaleDateString()}
                                    </span>
                                </>
                            )}

                            {current.trialEndDate && current.status === "Trialing" && (
                                <>
                                    <span className="text-slate-500">Trial ends</span>
                                    <span className="text-amber-400">
                                        {new Date(current.trialEndDate).toLocaleDateString()}
                                    </span>
                                </>
                            )}
                        </div>

                        {canCancel && (
                            <button
                                onClick={() => setCancelOpen(true)}
                                className="mt-4 text-[12px] text-red-400 hover:text-red-300 transition-colors"
                            >
                                Cancel subscription
                            </button>
                        )}
                    </div>
                )}

            </div>

            {/* Upgrade modal */}
            <UpgradeModal
                isOpen={upgradeOpen}
                plan={selectedPlan}
                onClose={() => { setUpgradeOpen(false); setSelectedPlan(null); }}
                onConfirm={handleUpgradeConfirm}
                loading={upgradeLoading}
            />

            {/* Cancel confirm */}
            {cancelOpen && (
                <ConfirmDialog
                    title="Cancel subscription"
                    message={`Are you sure you want to cancel your ${current?.subscriptionPlan?.name ?? ""} plan? Your access will end at the current billing period.`}
                    confirmLabel="Yes, cancel"
                    danger
                    loading={cancelLoading}
                    onConfirm={handleCancelConfirm}
                    onCancel={() => setCancelOpen(false)}
                />
            )}
        </RoleGuard>
    );
}