const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail ?? `Request failed (${response.status})`);
  return data as T;
}

export type User = { id: string; email: string; name: string; interests: string[]; home_city: string | null };
export type Session = { token: string; user: User };

export const api = {
  health: () => request<{ status: string }>("/api/health"),
  signup: (email: string, password: string, name: string) => request<Session>("/api/auth/signup", { method: "POST", body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) => request<Session>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: (token: string) => request<User>("/api/auth/me", {}, token),
  updateMe: (token: string, profile: Partial<User>) => request<User>("/api/auth/me", { method: "PATCH", body: JSON.stringify(profile) }, token),
  chat: (token: string, session_id: string, message: string) => request<any>("/api/chat/message", { method: "POST", body: JSON.stringify({ session_id, message }) }, token),
  createTrip: (token: string, itinerary: any) => request<any>("/api/trips", { method: "POST", body: JSON.stringify(itinerary) }, token),
  listTrips: (token: string) => request<{ trips: any[] }>("/api/trips", {}, token),
  getTrip: (token: string, id: string) => request<any>(`/api/trips/${id}`, {}, token),
  deleteTrip: (token: string, id: string) => request<any>(`/api/trips/${id}`, { method: "DELETE" }, token),
  listExpenses: (token: string, id: string) => request<{ expenses: any[] }>(`/api/trips/${id}/expenses`, {}, token),
  addExpense: (token: string, id: string, expense: { category: string; amount: number; note: string }) => request<any>(`/api/trips/${id}/expenses`, { method: "POST", body: JSON.stringify(expense) }, token),
  deleteExpense: (token: string, id: string) => request<any>(`/api/expenses/${id}`, { method: "DELETE" }, token),
};
