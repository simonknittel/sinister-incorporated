import type { GenericCitizenLogType } from "@sam-monorepo/domain";

/**
 * The log types that hold an identity value of a citizen, for example a
 * handle or an ID. Each type has its own permissions, for example
 * `handle;confirm`.
 */
export const IDENTITY_LOG_TYPES = [
  "handle",
  "discord-id",
  "teamspeak-id",
  "community-moniker",
  "citizen-id",
] as const satisfies readonly GenericCitizenLogType[];
