import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import {
    CreateProjectRequest,
    ProjectBackend,
    adaptProjectData,
} from '@/types/api';

export const projectApi = {
    getAll: async () => {
        const response = await axiosInstance.get<{ projects: ProjectBackend[] }>(
            API_ENDPOINTS.PROJECT_BASE
        );
        return response.data.projects.map(adaptProjectData);
    },

    getById: async (id: string) => {
        const response = await axiosInstance.get<{ project: ProjectBackend }>(
            API_ENDPOINTS.PROJECT_BASE + `/${id}`
        );
        return adaptProjectData(response.data.project);
    },

    create: async (data: CreateProjectRequest) => {
        const response = await axiosInstance.post(API_ENDPOINTS.PROJECT_BASE + '/create', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await axiosInstance.put(API_ENDPOINTS.PROJECT_UPDATE(id), data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(API_ENDPOINTS.PROJECT_DELETE(id));
        return response.data;
    },
};
