import { SubscriptionStatus } from "@/types/subscription";


const config: Record<SubscriptionStatus, { bg: string; color: string }> = {
    Active: { bg: "#065f46", color: "#34d399" },
    Trialing: { bg: "#78350f", color: "#fbbf24" },
    Pending: { bg: "#1e3a5f", color: "#60a5fa" },
    Canceled: { bg: "#2d1b1b", color: "#f87171" },
    Expired: { bg: "#1e1e2e", color: "#64748b" },
};

export default function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
    const s = config[status] ?? config.Expired;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "2px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 500,
                background: s.bg,
                color: s.color,
            }}
        >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
            {status}
        </span>
    );
}