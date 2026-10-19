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

/**
 * The no-op tracer of OpenTelemetry, because the functions register no
 * provider. X-Ray stays at the level of the handlers and the jobs, thus the
 * spans of the use cases are lost in the Lambda functions.
 */
export const tracer = trace.getTracer("sam");

interface ApplicationContextOptions {
  /** The `Source` of the notification events: the name of the function */
  readonly source: string;
  /** The base URL of the app */
  readonly baseUrl: string;
  /** The public base URL of the uploads bucket */
  readonly publicUploadBaseUrl: string;
  /** Only the functions with a bot token give the gateway */
  readonly discord?: ApplicationContext["discord"];
}

/**
 * The composition root of the Lambda functions. Each function builds its
 * context after its setup.
 */
export const createApplicationContext = ({
  source,
  baseUrl,
  publicUploadBaseUrl,
  discord = null,
}: ApplicationContextOptions): ApplicationContext => ({
  prisma,
  audit: createPrismaAuditWriter({ prisma, log }),
  notifications: createEventBridgeNotificationTrigger({
    emitEvents: emitEventsOrThrow,
    source,
  }),
  log,
  tracer,
  now: () => new Date(),
  changelog: null,
  collab: null,
  discord,
  storage: null,
  urls: createApplicationUrls({ baseUrl, publicUploadBaseUrl }),
  signingKey: async () => null,
  allowInsecureLoopbackClientIds: false,
});
