// Mock data for the CRM/ERP system

export const monthlyIncomeData = [
  { month: "Jan", income: 245000, collected: 210000, pending: 35000 },
  { month: "Feb", income: 312000, collected: 280000, pending: 32000 },
  { month: "Mar", income: 198000, collected: 178000, pending: 20000 },
  { month: "Apr", income: 420000, collected: 390000, pending: 30000 },
  { month: "May", income: 365000, collected: 320000, pending: 45000 },
  { month: "Jun", income: 478000, collected: 430000, pending: 48000 },
  { month: "Jul", income: 395000, collected: 355000, pending: 40000 },
  { month: "Aug", income: 510000, collected: 470000, pending: 40000 },
  { month: "Sep", income: 445000, collected: 400000, pending: 45000 },
  { month: "Oct", income: 530000, collected: 490000, pending: 40000 },
  { month: "Nov", income: 485000, collected: 445000, pending: 40000 },
  { month: "Dec", income: 620000, collected: 560000, pending: 60000 },
];

export const yearlyIncomeData = [
  { year: "2020", income: 2800000 },
  { year: "2021", income: 3500000 },
  { year: "2022", income: 4200000 },
  { year: "2023", income: 5003000 },
  { year: "2024", income: 5500000 },
  { year: "2025", income: 4900000 },
];

export const paymentStatusData = [
  { name: "Collected", value: 4528000, color: "hsl(152, 69%, 40%)" },
  { name: "Pending", value: 475000, color: "hsl(38, 92%, 50%)" },
  { name: "Overdue", value: 120000, color: "hsl(0, 72%, 51%)" },
];

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  projects: number;
  totalBilled: number;
  status: "active" | "inactive" | "prospect";
  avatar: string;
  joinDate: string;
}

export const clients: Client[] = [
  { id: "1", name: "Rajesh Sharma", company: "TechVista Solutions", email: "rajesh@techvista.in", phone: "+91 98765 43210", projects: 4, totalBilled: 850000, status: "active", avatar: "RS", joinDate: "2023-02-15" },
  { id: "2", name: "Priya Nair", company: "GreenLeaf Organics", email: "priya@greenleaf.com", phone: "+91 87654 32109", projects: 2, totalBilled: 320000, status: "active", avatar: "PN", joinDate: "2023-06-20" },
  { id: "3", name: "Amit Patel", company: "CloudNine Enterprises", email: "amit@cloudnine.co", phone: "+91 76543 21098", projects: 3, totalBilled: 650000, status: "active", avatar: "AP", joinDate: "2023-01-10" },
  { id: "4", name: "Sneha Reddy", company: "PixelPerfect Media", email: "sneha@pixelperfect.in", phone: "+91 65432 10987", projects: 1, totalBilled: 180000, status: "prospect", avatar: "SR", joinDate: "2024-01-05" },
  { id: "5", name: "Vikram Singh", company: "AgroTech India", email: "vikram@agrotech.in", phone: "+91 54321 09876", projects: 5, totalBilled: 1200000, status: "active", avatar: "VS", joinDate: "2022-09-12" },
  { id: "6", name: "Meera Joshi", company: "EduSpark Academy", email: "meera@eduspark.com", phone: "+91 43210 98765", projects: 2, totalBilled: 420000, status: "inactive", avatar: "MJ", joinDate: "2023-04-18" },
  { id: "7", name: "Arjun Menon", company: "SwiftLogistics", email: "arjun@swiftlog.in", phone: "+91 32109 87654", projects: 3, totalBilled: 780000, status: "active", avatar: "AM", joinDate: "2023-08-22" },
  { id: "8", name: "Kavita Deshmukh", company: "FashionForward", email: "kavita@fashionfw.com", phone: "+91 21098 76543", projects: 1, totalBilled: 150000, status: "prospect", avatar: "KD", joinDate: "2024-03-01" },
];

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  company: string;
  amount: number;
  gst: number;
  total: number;
  status: "paid" | "partial" | "pending" | "overdue";
  issueDate: string;
  dueDate: string;
  services: string[];
}

