export function buildQueryString(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined);
  const query = new URLSearchParams();
  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, String(entry)));
    } else {
      query.append(key, String(value));
    }
  }
  return query.toString();
}
