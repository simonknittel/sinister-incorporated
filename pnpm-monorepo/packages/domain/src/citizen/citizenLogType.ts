import type { GenericCitizenLogType } from "../permissions/PermissionSet.js";

/**
 * The values of `CitizenLog.type`. The column is text with a CHECK
 * constraint and not a Prisma enum, because the permission resources, the
 * URL filters and the texts use the same values.
 */
export type CitizenLogType =
  | GenericCitizenLogType
  | "spectrum-id" // TODO: Move to GenericCitizenLogType
  | "note";
