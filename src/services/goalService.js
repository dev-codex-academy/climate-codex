import { API_URL, getHeaders, fetchAllPages, extractErrorMessage } from "./api";

const url = `${API_URL}/goals/`;

const parse = async (res, fallback) => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(extractErrorMessage(errorData, fallback));
    }
    return res.json();
};

export const getGoals = async (filters = {}) => {
    const qs = new URLSearchParams(filters).toString();
    return fetchAllPages(qs ? `${url}?${qs}` : url, { method: "GET", headers: getHeaders() });
};

// Users (operations team), KPIs, cohorts and clients for the form selects, in one call.
export const getGoalOptions = async () => {
    const res = await fetch(`${url}options/`, { method: "GET", headers: getHeaders() });
    return parse(res, "Error loading goal options");
};

export const createGoal = async (data) => {
    const res = await fetch(url, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
    return parse(res, "Error creating goal");
};

export const updateGoal = async (id, data) => {
    const res = await fetch(`${url}${id}/`, { method: "PATCH", headers: getHeaders(), body: JSON.stringify(data) });
    return parse(res, "Error updating goal");
};

export const deleteGoal = async (id) => {
    const res = await fetch(`${url}${id}/`, { method: "DELETE", headers: getHeaders() });
    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(extractErrorMessage(errorData, "Error deleting goal"));
    }
};
