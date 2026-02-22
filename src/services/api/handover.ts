import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import {
    ApiResponse,
    HandoverBackend,
    CreateHandoverRequest,
    UpdateHandoverRequest,
    adaptHandoverData
} from '../../types/api';

export const handoverApi = {
    getAll: async (): Promise<any[]> => {
        const response = await axiosInstance.get<HandoverBackend[]>(API_ENDPOINTS.HANDOVER_BASE);
        return response.data.map(adaptHandoverData);
    },
    getById: async (id: string): Promise<any> => {
        const response = await axiosInstance.get<HandoverBackend>(API_ENDPOINTS.HANDOVER_BY_ID(id));
        return adaptHandoverData(response.data);
    },
    create: async (data: CreateHandoverRequest): Promise<ApiResponse<HandoverBackend>> => {
        const response = await axiosInstance.post<ApiResponse<HandoverBackend>>(API_ENDPOINTS.HANDOVER_ADD, data);
        return response.data;
    },
    update: async (id: string, data: UpdateHandoverRequest): Promise<ApiResponse<HandoverBackend>> => {
        const response = await axiosInstance.put<ApiResponse<HandoverBackend>>(API_ENDPOINTS.HANDOVER_UPDATE(id), data);
        return response.data;
    },
    delete: async (id: string): Promise<ApiResponse> => {
        const response = await axiosInstance.delete<ApiResponse>(API_ENDPOINTS.HANDOVER_DELETE(id));
        return response.data;
    },
};
