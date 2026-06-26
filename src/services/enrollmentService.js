const BASE_URL = import.meta.env.VITE_ENV === 'production'
  ? import.meta.env.VITE_API_PROD
  : import.meta.env.VITE_API_DEV;

export async function getEnrollmentPrefill(leadId) {
  const res = await fetch(`${BASE_URL}/enrollment/lead/${leadId}/`);
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw err || { detail: 'Failed to load enrollment data.' };
  }
  return res.json();
}

export async function submitEnrollment(leadId, data) {
  const res = await fetch(`${BASE_URL}/enrollment/${leadId}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw err || { detail: 'Failed to submit enrollment agreement.' };
  }
  return res.json();
}

export async function getServiceEnrollment(serviceId) {
  const res = await fetch(`${BASE_URL}/services/${serviceId}/enrollment/`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) return [];
  return res.json();
}
