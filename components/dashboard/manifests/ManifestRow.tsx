import { Eye, Package, Truck, Layers } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import { IManifestResponse } from "@/types/manifest";


const STATUS_META: Record<string, { color: string; bg: string; border: string; pulse: boolean }> = {
    Draft: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.2)", pulse: false },
    Sealed: { color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.2)", pulse: false },
    InTransit: { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.2)", pulse: true },
    Arrived: { color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.2)", pulse: false },
};

const getStatusMeta = (status: string) =>
    STATUS_META[status] ?? { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.15)", pulse: false };

const getStatusDot = (status: string) => {
    const m = getStatusMeta(status);
    return (
        <span
            className={`w-2 h-2 rounded-full shrink-0 transition-all duration-200 ${m.pulse ? "animate-pulse" : ""}`}
            style={{
                background: m.color,
                boxShadow: m.pulse ? `0 0 8px ${m.color}99` : "none",
            }}
        />
    );
};

const getCodeInitials = (code: string) => code?.slice(-3).toUpperCase() ?? "MFT";

const ManifestRow = ({
    manifest,
    isLast,
    onViewDetail,
}: {
    manifest: IManifestResponse;
    isLast: boolean;
    onViewDetail?: () => void;
}) => {
    const m = getStatusMeta(manifest.status);

    return (
        <div
            className={`
                group grid grid-cols-[1fr_auto] md:grid-cols-[200px_1fr_130px_120px_auto]
                gap-4 px-5 py-4 items-center transition-all duration-150
                hover:bg-white/2.5
                ${!isLast ? "border-b border-white/4" : ""}
            `}
        >
            {/* Code + icon */}
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0 transition-transform duration-150 group-hover:scale-[1.06] tracking-wider"
                    style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color }}
                >
                    {getCodeInitials(manifest.code)}
                </div>
                <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-slate-100 truncate leading-tight font-mono">
                        {manifest.code}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 truncate">
                        {new Date(manifest.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric"
                        })}
                    </div>
                </div>
            </div>

            {/* Route: from → to */}
            <div className="hidden md:flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Truck size={11} className="shrink-0 opacity-40 text-slate-400" />
                    <span className="text-[11.5px] text-slate-500 truncate">
                        <span className="text-slate-300 font-medium">{manifest.fromNodeId.slice(0, 8)}…</span>
                        <span className="mx-1.5 text-slate-700">→</span>
                        <span className="text-slate-300 font-medium">{manifest.toNodeId.slice(0, 8)}…</span>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Package size={10} className="opacity-35 text-slate-400" />
                        <span className="text-[11px] text-slate-600">
                            {manifest.itemCount} item{manifest.itemCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Layers size={10} className="opacity-35 text-slate-400" />
                        <span className="text-[11px] text-slate-600">
                            {manifest.totalWeightKg.toLocaleString()} kg
                        </span>
                    </div>
                </div>
            </div>

            {/* Sealed info */}
            <div className="hidden md:flex flex-col gap-1 min-w-0">
                {manifest.sealedAt ? (
                    <>
                        <span className="text-[11.5px] text-slate-400 truncate">
                            {new Date(manifest.sealedAt).toLocaleDateString("en-GB", {
                                day: "numeric", month: "short"
                            })}
                        </span>
                        {manifest.sealedBy && (
                            <span className="text-[10.5px] text-slate-600 truncate">
                                by {manifest.sealedBy.fullName ?? manifest.sealedBy.email}
                            </span>
                        )}
                    </>
                ) : (
                    <span className="text-[11px] text-slate-700 italic">Not sealed</span>
                )}
            </div>

            {/* Status badge */}
            <div className="hidden md:flex items-center gap-2">
                {getStatusDot(manifest.status)}
                <span
                    className="text-[12px] font-medium"
                    style={{ color: m.color }}
                >
                    {manifest.status}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
                {onViewDetail && (
                    <ActionBtn
                        title="View manifest details"
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

export default ManifestRow;
export { getStatusMeta, getCodeInitials };