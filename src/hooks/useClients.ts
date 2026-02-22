import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/services/api';
import { CreateClientRequest, UpdateClientRequest } from '@/types/api';
import { toast } from 'sonner';

export const useClients = () => {
    return useQuery({
        queryKey: ['clients'],
        queryFn: clientApi.getAll,
    });
};

export const useCreateClient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateClientRequest) => clientApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Client created successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to create client';
            toast.error(message);
        },
    });
};

export const useUpdateClient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateClientRequest }) =>
            clientApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Client updated successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update client';
            toast.error(message);
        },
    });
};

export const useDeleteClient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => clientApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Client deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to delete client';
            toast.error(message);
        },
    });
};
