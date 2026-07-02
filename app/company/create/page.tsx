"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Building2,
    Globe,
    Upload,
    X,
    Check,
} from "lucide-react";

import { showToast } from "nextjs-toast-notify";

import { createCompany } from "@/services/CompanyService";
import { ICreateCompany } from "@/types/company";
import { parseApiError } from "@/utils/apiErrorHandler";

interface FormErrors {
    name?: string;
    subdomain?: string;
    logo?: string;
}

export default function CreateCompanyPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [subdomain, setSubdomain] = useState("");

    const [logo, setLogo] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};

        if (!name.trim()) {
            newErrors.name = "Company name is required";
        }

        if (!subdomain.trim()) {
            newErrors.subdomain = "Subdomain is required";
        } else if (!/^[a-z0-9-]+$/.test(subdomain)) {
            newErrors.subdomain =
                "Only lowercase letters, numbers and hyphens are allowed";
        }

        return newErrors;
    };

    const handleLogoChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({
                ...prev,
                logo: "Please select an image file",
            }));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({
                ...prev,
                logo: "Maximum size is 5MB",
            }));
            return;
        }

        setErrors((prev) => {
            const next = { ...prev };
            delete next.logo;
            return next;
        });

        setLogo(file);

        const reader = new FileReader();

        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };

        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const validationErrors = validate();

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append("name", name.trim());
            formData.append("subdomain", subdomain.trim().toLowerCase());

            if (logo) {
                formData.append("logo", logo);
            }

            await createCompany(formData);

            showToast.success("Company created successfully", {
                duration: 4000,
                position: "top-right",
            });

            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            const error = parseApiError(err)
            console.log("Create company error:", error);
            showToast.error(
                error.message ||
                "Failed to create company",
                {
                    duration: 4000,
                    position: "top-right",
                }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-main relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute -top-40 -left-40 w-150 h-150nded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(251,191,36,0.08), transparent 70%)",
                    }}
                />

                <div
                    className="absolute -bottom-40 -right-40 w-1255h-125nded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)",
                    }}
                />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                {/* Header */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                        <Building2
                            size={14}
                            className="text-amber-400"
                        />
                        <span className="text-xs font-medium text-amber-400">
                            Company Setup
                        </span>
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-3">
                        Create Company
                    </h1>

                    <p className="text-slate-400">
                        Set up your company workspace and start
                        managing your logistics operations.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-[#0b1018]/70 backdrop-blur-xl border border-white/5 rounded-3xl p-8"
                >
                    <div className="space-y-6">
                        {/* Company Name */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                Company Name
                            </label>

                            <div className="relative">
                                <Building2
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="WasselGo Logistics"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/3er border-white/[0.07] text-white placeholder:text-slate-500 outline-none focus:border-amber-500/40"
                                />
                            </div>

                            {errors.name && (
                                <p className="mt-2 text-xs text-red-400">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Subdomain */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                Subdomain
                            </label>

                            <div className="relative">
                                <Globe
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    value={subdomain}
                                    onChange={(e) =>
                                        setSubdomain(
                                            e.target.value
                                                .toLowerCase()
                                                .replace(
                                                    /[^a-z0-9-]/g,
                                                    ""
                                                )
                                        )
                                    }
                                    placeholder="my-company"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/3er border-white/[0.07] text-white placeholder:text-slate-500 outline-none focus:border-amber-500/40"
                                />
                            </div>

                            <div className="mt-2 text-xs text-slate-500">
                                Workspace URL:
                                <span className="text-amber-400 ml-1">
                                    {subdomain || "your-company"}
                                    .wasselgo.dz
                                </span>
                            </div>

                            {errors.subdomain && (
                                <p className="mt-2 text-xs text-red-400">
                                    {errors.subdomain}
                                </p>
                            )}
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                Company Logo
                            </label>

                            <div
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                className="cursor-pointer border border-dashed border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all"
                            >
                                {previewUrl ? (
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={previewUrl}
                                                alt="Logo Preview"
                                                className="w-20 h-20 rounded-xl object-cover border border-white/10"
                                            />

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLogo(null);
                                                    setPreviewUrl(
                                                        null
                                                    );
                                                }}
                                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>

                                        <div>
                                            <p className="text-white text-sm font-medium">
                                                Logo uploaded
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                Click to replace
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-slate-500">
                                            <Upload size={22} />
                                        </div>

                                        <div>
                                            <p className="text-sm text-white">
                                                Upload company logo
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                PNG, JPG, SVG — up to
                                                5MB
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                            />

                            {errors.logo && (
                                <p className="mt-2 text-xs text-red-400">
                                    {errors.logo}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end mt-8 pt-6 border-t border-white/5">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-black bg-linear-to-r from-amber-400 to-amber-500 hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin w-4 h-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    Create Company
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}