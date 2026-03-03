import { API_URL, getHeaders } from "./api";

const endPoint = "asset-assignments";
const url = `${API_URL}/${endPoint}/`;

export const getAssetAssignments = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await fetch(`${url}${queryParams ? `?${queryParams}` : ''}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching asset assignments");
    const data = await res.json();
    return data.results || data;
};

export const getAssetAssignmentById = async (id) => {
    const res = await fetch(`${url}${id}/`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching asset assignment");
    return res.json();
};

export const createAssetAssignment = async (data) => {
    const res = await fetch(url, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        let errorMsg = "Error creating asset assignment";
        try {
            const errorData = await res.json();
            errorMsg = Object.values(errorData).flat().join(", ") || errorMsg;
        } catch (e) { }
        throw new Error(errorMsg);
    }
    return res.json();
};

export const updateAssetAssignment = async (id, data) => {
    const res = await fetch(`${url}${id}/`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        let errorMsg = "Error updating asset assignment";
        try {
            const errorData = await res.json();
            errorMsg = Object.values(errorData).flat().join(", ") || errorMsg;
        } catch (e) { }
        throw new Error(errorMsg);
    }
    return res.json();
};

export const deleteAssetAssignment = async (id) => {
    const res = await fetch(`${url}${id}/`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error deleting asset assignment");
    return true; // 204 No Content
};

export const getAssetAssignmentAttributes = async () => {
    const res = await fetch(`${API_URL}/attributes/asset_assignment/`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching asset assignment attributes");
    const data = await res.json();
    return data.results || data;
};
