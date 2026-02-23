// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4002';
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

// API Endpoints
export const API_ENDPOINTS = {
    // Admin
    ADMIN_REGISTER: '/api/admin/register',
    ADMIN_LOGIN: '/api/admin/login',
    ADMIN_GET: '/api/admin/get',

    // Employee
    EMPLOYEE_BASE: '/api/employee',
    EMPLOYEE_LOGIN: '/api/employee/login',
    EMPLOYEE_BY_ID: (id: string) => `/api/employee/${id}`,

    // Client
    CLIENT_BASE: '/api/client',
    CLIENT_UPDATE: (id: string) => `/api/client/update/${id}`,
    CLIENT_DELETE: (id: string) => `/api/client/delete/${id}`,

    // Invoice
    INVOICE_BASE: '/api/invoice',
    INVOICE_BY_ID: (id: string) => `/api/invoice/${id}`,
    INVOICE_UPDATE: (id: string) => `/api/invoice/update/${id}`,
    INVOICE_DELETE: (id: string) => `/api/invoice/delete/${id}`,

    // Communication
    COMMUNICATION_BASE: '/api/communication',
    COMMUNICATION_BY_ID: (id: string) => `/api/communication/${id}`,

    // Notice
    NOTICE_BASE: '/api/notice',
    NOTICE_BY_ID: (id: string) => `/api/notice/${id}`,

    // Attendance
    ATTENDANCE_BASE: '/api/attendance',
    ATTENDANCE_BY_ID: (id: string) => `/api/attendance/${id}`,

    // Intern
    INTERN_BASE: '/api/intern',
    INTERN_LOGIN: '/api/intern/login',
    INTERN_BY_ID: (id: string) => `/api/intern/${id}`,

    // Project
    PROJECT_BASE: '/api/project',
    PROJECT_UPDATE: (id: string) => `/api/project/update/${id}`,
    PROJECT_DELETE: (id: string) => `/api/project/delete/${id}`,

    // Handover
    HANDOVER_BASE: '/api/handover/all',
    HANDOVER_ADD: '/api/handover/add',
    HANDOVER_BY_ID: (id: string) => `/api/handover/${id}`,
    HANDOVER_UPDATE: (id: string) => `/api/handover/update/${id}`,
    HANDOVER_DELETE: (id: string) => `/api/handover/delete/${id}`,

    // Auth
    AUTH_FORGOT_PASSWORD: '/api/auth/forgot-password',
    AUTH_VERIFY_OTP: '/api/auth/verify-otp',
    AUTH_RESET_PASSWORD: '/api/auth/reset-password',
} as const;
