import { API_URL, getHeaders } from "./api";

const endPoint = "inventory";
const url = `${API_URL}/${endPoint}/`;

export const getInventoryItems = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await fetch(`${url}${queryParams ? `?${queryParams}` : ''}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching inventory items");
    const data = await res.json();
    return data.results || data;
};

export const getInventoryItemById = async (id) => {
    const res = await fetch(`${url}${id}/`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching inventory item");
    return res.json();
};

export const createInventoryItem = async (data) => {
    const res = await fetch(url, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    // Handle 400 Bad Request if SKU exists
    if (res.status === 400) {
        const errorData = await res.json();
        throw new Error(errorData.sku ? errorData.sku[0] : "Validation Error");
    }
    if (!res.ok) throw new Error("Error creating inventory item");
    return res.json();
};

export const updateInventoryItem = async (id, data) => {
    const res = await fetch(`${url}${id}/`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (res.status === 400) {
        const errorData = await res.json();
        throw new Error(errorData.sku ? errorData.sku[0] : "Validation Error");
    }
    if (!res.ok) throw new Error("Error updating inventory item");
    return res.json();
};

export const deleteInventoryItem = async (id) => {
    const res = await fetch(`${url}${id}/`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error deleting inventory item");
    return true; // 204 No Content
};

export const getInventoryItemAttributes = async () => {
    const res = await fetch(`${API_URL}/attributes/inventory/`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching inventory attributes");
    const data = await res.json();
    return data.results || data;
};