export const invoices: Invoice[] = [
  { id: "1", number: "WF-2025-001", clientName: "Rajesh Sharma", company: "TechVista Solutions", amount: 200000, gst: 36000, total: 236000, status: "paid", issueDate: "2025-01-05", dueDate: "2025-01-20", services: ["Website Development", "SEO Setup"] },
  { id: "2", number: "WF-2025-002", clientName: "Priya Nair", company: "GreenLeaf Organics", amount: 150000, gst: 27000, total: 177000, status: "paid", issueDate: "2025-01-10", dueDate: "2025-01-25", services: ["E-commerce Website"] },
  { id: "3", number: "WF-2025-003", clientName: "Amit Patel", company: "CloudNine Enterprises", amount: 350000, gst: 63000, total: 413000, status: "partial", issueDate: "2025-01-15", dueDate: "2025-02-15", services: ["Mobile App", "Backend API", "Admin Panel"] },
  { id: "4", number: "WF-2025-004", clientName: "Vikram Singh", company: "AgroTech India", amount: 280000, gst: 50400, total: 330400, status: "pending", issueDate: "2025-01-20", dueDate: "2025-02-20", services: ["CRM Software", "Integration"] },
  { id: "5", number: "WF-2025-005", clientName: "Sneha Reddy", company: "PixelPerfect Media", amount: 120000, gst: 21600, total: 141600, status: "overdue", issueDate: "2024-12-01", dueDate: "2025-01-01", services: ["Social Media Marketing"] },
  { id: "6", number: "WF-2025-006", clientName: "Arjun Menon", company: "SwiftLogistics", amount: 450000, gst: 81000, total: 531000, status: "paid", issueDate: "2025-01-25", dueDate: "2025-02-25", services: ["Fleet Management App", "Dashboard"] },
  { id: "7", number: "WF-2025-007", clientName: "Meera Joshi", company: "EduSpark Academy", amount: 180000, gst: 32400, total: 212400, status: "pending", issueDate: "2025-02-01", dueDate: "2025-03-01", services: ["Learning Portal", "Video Platform"] },
  { id: "8", number: "WF-2025-008", clientName: "Kavita Deshmukh", company: "FashionForward", amount: 95000, gst: 17100, total: 112100, status: "pending", issueDate: "2025-02-03", dueDate: "2025-03-03", services: ["Landing Page", "Branding"] },
];

export interface Project {
  id: string;
  name: string;
  client: string;
  status: "planning" | "in-progress" | "review" | "completed" | "on-hold";
  progress: number;
  budget: number;
  spent: number;
  deadline: string;
  team: string[];
  tasks: { total: number; completed: number };
  priority: "low" | "medium" | "high" | "critical";
}

export const projects: Project[] = [
  { id: "1", name: "TechVista Corporate Website", client: "TechVista Solutions", status: "in-progress", progress: 68, budget: 200000, spent: 140000, deadline: "2025-03-15", team: ["Arun K", "Divya S", "Rahul M"], tasks: { total: 24, completed: 16 }, priority: "high" },
  { id: "2", name: "GreenLeaf E-commerce Platform", client: "GreenLeaf Organics", status: "in-progress", progress: 45, budget: 350000, spent: 160000, deadline: "2025-04-30", team: ["Sanjay P", "Neha R", "Kiran T", "Arun K"], tasks: { total: 42, completed: 19 }, priority: "high" },
  { id: "3", name: "CloudNine Mobile App", client: "CloudNine Enterprises", status: "review", progress: 90, budget: 450000, spent: 420000, deadline: "2025-02-28", team: ["Rahul M", "Pooja G"], tasks: { total: 36, completed: 32 }, priority: "critical" },
  { id: "4", name: "AgroTech CRM System", client: "AgroTech India", status: "planning", progress: 10, budget: 280000, spent: 25000, deadline: "2025-06-30", team: ["Divya S", "Sanjay P"], tasks: { total: 18, completed: 2 }, priority: "medium" },
  { id: "5", name: "SwiftLogistics Fleet Dashboard", client: "SwiftLogistics", status: "completed", progress: 100, budget: 380000, spent: 365000, deadline: "2025-01-15", team: ["Kiran T", "Neha R", "Arun K"], tasks: { total: 30, completed: 30 }, priority: "low" },
  { id: "6", name: "EduSpark Learning Portal", client: "EduSpark Academy", status: "in-progress", progress: 35, budget: 250000, spent: 85000, deadline: "2025-05-15", team: ["Pooja G", "Rahul M"], tasks: { total: 28, completed: 10 }, priority: "medium" },
  { id: "7", name: "PixelPerfect Marketing Campaign", client: "PixelPerfect Media", status: "on-hold", progress: 20, budget: 120000, spent: 30000, deadline: "2025-04-01", team: ["Divya S"], tasks: { total: 12, completed: 3 }, priority: "low" },
];

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  salary: number;
  joinDate: string;
  status: "active" | "on-leave" | "inactive";
  avatar: string;
  projectsCompleted: number;
  tasksCompleted: number;
  attendance: number;
  rating: number;
  revenueGenerated: number;
}

