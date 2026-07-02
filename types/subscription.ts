export type SubscriptionStatus = "Trialing" | "Active" | "Pending" | "Canceled" | "Expired";
export type BillingCycle = "monthly" | "yearly";

export interface ISubscriptionPlan {
    id: string;
    name: string;
    code: string;
    monthlyPrice: number;
    yearlyPrice?: number;
    currency: string;
    isActive: boolean;
    maxUsers: number;
    maxShipmentsPerMonth: number;
    maxDrivers: number;
}

export interface ICompanySubscription {
    id: string;
    companyId: string;
    subscriptionPlanId: string;
    subscriptionPlan: ISubscriptionPlan;
    status: SubscriptionStatus;
    startDate: string;
    endDate?: string;
    trialEndDate?: string;
    billingCycle: BillingCycle;
    paymentProvider?: string;
    providerSubscriptionId?: string;
    providerCheckoutId?: string;
    autoRenew: boolean;
}

export interface IInitiateUpgradeRequest {
    companyId: string;
    planId: string;
    billingCycle: BillingCycle;
    successUrl: string;
    failureUrl: string;
}

export interface ICreatePlanRequest {
    name: string;
    code: string;
    monthlyPrice: number;
    yearlyPrice?: number;
    currency: string;
    isActive: boolean;
    maxUsers: number;
    maxShipmentsPerMonth: number;
    maxDrivers: number;
}

export interface ICreateTrialSubscriptionRequest {
    companyId: string;
    planId: string;
}