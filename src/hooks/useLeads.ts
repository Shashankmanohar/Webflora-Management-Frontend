import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadApi } from "@/services/api";
import { toast } from "sonner";

export const useLeads = () => {
    return useQuery({
        queryKey: ["leads"],
        queryFn: leadApi.getAll,
    });
};

export const useCreateLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => leadApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead created successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to create lead";
            toast.error(message);
        },
    });
};

export const useUpdateLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => leadApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead updated successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to update lead";
            toast.error(message);
        },
    });
};

export const useDeleteLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => leadApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead deleted successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to delete lead";
            toast.error(message);
        },
    });
};
