import { API_URL, getHeaders } from "./api";

const endPoint = "enrollment-details"; // Updated endpoint based on user request
const url = `${API_URL}/${endPoint}/`;

export const getEnrollmentDetails = async (enrollmentId) => {
    // Assuming filtering by enrollment ID query param
    const res = await fetch(`${url}?enrollment=${enrollmentId}`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (res.status === 404) return []; // Return empty if not found/no details yet
    if (!res.ok) throw new Error("Error fetching enrollment details");
    const data = await res.json();
    return data.results || data;
};

export const createEnrollmentDetail = async (data) => {
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
