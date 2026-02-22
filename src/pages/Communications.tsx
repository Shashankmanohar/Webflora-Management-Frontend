import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { useCommunications, useCreateCommunication, useReplyCommunication, useDeleteCommunication } from "@/hooks/useCommunications";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Communications = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [search, setSearch] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
    const [communicationToDelete, setCommunicationToDelete] = useState<any | null>(null);
    const [selectedCommunication, setSelectedCommunication] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });
    const [replyText, setReplyText] = useState("");

    const { data: communications = [], isLoading, error } = useCommunications();
    const createCommunication = useCreateCommunication();
    const replyCommunication = useReplyCommunication();
    const deleteCommunication = useDeleteCommunication();
    const { toast } = useToast();

    // Filter by ownership if not admin
    const ownedCommunications = isAdmin
        ? communications
        : communications.filter((comm: any) => comm.userId === user?.id);

    const filteredCommunications = ownedCommunications.filter(
        (comm: any) =>
            (comm.communicationTitle || comm.title)?.toLowerCase().includes(search.toLowerCase()) ||
            (comm.content || comm.description)?.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreateCommunication = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCommunication.mutateAsync(formData);
            setIsCreateDialogOpen(false);
            setFormData({ title: "", description: "" });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to submit communication",
                variant: "destructive",
            });
        }
    };

    const handleReplyClick = (comm: any) => {
        setSelectedCommunication(comm);
        setReplyText(comm.adminReply && comm.adminReply !== "No reply yet" ? comm.adminReply : "");
        setIsReplyDialogOpen(true);
    };

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCommunication) return;

        try {
            await replyCommunication.mutateAsync({
                id: selectedCommunication._id,
                reply: replyText,
                status: "resolved"
            });
            setIsReplyDialogOpen(false);
            setSelectedCommunication(null);
            setReplyText("");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to send reply",
                variant: "destructive",
            });
        }
    };

    const handleDeleteCommunication = async () => {
        if (!communicationToDelete) return;

        try {
            await deleteCommunication.mutateAsync(communicationToDelete._id);
            setCommunicationToDelete(null);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete communication",
                variant: "destructive",
            });
        }
    };

    if (error) {
        return (
            <div>
                <PageHeader title="Communications" subtitle="Error loading messages" />
                <div className="p-6">
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                        Failed to load communications. Please try again later.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Communications & Feedback"
                subtitle={`${ownedCommunications.length} total messages`}
                actions={
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {isAdmin ? "Post Announcement" : "Message Admin"}
                    </Button>
                }
            />

            <div className="p-6 space-y-6">
                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search communications..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Communications List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-40 rounded-xl" />
                        ))}
                    </div>
                ) : filteredCommunications.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            {search ? "No messages found" : "No communications yet"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {search ? "Try adjusting your search" : isAdmin ? "No communications from team yet" : "Submit your first message or feedback to admin"}
                        </p>
                        {!search && (
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                {isAdmin ? "Post Announcement" : "Message Admin"}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCommunications.map((comm: any) => (
                            <div
                                key={comm._id}
                                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-foreground">
                                                {comm.communicationTitle || comm.title}
                                            </h3>
                                            <StatusBadge status={(comm.adminReply && comm.adminReply !== "No reply yet") ? "resolved" : "pending"} />
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {comm.content || comm.description}
                                        </p>

                                        {comm.adminReply && comm.adminReply !== "No reply yet" && (
                                            <div className="mt-4 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                                                <p className="text-xs font-semibold text-primary mb-1">Admin Reply:</p>
                                                <p className="text-sm text-foreground">{comm.adminReply}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                                    {isAdmin && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleReplyClick(comm)}
                                            >
                                                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                                {(comm.adminReply && comm.adminReply !== "No reply yet") ? "Edit Reply" : "Reply"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setCommunicationToDelete(comm)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                            </Button>
                                        </>
                                    )}
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {new Date(comm.createdAt).toLocaleDateString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Communication Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Send Communication</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCommunication} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Subject *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Brief subject of your message"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Message *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter your message in detail..."
                                rows={6}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createCommunication.isPending}>
                                {createCommunication.isPending ? "Sending..." : "Send Message"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reply Dialog */}
            <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Reply to Communication</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReplySubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Message</Label>
                            <p className="text-sm font-medium">{selectedCommunication?.title}</p>
                            <p className="text-sm text-muted-foreground">{selectedCommunication?.description}</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reply">Your Reply *</Label>
                            <Textarea
                                id="reply"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Enter your reply..."
                                rows={5}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsReplyDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={replyCommunication.isPending}>
                                {replyCommunication.isPending ? "Sending..." : "Send Reply"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!communicationToDelete} onOpenChange={() => setCommunicationToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the communication <strong>{communicationToDelete?.title}</strong>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCommunication}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteCommunication.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Communications;
