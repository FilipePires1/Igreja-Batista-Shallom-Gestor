import { API_URL } from '../constants/api';

async function request<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(API_URL + path, {
      ...options,
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const apiGet = <T>(path: string) => request<T>(path);

export const apiPost = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });

// ===== Tipos =====
export type ApiUser = {
  id: string;
  email: string;
  name: string;
  memberCode: string | null;
  roles: { name: string; label: string; level: number }[];
};

export type ApiLogin = { token: string; user: ApiUser };

export type ApiPerson = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  baptismDate: string | null;
  memberSince: string | null;
  pastoralNotes: string | null;
  sectorMembers: {
    sector: { name: string; label: string };
    role: { name: string; label: string };
  }[];
  user: { id: string; status: string } | null;
};

export type ApiSchedule = {
  id: string;
  title: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  status: string;
  confirmedCount: number;
  pendingCount: number;
  sector: { name: string; label: string };
  members: {
    status: string;
    roleInSchedule: string;
    person: { id: string; name: string } | null;
  }[];
};

export type ApiAnnouncement = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  isUrgent: boolean;
  isPinned: boolean;
  createdAt: string;
};

export type ApiEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  timeStart: string;
  timeEnd: string | null;
  location: string | null;
  isPublic: boolean;
  status: string;
};
