import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "./AdminSidebar";
import EmployeeSidebar from "./EmployeeSidebar";
import InternSidebar from "./InternSidebar";
import { Navigate } from "react-router-dom";

interface RoleBasedLayoutProps {
    children: React.ReactNode;
}

const RoleBasedLayout = ({ children }: RoleBasedLayoutProps) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Choose sidebar based on role
    if (user.role === 'admin') {
        return <AdminSidebar>{children}</AdminSidebar>;
    } else if (user.role === 'employee') {
        return <EmployeeSidebar>{children}</EmployeeSidebar>;
    } else if (user.role === 'intern') {
        return <InternSidebar>{children}</InternSidebar>;
    }

    return <AdminSidebar>{children}</AdminSidebar>;
};

export default RoleBasedLayout;
