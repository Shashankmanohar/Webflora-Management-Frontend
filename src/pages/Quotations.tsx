import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Eye, FileDown, MessageSquare, X } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

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
    projectName: "",
    projectType: "Website Development",
    projectOverview: "",
    scopeOfWork: "",
    websitePages: [
      { page: "Home", included: true },
      { page: "About Us", included: true },
      { page: "Why Choose Us", included: true },
      { page: "Our Strength", included: true },
      { page: "Our Journey", included: true },
      { page: "Vision & Mission", included: true },
      { page: "Value", included: true },
      { page: "Promoters & Directors", included: true },
      { page: "Certification", included: true },
      { page: "Our Products", included: true },
      { page: "Quality & Nutrition", included: true },
      { page: "Quality Control Process", included: true },
      { page: "In House Laboratory", included: true },
      { page: "Raw Materials Standards", included: true },
      { page: "Scientific Formulation", included: true },
      { page: "Feed Safety Consistency", included: true },
      { page: "FAQs on FCR, Growth Nutrition", included: true },
      { page: "Manufacturing", included: true },
      { page: "Knowledge Centre", included: true },
      { page: "Dealer Support", included: true },
      { page: "Become a Dealer", included: true },
      { page: "Channel Partner Benefits", included: true },
      { page: "Farmer Support Program", included: true },
      { page: "Bulk Order Enquiry", included: true },
      { page: "Technical Guidance", included: true },
      { page: "Brochure", included: true },
      { page: "Our Gallery", included: true },
      { page: "Career", included: true },
      { page: "Enquiry", included: true },
      { page: "Contact Us", included: true },
      { page: "Product Mock Design", included: true }
    ],
    adminPanelFeatures: [
      { feature: "Dashboard", included: true },
      { feature: "Manage Enquiry", included: true },
      { feature: "Manage Gallery", included: true },
      { feature: "Manage Careers", included: true },
      { feature: "Manage Rates of Product", included: true },
      { feature: "Manage Notifications", included: true },
      { feature: "Logout", included: true }
    ],
    items: [{ service: "", description: "", quantity: 1, price: 0, amount: 0 }],
    totalAmount: 0,
    timeline: [
      { stage: "UI/UX Design", days: 5 },
      { stage: "Development", days: 10 },
      { stage: "Testing & Deployment", days: 3 }
    ],
    deliverables: [
      "Responsive Website",
      "Admin Dashboard Access",
      "Source Code Delivery",
      "Basic SEO Setup",
      "SSL Configuration",
      "Deployment Support",
      "1-Hour Training Session"
    ],
    paymentTerms: [
      "50% Advance mobilization deposit",
      "30% During development phase",
      "20% Before final source code hand-off"
    ],
    additionalServices: [
      { service: "Cloud Hosting & Server Setup", price: 3000 },
      { service: "Domain Registration (.com / .in)", price: 1000 },
      { service: "Annual Maintenance Contract (AMC)", price: 8000 }
    ],
    termsAndConditions: [
      "Source code will be handed over only after full settlement of payment.",
      "Development timeline will commence immediately after receipt of the advance payment.",
      "Up to three rounds of visual layout reviews are included. Additional updates are billable.",
      "Any scope modification or addition of features outside this list will be billed separately."
    ],
    status: "Draft",
    notes: "",
  });

  const isPureSeoProject = (() => {
    const current = formData.projectType ? formData.projectType.split(", ").filter(Boolean) : [];
    return current.includes("SEO & Marketing") && 
      !current.some(t => ["Website Development", "Mobile App Development", "ERP System", "Custom Software"].includes(t));
  })();

  const getFormChecklistHeaders = () => {
    const current = formData.projectType ? formData.projectType.split(", ").filter(Boolean) : [];
    if (current.includes("Mobile App Development")) {
      return { left: "Mobile App Screens Checklist", right: "Admin / API Features Checklist" };
    } else if (current.includes("ERP System")) {
      return { left: "ERP Modules Checklist", right: "System Control Features Checklist" };
    } else if (current.includes("UI/UX Design")) {
      return { left: "Design Screens & Wireframes", right: "UX Assets & Prototypes Checklist" };
    } else if (current.includes("Custom Software")) {
      return { left: "Custom Modules Checklist", right: "Admin Panel & Security Config" };
    }
    return { left: "Website Pages Checklist", right: "Admin Panel Features Checklist" };
  };

  const formHeaders = getFormChecklistHeaders();

  const adjustDefaultsForProjectType = (typesArray: string[]) => {
    if (typesArray.includes("Mobile App Development")) {
      return {
        scopeOfWork: "• Native / Cross-Platform Mobile Application Development (iOS & Android).\n• Elegant Splash Screen & User Onboarding Flows.\n• Secure Mobile Authentication & User Profile Management.\n• Real-Time Push Notification Engine Integration.\n• Secure In-App Payment Gateway Integration.\n• Offline Data Synchronization Capabilities.",
        timeline: [
          { stage: "UI/UX App Wireframing", days: 7 },
          { stage: "API & Backend Construction", days: 10 },
          { stage: "Cross-Platform Mobile Coding", days: 15 },
          { stage: "App Store & Play Store Release", days: 6 }
        ],
        deliverables: [
          "iOS App Bundle (IPA File/TestFlight Release)",
          "Android App Package (APK/AAB Store Bundle)",
          "Server API Source Code & Schema Setup",
          "Admin Dashboard Panel Access",
          "App Store Submission Support & Guidelines"
        ],
        websitePages: [
          { page: "Splash Onboarding", included: true },
          { page: "Sign In / Sign Up Screen", included: true },
          { page: "User Profile View", included: true },
          { page: "Core Home Dashboard", included: true },
          { page: "Product details Screen", included: true },
          { page: "Advanced Search & Filter", included: true },
          { page: "Shopping Cart Module", included: true },
          { page: "Payment Checkout View", included: true },
          { page: "App Settings & Push Toggle", included: true },
          { page: "Help & Technical Feedback", included: true }
        ],
        adminPanelFeatures: [
          { feature: "Dashboard Overview", included: true },
          { feature: "Manage Registered Users", included: true },
          { feature: "Push Notification Scheduler", included: true },
          { feature: "Transaction & Payment Logs", included: true },
          { feature: "Enquiry & Support Tickets", included: true },
          { feature: "Logout session", included: true }
        ]
      };
    } else if (typesArray.includes("ERP System")) {
      return {
        scopeOfWork: "• Fully integrated custom ERP system for internal corporate workflows.\n• Modular business processes automation.\n• Symmetrical database schema for high transactional integrity.\n• Role-based Access Control (RBAC) setup.\n• Real-time automated reporting tools.",
        timeline: [
          { stage: "Requirement Mapping & Architecture Design", days: 10 },
          { stage: "Database Model & Core System Coding", days: 15 },
          { stage: "Custom Modules Implementation", days: 20 },
          { stage: "Integration Testing & Staff Training", days: 8 }
        ],
        deliverables: [
          "Secure Private Cloud ERP Deployment",
          "Modular ERP Source Code Transfer",
          "Custom Database Structure Schemas",
          "ERP Operations Training Manual",
          "3-Month Free Support SLA Agreement"
        ],
        websitePages: [
          { page: "ERP Central Dashboard", included: true },
          { page: "HR & Employee Portal", included: true },
          { page: "Inventory & Warehouse Stock", included: true },
          { page: "Sales & Client CRM Module", included: true },
          { page: "Purchase & Vendor Manager", included: true },
          { page: "Finance Ledger Accounts", included: true },
          { page: "Reports & Analytics Wizard", included: true },
          { page: "Access Control Settings", included: true }
        ],
        adminPanelFeatures: [
          { feature: "System Configurations", included: true },
          { feature: "Audit logs & Activity Monitor", included: true },
          { feature: "User Role Controller (RBAC)", included: true },
          { feature: "Automated Backup Scheduler", included: true },
          { feature: "API Access Keys Console", included: true },
          { feature: "Logout Session", included: true }
        ]
      };
    } else if (typesArray.includes("Custom Software")) {
      return {
        scopeOfWork: "• Bespoke custom software solution tailored to specific client technical requirements.\n• Advanced custom database configuration.\n• High-security data transmission layers.\n• Interactive dashboards and query interfaces.",
        timeline: [
          { stage: "System Modeling & DB Design", days: 7 },
          { stage: "Custom Backend Engine Dev", days: 18 },
          { stage: "UI Dashboard Integration", days: 12 },
          { stage: "User Acceptance Testing (UAT)", days: 5 }
        ],
        deliverables: [
          "Custom Software Executables / Web URL",
          "Complete Repository Source Code",
          "Technical & API Reference Documentation",
          "Automated DB Backups Routine Setup",
          "System Administration Training"
        ],
        websitePages: [
          { page: "Main Operations Portal", included: true },
          { page: "User Management Module", included: true },
          { page: "Interactive Data Grid Views", included: true },
          { page: "Digital Document Repository", included: true },
          { page: "Billing & Transaction Controller", included: true },
          { page: "Bespoke Report Customizer", included: true },
          { page: "Global Alerts Panel", included: true },
          { page: "Account Settings Panel", included: true }
        ],
        adminPanelFeatures: [
          { feature: "Global Software Settings", included: true },
          { feature: "Access Control Console (RBAC)", included: true },
          { feature: "Custom Query Executor", included: true },
          { feature: "System Integrity Logs", included: true },
          { feature: "Logout Session", included: true }
        ]
      };
    } else if (typesArray.includes("UI/UX Design")) {
      return {
        scopeOfWork: "• Professional UI/UX wireframing and pixel-perfect high-fidelity interface design.\n• Symmetrical branding and style guide creation.\n• Interactive prototype development in Figma.",
        timeline: [
          { stage: "Research & Brand Discovery", days: 4 },
          { stage: "Low-Fidelity Wireframes", days: 6 },
          { stage: "High-Fidelity Mockups Development", days: 8 },
          { stage: "Figma Prototyping & Design Revisions", days: 4 }
        ],
        deliverables: [
          "Figma Source File (Link & Access)",
          "High-Resolution Visual Page Exports",
          "Developer Specifications Hand-Off Document",
          "Custom System UI Style Guide",
          "Interactive Figma Prototype Link"
        ],
        websitePages: [
          { page: "Moodboards & Typography Scales", included: true },
          { page: "Low-fidelity wireframe flows", included: true },
          { page: "High-fidelity UI Screens Mockup", included: true },
          { page: "Design System Elements UI", included: true },
          { page: "Interactive Screen Prototypes", included: true },
          { page: "Custom Vector Logo & Brand Assets", included: true }
        ],
        adminPanelFeatures: []
      };
    } else if (typesArray.includes("SEO & Marketing")) {
      return {
        scopeOfWork: "• Comprehensive Technical SEO audit and competitor analysis.\n• Keyword research, mapping, and core keyword strategy.\n• On-page optimization including meta tags, title tags, heading structure, and image alt text.\n• Core Web Vitals audit and page speed recommendation implementation.\n• Google Analytics 4 and Google Search Console integration and dashboard setup.\n• Monthly rank tracking and traffic growth reports.",
        timeline: [
          { stage: "Audit & Keyword Research", days: 7 },
          { stage: "On-Page Optimization", days: 15 },
          { stage: "Technical & Core Web Vitals Fixes", days: 10 },
          { stage: "Analytics Integration & Schema Markup", days: 5 }
        ],
        deliverables: [
          "SEO Technical Audit Document",
          "Keyword Research & Target Strategy Map",
          "GA4 & Search Console Account Integration",
          "On-page Schema Markup Implementation",
          "First Month Optimization & Rank Report"
        ],
        websitePages: [],
        adminPanelFeatures: []
      };
    } else {
      return {
        scopeOfWork: "",
        timeline: [
          { stage: "UI/UX Design", days: 5 },
          { stage: "Development", days: 10 },
          { stage: "Testing & Deployment", days: 3 }
        ],
        deliverables: [
          "Responsive Website",
          "Admin Dashboard Access",
          "Source Code Delivery",
          "Basic SEO Setup",
          "SSL Configuration",
          "Deployment Support",
          "1-Hour Training Session"
        ],
        websitePages: [
          { page: "Home", included: true },
          { page: "About Us", included: true },
          { page: "Why Choose Us", included: true },
          { page: "Our Strength", included: true },
          { page: "Our Journey", included: true },
          { page: "Vision & Mission", included: true },
          { page: "Value", included: true },
          { page: "Promoters & Directors", included: true },
          { page: "Certification", included: true },
          { page: "Our Products", included: true },
          { page: "Quality & Nutrition", included: true },
          { page: "Quality Control Process", included: true },
          { page: "In House Laboratory", included: true },
          { page: "Raw Materials Standards", included: true },
          { page: "Scientific Formulation", included: true },
          { page: "Feed Safety Consistency", included: true },
          { page: "FAQs on FCR, Growth Nutrition", included: true },
          { page: "Manufacturing", included: true },
          { page: "Knowledge Centre", included: true },
          { page: "Dealer Support", included: true },
          { page: "Become a Dealer", included: true },
          { page: "Channel Partner Benefits", included: true },
          { page: "Farmer Support Program", included: true },
          { page: "Bulk Order Enquiry", included: true },
          { page: "Technical Guidance", included: true },
          { page: "Brochure", included: true },
          { page: "Our Gallery", included: true },
          { page: "Career", included: true },
          { page: "Enquiry", included: true },
          { page: "Contact Us", included: true },
          { page: "Product Mock Design", included: true }
        ],
        adminPanelFeatures: [
          { feature: "Dashboard", included: true },
          { feature: "Manage Enquiry", included: true },
          { feature: "Manage Gallery", included: true },
          { feature: "Manage Careers", included: true },
          { feature: "Manage Rates of Product", included: true },
          { feature: "Manage Notifications", included: true },
          { feature: "Logout", included: true }
        ]
      };
    }
  };

  const { data: quotations = [], isLoading, error } = useQuotations();
  const { data: leads = [] } = useLeads();
  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();
  const deleteQuotation = useDeleteQuotation();
  const { toast } = useToast();

  // Dynamic lists helper states
  const [newPageName, setNewPageName] = useState("");
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newDeliverable, setNewDeliverable] = useState("");
  const [newPaymentTerm, setNewPaymentTerm] = useState("");
  const [newTC, setNewTC] = useState("");
  const [newStageName, setNewStageName] = useState("");
  const [newStageDays, setNewStageDays] = useState(5);
  const [newAddServiceName, setNewAddServiceName] = useState("");
  const [newAddServicePrice, setNewAddServicePrice] = useState(0);

  // Helper handlers to modify dynamic arrays in formData
  const addWebsitePage = () => {
    if (!newPageName.trim()) return;
    setFormData(prev => ({
      ...prev,
      websitePages: [...prev.websitePages, { page: newPageName.trim(), included: true }]
    }));
    setNewPageName("");
  };

  const removeWebsitePage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      websitePages: prev.websitePages.filter((_, i) => i !== index)
    }));
  };

  const toggleWebsitePage = (index: number) => {
    setFormData(prev => {
      const pages = [...prev.websitePages];
      pages[index] = { ...pages[index], included: !pages[index].included };
      return { ...prev, websitePages: pages };
    });
  };

  const addAdminFeature = () => {
    if (!newFeatureName.trim()) return;
    setFormData(prev => ({
      ...prev,
      adminPanelFeatures: [...prev.adminPanelFeatures, { feature: newFeatureName.trim(), included: true }]
    }));
    setNewFeatureName("");
  };

  const removeAdminFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      adminPanelFeatures: prev.adminPanelFeatures.filter((_, i) => i !== index)
    }));
  };

  const toggleAdminFeature = (index: number) => {
    setFormData(prev => {
      const feats = [...prev.adminPanelFeatures];
      feats[index] = { ...feats[index], included: !feats[index].included };
      return { ...prev, adminPanelFeatures: feats };
    });
  };

  const addDeliverable = () => {
    if (!newDeliverable.trim()) return;
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, newDeliverable.trim()]
    }));
    setNewDeliverable("");
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const addPaymentTerm = () => {
    if (!newPaymentTerm.trim()) return;
    setFormData(prev => ({
      ...prev,
      paymentTerms: [...prev.paymentTerms, newPaymentTerm.trim()]
    }));
    setNewPaymentTerm("");
  };

  const removePaymentTerm = (index: number) => {
    setFormData(prev => ({
      ...prev,
      paymentTerms: prev.paymentTerms.filter((_, i) => i !== index)
    }));
  };

  const addTC = () => {
    if (!newTC.trim()) return;
    setFormData(prev => ({
      ...prev,
      termsAndConditions: [...prev.termsAndConditions, newTC.trim()]
    }));
    setNewTC("");
  };

  const removeTC = (index: number) => {
    setFormData(prev => ({
      ...prev,
      termsAndConditions: prev.termsAndConditions.filter((_, i) => i !== index)
    }));
  };

  const addTimelineStage = () => {
    if (!newStageName.trim()) return;
    setFormData(prev => ({
      ...prev,
      timeline: [...prev.timeline, { stage: newStageName.trim(), days: Number(newStageDays) || 0 }]
    }));
    setNewStageName("");
    setNewStageDays(5);
  };

  const removeTimelineStage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      timeline: prev.timeline.filter((_, i) => i !== index)
    }));
  };

  const checkIsMonthly = (item: any) => {
    if (typeof item?.isMonthly === "boolean") return item.isMonthly;
    return /monthly|\/mo|\/month/i.test(item?.service || "");
  };

  const toggleItemMonthly = (index: number) => {
    const newItems = [...formData.items];
    const currentMonthly = checkIsMonthly(newItems[index]);
    newItems[index] = {
      ...newItems[index],
      isMonthly: !currentMonthly
    };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const toggleAdditionalServiceMonthly = (index: number) => {
    const newAdd = [...formData.additionalServices];
    const currentMonthly = checkIsMonthly(newAdd[index]);
    newAdd[index] = {
      ...newAdd[index],
      isMonthly: !currentMonthly
    };
    setFormData(prev => ({ ...prev, additionalServices: newAdd }));
  };

  const addAdditionalService = (isMonthly = false) => {
    if (!newAddServiceName.trim() && !newAddServicePrice) return;
    const name = newAddServiceName.trim() || (isMonthly ? "Monthly Maintenance Charge" : "Additional Service");
    setFormData(prev => ({
      ...prev,
      additionalServices: [...prev.additionalServices, { service: name, price: Number(newAddServicePrice) || 0, isMonthly }]
    }));
    setNewAddServiceName("");
    setNewAddServicePrice(0);
  };

  const addMonthlyCharge = () => {
    addAdditionalService(true);
  };

  const removeAdditionalService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.filter((_, i) => i !== index)
    }));
  };

  const filteredQuotations = quotations.filter(
    (q: any) =>
      q.quotationNo?.toLowerCase().includes(search.toLowerCase()) ||
      q.projectName?.toLowerCase().includes(search.toLowerCase()) ||
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
      items: [...formData.items, { service: "", description: "", quantity: 1, price: 0, amount: 0, isMonthly: false }]
    });
  };

  const addMonthlyItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { service: "Services Charge", description: "", quantity: 1, price: 0, amount: 0, isMonthly: true }]
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
      quotationNo: q.quotationNo || "",
      date: q.date ? new Date(q.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validUntil: q.validUntil ? new Date(q.validUntil).toISOString().split('T')[0] : "",
      projectName: q.projectName || "",
      projectType: q.projectType || "Website Development",
      projectOverview: q.projectOverview || "",
      scopeOfWork: q.scopeOfWork || "",
      websitePages: q.websitePages?.length ? q.websitePages : [
        { page: "Home", included: true },
        { page: "About Us", included: true },
        { page: "Why Choose Us", included: true },
        { page: "Our Strength", included: true },
        { page: "Our Journey", included: true },
        { page: "Vision & Mission", included: true },
        { page: "Value", included: true },
        { page: "Promoters & Directors", included: true },
        { page: "Certification", included: true },
        { page: "Our Products", included: true },
        { page: "Quality & Nutrition", included: true },
        { page: "Quality Control Process", included: true },
        { page: "In House Laboratory", included: true },
        { page: "Raw Materials Standards", included: true },
        { page: "Scientific Formulation", included: true },
        { page: "Feed Safety Consistency", included: true },
        { page: "FAQs on FCR, Growth Nutrition", included: true },
        { page: "Manufacturing", included: true },
        { page: "Knowledge Centre", included: true },
        { page: "Dealer Support", included: true },
        { page: "Become a Dealer", included: true },
        { page: "Channel Partner Benefits", included: true },
        { page: "Farmer Support Program", included: true },
        { page: "Bulk Order Enquiry", included: true },
        { page: "Technical Guidance", included: true },
        { page: "Brochure", included: true },
        { page: "Our Gallery", included: true },
        { page: "Career", included: true },
        { page: "Enquiry", included: true },
        { page: "Contact Us", included: true },
        { page: "Product Mock Design", included: true }
      ],
      adminPanelFeatures: q.adminPanelFeatures?.length ? q.adminPanelFeatures : [
        { feature: "Dashboard", included: true },
        { feature: "Manage Enquiry", included: true },
        { feature: "Manage Gallery", included: true },
        { feature: "Manage Careers", included: true },
        { feature: "Manage Rates of Product", included: true },
        { feature: "Manage Notifications", included: true },
        { feature: "Logout", included: true }
      ],
      items: q.items?.length ? q.items : [{ service: "", description: "", quantity: 1, price: 0, amount: 0 }],
      totalAmount: q.totalAmount || 0,
      timeline: q.timeline?.length ? q.timeline : [
        { stage: "UI/UX Design", days: 5 },
        { stage: "Development", days: 10 },
        { stage: "Testing & Deployment", days: 3 }
      ],
      deliverables: q.deliverables?.length ? q.deliverables : [
        "Responsive Website",
        "Admin Dashboard Access",
        "Source Code Delivery",
        "Basic SEO Setup",
        "SSL Configuration",
        "Deployment Support",
        "1-Hour Training Session"
      ],
      paymentTerms: q.paymentTerms?.length ? q.paymentTerms : [
        "50% Advance mobilization deposit",
        "30% During development phase",
        "20% Before final source code hand-off"
      ],
      additionalServices: q.additionalServices?.length ? q.additionalServices : [
        { service: "Cloud Hosting & Server Setup", price: 3000 },
        { service: "Domain Registration (.com / .in)", price: 1000 },
        { service: "Annual Maintenance Contract (AMC)", price: 8000 }
      ],
      termsAndConditions: q.termsAndConditions?.length ? q.termsAndConditions : [
        "Source code will be handed over only after full settlement of payment.",
        "Development timeline will commence immediately after receipt of the advance payment.",
        "Up to three rounds of visual layout reviews are included. Additional updates are billable.",
        "Any scope modification or addition of features outside this list will be billed separately."
      ],
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
      projectName: "",
      projectType: "Website Development",
      projectOverview: "",
      scopeOfWork: "",
      websitePages: [
        { page: "Home", included: true },
        { page: "About Us", included: true },
        { page: "Why Choose Us", included: true },
        { page: "Our Strength", included: true },
        { page: "Our Journey", included: true },
        { page: "Vision & Mission", included: true },
        { page: "Value", included: true },
        { page: "Promoters & Directors", included: true },
        { page: "Certification", included: true },
        { page: "Our Products", included: true },
        { page: "Quality & Nutrition", included: true },
        { page: "Quality Control Process", included: true },
        { page: "In House Laboratory", included: true },
        { page: "Raw Materials Standards", included: true },
        { page: "Scientific Formulation", included: true },
        { page: "Feed Safety Consistency", included: true },
        { page: "FAQs on FCR, Growth Nutrition", included: true },
        { page: "Manufacturing", included: true },
        { page: "Knowledge Centre", included: true },
        { page: "Dealer Support", included: true },
        { page: "Become a Dealer", included: true },
        { page: "Channel Partner Benefits", included: true },
        { page: "Farmer Support Program", included: true },
        { page: "Bulk Order Enquiry", included: true },
        { page: "Technical Guidance", included: true },
        { page: "Brochure", included: true },
        { page: "Our Gallery", included: true },
        { page: "Career", included: true },
        { page: "Enquiry", included: true },
        { page: "Contact Us", included: true },
        { page: "Product Mock Design", included: true }
      ],
      adminPanelFeatures: [
        { feature: "Dashboard", included: true },
        { feature: "Manage Enquiry", included: true },
        { feature: "Manage Gallery", included: true },
        { feature: "Manage Careers", included: true },
        { feature: "Manage Rates of Product", included: true },
        { feature: "Manage Notifications", included: true },
        { feature: "Logout", included: true }
      ],
      items: [{ service: "", description: "", quantity: 1, price: 0, amount: 0 }],
      totalAmount: 0,
      timeline: [
        { stage: "UI/UX Design", days: 5 },
        { stage: "Development", days: 10 },
        { stage: "Testing & Deployment", days: 3 }
      ],
      deliverables: [
        "Responsive Website",
        "Admin Dashboard Access",
        "Source Code Delivery",
        "Basic SEO Setup",
        "SSL Configuration",
        "Deployment Support",
        "1-Hour Training Session"
      ],
      paymentTerms: [
        "50% Advance mobilization deposit",
        "30% During development phase",
        "20% Before final source code hand-off"
      ],
      additionalServices: [
        { service: "Cloud Hosting & Server Setup", price: 3000 },
        { service: "Domain Registration (.com / .in)", price: 1000 },
        { service: "Annual Maintenance Contract (AMC)", price: 8000 }
      ],
      termsAndConditions: [
        "Source code will be handed over only after full settlement of payment.",
        "Development timeline will commence immediately after receipt of the advance payment.",
        "Up to three rounds of visual layout reviews are included. Additional updates are billable.",
        "Any scope modification or addition of features outside this list will be billed separately."
      ],
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



  const renderQuotationForm = () => {
    return (
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid grid-cols-5 w-full bg-muted p-1 rounded-lg">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="scope">Scope & Pages</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="terms">Terms & Notes</TabsTrigger>
        </TabsList>

        {/* Tab 1: Basic Details */}
        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lead *</Label>
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
              <Label>Quotation Number</Label>
              <Input
                value={formData.quotationNo}
                onChange={(e) => setFormData({ ...formData, quotationNo: e.target.value })}
                placeholder="Auto-generated if empty"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker
                date={formData.date}
                setDate={(v) => setFormData({ ...formData, date: v })}
              />
            </div>
            <div className="space-y-2">
              <Label>Valid Until</Label>
              <DatePicker
                date={formData.validUntil}
                setDate={(v) => setFormData({ ...formData, validUntil: v })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Project Name *</Label>
            <Input
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              placeholder="e.g. WebFlora E-Commerce Website"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Project Types (Select multiple or add custom)</Label>
            
            {/* Selected Types Badges */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 border rounded-md bg-slate-50/50">
              {(formData.projectType ? formData.projectType.split(", ").filter(Boolean) : []).map((type, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20 text-[10px]">
                  {type}
                  <X
                    className="h-2.5 w-2.5 cursor-pointer hover:text-destructive"
                    onClick={() => {
                      const current = formData.projectType ? formData.projectType.split(", ").filter(Boolean) : [];
                      const updated = current.filter(t => t !== type);
                      const adjustments = adjustDefaultsForProjectType(updated);
                      setFormData({
                        ...formData,
                        projectType: updated.join(", "),
                        ...adjustments
                      });
                    }}
                  />
                </Badge>
              ))}
              {(formData.projectType ? formData.projectType.split(", ").filter(Boolean) : []).length === 0 && (
                <span className="text-[11px] text-muted-foreground self-center">No types selected yet.</span>
              )}
            </div>

            {/* Quick Select Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {[
                "Website Development",
                "Mobile App Development",
                "ERP System",
                "SEO & Marketing",
                "UI/UX Design",
                "Custom Software"
              ].map((type) => {
                const current = formData.projectType ? formData.projectType.split(", ").filter(Boolean) : [];
                const isSelected = current.includes(type);
                return (
                  <Button
                    key={type}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className="h-6 text-[10px] px-2"
                    onClick={() => {
                      const updated = isSelected
                        ? current.filter(t => t !== type)
                        : [...current, type];
                      const adjustments = adjustDefaultsForProjectType(updated);
                      setFormData({
                        ...formData,
                        projectType: updated.join(", "),
                        ...adjustments
                      });
                    }}
                  >
                    {type}
                  </Button>
                );
              })}
            </div>

            {/* Custom Type Input */}
            <div className="flex gap-2 mt-1.5 max-w-sm">
              <Input
                id="custom-project-type"
                placeholder="Custom Type (e.g. CRM System)"
                className="h-7 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      const current = formData.projectType ? formData.projectType.split(", ").filter(Boolean) : [];
                      if (!current.includes(val)) {
                        const updated = [...current, val];
                        const adjustments = adjustDefaultsForProjectType(updated);
                        setFormData({
                          ...formData,
                          projectType: updated.join(", "),
                          ...adjustments
                        });
                      }
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
              <Button
                type="button"
                className="h-7 text-xs px-3"
                onClick={() => {
                  const el = document.getElementById("custom-project-type") as HTMLInputElement;
                  const val = el?.value.trim();
                  if (val) {
                    const current = formData.projectType ? formData.projectType.split(", ").filter(Boolean) : [];
                    if (!current.includes(val)) {
                      const updated = [...current, val];
                      const adjustments = adjustDefaultsForProjectType(updated);
                      setFormData({
                        ...formData,
                        projectType: updated.join(", "),
                        ...adjustments
                      });
                    }
                    el.value = "";
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Project Overview</Label>
            <Textarea
              value={formData.projectOverview}
              onChange={(e) => setFormData({ ...formData, projectOverview: e.target.value })}
              placeholder="Short summary describing the client's business goals..."
              rows={3}
            />
          </div>
        </TabsContent>

        {/* Tab 2: Scope & Checklist */}
        <TabsContent value="scope" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Scope of Work (Markdown/Bullets)</Label>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs text-primary"
                onClick={() => setFormData({
                  ...formData,
                  scopeOfWork: formData.scopeOfWork + "\n• Dynamic & static responsive layouts\n• Complete administrative control panels\n• Interactive contact pages & SMS/Email triggers\n• Search Engine Optimization (SEO) structured schema\n• High performance loading speeds & SSL encryption"
                })}
              >
                Insert Scope Template
              </Button>
            </div>
            <Textarea
              value={formData.scopeOfWork}
              onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
              placeholder="Detail work scope here..."
              rows={3}
            />
          </div>

          {isPureSeoProject ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50 mt-3">
              <p className="text-sm font-medium text-slate-500">Website Checklist Disabled</p>
              <p className="text-xs text-slate-400 mt-1">This quotation is configured for a pure SEO & Marketing project. Website pages and admin panel modules checklists are hidden.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 border-t pt-3">
              {/* Pages Checklist */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">{formHeaders.left}</Label>
                <div className="flex gap-2">
                  <Input
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    placeholder="Page Name"
                    className="h-7 text-xs"
                  />
                  <Button type="button" size="sm" onClick={addWebsitePage} className="h-7">Add</Button>
                </div>
                <div className="border rounded-md p-2 space-y-1.5 max-h-[160px] overflow-y-auto bg-slate-50/50">
                  {formData.websitePages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between py-0.5 border-b border-slate-100 last:border-0">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`page-${index}`}
                          checked={page.included}
                          onCheckedChange={() => toggleWebsitePage(index)}
                        />
                        <label htmlFor={`page-${index}`} className="text-xs font-medium cursor-pointer">
                          {page.page}
                        </label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeWebsitePage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Checklist */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">{formHeaders.right}</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    placeholder="Module/Feature"
                    className="h-7 text-xs"
                  />
                  <Button type="button" size="sm" onClick={addAdminFeature} className="h-7">Add</Button>
                </div>
                <div className="border rounded-md p-2 space-y-1.5 max-h-[160px] overflow-y-auto bg-slate-50/50">
                  {formData.adminPanelFeatures.map((feat, index) => (
                    <div key={index} className="flex items-center justify-between py-0.5 border-b border-slate-100 last:border-0">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`feat-${index}`}
                          checked={feat.included}
                          onCheckedChange={() => toggleAdminFeature(index)}
                        />
                        <label htmlFor={`feat-${index}`} className="text-xs font-medium cursor-pointer">
                          {feat.feature}
                        </label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeAdminFeature(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Timeline & Deliverables */}
        <TabsContent value="timeline" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Project Implementation Timeline Stages</Label>
            <div className="flex gap-2 items-center">
              <Input
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="Stage Description"
                className="h-7 text-xs"
              />
              <Input
                type="number"
                value={newStageDays}
                onChange={(e) => setNewStageDays(Number(e.target.value))}
                placeholder="Days"
                className="w-16 h-7 text-xs"
              />
              <Button type="button" size="sm" onClick={addTimelineStage} className="h-7">Add</Button>
            </div>
            <div className="border rounded-md p-2 space-y-1 bg-slate-50/50 max-h-[140px] overflow-y-auto">
              {formData.timeline.map((stage, index) => (
                <div key={index} className="flex items-center justify-between text-xs py-1 border-b">
                  <span>{stage.stage}</span>
                  <div className="flex items-center gap-2 font-bold">
                    <span>{stage.days} Days</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive"
                      onClick={() => removeTimelineStage(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="text-right text-xs font-bold pt-2 text-primary">
                Total Estimated Duration: {formData.timeline.reduce((sum, s) => sum + s.days, 0)} Days
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t pt-3">
            <Label className="text-xs font-semibold">Deliverables Checklist</Label>
            <div className="flex gap-2">
              <Input
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                placeholder="Deliverable Description"
                className="h-7 text-xs"
              />
              <Button type="button" size="sm" onClick={addDeliverable} className="h-7">Add</Button>
            </div>
            <div className="border rounded-md p-2 space-y-1 bg-slate-50/50 max-h-[120px] overflow-y-auto">
              {formData.deliverables.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs py-1 border-b last:border-0">
                  <span>• {item}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive"
                    onClick={() => removeDeliverable(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Pricing & Services */}
        <TabsContent value="pricing" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Estimation Items *</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add Cost Item
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMonthlyItem}
                  className="h-7 text-xs border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Monthly Charge
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {formData.items.map((item, index) => {
                const isMonthly = checkIsMonthly(item);
                return (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start p-2 border rounded-lg bg-muted/20">
                    <div className="col-span-5 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[9px]">Service/Module</Label>
                        <button
                          type="button"
                          onClick={() => toggleItemMonthly(index)}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold transition-all cursor-pointer border ${
                            isMonthly
                              ? "bg-orange-500 text-white border-orange-600 shadow-sm"
                              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          {isMonthly ? "✓ Monthly" : "+ Set Monthly"}
                        </button>
                      </div>
                      <Input
                        placeholder="Service"
                        value={item.service}
                        onChange={(e) => handleItemChange(index, "service", e.target.value)}
                        required
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="col-span-3 space-y-0.5">
                      <Label className="text-[9px]">Price (₹)</Label>
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.price || ""}
                        onChange={(e) => handleItemChange(index, "price", e.target.value === "" ? 0 : Number(e.target.value))}
                        required
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="col-span-2 space-y-0.5">
                      <Label className="text-[9px]">Qty</Label>
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity || ""}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value === "" ? 0 : Number(e.target.value))}
                        required
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="col-span-1 text-right pt-4">
                      <div className="text-xs font-bold">{formatCurrency(item.amount)}{isMonthly ? "/mo" : ""}</div>
                    </div>
                    <div className="col-span-1 pt-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive animate-pulse"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 border-t pt-3">
            <Label className="text-xs font-semibold">Additional Services / Annual Maintenance (AMC)</Label>
            <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
              <Input
                value={newAddServiceName}
                onChange={(e) => setNewAddServiceName(e.target.value)}
                placeholder="Hosting, AMC, Domain, etc."
                className="h-7 text-xs flex-1"
              />
              <Input
                type="number"
                value={newAddServicePrice || ""}
                onChange={(e) => setNewAddServicePrice(e.target.value === "" ? 0 : Number(e.target.value))}
                placeholder="Price"
                className="w-20 h-7 text-xs"
              />
              <Button type="button" size="sm" onClick={() => addAdditionalService(false)} className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap">
                Add Cost
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addAdditionalService(true)}
                className="h-7 text-xs border-orange-500/50 text-orange-500 hover:bg-orange-500/10 whitespace-nowrap"
              >
                + Monthly Charge
              </Button>
            </div>
            <div className="border rounded-md p-2 space-y-1 bg-slate-50/50 max-h-[100px] overflow-y-auto">
              {formData.additionalServices.map((service, index) => {
                const isMonthly = checkIsMonthly(service);
                return (
                  <div key={index} className="flex items-center justify-between text-xs py-1 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <span>{service.service}</span>
                      <button
                        type="button"
                        onClick={() => toggleAdditionalServiceMonthly(index)}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-semibold transition-all cursor-pointer border ${
                          isMonthly
                            ? "bg-orange-500 text-white border-orange-600 shadow-sm"
                            : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {isMonthly ? "✓ Monthly" : "+ Set Monthly"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 font-bold">
                      <span>{formatCurrency(service.price)}{isMonthly ? " / mo" : ""}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-destructive"
                        onClick={() => removeAdditionalService(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Tab 5: Terms, Status, Notes */}
        <TabsContent value="terms" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Payment Terms Schedule</Label>
              <div className="flex gap-2">
                <Input
                  value={newPaymentTerm}
                  onChange={(e) => setNewPaymentTerm(e.target.value)}
                  placeholder="e.g. 50% mobilization advance"
                  className="h-7 text-xs"
                />
                <Button type="button" size="sm" onClick={addPaymentTerm} className="h-7">Add</Button>
              </div>
              <div className="border rounded-md p-2 space-y-1 bg-slate-50/50 max-h-[110px] overflow-y-auto">
                {formData.paymentTerms.map((term, index) => (
                  <div key={index} className="flex items-center justify-between text-xs py-0.5 border-b last:border-0">
                    <span className="truncate pr-1">• {term}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive"
                      onClick={() => removePaymentTerm(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Terms & Conditions</Label>
              <div className="flex gap-2">
                <Input
                  value={newTC}
                  onChange={(e) => setNewTC(e.target.value)}
                  placeholder="e.g. Source code upon full payment"
                  className="h-7 text-xs"
                />
                <Button type="button" size="sm" onClick={addTC} className="h-7">Add</Button>
              </div>
              <div className="border rounded-md p-2 space-y-1 bg-slate-50/50 max-h-[110px] overflow-y-auto">
                {formData.termsAndConditions.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs py-0.5 border-b last:border-0">
                    <span className="truncate pr-1">• {item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive"
                      onClick={() => removeTC(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-3">
            <div className="space-y-1">
              <Label className="text-xs">Quotation Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="w-[140px] h-7 text-xs">
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
              <p className="text-[10px] text-muted-foreground">Total Quoted Amount</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(formData.totalAmount)}</p>
            </div>
          </div>

          <div className="space-y-1 border-t pt-3">
            <Label className="text-xs">Additional Internal Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional comments or instructions..."
              rows={2}
              className="text-xs"
            />
          </div>
        </TabsContent>
      </Tabs>
    );
  };

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
                    <TableHead className="font-bold py-4">Project Name</TableHead>
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
                      <TableCell className="text-sm py-3.5 font-semibold">
                        {q.projectName || "N/A"}
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
        <DialogContent className="sm:max-w-[750px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quotation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateQuotation} className="space-y-4 mt-2">
            {renderQuotationForm()}
            <DialogFooter className="border-t pt-3">
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
        <DialogContent className="sm:max-w-[750px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quotation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateQuotation} className="space-y-4 mt-2">
            {renderQuotationForm()}
            <DialogFooter className="border-t pt-3">
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
