import { trace } from "@opentelemetry/api";
import {
  createApplicationUrls,
  type ApplicationContext,
} from "@sam-monorepo/application";
import { prisma } from "@sam-monorepo/database";
import {
  createEventBridgeNotificationTrigger,
  createPrismaAuditWriter,
} from "@sam-monorepo/infrastructure";
import { emitEventsOrThrow } from "./eventbridge";
import { log } from "./logger";

interface ApplicationContextOptions {
  /** The `Source` of the notification events: the name of the function */
  readonly source: string;
  /** The base URL of the app */
  readonly baseUrl: string;
  /** The public base URL of the uploads bucket */
  readonly publicUploadBaseUrl: string;
}

/**
 * The composition root of the Lambda functions. Each function builds its
 * context after its setup.
 *
 * The tracer is the no-op tracer of OpenTelemetry, because the functions
 * register no provider. X-Ray stays at the level of the handlers and the
 * jobs, thus the spans of the use cases are lost in the Lambda functions.
 */
export const createApplicationContext = ({
  source,
  baseUrl,
  publicUploadBaseUrl,
}: ApplicationContextOptions): ApplicationContext => ({
  prisma,
  audit: createPrismaAuditWriter({ prisma, log }),
  notifications: createEventBridgeNotificationTrigger({
    emitEvents: emitEventsOrThrow,
    source,
  }),
  log,
  tracer: trace.getTracer("sam"),
  now: () => new Date(),
  changelog: null,
  collab: null,
  urls: createApplicationUrls({ baseUrl, publicUploadBaseUrl }),
  signingKey: async () => null,
  allowInsecureLoopbackClientIds: false,
});
