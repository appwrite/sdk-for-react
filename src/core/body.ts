export const MAX_JSON_BODY_BYTES = 1024 * 1024;

export class PayloadTooLargeError extends Error {
  code = 413;
  type = "general_payload_too_large";

  constructor() {
    super("Request body too large");
    this.name = "PayloadTooLargeError";
  }
}

export class InvalidJsonBodyError extends Error {
  code = 400;
  type = "general_argument_invalid";

  constructor() {
    super("Invalid JSON body");
    this.name = "InvalidJsonBodyError";
  }
}

export async function readRequestJson(request: Request): Promise<unknown> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const bytes = Number(contentLength);
    if (Number.isFinite(bytes) && bytes > MAX_JSON_BODY_BYTES) {
      throw new PayloadTooLargeError();
    }
  }

  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      bytes += value.byteLength;
      if (bytes > MAX_JSON_BODY_BYTES) {
        await reader.cancel();
        throw new PayloadTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (bytes === 0) return null;

  const body = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(body));
  } catch (err) {
    if (err instanceof SyntaxError) throw new InvalidJsonBodyError();
    throw err;
  }
}
