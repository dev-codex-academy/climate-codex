import { API_URL, getHeaders } from "./api";

export const getCohorts = async () => {
    const res = await fetch(`${API_URL}/cohorts/`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching cohorts");
    const data = await res.json();
    return data.results || data;
};

export const getCohort = async (id) => {
    const res = await fetch(`${API_URL}/cohorts/${id}/`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching cohort");
    return res.json();
};

export const createCohort = async (data) => {
    const res = await fetch(`${API_URL}/cohorts/`, {
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

export const updateCohort = async (id, data) => {
    const res = await fetch(`${API_URL}/cohorts/${id}/`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(JSON.stringify(errorData));
    }
    return res.json();
};

export const deleteCohort = async (id) => {
    const res = await fetch(`${API_URL}/cohorts/${id}/`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error deleting cohort");
    return true;
};
