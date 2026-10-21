import { AuditEventType } from "@sam-monorepo/domain";
import { describe, expect, test, vi } from "vitest";
import {
  createPrismaAuditWriter,
  type PrismaAuditWriterOptions,
} from "./createPrismaAuditWriter.js";

const createWriter = (createMany: () => Promise<unknown>) => {
  const log = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  const prisma = {
    auditEvent: { createMany: vi.fn(createMany) },
  };
  const writer = createPrismaAuditWriter({
    prisma: prisma as unknown as PrismaAuditWriterOptions["prisma"],
    log,
  });

  return { writer, prisma, log };
};

describe("createPrismaAuditWriter", () => {
  test("writes all events in one call", async () => {
    const { writer, prisma } = createWriter(async () => ({ count: 2 }));

    await writer.create([
      {
        type: AuditEventType.BIRTHDAY_GREETINGS_SENT,
        data: { citizenCount: 2 },
      },
      {
        type: AuditEventType.NEW_YEAR_GREETINGS_SENT,
        data: { citizenCount: 3 },
        createdById: "user",
      },
    ]);

    expect(prisma.auditEvent.createMany).toHaveBeenCalledExactlyOnceWith({
      data: [
        {
          type: AuditEventType.BIRTHDAY_GREETINGS_SENT,
          data: { citizenCount: 2 },
          createdById: null,
          triggeredViaMcp: false,
        },
        {
          type: AuditEventType.NEW_YEAR_GREETINGS_SENT,
          data: { citizenCount: 3 },
          createdById: "user",
          triggeredViaMcp: false,
        },
      ],
    });
  });

  test("logs a failed write and does not throw", async () => {
    const failure = new Error("The database is not available");
    const { writer, log } = createWriter(async () => {
      throw failure;
    });

    await expect(
      writer.create([
        {
          type: AuditEventType.BIRTHDAY_GREETINGS_SENT,
          data: { citizenCount: 2 },
        },
      ]),
    ).resolves.toBeUndefined();

    expect(log.error).toHaveBeenCalledExactlyOnceWith(
      "Failed to write audit events",
      { types: AuditEventType.BIRTHDAY_GREETINGS_SENT, error: failure },
    );
  });
});
