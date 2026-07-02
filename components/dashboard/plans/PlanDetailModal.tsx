"use client";

import {
    BadgeDollarSign,
    Calendar,
    Users,
    Truck,
    Package,
    CheckCircle,
    XCircle,
} from "lucide-react";

import { IPlan } from "@/types/plan";

import GlassEffectCard from "@/components/commons/GlassEffectCard";
import { GlassHero } from "@/components/commons/GlassHero";
import { GlassStatCard } from "@/components/commons/GlassStatCard";
import ActionBtn from "@/components/commons/ActionButton";

interface PlanDetailModalProps {
    plan: IPlan;
    isOpen: boolean;
    onClose: () => void;
    onUpdated?: () => void;
}

export default function PlanDetailModal({
    plan,
    isOpen,
    onClose,
}: PlanDetailModalProps) {
    const heroItems = [
        {
            icon: <Calendar size={10} />,
            value: new Date(plan.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
        },
    ];

    return (
        <GlassEffectCard
            isOpen={isOpen}
            onClose={onClose}
            title="Subscription Plan"
            subtitle={plan.code}
            headerIcon={
                <BadgeDollarSign
                    size={17}
                    style={{ color: "#fbbf24" }}
                />
            }
            accentColor="amber"
            withNoise
            withSweep
            withAvatarGlow
            footer={
                <ActionBtn
                    onClick={onClose}
                    label="Close"
                    title="Close"
                    variant="slate"
                    size="action"
                />
            }
        >
            <div className="space-y-5">
                <GlassHero
                    title={plan.name}
                    subtitle={`${plan.currency} Plan`}
                    statusLabel={
                        plan.isActive
                            ? "Active"
                            : "Inactive"
                    }
                    isActive={plan.isActive}
                    metaItems={heroItems}
                    accentColor="amber"
                />

                {/* Pricing */}
                <div>
                    <div className="flex items-center gap-2.5 mb-3">
                        <div
                            className="w-4.5 h-4.5 rounded-md flex items-center justify-center"
                            style={{
                                background:
                                    "rgba(251,191,36,0.1)",
                                border:
                                    "1px solid rgba(251,191,36,0.15)",
                            }}
                        >
                            <BadgeDollarSign
                                size={10}
                                style={{
                                    color: "#fbbf24",
                                }}
                            />
                        </div>

                        <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            Pricing
                        </span>

                        <div className="gef-divider" />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <GlassStatCard
                            icon={
                                <BadgeDollarSign
                                    size={11}
                                    style={{
                                        color: "#fbbf24",
                                    }}
                                />
                            }
                            label="Monthly"
                            value={`${plan.monthlyPrice.toLocaleString()} ${plan.currency}`}
                            accentColor="amber"
                        />

                        <GlassStatCard
                            icon={
                                <BadgeDollarSign
                                    size={11}
                                    style={{
                                        color: "#34d399",
                                    }}
                                />
                            }
                            label="Yearly"
                            value={
                                plan.yearlyPrice
                                    ? `${plan.yearlyPrice.toLocaleString()} ${plan.currency}`
                                    : null
                            }
                            emptyState={{
                                label: "Not defined",
                            }}
                            accentColor="emerald"
                        />
                    </div>
                </div>

                {/* Limits */}
                <div>
                    <div className="flex items-center gap-2.5 mb-3">
                        <div
                            className="w-4.5 h-4.5 rounded-md flex items-center justify-center"
                            style={{
                                background:
                                    "rgba(251,191,36,0.1)",
                                border:
                                    "1px solid rgba(251,191,36,0.15)",
                            }}
                        >
                            <Package
                                size={10}
                                style={{
                                    color: "#fbbf24",
                                }}
                            />
                        </div>

                        <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            Limits
                        </span>

                        <div className="gef-divider" />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                        <GlassStatCard
                            icon={<Users size={11} />}
                            label="Users"
                            value={plan.maxUsers.toString()}
                            accentColor="amber"
                        />

                        <GlassStatCard
                            icon={<Truck size={11} />}
                            label="Drivers"
                            value={plan.maxDrivers.toString()}
                            accentColor="emerald"
                        />

                        <GlassStatCard
                            icon={<Package size={11} />}
                            label="Shipments"
                            value={plan.maxShipmentsPerMonth.toLocaleString()}
                            accentColor="cyan"
                        />
                    </div>
                </div>

                {/* Status */}
                <div>
                    <div className="flex items-center gap-2.5 mb-3">
                        <div
                            className="w-4.5 h-4.5 rounded-md flex items-center justify-center"
                            style={{
                                background:
                                    "rgba(251,191,36,0.1)",
                                border:
                                    "1px solid rgba(251,191,36,0.15)",
                            }}
                        >
                            {plan.isActive ? (
                                <CheckCircle
                                    size={10}
                                    style={{
                                        color: "#34d399",
                                    }}
                                />
                            ) : (
                                <XCircle
                                    size={10}
                                    style={{
                                        color: "#ef4444",
                                    }}
                                />
                            )}
                        </div>

                        <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            Status
                        </span>

                        <div className="gef-divider" />
                    </div>

                    <GlassStatCard
                        icon={
                            plan.isActive ? (
                                <CheckCircle
                                    size={11}
                                    style={{
                                        color: "#34d399",
                                    }}
                                />
                            ) : (
                                <XCircle
                                    size={11}
                                    style={{
                                        color: "#ef4444",
                                    }}
                                />
                            )
                        }
                        label="Plan Status"
                        value={
                            plan.isActive
                                ? "Active"
                                : "Inactive"
                        }
                        accentColor={
                            plan.isActive
                                ? "emerald"
                                : "red"
                        }
                    />
                </div>
            </div>
        </GlassEffectCard>
    );
}