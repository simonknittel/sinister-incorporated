import type { Actor } from "../actor.js";

/** Whether the actor can read the system log (the audit events) */
export const canReadSystemLog = (actor: Actor) =>
  actor.authorize("systemLog", "read");
