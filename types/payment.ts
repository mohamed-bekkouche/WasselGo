export interface IPaymentCheckoutResult {
    checkoutId: string;
    checkoutUrl: string;
}

export interface IPaymentCheckout {
    companyId: string;
    subscriptionId: string;
    amount: number;
    currency: string;
    billingCycle: string;
    successUrl: string;
    failureUrl: string;
}

export interface IPaymentWebhookEvent {
    eventType: string; // "payment.paid", "payment.failed", etc.
    checkoutId: string;
    providerRef?: string;
    isSuccess: boolean;
}