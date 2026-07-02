"use client";

import { useEffect, useState } from "react";
import {
    Layers, Package, Truck, User,
    Calendar, CheckCircle, Clock, AlertCircle,
} from "lucide-react";
import GlassEffectCard from "@/components/commons/GlassEffectCard";
import ActionBtn from "@/components/commons/ActionButton";
import { GlassHero } from "@/components/commons/GlassHero";
import { GlassStatCard } from "@/components/commons/GlassStatCard";
import LoadingSpinner from "@/components/commons/LoadingSpinner";
import ErrorBaner from "@/components/commons/ErrorBaner";
import EntityPicker from "@/components/commons/EntityPicker";
import { showToast } from "nextjs-toast-notify";
import { parseApiError } from "@/utils/apiErrorHandler";
import {
    GetManifestById,
    GetManifestShipments,
    SealManifest,
    MarkManifestArrived,
} from "@/services/ManifestService";
import { IManifestResponse } from "@/types/manifest";
import { IPaginatedResponse } from "@/types/paginate";
import { IShipmentSummary } from "@/types/shipment";
import { IDriverResponse } from "@/types/driver";
import { listDrivers } from "@/services/DriverService";
import { getStatusMeta } from "./ManifestRow";


interface ManifestDetailModalProps {
    manifestId: string;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange?: () => void;
}

