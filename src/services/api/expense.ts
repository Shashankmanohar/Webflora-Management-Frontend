import api from "@/lib/axios";
import { CreateExpenseRequest, ExpenseBackend, ApiResponse } from "@/types/api";
import { API_ENDPOINTS } from "@/config/api";

const expenseService = {
    addExpense: async (data: CreateExpenseRequest): Promise<ApiResponse<{ expense: ExpenseBackend }>> => {
        const response = await api.post(API_ENDPOINTS.EXPENSE_ADD, data);
        return response.data;
    },

    getExpenses: async (filters?: { startDate?: string; endDate?: string; type?: string; category?: string; returnStatus?: string }): Promise<ExpenseBackend[]> => {
        const response = await api.get(API_ENDPOINTS.EXPENSE_ALL, { params: filters });
        return response.data;
    },

    deleteExpense: async (id: string): Promise<ApiResponse> => {
        const response = await api.delete(API_ENDPOINTS.EXPENSE_DELETE(id));
        return response.data;
    },
    
    updateReturnStatus: async (id: string, status: "Pending" | "Returned"): Promise<ApiResponse> => {
        const response = await api.patch(API_ENDPOINTS.EXPENSE_UPDATE_STATUS(id), { returnStatus: status });
        return response.data;
    }
};

export default expenseService;
