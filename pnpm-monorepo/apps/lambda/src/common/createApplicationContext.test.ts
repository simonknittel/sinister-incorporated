import { AuditEventType } from "@sam-monorepo/domain";
import { expect, test, vi } from "vitest";
import { createApplicationContext } from "./createApplicationContext";
import { eventBridgeClient } from "./eventbridge";

const { createMany } = vi.hoisted(() => ({ createMany: vi.fn() }));

vi.mock("@sam-monorepo/database", () => ({
  prisma: { auditEvent: { createMany } },
}));
vi.mock("./logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const BASE_URL = new URL("http://localhost:3000");

const createContext = () =>
  createApplicationContext({
    eventBusArn: undefined,
    source: "test",
    urls: {
      baseUrl: BASE_URL,
      issuer: "http://localhost:3000",
      mcpResourceUrl: new URL("/api/mcp", BASE_URL),
      publicUploadBaseUrl: "http://localhost:3000/uploads",
    },
  });

test("writes the audit events with the Prisma client", async () => {
  await createContext().audit.create([
    {
      type: AuditEventType.BIRTHDAY_GREETINGS_SENT,
      data: { citizenCount: 1 },
    },
  ]);

  expect(createMany).toHaveBeenCalledExactlyOnceWith({
    data: [
      {
        type: AuditEventType.BIRTHDAY_GREETINGS_SENT,
        data: { citizenCount: 1 },
        createdById: null,
      },
    ],
  });
});

test("sends no notification without an event bus", async () => {
  const send = vi.spyOn(eventBridgeClient, "send");

  await expect(
    createContext().notifications.trigger([
      { type: "EventStarting", payload: { eventId: "event" } },
    ]),
  ).resolves.toBeUndefined();

  expect(send).not.toHaveBeenCalled();
});
