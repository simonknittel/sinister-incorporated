import { EmailTemplate } from "@sam-monorepo/application";
import { expect, test, vi } from "vitest";
import * as z from "zod";
import type { EmitEvents } from "../eventbridge/createEventBridgeEmitter.js";
import { createEventBridgeEmailRequester } from "./createEventBridgeEmailRequester.js";

/** The request id of the request schema of the email function */
const detailSchema = z.object({ requestId: z.cuid2() });

test("sends each request as one EmailRequested event with a new request id", async () => {
  const emitEvents = vi.fn<EmitEvents>(async () => undefined);
  const email = createEventBridgeEmailRequester({ emitEvents, source: "App" });
  const request = {
    template: EmailTemplate.EmailConfirmation,
    messages: [
      { to: "citizen@example.com", templateProps: { token: "token-1" } },
    ],
  };

  await email.request(request);
  await email.request(request);

  const entries = emitEvents.mock.calls.flatMap(([callEntries]) => callEntries);
  expect(
    emitEvents.mock.calls.map(([callEntries]) => callEntries.length),
  ).toEqual([1, 1]);
  const details = entries.map(
    (entry) => JSON.parse(entry.Detail ?? "null") as unknown,
  );
  expect(entries[0]).toMatchObject({
    Source: "App",
    DetailType: "EmailRequested",
  });
  expect(details[0]).toEqual({
    template: "emailConfirmation",
    messages: request.messages,
    requestId: expect.any(String),
  });
  const requestIds = details.map(
    (detail) => detailSchema.parse(detail).requestId,
  );
  expect(new Set(requestIds).size).toBe(2);
});
