import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Clock,
    Briefcase,
    CheckCircle2,
    CalendarDays,
    History
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import AttendanceHistoryDialog from "@/components/AttendanceHistoryDialog";
import { useAttendance, useMarkAttendance } from "@/hooks/useAttendance";

const InternDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: profile, isLoading: profileLoading } = useProfile();
    const { data: attendance = [], isLoading: attendanceLoading } = useAttendance();
    const markAttendance = useMarkAttendance();
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const isMarkedToday = attendance.some((record: any) => record.date?.split('T')[0] === today);

    const handleMarkAttendance = async () => {
        try {
            await markAttendance.mutateAsync({
                date: new Date().toISOString(),
                status: 'present',
                timeIn: new Date().toISOString()
            });
        } catch (error) {
            // Error managed by hook
        }
    };

    const presentDays = attendance.filter((r: any) => r.status === 'present').length;

    const isLoading = profileLoading || attendanceLoading;

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-96 rounded-[2.5rem]" />
                    <Skeleton className="h-96 rounded-[2.5rem]" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title={`Welcome back, ${profile?.name || user?.name || 'Intern'}`}
                subtitle="Track your progress and mark your attendance."
            />

            <div className="p-6 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Stipend"
                        value={`₹${profile?.salary?.toLocaleString('en-IN') || '0'}`}
                        change="Monthly"
                        changeType="neutral"
                        icon={Briefcase}
                        actions={
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-[10px] font-bold uppercase tracking-wider h-7 hover:bg-success/5 hover:text-success border border-success/10"
                                onClick={() => navigate("/salaries")}
                            >
                                <History className="w-3 h-3 mr-1.5" />
                                View History
                            </Button>
                        }
                    />
                    <StatCard
                        title="Attendance"
                        value={`${presentDays} Days`}
                        change="This month"
                        changeType="positive"
                        icon={Calendar}
                        iconColor="bg-success/10 border border-success/20 text-success"
                        actions={
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-[10px] font-bold uppercase tracking-wider h-7 hover:bg-success/5 hover:text-success border border-success/10"
                                onClick={() => setIsHistoryOpen(true)}
                            >
                                <History className="w-3 h-3 mr-1.5" />
                                View History
                            </Button>
                        }
                    />
                    <StatCard
                        title="Duration"
                        value={profile?.duration || "N/A"}
                        change="Internship term"
                        changeType="neutral"
                        icon={CalendarDays}
                    />
                    <StatCard
                        title="Today's Status"
                        value={isMarkedToday ? "Present" : "Not Marked"}
                        change={isMarkedToday ? "Check-in complete" : "Action required"}
                        changeType={isMarkedToday ? "positive" : "negative"}
                        icon={CheckCircle2}
                        iconColor={isMarkedToday ? "bg-success/10 border border-success/20 text-success" : "bg-destructive/10 border border-destructive/20 text-destructive"}
                    />
                </div>

                {/* Dashboard grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Attendance Action */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 rounded-[3rem] border border-border/50 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-500">
                                <Clock className="w-10 h-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black tracking-tight text-foreground">Mark Attendance</h3>
                                <p className="text-muted-foreground text-sm max-w-[200px] font-medium leading-relaxed">
                                    {isMarkedToday
                                        ? "You've already marked your attendance for today."
                                        : "Don't forget to mark your check-in for today's shift."}
                                </p>
                            </div>
                            <Button
                                size="lg"
                                className="w-full h-14 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
                                onClick={handleMarkAttendance}
                                disabled={isMarkedToday || markAttendance.isPending}
                            >
                                {isMarkedToday ? "Already Marked" : markAttendance.isPending ? "Marking..." : "Mark Present Now"}
                            </Button>
                        </div>
                    </motion.div>

                    {/* Quick Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 glass-card p-8 rounded-[3rem] border border-border/50"
                    >
                        <h3 className="text-xl font-black tracking-tight text-foreground mb-6">Internship Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</p>
                                    <p className="text-lg font-black text-foreground">{profile?.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</p>
                                    <p className="font-bold text-foreground">{profile?.email}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Role</p>
                                    <p className="font-bold text-foreground capitalize">Intern</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone</p>
                                    <p className="font-bold text-foreground">{profile?.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <AttendanceHistoryDialog
                isOpen={isHistoryOpen}
                onOpenChange={setIsHistoryOpen}
                isPersonal={true}
            />
        </div>
    );
};

export default InternDashboard;
