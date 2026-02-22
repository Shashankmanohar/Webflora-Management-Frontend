import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useSalaryHistory } from "@/hooks/useSalary";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface SalaryHistoryDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    payeeId: string | null;
    payeeName: string;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value);

const SalaryHistoryDialog = ({
    isOpen,
    onOpenChange,
    payeeId,
    payeeName
}: SalaryHistoryDialogProps) => {
    const { data: history = [], isLoading } = useSalaryHistory(payeeId);

    const safeFormat = (dateStr: string, formatStr: string) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "Invalid Date";
            return format(date, formatStr);
        } catch (e) {
            return "Invalid Date";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Payment History - {payeeName}</DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No payment history found for this member.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((record) => (
                                        <TableRow key={record._id}>
                                            <TableCell className="whitespace-nowrap">
                                                {safeFormat(record.paymentDate, "dd MMM yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                {record.month} {record.year}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(record.amount)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                                                {record.remarks || "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SalaryHistoryDialog;
