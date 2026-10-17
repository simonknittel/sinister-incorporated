import type { Actor } from "../actor.js";
import type { ChangelogEntrySource } from "../context.js";

/**
 * An entry with `requiresAuth` is only for the holders of its permission.
 * The app shows such an entry redacted; the use cases leave it out.
 */
export const isChangelogEntryReadable = (
  actor: Actor,
  entry: Pick<ChangelogEntrySource, "requiresAuth">,
) =>
  !entry.requiresAuth ||
  actor.authorize(entry.requiresAuth.resource, entry.requiresAuth.operation);
