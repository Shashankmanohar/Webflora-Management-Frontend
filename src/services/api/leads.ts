import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

export const leadApi = {
    getAll: async () => {
        const response = await axiosInstance.get<{ leads: any[] }>(
            API_ENDPOINTS.LEAD_ALL
        );
        return response.data.leads;
    },

    create: async (data: any) => {
        const response = await axiosInstance.post(API_ENDPOINTS.LEAD_CREATE, data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await axiosInstance.put(API_ENDPOINTS.LEAD_UPDATE(id), data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(API_ENDPOINTS.LEAD_DELETE(id));
        return response.data;
    },
};
