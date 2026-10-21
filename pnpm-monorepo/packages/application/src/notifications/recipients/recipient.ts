import type { PermissionSet } from "@sam-monorepo/domain";

/**
 * A citizen who gets a notification. A rule about a subject (an event, a
 * task, a role) gives the subject and its recipients, or null when the
 * subject does not exist. A greeting rule gives the one recipient, or null
 * when the citizen does not get the greeting.
 */
export interface Recipient {
  readonly citizenId: string;
}

/** Each receiver of a notification must be able to log in */
export const LOGIN_MANAGE_PERMISSION_SET = {
  resource: "login",
  operation: "manage",
} as const satisfies PermissionSet;
