import { API_URL, getHeaders } from "./api";

const instructorsUrl = `${API_URL}/instructors/`;
const tasUrl = `${API_URL}/tas/`;

export const getInstructors = async () => {
    const res = await fetch(instructorsUrl, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching instructors");
    const data = await res.json();
    return data.results || data;
};

export const getTAs = async () => {
    const res = await fetch(tasUrl, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error fetching TAs");
    const data = await res.json();
    return data.results || data;
};
