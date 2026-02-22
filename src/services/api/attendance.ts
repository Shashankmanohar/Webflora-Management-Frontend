import axiosInstance from '@/lib/axios';

export const attendanceApi = {
    getMyAttendance: async () => {
        const response = await axiosInstance.get('/api/attendance/get');
        return response.data;
    },
    getAll: async (userId?: string) => {
        const url = userId ? `/api/attendance/all?userId=${userId}` : '/api/attendance/all';
        const response = await axiosInstance.get(url);
        return response.data;
    },
    markAttendance: async (data: { date: string; status: string; timeIn: string }) => {
        const response = await axiosInstance.post('/api/attendance/create', data);
        return response.data;
    },
};
