// Backend API Response Types
export interface ApiResponse<T = any> {
    message?: string;
    data?: T;
    error?: string;
}

// Admin Types
export interface AdminLoginRequest {
    email: string;
    password: string;
}

export interface AdminRegisterRequest {
    name: string;
    email: string;
    password: string;
    role: 'admin';
}

export interface AdminResponse {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    admin?: AdminResponse;
    employee?: EmployeeResponse;
    intern?: InternResponse;
}

export type AuthUser = AdminResponse | EmployeeResponse | InternResponse;

// Employee Types (Backend)
export interface EmployeeBackend {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    address: string;
    salary: number;
    totalPaid?: number;
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeResponse {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface CreateEmployeeRequest {
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    address: string;
    salary: number;
}

export interface UpdateEmployeeRequest {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    phone?: string;
    address?: string;
    salary?: number;
}

// Intern Types (Backend)
export interface InternBackend {
    _id: string;
    name: string;
    email: string;
    password?: string;
    phone: string;
    address: string;
    role: string;
    salary: number;
    totalPaid?: number;
    duration: string;
    createdAt: string;
    updatedAt: string;
}

export interface InternResponse {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface CreateInternRequest {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    duration: string;
    salary: number;
}

export interface UpdateInternRequest extends Partial<CreateInternRequest> { }

// Client Types (Backend)
export interface ClientBackend {
    _id: string;
    clientName: string;
    contactNumber: string;
    email: string;
    address: string;
    referenceNo: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClientRequest {
    clientName: string;
    contactNumber: string;
    email: string;
    address: string;
    referenceNo: string;
}

export interface UpdateClientRequest {
    clientName?: string;
    contactNumber?: string;
    email?: string;
    address?: string;
    referenceNo?: string;
}

// Invoice Types (Backend)
export interface InvoiceBackend {
    _id: string;
    clientId: string | ClientBackend;
    projectId: string | ProjectBackend;
    referenceNo: string;
    invoiceNo: string;
    amount: number;
    description?: string;
    method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque';
    date: string;
    status: 'pending' | 'paid' | 'overdue';
}

export interface CreateInvoiceRequest {
    clientId: string;
    projectId: string;
    referenceNo: string;
    invoiceNo: string;
    amount: number;
    description?: string;
    method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque';
    date?: string;
    status?: 'pending' | 'paid' | 'overdue';
}

export interface UpdateInvoiceRequest {
    clientId?: string;
    projectId?: string;
    referenceNo?: string;
    invoiceNo?: string;
    amount?: number;
    description?: string;
    method?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque';
    date?: string;
    status?: 'pending' | 'paid' | 'overdue';
}

// Project Types (Backend)
export interface ProjectBackend {
    _id: string;
    projectName: string;
    client: string | ClientBackend;
    description?: string;
    techStack?: string[];
    status: "New" | "In Progress" | "On Hold" | "Completed";
    assignedTeam?: string[] | EmployeeBackend[];
    startDate?: string;
    endDate?: string;
    totalAmount: number;
    totalPaid?: number;
    dueAmount?: number;
    invoices?: InvoiceBackend[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectRequest {
    projectName: string;
    client: string;
    description?: string;
    techStack?: string[];
    status?: "New" | "In Progress" | "On Hold" | "Completed";
    assignedTeam?: string[];
    startDate?: string;
    endDate?: string;
    totalAmount: number;
}

// Handover Types
export interface HandoverBackend {
    _id: string;
    projectId: string | any;
    assigneeId: string | any;
    assigneeModel: "employee" | "intern";
    handoverDate: string;
    deadline?: string;
    credentials: {
        adminUrl?: string;
        adminUser?: string;
        adminPass?: string;
        dbUrl?: string;
        serverIp?: string;
        ftpHost?: string;
        ftpUser?: string;
        ftpPass?: string;
        githubUrl?: string;
    };
    instructions?: string;
    status: "In Progress" | "Handed Over" | "Completed" | "Revoked";
    createdAt: string;
    updatedAt: string;
}

export interface CreateHandoverRequest {
    projectId: string;
    assigneeId: string;
    assigneeModel: "employee" | "intern";
    handoverDate?: string;
    deadline?: string;
    credentials?: HandoverBackend["credentials"];
    instructions?: string;
    status?: HandoverBackend["status"];
}

export interface UpdateHandoverRequest extends Partial<CreateHandoverRequest> { }

// Salary Types
export interface SalaryBackend {
    _id: string;
    payeeId: string;
    payeeModel: 'employee' | 'intern';
    amount: number;
    paymentDate: string;
    month: string;
    year: number;
    remarks?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SalaryRecord extends SalaryBackend {
    payeeName: string;
}

export interface CreateSalaryRequest {
    payeeId: string;
    payeeModel: 'employee' | 'intern';
    amount: number;
    month: string;
    year: number;
    remarks?: string;
    paymentDate?: string;
}

export interface SalaryStats {
    _id: {
        year: number;
        month: string;
        payeeModel: 'employee' | 'intern';
    };
    totalAmount: number;
    count: number;
}


// Data Adapters - Convert backend data to frontend format
export const adaptEmployeeData = (employee: EmployeeBackend): any => {
    return {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: 'General', // Default value since backend doesn't have this
        salary: employee.salary,
        joinDate: employee.createdAt,
        status: 'active' as const,
        avatar: employee.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        projectsCompleted: 0, // Default value
        tasksCompleted: 0, // Default value
        attendance: 95, // Default value
        rating: 4.0, // Default value
        revenueGenerated: 0, // Default value
        phone: employee.phone,
        address: employee.address,
        totalPaid: employee.totalPaid || 0,
        type: 'employee' as const,
    };
};

export const adaptClientData = (client: ClientBackend): any => {
    return {
        id: client._id,
        name: client.clientName,
        company: client.clientName,
        email: client.email,
        phone: client.contactNumber,
        projects: 0, // Default value
        totalBilled: 0, // Default value
        status: 'active' as const,
        avatar: client.clientName.split(' ').map(n => n[0]).join('').toUpperCase(),
        joinDate: client.createdAt,
        address: client.address,
        referenceNo: client.referenceNo,
    };
};

export const adaptInvoiceData = (invoice: InvoiceBackend): any => {
    const amount = Number(invoice.amount);

    // Extract client info if populated
    const client = typeof invoice.clientId === 'object' ? invoice.clientId : null;
    const project = typeof invoice.projectId === 'object' ? invoice.projectId : null;

    return {
        id: invoice._id,
        number: invoice.invoiceNo,
        clientName: client?.clientName || 'Unknown Client',
        projectName: project?.projectName || 'Unknown Project',
        projectId: typeof invoice.projectId === 'string' ? invoice.projectId : (project as any)?._id,
        company: client?.clientName || 'Unknown Company',
        amount: amount,
        total: amount,
        status: invoice.status || 'pending',
        date: invoice.date, // Added for UI compatibility
        issueDate: invoice.date,
        dueDate: invoice.date,
        services: invoice.description ? [invoice.description] : [],
        method: invoice.method,
        description: invoice.description,
        clientId: typeof invoice.clientId === 'string' ? invoice.clientId : (client as any)?._id,
    };
};

export const adaptProjectData = (project: ProjectBackend): any => {
    const client = typeof project.client === 'object' ? project.client : null;

    return {
        id: project._id,
        name: project.projectName,
        client: client?.clientName || 'Unknown Client',
        clientId: typeof project.client === 'string' ? project.client : (client as any)?._id,
        status: project.status,
        progress: project.status === "Completed" ? 100 :
            project.status === "In Progress" ? 50 : 0,
        budget: project.totalAmount,
        totalPaid: project.totalPaid || 0,
        dueAmount: project.dueAmount || 0,
        invoices: Array.isArray(project.invoices) ? project.invoices.map(adaptInvoiceData) : [],
        spent: project.totalPaid || 0,
        startDate: project.startDate, // Added for UI compatibility
        deadline: project.endDate || project.createdAt,
        team: Array.isArray(project.assignedTeam) ?
            project.assignedTeam.map((m: any) => typeof m === 'object' ? m.name : 'Unknown') : [],
        priority: 'medium' as const, // Placeholder
        tasks: { completed: 0, total: 0 }, // Placeholder
        description: project.description, // Added for edit form
    };
};

export const adaptInternData = (intern: InternBackend): any => {
    return {
        id: intern._id,
        name: intern.name,
        email: intern.email,
        phone: intern.phone,
        address: intern.address,
        role: intern.role,
        salary: intern.salary,
        totalPaid: intern.totalPaid || 0,
        duration: intern.duration,
        createdAt: intern.createdAt,
        updatedAt: intern.updatedAt,
        type: 'intern' as const,
    };
};

export const adaptHandoverData = (handover: HandoverBackend): any => {
    const project = typeof handover.projectId === 'object' ? handover.projectId : null;
    const assignee = typeof handover.assigneeId === 'object' ? handover.assigneeId : null;

    return {
        id: handover._id,
        projectId: typeof handover.projectId === 'string' ? handover.projectId : project?._id,
        projectName: project?.projectName || 'Unknown Project',
        assigneeId: typeof handover.assigneeId === 'string' ? handover.assigneeId : assignee?._id,
        assigneeName: assignee?.name || 'Unknown',
        assigneeModel: handover.assigneeModel,
        handoverDate: handover.handoverDate,
        deadline: handover.deadline,
        credentials: handover.credentials || {},
        instructions: handover.instructions || '',
        status: handover.status || 'In Progress',
    };
};
