const TOKEN_KEY = 'ec_token';
const FULL_NAME_KEY = 'ec_fullName';
const EMAIL_KEY = 'ec_email';
const USER_ID_KEY = 'ec_userId';
const ROLE_KEY = 'ec_role';
const LEGACY_TOKEN_KEY = 'token';
const LEGACY_FULL_NAME_KEY = 'fullName';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function getFullName(): string {
  return localStorage.getItem(FULL_NAME_KEY) ?? localStorage.getItem(LEGACY_FULL_NAME_KEY) ?? 'Admin User';
}

export function setFullName(name: string) {
  localStorage.setItem(FULL_NAME_KEY, name);
  localStorage.removeItem(LEGACY_FULL_NAME_KEY);
}

export function getEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY);
}

export function setEmail(email: string) {
  localStorage.setItem(EMAIL_KEY, email);
}

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function setUserId(id: string) {
  localStorage.setItem(USER_ID_KEY, id);
}

export function getRole(): string {
  return localStorage.getItem(ROLE_KEY) || 'OWNER';
}

export function setRole(role: string) {
  localStorage.setItem(ROLE_KEY, role);
}

export function clearSession() {
  clearToken();
  localStorage.removeItem(FULL_NAME_KEY);
  localStorage.removeItem(LEGACY_FULL_NAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(ROLE_KEY);
}
