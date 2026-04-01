import axiosInstance from '@/lib/axios';

export interface Activity {
    _id: string;
    userId: string;
    userModel: 'employee' | 'intern';
    userName: string;
    date: string;
    content: string;
    projectId?: {
        _id: string;
        projectName: string;
    };
    loggedAt: string;
    createdAt: string;
    updatedAt: string;
}

export const activityApi = {
    log: async (data: { date: string; content: string; projectId?: string }) => {
        const response = await axiosInstance.post('/api/activity/log', data);
        return response.data;
    },
    getAll: async (params: { userId?: string; startDate?: string; endDate?: string } = {}) => {
        const response = await axiosInstance.get('/api/activity', { params });
        return response.data.activities as Activity[];
    },
    update: async (id: string, data: { content: string }) => {
        const response = await axiosInstance.patch('/api/activity/update', data, { params: { id } });
        return response.data;
    },
    delete: async (id: string) => {
        const response = await axiosInstance.delete('/api/activity/delete', { params: { id } });
        return response.data;
    }
};
