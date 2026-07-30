const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const auth = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
};

export const households = {
  create: (body) => request('/households', { method: 'POST', body: JSON.stringify(body) }),
  join: (body) => request('/households/join', { method: 'POST', body: JSON.stringify(body) }),
  members: (id) => request(`/households/${id}/members`),
  regenerateInvite: (id) => request(`/households/${id}/invite`, { method: 'PUT' }),
};

export const expenses = {
  list: (householdId) => request(`/households/${householdId}/expenses`),
  create: (householdId, body) => request(`/households/${householdId}/expenses`, { method: 'POST', body: JSON.stringify(body) }),
  update: (householdId, expenseId, body) => request(`/households/${householdId}/expenses/${expenseId}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (householdId, expenseId) => request(`/households/${householdId}/expenses/${expenseId}`, { method: 'DELETE' }),
};

export const chores = {
  list: (householdId) => request(`/households/${householdId}/chores`),
  create: (householdId, body) => request(`/households/${householdId}/chores`, { method: 'POST', body: JSON.stringify(body) }),
  complete: (householdId, choreId) => request(`/households/${householdId}/chores/${choreId}/complete`, { method: 'POST' }),
  update: (householdId, choreId, body) => request(`/households/${householdId}/chores/${choreId}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (householdId, choreId) => request(`/households/${householdId}/chores/${choreId}`, { method: 'DELETE' }),
};

export const settlements = {
  list: (householdId) => request(`/households/${householdId}/settlements`),
  create: (householdId, body) => request(`/households/${householdId}/settlements`, { method: 'POST', body: JSON.stringify(body) }),
};

export const balance = {
  get: (householdId) => request(`/households/${householdId}/balance`),
};
