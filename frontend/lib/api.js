export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiRequest(endpoint, method = "GET", body = null) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });

  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error("Backend did not return JSON. Check API URL.");
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
