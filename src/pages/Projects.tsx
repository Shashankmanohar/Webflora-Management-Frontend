import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Search, Calendar, Users as UsersIcon, Trash2, Eye, Building2, History, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useProjects, useCreateProject, useDeleteProject, useUpdateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const Projects = () => {
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const [formData, setFormData] = useState({
    projectName: "",
    client: "",
    description: "",
    status: "New" as "New" | "In Progress" | "On Hold" | "Completed",
    totalAmount: "",
    startDate: "",
    endDate: "",
  });

  const { data: projects = [], isLoading } = useProjects();
  const { data: clients = [] } = useClients();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const filteredProjects = projects.filter(
    (p: any) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject.mutateAsync({
        ...formData,
        totalAmount: Number(formData.totalAmount),
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      await updateProject.mutateAsync({
        id: selectedProject.id,
        data: {
          ...formData,
          totalAmount: Number(formData.totalAmount),
        },
      });
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      resetForm();
    } catch (error) {
      // Error handled by hook
    }
  };

  const resetForm = () => {
    setFormData({
      projectName: "",
      client: "",
      description: "",
      status: "New",
      totalAmount: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "In Progress": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "On Hold": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "New": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} total projects`}
        actions={
          <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 h-9">
            <Plus className="w-4 h-4 mr-1.5" /> New Project
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-card border-border"
          />
        </div>

        {/* Project Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project: any, i: number) => (
              <Card key={project.id} className="overflow-hidden group hover:border-primary/50 transition-all duration-300 animate-fade-in relative shadow-sm" style={{ animationDelay: `${i * 50}ms` }}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`${getStatusColor(project.status)} font-medium`}>
                      {project.status}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleViewProject(project)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setSelectedProject(project);
                          setFormData({
                            projectName: project.name,
                            client: project.clientId || "",
                            description: project.description || "",
                            status: project.status,
                            totalAmount: project.budget.toString(),
                            startDate: project.startDate?.split('T')[0] || "",
                            endDate: project.deadline?.split('T')[0] || "",
                          });
                          setIsEditDialogOpen(true);
                        }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteProject.mutate(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors truncate">
                    {project.name}
                  </CardTitle>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Building2 className="w-3.5 h-3.5 mr-1.5" />
                    {project.client}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground uppercase tracking-wider">Progress</span>
                      <span className="text-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Amount</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5 mono">
                        {formatCurrency(project.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Deadline</p>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {project.deadline ? new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/5 p-2 rounded-lg">
                      <p className="text-[10px] text-primary/70 uppercase tracking-wider font-bold">Paid</p>
                      <p className="text-sm font-bold text-primary mt-0.5">
                        {formatCurrency(project.totalPaid || 0)}
                      </p>
                    </div>
                    <div className="bg-destructive/5 p-2 rounded-lg">
                      <p className="text-[10px] text-destructive/70 uppercase tracking-wider font-bold">Due</p>
                      <p className="text-sm font-bold text-destructive mt-0.5">
                        {formatCurrency(project.dueAmount || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="w-3 h-3 text-muted-foreground" />
                      <div className="flex -space-x-1.5">
                        {project.team?.length > 0 ? (
                          project.team.slice(0, 3).map((member: string, idx: number) => (
                            <div key={idx} className="w-6 h-6 rounded-full bg-accent/10 border-2 border-card flex items-center justify-center text-[9px] font-bold text-accent" title={member}>
                              {member.split(" ").map((n: string) => n[0]).join("")}
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">No team</span>
                        )}
                        {project.team?.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-accent/10 border-2 border-card flex items-center justify-center text-[9px] font-bold text-accent">
                            +{project.team.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="link" className="p-0 h-auto text-xs font-semibold text-primary" onClick={() => handleViewProject(project)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="E-commerce Platform"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={formData.client}
                  onValueChange={(value) => setFormData({ ...formData, client: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  placeholder="100000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Deadline</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Project details..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProject.isPending}>
                {createProject.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-projectName">Project Name *</Label>
              <Input
                id="edit-projectName"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-client">Client *</Label>
                <Select
                  value={formData.client}
                  onValueChange={(value) => setFormData({ ...formData, client: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-totalAmount">Total Amount *</Label>
                <Input
                  id="edit-totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">Deadline</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProject.isPending}>
                {updateProject.isPending ? "Updating..." : "Update Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Project Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedProject?.name}</DialogTitle>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              {selectedProject?.client}
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Total Budget</p>
                <p className="text-lg font-bold">{formatCurrency(selectedProject?.budget || 0)}</p>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <p className="text-[10px] text-primary/70 uppercase tracking-wider font-bold mb-1">Total Paid</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(selectedProject?.totalPaid || 0)}</p>
              </div>
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <p className="text-[10px] text-destructive/70 uppercase tracking-wider font-bold mb-1">Total Due</p>
                <p className="text-lg font-bold text-destructive">{formatCurrency(selectedProject?.dueAmount || 0)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <History className="w-4 h-4" />
                Transaction History
              </h3>

              {!selectedProject?.invoices || selectedProject.invoices.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-border border-2">
                  <p className="text-xs text-muted-foreground">No invoices recorded for this project.</p>
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden shadow-sm bg-background">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-[10px] uppercase font-bold">Invoice #</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold">Date</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold text-right">Amount</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProject.invoices.map((invoice: any) => (
                        <TableRow key={invoice.id} className="cursor-default">
                          <TableCell className="text-xs font-medium py-2.5">{invoice.number}</TableCell>
                          <TableCell className="text-xs py-2.5">{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                          <TableCell className="text-xs font-bold py-2.5 text-right">{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell className="py-2.5 text-center">
                            <StatusBadge status={invoice.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</h4>
                <p className="text-xs leading-relaxed text-foreground/80">{selectedProject?.description || "No description provided."}</p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Project Timeline</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Start Date</p>
                    <p className="text-xs font-semibold">{selectedProject?.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Deadline</p>
                    <p className="text-xs font-semibold">{selectedProject?.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
