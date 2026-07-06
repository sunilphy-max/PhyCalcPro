let tokenGetter: (() => Promise<string | null>) | null = null;

export function setAccessTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

export async function getAccessToken(): Promise<string | null> {
  if (!tokenGetter) return null;
  return tokenGetter();
}

export async function getAuthHeaders(
  extra?: Record<string, string>
): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...extra };
  const token = await getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
