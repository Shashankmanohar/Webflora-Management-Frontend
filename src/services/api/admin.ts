import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import { AdminLoginRequest, AdminRegisterRequest, LoginResponse } from '@/types/api';

export const adminApi = {
    login: async (credentials: AdminLoginRequest) => {
        const response = await axiosInstance.post<LoginResponse>(
            API_ENDPOINTS.ADMIN_LOGIN,
            credentials
        );
        return response.data;
    },

    register: async (data: AdminRegisterRequest) => {
        const response = await axiosInstance.post(API_ENDPOINTS.ADMIN_REGISTER, data);
        return response.data;
    },

    getAdmins: async () => {
        const response = await axiosInstance.get(API_ENDPOINTS.ADMIN_GET);
        return response.data;
    },
};
