"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { ICreatePlan } from "@/types/plan";
import GlassEffectCard from "@/components/commons/GlassEffectCard";
import ActionBtn from "@/components/commons/ActionButton";

interface CreatePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ICreatePlan) => Promise<void>;
    loading?: boolean;
}

const FIELD_STYLE: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "8px 12px",
    color: "#f1f5f9",
    fontSize: 13,
    width: "100%",
    outline: "none",
};

const LABEL_STYLE: React.CSSProperties = {
    fontSize: 10.5,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#64748b",
    marginBottom: 6,
    display: "block",
};

export default function CreatePlanModal({ isOpen, onClose, onSubmit, loading }: CreatePlanModalProps) {
    const [form, setForm] = useState<ICreatePlan>({
        name: "",
        code: "",
        monthlyPrice: 0,
        yearlyPrice: 0,
        currency: "DZD",
        isActive: true,
        maxUsers: 5,
        maxShipmentsPerMonth: 100,
        maxDrivers: 5,
    });

    const set = (key: keyof ICreatePlan, value: any) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async () => {
        await onSubmit(form);
    };

    const isValid =
        form.name.trim().length > 0 &&
        form.code.trim().length > 0 &&
        form.monthlyPrice >= 0;

    return (
        <GlassEffectCard
            isOpen={isOpen}
            onClose={onClose}
            title="Create Plan"
            subtitle="Configure a new subscription tier"
            headerIcon={<CreditCard size={17} style={{ color: "#fbbf24" }} />}
            showCloseButton={true}
            accentColor="amber"
            withNoise={true}
            withSweep={true}
            footer={
                <>
                    <ActionBtn
                        onClick={onClose}
                        title="Cancel"
                        label="Cancel"
                        variant="slate"
                        size="action"
                        className="w-fit text-sm! font-medium! capitalize px-4 py-2"
                    />
                    <ActionBtn
                        onClick={handleSubmit}
                        title="Create Plan"
                        label={loading ? "Creating…" : "Create Plan"}
                        variant="emerald"
                        size="action"
                        disabled={loading || !isValid}
                    />
                </>
            }
        >
            <div className="space-y-4">
                {/* Name + Code */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label style={LABEL_STYLE}>Name *</label>
                        <input
                            style={FIELD_STYLE}
                            placeholder="Pro"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={LABEL_STYLE}>Code *</label>
                        <input
                            style={FIELD_STYLE}
                            placeholder="pro"
                            value={form.code}
                            onChange={(e) => set("code", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                        />
                    </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label style={LABEL_STYLE}>Monthly Price *</label>
                        <input
                            style={FIELD_STYLE}
                            type="number"
                            min={0}
                            placeholder="2900"
                            value={form.monthlyPrice || ""}
                            onChange={(e) => set("monthlyPrice", parseFloat(e.target.value) || 0)}
                        />
                    </div>
                    <div>
                        <label style={LABEL_STYLE}>Yearly Price</label>
                        <input
                            style={FIELD_STYLE}
                            type="number"
                            min={0}
                            placeholder="29000"
                            value={form.yearlyPrice || ""}
                            onChange={(e) => set("yearlyPrice", parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>

                {/* Currency + Active */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label style={LABEL_STYLE}>Currency</label>
                        <select
                            style={FIELD_STYLE}
                            value={form.currency}
                            onChange={(e) => set("currency", e.target.value)}
                        >
                            <option value="DZD">DZD</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                    <div className="flex flex-col justify-end pb-1">
                        <label style={LABEL_STYLE}>Active</label>
                        <button
                            onClick={() => set("isActive", !form.isActive)}
                            className="flex items-center gap-2 text-[12.5px] font-medium transition-colors"
                            style={{ color: form.isActive ? "#34d399" : "#64748b" }}
                        >
                            <span
                                className="w-8 h-4 rounded-full relative transition-colors duration-200 flex items-center"
                                style={{ background: form.isActive ? "rgba(52,211,153,0.25)" : "rgba(100,116,139,0.2)", border: `1px solid ${form.isActive ? "rgba(52,211,153,0.3)" : "rgba(100,116,139,0.2)"}` }}
                            >
                                <span
                                    className="absolute w-3 h-3 rounded-full transition-all duration-200"
                                    style={{
                                        background: form.isActive ? "#34d399" : "#475569",
                                        left: form.isActive ? "calc(100% - 14px)" : "2px",
                                    }}
                                />
                            </span>
                            {form.isActive ? "Enabled" : "Disabled"}
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 4 }}>
                    <p className="text-[9.5px] uppercase tracking-[0.12em] text-slate-700 font-semibold mb-3">
                        Limits
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label style={LABEL_STYLE}>Max Users</label>
                            <input
                                style={FIELD_STYLE}
                                type="number"
                                min={1}
                                value={form.maxUsers}
                                onChange={(e) => set("maxUsers", parseInt(e.target.value) || 1)}
                            />
                        </div>
                        <div>
                            <label style={LABEL_STYLE}>Max Drivers</label>
                            <input
                                style={FIELD_STYLE}
                                type="number"
                                min={1}
                                value={form.maxDrivers}
                                onChange={(e) => set("maxDrivers", parseInt(e.target.value) || 1)}
                            />
                        </div>
                        <div>
                            <label style={LABEL_STYLE}>Max Shipments/mo</label>
                            <input
                                style={FIELD_STYLE}
                                type="number"
                                min={1}
                                value={form.maxShipmentsPerMonth}
                                onChange={(e) => set("maxShipmentsPerMonth", parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </GlassEffectCard>
    );
}