import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { Login } from "../pages/Login"
import { NotFound } from "../pages/NotFound"
import { Lead } from "../pages/Lead"
import { Pipeline } from "../pages/Pipeline";
import { Attributes } from "../pages/Attributes";
import { Client } from "../pages/Client";
import { Service } from "../pages/Service";
import { Followup } from "../pages/Followup";

import { LeadDetail } from "../pages/LeadDetail";
import { ClientDetail } from "../pages/ClientDetail";
import { ServiceDetail } from "../pages/ServiceDetail";
import { Contact } from "../pages/Contact";
import { ContactDetail } from "../pages/ContactDetail";
import { Category } from "../pages/Category";
import { CategoryDetail } from "../pages/CategoryDetail";
import { Catalogueitem } from "../pages/Catalogueitem";
import { CatalogueitemDetail } from "../pages/CatalogueitemDetail";
import { Invoice } from "../pages/Invoice";
import { InvoiceDetail } from "../pages/InvoiceDetail";
import { WebhookList } from "../pages/Webhooks/WebhookList";
import { WebhookDetail } from "../pages/Webhooks/WebhookDetail";
import { ApiGuide } from "../pages/ApiGuide";
import { Faq } from "../pages/Faq";
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
                <Route path="contact" element={<PermissionGuard requiredPermission="app.add_contact"><Contact /></PermissionGuard>} />
                <Route path="contact/:id" element={<PermissionGuard requiredPermission="app.add_contact"><ContactDetail /></PermissionGuard>} />
                <Route path="service" element={<PermissionGuard requiredPermission="app.add_service"><Service /></PermissionGuard>} />
                <Route path="service/:id" element={<PermissionGuard requiredPermission="app.add_service"><ServiceDetail /></PermissionGuard>} />
                <Route path="category" element={<PermissionGuard requiredPermission="app.add_category"><Category /></PermissionGuard>} />
                <Route path="category/:id" element={<PermissionGuard requiredPermission="app.add_category"><CategoryDetail /></PermissionGuard>} />
                <Route path="catalogueitem" element={<PermissionGuard requiredPermission="app.add_catalogueitem"><Catalogueitem /></PermissionGuard>} />
                <Route path="catalogueitem/:id" element={<PermissionGuard requiredPermission="app.add_catalogueitem"><CatalogueitemDetail /></PermissionGuard>} />
                <Route path="invoice" element={<PermissionGuard requiredPermission="app.add_invoice"><Invoice /></PermissionGuard>} />
                <Route path="invoice/:id" element={<PermissionGuard requiredPermission="app.add_invoice"><InvoiceDetail /></PermissionGuard>} />
                <Route path="followup" element={<PermissionGuard requiredPermission="app.add_followup"><Followup /></PermissionGuard>} />
                <Route path="webhook" element={<PermissionGuard requiredPermission="app.add_webhook"><WebhookList /></PermissionGuard>} />
                <Route path="webhook/:id" element={<PermissionGuard requiredPermission="app.add_webhook"><WebhookDetail /></PermissionGuard>} />
            </Route>

            {/* Public Documentation Routes */}
            <Route path="/api" element={<ApiGuide />} />
            <Route path="/faq" element={<Faq />} />

            {/* default routes */}
            <Route path="*" element={<NotFound />} />
        </Routes >
    )
}
