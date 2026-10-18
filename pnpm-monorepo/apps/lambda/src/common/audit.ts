import { prisma } from "@sam-monorepo/database";
import { createPrismaAuditWriter } from "@sam-monorepo/infrastructure";
import { log } from "./logger";

/**
 * Records what an automation changed in the system log. A failed write is
 * logged and swallowed (see `createPrismaAuditWriter()`). Automations act on
 * their own behalf and leave `createdById` unset.
 */
export const createAuditEvents = createPrismaAuditWriter({
  prisma,
  log,
}).create;
