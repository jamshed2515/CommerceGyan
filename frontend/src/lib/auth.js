import API from "@/config/api";

/**
 * Token/user storage strategy:
 * - sessionStorage  → default (cleared automatically when browser/tab closes)
 * - localStorage    → only when "Remember Me" is checked
 *
 * getStoredToken / getStoredUser check both, so existing localStorage sessions
 * (e.g. from a "Remember Me" login) still work seamlessly.
 */

// ─── Storage helpers ─────────────────────────────────────────────────────────

/** Reads the auth token from sessionStorage first, then localStorage. */
export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("token") || localStorage.getItem("token");
}

/** Reads the stored user object from sessionStorage first, then localStorage. */
export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw =
    sessionStorage.getItem("user") || localStorage.getItem("user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persists a login session.
 * @param {string} token
 * @param {object} user
 * @param {boolean} remember - if true, uses localStorage (survives browser close);
 *                             if false (default), uses sessionStorage (cleared on close).
 */
export function setSession(token, user, remember = false) {
  if (typeof window === "undefined") return;
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("token", token);
  storage.setItem("user", JSON.stringify(user));
}

/**
 * Clears session from BOTH storages to ensure a clean logout.
 */
export function clearSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// ─── Session validation ───────────────────────────────────────────────────────

/**
 * Validates the current session by calling GET /api/auth/me.
 * Performs real server-side JWT verification so expired/tampered tokens are caught.
 *
 * @param {string} requiredRole - "admin" | "teacher" | "student"
 * @returns {Promise<{ valid: boolean, user?: object }>}
 */
export async function validateSession(requiredRole) {
  if (typeof window === "undefined") return { valid: false };

  const token = getStoredToken();
  if (!token) return { valid: false };

  try {
    const res = await fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      clearSession();
      return { valid: false };
    }

    const user = await res.json();
    const role = user?.role;

    if (requiredRole && role !== requiredRole) {
      return { valid: false, user };
    }

    // Sync the stored user with fresh server data (keep in same storage)
    const inSession = !!sessionStorage.getItem("token");
    const storage = inSession ? sessionStorage : localStorage;
    storage.setItem("user", JSON.stringify(user));

    return { valid: true, user };
  } catch {
    // Network error — allow offline grace using stored data
    const storedUser = getStoredUser();
    if (storedUser?.role === requiredRole) {
      return { valid: true, user: storedUser };
    }
    return { valid: false };
  }
}
