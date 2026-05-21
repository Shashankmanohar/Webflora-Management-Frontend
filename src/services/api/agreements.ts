import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

export const agreementApi = {
    getAll: async (params?: { status?: string; search?: string; client?: string }) => {
        const response = await axiosInstance.get<{ success: boolean; agreements: any[] }>(
            API_ENDPOINTS.AGREEMENT_ALL,
            { params }
        );
        return response.data.agreements;
    },

    getById: async (id: string) => {
        const response = await axiosInstance.get<{ success: boolean; agreement: any }>(
            `${API_ENDPOINTS.AGREEMENT_BASE}/${id}`
        );
        return response.data.agreement;
    },

    create: async (data: any) => {
        const response = await axiosInstance.post<{ success: boolean; message: string; agreement: any }>(
            API_ENDPOINTS.AGREEMENT_CREATE,
            data
        );
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await axiosInstance.put<{ success: boolean; message: string; agreement: any }>(
            API_ENDPOINTS.AGREEMENT_UPDATE(id),
            data
        );
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete<{ success: boolean; message: string }>(
            API_ENDPOINTS.AGREEMENT_DELETE(id)
        );
        return response.data;
    },

    duplicate: async (id: string) => {
        const response = await axiosInstance.post<{ success: boolean; message: string; agreement: any }>(
            API_ENDPOINTS.AGREEMENT_DUPLICATE(id)
        );
        return response.data;
    },

    sendEmail: async (id: string) => {
        const response = await axiosInstance.post<{ success: boolean; message: string; agreement: any }>(
            API_ENDPOINTS.AGREEMENT_SEND(id)
        );
        return response.data;
    },

    esign: async (id: string, signatureData: string, signedBy: string) => {
        const response = await axiosInstance.post<{ success: boolean; message: string; agreement: any }>(
            API_ENDPOINTS.AGREEMENT_ESIGN(id),
            { signatureData, signedBy }
        );
        return response.data;
    },
};
