const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

export async function postJson<TBody>(endpoint: string, body: TBody) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // Some infrastructure errors return an empty or non-JSON body.
  }

  if (!response.ok) {
    throw new Error(
      payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : 'request_failed',
    );
  }

  return payload;
}
