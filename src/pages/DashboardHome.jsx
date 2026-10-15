import React from "react";
import { Dashboard } from "./Dashboard";
import { MentorDashboard } from "./MentorDashboard";
import { NoAccess } from "./NoAccess";

// A CRM role (anything that can view leads, clients, services, invoices or assets) gets the
// CRM dashboard; a mentor-only account (teachers / Teacher Assistants) gets the mentoring
// dashboard; an account without any role gets a neutral screen with no data and no widgets.
const CRM_VIEW_PERMISSIONS = ["app.view_lead", "app.view_client", "app.view_service", "app.view_invoice", "app.view_asset"];

const readPermissions = () => {
    try {
        return JSON.parse(localStorage.getItem("user_permissions") || "[]");
    } catch {
        return [];
    }
};

export const DashboardHome = () => {
    const permissions = readPermissions();
    if (CRM_VIEW_PERMISSIONS.some(p => permissions.includes(p))) return <Dashboard />;
    if (permissions.includes("app.view_mentorprofile")) return <MentorDashboard />;
    return <NoAccess />;
};
