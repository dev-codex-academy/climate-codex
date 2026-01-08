import { API_URL, getHeaders } from "./api";

export const getLeads = async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/leads/?${query}`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching leads");
    return res.json();
};

export const createLead = async (data) => {
    const res = await fetch(`${API_URL}/leads/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(JSON.stringify(errorData));
    }
    return res.json();
};

export const updateLead = async (id, data) => {
    const res = await fetch(`${API_URL}/leads/${id}/`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error updating lead");
    return res.json();
};

export const getLeadAttributes = async () => {
    const res = await fetch(`${API_URL}/attributes/lead/`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching lead attributes");
    const data = await res.json();
    return data.results || data;
}
