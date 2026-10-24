// Store selector: RedisStore when both Upstash env vars are present,
// otherwise the same-browser LocalStore demo default.

import type { PacketStore } from "./types";
import { LocalStore } from "./local-store";
import { RedisStore } from "./redis-store";

export * from "./types";
export { LocalStore } from "./local-store";
export { RedisStore } from "./redis-store";

/** Navigator viewer id used by the member-flow share toggle. */
export const NAVIGATOR_ID = "riverside-community-health-center";

let singleton: PacketStore | null = null;

export function getStore(): PacketStore {
  if (singleton) return singleton;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  singleton = url && token ? new RedisStore(url, token) : new LocalStore();
  return singleton;
}

export function usingRedis(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}
