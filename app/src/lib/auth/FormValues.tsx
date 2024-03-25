"use client";

export interface FormValues {
  login: {
    manage: boolean;
    negate: boolean;
  };
  role: {
    manage: boolean;
  };
  otherRole: {
    roleId: string;
    operation: "read" | "assign" | "dismiss" | "";
  }[];
  classificationLevel: {
    manage: boolean;
  };
  event: {
    read: boolean;
  };
  operation: {
    manage: boolean;
  };
  user: {
    read: boolean;
  };
  orgFleet: {
    read: boolean;
  };
  ship: {
    manage: boolean;
  };
  eventFleet: {
    read: boolean;
  };
  lastSeen: {
    read: boolean;
  };
  manufacturersSeriesAndVariants: {
    manage: boolean;
  };
  noteType: {
    manage: boolean;
  };
  handle: {
    create: boolean;
    delete: boolean;
    confirm: boolean;
  };
  "teamspeak-id": {
    create: boolean;
    read: boolean;
    delete: boolean;
    confirm: boolean;
  };
  "discord-id": {
    create: boolean;
    read: boolean;
    delete: boolean;
    confirm: boolean;
  };
  "citizen-id": {
    create: boolean;
    delete: boolean;
    confirm: boolean;
  };
  "community-moniker": {
    create: boolean;
    delete: boolean;
    confirm: boolean;
  };
  citizen: {
    create: boolean;
    read: boolean;
    delete: boolean;
  };
  note: {
    noteTypeId: string;
    classificationLevelId: string;
    alsoUnconfirmed: boolean;
    operation:
      | "manage"
      | "create"
      | "read"
      | "update"
      | "delete"
      | "confirm"
      | "readRedacted";
  }[];
}
