import { router } from "expo-router";

const KEY = "now_auth_token";

/** Storage access can throw in locked-down contexts (blocked cookies/storage in iframes). */
function readStored(): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(KEY);
  } catch {
    return null; // memory-only session
  }
}

function writeStored(token: string | null) {
  try {
    if (typeof localStorage === "undefined") return;
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  } catch {
    /* memory-only session — sign-in still works until refresh */
  }
}

export let authToken: string | null = readStored();

export function setAuthToken(token: string) {
  authToken = token;
  writeStored(token);
}

export function clearAuthToken() {
  authToken = null;
  writeStored(null);
}

let expiredNotice = false;

/** Flag a dead session so the login screen can explain the redirect. */
export function flagSessionExpired() {
  expiredNotice = true;
}

export function consumeSessionExpired(): boolean {
  const value = expiredNotice;
  expiredNotice = false;
  return value;
}

/** Called on 401s for requests that carried a token: bounce to login cleanly. */
export function handleUnauthorized() {
  clearAuthToken();
  flagSessionExpired();
  router.replace("/login");
}
