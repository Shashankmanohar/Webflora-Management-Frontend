import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calendar } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNotices, useCreateNotice, useDeleteNotice } from "@/hooks/useNotices";
import { useEmployees } from "@/hooks/useEmployees";
import { useInterns } from "@/hooks/useInterns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const Notices = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [noticeToDelete, setNoticeToDelete] = useState<any | null>(null);
    const [formData, setFormData] = useState<{
        title: string;
        content: string;
        date: string;
        audienceType: 'all' | 'employee' | 'intern' | 'individual';
        targetId?: string;
        targetModel?: 'employee' | 'intern';
    }>({
        title: "",
        content: "",
        date: new Date().toISOString().split('T')[0],
        audienceType: 'all',
    });

    const { data: notices = [], isLoading, error } = useNotices();
    const { data: employees = [] } = useEmployees({ enabled: isAdmin });
    const { data: interns = [] } = useInterns({ enabled: isAdmin });
    const createNotice = useCreateNotice();
    const deleteNotice = useDeleteNotice();
    const { toast } = useToast();

    const handleCreateNotice = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createNotice.mutateAsync(formData);
            setIsCreateDialogOpen(false);
            setFormData({
                title: "",
                content: "",
                date: new Date().toISOString().split('T')[0],
                audienceType: 'all',
                targetId: undefined,
                targetModel: undefined,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create notice",
                variant: "destructive",
            });
        }
    };

    const handleDeleteNotice = async () => {
        if (!noticeToDelete) return;
        try {
            await deleteNotice.mutateAsync(noticeToDelete._id);
            setNoticeToDelete(null);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete notice",
                variant: "destructive",
            });
        }
    };

    if (error) {
        return (
            <div>
                <PageHeader title="Notices" subtitle="Error loading notices" />
                <div className="p-6">
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                        Failed to load notices. Please try again later.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Notices & Announcements"
                subtitle={`${notices.length} total notices`}
                actions={
                    isAdmin && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Notice
                        </Button>
                    )
                }
            />

            <div className="p-6 space-y-6">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                        ))}
                    </div>
                ) : notices.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-semibold text-foreground mb-2">No notices yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {isAdmin ? "Create your first notice to share announcements with your team" : "No announcements currently posted."}
                        </p>
                        {isAdmin && (
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Notice
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notices.map((notice: any) => (
                            <div
                                key={notice._id}
                                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-foreground mb-2">
                                            {notice.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {notice.content}
                                        </p>
                                    </div>
                                    {isAdmin && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setNoticeToDelete(notice)}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{new Date(notice.date || notice.createdAt).toLocaleDateString('en-IN')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Notice Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Notice</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateNotice} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter notice title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content *</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Enter notice content..."
                                rows={6}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        {isAdmin && (
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label>Send To</Label>
                                    <Select
                                        value={formData.audienceType}
                                        onValueChange={(value: any) => setFormData({
                                            ...formData,
                                            audienceType: value,
                                            targetId: undefined,
                                            targetModel: undefined
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select audience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Everyone</SelectItem>
                                            <SelectItem value="employee">All Employees</SelectItem>
                                            <SelectItem value="intern">All Interns</SelectItem>
                                            <SelectItem value="individual">Particular Employee or Intern</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.audienceType === 'individual' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <Label>Select Recipient</Label>
                                        <Select
                                            value={formData.targetId}
                                            onValueChange={(value) => {
                                                const emp = employees.find(e => e._id === value);
                                                const int = interns.find(i => i._id === value);
                                                setFormData({
                                                    ...formData,
                                                    targetId: value,
                                                    targetModel: emp ? 'employee' : 'intern'
                                                });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Search or select a person" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 mb-1 rounded-sm">Employees</div>
                                                {employees.map(emp => (
                                                    <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>
                                                ))}
                                                <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 my-1 rounded-sm">Interns</div>
                                                {interns.map(int => (
                                                    <SelectItem key={int._id} value={int._id}>{int.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createNotice.isPending}>
                                {createNotice.isPending ? "Creating..." : "Create Notice"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!noticeToDelete} onOpenChange={() => setNoticeToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the notice <strong>{noticeToDelete?.title}</strong>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteNotice}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteNotice.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Notices;
