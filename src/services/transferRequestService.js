import { API_URL, getHeaders } from "./api";

const endPoint = "transfer-requests";
const url = `${API_URL}/${endPoint}/`;

export const getTransferRequests = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const finalUrl = queryParams ? `${url}?${queryParams}` : url;

    const res = await fetch(finalUrl, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching transfer requests");
    const data = await res.json();
    // Assuming Django REST Framework pagination or list response
    return data.results || data;
};

export const createTransferRequest = async (data) => {
    const res = await fetch(url, {
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

export const updateTransferRequest = async (id, data) => {
    const res = await fetch(`${url}${id}/`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error updating transfer request");
    return res.json();
};

export const deleteTransferRequest = async (id) => {
    const res = await fetch(`${url}${id}/`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error deleting transfer request");
    return true;
};
