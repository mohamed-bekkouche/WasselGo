"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { confirmEmail } from "@/services/AuthService";
import { parseApiError } from "@/utils/apiErrorHandler";
import { login } from "@/hooks/useAuth";
import { showToast } from "nextjs-toast-notify";

export default function ConfirmEmail() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            const userId = searchParams.get("userId");
            const token = searchParams.get("token");

            if (!userId || !token) {
                setError("Invalid confirmation link.");
                setLoading(false);
                return;
            }

            try {
                const data = await confirmEmail({
                    userId,
                    token,
                });
                setSuccess(true);
                showToast.success("Email confirmed successfully! Logging you in...");
                login(data.user, data.accessToken);
                setTimeout(() => {
                    router.push("/dashboard");
                }, 3000);
            } catch (err: any) {
                const error = parseApiError(err);
                console.log("Email confirmation error:", error);
                setError(
                    error.message ||
                    "Email confirmation failed. The link may be invalid or expired."
                );
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-background-main flex items-center justify-center p-6 relative overflow-hidden">

            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />
                <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-amber-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-[#0a0c12]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl text-center">

                    {/* Loading */}
                    {loading && (
                        <>
                            <Loader2
                                size={48}
                                className="mx-auto text-amber-400 animate-spin mb-6"
                            />

                            <h1 className="text-2xl font-bold text-white mb-2">
                                Confirming Email
                            </h1>

                            <p className="text-slate-400">
                                Please wait while we verify your account...
                            </p>
                        </>
                    )}

                    {/* Success */}
                    {!loading && success && (
                        <>
                            <CheckCircle
                                size={56}
                                className="mx-auto text-green-500 mb-6"
                            />

                            <h1 className="text-3xl font-bold text-white mb-3">
                                Email Confirmed
                            </h1>

                            <p className="text-slate-400 mb-8">
                                Your account has been activated successfully.
                                You can now sign in.
                            </p>

                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold transition"
                            >
                                Go to Login
                            </Link>
                        </>
                    )}

                    {/* Error */}
                    {!loading && !success && (
                        <>
                            <XCircle
                                size={56}
                                className="mx-auto text-red-500 mb-6"
                            />

                            <h1 className="text-3xl font-bold text-white mb-3">
                                Verification Failed
                            </h1>

                            <p className="text-slate-400 mb-8">
                                {error}
                            </p>

                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition"
                            >
                                Back to Login
                            </Link>
                        </>
                    )}
                </div>

                <div className="absolute -bottom-4 left-4 right-4 h-8 bg-amber-500/20 blur-xl rounded-[100%]" />
            </motion.div>
        </div>
    );
}