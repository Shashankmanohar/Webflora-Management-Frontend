import axiosInstance from '@/lib/axios';
import { CreateSalaryRequest, SalaryBackend, SalaryStats, SalaryRecord } from '@/types/api';

export const salaryApi = {
    addPayment: async (data: CreateSalaryRequest) => {
        const response = await axiosInstance.post<SalaryBackend>('/api/salary/add', data);
        return response.data;
    },

    getHistory: async (id: string) => {
        const response = await axiosInstance.get<SalaryBackend[]>(`/api/salary/history/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await axiosInstance.get<SalaryStats[]>('/api/salary/stats');
        return response.data;
    },

    getAll: async () => {
        const response = await axiosInstance.get<SalaryRecord[]>('/api/salary/all');
        return response.data;
    },
};
