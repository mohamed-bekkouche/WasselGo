"use client";

import ConfirmEmail from "@/components/dashboard/auth/ConfirmEmail";
import { Suspense } from "react";


export default function ConfirmEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ConfirmEmail />
        </Suspense>
    );
}