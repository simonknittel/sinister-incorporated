/**
 * The shared implementations of the ports of `@sam-monorepo/application`.
 * Each host composes them in its composition root. See the README.
 */
export {
  createPrismaAuditWriter,
  type PrismaAuditWriterOptions,
} from "./audit/createPrismaAuditWriter.js";
export {
  createEventBridgeClient,
  type EventBridgeClientOptions,
} from "./eventbridge/createEventBridgeClient.js";
export {
  EventBridgeFailedEntriesError,
  createEventBridgeEmitter,
  type EmitEvents,
  type EventBridgeEmitterOptions,
  type EventBridgeEntry,
} from "./eventbridge/createEventBridgeEmitter.js";
export {
  createEventBridgeNotificationTrigger,
  type EventBridgeNotificationTriggerOptions,
} from "./notifications/createEventBridgeNotificationTrigger.js";
