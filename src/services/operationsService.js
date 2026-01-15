import { API_URL, getHeaders } from "./api";

const endPoint = "operations";
const url = `${API_URL}/${endPoint}/`;

export const getOperations = async () => {
    const res = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching operations");
    const data = await res.json();
    return data.results || data;
};

export const getOperationById = async (id) => {
    const res = await fetch(`${url}${id}/`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching operation");
    const data = await res.json();
    return data;
};

export const createOperation = async (data) => {
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

export const updateOperation = async (id, data) => {
    const res = await fetch(`${url}${id}/`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error updating operation");
    return res.json();
};

export const deleteOperation = async (id) => {
    const res = await fetch(`${url}${id}/`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error deleting operation");
    return true;
};
