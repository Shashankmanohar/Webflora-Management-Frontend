import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryApi } from '@/services/api/salary';
import { CreateSalaryRequest } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useSalaryHistory = (id: string | null) => {
    return useQuery({
        queryKey: ['salary-history', id],
        queryFn: () => salaryApi.getHistory(id!),
        enabled: !!id,
    });
};

export const useSalaryStats = () => {
    return useQuery({
        queryKey: ['salary-stats'],
        queryFn: () => salaryApi.getStats(),
    });
};

export const useAddSalaryPayment = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: CreateSalaryRequest) => salaryApi.addPayment(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['salary-history', variables.payeeId] });
            queryClient.invalidateQueries({ queryKey: ['salary-stats'] });
            toast({
                title: 'Success',
                description: 'Salary payment recorded successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to record payment',
                variant: 'destructive',
            });
        },
    });
};

export const useAllSalaries = () => {
    return useQuery({
        queryKey: ['salaries', 'all'],
        queryFn: () => salaryApi.getAll(),
    });
};
