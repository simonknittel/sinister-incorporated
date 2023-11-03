export type UserRole = null | "confirmed" | "admin";

export type EntityLogConfirmationState =
  | "confirmed"
  | "false-report"
  | undefined;

export type GenericEntityLogType =
  | "discord-id"
  | "teamspeak-id"
  | "citizen-id"
  | "community-moniker";

// TODO: Use ENUM (https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
export type EntityLogType =
  | GenericEntityLogType
  | "handle"
  | "note"
  | "spectrum-id"
  | "role-added"
  | "role-removed";

// TODO: Use ENUM (https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
export type EntityLogAttributeKey =
  | "confirmed"
  | "classificationLevelId"
  | "noteTypeId";
