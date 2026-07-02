import api from "@/lib/api";
import { ICompanyResponse, ICreateCompany, IUpdateCompany, ICompanyFilter } from "@/types/company";
import { IPaginatedResponse } from "@/types/paginate";

export const createCompany = async (data: FormData) => {
  await api.post("/companies", data);
};

export const listCompanies = async (filter: ICompanyFilter): Promise<IPaginatedResponse<ICompanyResponse>> => {
  const res = await api.get("/companies", { params: filter });
  return res.data;
}

export const getMyCompany = async (): Promise<ICompanyResponse> => {
  const res = await api.get("/companies/me");
  return res.data;
};

export const getCompany = async (companyId: string): Promise<ICompanyResponse> => {
  const res = await api.get(`/companies/${companyId}`);
  return res.data;
};

export const updateCompany = async (companyId: string, data: IUpdateCompany) => {
  await api.patch(`/companies/${companyId}`, data);
};

