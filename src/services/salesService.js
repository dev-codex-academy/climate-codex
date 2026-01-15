import { API_URL, getHeaders } from "./api";

const endPoint = "sales";
const url = `${API_URL}/${endPoint}/`;

export const getSales = async () => {
    const res = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching sales");
    const data = await res.json();
    return data.results || data;
};

export const getSaleById = async (id) => {
    const res = await fetch(`${url}${id}/`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching sale");
    const data = await res.json();
    return data;
};

export const createSale = async (data) => {
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

export const updateSale = async (id, data) => {
    const res = await fetch(`${url}${id}/`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error updating sale");
    return res.json();
};

export const deleteSale = async (id) => {
    const res = await fetch(`${url}${id}/`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error deleting sale");
    return true;
};
