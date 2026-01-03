export function parseJson<T>(payload: string): T {
  return JSON.parse(payload) as T;
}
