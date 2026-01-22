import { API_URL, getHeaders } from './api';

const WEBHOOK_API_URL = `${API_URL}/webhooks/`;

export const getWebhooks = async () => {
  const response = await fetch(WEBHOOK_API_URL, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch webhooks');
  const data = await response.json();
  return data.results || data;
};

export const getWebhook = async (id) => {
  const response = await fetch(`${WEBHOOK_API_URL}${id}/`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch webhook');
  return await response.json();
};

export const createWebhook = async (webhook) => {
  const response = await fetch(WEBHOOK_API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(webhook),
  });
  if (!response.ok) throw new Error('Failed to create webhook');
  return await response.json();
};

export const updateWebhook = async (id, webhook) => {
  const response = await fetch(`${WEBHOOK_API_URL}${id}/`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(webhook),
  });
  if (!response.ok) throw new Error('Failed to update webhook');
  return await response.json();
};

export const deleteWebhook = async (id) => {
  const response = await fetch(`${WEBHOOK_API_URL}${id}/`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete webhook');
  return true;
};
