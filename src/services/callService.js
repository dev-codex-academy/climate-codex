import { API_URL, getHeaders, fetchAllPages } from './api';

export async function getLeadCalls(leadId) {
  return fetchAllPages(`${API_URL}/leads/${leadId}/calls/`, { headers: getHeaders() });
}

export async function getServiceCalls(serviceId) {
  return fetchAllPages(`${API_URL}/services/${serviceId}/calls/`, { headers: getHeaders() });
}
