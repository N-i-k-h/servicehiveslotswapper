// ✅ Automatically use Render backend in production, localhost in dev
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://servicehiveslotswapper-backend1.onrender.com/api";

function getHeaders(token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function handle(res) {
  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || res.statusText);
    } catch {
      throw new Error(text || res.statusText);
    }
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

export const api = {
  async get(path, token) {
    const res = await fetch(`${API_URL}${path}`, { headers: getHeaders(token) });
    return handle(res);
  },
  async post(path, body, token) {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(body),
    });
    return handle(res);
  },
  async put(path, body, token) {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(body),
    });
    return handle(res);
  },
  async del(path, token) {
    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: getHeaders(token),
    });
    return handle(res);
  },
};