export const employees: Employee[] = [
  { id: "1", name: "Arun Kumar", email: "arun@webflora.in", role: "Senior Developer", department: "Engineering", salary: 85000, joinDate: "2021-03-15", status: "active", avatar: "AK", projectsCompleted: 12, tasksCompleted: 156, attendance: 96, rating: 4.8, revenueGenerated: 2400000 },
  { id: "2", name: "Divya Sharma", email: "divya@webflora.in", role: "UI/UX Designer", department: "Design", salary: 72000, joinDate: "2021-07-01", status: "active", avatar: "DS", projectsCompleted: 15, tasksCompleted: 189, attendance: 98, rating: 4.9, revenueGenerated: 1800000 },
  { id: "3", name: "Rahul Mehra", email: "rahul@webflora.in", role: "Full Stack Developer", department: "Engineering", salary: 78000, joinDate: "2022-01-10", status: "active", avatar: "RM", projectsCompleted: 8, tasksCompleted: 124, attendance: 94, rating: 4.5, revenueGenerated: 1950000 },
  { id: "4", name: "Sanjay Patil", email: "sanjay@webflora.in", role: "Backend Developer", department: "Engineering", salary: 75000, joinDate: "2022-06-20", status: "active", avatar: "SP", projectsCompleted: 6, tasksCompleted: 98, attendance: 92, rating: 4.3, revenueGenerated: 1600000 },
  { id: "5", name: "Neha Rao", email: "neha@webflora.in", role: "Project Manager", department: "Management", salary: 90000, joinDate: "2021-01-05", status: "active", avatar: "NR", projectsCompleted: 18, tasksCompleted: 210, attendance: 97, rating: 4.7, revenueGenerated: 3200000 },
  { id: "6", name: "Kiran Thakur", email: "kiran@webflora.in", role: "DevOps Engineer", department: "Engineering", salary: 80000, joinDate: "2022-09-15", status: "active", avatar: "KT", projectsCompleted: 5, tasksCompleted: 78, attendance: 95, rating: 4.4, revenueGenerated: 1200000 },
  { id: "7", name: "Pooja Gupta", email: "pooja@webflora.in", role: "Frontend Developer", department: "Engineering", salary: 68000, joinDate: "2023-02-01", status: "on-leave", avatar: "PG", projectsCompleted: 4, tasksCompleted: 67, attendance: 90, rating: 4.2, revenueGenerated: 950000 },
  { id: "8", name: "Varun Iyer", email: "varun@webflora.in", role: "Marketing Specialist", department: "Marketing", salary: 55000, joinDate: "2023-06-15", status: "active", avatar: "VI", projectsCompleted: 7, tasksCompleted: 89, attendance: 93, rating: 4.1, revenueGenerated: 800000 },
];

export const attendanceData = [
  { date: "2025-02-01", present: 7, absent: 1, late: 0 },
  { date: "2025-02-02", present: 8, absent: 0, late: 0 },
  { date: "2025-02-03", present: 6, absent: 1, late: 1 },
  { date: "2025-02-04", present: 7, absent: 0, late: 1 },
  { date: "2025-02-05", present: 8, absent: 0, late: 0 },
  { date: "2025-02-06", present: 7, absent: 1, late: 0 },
];

export const dashboardStats = {
  totalRevenue: 5003000,
  collectedPayments: 4528000,
  pendingPayments: 475000,
  overduePayments: 120000,
  activeClients: 6,
  activeProjects: 4,
  totalEmployees: 8,
  invoicesThisMonth: 4,
};
