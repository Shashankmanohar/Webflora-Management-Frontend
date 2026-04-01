import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { activityApi, Activity } from "@/services/api/activity";
import { handoverApi } from "@/services/api/handover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, CalendarIcon, History, Pencil, Trash2, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface ActivityLogSectionProps {
    isAdminView?: boolean;
    targetUserId?: string;
}

const ActivityLogSection = ({ isAdminView = false, targetUserId }: ActivityLogSectionProps) => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [content, setContent] = useState("");
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [fetching, setFetching] = useState(true);
    const { toast } = useToast();
    const { user: authUser } = useAuth();

    // Project selection state
    const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    const fetchProjects = async () => {
        try {
            const handovers = await handoverApi.getAll();
            // Project details are in handover.projectId
            const projects = handovers.map(h => ({
                id: h.projectId,
                name: h.projectName || "Unknown Project"
            }));
            setAssignedProjects(projects);
        } catch (error) {
            console.error("Failed to fetch assigned projects", error);
        }
    };

    const fetchActivities = async () => {
        try {
            setFetching(true);
            const data = await activityApi.getAll({ userId: targetUserId });
            setActivities(data);
        } catch (error) {
            console.error("Failed to fetch activities", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchActivities();
        if (!isAdminView) {
            fetchProjects();
        }
    }, [targetUserId]);

    const handleLogActivity = async () => {
        if (!date || !content.trim()) {
            toast({
                title: "Validation Error",
                description: "Please select a date and enter what you did.",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            await activityApi.log({
                date: format(date, "yyyy-MM-dd"),
                content,
                projectId: selectedProjectId || undefined
            });
            toast({
                title: "Success",
                description: "Activity logged successfully!"
            });
            setContent("");
            fetchActivities();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to log activity",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateActivity = async (id: string) => {
        if (!editContent.trim()) return;

        try {
            setLoading(true);
            await activityApi.update(id, { content: editContent });
            toast({
                title: "Updated",
                description: "Activity updated successfully!"
            });
            setIsEditing(false);
            fetchActivities();
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to update activity",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteActivity = async (id: string) => {
        if (!confirm("Are you sure you want to delete this activity log?")) return;

        try {
            setDeleteLoading(true);
            await activityApi.delete(id);
            toast({
                title: "Deleted",
                description: "Activity log removed."
            });
            fetchActivities();
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to delete activity",
                variant: "destructive"
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const selectedActivity = activities.find(a => a.date === (date ? format(date, "yyyy-MM-dd") : ""));

    // Highlight dates that have activities
    const activityDates = activities.map(a => new Date(a.date));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
            {/* Calendar View */}
            <Card className="lg:col-span-5 glass-card border-border/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        <CardTitle className="text-xl font-black tracking-tight">Work Calendar</CardTitle>
                    </div>
                    <CardDescription>Select a date to view or add activity</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-4 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border-none"
                            modifiers={{ hasActivity: activityDates }}
                            modifiersClassNames={{
                                hasActivity: "bg-success/15 text-success font-black border border-success/30 rounded-xl"
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Log / Detail View */}
            <Card className="lg:col-span-7 glass-card border-border/50 rounded-[2.5rem] relative overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <History className="w-5 h-5 text-primary" />
                            <CardTitle className="text-xl font-black tracking-tight">
                                {date ? format(date, "PPP") : "Select a Date"}
                            </CardTitle>
                        </div>
                        {selectedActivity && (
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-success/10 text-success px-2 py-0.5 rounded-full border border-success/20">
                                Logged
                            </span>
                        )}
                    </div>
                    <CardDescription>
                        {isAdminView ? "Reviewing work logs for this date" : "Record your progress for this specific date"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedActivity ? (
                            <motion.div
                                key="view"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <Textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="min-h-[150px] rounded-3xl resize-none focus-visible:ring-primary border-border/50"
                                        />
                                        <div className="flex space-x-3">
                                            <Button
                                                className="flex-1 h-12 rounded-2xl font-bold shadow-lg shadow-primary/20"
                                                onClick={() => handleUpdateActivity(selectedActivity._id)}
                                                disabled={loading}
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                                Save Changes
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-12 w-12 rounded-2xl border-border/50"
                                                onClick={() => setIsEditing(false)}
                                            >
                                                <X className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {(selectedActivity as any).projectId?.projectName && (
                                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                            {(selectedActivity as any).projectId.projectName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-secondary/50 border border-border/50 min-h-[150px]">
                                            <p className="text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                                                {selectedActivity.content}
                                            </p>
                                        </div>
                                        {!isAdminView && (
                                            <div className="flex space-x-3">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 h-12 rounded-2xl border-border/50 font-bold hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
                                                    onClick={() => {
                                                        setEditContent(selectedActivity.content);
                                                        setIsEditing(true);
                                                    }}
                                                >
                                                    <Pencil className="w-4 h-4 mr-2" />
                                                    Edit Activity
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="h-12 w-12 rounded-2xl border-border/50 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all"
                                                    onClick={() => handleDeleteActivity(selectedActivity._id)}
                                                    disabled={deleteLoading}
                                                >
                                                    {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        )}
                                        {!isAdminView && (
                                            <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                You have already logged work for this date.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ) : isAdminView ? (
                            <motion.div
                                key="none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center p-12 text-center space-y-3"
                            >
                                <p className="text-muted-foreground font-medium italic">No activity logged for this date.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Assign Project</label>
                                    <Select 
                                        value={selectedProjectId} 
                                        onValueChange={setSelectedProjectId}
                                    >
                                        <SelectTrigger className="w-full h-12 rounded-2xl border-border/50 bg-secondary/30 focus:ring-primary">
                                            <SelectValue placeholder="Select Assigned Project" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-border/50 bg-sidebar/95 backdrop-blur-xl">
                                            <SelectItem value="none" className="rounded-xl">General / Personal Work</SelectItem>
                                            {assignedProjects.map((p) => (
                                                <SelectItem key={p.id} value={p.id} className="rounded-xl">
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Textarea
                                    placeholder="What have you done today? Break down your tasks..."
                                    className="min-h-[150px] rounded-3xl resize-none focus-visible:ring-primary border-border/50"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                                <Button
                                    className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/20"
                                    onClick={handleLogActivity}
                                    disabled={loading || !date}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                    Log Today's Work
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
};

export default ActivityLogSection;
