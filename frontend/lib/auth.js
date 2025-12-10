import { apiCaller } from "./api";

export async function signupUser(data) {
  return apiCaller("/auth/signup", "POST", data);
}

export async function loginUser(data) {
  return apiCaller("/auth/login", "POST", data);
}

export function logoutUser() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
