import { API_URL, getHeaders, fetchAllPages, extractErrorMessage } from "./api";

const endPoint = "cohorts";
const url = `${API_URL}/${endPoint}/`;

const parse = async (res, fallback) => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(extractErrorMessage(errorData, fallback));
    }
    return res.json();
};

export const getCohorts = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const finalUrl = queryParams ? `${url}?${queryParams}` : url;

    return fetchAllPages(finalUrl, {
        method: "GET",
        headers: getHeaders(),
    });
};

export const getCohortById = async (id) => {
    const res = await fetch(`${url}${id}/`, { method: "GET", headers: getHeaders() });
    return parse(res, "Error fetching cohort");
};

export const createCohort = async (data) => {
    const res = await fetch(url, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
    return parse(res, "Error creating cohort");
};

export const updateCohort = async (id, data) => {
    const res = await fetch(`${url}${id}/`, { method: "PATCH", headers: getHeaders(), body: JSON.stringify(data) });
    return parse(res, "Error updating cohort");
};

export const deleteCohort = async (id) => {
    const res = await fetch(`${url}${id}/`, { method: "DELETE", headers: getHeaders() });
    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(extractErrorMessage(errorData, "Error deleting cohort"));
    }
};

// Students who would receive a Cohort-wide email (active Services + First Class
// Leads if the cohort hasn't started). See app/utils/cohort_recipients.py.
export const getCohortStudents = async (id) => {
    const res = await fetch(`${url}${id}/students/`, { method: "GET", headers: getHeaders() });
    return parse(res, "Error fetching cohort students");
};

export const previewCohortEmail = async (id) => {
    const res = await fetch(`${url}${id}/send-email/`, {
        method: "POST", headers: getHeaders(), body: JSON.stringify({ preview: true }),
    });
    return parse(res, "Error previewing cohort email");
};

export const sendCohortEmail = async (id, subject, message) => {
    const res = await fetch(`${url}${id}/send-email/`, {
        method: "POST", headers: getHeaders(), body: JSON.stringify({ subject, message }),
    });
    return parse(res, "Error sending cohort email");
};

export const getCohortEmails = async (cohortId) =>
    fetchAllPages(`${API_URL}/cohort-emails/?cohort=${cohortId}`, { method: "GET", headers: getHeaders() });

export const getCohortEmailById = async (id) => {
    const res = await fetch(`${API_URL}/cohort-emails/${id}/`, { method: "GET", headers: getHeaders() });
    return parse(res, "Error fetching cohort email");
};

export const getInstructors = async () => {
    const res = await fetch(`${API_URL}/instructors/`, { method: "GET", headers: getHeaders() });
    const data = await parse(res, "Error fetching instructors");
    return Array.isArray(data) ? data : data.results || [];
};
