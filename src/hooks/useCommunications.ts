import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationApi } from '@/services/api/additional';
import { toast } from 'sonner';

export const useCommunications = () => {
    return useQuery({
        queryKey: ['communications'],
        queryFn: communicationApi.getAll,
    });
};

export const useCommunication = (id: string) => {
    return useQuery({
        queryKey: ['communication', id],
        queryFn: () => communicationApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateCommunication = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { title: string; description: string }) =>
            communicationApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communications'] });
            toast.success('Communication submitted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to submit communication';
            toast.error(message);
        },
    });
};

export const useReplyCommunication = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reply, status }: { id: string; reply: string; status: string }) =>
            communicationApi.reply(id, reply, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communications'] });
            toast.success('Reply sent successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to send reply';
            toast.error(message);
        },
    });
};

export const useDeleteCommunication = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => communicationApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communications'] });
            toast.success('Communication deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to delete communication';
            toast.error(message);
        },
    });
};
