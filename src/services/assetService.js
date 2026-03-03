import { API_URL, getHeaders } from "./api";

const endPoint = "assets";
const url = `${API_URL}/${endPoint}/`;

export const getAssets = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await fetch(`${url}${queryParams ? `?${queryParams}` : ''}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching assets");
    const data = await res.json();
    return data.results || data;
};

export const getAssetById = async (id) => {
    const res = await fetch(`${url}${id}/`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching asset");
    return res.json();
};

export const createAsset = async (data) => {
    const res = await fetch(url, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        let errorMsg = "Error creating asset";
        try {
            const errorData = await res.json();
            errorMsg = Object.values(errorData).flat().join(", ") || errorMsg;
        } catch (e) { }
        throw new Error(errorMsg);
    }
    return res.json();
};

export const updateAsset = async (id, data) => {
    const res = await fetch(`${url}${id}/`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        let errorMsg = "Error updating asset";
        try {
            const errorData = await res.json();
            errorMsg = Object.values(errorData).flat().join(", ") || errorMsg;
        } catch (e) { }
        throw new Error(errorMsg);
    }
    return res.json();
};

export const deleteAsset = async (id) => {
    const res = await fetch(`${url}${id}/`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error deleting asset");
    return true; // 204 No Content
};

export const getAssetAttributes = async () => {
    const res = await fetch(`${API_URL}/attributes/asset/`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching asset attributes");
    const data = await res.json();
    return data.results || data;
};