export default function ManifestDetailModal({
    manifestId,
    isOpen,
    onClose,
    onStatusChange,
}: ManifestDetailModalProps) {
    const [manifest, setManifest] = useState<IManifestResponse | null>(null);
    const [shipments, setShipments] = useState<IShipmentSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Seal flow
    const [showSealPicker, setShowSealPicker] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
    const [sealing, setSealing] = useState(false);

    // Arrive action
    const [arriving, setArriving] = useState(false);

    // ── Fetch ────────────────────────────────────────────────────────────────

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [m, s] = await Promise.all([
                GetManifestById(manifestId),
                GetManifestShipments(manifestId),
            ]);
            setManifest(m);
            setShipments(s.items ?? []);
        } catch (e: any) {
            const err = parseApiError(e);
            setError(err.message ?? "Failed to load manifest");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen || !manifestId) return;
        fetchAll();
    }, [isOpen, manifestId]);

    useEffect(() => {
        if (!isOpen) {
            setShowSealPicker(false);
            setSelectedDriverId(null);
            setSealing(false);
        }
    }, [isOpen]);

    // ── Actions ──────────────────────────────────────────────────────────────

    const handleSeal = async () => {
        if (!manifest || !selectedDriverId) return;
        setSealing(true);
        try {
            await SealManifest(manifest.id, { driverId: selectedDriverId });
            showToast.success("Manifest sealed successfully");
            setShowSealPicker(false);
            setSelectedDriverId(null);
            onStatusChange?.();
            await fetchAll();
        } catch (err: any) {
            const apiErr = parseApiError(err);
            showToast.error(apiErr.message);
        } finally {
            setSealing(false);
        }
    };

    const handleArrive = async () => {
        if (!manifest) return;
        setArriving(true);
        try {
            await MarkManifestArrived(manifest.id);
            showToast.success("Manifest marked as arrived");
            onStatusChange?.();
            await fetchAll();
        } catch (err: any) {
            const apiErr = parseApiError(err);
            showToast.error(apiErr.message);
        } finally {
            setArriving(false);
        }
    };

    // ── Derived ──────────────────────────────────────────────────────────────

    const statusMeta = manifest ? getStatusMeta(manifest.status) : null;

    const metaItems = [
        {
            icon: <Calendar size={10} />,
            value: manifest?.createdAt
                ? new Date(manifest.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                })
                : "—",
        },
        {
            icon: <Package size={10} />,
            value: `${manifest?.itemCount ?? 0} shipment${manifest?.itemCount !== 1 ? "s" : ""}`,
        },
        {
            icon: <Truck size={10} />,
            value: `${manifest?.totalWeightKg?.toLocaleString() ?? 0} kg`,
        },
    ];

    // ── Footer ───────────────────────────────────────────────────────────────

    const footer = (
        <>
            <ActionBtn
                onClick={onClose}
                title="Close"
                label="Close"
                variant="slate"
                size="action"
                className="w-fit text-sm! font-medium! capitalize px-4 py-2 text-text-secondary"
            />
            <div className="flex items-center gap-2">
                {manifest?.status === "Draft" && (
                    <ActionBtn
                        onClick={() => setShowSealPicker(true)}
                        title="Seal Manifest"
                        label={sealing ? "Sealing…" : "Seal Manifest"}
                        disabled={sealing}
                        variant="emerald"
                        size="action"
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                    </ActionBtn>
                )}
                {manifest?.status === "InTransit" && (
                    <ActionBtn
                        onClick={handleArrive}
                        title="Mark as Arrived"
                        label={arriving ? "Updating…" : "Mark Arrived"}
                        disabled={arriving}
                        variant="sky"
                        size="action"
                    >
                        <AlertCircle className="w-3.5 h-3.5" />
                    </ActionBtn>
                )}
            </div>
        </>
    );

    return (
        <>
            {/* ─── MAIN MANIFEST MODAL ─── */}
            <GlassEffectCard
                isOpen={isOpen}
                onClose={onClose}
                title="Manifest Details"
                subtitle={manifestId?.slice(0, 14).toUpperCase()}
                headerIcon={<Layers size={17} style={{ color: "#fbbf24" }} />}
                showCloseButton={true}
                accentColor="amber"
                withNoise={true}
                withSweep={true}
                withAvatarGlow={true}
                footer={footer}
            >
                {loading && <LoadingSpinner />}
                {!loading && error && <ErrorBaner error={error} setError={setError} />}

                {manifest && !loading && (
                    <div className="space-y-5">
                        {/* Identity Hero */}
                        <GlassHero
                            title={manifest.code}
                            subtitle={`${manifest.fromNodeId.slice(0, 8)}… → ${manifest.toNodeId.slice(0, 8)}…`}
                            statusLabel={manifest.status}
                            isActive={manifest.status !== "Draft"}
                            metaItems={metaItems}
                            accentColor="amber"
                        />

                        {/* Stats grid */}
                        <div>
                            <div className="flex items-center gap-2.5 mb-3">
                                <div
                                    className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0"
                                    style={{
                                        background: "rgba(251,191,36,0.1)",
                                        border: "1px solid rgba(251,191,36,0.15)",
                                    }}
                                >
                                    <Layers size={10} style={{ color: "#fbbf24" }} />
                                </div>
                                <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">
                                    Overview
                                </span>
                                <div className="gef-divider" />
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                {/* Seal info card */}
                                <GlassStatCard
                                    icon={<CheckCircle size={11} style={{ color: manifest.sealedAt ? "#34d399" : "#475569" }} />}
                                    label="Sealed"
                                    value={manifest.sealedAt
                                        ? new Date(manifest.sealedAt).toLocaleDateString("en-GB", {
                                            day: "numeric", month: "short", year: "numeric",
                                        })
                                        : null
                                    }
                                    secondaryValue={manifest.sealedBy
                                        ? `by ${manifest.sealedBy.fullName ?? manifest.sealedBy.email}`
                                        : undefined
                                    }
                                    badge={manifest.sealedAt ? { label: "Sealed", color: "emerald" } : undefined}
                                    emptyState={{ label: "Not sealed" }}
                                    accentColor="emerald"
                                />

                                {/* Cargo card */}
                                <GlassStatCard
                                    icon={<Package size={11} style={{ color: "#60a5fa" }} />}
                                    label="Cargo"
                                    value={`${manifest.itemCount} items`}
                                    secondaryValue={`${manifest.totalWeightKg.toLocaleString()} kg total`}
                                    badge={{ label: manifest.status, color: "amber" }}
                                    accentColor="cyan"
                                />
                            </div>
                        </div>

                        {/* Shipments list */}
                        {shipments.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div
                                        className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0"
                                        style={{
                                            background: "rgba(96,165,250,0.1)",
                                            border: "1px solid rgba(96,165,250,0.15)",
                                        }}
                                    >
                                        <Package size={10} style={{ color: "#60a5fa" }} />
                                    </div>
                                    <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">
                                        Shipments ({shipments.length})
                                    </span>
                                    <div className="gef-divider" />
                                </div>

                                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                    {shipments.map((s) => (
                                        <div
                                            key={s.id}
                                            className="flex items-center justify-between px-3 py-2 rounded-lg"
                                            style={{
                                                background: "rgba(255,255,255,0.025)",
                                                border: "1px solid rgba(255,255,255,0.06)",
                                            }}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Package size={10} className="text-slate-600 shrink-0" />
                                                <span className="text-[11.5px] text-slate-300 font-mono truncate">
                                                    {s.trackingCode ?? s.id.slice(0, 12)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                                {s.customer?.fullName && (
                                                    <span className="text-[10.5px] text-slate-600 hidden sm:block truncate max-w-24">
                                                        {s.customer.fullName}
                                                    </span>
                                                )}
                                                {s.weightKg && (
                                                    <span
                                                        className="text-[10px] px-1.5 py-0.5 rounded"
                                                        style={{
                                                            background: "rgba(96,165,250,0.08)",
                                                            color: "#60a5fa",
                                                        }}
                                                    >
                                                        {s.weightKg} kg
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </GlassEffectCard>

            {/* ─── SEAL DRIVER PICKER MODAL ─── */}
            {showSealPicker && (
                <GlassEffectCard
                    isOpen={showSealPicker}
                    onClose={() => { setShowSealPicker(false); setSelectedDriverId(null); }}
                    title="Seal Manifest"
                    subtitle="Assign a driver to seal and dispatch this manifest"
                    headerIcon={<User size={16} style={{ color: "#fbbf24" }} />}
                    showCloseButton={false}
                    accentColor="amber"
                    withNoise={true}
                    withSweep={true}
                    maxWidth="448px"
                    footer={
                        <>
                            <p className="text-[10.5px]" style={{ color: "rgba(100,116,139,0.55)" }}>
                                {selectedDriverId ? (
                                    <span className="flex items-center gap-1.5" style={{ color: "rgba(251,191,36,0.6)" }}>
                                        <CheckCircle size={10} />
                                        Driver selected
                                    </span>
                                ) : "No driver selected"}
                            </p>
                            <div className="flex items-center gap-2">
                                <ActionBtn
                                    onClick={() => { setShowSealPicker(false); setSelectedDriverId(null); }}
                                    disabled={sealing}
                                    size="action"
                                    label="Cancel"
                                    variant="slate"
                                />
                                <ActionBtn
                                    onClick={handleSeal}
                                    disabled={sealing || !selectedDriverId}
                                    size="action"
                                    label={sealing ? "Sealing…" : "Confirm Seal"}
                                    variant="emerald"
                                />
                            </div>
                        </>
                    }
                >
                    <div className="p-1">
                        <EntityPicker<IDriverResponse>
                            value={selectedDriverId ?? null}
                            onChange={setSelectedDriverId}
                            fetchData={async () => {
                                const res = await listDrivers({ pageNumber: 1, pageSize: 100 });
                                return res.items.filter((d) => d.isActive !== false);
                            }}
                            getId={(d) => d.id}
                            getLabel={(d) => d.fullName}
                            getSubLabel={(d) => d.email}
                            renderIcon={() => (
                                <div className="w-6 h-6 rounded-full bg-amber-400/10 flex items-center justify-center">
                                    <User className="w-3.5 h-3.5 text-amber-400" />
                                </div>
                            )}
                            label="Select Driver *"
                            placeholder="Search drivers…"
                            required
                        />
                    </div>
                </GlassEffectCard>
            )}
        </>
    );
}