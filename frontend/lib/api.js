export const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function createUser(data) {
  const res = await fetch(`${API_BASE}/api/sample`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${API_BASE}/api/sample`);
  return res.json();
}
