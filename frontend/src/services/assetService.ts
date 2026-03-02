import apiClient from './apiClient';

export interface Asset {
    _id: string;
    type: 'BIO' | 'SONIC';
    title: string;
    description: string;
    communityName: string;
    recordeeName: string;
    riskTier?: string;
    mediaUrl?: string;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    reviewComment?: string | null;
    createdBy?: { name: string; email: string };
    metadata?: Record<string, any>;
    transcript?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAssetPayload {
    type: 'BIO' | 'SONIC';
    title: string;
    description: string;
    recordeeName: string;
    communityName: string;
    riskTier?: string;
    transcript?: string;
    metadata?: Record<string, unknown>;
}

// Community: submit a new asset
export const submitAsset = async (data: CreateAssetPayload): Promise<Asset> => {
    const resp = await apiClient.post<Asset>('/assets', data);
    return resp.data;
};

// Community: get own assets (all statuses)
export const getMyAssets = async (): Promise<Asset[]> => {
    const resp = await apiClient.get<Asset[]>('/assets/mine');
    return resp.data;
};

// Reviewer: get pending assets
export const getPendingAssets = async (): Promise<Asset[]> => {
    const resp = await apiClient.get<Asset[]>('/assets/pending');
    return resp.data;
};

// Marketplace / General: get approved-only assets
export const getPublicAssets = async (): Promise<Asset[]> => {
    const resp = await apiClient.get<Asset[]>('/assets/public');
    return resp.data;
};

export const getReviewedAssets = async (): Promise<Asset[]> => {
    const resp = await apiClient.get<Asset[]>('/assets/reviewed');
    return resp.data;
};

// Reviewer: approve an asset
export const approveAsset = async (id: string): Promise<Asset> => {
    const resp = await apiClient.patch<Asset>(`/assets/${id}/approve`);
    return resp.data;
};

// Reviewer: reject an asset (comment required)
export const rejectAsset = async (id: string, reviewComment: string): Promise<Asset> => {
    const resp = await apiClient.patch<Asset>(`/assets/${id}/reject`, { reviewComment });
    return resp.data;
};
