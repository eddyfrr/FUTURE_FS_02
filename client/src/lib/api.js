const TOKEN_KEY = 'crm.token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/api/auth/me'),
  leads: {
    list: (params = {}) => {
      const qs = new URLSearchParams();
      if (params.status) qs.set('status', params.status);
      if (params.q) qs.set('q', params.q);
      const suffix = qs.toString() ? `?${qs}` : '';
      return request(`/api/leads${suffix}`);
    },
    stats: () => request('/api/leads/stats'),
    get: (id) => request(`/api/leads/${id}`),
    create: (data) => request('/api/leads', { method: 'POST', body: data }),
    createPublic: (data) => request('/api/leads', { method: 'POST', body: data, auth: false }),
    update: (id, patch) => request(`/api/leads/${id}`, { method: 'PATCH', body: patch }),
    remove: (id) => request(`/api/leads/${id}`, { method: 'DELETE' }),
    addNote: (id, body) => request(`/api/leads/${id}/notes`, { method: 'POST', body: { body } }),
  },
};
