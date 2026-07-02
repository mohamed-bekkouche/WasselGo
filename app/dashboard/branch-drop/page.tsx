"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    Camera,
    CheckCircle2,
    Loader2,
    ScanLine,
    Search,
    StopCircle,
    Package,
    Zap,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { markDroppedAtBranch } from "@/services/ShipmentService";
import { parseApiError } from "@/utils/apiErrorHandler";
import { showToast } from "nextjs-toast-notify";
import RoleGuard from "@/lib/RoleGuard";
import { ROLES } from "@/lib/roles";

export default function BranchDropScannerPage() {
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const [trackingCode, setTrackingCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [cameraStarted, setCameraStarted] = useState(false);
    const [lastScanned, setLastScanned] = useState<string | null>(null);
    const [scanCount, setScanCount] = useState(0);
    const [pulse, setPulse] = useState(false);

    const stopScanner = useCallback(async () => {
        try {
            if (scannerRef.current?.isScanning) {
                await scannerRef.current.stop();
                await scannerRef.current.clear();
            }
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, [stopScanner]);

    const triggerPulse = () => {
        setPulse(true);
        setTimeout(() => setPulse(false), 700);
    };

    const handleDropAtBranch = async (id: string) => {
        if (!id) return;
        try {
            setLoading(true);
            await markDroppedAtBranch(id);
            setLastScanned(id);
            setScanCount((c) => c + 1);
            triggerPulse();
            showToast.success("Shipment marked as dropped at branch");
        } catch (err: any) {
            const error = parseApiError(err);
            showToast.error(error.message || "Failed to mark shipment");
        } finally {
            setLoading(false);
        }
    };

    const startScanner = async () => {
        try {
            const scanner = new Html5Qrcode("shipment-scanner");
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 120 } },
                async (decodedText) => {
                    if (!decodedText || loading) return;
                    await stopScanner();
                    setCameraStarted(false);
                    await handleDropAtBranch(decodedText);
                },
                (errorMessage) => {
                    void errorMessage; // expected per-frame noise — silence it
                }
            );

            setCameraStarted(true);
        } catch (err) {
            console.error(err);
            showToast.error("Unable to access camera scanner");
        }
    };

    return (
        <RoleGuard allowedRoles={[ROLES.RECEPTIONIST]} fallbackPath="/unauthorized">

            {/* ── PAGE SHELL ── */}
            <div className="relative min-h-screen bg-background-main font-display overflow-x-hidden">

                {/* Grid overlay */}
                <div
                    className="pointer-events-none fixed inset-0 z-0 bg-grid-pattern bg-grid opacity-100"
                    aria-hidden
                />

                {/* Amber glow top-right */}
                <div
                    className="pointer-events-none fixed top-0 right-0 w-150 h-100 opacity-60"
                    style={{
                        background:
                            "radial-gradient(ellipse 60% 50% at 85% 10%, rgba(251,191,36,0.12) 0%, transparent 70%)",
                    }}
                    aria-hidden
                />

                {/* Cyan glow bottom-left */}
                <div
                    className="pointer-events-none fixed bottom-0 left-0 w-1003h-75 opacity-50"
                    style={{
                        background:
                            "radial-gradient(ellipse 50% 50% at 15% 90%, rgba(34,211,238,0.07) 0%, transparent 70%)",
                    }}
                    aria-hidden
                />

                {/* ── CONTENT ── */}
                <div className="relative z-10 max-w-2xl mx-auto px-5 py-10 flex flex-col gap-7">

                    {/* ── HEADER ── */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">

                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-primary/25 bg-primary-soft">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-blink" />
                                <span className="text-[10px] font-bold tracking-widest uppercase text-primary font-display">
                                    Receptionist Terminal
                                </span>
                            </div>

                            <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-text-primary mb-1 font-display">
                                Branch Drop{" "}
                                <span className="text-primary">Scanner</span>
                            </h1>

                            <p className="text-sm text-text-muted font-body leading-relaxed">
                                Scan or enter a shipment ID when a customer drops a package at this branch.
                            </p>
                        </div>

                        {/* Scan counter */}
                        <div
                            className={[
                                "flex flex-col items-center justify-center w-187h-18nded-2xl shrink-0",
                                "border transition-all duration-300",
                                pulse
                                    ? "border-primary/60 bg-primary-soft scale-105 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                                    : "border-border-primary bg-primary-soft/50",
                            ].join(" ")}
                        >
                            <span className="text-[1.6rem] font-extrabold leading-none text-primary font-display">
                                {scanCount}
                            </span>
                            <span className="text-[9px] font-bold tracking-widest uppercase text-text-muted mt-0.5 font-display">
                                Scanned
                            </span>
                        </div>
                    </div>

                    {/* ── SCANNER CARD ── */}
                    <div className="rounded-2xl border border-border-default bg-background-surface overflow-hidden">

                        {/* Card header */}
                        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl border border-border-primary bg-primary-soft flex items-center justify-center shrink-0">
                                    <ScanLine size={20} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-text-primary font-display">
                                        Shipment Scanner
                                    </p>
                                    <p className="text-xs text-text-muted font-mono">
                                        barcode · QR · manual entry
                                    </p>
                                </div>
                            </div>

                            {!cameraStarted ? (
                                <button
                                    onClick={startScanner}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-background-main text-xs font-bold font-display tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(251,191,36,0.35)] shadow-[0_4px_16px_rgba(251,191,36,0.2)]"
                                >
                                    <Camera size={14} />
                                    Start Camera
                                </button>
                            ) : (
                                <button
                                    onClick={async () => {
                                        await stopScanner();
                                        setCameraStarted(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold font-display tracking-wide transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/50"
                                >
                                    <StopCircle size={14} />
                                    Stop
                                </button>
                            )}
                        </div>

                        {/* Card body */}
                        <div className="p-5 flex flex-col gap-5">

                            {/* ── VIEWPORT ── */}
                            <div className="relative rounded-xl border border-border-subtle bg-black overflow-hidden min-h-70">

                                {/* Idle overlay */}
                                {!cameraStarted && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl border border-border-primary bg-primary-soft flex items-center justify-center">
                                            <Package size={26} className="text-primary" strokeWidth={1.5} />
                                        </div>
                                        <p className="text-xs text-text-muted font-body text-center px-8 leading-relaxed">
                                            Press{" "}
                                            <span className="text-primary font-semibold">Start Camera</span>{" "}
                                            to activate the scanner, or enter the shipment ID below.
                                        </p>
                                    </div>
                                )}

                                {/* Corner brackets — only when scanning */}
                                {cameraStarted && (
                                    <>
                                        {/* TL */}
                                        <span className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-primary/60 rounded-tl z-20 pointer-events-none" />
                                        {/* TR */}
                                        <span className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-primary/60 rounded-tr z-20 pointer-events-none" />
                                        {/* BL */}
                                        <span className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-primary/60 rounded-bl z-20 pointer-events-none" />
                                        {/* BR */}
                                        <span className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-primary/60 rounded-br z-20 pointer-events-none" />

                                        {/* Scan line */}
                                        <span
                                            className="absolute left-3 right-3 h-px z-20 pointer-events-none"
                                            style={{
                                                background:
                                                    "linear-gradient(90deg, transparent, #fbbf24, transparent)",
                                                animation: "scanLine 2.5s ease-in-out infinite",
                                            }}
                                        />
                                        <style>{`
                                            @keyframes scanLine {
                                                0%   { top: 12px;              opacity: 0; }
                                                10%  {                          opacity: 1; }
                                                90%  {                          opacity: 1; }
                                                100% { top: calc(100% - 12px); opacity: 0; }
                                            }
                                        `}</style>
                                    </>
                                )}

                                <div id="shipment-scanner" className="w-full min-h-70" />
                            </div>

                            {/* ── DIVIDER ── */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-border-subtle" />
                                <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted font-display">
                                    or enter manually
                                </span>
                                <div className="flex-1 h-px bg-border-subtle" />
                            </div>

                            {/* ── MANUAL INPUT ── */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold tracking-widest uppercase text-text-muted font-display">
                                    Manual Shipment ID
                                </label>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search
                                            size={14}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                                        />
                                        <input
                                            value={trackingCode}
                                            onChange={(e) => setTrackingCode(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && trackingCode.trim() && !loading)
                                                    handleDropAtBranch(trackingCode.trim());
                                            }}
                                            placeholder="Paste or type shipment ID…"
                                            className="w-full pl-9 pr-4 py-3 rounded-xl bg-background-alt border border-border-default text-text-primary text-sm font-mono placeholder:text-text-muted/40 outline-none transition-all duration-200 focus:border-primary/40 focus:bg-background-elevated focus:shadow-[0_0_0_3px_rgba(251,191,36,0.06)]"
                                        />
                                    </div>

                                    <button
                                        disabled={loading || !trackingCode.trim()}
                                        onClick={() => handleDropAtBranch(trackingCode.trim())}
                                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-dark/90 border border-secondary/20 text-background-main text-sm font-bold font-display tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(34,211,238,0.2)] disabled:opacity-40 disabled:pointer-events-none disabled:transform-none"
                                    >
                                        {loading ? (
                                            <Loader2 size={15} className="animate-spin text-background-main" />
                                        ) : (
                                            <>
                                                <Zap size={13} />
                                                Confirm
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── LAST SCANNED ── */}
                    {lastScanned && (
                        <div className="flex items-center gap-4 rounded-2xl border border-success/20 bg-success-soft px-5 py-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
                            <div className="w-12 h-12 rounded-xl border border-success/25 bg-success/10 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={22} className="text-success" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold tracking-widest uppercase text-success/50 font-display mb-0.5">
                                    Last confirmed drop
                                </p>
                                <p className="text-sm font-bold text-text-primary font-mono truncate">
                                    {lastScanned}
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-full border border-success/25 bg-success/10">
                                <CheckCircle2 size={10} className="text-success" />
                                <span className="text-[10px] font-bold tracking-wide text-success font-display">
                                    Logged
                                </span>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </RoleGuard>
    );
}