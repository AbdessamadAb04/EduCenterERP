export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export function getFullName(): string {
  return localStorage.getItem('fullName') || 'Admin User';
}

export function setFullName(name: string) {
  localStorage.setItem('fullName', name);
}
