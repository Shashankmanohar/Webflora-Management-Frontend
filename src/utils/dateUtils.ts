import { format } from "date-fns";

/**
 * Formats a date string or Date object to Indian standard format (DD/MM/YYYY).
 * @param date - The date to format.
 * @returns A formatted date string.
 */
export const formatDate = (date: string | Date | undefined | null): string => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    return format(d, "dd/MM/yyyy");
};

/**
 * Formats a date to a more verbose Indian style (e.g., 01 Apr 2026).
 * @param date - The date to format.
 * @returns A formatted date string.
 */
export const formatVerboseDate = (date: string | Date | undefined | null): string => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    return format(d, "dd MMM yyyy");
};

/**
 * Formats a date to ISO string for backend usage (YYYY-MM-DD).
 * @param date - The date to format.
 * @returns A formatted date string.
 */
export const toISODate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};
