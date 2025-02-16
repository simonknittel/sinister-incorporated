import type { GenericEntityLogType } from "@/types";

export interface PermissionSet {
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
    | "documentAllianceManifest"
    | "algolia"
    | "spynetActivity"
    | "spynetCitizen"
    | "spynetNotes"
    | "spynetOther"
    | "career"
    | "leaderboards"
    | "penaltyEntry";
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
}

export interface PermissionSetAttribute {
  // TODO: Use ENUM (https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
  key:
    | "confirmed"
    | "noteTypeId"
    | "classificationLevelId"
    | "alsoUnconfirmed"
    | "roleId"
    | "alsoVisibilityRedacted"
    | "flowId";
  value: string | boolean;
}
