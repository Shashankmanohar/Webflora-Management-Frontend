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
    image?: string;
    loggedAt: string;
    createdAt: string;
    updatedAt: string;
}

export const activityApi = {
    log: async (data: { date: string; content: string; projectId?: string; image?: File }) => {
        const formData = new FormData();
        formData.append('date', data.date);
        formData.append('content', data.content);
        if (data.projectId && data.projectId !== 'none') {
            formData.append('projectId', data.projectId);
        }
        if (data.image) {
            formData.append('image', data.image);
        }

        const response = await axiosInstance.post('/api/activity/log', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    getAll: async (params: { userId?: string; startDate?: string; endDate?: string } = {}) => {
        const response = await axiosInstance.get('/api/activity', { params });
        return response.data.activities as Activity[];
    },
    update: async (id: string, data: { content?: string; image?: File }) => {
        const formData = new FormData();
        if (data.content) formData.append('content', data.content);
        if (data.image) formData.append('image', data.image);

        const response = await axiosInstance.patch('/api/activity/update', formData, { 
            params: { id },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    delete: async (id: string) => {
        const response = await axiosInstance.delete('/api/activity/delete', { params: { id } });
        return response.data;
    }
};
