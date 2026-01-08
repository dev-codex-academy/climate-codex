import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { Login } from "../pages/Login"
import { NotFound } from "../pages/NotFound"
import { Lead } from "../pages/Lead"
import { Pipeline } from "../pages/Pipeline";
import { Attributes } from "../pages/Attributes";
import AdminLayout from "@/layout/AdminLayout"
import { useAuth } from "@/context/AuthContext"

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
                <Route path="lead" element={<Lead />} />
                <Route path="pipeline" element={<Pipeline />} />
                <Route path="attributes" element={<Attributes />} />
            </Route>

            {/* default routes */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}
