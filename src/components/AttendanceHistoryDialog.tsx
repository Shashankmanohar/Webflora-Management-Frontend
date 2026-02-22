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
import { Badge } from "@/components/ui/badge";
import { useAllAttendance, useAttendance } from "@/hooks/useAttendance";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface AttendanceHistoryDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    userId?: string;
    userName?: string;
    isPersonal?: boolean;
}

const AttendanceHistoryDialog = ({
    isOpen,
    onOpenChange,
    userId,
    userName,
    isPersonal = false
}: AttendanceHistoryDialogProps) => {
    // If isPersonal is true, use the useAttendance hook (current user)
    // Otherwise use useAllAttendance with the provided userId
    const personalAttendance = useAttendance({ enabled: isPersonal });
    const specificAttendance = useAllAttendance(userId, { enabled: !isPersonal && !!userId });

    const { data: attendance = [], isLoading } = isPersonal ? personalAttendance : specificAttendance;

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
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tight">
                        {isPersonal ? "Your Attendance History" : `Attendance History: ${userName}`}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : attendance.length === 0 ? (
                        <div className="text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed border-muted">
                            <p className="text-muted-foreground font-medium">No attendance records found.</p>
                        </div>
                    ) : (
                        <div className="rounded-[2rem] border border-border overflow-hidden glass-card">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="font-bold py-4">Date</TableHead>
                                        <TableHead className="font-bold py-4">Status</TableHead>
                                        <TableHead className="font-bold py-4">Check-In Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendance.map((record: any) => (
                                        <TableRow key={record._id || record.id} className="border-border/50 hover:bg-white/[0.02]">
                                            <TableCell className="font-medium">
                                                {safeFormat(record.date, "PPP")}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        record.status === "present"
                                                            ? "bg-success/20 text-success border-success/30 hover:bg-success/20 capitalize font-bold"
                                                            : "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/20 capitalize font-bold"
                                                    }
                                                >
                                                    {record.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {record.timeIn ? safeFormat(record.timeIn, "hh:mm a") : "—"}
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

export default AttendanceHistoryDialog;
