"use client";

import { useState } from "react";
import { Building2, Globe, Save, Calendar, Crown } from "lucide-react";
import InputField from "@/components/commons/InputField";
import { ICompanyResponse, IUpdateCompany, SubscriptionPlan, SubscriptionStatus } from "@/types/company";
import { GlassHero } from "@/components/commons/GlassHero";
import { GlassStatCard } from "@/components/commons/GlassStatCard";
import ActionBtn from "@/components/commons/ActionButton";
import GlassEffectCard from "@/components/commons/GlassEffectCard";

const STATUS_META: Record<string, { label: string; color: string; isActive: boolean }> = {
    [SubscriptionStatus.ACTIVE]: { label: "Active", color: "#34d399", isActive: true },
    [SubscriptionStatus.TRIAL]: { label: "Trial", color: "#22d3ee", isActive: true },
    [SubscriptionStatus.SUSPENDED]: { label: "Suspended", color: "#f87171", isActive: false },
    [SubscriptionStatus.CANCELED]: { label: "Canceled", color: "#64748b", isActive: false },
    [SubscriptionStatus.EXPIRED]: { label: "Expired", color: "#fb923c", isActive: false },
};

const PLAN_META: Record<string, { label: string; color: string; bg: string }> = {
    [SubscriptionPlan.FREE]: { label: "Free", color: "#64748b", bg: "rgba(100,116,139,0.1)" },
    [SubscriptionPlan.BASIC]: { label: "Basic", color: "#22d3ee", bg: "rgba(34,211,238,0.1)" },
    [SubscriptionPlan.PRO]: { label: "Pro", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
    [SubscriptionPlan.ENTERPRISE]: { label: "Enterprise", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
};

function fmt(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

interface CompanyDetailModalProps {
    isOpen: boolean;
    company: ICompanyResponse;
    onClose: () => void;
}

export default function CompanyDetailModal({
    isOpen,
    company,
    onClose,
}: CompanyDetailModalProps) {
    const [name, setName] = useState(company.name ?? "");
    const [subdomain, setSubdomain] = useState(company.subdomain ?? "");
    const [dirty, setDirty] = useState(false);

    const statusMeta = STATUS_META[company.subscriptionStatus] ?? STATUS_META[SubscriptionStatus.ACTIVE];
    const planMeta = PLAN_META[company.subscriptionPlan] ?? PLAN_META[SubscriptionPlan.FREE];


    const metaItems = [
        {
            icon: <Globe size={10} />,
            value: company.subdomain,
        },
        {
            icon: <Calendar size={10} />,
            value: company.createdAt ? fmt(company.createdAt) : "—",
        },
    ];

    return (
        <GlassEffectCard
            isOpen={isOpen}
            onClose={onClose}
            title="Company Profile"
            subtitle={company.id?.slice(0, 14).toUpperCase()}
            headerIcon={<Building2 size={17} style={{ color: "#fbbf24" }} />}
            showCloseButton
            accentColor="amber"
            withNoise
            withSweep
            withAvatarGlow
            footer={
                <>
                    <p className="text-[11px] text-slate-700">
                        {dirty ? "You have unsaved changes." : "All changes saved."}
                    </p>
                    <div className="flex items-center gap-2">
                        <ActionBtn
                            onClick={onClose}
                            title="Close"
                            label="Close"
                            variant="slate"
                            size="action"
                            className="w-fit text-sm! font-medium! capitalize px-4 py-2 text-text-secondary"
                        />

                    </div>
                </>
            }
        >
            <div className="space-y-5">

                {/* Identity Hero */}
                <GlassHero
                    title={company.name}
                    subtitle={company.owner?.email ?? "No owner"}
                    statusLabel={statusMeta.label}
                    isActive={statusMeta.isActive}
                    metaItems={metaItems}
                    accentColor="amber"
                />

                {/* Stats — plan + dates */}
                <div>
                    <div className="flex items-center gap-2.5 mb-3">
                        <div
                            className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0"
                            style={{
                                background: "rgba(251,191,36,0.08)",
                                border: "1px solid rgba(251,191,36,0.15)",
                            }}
                        >
                            <Crown size={10} style={{ color: "#fbbf24" }} />
                        </div>
                        <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">
                            Subscription
                        </span>
                        <div className="gef-divider" />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <GlassStatCard
                            icon={<Crown size={11} style={{ color: planMeta.color }} />}
                            label="Plan"
                            value={planMeta.label}
                            badge={{ label: statusMeta.label, color: statusMeta.isActive ? "emerald" : "red" }}
                            accentColor="amber"
                        />
                        <GlassStatCard
                            icon={<Calendar size={11} style={{ color: "#64748b" }} />}
                            label="Member since"
                            value={company.createdAt ? fmt(company.createdAt) : null}
                            secondaryValue={company.updatedAt ? `Updated ${fmt(company.updatedAt)}` : undefined}
                            emptyState={{ label: "Unknown" }}
                            accentColor="amber"
                        />
                    </div>
                </div>

                {/* Edit section */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                        <span className="text-[9.5px] uppercase tracking-widest text-slate-700 font-semibold">
                            Edit Profile
                        </span>
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                    </div>

                    <div className="space-y-3">
                        <InputField
                            label="Company Name"
                            placeholder="WaselGo Logistics"
                            icon={Building2}
                            value={name}
                            onChange={(e) => { setName(e.target.value); setDirty(true); }}
                        />
                        <InputField
                            label="Subdomain"
                            placeholder="waselgo"
                            icon={Globe}
                            value={subdomain}
                            onChange={(e) => { setSubdomain(e.target.value); setDirty(true); }}
                        />
                    </div>
                </div>

            </div>
        </GlassEffectCard>
    );
}