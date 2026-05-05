import { API_URL, getHeaders } from "./api";

export const submitSurvey = async (serviceId, data) => {
    const res = await fetch(`${API_URL}/surveys/${serviceId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw err || { detail: "Failed to submit. Please check your connection and try again." };
    }
    return res.json();
};

export const getServiceSurveys = async (serviceId) => {
    const res = await fetch(`${API_URL}/services/${serviceId}/surveys/`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load registrations");
    return res.json();
};
