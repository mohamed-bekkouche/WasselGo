"use client";

import { useState } from "react";
import { IPlan } from "@/types/plan";

interface UpgradeModalProps {
    isOpen: boolean;
    plan: IPlan | null;
    onClose: () => void;
    onConfirm: (billingCycle: string) => void;
    loading: boolean;
}

export default function UpgradeModal({ isOpen, plan, onClose, onConfirm, loading }: UpgradeModalProps) {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    if (!isOpen || !plan) return null;

    const price =
        billingCycle === "yearly" && plan.yearlyPrice
            ? plan.yearlyPrice
            : billingCycle === "yearly"
                ? plan.monthlyPrice * 12
                : plan.monthlyPrice;

    const yearlySaving =
        plan.yearlyPrice
            ? Math.round(100 - (plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)
            : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-md rounded-2xl p-6"
                style={{ background: "#1a1f2e", border: "0.5px solid rgba(255,255,255,0.1)" }}
            >
                <div className="flex items-start justify-between mb-1">
                    <h2 className="text-[16px] font-semibold text-white">Upgrade to {plan.name}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-[18px] leading-none">×</button>
                </div>
                <p className="text-[12px] text-slate-500 mb-5">Choose a billing cycle to continue to payment.</p>

                {/* Billing cycle toggle */}
                <div className="mb-4">
                    <label className="text-[11px] text-slate-500 mb-2 block uppercase tracking-wider">Billing cycle</label>
                    <div
                        className="flex rounded-xl overflow-hidden"
                        style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
                    >
                        {(["monthly", "yearly"] as const).map((c) => (
                            <button
                                key={c}
                                onClick={() => setBillingCycle(c)}
                                className="flex-1 py-2.5 text-[12px] font-medium transition-all"
                                style={{
                                    background: billingCycle === c ? "#fbbf24" : "transparent",
                                    color: billingCycle === c ? "#0f1117" : "#64748b",
                                }}
                            >
                                {c === "monthly" ? "Monthly" : `Yearly${yearlySaving > 0 ? ` · save ${yearlySaving}%` : ""}`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price summary */}
                <div
                    className="rounded-xl p-4 mb-5"
                    style={{ background: "rgba(251,191,36,0.05)", border: "0.5px solid rgba(251,191,36,0.15)" }}
                >
                    <div className="text-[11px] text-slate-500 mb-1">Total due today</div>
                    <div className="text-[26px] font-bold text-amber-400 leading-tight">
                        {price.toLocaleString()}
                        <span className="text-[13px] font-normal text-slate-500 ml-1.5">
                            {plan.currency} / {billingCycle === "yearly" ? "year" : "month"}
                        </span>
                    </div>
                    <ul className="mt-3 space-y-1.5">
                        <li className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <span className="text-emerald-400">✓</span> Up to {plan.maxUsers} users
                        </li>
                        <li className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <span className="text-emerald-400">✓</span> {plan.maxShipmentsPerMonth?.toLocaleString() ?? "—"} shipments / month
                        </li>
                        <li className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <span className="text-emerald-400">✓</span> {plan.maxDrivers} drivers
                        </li>
                    </ul>
                </div>

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-[12px] text-slate-400 transition-colors hover:text-white"
                        style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(billingCycle)}
                        disabled={loading}
                        className="px-5 py-2 rounded-lg text-[12px] font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                        style={{ background: "#fbbf24", color: "#0f1117" }}
                    >
                        {loading ? "Redirecting…" : "Continue to payment →"}
                    </button>
                </div>
            </div>
        </div>
    );
}