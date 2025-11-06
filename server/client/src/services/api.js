// ✅ Dynamically detect API base URL
const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.origin.includes("localhost")
    ? "http://localhost:5000/api" // local backend
    : "/api"); // for production (Render or any hosting)

// === Helper to attach headers ===
function getHeaders(token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// === Handle API responses and errors ===
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
  const t = res.headers.get("content-type") || "";
  if (t.includes("application/json")) return res.json();
  return res.text();
}

// === Main API wrapper ===
export const api = {
  async get(path, token) {
    const res = await fetch(`${API_URL}${path}`, {
      headers: getHeaders(token),
    });
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
