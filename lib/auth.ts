export type UserRole = 'admin' | 'recruiter' | 'applicant';

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: UserRole | 'user' | 'applicant';
  companyName?: string;
  [key: string]: unknown;
}

const TOKEN_KEY = 'gwiza_token';
const USER_KEY = 'gwiza_user';

export function normalizeRole(role: unknown): UserRole {
  if (role === 'admin') return 'admin';
  if (role === 'recruiter') return 'recruiter';
  return 'applicant';
}

export function normalizeUser(user: unknown): AuthUser | null {
  if (!user || typeof user !== 'object') return null;

  const raw = user as Partial<AuthUser> & Record<string, unknown>;
  if (typeof raw.name !== 'string' || typeof raw.email !== 'string') return null;

  return {
    ...raw,
    name: raw.name,
    email: raw.email,
    role: normalizeRole(raw.role),
  };
}

export function getRoleLabel(role?: unknown) {
  const normalized = normalizeRole(role);
  if (normalized === 'admin') return 'Admin';
  if (normalized === 'recruiter') return 'Recruiter';
  return 'Applicant';
}

export function getDashboardRedirectPath(role?: unknown) {
  return normalizeRole(role) === 'admin' ? '/dashboard' : '/dashboard/applicant';
}

export function isAdminUser(user: unknown): boolean {
  return normalizeUser(user)?.role === 'admin';
}

export function saveSession(token: string, user: unknown) {
  if (typeof window === 'undefined') return;

  const normalizedUser = normalizeUser(user);
  if (!normalizedUser) return;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? normalizeUser(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}