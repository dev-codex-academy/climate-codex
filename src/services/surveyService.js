import { API_URL } from "./api";

export const getSurveyService = async (serviceId) => {
    const res = await fetch(`${API_URL}/surveys/${serviceId}/`);
    if (!res.ok) throw new Error("Survey not found");
    return res.json();
};

export const submitSurvey = async (serviceId, data) => {
    const res = await fetch(`${API_URL}/surveys/${serviceId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw err;
    }
    return res.json();
};
