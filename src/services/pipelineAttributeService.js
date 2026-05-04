import { API_URL, getHeaders } from "./api";

export const getPipelineAttributes = async (pipelineId) => {
    const res = await fetch(`${API_URL}/pipelines/${pipelineId}/attributes/`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching pipeline attributes");
    const data = await res.json();
    return data.results || data;
};

export const createPipelineAttribute = async (pipelineId, data) => {
    const res = await fetch(`${API_URL}/pipelines/${pipelineId}/attributes/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw err || { detail: "Error creating attribute" };
    }
    return res.json();
};

export const updatePipelineAttribute = async (pipelineId, attrId, data) => {
    const res = await fetch(`${API_URL}/pipelines/${pipelineId}/attributes/${attrId}/`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw err || { detail: "Error updating attribute" };
    }
    return res.json();
};

export const deletePipelineAttribute = async (pipelineId, attrId) => {
    const res = await fetch(`${API_URL}/pipelines/${pipelineId}/attributes/${attrId}/`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error deleting attribute");
};
