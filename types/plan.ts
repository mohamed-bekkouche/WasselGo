

export interface IPlan {
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
    createdAt: string;
    updatedAt: string;
}

export interface ICreatePlan {
    name: string;
    code: string;
    monthlyPrice: number;
    yearlyPrice: number;
    currency?: string;
    isActive?: boolean;
    maxUsers?: number;
    maxShipmentsPerMonth?: number;
    maxDrivers?: number;
}

export interface IActivateSubscription {
    checkoutId: string;
}

export interface ICreateTrialSubscription {
    planId: string;
    companyId: string;
}

export interface IInitiateUpgrade {
    companyId: string;
    planId: string;
    billingCycle: string;
    successUrl: string;
    failureUrl: string;
}