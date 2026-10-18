import { getApplicationContext } from "@/modules/application/getApplicationContext";
import type { AuditEventInput } from "@sam-monorepo/domain";

/**
 * Writes the audit events through the audit port of the application context.
 * The callers move into the use cases of `@sam-monorepo/application`, one
 * milestone after the other. When no caller is left, this file goes away.
 */
export const createAuditEvents = (events: AuditEventInput[]) =>
  getApplicationContext().audit.create(events);
