export type UserRole = null | "confirmed" | "admin";

export type EntityLogConfirmationState =
  | "confirmed"
  | "falseReport"
  | undefined;

// TODO: Use ENUM (https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
export type EntityLogType =
  | "handle"
  | "note"
  | "spectrum-id"
  | "discordId"
  | "teamspeakId"
  | "role-added"
  | "role-removed"
  | "citizenId"
  | "communityMoniker";

// TODO: Use ENUM (https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
export type EntityLogAttributeKey =
  | "confirmed"
  | "classificationLevelId"
  | "noteTypeId";
