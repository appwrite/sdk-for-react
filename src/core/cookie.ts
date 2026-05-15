import type { CookieOptions } from "./types";

export function serializeCookie(name: string, value: string, options: CookieOptions): string {
  const parts: string[] = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.secure) parts.push("Secure");
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.sameSite) {
    const v = options.sameSite;
    parts.push(`SameSite=${v.charAt(0).toUpperCase() + v.slice(1)}`);
  }

  return parts.join("; ");
}

export function serializeClearCookie(
  name: string,
  options: Pick<CookieOptions, "path" | "domain" | "secure" | "sameSite">,
): string {
  return serializeCookie(name, "", {
    ...options,
    expires: new Date(0),
    maxAge: 0,
  });
}

export function parseCookieHeader(header: string | null | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!header) return map;
  for (const segment of header.split(";")) {
    const idx = segment.indexOf("=");
    if (idx === -1) continue;
    const rawName = segment.slice(0, idx).trim();
    const rawValue = segment.slice(idx + 1).trim();
    if (!rawName) continue;
    try {
      map.set(decodeURIComponent(rawName), decodeURIComponent(rawValue));
    } catch {
      map.set(rawName, rawValue);
    }
  }
  return map;
}
