const BASE = process.env.NEXT_PUBLIC_API_URL;

if (!BASE) {
  throw new Error("Missing NEXT_PUBLIC_API_URL environment variable.");
}

/**
 * Parse the response and always return the JSON body (even on error).
 * Pages check res.error / res.message / res.success themselves.
 * Only throws on network-level failures or non-JSON bodies with bad status.
 */
async function parseResponse(res: Response): Promise<Record<string, unknown>> {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let data: unknown = null;
 
  try {
    data = isJson ? await res.json() : await res.text();
  } catch {
    data = null;
  }

  if (typeof data === "object" && data !== null) {
    return data as Record<string, unknown>;
  }

  if (!res.ok) {
    const msg =
      typeof data === "string" && data.trim()
        ? data
        : `Request failed with status ${res.status}`;
    return { error: msg, success: false };
  }

  return {};
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gwiza_token");
}

async function request(path: string, init: RequestInit = {}): Promise<Record<string, unknown>> {
  const token = getToken();

  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers,
    });
    return parseResponse(res);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return { error: message, success: false };
  }
}

export const api = {
  post: (path: string, body: object) =>
    request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  get: (path: string) => request(path),

  put: (path: string, body: object) =>
    request(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  del: (path: string) => request(path, { method: "DELETE" }),

  upload: (path: string, formData: FormData) =>
    request(path, {
      method: "POST",
      body: formData,
      // Do NOT set Content-Type - browser sets it with the correct boundary.
    }),
};

export { clearSession, getStoredUser as getUser, saveSession } from "./auth";
