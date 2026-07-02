import api from "@/lib/api";
import {
    ISubscriptionPlan,
    ICompanySubscription,
    IInitiateUpgradeRequest,
    ICreatePlanRequest,
    ICreateTrialSubscriptionRequest,
} from "@/types/subscription";

export async function getSubscriptionPlans(): Promise<ISubscriptionPlan[]> {
    const res = await api.get("/subscriptions/plans");
    return res.data;
}

export async function createSubscriptionPlan(data: ICreatePlanRequest): Promise<void> {
    await api.post("/subscriptions/plans", data);
}

export async function createTrialSubscription(data: ICreateTrialSubscriptionRequest): Promise<void> {
    await api.post("/subscriptions/trial", data);
}

export async function initiateUpgrade(
    data: IInitiateUpgradeRequest
): Promise<{ checkoutId: string; checkoutUrl: string }> {
    const res = await api.post("/subscriptions/upgrade", data);
    return res.data;
}

export async function getCompanySubscription(companyId: string): Promise<ICompanySubscription> {
    const res = await api.get(`/subscriptions/company/${companyId}`);
    return res.data;
}

export async function cancelSubscription(companyId: string): Promise<void> {
    await api.delete(`/subscriptions/company/${companyId}`);
}