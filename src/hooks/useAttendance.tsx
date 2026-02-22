import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/services/api/attendance';
import { useToast } from '@/hooks/use-toast';

export const useAttendance = (options?: { enabled?: boolean }) => {
    return useQuery<any[]>({
        queryKey: ['attendance', 'me'],
        queryFn: attendanceApi.getMyAttendance,
        ...options
    });
};

export const useAllAttendance = (userId?: string, options?: { enabled?: boolean }) => {
    return useQuery<any[]>({
        queryKey: ['attendance', 'all', userId],
        queryFn: () => attendanceApi.getAll(userId),
        ...options
    });
};

export const useMarkAttendance = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: attendanceApi.markAttendance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast({
                title: "Attendance Marked",
                description: "Your attendance has been recorded successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to mark attendance",
                variant: "destructive",
            });
        },
    });
};
