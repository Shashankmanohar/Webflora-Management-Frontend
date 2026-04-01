import { useState, useEffect, useRef } from "react";
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
import { formatDate } from "@/utils/dateUtils";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, CalendarIcon, History, Pencil, Trash2, Save, X, Image as ImageIcon, Camera } from "lucide-react";
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
    
    // Image states
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [editImage, setEditImage] = useState<File | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, forEdit = false) => {
        const file = e.target.files?.[0];
        if (file) {
            if (forEdit) {
                setEditImage(file);
                setEditImagePreview(URL.createObjectURL(file));
            } else {
                setSelectedImage(file);
                setImagePreview(URL.createObjectURL(file));
            }
        }
    };

    const clearImage = (forEdit = false) => {
        if (forEdit) {
            setEditImage(null);
            setEditImagePreview(null);
            if (editFileInputRef.current) editFileInputRef.current.value = "";
        } else {
            setSelectedImage(null);
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

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
                projectId: selectedProjectId || undefined,
                image: selectedImage || undefined
            });
            toast({
                title: "Success",
                description: "Activity logged successfully!"
            });
            setContent("");
            clearImage();
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
            await activityApi.update(id, { 
                content: editContent,
                image: editImage || undefined 
            });
            toast({
                title: "Updated",
                description: "Activity updated successfully!"
            });
            setIsEditing(false);
            clearImage(true);
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
                                {date ? formatDate(date) : "Select a Date"}
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
                                        
                                        {/* Edit Image Upload */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Update Image (Optional)</label>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    ref={editFileInputRef}
                                                    onChange={(e) => handleImageChange(e, true)}
                                                />
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    className="h-12 rounded-2xl border-border/50 bg-secondary/30"
                                                    onClick={() => editFileInputRef.current?.click()}
                                                >
                                                    <Camera className="w-4 h-4 mr-2" />
                                                    Change Photo
                                                </Button>
                                                {editImagePreview && (
                                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/50">
                                                        <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                        <button 
                                                            onClick={() => clearImage(true)}
                                                            className="absolute top-0 right-0 bg-destructive text-white p-0.5 rounded-bl-lg"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

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
                                        
                                        {/* Activity Content */}
                                        <div className="p-6 rounded-3xl bg-secondary/50 border border-border/50 min-h-[100px]">
                                            <p className="text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                                                {selectedActivity.content}
                                            </p>
                                        </div>

                                        {/* Activity Image Display */}
                                        {selectedActivity.image && (
                                            <div className="mt-4 rounded-[2rem] overflow-hidden border border-border/50 bg-secondary/30 aspect-video relative group">
                                                <img 
                                                    src={selectedActivity.image} 
                                                    alt="Activity attachment" 
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <a 
                                                        href={selectedActivity.image} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl flex items-center space-x-2 font-bold"
                                                    >
                                                        <ImageIcon className="w-4 h-4" />
                                                        <span>View Full Size</span>
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {!isAdminView && (
                                            <div className="flex space-x-3">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 h-12 rounded-2xl border-border/50 font-bold hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
                                                    onClick={() => {
                                                        setEditContent(selectedActivity.content);
                                                        setEditImagePreview(selectedActivity.image || null);
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
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">What did you do?</label>
                                    <Textarea
                                        placeholder="What have you done today? Break down your tasks..."
                                        className="min-h-[150px] rounded-3xl resize-none focus-visible:ring-primary border-border/50"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                </div>

                                {/* Image Upload Field */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Attach Image (Optional)</label>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={(e) => handleImageChange(e)}
                                        />
                                        <Button
                                            variant="outline"
                                            type="button"
                                            className="h-14 rounded-2xl border-border/50 bg-secondary/30 flex-1 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <ImageIcon className="w-5 h-5 mr-2 text-primary" />
                                            <span>{selectedImage ? "Change Image" : "Upload Screenshot/Photo"}</span>
                                        </Button>
                                        
                                        {imagePreview && (
                                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg group">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <button 
                                                    onClick={() => clearImage()}
                                                    className="absolute inset-0 bg-destructive/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/20 text-base mt-2"
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
