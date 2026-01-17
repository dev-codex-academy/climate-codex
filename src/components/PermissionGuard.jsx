import React from 'react';
import { Navigate } from 'react-router-dom';
import { ErrorPage } from './ErrorPage';

export const PermissionGuard = ({ requiredPermission, children }) => {
    const storedPermissions = localStorage.getItem("user_permissions");

    if (!storedPermissions) {
        // If no permissions found, maybe redirect to login or show error
        return <Navigate to="/login" replace />;
    }

    try {
        const permissions = JSON.parse(storedPermissions);

        // If permissions is not arrays or requiredPermission not in it
        if (!Array.isArray(permissions) || !permissions.includes(requiredPermission)) {
            return <ErrorPage code={403} />;
        }

        return children;
    } catch (error) {
        console.error("Error parsing permissions:", error);
        return <Navigate to="/login" replace />;
    }
};
