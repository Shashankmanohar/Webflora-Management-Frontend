import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noticeApi } from '@/services/api/additional';
import { toast } from 'sonner';

export const useNotices = () => {
    return useQuery({
        queryKey: ['notices'],
        queryFn: noticeApi.getAll,
    });
};

export const useNotice = (id: string) => {
    return useQuery({
        queryKey: ['notice', id],
        queryFn: () => noticeApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateNotice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            title: string;
            content: string;
            date?: string;
            audienceType?: 'all' | 'employee' | 'intern' | 'individual';
            targetId?: string;
            targetModel?: 'employee' | 'intern';
        }) =>
            noticeApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notices'] });
            toast.success('Notice created successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to create notice';
            toast.error(message);
        },
    });
};

export const useDeleteNotice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => noticeApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notices'] });
            toast.success('Notice deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to delete notice';
            toast.error(message);
        },
    });
};
