const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const getPublicPipelines = async () => {
    const response = await fetch(`${API_BASE_URL}/public/pipelines/`);
    if (!response.ok) throw new Error("Failed to fetch pipelines");
    const data = await response.json();
    return data.results || data;
};

export const getPublicPipelineAttributes = async (pipelineId) => {
    const response = await fetch(`${API_BASE_URL}/public/pipelines/${pipelineId}/attributes/`);
    if (!response.ok) throw new Error("Failed to fetch attributes");
    const data = await response.json();
    return data.results || data;
};

export const createPublicLead = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/public/leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData) || "Failed to create lead");
    }
    return response.json();
};
