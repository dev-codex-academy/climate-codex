import { API_URL, getHeaders } from "./api";

export const getPipelines = async () => {
    const res = await fetch(`${API_URL}/pipelines/`, {
        method: "GET",
        headers: getHeaders(),
    });
    // ... existing code ...
    if (!res.ok) throw new Error("Error fetching pipelines");
    return res.json();
};

export const updatePipeline = async (id, pipelineData) => {
    const res = await fetch(`${API_URL}/pipelines/${id}/`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(pipelineData),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Error updating pipeline");
    }
    return res.json();
};

export const createPipeline = async (pipelineData) => {
    const res = await fetch(`${API_URL}/pipelines/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(pipelineData),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Error creating pipeline");
    }
    return res.json();
};
