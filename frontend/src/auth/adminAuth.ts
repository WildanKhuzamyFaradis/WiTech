const ADMIN_AUTH_STORAGE_KEY = "witech-admin";

export function isAdminAuthenticated() {
  return localStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === "true";
}

export function setAdminAuthenticated() {
  localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, "true");
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
}