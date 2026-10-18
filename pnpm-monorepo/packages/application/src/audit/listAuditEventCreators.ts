import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

export interface AuditEventCreator {
  readonly id: string;
  readonly name: string | null;
}

/**
 * The users who created at least one audit event, sorted by name. The
 * creator filter of the system log in the app shows them.
 *
 * @throws ForbiddenError when the actor does not have `systemLog;read`
 */
export const listAuditEventCreators = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<AuditEventCreator[]> => {
  requirePermission(actor, "systemLog", "read");

  // A query on the users with an event, not a `distinct` on the events:
  // without the `nativeDistinct` preview feature, Prisma removes the
  // duplicates after it reads all events
  const users = await context.prisma.user.findMany({
    where: { createdAuditEvents: { some: {} } },
    select: { id: true, name: true },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });

  return users;
};
