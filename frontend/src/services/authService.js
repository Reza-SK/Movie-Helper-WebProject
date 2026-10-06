import { api } from "./api";

export function getCurrentUser() {
  return api("/auth/me/");
}

export function loginUser(username, password) {
  return api("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function registerUser(values) {
  return api("/auth/register/", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function logoutUser() {
  return api("/auth/logout/", {
    method: "POST",
  });
}

export function requestPasswordReset(email) {
  return api("/auth/password-reset/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function confirmPasswordReset(uid, token, password) {
  return api("/auth/password-reset-confirm/", {
    method: "POST",
    body: JSON.stringify({ uid, token, password }),
  });
}
