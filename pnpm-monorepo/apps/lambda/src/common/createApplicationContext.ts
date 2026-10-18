import { trace } from "@opentelemetry/api";
import type { ApplicationContext } from "@sam-monorepo/application";
import { prisma } from "@sam-monorepo/database";
import {
  createEventBridgeEmitter,
  createEventBridgeNotificationTrigger,
  createPrismaAuditWriter,
} from "@sam-monorepo/infrastructure";
import { eventBridgeClient } from "./eventbridge";
import { log } from "./logger";

interface ApplicationContextOptions {
  /** Without the event bus, the notifications are not sent */
  readonly eventBusArn: string | null | undefined;
  /** The `Source` of the notification events: the name of the function */
  readonly source: string;
  readonly urls: ApplicationContext["urls"];
}

/**
 * The composition root of the Lambda functions. Each function builds its
 * context after its setup.
 *
 * The tracer is the no-op tracer of OpenTelemetry, because the functions
 * register no provider. X-Ray stays at the level of the handlers and the
 * jobs, thus the spans of the use cases are lost in the Lambda functions.
 * The functions have no changelog, no collab server and no signing key.
 */
export const createApplicationContext = ({
  eventBusArn,
  source,
  urls,
}: ApplicationContextOptions): ApplicationContext => ({
  prisma,
  audit: createPrismaAuditWriter({ prisma, log }),
  notifications: createEventBridgeNotificationTrigger({
    emitEvents: createEventBridgeEmitter({
      client: eventBridgeClient,
      eventBusArn,
      log,
    }),
    source,
  }),
  log,
  tracer: trace.getTracer("sam"),
  now: () => new Date(),
  changelog: null,
  collab: null,
  urls,
  signingKey: async () => null,
  allowInsecureLoopbackClientIds: false,
});
