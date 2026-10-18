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
] as const;

export type GenericCitizenLogType = (typeof IDENTITY_LOG_TYPES)[number];

/**
 * The values of `CitizenLog.type`. The column is text with a CHECK
 * constraint and not a Prisma enum, because the permission resources, the
 * URL filters and the texts use the same values.
 */
export type CitizenLogType =
  | GenericCitizenLogType
  | "spectrum-id" // TODO: Move to GenericCitizenLogType
  | "note";
