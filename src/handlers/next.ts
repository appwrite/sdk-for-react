import "server-only";
import { createWebAppwriteHandlers } from "./web";
import type { AppwriteHandlerConfig } from "../core/types";

export function createAppwriteHandlers(config: AppwriteHandlerConfig) {
  return createWebAppwriteHandlers(config);
}
