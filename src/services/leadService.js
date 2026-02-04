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

export const getLead = async (id) => {
    const res = await fetch(`${API_URL}/leads/${id}/`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching lead");
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

export const getLeadClientAttributes = async () => {
    const res = await fetch(`${API_URL}/attributes/lead_client_info/`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching lead client attributes");
    const data = await res.json();
    return data.results || data;
};

export const getLeadServiceAttributes = async () => {
    const res = await fetch(`${API_URL}/attributes/lead_service_info/`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching lead service attributes");
    const data = await res.json();
    return data.results || data;
};

export const uploadLeadImage = async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/leads/${id}/files/`, {
        method: "POST",
        headers: {
            "Authorization": getHeaders().Authorization,
        },
        body: formData,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Error uploading image");
    }
    return res.json();
};
