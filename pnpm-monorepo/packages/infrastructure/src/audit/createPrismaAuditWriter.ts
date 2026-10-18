import type { ApplicationContext, Logger } from "@sam-monorepo/application";
import type { PrismaClientType } from "@sam-monorepo/database";

export interface PrismaAuditWriterOptions {
  readonly prisma: Pick<PrismaClientType, "auditEvent">;
  readonly log: Logger;
}

/**
 * Writes the audit events to the system log. A failed write is logged and
 * swallowed: the mutation that the events describe has happened. A failure
 * after the save must not make the user save again, and must not make an
 * automation do the mutation again on its next run.
 */
export const createPrismaAuditWriter = ({
  prisma,
  log,
}: PrismaAuditWriterOptions): ApplicationContext["audit"] => ({
  create: async (events) => {
    if (events.length === 0) return;

    try {
      await prisma.auditEvent.createMany({
        data: events.map((event) => ({
          type: event.type,
          data: event.data,
          createdById: event.createdById ?? null,
        })),
      });
    } catch (error) {
      log.error("Failed to write audit events", {
        types: events.map((event) => event.type).join(", "),
        error,
      });
    }
  },
});
