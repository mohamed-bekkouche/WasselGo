import api from "@/lib/api";
import { getCompanyId } from "@/hooks/useAuth";
import { IBranchDetails, IBranchFilter, IBranchResponse, ICreateBranchPayload, IUpdateBranchPayload } from "@/types/branch";
import { IPaginatedResponse } from "@/types/paginate";



export const listBranches = async (params?: IBranchFilter): Promise<IPaginatedResponse<IBranchResponse>> => {
    const res = await api.get("/logistics-nodes", { params });
    return res.data;
};

export const getDeletedBranches = async (): Promise<IBranchResponse[]> => {
    const res = await api.get(`logistics-nodes/deleted`);
    return res.data;
};

export const getBranch = async (id: string): Promise<IBranchDetails> => {
    const res = await api.get(`logistics-nodes/${id}`);
    return res.data;
};

export const createBranch = async (payload: ICreateBranchPayload): Promise<IBranchResponse> => {
    console.log("Creating branch with payload:", payload);
    const res = await api.post("/logistics-nodes", payload);
    return res.data;
};

export const updateBranch = async (id: string, payload: IUpdateBranchPayload): Promise<IBranchResponse> => {
    const res = await api.put(`logistics-nodes/${id}`, payload);
    return res.data;
};

export const deleteBranch = async (id: string): Promise<boolean> => {
    const res = await api.delete(`logistics-nodes/${id}`);
    return res.status === 204;
};

export const restoreBranch = async (id: string): Promise<boolean> => {
    const res = await api.put(`logistics-nodes/${id}/restore`);
    return res.status === 204;
};