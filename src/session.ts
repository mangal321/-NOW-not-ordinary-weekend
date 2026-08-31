export let authToken: string | null = typeof localStorage === "undefined" ? null : localStorage.getItem("now_auth_token");

export function setAuthToken(token: string) {
  authToken = token;
  if (typeof localStorage !== "undefined") localStorage.setItem("now_auth_token", token);
}

export function clearAuthToken() {
  authToken = null;
  if (typeof localStorage !== "undefined") localStorage.removeItem("now_auth_token");
}
