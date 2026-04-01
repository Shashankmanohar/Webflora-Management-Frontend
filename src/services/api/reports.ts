import axiosInstance from '@/lib/axios';

export const reportApi = {
    getAttendance: async (params: { userId?: string; startDate?: string; endDate?: string } = {}) => {
        const response = await axiosInstance.get('/api/report/attendance', { params });
        return response.data.attendance;
    },
    getSalary: async (params: { payeeId?: string; month?: string; year?: number } = {}) => {
        const response = await axiosInstance.get('/api/report/salary', { params });
        return response.data.salaries;
    },
    // Helper to download as CSV
    downloadCSV: (data: any[], filename: string) => {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const val = row[header];
                return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
};
