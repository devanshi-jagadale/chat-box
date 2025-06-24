// src/api.js
const API = 'http://localhost:3000';

export async function signup(email, password) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API}/auth/logout`, {
    credentials: 'include',
  });
  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${API}/auth/me`, {
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json();
}
