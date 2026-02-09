const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/* ----------------------------------
   Helper: read cookie by name
-----------------------------------*/
const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? match[2] : null;
};

/* ----------------------------------
   API Request Wrapper
-----------------------------------*/
export const apiRequest = async (endpoint, method = "GET", body) => {
  const token = getCookie("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include", // IMPORTANT
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
};
