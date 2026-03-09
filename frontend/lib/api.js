const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiRequest = async (endpoint, method = "GET", body) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isFormData = body instanceof FormData;

  const headers = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
};
