import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, History, Banknote, Eye, EyeOff } from "lucide-react";
import AttendanceHistoryDialog from "@/components/AttendanceHistoryDialog";
import SalaryPaymentDialog from "@/components/SalaryPaymentDialog";
import SalaryHistoryDialog from "@/components/SalaryHistoryDialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from "@/hooks/useEmployees";
import { useAllAttendance } from "@/hooks/useAttendance";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const Employees = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("directory");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<any | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Attendance History State
  const [attendanceEmployeeId, setAttendanceEmployeeId] = useState<string | null>(null);
  const [attendanceEmployeeName, setAttendanceEmployeeName] = useState<string>("");
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);

  // Salary Dialogs State
  const [isSalaryPaymentOpen, setIsSalaryPaymentOpen] = useState(false);
  const [isSalaryHistoryOpen, setIsSalaryHistoryOpen] = useState(false);
  const [salaryPayee, setSalaryPayee] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    phone: "",
    address: "",
    salary: "",
  });

  const { data: employees = [], isLoading, error } = useEmployees();
  const { data: allAttendance = [], isLoading: attendanceLoading } = useAllAttendance();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const { toast } = useToast();

  const employeeAttendance = allAttendance.filter((a: any) => a.userModel === 'employee');

  const safeFormat = (dateStr: string, formatStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Invalid Date";
      return format(date, formatStr);
    } catch (e) {
      return "Invalid Date";
    }
  };

  const filteredEmployees = employees.filter(
    (e: any) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      (e.department && e.department.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmployee.mutateAsync({
        ...formData,
        salary: parseInt(formData.salary),
      });
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "employee",
        phone: "",
        address: "",
        salary: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create employee",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (employee: any) => {
    setFormData({
      name: employee.name,
      email: employee.email,
      password: "",
      role: employee.role,
      phone: employee.phone,
      address: employee.address,
      salary: employee.salary?.toString() || "",
    });
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleAttendanceClick = (employee: any) => {
    setAttendanceEmployeeId(employee.id || employee._id);
    setAttendanceEmployeeName(employee.name);
    setIsAttendanceDialogOpen(true);
  };

  const handleSalaryPaymentClick = (employee: any) => {
    setSalaryPayee(employee);
    setIsSalaryPaymentOpen(true);
  };

  const handleSalaryHistoryClick = (employee: any) => {
    setSalaryPayee(employee);
    setIsSalaryHistoryOpen(true);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        salary: parseInt(formData.salary),
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateEmployee.mutateAsync({
        id: selectedEmployee.id,
        data: updateData,
      });
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "employee",
        phone: "",
        address: "",
        salary: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update employee",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      await deleteEmployee.mutateAsync(employeeToDelete.id);
      setEmployeeToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Employees" subtitle="Error loading employees" />
        <div className="p-6">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            Failed to load employees. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} team members`}
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
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
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {search ? "No employees found" : "No employees yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search ? "Try adjusting your search" : "Get started by adding your first employee"}
                </p>
                {!search && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Employee
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployees.map((employee: any) => (
                  <div
                    key={employee.id}
                    className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-base mb-1">
                          {employee.name}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {employee.role}
                        </p>
                      </div>
                      <StatusBadge status={employee.status} />
                    </div>

                    <div className="space-y-2.5">
                      <div className="text-sm text-muted-foreground">
                        <span className="block">📧 {employee.email}</span>
                        <span className="block">📱 {employee.phone}</span>
                      </div>

                      <div className="pt-3 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Salary</span>
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(employee.salary || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">Total Paid</span>
                          <span className="text-sm font-bold text-success">
                            {formatCurrency(employee.totalPaid || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-border">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleSalaryHistoryClick(employee)}
                          title="Payment History"
                        >
                          <Banknote className="w-3.5 h-3.5 mr-1.5" />
                          History
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleSalaryPaymentClick(employee)}
                          title="Pay Salary"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          Pay
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="px-2"
                          onClick={() => handleAttendanceClick(employee)}
                          title="Attendance History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="px-2"
                          onClick={() => handleEditClick(employee)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="px-2"
                          onClick={() => setEmployeeToDelete(employee)}
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
                    <TableHead className="font-bold py-4">Employee</TableHead>
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
                  ) : employeeAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground font-medium">
                        No attendance records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    employeeAttendance.map((record: any) => (
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

          <TabsContent value="performance" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              Performance metrics coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Employee Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEmployee} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@webflora.com"
                required
              />
            </div>

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
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, State"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary *</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="50000"
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
              <Button type="submit" disabled={createEmployee.isPending}>
                {createEmployee.isPending ? "Creating..." : "Create Employee"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateEmployee} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@webflora.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
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
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Address *</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, State"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-salary">Salary *</Label>
              <Input
                id="edit-salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="50000"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateEmployee.isPending}>
                {updateEmployee.isPending ? "Updating..." : "Update Employee"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!employeeToDelete} onOpenChange={() => setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{employeeToDelete?.name}</strong> and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEmployee.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AttendanceHistoryDialog
        isOpen={isAttendanceDialogOpen}
        onOpenChange={setIsAttendanceDialogOpen}
        userId={attendanceEmployeeId || undefined}
        userName={attendanceEmployeeName}
      />

      {salaryPayee && (
        <>
          <SalaryPaymentDialog
            isOpen={isSalaryPaymentOpen}
            onOpenChange={setIsSalaryPaymentOpen}
            payeeId={salaryPayee.id || salaryPayee._id}
            payeeName={salaryPayee.name}
            payeeModel="employee"
            defaultAmount={salaryPayee.salary || 0}
          />
          <SalaryHistoryDialog
            isOpen={isSalaryHistoryOpen}
            onOpenChange={setIsSalaryHistoryOpen}
            payeeId={salaryPayee.id || salaryPayee._id}
            payeeName={salaryPayee.name}
          />
        </>
      )}
    </div>
  );
};

export default Employees;
