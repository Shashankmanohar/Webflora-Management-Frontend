import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agreementApi } from "@/services/api";
import { toast } from "sonner";

export const useAgreements = (params?: { status?: string; search?: string; client?: string }) => {
    return useQuery({
        queryKey: ["agreements", params],
        queryFn: () => agreementApi.getAll(params),
    });
};

export const useAgreementDetails = (id: string) => {
    return useQuery({
        queryKey: ["agreement", id],
        queryFn: () => agreementApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateAgreement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => agreementApi.create(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["agreements"] });
            toast.success(data.message || "Agreement created successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to create agreement";
            toast.error(message);
        },
    });
};

export const useUpdateAgreement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => agreementApi.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["agreements"] });
            queryClient.invalidateQueries({ queryKey: ["agreement", variables.id] });
            toast.success(data.message || "Agreement updated successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to update agreement";
            toast.error(message);
        },
    });
};

export const useDeleteAgreement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => agreementApi.delete(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["agreements"] });
            toast.success(data.message || "Agreement deleted successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to delete agreement";
            toast.error(message);
        },
    });
};

export const useDuplicateAgreement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => agreementApi.duplicate(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["agreements"] });
            toast.success(data.message || "Agreement duplicated successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to duplicate agreement";
            toast.error(message);
        },
    });
};

export const useSendAgreement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => agreementApi.sendEmail(id),
        onSuccess: (data, id) => {
            queryClient.invalidateQueries({ queryKey: ["agreements"] });
            queryClient.invalidateQueries({ queryKey: ["agreement", id] });
            toast.success(data.message || "Agreement sent to client via email!");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to send agreement email";
            toast.error(message);
        },
    });
};

export const useESignAgreement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, signatureData, signedBy }: { id: string; signatureData: string; signedBy: string }) =>
            agreementApi.esign(id, signatureData, signedBy),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["agreements"] });
            queryClient.invalidateQueries({ queryKey: ["agreement", variables.id] });
            toast.success(data.message || "Agreement e-signed successfully!");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to submit e-signature";
            toast.error(message);
        },
    });
};
