import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, History, Banknote, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import AttendanceHistoryDialog from "@/components/AttendanceHistoryDialog";
import SalaryPaymentDialog from "@/components/SalaryPaymentDialog";
import SalaryHistoryDialog from "@/components/SalaryHistoryDialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useInterns, useCreateIntern, useUpdateIntern, useDeleteIntern } from "@/hooks/useInterns";
import { useAllAttendance } from "@/hooks/useAttendance";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Interns = () => {
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("directory");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [internToDelete, setInternToDelete] = useState<any | null>(null);
    const [selectedIntern, setSelectedIntern] = useState<any | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Attendance History State
    const [attendanceInternId, setAttendanceInternId] = useState<string | null>(null);
    const [attendanceInternName, setAttendanceInternName] = useState<string>("");
    const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);

    // Salary Dialogs State
    const [isSalaryPaymentOpen, setIsSalaryPaymentOpen] = useState(false);
    const [isSalaryHistoryOpen, setIsSalaryHistoryOpen] = useState(false);
    const [salaryPayee, setSalaryPayee] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        duration: "",
        salary: "",
    });

    const { data: interns = [], isLoading, error } = useInterns();
    const { data: allAttendance = [], isLoading: attendanceLoading } = useAllAttendance();
    const createIntern = useCreateIntern();
    const updateIntern = useUpdateIntern();
    const deleteIntern = useDeleteIntern();
    const { toast } = useToast();

    const internAttendance = allAttendance.filter((a: any) => a.userModel === 'intern');

    const safeFormat = (dateStr: string, formatStr: string) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "Invalid Date";
            return format(date, formatStr);
        } catch (e) {
            return "Invalid Date";
        }
    };

    const filteredInterns = interns.filter(
        (intern: any) =>
            intern.name?.toLowerCase().includes(search.toLowerCase()) ||
            intern.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreateIntern = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createIntern.mutateAsync({
                ...formData,
                salary: Number(formData.salary)
            });
            setIsCreateDialogOpen(false);
            resetForm();
        } catch (error: any) {
            // Error managed by hook
        }
    };

    const handleEditClick = (intern: any) => {
        setFormData({
            name: intern.name,
            email: intern.email,
            password: "",
            phone: intern.phone,
            address: intern.address || "",
            duration: intern.duration,
            salary: intern.salary?.toString() || "",
        });
        setSelectedIntern(intern);
        setIsEditDialogOpen(true);
    };

    const handleAttendanceClick = (intern: any) => {
        setAttendanceInternId(intern._id || intern.id);
        setAttendanceInternName(intern.name);
        setIsAttendanceDialogOpen(true);
    };

    const handleSalaryPaymentClick = (intern: any) => {
        setSalaryPayee(intern);
        setIsSalaryPaymentOpen(true);
    };

    const handleSalaryHistoryClick = (intern: any) => {
        setSalaryPayee(intern);
        setIsSalaryHistoryOpen(true);
    };

    const handleUpdateIntern = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedIntern) return;

        try {
            const updateData: any = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                duration: formData.duration,
                salary: Number(formData.salary),
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            await updateIntern.mutateAsync({
                id: selectedIntern._id || selectedIntern.id,
                data: updateData,
            });
            setIsEditDialogOpen(false);
            resetForm();
        } catch (error: any) {
            // Error managed by hook
        }
    };

    const handleDeleteIntern = async () => {
        if (!internToDelete) return;

        try {
            await deleteIntern.mutateAsync(internToDelete._id || internToDelete.id);
            setInternToDelete(null);
        } catch (error: any) {
            // Error managed by hook
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            phone: "",
            address: "",
            duration: "",
            salary: "",
        });
        setSelectedIntern(null);
    };

    if (error) {
        return (
            <div>
                <PageHeader title="Interns" subtitle="Error loading interns" />
                <div className="p-6">
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                        Failed to load interns. Please try again later.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Interns"
                subtitle={`${interns.length} total interns`}
                actions={
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Intern
                    </Button>
                }
            />

            <div className="p-6 space-y-6">
                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search interns..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Tabs */}
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList>
                        <TabsTrigger value="directory">Directory</TabsTrigger>
                        <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="directory" className="mt-6">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="h-48 rounded-xl" />
                                ))}
                            </div>
                        ) : filteredInterns.length === 0 ? (
                            <div className="text-center py-12">
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    {search ? "No interns found" : "No interns yet"}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {search ? "Try adjusting your search" : "Get started by adding your first intern"}
                                </p>
                                {!search && (
                                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Intern
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredInterns.map((intern: any) => (
                                    <div
                                        key={intern._id || intern.id}
                                        className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground text-base mb-1">
                                                    {intern.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">Intern</p>
                                            </div>
                                            <StatusBadge status="active" />
                                        </div>

                                        <div className="space-y-2.5">
                                            <div className="text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2"><span>📧</span> <span className="truncate">{intern.email}</span></div>
                                                <div className="flex items-center gap-2"><span>📱</span> {intern.phone}</div>
                                            </div>

                                            <div className="pt-3 border-t border-border">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs text-muted-foreground">Duration</span>
                                                    <span className="text-sm font-semibold text-foreground">{intern.duration}</span>
                                                </div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs text-muted-foreground">Stipend</span>
                                                    <span className="text-sm font-semibold text-foreground">₹{intern.salary?.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground">Total Paid</span>
                                                    <span className="text-sm font-bold text-success">₹{intern.totalPaid?.toLocaleString('en-IN') || 0}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-3 border-t border-border">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => handleSalaryHistoryClick(intern)}
                                                    title="Payment History"
                                                >
                                                    <Banknote className="w-3.5 h-3.5 mr-1.5" />
                                                    History
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => handleSalaryPaymentClick(intern)}
                                                    title="Pay Stipend"
                                                >
                                                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                                                    Pay
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="px-2"
                                                    onClick={() => handleAttendanceClick(intern)}
                                                    title="Attendance History"
                                                >
                                                    <History className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="px-2"
                                                    onClick={() => handleEditClick(intern)}
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="px-2"
                                                    onClick={() => setInternToDelete(intern)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="attendance" className="mt-6">
                        <div className="rounded-[2rem] border border-border overflow-hidden glass-card">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="font-bold py-4">Date</TableHead>
                                        <TableHead className="font-bold py-4">Intern</TableHead>
                                        <TableHead className="font-bold py-4">Status</TableHead>
                                        <TableHead className="font-bold py-4">Check-In Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendanceLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-4 w-[200px]" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : internAttendance.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground font-medium">
                                                No attendance records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        internAttendance.map((record: any) => (
                                            <TableRow key={record._id || record.id} className="border-border/50 hover:bg-white/[0.02]">
                                                <TableCell className="font-medium whitespace-nowrap">
                                                    {safeFormat(record.date, "PPP")}
                                                </TableCell>
                                                <TableCell className="font-bold text-foreground">
                                                    {record.userName}
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
                                                <TableCell className="font-mono text-xs whitespace-nowrap">
                                                    {record.timeIn ? safeFormat(record.timeIn, "hh:mm a") : "—"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Create Intern Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsCreateDialogOpen(open); }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Intern</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateIntern} className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors h-5 w-5 flex items-center justify-center"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="9876543210" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="City, State" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration *</Label>
                                <Input id="duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="3 months" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salary">Monthly Stipend (₹) *</Label>
                                <Input id="salary" type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} placeholder="5000" required />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={createIntern.isPending}>{createIntern.isPending ? "Adding..." : "Add Intern"}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Intern Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsEditDialogOpen(open); }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Intern</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateIntern} className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Full Name *</Label>
                                <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email *</Label>
                                <Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-password">Password (leave blank)</Label>
                                <div className="relative">
                                    <Input
                                        id="edit-password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors h-5 w-5 flex items-center justify-center"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">Phone Number *</Label>
                                <Input id="edit-phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="9876543210" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Address *</Label>
                            <Input id="edit-address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="City, State" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-duration">Duration *</Label>
                                <Input id="edit-duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="3 months" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-salary">Monthly Stipend (₹) *</Label>
                                <Input id="edit-salary" type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} placeholder="5000" required />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={updateIntern.isPending}>{updateIntern.isPending ? "Updating..." : "Update Intern"}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!internToDelete} onOpenChange={() => setInternToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{internToDelete?.name}</strong> and all associated data.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteIntern}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteIntern.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AttendanceHistoryDialog
                isOpen={isAttendanceDialogOpen}
                onOpenChange={setIsAttendanceDialogOpen}
                userId={attendanceInternId || undefined}
                userName={attendanceInternName}
            />

            {salaryPayee && (
                <>
                    <SalaryPaymentDialog
                        isOpen={isSalaryPaymentOpen}
                        onOpenChange={setIsSalaryPaymentOpen}
                        payeeId={salaryPayee._id || salaryPayee.id}
                        payeeName={salaryPayee.name}
                        payeeModel="intern"
                        defaultAmount={salaryPayee.salary || 0}
                    />
                    <SalaryHistoryDialog
                        isOpen={isSalaryHistoryOpen}
                        onOpenChange={setIsSalaryHistoryOpen}
                        payeeId={salaryPayee._id || salaryPayee.id}
                        payeeName={salaryPayee.name}
                    />
                </>
            )}
        </div>
    );
};

export default Interns;
