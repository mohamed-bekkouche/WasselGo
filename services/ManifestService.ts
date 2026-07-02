import api from "@/lib/api";
import { ICreateManifest, IManifestFilter, IManifestResponse, ISealManifest } from "@/types/manifest";
import { IPaginatedResponse } from "@/types/paginate";
import { IShipmentSummary } from "@/types/shipment";


export const CreateManifest = async (data: ICreateManifest) => {
    var res = await api.post("/manifests", data);
    return res.data;
};

export const GetManifestById = async (id: string): Promise<IManifestResponse> => {
    var res = await api.get(`/manifests/${id}`);
    return res.data;
}

export const ListManifests = async (filter: IManifestFilter): Promise<IPaginatedResponse<IManifestResponse>> => {
    var res = await api.get(`/manifests`, { params: filter });
    return res.data;
}

export const SealManifest = async (manifestId: string, sealData: ISealManifest) => {
    var res = await api.post(`/manifests/${manifestId}/seal`, sealData);
    return res.data;
}

export const MarkManifestArrived = async (manifestId: string) => {
    var res = await api.post(`/manifests/${manifestId}/arrive`);
    return res.data;
}

export const GetManifestShipments = async (manifestId: string): Promise<IPaginatedResponse<IShipmentSummary>> => {
    var res = await api.get(`/manifests/${manifestId}/shipments`);
    return res.data;
}
