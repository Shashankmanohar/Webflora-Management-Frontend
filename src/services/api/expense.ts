import api from "@/lib/axios";
import { CreateExpenseRequest, ExpenseBackend, ApiResponse } from "@/types/api";
import { API_ENDPOINTS } from "@/config/api";

const expenseService = {
    addExpense: async (data: CreateExpenseRequest): Promise<ApiResponse<{ expense: ExpenseBackend }>> => {
        const response = await api.post(API_ENDPOINTS.EXPENSE_ADD, data);
        return response.data;
    },

    getExpenses: async (filters?: { startDate?: string; endDate?: string; type?: string; category?: string }): Promise<ExpenseBackend[]> => {
        const response = await api.get(API_ENDPOINTS.EXPENSE_BASE, { params: filters });
        return response.data;
    },

    deleteExpense: async (id: string): Promise<ApiResponse> => {
        const response = await api.delete(API_ENDPOINTS.EXPENSE_DELETE(id));
        return response.data;
    }
};

export default expenseService;
