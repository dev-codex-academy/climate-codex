import { fetchAllPages, extractErrorMessage } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const getPublicPipelines = async () => {
    return fetchAllPages(`${API_BASE_URL}/public/pipelines/`);
};

export const getPublicPipelineAttributes = async (pipelineId) => {
    return fetchAllPages(`${API_BASE_URL}/public/pipelines/${pipelineId}/attributes/`);
};

export const createPublicLead = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/public/leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(extractErrorMessage(errorData, "Failed to create lead"));
    }
    return response.json();
};
