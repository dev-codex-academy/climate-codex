import { API_URL, getHeaders, fetchAllPages } from "./api";

const endPoint = "cohorts";
const url = `${API_URL}/${endPoint}/`;

export const getCohorts = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const finalUrl = queryParams ? `${url}?${queryParams}` : url;

    return fetchAllPages(finalUrl, {
        method: "GET",
        headers: getHeaders(),
    });
};
