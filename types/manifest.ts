import { IBaseFilter } from "./paginate";
import { IUser } from "./user";

export interface ICreateManifest {
    toNodeId: string;
}

export interface IManifestFilter extends IBaseFilter {
    status?: string;
    nodeId?: string;
}

export interface IManifestResponse {
    id: string;
    code: string;
    status: string;
    fromNodeId: string;
    toNodeId: string;
    itemCount: number;
    totalWeightKg: number;
    createdAt: string;
    sealedAt?: string;
    sealedBy?: IUser;
}

export interface ISealManifest {
    driverId: string;
    vehiclePlate?: string;
}
