export type PermissionSet = {
  // TODO: Use ENUM (https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
  resource:
    | "login"
    | "event"
    | "operation"
    | "orgFleet"
    | "ship"
    | "manufacturersSeriesAndVariants"
    | "citizen"
    | "noteType"
    | "user"
    | "role"
    | "classificationLevel"
    | "analytics"
    | "lastSeen"
    | "otherRole"
    | "handle"
    | "discordId"
    | "note"
    | "teamspeakId";
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
    | "dismiss";
  attributes?: PermissionSetAttribute[];
};

export type PermissionSetAttribute = {
  // TODO: Use ENUM (https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
  key:
    | "confirmed"
    | "noteTypeId"
    | "classificationLevelId"
    | "alsoUnconfirmed"
    | "roleId";
  value: string | boolean;
};
