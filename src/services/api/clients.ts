import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import {
    CreateClientRequest,
    UpdateClientRequest,
    ClientBackend,
    adaptClientData,
} from '@/types/api';

export const clientApi = {
    getAll: async () => {
        const response = await axiosInstance.get<{ clients: ClientBackend[] }>(
            API_ENDPOINTS.CLIENT_BASE
        );
        return response.data.clients.map(adaptClientData);
    },

    create: async (data: CreateClientRequest) => {
        const response = await axiosInstance.post(API_ENDPOINTS.CLIENT_BASE, data);
        return response.data;
    },

    update: async (id: string, data: UpdateClientRequest) => {
        const response = await axiosInstance.put(API_ENDPOINTS.CLIENT_UPDATE(id), data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(API_ENDPOINTS.CLIENT_DELETE(id));
        return response.data;
    },
};
