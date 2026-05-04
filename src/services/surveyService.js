import { API_URL, getHeaders } from "./api";

export const getSurveyService = async (serviceId) => {
    const res = await fetch(`${API_URL}/surveys/${serviceId}/`);
    if (!res.ok) throw new Error("Survey not found");
    return res.json();
};

export const getSurveyResponse = async (surveyId) => {
    const res = await fetch(`${API_URL}/surveys/response/${surveyId}/`);
    if (!res.ok) throw new Error("Registration not found");
    return res.json();
};

export const updateSurveyResponse = async (surveyId, data) => {
    const res = await fetch(`${API_URL}/surveys/response/${surveyId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw err || { detail: "Failed to update. Please check your connection and try again." };
    }
    return res.json();
};

export const getServiceSurveys = async (serviceId) => {
    const res = await fetch(`${API_URL}/services/${serviceId}/surveys/`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load registrations");
    return res.json();
};

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
