import { IBaseFilter } from "./paginate";
import { IUserSummary } from "./user";

export enum SubscriptionStatus {
  TRIAL = "trial",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  CANCELED = "canceled",
  EXPIRED = "expired"
}

export enum SubscriptionPlan {
  FREE = "free",
  BASIC = "basic",
  PRO = "pro",
  ENTERPRISE = "enterprise"
}

export interface ICompanyResponse {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string;
  owner: IUserSummary;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCompany {
  name: string;
  subdomain: string;
  logo: File | null;
}
export interface IUpdateCompany {
  name?: string;
  subdomain?: string;
  logo?: File | null;
}

export interface ICompanyFilter extends IBaseFilter {
  search?: string;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
}