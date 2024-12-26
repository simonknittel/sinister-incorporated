import type { GenericEntityLogType } from "@/types";

export type PermissionSet = {
  // TODO: Use ENUM (https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
  resource:
    | GenericEntityLogType
    | "login"
    | "event"
    | "operation"
    | "orgFleet"
    | "ship"
    | "manufacturersSeriesAndVariants"
    | "citizen"
    | "organization"
    | "organizationMembership"
    | "noteType"
    | "user"
    | "role"
    | "classificationLevel"
    | "analytics"
    | "lastSeen"
    | "otherRole"
    | "note"
    | "eventFleet"
    | "documentIntroductionCompendium"
    | "algolia"
    | "career";
  // TODO: Use ENUM (https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
  operation:
    | "create"
    | "read"
    | "readRedacted"
    | "update"
    | "delete"
    | "manage"
    | "confirm"
    | "assign"
    | "dismiss"
    | "negate";
  attributes?: PermissionSetAttribute[];
};

export type PermissionSetAttribute = {
  // TODO: Use ENUM (https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
  key:
    | "confirmed"
    | "noteTypeId"
    | "classificationLevelId"
    | "alsoUnconfirmed"
    | "roleId"
    | "alsoVisibilityRedacted";
  value: string | boolean;
};
