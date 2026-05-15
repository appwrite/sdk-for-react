import { AppwriteException } from "appwrite";

export async function postHandler<T>(basePath: string, route: string, body: unknown): Promise<T> {
  const res = await fetch(`${basePath}${route}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const error = readErrorPayload(payload);
    throw new AppwriteException(
      error.message ?? `Request failed with status ${res.status}`,
      res.status,
      error.type,
    );
  }

  return payload as T;
}

function readErrorPayload(payload: unknown): { message?: string; type?: string } {
  if (!payload || typeof payload !== "object") return {};

  const error = "error" in payload ? payload.error : undefined;
  const type = "type" in payload ? payload.type : undefined;

  return {
    message: typeof error === "string" ? error : undefined,
    type: typeof type === "string" ? type : undefined,
  };
}
