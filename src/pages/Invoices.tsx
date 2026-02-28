import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Eye, FileDown, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { generateInvoicePDF } from "@/utils/pdfGenerator";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const Invoices = () => {
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsCreateDialogOpen(true);
      // Remove the param after opening to prevent re-opening on refresh
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("create");
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  const [formData, setFormData] = useState<{
    clientId: string;
    projectId: string;
    referenceNo: string;
    invoiceNo: string;
    amount: string;
    description: string;
    method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | '';
    date: string;
    status: 'pending' | 'paid' | 'overdue';
    previousDue: number;
  }>({
    clientId: "",
    projectId: "",
    referenceNo: "",
    invoiceNo: "",
    amount: "",
    description: "",
    method: "",
    date: new Date().toISOString().split('T')[0],
    status: "paid",
    previousDue: 0,
  });

  const { data: invoices = [], isLoading, error } = useInvoices();
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const { toast } = useToast();

  const filteredInvoices = invoices.filter(
    (inv: any) =>
      inv.number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.projectName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(formData.amount);

    // Frontend budget validation
    const project = projects.find((p: any) => p.id === formData.projectId);
    if (project && amountNum > (project.dueAmount || 0)) {
      toast({
        title: "Budget Exceeded",
        description: `This invoice amount exceeds the remaining project budget (₹${project.dueAmount}).`,
        variant: "destructive",
      });
      return;
    }

    try {
      await createInvoice.mutateAsync({
        clientId: formData.clientId,
        projectId: formData.projectId,
        referenceNo: formData.referenceNo,
        invoiceNo: formData.invoiceNo,
        amount: amountNum,
        description: formData.description,
        method: formData.method as any,
        date: formData.date,
        status: "paid",
        previousDue: formData.previousDue,
      });
      setIsCreateDialogOpen(false);
      setFormData({
        clientId: "",
        projectId: "",
        referenceNo: "",
        invoiceNo: "",
        amount: "",
        description: "",
        method: "",
        date: new Date().toISOString().split('T')[0],
        status: "paid",
        previousDue: 0,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create invoice",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (invoice: any) => {
    setFormData({
      clientId: invoice.clientId || "",
      projectId: invoice.projectId || "",
      referenceNo: invoice.referenceNo || "",
      invoiceNo: invoice.number || "",
      amount: invoice.amount?.toString() || "",
      description: invoice.description || "",
      method: invoice.method || "",
      date: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: "paid",
      previousDue: invoice.previousDue || 0,
    });
    setSelectedInvoice(invoice);
    setIsEditDialogOpen(true);
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    const amountNum = Number(formData.amount);

    const project = projects.find((p: any) => p.id === formData.projectId);
    if (project) {
      const originalAmount = Number(selectedInvoice.amount) || 0;
      const budgetAvailable = formData.projectId === selectedInvoice.projectId
        ? (project.dueAmount || 0) + originalAmount
        : (project.dueAmount || 0);

      if (amountNum > budgetAvailable) {
        toast({
          title: "Budget Exceeded",
          description: `This invoice amount exceeds the remaining project budget (₹${budgetAvailable}).`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      await updateInvoice.mutateAsync({
        id: selectedInvoice.id,
        data: {
          clientId: formData.clientId,
          projectId: formData.projectId,
          referenceNo: formData.referenceNo,
          invoiceNo: formData.invoiceNo,
          amount: amountNum,
          description: formData.description,
          method: formData.method as any,
          date: formData.date,
          status: "paid",
          previousDue: formData.previousDue,
        },
      });
      setIsEditDialogOpen(false);
      setSelectedInvoice(null);
      setFormData({
        clientId: "",
        projectId: "",
        referenceNo: "",
        invoiceNo: "",
        amount: "",
        description: "",
        method: "",
        date: new Date().toISOString().split('T')[0],
        status: "paid",
        previousDue: 0,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update invoice",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;

    try {
      await deleteInvoice.mutateAsync(invoiceToDelete.id);
      setInvoiceToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete invoice",
        variant: "destructive",
      });
    }
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Invoices" subtitle="Error loading invoices" />
        <div className="p-6">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            Failed to load invoices. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} total invoices`}
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {search ? "No invoices found" : "No invoices yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? "Try adjusting your search" : "Get started by creating your first invoice"}
            </p>
            {!search && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            )}
          </div>
        ) : (
          <div className="responsive-table-container custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Current Amt</TableHead>
                  <TableHead>Total Payable</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>{invoice.projectName}</TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">{formatCurrency(invoice.total)}</TableCell>
                    <TableCell className="font-bold text-primary">{formatCurrency(invoice.grandTotal)}</TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewInvoice(invoice)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => generateInvoicePDF(invoice)}
                          title="Download PDF"
                        >
                          <FileDown className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(invoice)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setInvoiceToDelete(invoice)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => {
                    const client = clients.find((c: any) => c.id === value);
                    setFormData({
                      ...formData,
                      clientId: value,
                      referenceNo: client?.referenceNo || "",
                      previousDue: client?.totalDue || 0
                    });
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{client.name}</span>
                          {client.totalDue > 0 && (
                            <span className="text-[10px] text-destructive ml-2 font-bold px-1.5 py-0.5 bg-destructive/5 rounded border border-destructive/10">
                              Due: {formatCurrency(client.totalDue)}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project *</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects
                      .filter((p: any) => p.clientId === formData.clientId || !formData.clientId)
                      .map((project: any) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formData.projectId && (
                  <p className="text-[10px] font-medium text-muted-foreground mt-1 px-1 flex justify-between">
                    <span>Remaining Budget:</span>
                    <span className="text-primary font-bold">
                      {formatCurrency(projects.find((p: any) => p.id === formData.projectId)?.dueAmount || 0)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="5000"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNo">Invoice Number</Label>
                  <Input
                    id="invoiceNo"
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                    placeholder="Auto-generated if empty"
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
              </div>

              {formData.clientId && formData.previousDue > 0 && (
                <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <History className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-destructive/60 uppercase tracking-tighter">Previous Outstanding Balance</p>
                      <p className="text-base font-bold text-destructive leading-tight">{formatCurrency(formData.previousDue)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground italic leading-tight">This will be added to the<br />Final Payable Amount</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select
                    value={formData.method}
                    onValueChange={(value: any) => setFormData({ ...formData, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referenceNo">Reference No</Label>
                  <Input
                    id="referenceNo"
                    value={formData.referenceNo}
                    onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Work details..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createInvoice.isPending}>
                {createInvoice.isPending ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateInvoice} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-client">Client *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => {
                    const client = clients.find((c: any) => c.id === value);
                    setFormData({
                      ...formData,
                      clientId: value,
                      referenceNo: client?.referenceNo || "",
                      previousDue: client?.totalDue || 0
                    });
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{client.name}</span>
                          {client.totalDue > 0 && (
                            <span className="text-[10px] text-destructive ml-2 font-bold px-1.5 py-0.5 bg-destructive/5 rounded border border-destructive/10">
                              Due: {formatCurrency(client.totalDue)}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-project">Project *</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects
                      .filter((p: any) => p.clientId === formData.clientId || !formData.clientId)
                      .map((project: any) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formData.projectId && (
                  <p className="text-[10px] font-medium text-muted-foreground mt-1 px-1 flex justify-between">
                    <span>Remaining Budget:</span>
                    <span className="text-primary font-bold">
                      {formatCurrency(
                        (projects.find((p: any) => p.id === formData.projectId)?.dueAmount || 0) +
                        (formData.projectId === selectedInvoice?.projectId ? Number(selectedInvoice.amount) : 0)
                      )}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-invoiceNo">Invoice Number</Label>
                <Input
                  id="edit-invoiceNo"
                  value={formData.invoiceNo}
                  onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            {formData.clientId && formData.previousDue > 0 && (
              <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-3 flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <History className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-destructive/60 uppercase tracking-tighter">Previous Outstanding Balance</p>
                    <p className="text-base font-bold text-destructive leading-tight">{formatCurrency(formData.previousDue)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground italic leading-tight">This will be added to the<br />Final Payable Amount</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount *</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-method">Payment Method *</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value: any) => setFormData({ ...formData, method: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
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
              <Button type="submit" disabled={updateInvoice.isPending}>
                {updateInvoice.isPending ? "Updating..." : "Update Invoice"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Invoice Details</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateInvoicePDF(selectedInvoice)}
                className="gap-2"
              >
                <FileDown className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Invoice Number</Label>
                  <p className="text-foreground font-medium mt-1">{selectedInvoice.number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <StatusBadge status={selectedInvoice.status} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Client</Label>
                  <p className="text-foreground font-medium mt-1">{selectedInvoice.clientName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Project</Label>
                  <p className="text-foreground font-medium mt-1">{selectedInvoice.projectName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="text-foreground mt-1">{new Date(selectedInvoice.date).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <p className="text-foreground mt-1">{selectedInvoice.method}</p>
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Current Amount:</span>
                  <span className="font-semibold">{formatCurrency(selectedInvoice.total)}</span>
                </div>
                {selectedInvoice.previousDue > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm text-destructive">
                      <span className="font-medium">Previous Balance:</span>
                      <span className="font-bold">+ {formatCurrency(selectedInvoice.previousDue)}</span>
                    </div>
                    {selectedInvoice.dueBreakdown && selectedInvoice.dueBreakdown.length > 0 && (
                      <div className="pl-4 border-l-2 border-destructive/20 space-y-1">
                        {selectedInvoice.dueBreakdown.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-[11px] text-destructive/80 italic">
                            <span>{item.projectName}:</span>
                            <span>{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="pt-2 border-t border-primary/20 flex justify-between items-center">
                  <span className="text-base font-bold text-primary">GRAND TOTAL:</span>
                  <span className="text-2xl font-black text-primary">{formatCurrency(selectedInvoice.grandTotal)}</span>
                </div>
              </div>
              {selectedInvoice.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-foreground mt-1">{selectedInvoice.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete invoice <strong>{invoiceToDelete?.number}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInvoice}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteInvoice.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Invoices;
