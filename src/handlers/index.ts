import "server-only";
import { resolveHandlerConfig } from "../core/config";
import { createHandlerLogic } from "../core/handler";
import type { Adapter, AppwriteHandlerConfig } from "../core/types";

export type { Adapter, AdapterRequestContext, AdapterResponseInit } from "../core/types";
export type {
  AppwriteHandlerConfig,
  AppwriteSsrConfig,
  CookieOptions,
  SameSite,
} from "../core/types";

export function defineAdapter<TIn extends unknown[], TOut>(
  adapter: Adapter<TIn, TOut>,
): Adapter<TIn, TOut> {
  return adapter;
}

export function createAppwriteHandlers<TIn extends unknown[], TOut>(
  config: AppwriteHandlerConfig,
  adapter: Adapter<TIn, TOut>,
): (...input: TIn) => Promise<TOut> {
  const resolved = resolveHandlerConfig(config);
  const logic = createHandlerLogic(resolved);

  return async (...input: TIn) => {
    const ctx = await adapter.toContext(...input);
    const init = await logic(ctx);
    return adapter.respond(init, ...input);
  };
}
