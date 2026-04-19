import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Eye, FileDown, MessageSquare } from "lucide-react";
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
  DialogFooter,
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
import { useQuotations, useCreateQuotation, useUpdateQuotation, useDeleteQuotation } from "@/hooks/useQuotations";
import { useLeads } from "@/hooks/useLeads";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/dateUtils";
import { generateQuotationPDF } from "@/utils/pdfGenerator";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const Quotations = () => {
  const [search, setSearch] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<any | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const leadId = searchParams.get("leadId");
    if (leadId) {
      setFormData(prev => ({ ...prev, leadId }));
      setIsCreateDialogOpen(true);
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    leadId: "",
    quotationNo: "",
    date: new Date().toISOString().split('T')[0],
    validUntil: "",
    items: [{ service: "", description: "", quantity: 1, price: 0, amount: 0 }],
    totalAmount: 0,
    status: "Draft",
    notes: "",
  });

  const { data: quotations = [], isLoading, error } = useQuotations();
  const { data: leads = [] } = useLeads();
  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();
  const deleteQuotation = useDeleteQuotation();
  const { toast } = useToast();

  const filteredQuotations = quotations.filter(
    (q: any) =>
      q.quotationNo?.toLowerCase().includes(search.toLowerCase()) ||
      q.leadId?.leadName?.toLowerCase().includes(search.toLowerCase())
  );

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "price") {
      newItems[index].amount = newItems[index].quantity * newItems[index].price;
    }
    const newTotal = calculateTotal(newItems);
    setFormData({ ...formData, items: newItems, totalAmount: newTotal });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { service: "", description: "", quantity: 1, price: 0, amount: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const newTotal = calculateTotal(newItems);
    setFormData({ ...formData, items: newItems, totalAmount: newTotal });
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQuotation.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Quotation created successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create quotation",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (q: any) => {
    setFormData({
      leadId: q.leadId?._id || "",
      quotationNo: q.quotationNo,
      date: q.date ? new Date(q.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validUntil: q.validUntil ? new Date(q.validUntil).toISOString().split('T')[0] : "",
      items: q.items || [],
      totalAmount: q.totalAmount,
      status: q.status || "Draft",
      notes: q.notes || "",
    });
    setSelectedQuotation(q);
    setIsEditDialogOpen(true);
  };

  const handleUpdateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuotation) return;
    try {
      await updateQuotation.mutateAsync({
        id: selectedQuotation._id,
        data: formData,
      });
      setIsEditDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Quotation updated successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update quotation",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuotation = async () => {
    if (!quotationToDelete) return;
    try {
      await deleteQuotation.mutateAsync(quotationToDelete._id);
      setQuotationToDelete(null);
      toast({ title: "Success", description: "Quotation deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete quotation",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      leadId: "",
      quotationNo: "",
      date: new Date().toISOString().split('T')[0],
      validUntil: "",
      items: [{ service: "", description: "", quantity: 1, price: 0, amount: 0 }],
      totalAmount: 0,
      status: "Draft",
      notes: "",
    });
    setSelectedQuotation(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft": return <Badge variant="secondary">Draft</Badge>;
      case "Sent": return <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Sent</Badge>;
      case "Accepted": return <Badge variant="outline" className="bg-green-500/10 text-green-500">Accepted</Badge>;
      case "Rejected": return <Badge variant="outline" className="bg-red-500/10 text-red-500">Rejected</Badge>;
      case "Expired": return <Badge variant="outline" className="bg-gray-500/10 text-gray-500">Expired</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Quotations" subtitle="Error loading quotations" />
        <div className="p-6">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            Failed to load quotations. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Quotations"
        subtitle={`${quotations.length} total quotations`}
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Quotation
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search quotations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quotations Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No quotations found</h3>
            <p className="text-sm text-muted-foreground mb-6">Start by creating your first quotation.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Quotation
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold py-4">Quotation #</TableHead>
                    <TableHead className="font-bold py-4">Lead</TableHead>
                    <TableHead className="font-bold py-4">Date</TableHead>
                    <TableHead className="font-bold py-4">Total Amount</TableHead>
                    <TableHead className="font-bold py-4">Status</TableHead>
                    <TableHead className="font-bold py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((q: any) => (
                    <TableRow key={q._id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium py-3.5 tracking-tight">
                        {q.quotationNo}
                      </TableCell>
                      <TableCell className="text-sm py-3.5">
                        {q.leadId?.leadName || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm py-3.5">
                        {formatDate(q.date)}
                      </TableCell>
                      <TableCell className="text-sm font-bold py-3.5 text-primary">
                        {formatCurrency(q.totalAmount)}
                      </TableCell>
                      <TableCell className="py-3.5">
                        {getStatusBadge(q.status)}
                      </TableCell>
                      <TableCell className="text-right py-3.5">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => generateQuotationPDF(q)} title="Download PDF">
                            <FileDown className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleEditClick(q)} title="Edit Quotation">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setQuotationToDelete(q)} title="Delete Quotation">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Create Quotation Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quotation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateQuotation} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead">Lead *</Label>
                <Select value={formData.leadId} onValueChange={(v) => setFormData({ ...formData, leadId: v })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead: any) => (
                      <SelectItem key={lead._id} value={lead._id}>{lead.leadName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quotationNo">Quotation Number</Label>
                <Input
                  id="quotationNo"
                  value={formData.quotationNo}
                  onChange={(e) => setFormData({ ...formData, quotationNo: e.target.value })}
                  placeholder="Auto-generated if empty"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <DatePicker
                  date={formData.date}
                  setDate={(v) => setFormData({ ...formData, date: v })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <DatePicker
                  date={formData.validUntil}
                  setDate={(v) => setFormData({ ...formData, validUntil: v })}
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label>Quotation Items *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
              </div>
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 border rounded-lg bg-muted/20">
                  <div className="col-span-4 space-y-1">
                    <Label className="text-[10px]">Service</Label>
                    <Input
                      placeholder="Service"
                      value={item.service}
                      onChange={(e) => handleItemChange(index, "service", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-[10px]">Price</Label>
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price || ""}
                      onChange={(e) => handleItemChange(index, "price", e.target.value === "" ? 0 : Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px]">Qty</Label>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity || ""}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value === "" ? 0 : Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1 text-right">
                    <Label className="text-[10px]">Amount</Label>
                    <div className="text-sm font-bold py-2">{formatCurrency(item.amount)}</div>
                  </div>
                  <div className="col-span-1 pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t pt-4">
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(formData.totalAmount)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional terms or info..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createQuotation.isPending}>
                {createQuotation.isPending ? "Creating..." : "Create Quotation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Quotation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quotation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateQuotation} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-lead">Lead *</Label>
                <Select value={formData.leadId} onValueChange={(v) => setFormData({ ...formData, leadId: v })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead: any) => (
                      <SelectItem key={lead._id} value={lead._id}>{lead.leadName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quotationNo">Quotation Number</Label>
                <Input
                  id="edit-quotationNo"
                  value={formData.quotationNo}
                  onChange={(e) => setFormData({ ...formData, quotationNo: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <DatePicker
                  date={formData.date}
                  setDate={(v) => setFormData({ ...formData, date: v })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-validUntil">Valid Until</Label>
                <DatePicker
                  date={formData.validUntil}
                  setDate={(v) => setFormData({ ...formData, validUntil: v })}
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label>Quotation Items *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
              </div>
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 border rounded-lg bg-muted/20">
                  <div className="col-span-4 space-y-1">
                    <Label className="text-[10px]">Service</Label>
                    <Input
                      placeholder="Service"
                      value={item.service}
                      onChange={(e) => handleItemChange(index, "service", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-[10px]">Price</Label>
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price || ""}
                      onChange={(e) => handleItemChange(index, "price", e.target.value === "" ? 0 : Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px]">Qty</Label>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity || ""}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value === "" ? 0 : Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1 text-right">
                    <Label className="text-[10px]">Amount</Label>
                    <div className="text-sm font-bold py-2">{formatCurrency(item.amount)}</div>
                  </div>
                  <div className="col-span-1 pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t pt-4">
              <div className="space-y-1">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(formData.totalAmount)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateQuotation.isPending}>
                {updateQuotation.isPending ? "Updating..." : "Update Quotation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!quotationToDelete} onOpenChange={() => setQuotationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete quotation <strong>{quotationToDelete?.quotationNo}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuotation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteQuotation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Quotations;
