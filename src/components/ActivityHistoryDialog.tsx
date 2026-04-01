import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import ActivityLogSection from "./ActivityLogSection";
import { ScrollText } from "lucide-react";

interface ActivityHistoryDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    userId?: string;
    userName?: string;
}

const ActivityHistoryDialog = ({
    isOpen,
    onOpenChange,
    userId,
    userName,
}: ActivityHistoryDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto rounded-[3rem] border-border/50">
                <DialogHeader className="px-6 pt-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <ScrollText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">
                                Activity History: <span className="text-primary">{userName}</span>
                            </DialogTitle>
                            <p className="text-muted-foreground text-sm font-medium italic">Reviewing daily work logs and progress.</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 pb-6 mt-4">
                    {userId ? (
                        <ActivityLogSection isAdminView={true} targetUserId={userId} />
                    ) : (
                        <div className="text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed border-muted text-muted-foreground">
                            No user selected.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ActivityHistoryDialog;
