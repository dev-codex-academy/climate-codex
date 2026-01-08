import { API_URL, getHeaders } from './api';

export const getAttributes = async (entity) => {
    try {
        const response = await fetch(`${API_URL}/attributes/${entity}/`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch attributes for ${entity}`);
        }
        const data = await response.json();
        return data.results || data;
    } catch (error) {
        console.error("Error fetching attributes:", error);
        throw error;
    }
};

export const createAttribute = async (entity, data) => {
    try {
        const response = await fetch(`${API_URL}/attributes/${entity}/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Failed to create attribute`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating attribute:", error);
        throw error;
    }
};

export const deleteAttribute = async (entity, id) => {
    try {
        const response = await fetch(`${API_URL}/attributes/${entity}/${id}/`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Failed to delete attribute`);
        }
        return true;
    } catch (error) {
        console.error("Error deleting attribute:", error);
        throw error;
    }
};
