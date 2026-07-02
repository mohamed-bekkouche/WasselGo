import api from "@/lib/api";
import { IPaymentCheckout } from "@/types/payment";
import { IActivateSubscription, ICreatePlan, ICreateTrialSubscription, IInitiateUpgrade, IPlan } from "@/types/plan";

export const createPlan = async (payload: ICreatePlan) => {
    await api.post("/subscription/plans", payload);
}

export const getPlans = async (): Promise<IPlan[]> => {
    const res = await api.get("/subscription/plans");
    return res.data;
}
export const createTrialSubscription = async (payload: ICreateTrialSubscription) => {
    await api.post("/subscription/trial", payload);
}

export const initiateUpgrade = async (payload: IInitiateUpgrade): Promise<IPaymentCheckout> => {
    const res = await api.post("/subscription/upgrade", payload);
    return res.data;
}

export const activateSubscription = async (payload: IActivateSubscription) => {
    await api.post("/subscription/activate", payload);
}

export const cancelSubscription = async () => {
    await api.post("/subscription/cancel");
}
