"use client";

import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
import OwnerDashboard from "@/components/dashboard/OwnerDashboard";
import ReceptionistDashboard from "@/components/dashboard/ReceptionistDashboard";
import { getUserRole } from "@/hooks/useAuth";
import { ROLES } from "@/lib/roles";
import userStore from "@/stores/userStore";

/**
 * Adjust the strings below to match your ROLES constants exactly.
 */
export default function DashboardPage() {
    const userRole = getUserRole();
    if (userRole === ROLES.OWNER) return <OwnerDashboard />;
    if (userRole === ROLES.MANAGER) return <ManagerDashboard />;
    if (userRole === ROLES.RECEPTIONIST) return <ReceptionistDashboard />;

    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
                <p className="text-slate-400 text-sm">
                    No dashboard for role:{" "}
                    <span className="text-white font-mono">{userRole ?? "unknown"}</span>
                </p>
                <p className="text-slate-600 text-xs">Contact your administrator.</p>
            </div>
        </div>
    );
}