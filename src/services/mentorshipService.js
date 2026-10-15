import { API_URL, getHeaders, extractErrorMessage } from "./api";

const parse = async (res, fallback) => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const error = new Error(extractErrorMessage(errorData, fallback));
        error.status = res.status;
        throw error;
    }
    return res.json();
};

// ─── Mentor self-service (authenticated) ───────────────────────────────────────

export const getMyMentorProfile = async () => {
    const res = await fetch(`${API_URL}/my-mentor-profile/`, { method: "GET", headers: getHeaders() });
    return parse(res, "Error loading your availability");
};

export const saveMyMentorProfile = async (data) => {
    const res = await fetch(`${API_URL}/my-mentor-profile/`, { method: "PUT", headers: getHeaders(), body: JSON.stringify(data) });
    return parse(res, "Error saving your availability");
};

export const getMyMentorships = async () => {
    const res = await fetch(`${API_URL}/my-mentorships/`, { method: "GET", headers: getHeaders() });
    return parse(res, "Error loading your mentorships");
};

export const cancelMyMentorship = async (id) => {
    const res = await fetch(`${API_URL}/my-mentorships/${id}/cancel/`, { method: "POST", headers: getHeaders() });
    return parse(res, "Error cancelling the mentorship");
};

// ─── Public booking flow (no CRM session; uses the emailed-code session token) ─

const publicUrl = (path) => `${API_URL}/public/mentorship/${path}`;
const publicHeaders = (token) => ({
    "Content-Type": "application/json",
    ...(token ? { "X-Mentorship-Token": token } : {}),
});

export const requestMentorshipCode = async (email) => {
    const res = await fetch(publicUrl("request-code/"), { method: "POST", headers: publicHeaders(), body: JSON.stringify({ email }) });
    return parse(res, "Could not request the code");
};

export const verifyMentorshipCode = async (email, code) => {
    const res = await fetch(publicUrl("verify-code/"), { method: "POST", headers: publicHeaders(), body: JSON.stringify({ email, code }) });
    return parse(res, "Invalid or expired code.");
};

export const getBookingMe = async (token) => {
    const res = await fetch(publicUrl("me/"), { headers: publicHeaders(token) });
    return parse(res, "Could not load your information");
};

export const getBookableMentors = async (token) => {
    const res = await fetch(publicUrl("mentors/"), { headers: publicHeaders(token) });
    return parse(res, "Could not load mentors");
};

export const getMentorSlots = async (token, mentorId, from, to) => {
    const res = await fetch(publicUrl(`mentors/${mentorId}/slots/?from=${from}&to=${to}`), { headers: publicHeaders(token) });
    return parse(res, "Could not load available times");
};

export const createBooking = async (token, mentor, start, reason) => {
    const res = await fetch(publicUrl("bookings/"), {
        method: "POST", headers: publicHeaders(token), body: JSON.stringify({ mentor, start, reason }),
    });
    return parse(res, "Could not book this time");
};

export const getCancelInfo = async (cancelToken) => {
    const res = await fetch(publicUrl(`cancel/${encodeURIComponent(cancelToken)}/`), { headers: publicHeaders() });
    return parse(res, "Meeting not found");
};

export const confirmCancel = async (cancelToken) => {
    const res = await fetch(publicUrl(`cancel/${encodeURIComponent(cancelToken)}/`), { method: "POST", headers: publicHeaders() });
    return parse(res, "Could not cancel the meeting");
};
