/**
 * The use cases of SAM. They do not depend on Next.js or on the MCP
 * transport, thus the Next.js app and the MCP server use the same use cases.
 * See the README for the conventions.
 */
export {
  createActor,
  requirePermission,
  type Actor,
  type ActorCitizen,
  type ActorFields,
} from "./actor.js";
export type {
  ApplicationContext,
  ChangelogEntrySource,
  LogArguments,
  Logger,
  Notification,
  SigningKey,
  WikiPageContentReplacement,
} from "./context.js";
export {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "./errors.js";
export { withSpan } from "./withSpan.js";
