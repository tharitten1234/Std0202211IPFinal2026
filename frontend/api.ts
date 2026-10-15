export type Employee = { id: string; name: string; position: string; status: 'Active' | 'On Leave'; salary: number };
export type Cluster = { group: string; centroid: number | null; count: number };
const baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'http://119.59.102.161:3022/api').replace(/\/$/, '');
export async function api<T>(path: string, token = '', method = 'GET', body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method, signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json().catch(() => ({ error: 'Server returned an invalid response' }));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('Request timed out. Check the backend connection.');
    throw error;
  } finally { clearTimeout(timer); }
}
