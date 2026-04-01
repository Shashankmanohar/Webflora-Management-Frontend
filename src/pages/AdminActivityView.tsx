import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { employeeApi } from "@/services/api/employees";
import { internApi } from "@/services/api/additional";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ActivityLogSection from "@/components/ActivityLogSection";
import { User, Users, Briefcase } from "lucide-react";

const AdminActivityView = () => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: () => employeeApi.getAll()
    });

    const { data: interns = [] } = useQuery({
        queryKey: ['interns'],
        queryFn: () => internApi.getAll()
    });

    return (
        <div className="space-y-8">
            <PageHeader
                title="Activity Monitoring"
                subtitle="Review daily work logs from employees and interns."
            />

            <div className="px-6 space-y-6">
                {/* User Selector */}
                <Card className="glass-card border-border/50 rounded-[2.5rem]">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-primary" />
                            <CardTitle className="text-xl font-black tracking-tight">Select Staff Member</CardTitle>
                        </div>
                        <CardDescription>Choose an employee or intern to see their work activity calendar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Staff Member</label>
                                <Select onValueChange={setSelectedUser} value={selectedUser || undefined}>
                                    <SelectTrigger className="h-12 rounded-2xl border-border/50 bg-secondary/30 focus:ring-primary">
                                        <SelectValue placeholder="Select a person..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border/50 bg-background/95 backdrop-blur-xl">
                                        <div className="p-2 text-[10px] font-bold text-primary uppercase tracking-widest border-b border-border/50 mb-1 flex items-center">
                                            <Briefcase className="w-3 h-3 mr-1" /> Employees
                                        </div>
                                        {employees.map((emp: any) => (
                                            <SelectItem key={emp.id} value={emp.id} className="rounded-xl focus:bg-primary/10">
                                                {emp.name} ({emp.role})
                                            </SelectItem>
                                        ))}
                                        <div className="p-2 text-[10px] font-bold text-success uppercase tracking-widest border-b border-border/50 mt-4 mb-1 flex items-center">
                                            <User className="w-3 h-3 mr-1" /> Interns
                                        </div>
                                        {interns.map((int: any) => (
                                            <SelectItem key={int.id} value={int.id} className="rounded-xl focus:bg-success/10">
                                                {int.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Section */}
                {selectedUser ? (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">
                                Activity Log for: <span className="text-primary">
                                    {[...employees, ...interns].find(u => u.id === selectedUser)?.name}
                                </span>
                            </h3>
                        </div>
                        <ActivityLogSection isAdminView={true} targetUserId={selectedUser} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-20 text-center space-y-4 border-2 border-dashed border-border/30 rounded-[3rem] bg-secondary/5">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-secondary/20 flex items-center justify-center">
                            <Users className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-foreground">No Person Selected</h3>
                            <p className="text-muted-foreground max-w-[300px]">Please select an employee or intern from the list above to view their activity history.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminActivityView;
