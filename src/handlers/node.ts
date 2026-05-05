import "server-only";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createAppwriteHandlers, defineAdapter } from "./index";
import { parseCookieHeader, serializeClearCookie, serializeCookie } from "../core/cookie";
import type { AppwriteHandlerConfig } from "../core/types";

export const nodeAdapter = defineAdapter<[IncomingMessage, ServerResponse], void>({
  async toContext(req) {
    const cookies = parseCookieHeader(req.headers.cookie);
    const host = req.headers.host ?? "localhost";
    const proto = (req.headers["x-forwarded-proto"] as string) ?? "http";
    const url = new URL(req.url ?? "/", `${proto}://${host}`);

    return {
      url,
      method: (req.method ?? "GET").toUpperCase(),
      getCookie: (name) => cookies.get(name),
      readJson: () => readNodeJson(req),
    };
  },
  respond(init, _req, res) {
    const setCookieHeaders: string[] = [];
    for (const c of init.setCookies) {
      setCookieHeaders.push(serializeCookie(c.name, c.value, c.options));
    }
    for (const c of init.clearCookies) {
      setCookieHeaders.push(serializeClearCookie(c.name, c.options));
    }
    if (setCookieHeaders.length > 0) {
      res.setHeader("set-cookie", setCookieHeaders);
    }

    if (init.redirect) {
      res.setHeader("location", init.redirect);
      res.statusCode = init.status;
      res.end();
      return;
    }

    if (init.body?.type === "json") {
      res.setHeader("content-type", "application/json; charset=utf-8");
      res.statusCode = init.status;
      res.end(JSON.stringify(init.body.value));
      return;
    }
    if (init.body?.type === "text") {
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.statusCode = init.status;
      res.end(init.body.value);
      return;
    }

    res.statusCode = init.status;
    res.end();
  },
});

function readNodeJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf8");
      if (!text) return resolve(null);
      try {
        resolve(JSON.parse(text));
      } catch (err) {
        reject(err);
      }
    });
  });
}

export function createNodeAppwriteHandlers(config: AppwriteHandlerConfig) {
  return createAppwriteHandlers(config, nodeAdapter);
}
