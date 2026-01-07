export function buildQueryString(params: Record<string, unknown> | object): string {
  const entries = Object.entries(params as Record<string, unknown>).filter(
    ([, value]) => value !== undefined
  );
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
