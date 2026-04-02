import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import expenseService from "@/services/api/expense";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { EmployeeBackend, InternBackend } from "@/types/api";
import { API_ENDPOINTS } from "@/config/api";

interface AddExpenseDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const categories = ["Food", "Travel", "Office Supplies", "Salary/Payment", "Marketing", "Others"];
const types = ["Self Spent", "Sent to Employee", "Sent to Intern", "Company Expense"];

const AddExpenseDialog = ({ isOpen, onOpenChange, onSuccess }: AddExpenseDialogProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date().toISOString());
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState("");
    const [recipientId, setRecipientId] = useState("");
    const [recipientModel, setRecipientModel] = useState<"employee" | "intern" | "">("");
    const [receipt, setReceipt] = useState<File | null>(null);

    // Fetch employees and interns for recipient selection
    const { data: employees } = useQuery({
        queryKey: ["employeesSelection"],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.EMPLOYEE_BASE);
            return response.data.employees as EmployeeBackend[];
        },
        enabled: type === "Sent to Employee"
    });

    const { data: interns } = useQuery({
        queryKey: ["internsSelection"],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.INTERN_BASE);
            return response.data.interns as InternBackend[];
        },
        enabled: type === "Sent to Intern"
    });

    useEffect(() => {
        if (type === "Sent to Employee") setRecipientModel("employee");
        else if (type === "Sent to Intern") setRecipientModel("intern");
        else {
            setRecipientModel("");
            setRecipientId("");
        }
    }, [type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!receipt) {
            toast({
                title: "Error",
                description: "Receipt photo is compulsory",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("date", date);
            formData.append("amount", amount);
            formData.append("description", description);
            formData.append("category", category);
            formData.append("type", type);
            formData.append("receipt", receipt);
            if (recipientId) formData.append("recipientId", recipientId);
            if (recipientModel) formData.append("recipientModel", recipientModel);

            // Directly call API because expenseService.addExpense expects JSON, but we need FormData
            await api.post(API_ENDPOINTS.EXPENSE_ADD, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast({ title: "Success", description: "Expense recorded successfully" });
            onSuccess();
            onOpenChange(false);
            resetForm();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to record expense",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setDate(new Date().toISOString());
        setAmount("");
        setDescription("");
        setCategory("");
        setType("");
        setRecipientId("");
        setRecipientModel("");
        setReceipt(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to record a company expense. A receipt photo is mandatory.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label>Date *</Label>
                        <DatePicker date={date} setDate={(d) => setDate(d || new Date().toISOString())} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (₹) *</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select value={category} onValueChange={setCategory} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select value={type} onValueChange={setType} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((t) => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {type === "Sent to Employee" && (
                        <div className="space-y-2">
                            <Label>Select Employee *</Label>
                            <Select value={recipientId} onValueChange={setRecipientId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees?.map((emp) => (
                                        <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {type === "Sent to Intern" && (
                        <div className="space-y-2">
                            <Label>Select Intern *</Label>
                            <Select value={recipientId} onValueChange={setRecipientId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose intern" />
                                </SelectTrigger>
                                <SelectContent>
                                    {interns?.map((int) => (
                                        <SelectItem key={int._id} value={int._id}>{int.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="receipt">Receipt Photo * (Compulsory)</Label>
                        <Input
                            id="receipt"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                            required
                        />
                        {receipt && (
                            <p className="text-sm text-green-600">Selected: {receipt.name}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Recording..." : "Add Expense"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddExpenseDialog;
