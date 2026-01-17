import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { Login } from "../pages/Login"
import { NotFound } from "../pages/NotFound"
import { Lead } from "../pages/Lead"
import { Pipeline } from "../pages/Pipeline";
import { Attributes } from "../pages/Attributes";
import { Client } from "../pages/Client";
import { Service } from "../pages/Service";
import { Followup } from "../pages/Followup";
import { Cohort } from "../pages/Cohort";
import { Enrollment } from "../pages/Enrollment";
import { EnrollmentDetail } from "../pages/EnrollmentDetail";
import { LeadDetail } from "../pages/LeadDetail";
import { ClientDetail } from "../pages/ClientDetail";
import { ServiceDetail } from "../pages/ServiceDetail";
import { TransferRequests } from "../pages/TransferRequests";
import AdminLayout from "@/layout/AdminLayout"
import { useAuth } from "@/context/AuthContext"
import { PermissionGuard } from "../components/PermissionGuard"

const LoginValidate = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
};

const RedirectIfAuth = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    if (isAuthenticated) return <Navigate to="/" replace />;
    return children;
};


export const RouterApp = () => {

    return (
        <Routes>

            {/* public routes */}
            <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />

            {/* private routes */}

            <Route path="/" element={<LoginValidate><AdminLayout /></LoginValidate>}>
                {/*  <Route path="rol" element={<Rol />} /> */}
                <Route path="lead" element={<PermissionGuard requiredPermission="app.add_lead"><Lead /></PermissionGuard>} />
                <Route path="lead/:id" element={<PermissionGuard requiredPermission="app.add_lead"><LeadDetail /></PermissionGuard>} />
                <Route path="pipeline" element={<PermissionGuard requiredPermission="app.add_pipeline"><Pipeline /></PermissionGuard>} />
                <Route path="attribute" element={<PermissionGuard requiredPermission="app.add_attribute"><Attributes /></PermissionGuard>} />
                <Route path="client" element={<PermissionGuard requiredPermission="app.add_client"><Client /></PermissionGuard>} />
                <Route path="client/:id" element={<PermissionGuard requiredPermission="app.add_client"><ClientDetail /></PermissionGuard>} />
                <Route path="service" element={<PermissionGuard requiredPermission="app.add_service"><Service /></PermissionGuard>} />
                <Route path="service/:id" element={<PermissionGuard requiredPermission="app.add_service"><ServiceDetail /></PermissionGuard>} />
                <Route path="followup" element={<PermissionGuard requiredPermission="app.add_followup"><Followup /></PermissionGuard>} />
                <Route path="cohort" element={<PermissionGuard requiredPermission="app.add_cohort"><Cohort /></PermissionGuard>} />
                <Route path="enrollment" element={<PermissionGuard requiredPermission="app.add_enrollment"><Enrollment /></PermissionGuard>} />
                <Route path="enrollment/:id" element={<PermissionGuard requiredPermission="app.add_enrollment"><EnrollmentDetail /></PermissionGuard>} />
                <Route path="transferrequest" element={<PermissionGuard requiredPermission="app.add_transferrequest"><TransferRequests /></PermissionGuard>} />
            </Route>

            {/* default routes */}
            <Route path="*" element={<NotFound />} />
        </Routes >
    )
}
